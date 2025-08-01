from fastapi import APIRouter, HTTPException, status
from app.schemas.nlp import TransactionExtractRequest, TransactionExtractResponse
from app.services.nlp_service import extract_transaction

router = APIRouter()


@router.post("/extract-transaction", response_model=TransactionExtractResponse)
def extract_transaction_endpoint(payload: TransactionExtractRequest):
    """Extract transaction fields (amount, payment_mode, etc.) from free-form text."""
    if not payload.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="text must be a non-empty string",
        )

    data = extract_transaction(payload.text)
    return data
