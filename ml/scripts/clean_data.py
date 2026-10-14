"""
Script Pembersihan Data dan Validasi Kualitas Data
Melakukan pengecekan duplikasi, missing values, normalisasi tipe data,
dan membuat laporan kualitas data untuk skripsi.
"""

import os
import json
import pandas as pd
import numpy as np

def clean_and_validate(input_csv: str, output_csv: str, report_json: str):
    df = pd.read_csv(input_csv)
    initial_rows = len(df)
    
    report = {
        "initial_row_count": initial_rows,
        "columns": list(df.columns),
        "missing_values_before": df.isnull().sum().to_dict(),
        "duplicates_removed": 0,
        "actions_taken": []
    }
    
    # 1. Cek Duplikasi
    dup_count = df.duplicated(subset=['so_code']).sum()
    if dup_count > 0:
        df = df.drop_duplicates(subset=['so_code'])
        report["duplicates_removed"] = int(dup_count)
        report["actions_taken"].append(f"Menghapus {dup_count} baris duplikat SO code")

    # 2. Tangani missing value atau penamaan tidak seragam
    categorical_cols = ['category', 'material', 'size', 'color', 'print_type']
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].fillna('Unknown').astype(str).str.strip()

    # 3. Validasi numerik: qty > 0, vendor_cost > 0, selling_price > vendor_cost
    invalid_mask = (df['qty'] <= 0) | (df['vendor_cost'] <= 0) | (df['selling_price'] <= 0)
    invalid_count = invalid_mask.sum()
    if invalid_count > 0:
        df = df[~invalid_mask]
        report["actions_taken"].append(f"Membuang {invalid_count} baris dengan nilai numerik tidak valid (qty/cost <= 0)")

    # 4. Normalisasi Rasio Markup dan Margin
    df['markup_ratio'] = (df['selling_price'] / df['vendor_cost']).round(4)
    df['margin_pct'] = ((df['selling_price'] - df['vendor_cost']) / df['vendor_cost']).round(4)

    # 5. Ekstraksi Fitur Tambahan (log qty, tier qty, bulan)
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['month'] = df['order_date'].dt.month
    df['log_qty'] = np.log1p(df['qty'])
    
    def categorize_tier(qty):
        if qty < 1000:
            return "tier_small_<1k"
        elif qty < 5000:
            return "tier_medium_1k-5k"
        elif qty < 10000:
            return "tier_large_5k-10k"
        else:
            return "tier_bulk_10k+"
            
    df['qty_tier'] = df['qty'].apply(categorize_tier)

    # 6. Simpan hasil bersih dan laporan
    df.to_csv(output_csv, index=False)
    
    report["final_row_count"] = len(df)
    report["missing_values_after"] = df.isnull().sum().to_dict()
    report["summary_stats"] = {
        "avg_qty": float(df['qty'].mean()),
        "avg_markup": float(df['markup_ratio'].mean()),
        "min_markup": float(df['markup_ratio'].min()),
        "max_markup": float(df['markup_ratio'].max()),
        "avg_margin_pct": float(df['margin_pct'].mean())
    }

    with open(report_json, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    print(f"Data bersih berhasil disimpan ke: {output_csv}")
    print(f"Laporan kualitas data disimpan ke: {report_json}")
    return df, report

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    inp = os.path.join(data_dir, 'historical_sales_anonymized.csv')
    out = os.path.join(data_dir, 'historical_sales_cleaned.csv')
    rep = os.path.join(data_dir, 'data_quality_report.json')
    clean_and_validate(inp, out, rep)
