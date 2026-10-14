'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Printer, 
  History, 
  Building2,
  FileText,
  CreditCard
} from 'lucide-react';
import { erpStore, InvoiceRecord } from '@/lib/erpStore';
import { formatRupiah } from '@/lib/utils';
import { mockCustomers } from '@/lib/mockData';

function InvoiceContent() {
  const searchParams = useSearchParams();

  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [soCode, setSoCode] = useState(searchParams.get('so') || 'SO-2026-0801');
  const [customer, setCustomer] = useState(searchParams.get('customer') || 'Monday Breakfast Club');
  const [subtotal, setSubtotal] = useState(Number(searchParams.get('amount')) || 2370000);
  const [includePpn, setIncludePpn] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState('TOP 14 Hari');
  const [dueDateDays, setDueDateDays] = useState(14);
  const [notes, setNotes] = useState('Tagihan faktur pengiriman foodwrap greaseproof');

  useEffect(() => {
    setInvoices(erpStore.getInvoices());
    if (searchParams.get('so')) {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const taxPpn = includePpn ? Math.round(subtotal * 0.11) : 0;
  const grandTotal = subtotal + taxPpn;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invNumber = `INV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const newInvoice: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoice_no: invNumber,
      so_code: soCode,
      customer: customer,
      subtotal: subtotal,
      tax_ppn: taxPpn,
      total_amount: grandTotal,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + dueDateDays * 86400000).toISOString().split('T')[0],
      status: 'Unpaid',
      payment_terms: paymentTerms,
      notes: notes
    };

    erpStore.addInvoice(newInvoice);
    setInvoices(erpStore.getInvoices());
    setIsModalOpen(false);
    alert(`Invoice ${invNumber} untuk ${customer} senilai ${formatRupiah(grandTotal)} berhasil diterbitkan!`);
  };

  const handleMarkPaid = (id: string, invNo: string) => {
    if (confirm(`Konfirmasi pembayaran lunas untuk ${invNo}?\nData otomatis disimpan ke Order History.`)) {
      erpStore.markInvoicePaid(id);
      setInvoices(erpStore.getInvoices());
      alert(`Invoice ${invNo} berhasil dilunasi & tercatat dalam riwayat audit Order History!`);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = 
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.so_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const unpaidTotal = invoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.total_amount, 0);
  const paidTotal = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total_amount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#00ccb2]" />
            Invoice (Faktur Penagihan Resmi)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Penerbitan tagihan resmi kepada pelanggan setelah proses transaksi pengiriman barang selesai.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Invoice Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Piutang Berjalan (Unpaid)</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {formatRupiah(unpaidTotal)}
          </span>
          <span className="text-[10px] text-[#64748b] mt-1 block">
            {invoices.filter(i => i.status === 'Unpaid').length} faktur menunggu pelunasan
          </span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Penerimaan Lunas (Paid)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {formatRupiah(paidTotal)}
          </span>
          <span className="text-[10px] text-[#64748b] mt-1 block">
            {invoices.filter(i => i.status === 'Paid').length} transaksi berhasil dicairkan
          </span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Transaksi Faktur</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {formatRupiah(unpaidTotal + paidTotal)}
          </span>
          <span className="text-[10px] text-[#00ccb2] mt-1 block">
            100% Tercatat dalam ERP
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor invoice, customer, SO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#94a3b8]">Status Tagihan:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Status</option>
            <option value="Unpaid">Unpaid (Belum Lunas)</option>
            <option value="Paid">Paid (Lunas)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] text-xs text-[#94a3b8] flex justify-between items-center">
          <span>Menampilkan <strong className="text-white">{filtered.length}</strong> dokumen Invoice</span>
          <span className="text-[11px] text-[#64748b]">Terintegrasi langsung ke Order History saat lunas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">No. Invoice</th>
                <th className="py-3 px-4 font-semibold">Ref Sales Order</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold text-right">Nilai Tagihan</th>
                <th className="py-3 px-4 font-semibold">Syarat & Jatuh Tempo</th>
                <th className="py-3 px-4 font-semibold text-center">Status Pembayaran</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {inv.invoice_no}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#00ccb2]">
                    {inv.so_code}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{inv.customer}</span>
                    <span className="text-[10px] text-[#64748b]">{inv.notes || '-'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                    {formatRupiah(inv.total_amount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-white block font-medium">{inv.payment_terms}</span>
                    <span className="text-amber-400">Jatuh Tempo: {inv.due_date}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      inv.status === 'Paid' ? 'badge-approved' : 'badge-waiting'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {inv.status === 'Unpaid' ? (
                        <button
                          onClick={() => handleMarkPaid(inv.id, inv.invoice_no)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white font-medium text-[11px] transition-colors border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tandai Lunas</span>
                        </button>
                      ) : (
                        <Link
                          href="/order-history"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#161f2c] hover:bg-[#1e293b] text-[#00ccb2] font-medium text-[11px] transition-colors border border-[#1e293b]"
                        >
                          <History className="w-3 h-3" />
                          <span>Histori</span>
                        </Link>
                      )}
                      <button
                        onClick={() => alert(`Mencetak Salinan Faktur Pajak & Invoice ${inv.invoice_no}...`)}
                        className="p-1.5 rounded bg-[#161f2c] hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
                        title="Cetak Faktur"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Terbitkan Invoice Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#00ccb2]" />
                Penerbitan Invoice Tagihan Resmi
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Ref No. Sales Order *</label>
                  <input
                    type="text"
                    required
                    value={soCode}
                    onChange={(e) => setSoCode(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer Anonim *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Subtotal Nilai Pesanan (Rp) *</label>
                <input
                  type="number"
                  min="1"
                  value={subtotal}
                  onChange={(e) => setSubtotal(Number(e.target.value))}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-[#161f2c] rounded-lg border border-[#1e293b]">
                <input
                  type="checkbox"
                  id="ppn"
                  checked={includePpn}
                  onChange={(e) => setIncludePpn(e.target.checked)}
                  className="rounded text-[#00ccb2] focus:ring-0"
                />
                <label htmlFor="ppn" className="text-white cursor-pointer select-none">
                  Kenakan Faktur Pajak PPN 11% ({formatRupiah(Math.round(subtotal * 0.11))})
                </label>
              </div>

              <div className="p-3 bg-[#111827] rounded-lg border border-[#1e293b] flex justify-between items-center font-mono">
                <span className="text-[#94a3b8]">Grand Total Tagihan:</span>
                <span className="text-lg font-bold text-[#00ccb2]">{formatRupiah(grandTotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Terms Pembayaran</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    <option value="Cash Before Delivery">Cash Before Delivery (CBD)</option>
                    <option value="TOP 14 Hari">TOP 14 Hari</option>
                    <option value="TOP 30 Hari">TOP 30 Hari</option>
                    <option value="DP 50% + Pelunasan">DP 50% + Pelunasan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Masa Jatuh Tempo (Hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={dueDateDays}
                    onChange={(e) => setDueDateDays(Number(e.target.value))}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Catatan Tagihan</label>
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
                  Terbitkan Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#94a3b8]">Memuat modul faktur invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
