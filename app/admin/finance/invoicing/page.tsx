'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Download, Check, ChevronDown, X, Building2, FileText, Clock, AlertTriangle, CheckCircle, Eye } from 'lucide-react'
import { useCostingRates, PROJECTS } from '../costing-context'

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

const RIGS = [
  { id: 'KEM-04', project: 'RS-01'     },
  { id: 'KEM-05', project: 'RS-01'     },
  { id: 'KEM-14', project: 'CMPDI-DAM' },
  { id: 'KEM-13', project: 'CMPDI-DAM' },
  { id: 'KEM-12', project: 'CMP-MAD'   },
  { id: 'KEM-11', project: 'DGMIL-BHK' },
  { id: 'KEM-10', project: 'MECL-HIN'  },
]

type InvStatus = 'Draft' | 'Raised' | 'MB Pending' | 'Submitted' | 'Partially Paid' | 'Paid' | 'Overdue'

interface Invoice {
  id: string; invNumber: string; entityId: string; entityName: string
  type: 'project' | 'rig'; client: string; month: string
  meters: number; standbyDays: number; includeMob: boolean; includeDemob: boolean
  grossAmount: number; gstAmt: number; tdsAmt: number; retentionAmt: number; netReceivable: number
  status: InvStatus; raisedDate: string; dueDate: string; paidAmount: number; notes: string
}

const STATUS_CONFIG: Record<InvStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Draft':           { color: C.muted,  bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', icon: <FileText size={11} /> },
  'Raised':          { color: C.blue,   bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)',  icon: <FileText size={11} /> },
  'MB Pending':      { color: C.amber,  bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  icon: <Clock size={11} /> },
  'Submitted':       { color: C.purple, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',  icon: <FileText size={11} /> },
  'Partially Paid':  { color: C.orange, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)',  icon: <CheckCircle size={11} /> },
  'Paid':            { color: C.green,  bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',  icon: <CheckCircle size={11} /> },
  'Overdue':         { color: C.red,    bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   icon: <AlertTriangle size={11} /> },
}

const SEED_PROJECT_INVOICES: Invoice[] = [
  { id:'p1', invNumber:'INV-P-042', entityId:'RS-01',     entityName:'RS-01 — Chhindwara',     type:'project', client:'CMPDI', month:'Apr 2026', meters:624, standbyDays:3, includeMob:false, includeDemob:false, grossAmount:619200, gstAmt:111456, tdsAmt:12384, retentionAmt:30960, netReceivable:687312, status:'Overdue',       raisedDate:'02.05.2026', dueDate:'01.06.2026', paidAmount:0,      notes:'45 days overdue' },
  { id:'p2', invNumber:'INV-P-041', entityId:'CMPDI-DAM', entityName:'CMPDI-DAM — Bokaro',     type:'project', client:'CMPDI', month:'Apr 2026', meters:412, standbyDays:2, includeMob:false, includeDemob:false, grossAmount:356000, gstAmt:64080,  tdsAmt:7120,  retentionAmt:17800, netReceivable:395160, status:'Paid',          raisedDate:'01.05.2026', dueDate:'31.05.2026', paidAmount:395160, notes:'' },
  { id:'p3', invNumber:'INV-P-043', entityId:'CMP-MAD',   entityName:'CMP-MAD — Warora',       type:'project', client:'CMPDI', month:'Apr 2026', meters:318, standbyDays:1, includeMob:false, includeDemob:false, grossAmount:263400, gstAmt:47412,  tdsAmt:5268,  retentionAmt:13170, netReceivable:292374, status:'Submitted',     raisedDate:'03.05.2026', dueDate:'02.06.2026', paidAmount:0,      notes:'MB certified' },
  { id:'p4', invNumber:'INV-P-044', entityId:'DGMIL-BHK', entityName:'DGMIL-BHK — Saraipali', type:'project', client:'DGML',  month:'Apr 2026', meters:280, standbyDays:2, includeMob:false, includeDemob:false, grossAmount:238000, gstAmt:42840,  tdsAmt:4760,  retentionAmt:11900, netReceivable:264180, status:'MB Pending',    raisedDate:'04.05.2026', dueDate:'03.06.2026', paidAmount:0,      notes:'Awaiting MB' },
]

const SEED_RIG_INVOICES: Invoice[] = [
  { id:'r1', invNumber:'INV-R-001', entityId:'KEM-04', entityName:'KEM-04',       type:'rig', client:'RS-01',     month:'Apr 2026', meters:198, standbyDays:3, includeMob:false, includeDemob:false, grossAmount:198000, gstAmt:35640, tdsAmt:3960, retentionAmt:9900, netReceivable:219780, status:'Paid',    raisedDate:'01.05.2026', dueDate:'31.05.2026', paidAmount:219780, notes:'' },
  { id:'r2', invNumber:'INV-R-002', entityId:'KEM-05', entityName:'KEM-05',       type:'rig', client:'RS-01',     month:'Apr 2026', meters:162, standbyDays:4, includeMob:false, includeDemob:false, grossAmount:162000, gstAmt:29160, tdsAmt:3240, retentionAmt:8100, netReceivable:179820, status:'Overdue', raisedDate:'01.05.2026', dueDate:'31.05.2026', paidAmount:0,      notes:'Overdue' },
  { id:'r3', invNumber:'INV-R-003', entityId:'KEM-14', entityName:'KEM-14',       type:'rig', client:'CMPDI-DAM', month:'Apr 2026', meters:220, standbyDays:2, includeMob:false, includeDemob:false, grossAmount:220000, gstAmt:39600, tdsAmt:4400, retentionAmt:11000, netReceivable:244200, status:'Raised',  raisedDate:'01.05.2026', dueDate:'31.05.2026', paidAmount:0,      notes:'' },
]

const DEFAULT_PROFILE = {
  name: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
  address: 'Enter your company address here',
  gstin: 'Enter GSTIN', contact: 'Enter contact details', logo: '',
}

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

function CompanyProfileModal({ profile, onClose, onSave }: any) {
  const [form, setForm] = useState({ ...profile })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Company Profile</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Company Name', field: 'name', placeholder: 'Company name' },
            { label: 'Address',      field: 'address', placeholder: 'Full address' },
            { label: 'GSTIN',        field: 'gstin',   placeholder: 'GSTIN' },
            { label: 'Contact',      field: 'contact', placeholder: 'Email / Phone' },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{f.label}</div>
              <input value={(form as any)[f.field]} onChange={e => setForm((p: any) => ({ ...p, [f.field]: e.target.value }))} placeholder={f.placeholder} style={iStyle} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} style={{ flex: 2, padding: '12px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Save Profile</button>
        </div>
      </div>
    </div>
  )
}

// ── GENERATE INVOICE (shared for project and rig) ─────────────────────────
function GenerateInvoice({ type, invoices, setInvoices, profile, defaultId }: { type: 'project' | 'rig'; invoices: Invoice[]; setInvoices: any; profile: typeof DEFAULT_PROFILE; defaultId?: string }) {
  const { getRate } = useCostingRates()
  const isProject = type === 'project'
  const entities  = isProject ? PROJECTS : RIGS

  const [selectedId, setSelectedId] = useState(defaultId || (isProject ? 'RS-01' : 'KEM-04'))
  const [month, setMonth] = useState('May 2026')
  const [meters, setMeters] = useState(isProject ? 624 : 198)
  const [standbyDays, setStandbyDays] = useState(3)
  const [drillingDays, setDrillingDays] = useState(22)
  const [standbyDaysDay, setStandbyDaysDay] = useState(4)
  const [repairDays, setRepairDays] = useState(2)
  const [includeMob, setIncludeMob] = useState(false)
  const [includeDemob, setIncludeDemob] = useState(false)
  const [preview, setPreview] = useState<Invoice | null>(null)
  const [generated, setGenerated] = useState(false)

  // For rig, get the project to find the rates
  const rigProjectId = !isProject ? (RIGS.find(r => r.id === selectedId)?.project || 'RS-01') : selectedId
  const ctxRate = getRate(rigProjectId)

  const entityName = isProject
    ? PROJECTS.find(p => p.id === selectedId)?.fullName || selectedId
    : selectedId
  const entityClient = isProject
    ? PROJECTS.find(p => p.id === selectedId)?.client || ''
    : RIGS.find(r => r.id === selectedId)?.project || ''

  const isMeterage = ctxRate.contractType === 'meterage'
  const isDayRate  = ctxRate.contractType === 'dayrate'

  const calcRevenue = () => {
    if (isMeterage) {
      let rev = 0
      const b1m = Math.min(meters, ctxRate.band1To)
      if (ctxRate.band1Rate > 0) rev += b1m * ctxRate.band1Rate
      if (meters > ctxRate.band1To && ctxRate.band2Rate > 0) rev += Math.min(meters - ctxRate.band1To, ctxRate.band2To - ctxRate.band1To) * ctxRate.band2Rate
      if (meters > ctxRate.band2To && ctxRate.band3Rate > 0) rev += (meters - ctxRate.band2To) * ctxRate.band3Rate
      if (ctxRate.standbyRate > 0) rev += standbyDays * ctxRate.standbyRate
      if (includeMob && ctxRate.mobilisation > 0) rev += ctxRate.mobilisation
      if (includeDemob && ctxRate.demobilisation > 0) rev += ctxRate.demobilisation
      return rev
    } else {
      let rev = (drillingDays * ctxRate.drillingDayRate) + (standbyDaysDay * ctxRate.standbyDayRate) + (repairDays * ctxRate.repairDayRate)
      if (includeMob && ctxRate.mobilisation > 0) rev += ctxRate.mobilisation
      if (includeDemob && ctxRate.demobilisation > 0) rev += ctxRate.demobilisation
      return rev
    }
  }

  const grossAmount = calcRevenue()
  const gstAmt   = ctxRate.gst > 0       ? Math.round(grossAmount * ctxRate.gst / 100)       : 0
  const tdsAmt   = ctxRate.tds > 0       ? Math.round(grossAmount * ctxRate.tds / 100)       : 0
  const retAmt   = ctxRate.retention > 0 ? Math.round(grossAmount * ctxRate.retention / 100) : 0
  const netAmt   = grossAmount + gstAmt - tdsAmt - retAmt

  const b1m = Math.min(meters, ctxRate.band1To)
  const b2m = meters > ctxRate.band1To ? Math.min(meters - ctxRate.band1To, ctxRate.band2To - ctxRate.band1To) : 0
  const b3m = meters > ctxRate.band2To ? meters - ctxRate.band2To : 0

  const handleGenerate = () => {
    const allInvs = [...(JSON.parse(localStorage.getItem('xplorix_project_invoices') || '[]')), ...(JSON.parse(localStorage.getItem('xplorix_rig_invoices') || '[]'))]
    const inv: Invoice = {
      id: Date.now().toString(),
      invNumber: `INV-${type === 'project' ? 'P' : 'R'}-${String(allInvs.length + 50).padStart(3, '0')}`,
      entityId: selectedId, entityName, type, client: entityClient, month,
      meters, standbyDays, includeMob, includeDemob,
      grossAmount, gstAmt, tdsAmt, retentionAmt: retAmt, netReceivable: netAmt,
      status: 'Draft', raisedDate: new Date().toLocaleDateString('en-IN'),
      dueDate: '', paidAmount: 0, notes: '',
    }
    setInvoices((prev: Invoice[]) => [inv, ...prev])
    setPreview(inv)
    setGenerated(true)
  }

  const downloadInvoice = (inv: Invoice) => {
    const html = `<!DOCTYPE html><html><head><title>${inv.invNumber}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:820px;margin:0 auto}
.header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #F97316;margin-bottom:24px}
.title{font-size:28px;font-weight:900;color:#F97316;text-align:right}
table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#111;color:#fff;padding:10px;text-align:left;font-size:11px}
td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}
.net{background:#f0fdf4;font-weight:800;font-size:16px;color:#065f46;border-top:2px solid #10B981}
</style></head><body>
<div class="header">
<div><div style="font-size:16px;font-weight:800">${profile.name}</div>
<div style="font-size:12px;color:#555;margin-top:4px">${profile.address}<br>GSTIN: ${profile.gstin}</div></div>
<div><div class="title">TAX INVOICE</div>
<div style="font-size:12px;color:#555;text-align:right;margin-top:6px"><strong>${inv.invNumber}</strong><br>${inv.entityName}<br>Client: ${inv.client}<br>${inv.month}</div></div>
</div>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
<tr><td>Services — ${inv.entityName} · ${inv.meters}m · ${inv.month}</td><td style="text-align:right;font-weight:700">₹${inv.grossAmount.toLocaleString()}</td></tr>
${inv.gstAmt > 0 ? `<tr><td>+ GST</td><td style="text-align:right;color:#3B82F6">+₹${inv.gstAmt.toLocaleString()}</td></tr>` : ''}
${inv.tdsAmt > 0 ? `<tr><td>− TDS @2% (Sec 194C)</td><td style="text-align:right;color:#dc2626">−₹${inv.tdsAmt.toLocaleString()}</td></tr>` : ''}
${inv.retentionAmt > 0 ? `<tr><td>− Retention</td><td style="text-align:right;color:#d97706">−₹${inv.retentionAmt.toLocaleString()}</td></tr>` : ''}
<tr class="net"><td><strong>NET CASH RECEIVABLE</strong></td><td style="text-align:right"><strong>₹${inv.netReceivable.toLocaleString()}</strong></td></tr>
</table>
<div style="font-size:11px;color:#9CA3AF;text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #eee">Generated by XPLORIX</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${inv.invNumber}.html`; a.click()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Left — form */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Invoice Details</div>

        {/* Entity selector */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{isProject ? 'Project' : 'Rig'}</div>
          <div style={{ position: 'relative' }}>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              style={{ ...iStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}>
              {(entities as any[]).map((e: any) => {
                const rateId = isProject ? e.id : (RIGS.find((r: any) => r.id === e.id)?.project || e.id)
                const r = getRate(rateId)
                return <option key={e.id} value={e.id}>{isProject ? `${e.fullName} — ${e.client}` : `${e.id} (${e.project})`} ({r.contractType === 'meterage' ? 'Meterage' : 'Day Rate'})</option>
              })}
            </select>
            <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Contract type badge */}
        <div style={{ padding: '10px 14px', borderRadius: 10, background: isMeterage ? 'rgba(249,115,22,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${isMeterage ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)'}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isMeterage ? C.orange : C.blue }}>
            {isMeterage ? '📏 Meterage' : '📅 Day Rate'}
          </span>
          <span style={{ fontSize: 11, color: C.faint }}>
            {isMeterage ? `₹${ctxRate.band1Rate}/m · ₹${ctxRate.band2Rate}/m · ₹${ctxRate.band3Rate}/m` : `₹${ctxRate.drillingDayRate.toLocaleString()}/day`}
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
                Total Meters Drilled <span style={{ fontSize: 9, color: C.green, marginLeft: 6 }}>← from drill log</span>
              </div>
              <input type="number" value={meters} onChange={e => setMeters(parseInt(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 22, fontWeight: 900, color: C.orange, textAlign: 'center' }} />
            </div>
            {ctxRate.standbyRate > 0 && (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: C.muted }}>
              Drilling ₹{ctxRate.drillingDayRate.toLocaleString()}/day · Standby ₹{ctxRate.standbyDayRate.toLocaleString()}/day · Repair ₹{ctxRate.repairDayRate.toLocaleString()}/day
            </div>
            {[
              { label: 'Drilling Days', val: drillingDays, set: setDrillingDays, color: C.green, rate: ctxRate.drillingDayRate },
              { label: 'Standby Days',  val: standbyDaysDay, set: setStandbyDaysDay, color: C.amber, rate: ctxRate.standbyDayRate },
              { label: 'Repair Days',   val: repairDays,  set: setRepairDays, color: C.red, rate: ctxRate.repairDayRate },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>
                  {f.label} <span style={{ fontSize: 9, color: f.color, marginLeft: 6 }}>= ₹{(f.rate * f.val).toLocaleString()}</span>
                </div>
                <input type="number" value={f.val} onChange={e => f.set(parseInt(e.target.value) || 0)}
                  style={{ ...iStyle, fontSize: 15, fontWeight: 700, color: f.color }} />
              </div>
            ))}
          </div>
        )}

        {/* Mob/Demob toggles */}
        {ctxRate.mobilisation > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include Mobilisation</div>
              <div style={{ fontSize: 11, color: C.faint }}>₹{ctxRate.mobilisation.toLocaleString()}</div>
            </div>
            <button onClick={() => setIncludeMob(!includeMob)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none', background: includeMob ? C.orange : C.border, position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: includeMob ? 23 : 3, transition: 'all 0.2s' }} />
            </button>
          </div>
        )}
        {ctxRate.demobilisation > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include Demobilisation</div>
              <div style={{ fontSize: 11, color: C.faint }}>₹{ctxRate.demobilisation.toLocaleString()}</div>
            </div>
            <button onClick={() => setIncludeDemob(!includeDemob)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', border: 'none', background: includeDemob ? C.orange : C.border, position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: includeDemob ? 23 : 3, transition: 'all 0.2s' }} />
            </button>
          </div>
        )}

        <button onClick={handleGenerate} style={{ padding: '13px', borderRadius: 12, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
          Generate Invoice →
        </button>
        {generated && preview && (
          <button onClick={() => downloadInvoice(preview)} style={{ padding: '10px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Download size={14} /> Download Invoice
          </button>
        )}
      </div>

      {/* Right — live calculation */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Live Calculation</div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: C.green, border: '1px solid rgba(16,185,129,0.2)' }}>Auto-calculated</span>
        </div>

        {isMeterage && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Depth Band Breakdown</div>
            {ctxRate.band1Rate > 0 && b1m > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}><span style={{ color: C.muted }}>Band 1 (0–{ctxRate.band1To}m): {b1m}m × ₹{ctxRate.band1Rate}</span><span style={{ color: C.green, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b1m * ctxRate.band1Rate).toLocaleString()}</span></div>}
            {ctxRate.band2Rate > 0 && b2m > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}><span style={{ color: C.muted }}>Band 2 ({ctxRate.band1To}–{ctxRate.band2To}m): {b2m}m × ₹{ctxRate.band2Rate}</span><span style={{ color: C.amber, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b2m * ctxRate.band2Rate).toLocaleString()}</span></div>}
            {ctxRate.band3Rate > 0 && b3m > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}><span style={{ color: C.muted }}>Band 3 ({ctxRate.band2To}m+): {b3m}m × ₹{ctxRate.band3Rate}</span><span style={{ color: C.orange, fontWeight: 700, fontFamily: 'monospace' }}>₹{(b3m * ctxRate.band3Rate).toLocaleString()}</span></div>}
            {ctxRate.standbyRate > 0 && standbyDays > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: C.muted }}>Standby {standbyDays}d × ₹{ctxRate.standbyRate.toLocaleString()}</span><span style={{ color: C.purple, fontWeight: 700, fontFamily: 'monospace' }}>₹{(standbyDays * ctxRate.standbyRate).toLocaleString()}</span></div>}
          </div>
        )}

        {isDayRate && (
          <div style={{ padding: '14px', borderRadius: 10, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Day Rate Breakdown</div>
            {[
              { label: `Drilling ${drillingDays}d × ₹${ctxRate.drillingDayRate.toLocaleString()}`, value: drillingDays * ctxRate.drillingDayRate, color: C.green },
              { label: `Standby ${standbyDaysDay}d × ₹${ctxRate.standbyDayRate.toLocaleString()}`,  value: standbyDaysDay * ctxRate.standbyDayRate,  color: C.amber },
              { label: `Repair ${repairDays}d × ₹${ctxRate.repairDayRate.toLocaleString()}`,        value: repairDays * ctxRate.repairDayRate,        color: C.red   },
            ].filter(r => r.value > 0).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: C.muted }}>{row.label}</span>
                <span style={{ color: row.color, fontWeight: 700, fontFamily: 'monospace' }}>₹{row.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {[
          { label: 'Gross Invoice Value', value: grossAmount, color: C.green,  prefix: '',  size: 18, show: true },
          { label: `+ GST @${ctxRate.gst}%`, value: gstAmt,  color: C.blue,   prefix: '+', size: 14, show: ctxRate.gst > 0 },
          { label: `− TDS @${ctxRate.tds}%`, value: tdsAmt,  color: C.red,    prefix: '−', size: 14, show: ctxRate.tds > 0 },
          { label: `− Retention @${ctxRate.retention}%`, value: retAmt, color: C.amber, prefix: '−', size: 14, show: ctxRate.retention > 0 },
        ].filter(r => r.show).map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 12, color: C.muted }}>{row.label}</span>
            <span style={{ fontSize: row.size, fontWeight: 800, color: row.color, fontFamily: 'monospace' }}>{row.prefix}₹{row.value.toLocaleString()}</span>
          </div>
        ))}

        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>NET CASH RECEIVABLE</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Arrives in your bank</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{netAmt.toLocaleString()}</div>
        </div>

        {(tdsAmt + retAmt) > 0 && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: C.muted }}>
            🔒 <strong style={{ color: C.amber }}>₹{(tdsAmt + retAmt).toLocaleString()} locked</strong> — TDS + Retention
          </div>
        )}
      </div>
    </div>
  )
}

// ── INVOICE TRACKER ───────────────────────────────────────────────────────
function InvoiceTrackerSection({ invoices, setInvoices, type, profile }: { invoices: Invoice[]; setInvoices: any; type: 'project' | 'rig'; profile: typeof DEFAULT_PROFILE }) {
  const [filterStatus, setFilterStatus] = useState<InvStatus | 'All'>('All')
  const [previewInv, setPreviewInv] = useState<Invoice | null>(null)

  const filtered = invoices.filter(inv => filterStatus === 'All' || inv.status === filterStatus)
  const totalRetention = invoices.reduce((s, i) => s + i.retentionAmt, 0)
  const totalTDS       = invoices.reduce((s, i) => s + i.tdsAmt, 0)

  const updateStatus = (id: string, status: InvStatus) =>
    setInvoices((prev: Invoice[]) => prev.map(i => i.id === id ? { ...i, status } : i))

  const downloadInv = (inv: Invoice) => {
    const html = `<!DOCTYPE html><html><head><title>${inv.invNumber}</title><style>body{font-family:Arial;padding:40px;max-width:820px;margin:0 auto}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;padding:10px}td{padding:9px;border-bottom:1px solid #eee}</style></head><body><h2 style="color:#F97316">${inv.invNumber}</h2><p>${inv.entityName} · ${inv.client} · ${inv.month}</p><table><tr><th>Description</th><th>Amount</th></tr><tr><td>Services</td><td>₹${inv.grossAmount.toLocaleString()}</td></tr>${inv.gstAmt > 0 ? `<tr><td>+ GST</td><td>+₹${inv.gstAmt.toLocaleString()}</td></tr>` : ''}${inv.tdsAmt > 0 ? `<tr><td>− TDS</td><td>−₹${inv.tdsAmt.toLocaleString()}</td></tr>` : ''}${inv.retentionAmt > 0 ? `<tr><td>− Retention</td><td>−₹${inv.retentionAmt.toLocaleString()}</td></tr>` : ''}<tr style="background:#f0fdf4;font-weight:800"><td>NET RECEIVABLE</td><td>₹${inv.netReceivable.toLocaleString()}</td></tr></table></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${inv.invNumber}.html`; a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Locked cash */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ padding: '18px 22px', borderRadius: 14, background: C.card, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🔒 Retention Locked</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.red, fontFamily: 'monospace', marginBottom: 4 }}>₹{(totalRetention/100000).toFixed(1)}L</div>
          <div style={{ fontSize: 12, color: C.faint }}>Held until project completion</div>
        </div>
        <div style={{ padding: '18px 22px', borderRadius: 14, background: C.card, border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🔒 TDS Deducted</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.purple, fontFamily: 'monospace', marginBottom: 4 }}>₹{(totalTDS/100000).toFixed(1)}L</div>
          <div style={{ fontSize: 12, color: C.faint }}>Recoverable via tax filing</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        {(['All', 'Draft', 'Raised', 'MB Pending', 'Submitted', 'Partially Paid', 'Paid', 'Overdue'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: filterStatus === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${filterStatus === s ? 'rgba(249,115,22,0.35)' : C.border}`,
            color: filterStatus === s ? C.orange : C.faint,
          }}>{s}</button>
        ))}
      </div>

      {/* Invoice list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, color: C.faint }}>No invoices found.</div>
        )}
        {filtered.map(inv => {
          const sc = STATUS_CONFIG[inv.status]
          return (
            <div key={inv.id} style={{ background: C.card, border: `1px solid ${inv.status === 'Overdue' ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: 14, padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.orange, fontFamily: 'monospace' }}>{inv.invNumber}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    {sc.icon} {inv.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{inv.entityName} · {inv.client} · {inv.month}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>₹{inv.netReceivable.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.faint }}>Net receivable</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.muted }}>Raised: {inv.raisedDate}</div>
                {(inv.tdsAmt + inv.retentionAmt) > 0 && <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>🔒 ₹{(inv.tdsAmt + inv.retentionAmt).toLocaleString()} locked</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value as InvStatus)}
                    style={{ appearance: 'none', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 11, fontWeight: 700, padding: '5px 22px 5px 9px', borderRadius: 20, cursor: 'pointer', outline: 'none', width: '100%' }}>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: sc.color, pointerEvents: 'none' }} />
                </div>
                <button onClick={() => downloadInv(inv)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                  <Download size={11} /> Download
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
const MAIN_TABS = [
  { id: 'project-invoice',  label: 'Project Invoice',         icon: '📄' },
  { id: 'project-tracker',  label: 'Project Invoice Tracker', icon: '📊' },
  { id: 'rig-invoice',      label: 'Rig Invoice',             icon: '🚛' },
  { id: 'rig-tracker',      label: 'Rig Invoice Tracker',     icon: '📋' },
]

function InvoicingPageInner() {
  const searchParams = useSearchParams()
  const urlId = searchParams.get('id')
  const urlType = searchParams.get('type')

  const [activeTab, setActiveTab] = useState(() => {
    if (urlType === 'rig') return 'rig-invoice'
    return 'project-invoice'
  })

  const [projectInvoices, setProjectInvoices] = useState<Invoice[]>(() => {
    if (typeof window === 'undefined') return SEED_PROJECT_INVOICES
    try { const s = localStorage.getItem('xplorix_project_invoices'); return s ? JSON.parse(s) : SEED_PROJECT_INVOICES } catch { return SEED_PROJECT_INVOICES }
  })

  const [rigInvoices, setRigInvoices] = useState<Invoice[]>(() => {
    if (typeof window === 'undefined') return SEED_RIG_INVOICES
    try { const s = localStorage.getItem('xplorix_rig_invoices'); return s ? JSON.parse(s) : SEED_RIG_INVOICES } catch { return SEED_RIG_INVOICES }
  })

  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xplorix_project_invoices', JSON.stringify(projectInvoices))
    }
  }, [projectInvoices])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('xplorix_rig_invoices', JSON.stringify(rigInvoices))
    }
  }, [rigInvoices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Finance & Invoicing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Project invoices · Rig invoices · Track payments</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Building2 size={14} /> Company Profile
          </button>
          <FinanceNav active="Invoicing" />
        </div>
      </div>

      {/* Tab nav — 2 groups */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MAIN_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: activeTab === t.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)',
            color: activeTab === t.id ? '#fff' : C.muted,
            boxShadow: activeTab === t.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'project-invoice' && <GenerateInvoice type="project" invoices={projectInvoices} setInvoices={setProjectInvoices} profile={profile} defaultId={urlId || undefined} />}
      {activeTab === 'project-tracker' && <InvoiceTrackerSection type="project" invoices={projectInvoices} setInvoices={setProjectInvoices} profile={profile} />}
      {activeTab === 'rig-invoice'     && <GenerateInvoice type="rig"     invoices={rigInvoices}     setInvoices={setRigInvoices}     profile={profile} defaultId={urlId || undefined} />}
      {activeTab === 'rig-tracker'     && <InvoiceTrackerSection type="rig"     invoices={rigInvoices}     setInvoices={setRigInvoices}     profile={profile} />}

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

