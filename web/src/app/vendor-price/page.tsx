'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Upload, 
  FileSpreadsheet, 
  Layers, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { mockVendorPrices, mockProducts, mockVendors } from '@/lib/mockData';
import { formatRupiah } from '@/lib/utils';
import { VendorPrice } from '@/types';

export default function VendorPricePage() {
  const [vendorPrices, setVendorPrices] = useState<VendorPrice[]>(mockVendorPrices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  const filteredPrices = vendorPrices.filter((vp) => {
    const prodName = vp.product?.name.toLowerCase() || '';
    const vendorName = vp.vendor?.vendor_name.toLowerCase() || '';
    const matchesSearch = prodName.includes(searchTerm.toLowerCase()) || vendorName.includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || vp.product?.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSimulateCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImportNotification(`Berhasil memvalidasi dan memuat file '${file.name}'. 8 baris tier harga berhasil disinkronkan.`);
      setTimeout(() => setImportNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Import Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Vendor Price List & Tier Kuantitas
          </h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Katalog harga modal vendor (COGS) dengan batas minimum order (MOQ) dan tier kuantitas bertingkat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 bg-[#161f2c] hover:bg-[#1e293b] border border-[#1e293b] text-white px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-sm">
            <Upload className="w-3.5 h-3.5 text-[#00ccb2]" />
            <span>Impor CSV / Excel</span>
            <input type="file" accept=".csv,.xlsx" onChange={handleSimulateCsvImport} className="hidden" />
          </label>
        </div>
      </div>

      {importNotification && (
        <div className="p-3.5 rounded-lg bg-[#00ccb2]/10 border border-[#00ccb2]/30 text-xs text-[#00ccb2] flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari produk atau nama vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#94a3b8]">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#161f2c] border border-[#1e293b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00ccb2]"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Paper Bag">Paper Bag</option>
            <option value="Food Wrap">Food Wrap</option>
            <option value="Bread Bag">Bread Bag</option>
            <option value="Lunch Box">Lunch Box</option>
          </select>
        </div>
      </div>

      {/* Tabel Harga Vendor */}
      <div className="bg-[#0f1523] border border-[#1e293b] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#131a29] border-b border-[#1e293b] text-[#64748b]">
                <th className="py-3 px-4 font-semibold">Produk Packaging</th>
                <th className="py-3 px-4 font-semibold">Vendor Rekanan</th>
                <th className="py-3 px-4 font-semibold text-center">Tier Kuantitas</th>
                <th className="py-3 px-4 font-semibold text-right">MOQ</th>
                <th className="py-3 px-4 font-semibold text-right">COGS Dasar</th>
                <th className="py-3 px-4 font-semibold text-right">Biaya Sablon</th>
                <th className="py-3 px-4 font-semibold text-right">Total Modal / Unit</th>
                <th className="py-3 px-4 font-semibold text-center">Lead Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60 text-[#d4d4d4]">
              {filteredPrices.map((vp) => {
                const totalUnitCost = vp.cogs_price + vp.cogs_print;
                return (
                  <tr key={vp.id} className="hover:bg-[#161f2c]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="text-white font-semibold block">{vp.product?.name}</span>
                      <span className="text-[10px] text-[#94a3b8]">
                        {vp.product?.category} • {vp.product?.material} • {vp.product?.size}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium block">{vp.vendor?.vendor_name}</span>
                      <span className="text-[10px] text-[#64748b] font-mono">{vp.vendor?.vendor_code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-[#161f2c] px-2.5 py-1 rounded text-[11px] font-mono text-[#00ccb2] border border-[#1e293b]">
                        {vp.qty_min.toLocaleString('id-ID')} – {vp.qty_max >= 999999 ? '999k+' : vp.qty_max.toLocaleString('id-ID')} pcs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-white">
                      {vp.moq.toLocaleString('id-ID')} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#94a3b8]">
                      {formatRupiah(vp.cogs_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#94a3b8]">
                      {vp.cogs_print > 0 ? formatRupiah(vp.cogs_print) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#00ccb2]">
                      {formatRupiah(totalUnitCost)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-[#94a3b8]">
                      {vp.lead_time_days} hari
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
