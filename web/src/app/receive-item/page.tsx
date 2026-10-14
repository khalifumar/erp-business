'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PackageCheck, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Truck, 
  ClipboardCheck, 
  Building2,
  Calendar,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { erpStore, ReceiveItemRecord } from '@/lib/erpStore';

function ReceiveItemContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [receiveItems, setReceiveItems] = useState<ReceiveItemRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [poCode, setPoCode] = useState(searchParams.get('po') || 'PO-2026-0901');
  const [vendorName, setVendorName] = useState(searchParams.get('vendor') || 'Mitra Kemasan Utama (SP0001)');
  const [productName, setProductName] = useState(searchParams.get('product') || 'Foodwrap Greaseproof Print 1 Warna');
  const [vendorDeliveryNote, setVendorDeliveryNote] = useState('SJ-VEND-8821');
  const [qtyOrdered, setQtyOrdered] = useState(Number(searchParams.get('qty')) || 6000);
  const [qtyReceived, setQtyReceived] = useState(Number(searchParams.get('qty')) || 6000);
  const [qtyPassed, setQtyPassed] = useState(Number(searchParams.get('qty')) || 5980);
  const [qtyReject, setQtyReject] = useState(20);
  const [qcStatus, setQcStatus] = useState<ReceiveItemRecord['qc_status']>('QC Passed');
  const [warehouseStaff, setWarehouseStaff] = useState('Bambang (Gudang QC)');
  const [notes, setNotes] = useState('Kondisi cetak tajam, lem rapi, 20 pcs reject sobek saat loading');

  useEffect(() => {
    setReceiveItems(erpStore.getReceiveItems());
    if (searchParams.get('po')) {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveReceive = (e: React.FormEvent) => {
    e.preventDefault();
    const rcvCode = `RCV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newRecord: ReceiveItemRecord = {
      id: `rcv-${Date.now()}`,
      receipt_code: rcvCode,
      po_code: poCode,
      vendor_name: vendorName,
      product_name: productName,
      delivery_note_vendor: vendorDeliveryNote,
      qty_ordered: qtyOrdered,
      qty_received: qtyReceived,
      qty_passed: qtyPassed,
      qty_reject: qtyReject,
      qc_status: qcStatus,
      receive_date: new Date().toISOString().split('T')[0],
      warehouse_staff: warehouseStaff,
      notes: notes
    };

    erpStore.addReceiveItem(newRecord);
    setReceiveItems(erpStore.getReceiveItems());
    setIsModalOpen(false);
    alert(`Penerimaan barang ${rcvCode} untuk ${poCode} berhasil disimpan! Status: ${qcStatus}`);
  };

  const filtered = receiveItems.filter((item) => {
    const matchSearch = 
      item.receipt_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.po_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.qc_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-[#00ccb2]" />
            Receive Item (Penerimaan Gudang & QC)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Pencatatan fisik saat barang tiba dari pemasok, verifikasi kuantitas, dan inspeksi Quality Control (QC).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Penerimaan Barang</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94a3b8] block">Total Penerimaan</span>
            <span className="text-2xl font-bold text-white font-mono mt-1 block">{receiveItems.length}</span>
          </div>
          <ClipboardCheck className="w-8 h-8 text-[#00ccb2]/30" />
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94a3b8] block">Lolos QC (Ready Kirim)</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              {receiveItems.filter(i => i.qc_status === 'QC Passed').length}
            </span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94a3b8] block">Ada Catatan Reject / Defect</span>
            <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
              {receiveItems.filter(i => i.qty_reject > 0).length}
            </span>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-400/30" />
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode penerimaan, PO, atau vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#94a3b8]">Status QC:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Status QC</option>
            <option value="QC Passed">QC Passed</option>
            <option value="QC Partial Passed">QC Partial Passed</option>
            <option value="QC Rejected">QC Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] text-xs text-[#94a3b8]">
          Menampilkan <strong className="text-white">{filtered.length}</strong> log penerimaan gudang
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Penerimaan</th>
                <th className="py-3 px-4 font-semibold">Ref PO / Vendor</th>
                <th className="py-3 px-4 font-semibold">Produk Kemasan</th>
                <th className="py-3 px-4 font-semibold text-right">Dipesan / Masuk</th>
                <th className="py-3 px-4 font-semibold text-right">QC Good / Reject</th>
                <th className="py-3 px-4 font-semibold text-center">Hasil QC</th>
                <th className="py-3 px-4 font-semibold">Tgl & Staff QC</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white block">{item.receipt_code}</span>
                    <span className="text-[10px] text-[#64748b]">SJ: {item.delivery_note_vendor || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[#00ccb2] block font-semibold">{item.po_code}</span>
                    <span className="text-[10px] text-[#94a3b8]">{item.vendor_name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{item.product_name}</span>
                    <span className="text-[10px] text-[#64748b]">{item.notes || 'Pemeriksaan standar'}</span>
                  </td>
                  {/* <td className="py-3.5 px-4 text-right font-mono">
                    <span className="text-white font-bold block">{item.qty_received.toLocaleString('id-ID')} pcs</span>
                    <span className="text-[10px] text-[#94a3b8]">PO: {item.qty_ordered.toLocaleString('id-ID')}</span>
                  </td> */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="text-emerald-400 font-bold block">{item.qty_passed.toLocaleString('id-ID')} passed</span>
                    {item.qty_reject > 0 && (
                      <span className="text-rose-400 text-[10px]">{item.qty_reject} reject</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      item.qc_status === 'QC Passed' ? 'badge-approved' :
                      item.qc_status === 'QC Partial Passed' ? 'badge-waiting' : 'badge-rejected'
                    }`}>
                      {item.qc_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-white block">{item.receive_date}</span>
                    <span className="text-[#94a3b8]">{item.warehouse_staff}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href="/delivery"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-medium text-[11px] transition-colors border border-[#00ccb2]/30"
                    >
                      <Truck className="w-3 h-3" />
                      <span>Siap Kirim (Delivery)</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Penerimaan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#00ccb2]" />
                Pencatatan Penerimaan Barang & QC Gudang
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleSaveReceive} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">No. PO Referensi *</label>
                  <input
                    type="text"
                    required
                    value={poCode}
                    onChange={(e) => setPoCode(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">No. Surat Jalan Vendor *</label>
                  <input
                    type="text"
                    required
                    value={vendorDeliveryNote}
                    onChange={(e) => setVendorDeliveryNote(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Vendor / Pemasok *</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Produk Kemasan *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Qty Tiba Fisik</label>
                  <input
                    type="number"
                    min="1"
                    value={qtyReceived}
                    onChange={(e) => {
                      const rec = Number(e.target.value);
                      setQtyReceived(rec);
                      setQtyPassed(rec - qtyReject);
                    }}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 mb-1 font-bold">Qty Good (Passed)</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyPassed}
                    onChange={(e) => setQtyPassed(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-emerald-500/50 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 mb-1 font-bold">Qty Reject</label>
                  <input
                    type="number"
                    min="0"
                    value={qtyReject}
                    onChange={(e) => {
                      const rej = Number(e.target.value);
                      setQtyReject(rej);
                      setQtyPassed(qtyReceived - rej);
                    }}
                    className="w-full bg-[#161f2c] border border-rose-500/50 rounded-lg px-3 py-2 text-rose-400 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Status Verifikasi QC *</label>
                  <select
                    value={qcStatus}
                    onChange={(e) => setQcStatus(e.target.value as any)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    <option value="QC Passed">QC Passed (Lolos 100%)</option>
                    <option value="QC Partial Passed">QC Partial Passed (Ada Reject)</option>
                    <option value="QC Rejected">QC Rejected (Ditolak Total)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Petugas Gudang QC</label>
                  <input
                    type="text"
                    value={warehouseStaff}
                    onChange={(e) => setWarehouseStaff(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Catatan Fisik / Hasil Uji Lab Lapangan</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00ccb2]"
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
                  Konfirmasi Penerimaan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReceiveItemPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#94a3b8]">Memuat modul penerimaan...</div>}>
      <ReceiveItemContent />
    </Suspense>
  );
}
