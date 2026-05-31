'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, ArrowLeftRight, AlertTriangle,
  History, X, Check, Upload, Clock, Package,
  Bell, ChevronDown, Filter
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface StockItem {
  id: string; partNumber: string; name: string; category: string
  currentQty: number; reorderLevel: number; unit: string
  unitCost: number; lastMovement: string; lastMovementType: 'manual' | 'transfer' | 'po'
}
interface Movement {
  id: string; date: string; type: 'in' | 'out' | 'transfer'
  part: string; qty: number; rig?: string
  from?: string; to?: string; note: string; value: number
  by?: string
}
interface TransferItem { id: string; partName: string; partNumber: string; qty: number; unit: string }
interface PartRequestItem { partName: string; partNumber: string; qty: number; unit: string }
interface PartRequest {
  id: string; requestedBy: string
  items: PartRequestItem[]
  project: string; rig: string
  urgency: 'Normal' | 'Urgent' | 'Critical'; reason: string
  date: string; status: 'Pending' | 'Converted' | 'Rejected'
}

// ── DATA ───────────────────────────────────────────────────────────────────
const projectOptions = [
  'RS-01 - Chhindwara', 'CMP-MAD - Madheri', 'CMPDI-DAM - Bokaro',
  'DGMIL-BHK - Bhalukona', 'PAT-CMPDI - Pathakuri', 'MECL-HIN - Bazar Gaon',
]
const rigOptions = ['KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9']
const unitOptions = ['Each','Kg','Litre','Set','Metre','Box','Barrel','Gallon','Bucket','Roll','MTR','NOS']

const partsCatalogueList = [
  { name:'NQ Core Bit SR-06', partNumber:'NQ-CB-SR06', unit:'NOS', unitCost:11500 },
  { name:'HQ Core Bit SR-08', partNumber:'HQ-CB-SR08', unit:'NOS', unitCost:22000 },
  { name:'MATEX DD955 Liquid', partNumber:'MTX-DD955', unit:'Bucket', unitCost:12151 },
  { name:'MATEX Sand Drill', partNumber:'MTX-SD-PPL', unit:'Bucket', unitCost:16886 },
  { name:'ADDRILL EA-20 KG', partNumber:'ADD-EA-20', unit:'Kg', unitCost:3200 },
  { name:'ADDRILL PAB 25 KG', partNumber:'ADD-PAB-25', unit:'Kg', unitCost:4375 },
  { name:'NQ Core Lifter', partNumber:'NQ-CL-001', unit:'NOS', unitCost:400 },
  { name:'HQ Core Lifter', partNumber:'HQ-CL-001', unit:'NOS', unitCost:646 },
  { name:'Fuel Water Separator', partNumber:'FLT-FWS-01', unit:'NOS', unitCost:2374 },
  { name:'Lube Filter B7125', partNumber:'FLT-LB-B71', unit:'NOS', unitCost:1990 },
  { name:'Air Filter Primary', partNumber:'FLT-AIR-P', unit:'NOS', unitCost:5000 },
  { name:'Bearing 61830 MA SKF', partNumber:'BRG-SKF-61830', unit:'NOS', unitCost:41074 },
  { name:'V-Packing W/S 25K', partNumber:'SEL-VP-25K', unit:'NOS', unitCost:780 },
  { name:'TCZ-50 Grease 25 KG', partNumber:'LUB-TCZ50', unit:'Kg', unitCost:12500 },
  { name:'NQ Reaming Shell Spiral', partNumber:'NQ-RS-SPR', unit:'NOS', unitCost:13455 },
]

const projectStockData: Record<string, StockItem[]> = {
  'RS-01 - Chhindwara': [
    { id:'1', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:6, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-05-24', lastMovementType:'manual' },
    { id:'2', partNumber:'HQ-CB-SR08', name:'HQ Core Bit SR-08', category:'Core Bits', currentQty:12, reorderLevel:8, unit:'NOS', unitCost:22000, lastMovement:'2026-04-29', lastMovementType:'po' },
    { id:'3', partNumber:'MTX-DD955', name:'MATEX DD955 Liquid', category:'Drilling Fluids & Chemicals', currentQty:18, reorderLevel:15, unit:'Bucket', unitCost:12151, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'4', partNumber:'MTX-SD-PPL', name:'MATEX Sand Drill', category:'Drilling Fluids & Chemicals', currentQty:14, reorderLevel:15, unit:'Bucket', unitCost:16886, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'5', partNumber:'ADD-EA-20', name:'ADDRILL EA-20 KG', category:'Drilling Fluids & Chemicals', currentQty:22, reorderLevel:20, unit:'Kg', unitCost:3200, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'6', partNumber:'ADD-PAB-25', name:'ADDRILL PAB 25 KG', category:'Drilling Fluids & Chemicals', currentQty:18, reorderLevel:20, unit:'Kg', unitCost:4375, lastMovement:'2026-04-28', lastMovementType:'manual' },
    { id:'7', partNumber:'FLT-FWS-01', name:'Fuel Water Separator', category:'Filtration', currentQty:3, reorderLevel:12, unit:'NOS', unitCost:2374, lastMovement:'2026-04-25', lastMovementType:'manual' },
    { id:'8', partNumber:'FLT-LB-B71', name:'Lube Filter B7125', category:'Filtration', currentQty:2, reorderLevel:8, unit:'NOS', unitCost:1990, lastMovement:'2026-04-24', lastMovementType:'manual' },
    { id:'9', partNumber:'FLT-AIR-P', name:'Air Filter Primary', category:'Filtration', currentQty:4, reorderLevel:6, unit:'NOS', unitCost:5000, lastMovement:'2026-04-27', lastMovementType:'manual' },
    { id:'10', partNumber:'NQ-CL-001', name:'NQ Core Lifter', category:'Core Barrel Assembly', currentQty:28, reorderLevel:20, unit:'NOS', unitCost:400, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'11', partNumber:'HQ-CL-001', name:'HQ Core Lifter', category:'Core Barrel Assembly', currentQty:14, reorderLevel:15, unit:'NOS', unitCost:646, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'12', partNumber:'NQ-RS-SPR', name:'NQ Reaming Shell Spiral', category:'Reaming Shells', currentQty:6, reorderLevel:4, unit:'NOS', unitCost:13455, lastMovement:'2026-04-23', lastMovementType:'manual' },
    { id:'13', partNumber:'SEL-VP-25K', name:'V-Packing W/S 25K', category:'Seals & Packings', currentQty:15, reorderLevel:10, unit:'NOS', unitCost:780, lastMovement:'2026-04-22', lastMovementType:'manual' },
    { id:'14', partNumber:'BRG-SKF-61830', name:'Bearing 61830 MA SKF', category:'Bearings & Seals', currentQty:1, reorderLevel:2, unit:'NOS', unitCost:41074, lastMovement:'2026-04-28', lastMovementType:'manual' },
    { id:'15', partNumber:'LUB-TCZ50', name:'TCZ-50 Grease 25 KG', category:'Lubricants & Greases', currentQty:3, reorderLevel:4, unit:'Kg', unitCost:12500, lastMovement:'2026-04-20', lastMovementType:'manual' },
  ],
  'CMP-MAD - Madheri': [
    { id:'16', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:14, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-04-29', lastMovementType:'manual' },
    { id:'17', partNumber:'MTX-DD955', name:'MATEX DD955 Liquid', category:'Drilling Fluids & Chemicals', currentQty:20, reorderLevel:15, unit:'Bucket', unitCost:12151, lastMovement:'2026-04-30', lastMovementType:'manual' },
    { id:'18', partNumber:'FLT-AIR-P', name:'Air Filter Primary', category:'Filtration', currentQty:1, reorderLevel:6, unit:'NOS', unitCost:5000, lastMovement:'2026-04-20', lastMovementType:'manual' },
    { id:'19', partNumber:'ADD-PAB-25', name:'ADDRILL PAB 25 KG', category:'Drilling Fluids & Chemicals', currentQty:18, reorderLevel:20, unit:'Kg', unitCost:4375, lastMovement:'2026-04-28', lastMovementType:'manual' },
  ],
  'CMPDI-DAM - Bokaro': [
    { id:'20', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:2, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-04-27', lastMovementType:'transfer' },
    { id:'21', partNumber:'HQ-CL-001', name:'HQ Core Lifter', category:'Core Barrel Assembly', currentQty:4, reorderLevel:10, unit:'NOS', unitCost:646, lastMovement:'2026-04-26', lastMovementType:'manual' },
    { id:'22', partNumber:'MTX-DD955', name:'MATEX DD955 Liquid', category:'Drilling Fluids & Chemicals', currentQty:5, reorderLevel:15, unit:'Bucket', unitCost:12151, lastMovement:'2026-04-28', lastMovementType:'manual' },
  ],
  'DGMIL-BHK - Bhalukona': [
    { id:'24', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:10, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-04-29', lastMovementType:'transfer' },
    { id:'25', partNumber:'MTX-SD-PPL', name:'MATEX Sand Drill', category:'Drilling Fluids & Chemicals', currentQty:5, reorderLevel:15, unit:'Bucket', unitCost:16886, lastMovement:'2026-04-27', lastMovementType:'manual' },
    { id:'26', partNumber:'ADD-EA-20', name:'ADDRILL EA-20 KG', category:'Drilling Fluids & Chemicals', currentQty:24, reorderLevel:20, unit:'Kg', unitCost:3200, lastMovement:'2026-04-30', lastMovementType:'manual' },
  ],
  'PAT-CMPDI - Pathakuri': [
    { id:'27', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:12, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-04-28', lastMovementType:'manual' },
    { id:'28', partNumber:'MTX-DD955', name:'MATEX DD955 Liquid', category:'Drilling Fluids & Chemicals', currentQty:16, reorderLevel:15, unit:'Bucket', unitCost:12151, lastMovement:'2026-04-30', lastMovementType:'manual' },
  ],
  'MECL-HIN - Bazar Gaon': [
    { id:'29', partNumber:'NQ-CB-SR06', name:'NQ Core Bit SR-06', category:'Core Bits', currentQty:8, reorderLevel:10, unit:'NOS', unitCost:11500, lastMovement:'2026-04-28', lastMovementType:'manual' },
    { id:'30', partNumber:'MTX-DD955', name:'MATEX DD955 Liquid', category:'Drilling Fluids & Chemicals', currentQty:10, reorderLevel:15, unit:'Bucket', unitCost:12151, lastMovement:'2026-04-29', lastMovementType:'manual' },
  ],
}

const seedMovements: Movement[] = [
  { id:'1', date:'24 May 2026', type:'out', part:'NQ Core Bit SR-06', qty:2, rig:'KEM-9', note:'Manual issue to rig', value:23000, by:'Rajesh Kumar' },
  { id:'2', date:'30 Apr 2026', type:'out', part:'NQ Core Lifter', qty:2, rig:'KEM-8', note:'Manual issue to rig', value:800, by:'Suresh Singh' },
  { id:'3', date:'29 Apr 2026', type:'in', part:'HQ Core Bit SR-08', qty:8, note:'PO #56/2627 received — IDP', value:176000, by:'Rajesh Kumar' },
  { id:'4', date:'18 Apr 2026', type:'transfer', part:'MATEX DD955 x 6 Buckets', qty:6, from:'RS-01', to:'DGMIL-BHK', note:'Project transfer', value:72906, by:'Suresh Singh' },
  { id:'5', date:'09 Apr 2026', type:'out', part:'Top Cover Oil Seal SKF', qty:4, rig:'KEM-9', note:'Manual issue — maintenance', value:31785, by:'Mohan Verma' },
  { id:'6', date:'06 Apr 2026', type:'in', part:'MATEX DD955 x 10 Buckets', qty:10, note:'PO WFS-NGP-2118 received', value:121510, by:'Rajesh Kumar' },
]

const seedRequests: PartRequest[] = [
  { id:'1', requestedBy:'Anil Sharma', items:[{partName:'NQ Core Bit SR-06',partNumber:'NQ-CB-SR06',qty:4,unit:'NOS'},{partName:'HQ Core Lifter',partNumber:'HQ-CL-001',qty:10,unit:'NOS'}], project:'DGMIL-BHK - Bhalukona', rig:'KEM-5', urgency:'Urgent', reason:'Bits worn out, need replacement', date:'24-05-2026', status:'Pending' },
  { id:'2', requestedBy:'Ravi Kumar', items:[{partName:'Fuel Water Separator',partNumber:'FLT-FWS-01',qty:6,unit:'NOS'}], project:'RS-01 - Chhindwara', rig:'KEM-1', urgency:'Normal', reason:'Monthly replacement due', date:'23-05-2026', status:'Pending' },
  { id:'3', requestedBy:'Suresh Patil', items:[{partName:'MATEX DD955 Liquid',partNumber:'MTX-DD955',qty:5,unit:'Bucket'},{partName:'ADDRILL EA-20 KG',partNumber:'ADD-EA-20',qty:20,unit:'Kg'}], project:'CMP-MAD - Madheri', rig:'KEM-4', urgency:'Critical', reason:'Running out of drilling fluid', date:'22-05-2026', status:'Converted' },
]

// ── SUBNAV ──────────────────────────────────────────────────────────────────
const subNav = [
  { href:'/admin/inventory', label:'Dashboard' },
  { href:'/admin/inventory/catalogue', label:'Parts Catalogue' },
  { href:'/admin/inventory/stock', label:'Stock Management' },
  { href:'/admin/inventory/purchase-orders', label:'Purchase Orders' },
  { href:'/admin/inventory/suppliers', label:'Suppliers' },
]
function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4, flexWrap:'wrap' }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#F97316':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const iStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }
const selStyle: React.CSSProperties = { ...iStyle, cursor:'pointer', appearance:'none' as any }

// ── ISSUE MODAL ─────────────────────────────────────────────────────────────
function IssueModal({ part, project, onClose, onIssue }: { part: StockItem; project: string; onClose:()=>void; onIssue:(qty:number,rig:string,note:string)=>void }) {
  const [qty, setQty] = useState(1)
  const [rig, setRig] = useState(rigOptions[0])
  const [note, setNote] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:440 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#F8FAFC' }}>Manual Issue to Rig</div>
          <button onClick={onClose} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={14} /></button>
        </div>
        {/* Project — read only (Change 1) */}
        <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em' }}>Project</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#F97316' }}>{project.split(' - ')[0]} — {project.split(' - ')[1]}</span>
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:'#F97316', marginBottom:16 }}>{part.name}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { label:'Quantity', content: <input type="number" min={1} max={part.currentQty} value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)} style={iStyle} /> },
            { label:'Rig', content: <select value={rig} onChange={e=>setRig(e.target.value)} style={selStyle}>{rigOptions.map(r=><option key={r}>{r}</option>)}</select> },
            { label:'Note (Reason)', content: <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Bearing replacement KEM-4..." style={iStyle} /> },
          ].map((f,i)=>(
            <div key={i}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
              {f.content}
            </div>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={()=>onIssue(qty,rig,note)} style={{ flex:1, padding:'10px', borderRadius:9, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>Issue Stock</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TRANSFER MODAL (Change 3 + 4) ───────────────────────────────────────────
function TransferModal({ onClose, onConfirm, stockData }: { onClose:()=>void; onConfirm:(from:string,to:string,items:TransferItem[],by:string,reason:string)=>void; stockData: Record<string,StockItem[]> }) {
  const [from, setFrom] = useState(projectOptions[0])
  const [to, setTo] = useState(projectOptions[1])
  const [transferredBy, setTransferredBy] = useState('')
  const [reason, setReason] = useState('')
  const [items, setItems] = useState<TransferItem[]>([{ id:'t1', partName:'', partNumber:'', qty:1, unit:'NOS' }])
  const [partSearch, setPartSearch] = useState<Record<string,string>>({})
  const [showSuggestions, setShowSuggestions] = useState<Record<string,boolean>>({})
  const [error, setError] = useState('')

  const addItem = () => setItems(i=>[...i,{ id:`t${Date.now()}`, partName:'', partNumber:'', qty:1, unit:'NOS' }])
  const removeItem = (id:string) => setItems(i=>i.filter(x=>x.id!==id))
  const updateItem = (id:string, field:keyof TransferItem, val:any) => setItems(i=>i.map(x=>x.id===id?{...x,[field]:val}:x))

  const handlePartSelect = (id:string, part:typeof partsCatalogueList[0]) => {
    setItems(i=>i.map(x=>x.id===id?{...x,partName:part.name,partNumber:part.partNumber,unit:part.unit}:x))
    setPartSearch(p=>({...p,[id]:part.name}))
    setShowSuggestions(s=>({...s,[id]:false}))
  }

  const handleConfirm = () => {
    if (!transferredBy.trim()) { setError('Please enter the name of person doing the transfer'); return }
    if (from === to) { setError('From and To projects cannot be the same'); return }
    if (items.some(i=>!i.partName || i.qty < 1)) { setError('Please fill in all part details'); return }
    onConfirm(from, to, items, transferredBy, reason)
    onClose()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:640, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Transfer Stock Between Projects</div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          {[
            { label:'From Project', val:from, set:setFrom },
            { label:'To Project', val:to, set:setTo },
          ].map((f,i)=>(
            <div key={i}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{f.label}</div>
              <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}>
                {projectOptions.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Transferred By */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Transferred By *</div>
          <input value={transferredBy} onChange={e=>setTransferredBy(e.target.value)} placeholder="Enter your full name..." style={iStyle} />
        </div>

        {/* Line Items */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Parts to Transfer</div>
            <button onClick={addItem} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Plus size={12} /> Add Part
            </button>
          </div>
          <div style={{ border:'1px solid #1E293B', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid #1E293B' }}>
                  {['Part Name','Part No','Unit','Qty',''].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item)=>(
                  <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <td style={{ padding:'8px 10px', position:'relative' }}>
                      <input
                        value={partSearch[item.id] ?? item.partName}
                        onChange={e=>{
                          setPartSearch(p=>({...p,[item.id]:e.target.value}))
                          setShowSuggestions(s=>({...s,[item.id]:true}))
                          updateItem(item.id,'partName',e.target.value)
                        }}
                        placeholder="Search part name..."
                        style={{...iStyle,fontSize:11,padding:'6px 8px',minWidth:160}}
                      />
                      {showSuggestions[item.id] && partSearch[item.id] && (
                        <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:100, background:'#0D1117', border:'1px solid #1E293B', borderRadius:8, maxHeight:160, overflowY:'auto' }}>
                          {partsCatalogueList.filter(p=>p.name.toLowerCase().includes((partSearch[item.id]||'').toLowerCase())).map(p=>(
                            <div key={p.partNumber} onClick={()=>handlePartSelect(item.id,p)}
                              style={{ padding:'8px 12px', cursor:'pointer', fontSize:12, color:'#F8FAFC', borderBottom:'1px solid rgba(30,41,59,0.4)' }}
                              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.08)'}
                              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                              <div style={{ fontWeight:600 }}>{p.name}</div>
                              <div style={{ fontSize:10, color:'#64748B' }}>{p.partNumber}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'8px 10px' }}><span style={{ fontSize:11, color:'#64748B', fontFamily:'monospace' }}>{item.partNumber || '—'}</span></td>
                    <td style={{ padding:'8px 10px' }}>
                      <select value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)} style={{...selStyle,fontSize:11,padding:'5px 8px',width:70}}>
                        {unitOptions.map(u=><option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      <input type="number" min={1} value={item.qty} onChange={e=>updateItem(item.id,'qty',parseInt(e.target.value)||1)} style={{...iStyle,fontSize:11,padding:'6px 8px',width:60,textAlign:'center'}} />
                    </td>
                    <td style={{ padding:'8px 10px' }}>
                      {items.length > 1 && <button onClick={()=>removeItem(item.id)} style={{ padding:4, borderRadius:5, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.5)', cursor:'pointer' }}><X size={12} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Reason for Transfer</div>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason for transfer..." style={iStyle} />
        </div>

        {error && <div style={{ fontSize:11, color:'#EF4444', marginBottom:12, padding:'8px 12px', background:'rgba(239,68,68,0.05)', borderRadius:8, border:'1px solid rgba(239,68,68,0.15)' }}>{error}</div>}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleConfirm} style={{ flex:1, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#8B5CF6,#7C3AED)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>
            Confirm Transfer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── TRANSFER HISTORY MODAL (Change 5) ───────────────────────────────────────
function TransferHistoryModal({ project, movements, onClose }: { project:string; movements:Movement[]; onClose:()=>void }) {
  const [filter, setFilter] = useState<'all'|'in'|'out'>('all')
  const transfers = movements.filter(m => m.type === 'transfer')
  const projectName = project.split(' - ')[0]
  const filtered = transfers.filter(m => {
    if (filter === 'in') return m.to?.includes(projectName)
    if (filter === 'out') return m.from?.includes(projectName)
    return true
  })
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:680, maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Transfer History</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{project}</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {(['all','in','out'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                background: filter===f ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter===f ? 'rgba(139,92,246,0.3)' : '#1E293B'}`,
                color: filter===f ? '#8B5CF6' : '#64748B',
              }}>
              {f==='all'?'All Transfers':f==='in'?'Transfers IN ↓':'Transfers OUT ↑'}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>No transfer records found.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map(m=>(
              <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12, background:'rgba(139,92,246,0.04)', border:'1px solid rgba(139,92,246,0.12)' }}>
                <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(139,92,246,0.1)', flexShrink:0 }}>
                  <span style={{ fontSize:14 }}>⇄</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{m.part}</div>
                  <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{m.from} → {m.to} · {m.note}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#8B5CF6' }}>{m.qty} units</div>
                  <div style={{ fontSize:10, color:'#64748B' }}>By: {m.by || '—'}</div>
                  <div style={{ fontSize:10, color:'#64748B' }}>{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── OPENING BALANCE MODAL ────────────────────────────────────────────────────
function OpeningBalanceModal({ project, onClose }: { project:string; onClose:()=>void }) {
  const [mode, setMode] = useState<'manual'|'excel'|null>(null)
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:32, width:520 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Set Opening Balance</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{project}</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ padding:'12px 16px', borderRadius:10, background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.15)', marginBottom:24 }}>
          <div style={{ fontSize:12, color:'#F97316', fontWeight:600 }}>One-time setup per project</div>
          <div style={{ fontSize:11, color:'#94A3B8', marginTop:4 }}>After opening balance is entered, all future stock movements are tracked automatically.</div>
        </div>
        {!mode && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { m:'manual' as const, icon:'✏️', title:'Manual Entry', desc:'Enter stock counts item by item', color:'#3B82F6', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.2)' },
              { m:'excel' as const, icon:'📊', title:'Upload Excel', desc:'Import your existing store sheet directly', color:'#10B981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' },
            ].map(opt=>(
              <button key={opt.m} onClick={()=>setMode(opt.m)}
                style={{ padding:'20px 16px', borderRadius:14, background:opt.bg, border:`2px solid ${opt.border}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{opt.icon}</div>
                <div style={{ fontSize:14, fontWeight:700, color:opt.color }}>{opt.title}</div>
                <div style={{ fontSize:11, color:'#64748B', marginTop:4 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}
        {mode && (
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <button onClick={()=>setMode(null)} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Back</button>
            <button onClick={onClose} style={{ flex:2, padding:'10px', borderRadius:9, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>Save Opening Balance</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CATALOGUE PICKER MODAL ────────────────────────────────────────────────────
function CataloguePicker({ onAdd, onClose }: {
  onAdd:(parts:{partName:string;partNumber:string;qty:number;unit:string}[])=>void
  onClose:()=>void
}) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [selected, setSelected] = useState<Record<string,number>>({})

  const categories = ['All', ...Array.from(new Set(partsCatalogueList.map(p=>p.name.split(' ')[0])))]
  const filtered = partsCatalogueList.filter(p => {
    const matchSearch = search==='' || p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const toggle = (partNumber:string) => {
    setSelected(prev => {
      const next = {...prev}
      if(next[partNumber]) delete next[partNumber]
      else next[partNumber] = 1
      return next
    })
  }

  const handleAdd = () => {
    const parts = Object.entries(selected).map(([pn, qty]) => {
      const p = partsCatalogueList.find(x=>x.partNumber===pn)!
      return { partName:p.name, partNumber:p.partNumber, qty, unit:p.unit }
    })
    onAdd(parts)
    onClose()
  }

  const selectedCount = Object.keys(selected).length

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)', zIndex:1100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, width:680, maxHeight:'85vh', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #1E293B', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#F8FAFC' }}>Select Parts from Catalogue</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Tick the parts you need — set quantities after selecting</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16}/></button>
        </div>
        {/* Search */}
        <div style={{ padding:'12px 24px', borderBottom:'1px solid #1E293B' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by part name or part number..."
            style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:9, color:'#F8FAFC', fontSize:13, outline:'none' }} />
        </div>
        {/* Parts list */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 24px' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #1E293B' }}>
                {['','Part No','Part Name','Unit','Unit Cost','Qty'].map(h=>(
                  <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>{
                const isSelected = !!selected[p.partNumber]
                return (
                  <tr key={p.partNumber}
                    onClick={()=>toggle(p.partNumber)}
                    style={{ borderBottom:'1px solid rgba(30,41,59,0.4)', cursor:'pointer',
                      background: isSelected ? 'rgba(249,115,22,0.06)' : 'transparent',
                      transition:'all 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=isSelected?'rgba(249,115,22,0.08)':'rgba(255,255,255,0.02)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=isSelected?'rgba(249,115,22,0.06)':'transparent'}>
                    <td style={{ padding:'9px 10px' }}>
                      <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${isSelected?'#F97316':'#334155'}`, background:isSelected?'#F97316':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {isSelected && <Check size={10} color="#fff"/>}
                      </div>
                    </td>
                    <td style={{ padding:'9px 10px', fontSize:11, color:'#94A3B8', fontFamily:'monospace' }}>{p.partNumber}</td>
                    <td style={{ padding:'9px 10px', fontSize:12, fontWeight:600, color:'#F8FAFC' }}>{p.name}</td>
                    <td style={{ padding:'9px 10px', fontSize:11, color:'#64748B' }}>{p.unit}</td>
                    <td style={{ padding:'9px 10px', fontSize:11, color:'#10B981', fontWeight:600 }}>₹{p.unitCost.toLocaleString()}</td>
                    <td style={{ padding:'9px 10px' }} onClick={e=>e.stopPropagation()}>
                      {isSelected && (
                        <input type="number" min={1} value={selected[p.partNumber]}
                          onChange={e=>setSelected(prev=>({...prev,[p.partNumber]:parseInt(e.target.value)||1}))}
                          style={{ width:56, padding:'4px 6px', background:'#080B10', border:'1px solid #F97316', borderRadius:6, color:'#F8FAFC', fontSize:12, textAlign:'center', outline:'none' }} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid #1E293B', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:'#64748B' }}>{selectedCount} part{selectedCount!==1?'s':''} selected</span>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleAdd} disabled={selectedCount===0}
              style={{ padding:'9px 20px', borderRadius:9, background: selectedCount>0?'linear-gradient(135deg,#F97316,#EA580C)':'rgba(249,115,22,0.2)', color:'#fff', fontSize:13, fontWeight:700, cursor:selectedCount>0?'pointer':'not-allowed', border:'none' }}>
              Add {selectedCount>0?`${selectedCount} Parts`:'Selected'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PART REQUEST MODAL (updated — catalogue picker) ────────────────────────
function PartRequestModal({ onClose, onSave }: { onClose:()=>void; onSave:(r:PartRequest)=>void }) {
  const [requestedBy, setRequestedBy] = useState('')
  const [project, setProject] = useState(projectOptions[0])
  const [rig, setRig] = useState(rigOptions[0])
  const [urgency, setUrgency] = useState<'Normal'|'Urgent'|'Critical'>('Normal')
  const [reason, setReason] = useState('')
  const [items, setItems] = useState<(PartRequestItem & {id:string})[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState('')

  const removeItem = (id:string) => setItems(p=>p.filter(x=>x.id!==id))
  const updateQty = (id:string, qty:number) => setItems(p=>p.map(x=>x.id===id?{...x,qty}:x))

  const handlePartsAdded = (parts:{partName:string;partNumber:string;qty:number;unit:string}[]) => {
    const newItems = parts.map(p=>({ ...p, id:`r${Date.now()}${Math.random()}` }))
    setItems(prev=>[...prev, ...newItems])
  }

  const handleSave = () => {
    if (!requestedBy.trim()) { setError('Please enter your name'); return }
    if (items.length === 0) { setError('Please add at least one part'); return }
    if (!reason.trim()) { setError('Please enter a reason'); return }
    const newRequest: PartRequest = { id:Date.now().toString(), requestedBy, items:items.map(({id,...rest})=>rest), project, rig, urgency, reason, date:new Date().toLocaleDateString('en-IN'), status:'Pending' as const }
    // Save to localStorage so Purchase Orders page can read it
    try {
      const existing = JSON.parse(localStorage.getItem('xplorix_part_requests') || '[]')
      localStorage.setItem('xplorix_part_requests', JSON.stringify([newRequest, ...existing]))
    } catch(e) { console.error('localStorage error:', e) }
    onSave(newRequest)
    onClose()
  }

  const urgencyColors = {
    Normal:  { color:'#10B981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.3)' },
    Urgent:  { color:'#F59E0B', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)' },
    Critical:{ color:'#EF4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)' }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:620, maxHeight:'92vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Raise Part Request</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Request will be sent to Purchase Orders for PO creation</div>
          </div>
          <button onClick={onClose} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Requested By */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Requested By *</div>
            <input value={requestedBy} onChange={e=>setRequestedBy(e.target.value)} placeholder="Enter your full name..." style={iStyle} />
          </div>

          {/* Project + Rig */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Project *</div>
              <select value={project} onChange={e=>setProject(e.target.value)} style={selStyle}>
                {projectOptions.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Rig *</div>
              <select value={rig} onChange={e=>setRig(e.target.value)} style={selStyle}>
                {rigOptions.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Parts Line Items — from Catalogue */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Parts Required * {items.length > 0 && <span style={{ color:'#F97316', marginLeft:6 }}>{items.length} added</span>}
              </div>
              <button onClick={()=>setShowPicker(true)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <Plus size={12}/> Select from Catalogue
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ padding:'24px', borderRadius:12, border:'2px dashed #1E293B', textAlign:'center', cursor:'pointer' }}
                onClick={()=>setShowPicker(true)}>
                <div style={{ fontSize:24, marginBottom:8 }}>📦</div>
                <div style={{ fontSize:13, color:'#64748B' }}>Click to select parts from catalogue</div>
                <div style={{ fontSize:11, color:'#334155', marginTop:4 }}>You can select multiple parts at once</div>
              </div>
            ) : (
              <div style={{ border:'1px solid #1E293B', borderRadius:12, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'100px 1fr 80px 70px 32px', gap:8, padding:'8px 12px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid #1E293B' }}>
                  {['Part No','Part Name','Qty','Unit',''].map(h=>(
                    <div key={h} style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</div>
                  ))}
                </div>
                {items.map(item=>(
                  <div key={item.id} style={{ display:'grid', gridTemplateColumns:'100px 1fr 80px 70px 32px', gap:8, padding:'8px 12px', borderBottom:'1px solid rgba(30,41,59,0.4)', alignItems:'center' }}>
                    <div style={{ fontSize:11, color:'#10B981', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.partNumber}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.partName}</div>
                    <input type="number" min={1} value={item.qty}
                      onChange={e=>updateQty(item.id, parseInt(e.target.value)||1)}
                      style={{...iStyle, fontSize:11, padding:'5px 8px', textAlign:'center'}} />
                    <div style={{ fontSize:11, color:'#64748B' }}>{item.unit}</div>
                    <button onClick={()=>removeItem(item.id)} style={{ padding:4, borderRadius:5, background:'rgba(239,68,68,0.08)', border:'none', color:'rgba(239,68,68,0.5)', cursor:'pointer' }}><X size={12}/></button>
                  </div>
                ))}
                <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.01)' }}>
                  <button onClick={()=>setShowPicker(true)}
                    style={{ fontSize:11, color:'#F97316', cursor:'pointer', background:'none', border:'none', padding:0, fontWeight:600 }}>
                    + Add more parts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Urgency */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Urgency *</div>
            <div style={{ display:'flex', gap:10 }}>
              {(['Normal','Urgent','Critical'] as const).map(u=>{
                const c = urgencyColors[u]
                return (
                  <button key={u} onClick={()=>setUrgency(u)}
                    style={{ flex:1, padding:'10px', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:13,
                      background: urgency===u ? c.bg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${urgency===u ? c.border : '#1E293B'}`,
                      color: urgency===u ? c.color : '#64748B',
                    }}>{u}</button>
                )
              })}
            </div>
          </div>

          {/* Reason */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Reason *</div>
            <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why do you need these parts?" style={iStyle} />
          </div>
        </div>

        {error && <div style={{ fontSize:11, color:'#EF4444', marginTop:12, padding:'8px 12px', background:'rgba(239,68,68,0.05)', borderRadius:8, border:'1px solid rgba(239,68,68,0.15)' }}>{error}</div>}

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>
            Submit Request →
          </button>
        </div>
      </div>
      {showPicker && <CataloguePicker onAdd={handlePartsAdded} onClose={()=>setShowPicker(false)} />}
    </div>
  )
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function StockManagementPage() {
  const { format } = useCurrency()
  const [selectedProject, setSelectedProject] = useState(projectOptions[0])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'|'low'|'ok'>('all')
  const [issueTarget, setIssueTarget] = useState<StockItem|null>(null)
  const [stockData, setStockData] = useState(projectStockData)
  const [movements, setMovements] = useState<Movement[]>(seedMovements)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showTransferHistory, setShowTransferHistory] = useState(false)
  const [showOpeningBalance, setShowOpeningBalance] = useState(false)
  const [showPartRequest, setShowPartRequest] = useState(false)
  const [partRequests, setPartRequests] = useState<PartRequest[]>(() => {
    try {
      const saved = localStorage.getItem('xplorix_part_requests')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length > 0) return parsed
      }
    } catch(e) {}
    return seedRequests
  })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  // Applied filters (only update when Apply is clicked)

  const stock = stockData[selectedProject] || []
  const filtered = stock.filter(item => {
    const matchStatus = filterStatus==='all' || (filterStatus==='low' ? item.currentQty <= item.reorderLevel : item.currentQty > item.reorderLevel)
    const matchSearch = search==='' || item.name.toLowerCase().includes(search.toLowerCase()) || item.partNumber.toLowerCase().includes(search.toLowerCase())
    const matchDateFrom = !dateFrom || item.lastMovement >= dateFrom
    const matchDateTo = !dateTo || item.lastMovement <= dateTo
    return matchStatus && matchSearch && matchDateFrom && matchDateTo
  })
  const totalValue = stock.reduce((s,i) => s + i.currentQty * i.unitCost, 0)
  const lowCount = stock.filter(i => i.currentQty <= i.reorderLevel).length
  const pendingRequests = partRequests.filter(r => r.status === 'Pending').length

  const handleIssue = (qty:number, rig:string, note:string) => {
    if (!issueTarget) return
    setStockData(prev => {
      const updated = {...prev}
      updated[selectedProject] = updated[selectedProject].map(item =>
        item.id === issueTarget.id ? {...item, currentQty: Math.max(0, item.currentQty - qty), lastMovement: new Date().toISOString().split('T')[0], lastMovementType:'manual' as const} : item
      )
      return updated
    })
    setMovements(prev => [{
      id: Date.now().toString(), date: new Date().toLocaleDateString('en-IN'), type:'out' as const,
      part: issueTarget.name, qty, rig, note: note || 'Manual issue to rig',
      value: issueTarget.unitCost * qty, by: 'Store Keeper'
    }, ...prev])
    setIssueTarget(null)
  }

  // Change 4: Transfer actually works
  const handleTransfer = (from:string, to:string, items:TransferItem[], by:string, reason:string) => {
    setStockData(prev => {
      const updated = { ...prev }
      items.forEach(item => {
        // Deduct from source
        if (updated[from]) {
          updated[from] = updated[from].map(s =>
            s.name === item.partName ? { ...s, currentQty: Math.max(0, s.currentQty - item.qty), lastMovement: new Date().toISOString().split('T')[0], lastMovementType: 'transfer' as const } : s
          )
        }
        // Add to destination
        if (updated[to]) {
          const exists = updated[to].find(s => s.name === item.partName)
          if (exists) {
            updated[to] = updated[to].map(s =>
              s.name === item.partName ? { ...s, currentQty: s.currentQty + item.qty, lastMovement: new Date().toISOString().split('T')[0], lastMovementType: 'transfer' as const } : s
            )
          }
        }
      })
      return updated
    })
    // Add to movements
    const fromShort = from.split(' - ')[0]
    const toShort = to.split(' - ')[0]
    items.forEach(item => {
      setMovements(prev => [{
        id: Date.now().toString() + item.id, date: new Date().toLocaleDateString('en-IN'),
        type:'transfer' as const, part: item.partName, qty: item.qty,
        from: fromShort, to: toShort, note: reason || 'Project transfer',
        value: 0, by
      }, ...prev])
    })
  }

  const statusColor = (item: StockItem) => {
    const ratio = item.currentQty / item.reorderLevel
    if (ratio <= 0.3) return '#EF4444'
    if (ratio <= 1) return '#F59E0B'
    return '#10B981'
  }

  const mvtBadge = (type: StockItem['lastMovementType']) => {
    const map = { manual:{ label:'✋ Manual', color:'#F59E0B' }, transfer:{ label:'⇄ Transfer', color:'#8B5CF6' }, po:{ label:'📦 PO', color:'#10B981' } }
    return map[type]
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Stock Management</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Per-project stock levels — issue parts from store to rigs, transfer between projects</p>
        </div>
        <SubNav active="Stock Management" />
      </div>

      {/* HOW STOCK MOVES banner — Change 2: removed Drill Log */}
      <div style={{ background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:12, padding:'12px 20px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#60A5FA', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>How Stock Moves:</div>
        {[
          { icon:'📦', label:'PO Received', desc:'Stock in', color:'#10B981' },
          { icon:'⇄', label:'Transfer', desc:'Between projects', color:'#8B5CF6' },
          { icon:'✋', label:'Manual Issue', desc:'Issue to rig from store', color:'#F59E0B' },
        ].map((item,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:item.color }}>{item.label}</div>
              <div style={{ fontSize:10, color:'#64748B' }}>{item.desc}</div>
            </div>
            {i < 2 && <div style={{ width:16, height:1, background:'#1E293B', margin:'0 4px' }} />}
          </div>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={()=>setShowPartRequest(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', position:'relative' }}>
            <Bell size={13} /> Part Request
            {pendingRequests > 0 && <span style={{ position:'absolute', top:-6, right:-6, background:'#EF4444', color:'#fff', fontSize:9, fontWeight:800, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{pendingRequests}</span>}
          </button>
          <button onClick={()=>setShowOpeningBalance(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
            <Upload size={13} /> Set Opening Balance
          </button>
        </div>
      </div>

      {/* Pending Part Requests banner */}
      {pendingRequests > 0 && (
        <div style={{ padding:'12px 20px', borderRadius:12, background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Bell size={16} style={{ color:'#F97316' }} />
            <span style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{pendingRequests} pending part request{pendingRequests>1?'s':''} waiting to be converted to Purchase Orders</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {partRequests.filter(r=>r.status==='Pending').slice(0,3).map(r=>(
              <span key={r.id} style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                background: r.urgency==='Critical'?'rgba(239,68,68,0.1)':r.urgency==='Urgent'?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)',
                color: r.urgency==='Critical'?'#EF4444':r.urgency==='Urgent'?'#F59E0B':'#10B981',
                border: `1px solid ${r.urgency==='Critical'?'rgba(239,68,68,0.2)':r.urgency==='Urgent'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)'}`,
              }}>{r.urgency}: {r.items[0]?.partName}{r.items.length>1?` +${r.items.length-1} more`:''}</span>
            ))}
            <Link href="/admin/inventory/purchase-orders" style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', color:'#F97316', textDecoration:'none' }}>
              View in Purchase Orders →
            </Link>
          </div>
        </div>
      )}

      {/* Project selector */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'12px 20px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' }}>Project:</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {projectOptions.map(p => (
            <button key={p} onClick={()=>setSelectedProject(p)}
              style={{ padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                background: selectedProject===p ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'rgba(255,255,255,0.04)',
                color: selectedProject===p ? '#fff' : '#94A3B8',
                border: selectedProject===p ? 'none' : '1px solid #1E293B',
              }}>{p.split(' - ')[0]}</button>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {/* Change 5: Transfer History button */}
          <button onClick={()=>setShowTransferHistory(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', color:'#8B5CF6', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <History size={13} /> Transfer History
          </button>
          <button onClick={()=>setShowTransfer(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', color:'#8B5CF6', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <ArrowLeftRight size={14} /> Transfer Between Projects
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Parts', value:stock.length, color:'#60A5FA', icon:'📦' },
          { label:'Low Stock', value:lowCount, color:lowCount>0?'#EF4444':'#10B981', icon:'⚠️' },
          { label:'Total Stock Value', value:format(totalValue), color:'#10B981', icon:'💰' },
          { label:'Project', value:selectedProject.split(' - ')[0], color:'#F97316', icon:'📍' },
        ].map((k,i)=>(
          <div key={i} style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'16px 18px' }}>
            <div style={{ fontSize:18, marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter — with date range */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', background:'#0D1117', border:'1px solid #1E293B', borderRadius:12, padding:'10px 16px' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search parts..."
            style={{ width:'100%', padding:'8px 12px 8px 30px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} />
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
            style={{ padding:'7px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            Clear
          </button>
        )}

        {(['all','low','ok'] as const).map(f=>(
          <button key={f} onClick={()=>setFilterStatus(f)}
            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              background: filterStatus===f?(f==='low'?'rgba(239,68,68,0.15)':f==='ok'?'rgba(16,185,129,0.15)':'rgba(249,115,22,0.15)'):'rgba(255,255,255,0.04)',
              color: filterStatus===f?(f==='low'?'#EF4444':f==='ok'?'#10B981':'#F97316'):'#94A3B8',
              border:`1px solid ${filterStatus===f?(f==='low'?'rgba(239,68,68,0.25)':f==='ok'?'rgba(16,185,129,0.25)':'rgba(249,115,22,0.25)'):'#1E293B'}`,
            }}>
            {f==='all'?'All Stock':f==='low'?`⚠ Low Stock (${lowCount})`:'✅ OK Stock'}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              {['Part','Category','Current Stock','Reorder Level','Stock Status','Unit Cost','Stock Value','Last Movement','Source','Action'].map(h=>(
                <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ padding:'40px', textAlign:'center', color:'#64748B' }}>No stock records for this project.</td></tr>
            )}
            {filtered.map(item => {
              const pct = Math.min(100, (item.currentQty / Math.max(item.reorderLevel * 2, 1)) * 100)
              const color = statusColor(item)
              const isLow = item.currentQty <= item.reorderLevel
              const mvt = mvtBadge(item.lastMovementType)
              return (
                <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)', background: isLow ? 'rgba(239,68,68,0.02)' : 'transparent' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=isLow?'rgba(239,68,68,0.04)':'rgba(255,255,255,0.015)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=isLow?'rgba(239,68,68,0.02)':'transparent'}
                >
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{item.name}</div>
                    <div style={{ fontSize:10, color:'#64748B', marginTop:2, fontFamily:'monospace' }}>{item.partNumber}</div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:10, fontWeight:600, padding:'3px 7px', borderRadius:5, background:'rgba(59,130,246,0.08)', color:'#60A5FA', border:'1px solid rgba(59,130,246,0.12)', whiteSpace:'nowrap' }}>{item.category}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color }}>
                      {item.currentQty} <span style={{ fontSize:11, fontWeight:400, color:'#64748B' }}>{item.unit}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#94A3B8' }}>{item.reorderLevel} {item.unit}</td>
                  <td style={{ padding:'12px 14px', minWidth:110 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, background:'#1A2234', borderRadius:4, height:6 }}>
                        <div style={{ width:`${pct}%`, height:6, borderRadius:4, background:color, transition:'width 0.5s' }} />
                      </div>
                      {isLow && <AlertTriangle size={12} style={{ color:'#EF4444', flexShrink:0 }} />}
                    </div>
                    <div style={{ fontSize:10, color, marginTop:3, fontWeight:600 }}>
                      {item.currentQty <= 0 ? 'OUT OF STOCK' : item.currentQty <= item.reorderLevel * 0.3 ? 'CRITICAL' : item.currentQty <= item.reorderLevel ? 'LOW' : 'OK'}
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#10B981', fontWeight:600 }}>{item.unitCost > 0 ? format(item.unitCost) : '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:'#F8FAFC', fontWeight:600 }}>{item.unitCost > 0 ? format(item.currentQty * item.unitCost) : '—'}</td>
                  <td style={{ padding:'12px 14px', fontSize:11, color:'#64748B' }}>{item.lastMovement}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:10, fontWeight:600, color:mvt.color, background:`${mvt.color}15`, padding:'3px 8px', borderRadius:5, border:`1px solid ${mvt.color}30`, whiteSpace:'nowrap' }}>{mvt.label}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <button onClick={()=>setIssueTarget(item)}
                      style={{ padding:'6px 14px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                      Issue
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              <td colSpan={6} style={{ padding:'12px 14px', fontSize:12, fontWeight:700, color:'#64748B' }}>{filtered.length} items</td>
              <td colSpan={4} style={{ padding:'12px 14px', fontSize:14, fontWeight:800, color:'#10B981' }}>{format(filtered.reduce((s,i)=>s+i.currentQty*i.unitCost,0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Recent Movements — Change 2: removed auto-deduct entries */}
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <History size={16} style={{ color:'#64748B' }} />
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Recent Stock Movements</div>
          <span style={{ fontSize:10, color:'#64748B', marginLeft:4 }}>All projects</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {movements.slice(0,8).map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B' }}>
              <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: m.type==='in'?'rgba(16,185,129,0.1)':m.type==='out'?'rgba(249,115,22,0.1)':'rgba(139,92,246,0.1)' }}>
                <span style={{ fontSize:12 }}>{m.type==='in'?'↓':m.type==='out'?'↑':'⇄'}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.part}</div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>
                  {m.note}{m.rig ? ` · ${m.rig}` : ''}{m.from ? ` · ${m.from} → ${m.to}` : ''}{m.by ? ` · By: ${m.by}` : ''}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:m.type==='in'?'#10B981':'#F97316' }}>{m.type==='in'?'+':'-'}{m.qty}</div>
                <div style={{ fontSize:10, color:'#64748B' }}>{m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {issueTarget && <IssueModal part={issueTarget} project={selectedProject} onClose={()=>setIssueTarget(null)} onIssue={handleIssue} />}
      {showTransfer && <TransferModal onClose={()=>setShowTransfer(false)} onConfirm={handleTransfer} stockData={stockData} />}
      {showTransferHistory && <TransferHistoryModal project={selectedProject} movements={movements} onClose={()=>setShowTransferHistory(false)} />}
      {showOpeningBalance && <OpeningBalanceModal project={selectedProject} onClose={()=>setShowOpeningBalance(false)} />}
      {showPartRequest && <PartRequestModal onClose={()=>setShowPartRequest(false)} onSave={r=>{
        const updated = [r, ...partRequests]
        setPartRequests(updated)
        try { localStorage.setItem('xplorix_part_requests', JSON.stringify(updated)) } catch(e) {}
      }} />}

    </div>
  )
}

