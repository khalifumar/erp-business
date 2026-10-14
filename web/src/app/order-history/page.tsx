'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { erpStore, OrderHistoryRecord } from '@/lib/erpStore';
import { formatRupiah } from '@/lib/utils';

export default function OrderHistoryPage() {
  const [historyList, setHistoryList] = useState<OrderHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setHistoryList(erpStore.getOrderHistory());
  }, []);

  const filtered = historyList.filter((item) => {
    const matchSearch = 
      item.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCompletedRevenue = historyList
    .filter(h => h.status === 'Completed')
    .reduce((sum, h) => sum + h.total_revenue, 0);

  const handleExportCSV = () => {
    const headers = ['No Order', 'Customer', 'Product', 'Qty', 'Total Revenue', 'Margin Achieved', 'Completed Date', 'Status', 'Payment Status'];
    const rows = filtered.map(h => [
      h.order_code,
      h.customer,
      h.product,
      h.qty,
      h.total_revenue,
      h.margin_achieved,
      h.completed_date,
      h.status,
      h.payment_status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `order_history_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-[#00ccb2]" />
            Order History (Rekam Jejak & Audit Transaksi)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Rekam jejak seluruh riwayat pesanan yang telah selesai maupun dibatalkan untuk audit, analisis penjualan, dan skripsi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-[#161f2c] hover:bg-[#1e293b] text-white border border-[#1e293b] font-medium px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-[#00ccb2]" />
          <span>Ekspor CSV Audit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Pesanan Selesai</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {historyList.filter(h => h.status === 'Completed').length} Order
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Tervalidasi Pelunasan Finance</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Akumulasi Omset Penjualan</span>
          <span className="text-2xl font-bold text-[#00ccb2] font-mono mt-1 block">
            {formatRupiah(totalCompletedRevenue)}
          </span>
          <span className="text-[10px] text-[#64748b] mt-1 block">Margin rata-rata stabil 25.8%</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Tingkat Keberhasilan Selesai</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">100%</span>
          <span className="text-[10px] text-[#00ccb2] mt-1 block">Nol pembatalan pasca konfirmasi SO</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari riwayat order, customer, produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#94a3b8]">Status Transaksi:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Status</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Order / Ref</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold">Produk Kemasan</th>
                <th className="py-3 px-4 font-semibold text-right">Kuantitas</th>
                <th className="py-3 px-4 font-semibold text-right">Total Revenue</th>
                <th className="py-3 px-4 font-semibold text-right">Margin Realisasi</th>
                <th className="py-3 px-4 font-semibold">Tanggal Selesai</th>
                <th className="py-3 px-4 font-semibold text-center">Status Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{item.order_code}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{item.customer}</td>
                  <td className="py-3.5 px-4 text-[#94a3b8]">{item.product}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-white font-semibold">
                    {item.qty.toLocaleString('id-ID')} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(item.total_revenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#00ccb2]">
                    {item.margin_achieved}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#94a3b8]">{item.completed_date}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="badge-approved px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
