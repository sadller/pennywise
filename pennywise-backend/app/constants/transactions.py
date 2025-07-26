# Transaction-related constants for the backend
from enum import Enum
from typing import List

class TransactionType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

# Transaction Categories (matching frontend)
TRANSACTION_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Utilities',
    'Rent',
    'Salary',
    'Freelance',
    'Investment',
    'Other'
]

# Payment Modes (matching frontend)
PAYMENT_MODES = [
    'Cash',
    'UPI',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Other'
]

# Validation constants
TRANSACTION_VALIDATION = {
    'MIN_AMOUNT': 0.01,
    'MAX_AMOUNT': 999999999.99,
    'MAX_NOTE_LENGTH': 500,
    'MAX_CATEGORY_LENGTH': 100,
    'MAX_PAYMENT_MODE_LENGTH': 50,
}

# CSV Import constants
CSV_CONSTANTS = {
    'REQUIRED_COLUMNS': ['Date', 'Time', 'Remark', 'Mode', 'Entry By', 'Cash In', 'Cash Out', 'Balance'],
    'OPTIONAL_COLUMNS': ['Category'],
    'MAX_FILE_SIZE': 10 * 1024 * 1024,  # 10MB
}

# Transaction type display helpers
def get_transaction_type_label(transaction_type: TransactionType) -> str:
    """Get human-readable label for transaction type"""
    return "Income" if transaction_type == TransactionType.INCOME else "Expense"

def validate_category(category: str) -> bool:
    """Validate if category is in the allowed list"""
    return category in TRANSACTION_CATEGORIES if category else True

def validate_payment_mode(payment_mode: str) -> bool:
    """Validate if payment mode is in the allowed list"""
    return payment_mode in PAYMENT_MODES if payment_mode else True

def get_categories() -> List[str]:
    """Get list of available categories"""
    return TRANSACTION_CATEGORIES.copy()

def get_payment_modes() -> List[str]:
    """Get list of available payment modes"""
    return PAYMENT_MODES.copy() 