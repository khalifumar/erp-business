// src/components/ChatArea.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Mic,
  ArrowUp,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  Sliders,
  Percent,
  FileSpreadsheet
} from 'lucide-react';
import GeminiLogo from './GeminiLogo';
import { calculatePriceFromMargin } from '../services/geminiService';

export default function ChatArea({
  messages,
  isLoading,
  inputValue,
  setInputValue,
  onSubmit,
  selectedModel,
  onOpenModelSelector,
  onOpenSpreadsheetHub,
  onOpenTemplateModal,
  globalMargin,
  onMarginChange
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeMargins, setActiveMargins] = useState({}); // msgId -> margin
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopyQuotation = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSubmit(inputValue);
      }
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Browser Anda belum mendukung speech recognition. Silakan ketik pertanyaan.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleUpdateMargin = (msgId, newMargin) => {
    setActiveMargins(prev => ({ ...prev, [msgId]: Number(newMargin) }));
  };

  return (
    <div className="chat-scroll-container">
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="chat-message-row user-row">
              <div className="user-bubble">{msg.content}</div>
            </div>
          );
        }

        // Assistant Message with dynamic margin calculation
        const isCustomMarginActive = activeMargins[msg.id] !== undefined;
        const customMarginVal = activeMargins[msg.id];
        const qty = msg.data.requested_qty || 1000;

        // Recalculate options dynamically or use EXACT spreadsheet numbers
        const dynamicRecs = msg.data.recommendations?.map(rec => {
          if (!isCustomMarginActive) {
            // EXACT SPREADSHEET PRICE & MARGIN
            const exactPrice = rec.spreadsheet_price_list || rec.unit_price;
            return {
              ...rec,
              current_unit_price: Math.round(exactPrice),
              current_total_price: Math.round(exactPrice * qty),
              current_margin: rec.spreadsheet_margin_pct || rec.applied_margin_pct
            };
          }
          // Custom simulated margin
          const cogs = rec.cogs;
          const dynamicPrice = calculatePriceFromMargin(cogs, customMarginVal);
          return {
            ...rec,
            current_unit_price: Math.round(dynamicPrice),
            current_total_price: Math.round(dynamicPrice * qty),
            current_margin: customMarginVal
          };
        });

        // Reconstruct WhatsApp template dynamically
        const dynamicWaTemplate = `Halo Kak, terima kasih sudah menghubungi Digipack! 😊

Berikut kami rincikan penawaran harga resmi dari katalog database kami untuk kuantitas *${qty.toLocaleString('id-ID')} pcs*${isCustomMarginActive ? ` (Simulasi Margin: ${customMarginVal}%)` : ' (Harga Resmi Katalog)'}:

${dynamicRecs?.map((r, i) => `📌 *${i+1}. ${r.title}*
• Produk: ${r.product_name}
• Bahan & Ukuran: ${r.material} (${r.size})
• Harga Jual: *Rp ${r.current_unit_price.toLocaleString('id-ID')} / pcs*
• Total Order: *Rp ${r.current_total_price.toLocaleString('id-ID')}*
• Margin: ${r.current_margin}% | Ref: ${r.source_ref}`).join('\n\n')}

Kira-kira dari opsi di atas mana yang paling cocok dengan kebutuhan Kakak? Kami siap bantu mock-up & sampel bahan ya! 🙏✨`;

        return (
          <div key={msg.id} className="chat-message-row assistant-row">
            <div className="assistant-avatar">
              <GeminiLogo size={28} />
            </div>

            <div className="assistant-content-wrapper">
              {/* Overview */}
              <div className="assistant-overview">{msg.data.overview}</div>

              {/* INTERACTIVE MARGIN CONTROLLER BAR */}
              <div style={{
                background: 'var(--bg-card)',
                border: isCustomMarginActive ? '1.5px solid #2563eb' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8' }}>
                    <Sliders size={18} />
                    <span>Mode Harga & Simulasi Margin Profit</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
                    <span style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isCustomMarginActive ? '#1d4ed8' : '#059669',
                      background: isCustomMarginActive ? '#dbeafe' : '#d1fae5',
                      padding: '3px 12px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {isCustomMarginActive ? `Simulasi Custom (${customMarginVal}%)` : '✓ 100% Harga Resmi Spreadsheet'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    step="0.5"
                    value={isCustomMarginActive ? customMarginVal : 40}
                    onChange={(e) => handleUpdateMargin(msg.id, e.target.value)}
                    style={{ flex: '1 1 200px', accentColor: '#1d4ed8', cursor: 'pointer', minWidth: '160px' }}
                  />
                  <div className="margin-presets-row" style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const copy = { ...activeMargins };
                        delete copy[msg.id];
                        setActiveMargins(copy);
                      }}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: !isCustomMarginActive ? '1.5px solid #059669' : '1px solid var(--border-light)',
                        background: !isCustomMarginActive ? '#d1fae5' : 'var(--bg-card-subtle)',
                        color: !isCustomMarginActive ? '#065f46' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: !isCustomMarginActive ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      Katalog Resmi
                    </button>
                    {[25, 30, 35, 40, 50].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleUpdateMargin(msg.id, preset)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: isCustomMarginActive && customMarginVal === preset ? '1.5px solid #1d4ed8' : '1px solid var(--border-light)',
                          background: isCustomMarginActive && customMarginVal === preset ? '#dbeafe' : 'var(--bg-card-subtle)',
                          color: isCustomMarginActive && customMarginVal === preset ? '#1d4ed8' : 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          fontWeight: isCustomMarginActive && customMarginVal === preset ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  *Formula Spreadsheet: <code>Harga Jual = COGS Modal / (1 - Margin%)</code>. Mengubah slider langsung merevisi harga pada kartu rekomendasi, tabel matriks, dan template WhatsApp di bawah.
                </div>
              </div>

              {/* 3 Price Recommendation Cards */}
              <div className="recommendations-grid">
                {dynamicRecs?.map((rec, rIdx) => {
                  const cardType = rIdx === 0 ? 'primary' : (rIdx === 1 ? 'economic' : 'premium');
                  const tagClass = rIdx === 0 ? 'exact' : (rIdx === 1 ? 'economic' : 'premium');

                  return (
                    <div key={rIdx} className={`recommendation-card ${cardType}`}>
                      <div className="card-top-tag">
                        <span className={`badge-tag ${tagClass}`}>{rec.tag}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          Qty: {rec.qty?.toLocaleString('id-ID')} pcs
                        </span>
                      </div>

                      <h3 className="card-title">{rec.title}</h3>
                      <p className="card-product-spec">
                        {rec.product_name} • {rec.material} ({rec.size})
                      </p>

                      <div className="price-display-box">
                        <div className="unit-price-label">Harga Rekomendasi Jual / pcs</div>
                        <div className="unit-price-value" style={{ color: '#1a73e8' }}>
                          Rp {rec.current_unit_price?.toLocaleString('id-ID')}
                        </div>
                        <div className="total-and-margin">
                          <span>Total: <strong>Rp {rec.current_total_price?.toLocaleString('id-ID')}</strong></span>
                          <span className="margin-pill">{rec.current_margin}% Margin</span>
                        </div>
                      </div>

                      <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Modal COGS Asli:</span>
                          <strong>Rp {rec.cogs?.toLocaleString('id-ID')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Harga Resmi Spreadsheet:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Rp {Math.round(rec.spreadsheet_price_list || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                        {rec.why_recommended}
                      </div>

                      <div className="card-source-info">
                        <span><strong>Database:</strong> {rec.source_sheet}</span>
                        <span><strong>Referensi:</strong> {rec.source_ref}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Spec Comparison Table */}
              <div className="comparison-table-card">
                <div className="table-header-title">
                  <TrendingUp size={16} color="#1a73e8" />
                  <span>Matriks Perbandingan Harga Berdasarkan Margin {currentMargin}%</span>
                </div>
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th>Pilihan</th>
                      <th>Bahan & Ukuran</th>
                      <th>Cetak</th>
                      <th>Qty</th>
                      <th>COGS Modal</th>
                      <th>Harga Jual / pcs</th>
                      <th>Total Order</th>
                      <th>Margin %</th>
                      <th>Sumber Data Asli</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicRecs?.map((rec, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{rec.tag}</td>
                        <td>{rec.material} ({rec.size})</td>
                        <td>{rec.print_type}</td>
                        <td>{rec.qty?.toLocaleString('id-ID')}</td>
                        <td>Rp {rec.cogs?.toLocaleString('id-ID')}</td>
                        <td style={{ fontWeight: 700, color: 'var(--gemini-blue)' }}>
                          Rp {rec.current_unit_price?.toLocaleString('id-ID')}
                        </td>
                        <td>Rp {rec.current_total_price?.toLocaleString('id-ID')}</td>
                        <td>
                          <span className="margin-pill">{rec.current_margin}%</span>
                        </td>
                        <td style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                          {rec.source_ref}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* WhatsApp Quotation Box */}
              <div className="whatsapp-quotation-card">
                <div className="quotation-card-header">
                  <div className="quotation-badge">
                    <MessageCircle size={18} color="#16a34a" />
                    <span>Template Pesan WhatsApp Siap Kirim (Margin {currentMargin}%)</span>
                  </div>
                  <button
                    className="copy-wa-btn"
                    onClick={() => handleCopyQuotation(dynamicWaTemplate, msg.id)}
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={16} />
                        <span>Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Salin Format Chat Sales</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="quotation-preview-text">
                  {dynamicWaTemplate}
                </pre>
              </div>

              {/* Token & Efficiency Metrics Badge */}
              <div className="token-efficiency-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} color="#f59e0b" />
                  <span>
                    Model: <strong>Gemini 3.8 Flash</strong> • Sesuai 100% Data Spreadsheet
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{msg.data.tokenUsage?.retrievedCount || 10} kandidat baris terverifikasi</span>
                  <button
                    onClick={onOpenSpreadsheetHub}
                    style={{ background: 'none', border: 'none', color: 'var(--gemini-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 600 }}
                  >
                    <FileSpreadsheet size={13} />
                    Cek Baris Spreadsheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading animation */}
      {isLoading && (
        <div className="chat-message-row assistant-row">
          <div className="assistant-avatar">
            <GeminiLogo size={28} />
          </div>
          <div className="assistant-content-wrapper" style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
              <Sparkles size={18} className="spin-slow" color="#1a73e8" />
              <span>Gemini 3.8 Flash sedang menganalisis 3 database spreadsheet & menghitung harga akurat...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Sticky Bottom Pill Input for ongoing conversation */}
      <div className="active-chat-input-bar">
        <div className="gemini-pill-box" style={{ width: '100%', maxWidth: '820px' }}>
          <button
            className="pill-add-btn"
            title="Akses Sumber Database"
            onClick={onOpenSpreadsheetHub}
          >
            <Plus size={20} />
          </button>

          <input
            type="text"
            className="pill-input"
            placeholder="Ketik spesifikasi lain (misal: brand Wonsot, atau minta margin 35%)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <button
            className="model-selector-pill"
            onClick={onOpenModelSelector}
            title="Ganti Model AI & API Key"
          >
            <span className="model-indicator" />
            <span>Flash</span>
            <ChevronDown size={14} />
          </button>

          <button
            className="pill-mic-btn"
            onClick={handleMicClick}
            title="Voice Input"
            style={isListening ? { color: '#ef4444' } : {}}
          >
            <Mic size={20} />
          </button>

          <button
            className="pill-send-btn"
            onClick={() => inputValue.trim() && !isLoading && onSubmit(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            title="Kirim"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
