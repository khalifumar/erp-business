'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  History, 
  AlertTriangle, 
  Check, 
  Send,
  Plus,
  Trash2,
  FileText,
  User,
  Package,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  mockCustomers, 
  mockProducts, 
  mockVendorPrices, 
  mockQuotations 
} from '@/lib/mockData';
import { erpStore } from '@/lib/erpStore';
import { fetchPriceRecommendation } from '@/lib/api';
import { formatRupiah, formatPercent, formatSeconds } from '@/lib/utils';
import { RecommendationResponse, Quotation } from '@/types';
import { useAuth } from '@/context/AuthContext';

function NewQuotationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();

  // Timestamp tracking untuk riset skripsi
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // 1. BASIC INFORMATION
  const [rfqNumber, setRfqNumber] = useState<string>(
    searchParams.get('rfq_code') || `RFQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  );
  const [customerPoNumber, setCustomerPoNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 2. CUSTOMER & SALES
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    searchParams.get('customer') || mockCustomers[0].id
  );
  const [stockType, setStockType] = useState<string>('Vendor');
  const [notes, setNotes] = useState<string>('');

  // 3. TARGET MARGIN MINIMUM (DIISI MANUAL OLEH SALES - STANDAR 25%)
  const [manualTargetMargin, setManualTargetMargin] = useState<number>(25); // 25% default

  // 4. ORDER ITEM STATE
  const [selectedProductId, setSelectedProductId] = useState(
    searchParams.get('product') || mockProducts[2].id // Brown Paperbag Handle
  );
  const [qty, setQty] = useState<number>(
    searchParams.get('qty') ? Number(searchParams.get('qty')) : 2000
  );
  const [printType, setPrintType] = useState<string>('Sablon 1W1S');

  // Vendor Pricing State (Auto-detected dari tier kuantitas)
  const [vendorCost, setVendorCost] = useState<number>(2250);
  const [moq, setMoq] = useState<number>(1000);
  const [isBelowMoq, setIsBelowMoq] = useState<boolean>(false);

  // Rekomendasi ML State
  const [isLoadingRec, setIsLoadingRec] = useState<boolean>(false);
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(null);

  // Harga Final Sales
  const [hargaFinal, setHargaFinal] = useState<number>(3000);
  const [diskonNominal, setDiskonNominal] = useState<number>(0);
  const [usedRecommendation, setUsedRecommendation] = useState<boolean>(false);
  const [alasanOverride, setAlasanOverride] = useState<string>('');

  // Hitung Realisasi Margin Penjualan (Gross Margin = (Harga - Modal) / Harga)
  // Atau Margin on COGS = (Harga - Modal) / Modal. Kita tampilkan margin on Sales: (P - C) / P
  const targetMarginDecimal = manualTargetMargin / 100;
  const marginSalesPct = hargaFinal > 0 ? (hargaFinal - vendorCost) / hargaFinal : 0;
  const isBelowTargetMargin = marginSalesPct < targetMarginDecimal;

  // Timer Counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Update Vendor Cost berdasarkan produk & tier qty
  useEffect(() => {
    const matchingPrices = mockVendorPrices.filter(vp => vp.product_id === selectedProductId);
    let matchedVp = matchingPrices.find(vp => qty >= vp.qty_min && qty <= vp.qty_max);

    if (!matchedVp && matchingPrices.length > 0) {
      matchedVp = matchingPrices[0];
    }

    if (matchedVp) {
      let printCost = matchedVp.cogs_print || 0;
      if (printType === 'Polos') printCost = 0;
      else if (printType === 'Sablon 1W2S') printCost = Math.round(printCost * 1.6);

      const totalCost = matchedVp.cogs_price + printCost;
      setVendorCost(totalCost);
      setMoq(matchedVp.moq);
      setIsBelowMoq(qty < matchedVp.moq);

      // Hitung harga default awal berdasarkan Target Margin Sales: Harga = COGS / (1 - TargetMargin)
      const defaultPrice = targetMarginDecimal < 1 
        ? Math.round(totalCost / (1 - targetMarginDecimal))
        : Math.round(totalCost * 1.33);

      setHargaFinal(defaultPrice);
    }
  }, [selectedProductId, qty, printType, manualTargetMargin]);

  // Handler Panggil Engine Rekomendasi ML
  const handleGetRecommendation = async () => {
    const product = mockProducts.find(p => p.id === selectedProductId);
    if (!product) return;

    setIsLoadingRec(true);
    try {
      const payload = {
        category: product.category,
        material: product.material,
        size: product.size,
        color: product.color,
        print_type: printType,
        qty: Number(qty),
        vendor_cost: vendorCost,
        moq: moq,
        min_margin_threshold: targetMarginDecimal
      };

      const result = await fetchPriceRecommendation(payload);
      setRecResult(result);
      setHargaFinal(result.recommended_price);
      setUsedRecommendation(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingRec(false);
    }
  };

  const handleApplyRecommendedPrice = () => {
    if (recResult) {
      setHargaFinal(recResult.recommended_price);
      setUsedRecommendation(true);
      setAlasanOverride('');
    }
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBelowTargetMargin && !alasanOverride.trim()) {
      alert(`Margin penjualan (${formatPercent(marginSalesPct)}) berada di bawah target yang Anda tetapkan (${manualTargetMargin}%).\n\nSilakan isi alasan override untuk meminta persetujuan Manager.`);
      return;
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    const existingQuotes = erpStore.getQuotations();
    const newQuoCode = `QUO-2026-${String(existingQuotes.length + 801).padStart(4, '0')}`;
    const status = isBelowTargetMargin ? 'waiting_approval' : 'approved';
    const prodObj = mockProducts.find(p => p.id === selectedProductId) || mockProducts[0];
    const custObj = mockCustomers.find(c => c.id === selectedCustomerId) || mockCustomers[0];

    const newQuotation: Quotation = {
      id: `quo-${Date.now()}`,
      quotation_code: newQuoCode,
      rfq_id: rfqNumber,
      customer_id: selectedCustomerId,
      sales_id: currentUser.id,
      status: status,
      total_amount: grandTotal,
      notes: notes || `Order ${stockType} • Target Margin ${manualTargetMargin}%`,
      created_at: new Date().toISOString(),
      customer: custObj,
      sales: currentUser,
      items: [
        {
          id: `item-${Date.now()}`,
          quotation_id: `quo-${Date.now()}`,
          product_id: selectedProductId,
          qty: qty,
          vendor_cost: vendorCost,
          harga_rekomendasi: recResult?.recommended_price || hargaFinal,
          harga_rekomendasi_min: recResult?.min_price || Math.round(hargaFinal * 0.95),
          harga_rekomendasi_max: recResult?.max_price || Math.round(hargaFinal * 1.05),
          harga_final: hargaFinal,
          subtotal: grandTotal,
          margin_nominal: hargaFinal - vendorCost,
          margin_percentage: marginSalesPct,
          target_margin_pct: targetMarginDecimal,
          is_below_margin: isBelowTargetMargin,
          alasan_override: alasanOverride || undefined,
          used_recommendation: usedRecommendation,
          duration_seconds: duration,
          product: prodObj
        }
      ]
    };

    erpStore.addQuotation(newQuotation);

    alert(`Quotation ${newQuoCode} berhasil dibuat!\nStatus: ${status.toUpperCase()}\nTarget Margin Sales: ${manualTargetMargin}%\nMargin Realisasi: ${formatPercent(marginSalesPct)}\n${status === 'approved' ? '✨ Otomatis menerbitkan Sales Order (SO) & Purchase Order (PO)!' : 'Menunggu approval manager.'}`);
    router.push('/quotation');
  };

  const currentCustomer = mockCustomers.find(c => c.id === selectedCustomerId);
  const currentProduct = mockProducts.find(p => p.id === selectedProductId);
  const subtotal = hargaFinal * qty;
  const grandTotal = Math.max(0, subtotal - diskonNominal);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Bar: Title & Timer Tracking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/quotation"
            className="p-1.5 rounded-lg bg-[#161f2c] border border-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Create New Order / Quotation
            </h1>
            <p className="text-xs text-[#94a3b8]">
              Isi informasi pesanan dan gunakan engine rekomendasi harga AI untuk kalkulasi optimal.
            </p>
          </div>
        </div>

        {/* Live Tracking Timer untuk Skripsi */}
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#d4d4d4] shadow-sm">
          <Clock className="w-4 h-4 text-[#00ccb2] animate-pulse" />
          <span>Waktu Pengerjaan: <strong className="text-white">{formatSeconds(elapsedSeconds)}</strong></span>
        </div>
      </div>

      <form onSubmit={handleSaveQuotation} className="space-y-6">
        {/* CARD 1: ORDER INFORMATION (Desain Sesuai Screenshot ERP Digipack) */}
        <div className="bg-[#0b0e14] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-[#0f172a] border-b border-[#1e293b] flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-600/20 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white">Order Information</h2>
          </div>

          <div className="p-5 space-y-5 text-xs">
            {/* BASIC INFORMATION */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                Basic Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94a3b8] mb-1">RFQ Number *</label>
                  <input
                    type="text"
                    required
                    value={rfqNumber}
                    onChange={(e) => setRfqNumber(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer PO Number</label>
                  <input
                    type="text"
                    value={customerPoNumber}
                    onChange={(e) => setCustomerPoNumber(e.target.value)}
                    placeholder="PO-EXT-XXXXX"
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>
            </div>

            {/* CUSTOMER & SALES */}
            <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                Customer & Sales
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockCustomers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} ({c.customer_code} • {c.segment})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Sales PIC *</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.full_name} (${currentUser.role.toUpperCase()})`}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-[#94a3b8] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* CUSTOMER PIC INFORMATION */}
            <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                Customer PIC Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer PIC Name</label>
                  <input
                    type="text"
                    readOnly
                    value={currentCustomer?.contact_person || 'PIC Sales'}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-[#d4d4d4]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer PIC Email</label>
                  <input
                    type="text"
                    readOnly
                    value={`order@${currentCustomer?.customer_code.toLowerCase()}.id`}
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-[#d4d4d4]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer PIC Phone</label>
                  <input
                    type="text"
                    readOnly
                    value="0812-9988-7766"
                    className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-[#d4d4d4]"
                  />
                </div>
              </div>
            </div>

            {/* TARGET MARGIN MINIMUM SALES (DIISI MANUAL OLEH SALES!) */}
            <div className="space-y-3 pt-3 border-t border-[#1e293b]/60 bg-[#111827] p-4 rounded-xl border border-[#1e293b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#00ccb2]" />
                    Target Margin Minimum (Diisi Manual oleh Sales)
                  </span>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">
                    Standar default adalah 25%. Sales bebas menyesuaikan target margin minimum untuk quotation ini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      step="1"
                      value={manualTargetMargin}
                      onChange={(e) => setManualTargetMargin(Number(e.target.value))}
                      className="w-full bg-[#161f2c] border border-[#00ccb2]/50 rounded-lg px-3 py-1.5 text-white font-mono font-bold text-sm text-center focus:outline-none focus:border-[#00ccb2]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#00ccb2] font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: ORDER ITEMS & ENGINE REKOMENDASI HARGA AI */}
        <div className="bg-[#0b0e14] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-[#00ccb2]/20 text-[#00ccb2]">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Order Items</h2>
            </div>
            <button
              type="button"
              onClick={() => alert("Tambah multi-item dapat dilakukan setelah item pertama disimpan.")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ccb2] text-[#02201c] font-semibold text-xs hover:bg-[#00b39b] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="p-5 space-y-5 text-xs">
            {/* ITEM #1 CONTAINER */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-[#1e293b] pb-2.5">
                <span className="font-bold text-white text-xs">Item #1</span>
                <span className="text-[10px] text-[#94a3b8]">Packaging Unit</span>
              </div>

              {/* Product Picker */}
              <div>
                <label className="block text-[#94a3b8] mb-1">Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                >
                  {mockProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.category} • {p.material} • {p.size}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Quantity, Jenis Cetak, & COGS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Quantity (Pcs) *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>

                <div>
                  <label className="block text-[#94a3b8] mb-1">Jenis Cetak / Finishing</label>
                  <select
                    value={printType}
                    onChange={(e) => setPrintType(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    <option value="Polos">Polos (Tanpa Cetak)</option>
                    <option value="Sablon 1W1S">Sablon 1 Warna 1 Sisi</option>
                    <option value="Sablon 1W2S">Sablon 1 Warna 2 Sisi</option>
                    <option value="Custom Print">Custom Print Separasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#94a3b8] mb-1">Modal Vendor Terdeteksi (COGS)</label>
                  <div className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono flex justify-between items-center">
                    <span>{formatRupiah(vendorCost)}</span>
                    <span className="text-[10px] text-[#00ccb2]">MOQ: {moq}</span>
                  </div>
                </div>
              </div>

              {/* MOQ Alert Banner */}
              {isBelowMoq && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Kuantitas ({qty} pcs) di bawah batas MOQ vendor ({moq} pcs). Peringatan margin bocor!</span>
                </div>
              )}

              {/* ENGINE REKOMENDASI HARGA JUAL BOX */}
              <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#00ccb2]" />
                      Engine Rekomendasi Harga Jual (Machine Learning)
                    </span>
                    <p className="text-[11px] text-[#94a3b8]">
                      Model LightGBM menganalisis spesifikasi, tier kuantitas, dan riwayat transaksi untuk rekomendasi harga terbaik.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetRecommendation}
                    disabled={isLoadingRec}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold text-xs transition-all shadow-md shadow-[#00ccb2]/20 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isLoadingRec ? 'animate-spin' : ''}`} />
                    <span>{isLoadingRec ? 'Menghitung...' : 'Rekomendasikan Harga'}</span>
                  </button>
                </div>

                {/* HASIL INFERENSI REKOMENDASI */}
                {recResult && (
                  <div className="pt-3 border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in duration-200">
                    {/* Kartu Harga */}
                    <div className="md:col-span-4 bg-[#161f2c] border border-[#00ccb2]/40 rounded-xl p-3.5 text-center space-y-1">
                      <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Harga Rekomendasi AI</span>
                      <div className="text-2xl font-black text-[#00ccb2] font-mono">
                        {formatRupiah(recResult.recommended_price)}
                      </div>
                      <div className="text-[10px] text-[#94a3b8] flex justify-between pt-1 border-t border-[#1e293b]">
                        <span>Rentang:</span>
                        <span className="text-white font-mono">{formatRupiah(recResult.min_price)} - {formatRupiah(recResult.max_price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyRecommendedPrice}
                        className="w-full mt-2 py-1 bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-semibold rounded text-[11px] transition-colors border border-[#00ccb2]/30 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Terapkan Harga Ini
                      </button>
                    </div>

                    {/* 3 Faktor Penentu */}
                    <div className="md:col-span-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        3 Faktor Penentu Terbesar
                      </span>
                      {recResult.top_factors.map((f, i) => (
                        <div key={i} className="p-2 bg-[#161f2c] rounded border border-[#1e293b] text-[10px] leading-tight">
                          <strong className="text-white block">{f.factor}</strong>
                          <span className="text-[#94a3b8]">{f.description}</span>
                        </div>
                      ))}
                    </div>

                    {/* 3 Transaksi Serupa */}
                    <div className="md:col-span-4 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block flex items-center gap-1">
                        <History className="w-3 h-3 text-[#00ccb2]" /> Transaksi Historis Terdekat
                      </span>
                      {recResult.similar_transactions.map((tx, i) => (
                        <div key={i} className="p-2 bg-[#161f2c] rounded border border-[#1e293b] flex justify-between items-center text-[10px]">
                          <div>
                            <span className="text-white block font-medium">{tx.product_name}</span>
                            <span className="text-[#64748b] font-mono">{tx.qty} pcs</span>
                          </div>
                          <span className="text-[#00ccb2] font-mono font-bold">{formatRupiah(tx.selling_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* INPUT HARGA FINAL OLEH SALES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-white font-medium mb-1">Harga Jual Final / Unit (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={hargaFinal}
                    onChange={(e) => {
                      setHargaFinal(Number(e.target.value));
                      if (recResult && Number(e.target.value) !== recResult.recommended_price) {
                        setUsedRecommendation(false);
                      }
                    }}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-1">Total Nilai Item</label>
                  <div className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-sm font-bold">
                    {formatRupiah(subtotal)}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-1">Realisasi Margin Penjualan</label>
                  <div className={`w-full rounded-lg px-3 py-2 font-mono text-sm font-bold flex justify-between items-center border ${
                    isBelowTargetMargin 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-emerald-500/10 border-emerald-500/30 text-[#00ccb2]'
                  }`}>
                    <span>{formatPercent(marginSalesPct)}</span>
                    <span className="text-[10px] font-normal text-[#94a3b8]">Target: {manualTargetMargin}%</span>
                  </div>
                </div>
              </div>

              {/* GUARDRAIL OVERRIDE DI BAWAH TARGET SALES */}
              {isBelowTargetMargin && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Margin Penjualan di Bawah Target ({formatPercent(marginSalesPct)} &lt; {manualTargetMargin}%)</span>
                  </div>
                  <p className="text-[#d4d4d4] text-[11px]">
                    Harga yang Anda tetapkan menghasilkan margin di bawah target minimum yang Anda input. 
                    Anda wajib mengisi alasan rasional untuk persetujuan Manager.
                  </p>
                  <div>
                    <label className="block text-white font-medium mb-1">Alasan Override Harga (Wajib):</label>
                    <textarea
                      rows={2}
                      required
                      value={alasanOverride}
                      onChange={(e) => setAlasanOverride(e.target.value)}
                      placeholder="Contoh: Klien repeat order volume besar, negosiasi harga promosi..."
                      className="w-full bg-[#0f172a] border border-rose-500/50 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD 3: ORDER SUMMARY & SUBMIT BUTTON (Desain Sesuai Screenshot ERP Digipack) */}
        <div className="bg-[#0b0e14] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-[#0f172a] border-b border-[#1e293b]">
            <h2 className="text-sm font-bold text-white">Order Summary</h2>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center text-[#94a3b8]">
              <span>Subtotal</span>
              <span className="font-mono text-white font-semibold">{formatRupiah(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-[#94a3b8]">
              <span>Diskon (Rp)</span>
              <div className="w-36">
                <input
                  type="number"
                  min="0"
                  value={diskonNominal}
                  onChange={(e) => setDiskonNominal(Number(e.target.value))}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-1.5 text-right text-white font-mono text-xs focus:outline-none focus:border-[#00ccb2]"
                />
              </div>
            </div>

            {/* GRAND TOTAL BLUE BAR (Persis seperti Screenshot erp-digipack.id) */}
            <div className="bg-[#2563eb] rounded-xl p-4 flex justify-between items-center text-white shadow-lg">
              <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
              <span className="text-2xl font-black font-mono tracking-tight">{formatRupiah(grandTotal)}</span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <Link
                href="/quotation"
                className="px-5 py-2.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white font-medium text-xs transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold text-xs transition-all shadow-md shadow-[#00ccb2]/20 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Create Order</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#94a3b8]">Memuat formulir...</div>}>
      <NewQuotationForm />
    </Suspense>
  );
}
