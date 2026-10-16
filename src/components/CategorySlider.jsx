// src/components/CategorySlider.jsx
import React from 'react';
import { Package, Palette, CheckCircle2 } from 'lucide-react';

export default function CategorySlider({
  activeCategory = 'RTU',
  onChangeCategory,
  compact = false
}) {
  const isRtu = activeCategory === 'RTU';

  if (compact) {
    return (
      <div className="category-slider-compact">
        <div
          className={`slider-pill-indicator ${isRtu ? 'pos-rtu' : 'pos-custom'}`}
        />
        <button
          type="button"
          className={`slider-compact-btn ${isRtu ? 'active' : ''}`}
          onClick={() => onChangeCategory('RTU')}
          title="Filter: Hanya Spreadsheet PRICE LIST RTU 2026"
        >
          <Package size={14} />
          <span>RTU 2026</span>
        </button>
        <button
          type="button"
          className={`slider-compact-btn ${!isRtu ? 'active' : ''}`}
          onClick={() => onChangeCategory('CUSTOM')}
          title="Filter: Hanya Spreadsheet PRICE LIST CUSTOM 2026"
        >
          <Palette size={14} />
          <span>Custom 2026</span>
        </button>
      </div>
    );
  }

  return (
    <div className="category-slider-card">
      <div className="category-slider-header">
        <span className="slider-label">Pilih Database Spreadsheet:</span>
        <span className={`active-badge ${isRtu ? 'badge-rtu' : 'badge-custom'}`}>
          <CheckCircle2 size={13} />
          <strong>{isRtu ? 'PRICE LIST RTU 2026' : 'PRICE LIST CUSTOM 2026'}</strong>
        </span>
      </div>

      <div className="category-slidebar-track">
        <div className={`slidebar-glider ${isRtu ? 'slide-left' : 'slide-right'}`} />
        <button
          type="button"
          className={`slidebar-tab ${isRtu ? 'is-active' : ''}`}
          onClick={() => onChangeCategory('RTU')}
        >
          <div className="tab-icon-box rtu-box">
            <Package size={16} />
          </div>
          <div className="tab-text-box">
            <span className="tab-name">RTU (Ready to Use)</span>
            <span className="tab-desc">Spreadsheet PRICE LIST RTU 2026</span>
          </div>
        </button>

        <button
          type="button"
          className={`slidebar-tab ${!isRtu ? 'is-active' : ''}`}
          onClick={() => onChangeCategory('CUSTOM')}
        >
          <div className="tab-icon-box custom-box">
            <Palette size={16} />
          </div>
          <div className="tab-text-box">
            <span className="tab-name">Custom Packaging</span>
            <span className="tab-desc">Spreadsheet PRICE LIST CUSTOM 2026</span>
          </div>
        </button>
      </div>
    </div>
  );
}
