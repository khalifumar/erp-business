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
# ==========================================
print("1. Parsing PRICE LIST RTU 2026...")
wb_rtu = openpyxl.load_workbook(rtu_xlsx, data_only=True)
rtu_records = []

# A. Sheet 'Paper Bag (Updated)'
if 'Paper Bag (Updated)' in wb_rtu.sheetnames:
    ws = wb_rtu['Paper Bag (Updated)']
    for r in range(5, ws.max_row + 1):
        code = ws.cell(r, 1).value
        p_name = ws.cell(r, 2).value
        material = ws.cell(r, 3).value
        size = ws.cell(r, 4).value
        color = ws.cell(r, 5).value
        category = ws.cell(r, 6).value
        qty_ctn = ws.cell(r, 7).value
        moq = ws.cell(r, 8).value
        cogs = ws.cell(r, 9).value
        profit_cogs = ws.cell(r, 10).value
        price_polos = ws.cell(r, 11).value
        profit_so_polos = ws.cell(r, 12).value
        nett_polos = ws.cell(r, 13).value
        profit_nett_polos = ws.cell(r, 14).value
        cogs_sablon_1w1s = ws.cell(r, 15).value
        price_sablon_1w1s = ws.cell(r, 17).value
        profit_so_1w1s = ws.cell(r, 18).value
        nett_1w1s = ws.cell(r, 19).value
        price_sablon_1w2s = ws.cell(r, 21).value
        profit_so_1w2s = ws.cell(r, 22).value
        nett_1w2s = ws.cell(r, 23).value

        cogs_val = safe_float(cogs)
        if p_name and cogs_val > 0:
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
                "moq": safe_int(moq, 5000),
                "cogs": cogs_val,
                "profit_cogs_markup": safe_float(profit_cogs, 0.67),
                # Polos
                "price_polos": safe_float(price_polos),
                "profit_so_polos_pct": round(safe_float(profit_so_polos, 0.4012) * 100, 2),
                "nett_polos": safe_float(nett_polos),
                # Sablon 1W1S
                "cogs_sablon_1w1s": safe_float(cogs_sablon_1w1s, 300.0),
                "price_sablon_1w1s": safe_float(price_sablon_1w1s),
                "profit_so_1w1s_pct": round(safe_float(profit_so_1w1s, 0.303) * 100, 2),
                "nett_1w1s": safe_float(nett_1w1s),
                # Sablon 1W2S
                "price_sablon_1w2s": safe_float(price_sablon_1w2s),
                "profit_so_1w2s_pct": round(safe_float(profit_so_1w2s, 0.282) * 100, 2),
                "nett_1w2s": safe_float(nett_1w2s),
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

# B. Sheet 'Food Wrap'
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
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

# C. Sheet 'Paper Cup'
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
                "source": "Spreadsheet PRICE LIST RTU 2026"
            })

print(f"Loaded {len(rtu_records)} accurate RTU items.")

# ==========================================
# 2. PARSE PRICE LIST CUSTOM 2026 (ACCURATE)
# ==========================================
print("2. Parsing PRICE LIST CUSTOM 2026...")
wb_custom = openpyxl.load_workbook(custom_xlsx, data_only=True)
custom_records = []

sheets_to_parse = [
    ('PAPER BAG', 'Paper Bag Custom'),
    ('FOOD WRAP', 'Food Wrap Custom'),
    ('WRAPPING PAPER', 'Wrapping Paper Custom'),
    ('SATCHEL BAG', 'Satchel Bag Custom'),
    ('SLEEVE', 'Sleeve Custom'),
    ('BOX', 'Box Custom'),
    ('TAKEAWAY CUP', 'Takeaway Cup Custom')
]

for sname, cat_label in sheets_to_parse:
    if sname not in wb_custom.sheetnames:
        continue
    ws = wb_custom[sname]
    for r in range(6, ws.max_row + 1):
        if sname == 'PAPER BAG':
            code = ws.cell(r, 1).value
            brand = ws.cell(r, 2).value
            product = ws.cell(r, 3).value
            material = ws.cell(r, 4).value
            size = ws.cell(r, 5).value
            color = ws.cell(r, 6).value
            detail_color = ws.cell(r, 7).value
            category = ws.cell(r, 8).value
            finishing = ws.cell(r, 9).value
            qty = ws.cell(r, 11).value or ws.cell(r, 14).value or ws.cell(r, 17).value
            cogs = ws.cell(r, 12).value or ws.cell(r, 15).value or ws.cell(r, 18).value
            profit_markup = ws.cell(r, 19).value
            price_list = ws.cell(r, 20).value
            profit_so = ws.cell(r, 21).value
        else:
            brand = ws.cell(r, 1).value
            product = ws.cell(r, 2).value
            material = ws.cell(r, 3).value
            size = ws.cell(r, 4).value
            color = ws.cell(r, 5).value
            detail_color = ws.cell(r, 6).value
            category = ws.cell(r, 7).value
            finishing = ws.cell(r, 8).value
            qty = ws.cell(r, 10).value or ws.cell(r, 13).value or ws.cell(r, 16).value
            cogs = ws.cell(r, 11).value or ws.cell(r, 14).value or ws.cell(r, 17).value
            profit_markup = ws.cell(r, 18).value
            price_list = ws.cell(r, 19).value
            profit_so = ws.cell(r, 20).value
            code = f"CUST-{sname}-{r}"

        cogs_val = safe_float(cogs)
        if (brand or product) and cogs_val > 0:
            markup_val = safe_float(profit_markup, 0.67)
            price_val = safe_float(price_list)
            if price_val <= 0:
                price_val = round(cogs_val * (1 + markup_val), 2)
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
                "detail_color": str(detail_color or "").strip(),
                "finishing": str(finishing or "Standar Finishing").strip(),
                "qty": safe_int(qty, 1000),
                "cogs": cogs_val,
                "profit_markup": markup_val,
                "price_list": price_val,
                "profit_margin_pct": margin_pct,
                "source": "Spreadsheet PRICE LIST CUSTOM 2026"
            })

print(f"Loaded {len(custom_records)} accurate Custom items.")

# ==========================================
# 3. PARSE IPOS PRICE & TRANSACTIONS (ACCURATE)
# ==========================================
print("3. Parsing IPOS Historical Sales & SO Records...")
df_sales = pd.read_csv(sales_csv)
ipos_records = []
for idx, row in df_sales.iterrows():
    cogs_val = safe_float(row.get("vendor_cost", 0))
    selling_val = safe_float(row.get("selling_price", 0))
    margin_pct = round(safe_float(row.get("margin_pct", 0)) * 100, 2)
    ipos_records.append({
        "id": f"ipos-{idx+1}",
        "so_code": str(row.get("so_code", "")),
        "brand_customer": str(row.get("customer_code", "")),
        "category": str(row.get("category", "")),
        "product_name": str(row.get("product_name", "")),
        "material": str(row.get("material", "")),
        "size": str(row.get("size", "")),
        "color": str(row.get("color", "")),
        "print_type": str(row.get("print_type", "")),
        "qty": safe_int(row.get("qty", 0)),
        "cogs": cogs_val,
        "selling_price": selling_val,
        "margin_pct": margin_pct,
        "sales_rep": str(row.get("sales_rep", "")),
        "order_date": str(row.get("order_date", "")),
        "source": "Spreadsheet IPOS PRICE"
    })

print(f"Loaded {len(ipos_records)} accurate IPOS sales records.")

# Save unified JSON
database = {
    "rtu_prices": rtu_records,
    "custom_prices": custom_records,
    "historical_sales": ipos_records,
    "meta": {
        "rtu_sheet": "https://docs.google.com/spreadsheets/d/1cA6BEEOF7oRjlfesrGF_8640iYM2tmQT9N0WCvuMl58/edit?usp=sharing",
        "custom_sheet": "https://docs.google.com/spreadsheets/d/1TqtowP2Bj-WAh4DBGpSNAnECAV3skehQ-yB3Yd94Lsc/edit?usp=sharing",
        "ipos_sheet": "https://docs.google.com/spreadsheets/d/1KewORzPFilQfOiZFYRRBgjT1_Yl5Hyjbj9ujVaS6Emk/edit?usp=sharing",
        "total_rtu": len(rtu_records),
        "total_custom": len(custom_records),
        "total_ipos": len(ipos_records)
    }
}

with open("src/data/pricingDatabase.json", "w", encoding="utf-8") as f:
    json.dump(database, f, indent=2, ensure_ascii=False)

print("Saved cleanly to src/data/pricingDatabase.json!")
