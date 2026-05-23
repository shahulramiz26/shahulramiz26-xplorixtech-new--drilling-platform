'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, X, Check, Edit2, Trash2, Star,
  ChevronDown, ChevronRight, Package, TrendingUp,
  Phone, Mail, MapPin, FileText, Award, Clock, ShoppingCart
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── TYPES ──────────────────────────────────────────────────────────────────
type SupplierStatus = 'Active' | 'Inactive' | 'Blacklisted'

interface PORecord {
  poNumber: string; date: string; project: string
  value: number; status: string; leadDays: number
  onTime: boolean; qualityIssue: 'none' | 'minor' | 'rejected'
}

interface Supplier {
  id: string
  supplierId: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  gstin: string
  categories: string[]
  status: SupplierStatus
  preferredFor: string[]
  poHistory: PORecord[]
  notes: string
  editing?: boolean
}

// ── CATEGORIES ─────────────────────────────────────────────────────────────
const allCategories = [
  'Core Bits', 'Core Barrel Assembly', 'Reaming Shells',
  'Drilling Fluids & Chemicals', 'Filtration', 'Seals & Packings',
  'Bearings & Seals', 'Hoses & Hydraulics', 'Lubricants & Greases',
  'Drive & Transmission', 'Rods, Casings & Subs', 'Safety & PPE',
  'Workshop & Repair Tools', 'Hardware & Consumables', 'Electrical & Instrumentation',
]

// ── REAL SUPPLIER SEED DATA (from customer Excel) ──────────────────────────
const seedSuppliers: Supplier[] = [
  {
    id: '1', supplierId: 'SUP-001',
    name: 'ROCKTEK INFRA SERVICES PVT. LTD.',
    contactPerson: 'Rajiv Sharma', phone: '+91 98765 43210', email: 'sales@rocktek.in',
    address: 'Nagpur, Maharashtra', gstin: '27AABCR1234A1Z5',
    categories: ['Core Barrel Assembly', 'Reaming Shells', 'Seals & Packings', 'Rods, Casings & Subs'],
    status: 'Active', preferredFor: ['Core Barrel Assembly', 'Reaming Shells'],
    notes: 'Primary supplier for core barrel components. Good quality, reliable delivery.',
    poHistory: [
      { poNumber:'PO-2026-060', date:'29.04.2026', project:'CMP-MAD', value:134355, status:'Ordered',   leadDays:0,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-048', date:'15.03.2026', project:'RS-01',   value:89500,  status:'Received',  leadDays:6,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-031', date:'10.02.2026', project:'RS-01',   value:124000, status:'Received',  leadDays:8,  onTime:false, qualityIssue:'none'     },
      { poNumber:'PO-2026-012', date:'05.01.2026', project:'CMPDI-DAM',value:67200, status:'Received',  leadDays:5,  onTime:true,  qualityIssue:'minor'    },
    ]
  },
  {
    id: '2', supplierId: 'SUP-002',
    name: 'IDP (Ideal Diamond Products)',
    contactPerson: 'Sunil Mehta', phone: '+91 99887 76655', email: 'orders@idp.co.in',
    address: 'Mumbai, Maharashtra', gstin: '27AABCI5678B1Z3',
    categories: ['Core Bits', 'Core Barrel Assembly', 'Reaming Shells'],
    status: 'Active', preferredFor: ['Core Bits'],
    notes: 'Best quality core bits. Premium pricing but zero rejection rate.',
    poHistory: [
      { poNumber:'PO-2026-056', date:'28.04.2026', project:'RS-01',   value:220000, status:'Received',  leadDays:1,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-044', date:'10.03.2026', project:'RS-01',   value:190000, status:'Received',  leadDays:2,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-028', date:'01.02.2026', project:'DGMIL-BHK',value:88000, status:'Received',  leadDays:3,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2025-089', date:'15.12.2025', project:'RS-01',   value:176000, status:'Received',  leadDays:2,  onTime:true,  qualityIssue:'none'     },
    ]
  },
  {
    id: '3', supplierId: 'SUP-003',
    name: 'WESTFIELDS SERVICES',
    contactPerson: 'Amit Nair', phone: '+91 97654 32109', email: 'westfields@gmail.com',
    address: 'Nagpur, Maharashtra', gstin: '27AABCW9012C1Z1',
    categories: ['Drilling Fluids & Chemicals'],
    status: 'Active', preferredFor: ['Drilling Fluids & Chemicals'],
    notes: 'Exclusive MATEX distributor. Fast delivery from Nagpur warehouse.',
    poHistory: [
      { poNumber:'PO-2026-055', date:'06.04.2026', project:'RS-01',   value:290370, status:'Received',  leadDays:2,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-038', date:'05.03.2026', project:'RS-01',   value:245680, status:'Received',  leadDays:2,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-021', date:'20.01.2026', project:'CMP-MAD', value:168900, status:'Received',  leadDays:3,  onTime:true,  qualityIssue:'none'     },
    ]
  },
  {
    id: '4', supplierId: 'SUP-004',
    name: 'AB EMULTECH PVT. LTD.',
    contactPerson: 'Priya Desai', phone: '+91 96543 21098', email: 'info@abemultech.com',
    address: 'Pune, Maharashtra', gstin: '27AABCA3456D1Z9',
    categories: ['Drilling Fluids & Chemicals'],
    status: 'Active', preferredFor: [],
    notes: 'ADDRILL product line. Good for bulk orders.',
    poHistory: [
      { poNumber:'PO-2026-061', date:'30.04.2026', project:'CMPDI-DAM', value:362500, status:'Partially Received', leadDays:0, onTime:true, qualityIssue:'none' },
      { poNumber:'PO-2026-042', date:'08.03.2026', project:'RS-01',    value:224000, status:'Received',  leadDays:7,  onTime:false, qualityIssue:'none'     },
      { poNumber:'PO-2026-019', date:'15.01.2026', project:'DGMIL-BHK',value:187500, status:'Received',  leadDays:5,  onTime:true,  qualityIssue:'none'     },
    ]
  },
  {
    id: '5', supplierId: 'SUP-005',
    name: 'AMOGH ENTERPRISES',
    contactPerson: 'Vikram Joshi', phone: '+91 95432 10987', email: 'amogh@enterprises.in',
    address: 'Nagpur, Maharashtra', gstin: '27AABCA7890E1Z7',
    categories: ['Bearings & Seals', 'Drive & Transmission'],
    status: 'Active', preferredFor: ['Bearings & Seals'],
    notes: 'SKF authorized distributor. Premium bearings only.',
    poHistory: [
      { poNumber:'PO-2026-051', date:'20.04.2026', project:'RS-01',   value:154000, status:'Received',  leadDays:4,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-033', date:'15.02.2026', project:'RS-01',   value:89450,  status:'Received',  leadDays:3,  onTime:true,  qualityIssue:'none'     },
    ]
  },
  {
    id: '6', supplierId: 'SUP-006',
    name: 'M.S. ENTERPRISES',
    contactPerson: 'Mohan Singh', phone: '+91 94321 09876', email: 'ms.enterprises@yahoo.com',
    address: 'Chhindwara, Madhya Pradesh', gstin: '23AABCM2345F1Z5',
    categories: ['Filtration', 'Hoses & Hydraulics'],
    status: 'Active', preferredFor: ['Filtration'],
    notes: 'Local supplier. Good for urgent requirements.',
    poHistory: [
      { poNumber:'PO-2026-059', date:'27.04.2026', project:'RS-01',   value:47468,  status:'Draft',     leadDays:0,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-040', date:'06.03.2026', project:'RS-01',   value:38920,  status:'Received',  leadDays:5,  onTime:true,  qualityIssue:'none'     },
      { poNumber:'PO-2026-022', date:'22.01.2026', project:'CMP-MAD', value:29450,  status:'Received',  leadDays:4,  onTime:true,  qualityIssue:'minor'    },
    ]
  },
  {
    id: '7', supplierId: 'SUP-007',
    name: 'DHANBAD ENGINEERING',
    contactPerson: 'Rajan Kumar', phone: '+91 93210 98765', email: 'dhanbad.engg@gmail.com',
    address: 'Dhanbad, Jharkhand', gstin: '20AABCD4567G1Z3',
    categories: ['Core Barrel Assembly', 'Workshop & Repair Tools'],
    status: 'Active', preferredFor: [],
    notes: 'Good for inner tube spanners and workshop tools.',
    poHistory: [
      { poNumber:'PO-2026-047', date:'14.03.2026', project:'RS-01',   value:24750,  status:'Received',  leadDays:9,  onTime:false, qualityIssue:'none'     },
      { poNumber:'PO-2026-029', date:'03.02.2026', project:'DGMIL-BHK',value:18500, status:'Received',  leadDays:10, onTime:false, qualityIssue:'none'     },
    ]
  },
  {
    id: '8', supplierId: 'SUP-008',
    name: 'SPECIALITY LUBRICANTS',
    contactPerson: 'Anand Pillai', phone: '+91 92109 87654', email: 'info@speclube.com',
    address: 'Chennai, Tamil Nadu', gstin: '33AABCS5678H1Z1',
    categories: ['Lubricants & Greases'],
    status: 'Active', preferredFor: ['Lubricants & Greases'],
    notes: 'TCZ-50 and specialty greases. Good pricing for bulk orders.',
    poHistory: [
      { poNumber:'PO-2026-043', date:'09.03.2026', project:'RS-01',   value:62500,  status:'Received',  leadDays:12, onTime:false, qualityIssue:'none'     },
      { poNumber:'PO-2026-015', date:'10.01.2026', project:'RS-01',   value:50000,  status:'Received',  leadDays:11, onTime:false, qualityIssue:'none'     },
    ]
  },
]

// ── HELPERS ────────────────────────────────────────────────────────────────
function calcPerformance(supplier: Supplier) {
  const received = supplier.poHistory.filter(p => p.status === 'Received')
  if (received.length === 0) return { onTimeRate: 0, avgLeadDays: 0, qualityScore: 100, stars: 0 }

  const onTimeRate = Math.round((received.filter(p => p.onTime).length / received.length) * 100)
  const avgLeadDays = Math.round(received.reduce((s, p) => s + p.leadDays, 0) / received.length)
  const qualityIssues = received.filter(p => p.qualityIssue !== 'none').length
  const qualityScore = Math.round(((received.length - qualityIssues) / received.length) * 100)

  // Star rating: onTime 40% + quality 30% + lead time 30%
  const leadScore = avgLeadDays <= 3 ? 100 : avgLeadDays <= 7 ? 75 : avgLeadDays <= 10 ? 50 : 25
  const total = (onTimeRate * 0.4) + (qualityScore * 0.3) + (leadScore * 0.3)
  const stars = total >= 90 ? 5 : total >= 75 ? 4 : total >= 60 ? 3 : total >= 40 ? 2 : 1

  return { onTimeRate, avgLeadDays, qualityScore, stars }
}

function totalSpend(supplier: Supplier) {
  return supplier.poHistory.filter(p => p.status === 'Received' || p.status === 'Partially Received').reduce((s, p) => s + p.value, 0)
}

function StarRating({ stars, size = 14 }: { stars: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} style={{ color: i <= stars ? '#F59E0B' : '#1E293B', fill: i <= stars ? '#F59E0B' : 'transparent' }} />
      ))}
    </div>
  )
}

const statusColors: Record<SupplierStatus, { color: string; bg: string; border: string }> = {
  'Active':      { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  'Inactive':    { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  'Blacklisted': { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
}

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href: '/admin/inventory',                 label: 'Dashboard'        },
  { href: '/admin/inventory/catalogue',       label: 'Parts Catalogue'  },
  { href: '/admin/inventory/stock',           label: 'Stock Management' },
  { href: '/admin/inventory/purchase-orders', label: 'Purchase Orders'  },
  { href: '/admin/inventory/suppliers',       label: 'Suppliers'        },
]

function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#080B10', border: '1px solid #1E293B', borderRadius: 12, padding: 4 }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', background: active === n.label ? '#F97316' : 'transparent', color: active === n.label ? '#fff' : '#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const S = {
  card: { background: '#0D1117', border: '1px solid #1E293B', borderRadius: 16 },
  label: { fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
}

const tooltipStyle = {
  contentStyle: { background: '#0D1117', border: '1px solid #1E293B', borderRadius: 12, color: '#F8FAFC', fontSize: 12 },
  labelStyle: { color: '#94A3B8' },
}

// ── ADD/EDIT SUPPLIER MODAL ────────────────────────────────────────────────
function SupplierModal({ supplier, onClose, onSave, nextId }: {
  supplier?: Supplier; onClose: () => void; onSave: (s: Supplier) => void; nextId: string
}) {
  const [form, setForm] = useState<Supplier>(supplier || {
    id: Date.now().toString(), supplierId: nextId,
    name: '', contactPerson: '', phone: '', email: '',
    address: '', gstin: '', categories: [], status: 'Active',
    preferredFor: [], poHistory: [], notes: '',
  })
  const [catSearch, setCatSearch] = useState('')

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat]
    }))
  }

  const iStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', background: '#080B10', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', fontSize: 13, outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 32, width: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', fontFamily: "'Space Grotesk',sans-serif" }}>
              {supplier ? 'Edit Supplier' : 'Add New Supplier'}
            </div>
            <div style={{ fontSize: 12, color: '#F97316', marginTop: 2, fontFamily: 'monospace' }}>ID: {form.supplierId}</div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Supplier Name *',       field: 'name',          placeholder: 'Full company name',     full: true  },
            { label: 'Contact Person',         field: 'contactPerson', placeholder: 'Name of contact',       full: false },
            { label: 'Phone',                  field: 'phone',         placeholder: '+91 XXXXX XXXXX',       full: false },
            { label: 'Email',                  field: 'email',         placeholder: 'email@supplier.com',    full: false },
            { label: 'Address',                field: 'address',       placeholder: 'City, State',           full: false },
            { label: 'GSTIN',                  field: 'gstin',         placeholder: 'e.g. 27AAAAA0000A1Z5',  full: false },
          ].map((f, i) => (
            <div key={i} style={{ gridColumn: f.full ? '1 / -1' : undefined }}>
              <div style={{ ...S.label, marginBottom: 6 }}>{f.label}</div>
              <input value={(form as any)[f.field]} onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                placeholder={f.placeholder} style={iStyle} />
            </div>
          ))}

          {/* Status */}
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Status</div>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as SupplierStatus }))}
              style={{ ...iStyle, cursor: 'pointer', appearance: 'none' as any }}>
              {(['Active', 'Inactive', 'Blacklisted'] as SupplierStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Notes</div>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any notes about this supplier..." style={iStyle} />
          </div>

          {/* Categories */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ ...S.label, marginBottom: 8 }}>What do they supply? (select all that apply)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  style={{ padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    background: form.categories.includes(cat) ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.categories.includes(cat) ? 'rgba(249,115,22,0.4)' : '#1E293B'}`,
                    color: form.categories.includes(cat) ? '#F97316' : '#64748B',
                  }}>
                  {form.categories.includes(cat) ? '✓ ' : ''}{cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose() }}
            style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            {supplier ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SUPPLIER DETAIL PANEL ──────────────────────────────────────────────────
function SupplierDetail({ supplier, onClose, onEdit, onTogglePreferred }: {
  supplier: Supplier; onClose: () => void; onEdit: () => void; onTogglePreferred: (cat: string) => void
}) {
  const { format } = useCurrency()
  const perf = calcPerformance(supplier)
  const spend = totalSpend(supplier)
  const received = supplier.poHistory.filter(p => p.status === 'Received')
  const sc = statusColors[supplier.status]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 0, width: 680, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #1E293B', background: 'linear-gradient(135deg,rgba(249,115,22,0.05),transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#F97316', background: 'rgba(249,115,22,0.1)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.2)' }}>{supplier.supplierId}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>{supplier.status}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#F8FAFC', fontFamily: "'Space Grotesk',sans-serif" }}>{supplier.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <StarRating stars={perf.stars} size={16} />
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{perf.stars}.0 / 5.0</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onEdit} style={{ padding: '8px 16px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Edit2 size={13} /> Edit</button>
              <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Contact + Performance row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Contact */}
            <div style={{ ...S.card, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', marginBottom: 14 }}>Contact Details</div>
              {[
                { icon: <FileText size={13} />, label: 'Contact', value: supplier.contactPerson },
                { icon: <Phone size={13} />,    label: 'Phone',   value: supplier.phone         },
                { icon: <Mail size={13} />,     label: 'Email',   value: supplier.email         },
                { icon: <MapPin size={13} />,   label: 'Address', value: supplier.address       },
                { icon: <FileText size={13} />, label: 'GSTIN',   value: supplier.gstin         },
              ].map((r, i) => r.value && (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ color: '#64748B', marginTop: 1, flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: '#F8FAFC', marginTop: 2 }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance */}
            <div style={{ ...S.card, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', marginBottom: 14 }}>Performance Score</div>
              {[
                { label: 'On-Time Delivery', value: `${perf.onTimeRate}%`, color: perf.onTimeRate >= 80 ? '#10B981' : perf.onTimeRate >= 60 ? '#F59E0B' : '#EF4444', bar: perf.onTimeRate },
                { label: 'Quality Score',    value: `${perf.qualityScore}%`, color: perf.qualityScore >= 90 ? '#10B981' : '#F59E0B', bar: perf.qualityScore },
                { label: 'Avg Lead Time',    value: `${perf.avgLeadDays} days`, color: perf.avgLeadDays <= 5 ? '#10B981' : perf.avgLeadDays <= 10 ? '#F59E0B' : '#EF4444', bar: Math.max(0, 100 - (perf.avgLeadDays * 8)) },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
                  </div>
                  <div style={{ background: '#1A2234', borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${m.bar}%`, height: 6, borderRadius: 4, background: m.color, transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 10, borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>Overall Rating</span>
                <StarRating stars={perf.stars} size={15} />
              </div>
            </div>
          </div>

          {/* Spend + PO stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Total POs',     value: supplier.poHistory.length,          color: '#60A5FA' },
              { label: 'Total Spend',   value: format(spend),                       color: '#10B981' },
              { label: 'Completed POs', value: received.length,                     color: '#F97316' },
              { label: 'Projects',      value: new Set(supplier.poHistory.map(p => p.project)).size, color: '#8B5CF6' },
            ].map((k, i) => (
              <div key={i} style={{ ...S.card, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: k.color, marginBottom: 4 }}>{k.value}</div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Categories + Preferred */}
          <div style={{ ...S.card, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>Supply Categories</div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 14 }}>Toggle ⭐ to mark as preferred supplier for that category — this auto-suggests them when creating a PO</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {supplier.categories.map(cat => {
                const isPreferred = supplier.preferredFor.includes(cat)
                return (
                  <button key={cat} onClick={() => onTogglePreferred(cat)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      background: isPreferred ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isPreferred ? 'rgba(245,158,11,0.3)' : '#1E293B'}`,
                      color: isPreferred ? '#F59E0B' : '#64748B',
                    }}>
                    <Star size={11} style={{ fill: isPreferred ? '#F59E0B' : 'transparent', color: isPreferred ? '#F59E0B' : '#64748B' }} />
                    {cat}
                    {isPreferred && <span style={{ fontSize: 9, color: '#F59E0B' }}>PREFERRED</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* PO History */}
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={14} style={{ color: '#64748B' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>PO History</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['PO Number', 'Date', 'Project', 'Value', 'Lead Days', 'On Time', 'Quality', 'Status'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #1E293B', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplier.poHistory.map((po, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', color: '#F97316', fontFamily: 'monospace', fontWeight: 600 }}>{po.poNumber}</td>
                    <td style={{ padding: '10px 14px', color: '#94A3B8' }}>{po.date}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.08)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.12)' }}>{po.project}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#10B981' }}>{format(po.value)}</td>
                    <td style={{ padding: '10px 14px', color: po.leadDays <= 5 ? '#10B981' : po.leadDays <= 10 ? '#F59E0B' : '#EF4444', fontWeight: 600 }}>
                      {po.status === 'Received' || po.status === 'Partially Received' ? `${po.leadDays}d` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {po.status === 'Received' || po.status === 'Partially Received' ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: po.onTime ? '#10B981' : '#EF4444' }}>{po.onTime ? '✅ Yes' : '❌ No'}</span>
                      ) : <span style={{ color: '#64748B' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                        background: po.qualityIssue === 'none' ? 'rgba(16,185,129,0.08)' : po.qualityIssue === 'minor' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                        color: po.qualityIssue === 'none' ? '#10B981' : po.qualityIssue === 'minor' ? '#F59E0B' : '#EF4444',
                        border: `1px solid ${po.qualityIssue === 'none' ? 'rgba(16,185,129,0.15)' : po.qualityIssue === 'minor' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}`,
                      }}>
                        {po.qualityIssue === 'none' ? 'OK' : po.qualityIssue === 'minor' ? 'Minor' : 'Rejected'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: po.status === 'Received' ? '#10B981' : po.status === 'Ordered' ? '#60A5FA' : po.status === 'Partially Received' ? '#F59E0B' : '#94A3B8' }}>{po.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B', fontSize: 12, color: '#94A3B8' }}>
              📝 {supplier.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const { format, formatShort } = useCurrency()
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState<SupplierStatus | 'All'>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Supplier | null>(null)
  const [detailTarget, setDetailTarget] = useState<Supplier | null>(null)

  const filtered = suppliers.filter(s =>
    (filterStatus === 'All' || s.status === filterStatus) &&
    (filterCat === 'All' || s.categories.includes(filterCat)) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.supplierId.toLowerCase().includes(search.toLowerCase()))
  )

  const nextSupplierId = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`

  const handleSave = (s: Supplier) => {
    setSuppliers(prev => {
      const exists = prev.find(x => x.id === s.id)
      return exists ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]
    })
    if (detailTarget?.id === s.id) setDetailTarget(s)
  }

  const handleDelete = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }

  const handleTogglePreferred = (supplierId: string, cat: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id !== supplierId) return s
      const isPreferred = s.preferredFor.includes(cat)
      // Remove preferred from other suppliers for this category first
      return { ...s, preferredFor: isPreferred ? s.preferredFor.filter(c => c !== cat) : [...s.preferredFor, cat] }
    }))
    if (detailTarget?.id === supplierId) {
      setDetailTarget(prev => {
        if (!prev) return prev
        const isPreferred = prev.preferredFor.includes(cat)
        return { ...prev, preferredFor: isPreferred ? prev.preferredFor.filter(c => c !== cat) : [...prev.preferredFor, cat] }
      })
    }
  }

  // Spend data for bar chart
  const spendData = [...suppliers]
    .sort((a, b) => totalSpend(b) - totalSpend(a))
    .slice(0, 6)
    .map(s => ({ name: s.name.split(' ')[0], spend: totalSpend(s), fullName: s.name }))

  const totalSpendAll = suppliers.reduce((sum, s) => sum + totalSpend(s), 0)
  const activeCount = suppliers.filter(s => s.status === 'Active').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Suppliers</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Manage suppliers, track performance and spend intelligence</p>
        </div>
        <SubNav active="Suppliers" />
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Suppliers',   value: suppliers.length, color: '#60A5FA', icon: '🏭' },
          { label: 'Active Suppliers',  value: activeCount,      color: '#10B981', icon: '✅' },
          { label: 'Total Spend (YTD)', value: formatShort(totalSpendAll), color: '#F97316', icon: '💰' },
          { label: 'Preferred Set',     value: suppliers.filter(s => s.preferredFor.length > 0).length, color: '#F59E0B', icon: '⭐' },
        ].map((k, i) => (
          <div key={i} style={{ ...S.card, padding: '16px 18px' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ ...S.label, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Spend Chart + Preferred Suppliers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Spend bar chart */}
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Top Suppliers by Spend</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Total value of received POs</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spendData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [format(v), 'Spend']} />
              <Bar dataKey="spend" fill="#F97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Preferred Suppliers */}
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>Preferred by Category</div>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 16 }}>Auto-suggested when creating POs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {allCategories.map(cat => {
              const preferred = suppliers.find(s => s.preferredFor.includes(cat))
              if (!preferred) return null
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#F8FAFC' }}>{cat}</div>
                    <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 1 }}>{preferred.supplierId} · {preferred.name.split(' ')[0]}</div>
                  </div>
                  <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B', flexShrink: 0 }} />
                </div>
              )
            })}
            {suppliers.every(s => s.preferredFor.length === 0) && (
              <div style={{ fontSize: 12, color: '#64748B', textAlign: 'center', padding: '20px 0' }}>No preferred suppliers set yet.<br />Click a supplier → toggle ⭐ on categories.</div>
            )}
          </div>
        </div>
      </div>

      {/* Filters + Add */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', ...S.card, padding: '12px 20px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers, IDs..."
            style={{ width: '100%', padding: '8px 12px 8px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#F8FAFC', fontSize: 13, padding: '8px 28px 8px 12px', borderRadius: 8, cursor: 'pointer', outline: 'none' }}>
            <option value="All">All Categories</option>
            {allCategories.map(c => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
        </div>
        {(['All', 'Active', 'Inactive', 'Blacklisted'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: filterStatus === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filterStatus === s ? 'rgba(249,115,22,0.3)' : '#1E293B'}`,
              color: filterStatus === s ? '#F97316' : '#64748B',
            }}>{s}</button>
        ))}
        <button onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.25)' }}>
          <Plus size={14} /> Add Supplier
        </button>
      </div>

      {/* Supplier Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#64748B', ...S.card }}>No suppliers found.</div>
        )}
        {filtered.map(supplier => {
          const perf = calcPerformance(supplier)
          const spend = totalSpend(supplier)
          const sc = statusColors[supplier.status]
          const projects = [...new Set(supplier.poHistory.map(p => p.project))]

          return (
            <div key={supplier.id}
              style={{ ...S.card, padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E293B'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
              onClick={() => setDetailTarget(supplier)}
            >
              {/* Card Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #1E293B' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#F97316', background: 'rgba(249,115,22,0.08)', padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(249,115,22,0.15)' }}>{supplier.supplierId}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>{supplier.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setEditTarget(supplier)}
                      style={{ padding: 6, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}>
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)}
                      style={{ padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', lineHeight: 1.3, marginBottom: 8 }}>{supplier.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating stars={perf.stars} size={13} />
                  <span style={{ fontSize: 11, color: '#64748B' }}>{perf.stars}.0</span>
                </div>
              </div>

              {/* Card Stats */}
              <div style={{ padding: '14px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                  {[
                    { label: 'POs',        value: supplier.poHistory.length, color: '#60A5FA' },
                    { label: 'Spend',      value: formatShort(spend),         color: '#10B981' },
                    { label: 'Lead Days',  value: perf.avgLeadDays > 0 ? `${perf.avgLeadDays}d` : '—', color: perf.avgLeadDays <= 5 ? '#10B981' : '#F59E0B' },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Performance bars */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>On-Time {perf.onTimeRate}%</div>
                    <div style={{ background: '#1A2234', borderRadius: 3, height: 4 }}>
                      <div style={{ width: `${perf.onTimeRate}%`, height: 4, borderRadius: 3, background: perf.onTimeRate >= 80 ? '#10B981' : '#F59E0B' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Quality {perf.qualityScore}%</div>
                    <div style={{ background: '#1A2234', borderRadius: 3, height: 4 }}>
                      <div style={{ width: `${perf.qualityScore}%`, height: 4, borderRadius: 3, background: '#10B981' }} />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {supplier.categories.slice(0, 3).map(cat => {
                    const isPreferred = supplier.preferredFor.includes(cat)
                    return (
                      <span key={cat} style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                        background: isPreferred ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.06)',
                        color: isPreferred ? '#F59E0B' : '#60A5FA',
                        border: `1px solid ${isPreferred ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.1)'}`,
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        {isPreferred && '⭐ '}{cat}
                      </span>
                    )
                  })}
                  {supplier.categories.length > 3 && (
                    <span style={{ fontSize: 9, color: '#64748B', padding: '2px 7px' }}>+{supplier.categories.length - 3} more</span>
                  )}
                </div>

                {/* Projects */}
                {projects.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 10, color: '#64748B' }}>
                    Projects: {projects.slice(0, 3).join(', ')}{projects.length > 3 ? ` +${projects.length - 3}` : ''}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {showAddModal && (
        <SupplierModal onClose={() => setShowAddModal(false)} onSave={handleSave} nextId={nextSupplierId} />
      )}
      {editTarget && (
        <SupplierModal supplier={editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} nextId={nextSupplierId} />
      )}
      {detailTarget && (
        <SupplierDetail
          supplier={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => { setEditTarget(detailTarget); setDetailTarget(null) }}
          onTogglePreferred={(cat) => handleTogglePreferred(detailTarget.id, cat)}
        />
      )}

    </div>
  )
}

