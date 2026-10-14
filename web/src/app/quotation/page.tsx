'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { mockQuotations } from '@/lib/mockData';
import { formatRupiah, formatPercent, formatSeconds } from '@/lib/utils';
import { Quotation } from '@/types';

export default function QuotationListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setQuotations(erpStore.getQuotations());
  }, []);

  const handleApprove = (id: string, code: string) => {
    if (confirm(`Setujui penawaran ${code}?\nSistem otomatis menerbitkan Sales Order (SO) dan Purchase Order (PO).`)) {
      erpStore.approveQuotation(id);
      setQuotations(erpStore.getQuotations());
      alert(`Quotation ${code} berhasil disetujui!\nSales Order & Purchase Order telah dibuat secara otomatis.`);
    }
  };

  const filtered = quotations.filter((q) => {
    const matchSearch = 
      q.quotation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Data Quotation
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Daftar seluruh penawaran harga penjualan kemasan yang telah diterbitkan tim sales.
          </p>
        </div>

        <Link
          href="/quotation/new"
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-semibold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Quotation Baru (AI)</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode penawaran atau customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#94a3b8]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Status</option>
            <option value="approved">Approved</option>
            <option value="waiting_approval">Waiting Approval</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Quotation */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">Kode Quotation</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold">Item & Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Harga Final</th>
                <th className="py-3 px-4 font-semibold text-right">Margin (%)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Metode AI</th>
                <th className="py-3 px-4 font-semibold text-right">Durasi Pengerjaan</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((quo) => {
                const item = quo.items?.[0];
                return (
                  <tr key={quo.id} className="hover:bg-[#161f2c]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">{quo.quotation_code}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium block">{quo.customer?.company_name}</span>
                      <span className="text-[10px] text-[#64748b] font-mono">{quo.customer?.customer_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white block">{item?.product?.name}</span>
                      <span className="text-[10px] text-[#94a3b8] font-mono">{item?.qty.toLocaleString('id-ID')} pcs</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatRupiah(quo.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`font-semibold ${item?.is_below_margin ? 'text-rose-400' : 'text-[#00ccb2]'}`}>
                        {item ? formatPercent(item.margin_percentage) : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        quo.status === 'approved' ? 'badge-approved' : 
                        quo.status === 'waiting_approval' ? 'badge-waiting' : 'badge-draft'
                      }`}>
                        {quo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item?.used_recommendation ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#00ccb2] font-semibold">
                          <Sparkles className="w-3 h-3" /> AI
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8]">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px]">
                      {item?.duration_seconds ? formatSeconds(item.duration_seconds) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {quo.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(quo.id, quo.quotation_code)}
                            className="px-2.5 py-1 rounded bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-semibold text-[11px] transition-colors border border-[#00ccb2]/30"
                          >
                            Setujui (Approve)
                          </button>
                        )}
                        <button 
                          onClick={() => alert(`Detail Quotation: ${quo.quotation_code}\nCustomer: ${quo.customer?.company_name}\nTotal: ${formatRupiah(quo.total_amount)}`)}
                          className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-[11px] transition-colors"
                        >
                          Detail
                        </button>
                      </div>
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
