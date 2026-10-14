'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ExternalLink, 
  Filter, 
  Truck, 
  Plus, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  PackageCheck,
  Send
} from 'lucide-react';
import { erpStore, DeliveryRecord } from '@/lib/erpStore';
import { mockCustomers, mockProducts, mockUsers } from '@/lib/mockData';

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salesFilter, setSalesFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State Buat Surat Jalan
  const [rfqSo, setRfqSo] = useState('DIN.58R0.092026-1');
  const [customer, setCustomer] = useState('Monday Breakfast Club');
  const [product, setProduct] = useState('Foodwrap Greaseproof Print 1 Warna');
  const [productDetail, setProductDetail] = useState('D-25090210 Monday Breakfast Club × 6000');
  const [sales, setSales] = useState('Shalsabilla Redwina');
  const [driverName, setDriverName] = useState('Pak Joko (Kurir Logistik)');

  useEffect(() => {
    setDeliveries(erpStore.getDeliveries());
  }, []);

  const handleCreateDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const newDel: DeliveryRecord = {
      id: `del-${Date.now()}`,
      delivery_no: `SJ-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      rfq_so: rfqSo,
      sub_code: `SO: ${rfqSo} • WO: ${rfqSo.replace('R0', 'W0')}`,
      customer: customer,
      company: `PT ${customer}`,
      product: product,
      product_detail: productDetail,
      tipe: 'Digipack',
      sales: sales,
      status: 'On delivery',
      items_count: 1,
      tanggal: '12 October 2026',
      driver_name: driverName
    };

    erpStore.addDelivery(newDel);
    setDeliveries(erpStore.getDeliveries());
    setIsModalOpen(false);
    alert(`Surat Jalan pengiriman untuk ${customer} (${rfqSo}) berhasil dibuat! Status: On delivery.`);
  };

  const handleUpdateStatus = (id: string, newStatus: DeliveryRecord['status']) => {
    erpStore.updateDeliveryStatus(id, newStatus);
    setDeliveries(erpStore.getDeliveries());
  };

  const filtered = deliveries.filter((d) => {
    const matchSearch = 
      d.rfq_so.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSales = salesFilter === 'ALL' || d.sales.toLowerCase().includes(salesFilter.toLowerCase());
    return matchSearch && matchStatus && matchSales;
  });

  const waitingCount = deliveries.filter(d => d.status === 'Waiting').length;
  const onDeliveryCount = deliveries.filter(d => d.status === 'On delivery').length;
  const deliveredCount = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#00ccb2]" />
            Delivery (Pengiriman Barang & Surat Jalan)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Filter aktif: <strong className="text-white">Digipack</strong> • Manajemen armada pengiriman dan bukti terima Surat Jalan pelanggan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Jalan Pengiriman</span>
        </button>
      </div>

      {/* Top 3 Stat Cards (Persis Screenshot Digipack) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#d4d4d4] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Waiting delivery</span>
          </div>
          <span className="text-2xl font-bold text-white font-mono">{waitingCount}</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#d4d4d4] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>On delivery</span>
          </div>
          <span className="text-2xl font-bold text-white font-mono">{onDeliveryCount}</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#d4d4d4] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Delivered (Selesai Kirim)</span>
          </div>
          <span className="text-2xl font-bold text-white font-mono">{deliveredCount}</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-5 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-white">Filter Pengiriman</h2>
          <p className="text-[11px] text-[#94a3b8]">Cari RFQ / SO / customer, atau filter per sales</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="RFQ, SO, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
            >
              <option value="ALL">Semua status</option>
              <option value="Waiting">Waiting</option>
              <option value="On delivery">On delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
            >
              <option value="ALL">Semua sales</option>
              {mockUsers.filter(u => u.role === 'sales').map(s => (
                <option key={s.id} value={s.full_name}>{s.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Hasil */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] flex justify-between items-center text-xs">
          <h2 className="text-sm font-bold text-white">Hasil Pengiriman ({filtered.length})</h2>
          <span className="text-[#64748b]">Terkoneksi langsung ke modul Faktur Invoice</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">RFQ / SO</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold">Product Detail</th>
                <th className="py-3 px-4 font-semibold text-center">Tipe</th>
                <th className="py-3 px-4 font-semibold">Sales</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((del) => (
                <tr key={del.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white block">{del.rfq_so}</span>
                    <span className="text-[10px] text-[#64748b]">{del.sub_code}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{del.customer}</span>
                    <span className="text-[10px] text-[#64748b]">{del.company}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{del.product}</span>
                    <span className="text-[10px] text-[#94a3b8]">{del.product_detail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-white/20 text-white bg-white/5">
                      {del.tipe}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#94a3b8]">{del.sales}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      del.status === 'Delivered' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : del.status === 'On delivery'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        del.status === 'Delivered' ? 'bg-emerald-400' : del.status === 'On delivery' ? 'bg-blue-400' : 'bg-amber-400'
                      }`} />
                      {del.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-white font-medium">{del.items_count}</td>
                  <td className="py-3.5 px-4 text-[#94a3b8] text-[11px] font-mono">{del.tanggal}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {del.status === 'Waiting' && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'On delivery')}
                          className="px-2.5 py-1 rounded bg-blue-500/15 hover:bg-blue-600 text-blue-400 hover:text-white font-medium text-[11px] transition-colors border border-blue-500/30 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      )}

                      {del.status === 'On delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'Delivered')}
                          className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white font-medium text-[11px] transition-colors border border-emerald-500/30 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tiba (Delivered)</span>
                        </button>
                      )}

                      {del.status === 'Delivered' && (
                        <Link
                          href={`/invoice?so=${encodeURIComponent(del.rfq_so)}&customer=${encodeURIComponent(del.customer)}&amount=2370000`}
                          className="px-2.5 py-1 rounded bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-bold text-[11px] transition-colors border border-[#00ccb2]/30 flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Terbitkan Invoice</span>
                        </Link>
                      )}

                      <button
                        onClick={() => alert(`Membuka Surat Jalan Delivery untuk ${del.rfq_so}`)}
                        className="p-1 rounded bg-[#161f2c] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
                        title="Buka Dokumen Surat Jalan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Surat Jalan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00ccb2]" />
                Pembuatan Surat Jalan Pengiriman (Delivery Order)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateDelivery} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">No. RFQ / SO *</label>
                  <input
                    type="text"
                    required
                    value={rfqSo}
                    onChange={(e) => setRfqSo(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer Anonim *</label>
                  <select
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockCustomers.map(c => (
                      <option key={c.id} value={c.company_name}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Produk Kemasan *</label>
                <input
                  type="text"
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Rincian Muatan Koli / Batch</label>
                <input
                  type="text"
                  value={productDetail}
                  onChange={(e) => setProductDetail(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Sales PIC</label>
                  <select
                    value={sales}
                    onChange={(e) => setSales(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockUsers.filter(u => u.role === 'sales').map(s => (
                      <option key={s.id} value={s.full_name}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Driver / Ekspedisi</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
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
                  Terbitkan Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
