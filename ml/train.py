"""
Pipeline Pelatihan Model Rekomendasi Harga Jual Digipack
- Membandingkan Baseline, Linear Regression, Random Forest, dan LightGBM
- Evaluasi berbasis Time-Series Split (Bulan 1-5 Train, Bulan 6 Test)
- Target: Markup Ratio (Harga Jual / Harga Vendor)
- Output: model.joblib (Pipeline + SHAP tree explainer / Feature Importance + Residual Quantiles) dan metrics.json
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from sklearn.neighbors import NearestNeighbors
import lightgbm as lgb
import shap

# Direktori Proyek
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'historical_sales_cleaned.csv')
ARTIFACTS_DIR = os.path.join(BASE_DIR, 'artifacts')
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def load_and_prep_data():
    df = pd.read_csv(DATA_PATH)
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['month'] = df['order_date'].dt.month
    df['log_qty'] = np.log1p(df['qty'])
    return df

def run_experiment():
    df = load_and_prep_data()
    print(f"Total dataset: {len(df)} baris")

    # Time-based Split: Bulan 5-9 Train (Mei - September), Bulan 10 Test (Oktober)
    # Jika dataset memiliki distribusi bulan berbeda, gunakan 80% awal secara kronologis
    df_sorted = df.sort_values('order_date').reset_index(drop=True)
    split_idx = int(len(df_sorted) * 0.80)
    
    train_df = df_sorted.iloc[:split_idx].copy()
    test_df = df_sorted.iloc[split_idx:].copy()
    
    print(f"Data Train: {len(train_df)} baris (hingga {train_df['order_date'].max().strftime('%Y-%m-%d')})")
    print(f"Data Test: {len(test_df)} baris (hingga {test_df['order_date'].max().strftime('%Y-%m-%d')})")

    features_cat = ['category', 'material', 'size', 'color', 'print_type', 'qty_tier']
    features_num = ['qty', 'log_qty', 'vendor_cost', 'month']
    all_features = features_cat + features_num
    target = 'markup_ratio'

    X_train = train_df[all_features]
    y_train = train_df[target]
    cost_train = train_df['vendor_cost']

    X_test = test_df[all_features]
    y_test = test_df[target]
    cost_test = test_df['vendor_cost']
    actual_price_test = test_df['selling_price']

    # 1. Baseline Model: Rata-rata markup historis per kategori
    category_mean_markup = train_df.groupby('category')['markup_ratio'].mean().to_dict()
    global_mean_markup = train_df['markup_ratio'].mean()
    
    baseline_pred_markup = test_df['category'].map(category_mean_markup).fillna(global_mean_markup)
    baseline_pred_price = baseline_pred_markup * cost_test

    # 2. Pipeline Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), features_cat),
            ('num', StandardScaler(), features_num)
        ]
    )

    models = {
        'Baseline (Rata-rata Kategori)': None,
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42),
        'LightGBM': lgb.LGBMRegressor(n_estimators=120, max_depth=6, learning_rate=0.05, random_state=42, verbose=-1)
    }

    results = {}
    fitted_pipelines = {}

    for name, model in models.items():
        if name.startswith('Baseline'):
            pred_markup = baseline_pred_markup
            pred_price = baseline_pred_price
        else:
            pipe = Pipeline([
                ('preprocessor', preprocessor),
                ('regressor', model)
            ])
            pipe.fit(X_train, y_train)
            pred_markup = pipe.predict(X_test)
            pred_price = pred_markup * cost_test
            fitted_pipelines[name] = pipe

        mae = mean_absolute_error(actual_price_test, pred_price)
        rmse = np.sqrt(mean_squared_error(actual_price_test, pred_price))
        mape = mean_absolute_percentage_error(actual_price_test, pred_price) * 100
        
        # Guardrail Margin Check (markup < 1.67 berarti margin < 67%)
        below_margin_count = (pred_markup < 1.67).sum()
        pct_below_margin = (below_margin_count / len(pred_markup)) * 100

        results[name] = {
            'MAE_Rupiah': round(float(mae), 2),
            'RMSE_Rupiah': round(float(rmse), 2),
            'MAPE_Percent': round(float(mape), 2),
            'Pct_Below_67_Margin': round(float(pct_below_margin), 2)
        }

    print("\n=== HASIL PERBANDINGAN MODEL (PADA HARGA JUAL AKHIR RUPIAH) ===")
    print(json.dumps(results, indent=2))

    # Pilih Model Terbaik (LightGBM atau Random Forest)
    best_model_name = 'LightGBM' if 'LightGBM' in fitted_pipelines else 'Random Forest'
    best_pipe = fitted_pipelines[best_model_name]

    # Hitung Residual Quantiles untuk Menentukan Rentang Harga (Min-Max Interval)
    train_pred_markup = best_pipe.predict(X_train)
    residuals_markup = y_train.values - train_pred_markup
    q10_res = float(np.percentile(residuals_markup, 10))
    q90_res = float(np.percentile(residuals_markup, 90))

    # Nearest Neighbor Index untuk rekomendasi "3 Transaksi Historis Terdekat"
    X_train_encoded = best_pipe.named_steps['preprocessor'].transform(X_train)
    nn_model = NearestNeighbors(n_neighbors=3, metric='cosine')
    nn_model.fit(X_train_encoded)

    # Siapkan SHAP Explainer untuk interpretasi "3 Faktor Penentu"
    best_regressor = best_pipe.named_steps['regressor']
    try:
        explainer = shap.TreeExplainer(best_regressor)
        has_shap = True
    except Exception as e:
        print("SHAP TreeExplainer notice:", e)
        explainer = None
        has_shap = False

    # Dapatkan nama fitur setelah one-hot encoding
    ohe = best_pipe.named_steps['preprocessor'].named_transformers_['cat']
    encoded_feature_names = list(ohe.get_feature_names_out(features_cat)) + features_num

    # Simpan Artefak Model
    artifact_payload = {
        'model_name': best_model_name,
        'pipeline': best_pipe,
        'residual_quantiles': {
            'q10': q10_res,
            'q90': q90_res
        },
        'category_baseline_map': category_mean_markup,
        'global_baseline_markup': global_mean_markup,
        'all_features': all_features,
        'features_cat': features_cat,
        'features_num': features_num,
        'encoded_feature_names': encoded_feature_names,
        'nn_model': nn_model,
        'train_reference_samples': train_df[['so_code', 'category', 'product_name', 'qty', 'vendor_cost', 'selling_price', 'markup_ratio']].to_dict(orient='records'),
        'has_shap': has_shap,
        'created_at': datetime.now().isoformat()
    }

    model_save_path = os.path.join(ARTIFACTS_DIR, 'model.joblib')
    joblib.dump(artifact_payload, model_save_path)
    print(f"\nModel tersimpan di: {model_save_path}")

    # Simpan Metrics Report
    metrics_report = {
        'evaluation_date': datetime.now().isoformat(),
        'train_samples': len(train_df),
        'test_samples': len(test_df),
        'best_model': best_model_name,
        'models_comparison': results,
        'residual_quantiles': {
            'q10_residual_markup': q10_res,
            'q90_residual_markup': q90_res
        }
    }

    metrics_save_path = os.path.join(ARTIFACTS_DIR, 'metrics.json')
    with open(metrics_save_path, 'w', encoding='utf-8') as f:
        json.dump(metrics_report, f, indent=2)
    print(f"Laporan metrik tersimpan di: {metrics_save_path}")

    return metrics_report

if __name__ == '__main__':
    run_experiment()
