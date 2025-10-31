# Transaction-related constants for the backend
from enum import Enum
from typing import List, Dict, TypedDict

class TransactionType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class CategoryInfo(TypedDict):
    name: str
    description: str
    keywords: List[str]

# Single source of truth for expense categories
EXPENSE_CATEGORIES: List[CategoryInfo] = [
    {
        "name": "Bills",
        "description": "Payments for regular utilities and services such as electricity, water, gas, internet, Wi-Fi, mobile recharge, postpaid phone bills, television subscriptions (e.g., cable, satellite), municipal taxes, property maintenance fees, garbage collection, and other fixed monthly charges. Also includes streaming and software subscriptions like Netflix, Spotify, Microsoft 365, or Adobe Creative Cloud if categorized as recurring utilities.",
        "keywords": [
            "bill", "broadband", "electricity", "gas", "internet", "mobile",
            "postpaid", "recharge", "subscription", "utility", "livpure", "wifi",
            "insurance"
        ]
    },
    {
        "name": "Grocery",
        "description": "Purchases of everyday food and household essentials from supermarkets, grocery stores, or local markets. Includes fruits, vegetables, grains, dairy, meat, bread, packaged snacks, frozen foods, beverages, cleaning items, toiletries, and basic kitchen or pantry supplies. Does not include eating out.",
        "keywords": [
            "dairy", "dmart", "essentials", "fruit", "fruits", "grocery",
            "instamart", "market", "mart", "store", "supermarket", "vegetable",
            "vegetables"
        ]
    },
    {
        "name": "Health",
        "description": "All healthcare and wellness-related spending such as doctor consultations, medical checkups, hospital bills, diagnostic tests, laboratory scans (X-ray, MRI, blood tests), medicines, supplements, fitness memberships, physiotherapy, health insurance premiums, dental visits, eye care, and alternative therapies like yoga or ayurveda.",
        "keywords": [
            "checkup", "clinic", "doctor", "fitness", "gym", "hospital", "lab",
            "medical", "medicine", "medicines", "pharmacy", "scan", "test", "tests"
        ]
    },
    {
        "name": "Household",
        "description": "Expenses for maintaining and improving the home. Includes cleaning products, detergents, furniture, kitchenware, home décor, tools, light bulbs, gardening supplies, pest control, minor repairs, electrical or plumbing maintenance, and domestic help or maid services. Excludes rent and bills.",
        "keywords": [
            "appliance", "cleaning", "furniture", "gardening", "home",
            "maintenance", "repair", "tools"
        ]
    },
    {
        "name": "Rent",
        "description": "Monthly or periodic payments for rented housing or accommodation. Includes apartment rent, paying guest (PG) charges, hostel fees, office space rent, storage unit rent, or leased property payments. May also include brokerage or deposit-related costs.",
        "keywords": [
            "apartment", "brokerage", "deposit", "flat", "lease", "pg", "rent",
            "room", "tenant"
        ]
    },
    {
        "name": "Food",
        "description": "Expenses related to eating outside home including restaurants, cafes, fast food, takeaways, delivery apps (e.g., Swiggy, Zomato, Uber Eats, DoorDash), coffee shops, bakeries, bars, and food courts. Also includes dining tips, party dinners, and canteen or cafeteria meals.",
        "keywords": [
            "burger", "cafe", "coffee", "dine", "dinner", "eatery", "food",
            "lunch", "meal", "pizza", "restaurant"
        ]
    },
    {
        "name": "Shopping",
        "description": "All non-essential shopping for personal or family use. Includes clothes, shoes, accessories, bags, jewelry, cosmetics, perfumes, gifts, electronic gadgets, home appliances, or online marketplace purchases (e.g., Amazon, Flipkart, eBay). Excludes groceries and household maintenance.",
        "keywords": [
            "amazon", "clothing", "electronics", "fashion", "flipkart", "gift",
            "lifestyle", "purchase", "shoes", "shopping", "store", "myntra", "meesho"
        ]
    },
    {
        "name": "Travel",
        "description": "Transportation and travel-related expenses including daily commute costs and leisure trips. Covers fuel (petrol, diesel), cab and taxi fares (Uber, Ola, Lyft), metro or bus tickets, train fares, flight tickets, tolls, parking fees, hotel stays, travel insurance, car rentals, and vacation bookings.",
        "keywords": [
            "bus", "cab", "flight", "fuel", "ola", "petrol", "taxi", "ticket",
            "tickets", "toll", "train", "travel", "uber", "vacation"
        ]
    },
    {
        "name": "Entertainment",
        "description": "Leisure and entertainment expenses including movies, concerts, events, parties, streaming subscriptions (Netflix, Disney+, Spotify), gaming, amusement parks, sports events, club memberships, hobbies, and recreational activities. Also covers event tickets, theme park passes, and related fun experiences.",
        "keywords": [
            "cinema", "concert", "event", "fun", "game", "movie", "netflix",
            "prime", "party", "show", "spotify"
        ]
    },
    {
        "name": "Others",
        "description": "Covers transactions that do not fit clearly into any other predefined category. May include one-time purchases, gifts, donations, charity, tips, penalties, fines, taxes, service charges, ATM withdrawals, interest fees, bank charges, unexpected or irregular payments, and miscellaneous expenses. Used as a fallback category for ambiguous or uncategorized transactions.",
        "keywords": [
            "misc", "unknown", "other"
        ]
    }
]

# Derived list of category names
TRANSACTION_CATEGORIES: List[str] = [cat["name"] for cat in EXPENSE_CATEGORIES]

# Helper to get category keywords mapping
def get_category_keywords() -> Dict[str, List[str]]:
    """Get mapping of category names to their keywords"""
    return {cat["name"]: cat["keywords"] for cat in EXPENSE_CATEGORIES}

# Helper to get category descriptions mapping  
def get_category_descriptions() -> Dict[str, str]:
    """Get mapping of category names to their descriptions"""
    return {cat["name"]: cat["description"] for cat in EXPENSE_CATEGORIES}


# Payment Modes (matching frontend)
PAYMENT_MODES = [
    'UPI',
    'Cash',
    'Credit Card',
    'Debit Card',
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