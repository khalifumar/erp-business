'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export function Header() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Map pathname to breadcrumb label
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/rfq')) return 'Data RFQ';
    if (pathname.startsWith('/vendor-price')) return 'Vendor Price';
    if (pathname === '/quotation/new') return 'Rekomendasi Harga Jual';
    if (pathname.startsWith('/quotation')) return 'Data Quotation';
    if (pathname.startsWith('/evaluasi')) return 'KPI & Evaluasi Skripsi';
    if (pathname.startsWith('/sales-orders')) return 'Sales Orders';
    return 'ERP';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 bg-[#1e40af] text-white flex items-center justify-between px-6 sticky top-0 z-20 shadow-md">
      {/* Left: Breadcrumbs & System Context */}
      <div className="flex items-center gap-3 text-xs">
        <button className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <Menu className="w-4 h-4 text-white/90" />
        </button>

        <div className="flex items-center gap-2 text-white/90 font-medium">
          <span className="text-white font-semibold">Digipack</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white/80">Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          <span className="text-white font-bold bg-white/15 px-2 py-0.5 rounded text-[11px]">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Right: Tenant Pill, Role Switcher & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Tenant badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/15 hover:bg-white/20 transition-colors text-white px-3 py-1 rounded-full text-xs font-medium cursor-pointer">
          <span className="w-2 h-2 rounded-full bg-[#00ccb2]" />
          <span>Digipack Production</span>
        </div>

        {/* Role Switcher Dropdown (Khusus Uji Coba Skripsi Multi-Role) */}
        <div className="relative">
          <button
            suppressHydrationWarning
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 border border-white/20 px-2.5 py-1 rounded-full transition-all text-xs"
          >
            <div 
              suppressHydrationWarning 
              className="w-6 h-6 rounded-full bg-[#00ccb2] text-[#02201c] font-bold text-[11px] flex items-center justify-center shadow-inner"
            >
              {getInitials(currentUser.full_name)}
            </div>
            <div suppressHydrationWarning className="flex flex-col text-left">
              <span suppressHydrationWarning className="text-[11px] font-semibold text-white leading-tight">
                {currentUser.full_name.split(' ')[0]}
              </span>
              <span suppressHydrationWarning className="text-[9px] uppercase tracking-wider text-[#00ccb2] font-mono leading-tight">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-white/70" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-2 z-50 text-xs text-[#e2e8f0]"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-[#1e293b]">
                <p className="font-semibold text-white">{currentUser.full_name}</p>
                <p className="text-[11px] text-[#94a3b8]">{currentUser.email}</p>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#00ccb2]/20 text-[#00ccb2] border border-[#00ccb2]/30">
                  Role Aktif: {currentUser.role}
                </div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#64748b]">
                  Ganti Role (Demo Skripsi):
                </div>
                <button
                  onClick={() => switchRole('sales')}
                  className="w-full px-4 py-2 text-left hover:bg-[#1e293b] flex items-center gap-2 text-xs"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#00ccb2]" />
                  <span>Sales (Shalsabilla Redwina)</span>
                </button>
                <button
                  onClick={() => switchRole('manager')}
                  className="w-full px-4 py-2 text-left hover:bg-[#1e293b] flex items-center gap-2 text-xs"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manager (Budi Santoso - Approval)</span>
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className="w-full px-4 py-2 text-left hover:bg-[#1e293b] flex items-center gap-2 text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin Operasional</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
