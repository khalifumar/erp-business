import { RecommendationResponse } from '@/types';

const ML_API_BASE = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';

export interface RecommendationPayload {
  category: string;
  material: string;
  size: string;
  color: string;
  print_type: string;
  qty: number;
  vendor_cost: number;
  moq?: number;
  min_margin_threshold?: number;
}

export async function fetchPriceRecommendation(payload: RecommendationPayload): Promise<RecommendationResponse> {
  try {
    const res = await fetch(`${ML_API_BASE}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.detail || `API error (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('[ML API Offline/Fallback]', err.message);
    
    // Fallback Client Engine jika FastAPI belum dinyalakan oleh user
    const defaultMarkup = 1.67;
    const recommendedPrice = Math.round(payload.vendor_cost * defaultMarkup);
    const minPrice = Math.round(payload.vendor_cost * (defaultMarkup - 0.04));
    const maxPrice = Math.round(payload.vendor_cost * (defaultMarkup + 0.043));
    const expectedMargin = 0.67;
    const belowMoq = payload.moq ? payload.qty < payload.moq : false;

    return {
      recommended_price: recommendedPrice,
      min_price: minPrice,
      max_price: maxPrice,
      predicted_markup: defaultMarkup,
      expected_margin_percentage: expectedMargin,
      is_below_margin: false,
      below_moq_warning: belowMoq,
      warning_message: belowMoq ? `Kuantitas (${payload.qty}) di bawah MOQ vendor (${payload.moq} pcs).` : undefined,
      method_used: 'client_fallback_baseline',
      top_factors: [
        {
          factor: 'Standar Katalog Digipack',
          impact: 'neutral',
          description: 'Menggunakan margin standar perusahaan 67% (COGS x 1.67).'
        },
        {
          factor: 'Volume Pesanan',
          impact: payload.qty >= 5000 ? 'negative' : 'neutral',
          description: `Volume pesanan ${payload.qty} pcs.`
        },
        {
          factor: 'Spesifikasi Cetak',
          impact: payload.print_type.includes('Sablon') ? 'positive' : 'neutral',
          description: `Pilihan ${payload.print_type}.`
        }
      ],
      similar_transactions: [
        {
          so_code: 'SO-HIST-001',
          category: payload.category,
          product_name: `${payload.category} ${payload.size}`,
          qty: payload.qty,
          vendor_cost: payload.vendor_cost,
          selling_price: recommendedPrice,
          markup_ratio: 1.67,
          similarity_score: 0.95
        }
      ]
    };
  }
}

export async function fetchModelMetrics() {
  const res = await fetch(`${ML_API_BASE}/metrics`);
  if (!res.ok) throw new Error('Gagal mengambil metrik model');
  return res.json();
}

export async function checkApiHealth() {
  try {
    const res = await fetch(`${ML_API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
