from pydantic import BaseModel, Field
from typing import List


class OpenRouterRequest(BaseModel):
    """Request payload for AI chat completion."""
    messages: List[dict] = Field(..., description="List of messages for the AI model.")
    model: str = Field(default="deepseek/deepseek-r1-0528:free", description="AI model to use.")


class OpenRouterResponse(BaseModel):
    """Response from AI chat completion."""
    content: str = Field(..., description="Generated content from AI model.") 