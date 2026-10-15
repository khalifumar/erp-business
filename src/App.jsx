// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HeroState from './components/HeroState';
import ChatArea from './components/ChatArea';
import SpreadsheetModal from './components/SpreadsheetModal';
import TemplateModal from './components/TemplateModal';
import SettingsModal from './components/SettingsModal';
import { generateSalesResponse } from './services/geminiService';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('gemini_theme') || 'light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gemini_sales_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      apiKey: '',
      model: 'Gemini 3.8 Flash',
      targetMargin: 40,
      salesName: 'Khalif Umar'
    };
  });

  // Modals
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Mode: chat | task
  const [activeMode, setActiveMode] = useState('chat');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Conversations history matching screenshot
  const [chatHistory, setChatHistory] = useState([
    { id: 'c-1', title: "Pesan dan Ibrah Surat Al-Waqi'ah" },
    { id: 'c-2', title: "Riset Business Plan Yudaskara" },
    { id: 'c-3', title: "Pengertian Context Window pada AI" },
    { id: 'c-4', title: "Gemini Spark Setup" },
    { id: 'c-5', title: "Kamu seorang trainer Automation. Aku..." },
    { id: 'c-6', title: "Konsep Agama Islam Bahasa Gen-Z" },
    { id: 'c-7', title: "Panduan Instalasi Lokal n8n" },
    { id: 'c-8', title: "Batasan Stiker Favorit WhatsApp" },
    { id: 'c-9', title: "Pantun Informatika Ala Gen Z" },
    { id: 'c-10', title: "Penyesuaian Surat Lamaran Magang" },
    { id: 'c-11', title: "Fungsi dan Kondisi Penguncian Spread..." }
  ]);
  const [activeChatId, setActiveChatId] = useState('current');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gemini_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gemini_sales_settings', JSON.stringify(newSettings));
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setActiveChatId('current');
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    const selected = chatHistory.find(c => c.id === chatId);
    if (selected) {
      // Load sample consultation for past chat
      handleSubmit(selected.title);
    }
  };

  const handleSubmit = async (queryText) => {
    const text = (queryText || inputValue).trim();
    if (!text) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    // If first message in current session, add to sidebar history
    if (messages.length === 0) {
      const summaryTitle = text.length > 32 ? text.substring(0, 32) + '...' : text;
      setChatHistory(prev => [{ id: 'c-' + Date.now(), title: summaryTitle }, ...prev]);
    }

    try {
      const assistantData = await generateSalesResponse(text, settings);
      const assistantMsg = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        data: assistantData
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Error generating sales pricing response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar matching screenshot */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSpreadsheetHub={() => setIsSpreadsheetModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSpreadsheetHub={() => setIsSpreadsheetModalOpen(true)}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
          onNewChat={handleNewChat}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {messages.length === 0 ? (
          <HeroState
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={handleSubmit}
            selectedModel={settings.model}
            onOpenModelSelector={() => setIsSettingsModalOpen(true)}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            onOpenSpreadsheetHub={() => setIsSpreadsheetModalOpen(true)}
          />
        ) : (
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={handleSubmit}
            selectedModel={settings.model}
            onOpenModelSelector={() => setIsSettingsModalOpen(true)}
            onOpenSpreadsheetHub={() => setIsSpreadsheetModalOpen(true)}
            onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
            globalMargin={settings.targetMargin}
            onMarginChange={(m) => handleSaveSettings({ ...settings, targetMargin: m })}
          />
        )}
      </main>

      {/* Modals */}
      <SpreadsheetModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
