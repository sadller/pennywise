from fastapi import APIRouter
from typing import List, Dict, Any

from app.constants.transactions import get_categories, get_payment_modes

router = APIRouter()


@router.get("/app-constants", response_model=Dict[str, Any])
def get_app_constants():
    """
    Get application constants like transaction categories and payment modes.
    """
    return {
        "categories": get_categories(),
        "payment_modes": get_payment_modes(),
    }
