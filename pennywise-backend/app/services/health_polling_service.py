import asyncio
import logging
import aiohttp
import socket
from datetime import datetime
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class HealthPollingService:
    def __init__(self, base_url: str = ""):
        self.base_url = base_url or self._get_default_base_url()
        self.session: Optional[aiohttp.ClientSession] = None
        self.is_running = False
        self.polling_interval = settings.HEALTH_POLLING_INTERVAL
        
    def _get_default_base_url(self) -> str:
        """Get the default base URL for health checks based on current server configuration"""
        # Try to get the host from settings, fallback to localhost
        host = getattr(settings, 'HOST', 'localhost')
        port = getattr(settings, 'PORT', '8000')
        
        # If host is 0.0.0.0, use localhost for health checks
        if host == '0.0.0.0':
            host = 'localhost'
            
        base_url = f"http://{host}:{port}"
        logger.info(f"Health polling service configured with base URL: {base_url}")
        return base_url
        
    async def start(self):
        """Start the health polling service"""
        if self.is_running:
            logger.warning("Health polling service is already running")
            return
            
        self.is_running = True
        self.session = aiohttp.ClientSession()
        logger.info(f"Health polling service started with base URL: {self.base_url}")
        
        # Start the polling task in background
        asyncio.create_task(self._poll_health())
        
    async def stop(self):
        """Stop the health polling service"""
        self.is_running = False
        if self.session:
            await self.session.close()
        logger.info("Health polling service stopped")
        
    async def _poll_health(self):
        """Poll the health endpoint every 5 minutes"""
        while self.is_running:
            try:
                await self._check_health()
            except Exception as e:
                logger.error(f"Error during health check: {e}")
            
            # Wait for 5 minutes before next check
            await asyncio.sleep(self.polling_interval)
            
    async def _check_health(self):
        """Perform the actual health check"""
        if not self.session:
            return
            
        try:
            # Check basic health endpoint
            async with self.session.get(f"{self.base_url}/api/v1/health/") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"Health check successful at {datetime.now()}: {data}")
                else:
                    logger.error(f"Health check failed with status {response.status}")
                    
            # Check database health endpoint
            async with self.session.get(f"{self.base_url}/api/v1/health/db") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"Database health check successful at {datetime.now()}: {data}")
                else:
                    logger.error(f"Database health check failed with status {response.status}")
                    
        except aiohttp.ClientError as e:
            logger.error(f"Network error during health check: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during health check: {e}")


# Global instance
health_polling_service = HealthPollingService() 