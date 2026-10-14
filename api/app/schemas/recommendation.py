from typing import Optional, List
from pydantic import BaseModel, Field

class RecommendationRequest(BaseModel):
    category: str = Field(..., json_schema_extra={"example": "Paper Bag"}, description="Kategori produk packaging")
    material: str = Field(..., json_schema_extra={"example": "Brown Kraft 125 gsm"}, description="Spesifikasi material")
    size: str = Field(..., json_schema_extra={"example": "20 x 20 x 25"}, description="Dimensi ukuran (P x L x T)")
    color: str = Field(default="1/0", json_schema_extra={"example": "1/0"}, description="Kode warna cetak (0/0, 1/0, 2/0)")
    print_type: str = Field(default="Sablon 1W1S", json_schema_extra={"example": "Sablon 1W1S"}, description="Jenis sablon / finishing")
    qty: int = Field(..., gt=0, json_schema_extra={"example": 2000}, description="Kuantitas pesanan")
    vendor_cost: float = Field(..., gt=0, json_schema_extra={"example": 2250.0}, description="Harga modal vendor (COGS) per unit")
    moq: Optional[int] = Field(default=1000, description="Minimum Order Quantity vendor")
    min_margin_threshold: Optional[float] = Field(default=0.67, description="Ambang batas margin minimum (default 67%)")

class FactorContribution(BaseModel):
    factor: str
    impact: str # "positive", "negative", "neutral"
    description: str

class SimilarTransaction(BaseModel):
    so_code: str
    category: str
    product_name: str
    qty: int
    vendor_cost: float
    selling_price: float
    markup_ratio: float
    similarity_score: float

class RecommendationResponse(BaseModel):
    recommended_price: float = Field(..., description="Harga jual rekomendasi per unit (Rp)")
    min_price: float = Field(..., description="Rentang batas harga bawah (Rp)")
    max_price: float = Field(..., description="Rentang batas harga atas (Rp)")
    predicted_markup: float = Field(..., description="Rasio markup prediksi (selling_price / vendor_cost)")
    expected_margin_percentage: float = Field(..., description="Estimasi profit margin %")
    is_below_margin: bool = Field(..., description="Status apakah harga rekomendasi di bawah batas margin minimum")
    below_moq_warning: bool = Field(..., description="Peringatan jika kuantitas di bawah MOQ vendor")
    warning_message: Optional[str] = None
    method_used: str = Field(..., description="Metode penentuan harga: 'lightgbm_ml' atau 'category_baseline_fallback'")
    top_factors: List[FactorContribution] = Field(default_factory=list, description="3 faktor penentu terbesar")
    similar_transactions: List[SimilarTransaction] = Field(default_factory=list, description="3 transaksi historis terdekat")

class RetrainResponse(BaseModel):
    status: str
    message: str
    best_model: str
    metrics: dict
