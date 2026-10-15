// src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Clock,
  GraduationCap,
  MoreHorizontal,
  Filter,
  MessageSquare,
  Settings,
  Database,
  X
} from 'lucide-react';
import GeminiLogo from './GeminiLogo';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  chatHistory,
  activeChatId,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  onOpenSpreadsheetHub,
  isMobileOpen,
  onCloseMobile
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Default notebooks matching screenshot
  const notebooks = [
    { id: 'nb-1', title: 'Monthly Reporting Regulations fo...' },
    { id: 'nb-2', title: 'Digipack Gerai Cordova Work Ord...' }
  ];

  const filteredHistory = chatHistory.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (callback) => {
    callback();
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div className="mobile-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open-mobile' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <a href="#" className="gemini-brand" onClick={(e) => { e.preventDefault(); handleItemClick(onNewChat); }}>
              <GeminiLogo size={22} />
              <span>Gemini</span>
            </a>
          )}
          <div className="sidebar-actions">
            {!isCollapsed && (
              <button
                className="icon-btn"
                title="Search chats"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search size={18} />
              </button>
            )}
            
            {/* Desktop Collapse Toggle */}
            <button
              className="icon-btn desktop-only"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={onToggleCollapse}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Mobile Close Button */}
            <button
              className="icon-btn mobile-only"
              title="Close sidebar"
              onClick={onCloseMobile}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="new-chat-container">
          <button className="new-chat-btn" onClick={() => handleItemClick(onNewChat)} title="New chat">
            <Plus size={18} color="#1a73e8" />
            {(!isCollapsed || isMobileOpen) && <span>New chat</span>}
          </button>
        </div>

        {/* Navigation Items */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="sidebar-nav-section">
            <button className="nav-item">
              <BookOpen size={18} />
              <span>Library</span>
            </button>
            <button className="nav-item">
              <ImageIcon size={18} />
              <span>Images</span>
            </button>
            <button className="nav-item">
              <Clock size={18} />
              <span>Scheduled</span>
            </button>
            <button className="nav-item">
              <GraduationCap size={18} />
              <span>Students</span>
            </button>
            <button className="nav-item" onClick={() => handleItemClick(onOpenSpreadsheetHub)}>
              <Database size={18} color="#059669" />
              <span>Spreadsheets Hub</span>
            </button>
            <button className="nav-item">
              <MoreHorizontal size={18} />
              <span>More</span>
            </button>
          </div>
        )}

        {/* Scrollable Notebooks & History */}
        <div className="sidebar-scrollable">
          {(!isCollapsed || isMobileOpen) && (
            <>
              {isSearchOpen && (
                <div style={{ padding: '0 10px 8px' }}>
                  <input
                    type="text"
                    placeholder="Cari chat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                </div>
              )}

              {/* Notebooks Section */}
              <div className="sidebar-section-title">
                <span>Notebooks</span>
              </div>
              <button className="notebook-item" style={{ color: 'var(--gemini-blue)', fontWeight: 500 }}>
                <div className="item-title-group">
                  <Plus size={16} />
                  <span>New notebook</span>
                </div>
              </button>
              {notebooks.map(nb => (
                <div key={nb.id} className="notebook-item">
                  <div className="item-title-group">
                    <BookOpen size={15} style={{ opacity: 0.7 }} />
                    <span title={nb.title}>{nb.title}</span>
                  </div>
                </div>
              ))}

              {/* Chat History Section */}
              <div className="sidebar-section-title" style={{ marginTop: '12px' }}>
                <span>All</span>
                <Filter size={14} style={{ cursor: 'pointer', opacity: 0.6 }} />
              </div>

              {filteredHistory.map(chat => (
                <div
                  key={chat.id}
                  className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(() => onSelectChat(chat.id))}
                  title={chat.title}
                >
                  <div className="item-title-group">
                    <MessageSquare size={14} style={{ opacity: 0.6 }} />
                    <span>{chat.title}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* User Footer Profile */}
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => handleItemClick(onOpenSettings)} title="Settings & Profile">
            <div className="user-avatar">KU</div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="user-info">
                <span className="user-name">khalif umar</span>
                <span className="badge-pro">Pro</span>
              </div>
            )}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <button className="icon-btn" onClick={() => handleItemClick(onOpenSettings)} title="Settings">
              <Settings size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
