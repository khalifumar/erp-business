import os
import sys
from contextlib import asynccontextmanager

# Pastikan direktori 'api' berada dalam sys.path agar impor 'app.*' selalu berhasil dari direktori mana pun
api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.recommend import router as recommend_router
from app.services.predictor import PriceRecommendationEngine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Inisialisasi engine & muat model ke memori
    engine = PriceRecommendationEngine.get_instance()
    yield
    # Shutdown logic jika diperlukan
    pass

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Microservice API Rekomendasi Harga Jual Kemasan Berbasis Machine Learning & Rule-based Margin Guardrail untuk Digipack ERP.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hubungkan router
app.include_router(recommend_router)

@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
