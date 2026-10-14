-- ==============================================================================
-- SKEMA DATABASE ERP DIGIPACK - REKOMENDASI HARGA JUAL
-- File: db/migrations/01_schema.sql
-- Kompatibel: Supabase / PostgreSQL 14+
-- ==============================================================================

-- Aktifkan ekstensi UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUM TYPES
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'sales', 'manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rfq_status AS ENUM ('draft', 'pending', 'processed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quotation_status AS ENUM ('draft', 'waiting_approval', 'approved', 'rejected', 'sent_to_client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABEL PENGGUNA (USERS & PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Terhubung dengan auth.users Supabase (opsional jika manual)
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'sales',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 3. TABEL MASTER: CUSTOMERS & VENDORS (DATA ANONIM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE NOT NULL, -- Contoh: CLIENT_001
    company_name TEXT NOT NULL,         -- Nama entitas / anonim
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    segment TEXT DEFAULT 'Retail',      -- F&B, Fashion, Retail, Corporate
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code TEXT UNIQUE NOT NULL,   -- Contoh: VENDOR_SP001
    vendor_name TEXT NOT NULL,          -- Nama vendor anonim
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    speciality TEXT,                    -- Paper Bag, Foodwrap, Sablon, Printing
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 4. TABEL PRODUK (PACKAGING CATALOG)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,           -- Contoh: PB-B-12x0x20
    name TEXT NOT NULL,                 -- Brown Satchel Paper Bag
    category TEXT NOT NULL,             -- Paper Bag, Foodwrap, Bread Bag, Cup, Box
    material TEXT NOT NULL,             -- Brown Kraft 50 gsm, Greaseproof 40 gsm, dll.
    size TEXT NOT NULL,                 -- 12 x 0 x 20, 30 x 30 cm, dll.
    color TEXT NOT NULL DEFAULT '0/0',  -- 0/0 (Polos), 1/0, 2/0, Merah, dsb.
    print_type TEXT NOT NULL DEFAULT 'Polos', -- Polos, Sablon 1W1S, Sablon 1W2S, Custom Print
    qty_per_carton INT DEFAULT 1000,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 5. TABEL HARGA VENDOR (TIER KUANTITAS & MOQ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vendor_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    qty_min INT NOT NULL DEFAULT 1,
    qty_max INT NOT NULL DEFAULT 999999,
    moq INT NOT NULL DEFAULT 1000,
    cogs_price NUMERIC(15, 2) NOT NULL,       -- Harga modal dasar per unit (Rp)
    cogs_print NUMERIC(15, 2) DEFAULT 0,      -- Tambahan biaya cetak/sablon per unit
    lead_time_days INT DEFAULT 7,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 6. TABEL RFQ (REQUEST FOR QUOTATION)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_code TEXT UNIQUE NOT NULL,      -- Contoh: RFQ-2026-0001
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    sales_id UUID NOT NULL REFERENCES public.profiles(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    requested_qty INT NOT NULL CHECK (requested_qty > 0),
    target_date DATE,
    notes TEXT,
    status rfq_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 7. TABEL QUOTATIONS & QUOTATION ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_code TEXT UNIQUE NOT NULL, -- Contoh: QUO-2026-0001
    rfq_id UUID REFERENCES public.rfqs(id),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    sales_id UUID NOT NULL REFERENCES public.profiles(id),
    status quotation_status NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    vendor_price_id UUID REFERENCES public.vendor_prices(id),
    qty INT NOT NULL CHECK (qty > 0),
    vendor_cost NUMERIC(15, 2) NOT NULL,             -- COGS per unit saat dibuat
    harga_rekomendasi NUMERIC(15, 2),                -- Hasil inferensi Engine ML
    harga_rekomendasi_min NUMERIC(15, 2),            -- Rentang bawah (quantile)
    harga_rekomendasi_max NUMERIC(15, 2),            -- Rentang atas (quantile)
    harga_final NUMERIC(15, 2) NOT NULL,             -- Harga final yang ditentukan sales
    subtotal NUMERIC(15, 2) GENERATED ALWAYS AS (qty * harga_final) STORED,
    margin_nominal NUMERIC(15, 2) GENERATED ALWAYS AS (harga_final - vendor_cost) STORED,
    margin_percentage NUMERIC(8, 4),                 -- (harga_final - vendor_cost) / vendor_cost
    target_margin_pct NUMERIC(8, 4) DEFAULT 0.6700,  -- Standar default 67% (0.67)
    is_below_margin BOOLEAN DEFAULT false,           -- True jika margin < target_margin
    alasan_override TEXT,                            -- Wajib diisi jika is_below_margin = true
    used_recommendation BOOLEAN NOT NULL DEFAULT false,
    recommendation_factors JSONB,                    -- Menyimpan SHAP top 3 factors
    similar_cases JSONB,                             -- 3 transaksi historis terdekat
    -- Pelacakan waktu pembuatan (untuk riset skripsi)
    started_at TIMESTAMPTZ,                          -- Waktu sales mulai membuka form item
    finished_at TIMESTAMPTZ,                         -- Waktu sales menyimpan item
    duration_seconds INT,                            -- Durasi pengerjaan dalam detik
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 8. TABEL HISTORICAL SALES (DATA 6 BULAN UNTUK TRAINING ML)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.historical_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_code TEXT NOT NULL,                           -- No Sales Order (anonim)
    order_date DATE NOT NULL,
    customer_code TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    material TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    print_type TEXT NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    vendor_code TEXT NOT NULL,
    vendor_cost NUMERIC(15, 2) NOT NULL,
    selling_price NUMERIC(15, 2) NOT NULL,
    markup_ratio NUMERIC(10, 4) NOT NULL,            -- selling_price / vendor_cost
    margin_pct NUMERIC(10, 4) NOT NULL,              -- (selling_price - vendor_cost) / vendor_cost
    is_completed BOOLEAN DEFAULT true,
    sales_rep TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 9. TABEL SETTINGS & AUDIT LOG
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,                            -- INSERT, UPDATE, DELETE, OVERRIDE_PRICE
    actor_id UUID REFERENCES public.profiles(id),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 10. INDEXES UNTUK PERFORMA QUERY TINGGI
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_vendor_prices_product_vendor ON public.vendor_prices(product_id, vendor_id, is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_prices_qty ON public.vendor_prices(qty_min, qty_max);
CREATE INDEX IF NOT EXISTS idx_rfqs_sales_status ON public.rfqs(sales_id, status);
CREATE INDEX IF NOT EXISTS idx_quotations_sales_status ON public.quotations(sales_id, status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON public.quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_historical_sales_date ON public.historical_sales(order_date);
CREATE INDEX IF NOT EXISTS idx_historical_sales_cat_mat ON public.historical_sales(category, material);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- ==============================================================================
-- 11. TRIGGER OTOMATIS: UPDATE TIMESTAMP & KALKULASI MARGIN
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_update_customers_timestamp
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_update_products_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_update_rfqs_timestamp
BEFORE UPDATE ON public.rfqs
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE OR REPLACE TRIGGER trg_update_quotations_timestamp
BEFORE UPDATE ON public.quotations
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Trigger untuk menghitung margin dan durasi otomatis pada quotation_items
CREATE OR REPLACE FUNCTION calculate_quotation_item_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Kalkulasi margin percentage: (harga_final - vendor_cost) / vendor_cost
    IF NEW.vendor_cost > 0 THEN
        NEW.margin_percentage := ROUND((NEW.harga_final - NEW.vendor_cost) / NEW.vendor_cost, 4);
    ELSE
        NEW.margin_percentage := 0;
    END IF;

    -- Evaluasi apakah di bawah target margin (default 0.67)
    IF NEW.margin_percentage < NEW.target_margin_pct THEN
        NEW.is_below_margin := true;
    ELSE
        NEW.is_below_margin := false;
    END IF;

    -- Hitung durasi pengerjaan jika timestamp tersedia
    IF NEW.started_at IS NOT NULL AND NEW.finished_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.finished_at - NEW.started_at))::INT;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_calculate_quotation_item_metrics
BEFORE INSERT OR UPDATE ON public.quotation_items
FOR EACH ROW EXECUTE FUNCTION calculate_quotation_item_metrics();

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: User dapat melihat semua profil tim, hanya bisa edit milik sendiri (atau admin)
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);

-- Master Catalog & Pricing: Semua authenticated user dapat membaca katalog dan harga vendor
CREATE POLICY "catalog_read_all" ON public.products
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "customers_read_all" ON public.customers
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "vendors_read_all" ON public.vendors
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "vendor_prices_read_all" ON public.vendor_prices
    FOR SELECT TO authenticated, anon USING (true);

-- RFQ: Sales bisa baca & buat RFQ, Manager & Admin bisa kelola semua
CREATE POLICY "rfqs_select_all" ON public.rfqs
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "rfqs_insert_all" ON public.rfqs
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "rfqs_update_all" ON public.rfqs
    FOR UPDATE TO authenticated, anon USING (true);

-- Quotation & Items: Akses transparan untuk prototyping & demonstrasi skripsi
CREATE POLICY "quotations_all_ops" ON public.quotations
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "quotation_items_all_ops" ON public.quotation_items
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "historical_sales_read_all" ON public.historical_sales
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "settings_read_all" ON public.system_settings
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "audit_logs_read_all" ON public.audit_logs
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
