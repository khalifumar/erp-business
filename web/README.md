# Frontend ERP Digipack (Next.js 16 + TypeScript + Tailwind CSS) - Fase 4

Aplikasi antarmuka web ERP prototipe bergaya `erp-digipack.id` dengan tema gelap modern, aksen tosca/cyan `#00ccb2`, header biru, tabel berfilter, dan modul interaktif rekomendasi harga jual bertenaga Machine Learning.

---

## 1. Fitur per Halaman yang Telah Dibangun

1. **Header Biru & Sidebar Gelap**:
   - Breadcrumbs dinamis (`Digipack / Dashboard / [Halaman Aktif]`).
   - Switch role instan di avatar header (`sales`, `manager`, `admin`) untuk pengujian hak akses dan approval skripsi.
   - Menu navigasi: Platform (Dashboard, KPI), Order (Data RFQ, Vendor Price, Data Quotation), dan Sales (Buat Quotation AI, Sales Orders).
2. **Dashboard ([`/`](http://localhost:3000/))**:
   - 4 Kartu statistik gelap atas (Total Orders 1.194, Completed 60, Customers 2.161, Revenue Rp 284jt).
   - Laporan transaksi dokumen (RFQ, Quotation, SO, PO, WO, DO, Completed).
   - Kartu metrik skripsi (Rata-rata Margin 66.8%, Adopsi AI 82.5%, perbandingan waktu pengerjaan manual vs AI).
   - Grafik Recharts area chart tren margin bulanan vs garis target kebijakan 67%.
3. **Data RFQ ([`/rfq`](http://localhost:3000/rfq))**:
   - Filter pencarian teks, filter status, filter sales PIC.
   - Form modal interaktif untuk menambah RFQ baru.
   - Tombol aksi *"Buat Quotation"* yang langsung membawa data RFQ ke formulir penawaran harga.
4. **Vendor Price ([`/vendor-price`](http://localhost:3000/vendor-price))**:
   - Tabel harga vendor per produk dengan tier kuantitas bertingkat dan MOQ.
   - Rincian COGS dasar, biaya sablon, dan total modal per unit.
   - Fitur simulasi impor data CSV / Excel.
5. **Formulir Rekomendasi Harga ([`/quotation/new`](http://localhost:3000/quotation/new))**:
   - Deteksi otomatis modal vendor (COGS) dan peringatan jika kuantitas di bawah batas MOQ.
   - Tombol *"Rekomendasikan Harga Jual"* yang memanggil microservice FastAPI (`http://localhost:8000/recommend`).
   - Menampilkan harga rekomendasi per unit, rentang batas bawah & atas (kuantil residual), 3 faktor penentu (SHAP), dan 3 transaksi historis terdekat.
   - **Guardrail Margin 67%**: Jika harga di-override di bawah target margin 67%, formulir otomatis mewajibkan sales mengisi alasan dan mengalihkan status ke `waiting_approval` (butuh persetujuan Manager).
   - Live timer tracking durasi pengerjaan (detik) untuk metrik riset skripsi.
6. **Data Quotation ([`/quotation`](http://localhost:3000/quotation))**:
   - Daftar seluruh dokumen penawaran harga dengan badge status berwarna, metode penentuan harga (AI vs Manual), dan durasi pengerjaan.
7. **Halaman Login ([`/login`](http://localhost:3000/login))**:
   - Antarmuka login dengan dukungan Supabase Auth dan tombol pintas 1-klik untuk berganti akun Sales, Manager, atau Admin.

---

## 2. Cara Menjalankan Frontend Secara Lokal

Buka terminal baru di folder `web`:
```powershell
cd web
npm run dev
```
Aplikasi web akan aktif dan dapat dibuka di browser: **`http://localhost:3000`**
*(Pastikan microservice FastAPI di terminal sebelumnya tetap berjalan di port 8000 agar tombol rekomendasi AI terhubung langsung).*
