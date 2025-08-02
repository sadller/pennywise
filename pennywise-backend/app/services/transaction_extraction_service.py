"""Transaction extraction service using AI.

This service specializes in extracting transaction details from natural language text
using the generic AI service.
"""
import json
from typing import Dict, Any, List
from app.services.ai_service import ai_service


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
- amount: number or null
- payment_mode: string or null (cash, upi, card, bank)
- note: string (description of the transaction)
- type: "EXPENSE" or "INCOME"

Example response:
[{{"amount": 50, "payment_mode": "cash", "note": "groceries", "type": "EXPENSE"}}, {{"amount": 25, "payment_mode": "upi", "note": "lunch", "type": "EXPENSE"}}]

If no transactions are found, return an empty array []."""

        try:
            response = ai_service.chat_completion([
                {
                    "role": "user",
                    "content": prompt,
                },
            ])
            
            # Parse the JSON response
            transactions = json.loads(response)
            return transactions
            
        except Exception as e:
            print(f"Transaction extraction failed: {e}")
            return []


# Create singleton instance
transaction_extraction_service = TransactionExtractionService() 