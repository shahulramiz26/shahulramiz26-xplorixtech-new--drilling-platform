'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, ComposedChart, ReferenceLine
} from 'recharts'
import { TrendingUp, Clock, AlertCircle, Activity, Filter, ChevronDown, X, Search, ChevronUp } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'

const PIE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B']

// ── FILTER OPTIONS ──────────────────────────────────────────────────────────
const filterOptions = {
  projects: ['All Projects', 'Gold Mine Project A', 'Copper Exploration Site', 'Iron Ore Site B'],
  rigs: {
    'All Projects':           ['All Rigs', 'KEM-14', 'KEM-13', 'KEM-02', 'KEM-07'],
    'Gold Mine Project A':    ['All Rigs', 'KEM-14', 'KEM-13'],
    'Copper Exploration Site':['All Rigs', 'KEM-02'],
    'Iron Ore Site B':        ['All Rigs', 'KEM-07'],
  } as Record<string, string[]>,
  holes: {
    'All Projects':           ['All Holes', 'H1', 'H2', 'H3', 'BH-001', 'BH-002'],
    'Gold Mine Project A':    ['All Holes', 'H1', 'H2', 'H3'],
    'Copper Exploration Site':['All Holes', 'BH-001', 'BH-002'],
    'Iron Ore Site B':        ['All Holes'],
  } as Record<string, string[]>,
  shifts: ['All Shifts', 'Day', 'Night'],
}

// ── TYPES ───────────────────────────────────────────────────────────────────
interface SubItem { label: string; value: number; unit?: string; date?: string; rig?: string; shift?: string }
interface RankedItem { label: string; value: number; unit?: string; color?: string; subItems?: SubItem[] }

// ── INLINE RANKED LIST WITH OTHERS EXPANDABLE ───────────────────────────────
function RankedList({ items, showPercent = true, showValue = true, showRank = false, maxVisible = 8, searchable = false, highlightTop = 0 }: {
  items: RankedItem[]; showPercent?: boolean; showValue?: boolean; showRank?: boolean
  maxVisible?: number; searchable?: boolean; highlightTop?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [othersExpanded, setOthersExpanded] = useState(false)

  const COLORS = ['#F97316','#3B82F6','#10B981','#8B5CF6','#F59E0B','#64748B','#06B6D4','#EF4444']
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((s, i) => s + i.value, 0)
  const maxVal = sorted[0]?.value || 1
  const searched = search ? sorted.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) : sorted
  const visible = expanded ? searched : searched.slice(0, maxVisible)
  const hiddenCount = searched.length - maxVisible

  return (
    <div>
      {searchable && (
        <div style={{ position:'relative', marginBottom:12 }}>
          <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ width:'100%', padding:'7px 10px 7px 28px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit' }} />
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column' }}>
        {visible.map((item, index) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          const barWidth = (item.value / maxVal) * 100
          const color = item.color || COLORS[index % COLORS.length]
          const isTop = highlightTop > 0 && index < highlightTop
          const isOthers = item.label === 'Others'
          const hasSubItems = !!(item.subItems && item.subItems.length > 0)

          return (
            <div key={item.label} style={{ paddingTop:13, paddingBottom:13, borderBottom: index < visible.length - 1 ? '1px solid rgba(30,41,59,0.4)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
                  {showRank && <span style={{ fontSize:10, fontWeight:700, color:'#334155', width:16, flexShrink:0, textAlign:'right' }}>{index + 1}</span>}
                  {isOthers && hasSubItems ? (
                    <button onClick={() => setOthersExpanded(!othersExpanded)}
                      style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit' }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#3B82F6', textDecoration:'underline', textDecorationStyle:'dotted', textUnderlineOffset:3 }}>
                        Others
                      </span>
                      <span style={{ fontSize:10, color:'#3B82F6' }}>{othersExpanded ? '▲' : '▼'}</span>
                    </button>
                  ) : (
                    <span style={{ fontSize:13, fontWeight: isTop ? 700 : 600, color: isTop ? '#F8FAFC' : '#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.label}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0, marginLeft:12 }}>
                  {showValue && <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value.toLocaleString()}{item.unit ? ` ${item.unit}` : ''}</span>}
                  {showPercent && <span style={{ fontSize:12, fontWeight:700, color:'#94A3B8', minWidth:36, textAlign:'right' }}>{pct.toFixed(0)}%</span>}
                </div>
              </div>
              <div style={{ background:'#1A2234', borderRadius:4, height:5, overflow:'hidden' }}>
                <div style={{ width:`${barWidth}%`, height:'100%', background:color, borderRadius:4, transition:'width 0.6s ease' }} />
              </div>

              {/* ── OTHERS EXPANDED SUB-TABLE ── */}
              {isOthers && hasSubItems && othersExpanded && (
                <div style={{ marginTop:10, background:'rgba(59,130,246,0.04)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'8px 14px', borderBottom:'1px solid rgba(59,130,246,0.1)', fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    <span>Reason</span><span style={{ textAlign:'right' }}>Hours</span>
                  </div>
                  {item.subItems!.map((sub, si) => (
                    <div key={si} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8, padding:'9px 14px', borderBottom: si < item.subItems!.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none', alignItems:'center' }}>
                      <span style={{ fontSize:12, color:'#F8FAFC', fontWeight:500 }}>{sub.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:'#F8FAFC', textAlign:'right', fontFamily:"'Space Grotesk',sans-serif" }}>{sub.value}{sub.unit ? ` ${sub.unit}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!search && hiddenCount > 0 && (
        <button onClick={() => setExpanded(!expanded)}
          style={{ marginTop:10, width:'100%', padding:'8px', background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B', borderRadius:8, color:'#64748B', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#F8FAFC' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#64748B' }}>
          {expanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show {hiddenCount} more</>}
        </button>
      )}
    </div>
  )
}

// ── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, icon: Icon, color, trend, trendUp }: {
  label: string; value: string; unit?: string; icon: any; color: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div style={{ padding:20, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B', transition:'border-color 0.2s' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=`${color}40`}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:18, height:18, color }} />
        </div>
        {trend && <span style={{ fontSize:11, fontWeight:700, color: trendUp ? '#10B981' : '#EF4444' }}>{trendUp ? '↑' : '↓'} {trend}</span>}
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>
        {value}{unit && <span style={{ fontSize:13, fontWeight:400, color:'#64748B', marginLeft:4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize:13, color:'#94A3B8', marginTop:4 }}>{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2234] border border-[#1E293B] rounded-xl p-4 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
        <p className="text-[#94A3B8] text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#94A3B8] text-sm">{entry.name}:</span>
            <span className="text-[#F8FAFC] font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ── DATA ─────────────────────────────────────────────────────────────────────
const ropData = [
  { date: 'Feb 20', rop: 45, target: 50 }, { date: 'Feb 21', rop: 52, target: 50 },
  { date: 'Feb 22', rop: 48, target: 50 }, { date: 'Feb 23', rop: 61, target: 50 },
  { date: 'Feb 24', rop: 55, target: 50 }, { date: 'Feb 25', rop: 58, target: 50 },
  { date: 'Feb 26', rop: 63, target: 50 },
]
const metersData = [
  { date: 'Feb 20', meters: 180, recovery: 165 }, { date: 'Feb 21', meters: 220, recovery: 205 },
  { date: 'Feb 22', meters: 195, recovery: 180 }, { date: 'Feb 23', meters: 245, recovery: 230 },
  { date: 'Feb 24', meters: 210, recovery: 195 }, { date: 'Feb 25', meters: 230, recovery: 215 },
  { date: 'Feb 26', meters: 250, recovery: 235 },
]
const downtimeItems: RankedItem[] = [
  { label: 'Mechanical',     value: 12, unit: 'hrs', color: '#EF4444' },
  { label: 'Bit Change',     value: 8,  unit: 'hrs', color: '#F59E0B' },
  { label: 'Water Shortage', value: 6,  unit: 'hrs', color: '#64748B' },
  { label: 'Weather',        value: 4,  unit: 'hrs', color: '#64748B' },
  { label: 'Operator Delay', value: 3,  unit: 'hrs', color: '#64748B' },
  { label: 'Hydraulic',      value: 2,  unit: 'hrs', color: '#64748B' },
  { label: 'Electrical',     value: 2,  unit: 'hrs', color: '#64748B' },
  { label: 'Safety Hold',    value: 1,  unit: 'hrs', color: '#64748B' },
  { label: 'Others', value: 1, unit: 'hrs', color: '#334155',
    subItems: [
      { label: 'Waiting for client approval', value: 0.5, unit: 'hrs', date: '12-06-2026', rig: 'KEM-14', shift: 'Day'   },
      { label: 'Personal issue — driller',    value: 0.3, unit: 'hrs', date: '11-06-2026', rig: 'KEM-02', shift: 'Night' },
      { label: 'Road access blocked',         value: 0.2, unit: 'hrs', date: '10-06-2026', rig: 'KEM-13', shift: 'Day'   },
    ]
  },
]
const productiveData = [
  { date: 'Feb 20', drilling: 84,  downtime: 12, efficiency: 87 },
  { date: 'Feb 21', drilling: 96,  downtime: 8,  efficiency: 92 },
  { date: 'Feb 22', drilling: 88,  downtime: 10, efficiency: 90 },
  { date: 'Feb 23', drilling: 100, downtime: 6,  efficiency: 94 },
  { date: 'Feb 24', drilling: 92,  downtime: 8,  efficiency: 92 },
  { date: 'Feb 25', drilling: 98,  downtime: 6,  efficiency: 94 },
  { date: 'Feb 26', drilling: 104, downtime: 4,  efficiency: 96 },
]
const formationData = [
  { formation: 'Soft',   rop: 62, meters: 1240 },
  { formation: 'Medium', rop: 48, meters: 960  },
  { formation: 'Hard',   rop: 35, meters: 700  },
  { formation: 'Mixed',  rop: 45, meters: 900  },
]
const bitPerformanceData = [
  { date: 'Feb 20', meters: 180, cost: 1800 }, { date: 'Feb 21', meters: 220, cost: 2200 },
  { date: 'Feb 22', meters: 195, cost: 1950 }, { date: 'Feb 23', meters: 245, cost: 2450 },
  { date: 'Feb 24', meters: 210, cost: 2100 }, { date: 'Feb 25', meters: 230, cost: 2300 },
  { date: 'Feb 26', meters: 250, cost: 2500 },
]
const completionData = [
  { name: 'Inner Worn', value: 35 }, { name: 'Outer Worn', value: 28 },
  { name: 'Flat Worn',  value: 25 }, { name: 'Broken',     value: 12 },
]
const supplierData = [
  { supplier: 'Atlas Copco',    cost: 8.5 },
  { supplier: 'Boart Longyear', cost: 9.2 },
  { supplier: 'Sandvik',        cost: 7.8 },
]
const operationInsights = [
  { id:'1', type:'anomaly' as const,        severity:'warning' as const,  title:'Downtime Spike Detected',  description:'RIG-001 showing 40% higher downtime than average this week', metric:'Downtime',          change:'+40% vs last week',  recommendation:'Schedule preventive maintenance for hydraulic system' },
  { id:'2', type:'prediction' as const,     severity:'warning' as const,  title:'Weekly Downtime Forecast', description:'Based on current trends, expect 40hrs downtime next week',   metric:'Projected Downtime', change:'40 hours',           recommendation:'Pre-order replacement bits to reduce delays' },
  { id:'3', type:'trend' as const,          severity:'info' as const,     title:'ROP Improvement',          description:'Average ROP increased by 15% over last 7 days',              metric:'ROP',                change:'+15%',               recommendation:'Continue current drilling parameters' },
  { id:'4', type:'anomaly' as const,        severity:'critical' as const, title:'Bit Wear Acceleration',    description:'BIT-003 wearing 2x faster than normal in hard formation',    metric:'Bit Life',           change:'-50% expected life', recommendation:'Switch to impregnated bit for hard formation' },
  { id:'5', type:'recommendation' as const, severity:'info' as const,     title:'Optimal Drilling Window',  description:'AI analysis shows best ROP between 6-8 AM',                  metric:'Peak Performance',   change:'6-8 AM daily',       recommendation:'Schedule critical drilling during morning shift' },
]

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminOperationDashboard() {
  const [dateRange, setDateRange] = useState('7d')
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const [project, setProject] = useState('All Projects')
  const [rig,     setRig]     = useState('All Rigs')
  const [hole,    setHole]    = useState('All Holes')
  const [shift,   setShift]   = useState('All Shifts')
  const [applied, setApplied] = useState({ project:'All Projects', rig:'All Rigs', hole:'All Holes', shift:'All Shifts' })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleProjectChange = (p: string) => { setProject(p); setRig('All Rigs'); setHole('All Holes') }
  const handleApply = () => { setApplied({ project, rig, hole, shift }); setShowFilters(false) }
  const handleReset = () => {
    setProject('All Projects'); setRig('All Rigs'); setHole('All Holes'); setShift('All Shifts')
    setApplied({ project:'All Projects', rig:'All Rigs', hole:'All Holes', shift:'All Shifts' })
  }

  const activeCount = [
    applied.project !== 'All Projects', applied.rig !== 'All Rigs',
    applied.hole !== 'All Holes',       applied.shift !== 'All Shifts',
  ].filter(Boolean).length

  const selectCls: React.CSSProperties = {
    width:'100%', padding:'10px 14px', background:'#0D1117',
    border:'1px solid #1E293B', borderRadius:10, color:'#F8FAFC',
    fontSize:13, outline:'none', appearance:'none', fontFamily:'inherit', cursor:'pointer',
  }

  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="operation" insights={operationInsights} />

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Operation Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Drilling performance and productivity metrics</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Duration */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Clock className="w-4 h-4 text-[#64748B]" />
            <span className="text-xs text-[#64748B]">Duration</span>
            <select className="bg-transparent text-[#F8FAFC] text-sm outline-none cursor-pointer"
              value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="7d"  className="bg-[#1A2234]">Last 7 Days</option>
              <option value="30d" className="bg-[#1A2234]">Last 30 Days</option>
              <option value="90d" className="bg-[#1A2234]">Last 90 Days</option>
            </select>
          </div>

          {/* Filters button + panel */}
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeCount > 0
                  ? 'bg-[#3B82F6]/10 border-[#3B82F6]/40 text-[#3B82F6]'
                  : 'bg-[#1A2234] border-[#1E293B] text-[#F8FAFC] hover:border-[#3B82F6]/40'
              }`}>
              <Filter className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#3B82F6] text-white text-xs flex items-center justify-center font-bold">
                  {activeCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="absolute right-0 top-12 w-80 bg-[#111827] border border-[#1E293B] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] z-50 p-5">
                <div className="flex items-center justify-between mb-5">
                  <p className="font-bold text-[#F8FAFC]">Dashboard Filters</p>
                  <button onClick={() => setShowFilters(false)} className="p-1 text-[#64748B] hover:text-[#F8FAFC] transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Project */}
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1.5">Project</label>
                    <div className="relative">
                      <select style={selectCls} value={project} onChange={e => handleProjectChange(e.target.value)}>
                        {filterOptions.projects.map(p => <option key={p} value={p} className="bg-[#0D1117]">{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                  {/* Rig */}
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1.5">Rig</label>
                    <div className="relative">
                      <select style={selectCls} value={rig} onChange={e => setRig(e.target.value)}>
                        {(filterOptions.rigs[project] || filterOptions.rigs['All Projects']).map(r => (
                          <option key={r} value={r} className="bg-[#0D1117]">{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                  {/* Hole Number */}
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1.5">Hole Number</label>
                    <div className="relative">
                      <select style={selectCls} value={hole} onChange={e => setHole(e.target.value)}>
                        {(filterOptions.holes[project] || filterOptions.holes['All Projects']).map(h => (
                          <option key={h} value={h} className="bg-[#0D1117]">{h}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                  {/* Shift */}
                  <div>
                    <label className="block text-xs text-[#64748B] mb-1.5">Shift</label>
                    <div className="relative">
                      <select style={selectCls} value={shift} onChange={e => setShift(e.target.value)}>
                        {filterOptions.shifts.map(s => <option key={s} value={s} className="bg-[#0D1117]">{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleReset}
                    className="flex-1 py-2.5 border border-[#1E293B] text-[#94A3B8] rounded-xl text-sm font-medium hover:bg-[#1A2234] transition">
                    Reset
                  </button>
                  <button onClick={handleApply}
                    className="flex-1 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-bold hover:bg-[#2563EB] transition">
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#64748B]">Filtered by:</span>
          {applied.project !== 'All Projects' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full text-xs text-[#3B82F6] font-medium">
              {applied.project}
              <button onClick={() => { setProject('All Projects'); setApplied(a => ({...a, project:'All Projects'})) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {applied.rig !== 'All Rigs' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full text-xs text-[#3B82F6] font-medium">
              {applied.rig}
              <button onClick={() => { setRig('All Rigs'); setApplied(a => ({...a, rig:'All Rigs'})) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {applied.hole !== 'All Holes' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full text-xs text-[#3B82F6] font-medium">
              {applied.hole}
              <button onClick={() => { setHole('All Holes'); setApplied(a => ({...a, hole:'All Holes'})) }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {applied.shift !== 'All Shifts' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full text-xs text-[#3B82F6] font-medium">
              {applied.shift} Shift
              <button onClick={() => { setShift('All Shifts'); setApplied(a => ({...a, shift:'All Shifts'})) }}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Avg ROP"        value="6.8"   unit="m/hr" icon={Activity}    color="#F97316" trend="+15%" trendUp={true}  />
        <KpiCard label="Total Meters"   value="8,450" unit="m"    icon={TrendingUp}  color="#3B82F6" trend="+12%" trendUp={true}  />
        <KpiCard label="Drilling Hours" value="1,240" unit="hrs"  icon={Clock}       color="#10B981" trend="+8%"  trendUp={true}  />
        <KpiCard label="Downtime"       value="186"   unit="hrs"  icon={AlertCircle} color="#EF4444" trend="-5%"  trendUp={false} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">ROP Trend Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span><span className="text-xs text-[#94A3B8]">Actual</span>
              <span className="w-3 h-3 rounded-full bg-[#64748B] ml-2"></span><span className="text-xs text-[#94A3B8]">Target</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ropData}>
                <defs>
                  <linearGradient id="ropGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#64748B" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="rop" stroke="#3B82F6" strokeWidth={3} fill="url(#ropGradient)" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Meters Drilled vs Core Recovery</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar dataKey="meters"   name="Meters Drilled" fill="#3B82F6" radius={[4,4,0,0]} />
                <Bar dataKey="recovery" name="Core Recovery"  fill="#10B981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Downtime by Reason</h3>
            <span className="text-xs text-[#64748B] bg-[#1A2234] px-3 py-1 rounded-full border border-[#1E293B]">
              {downtimeItems.reduce((s, i) => s + i.value, 0)} hrs total
            </span>
          </div>
          <p className="text-xs text-[#64748B] mb-4">Top causes ranked by hours lost — click <span className="text-[#3B82F6]">Others</span> to see breakdown</p>
          <RankedList items={downtimeItems} showPercent showValue showRank maxVisible={5} searchable highlightTop={2} />
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Productive Hours vs Downtime</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productiveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="left"  stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar  yAxisId="left" dataKey="drilling" name="Drilling Hours" stackId="a" fill="#10B981" radius={[4,4,0,0]} />
                <Bar  yAxisId="left" dataKey="downtime" name="Downtime"       stackId="a" fill="#EF4444" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#8B5CF6" strokeWidth={3} dot={{ fill:'#8B5CF6', r:4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Formation vs Average ROP</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="formation" stroke="#94A3B8" tick={{ fill:'#94A3B8', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rop" name="ROP (m/hr)" fill="#8B5CF6" radius={[4,4,0,0]}>
                  {formationData.map((_, index) => <Cell key={`cell-${index}`} fill={['#3B82F6','#10B981','#F59E0B','#8B5CF6'][index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Bit Performance & Cost</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bitPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="left"  stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop:'20px' }} />
                <Bar  yAxisId="left"  dataKey="meters" name="Meters"   fill="#06B6D4" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="#F59E0B" strokeWidth={3} dot={{ fill:'#F59E0B', r:4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Completion Type Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
                  {completionData.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#111827" strokeWidth={3} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}>
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Cost per Meter by Supplier</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="supplier" stroke="#94A3B8" tick={{ fill:'#94A3B8', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill:'#64748B', fontSize:12 }} tickLine={false} axisLine={{ stroke:'#1E293B' }} />
                <Tooltip content={<CustomTooltip />} formatter={(value) => `$${value}/m`} />
                <Bar dataKey="cost" name="Cost/m" fill="#EC4899" radius={[4,4,0,0]}>
                  {supplierData.map((_, index) => <Cell key={`cell-${index}`} fill={['#3B82F6','#10B981','#F59E0B'][index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

