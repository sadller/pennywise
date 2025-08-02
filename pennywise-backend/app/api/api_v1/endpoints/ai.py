from fastapi import APIRouter, HTTPException
from app.schemas.ai import OpenRouterRequest, OpenRouterResponse
from app.schemas.transaction import TransactionExtractRequest, TransactionExtractResponse
from app.services.transaction_extraction_service import transaction_extraction_service
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/chat-completion", response_model=OpenRouterResponse)
async def chat_completion(request: OpenRouterRequest):
    """
    Generic AI chat completion endpoint.
    
    This endpoint provides a generic interface for AI interactions
    using OpenRouter API, keeping the API key secure on the backend.
    """
    try:
        # Make AI chat completion request
        content = ai_service.chat_completion(request.messages, request.model)
        
        response = OpenRouterResponse(content=content)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")


@router.post("/extract-transactions", response_model=TransactionExtractResponse)
async def extract_transactions(request: TransactionExtractRequest):
    """
    Extract transaction details from natural language text using AI.
    
    This endpoint uses OpenRouter API to intelligently parse transactions
    from free-form text input, keeping the API key secure on the backend.
    """
    try:
        # Extract transaction details using AI
        extracted_transactions = transaction_extraction_service.extract_transactions(request.text)
        
        response = TransactionExtractResponse(
            transactions=extracted_transactions,
            total_count=len(extracted_transactions)
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}") 