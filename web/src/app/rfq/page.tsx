'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Sparkles, 
  X, 
  FileText, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  User,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import { erpStore } from '@/lib/erpStore';
import { mockRFQs, mockCustomers, mockProducts, mockUsers } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';
import { RFQ } from '@/types';

interface OrderItemRow {
  productId: string;
  qty: number;
  pricePerUnit: number;
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [salesFilter, setSalesFilter] = useState<string>('ALL');

  useEffect(() => {
    setRfqs(erpStore.getRFQs());
  }, []);

  // State Modal "Create New Order / RFQ"
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. BASIC INFORMATION
  const [rfqNumber, setRfqNumber] = useState<string>('');
  const [customerPoNumber, setCustomerPoNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>('2026-10-12');

  // 2. CUSTOMER & SALES
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(mockCustomers[0].id);
  const [selectedSalesId, setSelectedSalesId] = useState<string>(mockUsers[2].id);

  // 3. ORDER DETAILS
  const [prospect, setProspect] = useState<string>('Tidak Tahu');
  const [stockType, setStockType] = useState<string>('Vendor');

  // 4. PAYMENT & NOTES
  const [paymentTerm, setPaymentTerm] = useState<string>('Cash Before Delivery');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // 5. ORDER ITEMS
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([
    { productId: mockProducts[2].id, qty: 1000, pricePerUnit: 3000 }
  ]);

  // 6. ORDER SUMMARY
  const [diskonNominal, setDiskonNominal] = useState<number>(0);

  // Helper auto-generate RFQ & PO number saat modal dibuka
  const handleOpenCreateModal = () => {
    const randomSeq = String(Math.floor(Math.random() * 90) + 10);
    const randomMonth = '092026-1';
    setRfqNumber(`DIN.${randomSeq}R0.${randomMonth}`);
    setCustomerPoNumber(`PO-DIN-${randomSeq}W1-2026`);
    setIsModalOpen(true);
  };

  const currentCustomer = mockCustomers.find(c => c.id === selectedCustomerId) || mockCustomers[0];

  // Kalkulasi Item & Summary
  const calculateItemTotal = (item: OrderItemRow) => {
    return item.qty * item.pricePerUnit;
  };

  const subtotal = orderItems.reduce((acc, curr) => acc + calculateItemTotal(curr), 0);
  const grandTotal = Math.max(0, subtotal - diskonNominal);

  // Handler Item Manipulation
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: mockProducts[0].id, qty: 1000, pricePerUnit: 1500 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length <= 1) {
      alert("Pesanan minimal harus memiliki 1 item.");
      return;
    }
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, newProdId: string) => {
    const newItems = [...orderItems];
    newItems[index].productId = newProdId;
    // Set default price unit estimation
    newItems[index].pricePerUnit = newProdId.includes('d0000005') ? 3000 : 1500;
    setOrderItems(newItems);
  };

  const handleItemQtyChange = (index: number, newQty: number) => {
    const newItems = [...orderItems];
    newItems[index].qty = Math.max(1, newQty);
    setOrderItems(newItems);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const salesObj = mockUsers.find(u => u.id === selectedSalesId) || mockUsers[2];
    const firstProduct = mockProducts.find(p => p.id === orderItems[0].productId) || mockProducts[0];

    const newRfq: RFQ = {
      id: `rfq-${Date.now()}`,
      rfq_code: rfqNumber,
      customer_id: selectedCustomerId,
      sales_id: selectedSalesId,
      product_id: firstProduct.id,
      requested_qty: orderItems[0].qty,
      target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      notes: `${paymentTerm} • Prospect: ${prospect} • ${orderNotes}`,
      created_at: new Date().toISOString(),
      customer: currentCustomer,
      product: firstProduct,
      sales: salesObj
    };

    erpStore.addRFQ(newRfq);
    setRfqs(erpStore.getRFQs());
    setIsModalOpen(false);
    alert(`Order RFQ ${rfqNumber} berhasil dibuat dengan total ${formatRupiah(grandTotal)}!`);
  };

  const filteredRFQs = rfqs.filter((item) => {
    const matchSearch = 
      item.rfq_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchSales = salesFilter === 'ALL' || item.sales?.id === salesFilter;
    return matchSearch && matchStatus && matchSales;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Data RFQ (Request for Quotation)</h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Daftar permintaan penawaran harga kemasan dari klien sebelum diterbitkan dokumen penawaran resmi.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah RFQ Baru</span>
        </button>
      </div>

      {/* Filter Box */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 space-y-3">
        <span className="text-xs font-semibold text-white">Filter RFQ</span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode RFQ, nama customer, atau produk..."
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
              <option value="ALL">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
            >
              <option value="ALL">Semua Sales</option>
              {mockUsers.filter(u => u.role === 'sales').map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setSalesFilter('ALL'); }}
              className="w-full bg-[#1e293b] hover:bg-[#334155] text-xs text-white font-medium py-2 rounded-lg transition-colors text-center"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data RFQ */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] flex justify-between items-center text-xs">
          <span className="text-[#94a3b8]">Menampilkan <strong className="text-white">{filteredRFQs.length}</strong> data RFQ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">Kode RFQ</th>
                <th className="py-3 px-4 font-semibold">Customer Anonim</th>
                <th className="py-3 px-4 font-semibold">Spesifikasi Produk</th>
                <th className="py-3 px-4 font-semibold text-right">Kuantitas</th>
                <th className="py-3 px-4 font-semibold">Sales PIC</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold">Target Deadline</th>
                <th className="py-3 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filteredRFQs.map((item) => (
                <tr key={item.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white">{item.rfq_code}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{item.customer?.company_name}</span>
                    <span className="text-[10px] text-[#64748b] font-mono">{item.customer?.customer_code} • {item.customer?.segment}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-medium block">{item.product?.name}</span>
                    <span className="text-[10px] text-[#94a3b8]">
                      {item.product?.material} • {item.product?.size} • {item.product?.print_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                    {item.requested_qty.toLocaleString('id-ID')} pcs
                  </td>
                  <td className="py-3.5 px-4 text-[#94a3b8]">{item.sales?.full_name}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      item.status === 'processed' ? 'badge-approved' : 
                      item.status === 'pending' ? 'badge-waiting' : 'badge-rejected'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#94a3b8] text-[11px] font-mono">{item.target_date || '-'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/quotation/new?rfq_code=${item.rfq_code}&customer=${item.customer_id}&product=${item.product_id}&qty=${item.requested_qty}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ccb2]/15 hover:bg-[#00ccb2] text-[#00ccb2] hover:text-[#02201c] font-medium text-[11px] transition-all border border-[#00ccb2]/30"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Buat Quotation</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FULL-FEATURE: CREATE NEW ORDER (PERSIS SESUAI SCREENSHOT DIGIPACK) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#05080f] border border-[#1e293b] rounded-2xl w-full max-w-5xl my-auto overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            
            {/* Modal Top Header (Sesuai Screenshot 1) */}
            <div className="px-6 py-4 bg-[#0a0d14] border-b border-[#1e293b] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Create New Order</h2>
                  <p className="text-xs text-[#94a3b8]">Fill in the information below to create a new order</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#161f2c] hover:bg-[#1e293b] text-white text-xs font-medium border border-[#1e293b] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Orders</span>
              </button>
            </div>

            {/* Modal Body Form Scrollable */}
            <form onSubmit={handleCreateOrder} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
              
              {/* CARD 1: ORDER INFORMATION */}
              <div className="bg-[#090d14] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-[#0d121c] border-b border-[#1e293b] flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Information</h3>
                </div>

                <div className="p-5 space-y-5">
                  {/* BASIC INFORMATION */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Basic Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">RFQ Number * (auto input)</label>
                        <input
                          type="text"
                          readOnly
                          value={rfqNumber}
                          className="w-full bg-[#121824] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Customer PO Number * (auto input)</label>
                        <input
                          type="text"
                          readOnly
                          value={customerPoNumber}
                          className="w-full bg-[#121824] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Transaction Date * (input manual)</label>
                        <input
                          type="date"
                          required
                          value={transactionDate}
                          onChange={(e) => setTransactionDate(e.target.value)}
                          className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00ccb2]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CUSTOMER & SALES */}
                  <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer & Sales
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Customer * (search bar)</label>
                        <div className="relative">
                          <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-3 pr-8 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2] appearance-none"
                          >
                            {mockCustomers.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.company_name} ({c.customer_code} • {c.segment})
                              </option>
                            ))}
                          </select>
                          <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Sales * (search bar)</label>
                        <div className="relative">
                          <select
                            value={selectedSalesId}
                            onChange={(e) => setSelectedSalesId(e.target.value)}
                            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-3 pr-8 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2] appearance-none"
                          >
                            {mockUsers.filter(u => u.role === 'sales').map(s => (
                              <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                            ))}
                          </select>
                          <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ORDER DETAILS */}
                  <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Order Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Prospect * (Dropdown)</label>
                        <select
                          value={prospect}
                          onChange={(e) => setProspect(e.target.value)}
                          className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2]"
                        >
                          <option value="Tidak Tahu">Tidak Tahu</option>
                          <option value="Repeat Order">Repeat Order (Pelanggan Lama)</option>
                          <option value="Prospek Baru">Prospek Baru (Lead Masuk)</option>
                          <option value="Tender / Korporasi">Tender / Kontrak Korporasi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Stock Type * (Dropdown)</label>
                        <select
                          value={stockType}
                          onChange={(e) => setStockType(e.target.value)}
                          className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2]"
                        >
                          <option value="Vendor">Vendor (PO ke Supplier Kemasan)</option>
                          <option value="Ready Stock">Ready Stock (Gudang RTU)</option>
                          <option value="Custom Production">Custom Production</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOMER PIC INFORMATION */}
                  <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer PIC Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Customer PIC Name (auto input)</label>
                        <input
                          type="text"
                          readOnly
                          value={currentCustomer.contact_person || 'PIC Pengadaan'}
                          className="w-full bg-[#121824] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Customer PIC Email (auto input)</label>
                        <input
                          type="text"
                          readOnly
                          value={`procurement@${currentCustomer.customer_code.toLowerCase()}.id`}
                          className="w-full bg-[#121824] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Customer PIC Phone (auto input)</label>
                        <input
                          type="text"
                          readOnly
                          value="0812-3344-5566"
                          className="w-full bg-[#121824] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT & NOTES */}
                  <div className="space-y-3 pt-3 border-t border-[#1e293b]/60">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Payment & Notes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[#94a3b8] mb-1 font-medium">Payment Term</label>
                        <select
                          value={paymentTerm}
                          onChange={(e) => setPaymentTerm(e.target.value)}
                          className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2]"
                        >
                          <option value="Cash Before Delivery">Cash Before Delivery (CBD)</option>
                          <option value="TOP 14 Hari">TOP 14 Hari</option>
                          <option value="TOP 30 Hari">TOP 30 Hari</option>
                          <option value="DP 50% + Pelunasan">DP 50% + Pelunasan</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[#94a3b8] mb-1 font-medium">Notes</label>
                        <input
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Enter any additional notes..."
                          className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2]"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 2: ORDER ITEMS (Sesuai Screenshot 2) */}
              <div className="bg-[#090d14] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-[#0d121c] border-b border-[#1e293b] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Items</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold text-xs transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {orderItems.map((item, index) => {
                    const itemTotal = calculateItemTotal(item);
                    return (
                      <div key={index} className="bg-[#121824] border border-[#1e293b] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-[#1e293b] pb-2">
                          <span className="font-bold text-white text-xs">Item #{index + 1}</span>
                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        {/* Product Search & Select */}
                        <div>
                          <label className="block text-[#94a3b8] mb-1 font-medium">Product *</label>
                          <div className="relative">
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemProductChange(index, e.target.value)}
                              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-3 pr-8 py-2 text-white text-xs focus:outline-none focus:border-[#00ccb2] appearance-none"
                            >
                              {mockProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} [{p.category} • {p.material} • {p.size}]
                                </option>
                              ))}
                            </select>
                            <Search className="w-3.5 h-3.5 text-[#64748b] absolute right-3 top-2.5 pointer-events-none" />
                          </div>
                        </div>

                        {/* Quantity & Total (Rp) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[#94a3b8] mb-1 font-medium">Quantity *</label>
                            <input
                              type="number"
                              min="1"
                              step="50"
                              value={item.qty}
                              onChange={(e) => handleItemQtyChange(index, Number(e.target.value))}
                              className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#00ccb2]"
                            />
                          </div>

                          <div>
                            <label className="block text-[#94a3b8] mb-1 font-medium">Total (Rp)</label>
                            <div className="w-full bg-[#161f2c] border border-blue-500/50 rounded-lg px-3 py-2 text-blue-400 font-mono font-bold text-xs flex items-center">
                              {formatRupiah(itemTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 3: ORDER SUMMARY (Sesuai Screenshot 2) */}
              <div className="bg-[#090d14] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
                <div className="px-5 py-3 bg-[#0d121c] border-b border-[#1e293b]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Order Summary</h3>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-[#94a3b8] text-xs">
                    <span>Subtotal</span>
                    <span className="font-mono text-white font-bold">{formatRupiah(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#94a3b8] text-xs">
                    <span>Diskon (Rp)</span>
                    <div className="w-40">
                      <input
                        type="number"
                        min="0"
                        value={diskonNominal}
                        onChange={(e) => setDiskonNominal(Number(e.target.value))}
                        className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-1.5 text-right text-white font-mono text-xs focus:outline-none focus:border-[#00ccb2]"
                      />
                    </div>
                  </div>

                  {/* GRAND TOTAL BLUE BAR (Persis Screenshot 2) */}
                  <div className="bg-[#2563eb] rounded-xl p-4 flex justify-between items-center text-white shadow-xl shadow-blue-600/20">
                    <span className="text-sm font-bold uppercase tracking-wider">Grand Total</span>
                    <span className="text-2xl font-black font-mono tracking-tight">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bottom Right */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-[#161f2c] hover:bg-[#1e293b] text-white font-medium text-xs transition-colors border border-[#1e293b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold text-xs transition-all shadow-md shadow-[#00ccb2]/20"
                >
                  Create Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
