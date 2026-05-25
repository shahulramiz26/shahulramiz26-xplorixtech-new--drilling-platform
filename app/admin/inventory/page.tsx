'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, TrendingDown, Package, ShoppingCart, ArrowUpRight, ArrowDownRight, RefreshCw, Download, ChevronDown, Clock, Bell, ArrowLeftRight, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '../../components/currency-context'

// ── SUB NAV ─────────────────────────────────────────────────────────────────
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

// ── SEED DATA ────────────────────────────────────────────────────────────────
const projectOptions = ['All Projects','RS-01 - Chhindwara','CMP-MAD - Madheri','CMPDI-DAM - Bokaro','DGMIL-BHK - Bhalukona','PAT-CMPDI - Pathakuri','MECL-HIN - Bazar Gaon']
const rigOptions     = ['All Rigs','KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9']

const storeSummary = {
  opening:  11599232,
  received:  1106489,
  issued:    3706732,
  transferred:1908971,
  closing:   7323859,
  prevClosing:8100000,
}

// Cost trend last 6 months
const costTrend = [
  { month:'Dec', spend:2100000, received:820000  },
  { month:'Jan', spend:2400000, received:1100000 },
  { month:'Feb', spend:2200000, received:890000  },
  { month:'Mar', spend:1900000, received:1050000 },
  { month:'Apr', spend:3706732, received:1106489 },
  { month:'May', spend:1200000, received:450000  },
]

// Project consumption
const projectConsumption = [
  { project:'RS-01',    value:3706732, rigs:3 },
  { project:'DGMIL-BHK',value:2100000, rigs:1 },
  { project:'CMP-MAD',  value:1800000, rigs:3 },
  { project:'MECL-HIN', value:1150000, rigs:2 },
  { project:'CMPDI-DAM',value:980000,  rigs:2 },
  { project:'PAT-CMPDI',value:750000,  rigs:2 },
]

// Predicted stock-outs
const stockOuts = [
  { part:'NQ Core Bit SR-06',  project:'RS-01',    current:6,  weeklyUsage:4, unit:'NOS', daysLeft:10, critical:true  },
  { part:'Fuel Water Separator',project:'RS-01',   current:3,  weeklyUsage:2, unit:'NOS', daysLeft:10, critical:true  },
  { part:'MATEX DD955',         project:'DGMIL-BHK',current:5, weeklyUsage:3, unit:'Bucket', daysLeft:11, critical:true },
  { part:'Lube Filter B7125',   project:'RS-01',   current:2,  weeklyUsage:1, unit:'NOS', daysLeft:14, critical:false },
  { part:'Air Filter Primary',  project:'CMP-MAD', current:1,  weeklyUsage:0.5, unit:'NOS', daysLeft:14, critical:false },
  { part:'HQ Core Lifter',      project:'CMPDI-DAM',current:4, weeklyUsage:2, unit:'NOS', daysLeft:14, critical:false },
]

// Overdue POs
const overduePOs = [
  { poNumber:'PO-2026-060', supplier:'ROCKTEK INFRA', expected:'08.05.2026', overdueDays:16, value:134355,  project:'CMP-MAD'   },
  { poNumber:'PO-2026-061', supplier:'AB EMULTECH',   expected:'05.05.2026', overdueDays:19, value:362500,  project:'CMPDI-DAM' },
  { poNumber:'PO-2026-062', supplier:'DHANBAD ENGG',  expected:'12.05.2026', overdueDays:12, value:52000,   project:'RS-01'     },
]

// Dead stock
const deadStock = [
  { part:'Bearing 29330E SKF',  project:'RS-01',    daysSinceMove:82, value:102325, unit:'NOS', qty:1  },
  { part:'HW Casing 1.0 MTR',   project:'RS-01',    daysSinceMove:71, value:31500,  unit:'Each', qty:6 },
  { part:'NQ Latch',             project:'CMP-MAD',  daysSinceMove:68, value:5940,   unit:'NOS', qty:6  },
  { part:'TCZ-50 Grease',        project:'RS-01',    daysSinceMove:65, value:37500,  unit:'Kg',  qty:3  },
]

// Activity feed
const activityFeed = [
  { id:'1', time:'Just now',     type:'issue',    icon:'✋', text:'Rajesh Kumar issued 2× NQ Core Bit SR-06', sub:'KEM-5 · RS-01',          color:'#F59E0B' },
  { id:'2', time:'2 hours ago',  type:'po',       icon:'📦', text:'PO-2026-056 received from IDP',            sub:'₹2.2L stock added · RS-01', color:'#10B981' },
  { id:'3', time:'3 hours ago',  type:'request',  icon:'🔔', text:'Anil Sharma raised part request',          sub:'4× NQ Core Bit · DGMIL-BHK · URGENT', color:'#EF4444' },
  { id:'4', time:'5 hours ago',  type:'transfer', icon:'⇄',  text:'6× MATEX DD955 transferred',              sub:'RS-01 → DGMIL-BHK · By: Suresh Singh', color:'#8B5CF6' },
  { id:'5', time:'Yesterday',    type:'issue',    icon:'✋', text:'Mohan Verma issued 4× Bearing SKF',        sub:'KEM-9 · RS-01',          color:'#F59E0B' },
  { id:'6', time:'Yesterday',    type:'po',       icon:'📦', text:'PO-2026-055 received from WESTFIELDS',     sub:'₹2.9L stock added · RS-01', color:'#10B981' },
  { id:'7', time:'2 days ago',   type:'transfer', icon:'⇄',  text:'NQ Recover Tape transferred',             sub:'RS-01 → CMPDI-DAM',       color:'#8B5CF6' },
  { id:'8', time:'2 days ago',   type:'issue',    icon:'✋', text:'Ravi Kumar issued 6× Lube Filter',        sub:'KEM-1 · RS-01',           color:'#F59E0B' },
]

const tooltipStyle = {
  contentStyle:{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:10, color:'#F8FAFC', fontSize:11 },
  labelStyle:{ color:'#94A3B8' },
}

const S = {
  card: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 },
  label: { fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const },
}

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const { format, formatShort, currency } = useCurrency()
  const [selectedProject, setSelectedProject] = useState('All Projects')
  const [selectedRig, setSelectedRig] = useState('All Rigs')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const closingChange = ((storeSummary.closing - storeSummary.prevClosing) / storeSummary.prevClosing * 100).toFixed(1)
  const isClosingUp = storeSummary.closing > storeSummary.prevClosing

  const filteredStockOuts = useMemo(() =>
    stockOuts.filter(s => selectedProject === 'All Projects' || s.project === selectedProject.split(' - ')[0]),
    [selectedProject]
  )

  const filteredActivity = useMemo(() =>
    activityFeed.filter(a => selectedProject === 'All Projects' || a.sub.includes(selectedProject.split(' - ')[0])),
    [selectedProject]
  )

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

      {/* ── WIDGET 1: SMART FILTER BAR ── */}
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
                }}>{r === 'All Rigs' ? 'All Rigs' : r}</button>
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
            {(dateFrom||dateTo) && (
              <button onClick={()=>{setDateFrom('');setDateTo('')}}
                style={{ padding:'4px 10px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>Clear</button>
            )}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Download size={13} /> Export
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── WIDGET 2: STORE SUMMARY — connected flow tiles ── */}
      <div style={{ ...S.card, padding:20, background:'linear-gradient(135deg,rgba(249,115,22,0.04),rgba(13,17,23,0.98))', borderColor:'rgba(249,115,22,0.12)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#F97316' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'#F97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Store Summary — {new Date().toLocaleString('default',{month:'long',year:'numeric'})}
          </span>
          <span style={{ fontSize:11, color:'#64748B', marginLeft:4 }}>
            {selectedProject !== 'All Projects' ? selectedProject : 'All Projects'}
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:0 }}>
          {[
            { label:'Opening Balance', value:storeSummary.opening,    color:'#94A3B8', sign:''  },
            { label:'+ Received',      value:storeSummary.received,   color:'#10B981', sign:'+' },
            { label:'− Issued',        value:storeSummary.issued,     color:'#EF4444', sign:'−' },
            { label:'− Transferred',   value:storeSummary.transferred,color:'#F59E0B', sign:'−' },
            { label:'Closing Balance', value:storeSummary.closing,    color:'#F97316', sign:''  },
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

      {/* ── WIDGETS 3+4: STOCK-OUT COUNTDOWN + OVERDUE POs ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* WIDGET 3: Predicted Stock-Out Countdown cards */}
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
              const urgentColor = s.daysLeft <= 10 ? '#EF4444' : s.daysLeft <= 14 ? '#F59E0B' : '#10B981'
              const urgentBg   = s.daysLeft <= 10 ? 'rgba(239,68,68,0.06)' : s.daysLeft <= 14 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.04)'
              const urgentBdr  = s.daysLeft <= 10 ? 'rgba(239,68,68,0.15)' : s.daysLeft <= 14 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.1)'
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, background:urgentBg, border:`1px solid ${urgentBdr}` }}>
                  {/* Countdown circle */}
                  <div style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${urgentColor}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:urgentColor, lineHeight:1 }}>{s.daysLeft}</div>
                    <div style={{ fontSize:8, color:urgentColor, lineHeight:1 }}>days</div>
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

        {/* WIDGET 4: Overdue POs — timeline style */}
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
              const pct = (po.overdueDays / maxDays) * 100
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
                  {/* Overdue bar */}
                  <div style={{ background:'rgba(239,68,68,0.08)', borderRadius:4, height:5, marginBottom:8 }}>
                    <div style={{ width:`${pct}%`, height:5, borderRadius:4, background:'#EF4444', transition:'width 0.5s' }} />
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

      {/* ── WIDGET 5: COST TREND LINE CHART ── */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Cost Trend — Last 6 Months</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Monthly spend vs stock received · April spike: 3 POs + urgent orders</div>
          </div>
          <div style={{ display:'flex', gap:16, fontSize:11 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:20, height:2, background:'#EF4444', display:'inline-block', borderRadius:2 }} />
              <span style={{ color:'#94A3B8' }}>Spend / Issued</span>
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:20, height:2, background:'#10B981', display:'inline-block', borderRadius:2 }} />
              <span style={{ color:'#94A3B8' }}>Received</span>
            </span>
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

      {/* ── WIDGETS 6+7: DEAD STOCK + ACTIVITY FEED ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* WIDGET 6: Dead Stock — shelf cards */}
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
            {deadStock.map((d,i)=>{
              const opacity = Math.max(0.4, 1 - (d.daysSinceMove - 60) / 60)
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10,
                  background:`rgba(245,158,11,${0.02 + (1-opacity)*0.04})`,
                  border:`1px solid rgba(245,158,11,${0.08 + (1-opacity)*0.1})`,
                }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'rgba(245,158,11,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Package size={16} style={{ color:'#F59E0B', opacity }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.part}</div>
                    <div style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{d.project} · {d.qty} {d.unit} · {format(d.value * d.qty)}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{d.daysSinceMove}d</div>
                    <div style={{ fontSize:9, color:'#64748B' }}>idle</div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button style={{ padding:'4px 8px', borderRadius:6, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', color:'#8B5CF6', fontSize:9, fontWeight:700, cursor:'pointer' }}>Transfer</button>
                    <button style={{ padding:'4px 8px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', fontSize:9, fontWeight:600, cursor:'pointer' }}>Flag</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop:14, padding:'10px 14px', borderRadius:10, background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.1)', textAlign:'center' }}>
            <span style={{ fontSize:11, color:'#F59E0B', fontWeight:600 }}>
              Total dead stock value: {formatShort(deadStock.reduce((s,d)=>s+d.value*d.qty,0))} — consider transfer or return to supplier
            </span>
          </div>
        </div>

        {/* WIDGET 7: Live Activity Feed — WhatsApp style */}
        <div style={{ ...S.card, padding:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Live Activity Feed</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>All movements across all projects</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {['All','Issues','POs','Transfers'].map((f,i)=>(
                <button key={f} style={{ padding:'3px 8px', borderRadius:6, fontSize:10, fontWeight:600, cursor:'pointer',
                  background: i===0 ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${i===0 ? 'rgba(249,115,22,0.2)' : '#1E293B'}`,
                  color: i===0 ? '#F97316' : '#64748B',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {(() => {
              let lastTime = ''
              return filteredActivity.map((a,i)=>{
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

      {/* Project consumption bar chart */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Project-wise Consumption</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Which project is consuming most stock value this month</div>
          </div>
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

