'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Download, Check, Clock, AlertTriangle, ChevronDown,
  X, Plus, Edit2, Send, FileText, Building2, Eye
} from 'lucide-react'

import { useCostingRates, PROJECTS as CTX_PROJECTS } from './costing-context'

// ── COLOUR TOKENS ─────────────────────────────────────────────────────────
const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}

const iStyle: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}

// ── NAV ───────────────────────────────────────────────────────────────────
function FinanceNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
      {[
        { href: '/admin/finance', label: 'Dashboard' },
        { href: '/admin/finance/costing', label: 'Costing' },
        { href: '/admin/finance/invoicing', label: 'Invoicing' },
        { href: '/admin/finance/reports', label: 'Reports' },
      ].map(t => (
        <Link key={t.href} href={t.href} style={{
          padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
          textDecoration: 'none', transition: 'all 0.2s',
          background: active === t.label ? C.orange : 'transparent',
          color: active === t.label ? '#fff' : C.muted,
        }}>{t.label}</Link>
      ))}
    </div>
  )
}

// ── INVOICE SUB-NAV ───────────────────────────────────────────────────────
const INV_TABS = [
  { id: 'generate', label: 'Generate Invoice', icon: '📄' },
  { id: 'tracker',  label: 'Invoice Tracker',  icon: '📊' },
]

// ── REAL DATA ─────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'RS-01',     fullName: 'RS-01 — Chhindwara',     client: 'CMPDI', type: 'meterage', band1Rate: 850, band2Rate: 950, band3Rate: 1050, band1To: 200, band2To: 400, standbyRate: 8000, mobilisation: 250000, gst: 18, tds: 2, retention: 5 },
  { id: 'CMPDI-DAM', fullName: 'CMPDI-DAM — Bokaro',     client: 'CMPDI', type: 'meterage', band1Rate: 820, band2Rate: 920, band3Rate: 1020, band1To: 200, band2To: 400, standbyRate: 7500, mobilisation: 220000, gst: 18, tds: 2, retention: 5 },
  { id: 'CMP-MAD',   fullName: 'CMP-MAD — Warora',       client: 'CMPDI', type: 'meterage', band1Rate: 800, band2Rate: 900, band3Rate: 1000, band1To: 200, band2To: 400, standbyRate: 7000, mobilisation: 200000, gst: 18, tds: 2, retention: 5 },
  { id: 'DGMIL-BHK', fullName: 'DGMIL-BHK — Saraipali', client: 'DGML',  type: 'meterage', band1Rate: 800, band2Rate: 900, band3Rate: 1000, band1To: 200, band2To: 400, standbyRate: 7000, mobilisation: 200000, gst: 18, tds: 2, retention: 5 },
  { id: 'MECL-HIN',  fullName: 'MECL-HIN — Bazar Gaon', client: 'MECL',  type: 'dayrate',  drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000, mobilisation: 180000, gst: 18, tds: 2, retention: 5, band1Rate: 0, band2Rate: 0, band3Rate: 0, band1To: 200, band2To: 400, standbyRate: 0 },
]

type InvStatus = 'Draft' | 'Raised' | 'MB Pending' | 'Submitted' | 'Partially Paid' | 'Paid' | 'Overdue'

interface Invoice {
  id: string; invNumber: string; project: string; client: string
  month: string; meters: number; standbyDays: number
  includeMob: boolean; grossAmount: number; gst: number
  tds: number; retention: number; netReceivable: number
  status: InvStatus; raisedDate: string; dueDate: string
  paidAmount: number; notes: string
}

const seedInvoices: Invoice[] = [
  { id: '1', invNumber: 'INV-2026-042', project: 'RS-01',     client: 'CMPDI', month: 'Apr 2026', meters: 624, standbyDays: 3, includeMob: false, grossAmount: 619200, gst: 111456, tds: 12384, retention: 30960, netReceivable: 687312, status: 'Overdue',        raisedDate: '02.05.2026', dueDate: '01.06.2026', paidAmount: 0,      notes: '45 days overdue — follow up CMPDI' },
  { id: '2', invNumber: 'INV-2026-041', project: 'CMPDI-DAM', client: 'CMPDI', month: 'Apr 2026', meters: 412, standbyDays: 2, includeMob: false, grossAmount: 356000, gst: 64080,  tds: 7120,  retention: 17800, netReceivable: 395160, status: 'Paid',           raisedDate: '01.05.2026', dueDate: '31.05.2026', paidAmount: 395160, notes: '' },
  { id: '3', invNumber: 'INV-2026-043', project: 'CMP-MAD',   client: 'CMPDI', month: 'Apr 2026', meters: 318, standbyDays: 1, includeMob: false, grossAmount: 263400, gst: 47412,  tds: 5268,  retention: 13170, netReceivable: 292374, status: 'Submitted',      raisedDate: '03.05.2026', dueDate: '02.06.2026', paidAmount: 0,      notes: 'MB certified 28 Apr' },
  { id: '4', invNumber: 'INV-2026-044', project: 'DGMIL-BHK', client: 'DGML',  month: 'Apr 2026', meters: 280, standbyDays: 2, includeMob: false, grossAmount: 238000, gst: 42840,  tds: 4760,  retention: 11900, netReceivable: 264180, status: 'MB Pending',     raisedDate: '04.05.2026', dueDate: '03.06.2026', paidAmount: 0,      notes: 'Waiting for client MB sign-off' },
  { id: '5', invNumber: 'INV-2026-038', project: 'RS-01',     client: 'CMPDI', month: 'Mar 2026', meters: 598, standbyDays: 2, includeMob: false, grossAmount: 591100, gst: 106398, tds: 11822, retention: 29555, netReceivable: 656121, status: 'Partially Paid', raisedDate: '01.04.2026', dueDate: '01.05.2026', paidAmount: 350000, notes: 'Partial payment received ₹3.5L' },
  { id: '6', invNumber: 'INV-2026-031', project: 'CMPDI-DAM', client: 'CMPDI', month: 'Feb 2026', meters: 386, standbyDays: 0, includeMob: true,  grossAmount: 537320, gst: 96717,  tds: 10746, retention: 26866, netReceivable: 596425, status: 'Paid',           raisedDate: '02.03.2026', dueDate: '01.04.2026', paidAmount: 596425, notes: 'Includes mobilisation ₹2.2L' },
]

const STATUS_CONFIG: Record<InvStatus, { color: string; bg: string; border: string; icon: string }> = {
  'Draft':           { color: C.muted,   bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', icon: '📝' },
  'Raised':          { color: C.blue,    bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.15)',  icon: '📤' },
  'MB Pending':      { color: C.amber,   bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', icon: '⏳' },
  'Submitted':       { color: C.purple,  bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)', icon: '📨' },
  'Partially Paid':  { color: C.orange,  bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.15)', icon: '💰' },
  'Paid':            { color: C.green,   bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', icon: '✅' },
  'Overdue':         { color: C.red,     bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)',  icon: '🚨' },
}

function StatusBadge({ status }: { status: InvStatus }) {
  const s = STATUS_CONFIG[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {s.icon} {status}
    </span>
  )
}

// ── COMPANY PROFILE ───────────────────────────────────────────────────────
const defaultProfile = {
  name: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
  address: 'Enter your company address here',
  gstin: 'Enter GSTIN',
  contact: 'Enter contact details',
  logo: '',
}

function CompanyProfileModal({ profile, onClose, onSave }: { profile: typeof defaultProfile; onClose: () => void; onSave: (p: typeof defaultProfile) => void }) {
  const [form, setForm] = useState({ ...profile })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Company Profile</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>Printed on all Invoice PDFs</div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Company Name', field: 'name', placeholder: 'ANMAK CONSULTANCY SERVICES PVT. LTD.' },
            { label: 'Company Address', field: 'address', placeholder: 'Full registered address with PIN code' },
            { label: 'GSTIN', field: 'gstin', placeholder: 'e.g. 27AAAAA0000A1Z5' },
            { label: 'Contact (Email / Phone)', field: 'contact', placeholder: 'email@company.com · +91 XXXXX XXXXX' },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{f.label}</div>
              <input value={(form as any)[f.field]} onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))} placeholder={f.placeholder} style={iStyle} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Company Logo</div>
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏢</div>
              <div style={{ fontSize: 12, color: C.faint }}>Click to upload logo · PNG or SVG recommended</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} style={{ flex: 2, padding: '12px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Save Profile</button>
        </div>
      </div>
    </div>
  )
}

// ── INVOICE PREVIEW MODAL ─────────────────────────────────────────────────
function InvoicePreviewModal({ inv, profile, onClose }: { inv: Invoice; profile: typeof defaultProfile; onClose: () => void }) {
  const downloadHTML = () => {
    const html = `<!DOCTYPE html><html><head><title>${inv.invNumber}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:820px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #F97316;margin-bottom:24px}
  .company-name{font-size:18px;font-weight:800;color:#111}
  .company-details{font-size:12px;color:#555;margin-top:4px;line-height:1.6}
  .inv-title{font-size:28px;font-weight:900;color:#F97316;text-align:right}
  .inv-meta{font-size:12px;color:#555;text-align:right;margin-top:6px;line-height:1.8}
  .section{margin-bottom:20px}
  .section-title{font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #eee}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th{background:#F97316;color:#fff;padding:10px 12px;text-align:left;font-size:12px}
  td{padding:9px 12px;border-bottom:1px solid #f0f0f0;font-size:13px}
  tr:nth-child(even) td{background:#fafafa}
  .total-row td{background:#fff7f0;font-weight:700;font-size:14px;border-top:2px solid #F97316}
  .deduction-row td{color:#dc2626}
  .net-row td{background:#f0fdf4;font-weight:800;font-size:16px;color:#065f46;border-top:2px solid #10B981}
  .footer{margin-top:32px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:16px;text-align:center}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #fcd34d}
</style></head><body>
<div class="header">
  <div>
    <div class="company-name">${profile.name}</div>
    <div class="company-details">${profile.address}<br>GSTIN: ${profile.gstin}<br>${profile.contact}</div>
  </div>
  <div>
    <div class="inv-title">TAX INVOICE</div>
    <div class="inv-meta">
      <strong>${inv.invNumber}</strong><br>
      Date: ${inv.raisedDate}<br>
      Project: ${inv.project}<br>
      Client: ${inv.client}<br>
      Period: ${inv.month}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Invoice Details</div>
  <table>
    <tr><th>#</th><th>Description</th><th>Qty / Rate</th><th>Amount (₹)</th></tr>
    ${inv.meters > 0 ? `<tr><td>1</td><td>Drilling Services — Meterage Charges (${inv.project})</td><td>${inv.meters} meters</td><td>₹${inv.grossAmount.toLocaleString()}</td></tr>` : ''}
    ${inv.standbyDays > 0 ? `<tr><td>2</td><td>Standby Charges</td><td>${inv.standbyDays} days</td><td>Included</td></tr>` : ''}
    ${inv.includeMob ? `<tr><td>3</td><td>Mobilisation Charges (One-time)</td><td>—</td><td>Included</td></tr>` : ''}
    <tr class="total-row"><td colspan="3"><strong>Gross Invoice Value</strong></td><td><strong>₹${inv.grossAmount.toLocaleString()}</strong></td></tr>
    <tr><td colspan="3">+ GST @${inv.gst}%</td><td>₹${inv.gst.toLocaleString()}</td></tr>
    <tr><td colspan="3"><strong>Total Invoice Value (with GST)</strong></td><td><strong>₹${(inv.grossAmount + inv.gst).toLocaleString()}</strong></td></tr>
    <tr class="deduction-row"><td colspan="3">− TDS @2% (Section 194C) — deducted by client</td><td>−₹${inv.tds.toLocaleString()}</td></tr>
    <tr class="deduction-row"><td colspan="3">− Retention @5% — held till project completion</td><td>−₹${inv.retention.toLocaleString()}</td></tr>
    <tr class="net-row"><td colspan="3"><strong>NET CASH RECEIVABLE</strong></td><td><strong>₹${inv.netReceivable.toLocaleString()}</strong></td></tr>
  </table>
</div>

${inv.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:13px;color:#555">${inv.notes}</p></div>` : ''}

<div class="footer">
  This is a computer-generated Tax Invoice · ${profile.name} · GSTIN: ${profile.gstin}<br>
  Generated by XPLORIX Finance Module
</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${inv.invNumber}.html`; a.click()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 640, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{inv.invNumber}</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{inv.project} · {inv.client} · {inv.month}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={downloadHTML} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
              <Download size={14} /> Download Invoice
            </button>
            <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
          </div>
        </div>

        {/* Invoice breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Gross amount */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Revenue Earned</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: C.muted }}>Meters drilled: {inv.meters}m</span>
                <span style={{ color: C.green, fontWeight: 700 }}>₹{inv.grossAmount.toLocaleString()}</span>
              </div>
              {inv.standbyDays > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>Standby charges: {inv.standbyDays} days</span>
                  <span style={{ color: C.green, fontWeight: 700 }}>Included</span>
                </div>
              )}
              {inv.includeMob && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>Mobilisation (one-time)</span>
                  <span style={{ color: C.green, fontWeight: 700 }}>Included</span>
                </div>
              )}
              <div style={{ borderTop: `1px solid rgba(16,185,129,0.2)`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Gross Invoice Value</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{inv.grossAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* GST */}
          <div style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>+ GST @18%</div>
              <div style={{ fontSize: 11, color: C.faint }}>Added to invoice — paid by client</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.blue, fontFamily: 'monospace' }}>+₹{inv.gst.toLocaleString()}</div>
          </div>

          {/* Total with GST */}
          <div style={{ padding: '12px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Total Invoice (with GST)</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>₹{(inv.grossAmount + inv.gst).toLocaleString()}</span>
          </div>

          {/* Deductions */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Deductions by Client</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <div>
                  <span style={{ color: C.muted }}>TDS @2% (Section 194C)</span>
                  <div style={{ fontSize: 10, color: C.faint }}>Recoverable via income tax filing</div>
                </div>
                <span style={{ color: C.red, fontWeight: 700, fontFamily: 'monospace' }}>−₹{inv.tds.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <div>
                  <span style={{ color: C.muted }}>Retention @5%</span>
                  <div style={{ fontSize: 10, color: C.faint }}>Released at project completion</div>
                </div>
                <span style={{ color: C.amber, fontWeight: 700, fontFamily: 'monospace' }}>−₹{inv.retention.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net receivable */}
          <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>NET CASH RECEIVABLE</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Amount that arrives in your bank account</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
          </div>

          {/* Locked cash note */}
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: C.muted }}>
            🔒 <strong style={{ color: C.amber }}>₹{(inv.tds + inv.retention).toLocaleString()} locked</strong> — TDS ₹{inv.tds.toLocaleString()} + Retention ₹{inv.retention.toLocaleString()} tracked in Cash Flow report
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — GENERATE INVOICE
// ══════════════════════════════════════════════════════════════════════════
function GenerateInvoice({ invoices, setInvoices, profile }: { invoices: Invoice[]; setInvoices: any; profile: typeof defaultProfile }) {
  const { getRate } = useCostingRates()
  const [selectedProject, setSelectedProject] = useState('RS-01')
  const [month, setMonth] = useState('May 2026')
  const [meters, setMeters] = useState(624)
  const [standbyDays, setStandbyDays] = useState(3)
  const [drillingDays, setDrillingDays] = useState(22)
  const [standbyDaysDay, setStandbyDaysDay] = useState(4)
  const [repairDays, setRepairDays] = useState(2)
  const [includeMob, setIncludeMob] = useState(false)
  const [preview, setPreview] = useState<Invoice | null>(null)
  const [generated, setGenerated] = useState(false)

  // Read from shared context — picks up any changes made in Costing page
  const projInfo = CTX_PROJECTS.find(p => p.id === selectedProject)!
  const proj = { ...projInfo, ...getRate(selectedProject) }
  const isMeterage = proj.contractType === 'meterage'
  const isDayRate  = proj.contractType === 'dayrate'

  // Calculate revenue — reacts to contract type
  const calcRevenue = () => {
    if (isMeterage) {
      let rev = 0
      const b1m = Math.min(meters, proj.band1To)
      rev += b1m * proj.band1Rate
      if (meters > proj.band1To) {
        const b2m = Math.min(meters - proj.band1To, proj.band2To - proj.band1To)
        rev += b2m * proj.band2Rate
      }
      if (meters > proj.band2To) {
        rev += (meters - proj.band2To) * proj.band3Rate
      }
      rev += standbyDays * proj.standbyRate
      if (includeMob) rev += proj.mobilisation
      return rev
    } else {
      // Day rate: drilling days + standby days + repair days
      const dr = proj.drillingDayRate || 0
      const sr = proj.standbyDayRate  || 0
      const rr = proj.repairDayRate   || 0
      let rev = (drillingDays * dr) + (standbyDaysDay * sr) + (repairDays * rr)
      if (includeMob) rev += proj.mobilisation
      return rev
    }
  }

  const grossAmount = calcRevenue()
  const gstAmt = Math.round(grossAmount * proj.gst / 100)
  const tdsAmt = Math.round(grossAmount * proj.tds / 100)
  const retAmt = Math.round(grossAmount * proj.retention / 100)
  const netAmt = grossAmount + gstAmt - tdsAmt - retAmt

  const handleGenerate = () => {
    const inv: Invoice = {
      id: Date.now().toString(),
      invNumber: `INV-2026-0${50 + invoices.length}`,
      project: selectedProject, client: proj.client, month,
      meters, standbyDays, includeMob,
      grossAmount, gst: gstAmt, tds: tdsAmt,
      retention: retAmt, netReceivable: netAmt,
      status: 'Draft', raisedDate: new Date().toLocaleDateString('en-IN'),
      dueDate: '', paidAmount: 0, notes: '',
    }
    setPreview(inv)
    setGenerated(true)
    setInvoices((prev: Invoice[]) => [inv, ...prev])
  }

  // Depth band breakdown
  const b1m = Math.min(meters, proj.band1To)
  const b2m = meters > proj.band1To ? Math.min(meters - proj.band1To, proj.band2To - proj.band1To) : 0
  const b3m = meters > proj.band2To ? meters - proj.band2To : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Left — Input form */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Invoice Details</div>

          {/* Project */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Project</div>
            <div style={{ position: 'relative' }}>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }}>
                {CTX_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.fullName} — {p.client}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Month */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Billing Month</div>
            <div style={{ position: 'relative' }}>
              <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...iStyle, appearance: 'none', cursor: 'pointer' }}>
                {['May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026'].map(m => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Meterage fields */}
          {isMeterage && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Total Meters Drilled
                <span style={{ fontSize: 9, color: C.green, marginLeft: 8, fontWeight: 600 }}>← from drill log</span>
              </div>
              <input type="number" value={meters} onChange={e => setMeters(parseInt(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 20, fontWeight: 800, color: C.orange, textAlign: 'center' }} />
            </div>
          )}

          {isMeterage && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Standby Days</div>
              <input type="number" value={standbyDays} onChange={e => setStandbyDays(parseInt(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 16, fontWeight: 700, color: C.purple }} />
            </div>
          )}

          {/* Day rate fields */}
          {isDayRate && (
            <>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: C.muted }}>
                📅 Day Rate Contract — Drilling ₹{(proj.drillingDayRate||0).toLocaleString()}/day · Standby ₹{(proj.standbyDayRate||0).toLocaleString()}/day · Repair ₹{(proj.repairDayRate||0).toLocaleString()}/day
              </div>
              {[
                { label: 'Drilling Days', val: drillingDays, set: setDrillingDays, color: C.green,  rate: proj.drillingDayRate || 0 },
                { label: 'Standby Days', val: standbyDaysDay, set: setStandbyDaysDay, color: C.amber, rate: proj.standbyDayRate  || 0 },
                { label: 'Repair Days',  val: repairDays,  set: setRepairDays,  color: C.red,   rate: proj.repairDayRate   || 0 },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    {f.label}
                    <span style={{ fontSize: 9, color: f.color, marginLeft: 8 }}>₹{f.rate.toLocaleString()}/day × {f.val}d = ₹{(f.rate * f.val).toLocaleString()}</span>
                  </div>
                  <input type="number" value={f.val} onChange={e => f.set(parseInt(e.target.value) || 0)}
                    style={{ ...iStyle, fontSize: 16, fontWeight: 700, color: f.color }} />
                </div>
              ))}
            </>
          )}

          {/* Include mobilisation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include Mobilisation</div>
              <div style={{ fontSize: 11, color: C.faint }}>₹{proj.mobilisation.toLocaleString()} one-time charge</div>
            </div>
            <button onClick={() => setIncludeMob(!includeMob)} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none',
              background: includeMob ? C.orange : C.border, position: 'relative', transition: 'all 0.2s',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: includeMob ? 23 : 3, transition: 'all 0.2s' }} />
            </button>
          </div>

          <button onClick={handleGenerate} style={{ padding: '14px', borderRadius: 12, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
            Generate Invoice →
          </button>
        </div>

        {/* Right — Live calculation preview */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Live Calculation</div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: C.green, border: '1px solid rgba(16,185,129,0.2)' }}>Auto-calculated</span>
          </div>

          {/* Meterage depth band breakdown */}
          {isMeterage && (
            <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Depth Band Breakdown</div>
              {[
                { label: `Band 1 (0–${proj.band1To}m)`, meters: b1m, rate: proj.band1Rate, color: C.green },
                { label: `Band 2 (${proj.band1To}–${proj.band2To}m)`, meters: b2m, rate: proj.band2Rate, color: C.amber },
                { label: `Band 3 (${proj.band2To}m+)`, meters: b3m, rate: proj.band3Rate, color: C.orange },
              ].map((band, i) => band.meters > 0 && (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{band.label}: {band.meters}m × ₹{band.rate}</span>
                  <span style={{ color: band.color, fontWeight: 700, fontFamily: 'monospace' }}>₹{(band.meters * band.rate).toLocaleString()}</span>
                </div>
              ))}
              {standbyDays > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: C.muted }}>Standby {standbyDays}d × ₹{proj.standbyRate.toLocaleString()}</span>
                  <span style={{ color: C.purple, fontWeight: 700, fontFamily: 'monospace' }}>₹{(standbyDays * proj.standbyRate).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Day rate breakdown */}
          {isDayRate && (
            <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Day Rate Breakdown</div>
              {[
                { label: `Drilling — ${drillingDays} days × ₹${(proj.drillingDayRate||0).toLocaleString()}`, value: drillingDays * (proj.drillingDayRate||0), color: C.green },
                { label: `Standby — ${standbyDaysDay} days × ₹${(proj.standbyDayRate||0).toLocaleString()}`,  value: standbyDaysDay * (proj.standbyDayRate||0),  color: C.amber },
                { label: `Repair — ${repairDays} days × ₹${(proj.repairDayRate||0).toLocaleString()}`,       value: repairDays * (proj.repairDayRate||0),        color: C.red   },
              ].map((row, i) => row.value > 0 && (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 700, fontFamily: 'monospace' }}>₹{row.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {[
            { label: 'Gross Invoice Value', value: grossAmount, color: C.green, size: 18 },
            { label: `+ GST @${proj.gst}%`, value: gstAmt, color: C.blue, prefix: '+', size: 14 },
            { label: `− TDS @${proj.tds}% (Sec 194C)`, value: tdsAmt, color: C.red, prefix: '−', size: 14 },
            { label: `− Retention @${proj.retention}%`, value: retAmt, color: C.amber, prefix: '−', size: 14 },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: 12, color: C.muted }}>{row.label}</span>
              <span style={{ fontSize: row.size, fontWeight: 800, color: row.color, fontFamily: 'monospace' }}>
                {row.prefix}{row.prefix ? '' : ''}₹{row.value.toLocaleString()}
              </span>
            </div>
          ))}

          {/* Net receivable */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>NET CASH RECEIVABLE</div>
              <div style={{ fontSize: 10, color: C.faint }}>Arrives in your bank account</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{netAmt.toLocaleString()}</div>
          </div>

          {generated && (
            <button onClick={() => setPreview(invoices[0])} style={{ padding: '10px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Eye size={14} /> Preview & Download Invoice
            </button>
          )}
        </div>
      </div>

      {preview && <InvoicePreviewModal inv={preview} profile={profile} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — INVOICE TRACKER
// ══════════════════════════════════════════════════════════════════════════
function InvoiceTracker({ invoices, setInvoices, profile }: { invoices: Invoice[]; setInvoices: any; profile: typeof defaultProfile }) {
  const [filterStatus, setFilterStatus] = useState<InvStatus | 'All'>('All')
  const [filterProject, setFilterProject] = useState('All')
  const [preview, setPreview] = useState<Invoice | null>(null)

  const filtered = invoices.filter(inv =>
    (filterStatus === 'All' || inv.status === filterStatus) &&
    (filterProject === 'All' || inv.project === filterProject)
  )

  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.netReceivable - i.paidAmount, 0)
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length
  const totalRetention = invoices.reduce((s, i) => s + i.retention, 0)
  const totalTDS = invoices.reduce((s, i) => s + i.tds, 0)

  const updateStatus = (id: string, status: InvStatus) =>
    setInvoices((prev: Invoice[]) => prev.map(i => i.id === id ? { ...i, status } : i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Outstanding', value: `₹${(totalOutstanding / 100000).toFixed(1)}L`, color: C.orange, icon: '💰' },
          { label: 'Overdue Invoices',  value: overdueCount,  color: overdueCount > 0 ? C.red : C.green, icon: '🚨' },
          { label: 'Retention Locked',  value: `₹${(totalRetention / 100000).toFixed(1)}L`, color: C.amber, icon: '🔒' },
          { label: 'TDS Locked',        value: `₹${(totalTDS / 100000).toFixed(1)}L`, color: C.purple, icon: '📋' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            style={{ ...iStyle, width: 'auto', appearance: 'none', cursor: 'pointer', paddingRight: 28 }}>
            <option value="All">All Projects</option>
            {PROJECTS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', 'Draft', 'Raised', 'MB Pending', 'Submitted', 'Partially Paid', 'Paid', 'Overdue'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: filterStatus === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterStatus === s ? 'rgba(249,115,22,0.35)' : C.border}`,
              color: filterStatus === s ? C.orange : C.faint,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Invoice No', 'Project', 'Month', 'Gross Value', 'Net Receivable', 'Status', 'Raised', 'Due Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: inv.status === 'Overdue' ? 'rgba(239,68,68,0.02)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, fontFamily: 'monospace' }}>{inv.invNumber}</div>
                  {inv.notes && <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{inv.notes}</div>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{inv.project}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{inv.client}</div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{inv.month}</td>
                <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>₹{inv.grossAmount.toLocaleString()}</td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
                  {inv.paidAmount > 0 && inv.paidAmount < inv.netReceivable && (
                    <div style={{ fontSize: 10, color: C.amber }}>₹{inv.paidAmount.toLocaleString()} received</div>
                  )}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ position: 'relative' }}>
                    <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value as InvStatus)}
                      style={{ appearance: 'none', background: STATUS_CONFIG[inv.status].bg, border: `1px solid ${STATUS_CONFIG[inv.status].border}`, color: STATUS_CONFIG[inv.status].color, fontSize: 11, fontWeight: 700, padding: '5px 24px 5px 10px', borderRadius: 20, cursor: 'pointer', outline: 'none' }}>
                      {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={10} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: STATUS_CONFIG[inv.status].color, pointerEvents: 'none' }} />
                  </div>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: C.muted }}>{inv.raisedDate}</td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: inv.status === 'Overdue' ? C.red : C.muted }}>{inv.dueDate || '—'}</td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPreview(inv)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Eye size={12} /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: C.faint }}>No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && <InvoicePreviewModal inv={preview} profile={profile} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function InvoicingPage() {
  const [activeTab, setActiveTab] = useState('generate')
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices)
  const [profile, setProfile] = useState(defaultProfile)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, minHeight: '100vh', background: C.bg }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>Finance & Invoicing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Auto-generate invoices · track payments · monitor locked cash</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Building2 size={14} /> Company Profile
          </button>
          <FinanceNav active="Invoicing" />
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6 }}>
        {INV_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: activeTab === t.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)',
            color: activeTab === t.id ? '#fff' : C.muted,
            boxShadow: activeTab === t.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'generate' && <GenerateInvoice invoices={invoices} setInvoices={setInvoices} profile={profile} />}
      {activeTab === 'tracker'  && <InvoiceTracker invoices={invoices} setInvoices={setInvoices} profile={profile} />}

      {showProfile && <CompanyProfileModal profile={profile} onClose={() => setShowProfile(false)} onSave={setProfile} />}
    </div>
  )
}

