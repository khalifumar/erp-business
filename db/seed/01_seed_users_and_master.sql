-- ==============================================================================
-- SEED DATA 01: PROFILES, CUSTOMERS, VENDORS, PRODUCTS, SETTINGS
-- File: db/seed/01_seed_users_and_master.sql
-- ==============================================================================

-- 1. PENGGUNA SISTEM (PROFILES DENGAN ROLE SALES, MANAGER, ADMIN)
INSERT INTO public.profiles (id, email, full_name, role, phone) VALUES
('a0000001-0000-0000-0000-000000000001', 'admin@digipack.id', 'Admin Operasional', 'admin', '081200000001'),
('a0000002-0000-0000-0000-000000000002', 'manager@digipack.id', 'Budi Santoso (Sales Manager)', 'manager', '081200000002'),
('a0000003-0000-0000-0000-000000000003', 'shalsabilla@digipack.id', 'Shalsabilla Redwina', 'sales', '081200000003'),
('a0000004-0000-0000-0000-000000000004', 'nadia@digipack.id', 'Nadia Putri', 'sales', '081200000004'),
('a0000005-0000-0000-0000-000000000005', 'salma@digipack.id', 'Salma Laila', 'sales', '081200000005')
ON CONFLICT (id) DO NOTHING;

-- 2. MASTER CUSTOMER ANONIM (KLIEN SKRIPSI)
INSERT INTO public.customers (id, customer_code, company_name, contact_person, email, phone, segment) VALUES
('c0000001-0000-0000-0000-000000000001', 'CLIENT_001', 'Monday Breakfast Club', 'Kurniawan', 'procurement@client001.id', '0811100001', 'F&B Cafe'),
('c0000002-0000-0000-0000-000000000002', 'CLIENT_002', 'Noku Bakeshop', 'Yasmeen A.', 'order@client002.id', '0811100002', 'Bakery'),
('c0000003-0000-0000-0000-000000000003', 'CLIENT_003', 'Chindolondo Official', 'Reza F.', 'ops@client003.id', '0811100003', 'Beverage'),
('c0000004-0000-0000-0000-000000000004', 'CLIENT_004', 'Ugiro Coffee Roastery', 'Aditya S.', 'aditya@client004.id', '0811100004', 'Coffee Shop'),
('c0000005-0000-0000-0000-000000000005', 'CLIENT_005', 'Stahl Arbeit Apparel', 'Hendra W.', 'hendra@client005.id', '0811100005', 'Fashion Retail'),
('c0000006-0000-0000-0000-000000000006', 'CLIENT_006', 'Sky Pasta House', 'Bella V.', 'bella@client006.id', '0811100006', 'Resto & Diners'),
('c0000007-0000-0000-0000-000000000007', 'CLIENT_007', 'Bakkershuis Artisan Bread', 'David T.', 'david@client007.id', '0811100007', 'Bakery'),
('c0000008-0000-0000-0000-000000000008', 'CLIENT_008', 'Kukikoe Pastry & Cookies', 'Sarah L.', 'sarah@client008.id', '0811100008', 'Gourmet Treats')
ON CONFLICT (id) DO NOTHING;

-- 3. MASTER VENDOR ANONIM (SP0001, SP0002, SP0003 DARI DATA DIGIPACK)
INSERT INTO public.vendors (id, vendor_code, vendor_name, contact_person, email, speciality) VALUES
('b0000001-0000-0000-0000-000000000001', 'VENDOR_SP0001', 'Mitra Kemasan Utama (SP0001)', 'Handoko', 'sales@sp0001.co.id', 'RTU & Satchel Paper Bag'),
('b0000002-0000-0000-0000-000000000002', 'VENDOR_SP0002', 'Kreasi Cipta Karton (SP0002)', 'Agus Setiawan', 'cs@sp0002.co.id', 'Custom Box & Hardbox'),
('b0000003-0000-0000-0000-000000000003', 'VENDOR_SP0003', 'Solusi Grafika & Sablon (SP0003)', 'Rudi Hartono', 'rudi@sp0003.co.id', 'Sablon & Printing Finishing')
ON CONFLICT (id) DO NOTHING;

-- 4. MASTER PRODUK PACKAGING (BERDASARKAN KATALOG DIGIPACK)
INSERT INTO public.products (id, sku, name, category, material, size, color, print_type, qty_per_carton) VALUES
-- Paper Bag RTU & Satchel
('d0000001-0000-0000-0000-000000000001', 'R-TP-ESB-W-12x0x20', 'White Satchel Envelope', 'Paper Bag', 'Greaseproof 40 gsm', '12 x 0 x 20', '0/0', 'Polos', 5000),
('d0000002-0000-0000-0000-000000000002', 'R-TP-ESB-B-12x0x19', 'Brown Satchel Envelope', 'Paper Bag', 'Brown Kraft 50 gsm', '12 x 0 x 19', '0/0', 'Polos', 5000),
('d0000003-0000-0000-0000-000000000003', 'R-TP-ESB-B-10x0x22', 'Brown Satchel Envelope Small', 'Paper Bag', 'Brown Kraft 50 gsm', '10 x 0 x 22', '0/0', 'Polos', 2500),
('d0000004-0000-0000-0000-000000000004', 'R-TP-PB-B-25x6x43', 'Brown Satchel Paper Bag Gusset', 'Paper Bag', 'Brown Kraft 75 gsm', '25 x 6 x 43', '0/0', 'Polos', 700),
('d0000005-0000-0000-0000-000000000005', 'R-PB-HND-B-20x20x25-1W1S', 'Brown Paperbag Handle Sablon 1W1S', 'Paper Bag', 'Brown Kraft 125 gsm', '20 x 20 x 25', '1/0', 'Sablon 1W1S', 1000),
('d0000006-0000-0000-0000-000000000006', 'R-PB-HND-B-20x20x25-1W2S', 'Brown Paperbag Handle Sablon 1W2S', 'Paper Bag', 'Brown Kraft 125 gsm', '20 x 20 x 25', '1/0', 'Sablon 1W2S', 1000),
-- Foodwrap
('d0000007-0000-0000-0000-000000000007', 'FW-GP-30x30-POLOS', 'Foodwrap Greaseproof Polos', 'Food Wrap', 'Greaseproof 40 gsm', '30 x 30 cm', '0/0', 'Polos', 3000),
('d0000008-0000-0000-0000-000000000008', 'FW-GP-30x30-PRINT1W', 'Foodwrap Greaseproof Print 1 Warna', 'Food Wrap', 'Greaseproof 40 gsm', '30 x 30 cm', '1/0', 'Custom Print', 3000),
('d0000009-0000-0000-0000-000000000009', 'FW-GP-20x20-PRINT2W', 'Foodwrap Greaseproof Print 2 Warna', 'Food Wrap', 'Greaseproof 40 gsm', '20 x 20 cm', '2/0', 'Custom Print', 3000),
-- Bread Bag & Window Satchel
('d0000010-0000-0000-0000-000000000010', 'BB-WIN-W-15x30', 'White Window Bread Bag', 'Bread Bag', 'Greaseproof 40 gsm + OPP Window', '15 x 8 x 30', '0/0', 'Polos', 2000),
('d0000011-0000-0000-0000-000000000011', 'BB-WIN-B-15x30-1W1S', 'Brown Window Bread Bag Sablon', 'Bread Bag', 'Brown Kraft 50 gsm + OPP Window', '15 x 8 x 30', '1/0', 'Sablon 1W1S', 2000),
-- Box & Art Carton
('d0000012-0000-0000-0000-000000000012', 'BX-LBX-BRN-M-POLOS', 'Lunch Box Kraft Medium', 'Lunch Box', 'Kraft PE 290 gsm', '16 x 9 x 5 cm', '0/0', 'Polos', 1000),
('d0000013-0000-0000-0000-000000000013', 'BX-ART-30x13x22-2W', 'Custom Art Carton Bag 190gsm', 'Paper Bag', 'Art Carton 190 gsm', '30 x 13 x 22', '2/0', 'Custom Print', 1000)
ON CONFLICT (id) DO NOTHING;

-- 5. SYSTEM SETTINGS
INSERT INTO public.system_settings (id, key, value, description) VALUES
('e0000001-0000-0000-0000-000000000001', 'pricing_guardrails', 
 '{
   "min_margin_percentage": 0.67,
   "require_manager_approval_if_below": true,
   "allow_custom_margin_override": true,
   "warning_threshold_moq": true
 }'::jsonb, 
 'Kebijakan batas margin minimum standar 67% dan aturan persetujuan quotation.'),
('e0000002-0000-0000-0000-000000000002', 'ml_service_config',
 '{
   "service_endpoint": "http://127.0.0.1:8000/recommend",
   "fallback_method": "category_tier_baseline",
   "model_version": "v1.0.0",
   "confidence_interval": 0.80
 }'::jsonb,
 'Konfigurasi koneksi ke Microservice Engine ML FastAPI.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
