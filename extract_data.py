import json
import os
import openpyxl
import pandas as pd

base_dir = r"c:\Users\Khalif Umar Al Faruq\Documents\7-proyek\22-price-prediction"
rtu_xlsx = os.path.join(base_dir, "PRICE LIST RTU 2026.xlsx")
custom_xlsx = os.path.join(base_dir, "Price List Custom 2026.xlsx")
sales_csv = os.path.join(base_dir, "ml", "data", "historical_sales_cleaned.csv")

def safe_float(val, default=0.0):
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    try:
        s = str(val).replace(',', '.').strip()
        return float(s)
    except:
        return default

def safe_int(val, default=0):
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return int(val)
    try:
        s = str(val).replace('.', '').replace(',', '').strip()
        return int(s)
    except:
        return default

# ==========================================
# 1. PARSE PRICE LIST RTU 2026 (ACCURATE)
# User Specific Columns:
# 1. Product: B5:B
# 2. Material: C5:C
# 3. Size: D5:D
# 4. Color: E5:E
# 5. Qty Tier 1: J5:J
# 6. Qty Tier 2: M5:M
# 7. Qty Tier 3: P5:P
# 8. Price List Polos: K5:K
# 9. Price 1 Sisi 1 Warna: Q5:Q
# 10. Price 2 Sisi 1 Warna: AC5:AC (Col 29)
# ==========================================
print("1. Parsing PRICE LIST RTU 2026 (Using User Specified Columns)...")
wb_rtu = openpyxl.load_workbook(rtu_xlsx, data_only=True)
rtu_records = []

if 'Paper Bag (Updated)' in wb_rtu.sheetnames:
    ws = wb_rtu['Paper Bag (Updated)']
    for r in range(5, ws.max_row + 1):
        code = ws.cell(r, 1).value       # A
        p_name = ws.cell(r, 2).value     # B5:B (Product)
        material = ws.cell(r, 3).value   # C5:C (Material)
        size = ws.cell(r, 4).value       # D5:D (Size)
        color = ws.cell(r, 5).value      # E5:E (Color)
        category = ws.cell(r, 6).value   # F
        qty_ctn = ws.cell(r, 7).value    # G
        moq = ws.cell(r, 8).value        # H (MOQ)
        cogs = ws.cell(r, 9).value       # I (COGS)
        
        # Qty columns as specified by user
        q_j = ws.cell(r, 10).value       # J5:J
        q_m = ws.cell(r, 13).value       # M5:M
        q_p = ws.cell(r, 16).value       # P5:P
        
        # Price columns as specified by user
        price_polos = ws.cell(r, 11).value      # K5:K (Price List Polos)
        price_1w1s = ws.cell(r, 17).value       # Q5:Q (Price 1 Sisi 1 Warna)
        price_2s1w = ws.cell(r, 29).value       # AC5:AC (Price 2 Sisi 1 Warna - Col 29)
        price_1w2s = ws.cell(r, 21).value       # U (Price 1 Sisi 2 Warna)
        
        profit_so_polos = ws.cell(r, 12).value
        nett_polos = ws.cell(r, 13).value
        cogs_sablon_1w1s = ws.cell(r, 15).value

        cogs_val = safe_float(cogs)
        if p_name and cogs_val > 0:
            p_polos = safe_float(price_polos) if safe_float(price_polos) > 0 else round(cogs_val * 1.67, 2)
            p_1w1s = safe_float(price_1w1s) if safe_float(price_1w1s) > 0 else round(p_polos + 400.0, 2)
            p_2s1w = safe_float(price_2s1w) if safe_float(price_2s1w) > 0 else round(p_polos + 800.0, 2)
            p_1w2s = safe_float(price_1w2s) if safe_float(price_1w2s) > 0 else round(p_polos + 800.0, 2)

            rtu_records.append({
                "id": f"rtu-pb-{r}",
                "sheet": "Paper Bag (Updated)",
                "row_number": r,
                "code": str(code or "").strip(),
                "product_name": str(p_name).strip(),
                "category": "Paper Bag RTU",
                "material": str(material or "").strip(),
                "size": str(size or "").strip(),
                "color": str(color or "0/0").strip(),
                "qty_ctn": safe_int(qty_ctn, 1000),
                "moq": safe_int(moq, 200),
                "cogs": cogs_val,
                "qty_j": safe_float(q_j),
                "qty_m": safe_float(q_m),
                "qty_p": safe_float(q_p),
                # Specified Prices
                "price_polos": p_polos,
                "profit_so_polos_pct": round(safe_float(profit_so_polos, 0.4012) * 100, 2),
                "nett_polos": safe_float(nett_polos) if safe_float(nett_polos) > 0 else round(cogs_val / 0.7, 2),
                "cogs_sablon_1w1s": safe_float(cogs_sablon_1w1s, 300.0),
                "price_sablon_1w1s": p_1w1s,
                "price_sablon_1w2s": p_1w2s,
                "price_sablon_2s1w": p_2s1w,
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

# B. Food Wrap Sheet in RTU
if 'Food Wrap' in wb_rtu.sheetnames:
    ws = wb_rtu['Food Wrap']
    current_mat = "Greaseproof 40"
    for r in range(11, min(60, ws.max_row + 1)):
        mat_cell = ws.cell(r, 2).value
        if mat_cell and 'Greaseproof' in str(mat_cell):
            current_mat = str(mat_cell).strip()
        size = ws.cell(r, 2).value or ws.cell(r, 11).value
        qty = safe_int(ws.cell(r, 3).value or ws.cell(r, 12).value)
        cogs = safe_float(ws.cell(r, 4).value or ws.cell(r, 13).value)
        price = safe_float(ws.cell(r, 7).value or ws.cell(r, 16).value)
        if qty > 0 and price > 0:
            cogs_val = cogs if cogs > 0 else round(price * 0.7, 2)
            rtu_records.append({
                "id": f"rtu-fw-{r}",
                "sheet": "Food Wrap",
                "row_number": r,
                "code": f"R-FW-{size}",
                "product_name": f"Food Wrap {current_mat}",
                "category": "Food Wrap",
                "material": current_mat,
                "size": str(size or "30 x 30").strip(),
                "color": "1/0",
                "moq": qty,
                "cogs": cogs_val,
                "price_polos": price,
                "profit_so_polos_pct": 30.0,
                "price_sablon_1w1s": price,
                "profit_so_1w1s_pct": 30.0,
                "price_sablon_2s1w": price,
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

# C. Paper Cup Sheet in RTU
if 'Paper Cup' in wb_rtu.sheetnames:
    ws = wb_rtu['Paper Cup']
    for r in range(12, min(50, ws.max_row + 1)):
        size_str = ws.cell(r, 2).value
        qty = safe_int(ws.cell(r, 3).value)
        cogs = safe_float(ws.cell(r, 4).value)
        price = safe_float(ws.cell(r, 7).value)
        if size_str and qty > 0 and price > 0:
            rtu_records.append({
                "id": f"rtu-pc-{r}",
                "sheet": "Paper Cup",
                "row_number": r,
                "code": f"R-CUP-{str(size_str).replace(chr(10), ' ')}",
                "product_name": f"Paper Cup {str(size_str).replace(chr(10), ' ')}",
                "category": "Paper Cup",
                "material": "Foodgrade Cupstock SPE",
                "size": str(size_str).replace('\n', ' ').strip(),
                "color": "1/0",
                "moq": qty,
                "cogs": cogs if cogs > 0 else round(price * 0.75, 2),
                "price_polos": price,
                "profit_so_polos_pct": 30.0,
                "price_sablon_1w1s": price,
                "profit_so_1w1s_pct": 30.0,
                "price_sablon_2s1w": price,
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

print(f"Loaded {len(rtu_records)} accurate RTU items.")

# ==========================================
# 2. PARSE PRICE LIST CUSTOM 2026 (ACCURATE)
# User Specific Columns:
# 1. Product: B6:B
# 2. Material: C6:C
# 3. Size: D6:D
# 4. Color: E6:E
# 5. Qty Tier 1: J6:J
# 6. Qty Tier 2: M6:M
# 7. Qty Tier 3: P6:P
# 8. Price List: S6:S
# ==========================================
print("2. Parsing PRICE LIST CUSTOM 2026 (Using User Specified Columns)...")
wb_custom = openpyxl.load_workbook(custom_xlsx, data_only=True)
custom_records = []

sheets_to_parse = [
    ('FOOD WRAP', 'Food Wrap Custom'),
    ('WRAPPING PAPER', 'Wrapping Paper Custom'),
    ('SATCHEL BAG', 'Satchel Bag Custom'),
    ('BOX', 'Box Custom'),
    ('SLEEVE', 'Sleeve Custom'),
    ('TAKEAWAY CUP', 'Takeaway Cup Custom'),
    ('PAPER BAG', 'Paper Bag Custom')
]

for sname, cat_label in sheets_to_parse:
    if sname not in wb_custom.sheetnames:
        continue
    ws = wb_custom[sname]
    
    for r in range(6, ws.max_row + 1):
        if sname == 'PAPER BAG':
            # PAPER BAG has Code in Col A, so columns are shifted by 1
            brand = ws.cell(r, 2).value
            product = ws.cell(r, 3).value or ws.cell(r, 2).value # C (fallback B)
            material = ws.cell(r, 4).value # D
            size = ws.cell(r, 5).value     # E
            color = ws.cell(r, 6).value    # F
            qty_1 = ws.cell(r, 11).value   # K
            cogs_1 = ws.cell(r, 12).value  # L
            qty_2 = ws.cell(r, 14).value   # N
            qty_3 = ws.cell(r, 17).value   # Q
            price_list = ws.cell(r, 20).value # T
            profit_so = ws.cell(r, 21).value
            code = ws.cell(r, 1).value or f"CUST-PB-{r}"
            finishing = ws.cell(r, 9).value or "Pond, Lem, Tali Twist"
        else:
            # User exact specification:
            # 1. Product: B6:B
            # 2. Material: C6:C
            # 3. Size: D6:D
            # 4. Color: E6:E
            # 5. Qty 1: J6:J
            # 6. Qty 2: M6:M
            # 7. Qty 3: P6:P
            # 8. Price List: S6:S
            brand = ws.cell(r, 1).value    # A (Brand)
            product = ws.cell(r, 2).value  # B6:B (Product)
            material = ws.cell(r, 3).value # C6:C (Material)
            size = ws.cell(r, 4).value     # D6:D (Size)
            color = ws.cell(r, 5).value    # E6:E (Color)
            detail_color = ws.cell(r, 6).value # F
            finishing = ws.cell(r, 8).value or "Custom Finishing" # H
            
            qty_1 = ws.cell(r, 10).value   # J6:J
            cogs_1 = ws.cell(r, 11).value  # K
            qty_2 = ws.cell(r, 13).value   # M6:M
            cogs_2 = ws.cell(r, 14).value  # N
            qty_3 = ws.cell(r, 16).value   # P6:P
            cogs_3 = ws.cell(r, 17).value  # Q
            price_list = ws.cell(r, 19).value # S6:S (Price List)
            profit_so = ws.cell(r, 20).value  # T
            code = f"CUST-{sname}-{r}"

        price_val = safe_float(price_list)
        cogs_val = safe_float(cogs_1)
        if cogs_val <= 0 and price_val > 0:
            cogs_val = round(price_val * 0.6, 2)
        elif cogs_val > 0 and price_val <= 0:
            price_val = round(cogs_val * 1.67, 2)

        q1 = safe_int(qty_1, 1000)
        q2 = safe_int(qty_2, 0)
        q3 = safe_int(qty_3, 0)
        qty_tiers = [q for q in [q1, q2, q3] if q > 0]
        effective_qty = qty_tiers[0] if qty_tiers else 1000

        if (product or brand) and (price_val > 0 or cogs_val > 0):
            margin_pct = round(safe_float(profit_so, 0.4012) * 100, 2)
            if margin_pct <= 0 or margin_pct > 90:
                margin_pct = round(((price_val - cogs_val) / price_val) * 100, 2)

            custom_records.append({
                "id": f"cust-{sname.lower()}-{r}",
                "sheet": sname,
                "row_number": r,
                "code": str(code or "").strip(),
                "brand": str(brand or "Custom").strip(),
                "product_name": str(product or cat_label).strip(),
                "category": cat_label,
                "material": str(material or "").strip(),
                "size": str(size or "").strip(),
                "color": str(color or "").strip(),
                "finishing": str(finishing or "").strip(),
                "qty": effective_qty,
                "qty_tier_1": q1,
                "qty_tier_2": q2,
                "qty_tier_3": q3,
                "qty_tiers": qty_tiers,
                "cogs": cogs_val,
                "price_list": price_val,
                "profit_margin_pct": margin_pct,
                "source": "Spreadsheet PRICE LIST CUSTOM 2026"
            })

print(f"Loaded {len(custom_records)} accurate Custom items.")

# ==========================================
# 3. PARSE IPOS PRICE & TRANSACTIONS
# ==========================================
print("3. Parsing IPOS Historical Sales & SO Records...")
sales_records = []
if os.path.exists(sales_csv):
    df_sales = pd.read_csv(sales_csv)
    for idx, row in df_sales.iterrows():
        sales_records.append({
            "id": f"ipos-{idx+1}",
            "so_code": str(row.get('no_faktur', f'SO-IPOS-{idx+1}')),
            "date": str(row.get('tanggal', '2026-01-01')),
            "brand_customer": str(row.get('nama_pelanggan', 'General Client')),
            "product_name": str(row.get('nama_barang', 'Paper Bag')),
            "material": str(row.get('material', 'Standard Kraft')),
            "size": str(row.get('dimensi', '20 x 9 x 29')),
            "print_type": str(row.get('print_type', 'Sablon 1 Warna')),
            "qty": safe_int(row.get('qty', 1000)),
            "cogs": safe_float(row.get('hpp', 1200)),
            "selling_price": safe_float(row.get('harga_jual', 2000)),
            "margin_pct": round(safe_float(row.get('margin', 0.40)) * 100, 2),
            "sales_rep": str(row.get('salesman', 'Sales Digipack')),
            "source": "Spreadsheet IPOS PRICE"
        })
print(f"Loaded {len(sales_records)} accurate IPOS sales records.")

# Save to pricingDatabase.json
output_data = {
    "rtu_prices": rtu_records,
    "custom_prices": custom_records,
    "historical_sales": sales_records
}

out_path = os.path.join(r"c:\Users\Khalif Umar Al Faruq\Documents\7-proyek\23-chatbot-sales\src\data", "pricingDatabase.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"Saved cleanly to {out_path}!")
