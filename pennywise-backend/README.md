# Pennywise Backend API

FastAPI-based backend for the Pennywise Expense Tracker application.

## Features

- RESTful API with FastAPI
- Basic health check endpoints
- CORS middleware support
- Auto-generated API documentation

## Tech Stack

- **Framework**: FastAPI
- **Validation**: Pydantic
- **Testing**: Pytest
- **Documentation**: Auto-generated OpenAPI/Swagger

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:
```bash
# Option 1: Using uvicorn directly
uvicorn app.main:app --reload

# Option 2: Using the run script
python run.py
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Endpoints

- `GET /` - Welcome message and API info
- `GET /health` - Health check endpoint

## Project Structure

```
app/
├── api/           # API routes (placeholder)
├── core/          # Core configuration
├── models/        # Database models (placeholder)
├── schemas/       # Pydantic schemas (placeholder)
├── services/      # Business logic (placeholder)
└── utils/         # Utility functions (placeholder)
```

## Testing

```bash
pytest
```

## License

MIT License 