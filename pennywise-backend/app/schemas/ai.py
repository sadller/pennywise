from pydantic import BaseModel, Field
from typing import List, Optional


class OpenRouterRequest(BaseModel):
    """Request payload for AI chat completion (deprecated)."""
    messages: List[dict] = Field(..., description="List of messages for the AI model.")
    model: str = Field(default="deepseek/deepseek-r1-0528:free", description="AI model to use.")


class OpenRouterResponse(BaseModel):
    """Response from AI chat completion (deprecated)."""
    content: str = Field(..., description="Generated content from AI model.")


class AIRequest(BaseModel):
    """Request payload for AI chat completion."""
    message: str = Field(..., description="Message to send to the AI model.")


class AIResponse(BaseModel):
    """Response from AI chat completion."""
    response: str = Field(..., description="AI response content.")
    provider: str = Field(..., description="AI provider used.")
    model: str = Field(..., description="AI model used.")


# Keep old names for backward compatibility (deprecated)
class ExternalAIRequest(AIRequest):
    """Request payload for external AI chat completion (deprecated, use AIRequest)."""
    pass


class ExternalAIResponse(AIResponse):
    """Response from external AI chat completion (deprecated, use AIResponse)."""
    pass 