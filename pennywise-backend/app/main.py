from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, test_connection
from app.api.api_v1 import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Pennywise Expense Tracker API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    """
    Initialize database on startup
    """
    # Test database connection first
    if test_connection():
        init_db()
        print("Successfully connected to database and initialized tables")
    else:
        print("Failed to connect to database")



@app.get("/")
async def root():
    return {
        "message": "Welcome to Pennywise API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    } 