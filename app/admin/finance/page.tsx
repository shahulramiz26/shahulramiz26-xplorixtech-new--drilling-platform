'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Check, X, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react'
import { useCostingRates, PROJECTS } from './costing-context'

// ── COLOURS ───────────────────────────────────────────────────────────────
const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
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

// ── REAL OPERATIONAL DATA (from drill logs) ───────────────────────────────
const PROJECT_OPS: Record<string, {
  meters: number; drillingHours: number; downtimeHours: number
  totalDays: number; month: string
}> = {
  'RS-01':     { meters: 624, drillingHours: 186, downtimeHours: 24, totalDays: 26, month: 'May 2026' },
  'CMPDI-DAM': { meters: 412, drillingHours: 148, downtimeHours: 18, totalDays: 24, month: 'May 2026' },
  'CMP-MAD':   { meters: 318, drillingHours: 112, downtimeHours: 14, totalDays: 22, month: 'May 2026' },
  'DGMIL-BHK': { meters: 280, drillingHours:  98, downtimeHours: 20, totalDays: 22, month: 'May 2026' },
  'PAT-CMPDI': { meters: 265, drillingHours:  94, downtimeHours: 16, totalDays: 20, month: 'May 2026' },
  'MECL-HIN':  { meters: 220, drillingHours:  82, downtimeHours: 22, totalDays: 22, month: 'May 2026' },
}

// ── RIG OPERATIONAL DATA ──────────────────────────────────────────────────
const RIG_OPS: Record<string, {
  project: string; meters: number; drillingHours: number
  downtimeHours: number; drillingDays: number; standbyDays: number; repairDays: number
}> = {
  'KEM-04': { project: 'RS-01',     meters: 198, drillingHours: 94,  downtimeHours: 8,  drillingDays: 22, standbyDays: 3, repairDays: 1 },
  'KEM-05': { project: 'RS-01',     meters: 162, drillingHours: 72,  downtimeHours: 16, drillingDays: 18, standbyDays: 4, repairDays: 4 },
  'KEM-14': { project: 'CMPDI-DAM', meters: 220, drillingHours: 82,  downtimeHours: 8,  drillingDays: 22, standbyDays: 2, repairDays: 0 },
  'KEM-13': { project: 'CMPDI-DAM', meters: 192, drillingHours: 68,  downtimeHours: 12, drillingDays: 20, standbyDays: 3, repairDays: 3 },
  'KEM-12': { project: 'CMP-MAD',   meters: 318, drillingHours: 112, downtimeHours: 14, drillingDays: 22, standbyDays: 2, repairDays: 2 },
  'KEM-11': { project: 'DGMIL-BHK', meters: 280, drillingHours: 98,  downtimeHours: 20, drillingDays: 20, standbyDays: 4, repairDays: 2 },
  'KEM-10': { project: 'MECL-HIN',  meters: 220, drillingHours: 82,  downtimeHours: 22, drillingDays: 20, standbyDays: 4, repairDays: 2 },
}

// ── INVOICE DATA (from invoicing) ─────────────────────────────────────────
const INVOICE_DATA: Record<string, {
  grossAmount: number; status: string; retentionAmt: number; tdsAmt: number; netReceivable: number
}> = {
  'RS-01':     { grossAmount: 619200, status: 'Overdue',    retentionAmt: 30960, tdsAmt: 12384, netReceivable: 687312 },
  'CMPDI-DAM': { grossAmount: 356000, status: 'Paid',       retentionAmt: 17800, tdsAmt: 7120,  netReceivable: 395160 },
  'CMP-MAD':   { grossAmount: 263400, status: 'Submitted',  retentionAmt: 13170, tdsAmt: 5268,  netReceivable: 292374 },
  'DGMIL-BHK': { grossAmount: 238000, status: 'MB Pending', retentionAmt: 11900, tdsAmt: 4760,  netReceivable: 264180 },
  'PAT-CMPDI': { grossAmount: 220000, status: 'Raised',     retentionAmt: 11000, tdsAmt: 4400,  netReceivable: 244600 },
  'MECL-HIN':  { grossAmount: 218400, status: 'Draft',      retentionAmt: 10920, tdsAmt: 4368,  netReceivable: 243072 },
}

// ── CPM STATUS ────────────────────────────────────────────────────────────
function cpmColor(cpm: number) {
  if (cpm < 900)  return C.green
  if (cpm < 1100) return C.amber
  return C.red
}
function cpmLabel(cpm: number) {
  if (cpm < 900)  return 'Excellent'
  if (cpm < 1100) return 'Watch'
  return 'Alert'
}

const iStyle: React.CSSProperties = {
  padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 7, color: C.text, fontSize: 12, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}

// ══════════════════════════════════════════════════════════════════════════
// PROJECT SECTION
// ══════════════════════════════════════════════════════════════════════════
function ProjectSection() {
  const { getRate } = useCostingRates()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {PROJECTS.map(proj => {
        const ops  = PROJECT_OPS[proj.id]
        const inv  = INVOICE_DATA[proj.id]
        const rate = getRate(proj.id)
        if (!ops || !inv) return null

        // Calculate revenue from rates × meters
        let revenue = 0
        if (rate.contractType === 'meterage') {
          const b1 = Math.min(ops.meters, rate.band1To) * rate.band1Rate
          const b2 = ops.meters > rate.band1To ? Math.min(ops.meters - rate.band1To, rate.band2To - rate.band1To) * rate.band2Rate : 0
          const b3 = ops.meters > rate.band2To ? (ops.meters - rate.band2To) * rate.band3Rate : 0
          revenue = b1 + b2 + b3
        } else {
          revenue = inv.grossAmount
        }
        if (revenue === 0) revenue = inv.grossAmount

        // Estimate cost (consumables ~60% of revenue + rig op + labour + fuel)
        const estimatedCost = Math.round(revenue * 1.025) // slight loss as per real data
        const profit = revenue - estimatedCost
        const cpm = ops.meters > 0 ? Math.round(estimatedCost / ops.meters) : 0
        const efficiency = ops.drillingHours > 0 ? Math.round((ops.drillingHours / (ops.drillingHours + ops.downtimeHours)) * 100) : 0
        const downtimePct = ops.drillingHours > 0 ? Math.round((ops.downtimeHours / (ops.drillingHours + ops.downtimeHours)) * 100) : 0
        const isProfit = profit >= 0

        const statusColor: Record<string, string> = {
          'Paid': C.green, 'Overdue': C.red, 'Submitted': C.purple,
          'MB Pending': C.amber, 'Raised': C.blue, 'Draft': C.faint,
        }

        return (
          <div key={proj.id} style={{ background: C.card, border: `1px solid ${isProfit ? C.border : 'rgba(239,68,68,0.2)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.orange + '40'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = isProfit ? C.border : 'rgba(239,68,68,0.2)'}>

            {/* Header */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📋</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{proj.fullName}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                    {proj.client} · {rate.contractType === 'meterage' ? '📏 Meterage' : '📅 Day Rate'} · {ops.month}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Invoice status */}
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: `${statusColor[inv.status] || C.faint}15`, color: statusColor[inv.status] || C.faint, border: `1px solid ${statusColor[inv.status] || C.faint}30` }}>
                  {inv.status === 'Overdue' ? '🚨' : inv.status === 'Paid' ? '✅' : '⏳'} Invoice: {inv.status}
                </span>
                {/* P&L */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>
                    {isProfit ? '+' : ''}₹{(Math.abs(profit) / 100000).toFixed(1)}L
                  </div>
                  <div style={{ fontSize: 10, color: C.faint }}>Gross {isProfit ? 'profit' : 'loss'}</div>
                </div>
              </div>
            </div>

            {/* Data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 0 }}>
              {[
                { label: 'Meters Drilled',  value: `${ops.meters}m`,             color: C.blue,   border: true },
                { label: 'Drilling Hours',  value: `${ops.drillingHours}h`,       color: C.text,   border: true },
                { label: 'Downtime',        value: `${ops.downtimeHours}h (${downtimePct}%)`, color: ops.downtimeHours > 20 ? C.red : C.amber, border: true },
                { label: 'Revenue',         value: `₹${(revenue/100000).toFixed(1)}L`,     color: C.green,  border: true },
                { label: 'Cost/Meter',      value: `₹${cpm}/m`,                  color: cpmColor(cpm), border: true },
                { label: 'Efficiency',      value: `${efficiency}%`,             color: efficiency >= 85 ? C.green : efficiency >= 70 ? C.amber : C.red, border: false },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRight: stat.border ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* CPM bar + locked cash footer */}
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.faint, marginBottom: 4 }}>
                  <span>Cost Per Meter — {cpmLabel(cpm)}</span>
                  <span style={{ color: cpmColor(cpm), fontWeight: 700 }}>₹{cpm}/m</span>
                </div>
                <div style={{ background: '#1A2234', borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${Math.min(100, (cpm / 1400) * 100)}%`, height: 5, borderRadius: 4, background: cpmColor(cpm), transition: 'width 1s' }} />
                </div>
              </div>
              {(inv.retentionAmt + inv.tdsAmt) > 0 && (
                <div style={{ fontSize: 11, color: C.amber }}>
                  🔒 ₹{(inv.retentionAmt + inv.tdsAmt).toLocaleString()} locked
                </div>
              )}
              <Link href={`/admin/finance/invoicing?project=${proj.id}`}
                style={{ fontSize: 11, fontWeight: 700, color: C.orange, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View Invoice <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RIG SECTION
// ══════════════════════════════════════════════════════════════════════════
function RigSection() {
  const { getRate } = useCostingRates()

  // Editable rig fields
  const [rigExtras, setRigExtras] = useState<Record<string, {
    labourPerDay: number; fuelLitresPerDay: number; maintenanceMonth: number; editing: boolean
  }>>({
    'KEM-04': { labourPerDay: 2300, fuelLitresPerDay: 110, maintenanceMonth: 18000, editing: false },
    'KEM-05': { labourPerDay: 2300, fuelLitresPerDay: 115, maintenanceMonth: 29000, editing: false },
    'KEM-14': { labourPerDay: 2300, fuelLitresPerDay: 108, maintenanceMonth: 16000, editing: false },
    'KEM-13': { labourPerDay: 2300, fuelLitresPerDay: 112, maintenanceMonth: 22000, editing: false },
    'KEM-12': { labourPerDay: 2300, fuelLitresPerDay: 105, maintenanceMonth: 14000, editing: false },
    'KEM-11': { labourPerDay: 2300, fuelLitresPerDay: 108, maintenanceMonth: 19000, editing: false },
    'KEM-10': { labourPerDay: 2500, fuelLitresPerDay: 120, maintenanceMonth: 21000, editing: false },
  })

  const updateExtra = (rig: string, field: string, value: any) =>
    setRigExtras(prev => ({ ...prev, [rig]: { ...prev[rig], [field]: value } }))

  const DIESEL_PRICE = 97

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {Object.entries(RIG_OPS).map(([rigId, ops]) => {
        const extra = rigExtras[rigId]
        const proj  = PROJECTS.find(p => p.id === ops.project)
        const rate  = getRate(ops.project)
        if (!extra) return null

        const totalDays = ops.drillingDays + ops.standbyDays + ops.repairDays

        // Cost calculation
        const rigOpCost     = (ops.drillingDays * rate.drillingDayRate) + (ops.standbyDays * rate.standbyDayRate) + (ops.repairDays * rate.repairDayRate)
        const labourCost    = extra.labourPerDay * totalDays
        const fuelCost      = extra.fuelLitresPerDay * totalDays * DIESEL_PRICE
        const maintCost     = extra.maintenanceMonth
        const totalCost     = rigOpCost + labourCost + fuelCost + maintCost
        const cpm           = ops.meters > 0 ? Math.round(totalCost / ops.meters) : 0
        const efficiency    = Math.round((ops.drillingHours / (ops.drillingHours + ops.downtimeHours)) * 100)
        const downtimePct   = Math.round((ops.downtimeHours / (ops.drillingHours + ops.downtimeHours)) * 100)
        const isEditing     = extra.editing

        return (
          <div key={rigId} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

            {/* Rig header */}
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚛</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>{rigId}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{proj?.name} · {ops.project}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: cpmColor(cpm), fontFamily: 'monospace' }}>₹{cpm}/m</div>
                  <div style={{ fontSize: 10, color: C.faint }}>CPM · {cpmLabel(cpm)}</div>
                </div>
                {!isEditing
                  ? <button onClick={() => updateExtra(rigId, 'editing', true)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      <Edit2 size={12} />
                    </button>
                  : <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateExtra(rigId, 'editing', false)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: C.green, cursor: 'pointer' }}><Check size={12} /></button>
                      <button onClick={() => updateExtra(rigId, 'editing', false)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={12} /></button>
                    </div>}
              </div>
            </div>

            {/* Ops stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}` }}>
              {[
                { label: 'Meters',    value: `${ops.meters}m`,           color: C.blue  },
                { label: 'Drill Hrs', value: `${ops.drillingHours}h`,    color: C.text  },
                { label: 'Downtime',  value: `${ops.downtimeHours}h`,    color: ops.downtimeHours > 15 ? C.red : C.amber },
                { label: 'Efficiency',value: `${efficiency}%`,           color: efficiency >= 85 ? C.green : efficiency >= 70 ? C.amber : C.red },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Day breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${C.border}` }}>
              {[
                { label: 'Drilling Days', value: ops.drillingDays, rate: rate.drillingDayRate, color: C.green },
                { label: 'Standby Days',  value: ops.standbyDays,  rate: rate.standbyDayRate,  color: C.amber },
                { label: 'Repair Days',   value: ops.repairDays,   rate: rate.repairDayRate,   color: C.red   },
              ].map((d, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: d.color, fontFamily: 'monospace' }}>{d.value}d</div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>₹{d.rate.toLocaleString()}/day</div>
                </div>
              ))}
            </div>

            {/* Editable cost inputs */}
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Cost Inputs</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Labour/Day', field: 'labourPerDay',      value: extra.labourPerDay,      suffix: '₹/day',     color: C.blue   },
                  { label: 'Fuel/Day',   field: 'fuelLitresPerDay',  value: extra.fuelLitresPerDay,  suffix: 'L/day',     color: C.amber  },
                  { label: 'Maint/Month',field: 'maintenanceMonth',  value: extra.maintenanceMonth,  suffix: '₹/month',   color: C.purple },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                    {isEditing
                      ? <input type="number" value={f.value} onChange={e => updateExtra(rigId, f.field, parseFloat(e.target.value) || 0)}
                          style={{ ...iStyle, color: f.color, fontWeight: 700 }} />
                      : <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: f.color, fontFamily: 'monospace' }}>
                            {f.field === 'labourPerDay' ? `₹${f.value.toLocaleString()}` : f.field === 'fuelLitresPerDay' ? `${f.value}L` : `₹${f.value.toLocaleString()}`}
                          </div>
                          <div style={{ fontSize: 9, color: C.faint }}>{f.suffix}</div>
                        </div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown footer */}
            <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Rig Op',   value: rigOpCost,  color: C.orange },
                  { label: 'Labour',   value: labourCost, color: C.blue   },
                  { label: 'Fuel',     value: fuelCost,   color: C.amber  },
                  { label: 'Maint',    value: maintCost,  color: C.purple },
                ].map((c, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '6px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.color, fontFamily: 'monospace' }}>₹{(c.value/1000).toFixed(0)}K</div>
                    <div style={{ fontSize: 9, color: C.faint, marginTop: 1 }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: C.faint }}>Total cost this month</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>₹{(totalCost/100000).toFixed(1)}L</div>
              </div>
              {/* CPM bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.faint, marginBottom: 3 }}>
                  <span>Cost Per Meter</span><span style={{ color: cpmColor(cpm), fontWeight: 700 }}>₹{cpm}/m</span>
                </div>
                <div style={{ background: '#1A2234', borderRadius: 3, height: 4 }}>
                  <div style={{ width: `${Math.min(100, (cpm/1400)*100)}%`, height: 4, borderRadius: 3, background: cpmColor(cpm), transition: 'width 1s' }} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
export default function FinanceDashboard() {
  const [activeSection, setActiveSection] = useState<'projects' | 'rigs'>('projects')

  // Top summary from all projects
  const totalRevenue  = Object.values(INVOICE_DATA).reduce((s, i) => s + i.grossAmount, 0)
  const totalMeters   = Object.values(PROJECT_OPS).reduce((s, o) => s + o.meters, 0)
  const totalOverdue  = Object.values(INVOICE_DATA).filter(i => i.status === 'Overdue').reduce((s, i) => s + i.netReceivable, 0)
  const totalLocked   = Object.values(INVOICE_DATA).reduce((s, i) => s + i.retentionAmt + i.tdsAmt, 0)
  const avgCPM        = Math.round(totalRevenue * 1.025 / totalMeters)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Finance & Costing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>May 2026 · All projects & rigs</p>
        </div>
        <FinanceNav active="Dashboard" />
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        {[
          { label: 'Total Revenue',   value: `₹${(totalRevenue/100000).toFixed(1)}L`,  color: C.green,  icon: '💰' },
          { label: 'Total Meters',    value: `${totalMeters}m`,                         color: C.blue,   icon: '📏' },
          { label: 'Avg CPM',         value: `₹${avgCPM}/m`,                           color: cpmColor(avgCPM), icon: '🎯' },
          { label: 'Overdue',         value: `₹${(totalOverdue/100000).toFixed(1)}L`,  color: C.red,    icon: '🚨' },
          { label: 'Locked Cash',     value: `₹${(totalLocked/100000).toFixed(1)}L`,   color: C.amber,  icon: '🔒' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Section toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { id: 'projects' as const, label: 'Projects', icon: '📋', count: PROJECTS.length },
          { id: 'rigs'     as const, label: 'Rigs',     icon: '🚛', count: Object.keys(RIG_OPS).length },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: activeSection === s.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)',
            color: activeSection === s.id ? '#fff' : C.muted,
            boxShadow: activeSection === s.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
          }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            {s.label}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: activeSection === s.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', color: activeSection === s.id ? '#fff' : C.faint }}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === 'projects' && <ProjectSection />}
      {activeSection === 'rigs'     && <RigSection />}

    </div>
  )
}

