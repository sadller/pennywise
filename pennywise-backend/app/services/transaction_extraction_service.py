"""Transaction extraction service using AI.

This service specializes in extracting transaction details from natural language text
using the generic AI service.
"""
import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from app.services.ai_service import ai_service
from app.constants.transactions import (
    TransactionType, 
    TRANSACTION_CATEGORIES, 
    PAYMENT_MODES,
    validate_category,
    validate_payment_mode
)
from app.constants.ai_models import AI_MODELS

class TransactionExtractionService:
    """Service for extracting transaction details from natural language text."""
    
    def extract_transactions(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract transaction details from natural language text.
        
        Args:
            text: Natural language description of transactions
            
        Returns:
            List of dictionaries containing extracted transaction details
        """
        prompt = f"""Extract all transaction details from this text: "{text}"

Return only a JSON array of objects with these fields:
- amount: number (required)
- note: string (description/remark of the transaction, required)
- category: string (MUST be exactly one of: {', '.join(TRANSACTION_CATEGORIES)})
- payment_mode: string (MUST be exactly one of: {', '.join(PAYMENT_MODES)})
- date: string in YYYY-MM-DD format (handle relative dates like "today", "yesterday", "tomorrow")
- type: "INCOME" or "EXPENSE" (default to "EXPENSE" if not clear)

Guidelines:
1. Amount is always required and should be a positive number
2. Note/remark should be descriptive of what the transaction was for
3. Category: Choose the most appropriate category from the list above based on the transaction description
4. Payment mode: Choose the most appropriate payment mode from the list above based on context
5. Date handling:
   - "today" → {date.today().isoformat()}
   - "yesterday" → {(date.today() - timedelta(days=1)).isoformat()}
   - "tomorrow" → {(date.today() + timedelta(days=1)).isoformat()}
   - If no date mentioned, use today: {date.today().isoformat()}
6. Type defaults to "EXPENSE" unless clearly income-related (salary, payment received, etc.)

Example response:
[
  {{
    "amount": 50.0,
    "note": "groceries from supermarket today",
    "category": "Food & Dining",
    "payment_mode": "UPI",
    "date": "{date.today().isoformat()}",
    "type": "EXPENSE"
  }},
  {{
    "amount": 5000.0,
    "note": "salary payment received yesterday",
    "category": "Salary",
    "payment_mode": "Bank Transfer",
    "date": "{(date.today() - timedelta(days=1)).isoformat()}",
    "type": "INCOME"
  }}
]

IMPORTANT: Use EXACT category and payment mode names from the lists above. Do not create new ones.

If no transactions are found, return an empty array []."""

        try:
            response = ai_service.chat_completion([
                {
                    "role": "user",
                    "content": prompt,
                },
            ], model = AI_MODELS["DOLPHIN_MISTRAL"])
            
            # Parse the JSON response
            try:
                transactions = json.loads(response)
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {e}")
                raise Exception("AI response format is invalid. Please try again with a different description.")
            
            # Validate and clean the extracted transactions
            validated_transactions = []
            for transaction in transactions:
                validated_transaction = self._validate_and_clean_transaction(transaction)
                if validated_transaction:
                    validated_transactions.append(validated_transaction)
            
            if not validated_transactions:
                raise Exception("No valid transactions found in your description. Please provide more details about the transaction.")
            
            return validated_transactions
            
        except Exception as e:
            print(f"Transaction extraction failed: {e}")
            # Re-raise the exception with a user-friendly message
            if "AI response format is invalid" in str(e):
                raise e
            elif "No valid transactions found" in str(e):
                raise e
            else:
                raise Exception("Failed to process your transaction description. Please try again.")
    
    def _validate_and_clean_transaction(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and clean a single transaction.
        
        Args:
            transaction: Raw transaction data from AI
            
        Returns:
            Validated and cleaned transaction data
        """
        try:
            # Validate amount
            amount = transaction.get('amount')
            if not amount or not isinstance(amount, (int, float)) or amount <= 0:
                return None
            
            # Validate note
            note = transaction.get('note', '').strip()
            if not note:
                return None
            
            # Validate category
            category = transaction.get('category', '').strip()
            if not validate_category(category):
                return None
            
            # Validate payment mode
            payment_mode = transaction.get('payment_mode', '').strip()
            if not validate_payment_mode(payment_mode):
                return None
            
            # Validate date
            date_str = transaction.get('date', '')
            parsed_date = self._parse_date(date_str)
            
            # Validate type
            transaction_type = transaction.get('type', 'EXPENSE').upper()
            if transaction_type not in ['INCOME', 'EXPENSE']:
                transaction_type = 'EXPENSE'
            
            return {
                'amount': float(amount),
                'note': note,
                'category': category,
                'payment_mode': payment_mode,
                'date': parsed_date.isoformat(),
                'type': transaction_type
            }
            
        except Exception as e:
            print(f"Transaction validation failed: {e}")
            return None
    
    def _parse_date(self, date_str: str) -> date:
        """Parse date string, handling basic relative dates."""
        if not date_str:
            return date.today()
        
        date_str_lower = date_str.lower().strip()
        
        # Handle basic relative dates
        if date_str_lower in ['today', 'now']:
            return date.today()
        elif date_str_lower in ['yesterday', 'yday']:
            return date.today() - timedelta(days=1)
        elif date_str_lower in ['tomorrow', 'tmrw']:
            return date.today() + timedelta(days=1)
        
        # Try to parse as YYYY-MM-DD format
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            # If parsing fails, return today
            return date.today()


# Create singleton instance
transaction_extraction_service = TransactionExtractionService() 