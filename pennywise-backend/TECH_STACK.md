# Pennywise Backend - Tech Stack & Architecture

## 🎯 Project Overview
Pennywise Backend is a high-performance RESTful API built with FastAPI and Python, designed to handle expense tracking, user management, and group collaboration with robust authentication and data validation.

## 🏗️ Core Framework
- **FastAPI 0.115.6** - Modern, fast web framework for building APIs
  - Automatic API documentation with OpenAPI/Swagger
  - Built-in data validation with Pydantic
  - Async/await support for high performance
  - Type hints for better code quality

- **Uvicorn 0.32.1** - Lightning-fast ASGI server
  - ASGI specification compliance
  - WebSocket support
  - Process management and reloading

## 🗄️ Database & ORM
- **SQLAlchemy 2.0.36** - Modern Python SQL toolkit and ORM
  - Type-safe database operations
  - Async support with asyncpg
  - Migration management with Alembic

- **PostgreSQL** - Primary database (hosted on Supabase)
  - ACID compliance and data integrity
  - JSON support for flexible data storage

## 🔐 Authentication & Security
- **Google Auth 2.29.0** - Google OAuth2 integration
- **Python-Jose 3.3.0** - JWT token handling
- **Passlib 1.7.4** - Password hashing with bcrypt

## 📊 Data Validation & Serialization
- **Pydantic 2.10.4** - Data validation using Python type annotations
- **Pydantic Settings 2.6.1** - Settings management

## 🔧 Development & Testing
- **Pytest 8.2.2** - Testing framework
- **Pytest-asyncio 0.24.0** - Async testing support
- **HTTPX 0.28.1** - HTTP client for testing

## 📝 Logging & Monitoring
- **Structlog 24.4.0** - Structured logging

## 🏗️ Architecture Patterns

### API Structure
```
/api/v1/
├── /auth          # Authentication endpoints
├── /users         # User management
├── /groups        # Group operations
└── /transactions  # Expense tracking
```

### Database Models
- **User**: Authentication and profile data
- **Group**: Expense group containers
- **GroupMember**: User-group relationships with roles
- **Transaction**: Expense/income records

## 🔒 Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration

## 🚀 Deployment & DevOps
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Render/Railway** hosting
- **Supabase** database hosting

## 🔄 Development Workflow
1. **Local Development**: `uvicorn app.main:app --reload`
2. **Testing**: `pytest` with coverage
3. **Migrations**: Alembic for schema changes
4. **Deployment**: Automated via CI/CD 