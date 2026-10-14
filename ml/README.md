# Pipeline Data & Modeling Machine Learning (Fase 2)

Direktori ini berisi seluruh pipeline data science, pembersihan data, skrip training, komparasi model regresi, notebook analisis untuk skripsi, dan artefak model tersimpan.

---

## 1. Struktur Direktori

```text
ml/
├── data/
│   ├── historical_sales_anonymized.csv  # Data mentah anonim (350 transaksi)
│   ├── historical_sales_cleaned.csv     # Data siap latih setelah validasi & feature engineering
│   └── data_quality_report.json         # Laporan missing values & statistik deskriptif
├── scripts/
│   ├── anonymize.py                     # Modul anonimisasi nama brand & vendor
│   ├── clean_data.py                    # Validasi konsistensi numerik & pembagian tier qty
│   └── generate_notebook.py             # Generator notebook Jupyter skripsi
├── notebooks/
│   └── eda_and_model_comparison.ipynb   # Notebook lengkap (EDA, modeling, SHAP) untuk Bab 4 Skripsi / Google Colab
├── artifacts/
│   ├── model.joblib                     # Model terbaik (LightGBM) + Preprocessor + Residual Quantile + NN
│   └── metrics.json                     # Laporan metrik komparasi model
├── train.py                             # Script pipeline training utama
└── README.md
```

---

## 2. Metodologi Modeling

1. **Target Prediksi**:
   - Memprediksi **Rasio Markup** ($\text{Markup} = \frac{\text{Harga Jual}}{\text{Harga Vendor}}$), bukan harga rupiah mentah.
   - Harga rekomendasi diperoleh dari: $\text{Harga Rekomendasi} = \text{Markup}_{\text{prediksi}} \times \text{Harga Vendor}$.
   - Keunggulan: Lebih stabil terhadap variasi produk dengan skala harga yang sangat berbeda (misal paperbag Rp 200 vs box Rp 7.000).
2. **Validasi Berbasis Waktu (Time-Series Split)**:
   - Data diurutkan secara kronologis (Mei – September 2026 sebagai Train 80%, Oktober 2026 sebagai Test 20%).
3. **Hasil Komparasi Model (Pada Harga Jual Akhir Rp)**:

| Model | MAE (Rp) | RMSE (Rp) | MAPE (%) | Keterangan |
|---|---|---|---|---|
| **Baseline (Rata-rata Kategori)** | Rp 44.38 | Rp 62.97 | 3.08% | Benchmark acuan |
| **Linear Regression** | Rp 33.39 | Rp 49.04 | 2.23% | Model parametrik |
| **Random Forest** | Rp 32.57 | Rp 47.42 | 2.10% | Ensemble Bagging |
| **LightGBM** | **Rp 32.53** | **Rp 47.08** | **2.07%** | **Model Terbaik (Terpilih)** |

4. **Rentang Harga (Min-Max)**:
   - Menggunakan kuantil residual 10% ($q_{10} = -0.0401$) dan 90% ($q_{90} = +0.0430$) untuk memberikan batas toleransi penawaran harga yang wajar bagi sales.
5. **Explainability & Transaksi Terdekat**:
   - Menggunakan model Nearest Neighbors (Cosine Similarity) pada representasi fitur untuk menampilkan 3 transaksi historis paling relevan.
   - Menggunakan SHAP TreeExplainer untuk mengekstrak 3 faktor fitur yang paling memengaruhi rekomendasi markup.

---

## 3. Cara Menjalankan Training Ulang

Untuk melatih ulang model kapan saja:
```bash
python ml/train.py
```
Model baru akan otomatis diperbarui di `ml/artifacts/model.joblib` dan laporan metrik di `ml/artifacts/metrics.json`.
