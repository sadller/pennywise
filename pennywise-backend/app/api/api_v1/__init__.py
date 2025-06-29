# API v1 package 
from fastapi import APIRouter
from .endpoints import health, auth
from .endpoints.transactions import router as transactions
from .endpoints.groups import router as groups

api_router = APIRouter()

# Include health endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Include auth endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# Include transactions endpoints
api_router.include_router(transactions, prefix="/transactions", tags=["transactions"])

# Include groups endpoints
api_router.include_router(groups, prefix="/groups", tags=["groups"]) 