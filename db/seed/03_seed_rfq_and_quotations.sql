-- ==============================================================================
-- SEED DATA 03: RFQ, QUOTATION, DAN ITEM EVALUASI (DURASI & OVERRIDE)
-- File: db/seed/03_seed_rfq_and_quotations.sql
-- ==============================================================================

-- 1. SEED RFQ (REQUEST FOR QUOTATION)
INSERT INTO public.rfqs (id, rfq_code, customer_id, sales_id, product_id, requested_qty, target_date, status, notes) VALUES
('f0000001-0000-0000-0000-000000000001', 'RFQ-2026-0801', 'c0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'd0000008-0000-0000-0000-000000000008', 4000, CURRENT_DATE + INTERVAL '14 days', 'processed', 'Kebutuhan packaging foodwrap untuk outlet baru cabang Senopati'),
('f0000002-0000-0000-0000-000000000002', 'RFQ-2026-0802', 'c0000002-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', 'd0000005-0000-0000-0000-000000000005', 1000, CURRENT_DATE + INTERVAL '21 days', 'processed', 'Paperbag handle coklat cetak logo 1 warna 1 sisi'),
('f0000003-0000-0000-0000-000000000003', 'RFQ-2026-0901', 'c0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000001', 5000, CURRENT_DATE + INTERVAL '10 days', 'processed', 'Satchel envelope putih polos untuk packaging pastry take-away'),
('f0000004-0000-0000-0000-000000000004', 'RFQ-2026-0902', 'c0000005-0000-0000-0000-000000000005', 'a0000004-0000-0000-0000-000000000004', 'd0000013-0000-0000-0000-000000000013', 800, CURRENT_DATE + INTERVAL '14 days', 'pending', 'Tas butik premium custom art carton tebal + laminasi doff'),
('f0000005-0000-0000-0000-000000000005', 'RFQ-2026-1001', 'c0000006-0000-0000-0000-000000000006', 'a0000005-0000-0000-0000-000000000005', 'd0000009-0000-0000-0000-000000000009', 6000, CURRENT_DATE + INTERVAL '14 days', 'pending', 'Foodwrap print 2 warna motif gingham hijau merah')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED QUOTATION
INSERT INTO public.quotations (id, quotation_code, rfq_id, customer_id, sales_id, status, total_amount, notes) VALUES
('10000001-0000-0000-0000-000000000001', 'QUO-2026-0801', 'f0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'approved', 1970400.00, 'Quotation disetujui klien, diproses ke Sales Order'),
('10000002-0000-0000-0000-000000000002', 'QUO-2026-0802', 'f0000002-0000-0000-0000-000000000002', 'c0000002-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000003', 'approved', 3757500.00, 'Harga sesuai rekomendasi AI, approval instan'),
('10000003-0000-0000-0000-000000000003', 'QUO-2026-0901', 'f0000003-0000-0000-0000-000000000003', 'c0000004-0000-0000-0000-000000000004', 'a0000004-0000-0000-0000-000000000004', 'waiting_approval', 1093850.00, 'Menunggu persetujuan manager karena margin ditawar di bawah 67%'),
('10000004-0000-0000-0000-000000000004', 'QUO-2026-1001', NULL, 'c0000007-0000-0000-0000-000000000007', 'a0000005-0000-0000-0000-000000000005', 'draft', 1640000.00, 'Draft penawaran kemasan roti artisan')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED QUOTATION ITEMS (DENGAN PELACAKAN METRIK EVALUASI SKRIPSI)
INSERT INTO public.quotation_items (
    id, quotation_id, product_id, vendor_price_id, qty, 
    vendor_cost, harga_rekomendasi, harga_rekomendasi_min, harga_rekomendasi_max, 
    harga_final, target_margin_pct, alasan_override, used_recommendation, 
    recommendation_factors, similar_cases, started_at, finished_at
) VALUES
-- Item 1: Memakai rekomendasi AI, pengerjaan cepat (68 detik), margin terpenuhi 67%
(
    '20000001-0000-0000-0000-000000000001',
    '10000001-0000-0000-0000-000000000001',
    'd0000008-0000-0000-0000-000000000008',
    NULL,
    4000,
    295.00,       -- COGS (210 + 85 print)
    492.60,       -- Rekomendasi ML
    470.00,
    515.00,
    492.60,       -- Sales menerima harga rekomendasi
    0.6700,
    NULL,
    true,
    '{"top_factors": [{"factor": "qty_tier", "impact": "negative", "desc": "Qty 4000 menurunkan per-unit overhead"}, {"factor": "custom_print", "impact": "positive", "desc": "Cetak 1 warna menaikkan margin kesiapan"}, {"factor": "category_foodwrap", "impact": "neutral", "desc": "Kategori fast-moving"}]}'::jsonb,
    '[{"code": "SO-2026-0210", "qty": 4000, "price": 490.00}, {"code": "SO-2026-0344", "qty": 5000, "price": 485.00}]'::jsonb,
    NOW() - INTERVAL '30 days 10 minutes',
    NOW() - INTERVAL '30 days 8 minutes 52 seconds'
),
-- Item 2: Memakai rekomendasi AI, durasi 75 detik, margin 67%
(
    '20000002-0000-0000-0000-000000000002',
    '10000002-0000-0000-0000-000000000002',
    'd0000005-0000-0000-0000-000000000005',
    NULL,
    1000,
    2250.00,      -- COGS (1950 + 300)
    3757.50,      -- Rekomendasi
    3600.00,
    3950.00,
    3757.50,
    0.6700,
    NULL,
    true,
    '{"top_factors": [{"factor": "sablon_1w1s", "impact": "positive", "desc": "Sablon 1 sisi memerlukan setup sablon"}, {"factor": "qty_1000", "impact": "positive", "desc": "Tier MOQ standar 1000 pcs"}]}'::jsonb,
    '[{"code": "SO-2026-0118", "qty": 1000, "price": 3750.00}]'::jsonb,
    NOW() - INTERVAL '25 days 15 minutes',
    NOW() - INTERVAL '25 days 13 minutes 45 seconds'
),
-- Item 3: Override manual di bawah batas minimum (margin hanya 45%), durasi lama (420 detik)
(
    '20000003-0000-0000-0000-000000000003',
    '10000003-0000-0000-0000-000000000003',
    'd0000001-0000-0000-0000-000000000001',
    NULL,
    5000,
    131.00,
    218.77,       -- Rekomendasi 67%
    205.00,
    230.00,
    189.00,       -- Sales sengaja menurunkan ke 189 (margin 44.27% < 67%)
    0.6700,
    'Klien strategis membuka 3 cabang baru sekaligus, meminta harga promosi volume besar.',
    false,
    NULL,
    NULL,
    NOW() - INTERVAL '10 days 20 minutes',
    NOW() - INTERVAL '10 days 13 minutes'
),
-- Item 4: Penentuan manual tanpa AI, durasi 310 detik, margin 68%
(
    '20000004-0000-0000-0000-000000000004',
    '10000004-0000-0000-0000-000000000004',
    'd0000010-0000-0000-0000-000000000010',
    NULL,
    2000,
    485.00,
    NULL,
    NULL,
    NULL,
    820.00,
    0.6700,
    NULL,
    false,
    NULL,
    NULL,
    NOW() - INTERVAL '2 days 5 minutes',
    NOW() - INTERVAL '2 days 0 minutes'
)
ON CONFLICT (id) DO NOTHING;
