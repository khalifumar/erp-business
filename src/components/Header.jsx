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
        <button
          className="icon-btn"
          onClick={onToggleMobileSidebar}
          style={{ display: 'none' }}
          id="mobile-sidebar-toggle"
          title="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div className="sales-portal-pill">
          <Sparkles size={14} color="#1a73e8" />
          <span>Sales Price Assistant • Gemini 3.8 Flash</span>
        </div>
      </div>

      <div className="top-nav-right">
        {/* View Template & Token Optimizer */}
        <button
          className="get-app-btn"
          onClick={onOpenTemplateModal}
          title="Lihat Prompt Template & Token Saver"
          style={{ gap: '6px' }}
        >
          <FileCode size={16} color="#7c3aed" />
          <span>Template AI</span>
        </button>

        {/* Database Hub */}
        <button
          className="get-app-btn"
          onClick={onOpenSpreadsheetHub}
          title="Akses 3 Database Spreadsheet"
          style={{ gap: '6px' }}
        >
          <Database size={16} color="#059669" />
          <span>Spreadsheets (3)</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Get App Button matching screenshot */}
        <button className="get-app-btn" onClick={() => alert("Gemini Sales Assistant PWA siap di-install pada perangkat Anda!")}>
          <Download size={16} />
          <span>Get app</span>
        </button>

        {/* Edit note icon matching screenshot */}
        <button className="icon-btn" onClick={onNewChat} title="New quotation session">
          <Edit3 size={18} />
        </button>
      </div>
    </header>
  );
}
