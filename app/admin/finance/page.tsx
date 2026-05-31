'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Check, X } from 'lucide-react'
import { useCostingRates, PROJECTS } from './costing-context'

const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}

function FinanceNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
      {[
        { href: '/admin/finance',           label: 'Dashboard' },
        { href: '/admin/finance/costing',   label: 'Costing'   },
        { href: '/admin/finance/invoicing', label: 'Invoicing' },
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

// ── OPERATIONAL DATA — from drill logs ────────────────────────────────────
const PROJECT_OPS: Record<string, { meters: number; drillingHours: number; downtimeHours: number; totalDays: number }> = {
  'RS-01':     { meters: 624, drillingHours: 186, downtimeHours: 24, totalDays: 26 },
  'CMPDI-DAM': { meters: 412, drillingHours: 148, downtimeHours: 18, totalDays: 24 },
  'CMP-MAD':   { meters: 318, drillingHours: 112, downtimeHours: 14, totalDays: 22 },
  'DGMIL-BHK': { meters: 280, drillingHours:  98, downtimeHours: 20, totalDays: 22 },
  'PAT-CMPDI': { meters: 265, drillingHours:  94, downtimeHours: 16, totalDays: 20 },
  'MECL-HIN':  { meters: 220, drillingHours:  82, downtimeHours: 22, totalDays: 22 },
}

const RIGS = [
  { id: 'KEM-04', project: 'RS-01',     contractType: 'meterage', meters: 198, drillingHours: 94,  downtimeHours: 8,  drillingDays: 22, standbyDays: 3, repairDays: 1 },
  { id: 'KEM-05', project: 'RS-01',     contractType: 'meterage', meters: 162, drillingHours: 72,  downtimeHours: 16, drillingDays: 18, standbyDays: 4, repairDays: 4 },
  { id: 'KEM-14', project: 'CMPDI-DAM', contractType: 'meterage', meters: 220, drillingHours: 82,  downtimeHours: 8,  drillingDays: 22, standbyDays: 2, repairDays: 0 },
  { id: 'KEM-13', project: 'CMPDI-DAM', contractType: 'meterage', meters: 192, drillingHours: 68,  downtimeHours: 12, drillingDays: 20, standbyDays: 3, repairDays: 3 },
  { id: 'KEM-12', project: 'CMP-MAD',   contractType: 'meterage', meters: 318, drillingHours: 112, downtimeHours: 14, drillingDays: 22, standbyDays: 2, repairDays: 2 },
  { id: 'KEM-11', project: 'DGMIL-BHK', contractType: 'meterage', meters: 280, drillingHours: 98,  downtimeHours: 20, drillingDays: 20, standbyDays: 4, repairDays: 2 },
  { id: 'KEM-10', project: 'MECL-HIN',  contractType: 'dayrate',  meters: 220, drillingHours: 82,  downtimeHours: 22, drillingDays: 20, standbyDays: 4, repairDays: 2 },
]

// ── DEFAULT RIG COST INPUTS ───────────────────────────────────────────────
const DEFAULT_RIG_COSTS: Record<string, { labourPerDay: number; fuelLitresPerDay: number; maintenanceMonth: number }> = {
  'KEM-04': { labourPerDay: 2300, fuelLitresPerDay: 110, maintenanceMonth: 18000 },
  'KEM-05': { labourPerDay: 2300, fuelLitresPerDay: 115, maintenanceMonth: 29000 },
  'KEM-14': { labourPerDay: 2300, fuelLitresPerDay: 108, maintenanceMonth: 16000 },
  'KEM-13': { labourPerDay: 2300, fuelLitresPerDay: 112, maintenanceMonth: 22000 },
  'KEM-12': { labourPerDay: 2300, fuelLitresPerDay: 105, maintenanceMonth: 14000 },
  'KEM-11': { labourPerDay: 2300, fuelLitresPerDay: 108, maintenanceMonth: 19000 },
  'KEM-10': { labourPerDay: 2500, fuelLitresPerDay: 120, maintenanceMonth: 21000 },
}

const DIESEL_PRICE = 97

function cpmColor(cpm: number) {
  if (cpm < 900)  return C.green
  if (cpm < 1100) return C.amber
  return C.red
}
function cpmLabel(cpm: number) {
  if (cpm < 900)  return 'Good'
  if (cpm < 1100) return 'Watch'
  return 'Alert'
}

const iStyle: React.CSSProperties = {
  padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 7, color: C.text, fontSize: 12, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}

// ══════════════════════════════════════════════════════════════════════════
// PROJECTS SECTION
// ══════════════════════════════════════════════════════════════════════════
function ProjectsSection() {
  const { getRate } = useCostingRates()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {PROJECTS.map(proj => {
        const ops  = PROJECT_OPS[proj.id]
        const rate = getRate(proj.id)
        if (!ops) return null

        // Revenue from contract rates × meters
        let revenue = 0
        if (rate.contractType === 'meterage' && rate.band1Rate > 0) {
          const b1 = Math.min(ops.meters, rate.band1To) * rate.band1Rate
          const b2 = ops.meters > rate.band1To && rate.band2Rate > 0
            ? Math.min(ops.meters - rate.band1To, rate.band2To - rate.band1To) * rate.band2Rate : 0
          const b3 = ops.meters > rate.band2To && rate.band3Rate > 0
            ? (ops.meters - rate.band2To) * rate.band3Rate : 0
          revenue = b1 + b2 + b3
          if (rate.standbyRate > 0) {
            // Add estimated standby — 3 days average
            revenue += 3 * rate.standbyRate
          }
        } else if (rate.contractType === 'dayrate' && rate.drillingDayRate > 0) {
          // For day rate: estimate from ops days
          const rigData = RIGS.filter(r => r.project === proj.id)
          rigData.forEach(r => {
            revenue += (r.drillingDays * rate.drillingDayRate) + (r.standbyDays * rate.standbyDayRate) + (r.repairDays * rate.repairDayRate)
          })
        }

        // Cost from rig costs
        const projRigs = RIGS.filter(r => r.project === proj.id)
        let totalCost = 0
        projRigs.forEach(r => {
          const extra = DEFAULT_RIG_COSTS[r.id]
          if (!extra) return
          const totalDays = r.drillingDays + r.standbyDays + r.repairDays
          const labour  = extra.labourPerDay * totalDays
          const fuel    = extra.fuelLitresPerDay * totalDays * DIESEL_PRICE
          const maint   = extra.maintenanceMonth
          // Rig operating cost from costing rates
          const rigOp = rate.contractType === 'dayrate'
            ? (r.drillingDays * 9000) + (r.standbyDays * 4500) + (r.repairDays * 3000)
            : (r.drillingDays * 9000) + (r.standbyDays * 4500) + (r.repairDays * 3000)
          totalCost += rigOp + labour + fuel + maint
        })

        const profit     = revenue - totalCost
        const cpm        = ops.meters > 0 && totalCost > 0 ? Math.round(totalCost / ops.meters) : 0
        const efficiency = Math.round((ops.drillingHours / (ops.drillingHours + ops.downtimeHours)) * 100)
        const downtimePct = Math.round((ops.downtimeHours / (ops.drillingHours + ops.downtimeHours)) * 100)
        const isProfit   = profit >= 0
        const noRates    = revenue === 0

        return (
          <div key={proj.id} style={{
            background: C.card,
            border: `1px solid ${noRates ? C.border : isProfit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{proj.fullName}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                    {proj.client} · {rate.contractType === 'meterage' ? '📏 Meterage' : '📅 Day Rate'} · May 2026
                  </div>
                </div>
              </div>
              {noRates
                ? <span style={{ fontSize: 11, color: C.amber, padding: '5px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    ⚠ No contract rates set — <Link href="/admin/finance/costing" style={{ color: C.orange, textDecoration: 'none', fontWeight: 700 }}>Set in Costing →</Link>
                  </span>
                : <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>
                      {isProfit ? '+' : ''}₹{(Math.abs(profit) / 100000).toFixed(1)}L
                    </div>
                    <div style={{ fontSize: 10, color: C.faint }}>Gross {isProfit ? 'profit' : 'loss'}</div>
                  </div>}
            </div>

            {/* Stats grid — 6 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>
              {[
                { label: 'Meters Drilled',  value: `${ops.meters}m`,                                  color: C.blue   },
                { label: 'Drilling Hours',  value: `${ops.drillingHours}h`,                           color: C.text   },
                { label: 'Downtime',        value: `${ops.downtimeHours}h (${downtimePct}%)`,         color: downtimePct > 15 ? C.red : C.amber },
                { label: 'Revenue',         value: noRates ? '—' : `₹${(revenue/100000).toFixed(1)}L`, color: C.green },
                { label: 'Total Cost',      value: `₹${(totalCost/100000).toFixed(1)}L`,             color: C.red    },
                { label: 'Efficiency',      value: `${efficiency}%`,                                  color: efficiency >= 85 ? C.green : efficiency >= 70 ? C.amber : C.red },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRight: i < 5 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* CPM bar */}
            {!noRates && cpm > 0 && (
              <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.faint, marginBottom: 4 }}>
                    <span>Cost Per Meter — {cpmLabel(cpm)}</span>
                    <span style={{ color: cpmColor(cpm), fontWeight: 700 }}>₹{cpm}/m</span>
                  </div>
                  <div style={{ background: '#1A2234', borderRadius: 4, height: 5 }}>
                    <div style={{ width: `${Math.min(100, (cpm / 1400) * 100)}%`, height: 5, borderRadius: 4, background: cpmColor(cpm) }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// RIGS SECTION
// ══════════════════════════════════════════════════════════════════════════
function RigsSection() {
  const { getRate } = useCostingRates()

  const [rigCosts, setRigCosts] = useState<Record<string, {
    labourPerDay: number; fuelLitresPerDay: number; maintenanceMonth: number; editing: boolean
  }>>(
    Object.fromEntries(Object.entries(DEFAULT_RIG_COSTS).map(([k, v]) => [k, { ...v, editing: false }]))
  )

  const updateCost = (rigId: string, field: string, value: any) =>
    setRigCosts(prev => ({ ...prev, [rigId]: { ...prev[rigId], [field]: value } }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {RIGS.map(rig => {
        const extra = rigCosts[rig.id]
        const rate  = getRate(rig.project)
        if (!extra) return null

        const isMeterage  = rig.contractType === 'meterage'
        const isDayRate   = rig.contractType === 'dayrate'
        const totalDays   = rig.drillingDays + rig.standbyDays + rig.repairDays
        const efficiency  = Math.round((rig.drillingHours / (rig.drillingHours + rig.downtimeHours)) * 100)
        const downtimePct = Math.round((rig.downtimeHours / (rig.drillingHours + rig.downtimeHours)) * 100)

        // Cost calculation from rig cost inputs
        const labourCost  = extra.labourPerDay * totalDays
        const fuelCost    = extra.fuelLitresPerDay * totalDays * DIESEL_PRICE
        const maintCost   = extra.maintenanceMonth
        // Rig op cost — for day rate rigs use the contract rates
        const rigOpCost   = isDayRate
          ? (rig.drillingDays * rate.drillingDayRate) + (rig.standbyDays * rate.standbyDayRate) + (rig.repairDays * rate.repairDayRate)
          : (rig.drillingDays * 9000) + (rig.standbyDays * 4500) + (rig.repairDays * 3000)
        const totalCost   = rigOpCost + labourCost + fuelCost + maintCost
        const cpm         = rig.meters > 0 ? Math.round(totalCost / rig.meters) : 0
        const isEditing   = extra.editing

        return (
          <div key={rig.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🚛</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>{rig.id}</div>
                  <div style={{ fontSize: 11, color: C.faint }}>{rig.project} · {isMeterage ? '📏 Meterage' : '📅 Day Rate'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: cpmColor(cpm), fontFamily: 'monospace' }}>₹{cpm}/m</div>
                  <div style={{ fontSize: 10, color: C.faint }}>CPM · {cpmLabel(cpm)}</div>
                </div>
                {!isEditing
                  ? <button onClick={() => updateCost(rig.id, 'editing', true)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}>
                      <Edit2 size={12} />
                    </button>
                  : <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => updateCost(rig.id, 'editing', false)} style={{ padding: '6px 9px', borderRadius: 7, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: C.green, cursor: 'pointer' }}><Check size={12} /></button>
                      <button onClick={() => updateCost(rig.id, 'editing', false)} style={{ padding: '6px 9px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={12} /></button>
                    </div>}
              </div>
            </div>

            {/* Ops stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}` }}>
              {[
                { label: 'Meters',     value: `${rig.meters}m`,           color: C.blue   },
                { label: 'Drill Hrs',  value: `${rig.drillingHours}h`,    color: C.text   },
                { label: 'Downtime',   value: `${rig.downtimeHours}h (${downtimePct}%)`, color: rig.downtimeHours > 15 ? C.red : C.amber },
                { label: 'Efficiency', value: `${efficiency}%`,           color: efficiency >= 85 ? C.green : C.amber },
              ].map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Day rate rigs — show drilling/standby/repair breakdown */}
            {isDayRate && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${C.border}` }}>
                {[
                  { label: 'Drilling Days', value: rig.drillingDays, rate: rate.drillingDayRate, color: C.green },
                  { label: 'Standby Days',  value: rig.standbyDays,  rate: rate.standbyDayRate,  color: C.amber },
                  { label: 'Repair Days',   value: rig.repairDays,   rate: rate.repairDayRate,   color: C.red   },
                ].map((d, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: d.color, fontFamily: 'monospace' }}>{d.value}d</div>
                    <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>₹{d.rate.toLocaleString()}/day</div>
                  </div>
                ))}
              </div>
            )}

            {/* Cost inputs — editable */}
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Cost Inputs</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Labour/Day',   field: 'labourPerDay',      value: extra.labourPerDay,      color: C.blue,   display: `₹${extra.labourPerDay.toLocaleString()}` },
                  { label: 'Fuel/Day',     field: 'fuelLitresPerDay',  value: extra.fuelLitresPerDay,  color: C.amber,  display: `${extra.fuelLitresPerDay}L` },
                  { label: 'Maint/Month',  field: 'maintenanceMonth',  value: extra.maintenanceMonth,  color: C.purple, display: `₹${extra.maintenanceMonth.toLocaleString()}` },
                ].map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label}</div>
                    {isEditing
                      ? <input type="number" value={f.value} onChange={e => updateCost(rig.id, f.field, parseFloat(e.target.value) || 0)} style={{ ...iStyle, color: f.color, fontWeight: 700 }} />
                      : <div style={{ fontSize: 14, fontWeight: 800, color: f.color, fontFamily: 'monospace' }}>{f.display}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Cost breakdown + total */}
            <div style={{ padding: '12px 18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
                {[
                  { label: 'Rig Op', value: rigOpCost,  color: C.orange },
                  { label: 'Labour', value: labourCost, color: C.blue   },
                  { label: 'Fuel',   value: fuelCost,   color: C.amber  },
                  { label: 'Maint',  value: maintCost,  color: C.purple },
                ].map((c, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '6px 4px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.color, fontFamily: 'monospace' }}>₹{(c.value/1000).toFixed(0)}K</div>
                    <div style={{ fontSize: 9, color: C.faint, marginTop: 1 }}>{c.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.faint }}>Total cost this month</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>₹{(totalCost/100000).toFixed(1)}L</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.faint, marginBottom: 3 }}>
                  <span>Cost Per Meter</span>
                  <span style={{ color: cpmColor(cpm), fontWeight: 700 }}>₹{cpm}/m</span>
                </div>
                <div style={{ background: '#1A2234', borderRadius: 3, height: 4 }}>
                  <div style={{ width: `${Math.min(100, (cpm/1400)*100)}%`, height: 4, borderRadius: 3, background: cpmColor(cpm) }} />
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
  const { getRate } = useCostingRates()
  const [activeSection, setActiveSection] = useState<'projects' | 'rigs'>('projects')

  // Top KPIs
  const totalMeters = Object.values(PROJECT_OPS).reduce((s, o) => s + o.meters, 0)
  let totalRevenue = 0
  PROJECTS.forEach(proj => {
    const ops = PROJECT_OPS[proj.id]; if (!ops) return
    const rate = getRate(proj.id)
    if (rate.contractType === 'meterage' && rate.band1Rate > 0) {
      const b1 = Math.min(ops.meters, rate.band1To) * rate.band1Rate
      const b2 = ops.meters > rate.band1To && rate.band2Rate > 0 ? Math.min(ops.meters - rate.band1To, rate.band2To - rate.band1To) * rate.band2Rate : 0
      const b3 = ops.meters > rate.band2To && rate.band3Rate > 0 ? (ops.meters - rate.band2To) * rate.band3Rate : 0
      totalRevenue += b1 + b2 + b3
    }
  })

  let totalCost = 0
  RIGS.forEach(rig => {
    const extra = DEFAULT_RIG_COSTS[rig.id]; if (!extra) return
    const totalDays = rig.drillingDays + rig.standbyDays + rig.repairDays
    totalCost += (extra.labourPerDay * totalDays) + (extra.fuelLitresPerDay * totalDays * DIESEL_PRICE) + extra.maintenanceMonth + (rig.drillingDays * 9000) + (rig.standbyDays * 4500) + (rig.repairDays * 3000)
  })

  const totalProfit = totalRevenue - totalCost
  const avgCPM = totalMeters > 0 ? Math.round(totalCost / totalMeters) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Finance Dashboard</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>May 2026 · All projects & rigs</p>
        </div>
        <FinanceNav active="Dashboard" />
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        {[
          { label: 'Total Revenue',  value: `₹${(totalRevenue/100000).toFixed(1)}L`,              color: C.green,         icon: '💰', note: 'From contract rates' },
          { label: 'Total Cost',     value: `₹${(totalCost/100000).toFixed(1)}L`,                 color: C.red,           icon: '📊', note: 'All rigs combined'  },
          { label: 'Gross P&L',      value: `${totalProfit >= 0 ? '+' : ''}₹${(Math.abs(totalProfit)/100000).toFixed(1)}L`, color: totalProfit >= 0 ? C.green : C.red, icon: totalProfit >= 0 ? '📈' : '📉', note: totalProfit >= 0 ? 'Profitable' : 'Making a loss' },
          { label: 'Total Meters',   value: `${totalMeters}m`,                                    color: C.blue,          icon: '📏', note: 'All projects'       },
          { label: 'Avg CPM',        value: `₹${avgCPM}/m`,                                      color: cpmColor(avgCPM), icon: '🎯', note: cpmLabel(avgCPM)    },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* Section toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'projects' as const, label: 'Projects', icon: '📋', count: PROJECTS.length },
          { id: 'rigs'     as const, label: 'Rigs',     icon: '🚛', count: RIGS.length     },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none',
            background: activeSection === s.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)',
            color: activeSection === s.id ? '#fff' : C.muted,
            boxShadow: activeSection === s.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
          }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span> {s.label}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: activeSection === s.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: activeSection === s.id ? '#fff' : C.faint }}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {activeSection === 'projects' && <ProjectsSection />}
      {activeSection === 'rigs'     && <RigsSection />}
    </div>
  )
}

