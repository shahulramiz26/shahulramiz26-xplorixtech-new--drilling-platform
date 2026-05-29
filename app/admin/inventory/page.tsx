'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Package, ArrowUpRight, ArrowDownRight, RefreshCw, Download } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../../components/currency-context'

// ── SUB NAV ──────────────────────────────────────────────────────────────────
const subNav = [
  { href:'/admin/inventory',                 label:'Dashboard'        },
  { href:'/admin/inventory/catalogue',       label:'Parts Catalogue'  },
  { href:'/admin/inventory/stock',           label:'Stock Management' },
  { href:'/admin/inventory/purchase-orders', label:'Purchase Orders'  },
  { href:'/admin/inventory/suppliers',       label:'Suppliers'        },
]
function SubNav({ active }: { active:string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4, flexWrap:'wrap' }}>
      {subNav.map(n=>(
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#F97316':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

// ── TYPES ────────────────────────────────────────────────────────────────────
interface Movement {
  id: string; type: 'received'|'issued'|'transferred'
  part: string; qty: number; unit: string
  project: string; rig?: string; by?: string
  poNumber?: string; supplier?: string
  fromProject?: string; toProject?: string
  date: string; value: number
}

interface ProjectSummary {
  project: string; opening: number; received: number
  issued: number; transferred: number; closing: number
  prevClosing: number
}

// ── SEED DATA PER PROJECT ─────────────────────────────────────────────────────
const projectOptions = ['All Projects','RS-01 - Chhindwara','CMP-MAD - Madheri','CMPDI-DAM - Bokaro','DGMIL-BHK - Bhalukona','PAT-CMPDI - Pathakuri','MECL-HIN - Bazar Gaon']
const rigOptions     = ['All Rigs','KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9']

const projectSummaries: ProjectSummary[] = [
  { project:'All Projects',         opening:11599232, received:1106489, issued:3706732, transferred:1908971, closing:7323859, prevClosing:8100000 },
  { project:'RS-01 - Chhindwara',   opening:7200000,  received:780000,  issued:2100000, transferred:920000,  closing:4960000, prevClosing:5400000 },
  { project:'CMP-MAD - Madheri',    opening:1800000,  received:180000,  issued:620000,  transferred:380000,  closing:980000,  prevClosing:1050000 },
  { project:'CMPDI-DAM - Bokaro',   opening:980000,   received:68000,   issued:340000,  transferred:210000,  closing:498000,  prevClosing:520000  },
  { project:'DGMIL-BHK - Bhalukona',opening:920000,   received:52000,   issued:410000,  transferred:280000,  closing:282000,  prevClosing:480000  },
  { project:'PAT-CMPDI - Pathakuri',opening:420000,   received:18000,   issued:150000,  transferred:80000,   closing:208000,  prevClosing:220000  },
  { project:'MECL-HIN - Bazar Gaon',opening:279232,   received:8489,    issued:86732,   transferred:38971,   closing:162028,  prevClosing:170000  },
]

const allMovements: Movement[] = [
  // RS-01 Received
  { id:'r1', type:'received', part:'NQ Core Bit SR-06',   qty:8,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-5', poNumber:'PO-2026-056', supplier:'IDP',       date:'28-04-2026', value:92000  },
  { id:'r2', type:'received', part:'MATEX DD955 Liquid',  qty:10, unit:'Bucket', project:'RS-01 - Chhindwara',    rig:'KEM-8', poNumber:'PO-2026-055', supplier:'WESTFIELDS',date:'29-04-2026', value:121510 },
  { id:'r3', type:'received', part:'Lube Filter B7125',   qty:12, unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-1', poNumber:'PO-2026-054', supplier:'ROCKTEK',   date:'22-04-2026', value:23880  },
  { id:'r4', type:'received', part:'Bearing 29330E SKF',  qty:2,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-9', poNumber:'PO-2026-053', supplier:'SKF INDIA', date:'15-04-2026', value:82150  },
  // RS-01 Issued
  { id:'i1', type:'issued',   part:'NQ Core Bit SR-06',   qty:2,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-9', by:'Rajesh Kumar', date:'24-05-2026', value:23000  },
  { id:'i2', type:'issued',   part:'NQ Core Lifter',      qty:2,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-8', by:'Suresh Singh', date:'30-04-2026', value:800    },
  { id:'i3', type:'issued',   part:'Lube Filter B7125',   qty:4,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-1', by:'Ravi Kumar',   date:'28-04-2026', value:7960   },
  { id:'i4', type:'issued',   part:'Top Cover Oil Seal',  qty:4,  unit:'NOS',    project:'RS-01 - Chhindwara',    rig:'KEM-9', by:'Mohan Verma',  date:'09-04-2026', value:31785  },
  { id:'i5', type:'issued',   part:'MATEX DD955 Liquid',  qty:6,  unit:'Bucket', project:'RS-01 - Chhindwara',    rig:'KEM-5', by:'Rajesh Kumar', date:'05-04-2026', value:72906  },
  // RS-01 Transferred
  { id:'t1', type:'transferred', part:'MATEX DD955 × 6',  qty:6,  unit:'Bucket', project:'RS-01 - Chhindwara', fromProject:'RS-01', toProject:'DGMIL-BHK', by:'Suresh Singh', date:'18-04-2026', value:72906 },
  { id:'t2', type:'transferred', part:'NQ Recover Tape',  qty:1,  unit:'NOS',    project:'RS-01 - Chhindwara', fromProject:'RS-01', toProject:'CMPDI-DAM', by:'Rajesh Kumar', date:'06-04-2026', value:2100  },
  // CMP-MAD Received
  { id:'r5', type:'received', part:'Air Filter Primary',  qty:6,  unit:'NOS',    project:'CMP-MAD - Madheri',     rig:'KEM-4', poNumber:'PO-2026-058', supplier:'ROCKTEK',   date:'25-04-2026', value:30000  },
  { id:'r6', type:'received', part:'ADDRILL PAB 25 KG',   qty:20, unit:'Kg',     project:'CMP-MAD - Madheri',     rig:'KEM-4', poNumber:'PO-2026-057', supplier:'AB EMULTECH',date:'20-04-2026', value:87500 },
  // CMP-MAD Issued
  { id:'i6', type:'issued',   part:'MATEX Sand Drill',    qty:5,  unit:'Bucket', project:'CMP-MAD - Madheri',     rig:'KEM-4', by:'Anil Sharma',  date:'28-04-2026', value:84430  },
  { id:'i7', type:'issued',   part:'Air Filter Primary',  qty:2,  unit:'NOS',    project:'CMP-MAD - Madheri',     rig:'KEM-4', by:'Ravi Kumar',   date:'22-04-2026', value:10000  },
  // CMP-MAD Transferred
  { id:'t3', type:'transferred', part:'NQ Core Bit SR-06', qty:4, unit:'NOS',   project:'CMP-MAD - Madheri', fromProject:'CMP-MAD', toProject:'RS-01', by:'Anil Sharma', date:'15-04-2026', value:46000 },
  // DGMIL-BHK Received
  { id:'r7', type:'received', part:'NQ Core Bit SR-06',   qty:10, unit:'NOS',   project:'DGMIL-BHK - Bhalukona',  rig:'KEM-6', poNumber:'PO-2026-059', supplier:'IDP',    date:'20-04-2026', value:115000 },
  // DGMIL-BHK Issued
  { id:'i8', type:'issued',   part:'NQ Core Bit SR-06',   qty:4,  unit:'NOS',   project:'DGMIL-BHK - Bhalukona',  rig:'KEM-6', by:'Anil Sharma',  date:'24-04-2026', value:46000  },
  { id:'i9', type:'issued',   part:'MATEX DD955 Liquid',  qty:5,  unit:'Bucket',project:'DGMIL-BHK - Bhalukona',  rig:'KEM-5', by:'Mohan Verma',  date:'18-04-2026', value:60755  },
  // CMPDI-DAM Received
  { id:'r8', type:'received', part:'HQ Core Bit SR-08',   qty:4,  unit:'NOS',   project:'CMPDI-DAM - Bokaro',     rig:'KEM-8', poNumber:'PO-2026-052', supplier:'IDP',    date:'18-04-2026', value:88000  },
  // CMPDI-DAM Issued
  { id:'i10',type:'issued',   part:'HQ Core Bit SR-08',   qty:3,  unit:'NOS',   project:'CMPDI-DAM - Bokaro',     rig:'KEM-8', by:'Suresh Patil', date:'25-04-2026', value:66000  },
  // PAT-CMPDI Received
  { id:'r9', type:'received', part:'Fuel Water Separator', qty:6, unit:'NOS',   project:'PAT-CMPDI - Pathakuri',  rig:'KEM-6', poNumber:'PO-2026-051', supplier:'ROCKTEK', date:'15-04-2026', value:14244 },
  // MECL-HIN Received
  { id:'r10',type:'received', part:'NQ Core Lifter',      qty:20, unit:'NOS',   project:'MECL-HIN - Bazar Gaon',  rig:'KEM-9', poNumber:'PO-2026-050', supplier:'IDP',    date:'12-04-2026', value:8000   },
]

// Predicted stock-outs
const stockOuts = [
  { part:'NQ Core Bit SR-06',   project:'RS-01',     current:6,  weeklyUsage:4,   unit:'NOS',    daysLeft:10 },
  { part:'Fuel Water Separator',project:'RS-01',     current:3,  weeklyUsage:2,   unit:'NOS',    daysLeft:10 },
  { part:'MATEX DD955',         project:'DGMIL-BHK', current:5,  weeklyUsage:3,   unit:'Bucket', daysLeft:11 },
  { part:'Lube Filter B7125',   project:'RS-01',     current:2,  weeklyUsage:1,   unit:'NOS',    daysLeft:14 },
  { part:'Air Filter Primary',  project:'CMP-MAD',   current:1,  weeklyUsage:0.5, unit:'NOS',    daysLeft:14 },
  { part:'HQ Core Lifter',      project:'CMPDI-DAM', current:4,  weeklyUsage:2,   unit:'NOS',    daysLeft:14 },
]

const overduePOs = [
  { poNumber:'PO-2026-060', supplier:'ROCKTEK INFRA', expected:'08.05.2026', overdueDays:16, value:134355, project:'CMP-MAD'    },
  { poNumber:'PO-2026-061', supplier:'AB EMULTECH',   expected:'05.05.2026', overdueDays:19, value:362500, project:'CMPDI-DAM'  },
  { poNumber:'PO-2026-062', supplier:'DHANBAD ENGG',  expected:'12.05.2026', overdueDays:12, value:52000,  project:'RS-01'      },
]

const deadStock = [
  { part:'Bearing 29330E SKF', project:'RS-01',    daysSinceMove:82, value:102325, unit:'NOS',  qty:1 },
  { part:'HW Casing 1.0 MTR',  project:'RS-01',    daysSinceMove:71, value:31500,  unit:'Each', qty:6 },
  { part:'NQ Latch',            project:'CMP-MAD',  daysSinceMove:68, value:5940,   unit:'NOS',  qty:6 },
  { part:'TCZ-50 Grease',       project:'RS-01',    daysSinceMove:65, value:37500,  unit:'Kg',   qty:3 },
]

const activityFeed = [
  { id:'1', time:'Just now',    type:'issue',    icon:'✋', text:'Rajesh Kumar issued 2× NQ Core Bit SR-06', sub:'KEM-5 · RS-01',                     color:'#F59E0B' },
  { id:'2', time:'2 hours ago', type:'po',       icon:'📦', text:'PO-2026-056 received from IDP',            sub:'₹2.2L stock added · RS-01',         color:'#10B981' },
  { id:'3', time:'3 hours ago', type:'request',  icon:'🔔', text:'Anil Sharma raised part request',          sub:'4× NQ Core Bit · DGMIL-BHK · URGENT',color:'#EF4444' },
  { id:'4', time:'5 hours ago', type:'transfer', icon:'⇄',  text:'6× MATEX DD955 transferred',              sub:'RS-01 → DGMIL-BHK · By: Suresh Singh',color:'#8B5CF6' },
  { id:'5', time:'Yesterday',   type:'issue',    icon:'✋', text:'Mohan Verma issued 4× Bearing SKF',        sub:'KEM-9 · RS-01',                     color:'#F59E0B' },
  { id:'6', time:'Yesterday',   type:'po',       icon:'📦', text:'PO-2026-055 received from WESTFIELDS',     sub:'₹2.9L stock added · RS-01',         color:'#10B981' },
  { id:'7', time:'2 days ago',  type:'transfer', icon:'⇄',  text:'NQ Recover Tape transferred',             sub:'RS-01 → CMPDI-DAM',                 color:'#8B5CF6' },
  { id:'8', time:'2 days ago',  type:'issue',    icon:'✋', text:'Ravi Kumar issued 6× Lube Filter',        sub:'KEM-1 · RS-01',                     color:'#F59E0B' },
]

const costTrend = [
  { month:'Dec', spend:2100000, received:820000  },
  { month:'Jan', spend:2400000, received:1100000 },
  { month:'Feb', spend:2200000, received:890000  },
  { month:'Mar', spend:1900000, received:1050000 },
  { month:'Apr', spend:3706732, received:1106489 },
  { month:'May', spend:1200000, received:450000  },
]

const projectConsumption = [
  { project:'RS-01',     value:3706732 },
  { project:'DGMIL-BHK', value:2100000 },
  { project:'CMP-MAD',   value:1800000 },
  { project:'MECL-HIN',  value:1150000 },
  { project:'CMPDI-DAM', value:980000  },
  { project:'PAT-CMPDI', value:750000  },
]

const tooltipStyle = {
  contentStyle:{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:10, color:'#F8FAFC', fontSize:11 },
  labelStyle:{ color:'#94A3B8' },
}
const S = {
  card: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 },
  label: { fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const },
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const { format, formatShort } = useCurrency()
  const [selectedProject, setSelectedProject] = useState('All Projects')
  const [selectedRig, setSelectedRig] = useState('All Rigs')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedProject, setAppliedProject] = useState('All Projects')
  const [appliedRig, setAppliedRig] = useState('All Rigs')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')
  const [isFiltered, setIsFiltered] = useState(false)

  // ── Get summary for applied project ─────────────────────────────────────
  const summary = useMemo(() =>
    projectSummaries.find(p => p.project === appliedProject) || projectSummaries[0],
    [appliedProject]
  )
  const closingChange = ((summary.closing - summary.prevClosing) / summary.prevClosing * 100).toFixed(1)
  const isClosingUp = summary.closing > summary.prevClosing

  // ── Filter movements ─────────────────────────────────────────────────────
  const filteredMovements = useMemo(() => {
    return allMovements.filter(m => {
      const matchProject = appliedProject === 'All Projects' || m.project === appliedProject
      const matchRig = appliedRig === 'All Rigs' || m.rig === appliedRig
      return matchProject && matchRig
    })
  }, [appliedProject, appliedRig])

  const receivedItems   = filteredMovements.filter(m => m.type === 'received')
  const issuedItems     = filteredMovements.filter(m => m.type === 'issued')
  const transferredItems= filteredMovements.filter(m => m.type === 'transferred')

  // ── Filter stock-outs ─────────────────────────────────────────────────────
  const filteredStockOuts = useMemo(() =>
    stockOuts.filter(s => appliedProject === 'All Projects' || s.project === appliedProject.split(' - ')[0]),
    [appliedProject]
  )

  // ── Filter activity feed ─────────────────────────────────────────────────
  const filteredActivity = useMemo(() =>
    activityFeed.filter(a => appliedProject === 'All Projects' || a.sub.includes(appliedProject.split(' - ')[0])),
    [appliedProject]
  )

  const handleApply = () => {
    setAppliedProject(selectedProject)
    setAppliedRig(selectedRig)
    setAppliedDateFrom(dateFrom)
    setAppliedDateTo(dateTo)
    setIsFiltered(true)
  }

  const handleClearAll = () => {
    setSelectedProject('All Projects'); setSelectedRig('All Rigs')
    setDateFrom(''); setDateTo('')
    setAppliedProject('All Projects'); setAppliedRig('All Rigs')
    setAppliedDateFrom(''); setAppliedDateTo('')
    setIsFiltered(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Inventory Management</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Live stock intelligence across all projects</p>
        </div>
        <SubNav active="Dashboard" />
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ ...S.card, padding:'14px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ ...S.label }}>Filter:</span>
          {/* Project pills */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {projectOptions.map(p=>(
              <button key={p} onClick={()=>setSelectedProject(p)}
                style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                  background: selectedProject===p ? '#F97316' : 'rgba(255,255,255,0.04)',
                  color: selectedProject===p ? '#fff' : '#64748B',
                  border: selectedProject===p ? 'none' : '1px solid #1E293B',
                }}>{p === 'All Projects' ? 'All' : p.split(' - ')[0]}</button>
            ))}
          </div>
          <div style={{ width:1, height:20, background:'#1E293B' }} />
          {/* Rig pills */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {rigOptions.map(r=>(
              <button key={r} onClick={()=>setSelectedRig(r)}
                style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                  background: selectedRig===r ? '#3B82F6' : 'rgba(255,255,255,0.04)',
                  color: selectedRig===r ? '#fff' : '#64748B',
                  border: selectedRig===r ? 'none' : '1px solid #1E293B',
                }}>{r}</button>
            ))}
          </div>
          <div style={{ width:1, height:20, background:'#1E293B' }} />
          {/* Date range */}
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:11, color:'#64748B' }}>From</span>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
              style={{ padding:'5px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:11, outline:'none' }} />
            <span style={{ fontSize:11, color:'#64748B' }}>To</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
              style={{ padding:'5px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:11, outline:'none' }} />
          </div>
          {/* Apply button */}
          <button onClick={handleApply}
            style={{ padding:'7px 22px', borderRadius:9, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 12px rgba(249,115,22,0.3)', whiteSpace:'nowrap' }}>
            Apply
          </button>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            {isFiltered && (
              <button onClick={handleClearAll}
                style={{ padding:'7px 12px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                Clear All
              </button>
            )}
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Download size={13} /> Export
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Applied filter indicator */}
      {isFiltered && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:10, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)' }}>
          <span style={{ fontSize:11, color:'#F97316', fontWeight:700 }}>Filtered:</span>
          {appliedProject !== 'All Projects' && <span style={{ fontSize:11, color:'#F8FAFC', padding:'2px 8px', borderRadius:20, background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.2)' }}>{appliedProject.split(' - ')[0]}</span>}
          {appliedRig !== 'All Rigs' && <span style={{ fontSize:11, color:'#F8FAFC', padding:'2px 8px', borderRadius:20, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)' }}>{appliedRig}</span>}
          {appliedDateFrom && <span style={{ fontSize:11, color:'#F8FAFC', padding:'2px 8px', borderRadius:20, background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.2)' }}>{appliedDateFrom} → {appliedDateTo}</span>}
          <button onClick={handleClearAll} style={{ marginLeft:'auto', fontSize:11, color:'#64748B', cursor:'pointer', background:'none', border:'none', padding:0 }}>✕ Clear all</button>
        </div>
      )}

      {/* ── STORE SUMMARY ── */}
      <div style={{ ...S.card, padding:20, background:'linear-gradient(135deg,rgba(249,115,22,0.04),rgba(13,17,23,0.98))', borderColor:'rgba(249,115,22,0.12)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#F97316' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'#F97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Store Summary — {new Date().toLocaleString('default',{month:'long',year:'numeric'})}
          </span>
          <span style={{ fontSize:11, color:'#64748B', marginLeft:4 }}>{appliedProject}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0 }}>
          {[
            { label:'Opening Balance', value:summary.opening,     color:'#94A3B8' },
            { label:'+ Received',      value:summary.received,    color:'#10B981' },
            { label:'− Issued',        value:summary.issued,      color:'#EF4444' },
            { label:'− Transferred',   value:summary.transferred, color:'#F59E0B' },
            { label:'Closing Balance', value:summary.closing,     color:'#F97316' },
          ].map((s,i)=>(
            <div key={i} style={{ position:'relative' }}>
              <div style={{ textAlign:'center', padding:'16px 8px', borderRadius:12,
                background: i===4 ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.02)',
                border: i===4 ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.04)',
                margin:'0 4px',
              }}>
                <div style={{ fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:s.color }}>{formatShort(s.value)}</div>
                {i===4 && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:6 }}>
                    {isClosingUp ? <ArrowUpRight size={11} color='#10B981' /> : <ArrowDownRight size={11} color='#EF4444' />}
                    <span style={{ fontSize:10, color: isClosingUp ? '#10B981' : '#EF4444', fontWeight:700 }}>{Math.abs(Number(closingChange))}% vs last month</span>
                  </div>
                )}
              </div>
              {i < 4 && (
                <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', zIndex:10,
                  width:16, height:16, borderRadius:'50%', background:'#1E293B', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, color: i===0?'#10B981':'#EF4444', fontWeight:800 }}>
                  {i===0?'+':'−'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STORE STATEMENT — shows when filter applied ── */}
      {isFiltered && (
        <div style={{ ...S.card, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid #1E293B', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>📋 Store Statement</span>
            <span style={{ fontSize:11, color:'#64748B' }}>
              {appliedProject !== 'All Projects' ? appliedProject : 'All Projects'}
              {appliedRig !== 'All Rigs' ? ` · ${appliedRig}` : ''}
              {appliedDateFrom ? ` · ${appliedDateFrom} to ${appliedDateTo}` : ''}
            </span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0 }}>

            {/* RECEIVED */}
            <div style={{ padding:20, borderRight:'1px solid #1E293B' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:13 }}>📦</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>Received</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)' }}>
                  {receivedItems.length} items · {formatShort(receivedItems.reduce((s,m)=>s+m.value,0))}
                </span>
              </div>
              {receivedItems.length === 0 ? (
                <div style={{ fontSize:12, color:'#64748B', textAlign:'center', padding:'20px 0' }}>No receipts for this filter</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {receivedItems.map(m=>(
                    <div key={m.id} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.1)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC' }}>{m.part}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:'#10B981' }}>+{formatShort(m.value)}</div>
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:3 }}>
                        {m.qty} {m.unit} · {m.poNumber} · {m.supplier}
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>{m.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ISSUED */}
            <div style={{ padding:20, borderRight:'1px solid #1E293B' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:13 }}>✋</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#F97316' }}>Issued to Rigs</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(249,115,22,0.1)', color:'#F97316', border:'1px solid rgba(249,115,22,0.2)' }}>
                  {issuedItems.length} items · {formatShort(issuedItems.reduce((s,m)=>s+m.value,0))}
                </span>
              </div>
              {issuedItems.length === 0 ? (
                <div style={{ fontSize:12, color:'#64748B', textAlign:'center', padding:'20px 0' }}>No issues for this filter</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {issuedItems.map(m=>(
                    <div key={m.id} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.1)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC' }}>{m.part}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:'#F97316' }}>−{formatShort(m.value)}</div>
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:3 }}>
                        {m.qty} {m.unit} → {m.rig}
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>By: {m.by} · {m.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TRANSFERRED */}
            <div style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:13 }}>⇄</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#8B5CF6' }}>Transferred</span>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(139,92,246,0.1)', color:'#8B5CF6', border:'1px solid rgba(139,92,246,0.2)' }}>
                  {transferredItems.length} items · {formatShort(transferredItems.reduce((s,m)=>s+m.value,0))}
                </span>
              </div>
              {transferredItems.length === 0 ? (
                <div style={{ fontSize:12, color:'#64748B', textAlign:'center', padding:'20px 0' }}>No transfers for this filter</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {transferredItems.map(m=>(
                    <div key={m.id} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(139,92,246,0.04)', border:'1px solid rgba(139,92,246,0.1)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC' }}>{m.part}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:'#8B5CF6' }}>{formatShort(m.value)}</div>
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:3 }}>
                        {m.fromProject} → {m.toProject}
                      </div>
                      <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>By: {m.by} · {m.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── STOCK-OUTS + OVERDUE POs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Stock-Outs */}
        <div style={{ ...S.card, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Predicted Stock-Outs</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Based on current usage rates</div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444' }}>
              {filteredStockOuts.length} at risk
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filteredStockOuts.slice(0,5).map((s,i)=>{
              const c = s.daysLeft <= 10 ? '#EF4444' : s.daysLeft <= 14 ? '#F59E0B' : '#10B981'
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10,
                  background:`${c}10`, border:`1px solid ${c}25` }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${c}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:c, lineHeight:1 }}>{s.daysLeft}</div>
                    <div style={{ fontSize:8, color:c, lineHeight:1 }}>days</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.part}</div>
                    <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{s.project} · {s.current} {s.unit} left · {s.weeklyUsage}/week usage</div>
                  </div>
                  <Link href="/admin/inventory/purchase-orders"
                    style={{ padding:'5px 10px', borderRadius:7, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:10, fontWeight:700, textDecoration:'none', whiteSpace:'nowrap' }}>
                    Raise PO →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Overdue POs */}
        <div style={{ ...S.card, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Overdue Purchase Orders</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Past expected delivery date</div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444' }}>
              {overduePOs.length} overdue
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {overduePOs.map((po,i)=>{
              const maxDays = Math.max(...overduePOs.map(p=>p.overdueDays))
              return (
                <div key={i} style={{ padding:'12px 14px', borderRadius:10, background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.12)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{po.poNumber}</span>
                      <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>{po.supplier}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:'#EF4444' }}>{po.overdueDays} days late</span>
                      <span style={{ fontSize:11, color:'#10B981', fontWeight:600 }}>{formatShort(po.value)}</span>
                    </div>
                  </div>
                  <div style={{ background:'rgba(239,68,68,0.08)', borderRadius:4, height:5, marginBottom:8 }}>
                    <div style={{ width:`${(po.overdueDays/maxDays)*100}%`, height:5, borderRadius:4, background:'#EF4444' }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'#64748B' }}>Expected: {po.expected} · {po.project}</span>
                    <button style={{ padding:'4px 10px', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                      Follow Up
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── COST TREND ── */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Cost Trend — Last 6 Months</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Monthly spend vs stock received</div>
          </div>
          <div style={{ display:'flex', gap:16, fontSize:11 }}>
            {[['#EF4444','Spend'],['#10B981','Received']].map(([c,l])=>(
              <span key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:20, height:2, background:c, display:'inline-block', borderRadius:2 }} />
                <span style={{ color:'#94A3B8' }}>{l}</span>
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={costTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(1)}L`} />
            <Tooltip {...tooltipStyle} formatter={(v:any)=>[`₹${(v/100000).toFixed(2)}L`,'']} />
            <Line type="monotone" dataKey="spend"    stroke="#EF4444" strokeWidth={2} dot={{ fill:'#EF4444', r:4 }} name="Spend" />
            <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} dot={{ fill:'#10B981', r:4 }} strokeDasharray="5 4" name="Received" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── DEAD STOCK + ACTIVITY FEED ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Dead Stock */}
        <div style={{ ...S.card, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Dead Stock</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Parts unused for 60+ days — money locked up</div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#F59E0B' }}>
              {formatShort(deadStock.reduce((s,d)=>s+d.value*d.qty,0))} locked
            </span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {deadStock.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10,
                background:'rgba(245,158,11,0.03)', border:'1px solid rgba(245,158,11,0.1)' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'rgba(245,158,11,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Package size={16} style={{ color:'#F59E0B' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.part}</div>
                  <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{d.project} · {d.qty} {d.unit} · {format(d.value * d.qty)}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{d.daysSinceMove}d idle</div>
                </div>
                <div style={{ display:'flex', gap:4 }}>
                  <button style={{ padding:'4px 8px', borderRadius:6, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', color:'#8B5CF6', fontSize:9, fontWeight:700, cursor:'pointer' }}>Transfer</button>
                  <button style={{ padding:'4px 8px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', fontSize:9, fontWeight:600, cursor:'pointer' }}>Flag</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ ...S.card, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Live Activity Feed</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>All movements across all projects</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {(() => {
              let lastTime = ''
              return filteredActivity.map((a)=>{
                const showTime = a.time !== lastTime
                lastTime = a.time
                return (
                  <div key={a.id}>
                    {showTime && (
                      <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', padding:'8px 0 4px', display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:1, background:'#1E293B' }} />
                        {a.time}
                        <div style={{ flex:1, height:1, background:'#1E293B' }} />
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 10px', borderRadius:10, marginBottom:4,
                      background:`${a.color}08`, border:`1px solid ${a.color}18` }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:`${a.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13 }}>
                        {a.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.text}</div>
                        <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{a.sub}</div>
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      {/* ── PROJECT CONSUMPTION ── */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Project-wise Consumption</div>
          <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Which project is consuming most stock value this month</div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={projectConsumption} layout="vertical" margin={{ left:10, right:40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(1)}L`} />
            <YAxis type="category" dataKey="project" tick={{ fill:'#94A3B8', fontSize:11 }} axisLine={false} tickLine={false} width={76} />
            <Tooltip {...tooltipStyle} formatter={(v:any)=>[`₹${(v/100000).toFixed(2)}L`,'Consumed']} />
            <Bar dataKey="value" radius={[0,6,6,0]} fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

