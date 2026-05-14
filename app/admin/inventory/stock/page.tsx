'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Trash2, Search, ChevronDown, ArrowLeftRight,
  AlertTriangle, TrendingDown, Package, History, X, Check
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface StockItem {
  id: string; partNumber: string; name: string; category: string
  currentQty: number; reorderLevel: number; unit: string
  unitCost: number; lastMovement: string; rig?: string
}
interface Movement {
  id: string; date: string; type: 'in'|'out'|'transfer'; part: string
  qty: number; rig?: string; from?: string; to?: string; note: string; value: number
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const siteOptions = ['Site A - Chhindwara','Site B - Madheri','Site C - Bokaro','Site D - Bhalukona']
const rigOptions  = ['All Rigs','KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9']

const siteStockData: Record<string, StockItem[]> = {
  'Site A - Chhindwara': [
    { id:'1', partNumber:'NQ-CB-SR06',  name:'NQ Core Bit SR-06',       category:'Core Bits',        currentQty:8,   reorderLevel:10, unit:'Each',  unitCost:11500, lastMovement:'2026-04-30' },
    { id:'2', partNumber:'HQ-CB-SR08',  name:'HQ Core Bit SR-08',       category:'Core Bits',        currentQty:12,  reorderLevel:8,  unit:'Each',  unitCost:19000, lastMovement:'2026-04-29' },
    { id:'3', partNumber:'MTX-DD955',   name:'MATEX DD955 Liquid',      category:'Drilling Additives',currentQty:18,  reorderLevel:15, unit:'Bucket',unitCost:12151, lastMovement:'2026-04-30' },
    { id:'4', partNumber:'MTX-SD-PPL',  name:'MATEX Sand Drill',        category:'Drilling Additives',currentQty:14,  reorderLevel:15, unit:'Bucket',unitCost:16886, lastMovement:'2026-04-30' },
    { id:'5', partNumber:'ADD-EA-20',   name:'ADDRILL EA-20 KG',        category:'Drilling Additives',currentQty:22,  reorderLevel:20, unit:'Kg',    unitCost:3200,  lastMovement:'2026-04-28' },
    { id:'6', partNumber:'FLT-FWS-01',  name:'Fuel Water Separator',    category:'Filters',          currentQty:3,   reorderLevel:12, unit:'Each',  unitCost:2374,  lastMovement:'2026-04-25' },
    { id:'7', partNumber:'FLT-LB-B71',  name:'Lube Filter B7125',       category:'Filters',          currentQty:2,   reorderLevel:8,  unit:'Each',  unitCost:1990,  lastMovement:'2026-04-24' },
    { id:'8', partNumber:'NQ-CL-001',   name:'NQ Core Lifter',          category:'Core Barrel',      currentQty:28,  reorderLevel:20, unit:'Each',  unitCost:400,   lastMovement:'2026-04-30' },
    { id:'9', partNumber:'SEL-VP-25K',  name:'V-Packing W/S 25K',       category:'Seals & Packings', currentQty:15,  reorderLevel:10, unit:'Each',  unitCost:780,   lastMovement:'2026-04-22' },
    { id:'10',partNumber:'BRG-SKF-618', name:'Bearing 61830 SKF',       category:'Bearings',         currentQty:1,   reorderLevel:2,  unit:'Each',  unitCost:41074, lastMovement:'2026-04-28' },
  ],
  'Site B - Madheri': [
    { id:'11',partNumber:'NQ-CB-SR06',  name:'NQ Core Bit SR-06',       category:'Core Bits',        currentQty:14,  reorderLevel:10, unit:'Each',  unitCost:11500, lastMovement:'2026-04-29' },
    { id:'12',partNumber:'MTX-DD955',   name:'MATEX DD955 Liquid',      category:'Drilling Additives',currentQty:20,  reorderLevel:15, unit:'Bucket',unitCost:12151, lastMovement:'2026-04-30' },
    { id:'13',partNumber:'FLT-AIR-01',  name:'Air Filter Primary',      category:'Filters',          currentQty:1,   reorderLevel:6,  unit:'Each',  unitCost:5000,  lastMovement:'2026-04-20' },
    { id:'14',partNumber:'ADD-PAB-25',  name:'ADDRILL PAB 25 KG',       category:'Drilling Additives',currentQty:18,  reorderLevel:20, unit:'Kg',    unitCost:4375,  lastMovement:'2026-04-28' },
  ],
  'Site C - Bokaro': [
    { id:'15',partNumber:'NQ-CB-SR06',  name:'NQ Core Bit SR-06',       category:'Core Bits',        currentQty:2,   reorderLevel:10, unit:'Each',  unitCost:11500, lastMovement:'2026-04-27' },
    { id:'16',partNumber:'HQ-CL-001',   name:'HQ Core Lifter',          category:'Core Barrel',      currentQty:4,   reorderLevel:10, unit:'Each',  unitCost:646,   lastMovement:'2026-04-26' },
    { id:'17',partNumber:'MTX-DD955',   name:'MATEX DD955 Liquid',      category:'Drilling Additives',currentQty:5,   reorderLevel:15, unit:'Bucket',unitCost:12151, lastMovement:'2026-04-28' },
    { id:'18',partNumber:'FLT-FWS-01',  name:'Fuel Water Separator',    category:'Filters',          currentQty:3,   reorderLevel:12, unit:'Each',  unitCost:2374,  lastMovement:'2026-04-25' },
  ],
  'Site D - Bhalukona': [
    { id:'19',partNumber:'NQ-CB-SR06',  name:'NQ Core Bit SR-06',       category:'Core Bits',        currentQty:10,  reorderLevel:10, unit:'Each',  unitCost:11500, lastMovement:'2026-04-29' },
    { id:'20',partNumber:'MTX-SD-PPL',  name:'MATEX Sand Drill',        category:'Drilling Additives',currentQty:5,   reorderLevel:15, unit:'Bucket',unitCost:16886, lastMovement:'2026-04-27' },
    { id:'21',partNumber:'ADD-EA-20',   name:'ADDRILL EA-20 KG',        category:'Drilling Additives',currentQty:24,  reorderLevel:20, unit:'Kg',    unitCost:3200,  lastMovement:'2026-04-30' },
  ],
}

const recentMovements: Movement[] = [
  { id:'1', date:'30 Apr 2026', type:'out',      part:'MATEX DD955',          qty:1,  rig:'KEM-9',   note:'Drill log auto-deduct',   value:12151  },
  { id:'2', date:'30 Apr 2026', type:'out',      part:'NQ Core Lifter',       qty:2,  rig:'KEM-8',   note:'Drill log auto-deduct',   value:800    },
  { id:'3', date:'29 Apr 2026', type:'in',       part:'HQ Core Bit SR-08',    qty:8,  note:'PO #56/2627 received',                  value:176000 },
  { id:'4', date:'29 Apr 2026', type:'out',      part:'ADDRILL EA-20 KG',     qty:1,  rig:'KEM-1',   note:'Drill log auto-deduct',   value:3200   },
  { id:'5', date:'28 Apr 2026', type:'transfer', part:'Bearing 61830 SKF',    qty:1,  from:'Site A', to:'Site B', note:'Site transfer',value:41074 },
  { id:'6', date:'27 Apr 2026', type:'out',      part:'NQ Core Bit SR-06',    qty:1,  rig:'KEM-4',   note:'Drill log auto-deduct',   value:11500  },
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

// ── ISSUE MODAL ────────────────────────────────────────────────────────────
function IssueModal({ part, onClose, onIssue }: { part: StockItem; onClose: ()=>void; onIssue: (qty: number, rig: string, note: string)=>void }) {
  const [qty, setQty] = useState(1)
  const [rig, setRig] = useState('KEM-1')
  const [note, setNote] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:400 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#F8FAFC' }}>Issue Stock to Rig</div>
          <button onClick={onClose} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={14} /></button>
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:'#F97316', marginBottom:16 }}>{part.name}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { label:'Quantity', content: <input type="number" min={1} max={part.currentQty} value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)} style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} /> },
            { label:'Rig', content: <select value={rig} onChange={e=>setRig(e.target.value)} style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', cursor:'pointer', appearance:'none' }}>{rigOptions.filter(r=>r!=='All Rigs').map(r=><option key={r}>{r}</option>)}</select> },
            { label:'Note', content: <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note..." style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} /> },
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

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function StockManagementPage() {
  const { format } = useCurrency()
  const [selectedSite, setSelectedSite] = useState(siteOptions[0])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'|'low'|'ok'>('all')
  const [issueTarget, setIssueTarget] = useState<StockItem|null>(null)
  const [stockData, setStockData] = useState(siteStockData)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferForm, setTransferForm] = useState({ part:'', qty:'1', from:siteOptions[0], to:siteOptions[1], note:'' })

  const stock = stockData[selectedSite] || []
  const filtered = stock.filter(item =>
    (filterStatus==='all' || (filterStatus==='low' ? item.currentQty <= item.reorderLevel : item.currentQty > item.reorderLevel)) &&
    (search==='' || item.name.toLowerCase().includes(search.toLowerCase()) || item.partNumber.toLowerCase().includes(search.toLowerCase()))
  )

  const totalValue = stock.reduce((s,i) => s + i.currentQty * i.unitCost, 0)
  const lowCount = stock.filter(i => i.currentQty <= i.reorderLevel).length

  const handleIssue = (qty: number, rig: string, note: string) => {
    if (!issueTarget) return
    setStockData(prev => {
      const updated = {...prev}
      updated[selectedSite] = updated[selectedSite].map(item =>
        item.id === issueTarget.id ? {...item, currentQty: Math.max(0, item.currentQty - qty), lastMovement: new Date().toISOString().split('T')[0]} : item
      )
      return updated
    })
    setIssueTarget(null)
  }

  const statusColor = (item: StockItem) => {
    const ratio = item.currentQty / item.reorderLevel
    if (ratio <= 0.3) return '#EF4444'
    if (ratio <= 1)   return '#F59E0B'
    return '#10B981'
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Stock Management</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Per-site stock levels — issue to rigs, transfer between sites</p>
        </div>
        <SubNav active="Stock Management" />
      </div>

      {/* Site selector + actions */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'12px 20px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' }}>Site:</div>
        <div style={{ display:'flex', gap:8 }}>
          {siteOptions.map(s => (
            <button key={s} onClick={()=>setSelectedSite(s)}
              style={{ padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                background: selectedSite===s ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'rgba(255,255,255,0.04)',
                color: selectedSite===s ? '#fff' : '#94A3B8',
                border: selectedSite===s ? 'none' : '1px solid #1E293B',
              }}>{s.split(' - ')[1] || s}</button>
          ))}
        </div>
        <button onClick={()=>setShowTransfer(true)}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', color:'#8B5CF6', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <ArrowLeftRight size={14} /> Transfer Between Sites
        </button>
      </div>

      {/* Site KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Parts',     value:stock.length,                 color:'#60A5FA', icon:'📦' },
          { label:'Low Stock',       value:lowCount,                     color: lowCount>0?'#EF4444':'#10B981', icon:'⚠️' },
          { label:'Total Stock Value',value:format(totalValue),           color:'#10B981', icon:'💰' },
          { label:'Site',            value:selectedSite.split(' - ')[1], color:'#F97316', icon:'📍' },
        ].map((k,i)=>(
          <div key={i} style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:14, padding:'16px 18px' }}>
            <div style={{ fontSize:18, marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search parts..."
            style={{ width:'100%', padding:'8px 12px 8px 30px', background:'#0D1117', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} />
        </div>
        {(['all','low','ok'] as const).map(f=>(
          <button key={f} onClick={()=>setFilterStatus(f)}
            style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              background: filterStatus===f ? (f==='low'?'rgba(239,68,68,0.15)':f==='ok'?'rgba(16,185,129,0.15)':'rgba(249,115,22,0.15)') : 'rgba(255,255,255,0.04)',
              color: filterStatus===f ? (f==='low'?'#EF4444':f==='ok'?'#10B981':'#F97316') : '#94A3B8',
              border: `1px solid ${filterStatus===f?(f==='low'?'rgba(239,68,68,0.25)':f==='ok'?'rgba(16,185,129,0.25)':'rgba(249,115,22,0.25)'):'#1E293B'}`,
            }}>
            {f==='all'?'All Stock':f==='low'?`⚠ Low Stock (${lowCount})`:'✅ OK Stock'}
          </button>
        ))}
      </div>

      {/* Stock Table */}
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              {['Part','Category','Current Stock','Reorder Level','Stock Status','Unit Cost','Stock Value','Last Movement','Action'].map(h=>(
                <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'#64748B' }}>No stock records for this site.</td></tr>
            )}
            {filtered.map(item => {
              const pct = Math.min(100, (item.currentQty / Math.max(item.reorderLevel * 2, 1)) * 100)
              const color = statusColor(item)
              const isLow = item.currentQty <= item.reorderLevel
              return (
                <tr key={item.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)', background: isLow ? 'rgba(239,68,68,0.02)' : 'transparent' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=isLow?'rgba(239,68,68,0.04)':'rgba(255,255,255,0.015)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=isLow?'rgba(239,68,68,0.02)':'transparent'}
                >
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{item.name}</div>
                    <div style={{ fontSize:10, color:'#64748B', marginTop:2, fontFamily:'monospace' }}>{item.partNumber}</div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:10, fontWeight:600, padding:'3px 7px', borderRadius:5, background:'rgba(59,130,246,0.08)', color:'#60A5FA', border:'1px solid rgba(59,130,246,0.12)' }}>{item.category}</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color }}>
                      {item.currentQty} <span style={{ fontSize:11, fontWeight:400, color:'#64748B' }}>{item.unit}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#94A3B8' }}>{item.reorderLevel} {item.unit}</td>
                  <td style={{ padding:'12px 16px', minWidth:120 }}>
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
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#10B981', fontWeight:600 }}>{format(item.unitCost)}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#F8FAFC', fontWeight:600 }}>{format(item.currentQty * item.unitCost)}</td>
                  <td style={{ padding:'12px 16px', fontSize:11, color:'#64748B' }}>{item.lastMovement}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <button onClick={()=>setIssueTarget(item)}
                      style={{ padding:'6px 12px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                      Issue to Rig
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              <td colSpan={5} style={{ padding:'12px 16px', fontSize:12, fontWeight:700, color:'#64748B' }}>{filtered.length} items</td>
              <td colSpan={2} style={{ padding:'12px 16px', fontSize:14, fontWeight:800, color:'#10B981' }}>{format(filtered.reduce((s,i)=>s+i.currentQty*i.unitCost,0))}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Recent Movements */}
      <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <History size={16} style={{ color:'#64748B' }} />
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Recent Stock Movements</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {recentMovements.map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B' }}>
              <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                background: m.type==='in'?'rgba(16,185,129,0.1)':m.type==='out'?'rgba(249,115,22,0.1)':'rgba(139,92,246,0.1)',
              }}>
                <span style={{ fontSize:12 }}>{m.type==='in'?'↓':m.type==='out'?'↑':'⇄'}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.part}</div>
                <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>{m.note}{m.rig ? ` · ${m.rig}` : ''}{m.from ? ` · ${m.from} → ${m.to}` : ''}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color: m.type==='in'?'#10B981':'#F97316' }}>{m.type==='in'?'+':'-'}{m.qty}</div>
                <div style={{ fontSize:10, color:'#64748B' }}>{m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Modal */}
      {issueTarget && <IssueModal part={issueTarget} onClose={()=>setIssueTarget(null)} onIssue={handleIssue} />}

      {/* Transfer Modal */}
      {showTransfer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:28, width:440 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#F8FAFC' }}>Transfer Stock Between Sites</div>
              <button onClick={()=>setShowTransfer(false)} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={14} /></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'From Site', content: <select value={transferForm.from} onChange={e=>setTransferForm(f=>({...f,from:e.target.value}))} style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', cursor:'pointer', appearance:'none' }}>{siteOptions.map(s=><option key={s}>{s}</option>)}</select> },
                { label:'To Site',   content: <select value={transferForm.to}   onChange={e=>setTransferForm(f=>({...f,to:e.target.value}))}   style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none', cursor:'pointer', appearance:'none' }}>{siteOptions.map(s=><option key={s}>{s}</option>)}</select> },
                { label:'Part',      content: <input value={transferForm.part}  onChange={e=>setTransferForm(f=>({...f,part:e.target.value}))}  placeholder="Part name or number" style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} /> },
                { label:'Quantity',  content: <input type="number" value={transferForm.qty} onChange={e=>setTransferForm(f=>({...f,qty:e.target.value}))} style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} /> },
                { label:'Note',      content: <input value={transferForm.note} onChange={e=>setTransferForm(f=>({...f,note:e.target.value}))} placeholder="Reason for transfer..." style={{ width:'100%', padding:'10px 12px', background:'#080B10', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} /> },
              ].map((f,i)=>(
                <div key={i}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
                  {f.content}
                </div>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={()=>setShowTransfer(false)} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                <button onClick={()=>setShowTransfer(false)} style={{ flex:1, padding:'10px', borderRadius:9, background:'linear-gradient(135deg,#8B5CF6,#7C3AED)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>
                  <ArrowLeftRight size={13} style={{ display:'inline', marginRight:6 }} />Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

