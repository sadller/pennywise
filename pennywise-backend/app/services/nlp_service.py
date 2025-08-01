"""Simple NLP / regex based extraction of transaction details from free text.

This service is intentionally lightweight and self-contained so that it can
be swapped out later with a more sophisticated pipeline.
"""
from __future__ import annotations

import re
from datetime import datetime, date
from typing import Optional

import spacy

# Load spaCy pipeline once at import time.
try:
    _NLP = spacy.load("en_core_web_sm")
except OSError:
    # Model not present in environment – try to download lazily.
    # Note: This runs only once at startup.
    from spacy.cli import download as spacy_download

    spacy_download("en_core_web_sm")
    _NLP = spacy.load("en_core_web_sm")


_AMOUNT_REGEX = re.compile(r"(?P<amount>\d+(?:\.\d{1,2})?)")
_PAYMENT_KEYWORDS = {
    "cash": "cash",
    "upi": "upi",
    "gpay": "upi",
    "phonepe": "upi",
    "card": "card",
    "credit": "card",
    "debit": "card",
}


def _extract_amount(text: str) -> Optional[float]:
    match = _AMOUNT_REGEX.search(text)
    if match:
        return float(match.group("amount"))
    return None


def _extract_payment_mode(text: str) -> Optional[str]:
    lower = text.lower()
    for key, canonical in _PAYMENT_KEYWORDS.items():
        if key in lower:
            return canonical
    return None


def _clean_remark(original: str, amount: Optional[float], payment_mode: Optional[str]) -> str:
    remark = original
    if amount is not None:
        # Remove the exact amount string from text
        remark = re.sub(rf"\b{amount}\b", "", remark)
    if payment_mode:
        remark = re.sub(payment_mode, "", remark, flags=re.IGNORECASE)
    # Collapse extra whitespace
    return " ".join(remark.split()).strip()


def extract_transaction(sentence: str) -> dict:
    """Extract coarse transaction details from a natural-language sentence.

    Returns a dict matching TransactionExtractResponse.
    """
    doc = _NLP(sentence)  # Reserved for future, currently unused but keeps pipeline alive

    amount = _extract_amount(sentence)
    payment_mode = _extract_payment_mode(sentence)
    today = date.today()

    remark = _clean_remark(sentence, amount, payment_mode)

    return {
        "amount": amount,
        "payment_mode": payment_mode,
        "date": today,
        "remark": remark,
    }
