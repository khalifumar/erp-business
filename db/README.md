# Panduan Database & Skema (Fase 1)

Direktori ini berisi seluruh skema database, aturan keamanan Row Level Security (RLS), view analisis skripsi, trigger otomatis, dan seed data realistis untuk prototipe ERP Digipack.

---

## 1. Struktur File

```text
db/
├── migrations/
│   ├── 01_schema.sql                # Tabel, enum, index, trigger kalkulasi margin & RLS
│   └── 02_views_and_functions.sql   # Function get_active_vendor_price, v_quotation_evaluation, v_dashboard_kpis
├── seed/
│   ├── 01_seed_users_and_master.sql # User/profiles (admin, manager, sales), customers, vendors, products, settings
│   ├── 02_seed_vendor_prices.sql    # Harga modal vendor dengan tier kuantitas dan MOQ
│   ├── 03_seed_rfq_and_quotations.sql # RFQ, quotation, dan quotation_items dengan tracking durasi
│   ├── 04_seed_historical_sales.sql # 350 transaksi historis 6 bulan (anonim)
│   └── generate_historical_seed.py  # Script python pembuat seed dari file excel
├── full_setup.sql                   # Gabungan seluruh file migrasi dan seed (1-Click Run di Supabase)
└── README.md
```

---

## 2. Cara Menjalankan di Supabase Cloud

Ada 2 cara yang sangat mudah untuk memasang database ini:

### Opsi A: 1-Click Run (Sangat Direkomendasikan)
1. Buka dashboard project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
2. Masuk ke menu **SQL Editor** di sidebar kiri.
3. Klik tombol **New Query**.
4. Buka file [`db/full_setup.sql`](file:///c:/Users/Khalif%20Umar%20Al%20Faruq/Documents/7-proyek/22-price-prediction/db/full_setup.sql), salin (**Copy**) seluruh isinya, lalu tempel (**Paste**) ke SQL Editor Supabase.
5. Klik **Run** (atau tekan `Ctrl + Enter`).

### Opsi B: Menjalankan Bertahap
Jika ingin menjalankan file satu per satu, jalankan dengan urutan berikut:
1. `db/migrations/01_schema.sql`
2. `db/migrations/02_views_and_functions.sql`
3. `db/seed/01_seed_users_and_master.sql`
4. `db/seed/02_seed_vendor_prices.sql`
5. `db/seed/03_seed_rfq_and_quotations.sql`
6. `db/seed/04_seed_historical_sales.sql`

---

## 3. Fitur Utama Database untuk Skripsi

1. **Guardrail Margin Otomatis (Trigger `trg_calculate_quotation_item_metrics`)**:
   - Menghitung persentase margin secara otomatis: `(harga_final - vendor_cost) / vendor_cost`.
   - Menandai kolom `is_below_margin = true` jika margin berada di bawah `target_margin_pct` (default `0.67`).
   - Otomatis mencatat durasi waktu pembuatan quotation (`duration_seconds = finished_at - started_at`).
2. **View Evaluasi Skripsi (`v_quotation_evaluation`)**:
   - Membandingkan langsung harga rekomendasi AI vs harga final keputusan sales.
   - Mengukur selisih nominal, selisih persentase, kepatuhan margin, dan durasi pembuatan quotation manual vs dengan rekomendasi.
3. **View KPI Dashboard (`v_dashboard_kpis`)**:
   - Menghitung rata-rata margin, rasio adopsi AI rekomendasi, rata-rata durasi pengerjaan, dan total transaksi yang siap disajikan ke dashboard Next.js.
4. **Data Anonim**:
   - Nama customer dan vendor riil telah diubah menjadi kode anonim (`CLIENT_001`, `VENDOR_SP0001`, dsb.) untuk memenuhi aspek keamanan etika data penelitian.
