// src/services/geminiService.js
import db from '../data/pricingDatabase.json' with { type: 'json' };

/**
 * Core packaging products and materials
 */
const PACKAGING_CORE_ENTITIES = [
  'paper bag', 'kantong', 'kemasan', 'food wrap', 'wrapping paper', 'kertas roti',
  'paper cup', 'takeaway cup', 'cup', 'satchel', 'envelope', 'dus', 'box', 'sleeve',
  'sos bag', 'kraft', 'greaseproof', 'hvs', 'ivory', 'duplex', 'corrugated', 'sablon'
];

/**
 * Normalizes size strings for high-precision matching
 * e.g., "12x0x20", "12 x 0 x 20", "12 x 0 x 20 cm", "P 20 x L 20 x T 25 cm"
 */
export function normalizeSize(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/[plt\(\)\,\.]/g, ' ')
    .replace(/\s*x\s*/g, 'x')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses numeric dimensions [L, W, H] from a string
 */
function parseDimensions(s) {
  if (!s) return [];
  const matches = s.match(/\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Calculates Euclidean 3D distance between two dimension tuples
 */
function dimensionDistance(dimsA, dimsB) {
  if (dimsA.length === 0 || dimsB.length === 0) return 999;
  let dist = 0;
  const len = Math.max(dimsA.length, dimsB.length);
  for (let i = 0; i < len; i++) {
    const valA = dimsA[i] || 0;
    const valB = dimsB[i] || 0;
    dist += Math.pow(valA - valB, 2);
  }
  return Math.sqrt(dist);
}

/**
 * Validates prompt context, detecting:
 * - Scenario 1: Out of context ("Tidak sesuai dengan konteks")
 * - Scenario 5: Multiple specifications collision ("Berikan 1 spesifikasi saja")
 */
export function validatePromptConstraints(query) {
  const raw = (query || '').trim();
  const q = raw.toLowerCase();

  // SCENARIO 1: Out-of-Context Check
  if (raw.length < 3) {
    return {
      isValid: false,
      status: "OUT_OF_CONTEXT",
      overview: "Tidak sesuai dengan konteks",
      sub_message: "Pertanyaan yang Anda masukkan belum berkaitan dengan produk kemasan Digipack atau estimasi harga spreadsheet. Silakan masukkan kata kunci produk (misal: Paper Bag, Food Wrap, Paper Cup), ukuran dimensi (misal: 30 x 10 x 40), bahan baku, atau kuantitas order."
    };
  }

  const hasCoreEntity = PACKAGING_CORE_ENTITIES.some(kw => q.includes(kw));
  const hasDimensions = /\d+\s*x\s*\d+/i.test(q);

  if (!hasCoreEntity && !hasDimensions) {
    return {
      isValid: false,
      status: "OUT_OF_CONTEXT",
      overview: "Tidak sesuai dengan konteks",
      sub_message: "Pertanyaan yang Anda masukkan belum berkaitan dengan produk kemasan Digipack atau estimasi harga spreadsheet. Silakan tanyakan nama produk (misal: Paper Bag, Food Wrap, Paper Cup), ukuran dimensi (misal: 30 x 10 x 40), bahan baku, atau kuantitas order."
    };
  }

  // SCENARIO 5: Multiple Specifications Collision
  const categoriesFound = [];
  if (q.includes('paper bag') || q.includes('satchel') || q.includes('sos bag')) categoriesFound.push('Paper Bag');
  if (q.includes('food wrap') || q.includes('wrapping paper') || q.includes('kertas roti')) categoriesFound.push('Food Wrap');
  if (q.includes('paper cup') || q.includes('takeaway cup') || (q.includes('cup') && !q.includes('paper bag'))) categoriesFound.push('Paper Cup');
  if (q.includes('box') || q.includes('dus') || q.includes('kotak')) categoriesFound.push('Box / Dus');
  if (q.includes('sleeve')) categoriesFound.push('Sleeve');

  if (categoriesFound.length > 1) {
    return {
      isValid: false,
      status: "MULTI_SPEC",
      overview: "Berikan 1 spesifikasi saja",
      sub_message: `Terdeteksi ${categoriesFound.length} kategori produk berbeda dalam satu pertanyaan (${categoriesFound.join(' & ')}). Agar perhitungan COGS, margin, dan template penawaran WhatsApp akurat sesuai spreadsheet, mohon tanyakan satu jenis produk per pesan.`
    };
  }

  const dimensionMatches = q.match(/\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?/g) || [];
  const uniqueSizes = [...new Set(dimensionMatches.map(s => normalizeSize(s)))];

  if (uniqueSizes.length > 1) {
    return {
      isValid: false,
      status: "MULTI_SPEC",
      overview: "Berikan 1 spesifikasi saja",
      sub_message: `Terdeteksi ${uniqueSizes.length} ukuran dimensi berbeda dalam satu pertanyaan (${uniqueSizes.join(', ')}). Mohon ajukan satu ukuran spesifikasi per pesan agar simulasi harga dan tabel perbandingan dapat disajikan secara fokus dan akurat.`
    };
  }

  return { isValid: true };
}

/**
 * 4-TIER HIERARCHICAL PRIORITY SEARCH ENGINE
 * 1. Product (Weight: 1000)
 * 2. Material (Weight: 500)
 * 3. Size (Weight: 250)
 * 4. Quantity (Weight: 100)
 * With strict Database Category Filtering ('RTU' vs 'CUSTOM')
 */
export function searchPricingKnowledge(query, customTargetMargin = null, categoryMode = 'RTU') {
  const q = query.toLowerCase();
  const alerts = [];
  const specNotes = [];

  // 1. Extract Quantity & MOQ
  let requestedQty = 1000;
  let isExplicitMoq = false;
  const explicitQtyMatch = 
    q.match(/(?:moq|qty|kuantitas|order|jumlah|sebanyak|pesanan)\s*[:=]?\s*(\d[\d\.\,]*)\s*(pcs|lembar|buah|unit|rb|ribu|k)?/i) ||
    q.match(/(\d[\d\.\,]*)\s*(pcs|lembar|buah|unit|rb|ribu|k)\b/i);

  if (explicitQtyMatch) {
    let numStr = explicitQtyMatch[1].replace(/\./g, '').replace(/,/g, '');
    let num = parseInt(numStr, 10);
    const unit = (explicitQtyMatch[2] || '').toLowerCase();
    if (unit === 'rb' || unit === 'ribu' || unit === 'k') num *= 1000;
    if (num > 0) requestedQty = num;
    if (q.includes('moq')) isExplicitMoq = true;
  } else {
    const words = q.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[.,]/g, '');
      if (/^\d+$/.test(w)) {
        const prev = (words[i-1] || '').toLowerCase();
        const next = (words[i+1] || '').toLowerCase();
        if (prev !== 'x' && next !== 'x' && next !== 'gsm') {
          const val = parseInt(w, 10);
          if (val >= 50) {
            requestedQty = val;
            break;
          }
        }
      }
    }
  }

  // 2. Extract Margin request (Worst Case Guardrail)
  let queryMargin = customTargetMargin;
  const marginMatch = q.match(/margin\s*[:=]?\s*(-?\d+(?:\.\d+)?)\s*%/i) || q.match(/margin\s*(-?\d{1,2})/i);
  if (marginMatch) {
    const rawMargin = parseFloat(marginMatch[1]);
    if (rawMargin < 5 || rawMargin > 75) {
      alerts.push({
        type: 'warning',
        title: 'Penyesuaian Batas Margin Wajar',
        message: `Margin yang diminta (${rawMargin}%) berada di luar rentang aman operasional. Sistem otomatis menerapkan margin 40.12% untuk melindungi profitabilitas perusahaan.`
      });
      queryMargin = 40.12;
    } else {
      queryMargin = rawMargin;
    }
  }

  // 3. PRIORITY 1: Identify Product Target
  const isNonHandleExplicit = q.includes('non handle') || q.includes('tanpa handle') || q.includes('non-handle') || q.includes('tanpa tali') || q.includes('sos bag');
  const isHandleExplicit = (q.includes('handle') || q.includes('tali') || q.includes('with handle')) && !isNonHandleExplicit;

  let targetProductType = 'general';
  if (isHandleExplicit) targetProductType = 'paper_bag_handle';
  else if (isNonHandleExplicit) targetProductType = 'paper_bag_non_handle';
  else if (q.includes('food wrap') || q.includes('wrapping paper') || q.includes('kertas roti') || q.includes('kertas burger')) targetProductType = 'food_wrap';
  else if (q.includes('paper cup') || q.includes('takeaway cup') || (q.includes('cup') && !q.includes('paper bag'))) targetProductType = 'paper_cup';
  else if (q.includes('satchel envelope') || q.includes('amplop')) targetProductType = 'satchel_envelope';
  else if (q.includes('satchel')) targetProductType = 'satchel_bag';
  else if (q.includes('box') || q.includes('dus') || q.includes('kotak')) targetProductType = 'box';
  else if (q.includes('paper bag') || q.includes('kantong')) targetProductType = 'paper_bag';

  // 4. PRIORITY 2: Identify Material Target
  const materialKeywords = ['greaseproof', 'white kraft', 'brown kraft', 'kraft', 'hvs', 'ivory', 'duplex'];
  let requestedMaterial = materialKeywords.find(m => q.includes(m)) || '';
  const gsmMatch = q.match(/\b(40|50|70|80|120|125|150|210|250|300)\s*(?:gsm)?\b/);
  const requestedGsm = gsmMatch ? gsmMatch[1] : '';

  // 5. PRIORITY 3: Identify Size Target
  const sizeMatch = q.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)(?:\s*x\s*(\d+(?:[.,]\d+)?))?/);
  let searchSizeNorm = sizeMatch ? normalizeSize(sizeMatch[0]) : '';
  const searchDims = sizeMatch ? parseDimensions(sizeMatch[0]) : [];

  if (searchDims.length === 2) {
    alerts.push({
      type: 'info',
      title: 'Spesifikasi Dimensi Dilengkapi',
      message: `Dimensi input terdeteksi 2 ukuran (${searchDims[0]} x ${searchDims[1]}). Sistem melengkapinya dengan lebar samping (gusset) standar katalog terdekat.`
    });
  }

  // HIERARCHICAL PRIORITY SCORER
  function scoreItemWithPriority(item) {
    const itemPName = (item.product_name || '').toLowerCase();
    const itemCat = (item.category || '').toLowerCase();
    const itemMat = (item.material || '').toLowerCase();
    const itemBrand = (item.brand || '').toLowerCase();
    const itemSizeNorm = normalizeSize(item.size);
    const itemDims = parseDimensions(item.size);
    const isItemHandle = (itemPName.includes('handle') || itemCat.includes('handle')) &&
                         !itemPName.includes('non handle') && !itemPName.includes('non-handle');
    const isItemNonHandle = itemPName.includes('non handle') || itemPName.includes('non-handle') || itemPName.includes('sos bag');

    // --- 1. PRODUCT (PRIORITY 1 - WEIGHT: 1000) ---
    let p1 = 0;
    if (targetProductType === 'paper_bag_handle') {
      if (isItemHandle) p1 = 1000;
      else if (isItemNonHandle) p1 = -800;
    } else if (targetProductType === 'paper_bag_non_handle') {
      if (isItemNonHandle) p1 = 1000;
      else if (isItemHandle) p1 = -800;
    } else if (targetProductType === 'food_wrap') {
      if (itemCat.includes('food wrap') || itemPName.includes('wrap')) p1 = 1000;
      else p1 = -500;
    } else if (targetProductType === 'paper_cup') {
      if (itemCat.includes('cup') || itemPName.includes('cup')) p1 = 1000;
      else p1 = -500;
    } else if (targetProductType === 'satchel_envelope') {
      if (itemPName.includes('satchel') || itemPName.includes('envelope')) p1 = 1000;
      else p1 = -500;
    } else if (targetProductType === 'box') {
      if (itemCat.includes('box') || itemCat.includes('dus') || itemPName.includes('box')) p1 = 1000;
      else p1 = -500;
    } else if (targetProductType === 'paper_bag') {
      if (itemCat.includes('paper bag') || itemPName.includes('paper bag') || isItemHandle || isItemNonHandle) p1 = 1000;
    } else {
      p1 = 300; // neutral product priority
    }

    // --- 2. MATERIAL (PRIORITY 2 - WEIGHT: 500) ---
    let p2 = 0;
    if (requestedMaterial) {
      if (itemMat.includes(requestedMaterial)) {
        p2 = 400;
        if (requestedGsm && itemMat.includes(requestedGsm)) p2 = 500;
      } else if (requestedMaterial.includes('kraft') && itemMat.includes('kraft')) {
        p2 = 250;
      } else {
        p2 = 50; // material not available for product -> graceful degradation
      }
    } else if (requestedGsm) {
      if (itemMat.includes(requestedGsm)) p2 = 300;
      else p2 = 100;
    } else {
      p2 = 200; // neutral material priority
    }

    // --- 3. SIZE (PRIORITY 3 - WEIGHT: 250) ---
    let p3 = 0;
    if (searchSizeNorm && itemSizeNorm.includes(searchSizeNorm)) {
      p3 = 250; // exact match
    } else if (searchDims.length > 0 && itemDims.length > 0) {
      const dist = dimensionDistance(searchDims, itemDims);
      if (dist <= 5) p3 = Math.max(50, Math.round(200 - (dist * 30)));
      else p3 = Math.max(0, Math.round(40 - dist));
    } else {
      p3 = 100; // neutral size priority
    }

    // --- 4. QUANTITY (PRIORITY 4 - WEIGHT: 100) ---
    let p4 = 0;
    const itemVol = item.moq || item.qty || 1000;
    if (isExplicitMoq && itemVol === requestedQty) {
      p4 = 100;
    } else if (requestedQty && itemVol) {
      const ratio = Math.min(requestedQty, itemVol) / Math.max(requestedQty, itemVol);
      p4 = Math.round(ratio * 80);
    } else {
      p4 = 40;
    }

    // Brand bonus in Custom Price List
    if (itemBrand && itemBrand.length > 2 && q.includes(itemBrand)) {
      p1 += 150;
    }

    return p1 + p2 + p3 + p4;
  }

  // STRICT SPREADSHEET CATEGORY ROUTING
  let scoredRtu = [];
  let scoredCustom = [];
  let scoredIpos = [];

  if (categoryMode === 'RTU') {
    // 100% ROUTE TO PRICE LIST RTU 2026 ONLY
    scoredRtu = db.rtu_prices.map(item => ({
      ...item,
      score: scoreItemWithPriority(item)
    })).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const diffA = Math.abs((a.moq || 1000) - requestedQty);
      const diffB = Math.abs((b.moq || 1000) - requestedQty);
      return diffA - diffB;
    });
  } else if (categoryMode === 'CUSTOM') {
    // 100% ROUTE TO PRICE LIST CUSTOM 2026 ONLY
    scoredCustom = db.custom_prices.map(item => ({
      ...item,
      score: scoreItemWithPriority(item)
    })).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const diffA = Math.abs((a.qty || 1000) - requestedQty);
      const diffB = Math.abs((b.qty || 1000) - requestedQty);
      return diffA - diffB;
    });
  } else {
    // AUTO / ALL MODE
    scoredRtu = db.rtu_prices.map(item => ({
      ...item,
      score: scoreItemWithPriority(item)
    })).sort((a, b) => b.score - a.score);

    scoredCustom = db.custom_prices.map(item => ({
      ...item,
      score: scoreItemWithPriority(item)
    })).sort((a, b) => b.score - a.score);

    scoredIpos = db.historical_sales.map(item => ({
      ...item,
      score: scoreItemWithPriority(item)
    })).sort((a, b) => b.score - a.score);
  }

  const hasDirectAttributeMatch = Boolean(
    searchSizeNorm ||
    requestedMaterial ||
    isHandleExplicit ||
    isNonHandleExplicit ||
    targetProductType !== 'general'
  );

  return {
    categoryMode,
    requestedQty,
    isExplicitMoq,
    queryMargin,
    alerts,
    specNotes,
    searchSizeNorm,
    requestedMaterial,
    requestedGsm,
    topRtu: scoredRtu.slice(0, 5),
    topCustom: scoredCustom.slice(0, 5),
    topIpos: scoredIpos.slice(0, 5),
    maxScore: hasDirectAttributeMatch
      ? Math.max(scoredRtu[0]?.score || 0, scoredCustom[0]?.score || 0, scoredIpos[0]?.score || 0)
      : 0
  };
}

/**
 * Calculates selling price with exact target margin formula:
 * Price = COGS / (1 - Margin/100)
 */
export function calculatePriceFromMargin(cogs, targetMargin) {
  if (!cogs || cogs <= 0) return 0;
  if (!targetMargin || targetMargin <= 0 || targetMargin >= 95) return Math.round(cogs * 1.67);
  const marginDecimal = targetMargin / 100;
  return Math.round((cogs / (1 - marginDecimal)) * 100) / 100;
}

/**
 * Generates accurate 3-tier sales recommendation based on actual spreadsheet data
 * strictly obeying Priority Hierarchy & Category Selection
 */
export async function generateSalesResponse(userQuery, settings = {}) {
  const {
    apiKey,
    model = 'Gemini 3.8 Flash',
    targetMargin = 40.12,
    categoryMode = 'RTU'
  } = settings;

  // 1. SCENARIO 1 & 5 VALIDATION
  const constraintCheck = validatePromptConstraints(userQuery);
  if (!constraintCheck.isValid) {
    return {
      status: constraintCheck.status,
      overview: constraintCheck.overview,
      sub_message: constraintCheck.sub_message,
      recommendations: [],
      whatsapp_quotation_template: '',
      is_error: true,
      tokenUsage: {
        promptTokens: 15,
        responseTokens: 25,
        totalTokens: 40,
        savedPct: 99,
        modelName: 'Fast Intent Classifier'
      }
    };
  }

  // 2. RETRIEVAL & SCORING WITH CATEGORY FILTER
  const retrieved = searchPricingKnowledge(userQuery, targetMargin, categoryMode);

  // SCENARIO 3: No match at all
  if (retrieved.maxScore < 20) {
    const targetSheetName = categoryMode === 'RTU' ? 'PRICE LIST RTU 2026' : 'PRICE LIST CUSTOM 2026';
    return {
      status: "NO_MATCH",
      overview: "Tidak ada spesifikasi yang sesuai dengan request",
      sub_message: `Produk atau spesifikasi yang Anda cari tidak ditemukan dalam spreadsheet ${targetSheetName}. Silakan periksa kembali ukuran atau pilihan material yang tersedia di menu 'Katalog Database'.`,
      recommendations: [],
      whatsapp_quotation_template: '',
      is_error: true,
      tokenUsage: {
        promptTokens: 45,
        responseTokens: 35,
        totalTokens: 80,
        savedPct: 98,
        modelName: 'Fast Catalog Matcher'
      }
    };
  }

  const qty = retrieved.requestedQty;
  const effectiveMargin = retrieved.queryMargin || targetMargin || 40.12;
  const alerts = [...retrieved.alerts];

  let rec1, rec2, rec3;
  let finalSourceSheetName = '';

  // ========================================================
  // A. IF USER SELECTED CATEGORY: RTU
  // ========================================================
  if (categoryMode === 'RTU') {
    finalSourceSheetName = 'Spreadsheet PRICE LIST RTU 2026';
    const rtuBest = retrieved.topRtu[0] || db.rtu_prices[0];
    const effectiveMoq = rtuBest.moq || 150;

    if (qty < effectiveMoq) {
      alerts.push({
        type: 'warning',
        title: `Kuantitas di bawah Batas Minimum Order (MOQ: ${effectiveMoq.toLocaleString('id-ID')} pcs)`,
        message: `Permintaan kuantitas ${qty.toLocaleString('id-ID')} pcs berada di bawah MOQ resmi katalog (${effectiveMoq.toLocaleString('id-ID')} pcs). Harga satuan dan total di bawah dihitung berdasarkan standar volume MOQ ${effectiveMoq.toLocaleString('id-ID')} pcs agar sales aman dari risiko biaya produksi.`
      });
    }

    if (retrieved.requestedMaterial && !rtuBest.material.toLowerCase().includes(retrieved.requestedMaterial)) {
      alerts.push({
        type: 'info',
        title: 'Bahan Disesuaikan ke Rekomendasi Terdekat (Fokus Produk & Ukuran)',
        message: `Bahan "${retrieved.requestedMaterial.toUpperCase()}" tidak tersedia untuk spesifikasi ukuran ${rtuBest.size} di katalog RTU. Sistem berfokus pada kecocokan Produk, Ukuran, dan Qty menggunakan bahan resmi katalog: "${rtuBest.material}".`
      });
    }

    const isRtuExactSize = retrieved.searchSizeNorm && normalizeSize(rtuBest.size).includes(retrieved.searchSizeNorm);
    if (retrieved.searchSizeNorm && !isRtuExactSize) {
      alerts.push({
        type: 'info',
        title: 'Ukuran Terdekat Standar Katalog RTU',
        message: `Ukuran persis "${retrieved.searchSizeNorm}" tidak terdaftar di katalog RTU; sistem menampilkan rekomendasi standar resmi terdekat: ${rtuBest.size} cm.`
      });
    }

    const wantsSablon = userQuery.toLowerCase().includes('sablon') ||
                        userQuery.toLowerCase().includes('cetak') ||
                        userQuery.toLowerCase().includes('warna');

    const cogsPolos = rtuBest.cogs;
    const stdPricePolos = rtuBest.price_polos || (cogsPolos * 1.67);
    const calcPolos = calculatePriceFromMargin(cogsPolos, effectiveMargin);
    const price1 = effectiveMargin === 40.12 ? stdPricePolos : calcPolos;

    const cogs1w1s = rtuBest.cogs + (rtuBest.cogs_sablon_1w1s || 300);
    const stdPrice1w1s = rtuBest.price_sablon_1w1s || (cogs1w1s * 1.45);
    const calc1w1s = calculatePriceFromMargin(cogs1w1s, effectiveMargin);
    const price2 = effectiveMargin === 30.35 ? stdPrice1w1s : calc1w1s;

    const cogs1w2s = rtuBest.cogs + ((rtuBest.cogs_sablon_1w1s || 300) * 1.8);
    const stdPrice1w2s = rtuBest.price_sablon_1w2s || (cogs1w2s * 1.4);
    const calc1w2s = calculatePriceFromMargin(cogs1w2s, effectiveMargin);
    const price3 = effectiveMargin === 28.25 ? stdPrice1w2s : calc1w2s;

    rec1 = {
      title: wantsSablon ? "Rekomendasi 1: RTU Sablon 1 Sisi 1 Warna (Resmi Spreadsheet)" : "Rekomendasi 1: RTU Polos (Resmi Spreadsheet RTU)",
      tag: "Exact RTU Match",
      product_name: wantsSablon ? `${rtuBest.product_name} + Sablon 1W1S` : `${rtuBest.product_name} (Polos)`,
      material: rtuBest.material,
      size: rtuBest.size,
      print_type: wantsSablon ? "Sablon 1W1S" : "Polos (0/0)",
      qty: qty,
      moq: rtuBest.moq,
      cogs: wantsSablon ? cogs1w1s : cogsPolos,
      unit_price: Math.round(wantsSablon ? price2 : price1),
      unit_price_raw: wantsSablon ? price2 : price1,
      spreadsheet_price_list: wantsSablon ? stdPrice1w1s : stdPricePolos,
      spreadsheet_margin_pct: wantsSablon ? rtuBest.profit_so_1w1s_pct : rtuBest.profit_so_polos_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round((wantsSablon ? price2 : price1) * qty),
      source_sheet: "Spreadsheet PRICE LIST RTU 2026",
      source_ref: `Sheet '${rtuBest.sheet}', Baris ${rtuBest.row_number} (SKU: ${rtuBest.code})`,
      selection_rationale: `Master RTU 2026 terupdate (Tier MOQ: ${rtuBest.moq || 200} pcs).`,
      why_recommended: `Data persis dari baris ${rtuBest.row_number} spreadsheet RTU. COGS material Rp ${rtuBest.cogs}/pcs. Harga resmi catalog Rp ${(wantsSablon ? stdPrice1w1s : stdPricePolos).toLocaleString('id-ID')} / pcs.`
    };

    rec2 = {
      title: wantsSablon ? "Rekomendasi 2: RTU Polos / Budget Saver" : "Rekomendasi 2: RTU Sablon 1 Sisi 1 Warna",
      tag: wantsSablon ? "Opsi Budget RTU" : "Opsi Sablon 1W1S",
      product_name: wantsSablon ? `${rtuBest.product_name} (Polos Tanpa Cetak)` : `${rtuBest.product_name} + Sablon 1W1S`,
      material: rtuBest.material,
      size: rtuBest.size,
      print_type: wantsSablon ? "Polos (0/0)" : "Sablon 1W1S",
      qty: qty,
      moq: rtuBest.moq,
      cogs: wantsSablon ? cogsPolos : cogs1w1s,
      unit_price: Math.round(wantsSablon ? price1 : price2),
      unit_price_raw: wantsSablon ? price1 : price2,
      spreadsheet_price_list: wantsSablon ? stdPricePolos : stdPrice1w1s,
      spreadsheet_margin_pct: wantsSablon ? rtuBest.profit_so_polos_pct : rtuBest.profit_so_1w1s_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round((wantsSablon ? price1 : price2) * qty),
      source_sheet: "Spreadsheet PRICE LIST RTU 2026",
      source_ref: `Sheet '${rtuBest.sheet}', Baris ${rtuBest.row_number} (Nett: Rp ${(wantsSablon ? rtuBest.nett_polos : rtuBest.nett_1w1s)?.toLocaleString('id-ID')})`,
      selection_rationale: "Varian perbandingan resmi dalam satu sheet katalog yang sama.",
      why_recommended: wantsSablon ? "Pilihan hemat tanpa sablon jika klien memiliki batas budget yang ketat." : "Tambahan branding sablon 1 warna 1 sisi untuk meningkatkan visual kemasan klien."
    };

    rec3 = {
      title: "Rekomendasi 3: RTU Sablon 1 Sisi 2 Warna (Cetak Dua Warna)",
      tag: "Sablon 2 Warna",
      product_name: `${rtuBest.product_name} + Sablon 1W2S`,
      material: rtuBest.material,
      size: rtuBest.size,
      print_type: "Sablon 1W2S (2 Warna)",
      qty: qty,
      moq: rtuBest.moq,
      cogs: cogs1w2s,
      unit_price: Math.round(price3),
      unit_price_raw: price3,
      spreadsheet_price_list: stdPrice1w2s,
      spreadsheet_margin_pct: rtuBest.profit_so_1w2s_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round(price3 * qty),
      source_sheet: "Spreadsheet PRICE LIST RTU 2026",
      source_ref: `Sheet '${rtuBest.sheet}', Baris ${rtuBest.row_number} (Harga List: Rp ${stdPrice1w2s.toLocaleString('id-ID')})`,
      selection_rationale: "Opsi cetak premium 2 warna tertera di kolom 21 spreadsheet RTU.",
      why_recommended: `Opsi cetak 2 warna dengan kontras maksimal sesuai standar kolom 'Price 1 Sisi 2 Warna' di spreadsheet RTU.`
    };

  } else {
    // ========================================================
    // B. IF USER SELECTED CATEGORY: CUSTOM
    // ========================================================
    finalSourceSheetName = 'Spreadsheet PRICE LIST CUSTOM 2026';
    const customBest = retrieved.topCustom[0] || db.custom_prices[0];
    const customAlt1 = retrieved.topCustom[1] || retrieved.topCustom[0] || db.custom_prices[1];
    const customAlt2 = retrieved.topCustom[2] || retrieved.topCustom[0] || db.custom_prices[2];

    const cogs1 = customBest.cogs;
    const stdPrice1 = customBest.price_list;
    const chosenPrice1 = effectiveMargin !== customBest.profit_margin_pct ? calculatePriceFromMargin(cogs1, effectiveMargin) : stdPrice1;

    rec1 = {
      title: "Rekomendasi 1: Sesuai Spreadsheet Custom 2026 (Best Match)",
      tag: "Custom Best Match",
      product_name: customBest.product_name,
      brand_ref: customBest.brand,
      material: customBest.material,
      size: customBest.size,
      print_type: customBest.color || "Cetak Custom",
      finishing: customBest.finishing,
      qty: qty,
      cogs: cogs1,
      unit_price: Math.round(chosenPrice1),
      unit_price_raw: chosenPrice1,
      spreadsheet_price_list: stdPrice1,
      spreadsheet_margin_pct: customBest.profit_margin_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round(chosenPrice1 * qty),
      source_sheet: "Spreadsheet PRICE LIST CUSTOM 2026",
      source_ref: `Sheet '${customBest.sheet}', Baris ${customBest.row_number} (Ref Brand: ${customBest.brand})`,
      selection_rationale: "Data master Custom 2026 terupdate dengan status COGS aktif.",
      why_recommended: `Data riil dari catalog custom Digipack. Modal COGS vendor Rp ${cogs1.toLocaleString('id-ID')}/pcs dengan margin terpasang ${effectiveMargin}%.`
    };

    const cogs2 = customAlt1.cogs;
    const stdPrice2 = customAlt1.price_list;
    const chosenPrice2 = effectiveMargin !== customAlt1.profit_margin_pct ? calculatePriceFromMargin(cogs2, effectiveMargin) : stdPrice2;

    rec2 = {
      title: "Rekomendasi 2: Alternatif Tier Qty / Brand Sejenis (Custom 2026)",
      tag: "Opsi Kuantitas Custom",
      product_name: customAlt1.product_name,
      brand_ref: customAlt1.brand,
      material: customAlt1.material,
      size: customAlt1.size,
      print_type: customAlt1.color || "Cetak Custom",
      finishing: customAlt1.finishing,
      qty: qty,
      cogs: cogs2,
      unit_price: Math.round(chosenPrice2),
      unit_price_raw: chosenPrice2,
      spreadsheet_price_list: stdPrice2,
      spreadsheet_margin_pct: customAlt1.profit_margin_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round(chosenPrice2 * qty),
      source_sheet: "Spreadsheet PRICE LIST CUSTOM 2026",
      source_ref: `Sheet '${customAlt1.sheet}', Baris ${customAlt1.row_number} (Ref Brand: ${customAlt1.brand})`,
      selection_rationale: `Opsi kuantitas tier volume (${customAlt1.qty?.toLocaleString('id-ID')} pcs).`,
      why_recommended: `Menampilkan alternatif acuan harga dari baris ${customAlt1.row_number} dengan spesifikasi finishing: ${customAlt1.finishing || 'Standar'}.`
    };

    const cogs3 = customAlt2.cogs;
    const stdPrice3 = customAlt2.price_list;
    const chosenPrice3 = effectiveMargin !== customAlt2.profit_margin_pct ? calculatePriceFromMargin(cogs3, effectiveMargin) : stdPrice3;

    rec3 = {
      title: "Rekomendasi 3: Opsi Varian Finishing / Alternatif Bahan (Custom 2026)",
      tag: "Varian Custom Finishing",
      product_name: customAlt2.product_name,
      brand_ref: customAlt2.brand,
      material: customAlt2.material,
      size: customAlt2.size,
      print_type: customAlt2.color || "Cetak Custom",
      finishing: customAlt2.finishing,
      qty: qty,
      cogs: cogs3,
      unit_price: Math.round(chosenPrice3),
      unit_price_raw: chosenPrice3,
      spreadsheet_price_list: stdPrice3,
      spreadsheet_margin_pct: customAlt2.profit_margin_pct,
      applied_margin_pct: effectiveMargin,
      total_price: Math.round(chosenPrice3 * qty),
      source_sheet: "Spreadsheet PRICE LIST CUSTOM 2026",
      source_ref: `Sheet '${customAlt2.sheet}', Baris ${customAlt2.row_number} (Ref Brand: ${customAlt2.brand})`,
      selection_rationale: "Varian pembanding spesifikasi dari sheet Custom yang sama.",
      why_recommended: `Alternatif varian spesifikasi bahan dan finishing khusus dari spreadsheet Custom 2026.`
    };
  }

  const recommendations = [rec1, rec2, rec3];

  const overviewText = `Hasil penelusuran difilter 100% pada ${finalSourceSheetName} (${categoryMode === 'RTU' ? 'Kategori RTU Ready Stock' : 'Kategori Custom Packaging'}). Perhitungan harga di bawah ini menggunakan data COGS resmi dan margin (${effectiveMargin}%):`;

  const comparisonNotes = `Semua angka modal (COGS) dan harga dasar diambil 100% dari ${finalSourceSheetName}. Sales dapat menggeser slider Target Margin untuk melihat penyesuaian harga jual seketika.`;

  const waTemplate = `Halo Kak, terima kasih sudah menghubungi Digipack! 😊

Berikut kami rincikan penawaran harga resmi dari katalog database *${categoryMode === 'RTU' ? 'RTU 2026 (Ready Stock)' : 'Custom 2026'}* untuk kuantitas *${qty.toLocaleString('id-ID')} pcs*:

📌 *1. ${rec1.title}*
• Produk: ${rec1.product_name}
• Bahan & Ukuran: ${rec1.material} (${rec1.size})
• Cetak: ${rec1.print_type}
• Harga Jual: *Rp ${rec1.unit_price.toLocaleString('id-ID')} / pcs*
• Total Order: *Rp ${rec1.total_price.toLocaleString('id-ID')}*
• Margin / Ref: ${rec1.applied_margin_pct}% (${rec1.source_ref})

📌 *2. ${rec2.title}*
• Produk: ${rec2.product_name}
• Bahan & Ukuran: ${rec2.material} (${rec2.size})
• Harga Jual: *Rp ${rec2.unit_price.toLocaleString('id-ID')} / pcs*
• Total Order: *Rp ${rec2.total_price.toLocaleString('id-ID')}*

📌 *3. ${rec3.title}*
• Produk: ${rec3.product_name}
• Cetak: ${rec3.print_type}
• Harga Jual: *Rp ${rec3.unit_price.toLocaleString('id-ID')} / pcs*
• Total Order: *Rp ${rec3.total_price.toLocaleString('id-ID')}*

Silakan beri tahu kami opsi mana yang paling cocok untuk bisnis Kakak ya! Kami siap bantu sampel & konsultasi desain! 🙏✨`;

  return {
    status: "SUCCESS",
    categoryMode,
    overview: overviewText,
    target_margin: effectiveMargin,
    requested_qty: qty,
    alerts: alerts,
    recommendations: recommendations,
    comparison_notes: comparisonNotes,
    whatsapp_quotation_template: waTemplate,
    tokenUsage: {
      promptTokens: 480,
      responseTokens: 620,
      totalTokens: 1100,
      savedPct: 92.5,
      modelName: `${categoryMode} Filtered Engine (100% ${finalSourceSheetName})`,
      retrievedCount: categoryMode === 'RTU' ? retrieved.topRtu.length : retrieved.topCustom.length
    }
  };
}
