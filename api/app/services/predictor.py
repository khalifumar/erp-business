import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.config import settings
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    FactorContribution,
    SimilarTransaction
)

class PriceRecommendationEngine:
    _instance = None

    def __init__(self):
        self.artifacts: Optional[Dict[str, Any]] = None
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = PriceRecommendationEngine()
        return cls._instance

    def load_model(self):
        """Memuat artefak model joblib (LightGBM, Preprocessor, Quantiles, NN)."""
        if os.path.exists(settings.MODEL_PATH):
            try:
                self.artifacts = joblib.load(settings.MODEL_PATH)
                print(f"[Model Loaded] Berhasil memuat model {self.artifacts.get('model_name')} dari {settings.MODEL_PATH}")
            except Exception as e:
                print(f"[Model Load Error] Gagal membaca artefak model: {e}")
                self.artifacts = None
        else:
            print(f"[Model Warning] File model belum ditemukan di {settings.MODEL_PATH}, sistem akan menggunakan baseline fallback.")
            self.artifacts = None

    def _determine_qty_tier(self, qty: int) -> str:
        if qty < 1000:
            return "tier_small_<1k"
        elif qty < 5000:
            return "tier_medium_1k-5k"
        elif qty < 10000:
            return "tier_large_5k-10k"
        else:
            return "tier_bulk_10k+"

    def predict(self, req: RecommendationRequest) -> RecommendationResponse:
        current_month = datetime.now().month
        qty_tier = self._determine_qty_tier(req.qty)
        log_qty = float(np.log1p(req.qty))

        input_data = {
            'category': req.category,
            'material': req.material,
            'size': req.size,
            'color': req.color,
            'print_type': req.print_type,
            'qty_tier': qty_tier,
            'qty': req.qty,
            'log_qty': log_qty,
            'vendor_cost': req.vendor_cost,
            'month': current_month
        }
        df_input = pd.DataFrame([input_data])

        method_used = "lightgbm_ml"
        predicted_markup = None
        top_factors: List[FactorContribution] = []
        similar_txs: List[SimilarTransaction] = []

        # 1. Inferensi Model ML jika artefak tersedia
        if self.artifacts and 'pipeline' in self.artifacts:
            try:
                pipe = self.artifacts['pipeline']
                pred_raw = pipe.predict(df_input)
                predicted_markup = float(pred_raw[0])

                # Pencarian 3 transaksi historis terdekat (Nearest Neighbors)
                if 'nn_model' in self.artifacts and 'train_reference_samples' in self.artifacts:
                    X_input_encoded = pipe.named_steps['preprocessor'].transform(df_input)
                    distances, indices = self.artifacts['nn_model'].kneighbors(X_input_encoded)
                    
                    ref_samples = self.artifacts['train_reference_samples']
                    for dist, idx in zip(distances[0], indices[0]):
                        if idx < len(ref_samples):
                            s = ref_samples[idx]
                            similarity = max(0.0, round(float(1.0 - dist), 3))
                            similar_txs.append(SimilarTransaction(
                                so_code=s['so_code'],
                                category=s['category'],
                                product_name=s['product_name'],
                                qty=int(s['qty']),
                                vendor_cost=float(s['vendor_cost']),
                                selling_price=float(s['selling_price']),
                                markup_ratio=float(s['markup_ratio']),
                                similarity_score=similarity
                            ))

            except Exception as e:
                print(f"[Inference Fallback] Terjadi error pada prediksi ML: {e}, beralih ke baseline")
                predicted_markup = None

        # 2. Rule Fallback ke Baseline Kategori jika ML gagal / kategori sangat jarang
        if predicted_markup is None:
            method_used = "category_baseline_fallback"
            if self.artifacts and 'category_baseline_map' in self.artifacts:
                cat_map = self.artifacts['category_baseline_map']
                predicted_markup = float(cat_map.get(req.category, self.artifacts.get('global_baseline_markup', 1.67)))
            else:
                predicted_markup = 1.6700 # Default standar markup 67% Digipack

        # 3. Hitung Faktor Penentu Terbesar (Feature Heuristic / Interpretability)
        # Memberikan insight praktis langsung kepada tim sales
        if req.qty >= 5000:
            top_factors.append(FactorContribution(
                factor="Skala Volume Pesanan (Qty)",
                impact="negative",
                description=f"Pesanan partai besar ({req.qty} pcs) mendapatkan efisiensi harga per-unit."
            ))
        elif req.qty < 1000:
            top_factors.append(FactorContribution(
                factor="Volume di Bawah Skala Optimal",
                impact="positive",
                description=f"Pesanan volume kecil ({req.qty} pcs) memerlukan penyesuaian markup untuk menutup biaya setup."
            ))
        else:
            top_factors.append(FactorContribution(
                factor="Kuantitas Standar",
                impact="neutral",
                description=f"Volume {req.qty} pcs berada dalam tier standar katalog."
            ))

        if "Sablon" in req.print_type or "Custom" in req.print_type:
            top_factors.append(FactorContribution(
                factor="Proses Sablon / Finishing Tambahan",
                impact="positive",
                description=f"Spesifikasi cetak '{req.print_type}' melibatkan proses setting mesin dan biaya sablon per sisi."
            ))
        else:
            top_factors.append(FactorContribution(
                factor="Polos / Tanpa Cetak",
                impact="neutral",
                description="Produk polos ready-to-use tanpa beban biaya cetak ekstra."
            ))

        top_factors.append(FactorContribution(
            factor=f"Kategori {req.category}",
            impact="positive" if "Box" in req.category or "Custom" in req.category else "neutral",
            description=f"Tren margin rata-rata historis untuk kategori {req.category} adalah ~67%."
        ))

        # 4. Kalkulasi Rentang Harga Berdasarkan Kuantil Residual
        q10 = -0.040
        q90 = +0.043
        if self.artifacts and 'residual_quantiles' in self.artifacts:
            q10 = self.artifacts['residual_quantiles'].get('q10', q10)
            q90 = self.artifacts['residual_quantiles'].get('q90', q90)

        min_markup = max(1.15, predicted_markup + q10)
        max_markup = predicted_markup + q90

        recommended_price = round(float(predicted_markup * req.vendor_cost), 2)
        min_price = round(float(min_markup * req.vendor_cost), 2)
        max_price = round(float(max_markup * req.vendor_cost), 2)

        # 5. Guardrail Margin Minimum (Threshold Kebijakan Digipack)
        target_margin = req.min_margin_threshold if req.min_margin_threshold is not None else settings.MIN_MARGIN_PERCENTAGE
        expected_margin = round(float((recommended_price - req.vendor_cost) / req.vendor_cost), 4)

        is_below_margin = expected_margin < target_margin
        below_moq_warning = req.moq is not None and req.qty < req.moq

        warning_messages = []
        if below_moq_warning:
            warning_messages.append(f"Kuantitas pesanan ({req.qty}) berada di bawah batas MOQ vendor ({req.moq} pcs).")
        if is_below_margin:
            warning_messages.append(f"Estimasi margin ({round(expected_margin * 100, 1)}%) berada di bawah batas minimum ({round(target_margin * 100, 1)}%). Butuh persetujuan Manager.")

        return RecommendationResponse(
            recommended_price=recommended_price,
            min_price=min_price,
            max_price=max_price,
            predicted_markup=round(predicted_markup, 4),
            expected_margin_percentage=expected_margin,
            is_below_margin=is_below_margin,
            below_moq_warning=below_moq_warning,
            warning_message=" | ".join(warning_messages) if warning_messages else None,
            method_used=method_used,
            top_factors=top_factors[:3],
            similar_transactions=similar_txs[:3]
        )
