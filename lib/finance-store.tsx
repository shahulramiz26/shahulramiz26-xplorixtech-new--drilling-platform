'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { poReceivedValue } from './inventory-store'
import type { PurchaseOrder } from './inventory-store'
import { operationalRecordsForRig } from './operations-store'
import type { OperationalRecord } from './operations-store'

// ── TYPES ──────────────────────────────────────────────────────────────────
// The only things anyone actually types in, for a given rig+project+month.
// Everything operational (days, meters, fuel, maintenance) lives in
// operations-store.tsx and is never edited here.
export interface RigRateInputs {
  id: string
  rig: string
  project: string
  month: string
  rigDayRate: number       // rig's own rental/depreciation cost, ₹/day
  labourPerDay: number
  fuelPricePerLitre: number
  mobilisation: number     // cost TO YOU of moving the rig in, one-time
  demobilisation: number   // cost TO YOU of moving the rig out, one-time
}

// The actual contract — what you bill the client, per project. Nothing
// invoice-related lives here anymore, just the agreed rate.
export interface ClientRate {
  project: string
  client: string
  contractType: 'meterage' | 'dayrate'
  band1To: number; band1Rate: number
  band2To: number; band2Rate: number
  band3Rate: number
  standbyRate: number
  drillingDayRate: number; standbyDayRate: number; repairDayRate: number
}

// ── SAMPLE DATA ──────────────────────────────────────────────────────────
export const PROJECT_CLIENTS: Record<string, string> = {
  'Site A - North Field': 'CMPDI',
  'Site B - South Ridge': 'DGML',
  'Site C - East Basin': 'MECL',
}

export const SEED_CLIENT_RATES: Record<string, ClientRate> = {
  'Site A - North Field': { project: 'Site A - North Field', client: 'CMPDI', contractType: 'meterage', band1To: 200, band1Rate: 850, band2To: 400, band2Rate: 950, band3Rate: 1050, standbyRate: 8000, drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000 },
  'Site B - South Ridge': { project: 'Site B - South Ridge', client: 'DGML', contractType: 'meterage', band1To: 200, band1Rate: 800, band2To: 400, band2Rate: 900, band3Rate: 1000, standbyRate: 7000, drillingDayRate: 25000, standbyDayRate: 10000, repairDayRate: 7000 },
  'Site C - East Basin': { project: 'Site C - East Basin', client: 'MECL', contractType: 'dayrate', band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0, drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000 },
}

export const SEED_RIG_RATES: RigRateInputs[] = [
  { id: 'rr1', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', rigDayRate: 9000, labourPerDay: 2300, fuelPricePerLitre: 97, mobilisation: 50000, demobilisation: 0 },
  { id: 'rr2', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-08', rigDayRate: 9000, labourPerDay: 2300, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr3', rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-07', rigDayRate: 8500, labourPerDay: 2300, fuelPricePerLitre: 97, mobilisation: 0, demobilisation: 0 },
  { id: 'rr4', rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-08', rigDayRate: 8500, labourPerDay: 2300, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr5', rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-07', rigDayRate: 9500, labourPerDay: 2500, fuelPricePerLitre: 97, mobilisation: 60000, demobilisation: 0 },
  { id: 'rr6', rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-08', rigDayRate: 9500, labourPerDay: 2500, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
]

// ── STORE ──────────────────────────────────────────────────────────────────
interface State { rigRates: RigRateInputs[]; clientRates: Record<string, ClientRate> }
function initial(): State { return { rigRates: SEED_RIG_RATES, clientRates: SEED_CLIENT_RATES } }
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  setRigRate: (r: Omit<RigRateInputs, 'id'> & { id?: string }) => void
  deleteRigRate: (id: string) => void
  setClientRate: (project: string, rate: ClientRate) => void
}
const FinanceContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_finance_v2'

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const setRigRate: Ctx['setRigRate'] = r => setState(s => {
    const existing = s.rigRates.find(x => x.rig === r.rig && x.project === r.project && x.month === r.month)
    if (existing) return { ...s, rigRates: s.rigRates.map(x => x.id === existing.id ? { ...r, id: existing.id } : x) }
    return { ...s, rigRates: [{ ...r, id: uid('rr') }, ...s.rigRates] }
  })
  const deleteRigRate: Ctx['deleteRigRate'] = id => setState(s => ({ ...s, rigRates: s.rigRates.filter(r => r.id !== id) }))
  const setClientRate: Ctx['setClientRate'] = (project, rate) => setState(s => ({ ...s, clientRates: { ...s.clientRates, [project]: rate } }))

  return <FinanceContext.Provider value={{ state, setRigRate, deleteRigRate, setClientRate }}>{children}</FinanceContext.Provider>
}
export function useFinance() { const c = useContext(FinanceContext); if (!c) throw new Error('useFinance must be used inside FinanceProvider'); return c }

// ── CALCULATIONS — the one place CPM and margin get computed ──────────────
export interface CostBreakdown { rigCost: number; labour: number; fuel: number; maintenance: number; mobDemob: number; parts: number; total: number; cpm: number }
export function costBreakdown(ops: OperationalRecord, rates: RigRateInputs, inventoryPOs: PurchaseOrder[]): CostBreakdown {
  const rigCost = rates.rigDayRate * ops.daysOperated
  const labour = rates.labourPerDay * ops.daysOperated
  const fuel = ops.fuelLitresPerDay * ops.daysOperated * rates.fuelPricePerLitre
  const maintenance = ops.maintenanceCost
  const mobDemob = rates.mobilisation + rates.demobilisation
  const parts = inventoryPOs.filter(po => po.rig === ops.rig && po.project === ops.project).reduce((s, po) => s + poReceivedValue(po), 0)
  const total = rigCost + labour + fuel + maintenance + mobDemob + parts
  const cpm = ops.metersDrilled > 0 ? total / ops.metersDrilled : 0
  return { rigCost, labour, fuel, maintenance, mobDemob, parts, total, cpm }
}

export function calcClientRevenue(rate: ClientRate, opts: { meters: number; standbyDays?: number; drillingDays?: number; repairDays?: number }) {
  const { meters, standbyDays = 0, drillingDays = 0, repairDays = 0 } = opts
  if (rate.contractType === 'meterage') {
    let rev = 0
    const b1 = Math.min(meters, rate.band1To)
    rev += b1 * rate.band1Rate
    if (meters > rate.band1To) rev += Math.min(meters - rate.band1To, rate.band2To - rate.band1To) * rate.band2Rate
    if (meters > rate.band2To) rev += (meters - rate.band2To) * rate.band3Rate
    rev += standbyDays * rate.standbyRate
    return rev
  }
  return drillingDays * rate.drillingDayRate + standbyDays * rate.standbyDayRate + repairDays * rate.repairDayRate
}

export interface MarginResult { cost: CostBreakdown; revenue: number; clientRatePerMeter: number; marginPerMeter: number; totalMargin: number }
// Day-rate contracts have no natural "per meter" client rate — every
// operated day is treated as a drilling day for this comparison, since
// operational data doesn't currently split days by drilling/standby/repair.
export function computeMargin(ops: OperationalRecord, rates: RigRateInputs, clientRate: ClientRate, inventoryPOs: PurchaseOrder[]): MarginResult {
  const cost = costBreakdown(ops, rates, inventoryPOs)
  const revenue = clientRate.contractType === 'meterage'
    ? calcClientRevenue(clientRate, { meters: ops.metersDrilled })
    : calcClientRevenue(clientRate, { meters: ops.metersDrilled, drillingDays: ops.daysOperated })
  const clientRatePerMeter = ops.metersDrilled > 0 ? revenue / ops.metersDrilled : 0
  const marginPerMeter = clientRatePerMeter - cost.cpm
  const totalMargin = revenue - cost.total
  return { cost, revenue, clientRatePerMeter, marginPerMeter, totalMargin }
}

// Current project for a rig = whichever project currently lists it in
// project.rigs (managed by the separate project/rig assignment system).
// Everything else in that rig's history is Completed.
export function currentProjectForRig(inventoryProjects: { name: string; rigs: string[] }[], rig: string): string | null {
  return inventoryProjects.find(p => p.rigs.includes(rig))?.name || null
}

export { operationalRecordsForRig }
export type { OperationalRecord }

// ── SHARED UI ────────────────────────────────────────────────────────────
export const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}
export const iStyle: React.CSSProperties = { padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%' }
export const selStyle: React.CSSProperties = { ...iStyle, cursor: 'pointer', appearance: 'none' as any }
export const readOnlyBox: React.CSSProperties = { padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, fontFamily: 'monospace' }
export function money(n: number) { return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` }
export function moneyL(n: number) { return `₹${(n / 100000).toFixed(1)}L` }

export function FinanceNav({ active }: { active: string }) {
  const tabs = [
    { href: '/admin/finance', label: 'Rig Cost' },
    { href: '/admin/finance/client-contracts', label: 'Client Contracts' },
    { href: '/admin/finance/margin', label: 'Margin' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <Link key={t.href} href={t.href} style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', background: active === t.label ? C.orange : 'transparent', color: active === t.label ? '#fff' : C.muted }}>{t.label}</Link>
      ))}
    </div>
  )
}
export function cpmColor(cpm: number) { return cpm < 900 ? C.green : cpm < 1100 ? C.amber : C.red }
export function cpmLabel(cpm: number) { return cpm < 900 ? 'Good' : cpm < 1100 ? 'Watch' : 'Alert' }
export function marginColor(m: number) { return m >= 0 ? C.green : C.red }

