"""AI service for calling the AI Hub API.

This service provides AI-powered features using the AI Hub API.
"""
import json
import requests
from typing import Dict, Any, List
from fastapi import HTTPException
from app.core.config import settings


class AIService:
    """Service for calling AI Hub API."""
    
    def __init__(self):
        self.base_url = settings.AI_API_URL
    
    def chat_completion(self, message: str, auth_token: str = None) -> Dict[str, Any]:
        """
        Make a chat completion request to AI Hub API.
        
        Args:
            message: The message/prompt to send to the AI
            auth_token: Authorization token to forward from the UI
            
        Returns:
            Dictionary containing the AI response with response, provider, and model
        """
        try:
            headers = {
                "Content-Type": "application/json",
            }
            
            # Forward the authorization token if provided
            if auth_token:
                headers["Authorization"] = auth_token
            
            payload = {
                "message": message
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code not in [200, 201]:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI API error: {response.status_code} - {response.text}"
                )
            
            data = response.json()
            return data
            
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to AI service: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"AI API call failed: {str(e)}"
            )
    
    def extract_transaction_json(self, message: str, auth_token: str = None) -> str:
        """
        Extract JSON response from AI completion for transaction extraction.
        
        Args:
            message: The message/prompt to send to the AI
            auth_token: Authorization token to forward from the UI
            
        Returns:
            Clean JSON string containing the AI response
        """
        ai_response = self.chat_completion(message, auth_token)
        
        # Extract only the response field from the AI API response
        content = ai_response.get("response", "")
        
        # Try to extract and clean JSON from the response content
        return self._extract_and_clean_json(content)
    
    def _extract_and_clean_json(self, content: str) -> str:
        """
        Extract JSON from AI response content and clean it.
        
        Args:
            content: Raw AI response content
            
        Returns:
            Cleaned JSON string
        """
        import re
        
        # Try to extract JSON from markdown code blocks first
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content)
        if json_match:
            json_string = json_match.group(1)
            return self._clean_json_with_comments(json_string)
        
        # Try to extract JSON array or object
        json_match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', content)
        if json_match:
            json_string = json_match.group(1)
            return self._clean_json_with_comments(json_string)
        
        # If no JSON found, return the original content
        return content
    
    def _clean_json_with_comments(self, json_string: str) -> str:
        """
        Clean JSON string by removing comments and fixing common issues.
        
        Args:
            json_string: JSON string that may contain comments
            
        Returns:
            Cleaned JSON string without comments
        """
        import re
        
        # Remove single-line comments (// ...)
        json_string = re.sub(r'//.*?$', '', json_string, flags=re.MULTILINE)
        
        # Remove multi-line comments (/* ... */)
        json_string = re.sub(r'/\*.*?\*/', '', json_string, flags=re.DOTALL)
        
        # Remove trailing commas before closing brackets/braces
        json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)
        
        # Remove leading/trailing whitespace
        json_string = json_string.strip()
        
        return json_string


# Create singleton instance
ai_service = AIService()
