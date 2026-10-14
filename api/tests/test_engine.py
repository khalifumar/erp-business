import pytest
from app.services.predictor import PriceRecommendationEngine
from app.schemas.recommendation import RecommendationRequest

@pytest.fixture
def engine():
    return PriceRecommendationEngine.get_instance()

def test_engine_loaded(engine):
    assert engine.artifacts is not None
    assert "pipeline" in engine.artifacts

def test_predict_paper_bag_recommendation(engine):
    req = RecommendationRequest(
        category="Paper Bag",
        material="Brown Kraft 125 gsm",
        size="20 x 20 x 25",
        color="1/0",
        print_type="Sablon 1W1S",
        qty=2000,
        vendor_cost=2250.0,
        moq=1000,
        min_margin_threshold=0.67
    )
    res = engine.predict(req)
    
    # 1. Harga jual harus selalu di atas modal vendor
    assert res.recommended_price > req.vendor_cost
    # 2. Rentang harga min dan max harus konsisten
    assert res.min_price <= res.recommended_price
    assert res.recommended_price <= res.max_price
    # 3. Kuantitas 2000 >= MOQ 1000 sehingga tidak ada peringatan MOQ
    assert res.below_moq_warning is False
    # 4. Top factors dan similar transactions terisi
    assert len(res.top_factors) > 0
    assert len(res.similar_transactions) > 0

def test_moq_warning_triggered(engine):
    req = RecommendationRequest(
        category="Food Wrap",
        material="Greaseproof 40 gsm",
        size="30 x 30 cm",
        color="0/0",
        print_type="Polos",
        qty=500, # Di bawah MOQ 3000
        vendor_cost=185.0,
        moq=3000
    )
    res = engine.predict(req)
    assert res.below_moq_warning is True
    assert "di bawah batas MOQ" in res.warning_message

def test_unknown_category_fallback(engine):
    # Kategori baru yang belum pernah ada di training data
    req = RecommendationRequest(
        category="Specialty Metallic Foil",
        material="Metallic 150 gsm",
        size="10 x 10 cm",
        color="0/0",
        print_type="Polos",
        qty=1000,
        vendor_cost=5000.0
    )
    res = engine.predict(req)
    # Harus tetap menghasilkan rekomendasi dengan fallback aman
    assert res.recommended_price >= req.vendor_cost * 1.50
    assert res.recommended_price > 0
