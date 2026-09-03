'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { poReceivedValue } from './inventory-store'
import type { PurchaseOrder } from './inventory-store'
import { operationalRecordsForRig, operationalRecordsForProjectMonth, totalDaysOperated } from './operations-store'
import type { OperationalRecord } from './operations-store'

// ── TYPES ──────────────────────────────────────────────────────────────────
// The only things anyone types in, for a given rig+project+month.
// Everything operational (days, meters, fuel, downtime, maintenance) lives
// in operations-store.tsx and is never edited here.
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

// A rate a client pays per meter for a given formation type (e.g. "Soft",
// "Medium", "Hard" — or whatever names a given government contract uses).
// Free-form list, not a fixed enum, so any customer's formation schedule
// fits without touching code.
export interface FormationRate {
  formation: string
  ratePerMeter: number
}

// What you bill the client, per project. This is the only real "contract" —
// a rig doesn't have one, only a project/client relationship does.
export interface ClientRate {
  project: string
  client: string
  contractType: 'meterage' | 'dayrate'
  band1To: number; band1Rate: number
  band2To: number; band2Rate: number
  band3Rate: number
  standbyRate: number
  drillingDayRate: number; standbyDayRate: number; repairDayRate: number
  // Government-contract formation surcharge — ADDED on top of the band rate,
  // per meter, based on which formation that meter was drilled through.
  // Only applies to meterage contracts. Empty list = no formation billing
  // (older/simple contracts keep working exactly as before).
  formationRates: FormationRate[]
}

// A single borehole — the real billing unit on government contracts, where
// invoices are built per hole from a formation/depth measurement book, not
// from a rig's monthly rollup. Entered directly here in Finance (not pulled
// from operations), since the formation-by-formation meter breakdown is
// billing detail the ops dashboards don't track.
export interface Hole {
  id: string
  rig: string
  project: string
  month: string
  holeNumber: string
  metersByFormation: { formation: string; meters: number }[]
}
export function holeTotalMeters(h: Hole): number {
  return h.metersByFormation.reduce((s, m) => s + m.meters, 0)
}

// ── SAMPLE DATA ──────────────────────────────────────────────────────────
export const PROJECT_CLIENTS: Record<string, string> = {
  'Site A - North Field': 'CMPDI',
  'Site B - South Ridge': 'DGML',
  'Site C - East Basin': 'MECL',
}

export const SEED_CLIENT_RATES: Record<string, ClientRate> = {
  'Site A - North Field': {
    project: 'Site A - North Field', client: 'CMPDI', contractType: 'meterage',
    band1To: 200, band1Rate: 850, band2To: 400, band2Rate: 950, band3Rate: 1050, standbyRate: 8000,
    drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    formationRates: [
      { formation: 'Soft', ratePerMeter: 150 },
      { formation: 'Medium', ratePerMeter: 300 },
      { formation: 'Hard', ratePerMeter: 450 },
    ],
  },
  'Site B - South Ridge': {
    project: 'Site B - South Ridge', client: 'DGML', contractType: 'meterage',
    band1To: 200, band1Rate: 800, band2To: 400, band2Rate: 900, band3Rate: 1000, standbyRate: 7000,
    drillingDayRate: 25000, standbyDayRate: 10000, repairDayRate: 7000,
    formationRates: [
      { formation: 'Soft', ratePerMeter: 140 },
      { formation: 'Medium', ratePerMeter: 280 },
      { formation: 'Hard', ratePerMeter: 420 },
    ],
  },
  'Site C - East Basin': {
    project: 'Site C - East Basin', client: 'MECL', contractType: 'dayrate',
    band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0,
    drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    formationRates: [],
  },
}

export const SEED_RIG_RATES: RigRateInputs[] = [
  { id: 'rr1', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', rigDayRate: 9000, labourPerDay: 2300, fuelPricePerLitre: 97, mobilisation: 50000, demobilisation: 0 },
  { id: 'rr2', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-08', rigDayRate: 9000, labourPerDay: 2300, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr3', rig: 'Rig A2', project: 'Site A - North Field', month: '2026-07', rigDayRate: 8800, labourPerDay: 2300, fuelPricePerLitre: 97, mobilisation: 0, demobilisation: 0 },
  { id: 'rr4', rig: 'Rig A2', project: 'Site A - North Field', month: '2026-08', rigDayRate: 8800, labourPerDay: 2300, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr5', rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-07', rigDayRate: 8500, labourPerDay: 2300, fuelPricePerLitre: 97, mobilisation: 0, demobilisation: 0 },
  { id: 'rr6', rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-08', rigDayRate: 8500, labourPerDay: 2300, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr7', rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-07', rigDayRate: 9500, labourPerDay: 2500, fuelPricePerLitre: 97, mobilisation: 60000, demobilisation: 0 },
  { id: 'rr8', rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-08', rigDayRate: 9500, labourPerDay: 2500, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
  { id: 'rr9', rig: 'Rig C2', project: 'Site C - East Basin', month: '2026-07', rigDayRate: 9200, labourPerDay: 2400, fuelPricePerLitre: 97, mobilisation: 0, demobilisation: 0 },
  { id: 'rr10', rig: 'Rig C2', project: 'Site C - East Basin', month: '2026-08', rigDayRate: 9200, labourPerDay: 2400, fuelPricePerLitre: 98, mobilisation: 0, demobilisation: 0 },
]

export const SEED_HOLES: Hole[] = [
  { id: 'h1', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', holeNumber: 'BH-01', metersByFormation: [{ formation: 'Soft', meters: 40 }, { formation: 'Hard', meters: 60 }] },
  { id: 'h2', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', holeNumber: 'BH-02', metersByFormation: [{ formation: 'Medium', meters: 90 }] },
]

// ── STORE ──────────────────────────────────────────────────────────────────
interface State { rigRates: RigRateInputs[]; clientRates: Record<string, ClientRate>; holes: Hole[] }
function initial(): State { return { rigRates: SEED_RIG_RATES, clientRates: SEED_CLIENT_RATES, holes: SEED_HOLES } }
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  setRigRate: (r: Omit<RigRateInputs, 'id'> & { id?: string }) => void
  setClientRate: (project: string, rate: ClientRate) => void
  setHole: (h: Omit<Hole, 'id'> & { id?: string }) => void
  deleteHole: (id: string) => void
}
const FinanceContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_finance_v4'

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  // Merge over `initial()` (not replace) so people upgrading from an older
  // saved version (no `holes` key yet) don't crash on a missing field.
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(s => ({ ...initial(), ...JSON.parse(raw) })) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const setRigRate: Ctx['setRigRate'] = r => setState(s => {
    const existing = s.rigRates.find(x => x.rig === r.rig && x.project === r.project && x.month === r.month)
    if (existing) return { ...s, rigRates: s.rigRates.map(x => x.id === existing.id ? { ...r, id: existing.id } : x) }
    return { ...s, rigRates: [{ ...r, id: uid('rr') }, ...s.rigRates] }
  })
  const setClientRate: Ctx['setClientRate'] = (project, rate) => setState(s => ({ ...s, clientRates: { ...s.clientRates, [project]: rate } }))

  const setHole: Ctx['setHole'] = h => setState(s => {
    if (h.id) return { ...s, holes: s.holes.map(x => x.id === h.id ? ({ ...h, id: h.id } as Hole) : x) }
    return { ...s, holes: [{ ...h, id: uid('hole') } as Hole, ...s.holes] }
  })
  const deleteHole: Ctx['deleteHole'] = id => setState(s => ({ ...s, holes: s.holes.filter(h => h.id !== id) }))

  return <FinanceContext.Provider value={{ state, setRigRate, setClientRate, setHole, deleteHole }}>{children}</FinanceContext.Provider>
}
export function useFinance() { const c = useContext(FinanceContext); if (!c) throw new Error('useFinance must be used inside FinanceProvider'); return c }

// ── CALCULATIONS ─────────────────────────────────────────────────────────

// Fixed cost = capacity you're committed to paying regardless of output
// (rig rental/depreciation + labour). Variable cost = everything that
// scales with actually running the job (fuel, maintenance, mobilisation/
// demobilisation, parts). `total` is unchanged — still the sum of everything.
export interface CostBreakdown { rigCost: number; labour: number; fuel: number; maintenance: number; mobDemob: number; parts: number; fixedCost: number; variableCost: number; total: number; cpm: number }
export function costBreakdown(ops: OperationalRecord, rates: RigRateInputs, inventoryPOs: PurchaseOrder[]): CostBreakdown {
  const days = totalDaysOperated(ops)
  const rigCost = rates.rigDayRate * days
  const labour = rates.labourPerDay * days
  const fuel = ops.fuelLitresPerDay * days * rates.fuelPricePerLitre
  const maintenance = ops.maintenanceCost
  const mobDemob = rates.mobilisation + rates.demobilisation
  const parts = inventoryPOs.filter(po => po.rig === ops.rig && po.project === ops.project).reduce((s, po) => s + poReceivedValue(po), 0)
  const fixedCost = rigCost + labour
  const variableCost = fuel + maintenance + mobDemob + parts
  const total = fixedCost + variableCost
  const cpm = ops.metersDrilled > 0 ? total / ops.metersDrilled : 0
  return { rigCost, labour, fuel, maintenance, mobDemob, parts, fixedCost, variableCost, total, cpm }
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

// Formation surcharge for one hole: meters in each formation × that
// formation's contract rate, ADDED on top of band-tier revenue (per the
// client's own billing rule: formation and band rates are additive).
// A formation name on the hole that has no matching rate on the contract
// contributes ₹0 and is reported back via `unmatchedFormations` so the UI
// can flag it — never silently guessed.
export function formationRevenueForHole(hole: Hole, rate: ClientRate): number {
  return hole.metersByFormation.reduce((sum, mf) => {
    const fr = rate.formationRates.find(f => f.formation.trim().toLowerCase() === mf.formation.trim().toLowerCase())
    return sum + mf.meters * (fr?.ratePerMeter ?? 0)
  }, 0)
}
export function unmatchedFormations(hole: Hole, rate: ClientRate): string[] {
  return hole.metersByFormation
    .filter(mf => !rate.formationRates.some(f => f.formation.trim().toLowerCase() === mf.formation.trim().toLowerCase()))
    .map(mf => mf.formation)
}

// Per-hole revenue = band-tier revenue (tiered on that hole's own total
// meters, same math as before) + formation surcharge. Standby is billed at
// the project level (it isn't tied to a specific hole), so it's excluded
// here and added once at the project level instead.
export interface HoleRevenueResult { hole: Hole; totalMeters: number; bandRevenue: number; formationRevenue: number; total: number; unmatched: string[] }
export function holeRevenue(hole: Hole, rate: ClientRate): HoleRevenueResult {
  const totalMeters = holeTotalMeters(hole)
  if (rate.contractType !== 'meterage') return { hole, totalMeters, bandRevenue: 0, formationRevenue: 0, total: 0, unmatched: [] }
  const bandRevenue = calcClientRevenue(rate, { meters: totalMeters })
  const formationRevenue = formationRevenueForHole(hole, rate)
  return { hole, totalMeters, bandRevenue, formationRevenue, total: bandRevenue + formationRevenue, unmatched: unmatchedFormations(hole, rate) }
}

export function holesForProjectMonth(holes: Hole[], project: string, month: string): Hole[] {
  return holes.filter(h => h.project === project && h.month === month)
}

// Project Cost — combines every rig working a project in a given month for
// the COST side (unchanged: bands would double-count Band 1's cheap rate if
// split per rig, so cost stays combined-then-priced as before).
//
// The REVENUE side now comes from holes, once holes exist for that project
// + month — that's the real per-hole billing view. If no holes have been
// entered yet, revenue falls back to the old ops-combined band estimate
// (no formation surcharge, since formation is only ever recorded on a
// hole) so the page still shows a usable number while holes are being
// entered, with `usingHoleFallback: true` so the UI can say so.
export interface RigContribution { rig: string; ops: OperationalRecord; cost: CostBreakdown }
export interface ProjectCostResult {
  project: string; month: string
  contributions: RigContribution[]     // rigs that have rates set
  missingRates: OperationalRecord[]    // rigs operating this month with no rates set yet
  combinedMeters: number; combinedCost: number; projectCPM: number
  hasClientRate: boolean
  holes: HoleRevenueResult[]           // hole-by-hole revenue breakdown, this project+month
  holesRevenue: number                 // sum of hole revenue (meterage only, excludes standby)
  holesMeters: number
  usingHoleFallback: boolean           // true = no holes entered, revenue is an ops-based estimate
  revenue: number; clientRatePerMeter: number
  marginPerMeter: number; totalMargin: number
}
export function projectCostForMonth(project: string, month: string, rigRates: RigRateInputs[], clientRate: ClientRate | undefined, inventoryPOs: PurchaseOrder[], holes: Hole[]): ProjectCostResult {
  const records = operationalRecordsForProjectMonth(project, month)
  const contributions: RigContribution[] = []
  const missingRates: OperationalRecord[] = []
  records.forEach(ops => {
    const rates = rigRates.find(r => r.rig === ops.rig && r.project === project && r.month === month)
    if (rates) contributions.push({ rig: ops.rig, ops, cost: costBreakdown(ops, rates, inventoryPOs) })
    else missingRates.push(ops)
  })
  const combinedMeters = contributions.reduce((s, c) => s + c.ops.metersDrilled, 0)
  const combinedCost = contributions.reduce((s, c) => s + c.cost.total, 0)
  const projectCPM = combinedMeters > 0 ? combinedCost / combinedMeters : 0
  const totalStandbyDays = contributions.reduce((s, c) => s + c.ops.standbyDays, 0)

  const monthHoles = holesForProjectMonth(holes, project, month)
  const holeResults = clientRate ? monthHoles.map(h => holeRevenue(h, clientRate)) : []
  const holesMeters = holeResults.reduce((s, h) => s + h.totalMeters, 0)
  const holesRevenue = holeResults.reduce((s, h) => s + h.total, 0)

  let revenue = 0
  let usingHoleFallback = false
  if (clientRate) {
    if (clientRate.contractType === 'meterage') {
      if (monthHoles.length > 0) {
        revenue = holesRevenue + totalStandbyDays * clientRate.standbyRate
      } else {
        usingHoleFallback = true
        revenue = calcClientRevenue(clientRate, { meters: combinedMeters, standbyDays: totalStandbyDays })
      }
    } else {
      revenue = contributions.reduce((s, c) => s + calcClientRevenue(clientRate, { meters: 0, drillingDays: c.ops.drillingDays, standbyDays: c.ops.standbyDays, repairDays: c.ops.repairDays }), 0)
    }
  }
  const clientRatePerMeter = combinedMeters > 0 ? revenue / combinedMeters : 0
  const marginPerMeter = clientRatePerMeter - projectCPM
  const totalMargin = revenue - combinedCost

  return { project, month, contributions, missingRates, combinedMeters, combinedCost, projectCPM, hasClientRate: !!clientRate, holes: holeResults, holesRevenue, holesMeters, usingHoleFallback, revenue, clientRatePerMeter, marginPerMeter, totalMargin }
}

// Line-item breakdown of a project's revenue for a given month — built from
// the exact same math as projectCostForMonth's revenue figure, so an
// invoice generated from this can never disagree with what's on screen.
// Hole-by-hole (band + formation lines per hole) once holes exist; falls
// back to the old combined-band breakdown when they don't.
export interface RevenueLineItem { label: string; qty: string; rate: string; amount: number }
export function projectRevenueLineItems(result: ProjectCostResult, clientRate: ClientRate): RevenueLineItem[] {
  const items: RevenueLineItem[] = []

  if (clientRate.contractType === 'meterage' && !result.usingHoleFallback && result.holes.length > 0) {
    result.holes.forEach(hr => {
      if (hr.bandRevenue > 0) items.push({ label: `${hr.hole.holeNumber} — Meterage (band)`, qty: `${hr.totalMeters}m`, rate: 'tiered', amount: hr.bandRevenue })
      hr.hole.metersByFormation.forEach(mf => {
        const fr = clientRate.formationRates.find(f => f.formation.trim().toLowerCase() === mf.formation.trim().toLowerCase())
        if (fr && mf.meters > 0) items.push({ label: `${hr.hole.holeNumber} — ${mf.formation} formation`, qty: `${mf.meters}m`, rate: `₹${fr.ratePerMeter}/m`, amount: mf.meters * fr.ratePerMeter })
      })
    })
    const standbyTotal = result.contributions.reduce((s, c) => s + c.ops.standbyDays, 0)
    if (standbyTotal > 0) items.push({ label: 'Standby Days', qty: `${standbyTotal} days`, rate: `₹${clientRate.standbyRate}/day`, amount: standbyTotal * clientRate.standbyRate })
    return items
  }

  const meters = result.combinedMeters
  if (clientRate.contractType === 'meterage') {
    const b1 = Math.min(meters, clientRate.band1To)
    if (b1 > 0) items.push({ label: `Meterage Band 1 (0–${clientRate.band1To}m)`, qty: `${b1}m`, rate: `₹${clientRate.band1Rate}/m`, amount: b1 * clientRate.band1Rate })
    if (meters > clientRate.band1To) {
      const b2 = Math.min(meters - clientRate.band1To, clientRate.band2To - clientRate.band1To)
      if (b2 > 0) items.push({ label: `Meterage Band 2 (${clientRate.band1To}–${clientRate.band2To}m)`, qty: `${b2}m`, rate: `₹${clientRate.band2Rate}/m`, amount: b2 * clientRate.band2Rate })
    }
    if (meters > clientRate.band2To) {
      const b3 = meters - clientRate.band2To
      if (b3 > 0) items.push({ label: `Meterage Band 3 (beyond ${clientRate.band2To}m)`, qty: `${b3}m`, rate: `₹${clientRate.band3Rate}/m`, amount: b3 * clientRate.band3Rate })
    }
  } else {
    result.contributions.forEach(c => {
      if (c.ops.drillingDays > 0) items.push({ label: `${c.rig} — Drilling Days`, qty: `${c.ops.drillingDays} days`, rate: `₹${clientRate.drillingDayRate}/day`, amount: c.ops.drillingDays * clientRate.drillingDayRate })
      if (c.ops.standbyDays > 0) items.push({ label: `${c.rig} — Standby Days`, qty: `${c.ops.standbyDays} days`, rate: `₹${clientRate.standbyDayRate}/day`, amount: c.ops.standbyDays * clientRate.standbyDayRate })
      if (c.ops.repairDays > 0) items.push({ label: `${c.rig} — Repair Days`, qty: `${c.ops.repairDays} days`, rate: `₹${clientRate.repairDayRate}/day`, amount: c.ops.repairDays * clientRate.repairDayRate })
    })
  }
  return items
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
    { href: '/admin/finance/project-cost', label: 'Project Cost' },
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
