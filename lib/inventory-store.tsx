'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Link from 'next/link'
import { Check, Clock, Truck, FileText, Star } from 'lucide-react'

// ── TYPES ──────────────────────────────────────────────────────────────────
export interface Part { id: string; partNumber: string; name: string; category: string; manufacturer: string; unit: string; unitCost: number }
export interface Project { id: string; name: string }

export interface LineItem { partId: string; partNumber: string; name: string; category: string; manufacturer: string; unit: string; unitCost: number; qty: number }
export interface Transfer { id: string; from: string; to: string; by: string; reason: string; date: string; items: LineItem[] }

export type POStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received'
export interface POItem { partId: string; partNumber: string; name: string; category: string; manufacturer: string; unit: string; unitCost: number; qty: number; qtyReceived: number }
export interface PurchaseOrder {
  id: string; poNumber: string; supplierId: string; project: string
  orderDate: string; status: POStatus; items: POItem[]
  receivedBy?: string; receivedDate?: string; onTime?: boolean; quality?: 'ok' | 'minor' | 'rejected'
}

export type SupplierStatus = 'Active' | 'Inactive'
export interface Supplier { id: string; name: string; category: string; phone: string; status: SupplierStatus }

// ── SAMPLE DATA ──────────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  { id: 'proj1', name: 'Site A - North Field' },
  { id: 'proj2', name: 'Site B - South Ridge' },
  { id: 'proj3', name: 'Site C - East Basin' },
]

export const CATEGORIES = ['Drill Bits', 'Core Barrel', 'Fluids & Chemicals', 'Filtration', 'Hydraulics', 'Consumables']

export const PARTS: Part[] = [
  { id: 'p1', partNumber: 'NX-DB-01', name: 'NX Drill Bit',         category: 'Drill Bits',         manufacturer: 'Apex Drilling Supplies', unit: 'Each',   unitCost: 12000 },
  { id: 'p2', partNumber: 'HX-DB-01', name: 'HX Drill Bit',         category: 'Drill Bits',         manufacturer: 'Apex Drilling Supplies', unit: 'Each',   unitCost: 18500 },
  { id: 'p3', partNumber: 'CB-CL-01', name: 'Core Lifter',          category: 'Core Barrel',        manufacturer: 'Northline Equipment',    unit: 'Each',   unitCost: 550   },
  { id: 'p4', partNumber: 'CB-RS-01', name: 'Reaming Shell',        category: 'Core Barrel',        manufacturer: 'Northline Equipment',    unit: 'Each',   unitCost: 9800  },
  { id: 'p5', partNumber: 'FL-MM-01', name: 'Drilling Mud Mix',     category: 'Fluids & Chemicals', manufacturer: 'Summit Fluids Co',       unit: 'Bucket', unitCost: 8200  },
  { id: 'p6', partNumber: 'FL-PA-01', name: 'Polymer Additive',     category: 'Fluids & Chemicals', manufacturer: 'Summit Fluids Co',       unit: 'Kg',     unitCost: 3100  },
  { id: 'p7', partNumber: 'FT-AF-01', name: 'Air Filter',           category: 'Filtration',         manufacturer: 'Filtermax Inc',          unit: 'Each',   unitCost: 2600  },
  { id: 'p8', partNumber: 'FT-FW-01', name: 'Fuel Water Separator', category: 'Filtration',         manufacturer: 'Filtermax Inc',          unit: 'Each',   unitCost: 1950  },
  { id: 'p9', partNumber: 'HY-HH-01', name: 'Hydraulic Hose 1"',    category: 'Hydraulics',         manufacturer: 'Ironclad Parts Ltd',     unit: 'Each',   unitCost: 4200  },
  { id: 'p10',partNumber: 'CN-GR-01', name: 'Grease Cartridge',     category: 'Consumables',        manufacturer: 'Ironclad Parts Ltd',     unit: 'Each',   unitCost: 480   },
]

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Apex Drilling Supplies', category: 'Drill Bits',         phone: '+1 555 0110', status: 'Active' },
  { id: 'sup2', name: 'Northline Equipment',    category: 'Core Barrel',        phone: '+1 555 0122', status: 'Active' },
  { id: 'sup3', name: 'Summit Fluids Co',       category: 'Fluids & Chemicals', phone: '+1 555 0134', status: 'Active' },
  { id: 'sup4', name: 'Ironclad Parts Ltd',     category: 'Hydraulics',         phone: '+1 555 0146', status: 'Active' },
  { id: 'sup5', name: 'Filtermax Inc',          category: 'Filtration',         phone: '+1 555 0158', status: 'Active' },
]

function toLineItem(part: Part, qty: number): LineItem {
  return { partId: part.id, partNumber: part.partNumber, name: part.name, category: part.category, manufacturer: part.manufacturer, unit: part.unit, unitCost: part.unitCost, qty }
}
function toPOItem(part: Part, qty: number, qtyReceived = 0): POItem {
  return { ...toLineItem(part, qty), qtyReceived }
}

export const SEED_TRANSFERS: Transfer[] = [
  { id: 't1', from: 'Site A - North Field', to: 'Site C - East Basin', by: 'D. Singh', reason: 'Rebalancing stock', date: '2026-07-28', items: [toLineItem(PARTS[4], 4)] },
]

export const SEED_POS: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-1001', supplierId: 'sup1', project: 'Site A - North Field', orderDate: '2026-07-15', status: 'Received', receivedBy: 'D. Singh', receivedDate: '2026-07-18', onTime: true, quality: 'ok',
    items: [toPOItem(PARTS[0], 5, 5)] },
  { id: 'po2', poNumber: 'PO-1002', supplierId: 'sup3', project: 'Site B - South Ridge', orderDate: '2026-07-20', status: 'Ordered',
    items: [toPOItem(PARTS[4], 10, 0)] },
  { id: 'po3', poNumber: 'PO-1003', supplierId: 'sup5', project: 'Site C - East Basin', orderDate: '2026-07-22', status: 'Partially Received', receivedBy: 'M. Alvarez', receivedDate: '2026-07-25', onTime: true, quality: 'ok',
    items: [toPOItem(PARTS[7], 12, 6)] },
  { id: 'po4', poNumber: 'PO-1004', supplierId: 'sup2', project: 'Site A - North Field', orderDate: '2026-07-10', status: 'Received', receivedBy: 'D. Singh', receivedDate: '2026-07-12', onTime: false, quality: 'ok',
    items: [toPOItem(PARTS[2], 20, 20)] },
]

// ── STORE ──────────────────────────────────────────────────────────────────
interface State {
  parts: Part[]; projects: Project[]; suppliers: Supplier[]
  transfers: Transfer[]; purchaseOrders: PurchaseOrder[]
}
function initial(): State {
  return { parts: PARTS, projects: PROJECTS, suppliers: SUPPLIERS, transfers: SEED_TRANSFERS, purchaseOrders: SEED_POS }
}
const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
const today = () => new Date().toISOString().split('T')[0]

function computeStatus(items: POItem[]): 'Ordered' | 'Partially Received' | 'Received' {
  const totalOrdered = items.reduce((s, i) => s + i.qty, 0)
  const totalReceived = items.reduce((s, i) => s + i.qtyReceived, 0)
  if (totalReceived === 0) return 'Ordered'
  if (totalReceived >= totalOrdered) return 'Received'
  return 'Partially Received'
}

interface Ctx {
  state: State
  createTransfer: (t: Omit<Transfer, 'id' | 'date'>) => void
  createPO: (po: { supplierId: string; project: string; orderDate: string; items: Omit<POItem, 'qtyReceived'>[] }, status: 'Draft' | 'Ordered') => void
  placeOrder: (poId: string) => void
  receivePO: (poId: string, receivedBy: string, onTime: boolean, quality: 'ok' | 'minor' | 'rejected', receipts: { partId: string; qty: number }[]) => void
  addSupplier: (s: Omit<Supplier, 'id'>) => void
}
const InventoryContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_demo_inventory_v2'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setState(JSON.parse(raw)) } catch (e) {} setLoaded(true) }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }, [state, loaded])

  const createTransfer: Ctx['createTransfer'] = t => setState(s => ({ ...s, transfers: [{ ...t, id: uid('tr'), date: today() }, ...s.transfers] }))

  const createPO: Ctx['createPO'] = (po, status) => {
    const poNumber = `PO-${1000 + state.purchaseOrders.length + 1}`
    setState(s => ({ ...s, purchaseOrders: [{ ...po, id: uid('po'), poNumber, status, items: po.items.map(i => ({ ...i, qtyReceived: 0 })) }, ...s.purchaseOrders] }))
  }

  const placeOrder: Ctx['placeOrder'] = poId => setState(s => ({ ...s, purchaseOrders: s.purchaseOrders.map(p => p.id === poId && p.status === 'Draft' ? { ...p, status: 'Ordered' } : p) }))

  const receivePO: Ctx['receivePO'] = (poId, receivedBy, onTime, quality, receipts) => {
    setState(s => ({
      ...s,
      purchaseOrders: s.purchaseOrders.map(po => {
        if (po.id !== poId) return po
        const items = po.items.map(it => {
          const r = receipts.find(x => x.partId === it.partId)
          if (!r) return it
          const newReceived = Math.min(it.qty, it.qtyReceived + r.qty)
          return { ...it, qtyReceived: newReceived }
        })
        return { ...po, items, status: computeStatus(items), receivedBy, receivedDate: today(), onTime, quality }
      }),
    }))
  }

  const addSupplier: Ctx['addSupplier'] = s => setState(st => ({ ...st, suppliers: [...st.suppliers, { ...s, id: uid('sup') }] }))

  return <InventoryContext.Provider value={{ state, createTransfer, createPO, placeOrder, receivePO, addSupplier }}>{children}</InventoryContext.Provider>
}
export function useInventory() { const c = useContext(InventoryContext); if (!c) throw new Error('useInventory must be used inside InventoryProvider'); return c }

// ── SELECTORS ────────────────────────────────────────────────────────────
export function poOrderedValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qty * i.unitCost, 0) }
export function poReceivedValue(po: PurchaseOrder) { return po.items.reduce((s, i) => s + i.qtyReceived * i.unitCost, 0) }

export function supplierPerf(state: State, supplierId: string) {
  const fullyReceived = state.purchaseOrders.filter(po => po.supplierId === supplierId && po.status === 'Received')
  const poCount = state.purchaseOrders.filter(po => po.supplierId === supplierId).length
  const spend = state.purchaseOrders.filter(po => po.supplierId === supplierId).reduce((s, po) => s + poReceivedValue(po), 0)
  if (fullyReceived.length === 0) return { onTimeRate: 0, qualityScore: 100, stars: 0, spend, poCount }
  const onTimeRate = Math.round((fullyReceived.filter(p => p.onTime).length / fullyReceived.length) * 100)
  const issues = fullyReceived.filter(p => p.quality && p.quality !== 'ok').length
  const qualityScore = Math.round(((fullyReceived.length - issues) / fullyReceived.length) * 100)
  const score = onTimeRate * 0.5 + qualityScore * 0.5
  const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 40 ? 2 : 1
  return { onTimeRate, qualityScore, stars, spend, poCount }
}

// spend for a project, grouped by category — the core "how much are we spending" view
export function projectSpendByCategory(state: State, project: string) {
  const pos = state.purchaseOrders.filter(po => po.project === project)
  const byCategory: Record<string, number> = {}
  pos.forEach(po => po.items.forEach(it => { byCategory[it.category] = (byCategory[it.category] || 0) + it.qtyReceived * it.unitCost }))
  return Object.entries(byCategory).map(([category, spend]) => ({ category, spend })).sort((a, b) => b.spend - a.spend)
}
export function projectTotalSpend(state: State, project: string) {
  return state.purchaseOrders.filter(po => po.project === project).reduce((s, po) => s + poReceivedValue(po), 0)
}
export function projectOutstanding(state: State, project: string) {
  return state.purchaseOrders.filter(po => po.project === project).reduce((s, po) => s + (poOrderedValue(po) - poReceivedValue(po)), 0)
}

// ── SHARED UI ────────────────────────────────────────────────────────────
export const subNav = [
  { href: '/admin/inventory', label: 'Dashboard' },
  { href: '/admin/inventory/requests', label: 'Transfers' },
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
export function Badge({ text, c }: { text: string; c: { color: string; bg: string; border: string; icon?: React.ReactNode } }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{c.icon} {text}</span>
}
export function money(n: number) { return `$${n.toLocaleString()}` }

// Full-detail line item picker row, reused by Transfers and Purchase Orders
export function PartDetailCard({ item }: { item: LineItem | POItem }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 11 }}>
      <div><span style={{ color: '#64748B' }}>Part No: </span><span style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>{item.partNumber}</span></div>
      <div><span style={{ color: '#64748B' }}>Name: </span><span style={{ color: '#F8FAFC' }}>{item.name}</span></div>
      <div><span style={{ color: '#64748B' }}>Category: </span><span style={{ color: '#F8FAFC' }}>{item.category}</span></div>
      <div><span style={{ color: '#64748B' }}>Manufacturer: </span><span style={{ color: '#F8FAFC' }}>{item.manufacturer}</span></div>
      <div><span style={{ color: '#64748B' }}>Unit: </span><span style={{ color: '#F8FAFC' }}>{item.unit}</span></div>
      <div><span style={{ color: '#64748B' }}>Unit Cost: </span><span style={{ color: '#10B981', fontWeight: 700 }}>{money(item.unitCost)}</span></div>
    </div>
  )
}

