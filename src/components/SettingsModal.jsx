// src/components/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  Sliders,
  Sparkles,
  User,
  Shield,
  Save
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'Gemini 3.8 Flash');
  const [targetMargin, setTargetMargin] = useState(settings.targetMargin || 40);
  const [salesName, setSalesName] = useState(settings.salesName || 'Khalif Umar');

  useEffect(() => {
    setApiKey(settings.apiKey || '');
    setModel(settings.model || 'Gemini 3.8 Flash');
    setTargetMargin(settings.targetMargin || 40);
    setSalesName(settings.salesName || 'Khalif Umar');
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      apiKey: apiKey.trim(),
      model,
      targetMargin: Number(targetMargin),
      salesName: salesName.trim()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} color="#1a73e8" />
            <h2 className="modal-title">Pengaturan Chatbot & AI</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Model Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
              Model AI Gemini
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            >
              <option value="Gemini 3.8 Flash">Gemini 3.8 Flash (Direkomendasikan - Cepat & Hemat Token)</option>
              <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
              <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {/* Gemini API Key */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="#d97706" />
                <span>Google AI Studio API Key (Opsional)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.76rem', color: 'var(--gemini-blue)', textDecoration: 'none' }}
              >
                Dapatkan API Key Gratis
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              💡 Jika dikosongkan, chatbot tetap berjalan 100% menggunakan <strong>Deterministic Pricing Engine</strong> terpadu berbasis database riil.
            </p>
          </div>

          {/* Target Margin Slider */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={15} color="#059669" />
                <span>Target Minimum Margin Profit</span>
              </label>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>{targetMargin}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              value={targetMargin}
              onChange={e => setTargetMargin(e.target.value)}
              style={{ width: '100%', accentColor: '#059669', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              <span>20% (Competitive/Bulk)</span>
              <span>40% (Standard Sales)</span>
              <span>70% (High Retail)</span>
            </div>
          </div>

          {/* Sales Representative Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '6px' }}>
              <User size={15} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Nama Sales Representative (Untuk Template Chat)
            </label>
            <input
              type="text"
              value={salesName}
              onChange={e => setSalesName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={16} />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
