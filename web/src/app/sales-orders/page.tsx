'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Truck, 
  Receipt, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  Package,
  Building2,
  ExternalLink
} from 'lucide-react';
import { erpStore, SalesOrderItem } from '@/lib/erpStore';
import { formatRupiah } from '@/lib/utils';
import { mockCustomers, mockProducts, mockUsers } from '@/lib/mockData';

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState(mockCustomers[0].id);
  const [productId, setProductId] = useState(mockProducts[2].id);
  const [qty, setQty] = useState(1000);
  const [unitPrice, setUnitPrice] = useState(3000);
  const [salesId, setSalesId] = useState(mockUsers[2].id);
  const [refQuo, setRefQuo] = useState('QUO-2026-0801');
  const [targetDays, setTargetDays] = useState(14);

  useEffect(() => {
    setSalesOrders(erpStore.getSalesOrders());
  }, []);

  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = mockCustomers.find(c => c.id === customerId) || mockCustomers[0];
    const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
    const sales = mockUsers.find(u => u.id === salesId) || mockUsers[2];
    const soNumber = `SO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const total = qty * unitPrice;

    const newSO: SalesOrderItem = {
      id: `so-${Date.now()}`,
      so_code: soNumber,
      ref_quotation: refQuo,
      customer_name: customer.company_name,
      product_name: product.name,
      qty: qty,
      unit_price: unitPrice,
      total_amount: total,
      status: 'In Production',
      sales_name: sales.full_name,
      created_at: new Date().toISOString().split('T')[0],
      target_delivery: new Date(Date.now() + targetDays * 86400000).toISOString().split('T')[0]
    };

    erpStore.addSalesOrder(newSO);
    setSalesOrders(erpStore.getSalesOrders());
    setIsModalOpen(false);
    alert(`Sales Order ${soNumber} untuk ${customer.company_name} berhasil dibuat!`);
  };

  const handleUpdateStatus = (id: string, newStatus: SalesOrderItem['status']) => {
    erpStore.updateSOStatus(id, newStatus);
    setSalesOrders(erpStore.getSalesOrders());
  };

  const filtered = salesOrders.filter((so) => {
    const matchSearch = 
      so.so_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.ref_quotation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || so.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00ccb2]" />
            Sales Orders (SO)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Akses terpusat untuk memantau status seluruh pesanan penjualan yang masuk dari pelanggan dan memicu proses pengiriman gudang.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Sales Order Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Sales Order</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{salesOrders.length}</span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Dalam Produksi</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {salesOrders.filter(s => s.status === 'In Production').length}
          </span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Siap Kirim (Ready to Ship)</span>
          <span className="text-2xl font-bold text-[#00ccb2] font-mono mt-1 block">
            {salesOrders.filter(s => s.status === 'Ready to Ship').length}
          </span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Nilai Pesanan</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {formatRupiah(salesOrders.reduce((sum, s) => sum + s.total_amount, 0))}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor SO, customer, produk..."
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
            <option value="In Production">In Production</option>
            <option value="Ready to Ship">Ready to Ship</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Sales Order</th>
                <th className="py-3 px-4 font-semibold">Ref Quotation</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold">Spesifikasi Item</th>
                <th className="py-3 px-4 font-semibold text-right">Nilai Transaksi</th>
                <th className="py-3 px-4 font-semibold text-center">Status Alur</th>
                <th className="py-3 px-4 font-semibold">Sales & Target Kirim</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Lanjutan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((so) => (
                <tr key={so.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{so.so_code}</td>
                  <td className="py-3.5 px-4 font-mono text-[#00ccb2]">{so.ref_quotation}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{so.customer_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-white block">{so.product_name}</span>
                    <span className="text-[10px] text-[#94a3b8] font-mono">{so.qty.toLocaleString('id-ID')} pcs</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(so.total_amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      so.status === 'Completed' ? 'badge-approved' :
                      so.status === 'Ready to Ship' ? 'bg-[#00ccb2]/15 text-[#00ccb2] border border-[#00ccb2]/30' : 'badge-waiting'
                    }`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-[#94a3b8] block">{so.sales_name}</span>
                    <span className="text-amber-400">Target: {so.target_delivery}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href="/delivery"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-medium text-[11px] transition-colors border border-[#00ccb2]/30"
                        title="Buat Surat Jalan Delivery"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Kirim (Delivery)</span>
                      </Link>

                      <Link
                        href={`/invoice?so=${so.so_code}&customer=${encodeURIComponent(so.customer_name)}&amount=${so.total_amount}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/15 hover:bg-blue-600 text-blue-400 hover:text-white font-medium text-[11px] transition-colors border border-blue-500/30"
                        title="Terbitkan Faktur Invoice"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Invoice</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#00ccb2]" />
                Pembuatan Dokumen Sales Order Baru
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateSO} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer Anonim *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockCustomers.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Ref Quotation *</label>
                  <input
                    type="text"
                    required
                    value={refQuo}
                    onChange={(e) => setRefQuo(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Spesifikasi Produk *</label>
                <select
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setUnitPrice(e.target.value.includes('d0000005') ? 3000 : 395);
                  }}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                >
                  {mockProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} [{p.category}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Kuantitas Pesanan (Pcs) *</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Harga Satuan Final (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded-lg border border-[#1e293b] flex justify-between items-center font-mono">
                <span className="text-[#94a3b8]">Grand Total Transaksi:</span>
                <span className="text-lg font-bold text-[#00ccb2]">{formatRupiah(qty * unitPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Sales PIC</label>
                  <select
                    value={salesId}
                    onChange={(e) => setSalesId(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockUsers.filter(u => u.role === 'sales').map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Target Kirim (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#161f2c] text-white hover:bg-[#1e293b]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold"
                >
                  Simpan Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
