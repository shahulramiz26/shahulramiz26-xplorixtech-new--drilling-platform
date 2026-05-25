'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Wrench, Package, Award, ChevronDown, ArrowUpRight,
  ArrowDownRight, FileText, Clock, CheckCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useCurrency } from '../../components/currency-context'

// ── DATA ─────────────────────────────────────────────────────────────────────
const projectOptions = ['All Projects','RS-01 - Chhindwara','CMP-MAD - Madheri','CMPDI-DAM - Bokaro','DGMIL-BHK - Bhalukona','PAT-CMPDI - Pathakuri','MECL-HIN - Bazar Gaon']
const rigOptions     = ['All Rigs','KEM-1','KEM-4','KEM-5','KEM-6','KEM-8','KEM-9']
const dateRanges     = ['This Month','Last 30 Days','Last 90 Days','This Quarter','This Year']

// Project P&L data — RS-01 uses real customer data
const projectPnL = [
  {
    project:'RS-01 - Chhindwara', client:'CMPDI', contractType:'meterage',
    metersDrilled:624, month:'May 2026',
    revenue:{
      band1:170000, band2:190000, band3:235200, standby:24000,
      mobilisation:0, total:619200
    },
    costs:{
      consumables:370673,  // from inventory issues
      rigOperating:112000, // from rig master
      labour:84000,
      fuel:38000,          // from parts catalogue
      maintenance:29000,
      total:633673
    },
    billing:{
      invoiced:480000, pending:139200, overdue:240000, overdueDays:45
    }
  },
  {
    project:'DGMIL-BHK - Bhalukona', client:'DGML', contractType:'meterage',
    metersDrilled:412, month:'May 2026',
    revenue:{ band1:160000, band2:180000, band3:0, standby:16000, mobilisation:0, total:356000 },
    costs:{ consumables:210000, rigOperating:72000, labour:54000, fuel:24000, maintenance:18000, total:378000 },
    billing:{ invoiced:280000, pending:76000, overdue:0, overdueDays:0 }
  },
  {
    project:'CMP-MAD - Madheri', client:'CMPDI', contractType:'meterage',
    metersDrilled:318, month:'May 2026',
    revenue:{ band1:135300, band2:0, band3:0, standby:8000, mobilisation:0, total:143300 },
    costs:{ consumables:148000, rigOperating:54000, labour:42000, fuel:18000, maintenance:12000, total:274000 },
    billing:{ invoiced:143300, pending:0, overdue:120000, overdueDays:32 }
  },
]

const costTrendData = [
  { month:'Dec', revenue:480000, cost:420000, profit:60000 },
  { month:'Jan', revenue:540000, cost:490000, profit:50000 },
  { month:'Feb', revenue:510000, cost:455000, profit:55000 },
  { month:'Mar', revenue:620000, cost:540000, profit:80000 },
  { month:'Apr', revenue:890000, cost:820000, profit:70000 },
  { month:'May', revenue:619200, cost:633673, profit:-14473 },
]

const costBreakdownData = [
  { name:'Consumables', value:370673, color:'#F97316' },
  { name:'Rig Operating', value:112000, color:'#3B82F6' },
  { name:'Labour',       value:84000,  color:'#10B981' },
  { name:'Fuel',         value:38000,  color:'#F59E0B' },
  { name:'Maintenance',  value:29000,  color:'#8B5CF6' },
]

const rigPerfData = [
  { rig:'KEM-1', costPerMeter:131, efficiency:94, downtime:3.5, revenue:185000, cost:162000 },
  { rig:'KEM-4', costPerMeter:142, efficiency:88, downtime:5.2, revenue:156000, cost:148000 },
  { rig:'KEM-5', costPerMeter:168, efficiency:78, downtime:8.4, revenue:142000, cost:158000 },
  { rig:'KEM-8', costPerMeter:124, efficiency:96, downtime:2.1, revenue:198000, cost:164000 },
  { rig:'KEM-9', costPerMeter:155, efficiency:82, downtime:6.8, revenue:138000, cost:145000 },
]

const tooltipStyle = {
  contentStyle:{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:10, color:'#F8FAFC', fontSize:11 },
  labelStyle:{ color:'#94A3B8' },
}

const S = {
  card: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 },
  label: { fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const },
}

function SubNav({ active }: { active:string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4 }}>
      {[
        { href:'/admin/finance', label:'Dashboard' },
        { href:'/admin/finance/master-data', label:'Master Data' },
        { href:'/admin/finance/reports', label:'Cost Reports' },
      ].map(n=>(
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#3B82F6':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

export default function FinanceDashboard() {
  const { format, formatShort } = useCurrency()
  const [selectedProject, setSelectedProject] = useState('RS-01 - Chhindwara')
  const [selectedRig, setSelectedRig] = useState('All Rigs')
  const [dateRange, setDateRange] = useState('This Month')

  const project = projectPnL.find(p=>p.project===selectedProject) || projectPnL[0]
  const profit = project.revenue.total - project.costs.total
  const margin = ((profit / project.revenue.total) * 100).toFixed(1)
  const totalRevenue = projectPnL.reduce((s,p)=>s+p.revenue.total,0)
  const totalCost    = projectPnL.reduce((s,p)=>s+p.costs.total,0)
  const totalProfit  = totalRevenue - totalCost
  const totalOverdue = projectPnL.reduce((s,p)=>s+p.billing.overdue,0)
  const totalPending = projectPnL.reduce((s,p)=>s+p.billing.pending,0)

  const selStyle: React.CSSProperties = { appearance:'none' as any, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:12, padding:'7px 28px 7px 12px', borderRadius:8, cursor:'pointer', outline:'none' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Finance &amp; Costing</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Revenue, costs and profitability across all drilling operations</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <SubNav active="Dashboard" />
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <span style={{ ...S.label }}>Filter:</span>
        {[
          { val:selectedProject, set:setSelectedProject, opts:projectOptions },
          { val:selectedRig,     set:setSelectedRig,     opts:rigOptions     },
          { val:dateRange,       set:setDateRange,        opts:dateRanges     },
        ].map((f,i)=>(
          <div key={i} style={{ position:'relative' }}>
            <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
          </div>
        ))}
      </div>

      {/* ── TOP KPI ROW ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Revenue',    value:formatShort(totalRevenue), color:'#10B981', icon:'💰', change:'+12%', good:true  },
          { label:'Total Cost',       value:formatShort(totalCost),    color:'#EF4444', icon:'📊', change:'+8%',  good:false },
          { label:'Gross Profit',     value:formatShort(totalProfit),  color: totalProfit>=0?'#10B981':'#EF4444', icon:'📈', change: totalProfit>=0?'+5%':'-2%', good:totalProfit>=0 },
          { label:'Overdue Invoices', value:formatShort(totalOverdue), color:'#F59E0B', icon:'⏰', change:'45d',  good:false },
        ].map((k,i)=>(
          <div key={i} style={{ ...S.card, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:20 }}>{k.icon}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20,
                background: k.good ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: k.good ? '#10B981' : '#EF4444',
              }}>{k.change}</span>
            </div>
            <div style={{ ...S.label, marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── PROJECT P&L CARD ── */}
      <div style={{ ...S.card, overflow:'hidden', background:'linear-gradient(135deg,rgba(59,130,246,0.04),rgba(13,17,23,0.98))', borderColor:'rgba(59,130,246,0.15)' }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid #1E293B', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#F8FAFC' }}>Project P&amp;L — {project.project}</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Client: {project.client} · {project.month} · {project.contractType === 'meterage' ? '📏 Meterage Contract' : '📅 Day Rate Contract'}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#64748B' }}>Gross Profit</div>
              <div style={{ fontSize:20, fontWeight:800, color: profit>=0?'#10B981':'#EF4444', fontFamily:"'Space Grotesk',sans-serif" }}>
                {profit>=0?'+':''}{formatShort(profit)}
                <span style={{ fontSize:12, fontWeight:600, marginLeft:6 }}>({margin}%)</span>
              </div>
            </div>
            {profit < 0 && <span style={{ fontSize:20 }}>⚠️</span>}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:0 }}>

          {/* CONTRACT REVENUE */}
          <div style={{ padding:'20px 24px', borderRight:'1px solid #1E293B' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Contract Revenue</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:'#64748B' }}>Meters drilled</span>
                <span style={{ color:'#F8FAFC', fontWeight:600 }}>{project.metersDrilled}m</span>
              </div>
              {project.revenue.band1 > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>0–200m × ₹850</span>
                  <span style={{ color:'#10B981', fontWeight:600 }}>{format(project.revenue.band1)}</span>
                </div>
              )}
              {project.revenue.band2 > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>200–400m × ₹950</span>
                  <span style={{ color:'#10B981', fontWeight:600 }}>{format(project.revenue.band2)}</span>
                </div>
              )}
              {project.revenue.band3 > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>400–624m × ₹1050</span>
                  <span style={{ color:'#10B981', fontWeight:600 }}>{format(project.revenue.band3)}</span>
                </div>
              )}
              {project.revenue.standby > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>Standby charges</span>
                  <span style={{ color:'#10B981', fontWeight:600 }}>{format(project.revenue.standby)}</span>
                </div>
              )}
              <div style={{ borderTop:'1px solid #1E293B', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Gross Revenue</span>
                <span style={{ fontSize:15, fontWeight:800, color:'#10B981', fontFamily:"'Space Grotesk',sans-serif" }}>{format(project.revenue.total)}</span>
              </div>
            </div>
          </div>

          {/* DIRECT COSTS */}
          <div style={{ padding:'20px 24px', borderRight:'1px solid #1E293B' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#EF4444', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Direct Costs</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Consumables issued', value:project.costs.consumables, note:'← from Inventory', color:'#F97316' },
                { label:'Rig operating cost', value:project.costs.rigOperating, note:'← from Rig Master', color:'#3B82F6' },
                { label:'Labour / Crew',      value:project.costs.labour,      note:'',                  color:'#10B981' },
                { label:'Fuel',               value:project.costs.fuel,        note:'← from Catalogue', color:'#F59E0B' },
                { label:'Maintenance',        value:project.costs.maintenance, note:'',                  color:'#8B5CF6' },
              ].map((c,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                  <div>
                    <span style={{ color:'#64748B' }}>{c.label}</span>
                    {c.note && <span style={{ fontSize:9, color:'#334155', marginLeft:4 }}>{c.note}</span>}
                  </div>
                  <span style={{ color:c.color, fontWeight:600 }}>{format(c.value)}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid #1E293B', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Total Cost</span>
                <span style={{ fontSize:15, fontWeight:800, color:'#EF4444', fontFamily:"'Space Grotesk',sans-serif" }}>{format(project.costs.total)}</span>
              </div>
            </div>
          </div>

          {/* PROFITABILITY + BILLING */}
          <div style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#F97316', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Profitability &amp; Billing</div>

            {/* Profit summary */}
            <div style={{ padding:'12px 14px', borderRadius:10, background: profit>=0?'rgba(16,185,129,0.06)':'rgba(239,68,68,0.06)', border:`1px solid ${profit>=0?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'}`, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, color:'#64748B' }}>Revenue</span>
                <span style={{ fontSize:12, color:'#10B981', fontWeight:600 }}>{format(project.revenue.total)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:12, color:'#64748B' }}>Cost</span>
                <span style={{ fontSize:12, color:'#EF4444', fontWeight:600 }}>−{format(project.costs.total)}</span>
              </div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:6, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>Gross Profit</span>
                <span style={{ fontSize:15, fontWeight:800, color:profit>=0?'#10B981':'#EF4444', fontFamily:"'Space Grotesk',sans-serif" }}>
                  {profit>=0?'+':''}{format(profit)} <span style={{ fontSize:11 }}>({margin}%)</span>
                </span>
              </div>
            </div>

            {/* Billing status */}
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Billing Status</div>
            {[
              { label:'Invoiced to '+project.client, value:project.billing.invoiced, color:'#10B981', icon:<CheckCircle size={11}/> },
              { label:'Pending invoice',              value:project.billing.pending,  color:'#F59E0B', icon:<Clock size={11}/> },
              { label:`Overdue (${project.billing.overdueDays}d)`, value:project.billing.overdue, color:'#EF4444', icon:<AlertTriangle size={11}/> },
            ].map((b,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, padding:'6px 10px', borderRadius:8,
                background: b.value>0 ? `${b.color}08` : 'transparent',
                border: b.value>0 ? `1px solid ${b.color}20` : '1px solid transparent',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, color:b.color, fontSize:11 }}>
                  {b.icon}<span>{b.label}</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:b.color }}>{format(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW: Revenue vs Cost Trend + Cost Breakdown ── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>

        {/* Revenue vs Cost Trend */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Revenue vs Cost Trend</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Last 6 months — green = profit, red = loss</div>
            </div>
            <div style={{ display:'flex', gap:14, fontSize:11 }}>
              {[['#10B981','Revenue'],['#EF4444','Cost'],['#3B82F6','Profit']].map(([c,l])=>(
                <span key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:18, height:2, background:c, display:'inline-block', borderRadius:2 }} />
                  <span style={{ color:'#94A3B8' }}>{l}</span>
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(1)}L`} />
              <Tooltip {...tooltipStyle} formatter={(v:any)=>[`₹${(v/100000).toFixed(2)}L`,'']} />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ fill:'#10B981', r:3 }} name="Revenue" />
              <Line type="monotone" dataKey="cost"    stroke="#EF4444" strokeWidth={2} dot={{ fill:'#EF4444', r:3 }} strokeDasharray="5 4" name="Cost" />
              <Line type="monotone" dataKey="profit"  stroke="#3B82F6" strokeWidth={2} dot={{ fill:'#3B82F6', r:3 }} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown donut */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom:16 }}>Cost Breakdown</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={costBreakdownData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                {costBreakdownData.map((e,i)=><Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v:any)=>[`₹${(v/100000).toFixed(2)}L`,'']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {costBreakdownData.map((c,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c.color, flexShrink:0 }} />
                  <span style={{ color:'#94A3B8' }}>{c.name}</span>
                </div>
                <span style={{ color:'#F8FAFC', fontWeight:600 }}>₹{(c.value/100000).toFixed(2)}L</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIG PERFORMANCE TABLE ── */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid #1E293B' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Rig Performance — Revenue vs Cost</div>
          <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Which rigs are profitable this month</div>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              {['Rig','Revenue','Cost','Profit / Loss','Cost/Meter','Efficiency','Downtime'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rigPerfData.map((r,i)=>{
              const profit = r.revenue - r.cost
              return (
                <tr key={i} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.015)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'12px 16px', fontSize:14, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{r.rig}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:700, color:'#10B981' }}>{format(r.revenue)}</td>
                  <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#EF4444' }}>{format(r.cost)}</td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:13, fontWeight:800, color:profit>=0?'#10B981':'#EF4444', fontFamily:"'Space Grotesk',sans-serif" }}>
                      {profit>=0?'+':''}{format(profit)}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:r.costPerMeter<140?'#10B981':r.costPerMeter<160?'#F59E0B':'#EF4444' }}>₹{r.costPerMeter}/m</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, background:'#1A2234', borderRadius:4, height:5 }}>
                        <div style={{ width:`${r.efficiency}%`, height:5, borderRadius:4, background:r.efficiency>=90?'#10B981':r.efficiency>=80?'#F59E0B':'#EF4444' }} />
                      </div>
                      <span style={{ fontSize:11, color:'#94A3B8', whiteSpace:'nowrap' }}>{r.efficiency}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:12, color:r.downtime>6?'#EF4444':'#94A3B8' }}>{r.downtime}h</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── BILLING ALERTS ── */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Billing &amp; Invoice Status</div>
          <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#F59E0B' }}>
            {format(totalOverdue + totalPending)} outstanding
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {projectPnL.map((p,i)=>(
            <div key={i} style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>{p.project.split(' - ')[0]}</div>
                <span style={{ fontSize:10, color:'#64748B' }}>{p.client}</span>
              </div>
              {[
                { label:'Invoiced',       value:p.billing.invoiced, color:'#10B981' },
                { label:'Pending',        value:p.billing.pending,  color:'#F59E0B' },
                { label:`Overdue (${p.billing.overdueDays}d)`, value:p.billing.overdue, color:'#EF4444' },
              ].map((b,j)=>(
                <div key={j} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                  <span style={{ color:'#64748B' }}>{b.label}</span>
                  <span style={{ fontWeight:700, color:b.value>0?b.color:'#334155' }}>{format(b.value)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

