# API v1 package 
from fastapi import APIRouter
from .endpoints import health

api_router = APIRouter()

# Include health endpoints
api_router.include_router(health.router, prefix="/health", tags=["health"]) 