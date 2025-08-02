# AI Model constants for the backend

# Available AI models for different use cases
AI_MODELS = {
    "DEFAULT": "google/gemini-2.0-flash-exp:free",
    "GEMMA_3N_E4B": "google/gemma-3n-e4b-it:free",
    "GEMINI_FLASH": "google/gemini-2.0-flash-exp:free",
    "GEMINI_2_9B": "google/gemma-2-9b-it:free",
    "GEMINI_3N_E2B": "google/gemma-3n-e2b-it:free",
    "LLAMA_VISION": "meta-llama/llama-3.2-11b-vision-instruct:free",
    "DEEPSEEK_DISTILL": "deepseek/deepseek-r1-distill-llama-70b:free",
    "QWEN_3_4B": "qwen/qwen3-4b:free",
    "HORIZON_ALPHA": "openrouter/horizon-alpha",
    "DOLPHIN_MISTRAL": "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "MISTRAL_SMALL": "mistralai/mistral-small-3.1-24b-instruct:free",
}

# Model categories for different use cases
MODEL_CATEGORIES = {
    "FAST": [
        AI_MODELS["DEFAULT"],
        AI_MODELS["GEMINI_3N_E2B"],
        AI_MODELS["QWEN_3_4B"],
    ],
    "BALANCED": [
        AI_MODELS["GEMINI_FLASH"],
        AI_MODELS["GEMINI_2_9B"],
        AI_MODELS["DEEPSEEK_DISTILL"],
    ],
    "HIGH_QUALITY": [
        AI_MODELS["MISTRAL_SMALL"],
        AI_MODELS["DOLPHIN_MISTRAL"],
        AI_MODELS["HORIZON_ALPHA"],
    ],
    "VISION": [
        AI_MODELS["LLAMA_VISION"],
    ],
}

# Default model for different features
DEFAULT_MODELS = {
    "TEXT_GENERATION": AI_MODELS["DEFAULT"],
    "CODE_GENERATION": AI_MODELS["DEEPSEEK_DISTILL"],
    "VISION_ANALYSIS": AI_MODELS["LLAMA_VISION"],
    "CONVERSATION": AI_MODELS["MISTRAL_SMALL"],
} 