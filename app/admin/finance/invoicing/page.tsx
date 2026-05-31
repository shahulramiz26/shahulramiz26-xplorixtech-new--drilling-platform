'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Download, Check, ChevronDown, X, Building2,
  FileText, Clock, AlertTriangle, CheckCircle,
  Plus, Eye, Lock, TrendingUp, Calendar
} from 'lucide-react'
import { useCostingRates, PROJECTS as CTX_PROJECTS } from '../costing-context'

// ── COLOURS ───────────────────────────────────────────────────────────────
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

// ── TYPES ─────────────────────────────────────────────────────────────────
type InvStatus = 'Draft' | 'Raised' | 'MB Pending' | 'Submitted' | 'Partially Paid' | 'Paid' | 'Overdue'

interface Invoice {
  id: string
  invNumber: string
  project: string
  client: string
  month: string
  meters: number
  standbyDays: number
  includeMob: boolean
  grossAmount: number
  gstAmt: number
  tdsAmt: number
  retentionAmt: number
  netReceivable: number
  status: InvStatus
  raisedDate: string
  dueDate: string
  paidAmount: number
  notes: string
}

const STATUS_CONFIG: Record<InvStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Draft':           { color: C.muted,   bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', icon: <FileText size={11} /> },
  'Raised':          { color: C.blue,    bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  icon: <FileText size={11} /> },
  'MB Pending':      { color: C.amber,   bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  icon: <Clock size={11} /> },
  'Submitted':       { color: C.purple,  bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  icon: <FileText size={11} /> },
  'Partially Paid':  { color: C.orange,  bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',  icon: <CheckCircle size={11} /> },
  'Paid':            { color: C.green,   bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  icon: <CheckCircle size={11} /> },
  'Overdue':         { color: C.red,     bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   icon: <AlertTriangle size={11} /> },
}

// ── SEED INVOICES ─────────────────────────────────────────────────────────
const SEED_INVOICES: Invoice[] = [
  { id: '1', invNumber: 'INV-2026-042', project: 'RS-01',     client: 'CMPDI', month: 'Apr 2026', meters: 624, standbyDays: 3, includeMob: false, grossAmount: 619200, gstAmt: 111456, tdsAmt: 12384,  retentionAmt: 30960, netReceivable: 687312, status: 'Overdue',       raisedDate: '02.05.2026', dueDate: '01.06.2026', paidAmount: 0,      notes: '45 days overdue' },
  { id: '2', invNumber: 'INV-2026-041', project: 'CMPDI-DAM', client: 'CMPDI', month: 'Apr 2026', meters: 412, standbyDays: 2, includeMob: false, grossAmount: 356000, gstAmt: 64080,  tdsAmt: 7120,   retentionAmt: 17800, netReceivable: 395160, status: 'Paid',          raisedDate: '01.05.2026', dueDate: '31.05.2026', paidAmount: 395160, notes: '' },
  { id: '3', invNumber: 'INV-2026-043', project: 'CMP-MAD',   client: 'CMPDI', month: 'Apr 2026', meters: 318, standbyDays: 1, includeMob: false, grossAmount: 263400, gstAmt: 47412,  tdsAmt: 5268,   retentionAmt: 13170, netReceivable: 292374, status: 'Submitted',     raisedDate: '03.05.2026', dueDate: '02.06.2026', paidAmount: 0,      notes: 'MB certified' },
  { id: '4', invNumber: 'INV-2026-044', project: 'DGMIL-BHK', client: 'DGML',  month: 'Apr 2026', meters: 280, standbyDays: 2, includeMob: false, grossAmount: 238000, gstAmt: 42840,  tdsAmt: 4760,   retentionAmt: 11900, netReceivable: 264180, status: 'MB Pending',    raisedDate: '04.05.2026', dueDate: '03.06.2026', paidAmount: 0,      notes: 'Awaiting MB sign-off' },
  { id: '5', invNumber: 'INV-2026-038', project: 'RS-01',     client: 'CMPDI', month: 'Mar 2026', meters: 598, standbyDays: 2, includeMob: false, grossAmount: 591100, gstAmt: 106398, tdsAmt: 11822,  retentionAmt: 29555, netReceivable: 656121, status: 'Partially Paid', raisedDate: '01.04.2026', dueDate: '01.05.2026', paidAmount: 350000, notes: 'Partial ₹3.5L received' },
  { id: '6', invNumber: 'INV-2026-031', project: 'CMPDI-DAM', client: 'CMPDI', month: 'Feb 2026', meters: 386, standbyDays: 0, includeMob: true,  grossAmount: 537320, gstAmt: 96717,  tdsAmt: 10746,  retentionAmt: 26866, netReceivable: 596425, status: 'Paid',          raisedDate: '02.03.2026', dueDate: '01.04.2026', paidAmount: 596425, notes: 'Includes mobilisation' },
]

// ── DEFAULT COMPANY PROFILE ───────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
  address: 'Enter your company address here',
  gstin: 'Enter GSTIN',
  contact: 'Enter contact details',
  logo: '',
}

// ── NAV ───────────────────────────────────────────────────────────────────
function FinanceNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
      {[
        { href: '/admin/finance',           label: 'Dashboard' },
        { href: '/admin/finance/costing',   label: 'Costing'   },
        { href: '/admin/finance/invoicing', label: 'Invoicing' },
        { href: '/admin/finance/reports',   label: 'Reports'   },
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

// ── COMPANY PROFILE MODAL ─────────────────────────────────────────────────
function CompanyProfileModal({ profile, onClose, onSave }: { profile: typeof DEFAULT_PROFILE; onClose: () => void; onSave: (p: typeof DEFAULT_PROFILE) => void }) {
  const [form, setForm] = useState({ ...profile })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
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
            { label: 'Company Name',           field: 'name',    placeholder: 'ANMAK CONSULTANCY SERVICES PVT. LTD.' },
            { label: 'Company Address',        field: 'address', placeholder: 'Full registered address with PIN code' },
            { label: 'GSTIN',                  field: 'gstin',   placeholder: 'e.g. 27AAAAA0000A1Z5' },
            { label: 'Contact (Email/Phone)',   field: 'contact', placeholder: 'email@company.com · +91 XXXXX XXXXX' },
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
function InvoicePreviewModal({ inv, profile, onClose }: { inv: Invoice; profile: typeof DEFAULT_PROFILE; onClose: () => void }) {
  const downloadHTML = () => {
    const html = `<!DOCTYPE html><html><head><title>${inv.invNumber}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:820px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #F97316;margin-bottom:28px}
  .company-name{font-size:16px;font-weight:800}.company-detail{font-size:12px;color:#555;line-height:1.7;margin-top:4px}
  .inv-title{font-size:28px;font-weight:900;color:#F97316;text-align:right}
  .inv-meta{font-size:12px;color:#555;text-align:right;margin-top:6px;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin:20px 0}
  th{background:#111;color:#fff;padding:10px 14px;text-align:left;font-size:11px}
  td{padding:10px 14px;border-bottom:1px solid #eee;font-size:13px}
  .total-row td{background:#fff7f0;font-weight:700;font-size:15px;border-top:2px solid #F97316}
  .net-row td{background:#f0fdf4;font-weight:800;font-size:17px;color:#065f46;border-top:2px solid #10B981}
  .deduction td{color:#dc2626}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#9CA3AF}
</style></head><body>
<div class="header">
  <div>
    <div class="company-name">${profile.name}</div>
    <div class="company-detail">${profile.address}<br>GSTIN: ${profile.gstin}<br>${profile.contact}</div>
  </div>
  <div>
    <div class="inv-title">TAX INVOICE</div>
    <div class="inv-meta"><strong>${inv.invNumber}</strong><br>Date: ${inv.raisedDate}<br>Project: ${inv.project}<br>Client: ${inv.client}<br>Period: ${inv.month}</div>
  </div>
</div>
<table>
  <tr><th>#</th><th>Description</th><th>Details</th><th style="text-align:right">Amount (₹)</th></tr>
  <tr><td>1</td><td>Drilling Services — ${inv.project}</td><td>${inv.meters}m drilled · ${inv.month}</td><td style="text-align:right;font-weight:700">₹${inv.grossAmount.toLocaleString()}</td></tr>
  ${inv.standbyDays > 0 ? `<tr><td>2</td><td>Standby Charges</td><td>${inv.standbyDays} days</td><td style="text-align:right">Included above</td></tr>` : ''}
  ${inv.includeMob ? `<tr><td>3</td><td>Mobilisation Charges</td><td>One-time</td><td style="text-align:right">Included above</td></tr>` : ''}
  <tr class="total-row"><td colspan="3"><strong>Gross Invoice Value</strong></td><td style="text-align:right"><strong>₹${inv.grossAmount.toLocaleString()}</strong></td></tr>
  ${inv.gstAmt > 0 ? `<tr><td colspan="3">+ GST @18%</td><td style="text-align:right;color:#3B82F6">+₹${inv.gstAmt.toLocaleString()}</td></tr>` : ''}
  ${inv.tdsAmt > 0 ? `<tr class="deduction"><td colspan="3">− TDS @2% (Section 194C)</td><td style="text-align:right">−₹${inv.tdsAmt.toLocaleString()}</td></tr>` : ''}
  ${inv.retentionAmt > 0 ? `<tr class="deduction"><td colspan="3">− Retention @5%</td><td style="text-align:right">−₹${inv.retentionAmt.toLocaleString()}</td></tr>` : ''}
  <tr class="net-row"><td colspan="3"><strong>NET CASH RECEIVABLE</strong></td><td style="text-align:right"><strong>₹${inv.netReceivable.toLocaleString()}</strong></td></tr>
</table>
${inv.notes ? `<p style="font-size:13px;color:#555"><strong>Notes:</strong> ${inv.notes}</p>` : ''}
<div class="footer">Generated by XPLORIX Finance Module · ${profile.name} · GSTIN: ${profile.gstin}</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${inv.invNumber}.html`; a.click()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{inv.invNumber}</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{inv.project} · {inv.client} · {inv.month}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={downloadHTML} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
              <Download size={14} /> Download
            </button>
            <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Revenue */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Revenue</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: C.muted }}>Drilling services · {inv.meters}m · {inv.month}</span>
              <span style={{ color: C.green, fontWeight: 700, fontFamily: 'monospace' }}>₹{inv.grossAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Statutory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inv.gstAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 13 }}>
                <span style={{ color: C.muted }}>+ GST @18%</span>
                <span style={{ color: C.blue, fontWeight: 700, fontFamily: 'monospace' }}>+₹{inv.gstAmt.toLocaleString()}</span>
              </div>
            )}
            {inv.tdsAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)', fontSize: 13 }}>
                <div>
                  <span style={{ color: C.muted }}>− TDS @2% (Sec 194C)</span>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>Deducted by client · recoverable via tax filing</div>
                </div>
                <span style={{ color: C.red, fontWeight: 700, fontFamily: 'monospace' }}>−₹{inv.tdsAmt.toLocaleString()}</span>
              </div>
            )}
            {inv.retentionAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)', fontSize: 13 }}>
                <div>
                  <span style={{ color: C.muted }}>− Retention @5%</span>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>Held till project completion</div>
                </div>
                <span style={{ color: C.amber, fontWeight: 700, fontFamily: 'monospace' }}>−₹{inv.retentionAmt.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Net receivable */}
          <div style={{ padding: '18px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>NET CASH RECEIVABLE</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Amount that arrives in your bank</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
          </div>

          {inv.tdsAmt + inv.retentionAmt > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: C.muted }}>
              🔒 <strong style={{ color: C.amber }}>₹{(inv.tdsAmt + inv.retentionAmt).toLocaleString()} locked</strong> — tracked in Cash Flow
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — GENERATE INVOICE
// ══════════════════════════════════════════════════════════════════════════
function GenerateInvoice({ invoices, setInvoices, profile }: { invoices: Invoice[]; setInvoices: any; profile: typeof DEFAULT_PROFILE }) {
  const { getRate } = useCostingRates()
  const searchParams = useSearchParams()
  const urlProject = searchParams.get('project')
  const [selectedProject, setSelectedProject] = useState(urlProject || 'RS-01')
  const [month, setMonth] = useState('May 2026')
  const [meters, setMeters] = useState(624)
  const [standbyDays, setStandbyDays] = useState(3)
  const [drillingDays, setDrillingDays] = useState(22)
  const [standbyDaysDay, setStandbyDaysDay] = useState(4)
  const [repairDays, setRepairDays] = useState(2)
  const [includeMob, setIncludeMob] = useState(false)
  const [preview, setPreview] = useState<Invoice | null>(null)
  const [generated, setGenerated] = useState(false)

  useEffect(() => { if (urlProject) setSelectedProject(urlProject) }, [urlProject])

  const projInfo = CTX_PROJECTS.find(p => p.id === selectedProject)!
  const ctxRate  = getRate(selectedProject)
  const proj = {
    id: projInfo.id, fullName: projInfo.fullName, client: projInfo.client,
    contractType: ctxRate.contractType,
    band1Rate: ctxRate.band1Rate, band2Rate: ctxRate.band2Rate, band3Rate: ctxRate.band3Rate,
    band1To: ctxRate.band1To, band2To: ctxRate.band2To,
    standbyRate: ctxRate.standbyRate,
    drillingDayRate: ctxRate.drillingDayRate, standbyDayRate: ctxRate.standbyDayRate, repairDayRate: ctxRate.repairDayRate,
    mobilisation: ctxRate.mobilisation, gst: ctxRate.gst, tds: ctxRate.tds, retention: ctxRate.retention,
  }
  const isMeterage = proj.contractType === 'meterage'
  const isDayRate  = proj.contractType === 'dayrate'

  const calcRevenue = () => {
    if (isMeterage) {
      let rev = 0
      const b1m = Math.min(meters, proj.band1To)
      if (proj.band1Rate > 0) rev += b1m * proj.band1Rate
      if (meters > proj.band1To && proj.band2Rate > 0) rev += Math.min(meters - proj.band1To, proj.band2To - proj.band1To) * proj.band2Rate
      if (meters > proj.band2To && proj.band3Rate > 0) rev += (meters - proj.band2To) * proj.band3Rate
      if (proj.standbyRate > 0) rev += standbyDays * proj.standbyRate
      if (includeMob && proj.mobilisation > 0) rev += proj.mobilisation
      return rev
    } else {
      let rev = (drillingDays * proj.drillingDayRate) + (standbyDaysDay * proj.standbyDayRate) + (repairDays * proj.repairDayRate)
      if (includeMob && proj.mobilisation > 0) rev += proj.mobilisation
      return rev
    }
  }

  const grossAmount = calcRevenue()
  const gstAmt      = proj.gst > 0 ? Math.round(grossAmount * proj.gst / 100) : 0
  const tdsAmt      = proj.tds > 0 ? Math.round(grossAmount * proj.tds / 100) : 0
  const retAmt      = proj.retention > 0 ? Math.round(grossAmount * proj.retention / 100) : 0
  const netAmt      = grossAmount + gstAmt - tdsAmt - retAmt

  const b1m = Math.min(meters, proj.band1To)
  const b2m = meters > proj.band1To ? Math.min(meters - proj.band1To, proj.band2To - proj.band1To) : 0
  const b3m = meters > proj.band2To ? meters - proj.band2To : 0

  const handleGenerate = () => {
    const inv: Invoice = {
      id: Date.now().toString(),
      invNumber: `INV-2026-0${50 + invoices.length}`,
      project: selectedProject, client: proj.client, month,
      meters, standbyDays, includeMob,
      grossAmount, gstAmt, tdsAmt, retentionAmt: retAmt, netReceivable: netAmt,
      status: 'Draft', raisedDate: new Date().toLocaleDateString('en-IN'),
      dueDate: '', paidAmount: 0, notes: '',
    }
    setInvoices((prev: Invoice[]) => [inv, ...prev])
    setPreview(inv)
    setGenerated(true)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Left — Input */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Invoice Details</div>

        {/* Project */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Project</div>
          <div style={{ position: 'relative' }}>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              style={{ ...iStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}>
              {CTX_PROJECTS.map(p => {
                const r = getRate(p.id)
                return <option key={p.id} value={p.id}>{p.fullName} — {p.client} ({r.contractType === 'meterage' ? 'Meterage' : 'Day Rate'})</option>
              })}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Contract type badge */}
        <div style={{ padding: '10px 14px', borderRadius: 10, background: isMeterage ? 'rgba(249,115,22,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${isMeterage ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isMeterage ? C.orange : C.blue }}>
            {isMeterage ? '📏 Meterage Contract' : '📅 Day Rate Contract'}
          </span>
          <span style={{ fontSize: 11, color: C.faint }}>
            {isMeterage ? `₹${proj.band1Rate}/m · ₹${proj.band2Rate}/m · ₹${proj.band3Rate}/m` : `₹${proj.drillingDayRate.toLocaleString()}/day`}
          </span>
        </div>

        {/* Month */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Billing Month</div>
          <div style={{ position: 'relative' }}>
            <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...iStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}>
              {['May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026'].map(m => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Meterage fields */}
        {isMeterage && (
          <>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Total Meters Drilled
                <span style={{ fontSize: 9, color: C.green, marginLeft: 8 }}>← from drill log</span>
              </div>
              <input type="number" value={meters} onChange={e => setMeters(parseInt(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 22, fontWeight: 900, color: C.orange, textAlign: 'center' }} />
            </div>
            {proj.standbyRate > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Standby Days</div>
                <input type="number" value={standbyDays} onChange={e => setStandbyDays(parseInt(e.target.value) || 0)}
                  style={{ ...iStyle, fontSize: 16, fontWeight: 700, color: C.purple }} />
              </div>
            )}
          </>
        )}

        {/* Day rate fields */}
        {isDayRate && (
          <>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: C.muted }}>
              Drilling ₹{proj.drillingDayRate.toLocaleString()}/day · Standby ₹{proj.standbyDayRate.toLocaleString()}/day · Repair ₹{proj.repairDayRate.toLocaleString()}/day
            </div>
            {[
              { label: 'Drilling Days', val: drillingDays, set: setDrillingDays, color: C.green, rate: proj.drillingDayRate },
              { label: 'Standby Days',  val: standbyDaysDay, set: setStandbyDaysDay, color: C.amber, rate: proj.standbyDayRate },
              { label: 'Repair Days',   val: repairDays,  set: setRepairDays, color: C.red, rate: proj.repairDayRate },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                  {f.label}
                  <span style={{ fontSize: 9, color: f.color, marginLeft: 8 }}>= ₹{(f.rate * f.val).toLocaleString()}</span>
                </div>
                <input type="number" value={f.val} onChange={e => f.set(parseInt(e.target.value) || 0)}
                  style={{ ...iStyle, fontSize: 16, fontWeight: 700, color: f.color }} />
              </div>
            ))}
          </>
        )}

        {/* Mobilisation toggle */}
        {proj.mobilisation > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include Mobilisation</div>
              <div style={{ fontSize: 11, color: C.faint }}>₹{proj.mobilisation.toLocaleString()} one-time</div>
            </div>
            <button onClick={() => setIncludeMob(!includeMob)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none', background: includeMob ? C.orange : C.border, position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: includeMob ? 23 : 3, transition: 'all 0.2s' }} />
            </button>
          </div>
        )}

        <button onClick={handleGenerate} style={{ padding: '14px', borderRadius: 12, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
          Generate Invoice →
        </button>

        {generated && (
          <button onClick={() => setPreview(invoices[0])} style={{ padding: '10px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Eye size={14} /> Preview & Download Invoice
          </button>
        )}
      </div>

      {/* Right — Live calculation */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Live Calculation</div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: C.green, border: '1px solid rgba(16,185,129,0.2)' }}>Auto-calculated</span>
        </div>

        {/* Breakdown */}
        {isMeterage && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Depth Band Breakdown</div>
            {proj.band1Rate > 0 && b1m > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.muted }}>Band 1 (0–{proj.band1To}m): {b1m}m × ₹{proj.band1Rate}</span>
                <span style={{ color: C.green, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b1m * proj.band1Rate).toLocaleString()}</span>
              </div>
            )}
            {proj.band2Rate > 0 && b2m > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.muted }}>Band 2 ({proj.band1To}–{proj.band2To}m): {b2m}m × ₹{proj.band2Rate}</span>
                <span style={{ color: C.amber, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b2m * proj.band2Rate).toLocaleString()}</span>
              </div>
            )}
            {proj.band3Rate > 0 && b3m > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.muted }}>Band 3 ({proj.band2To}m+): {b3m}m × ₹{proj.band3Rate}</span>
                <span style={{ color: C.orange, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b3m * proj.band3Rate).toLocaleString()}</span>
              </div>
            )}
            {proj.standbyRate > 0 && standbyDays > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: C.muted }}>Standby {standbyDays}d × ₹{proj.standbyRate.toLocaleString()}</span>
                <span style={{ color: C.purple, fontWeight: 700, fontFamily: 'monospace' }}>₹{(standbyDays * proj.standbyRate).toLocaleString()}</span>
              </div>
            )}
            {includeMob && proj.mobilisation > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 6 }}>
                <span style={{ color: C.muted }}>Mobilisation (one-time)</span>
                <span style={{ color: C.green, fontWeight: 700, fontFamily: 'monospace' }}>₹{proj.mobilisation.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {isDayRate && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Day Rate Breakdown</div>
            {[
              { label: `Drilling — ${drillingDays}d × ₹${proj.drillingDayRate.toLocaleString()}`, value: drillingDays * proj.drillingDayRate, color: C.green },
              { label: `Standby — ${standbyDaysDay}d × ₹${proj.standbyDayRate.toLocaleString()}`,  value: standbyDaysDay * proj.standbyDayRate,  color: C.amber },
              { label: `Repair — ${repairDays}d × ₹${proj.repairDayRate.toLocaleString()}`,        value: repairDays * proj.repairDayRate,        color: C.red   },
            ].filter(r => r.value > 0).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 700, fontFamily: 'monospace' }}>₹{row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary rows */}
        {[
          { label: 'Gross Invoice Value', value: grossAmount, color: C.green,  prefix: '',  size: 18, show: true },
          { label: `+ GST @${proj.gst}%`, value: gstAmt,    color: C.blue,   prefix: '+', size: 14, show: proj.gst > 0 },
          { label: `− TDS @${proj.tds}%`, value: tdsAmt,    color: C.red,    prefix: '−', size: 14, show: proj.tds > 0 },
          { label: `− Retention @${proj.retention}%`, value: retAmt, color: C.amber, prefix: '−', size: 14, show: proj.retention > 0 },
        ].filter(r => r.show).map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 12, color: C.muted }}>{row.label}</span>
            <span style={{ fontSize: row.size, fontWeight: 800, color: row.color, fontFamily: 'monospace' }}>
              {row.prefix}₹{row.value.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Net receivable */}
        <div style={{ padding: '18px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>NET CASH RECEIVABLE</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Arrives in your bank</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{netAmt.toLocaleString()}</div>
        </div>

        {(tdsAmt + retAmt) > 0 && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: C.muted }}>
            🔒 <strong style={{ color: C.amber }}>₹{(tdsAmt + retAmt).toLocaleString()} locked</strong> — TDS ₹{tdsAmt.toLocaleString()} + Retention ₹{retAmt.toLocaleString()}
          </div>
        )}
      </div>

      {preview && <InvoicePreviewModal inv={preview} profile={profile} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — INVOICE TRACKER
// ══════════════════════════════════════════════════════════════════════════
function InvoiceTracker({ invoices, setInvoices, profile }: { invoices: Invoice[]; setInvoices: any; profile: typeof DEFAULT_PROFILE }) {
  const [filterStatus, setFilterStatus] = useState<InvStatus | 'All'>('All')
  const [filterProject, setFilterProject] = useState('All')
  const [preview, setPreview] = useState<Invoice | null>(null)

  const filtered = invoices.filter(inv =>
    (filterStatus === 'All' || inv.status === filterStatus) &&
    (filterProject === 'All' || inv.project === filterProject)
  )

  const totalBilled      = invoices.reduce((s, i) => s + i.grossAmount, 0)
  const totalReceived    = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.netReceivable, 0)
  const totalOutstanding = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.netReceivable - i.paidAmount, 0)
  const totalOverdue     = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.netReceivable, 0)

  const updateStatus = (id: string, status: InvStatus) =>
    setInvoices((prev: Invoice[]) => prev.map(i => i.id === id ? { ...i, status } : i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Billed',      value: `₹${(totalBilled/100000).toFixed(1)}L`,      color: C.text,   icon: '📋', sub: 'All invoices' },
          { label: 'Total Received',    value: `₹${(totalReceived/100000).toFixed(1)}L`,    color: C.green,  icon: '✅', sub: 'Paid invoices' },
          { label: 'Outstanding',       value: `₹${(totalOutstanding/100000).toFixed(1)}L`, color: C.orange, icon: '⏳', sub: 'Unpaid balance' },
          { label: 'Overdue',           value: `₹${(totalOverdue/100000).toFixed(1)}L`,     color: C.red,    icon: '🚨', sub: `${invoices.filter(i => i.status === 'Overdue').length} invoices` },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            style={{ ...iStyle, width: 'auto', appearance: 'none', cursor: 'pointer', paddingRight: 28, fontSize: 12 }}>
            <option value="All">All Projects</option>
            {CTX_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
          </select>
          <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', 'Draft', 'Raised', 'MB Pending', 'Submitted', 'Partially Paid', 'Paid', 'Overdue'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: filterStatus === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterStatus === s ? 'rgba(249,115,22,0.35)' : C.border}`,
              color: filterStatus === s ? C.orange : C.faint,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Invoice list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, color: C.faint }}>No invoices found.</div>
        )}
        {filtered.map(inv => {
          const sc = STATUS_CONFIG[inv.status]
          const isOverdue = inv.status === 'Overdue'
          return (
            <div key={inv.id} style={{ background: C.card, border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: 14, padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = isOverdue ? 'rgba(239,68,68,0.4)' : 'rgba(249,115,22,0.25)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = isOverdue ? 'rgba(239,68,68,0.25)' : C.border}>

              {/* Invoice info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: C.orange, fontFamily: 'monospace' }}>{inv.invNumber}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    {sc.icon} {inv.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{inv.project} · {inv.client} · {inv.month}</div>
                {inv.notes && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{inv.notes}</div>}
              </div>

              {/* Amounts */}
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Net receivable</div>
                {inv.paidAmount > 0 && inv.paidAmount < inv.netReceivable && (
                  <div style={{ fontSize: 11, color: C.amber, marginTop: 2 }}>₹{inv.paidAmount.toLocaleString()} received</div>
                )}
              </div>

              {/* Dates */}
              <div>
                <div style={{ fontSize: 12, color: C.muted }}>Raised: {inv.raisedDate}</div>
                {inv.dueDate && <div style={{ fontSize: 12, color: isOverdue ? C.red : C.faint, marginTop: 2, fontWeight: isOverdue ? 700 : 400 }}>Due: {inv.dueDate}</div>}
                {(inv.tdsAmt + inv.retentionAmt) > 0 && (
                  <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>🔒 ₹{(inv.tdsAmt + inv.retentionAmt).toLocaleString()} locked</div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value as InvStatus)}
                    style={{ appearance: 'none', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 11, fontWeight: 700, padding: '6px 24px 6px 10px', borderRadius: 20, cursor: 'pointer', outline: 'none', width: '100%' }}>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: sc.color, pointerEvents: 'none' }} />
                </div>
                <button onClick={() => setPreview(inv)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  <Eye size={12} /> View / Download
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {preview && <InvoicePreviewModal inv={preview} profile={profile} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — CASH FLOW
// ══════════════════════════════════════════════════════════════════════════
function CashFlow({ invoices }: { invoices: Invoice[] }) {

  // Calculate all figures from invoices
  const totalBilled     = invoices.reduce((s, i) => s + i.grossAmount, 0)
  const totalReceived   = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.netReceivable, 0)
  const totalPending    = invoices.filter(i => !['Paid', 'Draft'].includes(i.status)).reduce((s, i) => s + (i.netReceivable - i.paidAmount), 0)
  const totalOverdue    = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.netReceivable, 0)
  const totalRetention  = invoices.reduce((s, i) => s + i.retentionAmt, 0)
  const totalTDS        = invoices.reduce((s, i) => s + i.tdsAmt, 0)
  const totalLocked     = totalRetention + totalTDS
  const partialPaid     = invoices.filter(i => i.status === 'Partially Paid').reduce((s, i) => s + i.paidAmount, 0)
  const grandReceived   = totalReceived + partialPaid

  // Client-wise breakdown
  const clients = ['CMPDI', 'DGML', 'MECL']
  const clientData = clients.map(client => {
    const clientInvs = invoices.filter(i => i.client === client)
    return {
      client,
      billed:    clientInvs.reduce((s, i) => s + i.grossAmount, 0),
      received:  clientInvs.filter(i => i.status === 'Paid').reduce((s, i) => s + i.netReceivable, 0),
      overdue:   clientInvs.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.netReceivable, 0),
      pending:   clientInvs.filter(i => !['Paid','Draft'].includes(i.status)).reduce((s, i) => s + (i.netReceivable - i.paidAmount), 0),
      retention: clientInvs.reduce((s, i) => s + i.retentionAmt, 0),
      tds:       clientInvs.reduce((s, i) => s + i.tdsAmt, 0),
      invoiceCount: clientInvs.length,
    }
  }).filter(c => c.billed > 0)

  // Outstanding invoices
  const outstanding = invoices.filter(i => !['Paid', 'Draft'].includes(i.status))
    .sort((a, b) => (a.status === 'Overdue' ? -1 : 1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Top summary — money pipeline */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 20 }}>Receivables Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[
            { label: 'Total Billed',    value: totalBilled,    color: C.text,   bg: 'rgba(255,255,255,0.03)', icon: '📋', note: 'All invoices raised' },
            { label: 'Cash Received',   value: grandReceived,  color: C.green,  bg: 'rgba(16,185,129,0.06)', icon: '✅', note: 'Paid + partial payments' },
            { label: 'Still Pending',   value: totalPending,   color: C.orange, bg: 'rgba(249,115,22,0.06)', icon: '⏳', note: 'Invoiced, not yet paid' },
            { label: 'Overdue',         value: totalOverdue,   color: C.red,    bg: 'rgba(239,68,68,0.06)',  icon: '🚨', note: 'Past due date' },
          ].map((k, i) => (
            <div key={i} style={{ padding: '18px 20px', borderRadius: 12, background: k.bg, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{k.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>₹{(k.value/100000).toFixed(1)}L</div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>{k.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked cash — the money you earned but can't touch */}
      <div style={{ background: C.card, border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={16} style={{ color: C.amber }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Locked Cash</div>
            </div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>Money you've earned but cannot spend yet</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, fontFamily: 'monospace' }}>₹{(totalLocked/100000).toFixed(1)}L</div>
            <div style={{ fontSize: 11, color: C.faint }}>total locked</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Retention */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Retention Money</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.red, fontFamily: 'monospace', marginBottom: 6 }}>₹{(totalRetention/100000).toFixed(1)}L</div>
            <div style={{ fontSize: 11, color: C.faint }}>Held by clients until project completion</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Released when each project closes</div>
          </div>

          {/* TDS */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.purple }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.08em' }}>TDS Deducted</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.purple, fontFamily: 'monospace', marginBottom: 6 }}>₹{(totalTDS/100000).toFixed(1)}L</div>
            <div style={{ fontSize: 11, color: C.faint }}>Deducted by clients under Sec 194C</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Recoverable via annual income tax filing</div>
          </div>
        </div>
      </div>

      {/* Client-wise breakdown */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700, color: C.text }}>
          Client-wise Receivables
        </div>
        {clientData.map((c, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: C.orange }}>{c.client[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.client}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{c.invoiceCount} invoices</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>₹{(c.billed/100000).toFixed(1)}L billed</div>
                {c.overdue > 0 && <div style={{ fontSize: 11, color: C.red, fontWeight: 700, marginTop: 2 }}>⚠ ₹{(c.overdue/100000).toFixed(1)}L overdue</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { label: 'Received',  value: c.received,  color: C.green  },
                { label: 'Pending',   value: c.pending,   color: C.orange },
                { label: 'Retention', value: c.retention, color: C.amber  },
                { label: 'TDS',       value: c.tds,       color: C.purple },
              ].map((stat, j) => (
                <div key={j} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>₹{(stat.value/100000).toFixed(1)}L</div>
                  <div style={{ fontSize: 9, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Outstanding invoices */}
      {outstanding.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Outstanding Invoices</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', color: C.orange, border: '1px solid rgba(249,115,22,0.2)' }}>
              {outstanding.length} unpaid
            </span>
          </div>
          {outstanding.map((inv, i) => {
            const sc = STATUS_CONFIG[inv.status]
            const isOverdue = inv.status === 'Overdue'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: `1px solid rgba(30,41,59,0.4)`, background: isOverdue ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
                <div style={{ width: 4, height: 40, borderRadius: 2, background: sc.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.orange, fontFamily: 'monospace' }}>{inv.invNumber}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>{inv.status}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{inv.project} · {inv.client} · {inv.month} · Raised {inv.raisedDate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: isOverdue ? C.red : C.text, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
                  {inv.dueDate && <div style={{ fontSize: 11, color: isOverdue ? C.red : C.faint, marginTop: 2 }}>Due: {inv.dueDate}</div>}
                </div>
              </div>
            )
          })}
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.faint }}>Total Outstanding</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>₹{(totalPending/100000).toFixed(1)}L</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'generate', label: 'Generate Invoice', icon: '📄' },
  { id: 'tracker',  label: 'Invoice Tracker',  icon: '📊' },
  { id: 'cashflow', label: 'Cash Flow',         icon: '💰' },
]

function InvoicingPageInner() {
  const [activeTab, setActiveTab] = useState('generate')
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === 'undefined') return SEED_INVOICES
    try {
      const saved = localStorage.getItem('xplorix_invoices')
      return saved ? JSON.parse(saved) : SEED_INVOICES
    } catch { return SEED_INVOICES }
  })
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem('xplorix_invoices', JSON.stringify(invoices)) } catch {}
  }, [invoices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>Finance & Invoicing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Generate invoices · track payments · monitor receivables</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Building2 size={14} /> Company Profile
          </button>
          <FinanceNav active="Invoicing" />
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
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
      {activeTab === 'tracker'  && <InvoiceTracker  invoices={invoices} setInvoices={setInvoices} profile={profile} />}
      {activeTab === 'cashflow' && <CashFlow invoices={invoices} />}

      {showProfile && <CompanyProfileModal profile={profile} onClose={() => setShowProfile(false)} onSave={setProfile} />}
    </div>
  )
}

export default function InvoicingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#94A3B8' }}>Loading...</div>}>
      <InvoicingPageInner />
    </Suspense>
  )
}

