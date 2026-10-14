'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2, 
  CheckCheck,
  FileText,
  UserCheck
} from 'lucide-react';
import { erpStore, PaymentRequestRecord } from '@/lib/erpStore';
import { formatRupiah } from '@/lib/utils';
import { mockVendors } from '@/lib/mockData';

function PaymentRequestContent() {
  const searchParams = useSearchParams();

  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vendor, setVendor] = useState(searchParams.get('vendor') || mockVendors[0].vendor_name);
  const [refDoc, setRefDoc] = useState(searchParams.get('ref') || 'PO-2026-0901');
  const [amount, setAmount] = useState(Number(searchParams.get('amount')) || 1770000);
  const [purpose, setPurpose] = useState('Pelunasan tagihan invoice supplier pengadaan bahan kertas');
  const [requestedBy, setRequestedBy] = useState('Handoko (Purchasing)');

  useEffect(() => {
    setPaymentRequests(erpStore.getPaymentRequests());
    if (searchParams.get('ref')) {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    const prNumber = `PR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newPR: PaymentRequestRecord = {
      id: `pr-${Date.now()}`,
      request_no: prNumber,
      vendor: vendor,
      amount: amount,
      purpose: purpose,
      ref_document: refDoc,
      requested_by: requestedBy,
      status: 'Pending Finance',
      date: new Date().toISOString().split('T')[0]
    };

    erpStore.addPaymentRequest(newPR);
    setPaymentRequests(erpStore.getPaymentRequests());
    setIsModalOpen(false);
    alert(`Payment Request ${prNumber} senilai ${formatRupiah(amount)} berhasil diajukan ke Finance!`);
  };

  const handleApproveFinance = (id: string, reqNo: string) => {
    if (confirm(`Setujui & cairkan dana untuk pengajuan ${reqNo}?`)) {
      erpStore.approvePaymentRequest(id);
      setPaymentRequests(erpStore.getPaymentRequests());
      alert(`Pengajuan dana ${reqNo} telah disetujui & dicairkan oleh Finance!`);
    }
  };

  const filtered = paymentRequests.filter((pr) => {
    const matchSearch = 
      pr.request_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.ref_document.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || pr.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingAmount = paymentRequests
    .filter(p => p.status === 'Pending Finance' || p.status === 'Draft')
    .reduce((sum, p) => sum + p.amount, 0);

  const approvedAmount = paymentRequests
    .filter(p => p.status === 'Approved Finance' || p.status === 'Disbursed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#00ccb2]" />
            Payment Request (Pengajuan Pencairan Dana)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Formulir pengajuan pencairan dana operasional transaksi & pembayaran invoice vendor ke bagian Keuangan (Finance).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Dana Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Menunggu Approval Finance</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {formatRupiah(pendingAmount)}
          </span>
          <span className="text-[10px] text-[#64748b] mt-1 block">
            {paymentRequests.filter(p => p.status === 'Pending Finance').length} pengajuan antrean
          </span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Disetujui / Dicairkan</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {formatRupiah(approvedAmount)}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Telah dibayarkan ke Vendor</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Transaksi Pengeluaran</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {formatRupiah(pendingAmount + approvedAmount)}
          </span>
          <span className="text-[10px] text-[#00ccb2] mt-1 block">Akuntabilitas Keuangan 100%</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no PR, vendor, keperluan..."
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
            <option value="Pending Finance">Pending Finance</option>
            <option value="Approved Finance">Approved Finance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Pengajuan</th>
                <th className="py-3 px-4 font-semibold">Penerima Dana (Vendor)</th>
                <th className="py-3 px-4 font-semibold">Keperluan & No. Ref</th>
                <th className="py-3 px-4 font-semibold text-right">Jumlah Dana (Rp)</th>
                <th className="py-3 px-4 font-semibold">Pemohon & Tanggal</th>
                <th className="py-3 px-4 font-semibold text-center">Status Approval</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Finance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((pr) => (
                <tr key={pr.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{pr.request_no}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{pr.vendor}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-white block">{pr.purpose}</span>
                    <span className="text-[10px] text-[#00ccb2] font-mono">Ref: {pr.ref_document}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(pr.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-white block">{pr.requested_by}</span>
                    <span className="text-[#94a3b8]">{pr.date}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      pr.status.includes('Approved') || pr.status.includes('Disbursed') ? 'badge-approved' : 'badge-waiting'
                    }`}>
                      {pr.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {pr.status === 'Pending Finance' ? (
                      <button
                        onClick={() => handleApproveFinance(pr.id, pr.request_no)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white font-medium text-[11px] transition-colors border border-emerald-500/30"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Setujui & Cairkan</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Dicairkan
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Pengajuan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00ccb2]" />
                Form Pengajuan Pencairan Dana ke Finance
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreatePR} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Penerima Dana (Vendor) *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">No. Dokumen Referensi *</label>
                  <input
                    type="text"
                    required
                    value={refDoc}
                    onChange={(e) => setRefDoc(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Nominal Pengajuan Dana (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Keperluan / Keterangan Transaksi *</label>
                <textarea
                  rows={2}
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Staff Pemohon (Internal)</label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
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
                  Kirim Pengajuan ke Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentRequestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#94a3b8]">Memuat modul payment request...</div>}>
      <PaymentRequestContent />
    </Suspense>
  );
}
