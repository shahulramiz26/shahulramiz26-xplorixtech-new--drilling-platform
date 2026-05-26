'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Save, Check, Edit2, Plus, Trash2, Info,
  ChevronDown, Fuel, Wrench, Users, FileText, X
} from 'lucide-react'

import { useCostingRates, PROJECTS as CTX_PROJECTS } from '../costing-context'

// ── COLOUR TOKENS (matches Inventory orange scheme) ───────────────────────
const C = {
  bg:        '#080B10',
  card:      '#0D1117',
  border:    '#1E293B',
  orange:    '#F97316',
  orangeD:   '#EA580C',
  green:     '#10B981',
  red:       '#EF4444',
  amber:     '#F59E0B',
  blue:      '#3B82F6',
  purple:    '#8B5CF6',
  text:      '#F8FAFC',
  muted:     '#94A3B8',
  faint:     '#64748B',
}

// ── REAL CUSTOMER DATA ────────────────────────────────────────────────────
const PROJECTS = [
  { id: 'RS-01',      name: 'RS-01',      fullName: 'RS-01 — Chhindwara',       client: 'CMPDI', type: 'meterage' },
  { id: 'CMPDI-DAM',  name: 'CMPDI-DAM',  fullName: 'CMPDI-DAM — Bokaro',       client: 'CMPDI', type: 'meterage' },
  { id: 'CMP-MAD',    name: 'CMP-MAD',    fullName: 'CMP-MAD — Warora',         client: 'CMPDI', type: 'meterage' },
  { id: 'DGMIL-BHK',  name: 'DGMIL-BHK',  fullName: 'DGMIL-BHK — Saraipali',   client: 'DGML',  type: 'meterage' },
  { id: 'PAT-CMPDI',  name: 'PAT-CMPDI',  fullName: 'PAT-CMPDI — Pathakuri',    client: 'CMPDI', type: 'meterage' },
  { id: 'MECL-HIN',   name: 'MECL-HIN',   fullName: 'MECL-HIN — Bazar Gaon',   client: 'MECL',  type: 'dayrate'  },
]

const RIGS = [
  { id: 'KEM-04', project: 'RS-01'     },
  { id: 'KEM-05', project: 'RS-01'     },
  { id: 'KEM-14', project: 'CMPDI-DAM' },
  { id: 'KEM-13', project: 'CMPDI-DAM' },
  { id: 'KEM-12', project: 'CMP-MAD'   },
  { id: 'KEM-11', project: 'DGMIL-BHK' },
  { id: 'KEM-10', project: 'MECL-HIN'  },
]

// ── SEED STATE ────────────────────────────────────────────────────────────
const seedContractRates: Record<string, any> = {
  'RS-01': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 850,
    band2From: 200, band2To: 400, band2Rate: 950,
    band3From: 400, band3Rate: 1050,
    standbyRate: 8000,
    mobilisation: 250000, demobilisation: 150000,
    gst: 18, tds: 2, retention: 5,
  },
  'CMPDI-DAM': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 820,
    band2From: 200, band2To: 400, band2Rate: 920,
    band3From: 400, band3Rate: 1020,
    standbyRate: 7500,
    mobilisation: 220000, demobilisation: 130000,
    gst: 18, tds: 2, retention: 5,
  },
  'CMP-MAD': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 800,
    band2From: 200, band2To: 400, band2Rate: 900,
    band3From: 400, band3Rate: 1000,
    standbyRate: 7000,
    mobilisation: 200000, demobilisation: 120000,
    gst: 18, tds: 2, retention: 5,
  },
  'DGMIL-BHK': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 800,
    band2From: 200, band2To: 400, band2Rate: 900,
    band3From: 400, band3Rate: 1000,
    standbyRate: 7000,
    mobilisation: 200000, demobilisation: 120000,
    gst: 18, tds: 2, retention: 5,
  },
  'PAT-CMPDI': {
    contractType: 'meterage',
    band1To: 200, band1Rate: 830,
    band2From: 200, band2To: 400, band2Rate: 930,
    band3From: 400, band3Rate: 1030,
    standbyRate: 7800,
    mobilisation: 210000, demobilisation: 125000,
    gst: 18, tds: 2, retention: 5,
  },
  'MECL-HIN': {
    contractType: 'dayrate',
    drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    mobilisation: 180000, demobilisation: 100000,
    gst: 18, tds: 2, retention: 5,
    band1To: 200, band1Rate: 0,
    band2From: 200, band2To: 400, band2Rate: 0,
    band3From: 400, band3Rate: 0, standbyRate: 0,
  },
}

const seedRigRates: Record<string, any> = {
  'KEM-04': { drillingRate: 9000,  standbyRate: 4500, repairRate: 3000 },
  'KEM-05': { drillingRate: 9500,  standbyRate: 4800, repairRate: 3200 },
  'KEM-14': { drillingRate: 9000,  standbyRate: 4500, repairRate: 3000 },
  'KEM-13': { drillingRate: 9000,  standbyRate: 4500, repairRate: 3000 },
  'KEM-12': { drillingRate: 9000,  standbyRate: 4500, repairRate: 3000 },
  'KEM-11': { drillingRate: 9000,  standbyRate: 4500, repairRate: 3000 },
  'KEM-10': { drillingRate: 9500,  standbyRate: 4800, repairRate: 3200 },
}

const seedLabour: Record<string, any> = {
  'RS-01':     { may2026: 84000,  apr2026: 82000, mar2026: 80000 },
  'CMPDI-DAM': { may2026: 72000,  apr2026: 70000, mar2026: 68000 },
  'CMP-MAD':   { may2026: 54000,  apr2026: 52000, mar2026: 50000 },
  'DGMIL-BHK': { may2026: 54000,  apr2026: 52000, mar2026: 50000 },
  'PAT-CMPDI': { may2026: 48000,  apr2026: 46000, mar2026: 44000 },
  'MECL-HIN':  { may2026: 60000,  apr2026: 58000, mar2026: 56000 },
}

const seedMaintenance: Record<string, any> = {
  'KEM-04': { mechanicRate: 1200, helperRate: 600 },
  'KEM-05': { mechanicRate: 1200, helperRate: 600 },
  'KEM-14': { mechanicRate: 1100, helperRate: 550 },
  'KEM-13': { mechanicRate: 1100, helperRate: 550 },
  'KEM-12': { mechanicRate: 1100, helperRate: 550 },
  'KEM-11': { mechanicRate: 1100, helperRate: 550 },
  'KEM-10': { mechanicRate: 1200, helperRate: 600 },
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────
const iStyle: React.CSSProperties = {
  padding: '9px 12px',
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: C.faint,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

// ── NAV ───────────────────────────────────────────────────────────────────
function FinanceNav({ active }: { active: string }) {
  const tabs = [
    { href: '/admin/finance', label: 'Dashboard' },
    { href: '/admin/finance/costing', label: 'Costing' },
    { href: '/admin/finance/invoicing', label: 'Invoicing' },
    { href: '/admin/finance/reports', label: 'Reports' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
      {tabs.map(t => (
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

// ── COSTING SUB-NAV ───────────────────────────────────────────────────────
const COSTING_TABS = [
  { id: 'contract',     label: 'Contract Rates',   icon: '📋' },
  { id: 'rig',          label: 'Rig Rates',         icon: '🚛' },
  { id: 'labour',       label: 'Labour Costs',      icon: '👷' },
  { id: 'fuel',         label: 'Fuel Rate',         icon: '⛽' },
  { id: 'maintenance',  label: 'Maintenance Rates', icon: '🔧' },
]

function CostingNav({ active, setActive }: { active: string; setActive: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {COSTING_TABS.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s', border: 'none',
          background: active === t.id
            ? `linear-gradient(135deg,${C.orange},${C.orangeD})`
            : `rgba(255,255,255,0.04)`,
          color: active === t.id ? '#fff' : C.muted,
          boxShadow: active === t.id ? `0 4px 16px rgba(249,115,22,0.3)` : 'none',
        }}>
          <span style={{ fontSize: 15 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── SAVE TOAST ─────────────────────────────────────────────────────────────
function useSaveToast() {
  const [saved, setSaved] = useState(false)
  const trigger = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return { saved, trigger }
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — CONTRACT RATES
// ══════════════════════════════════════════════════════════════════════════
function ContractRates() {
  const { rates: ctxRates, updateRate } = useCostingRates()
  const [rates, setRates] = useState(seedContractRates)
  const [selected, setSelected] = useState('RS-01')
  const [editing, setEditing] = useState(false)
  const { saved, trigger } = useSaveToast()
  const r = rates[selected]

  const update = (field: string, val: any) =>
    setRates(prev => ({ ...prev, [selected]: { ...prev[selected], [field]: val } }))

  const handleSave = () => {
    // Save to shared context so Invoicing picks up the changes
    updateRate(selected, rates[selected])
    setEditing(false)
    trigger()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Info banner */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.15)` }}>
        <Info size={14} style={{ color: C.orange, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          Set the contract rates for each project once. The billing engine uses these rates to
          auto-calculate invoices — meterage × depth band rate, standby charges, GST, TDS and retention.
        </p>
      </div>

      {/* Project selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PROJECTS.map(p => (
          <button key={p.id} onClick={() => { setSelected(p.id); setEditing(false) }} style={{
            padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            background: selected === p.id ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${selected === p.id ? 'rgba(249,115,22,0.4)' : C.border}`,
            color: selected === p.id ? C.orange : C.faint,
          }}>
            {p.name}
            <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{p.client}</span>
          </button>
        ))}
      </div>

      {/* Contract card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.03)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>
              {PROJECTS.find(p => p.id === selected)?.fullName}
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>
              Client: {PROJECTS.find(p => p.id === selected)?.client} ·{' '}
              <span style={{ color: C.orange, fontWeight: 700 }}>
                {r.contractType === 'meterage' ? '📏 Meterage Contract' : '📅 Day Rate Contract'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {saved && (
              <span style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Check size={13} /> Saved!
              </span>
            )}
            {editing ? (
              <>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
                  <Check size={14} /> Save
                </button>
                <button onClick={() => setEditing(false)} style={{ padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: `1px solid rgba(249,115,22,0.25)`, color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Edit2 size={13} /> Edit Rates
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

          {/* Contract type toggle */}
          <div style={{ gridColumn: '1/-1' }}>
            <div style={labelStyle}>Contract Type</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['meterage', 'dayrate'].map(type => (
                <button key={type} onClick={() => {
                  if (!editing) return
                  update('contractType', type)
                  if (type === 'dayrate') {
                    if (!r.drillingDayRate) update('drillingDayRate', 28000)
                    if (!r.standbyDayRate)  update('standbyDayRate',  12000)
                    if (!r.repairDayRate)   update('repairDayRate',    8000)
                  }
                }} style={{
                  padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: editing ? 'pointer' : 'default', transition: 'all 0.2s',
                  background: r.contractType === type
                    ? type === 'meterage' ? 'rgba(249,115,22,0.15)' : 'rgba(59,130,246,0.15)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${r.contractType === type
                    ? type === 'meterage' ? 'rgba(249,115,22,0.4)' : 'rgba(59,130,246,0.4)'
                    : C.border}`,
                  color: r.contractType === type
                    ? type === 'meterage' ? C.orange : C.blue
                    : C.faint,
                }}>
                  {type === 'meterage' ? '📏 Meterage (₹/meter)' : '📅 Day Rate (₹/day)'}
                </button>
              ))}
            </div>
          </div>

          {/* Meterage bands */}
          {r.contractType === 'meterage' && (
            <div style={{ gridColumn: '1/-1' }}>
              <div style={labelStyle}>Depth Band Rates (₹ per meter drilled)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: `Band 1 — 0 to ${r.band1To}m`, field: 'band1Rate', depthField: 'band1To', color: C.green },
                  { label: `Band 2 — ${r.band2From}m to ${r.band2To}m`, field: 'band2Rate', depthField: 'band2To', color: C.amber },
                  { label: `Band 3 — ${r.band3From}m and beyond`, field: 'band3Rate', depthField: null, color: C.orange },
                ].map((band, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: 12, background: `${band.color}08`, border: `1px solid ${band.color}25` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: band.color, marginBottom: 10 }}>{band.label}</div>
                    <div style={labelStyle}>Rate (₹/m)</div>
                    {editing ? (
                      <input type="number" value={(r as any)[band.field]} onChange={e => update(band.field, parseFloat(e.target.value) || 0)}
                        style={{ ...iStyle, fontSize: 18, fontWeight: 800, color: band.color, textAlign: 'center' }} />
                    ) : (
                      <div style={{ fontSize: 22, fontWeight: 800, color: band.color, fontFamily: 'monospace' }}>
                        ₹{Number((r as any)[band.field]).toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: C.faint }}>/m</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day rate fields */}
          {r.contractType === 'dayrate' && (
            <>
              {[
                { label: 'Drilling Day Rate', field: 'drillingDayRate', color: C.green },
                { label: 'Standby Day Rate',  field: 'standbyDayRate',  color: C.amber },
                { label: 'Repair Day Rate',   field: 'repairDayRate',   color: C.red   },
              ].map((dr, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 12, background: `${dr.color}08`, border: `1px solid ${dr.color}25` }}>
                  <div style={labelStyle}>{dr.label}</div>
                  {editing ? (
                    <input type="number" value={(r as any)[dr.field]} onChange={e => update(dr.field, parseFloat(e.target.value) || 0)}
                      style={{ ...iStyle, fontSize: 16, fontWeight: 800, color: dr.color }} />
                  ) : (
                    <div style={{ fontSize: 20, fontWeight: 800, color: dr.color, fontFamily: 'monospace' }}>
                      ₹{Number((r as any)[dr.field]).toLocaleString()}<span style={{ fontSize: 11, color: C.faint }}>/day</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Standby rate (meterage only) */}
          {r.contractType === 'meterage' && (
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={labelStyle}>Standby Rate (₹/day)</div>
              {editing ? (
                <input type="number" value={r.standbyRate} onChange={e => update('standbyRate', parseFloat(e.target.value) || 0)}
                  style={{ ...iStyle, fontSize: 16, fontWeight: 800, color: C.purple }} />
              ) : (
                <div style={{ fontSize: 20, fontWeight: 800, color: C.purple, fontFamily: 'monospace' }}>
                  ₹{Number(r.standbyRate).toLocaleString()}<span style={{ fontSize: 11, color: C.faint }}>/day</span>
                </div>
              )}
            </div>
          )}

          {/* Mobilisation */}
          <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={labelStyle}>Mobilisation (₹ one-time)</div>
            {editing ? (
              <input type="number" value={r.mobilisation} onChange={e => update('mobilisation', parseFloat(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 14, fontWeight: 700, color: C.green }} />
            ) : (
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>
                ₹{Number(r.mobilisation).toLocaleString()}
              </div>
            )}
          </div>

          {/* Demobilisation */}
          <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={labelStyle}>Demobilisation (₹ one-time)</div>
            {editing ? (
              <input type="number" value={r.demobilisation} onChange={e => update('demobilisation', parseFloat(e.target.value) || 0)}
                style={{ ...iStyle, fontSize: 14, fontWeight: 700, color: C.green }} />
            ) : (
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>
                ₹{Number(r.demobilisation).toLocaleString()}
              </div>
            )}
          </div>

          {/* GST / TDS / Retention */}
          <div style={{ gridColumn: '1/-1', borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <div style={labelStyle}>Statutory Deductions & Charges</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'GST %', field: 'gst', color: C.blue, note: 'Added to invoice total' },
                { label: 'TDS % (Sec 194C)', field: 'tds', color: C.red, note: 'Deducted by client' },
                { label: 'Retention %', field: 'retention', color: C.amber, note: 'Held till project end' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                  <div style={labelStyle}>{stat.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    {editing ? (
                      <input type="number" step="0.5" value={(r as any)[stat.field]} onChange={e => update(stat.field, parseFloat(e.target.value) || 0)}
                        style={{ ...iStyle, width: 80, fontSize: 20, fontWeight: 800, color: stat.color, textAlign: 'center' }} />
                    ) : (
                      <span style={{ fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{(r as any)[stat.field]}%</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 4 }}>{stat.note}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — RIG RATES
// ══════════════════════════════════════════════════════════════════════════
function RigRates() {
  const [rates, setRates] = useState(seedRigRates)
  const [editingRig, setEditingRig] = useState<string | null>(null)
  const { saved, trigger } = useSaveToast()

  const update = (rig: string, field: string, val: number) =>
    setRates(prev => ({ ...prev, [rig]: { ...prev[rig], [field]: val } }))

  const handleSave = (rig: string) => { setEditingRig(null); trigger() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.15)` }}>
        <Info size={14} style={{ color: C.orange, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          Set daily operating rates for each rig. The CPM engine uses drilling rate × drilling days,
          standby rate × standby days, and repair rate × repair days to calculate rig operating cost automatically.
        </p>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', alignSelf: 'flex-start' }}>
          <Check size={14} style={{ color: C.green }} />
          <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Rig rates saved successfully</span>
        </div>
      )}

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Rig', 'Project', 'Drilling Rate / Day', 'Standby Rate / Day', 'Repair Rate / Day', 'Daily Cost Range', ''].map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIGS.map((rig, i) => {
              const r = rates[rig.id]
              const isEditing = editingRig === rig.id
              const project = PROJECTS.find(p => p.id === rig.project)

              return (
                <tr key={rig.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{rig.id}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', color: C.orange, border: '1px solid rgba(249,115,22,0.2)' }}>
                      {project?.name}
                    </span>
                  </td>
                  {[
                    { field: 'drillingRate', color: C.green, label: '/day drilling' },
                    { field: 'standbyRate',  color: C.amber, label: '/day standby'  },
                    { field: 'repairRate',   color: C.red,   label: '/day repair'   },
                  ].map(col => (
                    <td key={col.field} style={{ padding: '14px 18px' }}>
                      {isEditing ? (
                        <input type="number" value={(r as any)[col.field]}
                          onChange={e => update(rig.id, col.field, parseFloat(e.target.value) || 0)}
                          style={{ ...iStyle, width: 110, fontSize: 14, fontWeight: 700, color: col.color }} />
                      ) : (
                        <div>
                          <span style={{ fontSize: 15, fontWeight: 800, color: col.color, fontFamily: 'monospace' }}>
                            ₹{Number((r as any)[col.field]).toLocaleString()}
                          </span>
                          <span style={{ fontSize: 10, color: C.faint, marginLeft: 4 }}>{col.label}</span>
                        </div>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      ₹{r.repairRate.toLocaleString()} – ₹{r.drillingRate.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>repair to drilling</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleSave(rig.id)} style={{ padding: '6px 14px', borderRadius: 8, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingRig(null)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingRig(rig.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Total Rigs', value: RIGS.length, color: C.orange },
          { label: 'Avg Drilling Rate', value: `₹${Math.round(Object.values(seedRigRates).reduce((s: number, r: any) => s + r.drillingRate, 0) / RIGS.length).toLocaleString()}/day`, color: C.green },
          { label: 'Avg Standby Rate', value: `₹${Math.round(Object.values(seedRigRates).reduce((s: number, r: any) => s + r.standbyRate, 0) / RIGS.length).toLocaleString()}/day`, color: C.amber },
        ].map((s, i) => (
          <div key={i} style={{ padding: '16px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — LABOUR COSTS
// ══════════════════════════════════════════════════════════════════════════
function LabourCosts() {
  const [labour, setLabour] = useState(seedLabour)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newMonth, setNewMonth] = useState({ project: 'RS-01', month: 'jun2026', amount: '' })
  const { saved, trigger } = useSaveToast()

  const months = ['may2026', 'apr2026', 'mar2026']
  const monthLabels: Record<string, string> = { may2026: 'May 2026', apr2026: 'Apr 2026', mar2026: 'Mar 2026' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.15)` }}>
        <Info size={14} style={{ color: C.orange, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          Enter total crew cost per project per month — drillers, helpers and supervisors combined.
          This is the only cost that cannot be pulled automatically. Enter once a month.
        </p>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', alignSelf: 'flex-start' }}>
          <Check size={14} style={{ color: C.green }} />
          <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Labour costs saved</span>
        </div>
      )}

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Monthly Labour Cost by Project</div>
          <div style={{ fontSize: 11, color: C.faint }}>Enter total crew wages including all staff</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Project</th>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Client</th>
              {months.map(m => (
                <th key={m} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{monthLabels[m]}</th>
              ))}
              <th style={{ padding: '12px 18px' }}></th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((proj, i) => {
              const l = labour[proj.id] || {}
              const isEditing = editingProject === proj.id
              return (
                <tr key={proj.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{proj.name}</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{proj.fullName.split('—')[1]?.trim()}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', color: C.green, border: '1px solid rgba(16,185,129,0.2)' }}>
                      {proj.client}
                    </span>
                  </td>
                  {months.map(m => (
                    <td key={m} style={{ padding: '14px 18px' }}>
                      {isEditing ? (
                        <input type="number" value={(l as any)[m] || ''}
                          onChange={e => setLabour(prev => ({ ...prev, [proj.id]: { ...prev[proj.id], [m]: parseFloat(e.target.value) || 0 } }))}
                          placeholder="0"
                          style={{ ...iStyle, width: 130, fontSize: 13, fontWeight: 700, color: C.green }} />
                      ) : (
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: 'monospace' }}>
                          {(l as any)[m] ? `₹${Number((l as any)[m]).toLocaleString()}` : <span style={{ color: C.faint }}>—</span>}
                        </div>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '14px 18px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditingProject(null); trigger() }} style={{ padding: '6px 14px', borderRadius: 8, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingProject(null)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingProject(proj.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              <td colSpan={2} style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: C.faint }}>Total (All Projects)</td>
              {months.map(m => {
                const total = Object.values(labour).reduce((s: number, l: any) => s + (l[m] || 0), 0)
                return (
                  <td key={m} style={{ padding: '12px 18px', fontSize: 14, fontWeight: 800, color: C.orange, fontFamily: 'monospace' }}>
                    ₹{total.toLocaleString()}
                  </td>
                )
              })}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 4 — FUEL RATE
// ══════════════════════════════════════════════════════════════════════════
function FuelRate() {
  const [dieselPrice, setDieselPrice] = useState(97)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(97)
  const { saved, trigger } = useSaveToast()

  // From inventory — simulated fuel issues per project
  const fuelData = [
    { project: 'RS-01',     litres: 392, rigs: ['KEM-04', 'KEM-05'] },
    { project: 'CMPDI-DAM', litres: 338, rigs: ['KEM-13', 'KEM-14'] },
    { project: 'CMP-MAD',   litres: 195, rigs: ['KEM-12']           },
    { project: 'DGMIL-BHK', litres: 180, rigs: ['KEM-11']           },
    { project: 'PAT-CMPDI', litres: 165, rigs: ['KEM-10']           },
    { project: 'MECL-HIN',  litres: 155, rigs: ['KEM-10']           },
  ]

  const handleSave = () => { setDieselPrice(draft); setEditing(false); trigger() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.15)` }}>
        <Info size={14} style={{ color: C.orange, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          One global diesel price per litre. Update it whenever fuel prices change.
          Fuel consumption data is pulled from Inventory fuel issues. Cost = litres issued × price per litre.
        </p>
      </div>

      {/* Global price card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Diesel Price</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 3 }}>Current market rate · Update when price changes</div>
          </div>
          {saved && (
            <span style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Check size={13} /> Price updated
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: '24px 36px', borderRadius: 16, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', textAlign: 'center', minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Current Price</div>
            {editing ? (
              <input type="number" value={draft} onChange={e => setDraft(parseFloat(e.target.value) || 0)}
                style={{ ...iStyle, width: 120, fontSize: 32, fontWeight: 900, color: C.orange, textAlign: 'center', background: 'transparent', border: `2px solid ${C.orange}`, borderRadius: 10 }} />
            ) : (
              <div style={{ fontSize: 40, fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>₹{dieselPrice}</div>
            )}
            <div style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>per litre</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: C.muted }}>
              At ₹{dieselPrice}/litre a typical rig consumes approximately:
            </div>
            {[
              { label: '80 litres/day (soft formation)', cost: 80 * dieselPrice },
              { label: '120 litres/day (medium rock)', cost: 120 * dieselPrice },
              { label: '150 litres/day (hard rock)', cost: 150 * dieselPrice },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.amber, fontFamily: 'monospace' }}>₹{row.cost.toLocaleString()}/day</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {editing ? (
              <>
                <button onClick={handleSave} style={{ padding: '10px 24px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
                  Update Price
                </button>
                <button onClick={() => { setEditing(false); setDraft(dieselPrice) }} style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ padding: '10px 24px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: C.orange, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Edit2 size={13} style={{ display: 'inline', marginRight: 6 }} />
                Edit Price
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fuel consumption from inventory */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>⛽</span>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Fuel Consumption — May 2026</div>
          <span style={{ fontSize: 11, color: C.faint, marginLeft: 4 }}>Pulled from Inventory fuel issues</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Project', 'Rigs', 'Litres Issued', 'Price/Litre', 'Total Fuel Cost', 'vs Last Month'].map(h => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fuelData.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)` }}>
                <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: C.text }}>{row.project}</td>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {row.rigs.map(r => (
                      <span key={r} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(249,115,22,0.1)', color: C.orange, border: '1px solid rgba(249,115,22,0.2)', fontWeight: 700 }}>{r}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 18px', fontSize: 14, fontWeight: 700, color: C.text }}>{row.litres}L</td>
                <td style={{ padding: '12px 18px', fontSize: 13, color: C.muted }}>₹{dieselPrice}/L</td>
                <td style={{ padding: '12px 18px', fontSize: 15, fontWeight: 800, color: C.amber, fontFamily: 'monospace' }}>
                  ₹{(row.litres * dieselPrice).toLocaleString()}
                </td>
                <td style={{ padding: '12px 18px', fontSize: 12, color: C.green }}>↓ 3.2%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              <td colSpan={2} style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: C.faint }}>Total All Projects</td>
              <td style={{ padding: '12px 18px', fontSize: 14, fontWeight: 800, color: C.text }}>
                {fuelData.reduce((s, r) => s + r.litres, 0)}L
              </td>
              <td style={{ padding: '12px 18px' }} />
              <td style={{ padding: '12px 18px', fontSize: 16, fontWeight: 900, color: C.orange, fontFamily: 'monospace' }}>
                ₹{fuelData.reduce((s, r) => s + r.litres * dieselPrice, 0).toLocaleString()}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 5 — MAINTENANCE RATES
// ══════════════════════════════════════════════════════════════════════════
function MaintenanceRates() {
  const [rates, setRates] = useState(seedMaintenance)
  const [editingRig, setEditingRig] = useState<string | null>(null)
  const { saved, trigger } = useSaveToast()

  // Recent maintenance jobs from Maintenance module (simulated)
  const recentJobs = [
    { rig: 'KEM-05', project: 'RS-01',     job: 'Water swivel seal replacement', days: 1.5, partsFromInventory: 8830,  status: 'Completed' },
    { rig: 'KEM-09', project: 'RS-01',     job: 'Top cover oil seal replacement', days: 1.0, partsFromInventory: 31785, status: 'Completed' },
    { rig: 'KEM-13', project: 'CMPDI-DAM', job: 'Bearing 61830 replacement',      days: 2.0, partsFromInventory: 41074, status: 'In Progress' },
    { rig: 'KEM-12', project: 'CMP-MAD',   job: 'Hydraulic hose replacement',     days: 0.5, partsFromInventory: 14385, status: 'Completed' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.15)` }}>
        <Info size={14} style={{ color: C.orange, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
          Set mechanic and helper daily rates per rig. Parts costs flow automatically from Inventory.
          Total maintenance cost = (mechanic days × rate) + (helper days × rate) + parts from inventory.
        </p>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', alignSelf: 'flex-start' }}>
          <Check size={14} style={{ color: C.green }} />
          <span style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Maintenance rates saved</span>
        </div>
      )}

      {/* Rates table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Mechanic & Helper Labour Rates</div>
          <div style={{ fontSize: 11, color: C.faint }}>Parts costs are pulled from Inventory automatically</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Rig', 'Project', 'Mechanic Rate / Day', 'Helper Rate / Day', 'Combined / Day', 'Parts Cost Source', ''].map(h => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIGS.map((rig, i) => {
              const r = rates[rig.id]
              const isEditing = editingRig === rig.id
              const project = PROJECTS.find(p => p.id === rig.project)
              return (
                <tr key={rig.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '14px 18px', fontSize: 15, fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{rig.id}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(249,115,22,0.1)', color: C.orange, border: '1px solid rgba(249,115,22,0.2)' }}>
                      {project?.name}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {isEditing ? (
                      <input type="number" value={r.mechanicRate} onChange={e => setRates(prev => ({ ...prev, [rig.id]: { ...prev[rig.id], mechanicRate: parseFloat(e.target.value) || 0 } }))}
                        style={{ ...iStyle, width: 120, fontSize: 14, fontWeight: 700, color: C.blue }} />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.blue, fontFamily: 'monospace' }}>
                        ₹{r.mechanicRate.toLocaleString()}<span style={{ fontSize: 10, color: C.faint }}>/day</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {isEditing ? (
                      <input type="number" value={r.helperRate} onChange={e => setRates(prev => ({ ...prev, [rig.id]: { ...prev[rig.id], helperRate: parseFloat(e.target.value) || 0 } }))}
                        style={{ ...iStyle, width: 120, fontSize: 14, fontWeight: 700, color: C.purple }} />
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.purple, fontFamily: 'monospace' }}>
                        ₹{r.helperRate.toLocaleString()}<span style={{ fontSize: 10, color: C.faint }}>/day</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 14, fontWeight: 700, color: C.muted, fontFamily: 'monospace' }}>
                    ₹{(r.mechanicRate + r.helperRate).toLocaleString()}/day
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.08)', color: C.green, border: '1px solid rgba(16,185,129,0.15)', fontWeight: 700 }}>
                      📦 Auto from Inventory
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditingRig(null); trigger() }} style={{ padding: '6px 14px', borderRadius: 8, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={() => setEditingRig(null)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingRig(rig.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Recent maintenance jobs */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wrench size={15} style={{ color: C.faint }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Recent Maintenance Jobs — Cost Breakdown</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
              {['Rig', 'Project', 'Job', 'Days', 'Labour Cost', 'Parts (Inventory)', 'Total Cost', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((job, i) => {
              const rigRate = rates[job.rig] || { mechanicRate: 1100, helperRate: 550 }
              const labourCost = job.days * (rigRate.mechanicRate + rigRate.helperRate)
              const totalCost = labourCost + job.partsFromInventory
              return (
                <tr key={i} style={{ borderBottom: `1px solid rgba(30,41,59,0.4)` }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: C.text, fontFamily: 'monospace' }}>{job.rig}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(249,115,22,0.1)', color: C.orange }}>{job.project}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: C.muted }}>{job.job}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: C.text }}>{job.days}d</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: 'monospace' }}>₹{labourCost.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: C.purple, fontFamily: 'monospace' }}>₹{job.partsFromInventory.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px', fontSize: 14, fontWeight: 800, color: C.red, fontFamily: 'monospace' }}>₹{totalCost.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: job.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: job.status === 'Completed' ? C.green : C.amber,
                      border: `1px solid ${job.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>{job.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function CostingPage() {
  const [activeTab, setActiveTab] = useState('contract')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, minHeight: '100vh', background: C.bg }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>
            Finance & Costing
          </h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>
            Set your rates once — billing, CPM and P&L calculate automatically
          </p>
        </div>
        <FinanceNav active="Costing" />
      </div>

      {/* Costing sub-nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Costing Setup</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>
              Configure all cost inputs — each section feeds directly into the CPM engine and billing
            </div>
          </div>
        </div>
        <CostingNav active={activeTab} setActive={setActiveTab} />
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'contract'    && <ContractRates />}
        {activeTab === 'rig'         && <RigRates />}
        {activeTab === 'labour'      && <LabourCosts />}
        {activeTab === 'fuel'        && <FuelRate />}
        {activeTab === 'maintenance' && <MaintenanceRates />}
      </div>

    </div>
  )
}

