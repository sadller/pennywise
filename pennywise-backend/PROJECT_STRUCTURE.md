# Pennywise Backend - Project Structure

## 📁 Directory Structure

```
pennywise-backend/
├── app/                    # Main application package
│   ├── __init__.py        # Package initialization
│   ├── main.py            # FastAPI application entry point
│   ├── api/               # API routes and endpoints
│   │   ├── __init__.py
│   │   └── api_v1/        # API version 1
│   │       ├── __init__.py
│   │       ├── api.py     # Main API router
│   │       └── endpoints/ # API endpoint modules
│   │           ├── __init__.py
│   │           ├── auth.py
│   │           ├── users.py
│   │           ├── groups.py
│   │           └── transactions.py
│   ├── core/              # Core configuration and utilities
│   │   ├── __init__.py
│   │   ├── config.py      # Application settings
│   │   ├── security.py    # Security utilities
│   │   └── database.py    # Database configuration
│   ├── models/            # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── group.py
│   │   └── transaction.py
│   ├── schemas/           # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── group.py
│   │   └── transaction.py
│   ├── services/          # Business logic services
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── group_service.py
│   │   └── transaction_service.py
│   └── utils/             # Utility functions
│       ├── __init__.py
│       ├── auth.py
│       └── helpers.py
├── tests/                 # Test suite
│   ├── __init__.py
│   ├── test_main.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── conftest.py
├── alembic/               # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── requirements.txt       # Python dependencies
├── pyproject.toml         # Project configuration
├── env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation
├── TECH_STACK.md         # Technology stack documentation
└── PROJECT_STRUCTURE.md  # This file
```

## 🎯 Key Directories Explained

### `/app/`
Main application package containing all business logic:

#### `/app/main.py`
FastAPI application entry point with:
- Application initialization
- Middleware configuration
- CORS setup
- API router inclusion
- Health check endpoints

#### `/app/api/`
API routes and endpoint definitions:
- **api_v1/**: Version 1 of the API
- **endpoints/**: Individual endpoint modules
  - `auth.py`: Authentication endpoints
  - `users.py`: User management endpoints
  - `groups.py`: Group management endpoints
  - `transactions.py`: Transaction endpoints

#### `/app/core/`
Core configuration and utilities:
- **config.py**: Application settings using Pydantic
- **security.py**: Security utilities (JWT, password hashing)
- **database.py**: Database connection and session management

#### `/app/models/`
SQLAlchemy database models:
- **user.py**: User model with authentication fields
- **group.py**: Group model for expense groups
- **transaction.py**: Transaction model for expenses/income
- **group_member.py**: Many-to-many relationship model

#### `/app/schemas/`
Pydantic schemas for request/response validation:
- **user.py**: User-related schemas
- **group.py**: Group-related schemas
- **transaction.py**: Transaction-related schemas
- **common.py**: Shared schemas and utilities

#### `/app/services/`
Business logic layer:
- **auth_service.py**: Authentication and authorization logic
- **user_service.py**: User management operations
- **group_service.py**: Group and member management
- **transaction_service.py**: Expense tracking logic

#### `/app/utils/`
Utility functions and helpers:
- **auth.py**: Authentication utilities
- **helpers.py**: General helper functions
- **validators.py**: Custom validation functions

## 🗄️ Database Architecture

### Models Structure
```python
# User Model
class User(Base):
    id: UUID
    email: str
    name: str
    google_id: str
    created_at: datetime
    updated_at: datetime

# Group Model
class Group(Base):
    id: UUID
    name: str
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

# GroupMember Model
class GroupMember(Base):
    user_id: UUID
    group_id: UUID
    role: str  # 'admin' or 'member'
    permissions: JSON
    joined_at: datetime

# Transaction Model
class Transaction(Base):
    id: UUID
    group_id: UUID
    user_id: UUID
    amount: Decimal
    type: str  # 'INCOME' or 'EXPENSE'
    category: str
    payment_mode: str
    note: str
    date: date
    created_at: datetime
    updated_at: datetime
```

## 🔐 Authentication Architecture

### JWT Token Structure
```python
{
    "sub": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "exp": "expiration_timestamp",
    "iat": "issued_at_timestamp"
}
```

### Authentication Flow
1. User authenticates with Google OAuth2
2. Backend verifies Google ID token
3. Backend creates/updates user record
4. Backend issues JWT token
5. Frontend stores JWT token
6. API requests include JWT in Authorization header

## 🔄 API Structure

### Endpoint Organization
```
/api/v1/
├── /auth
│   ├── POST /google      # Google OAuth authentication
│   ├── POST /refresh     # Refresh JWT token
│   └── POST /logout      # Logout user
├── /users
│   ├── GET /me           # Get current user
│   ├── PUT /me           # Update current user
│   └── GET /{user_id}    # Get user by ID
├── /groups
│   ├── GET /             # Get user's groups
│   ├── POST /            # Create new group
│   ├── GET /{group_id}   # Get group details
│   ├── PUT /{group_id}   # Update group
│   ├── DELETE /{group_id} # Delete group
│   ├── POST /{group_id}/members    # Add member
│   └── DELETE /{group_id}/members/{user_id} # Remove member
└── /transactions
    ├── GET /             # Get transactions
    ├── POST /            # Create transaction
    ├── GET /{id}         # Get transaction
    ├── PUT /{id}         # Update transaction
    ├── DELETE /{id}      # Delete transaction
    ├── GET /reports/summary  # Get summary report
    └── GET /reports/monthly  # Get monthly report
```

## 🧪 Testing Structure

### Test Organization
- **Unit tests**: Individual function and class tests
- **Integration tests**: API endpoint tests
- **Database tests**: Model and query tests
- **Authentication tests**: Auth flow tests

### Test Configuration
- **conftest.py**: Pytest fixtures and configuration
- **test_main.py**: Application startup tests
- **test_auth.py**: Authentication endpoint tests
- **test_users.py**: User management tests
- **test_groups.py**: Group management tests
- **test_transactions.py**: Transaction tests

## 🔧 Configuration Management

### Environment Variables
- **DATABASE_URL**: PostgreSQL connection string
- **GOOGLE_CLIENT_ID**: Google OAuth client ID
- **JWT_SECRET_KEY**: JWT signing secret
- **ALLOWED_ORIGINS**: CORS allowed origins
- **DEBUG**: Debug mode flag

### Settings Classes
```python
class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str
    DATABASE_URL_ASYNC: str
    
    # Authentication settings
    GOOGLE_CLIENT_ID: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    
    # Application settings
    APP_NAME: str = "Pennywise API"
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str]
```

## 🚀 Deployment Structure

### Production Configuration
- **Docker**: Containerization for consistent deployment
- **Environment**: Production-specific settings
- **Database**: Supabase PostgreSQL instance
- **Hosting**: Render or Railway platform

### Development Configuration
- **Local Database**: PostgreSQL with Docker
- **Hot Reload**: Uvicorn with --reload flag
- **Debug Mode**: Detailed error messages
- **Test Database**: Separate test database

## 📊 Monitoring & Logging

### Logging Configuration
- **Structured Logging**: JSON format for better parsing
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Request Logging**: API request/response logging
- **Error Tracking**: Exception logging and alerting

### Health Checks
- **Application Health**: Basic application status
- **Database Health**: Database connection status
- **External Services**: Google OAuth service status

## 🔒 Security Implementation

### Security Measures
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Pydantic schema validation
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API rate limiting (planned)
- **SQL Injection Prevention**: SQLAlchemy ORM protection 