'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, ChevronDown, X, Check, Truck,
  FileText, Clock, Package, ChevronRight, AlertCircle
} from 'lucide-react'
import { useCurrency } from '../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
type POStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled'
interface POLineItem { id: string; partNumber: string; partName: string; qtyOrdered: number; qtyReceived: number; unitCost: number; unit: string }
interface PurchaseOrder {
  id: string; poNumber: string; supplier: string; site: string
  orderDate: string; expectedDate: string; billNo: string; billDate: string
  status: POStatus; lineItems: POLineItem[]; notes: string
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const suppliers = ['ROCKTEK INFRA SERVICES','IDP (Ideal Diamond Products)','WESTFIELDS SERVICES','AB EMULTECH PVT. LTD.','AMOGH ENTERPRISES','M.S. ENTERPRISES','SANDVIK','EZYDRILL','DRILLMAN','DHANBAD ENGINEERING','SPECIALITY LUBRICANTS','MOULI ENTERPRISES','Custom / New Supplier']
const sites = ['Site A - Chhindwara','Site B - Madheri','Site C - Bokaro','Site D - Bhalukona']

const seedPOs: PurchaseOrder[] = [
  {
    id:'1', poNumber:'PO-2026-056', supplier:'IDP (Ideal Diamond Products)', site:'Site A - Chhindwara',
    orderDate:'28.04.2026', expectedDate:'05.05.2026', billNo:'56/2627', billDate:'28.04.2026',
    status:'Received', notes:'Urgent order for drill bits',
    lineItems:[
      { id:'1a', partNumber:'HQ-CB-SR06', partName:'HQ Core Bit SR-06', qtyOrdered:2,  qtyReceived:2,  unitCost:22000, unit:'Each' },
      { id:'1b', partNumber:'HQ-CB-SR08', partName:'HQ Core Bit SR-08', qtyOrdered:8,  qtyReceived:8,  unitCost:22000, unit:'Each' },
    ]
  },
  {
    id:'2', poNumber:'PO-2026-055', supplier:'WESTFIELDS SERVICES', site:'Site A - Chhindwara',
    orderDate:'06.04.2026', expectedDate:'10.04.2026', billNo:'WFS-NGP-2118', billDate:'06.04.2026',
    status:'Received', notes:'',
    lineItems:[
      { id:'2a', partNumber:'MTX-SD-PPL', partName:'MATEX Sand Drill Poly Pail', qtyOrdered:10, qtyReceived:10, unitCost:16886, unit:'Bucket' },
      { id:'2b', partNumber:'MTX-DD955',  partName:'MATEX DD955 Liquid Poly',    qtyOrdered:10, qtyReceived:10, unitCost:12151, unit:'Bucket' },
    ]
  },
  {
    id:'3', poNumber:'PO-2026-060', supplier:'ROCKTEK INFRA SERVICES', site:'Site B - Madheri',
    orderDate:'29.04.2026', expectedDate:'08.05.2026', billNo:'', billDate:'',
    status:'Ordered', notes:'Reaming shells and couplings',
    lineItems:[
      { id:'3a', partNumber:'NQ-RS-SPR', partName:'NQ Reaming Shell Spiral', qtyOrdered:5,  qtyReceived:0, unitCost:13455, unit:'Each' },
      { id:'3b', partNumber:'NQ-LC-001', partName:'NQ Locking Coupling',     qtyOrdered:10, qtyReceived:0, unitCost:6195,  unit:'Each' },
    ]
  },
  {
    id:'4', poNumber:'PO-2026-061', supplier:'AB EMULTECH PVT. LTD.', site:'Site C - Bokaro',
    orderDate:'30.04.2026', expectedDate:'05.05.2026', billNo:'', billDate:'',
    status:'Partially Received', notes:'Monthly additives order',
    lineItems:[
      { id:'4a', partNumber:'ADD-EA-20',  partName:'ADDRILL EA-20 KG',  qtyOrdered:60, qtyReceived:40, unitCost:3200, unit:'Kg' },
      { id:'4b', partNumber:'ADD-PAB-25', partName:'ADDRILL PAB 25 KG', qtyOrdered:20, qtyReceived:10, unitCost:4375, unit:'Kg' },
    ]
  },
  {
    id:'5', poNumber:'PO-2026-059', supplier:'M.S. ENTERPRISES', site:'Site A - Chhindwara',
    orderDate:'27.04.2026', expectedDate:'03.05.2026', billNo:'', billDate:'',
    status:'Draft', notes:'Hoses and filters',
    lineItems:[
      { id:'5a', partNumber:'FLT-FWS-01', partName:'Fuel Water Separator', qtyOrdered:12, qtyReceived:0, unitCost:2374, unit:'Each' },
      { id:'5b', partNumber:'FLT-LB-B71', partName:'Lube Filter B7125',    qtyOrdered:8,  qtyReceived:0, unitCost:1990, unit:'Each' },
    ]
  },
]

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href:'/admin/inventory',                label:'Dashboard'        },
  { href:'/admin/inventory/catalogue',      label:'Parts Catalogue'  },
  { href:'/admin/inventory/stock',          label:'Stock Management' },
  { href:'/admin/inventory/purchase-orders',label:'Purchase Orders'  },
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

// ── NEW PO MODAL ───────────────────────────────────────────────────────────
function NewPOModal({ onClose, onSave }: { onClose: ()=>void; onSave: (po: PurchaseOrder)=>void }) {
  const { format } = useCurrency()
  const [supplier, setSupplier] = useState(suppliers[0])
  const [customSupplier, setCustomSupplier] = useState('')
  const [site, setSite] = useState(sites[0])
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDate, setExpectedDate] = useState('')
  const [billNo, setBillNo] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<POLineItem[]>([{ id:'new1', partNumber:'', partName:'', qtyOrdered:1, qtyReceived:0, unitCost:0, unit:'Each' }])

  const addItem = () => setItems(i => [...i, { id:`new${Date.now()}`, partNumber:'', partName:'', qtyOrdered:1, qtyReceived:0, unitCost:0, unit:'Each' }])
  const removeItem = (id: string) => setItems(i => i.filter(x => x.id !== id))
  const updateItem = (id: string, field: keyof POLineItem, value: any) => setItems(i => i.map(x => x.id===id ? {...x,[field]:value} : x))

  const totalValue = items.reduce((s,i) => s + i.qtyOrdered * i.unitCost, 0)
  const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`

  const inputS: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }
  const selectS: React.CSSProperties = { ...inputS, cursor:'pointer', appearance:'none' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:'100%', maxWidth:760, maxHeight:'90vh', overflowY:'auto' }}>

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
                <select value={supplier} onChange={e=>setSupplier(e.target.value)} style={selectS}>
                  {suppliers.map(s=><option key={s}>{s}</option>)}
                </select>
                {supplier==='Custom / New Supplier' && <input value={customSupplier} onChange={e=>setCustomSupplier(e.target.value)} placeholder="Enter supplier name" style={{...inputS, marginTop:6}} />}
              </>
            )},
            { label:'Receiving Site', content: <select value={site} onChange={e=>setSite(e.target.value)} style={selectS}>{sites.map(s=><option key={s}>{s}</option>)}</select> },
            { label:'Order Date',     content: <input type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)} style={inputS} /> },
            { label:'Expected Delivery', content: <input type="date" value={expectedDate} onChange={e=>setExpectedDate(e.target.value)} style={inputS} /> },
            { label:'Bill / Invoice No', content: <input value={billNo} onChange={e=>setBillNo(e.target.value)} placeholder="e.g. 56/2627 or WFS-NGP-2112" style={inputS} /> },
            { label:'Notes', content: <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes..." style={inputS} /> },
          ].map((f,i)=>(
            <div key={i}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
              {f.content}
            </div>
          ))}
        </div>

        {/* Line Items */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Line Items</div>
            <button onClick={addItem} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Plus size={12} /> Add Item
            </button>
          </div>

          {/* Items table */}
          <div style={{ border:'1px solid #1E293B', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid #1E293B' }}>
                  {['Part Number','Part Name','Unit','Qty','Unit Cost','Amount',''].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item,i)=>(
                  <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <td style={{ padding:'8px 12px' }}><input value={item.partNumber} onChange={e=>updateItem(item.id,'partNumber',e.target.value)} placeholder="Part No" style={{...inputS,fontSize:11,padding:'6px 8px',width:90}} /></td>
                    <td style={{ padding:'8px 12px' }}><input value={item.partName}   onChange={e=>updateItem(item.id,'partName',e.target.value)}   placeholder="Description" style={{...inputS,fontSize:11,padding:'6px 8px',minWidth:160}} /></td>
                    <td style={{ padding:'8px 12px' }}>
                      <select value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)} style={{...selectS,fontSize:11,padding:'6px 8px',width:80}}>
                        {['Each','Kg','Litre','Set','Metre','Box','Bucket','Roll'].map(u=><option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'8px 12px' }}><input type="number" value={item.qtyOrdered} onChange={e=>updateItem(item.id,'qtyOrdered',parseInt(e.target.value)||0)} style={{...inputS,fontSize:11,padding:'6px 8px',width:60,textAlign:'center'}} /></td>
                    <td style={{ padding:'8px 12px' }}><input type="number" value={item.unitCost}   onChange={e=>updateItem(item.id,'unitCost',parseFloat(e.target.value)||0)} style={{...inputS,fontSize:11,padding:'6px 8px',width:90}} /></td>
                    <td style={{ padding:'8px 12px', fontSize:12, fontWeight:700, color:'#10B981', whiteSpace:'nowrap' }}>
                      {(item.qtyOrdered * item.unitCost).toLocaleString()}
                    </td>
                    <td style={{ padding:'8px 12px' }}>
                      <button onClick={()=>removeItem(item.id)} style={{ padding:4, borderRadius:5, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.5)', cursor:'pointer' }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                  <td colSpan={5} style={{ padding:'10px 12px', fontSize:12, fontWeight:700, color:'#64748B' }}>Total Order Value</td>
                  <td style={{ padding:'10px 12px', fontSize:15, fontWeight:800, color:'#F97316' }}>{totalValue.toLocaleString()}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>{
            const po: PurchaseOrder = { id:Date.now().toString(), poNumber, supplier: supplier==='Custom / New Supplier' ? customSupplier : supplier, site, orderDate, expectedDate, billNo, billDate:'', status:'Draft', lineItems:items, notes }
            onSave(po); onClose()
          }} style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(148,163,184,0.1)', border:'1px solid rgba(148,163,184,0.2)', color:'#94A3B8', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Save as Draft
          </button>
          <button onClick={()=>{
            const po: PurchaseOrder = { id:Date.now().toString(), poNumber, supplier: supplier==='Custom / New Supplier' ? customSupplier : supplier, site, orderDate, expectedDate, billNo, billDate:'', status:'Ordered', lineItems:items, notes }
            onSave(po); onClose()
          }} style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' }}>
            Place Order →
          </button>
        </div>
      </div>
    </div>
  )
}

function Trash2({ size, style }: { size: number; style?: React.CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function PurchaseOrdersPage() {
  const { format } = useCurrency()
  const [pos, setPos] = useState<PurchaseOrder[]>(seedPOs)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<POStatus|'All'>('All')
  const [filterSite, setFilterSite] = useState('All')
  const [showNewPO, setShowNewPO] = useState(false)
  const [expandedPO, setExpandedPO] = useState<string|null>(null)

  const filtered = pos.filter(po =>
    (filterStatus==='All' || po.status===filterStatus) &&
    (filterSite==='All' || po.site===filterSite) &&
    (search==='' || po.poNumber.toLowerCase().includes(search.toLowerCase()) || po.supplier.toLowerCase().includes(search.toLowerCase()))
  )

  const receiveStock = (poId: string) => {
    setPos(prev => prev.map(po => po.id===poId ? {
      ...po, status:'Received' as POStatus,
      lineItems: po.lineItems.map(item => ({...item, qtyReceived:item.qtyOrdered}))
    } : po))
  }

  const statusCounts = (Object.keys(statusConfig) as POStatus[]).map(s => ({ status:s, count:pos.filter(p=>p.status===s).length }))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Purchase Orders</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Manage supplier orders, track deliveries and receive stock</p>
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

      {/* Filters + New PO */}
      <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'12px 20px' }}>
        <div style={{ position:'relative', flex:1, minWidth:180 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PO number, supplier..."
            style={{ width:'100%', padding:'8px 12px 8px 30px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} />
        </div>
        <div style={{ position:'relative' }}>
          <select value={filterSite} onChange={e=>setFilterSite(e.target.value)}
            style={{ appearance:'none', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:13, padding:'8px 28px 8px 12px', borderRadius:8, cursor:'pointer', outline:'none' }}>
            <option value="All">All Sites</option>
            {sites.map(s=><option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
        </div>
        <button onClick={()=>setShowNewPO(true)}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' }}>
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
          const totalOrdered  = po.lineItems.reduce((s,i)=>s+i.qtyOrdered*i.unitCost, 0)
          const totalReceived = po.lineItems.reduce((s,i)=>s+i.qtyReceived*i.unitCost, 0)
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
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{po.poNumber}</span>
                    <StatusBadge status={po.status} />
                    {po.billNo && <span style={{ fontSize:11, color:'#64748B' }}>Bill: {po.billNo}</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#94A3B8', marginTop:3 }}>{po.supplier} · {po.site.split(' - ')[1] || po.site}</div>
                </div>
                <div style={{ textAlign:'right', marginRight:8 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:'#F8FAFC' }}>{format(totalOrdered)}</div>
                  <div style={{ fontSize:11, color:'#64748B', marginTop:1 }}>{po.lineItems.length} items · {po.orderDate}</div>
                </div>
                {pendingDelivery && (
                  <button onClick={e=>{e.stopPropagation(); receiveStock(po.id)}}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                    <Truck size={12} /> Receive Stock
                  </button>
                )}
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

      {/* New PO Modal */}
      {showNewPO && <NewPOModal onClose={()=>setShowNewPO(false)} onSave={po=>setPos(prev=>[po,...prev])} />}

    </div>
  )
}

