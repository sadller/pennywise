from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class TransactionExtractRequest(BaseModel):
    """Request payload for NLP transaction extraction."""

    text: str = Field(..., description="Free-form sentence to extract transaction info from.")


class TransactionExtractResponse(BaseModel):
    """Structured response after extracting a transaction from text."""

    amount: Optional[float] = Field(None, description="Transaction amount, if detected.")
    payment_mode: Optional[str] = Field(None, description="Payment mode (cash, upi, card, etc.).")
    date: date = Field(..., description="Detected or assumed date in ISO format.")
    remark: Optional[str] = Field(None, description="Remaining remark text.")

    class Config:
        json_encoders = {date: lambda v: v.isoformat()}
