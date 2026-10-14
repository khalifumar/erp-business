'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  PhoneCall, 
  Users, 
  User,
  Calendar,
  Building2,
  TrendingUp
} from 'lucide-react';
import { erpStore, SalesActivityRecord } from '@/lib/erpStore';
import { mockCustomers, mockUsers } from '@/lib/mockData';

export default function SalesDailyActivityPage() {
  const [activities, setActivities] = useState<SalesActivityRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [salesName, setSalesName] = useState(mockUsers[2].full_name);
  const [customer, setCustomer] = useState(mockCustomers[0].company_name);
  const [activityType, setActivityType] = useState<SalesActivityRecord['activity_type']>('Follow-up WA');
  const [date, setDate] = useState('12 October 2026');
  const [notes, setNotes] = useState('Follow-up penawaran harga kemasan RTU & konfirmasi sample');
  const [status, setStatus] = useState<SalesActivityRecord['status']>('Done');

  useEffect(() => {
    setActivities(erpStore.getSalesActivities());
  }, []);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: SalesActivityRecord = {
      id: `act-${Date.now()}`,
      sales: salesName,
      customer: customer,
      activity_type: activityType,
      date: date,
      notes: notes,
      status: status
    };

    erpStore.addSalesActivity(newAct);
    setActivities(erpStore.getSalesActivities());
    setIsModalOpen(false);
    alert(`Aktivitas harian tim sales berhasil dicatat ke sistem!`);
  };

  const filtered = activities.filter((act) => {
    const matchSearch = 
      act.sales.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.activity_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || act.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-[#00ccb2]" />
            Aktivitas Harian (Log Kegiatan Sales)
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Pencatatan rekam jejak kegiatan sales harian (follow-up prospek, meeting klien, penawaran harga, negosiasi).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-[#00ccb2]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Log Aktivitas</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Total Log Kegiatan</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">{activities.length} Aktivitas</span>
          <span className="text-[10px] text-[#00ccb2] mt-1 block">Tercatat aktif di ERP</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Selesai Dikerjakan (Done)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
            {activities.filter(a => a.status === 'Done').length} Selesai
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Target follow-up tercapai</span>
        </div>

        <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4">
          <span className="text-[11px] text-[#94a3b8] block">Dalam Progres Negosiasi</span>
          <span className="text-2xl font-bold text-amber-400 font-mono mt-1 block">
            {activities.filter(a => a.status === 'In Progress').length} Negosiasi
          </span>
          <span className="text-[10px] text-amber-400 mt-1 block">Potensi konversi closing</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama sales, customer, kegiatan..."
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
            <option value="Done">Done</option>
            <option value="In Progress">In Progress</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">Tanggal</th>
                <th className="py-3 px-4 font-semibold">Sales PIC</th>
                <th className="py-3 px-4 font-semibold">Customer / Lead</th>
                <th className="py-3 px-4 font-semibold">Jenis Kegiatan</th>
                <th className="py-3 px-4 font-semibold">Rincian & Hasil Follow-up</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#161f2c]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#94a3b8]">{item.date}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{item.sales}</td>
                  <td className="py-3.5 px-4 text-white font-medium">{item.customer}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded bg-[#161f2c] border border-[#1e293b] text-[#00ccb2] font-semibold text-[10px]">
                      {item.activity_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#d4d4d4] max-w-md">{item.notes}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                      item.status === 'Done' ? 'badge-approved' : 'badge-waiting'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Aktivitas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-[#0f172a] border-b border-[#1e293b] flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-[#00ccb2]" />
                Catat Log Aktivitas Harian Sales
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#94a3b8] hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Sales PIC *</label>
                  <select
                    value={salesName}
                    onChange={(e) => setSalesName(e.target.value)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    {mockUsers.filter(u => u.role === 'sales' || u.role === 'manager').map(s => (
                      <option key={s.id} value={s.full_name}>{s.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Customer / Klien *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#94a3b8] mb-1">Jenis Aktivitas *</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    <option value="Follow-up WA">Follow-up WA</option>
                    <option value="Meeting Klien">Meeting Klien</option>
                    <option value="Negosiasi Harga">Negosiasi Harga</option>
                    <option value="Update Penawaran">Update Penawaran</option>
                    <option value="Follow-up Delivery">Follow-up Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#94a3b8] mb-1">Status Aktivitas</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00ccb2]"
                  >
                    <option value="Done">Done (Selesai)</option>
                    <option value="In Progress">In Progress (Berjalan)</option>
                    <option value="Scheduled">Scheduled (Terjadwal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Tanggal</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00ccb2]"
                />
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Catatan Hasil & Rencana Tindak Lanjut *</label>
                <textarea
                  rows={3}
                  required
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
                  Simpan Log Aktivitas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
