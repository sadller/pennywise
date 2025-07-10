import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint returns basic API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "docs" in data
    assert "redoc" in data


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data


def test_database_health_check():
    """Test the database health check endpoint."""
    response = client.get("/api/v1/health/db")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data


def test_api_documentation():
    """Test that API documentation is accessible."""
    response = client.get("/docs")
    assert response.status_code == 200


def test_redoc_documentation():
    """Test that ReDoc documentation is accessible."""
    response = client.get("/redoc")
    assert response.status_code == 200 