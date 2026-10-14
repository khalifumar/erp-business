'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthProvider } from '@/context/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#090d14] text-[#f1f5f9] flex">
        {/* Left Fixed Sidebar */}
        <Sidebar />

        {/* Right Main Container */}
        <div className="flex-1 flex flex-col pl-64 min-w-0">
          <Header />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
