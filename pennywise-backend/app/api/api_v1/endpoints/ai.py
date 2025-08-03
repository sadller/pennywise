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
        error_message = str(e)
        
        # Return specific error messages for different scenarios
        if "AI response format is invalid" in error_message:
            raise HTTPException(
                status_code=422, 
                detail="Unable to process your description. Please try rephrasing with more details about the transaction."
            )
        elif "No valid transactions found" in error_message:
            raise HTTPException(
                status_code=422, 
                detail="No transactions found in your description. Please provide more details about the amount, category, and payment method."
            )
        elif "Failed to process your transaction description" in error_message:
            raise HTTPException(
                status_code=500, 
                detail="Failed to process your description. Please try again with a different format."
            )
        else:
            # Log the actual error for debugging
            print(f"Transaction extraction error: {error_message}")
            raise HTTPException(
                status_code=500, 
                detail="An error occurred while processing your request. Please try again."
            ) 