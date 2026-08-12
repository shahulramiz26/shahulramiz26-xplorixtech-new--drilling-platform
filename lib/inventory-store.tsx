'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { Check, Clock, FileText, Star } from 'lucide-react'

// ── TYPES ──────────────────────────────────────────────────────────────────
// Project/Rig assignment (creating projects, assigning rigs, closing a
// project to free its rigs) is managed elsewhere — this module only reads
// the current project → rig list.
export interface Project { id: string; name: string; rigs: string[] }

// A line item is entered manually every time — no shared catalogue lookup.
export interface LineItem { partNumber: string; name: string; category: string; manufacturer: string; unit: string; unitCost: number; qty: number }

export type POStatus = 'Draft' | 'Ordered' | 'Received'
export interface POItem extends LineItem { qtyReceived: number }
export interface PurchaseOrder {
  id: string; poNumber: string; supplierId: string; project: string; rig: string
  orderDate: string; status: POStatus; items: POItem[]
  receivedBy?: string; receivedDate?: string; onTime?: boolean; quality?: 'ok' | 'minor' | 'rejected'
}

export type SupplierStatus = 'Active' | 'Inactive'
export interface Supplier { id: string; name: string; category: string; phone: string; status: SupplierStatus }

// ── SAMPLE DATA ──────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  { id: 'proj1', name: 'Site A - North Field', rigs: ['Rig A1', 'Rig A2'] },
  { id: 'proj2', name: 'Site B - South Ridge', rigs: ['Rig B1'] },
  { id: 'proj3', name: 'Site C - East Basin',  rigs: ['Rig C1', 'Rig C2'] },
]

// Only used as a starting point for the Supplier "category" dropdown's preset list —
// admin can always type a custom one via "Other".
export const CATEGORIES = ['Drill Bits', 'Core Barrel', 'Fluids & Chemicals', 'Filtration', 'Hydraulics', 'Consumables']

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Apex Drilling Supplies', category: 'Drill Bits',         phone: '+1 555 0110', status: 'Active' },
  { id: 'sup2', name: 'Northline Equipment',    category: 'Core Barrel',        phone: '+1 555 0122', status: 'Active' },
  { id: 'sup3', name: 'Summit Fluids Co',       category: 'Fluids & Chemicals', phone: '+1 555 0134', status: 'Active' },
  { id: 'sup4', name: 'Ironclad Parts Ltd',     category: 'Hydraulics',         phone: '+1 555 0146', status: 'Active' },
  { id: 'sup5', name: 'Filtermax Inc',          category: 'Filtration',         phone: '+1 555 0158', status: 'Active' },
]

export const SEED_POS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-1001', supplierId: 'sup1', project: 'Site A - North Field', rig: 'Rig A1', orderDate: '2026-07-15', status: 'Received', receivedBy: 'D. Singh', receivedDate: '2026-07-18', onTime: true, quality: 'ok',
    items: [{ partNumber: 'NX-DB-01', name: 'NX Drill Bit', category: 'Drill Bits', manufacturer: 'Apex Drilling Supplies', unit: 'Each', unitCost: 12000, qty: 5, qtyReceived: 5 }] },
  { id: 'po2', poNumber: 'PO-1002', supplierId: 'sup3', project: 'Site B - South Ridge', rig: 'Rig B1', orderDate: '2026-07-20', status: 'Ordered',
    items: [{ partNumber: 'FL-MM-01', name: 'Drilling Mud Mix', category: 'Fluids & Chemicals', manufacturer: 'Summit Fluids Co', unit: 'Bucket', unitCost: 8200, qty: 10, qtyReceived: 0 }] },
  { id: 'po3', poNumber: 'PO-1003', supplierId: 'sup5', project: 'Site C - East Basin', rig: 'Rig C1', orderDate: '2026-07-22', status: 'Draft',
    items: [{ partNumber: 'FT-FW-01', name: 'Fuel Water Separator', category: 'Filtration', manufacturer: 'Filtermax Inc', unit: 'Each', unitCost: 1950, qty: 12, qtyReceived: 0 }] },
  { id: 'po4', poNumber: 'PO-1004', supplierId: 'sup2', project: 'Site A - North Field', rig: 'Rig A2', orderDate: '2026-07-10', status: 'Received', receivedBy: 'D. Singh', receivedDate: '2026-07-12', onTime: false, quality: 'ok',
    items: [{ partNumber: 'CB-RS-01', name: 'Reaming Shell', category: 'Core Barrel', manufacturer: 'Northline Equipment', unit: 'Each', unitCost: 9800, qty: 4, qtyReceived: 4 }] },
  { id: 'po5', poNumber: 'PO-1005', supplierId: 'sup1', project: 'Site B - South Ridge', rig: 'Rig B1', orderDate: '2026-06-28', status: 'Received', receivedBy: 'M. Alvarez', receivedDate: '2026-06-30', onTime: true, quality: 'minor',
    items: [{ partNumber: 'NX-DB-01', name: 'NX Drill Bit', category: 'Drill Bits', manufacturer: 'Apex Drilling Supplies', unit: 'Each', unitCost: 12000, qty: 3, qtyReceived: 3 }] },
]

// ── STORE ──────────────────────────────────────────────────────────────────
interface State {
  projects: Project[]; suppliers: Supplier[]; purchaseOrders: PurchaseOrder[]
}
function initial(): State {
  return { projects: PROJECTS, suppliers: SUPPLIERS, purchaseOrders: SEED_POS }
}
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
const today = () => new Date().toISOString().split('T')[0]

interface Ctx {
  state: State
  createPO: (po: { supplierId: string; project: string; rig: string; orderDate: string; items: LineItem[] }, status: 'Draft' | 'Ordered') => void
  placeOrder: (poId: string) => void
  receivePO: (poId: string, receivedBy: string, onTime: boolean, quality: 'ok' | 'minor' | 'rejected') => void
  addSupplier: (s: Omit<Supplier, 'id'>) => void
}
const InventoryContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_inventory_v4'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const createPO: Ctx['createPO'] = (po, status) => {
    const poNumber = `PO-${1000 + state.purchaseOrders.length + 1}`
    setState(s => ({ ...s, purchaseOrders: [{ ...po, id: uid('po'), poNumber, status, items: po.items.map(i => ({ ...i, qtyReceived: 0 })) }, ...s.purchaseOrders] }))
  }

  const placeOrder: Ctx['placeOrder'] = poId => setState(s => ({ ...s, purchaseOrders: s.purchaseOrders.map(p => p.id === poId && p.status === 'Draft' ? { ...p, status: 'Ordered' } : p) }))

  const receivePO: Ctx['receivePO'] = (poId, receivedBy, onTime, quality) => {
    setState(s => ({
      ...s,
      purchaseOrders: s.purchaseOrders.map(po => po.id === poId
        ? { ...po, status: 'Received', receivedBy, receivedDate: today(), onTime, quality, items: po.items.map(it => ({ ...it, qtyReceived: it.qty })) }
        : po),
    }))
  }

  const addSupplier: Ctx['addSupplier'] = s => setState(st => ({ ...st, suppliers: [...st.suppliers, { ...s, id: uid('sup') }] }))

  return <InventoryContext.Provider value={{ state, createPO, placeOrder, receivePO, addSupplier }}>{children}</InventoryContext.Provider>
}
export function useInventory() { const c = useContext(InventoryContext); if (!c) throw new Error('useInventory must be used inside InventoryProvider'); return c }

// ── SELECTORS ────────────────────────────────────────────────────────────
export function poOrderedValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qty * i.unitCost, 0) }
export function poReceivedValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qtyReceived * i.unitCost, 0) }

export function supplierPerf(state: State, supplierId: string) {
  const received = state.purchaseOrders.filter(po => po.supplierId === supplierId && po.status === 'Received')
  const poCount = state.purchaseOrders.filter(po => po.supplierId === supplierId).length
  const spend = state.purchaseOrders.filter(po => po.supplierId === supplierId).reduce((s, po) => s + poReceivedValue(po), 0)
  if (received.length === 0) return { onTimeRate: 0, qualityScore: 100, stars: 0, spend, poCount }
  const onTimeRate = Math.round((received.filter(p => p.onTime).length / received.length) * 100)
  const issues = received.filter(p => p.quality && p.quality !== 'ok').length
  const qualityScore = Math.round(((received.length - issues) / received.length) * 100)
  const score = onTimeRate * 0.5 + qualityScore * 0.5
  const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1
  return { onTimeRate, qualityScore, stars, spend, poCount }
}

// Rigs are the primary entity on the dashboard now. A rig's list comes from
// whatever project(s) it's currently assigned to (managed elsewhere) — this
// just collects every rig name that exists, plus any referenced by a PO.
export function allRigs(state: State): string[] {
  const set = new Set<string>()
  state.projects.forEach(p => p.rigs.forEach(r => set.add(r)))
  state.purchaseOrders.forEach(po => { if (po.rig) set.add(po.rig) })
  return Array.from(set)
}
export function rigTotalSpend(state: State, rig: string) {
  return state.purchaseOrders.filter(po => po.rig === rig).reduce((s, po) => s + poReceivedValue(po), 0)
}
export function rigOutstanding(state: State, rig: string) {
  return state.purchaseOrders.filter(po => po.rig === rig).reduce((s, po) => s + (poOrderedValue(po) - poReceivedValue(po)), 0)
}
// A rig can carry history across more than one project over its lifetime
// (it moves on once a project closes) — this breaks its spend down by
// every project it's ever been on, not just the one it's on right now.
export function rigSpendByProject(state: State, rig: string) {
  const pos = state.purchaseOrders.filter(po => po.rig === rig)
  const byProject: Record<string, number> = {}
  pos.forEach(po => { byProject[po.project] = (byProject[po.project] || 0) + poReceivedValue(po) })
  return Object.entries(byProject).map(([project, spend]) => ({ project, spend })).sort((a, b) => b.spend - a.spend)
}

// Which parts get ordered most, and what they cost in total — across every
// purchase order, regardless of supplier, project, or rig. Grouped by part
// number (falls back to name if part number wasn't entered).
export interface PartOrderStat { key: string; partNumber: string; name: string; category: string; manufacturer: string; unit: string; totalQty: number; totalSpent: number; timesOrdered: number; avgUnitCost: number }
export function partOrderStats(state: State): PartOrderStat[] {
  const map: Record<string, PartOrderStat> = {}
  state.purchaseOrders.forEach(po => po.items.forEach(it => {
    const key = (it.partNumber || it.name).trim().toLowerCase()
    if (!key) return
    if (!map[key]) map[key] = { key, partNumber: it.partNumber, name: it.name, category: it.category, manufacturer: it.manufacturer, unit: it.unit, totalQty: 0, totalSpent: 0, timesOrdered: 0, avgUnitCost: 0 }
    map[key].totalQty += it.qty
    map[key].totalSpent += it.qty * it.unitCost
    map[key].timesOrdered += 1
  }))
  return Object.values(map).map(p => ({ ...p, avgUnitCost: p.totalQty > 0 ? p.totalSpent / p.totalQty : 0 })).sort((a, b) => b.totalSpent - a.totalSpent)
}

// ── SHARED UI ────────────────────────────────────────────────────────────
export const subNav = [
  { href: '/admin/inventory', label: 'Dashboard' },
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
  'Received': { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)', icon: <Check size={11} /> },
}
export function Badge({ text, c }: { text: string; c: { color: string; bg: string; border: string; icon?: React.ReactNode } }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{c.icon} {text}</span>
}
export function money(n: number) { return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}` }

export function PartDetailCard({ item }: { item: LineItem }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 11 }}>
      <div><span style={{ color: '#64748B' }}>Part No: </span><span style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>{item.partNumber || '—'}</span></div>
      <div><span style={{ color: '#64748B' }}>Name: </span><span style={{ color: '#F8FAFC' }}>{item.name || '—'}</span></div>
      <div><span style={{ color: '#64748B' }}>Category: </span><span style={{ color: '#F8FAFC' }}>{item.category || '—'}</span></div>
      <div><span style={{ color: '#64748B' }}>Manufacturer: </span><span style={{ color: '#F8FAFC' }}>{item.manufacturer || '—'}</span></div>
      <div><span style={{ color: '#64748B' }}>Unit: </span><span style={{ color: '#F8FAFC' }}>{item.unit || '—'}</span></div>
      <div><span style={{ color: '#64748B' }}>Unit Cost: </span><span style={{ color: '#10B981', fontWeight: 700 }}>{money(item.unitCost)}</span></div>
    </div>
  )
}

// Manual entry form for a single part line — used by Purchase Orders so
// there's one place that defines "how a part gets typed in."
export function ManualPartEntry({ onAdd }: { onAdd: (item: LineItem) => void }) {
  const [partNumber, setPartNumber] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [unit, setUnit] = useState('Each')
  const [unitCost, setUnitCost] = useState<number>(0)
  const [qty, setQty] = useState<number>(1)
  const [err, setErr] = useState('')

  const add = () => {
    if (!name.trim()) { setErr('Enter a part name'); return }
    if (qty < 1) { setErr('Quantity must be at least 1'); return }
    onAdd({ partNumber: partNumber.trim(), name: name.trim(), category: category.trim(), manufacturer: manufacturer.trim(), unit: unit.trim() || 'Each', unitCost, qty })
    setPartNumber(''); setName(''); setCategory(''); setManufacturer(''); setUnit('Each'); setUnitCost(0); setQty(1); setErr('')
  }

  return (
    <div style={{ border: '1px solid #1E293B', borderRadius: 10, padding: 14, background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Part Number</div><input value={partNumber} onChange={e => setPartNumber(e.target.value)} style={inputStyle} placeholder="e.g. NX-DB-01" /></div>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Part Name *</div><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. NX Drill Bit" /></div>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Category</div><input value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} placeholder="e.g. Drill Bits" /></div>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Manufacturer</div><input value={manufacturer} onChange={e => setManufacturer(e.target.value)} style={inputStyle} placeholder="e.g. Apex Drilling Supplies" /></div>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Unit</div><input value={unit} onChange={e => setUnit(e.target.value)} style={inputStyle} placeholder="Each / Kg / Bucket..." /></div>
        <div><div style={{ ...S.label, marginBottom: 4 }}>Unit Cost</div><input type="number" min={0} value={unitCost} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}><div style={{ ...S.label, marginBottom: 4 }}>Quantity</div><input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={inputStyle} /></div>
        <button onClick={add} style={{ marginTop: 18, padding: '9px 20px', borderRadius: 8, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316', fontWeight: 700, cursor: 'pointer' }}>+ Add Part</button>
      </div>
      {err && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 8 }}>{err}</div>}
    </div>
  )
}

