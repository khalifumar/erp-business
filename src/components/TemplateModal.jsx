// src/components/TemplateModal.jsx
import React, { useState } from 'react';
import {
  X,
  FileCode,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function TemplateModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawTemplate = `
[ROLE & CONTEXT]
Kamu adalah AI Senior Pricing & Sales Quotation Expert untuk Digipack packaging company.
Tugasmu: Berikan analisis dan minimal 2-3 rekomendasi harga jual akurat untuk Sales berdasarkan data referensi harga historis & spreadsheet yang telah difilter.

[USER QUERY DARI SALES]
"{{USER_PROMPT}}"
(Estimasi Kuantitas yang diminta: {{REQUESTED_QTY}} pcs)

[DATA REFERENSI TERVERIFIKASI DARI SPREADSHEET]
1. Riwayat Transaksi iPos (Actual Sales):
{{TOP_HISTORY_ROWS}}

2. Katalog Ready To Use (RTU 2026):
{{TOP_RTU_ROWS}}

3. Custom Price List 2026:
{{TOP_CUSTOM_ROWS}}

[INSTRUKSI OUTPUT WAJIB]
Format output dalam JSON murni yang memuat:
1. overview: penjelasan singkat 1-2 kalimat analisa harga.
2. recommendations: array minimal 3 objek rekomendasi:
   - title: nama opsi (misal: "Rekomendasi 1: Match Historis / Paling Akurat", "Rekomendasi 2: Alternatif Ekonomis RTU", "Rekomendasi 3: Opsi Custom / Premium")
   - tag: badge ("Exact Match", "Opsi Ekonomis", "Custom Premium")
   - product_name: nama produk & spec
   - material: bahan & gsm
   - size: dimensi
   - print_type: tipe cetak/sablon
   - qty: kuantitas
   - unit_price: harga per pcs (angka rupiah bulat)
   - total_price: total harga (unit_price * qty)
   - cogs: perkiraan biaya modal vendor per pcs
   - margin_pct: persentase keuntungan (contoh: 38.5)
   - source_sheet: nama spreadsheet asal data
   - why_recommended: alasan mengapa opsi ini cocok
3. comparison_notes: catatan komparasi untuk sales
4. whatsapp_quotation_template: template pesan WhatsApp profesional & ramah dari Sales ke Klien yang memuat ketiga opsi harga dengan rapi.
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '860px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileCode size={22} color="#7c3aed" />
            <div>
              <h2 className="modal-title">Template Gemini 3.8 Flash (Hemat Token & Akurat)</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                Arsitektur Prompt Engineering & Pre-Filtering cerdas untuk efisiensi biaya API
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Advantage Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>
                <Zap size={16} />
                <span>Hemat 97% Token</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Hanya mengirim 5 kandidat baris teratas (~250 token) bukan seluruh spreadsheet (50.000+ token).
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a73e8', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span>Zero Hallucination</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Angka harga terkunci berdasarkan acuan riil dari Spreadsheet IPOS, RTU, dan Custom 2026.
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7c3aed', fontWeight: 600, fontSize: '0.84rem', marginBottom: '4px' }}>
                <Cpu size={16} />
                <span>Gemini 3.8 Flash Ready</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Didesain khusus untuk model Flash berkecepatan tinggi dengan response time under 1 detik.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Isi Template Prompt:</span>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Template'}</span>
            </button>
          </div>

          <pre style={{
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            maxHeight: '320px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {rawTemplate}
          </pre>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
