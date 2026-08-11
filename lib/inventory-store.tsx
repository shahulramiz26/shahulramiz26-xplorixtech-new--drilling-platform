'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { Check, Clock, Truck, FileText, X, Star } from 'lucide-react'

// ── TYPES ──────────────────────────────────────────────────────────────────
export interface Part { id: string; name: string; category: string; unit: string; unitCost: number; reorderLevel: number }
export interface Project { id: string; name: string; rigs: string[] }

export type ReqStatus = 'Pending' | 'Approved' | 'Rejected' | 'Converted'
export interface ReqItem { partId: string; name: string; qty: number; unit: string }
export interface PartRequest {
  id: string; requestedBy: string; project: string; rig: string
  items: ReqItem[]; urgency: 'Normal' | 'Urgent' | 'Critical'; reason: string
  date: string; status: ReqStatus; poId?: string
}

export interface Transfer { id: string; from: string; to: string; items: ReqItem[]; by: string; reason: string; date: string }

export type POStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received'
export interface POItem { partId: string; name: string; qty: number; unitCost: number; unit: string; qtyReceived: number }
export interface PurchaseOrder {
  id: string; poNumber: string; supplierId: string; project: string
  orderDate: string; status: POStatus; items: POItem[]
  receivedBy?: string; receivedDate?: string; onTime?: boolean; quality?: 'ok' | 'minor' | 'rejected'
}

export type SupplierStatus = 'Active' | 'Inactive'
export interface Supplier { id: string; name: string; category: string; phone: string; status: SupplierStatus }

export interface Movement { id: string; date: string; type: 'in' | 'out' | 'transfer'; part: string; qty: number; project: string; note: string; value: number }

// ── SAMPLE DATA (fresh, generic — not any customer's real data) ────────────
export const PROJECTS: Project[] = [
  { id: 'proj1', name: 'Site A - North Field',  rigs: ['R1', 'R2'] },
  { id: 'proj2', name: 'Site B - South Ridge',  rigs: ['R3'] },
  { id: 'proj3', name: 'Site C - East Basin',   rigs: ['R4', 'R5'] },
]

export const CATEGORIES = ['Drill Bits', 'Core Barrel', 'Fluids & Chemicals', 'Filtration', 'Hydraulics', 'Consumables']

export const PARTS: Part[] = [
  { id: 'p1', name: 'NX Drill Bit',        category: 'Drill Bits',         unit: 'Each',   unitCost: 12000, reorderLevel: 6 },
  { id: 'p2', name: 'HX Drill Bit',        category: 'Drill Bits',         unit: 'Each',   unitCost: 18500, reorderLevel: 5 },
  { id: 'p3', name: 'Core Lifter',         category: 'Core Barrel',        unit: 'Each',   unitCost: 550,   reorderLevel: 15 },
  { id: 'p4', name: 'Reaming Shell',       category: 'Core Barrel',        unit: 'Each',   unitCost: 9800,  reorderLevel: 4 },
  { id: 'p5', name: 'Drilling Mud Mix',    category: 'Fluids & Chemicals', unit: 'Bucket', unitCost: 8200,  reorderLevel: 10 },
  { id: 'p6', name: 'Polymer Additive',    category: 'Fluids & Chemicals', unit: 'Kg',     unitCost: 3100,  reorderLevel: 12 },
  { id: 'p7', name: 'Air Filter',          category: 'Filtration',         unit: 'Each',   unitCost: 2600,  reorderLevel: 6 },
  { id: 'p8', name: 'Fuel Water Separator',category: 'Filtration',         unit: 'Each',   unitCost: 1950,  reorderLevel: 8 },
  { id: 'p9', name: 'Hydraulic Hose 1"',   category: 'Hydraulics',         unit: 'Each',   unitCost: 4200,  reorderLevel: 4 },
  { id: 'p10',name: 'Grease Cartridge',    category: 'Consumables',        unit: 'Each',   unitCost: 480,   reorderLevel: 20 },
]

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Apex Drilling Supplies', category: 'Drill Bits',         phone: '+1 555 0110', status: 'Active' },
  { id: 'sup2', name: 'Northline Equipment',    category: 'Core Barrel',        phone: '+1 555 0122', status: 'Active' },
  { id: 'sup3', name: 'Summit Fluids Co',       category: 'Fluids & Chemicals', phone: '+1 555 0134', status: 'Active' },
  { id: 'sup4', name: 'Ironclad Parts Ltd',     category: 'Hydraulics',         phone: '+1 555 0146', status: 'Active' },
  { id: 'sup5', name: 'Filtermax Inc',          category: 'Filtration',         phone: '+1 555 0158', status: 'Active' },
]

export const SEED_REQUESTS: PartRequest[] = [
  { id: 'r1', requestedBy: 'J. Carter', project: 'Site A - North Field', rig: 'R1', items: [{ partId: 'p1', name: 'NX Drill Bit', qty: 3, unit: 'Each' }], urgency: 'Urgent', reason: 'Bit worn past spec', date: '2026-08-01', status: 'Pending' },
  { id: 'r2', requestedBy: 'M. Alvarez', project: 'Site B - South Ridge', rig: 'R3', items: [{ partId: 'p7', name: 'Air Filter', qty: 6, unit: 'Each' }], urgency: 'Normal', reason: 'Scheduled service', date: '2026-08-03', status: 'Approved' },
]

export const SEED_TRANSFERS: Transfer[] = [
  { id: 't1', from: 'Site A - North Field', to: 'Site C - East Basin', items: [{ partId: 'p5', name: 'Drilling Mud Mix', qty: 4, unit: 'Bucket' }], by: 'D. Singh', reason: 'Rebalancing stock', date: '2026-07-28' },
]

export const SEED_POS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-1001', supplierId: 'sup1', project: 'Site A - North Field', orderDate: '2026-07-15', status: 'Received', receivedBy: 'D. Singh', receivedDate: '2026-07-18', onTime: true, quality: 'ok',
    items: [{ partId: 'p1', name: 'NX Drill Bit', qty: 5, unitCost: 12000, unit: 'Each', qtyReceived: 5 }] },
  { id: 'po2', poNumber: 'PO-1002', supplierId: 'sup3', project: 'Site B - South Ridge', orderDate: '2026-07-20', status: 'Ordered',
    items: [{ partId: 'p5', name: 'Drilling Mud Mix', qty: 10, unitCost: 8200, unit: 'Bucket', qtyReceived: 0 }] },
  { id: 'po3', poNumber: 'PO-1003', supplierId: 'sup5', project: 'Site C - East Basin', orderDate: '2026-07-22', status: 'Partially Received',
    items: [{ partId: 'p8', name: 'Fuel Water Separator', qty: 12, unitCost: 1950, unit: 'Each', qtyReceived: 6 }] },
]

export const SEED_MOVEMENTS: Movement[] = [
  { id: 'm1', date: '2026-07-18', type: 'in', part: 'NX Drill Bit', qty: 5, project: 'Site A - North Field', note: 'PO-1001 received', value: 60000 },
  { id: 'm2', date: '2026-07-28', type: 'transfer', part: 'Drilling Mud Mix', qty: 4, project: 'Site C - East Basin', note: 'From Site A', value: 32800 },
]

export const INITIAL_STOCK: Record<string, Record<string, number>> = {
  'Site A - North Field': { p1: 4, p3: 20, p5: 6, p7: 3 },
  'Site B - South Ridge': { p2: 5, p5: 9, p9: 2 },
  'Site C - East Basin':  { p4: 3, p5: 4, p8: 6, p10: 25 },
}

// ── STORE ──────────────────────────────────────────────────────────────────
interface State {
  parts: Part[]; projects: Project[]; suppliers: Supplier[]
  requests: PartRequest[]; transfers: Transfer[]; purchaseOrders: PurchaseOrder[]
  movements: Movement[]; stock: Record<string, Record<string, number>>
}
function initial(): State {
  return { parts: PARTS, projects: PROJECTS, suppliers: SUPPLIERS, requests: SEED_REQUESTS, transfers: SEED_TRANSFERS, purchaseOrders: SEED_POS, movements: SEED_MOVEMENTS, stock: INITIAL_STOCK }
}
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
const today = () => new Date().toISOString().split('T')[0]

interface Ctx {
  state: State
  createRequest: (r: Omit<PartRequest, 'id' | 'status' | 'date'>) => void
  setRequestStatus: (id: string, status: ReqStatus) => void
  convertToPO: (requestId: string, supplierId: string) => void
  createTransfer: (t: Omit<Transfer, 'id' | 'date'>) => void
  createPO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status' | 'items'> & { items: Omit<POItem, 'qtyReceived'>[] }, status: 'Draft' | 'Ordered') => void
  receivePO: (poId: string, receivedBy: string, onTime: boolean, quality: 'ok' | 'minor' | 'rejected') => void
  addSupplier: (s: Omit<Supplier, 'id'>) => void
}
const InventoryContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_inventory'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const adjustStock = (project: string, partId: string, delta: number) =>
    setState(s => { const p = { ...(s.stock[project] || {}) }; p[partId] = Math.max(0, (p[partId] || 0) + delta); return { ...s, stock: { ...s.stock, [project]: p } } })

  const addMovement = (m: Omit<Movement, 'id'>) => setState(s => ({ ...s, movements: [{ ...m, id: uid('mv') }, ...s.movements] }))

  const createRequest: Ctx['createRequest'] = r => setState(s => ({ ...s, requests: [{ ...r, id: uid('req'), status: 'Pending', date: today() }, ...s.requests] }))
  const setRequestStatus: Ctx['setRequestStatus'] = (id, status) => setState(s => ({ ...s, requests: s.requests.map(r => r.id === id ? { ...r, status } : r) }))

  const convertToPO: Ctx['convertToPO'] = (requestId, supplierId) => {
    setState(s => {
      const req = s.requests.find(r => r.id === requestId); if (!req) return s
      const poNumber = `PO-${1000 + s.purchaseOrders.length + 1}`
      const po: PurchaseOrder = { id: uid('po'), poNumber, supplierId, project: req.project, orderDate: today(), status: 'Draft', items: req.items.map(it => ({ partId: it.partId, name: it.name, qty: it.qty, unit: it.unit, unitCost: s.parts.find(p => p.id === it.partId)?.unitCost || 0, qtyReceived: 0 })) }
      return { ...s, purchaseOrders: [po, ...s.purchaseOrders], requests: s.requests.map(r => r.id === requestId ? { ...r, status: 'Converted', poId: po.id } : r) }
    })
  }

  const createTransfer: Ctx['createTransfer'] = t => {
    setState(s => ({ ...s, transfers: [{ ...t, id: uid('tr'), date: today() }, ...s.transfers] }))
    t.items.forEach(it => {
      adjustStock(t.from, it.partId, -it.qty)
      adjustStock(t.to, it.partId, it.qty)
      const part = state.parts.find(p => p.id === it.partId)
      addMovement({ date: today(), type: 'transfer', part: it.name, qty: it.qty, project: t.to, note: `From ${t.from.split(' - ')[0]}`, value: (part?.unitCost || 0) * it.qty })
    })
  }

  const createPO: Ctx['createPO'] = (po, status) => {
    const poNumber = `PO-${1000 + state.purchaseOrders.length + 1}`
    setState(s => ({ ...s, purchaseOrders: [{ ...po, id: uid('po'), poNumber, status, items: po.items.map(i => ({ ...i, qtyReceived: 0 })) }, ...s.purchaseOrders] }))
  }

  const receivePO: Ctx['receivePO'] = (poId, receivedBy, onTime, quality) => {
    setState(s => ({ ...s, purchaseOrders: s.purchaseOrders.map(p => p.id === poId ? { ...p, status: 'Received', receivedBy, receivedDate: today(), onTime, quality, items: p.items.map(i => ({ ...i, qtyReceived: i.qty })) } : p) }))
    const po = state.purchaseOrders.find(p => p.id === poId); if (!po) return
    po.items.forEach(it => {
      adjustStock(po.project, it.partId, it.qty)
      addMovement({ date: today(), type: 'in', part: it.name, qty: it.qty, project: po.project, note: `${po.poNumber} received`, value: it.qty * it.unitCost })
    })
  }

  const addSupplier: Ctx['addSupplier'] = s => setState(st => ({ ...st, suppliers: [...st.suppliers, { ...s, id: uid('sup') }] }))

  return <InventoryContext.Provider value={{ state, createRequest, setRequestStatus, convertToPO, createTransfer, createPO, receivePO, addSupplier }}>{children}</InventoryContext.Provider>
}
export function useInventory() { const c = useContext(InventoryContext); if (!c) throw new Error('useInventory must be used inside InventoryProvider'); return c }

// ── SELECTORS ────────────────────────────────────────────────────────────
export function poValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qty * i.unitCost, 0) }
export function poReceivedValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qtyReceived * i.unitCost, 0) }
export function stockFor(state: State, project: string) { const l = state.stock[project] || {}; return state.parts.map(p => ({ part: p, qty: l[p.id] || 0 })) }
export function supplierPerf(state: State, supplierId: string) {
  const received = state.purchaseOrders.filter(po => po.supplierId === supplierId && po.status === 'Received')
  const poCount = state.purchaseOrders.filter(po => po.supplierId === supplierId).length
  if (received.length === 0) return { onTimeRate: 0, qualityScore: 100, stars: 0, spend: 0, poCount }
  const onTimeRate = Math.round((received.filter(p => p.onTime).length / received.length) * 100)
  const issues = received.filter(p => p.quality && p.quality !== 'ok').length
  const qualityScore = Math.round(((received.length - issues) / received.length) * 100)
  const spend = received.reduce((s, po) => s + poReceivedValue(po), 0)
  const score = onTimeRate * 0.5 + qualityScore * 0.5
  const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1
  return { onTimeRate, qualityScore, stars, spend, poCount }
}

// ── SHARED UI ────────────────────────────────────────────────────────────
export const subNav = [
  { href: '/admin/inventory', label: 'Dashboard' },
  { href: '/admin/inventory/requests', label: 'Requests & Transfers' },
  { href: '/admin/inventory/purchase-orders', label: 'Purchase Orders' },
  { href: '/admin/inventory/suppliers', label: 'Suppliers' },
]
export function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#080B10', border: '1px solid #1E293B', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', background: active === n.label ? '#F97316' : 'transparent', color: active === n.label ? '#fff' : '#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}
export const S = { card: { background: '#0D1117', border: '1px solid #1E293B', borderRadius: 16 } as React.CSSProperties, label: { fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' as const } }
export const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: '#080B10', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', fontSize: 13, outline: 'none', fontFamily: 'inherit' }
export const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' as any }

export function StarRating({ stars, size = 14 }: { stars: number; size?: number }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={size} style={{ color: i <= stars ? '#F59E0B' : '#1E293B', fill: i <= stars ? '#F59E0B' : 'transparent' }} />)}</div>
}
export const poStatusColor: Record<POStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Draft': { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', icon: <FileText size={11} /> },
  'Ordered': { color: '#60A5FA', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', icon: <Clock size={11} /> },
  'Partially Received': { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', icon: <Truck size={11} /> },
  'Received': { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', icon: <Check size={11} /> },
}
export const reqStatusColor: Record<ReqStatus, { color: string; bg: string; border: string }> = {
  Pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
  Approved: { color: '#60A5FA', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)' },
  Rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
  Converted: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
}
export function Badge({ text, c }: { text: string; c: { color: string; bg: string; border: string; icon?: React.ReactNode } }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{c.icon} {text}</span>
}
export function money(n: number) { return `$${n.toLocaleString()}` }

