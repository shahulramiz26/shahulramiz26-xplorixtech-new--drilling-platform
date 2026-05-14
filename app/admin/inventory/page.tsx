'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Package, AlertTriangle, TrendingDown, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw, Download,
  ChevronDown, BarChart2, Boxes, ShoppingCart, ArrowLeftRight
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useCurrency } from '../../../components/currency-context'

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const sites = ['All Sites', 'Site A - Chhindwara', 'Site B - Madheri', 'Site C - Bokaro', 'Site D - Bhalukona']

const kpis = {
  openingBalance:  1159923,
  totalReceived:   1106489,
  totalIssued:     3706732,
  siteTransfers:   1667970,
  closingBalance:  7323858,
  totalParts:      247,
  lowStockAlerts:  12,
  pendingPOs:      4,
}

const siteHealth = [
  { site: 'Site A - Chhindwara', parts: 89, lowStock: 4, value: 2840000, status: 'warning' },
  { site: 'Site B - Madheri',    parts: 62, lowStock: 1, value: 1920000, status: 'good'    },
  { site: 'Site C - Bokaro',     parts: 44, lowStock: 5, value: 1140000, status: 'critical'},
  { site: 'Site D - Bhalukona',  parts: 52, lowStock: 2, value: 1423858, status: 'good'    },
]

const topIssuedParts = [
  { name: 'MATEX DD955',       qty: 124, value: 1506724, category: 'Additives'   },
  { name: 'MATEX Sand Drill',  qty: 98,  value: 1654828, category: 'Additives'   },
  { name: 'ADDRILL EA-20 KG',  qty: 87,  value: 278400,  category: 'Additives'   },
  { name: 'NQ Core Lifter',    qty: 76,  value: 30400,   category: 'Core Barrel' },
  { name: 'HQ Core Lifter',    qty: 54,  value: 34860,   category: 'Core Barrel' },
  { name: 'NQ Core Bit SR-06', qty: 42,  value: 483000,  category: 'Core Bits'   },
  { name: 'HQ Core Bit SR-08', qty: 38,  value: 722000,  category: 'Core Bits'   },
]

const lowStockAlerts = [
  { part: 'NQ Core Bit SR-06',      site: 'Site C - Bokaro',     current: 2,  reorder: 10, unit: 'Each',  critical: true  },
  { part: 'Fuel Water Separator',   site: 'Site A - Chhindwara', current: 3,  reorder: 12, unit: 'Each',  critical: true  },
  { part: 'HQ Core Lifter',         site: 'Site C - Bokaro',     current: 4,  reorder: 10, unit: 'Each',  critical: false },
  { part: 'MATEX DD955',            site: 'Site D - Bhalukona',  current: 5,  reorder: 15, unit: 'Bucket',critical: false },
  { part: 'Lube Filter B7125',      site: 'Site A - Chhindwara', current: 2,  reorder: 8,  unit: 'Each',  critical: true  },
  { part: 'Air Filter Donaldson',   site: 'Site B - Madheri',    current: 1,  reorder: 6,  unit: 'Each',  critical: true  },
]

const monthlyTrend = [
  { month: 'Nov', received: 820000,  issued: 650000  },
  { month: 'Dec', received: 940000,  issued: 780000  },
  { month: 'Jan', received: 1100000, issued: 920000  },
  { month: 'Feb', received: 890000,  issued: 1040000 },
  { month: 'Mar', received: 1050000, issued: 870000  },
  { month: 'Apr', received: 1106489, issued: 3706732 },
]

const categoryBreakdown = [
  { name: 'Core Bits',    value: 38, color: '#F97316' },
  { name: 'Additives',    value: 28, color: '#3B82F6' },
  { name: 'Core Barrel',  value: 14, color: '#10B981' },
  { name: 'Filters',      value: 10, color: '#8B5CF6' },
  { name: 'Mechanical',   value: 6,  color: '#F59E0B' },
  { name: 'Others',       value: 4,  color: '#64748B' },
]

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href: '/admin/inventory',              label: 'Dashboard'       },
  { href: '/admin/inventory/catalogue',    label: 'Parts Catalogue' },
  { href: '/admin/inventory/stock',        label: 'Stock Management'},
  { href: '/admin/inventory/purchase-orders', label: 'Purchase Orders' },
]

// ── HELPERS ────────────────────────────────────────────────────────────────
const S = {
  page:    { background:'#080B10', color:'#F8FAFC', minHeight:'100vh' },
  card:    { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 },
  cardHov: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, transition:'border-color 0.2s, transform 0.2s' },
  label:   { fontSize:11, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const },
  muted:   { color:'#94A3B8' },
  dim:     { color:'#64748B' },
  orange:  { color:'#F97316' },
  blue:    { color:'#60A5FA' },
  green:   { color:'#10B981' },
  red:     { color:'#EF4444' },
}

const tooltipStyle = {
  contentStyle: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:12, color:'#F8FAFC', fontSize:12 },
  labelStyle: { color:'#94A3B8' },
}

function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4 }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{
          padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600,
          textDecoration:'none', transition:'all 0.2s',
          background: active === n.label ? '#F97316' : 'transparent',
          color: active === n.label ? '#fff' : '#94A3B8',
        }}>{n.label}</Link>
      ))}
    </div>
  )
}

function KpiCard({ label, value, sub, icon: Icon, iconBg, change, good }: any) {
  const { formatShort } = useCurrency()
  const isPositive = change > 0
  const isGood = good ? !isPositive : isPositive
  return (
    <div style={{ ...S.card, padding:20 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:iconBg }}>
          <Icon size={18} />
        </div>
        {change !== undefined && (
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700,
            padding:'3px 8px', borderRadius:20,
            background: isGood ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: isGood ? '#10B981' : '#EF4444',
          }}>
            {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ ...S.label, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>
        {typeof value === 'number' && value > 1000 ? formatShort(value) : value}
      </div>
      {sub && <div style={{ fontSize:11, color:'#64748B', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function InventoryDashboard() {
  const [site, setSite] = useState('All Sites')
  const { format, formatShort, currency } = useCurrency()

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Inventory Management</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Track stock levels, purchase orders and material movements across all sites</p>
        </div>
        <SubNav active="Dashboard" />
      </div>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', ...S.card, padding:'12px 20px' }}>
        <span style={{ ...S.label }}>Filter by:</span>
        <div style={{ position:'relative' }}>
          <select value={site} onChange={e => setSite(e.target.value)}
            style={{ appearance:'none', background:'#080B10', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:13, padding:'7px 32px 7px 12px', borderRadius:8, cursor:'pointer', outline:'none' }}>
            {sites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
        </div>
        <button style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          <Download size={13} /> Export Report
        </button>
        <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Store Summary Banner */}
      <div style={{ ...S.card, padding:20, background:'linear-gradient(135deg,rgba(249,115,22,0.05),rgba(13,17,23,0.95))', borderColor:'rgba(249,115,22,0.15)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#F97316', animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'#F97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Store Summary — {new Date().toLocaleString('default',{month:'long',year:'numeric'})}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16 }}>
          {[
            { label:'Opening Balance', value: kpis.openingBalance,  color:'#94A3B8' },
            { label:'+ Received',      value: kpis.totalReceived,   color:'#10B981' },
            { label:'− Issued',        value: kpis.totalIssued,     color:'#EF4444' },
            { label:'− Transferred',   value: kpis.siteTransfers,   color:'#F59E0B' },
            { label:'Closing Balance', value: kpis.closingBalance,  color:'#F97316' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:s.color }}>{formatShort(s.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        <KpiCard label="Total Parts Tracked"  value={kpis.totalParts}     sub="across all sites"          icon={Boxes}         iconBg="rgba(59,130,246,0.1)"  change={8}   good={true}  />
        <KpiCard label="Low Stock Alerts"      value={kpis.lowStockAlerts} sub="need immediate attention"  icon={AlertTriangle}  iconBg="rgba(239,68,68,0.1)"   change={33}  good={false} />
        <KpiCard label="Pending POs"           value={kpis.pendingPOs}     sub="awaiting delivery"         icon={ShoppingCart}   iconBg="rgba(249,115,22,0.1)"  />
        <KpiCard label="Total Stock Value"     value={kpis.closingBalance} sub="closing balance"           icon={Package}        iconBg="rgba(16,185,129,0.1)"  change={-5}  good={true}  />
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16 }}>
        {/* Monthly Trend */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Stock Movement Trend</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Monthly received vs issued</div>
            </div>
            <BarChart2 size={16} style={{ color:'#64748B' }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `${currency.symbol}${(v/100000).toFixed(0)}L`} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [formatShort(v), '']} />
              <Bar dataKey="received" fill="#10B981" radius={[4,4,0,0]} name="Received" />
              <Bar dataKey="issued"   fill="#F97316" radius={[4,4,0,0]} name="Issued"   />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom:16 }}>Issue by Category</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {categoryBreakdown.map((c, i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ color:'#94A3B8' }}>{c.name}</span>
                  <span style={{ color:'#F8FAFC', fontWeight:600 }}>{c.value}%</span>
                </div>
                <div style={{ background:'#1A2234', borderRadius:4, height:6 }}>
                  <div style={{ width:`${c.value}%`, height:6, borderRadius:4, background:c.color, transition:'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Site Health + Low Stock Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Site Health */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom:16 }}>Site Stock Health</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {siteHealth.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid #1E293B' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{s.site}</div>
                  <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>{s.parts} parts · {formatShort(s.value)} value</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {s.lowStock > 0 && (
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: s.status==='critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: s.status==='critical' ? '#EF4444' : '#F59E0B',
                      border: `1px solid ${s.status==='critical' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>{s.lowStock} low</span>
                  )}
                  <div style={{ width:10, height:10, borderRadius:'50%', background: s.status==='good' ? '#10B981' : s.status==='warning' ? '#F59E0B' : '#EF4444', boxShadow:`0 0 6px ${s.status==='good'?'#10B981':s.status==='warning'?'#F59E0B':'#EF4444'}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ ...S.card, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Low Stock Alerts</div>
            <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#EF4444' }}>{kpis.lowStockAlerts} alerts</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {lowStockAlerts.map((a, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background: a.critical ? 'rgba(239,68,68,0.03)' : 'rgba(245,158,11,0.03)', border:`1px solid ${a.critical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                <AlertTriangle size={14} style={{ color: a.critical ? '#EF4444' : '#F59E0B', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.part}</div>
                  <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>{a.site}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color: a.critical ? '#EF4444' : '#F59E0B' }}>{a.current}</div>
                  <div style={{ fontSize:9, color:'#64748B' }}>min {a.reorder}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Issued Parts */}
      <div style={{ ...S.card, padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Top Issued Parts This Month</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>By quantity consumed across all sites</div>
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #1E293B' }}>
                {['#','Part Name','Category','Qty Issued','Total Value','Usage Bar'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', ...S.label }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topIssuedParts.map((p, i) => {
                const maxQty = Math.max(...topIssuedParts.map(x => x.qty))
                return (
                  <tr key={i} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding:'12px 16px', color:'#64748B', fontSize:13 }}>{i+1}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{p.name}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60A5FA' }}>{p.category}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:14, fontWeight:700, color:'#F97316' }}>{p.qty}</td>
                    <td style={{ padding:'12px 16px', fontSize:13, fontWeight:600, color:'#10B981' }}>{format(p.value)}</td>
                    <td style={{ padding:'12px 16px', minWidth:120 }}>
                      <div style={{ background:'#1A2234', borderRadius:4, height:6 }}>
                        <div style={{ width:`${(p.qty/maxQty)*100}%`, height:6, borderRadius:4, background:'linear-gradient(90deg,#F97316,#F59E0B)' }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

