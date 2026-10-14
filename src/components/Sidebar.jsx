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
  FolderPlus,
  Filter,
  MessageSquare,
  Settings,
  Database
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
  onOpenSpreadsheetHub
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

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <a href="#" className="gemini-brand" onClick={(e) => { e.preventDefault(); onNewChat(); }}>
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
          <button
            className="icon-btn"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="new-chat-container">
        <button className="new-chat-btn" onClick={onNewChat} title="New chat">
          <Plus size={18} color="#1a73e8" />
          {!isCollapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Navigation Icons matching Gemini Screenshot */}
      {!isCollapsed && (
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
          <button className="nav-item" onClick={onOpenSpreadsheetHub}>
            <Database size={18} color="#059669" />
            <span>Spreadsheets Hub</span>
          </button>
          <button className="nav-item">
            <MoreHorizontal size={18} />
            <span>More</span>
          </button>
        </div>
      )}

      {/* Scrollable list of Notebooks & Past Conversations */}
      <div className="sidebar-scrollable">
        {!isCollapsed && (
          <>
            {/* Search input if opened */}
            {isSearchOpen && (
              <div style={{ padding: '0 10px 8px' }}>
                <input
                  type="text"
                  placeholder="Cari chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
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
                onClick={() => onSelectChat(chat.id)}
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

      {/* Footer User Profile matching screenshot */}
      <div className="sidebar-footer">
        <div className="user-profile" onClick={onOpenSettings} title="Settings & Profile">
          <div className="user-avatar">KU</div>
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">khalif umar</span>
              <span className="badge-pro">Pro</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button className="icon-btn" onClick={onOpenSettings} title="Settings">
            <Settings size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
