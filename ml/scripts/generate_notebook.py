import json
import os

notebook = {
    'cells': [
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '# Eksperimen Model Rekomendasi Harga Jual Kemasan (Digipack.id)\n',
                '### Riset Skripsi Informatika: Pendekatan Hibrida Machine Learning & Rule-Based Margin Guardrail\n',
                '\n',
                'Notebook ini mendokumentasikan seluruh tahapan penelitian:\n',
                '1. **Exploratory Data Analysis (EDA)** terhadap distribusi harga vendor (COGS), kuantitas pesanan, dan rasio markup.\n',
                '2. **Feature Engineering** (kategori, material, ukuran, warna, print type, log qty, tier qty).\n',
                '3. **Validasi Berbasis Waktu** (Time-series Split: Bulan 1-5 Train, Bulan 6 Test).\n',
                '4. **Komparasi 4 Model**: Baseline Kategori, Linear Regression, Random Forest, dan LightGBM.\n',
                '5. **Analisis Kuantil Residual** untuk pembentukan rentang rekomendasi harga (Min-Max Interval).\n',
                '6. **Explainability dengan SHAP** untuk interpretasi faktor penentu harga.'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                '# Install dependensi jika dijalankan di Google Colab\n',
                '!pip install lightgbm shap scikit-learn pandas numpy\n',
                '\n',
                'import numpy as np\n',
                'import pandas as pd\n',
                'import json\n',
                'import lightgbm as lgb\n',
                'import shap\n',
                'from sklearn.linear_model import LinearRegression\n',
                'from sklearn.ensemble import RandomForestRegressor\n',
                'from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error\n',
                'from sklearn.preprocessing import OneHotEncoder, StandardScaler\n',
                'from sklearn.compose import ColumnTransformer\n',
                'from sklearn.pipeline import Pipeline'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 1. Load Data Historis Penjualan (Anonim)'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                '# Load data penjualan yang telah dianonimkan\n',
                'df = pd.read_csv("../data/historical_sales_cleaned.csv")\n',
                'df["order_date"] = pd.to_datetime(df["order_date"])\n',
                'df["month"] = df["order_date"].dt.month\n',
                'df["log_qty"] = np.log1p(df["qty"])\n',
                'print(f"Total baris: {len(df)}")\n',
                'df.head()'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 2. Eksplorasi Data & Statistik Deskriptif'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                'print("Statistik Markup dan Margin:")\n',
                'df[["qty", "vendor_cost", "selling_price", "markup_ratio", "margin_pct"]].describe()'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 3. Validasi Berbasis Waktu (Chronological Time-Series Split)'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                'df_sorted = df.sort_values("order_date").reset_index(drop=True)\n',
                'split_idx = int(len(df_sorted) * 0.80)\n',
                'train_df = df_sorted.iloc[:split_idx].copy()\n',
                'test_df = df_sorted.iloc[split_idx:].copy()\n',
                '\n',
                'features_cat = ["category", "material", "size", "color", "print_type", "qty_tier"]\n',
                'features_num = ["qty", "log_qty", "vendor_cost", "month"]\n',
                'all_features = features_cat + features_num\n',
                '\n',
                'X_train = train_df[all_features]\n',
                'y_train = train_df["markup_ratio"]\n',
                'cost_train = train_df["vendor_cost"]\n',
                '\n',
                'X_test = test_df[all_features]\n',
                'y_test = test_df["markup_ratio"]\n',
                'cost_test = test_df["vendor_cost"]\n',
                'actual_price_test = test_df["selling_price"]\n',
                'print(f"Train size: {len(train_df)}, Test size: {len(test_df)}")'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 4. Pelatihan & Komparasi 4 Model'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                '# Preprocessor\n',
                'preprocessor = ColumnTransformer(\n',
                '    transformers=[\n',
                '        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), features_cat),\n',
                '        ("num", StandardScaler(), features_num)\n',
                '    ]\n',
                ')\n',
                '\n',
                '# Baseline\n',
                'cat_mean = train_df.groupby("category")["markup_ratio"].mean().to_dict()\n',
                'global_mean = train_df["markup_ratio"].mean()\n',
                'base_pred_markup = test_df["category"].map(cat_mean).fillna(global_mean)\n',
                'base_pred_price = base_pred_markup * cost_test\n',
                '\n',
                'models = {\n',
                '    "Baseline (Rata-rata)": (None, base_pred_markup, base_pred_price),\n',
                '    "Linear Regression": (LinearRegression(), None, None),\n',
                '    "Random Forest": (RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42), None, None),\n',
                '    "LightGBM": (lgb.LGBMRegressor(n_estimators=120, max_depth=6, learning_rate=0.05, random_state=42, verbose=-1), None, None)\n',
                '}\n',
                '\n',
                'benchmark_results = []\n',
                'for name, (reg, p_markup, p_price) in models.items():\n',
                '    if reg is not None:\n',
                '        pipe = Pipeline([("prep", preprocessor), ("reg", reg)])\n',
                '        pipe.fit(X_train, y_train)\n',
                '        p_markup = pipe.predict(X_test)\n',
                '        p_price = p_markup * cost_test\n',
                '    mae = mean_absolute_error(actual_price_test, p_price)\n',
                '    rmse = np.sqrt(mean_squared_error(actual_price_test, p_price))\n',
                '    mape = mean_absolute_percentage_error(actual_price_test, p_price) * 100\n',
                '    below_margin = ((p_markup < 1.67).sum() / len(p_markup)) * 100\n',
                '    benchmark_results.append({\n',
                '        "Model": name,\n',
                '        "MAE (Rp)": round(mae, 2),\n',
                '        "RMSE (Rp)": round(rmse, 2),\n',
                '        "MAPE (%)": round(mape, 2),\n',
                '        "% Prediksi di Bawah Target 67%": round(below_margin, 2)\n',
                '    })\n',
                '\n',
                'res_df = pd.DataFrame(benchmark_results)\n',
                'res_df'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 5. Analisis Rentang Harga Kuantil Residual'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                'best_pipe = Pipeline([("prep", preprocessor), ("reg", models["LightGBM"][0])])\n',
                'best_pipe.fit(X_train, y_train)\n',
                'train_pred_markup = best_pipe.predict(X_train)\n',
                'residuals = y_train.values - train_pred_markup\n',
                'q10 = np.percentile(residuals, 10)\n',
                'q90 = np.percentile(residuals, 90)\n',
                'print(f"Residual Error Quantile 10%: {q10:.4f}")\n',
                'print(f"Residual Error Quantile 90%: {q90:.4f}")'
            ]
        },
        {
            'cell_type': 'markdown',
            'metadata': {},
            'source': [
                '## 6. Interpretasi SHAP: Faktor Penentu Harga'
            ]
        },
        {
            'cell_type': 'code',
            'execution_count': None,
            'metadata': {},
            'outputs': [],
            'source': [
                'explainer = shap.TreeExplainer(best_pipe.named_steps["reg"])\n',
                'X_test_prep = best_pipe.named_steps["prep"].transform(X_test)\n',
                'shap_values = explainer.shap_values(X_test_prep)\n',
                'feature_names = list(best_pipe.named_steps["prep"].named_transformers_["cat"].get_feature_names_out(features_cat)) + features_num\n',
                'shap.summary_plot(shap_values, X_test_prep, feature_names=feature_names, plot_type="bar")'
            ]
        }
    ],
    'metadata': {
        'kernelspec': {
            'display_name': 'Python 3',
            'language': 'python',
            'name': 'python3'
        },
        'language_info': {
            'name': 'python',
            'version': '3.14.7'
        }
    },
    'nbformat': 4,
    'nbformat_minor': 4
}

target_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'notebooks')
os.makedirs(target_dir, exist_ok=True)
target_path = os.path.join(target_dir, 'eda_and_model_comparison.ipynb')
with open(target_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2)

print('Notebook created at:', target_path)
