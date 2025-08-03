"""Generic AI service using OpenRouter for secure API calls.

This service provides a generic interface for AI-powered features using OpenRouter API calls
from the backend to keep API keys secure.
"""
import json
import re
from typing import Dict, List
from app.core.config import settings
from app.constants.ai_models import AI_MODELS, DEFAULT_MODELS


class AIService:
    """Generic service for AI-powered features using OpenRouter API."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
    
    def _clean_json_with_comments(self, json_string: str) -> str:
        """
        Clean JSON string by removing comments and fixing common issues.
        
        Args:
            json_string: JSON string that may contain comments
            
        Returns:
            Cleaned JSON string without comments
        """
        # Remove single-line comments (// ...)
        json_string = re.sub(r'//.*?$', '', json_string, flags=re.MULTILINE)
        
        # Remove multi-line comments (/* ... */)
        json_string = re.sub(r'/\*.*?\*/', '', json_string, flags=re.DOTALL)
        
        # Remove trailing commas before closing brackets/braces
        json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)
        
        # Remove leading/trailing whitespace
        json_string = json_string.strip()
        
        return json_string
    
    def _extract_and_clean_json(self, content: str) -> str:
        """
        Extract JSON from AI response content and clean it.
        
        Args:
            content: Raw AI response content
            
        Returns:
            Cleaned JSON string
        """
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
    
    def chat_completion(self, messages: List[Dict[str, str]], model: str = AI_MODELS["DEFAULT"]) -> str:
        """
        Make a chat completion request to OpenRouter API.
        
        Args:
            messages: List of message objects with role and content
            model: AI model to use (defaults to DEFAULT model)
            
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
                timeout=120
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code}")
            
            # Log the raw AI response for debugging
            print(f"AI response: {response.text}")
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Extract and clean JSON from the content
            cleaned_json = self._extract_and_clean_json(content)
            
            # Validate the cleaned JSON
            try:
                json.loads(cleaned_json)  # Validate JSON
                return cleaned_json
            except json.JSONDecodeError as e:
                print(f"Failed to parse cleaned JSON: {e}")
                print(f"Cleaned JSON: {cleaned_json}")
                # Return original content if JSON parsing fails
                return content
            
        except Exception as e:
            raise Exception(f"OpenRouter API call failed: {str(e)}")
    
    def get_model_for_feature(self, feature: str) -> str:
        """
        Get the appropriate model for a specific feature.
        
        Args:
            feature: The feature type (TEXT_GENERATION, CODE_GENERATION, etc.)
            
        Returns:
            Model name for the feature
        """
        return DEFAULT_MODELS.get(feature, AI_MODELS["DEFAULT"])
    
    def get_available_models(self) -> Dict[str, str]:
        """
        Get all available models.
        
        Returns:
            Dictionary of model names and their identifiers
        """
        return AI_MODELS.copy()


# Create singleton instance
ai_service = AIService() 