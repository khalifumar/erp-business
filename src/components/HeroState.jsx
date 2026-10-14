// src/components/HeroState.jsx
import React, { useState } from 'react';
import {
  Plus,
  Mic,
  ArrowUp,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function HeroState({
  inputValue,
  setInputValue,
  onSubmit,
  selectedModel,
  onOpenModelSelector,
  activeMode,
  setActiveMode,
  onOpenSpreadsheetHub
}) {
  const [isListening, setIsListening] = useState(false);

  const samplePrompts = [
    {
      category: 'Paper Bag Satchel',
      icon: <ShoppingBag size={14} />,
      query: 'Cari harga White Satchel 12 x 0 x 20 bahan Greaseproof 40 gsm untuk order 5.000 pcs'
    },
    {
      category: 'Custom Brown Kraft',
      icon: <Sparkles size={14} />,
      query: 'Estimasi harga Brown Handle Paper Bag 125 gsm sablon 2 warna ukuran 20x9x29 kuantitas 10.000 pcs'
    },
    {
      category: 'Food Packaging',
      icon: <Layers size={14} />,
      query: 'Client coffee shop minta Food Wrap Greaseproof dan Paper Cup 8oz qty 2.000 pcs'
    },
    {
      category: 'RTU vs Custom Comparison',
      icon: <FileSpreadsheet size={14} />,
      query: 'Bandingkan harga RTU Polos vs Custom Sablon 1W2S untuk kantong kertas 12x0x19 qty 3.000'
    }
  ];

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

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSubmit(inputValue);
      }
    }
  };

  return (
    <div className="hero-container">
      {/* Title matching screenshot */}
      <h1 className="hero-title">Look what you can do with Gemini 4</h1>

      {/* Let's go pill badge */}
      <div className="lets-go-pill">Let's go</div>

      {/* Pill Input Container */}
      <div className="gemini-pill-wrapper">
        <div className="gemini-pill-box">
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
            placeholder="Ask Gemini (misal: Cari harga White Satchel 12x0x20 qty 5000...)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          {/* Model selector pill matching screenshot: ● Flash ▾ */}
          <button
            className="model-selector-pill"
            onClick={onOpenModelSelector}
            title="Ganti Model AI & API Key"
          >
            <span className="model-indicator" />
            <span>Flash</span>
            <ChevronDown size={14} />
          </button>

          {/* Voice Mic button */}
          <button
            className={`pill-mic-btn ${isListening ? 'listening' : ''}`}
            onClick={handleMicClick}
            title={isListening ? 'Mendengarkan...' : 'Voice Input (Bahasa Indonesia)'}
            style={isListening ? { color: '#ef4444', animation: 'pulse 1s infinite' } : {}}
          >
            <Mic size={20} />
          </button>

          {/* Send button */}
          {inputValue.trim() && (
            <button
              className="pill-send-btn"
              onClick={() => onSubmit(inputValue)}
              title="Kirim Request"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Pill Mode Toggles matching screenshot: Chat | Task */}
      <div className="mode-toggles">
        <button
          className={`mode-pill ${activeMode === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMode('chat')}
        >
          Chat
        </button>
        <button
          className={`mode-pill ${activeMode === 'task' ? 'active' : ''}`}
          onClick={() => setActiveMode('task')}
        >
          Task
        </button>
      </div>

      {/* Prompt suggestions grid */}
      <div className="suggestions-grid">
        {samplePrompts.map((item, index) => (
          <div
            key={index}
            className="suggestion-card"
            onClick={() => onSubmit(item.query)}
          >
            <div className="suggestion-header">
              {item.icon}
              <span>{item.category}</span>
            </div>
            <div className="suggestion-text">{item.query}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
