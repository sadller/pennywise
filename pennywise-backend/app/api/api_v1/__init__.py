# API v1 package 
from fastapi import APIRouter
from .endpoints import health, auth
from .endpoints.transactions import router as transactions
from .endpoints.groups import router as groups
from .endpoints.dashboard import router as dashboard
from .endpoints.notifications import router as notifications
from .endpoints.extract import router as extract_router

api_router = APIRouter()

# Include health endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Include auth endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include transactions endpoints
api_router.include_router(transactions, prefix="/transactions", tags=["transactions"])

# Include groups endpoints
api_router.include_router(groups, prefix="/groups", tags=["groups"])

# Include dashboard endpoints
api_router.include_router(dashboard, prefix="/dashboard", tags=["dashboard"])

# Include notifications endpoints
api_router.include_router(notifications, prefix="/notifications", tags=["notifications"])

# NLP extraction endpoint (no extra prefix)
api_router.include_router(extract_router, tags=["nlp"])
 