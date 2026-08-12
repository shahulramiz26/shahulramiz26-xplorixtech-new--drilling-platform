'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useInventory, poReceivedValue } from './inventory-store'
import type { PurchaseOrder } from './inventory-store'

// ── TYPES ──────────────────────────────────────────────────────────────────
// Deliberately two separate types, not one shared "ContractRate" — a rig's
// own operating cost is not a contract with anyone, only the client billing
// rate is an actual contract.

// Tab 1 — what it actually costs to run a rig on a project, for one period.
export interface RigCostEntry {
  id: string
  rig: string
  project: string
  month: string          // '2026-07'
  daysOperated: number
  metersDrilled: number
  rigDayRate: number         // rig's own rental/depreciation cost, ₹/day
  labourPerDay: number
  fuelLitresPerDay: number
  dieselPrice: number
  maintenancePerMonth: number
  mobilisation: number       // cost TO YOU of moving the rig in, one-time
  demobilisation: number     // cost TO YOU of moving the rig out, one-time
}

// Tab 2 — the actual contract: what you bill the client, per project.
export interface ClientRate {
  project: string
  client: string
  contractType: 'meterage' | 'dayrate'
  band1To: number; band1Rate: number
  band2To: number; band2Rate: number
  band3Rate: number
  standbyRate: number
  drillingDayRate: number; standbyDayRate: number; repairDayRate: number
  mobilisation: number        // amount BILLED to client, one-time
  demobilisation: number
  gst: number; tds: number; retention: number
}

export type InvStatus = 'Draft' | 'Raised' | 'MB Pending' | 'Submitted' | 'Partially Paid' | 'Paid' | 'Overdue'
export interface Invoice {
  id: string; invNumber: string; project: string; client: string; month: string
  meters: number; standbyDays: number; drillingDays: number; repairDays: number
  includeMob: boolean; includeDemob: boolean
  grossAmount: number; gstAmt: number; tdsAmt: number; retentionAmt: number; netReceivable: number
  status: InvStatus; raisedDate: string; dueDate: string; paidAmount: number
}

// ── SAMPLE DATA (same project/rig names as Inventory — one shared identity) ─
export const PROJECT_CLIENTS: Record<string, string> = {
  'Site A - North Field': 'CMPDI',
  'Site B - South Ridge': 'DGML',
  'Site C - East Basin': 'MECL',
}

export const SEED_CLIENT_RATES: Record<string, ClientRate> = {
  'Site A - North Field': {
    project: 'Site A - North Field', client: 'CMPDI', contractType: 'meterage',
    band1To: 200, band1Rate: 850, band2To: 400, band2Rate: 950, band3Rate: 1050,
    standbyRate: 8000, drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    mobilisation: 250000, demobilisation: 150000, gst: 18, tds: 2, retention: 5,
  },
  'Site B - South Ridge': {
    project: 'Site B - South Ridge', client: 'DGML', contractType: 'meterage',
    band1To: 200, band1Rate: 800, band2To: 400, band2Rate: 900, band3Rate: 1000,
    standbyRate: 7000, drillingDayRate: 25000, standbyDayRate: 10000, repairDayRate: 7000,
    mobilisation: 200000, demobilisation: 120000, gst: 18, tds: 2, retention: 5,
  },
  'Site C - East Basin': {
    project: 'Site C - East Basin', client: 'MECL', contractType: 'dayrate',
    band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0,
    standbyRate: 0, drillingDayRate: 28000, standbyDayRate: 12000, repairDayRate: 8000,
    mobilisation: 180000, demobilisation: 100000, gst: 18, tds: 2, retention: 5,
  },
}

export const SEED_RIG_COSTS: RigCostEntry[] = [
  { id: 'rc1', rig: 'Rig A1', project: 'Site A - North Field', month: '2026-07', daysOperated: 26, metersDrilled: 210, rigDayRate: 9000, labourPerDay: 2300, fuelLitresPerDay: 110, dieselPrice: 97, maintenancePerMonth: 18000, mobilisation: 50000, demobilisation: 0 },
  { id: 'rc2', rig: 'Rig A2', project: 'Site A - North Field', month: '2026-07', daysOperated: 24, metersDrilled: 165, rigDayRate: 9000, labourPerDay: 2300, fuelLitresPerDay: 115, dieselPrice: 97, maintenancePerMonth: 22000, mobilisation: 0, demobilisation: 0 },
  { id: 'rc3', rig: 'Rig B1', project: 'Site B - South Ridge', month: '2026-07', daysOperated: 22, metersDrilled: 180, rigDayRate: 8500, labourPerDay: 2300, fuelLitresPerDay: 108, dieselPrice: 97, maintenancePerMonth: 16000, mobilisation: 0, demobilisation: 0 },
  { id: 'rc4', rig: 'Rig C1', project: 'Site C - East Basin', month: '2026-07', daysOperated: 20, metersDrilled: 140, rigDayRate: 9500, labourPerDay: 2500, fuelLitresPerDay: 120, dieselPrice: 97, maintenancePerMonth: 21000, mobilisation: 60000, demobilisation: 0 },
]

export const SEED_INVOICES: Invoice[] = [
  { id: 'inv1', invNumber: 'INV-042', project: 'Site A - North Field', client: 'CMPDI', month: 'Jun 2026', meters: 195, standbyDays: 3, drillingDays: 0, repairDays: 0, includeMob: false, includeDemob: false, grossAmount: 194250, gstAmt: 34965, tdsAmt: 3885, retentionAmt: 9713, netReceivable: 215617, status: 'Overdue', raisedDate: '2026-07-02', dueDate: '2026-08-01', paidAmount: 0 },
  { id: 'inv2', invNumber: 'INV-041', project: 'Site B - South Ridge', client: 'DGML', month: 'Jun 2026', meters: 172, standbyDays: 2, drillingDays: 0, repairDays: 0, includeMob: false, includeDemob: false, grossAmount: 137600, gstAmt: 24768, tdsAmt: 2752, retentionAmt: 6880, netReceivable: 152736, status: 'Paid', raisedDate: '2026-07-01', dueDate: '2026-07-31', paidAmount: 152736 },
]

// ── STORE ──────────────────────────────────────────────────────────────────
interface State { rigCosts: RigCostEntry[]; clientRates: Record<string, ClientRate>; invoices: Invoice[] }
function initial(): State { return { rigCosts: SEED_RIG_COSTS, clientRates: SEED_CLIENT_RATES, invoices: SEED_INVOICES } }
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  addRigCost: (e: Omit<RigCostEntry, 'id'>) => void
  updateRigCost: (id: string, patch: Partial<RigCostEntry>) => void
  deleteRigCost: (id: string) => void
  setClientRate: (project: string, rate: ClientRate) => void
  addInvoice: (inv: Omit<Invoice, 'id' | 'invNumber' | 'raisedDate' | 'status' | 'paidAmount'>) => void
  setInvoiceStatus: (id: string, status: InvStatus) => void
}
const FinanceContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_finance_v1'

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const addRigCost: Ctx['addRigCost'] = e => setState(s => ({ ...s, rigCosts: [{ ...e, id: uid('rc') }, ...s.rigCosts] }))
  const updateRigCost: Ctx['updateRigCost'] = (id, patch) => setState(s => ({ ...s, rigCosts: s.rigCosts.map(r => r.id === id ? { ...r, ...patch } : r) }))
  const deleteRigCost: Ctx['deleteRigCost'] = id => setState(s => ({ ...s, rigCosts: s.rigCosts.filter(r => r.id !== id) }))
  const setClientRate: Ctx['setClientRate'] = (project, rate) => setState(s => ({ ...s, clientRates: { ...s.clientRates, [project]: rate } }))

  const addInvoice: Ctx['addInvoice'] = inv => {
    const invNumber = `INV-${43 + state.invoices.length}`
    setState(s => ({ ...s, invoices: [{ ...inv, id: uid('inv'), invNumber, raisedDate: new Date().toISOString().split('T')[0], status: 'Draft', paidAmount: 0 }, ...s.invoices] }))
  }
  const setInvoiceStatus: Ctx['setInvoiceStatus'] = (id, status) => setState(s => ({ ...s, invoices: s.invoices.map(i => i.id === id ? { ...i, status } : i) }))

  return <FinanceContext.Provider value={{ state, addRigCost, updateRigCost, deleteRigCost, setClientRate, addInvoice, setInvoiceStatus }}>{children}</FinanceContext.Provider>
}
export function useFinance() { const c = useContext(FinanceContext); if (!c) throw new Error('useFinance must be used inside FinanceProvider'); return c }

// ── CALCULATIONS ─────────────────────────────────────────────────────────
// The one and only place CPM gets computed — Dashboard-style duplicate math
// is exactly what caused the old confusion.
export interface CostBreakdown { rigCost: number; labour: number; fuel: number; maintenance: number; mobDemob: number; parts: number; total: number; cpm: number }
export function rigCostBreakdown(entry: RigCostEntry, inventoryPurchaseOrders: PurchaseOrder[]): CostBreakdown {
  const rigCost = entry.rigDayRate * entry.daysOperated
  const labour = entry.labourPerDay * entry.daysOperated
  const fuel = entry.fuelLitresPerDay * entry.daysOperated * entry.dieselPrice
  const maintenance = entry.maintenancePerMonth
  const mobDemob = entry.mobilisation + entry.demobilisation
  const parts = inventoryPurchaseOrders
    .filter(po => po.rig === entry.rig && po.project === entry.project)
    .reduce((s, po) => s + poReceivedValue(po), 0)
  const total = rigCost + labour + fuel + maintenance + mobDemob + parts
  const cpm = entry.metersDrilled > 0 ? total / entry.metersDrilled : 0
  return { rigCost, labour, fuel, maintenance, mobDemob, parts, total, cpm }
}

// Client-side revenue calc — used identically by invoice generation and by
// the Margin tab, so the two can never disagree with each other.
export function calcClientRevenue(rate: ClientRate, opts: { meters: number; standbyDays?: number; drillingDays?: number; repairDays?: number; includeMob?: boolean; includeDemob?: boolean }) {
  const { meters, standbyDays = 0, drillingDays = 0, repairDays = 0, includeMob = false, includeDemob = false } = opts
  let rev = 0
  if (rate.contractType === 'meterage') {
    const b1 = Math.min(meters, rate.band1To)
    rev += b1 * rate.band1Rate
    if (meters > rate.band1To) rev += Math.min(meters - rate.band1To, rate.band2To - rate.band1To) * rate.band2Rate
    if (meters > rate.band2To) rev += (meters - rate.band2To) * rate.band3Rate
    rev += standbyDays * rate.standbyRate
  } else {
    rev += drillingDays * rate.drillingDayRate + standbyDays * rate.standbyDayRate + repairDays * rate.repairDayRate
  }
  if (includeMob) rev += rate.mobilisation
  if (includeDemob) rev += rate.demobilisation
  return rev
}

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

export const STATUS_CONFIG: Record<InvStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Draft': { color: C.muted, bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', icon: <FileText size={11} /> },
  'Raised': { color: C.blue, bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', icon: <FileText size={11} /> },
  'MB Pending': { color: C.amber, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: <Clock size={11} /> },
  'Submitted': { color: C.purple, bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', icon: <FileText size={11} /> },
  'Partially Paid': { color: C.orange, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', icon: <CheckCircle size={11} /> },
  'Paid': { color: C.green, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: <CheckCircle size={11} /> },
  'Overdue': { color: C.red, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: <AlertTriangle size={11} /> },
}
export function cpmColor(cpm: number) { return cpm < 900 ? C.green : cpm < 1100 ? C.amber : C.red }
export function cpmLabel(cpm: number) { return cpm < 900 ? 'Good' : cpm < 1100 ? 'Watch' : 'Alert' }

