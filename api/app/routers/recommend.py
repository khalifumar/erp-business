import os
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RetrainResponse
)
from app.services.predictor import PriceRecommendationEngine
from app.core.config import settings

router = APIRouter(tags=["Price Recommendation"])

@router.get("/health")
def health_check():
    """Memeriksa status service dan ketersediaan model ML."""
    engine = PriceRecommendationEngine.get_instance()
    has_model = engine.artifacts is not None
    model_name = engine.artifacts.get("model_name", "None") if has_model else "None"
    
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "model_loaded": has_model,
        "active_model": model_name
    }

@router.post("/recommend", response_model=RecommendationResponse)
def get_recommendation(payload: RecommendationRequest):
    """
    Menghasilkan rekomendasi harga jual per unit berdasarkan spesifikasi packaging,
    kuantitas, dan modal vendor (COGS) menggunakan model hibrida ML + Guardrail Margin.
    """
    try:
        engine = PriceRecommendationEngine.get_instance()
        result = engine.predict(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses rekomendasi harga: {str(e)}")

@router.get("/metrics")
def get_model_metrics():
    """Mengambil laporan evaluasi performa model ML (MAE, RMSE, MAPE) untuk evaluasi skripsi."""
    if not os.path.exists(settings.METRICS_PATH):
        raise HTTPException(status_code=404, detail="File metrics.json belum ditemukan. Silakan jalankan training terlebih dahulu.")
    
    try:
        with open(settings.METRICS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal membaca metrics.json: {str(e)}")

def execute_retrain_task():
    """Helper untuk menjalankan skrip training ulang."""
    import subprocess
    import sys
    
    train_script = os.path.join(os.path.dirname(settings.BASE_DIR), "ml", "train.py")
    subprocess.run([sys.executable, train_script], check=True)
    # Reload model di memori
    engine = PriceRecommendationEngine.get_instance()
    engine.load_model()

@router.post("/retrain", response_model=RetrainResponse)
def trigger_retrain(background_tasks: BackgroundTasks):
    """
    Menjalankan pelatihan ulang model ML dengan data terbaru (khusus Admin).
    """
    try:
        background_tasks.add_task(execute_retrain_task)
        
        # Baca metrics saat ini
        metrics = {}
        if os.path.exists(settings.METRICS_PATH):
            with open(settings.METRICS_PATH, "r", encoding="utf-8") as f:
                metrics = json.load(f)
                
        return RetrainResponse(
            status="accepted",
            message="Pelatihan ulang model telah dimulai di latar belakang. Model akan otomatis diperbarui setelah selesai.",
            best_model="LightGBM",
            metrics=metrics.get("models_comparison", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memulai retraining: {str(e)}")
