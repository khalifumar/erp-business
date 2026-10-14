import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Digipack Price Recommendation Engine"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Path model artefak
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    MODEL_PATH: str = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(BASE_DIR), "ml", "artifacts", "model.joblib"))
    METRICS_PATH: str = os.getenv("METRICS_PATH", os.path.join(os.path.dirname(BASE_DIR), "ml", "artifacts", "metrics.json"))
    
    # Aturan Guardrail Bisnis (ERP Digipack)
    MIN_MARGIN_PERCENTAGE: float = float(os.getenv("MIN_MARGIN_PERCENTAGE", "0.67")) # 67%
    WARN_BELOW_MOQ: bool = True
    
    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
