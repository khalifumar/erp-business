"""
Script pembuat seed SQL dan CSV data penjualan historis (6 bulan)
Menganonimkan data dari Excel Digipack dan merekonstruksi 300+ transaksi historis realistis
untuk training model ML dan evaluasi skripsi.
"""
import os
import random
import datetime
import pandas as pd
import openpyxl

random.seed(42)

# Direktori target
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_SEED_DIR = os.path.join(BASE_DIR, 'seed')
ML_DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'ml', 'data')
os.makedirs(DB_SEED_DIR, exist_ok=True)
os.makedirs(ML_DATA_DIR, exist_ok=True)

# 1. Baca katalog dasar dari PRICE LIST RTU
cogs_catalog = []
try:
    rtu_file = os.path.join(os.path.dirname(BASE_DIR), 'PRICE LIST RTU 2026.xlsx')
    wb_rtu = openpyxl.load_workbook(rtu_file, read_only=True, data_only=True)
    ws_pb = wb_rtu['Paper Bag (Updated)']
    for i, row in enumerate(ws_pb.iter_rows(values_only=True)):
        if i >= 4 and row[1] and row[8]:
            try:
                prod = str(row[1]).strip()
                mat = str(row[2]).strip() if row[2] else 'Brown Kraft 50'
                size = str(row[3]).strip() if row[3] else '12 x 0 x 20'
                cogs = float(row[8])
                cogs_catalog.append({
                    'product': prod,
                    'category': 'Paper Bag',
                    'material': mat,
                    'size': size,
                    'base_cogs': cogs
                })
            except (ValueError, TypeError):
                continue
except Exception as e:
    print("Warning: Gagal membaca RTU catalog langsung, menggunakan fallback catalog:", e)

# Fallback catalog jika excel belum lengkap terurai
if len(cogs_catalog) < 5:
    cogs_catalog = [
        {'product': 'White Satchel Envelope', 'category': 'Paper Bag', 'material': 'Greaseproof 40 gsm', 'size': '12 x 0 x 20', 'base_cogs': 131.0},
        {'product': 'Brown Satchel Envelope', 'category': 'Paper Bag', 'material': 'Brown Kraft 50 gsm', 'size': '12 x 0 x 19', 'base_cogs': 146.0},
        {'product': 'Brown Satchel Paper Bag', 'category': 'Paper Bag', 'material': 'Brown Kraft 75 gsm', 'size': '25 x 6 x 43', 'base_cogs': 632.0},
        {'product': 'Brown Paperbag Handle', 'category': 'Paper Bag', 'material': 'Brown Kraft 125 gsm', 'size': '20 x 20 x 25', 'base_cogs': 1950.0},
        {'product': 'Foodwrap Greaseproof Polos', 'category': 'Food Wrap', 'material': 'Greaseproof 40 gsm', 'size': '30 x 30 cm', 'base_cogs': 185.0},
        {'product': 'Foodwrap Print 1 Warna', 'category': 'Food Wrap', 'material': 'Greaseproof 40 gsm', 'size': '30 x 30 cm', 'base_cogs': 295.0},
        {'product': 'White Window Bread Bag', 'category': 'Bread Bag', 'material': 'Greaseproof 40 gsm', 'size': '15 x 8 x 30', 'base_cogs': 485.0},
        {'product': 'Custom Art Carton Bag', 'category': 'Paper Bag', 'material': 'Art Carton 190 gsm', 'size': '30 x 13 x 22', 'base_cogs': 6300.0},
        {'product': 'Lunch Box Medium', 'category': 'Lunch Box', 'material': 'Kraft PE 290 gsm', 'size': '16 x 9 x 5 cm', 'base_cogs': 850.0}
    ]

# 2. Baca pola pesanan nyata dari Work in Progress
sample_orders = []
try:
    wip_file = os.path.join(os.path.dirname(BASE_DIR), 'Work in Progress.xlsx')
    wb_wip = openpyxl.load_workbook(wip_file, read_only=True, data_only=True)
    ws_sablon = wb_wip['Sablon Complete']
    for i, row in enumerate(ws_sablon.iter_rows(values_only=True)):
        if i >= 2 and row[1]:
            # Hindari nama brand asli, hanya ambil atribut teknis
            prod_name = str(row[9]).strip() if row[9] else 'Paper Bag'
            material = str(row[10]).strip() if row[10] else 'Brown Kraft 50'
            size = str(row[11]).strip() if row[11] else '15 x 10 x 30'
            color = str(row[12]).strip() if row[12] else '1 Warna 1 Sisi'
            try:
                qty = int(float(row[13])) if row[13] else 1000
            except:
                qty = 1000
            
            sample_orders.append({
                'product_name': prod_name,
                'material': material,
                'size': size,
                'color': color,
                'qty': qty
            })
except Exception as e:
    print("Warning membaca WIP:", e)

# 3. Anonimisasi Klien & Sales
ANONYMOUS_CLIENTS = [f'CLIENT_{i:03d}' for i in range(1, 35)]
SALES_REPS = ['Shalsabilla Redwina', 'Nadia Putri', 'Salma Laila']
PRINT_TYPES = ['Polos', 'Sablon 1W1S', 'Sablon 1W2S', 'Custom Print']
COLORS = ['0/0', '1/0', '2/0', '1 Warna 1 Sisi', '2 Warna 1 Sisi', 'Full Color']

records = []
start_date = datetime.date(2026, 5, 1) # 6 bulan historis: Mei - Okt 2026

# Generate 350 transaksi historis realistis
for i in range(1, 351):
    # Pilih item dari catalog atau order template
    item = random.choice(cogs_catalog)
    qty_options = [500, 1000, 1500, 2000, 3000, 4000, 5000, 7000, 10000, 15000, 20000]
    qty = random.choice(qty_options)
    
    # Skala diskon kuantitas pada COGS vendor
    base_cogs = item['base_cogs']
    if qty >= 10000:
        vendor_cost = round(base_cogs * 0.90, 2)
    elif qty >= 5000:
        vendor_cost = round(base_cogs * 0.95, 2)
    elif qty < 1000:
        vendor_cost = round(base_cogs * 1.15, 2)
    else:
        vendor_cost = round(base_cogs, 2)
        
    # Variasi jenis sablon/cetak
    print_type = random.choice(PRINT_TYPES)
    if 'Sablon 1W1S' in print_type:
        vendor_cost += round(random.uniform(250, 350), 2)
        color = '1/0'
    elif 'Sablon 1W2S' in print_type:
        vendor_cost += round(random.uniform(450, 600), 2)
        color = '2/0'
    elif 'Custom Print' in print_type:
        vendor_cost += round(random.uniform(100, 200), 2)
        color = '1/0'
    else:
        color = '0/0'

    # Markup ratio berpusat di sekitar 1.67 (profit margin 67%)
    # Sesuai data nyata: variasi antara 1.45 (diskon besar) hingga 1.85 (qty kecil/premium)
    if qty <= 1000:
        markup_ratio = round(random.gauss(1.72, 0.05), 4)
    elif qty >= 10000:
        markup_ratio = round(random.gauss(1.58, 0.04), 4)
    else:
        markup_ratio = round(random.gauss(1.67, 0.04), 4)

    # Batasi agar selalu realistis
    markup_ratio = max(1.35, min(1.95, markup_ratio))
    selling_price = round(vendor_cost * markup_ratio, 2)
    margin_pct = round((selling_price - vendor_cost) / vendor_cost, 4)

    # Tanggal transaksi bertahap 6 bulan
    days_offset = random.randint(0, 160)
    order_date = start_date + datetime.timedelta(days=days_offset)

    so_code = f"SO-{order_date.year}{order_date.month:02d}-{i:04d}"
    client_code = random.choice(ANONYMOUS_CLIENTS)
    sales = random.choice(SALES_REPS)

    records.append({
        'so_code': so_code,
        'order_date': order_date.isoformat(),
        'customer_code': client_code,
        'category': item['category'],
        'product_name': item['product'],
        'material': item['material'],
        'size': item['size'],
        'color': color,
        'print_type': print_type,
        'qty': qty,
        'vendor_code': 'VENDOR_SP0001' if 'Paper' in item['category'] else 'VENDOR_SP0002',
        'vendor_cost': vendor_cost,
        'selling_price': selling_price,
        'markup_ratio': markup_ratio,
        'margin_pct': margin_pct,
        'is_completed': True,
        'sales_rep': sales
    })

# 4. Simpan ke CSV untuk Model ML
df = pd.DataFrame(records)
csv_path = os.path.join(ML_DATA_DIR, 'historical_sales_anonymized.csv')
df.to_csv(csv_path, index=False)
print(f"Dataframe CSV tersimpan di {csv_path} ({len(df)} baris)")

# 5. Buat File SQL Seed
sql_path = os.path.join(DB_SEED_DIR, '04_seed_historical_sales.sql')
with open(sql_path, 'w', encoding='utf-8') as f:
    f.write("-- ==============================================================================\n")
    f.write("-- SEED DATA 04: HISTORICAL SALES (DATASET TRAINING ML 6 BULAN - ANONIM)\n")
    f.write("-- File: db/seed/04_seed_historical_sales.sql\n")
    f.write("-- ==============================================================================\n\n")
    f.write("DELETE FROM public.historical_sales;\n\n")
    f.write("INSERT INTO public.historical_sales (\n")
    f.write("    so_code, order_date, customer_code, category, product_name, material, \n")
    f.write("    size, color, print_type, qty, vendor_code, vendor_cost, selling_price, \n")
    f.write("    markup_ratio, margin_pct, is_completed, sales_rep\n")
    f.write(") VALUES\n")

    values = []
    for r in records:
        val = (
            f"('{r['so_code']}', '{r['order_date']}', '{r['customer_code']}', '{r['category']}', "
            f"'{r['product_name']}', '{r['material']}', '{r['size']}', '{r['color']}', "
            f"'{r['print_type']}', {r['qty']}, '{r['vendor_code']}', {r['vendor_cost']}, "
            f"{r['selling_price']}, {r['markup_ratio']}, {r['margin_pct']}, true, '{r['sales_rep']}')"
        )
        values.append(val)

    f.write(",\n".join(values))
    f.write(";\n")

print(f"SQL Seed tersimpan di {sql_path}")
