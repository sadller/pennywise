"""Generic AI service using OpenRouter for secure API calls.

This service provides a generic interface for AI-powered features using OpenRouter API calls
from the backend to keep API keys secure.
"""
import json
import re
from typing import Dict, List
from app.core.config import settings


class AIService:
    """Generic service for AI-powered features using OpenRouter API."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
    
    def chat_completion(self, messages: List[Dict[str, str]], model: str = "deepseek/deepseek-r1-0528:free") -> str:
        """
        Make a chat completion request to OpenRouter API.
        
        Args:
            messages: List of message objects with role and content
            model: AI model to use
            
        Returns:
            Generated content from the AI model
        """
        if not self.api_key:
            raise ValueError("OpenRouter API key not configured")
        
        try:
            import requests
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            
            payload = {
                "model": model,
                "messages": messages,
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code}")
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Extract JSON from the content (it might be wrapped in markdown code blocks)
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content) or re.search(r'\[[\s\S]*\]', content)
            if json_match:
                try:
                    # Parse the extracted JSON to validate it
                    json_string = json_match.group(1) if json_match.group(1) else json_match.group(0)
                    json.loads(json_string)  # Validate JSON
                    return json_string
                except (json.JSONDecodeError, IndexError) as e:
                    print(f"Failed to parse JSON from AI response: {e}")
                    return content
            
            return content
            
        except Exception as e:
            raise Exception(f"OpenRouter API call failed: {str(e)}")


# Create singleton instance
ai_service = AIService() 