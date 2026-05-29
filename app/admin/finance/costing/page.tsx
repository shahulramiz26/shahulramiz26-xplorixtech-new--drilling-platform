'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Trash2, Edit2, Check, X, Download,
  ChevronDown, FileText, Building2, Info,
  Save, Eye, Package
} from 'lucide-react'
import { useCostingRates, PROJECTS } from '../costing-context'

// ── COLOURS ───────────────────────────────────────────────────────────────
const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B',
}

// ── STANDARD LINE ITEM CATEGORIES ─────────────────────────────────────────
const STANDARD_CATEGORIES = [
  // Meterage
  { label: 'Meterage Band 1 (0–200m)',     unit: '₹/meter',  defaultPrice: 850,    group: 'Meterage Rates'    },
  { label: 'Meterage Band 2 (200–400m)',   unit: '₹/meter',  defaultPrice: 950,    group: 'Meterage Rates'    },
  { label: 'Meterage Band 3 (400m+)',      unit: '₹/meter',  defaultPrice: 1050,   group: 'Meterage Rates'    },
  // Day rates
  { label: 'Drilling Day Rate',            unit: '₹/day',    defaultPrice: 28000,  group: 'Day Rates'         },
  { label: 'Standby Day Rate',             unit: '₹/day',    defaultPrice: 12000,  group: 'Day Rates'         },
  { label: 'Repair / Breakdown Day Rate',  unit: '₹/day',    defaultPrice: 8000,   group: 'Day Rates'         },
  // One-time
  { label: 'Mobilisation Charges',         unit: '₹ lump sum', defaultPrice: 250000, group: 'One-Time Charges' },
  { label: 'Demobilisation Charges',       unit: '₹ lump sum', defaultPrice: 150000, group: 'One-Time Charges' },
  // Statutory
  { label: 'GST',                          unit: '%',        defaultPrice: 18,     group: 'Statutory'         },
  { label: 'TDS (Section 194C)',           unit: '%',        defaultPrice: 2,      group: 'Statutory'         },
  { label: 'Retention Money',             unit: '%',        defaultPrice: 5,      group: 'Statutory'         },
  { label: 'Security Deposit',            unit: '%',        defaultPrice: 5,      group: 'Statutory'         },
  // Labour
  { label: 'Driller Day Rate',             unit: '₹/day',    defaultPrice: 1500,   group: 'Labour'            },
  { label: 'Helper Day Rate',              unit: '₹/day',    defaultPrice: 800,    group: 'Labour'            },
  { label: 'Supervisor Day Rate',          unit: '₹/day',    defaultPrice: 2000,   group: 'Labour'            },
  // Consumables removed — pulled from Inventory automatically
  // Fuel
  { label: 'Diesel / Fuel',               unit: '₹/litre',  defaultPrice: 97,     group: 'Fuel'              },
  { label: 'Fuel Lump Sum (monthly)',      unit: '₹/month',  defaultPrice: 38000,  group: 'Fuel'              },
]

const GROUPS = STANDARD_CATEGORIES.map(c => c.group).filter((g, i, arr) => arr.indexOf(g) === i)

const UNITS = ['₹/meter', '₹/day', '₹/month', '₹ lump sum', '%', '₹/bit', '₹/litre', '₹/bucket', '₹/shift', '₹/hole', 'Other']

// ── TYPES ─────────────────────────────────────────────────────────────────
interface LineItem {
  id: string
  category: string
  unit: string
  price: number
  notes: string
  isCustom: boolean
}

interface ContractData {
  projectId: string
  contractNo: string
  dateFrom: string
  dateTo: string
  lineItems: LineItem[]
  fromCompany: string
  fromAddress: string
  fromGstin: string
  fromContact: string
  fromLogo: string
  toCompany: string
  toAddress: string
  toGstin: string
  toContact: string
  terms: string
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────
const iStyle: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}

// ── FINANCE NAV ───────────────────────────────────────────────────────────
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
function AddItemModal({ onAdd, onClose }: { onAdd: (item: LineItem) => void; onClose: () => void }) {
  const [mode, setMode] = useState<'standard' | 'custom'>('standard')
  const [selectedGroup, setSelectedGroup] = useState('Meterage Rates')
  const [selectedCat, setSelectedCat] = useState(STANDARD_CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [customUnit, setCustomUnit] = useState('₹/day')
  const [price, setPrice] = useState(850)
  const [notes, setNotes] = useState('')

  const filteredCats = STANDARD_CATEGORIES.filter(c => c.group === selectedGroup)

  const handleAdd = () => {
    const item: LineItem = {
      id: Date.now().toString(),
      category: mode === 'standard' ? selectedCat.label : customCategory,
      unit: mode === 'standard' ? selectedCat.unit : customUnit,
      price,
      notes,
      isCustom: mode === 'custom',
    }
    onAdd(item)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, width: 540 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Add Line Item</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>Choose from standard categories or add a custom item</div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'standard', label: '📋 Standard Category', desc: 'Pick from common drilling items' },
            { id: 'custom',   label: '✏️ Custom Item',       desc: 'Write your own category'         },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)} style={{
              flex: 1, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              background: mode === m.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mode === m.id ? 'rgba(249,115,22,0.4)' : C.border}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: mode === m.id ? C.orange : C.text }}>{m.label}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Standard mode */}
        {mode === 'standard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Group selector */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Category Group</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {GROUPS.map(g => (
                  <button key={g} onClick={() => {
                    setSelectedGroup(g)
                    const first = STANDARD_CATEGORIES.find(c => c.group === g)!
                    setSelectedCat(first)
                    setPrice(first.defaultPrice)
                  }} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedGroup === g ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedGroup === g ? 'rgba(249,115,22,0.4)' : C.border}`,
                    color: selectedGroup === g ? C.orange : C.faint,
                  }}>{g}</button>
                ))}
              </div>
            </div>

            {/* Category dropdown */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Line Item</div>
              <div style={{ position: 'relative' }}>
                <select value={selectedCat.label} onChange={e => {
                  const cat = STANDARD_CATEGORIES.find(c => c.label === e.target.value)!
                  setSelectedCat(cat)
                  setPrice(cat.defaultPrice)
                }} style={{ ...iStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}>
                  {filteredCats.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Unit: <span style={{ color: C.orange }}>{selectedCat.unit}</span></div>
            </div>
          </div>
        )}

        {/* Custom mode */}
        {mode === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Category Name</div>
              <input value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                placeholder="e.g. Casing Shoe Charges, Survey Charges..."
                style={iStyle} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Unit</div>
              <div style={{ position: 'relative' }}>
                <select value={customUnit === 'Other' || !UNITS.includes(customUnit) ? 'Other' : customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                  style={{ ...iStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 }}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
              </div>
              {(customUnit === 'Other' || !UNITS.slice(0, -1).includes(customUnit)) && (
                <input
                  value={customUnit === 'Other' ? '' : customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                  placeholder="Type your unit (e.g. ₹/hole, ₹/sample...)"
                  style={{ ...iStyle, marginTop: 8, fontSize: 13 }}
                  autoFocus
                />
              )}
            </div>
          </div>
        )}

        {/* Price + notes — always shown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Price / Rate</div>
            <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)}
              style={{ ...iStyle, fontSize: 18, fontWeight: 800, color: C.orange, textAlign: 'center' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Notes (optional)</div>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional note..."
              style={iStyle} />
          </div>
        </div>

        {/* Summary preview */}
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            Adding: <span style={{ color: C.text, fontWeight: 700 }}>{mode === 'standard' ? selectedCat.label : customCategory || 'Custom item'}</span>
            {' '}at <span style={{ color: C.orange, fontWeight: 700 }}>₹{price.toLocaleString()}</span>
            {' '}<span style={{ color: C.faint }}>{mode === 'standard' ? selectedCat.unit : customUnit}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAdd} disabled={mode === 'custom' && !customCategory.trim()}
            style={{ flex: 2, padding: '12px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)', opacity: mode === 'custom' && !customCategory.trim() ? 0.5 : 1 }}>
            Add to Contract
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CONTRACT PREVIEW / DOWNLOAD ───────────────────────────────────────────
function generateContractHTML(contract: ContractData, projectName: string): string {
  const rows = contract.lineItems.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.category}</td>
      <td>${item.unit}</td>
      <td style="text-align:right;font-weight:700">₹${item.price.toLocaleString()}</td>
      <td>${item.notes || '—'}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
  <title>Contract — ${projectName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; color: #111; background: #fff; padding: 0; }
    .page { max-width: 860px; margin: 0 auto; padding: 48px 48px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 3px solid #F97316; margin-bottom: 32px; }
    .logo-area { display: flex; flex-direction: column; gap: 6px; }
    .logo-placeholder { width: 80px; height: 80px; background: #FFF7ED; border: 2px dashed #F97316; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #F97316; font-weight: 700; text-align: center; }
    .company-name { font-size: 16px; font-weight: 800; color: #111; margin-top: 8px; }
    .company-detail { font-size: 12px; color: #555; line-height: 1.7; }
    .contract-badge { text-align: right; }
    .contract-title { font-size: 28px; font-weight: 900; color: #F97316; letter-spacing: -1px; }
    .contract-no { font-size: 13px; color: #555; margin-top: 6px; }
    .contract-date { font-size: 12px; color: #888; margin-top: 4px; }
    
    /* Parties */
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .party-box { padding: 16px 20px; border-radius: 10px; background: #F9FAFB; border: 1px solid #E5E7EB; }
    .party-label { font-size: 10px; font-weight: 800; color: #F97316; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .party-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .party-detail { font-size: 12px; color: #555; line-height: 1.6; }
    
    /* Project info */
    .project-info { padding: 14px 20px; border-radius: 10px; background: #FFF7ED; border: 1px solid #FED7AA; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
    .project-label { font-size: 11px; color: #92400E; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .project-value { font-size: 16px; font-weight: 800; color: #C2410C; }
    .date-range { font-size: 12px; color: #92400E; }
    
    /* Line items */
    .section-title { font-size: 12px; font-weight: 800; color: #374151; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr { background: #111; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.06em; text-transform: uppercase; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #F3F4F6; }
    tbody tr:nth-child(even) { background: #FAFAFA; }
    tbody td { padding: 10px 14px; font-size: 13px; color: #374151; vertical-align: top; }
    tbody td:first-child { font-weight: 700; color: #F97316; width: 32px; }
    
    /* Terms */
    .terms { padding: 16px 20px; border-radius: 10px; background: #F9FAFB; border: 1px solid #E5E7EB; margin-bottom: 32px; }
    .terms-text { font-size: 12px; color: #555; line-height: 1.8; white-space: pre-wrap; }
    
    /* Signature */
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 24px; border-top: 1px solid #E5E7EB; }
    .sig-box { }
    .sig-line { border-bottom: 1.5px solid #374151; height: 40px; margin-bottom: 8px; }
    .sig-label { font-size: 11px; color: #888; }
    .sig-name { font-size: 13px; font-weight: 700; color: #374151; margin-top: 4px; }
    
    /* Footer */
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11px; color: #9CA3AF; }
    .footer span { color: #F97316; font-weight: 700; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo-area">
      ${contract.fromLogo
        ? `<img src="${contract.fromLogo}" style="width:80px;height:80px;object-fit:contain;border-radius:8px;" />`
        : `<div class="logo-placeholder">YOUR<br>LOGO</div>`}
      <div class="company-name">${contract.fromCompany || 'Your Company Name'}</div>
      <div class="company-detail">${contract.fromAddress || ''}<br>GSTIN: ${contract.fromGstin || '—'}<br>${contract.fromContact || ''}</div>
    </div>
    <div class="contract-badge">
      <div class="contract-title">CONTRACT</div>
      <div class="contract-no">No. ${contract.contractNo || 'CTR-2026-001'}</div>
      <div class="contract-date">Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <!-- Parties -->
  <div class="parties">
    <div class="party-box">
      <div class="party-label">From (Contractor)</div>
      <div class="party-name">${contract.fromCompany || 'Your Company Name'}</div>
      <div class="party-detail">${contract.fromAddress || '—'}<br>GSTIN: ${contract.fromGstin || '—'}<br>${contract.fromContact || '—'}</div>
    </div>
    <div class="party-box">
      <div class="party-label">To (Client)</div>
      <div class="party-name">${contract.toCompany || 'Client Name'}</div>
      <div class="party-detail">${contract.toAddress || '—'}<br>GSTIN: ${contract.toGstin || '—'}<br>${contract.toContact || '—'}</div>
    </div>
  </div>

  <!-- Project info -->
  <div class="project-info">
    <div>
      <div class="project-label">Project</div>
      <div class="project-value">${projectName}</div>
    </div>
    ${contract.dateFrom || contract.dateTo ? `
    <div style="text-align:right">
      <div class="project-label">Contract Period</div>
      <div class="date-range">${contract.dateFrom || '—'} to ${contract.dateTo || '—'}</div>
    </div>` : ''}
  </div>

  <!-- Line items -->
  <div class="section-title">Rates & Charges</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Unit</th>
        <th style="text-align:right">Rate / Price</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <!-- Terms -->
  ${contract.terms ? `
  <div class="section-title">Terms & Conditions</div>
  <div class="terms">
    <div class="terms-text">${contract.terms}</div>
  </div>` : ''}

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory</div>
      <div class="sig-name">${contract.fromCompany || 'Contractor'}</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Authorised Signatory</div>
      <div class="sig-name">${contract.toCompany || 'Client'}</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    Generated by <span>XPLORIX</span> · Finance & Costing Module · ${new Date().toLocaleDateString('en-IN')}
  </div>

</div>
</body>
</html>`
}

// ── DEFAULT TERMS ─────────────────────────────────────────────────────────
const DEFAULT_TERMS = `1. Payment shall be made within 30 days of invoice submission after MB certification.
2. TDS shall be deducted at source as per Section 194C of the Income Tax Act.
3. Retention money shall be released within 30 days of project completion and final inspection.
4. Standby charges are applicable when the contractor's equipment is kept idle due to client-side reasons.
5. Mobilisation charges are payable within 15 days of rig deployment at site.
6. Any additional work beyond the scope of this contract shall be billed separately with prior approval.
7. This contract is subject to the jurisdiction of courts at the contractor's registered address.`

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function CostingPage() {
  const { updateRate } = useCostingRates()

  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  // All contracts stored per project
  const [contracts, setContracts] = useState<Record<string, ContractData>>({})

  const proj = PROJECTS.find(p => p.id === selectedProject)

  // Get or initialise contract for selected project
  const getContract = (projId: string): ContractData => {
    return contracts[projId] || {
      projectId: projId,
      contractNo: `CTR-2026-${String(Object.keys(contracts).length + 1).padStart(3, '0')}`,
      dateFrom: '', dateTo: '',
      lineItems: [],
      fromCompany: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
      fromAddress: '', fromGstin: '', fromContact: '', fromLogo: '',
      toCompany: PROJECTS.find(p => p.id === projId)?.client || '',
      toAddress: '', toGstin: '', toContact: '',
      terms: DEFAULT_TERMS,
    }
  }

  const contract = selectedProject ? getContract(selectedProject) : null

  const updateContract = (field: keyof ContractData, value: any) => {
    if (!selectedProject) return
    setContracts(prev => ({
      ...prev,
      [selectedProject]: { ...getContract(selectedProject), [field]: value }
    }))
  }

  const addItem = (item: LineItem) => {
    if (!selectedProject) return
    const current = getContract(selectedProject)
    updateContract('lineItems', [...current.lineItems, item])
  }

  const deleteItem = (id: string) => {
    if (!selectedProject || !contract) return
    updateContract('lineItems', contract.lineItems.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    if (!selectedProject || !contract) return
    updateContract('lineItems', contract.lineItems.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const handleSave = () => {
    if (!selectedProject || !contract) return
    // Build rates ONLY from what user actually added as line items
    // Start with zeroes — no hidden defaults
    const rates: any = {
      contractType: 'meterage',
      band1To: 200, band1Rate: 0,
      band2From: 200, band2To: 400, band2Rate: 0,
      band3From: 400, band3Rate: 0,
      standbyRate: 0,
      drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0,
      mobilisation: 0, demobilisation: 0,
      gst: 0, tds: 0, retention: 0,
    }
    contract.lineItems.forEach(item => {
      const lbl = item.category.toLowerCase()
      if (lbl.includes('band 1') || lbl.includes('meterage band 1'))       rates.band1Rate        = item.price
      if (lbl.includes('band 2') || lbl.includes('meterage band 2'))       rates.band2Rate        = item.price
      if (lbl.includes('band 3') || lbl.includes('meterage band 3'))       rates.band3Rate        = item.price
      if (lbl.includes('standby day rate') && !lbl.includes('drilling'))  { rates.standbyDayRate   = item.price; if (rates.drillingDayRate > 0) rates.contractType = 'dayrate' }
      if (lbl.includes('standby') && !lbl.includes('day rate'))            rates.standbyRate      = item.price
      if (lbl.includes('drilling day'))                                   { rates.drillingDayRate  = item.price; rates.contractType = 'dayrate' }
      if (lbl.includes('repair') || lbl.includes('breakdown'))             rates.repairDayRate    = item.price
      if (lbl.includes('mobilisation') && !lbl.includes('demo'))           rates.mobilisation     = item.price
      if (lbl.includes('demobilisation'))                                   rates.demobilisation   = item.price
      if (lbl === 'gst')                                                    rates.gst              = item.price
      if (lbl.includes('tds'))                                              rates.tds              = item.price
      if (lbl.includes('retention'))                                        rates.retention        = item.price
    })
    updateRate(selectedProject, rates)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDownload = () => {
    if (!selectedProject || !contract || !proj) return
    const html = generateContractHTML(contract, proj.fullName)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Contract_${selectedProject}_${new Date().toISOString().split('T')[0]}.html`
    a.click()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateContract('fromLogo', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // Group items by category group for display
  const getItemGroup = (item: LineItem) => {
    if (item.isCustom) return 'Custom'
    return STANDARD_CATEGORIES.find(c => c.label === item.category)?.group || 'Other'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48, background: C.bg, minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, letterSpacing: '-0.5px' }}>Finance & Costing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Build contracts per project — rates auto-feed into billing and CPM engine</p>
        </div>
        <FinanceNav active="Costing" />
      </div>

      {/* Step 1 — Select Project */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          Step 1 — Select Project
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PROJECTS.map(p => {
            const hasContract = contracts[p.id]?.lineItems?.length > 0
            return (
              <button key={p.id} onClick={() => setSelectedProject(p.id)} style={{
                padding: '10px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                background: selectedProject === p.id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedProject === p.id ? 'transparent' : C.border}`,
                color: selectedProject === p.id ? '#fff' : C.muted,
                boxShadow: selectedProject === p.id ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {p.client} {hasContract ? '· ✅ Contract set' : '· No contract yet'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contract builder — shown after project selected */}
      {selectedProject && contract && proj && (
        <>
          {/* Step 2 — Party Details */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.03)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 10 }}>Step 2</span>
                Contract Details — {proj.fullName}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={contract.contractNo} onChange={e => updateContract('contractNo', e.target.value)}
                  placeholder="Contract No."
                  style={{ ...iStyle, width: 160, fontSize: 12 }} />
                <input type="date" value={contract.dateFrom} onChange={e => updateContract('dateFrom', e.target.value)}
                  style={{ ...iStyle, width: 150, fontSize: 12 }} />
                <span style={{ color: C.faint, alignSelf: 'center', fontSize: 12 }}>to</span>
                <input type="date" value={contract.dateTo} onChange={e => updateContract('dateTo', e.target.value)}
                  style={{ ...iStyle, width: 150, fontSize: 12 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

              {/* From — Contractor */}
              <div style={{ padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>From — Contractor</div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  {/* Logo upload */}
                  <div onClick={() => logoRef.current?.click()} style={{ width: 72, height: 72, borderRadius: 10, border: `2px dashed ${contract.fromLogo ? C.orange : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.orange}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = contract.fromLogo ? C.orange : C.border}>
                    {contract.fromLogo
                      ? <img src={contract.fromLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ textAlign: 'center' }}><Building2 size={20} style={{ color: C.faint, margin: '0 auto 4px' }} /><div style={{ fontSize: 9, color: C.faint }}>Logo</div></div>}
                  </div>
                  <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  <input value={contract.fromCompany} onChange={e => updateContract('fromCompany', e.target.value)}
                    placeholder="Company name"
                    style={{ ...iStyle, fontSize: 13, fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { field: 'fromAddress', placeholder: 'Full address with PIN code' },
                    { field: 'fromGstin',   placeholder: 'GSTIN (e.g. 27AAAAA0000A1Z5)' },
                    { field: 'fromContact', placeholder: 'Email / Phone' },
                  ].map((f, i) => (
                    <input key={i} value={(contract as any)[f.field]} onChange={e => updateContract(f.field as keyof ContractData, e.target.value)}
                      placeholder={f.placeholder} style={{ ...iStyle, fontSize: 12 }} />
                  ))}
                </div>
              </div>

              {/* To — Client */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>To — Client</div>
                <div style={{ marginBottom: 14 }}>
                  <input value={contract.toCompany} onChange={e => updateContract('toCompany', e.target.value)}
                    placeholder="Client company name"
                    style={{ ...iStyle, fontSize: 13, fontWeight: 700 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { field: 'toAddress', placeholder: 'Client address' },
                    { field: 'toGstin',   placeholder: 'Client GSTIN' },
                    { field: 'toContact', placeholder: 'Client email / phone' },
                  ].map((f, i) => (
                    <input key={i} value={(contract as any)[f.field]} onChange={e => updateContract(f.field as keyof ContractData, e.target.value)}
                      placeholder={f.placeholder} style={{ ...iStyle, fontSize: 12 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 — Line Items */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.03)' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 10 }}>Step 3</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Rates & Charges</span>
                <span style={{ fontSize: 11, color: C.faint, marginLeft: 10 }}>{contract.lineItems.length} items added</span>
              </div>
              <button onClick={() => setShowAddItem(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            {contract.lineItems.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No items added yet</div>
                <div style={{ fontSize: 13, color: C.faint, marginBottom: 20 }}>Click "Add Item" to add meterage rates, day rates, mobilisation charges and more</div>
                <button onClick={() => setShowAddItem(true)} style={{ padding: '10px 24px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
                  + Add First Item
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                    {['#', 'Description', 'Unit', 'Rate / Price', 'Notes', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.lineItems.map((item, i) => {
                    const isEditing = editingItem === item.id
                    const group = getItemGroup(item)
                    return (
                      <tr key={item.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.orange }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {isEditing
                            ? <input value={item.category} onChange={e => updateItem(item.id, 'category', e.target.value)} style={{ ...iStyle, fontSize: 13 }} />
                            : <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.category}</div>
                                <div style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{group}{item.isCustom ? ' · Custom' : ''}</div>
                              </div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isEditing
                            ? <div style={{ position: 'relative' }}>
                                <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                                  style={{ ...iStyle, width: 120, appearance: 'none', paddingRight: 28, cursor: 'pointer', fontSize: 12 }}>
                                  {UNITS.map(u => <option key={u}>{u}</option>)}
                                </select>
                                <ChevronDown size={11} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none' }} />
                              </div>
                            : <span style={{ fontSize: 12, color: C.muted, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>{item.unit}</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isEditing
                            ? <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                style={{ ...iStyle, width: 130, fontSize: 16, fontWeight: 800, color: C.green }} />
                            : <div style={{ fontSize: 18, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>
                                ₹{item.price.toLocaleString()}
                                <span style={{ fontSize: 11, color: C.faint, fontWeight: 400, marginLeft: 4 }}>{item.unit}</span>
                              </div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {isEditing
                            ? <input value={item.notes} onChange={e => updateItem(item.id, 'notes', e.target.value)} placeholder="Notes..." style={{ ...iStyle, fontSize: 12 }} />
                            : <span style={{ fontSize: 12, color: C.faint }}>{item.notes || '—'}</span>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => setEditingItem(null)} style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: C.green, cursor: 'pointer' }}><Check size={13} /></button>
                                <button onClick={() => setEditingItem(null)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={13} /></button>
                              </>
                            ) : (
                              <button onClick={() => setEditingItem(item.id)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}><Edit2 size={13} /></button>
                            )}
                            <button onClick={() => deleteItem(item.id)} style={{ padding: '6px 10px', borderRadius: 7, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Step 4 — Terms */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Step 4 — Terms & Conditions
            </div>
            <textarea value={contract.terms} onChange={e => updateContract('terms', e.target.value)}
              rows={8}
              style={{ ...iStyle, resize: 'vertical', lineHeight: '1.7', fontSize: 12 }} />
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, position: 'sticky', bottom: 16 }}>
            <div style={{ flex: 1, fontSize: 12, color: C.faint }}>
              {contract.lineItems.length > 0
                ? `${contract.lineItems.length} items · ${proj.fullName} · ${proj.client}`
                : 'Add items to build the contract'}
            </div>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <Check size={13} style={{ color: C.green }} />
                <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Saved — rates synced to Invoicing</span>
              </div>
            )}
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: C.green, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              <Save size={14} /> Save Contract
            </button>
            <button onClick={handleDownload} disabled={contract.lineItems.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: contract.lineItems.length === 0 ? 'not-allowed' : 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.3)', opacity: contract.lineItems.length === 0 ? 0.5 : 1 }}>
              <Download size={14} /> Download Contract
            </button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!selectedProject && (
        <>
          <div style={{ padding: '60px', textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Select a project to build its contract</div>
            <div style={{ fontSize: 13, color: C.faint }}>Each project gets its own contract with custom rates, party details and downloadable PDF</div>
          </div>

          {/* Saved contracts overview */}
          {Object.keys(contracts).filter(k => contracts[k]?.lineItems?.length > 0).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Saved Contracts</div>
                <span style={{ fontSize: 11, color: C.faint }}>{Object.keys(contracts).filter(k => contracts[k]?.lineItems?.length > 0).length} contracts saved</span>
              </div>
              {Object.entries(contracts).map(([projId, c], i) => {
                const p = PROJECTS.find(x => x.id === projId)
                if (!c.lineItems?.length) return null
                // Find key rates from line items
                const hasGST = c.lineItems.some(l => l.category.toLowerCase() === 'gst')
                const hasTDS = c.lineItems.some(l => l.category.toLowerCase().includes('tds'))
                const hasMob = c.lineItems.some(l => l.category.toLowerCase().includes('mobilisation') && !l.category.toLowerCase().includes('demo'))
                const isDayRate = c.lineItems.some(l => l.category.toLowerCase().includes('drilling day'))
                return (
                  <div key={projId} style={{ padding: '18px 24px', borderBottom: `1px solid rgba(30,41,59,0.5)`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📋</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{p?.fullName || projId}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: C.green, border: '1px solid rgba(16,185,129,0.2)' }}>✅ Saved</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isDayRate ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)', color: isDayRate ? C.blue : C.orange, border: `1px solid ${isDayRate ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)'}` }}>
                              {isDayRate ? '📅 Day Rate' : '📏 Meterage'}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: C.faint, marginTop: 5, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <span>{p?.client}</span>
                            <span>{c.lineItems.length} line items</span>
                            {c.contractNo && <span>No. {c.contractNo}</span>}
                            {c.dateFrom && c.dateTo && <span>{c.dateFrom} → {c.dateTo}</span>}
                            {hasGST && <span style={{ color: C.blue }}>GST included</span>}
                            {hasTDS && <span style={{ color: C.red }}>TDS included</span>}
                            {hasMob && <span style={{ color: C.green }}>Mobilisation included</span>}
                          </div>
                          {/* Line items preview */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                            {c.lineItems.slice(0, 5).map((item, j) => (
                              <span key={j} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted }}>
                                {item.category}: ₹{item.price.toLocaleString()} {item.unit}
                              </span>
                            ))}
                            {c.lineItems.length > 5 && <span style={{ fontSize: 10, color: C.faint }}>+{c.lineItems.length - 5} more</span>}
                          </div>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setSelectedProject(projId)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <Edit2 size={13} /> Edit
                          </button>
                          <button onClick={() => {
                            const html = generateContractHTML(c, p?.fullName || projId)
                            const blob = new Blob([html], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a'); a.href = url; a.download = `Contract_${projId}.html`; a.click()
                          }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            <Download size={13} /> Download
                          </button>
                        </div>
                        {/* Go to Invoice button */}
                        <Link href={`/admin/finance/invoicing?project=${projId}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px 14px', borderRadius: 8, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>
                          <FileText size={13} /> Go to Invoice →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Add item modal */}
      {showAddItem && <AddItemModal onAdd={addItem} onClose={() => setShowAddItem(false)} />}
    </div>
  )
}

