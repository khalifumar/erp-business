'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Building2, 
  Printer,
  ShieldCheck
} from 'lucide-react';
import { erpStore, ProformaInvoiceRecord } from '@/lib/erpStore';
import { formatRupiah } from '@/lib/utils';
import { mockCustomers } from '@/lib/mockData';

export default function ProformaInvoicePage() {
  const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoiceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customer, setCustomer] = useState(mockCustomers[2].company_name);
  const [rfqCode, setRfqCode] = useState('DIN.11R0.102026-1');
  const [totalAmount, setTotalAmount] = useState(3000000);
  const [dpPercentage, setDpPercentage] = useState(50);
  const [bankAccount, setBankAccount] = useState('BCA 8820-192-110 a.n. PT Digipack Kemasan');

  useEffect(() => {
    setProformaInvoices(erpStore.getProformaInvoices());
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const dpAmount = Math.round((totalAmount * dpPercentage) / 100);

  const handleCreatePI = (e: React.FormEvent) => {
    e.preventDefault();
    const piNumber = `PI-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newPI: ProformaInvoiceRecord = {
      id: `pi-${Date.now()}`,
      pi_no: piNumber,
      rfq_code: rfqCode,
      customer: customer,
      total_amount: totalAmount,
      dp_percentage: dpPercentage,
      dp_amount: dpAmount,
      status: 'Pending Payment',
      date: new Date().toISOString().split('T')[0],
      bank_account: bankAccount
    };

    erpStore.addProformaInvoice(newPI);
    setProformaInvoices(erpStore.getProformaInvoices());
    setIsModalOpen(false);
    alert(`Proforma Invoice ${piNumber} untuk uang muka ${formatRupiah(dpAmount)} (${dpPercentage}%) berhasil dibuat!`);
  };

  const handleConfirmDP = (id: string, piNo: string) => {
    erpStore.markPIPaid(id);
    setProformaInvoices(erpStore.getProformaInvoices());
    alert(`Uang muka untuk ${piNo} telah dikonfirmasi diterima! Produksi siap dijalankan.`);
  };

  const filtered = proformaInvoices.filter((pi) => {
    const matchSearch = 
      pi.pi_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pi.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pi.rfq_code && pi.rfq_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || pi.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#00ccb2]" />
            Proforma Invoice (Faktur Prapembayaran & DP)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Faktur sementara yang diterbitkan sebelum produksi dimulai atau barang dikirim untuk pengikatan uang muka (DP).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proforma Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Proforma Aktif</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{proformaInvoices.length}</span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Uang Muka Diterima (DP Paid)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {formatRupiah(proformaInvoices.filter(p => p.status.includes('Received') || p.status.includes('Paid')).reduce((s, p) => s + p.dp_amount, 0))}
          </span>
        </div>
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Menunggu Pembayaran DP</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {proformaInvoices.filter(p => p.status === 'Pending Payment').length} transaksi
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor PI, customer, RFQ..."
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
            <option value="Pending Payment">Pending Payment</option>
            <option value="DP Received (50%)">DP Received</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Proforma</th>
                <th className="py-3 px-4 font-semibold">Ref Dokumen</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold text-right">Nilai Pesanan</th>
                <th className="py-3 px-4 font-semibold text-right">Kewajiban DP</th>
                <th className="py-3 px-4 font-semibold text-center">Status Pembayaran</th>
                <th className="py-3 px-4 font-semibold">Tanggal Terbit</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((pi) => (
                <tr key={pi.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{pi.pi_no}</td>
                  <td className="py-3.5 px-4 font-mono text-[#00ccb2]">{pi.rfq_code || pi.so_code || '-'}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{pi.customer}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#94a3b8]">{formatRupiah(pi.total_amount)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#00ccb2]">
                    {formatRupiah(pi.dp_amount)} ({pi.dp_percentage}%)
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      pi.status.includes('Received') ? 'badge-approved' : 'badge-waiting'
                    }`}>
                      {pi.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#94a3b8]">{pi.date}</td>
                  <td className="py-3.5 px-4 text-center">
                    {pi.status === 'Pending Payment' ? (
                      <button
                        onClick={() => handleConfirmDP(pi.id, pi.pi_no)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white font-medium text-[11px] transition-colors border border-emerald-500/30"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Konfirmasi DP</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas DP
                      </span>
                    )}
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
                <FileCheck2 className="w-4 h-4 text-[#00ccb2]" />
                Pembuatan Proforma Invoice (Uang Muka)
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreatePI} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-[#94a3b8] mb-1">Ref RFQ / Quotation *</label>
                  <input
                    type="text"
                    required
                    value={rfqCode}
                    onChange={(e) => setRfqCode(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Nilai Total Transaksi (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Persen DP (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={dpPercentage}
                    onChange={(e) => setDpPercentage(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#00ccb2] mb-1 font-bold">Nominal DP (Rp)</label>
                  <div className="w-full bg-[#161f2c] border border-[#00ccb2]/40 rounded-lg px-3 py-2 text-[#00ccb2] font-mono font-bold flex items-center">
                    {formatRupiah(dpAmount)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Rekening Pembayaran Bank</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
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
                  Terbitkan Proforma Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
