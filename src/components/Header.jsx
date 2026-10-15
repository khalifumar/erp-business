// src/components/Header.jsx
import React from 'react';
import {
  Download,
  Edit3,
  Moon,
  Sun,
  Database,
  FileCode,
  Sparkles,
  Menu
} from 'lucide-react';

export default function Header({
  theme,
  onToggleTheme,
  onOpenSpreadsheetHub,
  onOpenTemplateModal,
  onNewChat,
  onToggleMobileSidebar
}) {
  return (
    <header className="top-nav">
      <div className="top-nav-left">
        {/* Mobile Hamburger Menu */}
        <button
          className="icon-btn mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Buka Menu"
          title="Buka menu riwayat & database"
        >
          <Menu size={20} />
        </button>

        <div className="sales-portal-pill">
          <Sparkles size={14} color="#1a73e8" />
          <span className="sales-pill-text-full">Sales Price Assistant • Gemini 3.8 Flash</span>
          <span className="sales-pill-text-short">Sales AI • Flash</span>
        </div>
      </div>

      <div className="top-nav-right">
        {/* Template AI Button */}
        <button
          className="get-app-btn"
          onClick={onOpenTemplateModal}
          title="Lihat Prompt Template & Token Saver"
        >
          <FileCode size={16} color="#7c3aed" />
          <span className="desktop-text">Template AI</span>
        </button>

        {/* Database Hub Button */}
        <button
          className="get-app-btn"
          onClick={onOpenSpreadsheetHub}
          title="Akses 3 Database Spreadsheet"
        >
          <Database size={16} color="#059669" />
          <span className="desktop-text">Spreadsheets (3)</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          aria-label="Ubah Tema"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Get App Button (visible on desktop/laptop) */}
        <button
          className="get-app-btn desktop-only"
          onClick={() => alert("Gemini Sales Assistant PWA siap di-install pada perangkat Anda!")}
        >
          <Download size={16} />
          <span>Get app</span>
        </button>

        {/* New Quotation Edit Button */}
        <button
          className="icon-btn"
          onClick={onNewChat}
          title="Mulai sesi penawaran baru"
          aria-label="Sesi Baru"
        >
          <Edit3 size={18} />
        </button>
      </div>
    </header>
  );
}
