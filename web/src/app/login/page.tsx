'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ShieldCheck, Briefcase, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockUsers } from '@/lib/mockData';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, switchRole } = useAuth();
  const [email, setEmail] = useState('shalsabilla@digipack.id');
  const [password, setPassword] = useState('password123');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || mockUsers[2];
    setCurrentUser(user);
    router.push('/');
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    switchRole(role);
    router.push('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f1523] border border-[#1e293b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#00ccb2] flex items-center justify-center mx-auto shadow-lg shadow-[#00ccb2]/20">
            <Layers className="w-7 h-7 text-[#02201c]" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Digipack ERP System
          </h1>
          <p className="text-xs text-[#94a3b8]">
            Masuk untuk mengakses modul RFQ, Quotation, dan Engine Rekomendasi Harga Jual.
          </p>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-white font-medium mb-1">Email Pengguna</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@digipack.id"
                className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161f2c] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-white placeholder-[#64748b] focus:outline-none focus:border-[#00ccb2]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#00ccb2] hover:bg-[#00b39b] text-[#02201c] font-bold text-xs transition-all shadow-lg shadow-[#00ccb2]/20 flex items-center justify-center gap-1.5"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="pt-4 border-t border-[#1e293b] space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] block text-center">
            Atau Masuk Instan Berdasarkan Role (Demo Skripsi):
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickRoleLogin('sales')}
              className="p-2 rounded-lg bg-[#161f2c] hover:bg-[#1e293b] border border-[#1e293b] text-center space-y-1 transition-colors group"
            >
              <Briefcase className="w-4 h-4 text-[#00ccb2] mx-auto" />
              <span className="text-[10px] text-white font-semibold block">Sales</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('manager')}
              className="p-2 rounded-lg bg-[#161f2c] hover:bg-[#1e293b] border border-[#1e293b] text-center space-y-1 transition-colors group"
            >
              <UserCheck className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[10px] text-white font-semibold block">Manager</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('admin')}
              className="p-2 rounded-lg bg-[#161f2c] hover:bg-[#1e293b] border border-[#1e293b] text-center space-y-1 transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto" />
              <span className="text-[10px] text-white font-semibold block">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
