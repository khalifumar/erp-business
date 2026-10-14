-- ==============================================================================
-- VIEW & STORED FUNCTION PEMBANTU (EVALUASI SKRIPSI & DASHBOARD ERP)
-- File: db/migrations/02_views_and_functions.sql
-- ==============================================================================

-- 1. Function untuk mencari harga vendor terbaik berdasarkan Product ID dan Qty
CREATE OR REPLACE FUNCTION get_active_vendor_price(
    p_product_id UUID,
    p_qty INT
)
RETURNS TABLE (
    vendor_price_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,
    cogs_price NUMERIC,
    cogs_print NUMERIC,
    moq INT,
    is_below_moq BOOLEAN,
    total_unit_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vp.id AS vendor_price_id,
        v.vendor_code,
        v.vendor_name,
        vp.cogs_price,
        vp.cogs_print,
        vp.moq,
        (p_qty < vp.moq) AS is_below_moq,
        (vp.cogs_price + COALESCE(vp.cogs_print, 0)) AS total_unit_cost
    FROM public.vendor_prices vp
    JOIN public.vendors v ON vp.vendor_id = v.id
    WHERE vp.product_id = p_product_id
      AND vp.is_active = true
      AND p_qty >= vp.qty_min
      AND p_qty <= vp.qty_max
    ORDER BY total_unit_cost ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 2. View Evaluasi Skripsi: Komparasi Harga Rekomendasi vs Final & Analisis Efisiensi Waktu
CREATE OR REPLACE VIEW public.v_quotation_evaluation AS
SELECT 
    qi.id AS item_id,
    q.id AS quotation_id,
    q.quotation_code,
    q.created_at AS quotation_date,
    p.full_name AS sales_name,
    c.customer_code,
    c.company_name AS customer_name,
    pr.name AS product_name,
    pr.category,
    pr.material,
    pr.size,
    pr.color,
    pr.print_type,
    qi.qty,
    qi.vendor_cost,
    qi.harga_rekomendasi,
    qi.harga_rekomendasi_min,
    qi.harga_rekomendasi_max,
    qi.harga_final,
    (qi.harga_final - qi.harga_rekomendasi) AS selisih_nominal,
    CASE 
        WHEN qi.harga_rekomendasi > 0 THEN 
            ROUND(((qi.harga_final - qi.harga_rekomendasi) / qi.harga_rekomendasi) * 100, 2)
        ELSE 0 
    END AS selisih_persen,
    qi.margin_nominal,
    qi.margin_percentage,
    qi.target_margin_pct,
    qi.is_below_margin,
    qi.alasan_override,
    qi.used_recommendation,
    qi.duration_seconds,
    CASE 
        WHEN qi.used_recommendation THEN 'Dengan Rekomendasi'
        ELSE 'Manual'
    END AS metode_penentuan,
    q.status AS quotation_status
FROM public.quotation_items qi
JOIN public.quotations q ON qi.quotation_id = q.id
JOIN public.products pr ON qi.product_id = pr.id
JOIN public.customers c ON q.customer_id = c.id
JOIN public.profiles p ON q.sales_id = p.id;

-- 3. View Ringkasan KPI Dashboard ERP
CREATE OR REPLACE VIEW public.v_dashboard_kpis AS
WITH base_stats AS (
    SELECT 
        COUNT(DISTINCT r.id) AS total_rfq,
        COUNT(DISTINCT q.id) AS total_quotation,
        COUNT(DISTINCT CASE WHEN q.status = 'approved' THEN q.id END) AS approved_quotations,
        COALESCE(SUM(CASE WHEN q.status = 'approved' THEN q.total_amount ELSE 0 END), 0) AS total_approved_revenue
    FROM public.rfqs r
    FULL OUTER JOIN public.quotations q ON true
),
item_stats AS (
    SELECT 
        COALESCE(AVG(margin_percentage), 0) AS avg_margin_pct,
        COALESCE(AVG(duration_seconds), 0) AS avg_duration_seconds,
        COALESCE(AVG(CASE WHEN used_recommendation = true THEN duration_seconds END), 0) AS avg_duration_with_ai,
        COALESCE(AVG(CASE WHEN used_recommendation = false THEN duration_seconds END), 0) AS avg_duration_manual,
        COALESCE(
            ROUND(
                (COUNT(CASE WHEN used_recommendation = true THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 
                1
            ), 
            0
        ) AS recommendation_adoption_pct,
        COUNT(CASE WHEN is_below_margin = true THEN 1 END) AS total_below_margin_override
    FROM public.quotation_items
)
SELECT 
    b.*,
    i.*
FROM base_stats b, item_stats i;
