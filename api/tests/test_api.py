import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "service" in data
    assert data["docs"] == "/docs"

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_recommend_endpoint_success():
    payload = {
        "category": "Paper Bag",
        "material": "Brown Kraft 125 gsm",
        "size": "20 x 20 x 25",
        "color": "1/0",
        "print_type": "Sablon 1W1S",
        "qty": 3000,
        "vendor_cost": 2100.0,
        "moq": 1000,
        "min_margin_threshold": 0.67
    }
    res = client.post("/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "recommended_price" in data
    assert "min_price" in data
    assert "max_price" in data
    assert "top_factors" in data
    assert "similar_transactions" in data
    assert data["recommended_price"] > payload["vendor_cost"]

def test_recommend_validation_error():
    # Qty tidak boleh <= 0
    payload = {
        "category": "Food Wrap",
        "material": "Greaseproof 40 gsm",
        "size": "30 x 30 cm",
        "qty": -10,
        "vendor_cost": 185.0
    }
    res = client.post("/recommend", json=payload)
    assert res.status_code == 422 # Pydantic validation error

def test_metrics_endpoint():
    res = client.get("/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "best_model" in data
    assert "models_comparison" in data
