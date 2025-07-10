# Pennywise Backend API

FastAPI-based backend for the Pennywise Expense Tracker application.

## Features

- **Authentication**: JWT-based authentication with email/password and Google OAuth
- **Group Management**: Create and manage expense groups with member invitations
- **Transaction Tracking**: Record income and expenses with categories and payment modes
- **Dashboard Analytics**: Comprehensive statistics and recent activity tracking
- **Notification System**: Real-time notifications for group activities
- **RESTful API**: Well-structured endpoints with proper validation
- **Auto-generated Documentation**: OpenAPI/Swagger and ReDoc documentation

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh mechanism
- **Validation**: Pydantic for request/response validation
- **Migrations**: Alembic for database schema management
- **Testing**: Pytest for unit and integration tests
- **Documentation**: Auto-generated OpenAPI/Swagger

## Project Structure

```
app/
├── api/                    # API routes and endpoints
│   └── api_v1/
│       └── endpoints/      # Individual endpoint modules
├── core/                   # Core configuration
│   ├── config.py          # Application settings
│   └── database.py        # Database connection
├── models/                 # SQLAlchemy database models
├── schemas/               # Pydantic validation schemas
├── services/              # Business logic layer
└── utils/                 # Utility functions
```

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

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start development server:
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

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/google/callback` - Google OAuth callback

### Groups
- `POST /api/v1/groups/` - Create new group
- `GET /api/v1/groups/` - List user's groups
- `GET /api/v1/groups/{id}` - Get specific group
- `GET /api/v1/groups/{id}/stats` - Get group statistics
- `POST /api/v1/groups/{id}/invite` - Invite user to group
- `POST /api/v1/groups/{id}/members` - Add member to group
- `GET /api/v1/groups/{id}/members` - List group members
- `DELETE /api/v1/groups/{id}` - Delete group

### Transactions
- `POST /api/v1/transactions/` - Create transaction
- `GET /api/v1/transactions/` - List transactions
- `GET /api/v1/transactions/{id}` - Get specific transaction
- `DELETE /api/v1/transactions/{id}` - Delete transaction

### Dashboard
- `GET /api/v1/dashboard/groups` - Get groups with stats
- `GET /api/v1/dashboard/recent-transactions` - Get recent transactions
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

### Notifications
- `GET /api/v1/notifications/` - List notifications
- `PUT /api/v1/notifications/{id}/read` - Mark as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

### Health
- `GET /api/v1/health/` - Basic health check
- `GET /api/v1/health/db` - Database health check

## Testing

```bash
pytest
```

## License

MIT License 