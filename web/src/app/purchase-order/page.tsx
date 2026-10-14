'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  ArrowRight,
  ExternalLink,
  Building2,
  DollarSign
} from 'lucide-react';
import { erpStore, PurchaseOrderItem } from '@/lib/erpStore';
import { mockVendors, mockProducts } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';

export default function PurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vendorId, setVendorId] = useState(mockVendors[0].id);
  const [productId, setProductId] = useState(mockProducts[2].id);
  const [qty, setQty] = useState(1000);
  const [unitCost, setUnitCost] = useState(2250);
  const [refDoc, setRefDoc] = useState('DIN.58R0.092026-1');
  const [etaDays, setEtaDays] = useState(10);
  const [notes, setNotes] = useState('Pengadaan kertas kraft PE 125 gsm ke vendor utama');

  useEffect(() => {
    setPurchaseOrders(erpStore.getPurchaseOrders());
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = mockVendors.find(v => v.id === vendorId) || mockVendors[0];
    const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
    const poNumber = `PO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const totalCost = qty * unitCost;

    const newPo: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      po_code: poNumber,
      ref_rfq: refDoc,
      vendor_id: vendor.id,
      vendor_name: vendor.vendor_name,
      product_name: product.name,
      qty: qty,
      unit_cost: unitCost,
      total_cost: totalCost,
      status: 'Confirmed',
      order_date: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + etaDays * 86400000).toISOString().split('T')[0],
      notes: notes
    };

    erpStore.addPurchaseOrder(newPo);
    setPurchaseOrders(erpStore.getPurchaseOrders());
    setIsModalOpen(false);
    alert(`Purchase Order ${poNumber} berhasil diterbitkan ke ${vendor.vendor_name}!`);
  };

  const handleUpdateStatus = (id: string, newStatus: PurchaseOrderItem['status']) => {
    erpStore.updatePOStatus(id, newStatus);
    setPurchaseOrders(erpStore.getPurchaseOrders());
  };

  const filtered = purchaseOrders.filter((po) => {
    const matchSearch = 
      po.po_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#00ccb2]" />
            Purchase Order (Pengadaan Perusahaan)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Kelola dan terbitkan komitmen pemesanan bahan baku & kemasan resmi kepada vendor/pemasok.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Purchase Order Baru</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total PO Aktif</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{purchaseOrders.length}</span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Dalam Produksi Vendor</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {purchaseOrders.filter(p => p.status === 'In Production' || p.status === 'Confirmed').length}
          </span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Selesai / Diterima Gudang</span>
          <span className="text-2xl font-bold text-[#00ccb2] font-mono mt-1 block">
            {purchaseOrders.filter(p => p.status === 'Completed' || p.status === 'Received').length}
          </span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Nilai Pengadaan</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {formatRupiah(purchaseOrders.reduce((sum, p) => sum + p.total_cost, 0))}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor PO, vendor, atau produk..."
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
            <option value="Confirmed">Confirmed</option>
            <option value="In Production">In Production</option>
            <option value="Received">Received</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tabel Purchase Order */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] text-xs text-[#94a3b8] flex justify-between items-center">
          <span>Menampilkan <strong className="text-white">{filtered.length}</strong> dokumen Purchase Order</span>
          <span className="text-[11px] text-[#64748b]">Sinkronisasi Otomatis dengan Modul Gudang (Receive Item)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. PO</th>
                <th className="py-3 px-4 font-semibold">Vendor / Pemasok</th>
                <th className="py-3 px-4 font-semibold">Produk & Kuantitas</th>
                <th className="py-3 px-4 font-semibold text-right">Biaya Satuan</th>
                <th className="py-3 px-4 font-semibold text-right">Total Biaya</th>
                <th className="py-3 px-4 font-semibold text-center">Status PO</th>
                <th className="py-3 px-4 font-semibold">Order / ETA</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white block">{po.po_code}</span>
                    <span className="text-[10px] text-[#64748b]">Ref: {po.ref_rfq || po.ref_so || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-white block">{po.vendor_name}</span>
                    <span className="text-[10px] text-[#64748b]">{po.notes || 'Pengadaan Reguler'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{po.product_name}</span>
                    <span className="text-[10px] text-[#00ccb2] font-mono font-bold">
                      {po.qty.toLocaleString('id-ID')} pcs
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#94a3b8]">
                    {formatRupiah(po.unit_cost)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(po.total_cost)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      po.status === 'Completed' || po.status === 'Received' ? 'badge-approved' :
                      po.status === 'In Production' ? 'badge-waiting' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-[#94a3b8] block">Tgl: {po.order_date}</span>
                    <span className="text-amber-400 font-semibold">ETA: {po.eta}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {po.status !== 'Completed' && (
                        <Link
                          href={`/receive-item?po=${po.po_code}&vendor=${encodeURIComponent(po.vendor_name)}&product=${encodeURIComponent(po.product_name)}&qty=${po.qty}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-medium text-[11px] transition-colors border border-[#00ccb2]/30"
                        >
                          <Package className="w-3 h-3" />
                          <span>Terima Barang</span>
                        </Link>
                      )}
                      {po.status === 'Completed' && (
                        <Link
                          href={`/payment-request?ref=${po.po_code}&vendor=${encodeURIComponent(po.vendor_name)}&amount=${po.total_cost}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/15 hover:bg-blue-600 text-blue-400 hover:text-white font-medium text-[11px] transition-colors border border-blue-500/30"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Ajukan Bayar</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat PO Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#00ccb2]" />
                Penerbitan Dokumen Purchase Order
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreatePO} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[#94a3b8] mb-1">Vendor / Supplier Pemasok *</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                >
                  {mockVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.vendor_name} ({v.speciality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Produk Spesifikasi *</label>
                <select
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setUnitCost(e.target.value.includes('d0000005') ? 2250 : 185);
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
                  <label className="block text-[#94a3b8] mb-1">Kuantitas Pemesanan (Pcs) *</label>
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
                  <label className="block text-[#94a3b8] mb-1">Biaya Satuan / COGS (Rp) *</label>
                  <input
                    type="number"
                    min="1"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#111827] rounded-lg border border-[#1e293b] flex justify-between items-center font-mono">
                <span className="text-[#94a3b8]">Total Nilai PO:</span>
                <span className="text-base font-bold text-[#00ccb2]">{formatRupiah(qty * unitCost)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Estimasi Lead Time (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={etaDays}
                    onChange={(e) => setEtaDays(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">No. Ref RFQ / Transaksi</label>
                  <input
                    type="text"
                    value={refDoc}
                    onChange={(e) => setRefDoc(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Catatan Khusus PO</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                />
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
                  Simpan & Terbitkan PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
