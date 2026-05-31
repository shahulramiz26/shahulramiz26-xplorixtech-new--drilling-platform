'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Edit2, Check, X, Download, ChevronDown, Info, Save, FileText } from 'lucide-react'
import { useCostingRates, PROJECTS } from '../costing-context'

const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}

const iStyle: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}

// ── RIGS ──────────────────────────────────────────────────────────────────
const RIGS = [
  { id: 'KEM-04', project: 'RS-01'     },
  { id: 'KEM-05', project: 'RS-01'     },
  { id: 'KEM-14', project: 'CMPDI-DAM' },
  { id: 'KEM-13', project: 'CMPDI-DAM' },
  { id: 'KEM-12', project: 'CMP-MAD'   },
  { id: 'KEM-11', project: 'DGMIL-BHK' },
  { id: 'KEM-10', project: 'MECL-HIN'  },
]

// ── STANDARD LINE ITEMS ───────────────────────────────────────────────────
const CLIENT_CATEGORIES = [
  { label: 'Meterage Band 1 (0–200m)',    unit: '₹/meter',    defaultPrice: 850,    group: 'Meterage Rates'   },
  { label: 'Meterage Band 2 (200–400m)',  unit: '₹/meter',    defaultPrice: 950,    group: 'Meterage Rates'   },
  { label: 'Meterage Band 3 (400m+)',     unit: '₹/meter',    defaultPrice: 1050,   group: 'Meterage Rates'   },
  { label: 'Drilling Day Rate',           unit: '₹/day',      defaultPrice: 28000,  group: 'Day Rates'        },
  { label: 'Standby Day Rate',            unit: '₹/day',      defaultPrice: 12000,  group: 'Day Rates'        },
  { label: 'Repair / Breakdown Day Rate', unit: '₹/day',      defaultPrice: 8000,   group: 'Day Rates'        },
  { label: 'Mobilisation Charges',        unit: '₹ lump sum', defaultPrice: 250000, group: 'One-Time Charges' },
  { label: 'Demobilisation Charges',      unit: '₹ lump sum', defaultPrice: 150000, group: 'One-Time Charges' },
  { label: 'GST',                         unit: '%',          defaultPrice: 18,     group: 'Statutory'        },
  { label: 'TDS (Section 194C)',          unit: '%',          defaultPrice: 2,      group: 'Statutory'        },
  { label: 'Retention Money',             unit: '%',          defaultPrice: 5,      group: 'Statutory'        },
]

const RIG_CATEGORIES = [
  { label: 'Drilling Day Rate',           unit: '₹/day',      defaultPrice: 9000,   group: 'Day Rates'        },
  { label: 'Standby Day Rate',            unit: '₹/day',      defaultPrice: 4500,   group: 'Day Rates'        },
  { label: 'Repair Day Rate',             unit: '₹/day',      defaultPrice: 3000,   group: 'Day Rates'        },
  { label: 'Meterage Rate (Rig Rental)',  unit: '₹/meter',    defaultPrice: 850,    group: 'Rig Rental'       },
  { label: 'Labour Cost Per Day',         unit: '₹/day',      defaultPrice: 2300,   group: 'Operating Costs'  },
  { label: 'Fuel Consumption Per Day',    unit: 'litres/day', defaultPrice: 110,    group: 'Operating Costs'  },
  { label: 'Maintenance Cost Per Month',  unit: '₹/month',    defaultPrice: 18000,  group: 'Operating Costs'  },
  { label: 'Mobilisation Charges',        unit: '₹ lump sum', defaultPrice: 50000,  group: 'One-Time'         },
  { label: 'GST',                         unit: '%',          defaultPrice: 18,     group: 'Statutory'        },
  { label: 'TDS',                         unit: '%',          defaultPrice: 2,      group: 'Statutory'        },
]

const UNITS = ['₹/meter', '₹/day', '₹/month', '₹ lump sum', '%', 'litres/day', '₹/shift', '₹/hole', 'Other']

interface LineItem { id: string; category: string; unit: string; price: number; notes: string; isCustom: boolean }
interface ContractData {
  id: string; contractNo: string; dateFrom: string; dateTo: string; lineItems: LineItem[]
  fromCompany: string; fromAddress: string; fromGstin: string; fromContact: string; fromLogo: string
  toCompany: string; toAddress: string; toGstin: string; toContact: string; terms: string
}

const DEFAULT_TERMS = `1. Payment shall be made within 30 days of invoice submission after MB certification.\n2. TDS shall be deducted at source as per Section 194C of the Income Tax Act.\n3. Retention money shall be released within 30 days of project completion.\n4. Standby charges are applicable when equipment is idle due to client-side reasons.\n5. This contract is subject to the jurisdiction of courts at the contractor's registered address.`

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

// ── ADD ITEM MODAL ────────────────────────────────────────────────────────
function AddItemModal({ categories, onAdd, onClose }: { categories: typeof CLIENT_CATEGORIES; onAdd: (item: LineItem) => void; onClose: () => void }) {
  const groups = categories.map(c => c.group).filter((g, i, arr) => arr.indexOf(g) === i)
  const [mode, setMode] = useState<'standard' | 'custom'>('standard')
  const [selectedGroup, setSelectedGroup] = useState(groups[0])
  const [selectedCat, setSelectedCat] = useState(categories[0])
  const [customCategory, setCustomCategory] = useState('')
  const [customUnit, setCustomUnit] = useState('₹/day')
  const [price, setPrice] = useState(categories[0].defaultPrice)
  const [notes, setNotes] = useState('')

  const filteredCats = categories.filter(c => c.group === selectedGroup)

  const handleAdd = () => {
    onAdd({
      id: Date.now().toString(),
      category: mode === 'standard' ? selectedCat.label : customCategory,
      unit: mode === 'standard' ? selectedCat.unit : customUnit,
      price, notes, isCustom: mode === 'custom',
    })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Add Line Item</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[{ id: 'standard', label: '📋 Standard Category' }, { id: 'custom', label: '✏️ Custom Item' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)} style={{
              flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              background: mode === m.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mode === m.id ? 'rgba(249,115,22,0.4)' : C.border}`,
              color: mode === m.id ? C.orange : C.text, fontSize: 13, fontWeight: 700,
            }}>{m.label}</button>
          ))}
        </div>

        {mode === 'standard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Group</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {groups.map(g => (
                  <button key={g} onClick={() => {
                    setSelectedGroup(g)
                    const first = categories.find(c => c.group === g)!
                    setSelectedCat(first); setPrice(first.defaultPrice)
                  }} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: selectedGroup === g ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedGroup === g ? 'rgba(249,115,22,0.4)' : C.border}`,
                    color: selectedGroup === g ? C.orange : C.faint,
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Line Item</div>
              <div style={{ position: 'relative' }}>
                <select value={selectedCat.label} onChange={e => {
                  const cat = categories.find(c => c.label === e.target.value)!
                  setSelectedCat(cat); setPrice(cat.defaultPrice)
                }} style={{ ...iStyle, appearance: 'none', paddingRight: 32 }}>
                  {filteredCats.map(c => <option key={c.label}>{c.label}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Unit: <span style={{ color: C.orange }}>{selectedCat.unit}</span></div>
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Category Name</div>
              <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="e.g. Survey Charges, Casing Charges..." style={iStyle} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Unit</div>
              <div style={{ position: 'relative' }}>
                <select value={UNITS.includes(customUnit) ? customUnit : 'Other'} onChange={e => setCustomUnit(e.target.value)}
                  style={{ ...iStyle, appearance: 'none', paddingRight: 32 }}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
              </div>
              {(!UNITS.slice(0, -1).includes(customUnit) || customUnit === 'Other') && (
                <input value={customUnit === 'Other' ? '' : customUnit} onChange={e => setCustomUnit(e.target.value)}
                  placeholder="Type your unit..." style={{ ...iStyle, marginTop: 8 }} />
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Price / Rate</div>
            <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)}
              style={{ ...iStyle, fontSize: 18, fontWeight: 800, color: C.orange, textAlign: 'center' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Notes (optional)</div>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any note..." style={iStyle} />
          </div>
        </div>

        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', fontSize: 12, color: C.muted }}>
          Adding: <strong style={{ color: C.text }}>{mode === 'standard' ? selectedCat.label : customCategory || 'Custom item'}</strong> at <strong style={{ color: C.orange }}>₹{price.toLocaleString()}</strong> {mode === 'standard' ? selectedCat.unit : customUnit}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAdd} disabled={mode === 'custom' && !customCategory.trim()}
            style={{ flex: 2, padding: '12px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: mode === 'custom' && !customCategory.trim() ? 0.5 : 1 }}>
            Add to Contract
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CONTRACT BUILDER ──────────────────────────────────────────────────────
function ContractBuilder({
  entityId, entityName, entityClient, categories, invoiceHref, accentColor, saved, onSave
}: {
  entityId: string; entityName: string; entityClient?: string
  categories: typeof CLIENT_CATEGORIES; invoiceHref: string
  accentColor: string; saved: boolean; onSave: (contract: ContractData) => void
}) {
  const [contract, setContract] = useState<ContractData>(() => {
    if (typeof window === 'undefined') return emptyContract(entityId)
    try {
      const s = localStorage.getItem(`xplorix_contract_${entityId}`)
      return s ? JSON.parse(s) : emptyContract(entityId)
    } catch { return emptyContract(entityId) }
  })
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`xplorix_contract_${entityId}`, JSON.stringify(contract))
    }
  }, [contract, entityId])

  const update = (field: keyof ContractData, value: any) => setContract(prev => ({ ...prev, [field]: value }))
  const addItem = (item: LineItem) => update('lineItems', [...contract.lineItems, item])
  const deleteItem = (id: string) => update('lineItems', contract.lineItems.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof LineItem, value: any) =>
    update('lineItems', contract.lineItems.map(i => i.id === id ? { ...i, [field]: value } : i))

  const handleSave = () => {
    onSave(contract)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  const handleDownload = () => {
    const html = generateHTML(contract, entityName, entityClient || '')
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `Contract_${entityId}.html`; a.click()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update('fromLogo', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const hasItems = contract.lineItems.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Party details */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `rgba(${accentColor === C.orange ? '249,115,22' : '59,130,246'},0.03)` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Contract Details</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={contract.contractNo} onChange={e => update('contractNo', e.target.value)}
              placeholder="Contract No." style={{ ...iStyle, width: 140, fontSize: 12 }} />
            <input type="date" value={contract.dateFrom} onChange={e => update('dateFrom', e.target.value)} style={{ ...iStyle, width: 140, fontSize: 12 }} />
            <span style={{ color: C.faint, alignSelf: 'center', fontSize: 12 }}>to</span>
            <input type="date" value={contract.dateTo} onChange={e => update('dateTo', e.target.value)} style={{ ...iStyle, width: 140, fontSize: 12 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* From */}
          <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>From — Contractor</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div onClick={() => logoRef.current?.click()} style={{ width: 64, height: 64, borderRadius: 8, border: `2px dashed ${contract.fromLogo ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}>
                {contract.fromLogo ? <img src={contract.fromLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 20 }}>🏢</span>}
              </div>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              <input value={contract.fromCompany} onChange={e => update('fromCompany', e.target.value)} placeholder="Company name" style={{ ...iStyle, fontWeight: 700 }} />
            </div>
            {[
              { field: 'fromAddress', placeholder: 'Full address with PIN' },
              { field: 'fromGstin',   placeholder: 'GSTIN' },
              { field: 'fromContact', placeholder: 'Email / Phone' },
            ].map((f, i) => (
              <input key={i} value={(contract as any)[f.field]} onChange={e => update(f.field as any, e.target.value)}
                placeholder={f.placeholder} style={{ ...iStyle, fontSize: 12, marginBottom: 8 }} />
            ))}
          </div>
          {/* To */}
          <div style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>To — Client / Party</div>
            <input value={contract.toCompany} onChange={e => update('toCompany', e.target.value)} placeholder={entityClient || 'Client name'} style={{ ...iStyle, fontWeight: 700, marginBottom: 8 }} />
            {[
              { field: 'toAddress', placeholder: 'Client address' },
              { field: 'toGstin',   placeholder: 'Client GSTIN' },
              { field: 'toContact', placeholder: 'Client email / phone' },
            ].map((f, i) => (
              <input key={i} value={(contract as any)[f.field]} onChange={e => update(f.field as any, e.target.value)}
                placeholder={f.placeholder} style={{ ...iStyle, fontSize: 12, marginBottom: 8 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            Rates & Charges <span style={{ fontSize: 11, color: C.faint, marginLeft: 8 }}>{contract.lineItems.length} items</span>
          </div>
          <button onClick={() => setShowAddItem(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            <Plus size={13} /> Add Item
          </button>
        </div>

        {!hasItems ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.faint }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No items yet</div>
            <div style={{ fontSize: 12 }}>Click "Add Item" to add rates and charges</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                {['#', 'Description', 'Unit', 'Rate / Price', 'Notes', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contract.lineItems.map((item, i) => {
                const isEditing = editingItem === item.id
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)` }}>
                    <td style={{ padding: '11px 16px', color: C.orange, fontSize: 13, fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '11px 16px' }}>
                      {isEditing ? <input value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)} style={{ ...iStyle, fontSize: 13 }} />
                        : <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.category}</div>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {isEditing
                        ? <div style={{ position: 'relative' }}>
                            <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                              style={{ ...iStyle, width: 130, appearance: 'none', paddingRight: 28 }}>
                              {UNITS.map(u => <option key={u}>{u}</option>)}
                            </select>
                            <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
                          </div>
                        : <span style={{ fontSize: 11, color: C.muted, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>{item.unit}</span>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {isEditing ? <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} style={{ ...iStyle, width: 120, fontSize: 15, fontWeight: 800, color: C.green }} />
                        : <div style={{ fontSize: 17, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>₹{item.price.toLocaleString()} <span style={{ fontSize: 10, color: C.faint, fontWeight: 400 }}>{item.unit}</span></div>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {isEditing ? <input value={item.notes} onChange={e => updateItem(item.id, 'notes', e.target.value)} placeholder="Notes..." style={{ ...iStyle, fontSize: 12 }} />
                        : <span style={{ fontSize: 12, color: C.faint }}>{item.notes || '—'}</span>}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isEditing
                          ? <>
                              <button onClick={() => setEditingItem(null)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: C.green, cursor: 'pointer' }}><Check size={12} /></button>
                              <button onClick={() => setEditingItem(null)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={12} /></button>
                            </>
                          : <button onClick={() => setEditingItem(item.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}><Edit2 size={12} /></button>}
                        <button onClick={() => deleteItem(item.id)} style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Terms */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Terms & Conditions</div>
        <textarea value={contract.terms} onChange={e => update('terms', e.target.value)} rows={5}
          style={{ ...iStyle, resize: 'vertical', lineHeight: '1.7', fontSize: 12 }} />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, position: 'sticky', bottom: 12 }}>
        <div style={{ flex: 1, fontSize: 12, color: C.faint }}>{hasItems ? `${contract.lineItems.length} items · ${entityName}` : 'Add items to build the contract'}</div>
        {savedMsg && <span style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Saved — synced to Invoicing</span>}
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: C.green, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Save size={13} /> Save Contract
        </button>
        <button onClick={handleDownload} disabled={!hasItems}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: hasItems ? 'pointer' : 'not-allowed', opacity: hasItems ? 1 : 0.5 }}>
          <Download size={13} /> Download
        </button>
        <Link href={`${invoiceHref}?id=${entityId}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>
          <FileText size={13} /> Go to Invoice →
        </Link>
      </div>

      {showAddItem && <AddItemModal categories={categories} onAdd={addItem} onClose={() => setShowAddItem(false)} />}
    </div>
  )
}

function emptyContract(id: string): ContractData {
  return {
    id, contractNo: `CTR-2026-${id}`, dateFrom: '', dateTo: '',
    lineItems: [],
    fromCompany: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
    fromAddress: '', fromGstin: '', fromContact: '', fromLogo: '',
    toCompany: '', toAddress: '', toGstin: '', toContact: '',
    terms: DEFAULT_TERMS,
  }
}

function generateHTML(contract: ContractData, name: string, client: string): string {
  const rows = contract.lineItems.map((item, i) => `
    <tr><td>${i + 1}</td><td>${item.category}</td><td>${item.unit}</td>
    <td style="text-align:right;font-weight:700">₹${item.price.toLocaleString()}</td>
    <td>${item.notes || '—'}</td></tr>`).join('')
  return `<!DOCTYPE html><html><head><title>Contract — ${name}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:860px;margin:0 auto}
.header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #F97316;margin-bottom:28px}
.title{font-size:28px;font-weight:900;color:#F97316;text-align:right}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#111;color:#fff;padding:10px 12px;text-align:left;font-size:11px}
td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#9CA3AF}
</style></head><body>
<div class="header">
<div><div style="font-size:16px;font-weight:800">${contract.fromCompany}</div>
<div style="font-size:12px;color:#555;margin-top:4px">${contract.fromAddress}<br>GSTIN: ${contract.fromGstin}<br>${contract.fromContact}</div></div>
<div><div class="title">CONTRACT</div><div style="font-size:12px;color:#555;text-align:right;margin-top:6px">No. ${contract.contractNo}<br>${name}<br>Client: ${client}</div></div>
</div>
<table><tr><th>#</th><th>Description</th><th>Unit</th><th style="text-align:right">Rate</th><th>Notes</th></tr>${rows}</table>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px;padding-top:20px;border-top:1px solid #eee">
<div><div style="border-bottom:1px solid #333;height:40px;margin-bottom:8px"></div><div style="font-size:11px;color:#888">Authorised Signatory — Contractor</div></div>
<div><div style="border-bottom:1px solid #333;height:40px;margin-bottom:8px"></div><div style="font-size:11px;color:#888">Authorised Signatory — Client</div></div>
</div>
<div class="footer">Generated by XPLORIX Finance Module</div>
</body></html>`
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function CostingPage() {
  const { updateRate, PROJECTS: ctxProjects } = useCostingRates() as any
  const [activeTab, setActiveTab] = useState<'client' | 'rig'>('client')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedRig, setSelectedRig] = useState<string | null>(null)
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set())
  const [savedRigs, setSavedRigs] = useState<Set<string>>(new Set())

  const handleSaveProject = (projId: string, contract: ContractData) => {
    // Sync to costing context for invoicing
    const rates: any = { contractType: 'meterage', band1To: 200, band1Rate: 0, band2From: 200, band2To: 400, band2Rate: 0, band3From: 400, band3Rate: 0, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0, mobilisation: 0, demobilisation: 0, gst: 0, tds: 0, retention: 0 }
    contract.lineItems.forEach(item => {
      const lbl = item.category.toLowerCase()
      if (lbl.includes('band 1'))        rates.band1Rate       = item.price
      if (lbl.includes('band 2'))        rates.band2Rate       = item.price
      if (lbl.includes('band 3'))        rates.band3Rate       = item.price
      if (lbl.includes('drilling day')) { rates.drillingDayRate = item.price; rates.contractType = 'dayrate' }
      if (lbl.includes('standby day') && lbl.includes('rate')) rates.standbyDayRate = item.price
      if (lbl.includes('standby') && !lbl.includes('day rate')) rates.standbyRate = item.price
      if (lbl.includes('repair'))        rates.repairDayRate   = item.price
      if (lbl.includes('mobilisation') && !lbl.includes('demo')) rates.mobilisation = item.price
      if (lbl.includes('demobilisation')) rates.demobilisation = item.price
      if (lbl === 'gst')                 rates.gst             = item.price
      if (lbl.includes('tds'))           rates.tds             = item.price
      if (lbl.includes('retention'))     rates.retention       = item.price
    })
    updateRate(projId, rates)
    setSavedProjects(prev => new Set([...prev, projId]))
  }

  const handleSaveRig = (rigId: string) => {
    setSavedRigs(prev => new Set([...prev, rigId]))
  }

  const TABS = [
    { id: 'client' as const, label: 'Client Contracts', icon: '📋', desc: 'Billing rates per project — feeds into Project Invoice' },
    { id: 'rig'    as const, label: 'Rig Costs',        icon: '🚛', desc: 'Operating costs per rig — feeds into Rig Invoice' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Finance & Costing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Set your rates once — billing and CPM calculate automatically</p>
        </div>
        <FinanceNav active="Costing" />
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedProject(null); setSelectedRig(null) }} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 14,
            cursor: 'pointer', transition: 'all 0.2s', border: 'none', textAlign: 'left',
            background: activeTab === t.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : C.card,
            boxShadow: activeTab === t.id ? '0 4px 20px rgba(249,115,22,0.3)' : `0 0 0 1px ${C.border}`,
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: activeTab === t.id ? '#fff' : C.text }}>{t.label}</div>
              <div style={{ fontSize: 11, color: activeTab === t.id ? 'rgba(255,255,255,0.7)' : C.faint, marginTop: 2 }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* CLIENT CONTRACTS */}
      {activeTab === 'client' && (
        <>
          {/* Project selector */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Select Project</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PROJECTS.map(p => {
                const isSaved = savedProjects.has(p.id)
                return (
                  <button key={p.id} onClick={() => setSelectedProject(p.id)} style={{
                    padding: '10px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedProject === p.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedProject === p.id ? 'transparent' : C.border}`,
                    color: selectedProject === p.id ? '#fff' : C.muted,
                    boxShadow: selectedProject === p.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{p.client} {isSaved ? '· ✅ Saved' : ''}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedProject && (
            <ContractBuilder
              entityId={selectedProject}
              entityName={PROJECTS.find(p => p.id === selectedProject)?.fullName || selectedProject}
              entityClient={PROJECTS.find(p => p.id === selectedProject)?.client}
              categories={CLIENT_CATEGORIES}
              invoiceHref="/admin/finance/invoicing"
              accentColor={C.orange}
              saved={savedProjects.has(selectedProject)}
              onSave={contract => handleSaveProject(selectedProject, contract)}
            />
          )}

          {!selectedProject && (
            <div style={{ padding: '60px', textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Select a project to build its client contract</div>
              <div style={{ fontSize: 13, color: C.faint }}>Set billing rates, GST, TDS, retention — feeds into Project Invoice automatically</div>
            </div>
          )}
        </>
      )}

      {/* RIG COSTS */}
      {activeTab === 'rig' && (
        <>
          {/* Rig selector */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Select Rig</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {RIGS.map(r => {
                const isSaved = savedRigs.has(r.id)
                return (
                  <button key={r.id} onClick={() => setSelectedRig(r.id)} style={{
                    padding: '10px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedRig === r.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedRig === r.id ? 'transparent' : C.border}`,
                    color: selectedRig === r.id ? '#fff' : C.muted,
                    boxShadow: selectedRig === r.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.id}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{r.project} {isSaved ? '· ✅ Saved' : ''}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedRig && (
            <ContractBuilder
              entityId={selectedRig}
              entityName={`${selectedRig} — ${RIGS.find(r => r.id === selectedRig)?.project}`}
              entityClient={RIGS.find(r => r.id === selectedRig)?.project}
              categories={RIG_CATEGORIES}
              invoiceHref="/admin/finance/invoicing"
              accentColor={C.blue}
              saved={savedRigs.has(selectedRig)}
              onSave={() => handleSaveRig(selectedRig)}
            />
          )}

          {!selectedRig && (
            <div style={{ padding: '60px', textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚛</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Select a rig to set its costs</div>
              <div style={{ fontSize: 13, color: C.faint }}>Set operating rates, labour, fuel and maintenance — feeds into Rig Invoice and CPM calculation</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

