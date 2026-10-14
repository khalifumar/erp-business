# Machine Learning Service API (FastAPI) - Fase 3

Microservice backend Python FastAPI untuk melayani inferensi model rekomendasi harga jual kemasan secara real-time, mengaplikasikan guardrail margin minimum 67%, peringatan MOQ, rentang harga kuantil residual, dan pencarian transaksi historis terdekat.

---

## 1. Struktur Direktori

```text
api/
├── app/
│   ├── core/
│   │   └── config.py            # Konfigurasi aplikasi, path model, margin threshold (67%), CORS
│   ├── schemas/
│   │   └── recommendation.py    # Schema validasi Pydantic request & response
│   ├── services/
│   │   └── predictor.py         # Engine inferensi LightGBM, kalkulasi margin, nearest neighbor, top factors
│   ├── routers/
│   │   └── recommend.py         # Endpoint /recommend, /health, /metrics, /retrain
│   └── main.py                  # Entrypoint FastAPI, CORS middleware, lifespan events
├── tests/
│   ├── test_engine.py           # Unit test engine ML, kalkulasi rentang, guardrail MOQ & fallback
│   └── test_api.py              # Unit test endpoint REST API & validasi schema
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## 2. Cara Menjalankan Service API

### Opsi A: Menjalankan Server Lokal
Jalankan perintah berikut dari folder root atau folder `api/`:
```powershell
python -m uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload
```
API akan aktif di:
- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

### Opsi B: Menjalankan Unit Tests
Seluruh unit test mencakup validasi formula, guardrail, dan endpoint:
```powershell
python -m pytest api/tests
```

---

## 3. Dokumentasi Endpoint Utama

### 1. `POST /recommend`
Menghasilkan rekomendasi harga jual unit, rentang min-max, evaluasi margin 67%, 3 faktor penentu, dan 3 transaksi historis terdekat.

**Request Payload:**
```json
{
  "category": "Paper Bag",
  "material": "Brown Kraft 125 gsm",
  "size": "20 x 20 x 25",
  "color": "1/0",
  "print_type": "Sablon 1W1S",
  "qty": 2000,
  "vendor_cost": 2250.0,
  "moq": 1000,
  "min_margin_threshold": 0.67
}
```

**Response Payload:**
```json
{
  "recommended_price": 3757.5,
  "min_price": 3667.22,
  "max_price": 3854.18,
  "predicted_markup": 1.67,
  "expected_margin_percentage": 0.67,
  "is_below_margin": false,
  "below_moq_warning": false,
  "warning_message": null,
  "method_used": "lightgbm_ml",
  "top_factors": [
    {
      "factor": "Kuantitas Standar",
      "impact": "neutral",
      "description": "Volume 2000 pcs berada dalam tier standar katalog."
    },
    {
      "factor": "Proses Sablon / Finishing Tambahan",
      "impact": "positive",
      "description": "Spesifikasi cetak 'Sablon 1W1S' melibatkan proses setting mesin dan biaya sablon per sisi."
    },
    {
      "factor": "Kategori Paper Bag",
      "impact": "neutral",
      "description": "Tren margin rata-rata historis untuk kategori Paper Bag adalah ~67%."
    }
  ],
  "similar_transactions": [
    {
      "so_code": "SO-202607-0042",
      "category": "Paper Bag",
      "product_name": "Brown Paperbag Handle",
      "qty": 2000,
      "vendor_cost": 2250.0,
      "selling_price": 3760.0,
      "markup_ratio": 1.6711,
      "similarity_score": 0.998
    }
  ]
}
```

### 2. `GET /health`
Memeriksa kesiapan service dan ketersediaan model ML yang sedang aktif di memori.

### 3. `GET /metrics`
Mengembalikan metrik evaluasi perbandingan model (MAE, RMSE, MAPE) untuk kebutuhan data tabel skripsi.

### 4. `POST /retrain`
Memicu pipeline pelatihan ulang model di latar belakang (`background_tasks`) dengan data historis terbaru.
