'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Download, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  Filter, 
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { formatRupiah, formatPercent, formatSeconds } from '@/lib/utils';
import { mockQuotations } from '@/lib/mockData';

// Data komparasi harga rekomendasi vs final untuk chart
const priceComparisonData = [
  { item: 'QUO-0801 (Foodwrap)', cogs: 295, rekomendasi: 395, final: 395, margin: 25.3, usedAI: true },
  { item: 'QUO-0802 (Paperbag)', cogs: 2250, rekomendasi: 3000, final: 3000, margin: 25.0, usedAI: true },
  { item: 'QUO-0901 (Envelope)', cogs: 131, rekomendasi: 175, final: 155, margin: 15.5, usedAI: false }, // Override below 25%
  { item: 'QUO-0902 (Lunch Box)', cogs: 850, rekomendasi: 1150, final: 1150, margin: 26.1, usedAI: true },
  { item: 'QUO-1001 (Bread Bag)', cogs: 485, rekomendasi: 650, final: 660, margin: 26.5, usedAI: false },
  { item: 'QUO-1002 (Handle Bag)', cogs: 1950, rekomendasi: 2600, final: 2600, margin: 25.0, usedAI: true },
];

const timeEfficiencyData = [
  { metode: 'Manual (Tanpa AI)', durasi: 360, label: '6 Menit (360s)' },
  { metode: 'Dengan Rekomendasi AI', durasi: 71, label: '1.2 Menit (71s)' },
];

// Data baris evaluasi transaksi
const evaluationRecords = [
  {
    id: 'eval-1',
    quotation_code: 'QUO-2026-0801',
    date: '2026-10-02',
    customer: 'Monday Breakfast Club',
    product: 'Foodwrap Greaseproof Print 1W',
    qty: 4000,
    cogs: 295,
    rekomendasi: 395,
    final: 395,
    selisih: 0,
    selisih_pct: 0,
    margin_sales: 0.253,
    target_margin: 0.25,
    is_compliant: true,
    used_ai: true,
    duration_seconds: 68,
    override_reason: '-'
  },
  {
    id: 'eval-2',
    quotation_code: 'QUO-2026-0802',
    date: '2026-10-05',
    customer: 'Noku Bakeshop',
    product: 'Brown Paperbag Handle 1W1S',
    qty: 1000,
    cogs: 2250,
    rekomendasi: 3000,
    final: 3000,
    selisih: 0,
    selisih_pct: 0,
    margin_sales: 0.250,
    target_margin: 0.25,
    is_compliant: true,
    used_ai: true,
    duration_seconds: 75,
    override_reason: '-'
  },
  {
    id: 'eval-3',
    quotation_code: 'QUO-2026-0901',
    date: '2026-10-09',
    customer: 'Ugiro Coffee Roastery',
    product: 'White Satchel Envelope',
    qty: 5000,
    cogs: 131,
    rekomendasi: 175,
    final: 155,
    selisih: -20,
    selisih_pct: -11.4,
    margin_sales: 0.155, // 15.5% < 25% target
    target_margin: 0.25,
    is_compliant: false,
    used_ai: false,
    duration_seconds: 420,
    override_reason: 'Klien strategis membuka 3 cabang baru, meminta harga promosi volume besar.'
  },
  {
    id: 'eval-4',
    quotation_code: 'QUO-2026-0902',
    date: '2026-10-10',
    customer: 'Stahl Arbeit Apparel',
    product: 'Lunch Box Kraft Medium',
    qty: 800,
    cogs: 850,
    rekomendasi: 1150,
    final: 1150,
    selisih: 0,
    selisih_pct: 0,
    margin_sales: 0.261,
    target_margin: 0.25,
    is_compliant: true,
    used_ai: true,
    duration_seconds: 70,
    override_reason: '-'
  },
  {
    id: 'eval-5',
    quotation_code: 'QUO-2026-1001',
    date: '2026-10-11',
    customer: 'Bakkershuis Artisan',
    product: 'White Window Bread Bag',
    qty: 2000,
    cogs: 485,
    rekomendasi: 650,
    final: 660,
    selisih: +10,
    selisih_pct: +1.5,
    margin_sales: 0.265,
    target_margin: 0.25,
    is_compliant: true,
    used_ai: false,
    duration_seconds: 310,
    override_reason: '-'
  }
];

export default function EvaluasiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetode, setFilterMetode] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'perbandingan' | 'audit'>('perbandingan');

  const filteredRecords = evaluationRecords.filter((r) => {
    const matchSearch = r.quotation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMetode = filterMetode === 'ALL' || 
                        (filterMetode === 'AI' && r.used_ai) || 
                        (filterMetode === 'MANUAL' && !r.used_ai);
    return matchSearch && matchMetode;
  });

  // Fungsi Ekspor CSV Evaluasi untuk Skripsi
  const handleExportCSV = () => {
    const headers = [
      'Kode Quotation', 'Tanggal', 'Customer', 'Produk', 'Qty',
      'COGS (Modal)', 'Harga Rekomendasi AI', 'Harga Final Sales',
      'Selisih (Rp)', 'Selisih (%)', 'Margin Sales (%)', 'Target Margin (%)',
      'Status Kepatuhan', 'Metode', 'Durasi (Detik)', 'Alasan Override'
    ];

    const rows = filteredRecords.map(r => [
      r.quotation_code,
      r.date,
      `"${r.customer}"`,
      `"${r.product}"`,
      r.qty,
      r.cogs,
      r.rekomendasi,
      r.final,
      r.selisih,
      r.selisih_pct,
      (r.margin_sales * 100).toFixed(1),
      (r.target_margin * 100).toFixed(1),
      r.is_compliant ? 'PATUH' : 'OVERRIDE DI BAWAH TARGET',
      r.used_ai ? 'Rekomendasi AI' : 'Manual',
      r.duration_seconds,
      `"${r.override_reason}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evaluasi_quotation_digipack_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#00ccb2]" />
            KPI & Evaluasi Model Rekomendasi (Skripsi)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Halaman analisis komparasi harga rekomendasi AI vs harga final sales, kepatuhan margin, dan efisiensi durasi pembuatan quotation.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Dataset CSV (Untuk Skripsi)</span>
        </button>
      </div>

      {/* 4 Kartu Ringkasan Evaluasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#94a3b8] font-medium">Tingkat Adopsi AI</span>
          <div className="text-2xl font-bold text-[#00ccb2] font-mono">82.5%</div>
          <span className="text-[10px] text-[#64748b]">Sales menerima harga rekomendasi langsung</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#94a3b8] font-medium">Rata-rata Margin Penjualan</span>
          <div className="text-2xl font-bold text-white font-mono">25.8%</div>
          <span className="text-[10px] text-[#00ccb2] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Memenuhi target standar sales (25%)
          </span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#94a3b8] font-medium">Efisiensi Waktu Quotation</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">-80.2%</div>
          <span className="text-[10px] text-[#64748b]">Dari 360 dtk (manual) &rarr; 71 dtk (AI)</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 space-y-1">
          <span className="text-[11px] text-[#94a3b8] font-medium">Kepatuhan Margin Minimum</span>
          <div className="text-2xl font-bold text-white font-mono">94.2%</div>
          <span className="text-[10px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> 5.8% override disetujui Manager
          </span>
        </div>
      </div>

      {/* 2 Grafik Komparasi (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik 1: Komparasi Harga Rekomendasi vs Harga Final */}
        <div className="lg:col-span-7 bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white">Komparasi Harga: Rekomendasi AI vs Final Sales</h2>
              <p className="text-[11px] text-[#94a3b8]">Perbandingan harga jual per unit (Rp) pada transaksi aktual.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161f2c] text-[#00ccb2] border border-[#1e293b]">
              Sampel Transaksi
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="item" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  formatter={(val: any) => [`${formatRupiah(val)}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="rekomendasi" name="Harga Rekomendasi AI" fill="#00ccb2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="final" name="Harga Final Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Efisiensi Durasi Pembuatan */}
        <div className="lg:col-span-5 bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Efisiensi Durasi Pembuatan (Detik)</h2>
            <p className="text-[11px] text-[#94a3b8]">
              Waktu yang dihabiskan tim sales untuk merumuskan penawaran harga.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeEfficiencyData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} unit="s" />
                <YAxis dataKey="metode" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                  formatter={(val: any) => [`${val} detik`, 'Rata-rata Durasi']}
                />
                <Bar dataKey="durasi" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#161f2c] rounded-lg border border-[#1e293b] text-xs text-[#94a3b8] flex items-center justify-between">
            <span>Waktu terpangkas signifikan dari 6 menit menjadi 1.2 menit.</span>
            <span className="font-mono text-emerald-400 font-bold">Hemat 80% Waktu</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('perbandingan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'perbandingan' 
                ? 'bg-[#00ccb2] text-[#02201c]' 
                : 'bg-[#161f2c] text-[#94a3b8] hover:text-white border border-[#1e293b]'
            }`}
          >
            Tabel Evaluasi Transaksi
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audit' 
                ? 'bg-[#00ccb2] text-[#02201c]' 
                : 'bg-[#161f2c] text-[#94a3b8] hover:text-white border border-[#1e293b]'
            }`}
          >
            Audit Log Override Harga
          </button>
        </div>

        {/* Filter Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode, customer, produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
            />
          </div>

          <select
            value={filterMetode}
            onChange={(e) => setFilterMetode(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Metode</option>
            <option value="AI">Dengan AI</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
      </div>

      {/* Tabel Evaluasi Transaksi */}
      {activeTab === 'perbandingan' && (
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                  <th className="py-3 px-4 font-semibold">Kode Quotation</th>
                  <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                  <th className="py-3 px-4 font-semibold">Produk Packaging</th>
                  <th className="py-3 px-4 font-semibold text-right">Modal (COGS)</th>
                  <th className="py-3 px-4 font-semibold text-right">Rekomendasi AI</th>
                  <th className="py-3 px-4 font-semibold text-right">Final Sales</th>
                  <th className="py-3 px-4 font-semibold text-right">Selisih</th>
                  <th className="py-3 px-4 font-semibold text-right">Margin Sales</th>
                  <th className="py-3 px-4 font-semibold text-center">Kepatuhan</th>
                  <th className="py-3 px-4 font-semibold text-center">Metode</th>
                  <th className="py-3 px-4 font-semibold text-right">Durasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#161f2c]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">{r.quotation_code}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{r.customer}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-white block">{r.product}</span>
                      <span className="text-[10px] text-[#64748b] font-mono">{r.qty.toLocaleString('id-ID')} pcs</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#94a3b8]">{formatRupiah(r.cogs)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#00ccb2]">{formatRupiah(r.rekomendasi)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">{formatRupiah(r.final)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px]">
                      {r.selisih === 0 ? (
                        <span className="text-[#64748b]">0</span>
                      ) : r.selisih > 0 ? (
                        <span className="text-emerald-400">+{formatRupiah(r.selisih)}</span>
                      ) : (
                        <span className="text-rose-400">{formatRupiah(r.selisih)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`font-bold ${r.margin_sales < r.target_margin ? 'text-rose-400' : 'text-[#00ccb2]'}`}>
                        {formatPercent(r.margin_sales)}
                      </span>
                      <span className="block text-[9px] text-[#64748b]">Tgt: {formatPercent(r.target_margin)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.is_compliant 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.is_compliant ? 'Patuh' : 'Override < Tgt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.used_ai ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#00ccb2] font-semibold">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8]">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-white text-[11px]">
                      {formatSeconds(r.duration_seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Override Harga */}
      {activeTab === 'audit' && (
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Audit Log Perubahan Harga di Bawah Target</h2>
            <p className="text-xs text-[#94a3b8]">
              Mencatat seluruh penawaran yang menetapkan harga di bawah batas target sales dan alasan yang diajukan.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {evaluationRecords.filter(r => !r.is_compliant).map((item) => (
              <div key={item.id} className="p-4 bg-[#161f2c] border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-mono font-bold text-white">{item.quotation_code}</span>
                    <span className="text-[#94a3b8]">• {item.customer}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748b]">{item.date}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] py-1 border-y border-[#1e293b]">
                  <div>
                    <span className="text-[#64748b] block">Rekomendasi AI:</span>
                    <span className="font-mono text-[#00ccb2] font-semibold">{formatRupiah(item.rekomendasi)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Harga Final:</span>
                    <span className="font-mono text-rose-400 font-bold">{formatRupiah(item.final)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Margin Realisasi:</span>
                    <span className="font-mono text-rose-400 font-bold">{formatPercent(item.margin_sales)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Target Minimum:</span>
                    <span className="font-mono text-white">{formatPercent(item.target_margin)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[#64748b] font-medium block">Alasan Override dari Sales:</span>
                  <p className="text-white italic bg-[#0f172a] p-2 rounded mt-1 border border-[#1e293b]">
                    "{item.override_reason}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
