'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  DollarSign, 
  FileSpreadsheet, 
  ClipboardList,
  ShoppingBag,
  PackageCheck,
  Truck,
  Receipt,
  FileCheck2,
  History,
  CalendarCheck2,
  CreditCard,
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: 'Platform',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'KPI & Evaluasi', href: '/evaluasi', icon: BarChart3 },
    ]
  },
  {
    group: 'Order',
    items: [
      { name: 'Data RFQ', href: '/rfq', icon: FileText },
      { name: 'Vendor Price', href: '/vendor-price', icon: DollarSign },
      { name: 'Data Quotation', href: '/quotation', icon: FileSpreadsheet },
      { name: 'Purchase Order', href: '/purchase-order', icon: ClipboardList },
      { name: 'Sales Order', href: '/sales-orders', icon: ShoppingBag },
      { name: 'Receive Item', href: '/receive-item', icon: PackageCheck },
      { name: 'Delivery', href: '/delivery', icon: Truck },
      { name: 'Invoice', href: '/invoice', icon: Receipt },
      { name: 'Proforma Invoice', href: '/proforma-invoice', icon: FileCheck2 },
      { name: 'Order History', href: '/order-history', icon: History },
    ]
  },
  {
    group: 'Purchase',
    items: [
      { name: 'Purchase Order', href: '/purchase-order', icon: ClipboardList },
    ]
  },
  {
    group: 'Sales',
    items: [
      { name: 'Buat Quotation (AI)', href: '/quotation/new', icon: Sparkles },
      { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingBag },
      { name: 'Aktivitas Harian', href: '/sales/aktivitas-harian', icon: CalendarCheck2 },
    ]
  },
  {
    group: 'Payment Request',
    items: [
      { name: 'Payment Request', href: '/payment-request', icon: CreditCard },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e293b]/60 gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#00ccb2] flex items-center justify-center shadow-lg shadow-[#00ccb2]/20">
          <Layers className="w-5 h-5 text-[#03221e]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            digipack<span className="text-[#00ccb2]">.</span>
          </span>
          <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase font-semibold">ERP System</span>
        </div>
      </div>

      {/* Navigation Groups - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group, groupIdx) => (
          <div key={`${group.group}-${groupIdx}`} className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isSpecial = item.href === '/quotation/new';

                return (
                  <Link
                    key={`${item.name}-${itemIdx}`}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group",
                      isActive
                        ? "bg-[#00ccb2] text-[#02201c] font-bold shadow-md shadow-[#00ccb2]/20"
                        : isSpecial
                          ? "text-[#00ccb2] hover:bg-[#00ccb2]/10 border border-[#00ccb2]/30"
                          : "text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#161f2c]"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive ? "text-[#02201c]" : isSpecial ? "text-[#00ccb2]" : "text-[#94a3b8] group-hover:text-white"
                    )} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#02201c]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1e293b]/60 bg-[#0a0d14]/80 shrink-0">
        <div className="rounded-lg bg-[#111827] p-2.5 border border-[#1e293b] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-white">Engine ML v1.0</span>
            <span className="text-[10px] text-[#00ccb2] flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ccb2] animate-pulse" />
              LightGBM Ready
            </span>
          </div>
          <span className="text-[10px] text-[#64748b] bg-[#1e293b] px-2 py-0.5 rounded">Skripsi</span>
        </div>
      </div>
    </aside>
  );
}
