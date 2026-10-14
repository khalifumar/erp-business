'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Package, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine 
} from 'recharts';
import { formatRupiah, formatPercent, formatSeconds } from '@/lib/utils';
import { mockQuotations, mockRFQs } from '@/lib/mockData';

const marginTrendData = [
  { month: 'Mei 26', margin: 64.2, target: 67 },
  { month: 'Jun 26', margin: 65.1, target: 67 },
  { month: 'Jul 26', margin: 66.4, target: 67 },
  { month: 'Ags 26', margin: 67.2, target: 67 },
  { month: 'Sep 26', margin: 66.9, target: 67 },
  { month: 'Okt 26', margin: 67.5, target: 67 },
];

export default function DashboardPage() {
  const totalRFQ = 1194;
  const totalQuotation = 983;
  const completedOrders = 60;
  const totalRevenue = 284204720;
  const avgMargin = 0.668;
  const aiAdoption = 0.825; // 82.5%
  const avgManualSeconds = 360; // 6 mins
  const avgAiSeconds = 71; // 1.2 mins

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Menampilkan ringkasan operasional Digipack dan evaluasi performa model rekomendasi harga jual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/quotation/new"
            className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat Quotation (AI)</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Dark Stat Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders / RFQ */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#94a3b8]">Total Orders</span>
            <div className="p-2 rounded-lg bg-white/5 text-[#00ccb2]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{totalRFQ.toLocaleString('id-ID')}</span>
            <p className="text-[11px] text-[#64748b] mt-1">Pending: 23</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#94a3b8]">Completed</span>
            <div className="p-2 rounded-lg bg-white/5 text-[#00ccb2]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{completedOrders}</span>
            <p className="text-[11px] text-[#00ccb2] mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> 100% SLA On-Time
            </p>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#94a3b8]">Customers (Anonim)</span>
            <div className="p-2 rounded-lg bg-white/5 text-[#00ccb2]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">2.161</span>
            <p className="text-[11px] text-[#64748b] mt-1">F&B, Bakery, Fashion, Retail</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#94a3b8]">Revenue (completed)</span>
            <div className="p-2 rounded-lg bg-white/5 text-[#00ccb2]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white tracking-tight">{formatRupiah(totalRevenue)}</span>
            <p className="text-[11px] text-[#64748b] mt-1">Gross Billing</p>
          </div>
        </div>
      </div>

      {/* Laporan Transaksi Baris Card (Sesuai Referensi Digipack) */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Laporan Transaksi</h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Jumlah data transaksi per jenis dokumen dan status saat ini.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">RFQ</span>
            <span className="text-lg font-bold">1.194</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">QUOTATION</span>
            <span className="text-lg font-bold">983</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">SALES ORDER</span>
            <span className="text-lg font-bold">483</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">PURCHASE ORDER</span>
            <span className="text-lg font-bold">451</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">WORK ORDER</span>
            <span className="text-lg font-bold">478</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">DELIVERY ORDER</span>
            <span className="text-lg font-bold">339</span>
          </div>
          <div className="bg-white text-zinc-900 rounded-lg p-3 text-center shadow-sm">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">COMPLETED</span>
            <span className="text-lg font-bold">60</span>
          </div>
        </div>
      </div>

      {/* Skripsi Core Metrics: Evaluasi Rekomendasi AI & Tren Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Evaluasi Metrik Skripsi */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-5 lg:col-span-1">
          <div>
            <span className="text-[11px] font-mono text-[#00ccb2] tracking-wider uppercase flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5" /> Evaluasi Skripsi
            </span>
            <h2 className="text-base font-semibold text-white mt-1">Efektivitas Rekomendasi Harga</h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              Dampak penerapan model hibrida LightGBM + Margin Guardrail 67%.
            </p>
          </div>

          <div className="space-y-4">
            {/* Rata-rata margin */}
            <div className="p-3.5 rounded-lg bg-[#161f2c] border border-[#1e293b]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Rata-rata Margin Penjualan</span>
                <span className="font-bold text-[#00ccb2]">{formatPercent(avgMargin)}</span>
              </div>
              <div className="w-full bg-[#1e293b] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#00ccb2] h-full rounded-full" style={{ width: '99%' }} />
              </div>
              <span className="text-[10px] text-[#64748b] mt-1.5 block">Target Kebijakan: 67.0%</span>
            </div>

            {/* AI Recommendation Adoption */}
            <div className="p-3.5 rounded-lg bg-[#161f2c] border border-[#1e293b]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Adopsi Rekomendasi AI</span>
                <span className="font-bold text-white">{formatPercent(aiAdoption)}</span>
              </div>
              <div className="w-full bg-[#1e293b] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '82.5%' }} />
              </div>
              <span className="text-[10px] text-[#64748b] mt-1.5 block">82.5% penawaran disetujui tanpa modifikasi harga</span>
            </div>

            {/* Durasi Pembuatan */}
            <div className="p-3.5 rounded-lg bg-[#161f2c] border border-[#1e293b] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">Efisiensi Waktu Quotation</span>
                <span className="text-emerald-400 font-bold text-xs">-80.2% Waktu</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-[#0f1523] p-2 rounded border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] block">Manual</span>
                  <span className="text-xs font-semibold text-rose-300">{formatSeconds(avgManualSeconds)}</span>
                </div>
                <div className="bg-[#0f1523] p-2 rounded border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] block">Dengan AI</span>
                  <span className="text-xs font-semibold text-[#00ccb2]">{formatSeconds(avgAiSeconds)}</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/evaluasi"
            className="w-full block text-center py-2 text-xs font-medium text-[#00ccb2] hover:text-white bg-[#00ccb2]/10 hover:bg-[#00ccb2]/20 border border-[#00ccb2]/30 rounded-lg transition-all"
          >
            Buka Detail Analisis Evaluasi &rarr;
          </Link>
        </div>

        {/* Kolom Kanan: Recharts Grafik Tren Margin Bulanan */}
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-4 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Tren Margin Realisasi vs Target 67%</h2>
              <p className="text-xs text-[#94a3b8]">
                Stabilitas pencapaian profit margin 6 bulan terakhir (Mei – Oktober 2026).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ccb2]" />
                <span className="text-[#94a3b8] text-[11px]">Realisasi Margin (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400" />
                <span className="text-[#94a3b8] text-[11px]">Target (67%)</span>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ccb2" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00ccb2" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 72]} stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: '#f8fafc' 
                  }}
                  formatter={(val: any) => [`${val}%`, 'Margin']}
                />
                <ReferenceLine y={67} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Target 67%', fill: '#fbbf24', fontSize: 10, position: 'right' }} />
                <Area 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#00ccb2" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#marginGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#161f2c] rounded-lg border border-[#1e293b] text-xs text-[#94a3b8] flex items-center justify-between">
            <span>Model ML LightGBM secara konsisten menjaga rekomendasi margin di rentang 66.4% - 67.5%.</span>
            <span className="font-mono text-[#00ccb2] font-semibold text-[11px]">MAPE: 2.07%</span>
          </div>
        </div>
      </div>

      {/* Tabel Quotation Terbaru */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Quotation Terbaru</h2>
            <p className="text-xs text-[#94a3b8]">Daftar penawaran harga terbaru yang diajukan oleh tim sales.</p>
          </div>
          <Link href="/quotation" className="text-xs text-[#00ccb2] hover:underline flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b] font-medium">
                <th className="pb-3 font-semibold">Kode Quotation</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Sales PIC</th>
                <th className="pb-3 font-semibold text-right">Total Nilai</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-center">Metode</th>
                <th className="pb-3 font-semibold text-right">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {mockQuotations.map((quo) => {
                const item = quo.items?.[0];
                return (
                  <tr key={quo.id} className="hover:bg-[#161f2c]/50 transition-colors">
                    <td className="py-3 font-mono font-medium text-white">{quo.quotation_code}</td>
                    <td className="py-3">
                      <span className="text-white font-medium">{quo.customer?.company_name}</span>
                      <span className="block text-[10px] text-[#64748b] font-mono">{quo.customer?.customer_code}</span>
                    </td>
                    <td className="py-3 text-xs">{quo.sales?.full_name}</td>
                    <td className="py-3 text-right font-medium text-white">{formatRupiah(quo.total_amount)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        quo.status === 'approved' ? 'badge-approved' : 
                        quo.status === 'waiting_approval' ? 'badge-waiting' : 'badge-draft'
                      }`}>
                        {quo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {item?.used_recommendation ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#00ccb2] font-medium">
                          <Sparkles className="w-3 h-3" /> AI Rec
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8]">Manual</span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-xs">
                      {item?.duration_seconds ? formatSeconds(item.duration_seconds) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
