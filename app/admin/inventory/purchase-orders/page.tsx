'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Search, ChevronDown, X, Check, Truck,
  FileText, Clock, Package, ChevronRight, AlertCircle, Download, Building2, User, Bell
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
type POStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled'
interface POLineItem { id: string; partNumber: string; partName: string; qtyOrdered: number; qtyReceived: number; unitCost: number; unit: string }
interface PurchaseOrder {
  id: string; poNumber: string; supplier: string; supplierId: string; project: string
  orderDate: string; expectedDate: string; billNo: string; billDate: string
  status: POStatus; lineItems: POLineItem[]; notes: string
  receivedBy?: string; receivedDate?: string
}
interface CompanyProfile {
  name: string; address: string; gstin: string; contact: string; logo: string
}

// ── PARTS CATALOGUE (for auto-fill) ───────────────────────────────────────
const partsCatalogue: Record<string, { name: string; unit: string; unitCost: number }> = {
  'NQ-CB-SR06':  { name:'NQ Core Bit SR-06',           unit:'Each',   unitCost:11500  },
  'NQ-CB-SR08':  { name:'NQ Core Bit SR-08',           unit:'Each',   unitCost:11500  },
  'HQ-CB-SR06':  { name:'HQ Core Bit SR-06',           unit:'Each',   unitCost:19000  },
  'HQ-CB-SR08':  { name:'HQ Core Bit SR-08',           unit:'Each',   unitCost:22000  },
  'HQ-CB-SR10':  { name:'HQ Core Bit SR-10',           unit:'Each',   unitCost:19000  },
  'BQ-CB-SR06':  { name:'BQ Core Bit SR-06',           unit:'Each',   unitCost:10000  },
  'MTX-DD955':   { name:'MATEX DD955 Liquid Poly Pail',unit:'Bucket', unitCost:12151  },
  'MTX-SD-PPL':  { name:'MATEX Sand Drill Poly Pail',  unit:'Bucket', unitCost:16886  },
  'MTX-TQL':     { name:'MATEX Torqueless',            unit:'Bucket', unitCost:9547   },
  'ADD-EA-20':   { name:'ADDRILL EA-20 KG',            unit:'Kg',     unitCost:3200   },
  'ADD-PAB-25':  { name:'ADDRILL PAB 25 KG',           unit:'Kg',     unitCost:4375   },
  'NQ-CL-001':   { name:'NQ Core Lifter',              unit:'Each',   unitCost:400    },
  'HQ-CL-001':   { name:'HQ Core Lifter',              unit:'Each',   unitCost:646    },
  'NQ-RS-SPR':   { name:'NQ Reaming Shell Spiral',     unit:'Each',   unitCost:13455  },
  'FLT-FWS-01':  { name:'Fuel Water Separator',        unit:'Each',   unitCost:2374   },
  'FLT-LB-B71':  { name:'Lube Filter B7125',           unit:'Each',   unitCost:1990   },
  'FLT-RC-PI2':  { name:'Racor Filter PI2020PM',       unit:'Each',   unitCost:1155   },
  'FLT-AIR-P':   { name:'Air Filter Primary',          unit:'Each',   unitCost:5000   },
  'SEL-VP-25K':  { name:'V-Packing W/S 25K',          unit:'Each',   unitCost:780    },
  'BRG-SKF-61830':{ name:'Bearing 61830 MA SKF',       unit:'Each',   unitCost:41074  },
  'BRG-SKF-29330':{ name:'Bearing 29330E SKF',         unit:'Each',   unitCost:102325 },
  'LUB-TCZ50':   { name:'TCZ-50 Grease 25 KG',        unit:'Kg',     unitCost:12500  },
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const suppliers = [
  { id:'SUP-001', name:'ROCKTEK INFRA SERVICES PVT. LTD.' },
  { id:'SUP-002', name:'IDP (Ideal Diamond Products)' },
  { id:'SUP-003', name:'WESTFIELDS SERVICES' },
  { id:'SUP-004', name:'AB EMULTECH PVT. LTD.' },
  { id:'SUP-005', name:'AMOGH ENTERPRISES' },
  { id:'SUP-006', name:'M.S. ENTERPRISES' },
  { id:'SUP-007', name:'SANDVIK' },
  { id:'SUP-008', name:'EZYDRILL' },
  { id:'SUP-009', name:'DRILLMAN' },
  { id:'SUP-010', name:'DHANBAD ENGINEERING' },
  { id:'SUP-011', name:'SPECIALITY LUBRICANTS' },
  { id:'SUP-012', name:'MOULI ENTERPRISES' },
  { id:'NEW',     name:'Custom / New Supplier' },
]

const projectOptions = [
  'RS-01 - Chhindwara',
  'CMP-MAD - Madheri',
  'CMPDI-DAM - Bokaro',
  'DGMIL-BHK - Bhalukona',
  'PAT-CMPDI - Pathakuri',
  'MECL-HIN - Bazar Gaon',
]

// Real POs from customer April 2026 data
const seedPOs: PurchaseOrder[] = [
  {
    id:'1', poNumber:'PO-2026-056', supplier:'IDP (Ideal Diamond Products)', supplierId:'SUP-002', project:'RS-01 - Chhindwara',
    orderDate:'28.04.2026', expectedDate:'05.05.2026', billNo:'56/2627', billDate:'28.04.2026',
    status:'Received', notes:'Urgent order for drill bits', receivedBy:'Rajesh Kumar', receivedDate:'29.04.2026',
    lineItems:[
      { id:'1a', partNumber:'HQ-CB-SR06', partName:'HQ Core Bit SR-06', qtyOrdered:2,  qtyReceived:2,  unitCost:22000, unit:'Each' },
      { id:'1b', partNumber:'HQ-CB-SR08', partName:'HQ Core Bit SR-08', qtyOrdered:8,  qtyReceived:8,  unitCost:22000, unit:'Each' },
    ]
  },
  {
    id:'2', poNumber:'PO-2026-055', supplier:'WESTFIELDS SERVICES', supplierId:'SUP-003', project:'RS-01 - Chhindwara',
    orderDate:'06.04.2026', expectedDate:'10.04.2026', billNo:'WFS-NGP-2118', billDate:'06.04.2026',
    status:'Received', notes:'', receivedBy:'Suresh Singh', receivedDate:'08.04.2026',
    lineItems:[
      { id:'2a', partNumber:'MTX-SD-PPL', partName:'MATEX Sand Drill Poly Pail', qtyOrdered:10, qtyReceived:10, unitCost:16886, unit:'Bucket' },
      { id:'2b', partNumber:'MTX-DD955',  partName:'MATEX DD955 Liquid Poly',    qtyOrdered:10, qtyReceived:10, unitCost:12151, unit:'Bucket' },
    ]
  },
  {
    id:'3', poNumber:'PO-2026-060', supplier:'ROCKTEK INFRA SERVICES PVT. LTD.', supplierId:'SUP-001', project:'CMP-MAD - Madheri',
    orderDate:'29.04.2026', expectedDate:'08.05.2026', billNo:'', billDate:'',
    status:'Ordered', notes:'Reaming shells and couplings',
    lineItems:[
      { id:'3a', partNumber:'NQ-RS-SPR', partName:'NQ Reaming Shell Spiral', qtyOrdered:5,  qtyReceived:0, unitCost:13455, unit:'Each' },
      { id:'3b', partNumber:'NQ-LC-001', partName:'NQ Locking Coupling',     qtyOrdered:10, qtyReceived:0, unitCost:6195,  unit:'Each' },
    ]
  },
  {
    id:'4', poNumber:'PO-2026-061', supplier:'AB EMULTECH PVT. LTD.', supplierId:'SUP-004', project:'CMPDI-DAM - Bokaro',
    orderDate:'30.04.2026', expectedDate:'05.05.2026', billNo:'AB028', billDate:'',
    status:'Partially Received', notes:'Monthly additives order',
    lineItems:[
      { id:'4a', partNumber:'ADD-EA-20',  partName:'ADDRILL EA-20 KG',  qtyOrdered:60, qtyReceived:40, unitCost:3200, unit:'Kg' },
      { id:'4b', partNumber:'ADD-PAB-25', partName:'ADDRILL PAB 25 KG', qtyOrdered:20, qtyReceived:10, unitCost:4375, unit:'Kg' },
    ]
  },
  {
    id:'5', poNumber:'PO-2026-059', supplier:'M.S. ENTERPRISES', supplierId:'SUP-006', project:'RS-01 - Chhindwara',
    orderDate:'27.04.2026', expectedDate:'03.05.2026', billNo:'', billDate:'',
    status:'Draft', notes:'Hoses and filters',
    lineItems:[
      { id:'5a', partNumber:'FLT-FWS-01', partName:'Fuel Water Separator', qtyOrdered:12, qtyReceived:0, unitCost:2374, unit:'Each' },
      { id:'5b', partNumber:'FLT-LB-B71', partName:'Lube Filter B7125',    qtyOrdered:8,  qtyReceived:0, unitCost:1990, unit:'Each' },
    ]
  },
]

// ── DEFAULT COMPANY PROFILE ────────────────────────────────────────────────
const defaultCompanyProfile: CompanyProfile = {
  name: 'ANMAK CONSULTANCY SERVICES PRIVATE LIMITED',
  address: 'Enter your company address here',
  gstin: 'Enter GSTIN',
  contact: 'Enter contact details',
  logo: '',
}

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href:'/admin/inventory',                 label:'Dashboard'        },
  { href:'/admin/inventory/catalogue',       label:'Parts Catalogue'  },
  { href:'/admin/inventory/stock',           label:'Stock Management' },
  { href:'/admin/inventory/purchase-orders', label:'Purchase Orders'  },
  { href:'/admin/inventory/suppliers',       label:'Suppliers'        },
]

function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4 }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#F97316':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const statusConfig: Record<POStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  'Draft':              { color:'#94A3B8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.15)', icon:<FileText size={11} /> },
  'Ordered':            { color:'#60A5FA', bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.15)',  icon:<Clock size={11} />    },
  'Partially Received': { color:'#F59E0B', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.15)', icon:<Truck size={11} />    },
  'Received':           { color:'#10B981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.15)', icon:<Check size={11} />    },
  'Cancelled':          { color:'#EF4444', bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.15)',  icon:<X size={11} />        },
}

function StatusBadge({ status }: { status: POStatus }) {
  const c = statusConfig[status]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>
      {c.icon} {status}
    </span>
  )
}

// ── RECEIVE CONFIRMATION MODAL ─────────────────────────────────────────────
function ReceiveModal({ po, onClose, onConfirm }: { po: PurchaseOrder; onClose:()=>void; onConfirm:(receivedBy:string, onTime:boolean, daysLate:number, qualityIssue:'none'|'minor'|'rejected')=>void }) {
  const [receivedBy, setReceivedBy] = useState('')
  const [onTime, setOnTime] = useState<boolean|null>(null)
  const [daysLate, setDaysLate] = useState(0)
  const [qualityIssue, setQualityIssue] = useState<'none'|'minor'|'rejected'>('none')
  const [error, setError] = useState(false)
  const { format } = useCurrency()

  const handleConfirm = () => {
    if (!receivedBy.trim()) { setError(true); return }
    if (onTime === null) { setError(true); return }
    onConfirm(receivedBy.trim(), onTime, daysLate, qualityIssue)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:32, width:480 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Confirm Stock Receipt</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{po.poNumber} · {po.supplier}</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>

        {/* Items being received */}
        <div style={{ border:'1px solid #1E293B', borderRadius:12, marginBottom:20, overflow:'hidden' }}>
          <div style={{ padding:'10px 14px', background:'rgba(16,185,129,0.05)', borderBottom:'1px solid #1E293B' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.08em' }}>Items Being Received</div>
          </div>
          {po.lineItems.map(item => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderBottom:'1px solid rgba(30,41,59,0.4)' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{item.partName}</div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:1, fontFamily:'monospace' }}>{item.partNumber}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#10B981' }}>{item.qtyOrdered} {item.unit}</div>
                <div style={{ fontSize:11, color:'#64748B' }}>{format(item.qtyOrdered * item.unitCost)}</div>
              </div>
            </div>
          ))}
          <div style={{ padding:'10px 14px', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#64748B' }}>Total Value</span>
            <span style={{ fontSize:14, fontWeight:800, color:'#F97316' }}>{format(po.lineItems.reduce((s,i)=>s+i.qtyOrdered*i.unitCost,0))}</span>
          </div>
        </div>

        {/* Stock impact note */}
        <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#60A5FA', fontWeight:600 }}>📦 Stock will auto-increase for {po.project.split(' - ')[0]} upon confirmation</div>
        </div>

        {/* Received by */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Received By *</div>
          <div style={{ position:'relative' }}>
            <User size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
            <input value={receivedBy} onChange={e=>{setReceivedBy(e.target.value);setError(false)}} placeholder="Enter your full name..."
              style={{ width:'100%', padding:'11px 12px 11px 34px', background:'#080B10', border:`1px solid ${error&&!receivedBy?'#EF4444':'#1E293B'}`, borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }} />
          </div>
          <div style={{ fontSize:11, color:'#64748B', marginTop:6 }}>Date: {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} · This will be recorded on the PO</div>
        </div>

        {/* Q1 — On time? */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Was this delivered on time? *</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>{setOnTime(true);setDaysLate(0)}}
              style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', fontWeight:700, fontSize:13,
                background: onTime===true ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${onTime===true ? 'rgba(16,185,129,0.4)' : error&&onTime===null ? '#EF4444' : '#1E293B'}`,
                color: onTime===true ? '#10B981' : '#94A3B8',
              }}>✅ Yes, on time</button>
            <button onClick={()=>setOnTime(false)}
              style={{ flex:1, padding:'11px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', fontWeight:700, fontSize:13,
                background: onTime===false ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${onTime===false ? 'rgba(239,68,68,0.35)' : error&&onTime===null ? '#EF4444' : '#1E293B'}`,
                color: onTime===false ? '#EF4444' : '#94A3B8',
              }}>❌ No, delayed</button>
          </div>
          {onTime===false && (
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:12, color:'#94A3B8', whiteSpace:'nowrap' }}>Delayed by:</div>
              <input type="number" min={1} value={daysLate} onChange={e=>setDaysLate(parseInt(e.target.value)||0)}
                style={{ width:80, padding:'8px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', textAlign:'center' }} />
              <div style={{ fontSize:12, color:'#64748B' }}>days</div>
            </div>
          )}
        </div>

        {/* Q2 — Quality */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>Quality of items received?</div>
          <div style={{ display:'flex', gap:8 }}>
            {([
              { value:'none'     as const, label:'✅ No Issues',     activeColor:'#10B981', activeBg:'rgba(16,185,129,0.12)', activeBorder:'rgba(16,185,129,0.4)'  },
              { value:'minor'    as const, label:'⚠️ Minor Issues',  activeColor:'#F59E0B', activeBg:'rgba(245,158,11,0.12)', activeBorder:'rgba(245,158,11,0.4)'  },
              { value:'rejected' as const, label:'❌ Items Rejected', activeColor:'#EF4444', activeBg:'rgba(239,68,68,0.1)',  activeBorder:'rgba(239,68,68,0.35)'  },
            ]).map(opt=>(
              <button key={opt.value} onClick={()=>setQualityIssue(opt.value)}
                style={{ flex:1, padding:'10px 6px', borderRadius:10, cursor:'pointer', transition:'all 0.2s', fontWeight:600, fontSize:11,
                  background: qualityIssue===opt.value ? opt.activeBg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${qualityIssue===opt.value ? opt.activeBorder : '#1E293B'}`,
                  color: qualityIssue===opt.value ? opt.activeColor : '#94A3B8',
                }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Supplier score note */}
        <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#F59E0B', fontWeight:600 }}>⭐ Your answers update the supplier performance score automatically</div>
        </div>

        {error && <div style={{ fontSize:11, color:'#EF4444', marginBottom:12 }}>⚠ Please fill in all required fields before confirming.</div>}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#10B981,#059669)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Check size={15} /> Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

// ── COMPANY PROFILE MODAL ──────────────────────────────────────────────────
function CompanyProfileModal({ profile, onClose, onSave }: { profile: CompanyProfile; onClose:()=>void; onSave:(p:CompanyProfile)=>void }) {
  const [form, setForm] = useState({...profile})
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:32, width:520 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Company Profile</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Printed on all Purchase Order PDFs</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { label:'Company Name', field:'name', placeholder:'ANMAK CONSULTANCY SERVICES PVT. LTD.' },
            { label:'Company Address', field:'address', placeholder:'Full registered address with PIN code' },
            { label:'GSTIN', field:'gstin', placeholder:'e.g. 27AAAAA0000A1Z5' },
            { label:'Contact (Email / Phone)', field:'contact', placeholder:'email@company.com · +91 XXXXX XXXXX' },
          ].map((f,i)=>(
            <div key={i}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
              <input value={(form as any)[f.field]} onChange={e=>setForm(p=>({...p,[f.field]:e.target.value}))} placeholder={f.placeholder}
                style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }} />
            </div>
          ))}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Company Logo</div>
            <div style={{ border:'2px dashed #1E293B', borderRadius:10, padding:'20px', textAlign:'center', cursor:'pointer' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}}>
              <div style={{ fontSize:24, marginBottom:6 }}>🏢</div>
              <div style={{ fontSize:12, color:'#64748B' }}>Click to upload logo · PNG or SVG recommended</div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>{onSave(form);onClose()}} style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>Save Profile</button>
        </div>
      </div>
    </div>
  )
}

// ── NEW PO MODAL ───────────────────────────────────────────────────────────
function NewPOModal({ onClose, onSave, companyProfile, prefilledProject, prefilledItems }: {
  onClose:()=>void; onSave:(po:PurchaseOrder)=>void; companyProfile: CompanyProfile
  prefilledProject?: string
  prefilledItems?: {partName:string; partNumber:string; qty:number; unit:string}[]
}) {
  const { format } = useCurrency()
  const [supplier, setSupplier] = useState(suppliers[0].name)
  const [supplierId, setSupplierId] = useState(suppliers[0].id)
  const [customSupplier, setCustomSupplier] = useState('')
  const [project, setProject] = useState(prefilledProject || projectOptions[0])
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDate, setExpectedDate] = useState('')
  const [billNo, setBillNo] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<POLineItem[]>(() => {
    if (prefilledItems && prefilledItems.length > 0) {
      return prefilledItems.map((item, i) => {
        const cat = partsCatalogue[item.partNumber.toUpperCase()]
        return {
          id: `new${i}`,
          partNumber: item.partNumber,
          partName: item.partName,
          qtyOrdered: item.qty,
          qtyReceived: 0,
          unitCost: cat ? cat.unitCost : 0,
          unit: item.unit,
        }
      })
    }
    return [{ id:'new1', partNumber:'', partName:'', qtyOrdered:1, qtyReceived:0, unitCost:0, unit:'Each' }]
  })
  const [priceUpdatePrompt, setPriceUpdatePrompt] = useState<{id:string; partNumber:string; oldPrice:number; newPrice:number}|null>(null)
  const [taxData, setTaxData] = useState({ cgst:0, sgst:0, igst:0, tds:0, freight:0, other:0 })

  const addItem = () => setItems(i => [...i, { id:`new${Date.now()}`, partNumber:'', partName:'', qtyOrdered:1, qtyReceived:0, unitCost:0, unit:'Each' }])
  const removeItem = (id: string) => setItems(i => i.filter(x => x.id !== id))

  // Auto-fill from parts catalogue when part number is entered
  const handlePartNumberChange = (id: string, value: string) => {
    setItems(i => i.map(x => {
      if (x.id !== id) return x
      const match = partsCatalogue[value.toUpperCase()]
      if (match) {
        return { ...x, partNumber: value.toUpperCase(), partName: match.name, unit: match.unit, unitCost: match.unitCost }
      }
      return { ...x, partNumber: value }
    }))
  }

  // When unit cost is changed manually, offer to update catalogue
  const handleCostChange = (id: string, newCost: number) => {
    const item = items.find(x => x.id === id)
    if (!item) return
    const catalogueEntry = partsCatalogue[item.partNumber]
    if (catalogueEntry && catalogueEntry.unitCost !== newCost && newCost > 0) {
      setPriceUpdatePrompt({ id, partNumber: item.partNumber, oldPrice: catalogueEntry.unitCost, newPrice: newCost })
    }
    setItems(i => i.map(x => x.id === id ? {...x, unitCost: newCost} : x))
  }

  const totalValue = items.reduce((s,i) => s + i.qtyOrdered * i.unitCost, 0)
  const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`

  const inputS: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }
  const selectS: React.CSSProperties = { ...inputS, cursor:'pointer', appearance:'none' as any }

  // Download PO as PDF-ready HTML
  const downloadPO = () => {
    const html = `
<!DOCTYPE html><html><head><title>${poNumber}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:800px;margin:0 auto}
.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #F97316}
.company{font-size:18px;font-weight:700}.po-no{font-size:22px;font-weight:800;color:#F97316}
table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#F97316;color:#fff;padding:10px;text-align:left}
td{padding:9px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#fafafa}
.total{text-align:right;font-size:16px;font-weight:700;margin-top:15px;color:#F97316}
.footer{margin-top:40px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:15px}
</style></head><body>
<div class="header">
  <div><div class="company">${companyProfile.name}</div><div style="font-size:12px;color:#666;margin-top:4px">${companyProfile.address}</div><div style="font-size:12px;color:#666">GSTIN: ${companyProfile.gstin}</div></div>
  <div style="text-align:right"><div class="po-no">${poNumber}</div><div style="font-size:12px;color:#666;margin-top:4px">Date: ${orderDate}</div><div style="font-size:12px;color:#666">Project: ${project}</div></div>
</div>
<div style="margin-bottom:20px"><strong>Supplier:</strong> ${supplier === 'Custom / New Supplier' ? customSupplier : supplier} (${supplierId})</div>
<table><tr><th>#</th><th>Part No</th><th>Description</th><th>Unit</th><th>Qty</th><th>Unit Cost</th><th>Amount</th></tr>
${items.map((item,i)=>`<tr><td>${i+1}</td><td>${item.partNumber}</td><td>${item.partName}</td><td>${item.unit}</td><td>${item.qtyOrdered}</td><td>₹${item.unitCost.toLocaleString()}</td><td>₹${(item.qtyOrdered*item.unitCost).toLocaleString()}</td></tr>`).join('')}
</table>
<div class="total">Total: ₹${totalValue.toLocaleString()}</div>
${notes ? `<div style="margin-top:20px"><strong>Notes:</strong> ${notes}</div>` : ''}
<div class="footer">This is a computer-generated Purchase Order from XPLORIX · ${companyProfile.contact}</div>
</body></html>`
    const blob = new Blob([html], { type:'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${poNumber}.html`; a.click()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:'100%', maxWidth:800, maxHeight:'90vh', overflowY:'auto' }}>

        {/* Modal Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>New Purchase Order</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Auto-number: <span style={{ color:'#F97316', fontFamily:'monospace' }}>{poNumber}</span></div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>

        {/* PO Details */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
          {[
            { label:'Supplier / Party', content: (
              <>
                <select value={supplier} onChange={e=>{const s=suppliers.find(x=>x.name===e.target.value);setSupplier(e.target.value);setSupplierId(s?.id||'NEW')}} style={selectS}>
                  {suppliers.map(s=><option key={s.id}>{s.name}</option>)}
                </select>
                {supplier === 'Custom / New Supplier' && <input value={customSupplier} onChange={e=>setCustomSupplier(e.target.value)} placeholder="Enter supplier name" style={{...inputS, marginTop:6}} />}
                {supplier !== 'Custom / New Supplier' && <div style={{ fontSize:10, color:'#64748B', marginTop:4 }}>Supplier ID: <span style={{ color:'#F97316', fontFamily:'monospace' }}>{supplierId}</span></div>}
              </>
            )},
            { label:'Receiving Project', content: <select value={project} onChange={e=>setProject(e.target.value)} style={selectS}>{projectOptions.map(p=><option key={p}>{p}</option>)}</select> },
            { label:'Order Date',        content: <input type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} style={inputS} /> },
            { label:'Expected Delivery', content: <input type="date" value={expectedDate} onChange={e=>setExpectedDate(e.target.value)} style={inputS} /> },
            { label:'Bill / Invoice No', content: <input value={billNo} onChange={e=>setBillNo(e.target.value)} placeholder="e.g. 56/2627 or WFS-NGP-2112" style={inputS} /> },
            { label:'Notes',             content: <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes..." style={inputS} /> },
          ].map((f,i)=>(
            <div key={i}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
              {f.content}
            </div>
          ))}
        </div>

        {/* Auto-fill hint */}
        <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:14 }}>
          <div style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>💡 Smart Auto-fill: Type a Part Number (e.g. NQ-CB-SR06) — description, unit & price fill automatically from your catalogue</div>
        </div>

        {/* Line Items */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Line Items</div>
            <button onClick={addItem} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Plus size={12} /> Add Item
            </button>
          </div>
          <div style={{ border:'1px solid #1E293B', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid #1E293B' }}>
                  {['Part Number','Part Name (auto-fills)','Unit','Qty','Unit Cost','Amount',''].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item,i)=>(
                  <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <td style={{ padding:'8px 12px' }}>
                      <input value={item.partNumber} onChange={e=>handlePartNumberChange(item.id, e.target.value)} placeholder="e.g. NQ-CB-SR06"
                        style={{...inputS,fontSize:11,padding:'6px 8px',width:110,fontFamily:'monospace'}} />
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <input value={item.partName} onChange={e=>setItems(i=>i.map(x=>x.id===item.id?{...x,partName:e.target.value}:x))} placeholder="Auto-fills from part number"
                        style={{...inputS,fontSize:11,padding:'6px 8px',minWidth:180, color: partsCatalogue[item.partNumber] ? '#10B981' : '#F8FAFC'}} />
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <select value={item.unit} onChange={e=>setItems(i=>i.map(x=>x.id===item.id?{...x,unit:e.target.value}:x))} style={{...selectS,fontSize:11,padding:'6px 8px',width:80}}>
                        {['Each','Kg','Litre','Set','Metre','Box','Bucket','Roll','MTR','NOS'].map(u=><option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <input type="number" value={item.qtyOrdered} onChange={e=>setItems(i=>i.map(x=>x.id===item.id?{...x,qtyOrdered:parseInt(e.target.value)||0}:x))}
                        style={{...inputS,fontSize:11,padding:'6px 8px',width:60,textAlign:'center'}} />
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <input type="number" value={item.unitCost} onChange={e=>handleCostChange(item.id, parseFloat(e.target.value)||0)}
                        style={{...inputS,fontSize:11,padding:'6px 8px',width:90}} />
                    </td>
                    <td style={{ padding:'8px 12px', fontSize:12, fontWeight:700, color:'#10B981', whiteSpace:'nowrap' }}>
                      ₹{(item.qtyOrdered * item.unitCost).toLocaleString()}
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <button onClick={()=>removeItem(item.id)} style={{ padding:4, borderRadius:5, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.5)', cursor:'pointer' }}>
                        <X size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                  <td colSpan={5} style={{ padding:'10px 12px', fontSize:12, fontWeight:700, color:'#64748B' }}>Total Order Value</td>
                  <td style={{ padding:'10px 12px', fontSize:15, fontWeight:800, color:'#F97316' }}>₹{totalValue.toLocaleString()}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Tax & Freight Section — Change 7 */}
        <TaxSection subtotal={totalValue} onTaxChange={setTaxData} />

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={downloadPO} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, flex:1, padding:'12px', borderRadius:10, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60A5FA', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Download size={14} /> Download PO
          </button>
          <button onClick={()=>{ const po: PurchaseOrder = { id:Date.now().toString(), poNumber, supplier: supplier==='Custom / New Supplier'?customSupplier:supplier, supplierId, project, orderDate, expectedDate, billNo, billDate:'', status:'Draft', lineItems:items, notes }; onSave(po); onClose() }}
            style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(148,163,184,0.1)', border:'1px solid rgba(148,163,184,0.2)', color:'#94A3B8', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Save as Draft
          </button>
          <button onClick={()=>{ const po: PurchaseOrder = { id:Date.now().toString(), poNumber, supplier: supplier==='Custom / New Supplier'?customSupplier:supplier, supplierId, project, orderDate, expectedDate, billNo, billDate:'', status:'Ordered', lineItems:items, notes }; onSave(po); onClose() }}
            style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' }}>
            Place Order →
          </button>
        </div>
      </div>

      {/* Price update prompt */}
      {priceUpdatePrompt && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#0D1117', border:'1px solid rgba(249,115,22,0.3)', borderRadius:16, padding:24, width:380 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#F8FAFC', marginBottom:12 }}>💰 Price Changed</div>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:16 }}>
              <strong style={{ color:'#F8FAFC' }}>{priceUpdatePrompt.partNumber}</strong> unit cost changed from <span style={{ color:'#EF4444' }}>₹{priceUpdatePrompt.oldPrice.toLocaleString()}</span> to <span style={{ color:'#10B981' }}>₹{priceUpdatePrompt.newPrice.toLocaleString()}</span>.<br /><br />
              Update the price in your <strong>Parts Catalogue</strong> too?
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setPriceUpdatePrompt(null)} style={{ flex:1, padding:'9px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer' }}>No, this PO only</button>
              <button onClick={()=>{ partsCatalogue[priceUpdatePrompt.partNumber].unitCost = priceUpdatePrompt.newPrice; setPriceUpdatePrompt(null) }}
                style={{ flex:1, padding:'9px', borderRadius:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                Yes, update catalogue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── TAX SECTION COMPONENT (Change 7) ─────────────────────────────────────
interface TaxData { cgst:number; sgst:number; igst:number; tds:number; freight:number; other:number }
function TaxSection({ subtotal, onTaxChange }: { subtotal:number; onTaxChange:(t:TaxData)=>void }) {
  const { format } = useCurrency()
  const [tax, setTax] = useState<TaxData>({ cgst:0, sgst:0, igst:0, tds:0, freight:0, other:0 })
  const [useIGST, setUseIGST] = useState(false)

  const update = (field:keyof TaxData, val:number) => {
    const newTax = {...tax, [field]:val}
    // If IGST is set, clear CGST+SGST and vice versa
    if (field==='igst' && val>0) { newTax.cgst=0; newTax.sgst=0; setUseIGST(true) }
    if ((field==='cgst'||field==='sgst') && val>0) { newTax.igst=0; setUseIGST(false) }
    setTax(newTax)
    onTaxChange(newTax)
  }

  const cgstAmt   = (subtotal * tax.cgst) / 100
  const sgstAmt   = (subtotal * tax.sgst) / 100
  const igstAmt   = (subtotal * tax.igst) / 100
  const tdsAmt    = (subtotal * tax.tds)  / 100
  const totalTax  = cgstAmt + sgstAmt + igstAmt
  const totalDeductions = tdsAmt
  const totalWithTax = subtotal + totalTax + tax.freight + tax.other - totalDeductions

  const iStyle2: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'#080B10', border:'1px solid #1E293B', borderRadius:7, color:'#F8FAFC', fontSize:12, outline:'none', textAlign:'right' as any }

  return (
    <div style={{ border:'1px solid #1E293B', borderRadius:14, overflow:'hidden', marginBottom:20 }}>
      {/* Header */}
      <div style={{ padding:'12px 16px', background:'rgba(249,115,22,0.05)', borderBottom:'1px solid #1E293B', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Tax & Charges</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#64748B' }}>Inter-state (IGST)?</span>
          <button onClick={()=>{ setUseIGST(!useIGST); if (!useIGST) update('igst',0); else { update('cgst',0); update('sgst',0) } }}
            style={{ width:36, height:20, borderRadius:10, cursor:'pointer', border:'none', transition:'all 0.2s', position:'relative',
              background: useIGST ? '#F97316' : '#1E293B' }}>
            <div style={{ width:14, height:14, borderRadius:'50%', background:'#fff', position:'absolute', top:3, transition:'all 0.2s', left: useIGST ? 19 : 3 }} />
          </button>
        </div>
      </div>

      <div style={{ padding:'16px' }}>
        {/* Tax fields */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:12 }}>
          {!useIGST ? (
            <>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>CGST %</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="number" min={0} max={100} step={0.5} value={tax.cgst} onChange={e=>update('cgst',parseFloat(e.target.value)||0)} style={iStyle2} />
                  <span style={{ fontSize:12, color:'#10B981', fontWeight:600, whiteSpace:'nowrap' }}>{format(cgstAmt)}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>SGST %</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="number" min={0} max={100} step={0.5} value={tax.sgst} onChange={e=>update('sgst',parseFloat(e.target.value)||0)} style={iStyle2} />
                  <span style={{ fontSize:12, color:'#10B981', fontWeight:600, whiteSpace:'nowrap' }}>{format(sgstAmt)}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>IGST %</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type="number" min={0} max={100} step={0.5} value={tax.igst} onChange={e=>update('igst',parseFloat(e.target.value)||0)} style={iStyle2} />
                <span style={{ fontSize:12, color:'#10B981', fontWeight:600, whiteSpace:'nowrap' }}>{format(igstAmt)}</span>
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>TDS % (Deduction)</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" min={0} max={100} step={0.5} value={tax.tds} onChange={e=>update('tds',parseFloat(e.target.value)||0)} style={iStyle2} />
              <span style={{ fontSize:12, color:'#EF4444', fontWeight:600, whiteSpace:'nowrap' }}>-{format(tdsAmt)}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Freight / Transport (₹)</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" min={0} value={tax.freight} onChange={e=>update('freight',parseFloat(e.target.value)||0)} style={iStyle2} />
              <span style={{ fontSize:12, color:'#F59E0B', fontWeight:600, whiteSpace:'nowrap' }}>{format(tax.freight)}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Other Charges (₹)</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" min={0} value={tax.other} onChange={e=>update('other',parseFloat(e.target.value)||0)} style={iStyle2} />
              <span style={{ fontSize:12, color:'#F59E0B', fontWeight:600, whiteSpace:'nowrap' }}>{format(tax.other)}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ borderTop:'1px solid #1E293B', paddingTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, color:'#64748B' }}>Subtotal (without tax)</span>
            <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>{format(subtotal)}</span>
          </div>
          {(cgstAmt+sgstAmt+igstAmt) > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:'#64748B' }}>Total Tax</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#10B981' }}>+{format(cgstAmt+sgstAmt+igstAmt)}</span>
            </div>
          )}
          {(tax.freight+tax.other) > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:'#64748B' }}>Freight & Other</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#F59E0B' }}>+{format(tax.freight+tax.other)}</span>
            </div>
          )}
          {tdsAmt > 0 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:'#64748B' }}>TDS Deduction</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#EF4444' }}>-{format(tdsAmt)}</span>
            </div>
          )}
          <div style={{ borderTop:'1px solid #1E293B', paddingTop:10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B', textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Without Tax</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#94A3B8', fontFamily:"'Space Grotesk',sans-serif" }}>{format(subtotal + tax.freight + tax.other)}</div>
            </div>
            <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#F97316', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Total with Tax</div>
              <div style={{ fontSize:16, fontWeight:800, color:'#F97316', fontFamily:"'Space Grotesk',sans-serif" }}>{format(totalWithTax)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PART REQUESTS BANNER (shown at top of PO page) ────────────────────────
// ── PAGE ───────────────────────────────────────────────────────────────────
export default function PurchaseOrdersPage() {
  const { format } = useCurrency()
  const [pos, setPos] = useState<PurchaseOrder[]>(seedPOs)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<POStatus|'All'>('All')
  const [filterProject, setFilterProject] = useState('All')
  const [showNewPO, setShowNewPO] = useState(false)
  const [prefilledProject, setPrefilledProject] = useState<string|undefined>(undefined)
  const [prefilledItems, setPrefilledItems] = useState<any[]|undefined>(undefined)
  const [expandedPO, setExpandedPO] = useState<string|null>(null)
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrder|null>(null)
  const [showCompanyProfile, setShowCompanyProfile] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filterRig, setFilterRig] = useState('All Rigs')
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile)
  // Part requests from Stock Management (Change 6)
  const [pendingRequests, setPendingRequests] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('xplorix_part_requests')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) return parsed
      }
    } catch(e) {}
    // fallback seed data
    return [
      { id:'1', items:[{partName:'NQ Core Bit SR-06',partNumber:'NQ-CB-SR06',qty:4,unit:'NOS'},{partName:'HQ Core Lifter',partNumber:'HQ-CL-001',qty:10,unit:'NOS'}], project:'DGMIL-BHK - Bhalukona', rig:'KEM-5', urgency:'Urgent', requestedBy:'Anil Sharma', reason:'Bits worn out, need replacement', date:'24-05-2026', status:'Pending' },
      { id:'2', items:[{partName:'Fuel Water Separator',partNumber:'FLT-FWS-01',qty:6,unit:'NOS'}], project:'RS-01 - Chhindwara', rig:'KEM-1', urgency:'Normal', requestedBy:'Ravi Kumar', reason:'Monthly replacement due', date:'23-05-2026', status:'Pending' },
      { id:'3', items:[{partName:'ADDRILL EA-20 KG',partNumber:'ADD-EA-20',qty:60,unit:'Kg'},{partName:'MATEX DD955 Liquid',partNumber:'MTX-DD955',qty:5,unit:'Bucket'}], project:'CMPDI-DAM - Bokaro', rig:'KEM-6', urgency:'Critical', requestedBy:'Suresh Patil', reason:'Running low on drilling fluids', date:'22-05-2026', status:'Pending' },
    ]
  })

  const filtered = pos.filter(po => {
    const matchStatus = filterStatus==='All' || po.status===filterStatus
    const matchProject = filterProject==='All' || po.project===filterProject
    const matchSearch = search==='' || po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase())
    const matchDateFrom = !dateFrom || po.orderDate >= dateFrom.split('-').reverse().join('.')
    const matchDateTo = !dateTo || po.orderDate <= dateTo.split('-').reverse().join('.')
    return matchStatus && matchProject && matchSearch && matchDateFrom && matchDateTo
  })

  const handleReceiveConfirm = (poId: string, receivedBy: string, onTime: boolean, daysLate: number, qualityIssue: 'none'|'minor'|'rejected') => {
    setPos(prev => prev.map(po => po.id===poId ? {
      ...po, status:'Received' as POStatus,
      lineItems: po.lineItems.map(item => ({...item, qtyReceived:item.qtyOrdered})),
      receivedBy, receivedDate: new Date().toISOString().split('T')[0],
    } : po))
    setReceiveTarget(null)
  }

  const downloadPO = (po: PurchaseOrder) => {
    const total = po.lineItems.reduce((s,i)=>s+i.qtyOrdered*i.unitCost,0)
    const html = `<!DOCTYPE html><html><head><title>${po.poNumber}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:800px;margin:0 auto}
.header{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #F97316}
.company{font-size:18px;font-weight:700}.po-no{font-size:22px;font-weight:800;color:#F97316}
table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#F97316;color:#fff;padding:10px;text-align:left}
td{padding:9px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#fafafa}
.total{text-align:right;font-size:16px;font-weight:700;margin-top:15px;color:#F97316}
.footer{margin-top:40px;font-size:12px;color:#888;border-top:1px solid #eee;padding-top:15px}
</style></head><body>
<div class="header">
  <div><div class="company">${companyProfile.name}</div><div style="font-size:12px;color:#666;margin-top:4px">${companyProfile.address}</div><div style="font-size:12px;color:#666">GSTIN: ${companyProfile.gstin}</div></div>
  <div style="text-align:right"><div class="po-no">${po.poNumber}</div><div style="font-size:12px;color:#666;margin-top:4px">Date: ${po.orderDate}</div><div style="font-size:12px;color:#666">Project: ${po.project}</div></div>
</div>
<div style="margin-bottom:8px"><strong>Supplier:</strong> ${po.supplier} <span style="color:#888;font-size:12px">(${po.supplierId})</span></div>
${po.billNo ? `<div style="margin-bottom:20px"><strong>Bill No:</strong> ${po.billNo} · <strong>Bill Date:</strong> ${po.billDate}</div>` : '<div style="margin-bottom:20px"></div>'}
<table><tr><th>#</th><th>Part No</th><th>Description</th><th>Unit</th><th>Qty</th><th>Unit Cost</th><th>Amount</th></tr>
${po.lineItems.map((item,i)=>`<tr><td>${i+1}</td><td>${item.partNumber}</td><td>${item.partName}</td><td>${item.unit}</td><td>${item.qtyOrdered}</td><td>₹${item.unitCost.toLocaleString()}</td><td>₹${(item.qtyOrdered*item.unitCost).toLocaleString()}</td></tr>`).join('')}
</table>
<div class="total">Total Order Value: ₹${total.toLocaleString()}</div>
${po.receivedBy ? `<div style="margin-top:20px;color:green"><strong>✓ Received by:</strong> ${po.receivedBy} on ${po.receivedDate}</div>` : ''}
${po.notes ? `<div style="margin-top:10px"><strong>Notes:</strong> ${po.notes}</div>` : ''}
<div class="footer">Generated by XPLORIX · ${companyProfile.contact}</div>
</body></html>`
    const blob = new Blob([html], { type:'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`${po.poNumber}.html`; a.click()
  }

  const statusCounts = (Object.keys(statusConfig) as POStatus[]).map(s => ({ status:s, count:pos.filter(p=>p.status===s).length }))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Purchase Orders</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Manage supplier orders, track deliveries and receive stock across all projects</p>
        </div>
        <SubNav active="Purchase Orders" />
      </div>

      {/* Status summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        {statusCounts.map(({ status, count }) => {
          const c = statusConfig[status]
          return (
            <button key={status} onClick={()=>setFilterStatus(filterStatus===status?'All':status)}
              style={{ padding:'14px 16px', borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'left',
                background: filterStatus===status ? c.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filterStatus===status ? c.border : '#1E293B'}`,
              }}>
              <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:filterStatus===status?c.color:'#F8FAFC' }}>{count}</div>
              <div style={{ fontSize:11, color:filterStatus===status?c.color:'#64748B', fontWeight:600, marginTop:2 }}>{status}</div>
            </button>
          )
        })}
      </div>

      {/* Part Requests Banner */}
      {pendingRequests.filter(r=>r.status==='Pending').length > 0 && (
        <div style={{ padding:'14px 20px', borderRadius:14, background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Bell size={16} style={{ color:'#F97316' }} />
              <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>
                {pendingRequests.filter(r=>r.status==='Pending').length} Part Request{pendingRequests.filter(r=>r.status==='Pending').length>1?'s':''} pending — convert to Purchase Order
              </span>
            </div>
            <span style={{ fontSize:11, color:'#64748B' }}>Raised from Stock Management</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {pendingRequests.filter(r=>r.status==='Pending').map((r)=>(
              <div key={r.id} style={{ padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, whiteSpace:'nowrap',
                    background: r.urgency==='Critical'?'rgba(239,68,68,0.1)':r.urgency==='Urgent'?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)',
                    color: r.urgency==='Critical'?'#EF4444':r.urgency==='Urgent'?'#F59E0B':'#10B981',
                    border: `1px solid ${r.urgency==='Critical'?'rgba(239,68,68,0.2)':r.urgency==='Urgent'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)'}`,
                  }}>{r.urgency}</span>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#F8FAFC' }}>
                      {r.items.length} part{r.items.length>1?'s':''} requested
                    </span>
                    <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>
                      By {r.requestedBy} · {r.project.split(' - ')[0]} · {r.rig} · {r.date}
                    </span>
                  </div>
                  <button onClick={()=>{
                    const updated = pendingRequests.map((x:any)=>x.id===r.id?{...x,status:'Converted'}:x)
                    setPendingRequests(updated)
                    try { localStorage.setItem('xplorix_part_requests', JSON.stringify(updated)) } catch(e) {}
                    setPrefilledProject(r.project)
                    setPrefilledItems(r.items)
                    setShowNewPO(true)
                  }}
                    style={{ padding:'6px 16px', borderRadius:8, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:11, fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap' }}>
                    Create PO →
                  </button>
                </div>
                {/* Show parts list */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, paddingLeft:8 }}>
                  {r.items.map((item:any,j:number)=>(
                    <span key={j} style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(255,255,255,0.05)', border:'1px solid #1E293B', color:'#94A3B8' }}>
                      {item.partName} × {item.qty} {item.unit}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:6, paddingLeft:8 }}>Reason: {r.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters + Actions — with date + rig filters */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'12px 16px' }}>
        <div style={{ position:'relative', flex:1, minWidth:160 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PO number, supplier..."
            style={{ width:'100%', padding:'8px 12px 8px 30px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={filterProject} onChange={e=>setFilterProject(e.target.value)}
            style={{ appearance:'none', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:13, padding:'8px 28px 8px 12px', borderRadius:8, cursor:'pointer', outline:'none' }}>
            <option value="All">All Projects</option>
            {projectOptions.map(p=><option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={filterRig} onChange={e=>setFilterRig(e.target.value)}
            style={{ appearance:'none', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:13, padding:'8px 28px 8px 12px', borderRadius:8, cursor:'pointer', outline:'none' }}>
            <option value="All Rigs">All Rigs</option>
            {['KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9'].map(r=><option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#64748B', whiteSpace:'nowrap' }}>From:</span>
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
            style={{ padding:'7px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', cursor:'pointer' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#64748B', whiteSpace:'nowrap' }}>To:</span>
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
            style={{ padding:'7px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', cursor:'pointer' }} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={()=>{setDateFrom('');setDateTo('')}}
            style={{ padding:'7px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:12, fontWeight:600, cursor:'pointer' }}>Clear</button>
        )}
        <button onClick={()=>setShowCompanyProfile(true)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          <Building2 size={14} /> Company Profile
        </button>
        <button onClick={()=>{ setPrefilledProject(undefined); setPrefilledItems(undefined); setShowNewPO(true) }}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' }}>
          <Plus size={14} /> New Purchase Order
        </button>
      </div>

      {/* PO List */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748B', background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 }}>
            No purchase orders found.
          </div>
        )}
        {filtered.map(po => {
          const totalOrdered = po.lineItems.reduce((s,i)=>s+i.qtyOrdered*i.unitCost, 0)
          const isExpanded = expandedPO === po.id
          const pendingDelivery = po.status === 'Ordered' || po.status === 'Partially Received'

          return (
            <div key={po.id} style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, overflow:'hidden', transition:'border-color 0.2s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.2)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}
            >
              {/* PO Header */}
              <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', cursor:'pointer' }}
                onClick={()=>setExpandedPO(isExpanded ? null : po.id)}>
                <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.15)' }}>
                  <Package size={18} style={{ color:'#F97316' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{po.poNumber}</span>
                    <StatusBadge status={po.status} />
                    {po.billNo && <span style={{ fontSize:11, color:'#64748B' }}>Bill: {po.billNo}</span>}
                    <span style={{ fontSize:10, color:'#64748B', padding:'2px 7px', background:'rgba(255,255,255,0.04)', borderRadius:4 }}>{po.supplierId}</span>
                  </div>
                  <div style={{ fontSize:12, color:'#94A3B8', marginTop:3 }}>{po.supplier} · {po.project.split(' - ')[0]}</div>
                  {po.receivedBy && (
                    <div style={{ fontSize:11, color:'#10B981', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                      <Check size={10} /> Received by {po.receivedBy} on {po.receivedDate}
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right', marginRight:8 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:'#F8FAFC' }}>{format(totalOrdered)}</div>
                  <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>{po.lineItems.length} items · {po.orderDate}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={e=>{e.stopPropagation(); downloadPO(po)}}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60A5FA', fontSize:11, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
                    <Download size={11} /> Download
                  </button>
                  {pendingDelivery && (
                    <button onClick={e=>{e.stopPropagation(); setReceiveTarget(po)}}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                      <Truck size={12} /> Receive Stock
                    </button>
                  )}
                </div>
                <ChevronRight size={16} style={{ color:'#64748B', transition:'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none', flexShrink:0 }} />
              </div>

              {/* Expanded Line Items */}
              {isExpanded && (
                <div style={{ borderTop:'1px solid #1E293B' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                        {['Part No','Description','Unit','Qty Ordered','Qty Received','Unit Cost','Amount','Progress'].map(h=>(
                          <th key={h} style={{ padding:'8px 16px', textAlign:'left', fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid #1E293B' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {po.lineItems.map(item => {
                        const pct = item.qtyOrdered > 0 ? (item.qtyReceived/item.qtyOrdered)*100 : 0
                        return (
                          <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.4)' }}>
                            <td style={{ padding:'10px 16px', color:'#94A3B8', fontFamily:'monospace', fontSize:11 }}>{item.partNumber}</td>
                            <td style={{ padding:'10px 16px', fontWeight:600, color:'#F8FAFC' }}>{item.partName}</td>
                            <td style={{ padding:'10px 16px', color:'#64748B' }}>{item.unit}</td>
                            <td style={{ padding:'10px 16px', fontWeight:700, color:'#F8FAFC' }}>{item.qtyOrdered}</td>
                            <td style={{ padding:'10px 16px', fontWeight:700, color: pct===100?'#10B981':pct>0?'#F59E0B':'#64748B' }}>{item.qtyReceived}</td>
                            <td style={{ padding:'10px 16px', color:'#94A3B8' }}>{format(item.unitCost)}</td>
                            <td style={{ padding:'10px 16px', fontWeight:700, color:'#10B981' }}>{format(item.qtyOrdered*item.unitCost)}</td>
                            <td style={{ padding:'10px 16px', minWidth:100 }}>
                              <div style={{ background:'#1A2234', borderRadius:4, height:5 }}>
                                <div style={{ width:`${pct}%`, height:5, borderRadius:4, background: pct===100?'#10B981':pct>0?'#F59E0B':'#1A2234', transition:'width 0.5s' }} />
                              </div>
                              <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{pct.toFixed(0)}%</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                        <td colSpan={6} style={{ padding:'10px 16px', fontSize:12, fontWeight:700, color:'#64748B' }}>Order Total</td>
                        <td style={{ padding:'10px 16px', fontSize:14, fontWeight:800, color:'#F97316' }}>{format(totalOrdered)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                  {po.notes && (
                    <div style={{ padding:'12px 20px', borderTop:'1px solid #1E293B', display:'flex', alignItems:'center', gap:8 }}>
                      <AlertCircle size={13} style={{ color:'#64748B' }} />
                      <span style={{ fontSize:12, color:'#94A3B8' }}>{po.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {showNewPO && <NewPOModal
        onClose={()=>{ setShowNewPO(false); setPrefilledProject(undefined); setPrefilledItems(undefined) }}
        onSave={po=>setPos(prev=>[po,...prev])}
        companyProfile={companyProfile}
        prefilledProject={prefilledProject}
        prefilledItems={prefilledItems}
      />}
      {receiveTarget && <ReceiveModal po={receiveTarget} onClose={()=>setReceiveTarget(null)} onConfirm={(receivedBy, onTime, daysLate, qualityIssue)=>handleReceiveConfirm(receiveTarget.id, receivedBy, onTime, daysLate, qualityIssue)} />}
      {showCompanyProfile && <CompanyProfileModal profile={companyProfile} onClose={()=>setShowCompanyProfile(false)} onSave={setCompanyProfile} />}

    </div>
  )
}

