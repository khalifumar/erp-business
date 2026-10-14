// src/components/SpreadsheetModal.jsx
import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Database
} from 'lucide-react';
import db from '../data/pricingDatabase.json';

export default function SpreadsheetModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('rtu'); // 'rtu' | 'custom' | 'ipos'
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const sheetsInfo = {
    rtu: {
      title: 'Spreadsheet PRICE LIST RTU 2026',
      url: 'https://docs.google.com/spreadsheets/d/1cA6BEEOF7oRjlfesrGF_8640iYM2tmQT9N0WCvuMl58/edit?usp=sharing',
      data: db.rtu_prices,
      desc: 'Daftar harga produk standar ready-to-use (Ready stock polos & opsi sablon 1W1S/1W2S).'
    },
    custom: {
      title: 'Spreadsheet PRICE LIST CUSTOM 2026',
      url: 'https://docs.google.com/spreadsheets/d/1TqtowP2Bj-WAh4DBGpSNAnECAV3skehQ-yB3Yd94Lsc/edit?usp=sharing',
      data: db.custom_prices,
      desc: 'Spesifikasi custom packaging berdasarkan pesanan brand client sebelumnya, COGS vendor & finishing.'
    },
    ipos: {
      title: 'Spreadsheet IPOS PRICE',
      url: 'https://docs.google.com/spreadsheets/d/1KewORzPFilQfOiZFYRRBgjT1_Yl5Hyjbj9ujVaS6Emk/edit?usp=sharing',
      data: db.historical_sales,
      desc: 'Database riwayat transaksi penjualan riil dari invoice iPos, margin aktual, dan data sales rep.'
    }
  };

  const currentSheet = sheetsInfo[activeTab];

  const filteredData = currentSheet.data.filter(item => {
    const text = JSON.stringify(item).toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="#059669" />
            <div>
              <h2 className="modal-title">Database Spreadsheet Hub</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                3 Sumber data acuan harga yang terhubung langsung ke mesin pencari Chatbot
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          padding: '0 24px',
          background: 'var(--bg-card-subtle)',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('rtu')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'rtu' ? '3px solid var(--gemini-blue)' : '3px solid transparent',
              color: activeTab === 'rtu' ? 'var(--gemini-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'rtu' ? 600 : 500,
              fontSize: '0.88rem'
            }}
          >
            PRICE LIST RTU 2026 ({db.rtu_prices.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'custom' ? '3px solid var(--gemini-blue)' : '3px solid transparent',
              color: activeTab === 'custom' ? 'var(--gemini-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'custom' ? 600 : 500,
              fontSize: '0.88rem'
            }}
          >
            PRICE LIST CUSTOM 2026 ({db.custom_prices.length})
          </button>
          <button
            onClick={() => setActiveTab('ipos')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'ipos' ? '3px solid var(--gemini-blue)' : '3px solid transparent',
              color: activeTab === 'ipos' ? 'var(--gemini-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'ipos' ? 600 : 500,
              fontSize: '0.88rem'
            }}
          >
            IPOS PRICE HISTORY ({db.historical_sales.length})
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div style={{
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          gap: '16px'
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            maxWidth: '380px'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder={`Cari di ${currentSheet.title}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <a
            href={currentSheet.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--gemini-blue)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span>Buka Google Sheets Asli</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Table View */}
        <div className="modal-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
            <table className="pricing-table">
              <thead>
                <tr>
                  {activeTab === 'rtu' && (
                    <>
                      <th>SKU / Code</th>
                      <th>Produk</th>
                      <th>Bahan</th>
                      <th>Ukuran</th>
                      <th>MOQ</th>
                      <th>COGS</th>
                      <th>Harga Polos</th>
                      <th>Sablon 1W1S</th>
                    </>
                  )}
                  {activeTab === 'custom' && (
                    <>
                      <th>Code</th>
                      <th>Brand Ref</th>
                      <th>Produk</th>
                      <th>Bahan</th>
                      <th>Ukuran</th>
                      <th>Warna Cetak</th>
                      <th>Finishing</th>
                      <th>COGS Modal</th>
                      <th>Harga Jual</th>
                    </>
                  )}
                  {activeTab === 'ipos' && (
                    <>
                      <th>No SO</th>
                      <th>Customer</th>
                      <th>Kategori</th>
                      <th>Produk</th>
                      <th>Bahan</th>
                      <th>Ukuran</th>
                      <th>Qty</th>
                      <th>Harga Jual</th>
                      <th>Margin</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    {activeTab === 'rtu' && (
                      <>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.code}</td>
                        <td style={{ fontWeight: 600 }}>{row.product_name}</td>
                        <td>{row.material}</td>
                        <td>{row.size}</td>
                        <td>{row.moq} pcs</td>
                        <td>Rp {row.cogs?.toLocaleString('id-ID')}</td>
                        <td style={{ fontWeight: 600, color: 'var(--gemini-blue)' }}>
                          Rp {row.price_polos?.toLocaleString('id-ID') || '-'}
                        </td>
                        <td>Rp {row.price_sablon_1w1s?.toLocaleString('id-ID') || '-'}</td>
                      </>
                    )}
                    {activeTab === 'custom' && (
                      <>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.code}</td>
                        <td style={{ fontWeight: 600, color: '#7c3aed' }}>{row.brand}</td>
                        <td>{row.product_name}</td>
                        <td>{row.material}</td>
                        <td>{row.size}</td>
                        <td>{row.color}</td>
                        <td style={{ fontSize: '0.78rem' }}>{row.finishing}</td>
                        <td>Rp {row.vendor_cogs?.toLocaleString('id-ID')}</td>
                        <td style={{ fontWeight: 600, color: 'var(--gemini-blue)' }}>
                          Rp {row.selling_price?.toLocaleString('id-ID')}
                        </td>
                      </>
                    )}
                    {activeTab === 'ipos' && (
                      <>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{row.so_code}</td>
                        <td style={{ fontWeight: 600 }}>{row.brand_customer}</td>
                        <td>{row.category}</td>
                        <td>{row.product_name}</td>
                        <td>{row.material}</td>
                        <td>{row.size}</td>
                        <td>{row.qty?.toLocaleString('id-ID')} pcs</td>
                        <td style={{ fontWeight: 600, color: 'var(--gemini-blue)' }}>
                          Rp {row.selling_price?.toLocaleString('id-ID')}
                        </td>
                        <td><span className="margin-pill">{row.margin_pct}%</span></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span style={{ marginRight: 'auto', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Menampilkan {Math.min(50, filteredData.length)} dari total {filteredData.length} baris data
          </span>
          <button className="btn-primary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
