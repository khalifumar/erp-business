export type UserRole = 'sales' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  company_name: string;
  contact_person?: string;
  segment?: string;
}

export interface Vendor {
  id: string;
  vendor_code: string;
  vendor_name: string;
  speciality?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  material: string;
  size: string;
  color: string;
  print_type: string;
  qty_per_carton?: number;
}

export interface VendorPrice {
  id: string;
  product_id: string;
  vendor_id: string;
  qty_min: number;
  qty_max: number;
  moq: number;
  cogs_price: number;
  cogs_print: number;
  lead_time_days: number;
  product?: Product;
  vendor?: Vendor;
}

export type RFQStatus = 'draft' | 'pending' | 'processed' | 'cancelled';

export interface RFQ {
  id: string;
  rfq_code: string;
  customer_id: string;
  sales_id: string;
  product_id: string;
  requested_qty: number;
  target_date?: string;
  status: RFQStatus;
  notes?: string;
  created_at: string;
  customer?: Customer;
  product?: Product;
  sales?: UserProfile;
}

export type QuotationStatus = 'draft' | 'waiting_approval' | 'approved' | 'rejected' | 'sent_to_client';

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  qty: number;
  vendor_cost: number;
  harga_rekomendasi?: number;
  harga_rekomendasi_min?: number;
  harga_rekomendasi_max?: number;
  harga_final: number;
  subtotal: number;
  margin_nominal: number;
  margin_percentage: number;
  target_margin_pct: number;
  is_below_margin: boolean;
  alasan_override?: string;
  used_recommendation: boolean;
  started_at?: string;
  finished_at?: string;
  duration_seconds?: number;
  product?: Product;
}

export interface Quotation {
  id: string;
  quotation_code: string;
  rfq_id?: string;
  customer_id: string;
  sales_id: string;
  status: QuotationStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  customer?: Customer;
  sales?: UserProfile;
  items?: QuotationItem[];
}

export interface FactorContribution {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface SimilarTransaction {
  so_code: string;
  category: string;
  product_name: string;
  qty: number;
  vendor_cost: number;
  selling_price: number;
  markup_ratio: number;
  similarity_score: number;
}

export interface RecommendationResponse {
  recommended_price: number;
  min_price: number;
  max_price: number;
  predicted_markup: number;
  expected_margin_percentage: number;
  is_below_margin: boolean;
  below_moq_warning: boolean;
  warning_message?: string;
  method_used: string;
  top_factors: FactorContribution[];
  similar_transactions: SimilarTransaction[];
}
