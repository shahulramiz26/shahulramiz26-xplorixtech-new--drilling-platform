'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { TrendingUp, Clock, AlertCircle, Activity, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'
import RankedList from '../../../components/RankedList'

const PIE_COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B']

function KpiCard({ label, value, unit, icon: Icon, color, trend, trendUp }: {
  label: string; value: string; unit?: string; icon: any
  color: string; trend?: string; trendUp?: boolean
}) {
  return (
    <div style={{ padding:20, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B', transition:'border-color 0.2s' }}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=`${color}40`}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:18, height:18, color }} />
        </div>
        {trend && (
          <span style={{ fontSize:11, fontWeight:700, color: trendUp ? '#10B981' : '#EF4444' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
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

const ropData = [
  { date: 'Feb 20', rop: 45, target: 50 },
  { date: 'Feb 21', rop: 52, target: 50 },
  { date: 'Feb 22', rop: 48, target: 50 },
  { date: 'Feb 23', rop: 61, target: 50 },
  { date: 'Feb 24', rop: 55, target: 50 },
  { date: 'Feb 25', rop: 58, target: 50 },
  { date: 'Feb 26', rop: 63, target: 50 },
]

const metersData = [
  { date: 'Feb 20', meters: 180, recovery: 165 },
  { date: 'Feb 21', meters: 220, recovery: 205 },
  { date: 'Feb 22', meters: 195, recovery: 180 },
  { date: 'Feb 23', meters: 245, recovery: 230 },
  { date: 'Feb 24', meters: 210, recovery: 195 },
  { date: 'Feb 25', meters: 230, recovery: 215 },
  { date: 'Feb 26', meters: 250, recovery: 235 },
]

// ── DOWNTIME DATA — supports unlimited reasons ─────────────────────────────
const downtimeItems = [
  { label: 'Mechanical',     value: 12, unit: 'hrs', color: '#EF4444' },
  { label: 'Bit Change',     value: 8,  unit: 'hrs', color: '#F59E0B' },
  { label: 'Water Shortage', value: 6,  unit: 'hrs', color: '#64748B' },
  { label: 'Weather',        value: 4,  unit: 'hrs', color: '#64748B' },
  { label: 'Operator Delay', value: 3,  unit: 'hrs', color: '#64748B' },
  { label: 'Hydraulic',      value: 2,  unit: 'hrs', color: '#64748B' },
  { label: 'Electrical',     value: 2,  unit: 'hrs', color: '#64748B' },
  { label: 'Safety Hold',    value: 1,  unit: 'hrs', color: '#64748B' },
  { label: 'Others',         value: 1,  unit: 'hrs', color: '#334155' },
]

const productiveData = [
  { date: 'Feb 20', drilling: 84, downtime: 12, efficiency: 87 },
  { date: 'Feb 21', drilling: 96, downtime: 8, efficiency: 92 },
  { date: 'Feb 22', drilling: 88, downtime: 10, efficiency: 90 },
  { date: 'Feb 23', drilling: 100, downtime: 6, efficiency: 94 },
  { date: 'Feb 24', drilling: 92, downtime: 8, efficiency: 92 },
  { date: 'Feb 25', drilling: 98, downtime: 6, efficiency: 94 },
  { date: 'Feb 26', drilling: 104, downtime: 4, efficiency: 96 },
]

const formationData = [
  { formation: 'Soft', rop: 62, meters: 1240 },
  { formation: 'Medium', rop: 48, meters: 960 },
  { formation: 'Hard', rop: 35, meters: 700 },
  { formation: 'Mixed', rop: 45, meters: 900 },
]

const bitPerformanceData = [
  { date: 'Feb 20', meters: 180, cost: 1800 },
  { date: 'Feb 21', meters: 220, cost: 2200 },
  { date: 'Feb 22', meters: 195, cost: 1950 },
  { date: 'Feb 23', meters: 245, cost: 2450 },
  { date: 'Feb 24', meters: 210, cost: 2100 },
  { date: 'Feb 25', meters: 230, cost: 2300 },
  { date: 'Feb 26', meters: 250, cost: 2500 },
]

const completionData = [
  { name: 'Inner Worn', value: 35, cost: 3500 },
  { name: 'Outer Worn', value: 28, cost: 2800 },
  { name: 'Flat Worn', value: 25, cost: 2500 },
  { name: 'Broken', value: 12, cost: 1200 },
]

const supplierData = [
  { supplier: 'Atlas Copco', cost: 8.5, quality: 92, delivery: 95 },
  { supplier: 'Boart Longyear', cost: 9.2, quality: 88, delivery: 90 },
  { supplier: 'Sandvik', cost: 7.8, quality: 95, delivery: 98 },
]

const operationInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'warning' as const,
    title: 'Downtime Spike Detected',
    description: 'RIG-001 showing 40% higher downtime than average this week',
    metric: 'Downtime',
    change: '+40% vs last week',
    recommendation: 'Schedule preventive maintenance for hydraulic system'
  },
  {
    id: '2',
    type: 'prediction' as const,
    severity: 'warning' as const,
    title: 'Weekly Downtime Forecast',
    description: 'Based on current trends, expect 40hrs downtime next week',
    metric: 'Projected Downtime',
    change: '40 hours',
    recommendation: 'Pre-order replacement bits to reduce delays'
  },
  {
    id: '3',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'ROP Improvement',
    description: 'Average ROP increased by 15% over last 7 days',
    metric: 'ROP',
    change: '+15%',
    recommendation: 'Continue current drilling parameters'
  },
  {
    id: '4',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'Bit Wear Acceleration',
    description: 'BIT-003 wearing 2x faster than normal in hard formation',
    metric: 'Bit Life',
    change: '-50% expected life',
    recommendation: 'Switch to impregnated bit for hard formation'
  },
  {
    id: '5',
    type: 'recommendation' as const,
    severity: 'info' as const,
    title: 'Optimal Drilling Window',
    description: 'AI analysis shows best ROP between 6-8 AM',
    metric: 'Peak Performance',
    change: '6-8 AM daily',
    recommendation: 'Schedule critical drilling during morning shift'
  }
]

export default function AdminOperationDashboard() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="operation" insights={operationInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Operation Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Drilling performance and productivity metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select
              className="bg-transparent text-[#F8FAFC] text-sm outline-none"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="7d" className="bg-[#1A2234]">Last 7 Days</option>
              <option value="30d" className="bg-[#1A2234]">Last 30 Days</option>
              <option value="90d" className="bg-[#1A2234]">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Avg ROP"        value="6.8"   unit="m/hr" icon={Activity}     color="#F97316" trend="+15%" trendUp={true}  />
        <KpiCard label="Total Meters"   value="8,450" unit="m"    icon={TrendingUp}   color="#3B82F6" trend="+12%" trendUp={true}  />
        <KpiCard label="Drilling Hours" value="1,240" unit="hrs"  icon={Clock}        color="#10B981" trend="+8%"  trendUp={true}  />
        <KpiCard label="Downtime"       value="186"   unit="hrs"  icon={AlertCircle}  color="#EF4444" trend="-5%"  trendUp={false} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ROP Trend - keeps chart (only 7 data points, works fine) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">ROP Trend Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
              <span className="text-xs text-[#94A3B8]">Actual</span>
              <span className="w-3 h-3 rounded-full bg-[#64748B] ml-2"></span>
              <span className="text-xs text-[#94A3B8]">Target</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ropData}>
                <defs>
                  <linearGradient id="ropGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#64748B" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="rop" stroke="#3B82F6" strokeWidth={3} fill="url(#ropGradient)" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Meters Drilled — keeps chart (only 7 days, works fine) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Meters Drilled vs Core Recovery</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="meters" name="Meters Drilled" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovery" name="Core Recovery" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── DOWNTIME BY REASON — REPLACED WITH RankedList ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Downtime by Reason</h3>
            <span className="text-xs text-[#64748B] bg-[#1A2234] px-3 py-1 rounded-full border border-[#1E293B]">
              {downtimeItems.reduce((s, i) => s + i.value, 0)} hrs total
            </span>
          </div>
          <p className="text-xs text-[#64748B] mb-4">Top causes ranked by hours lost — scroll to see all</p>
          <RankedList
            items={downtimeItems}
            showPercent={true}
            showValue={true}
            showRank={true}
            maxVisible={5}
            searchable={true}
            highlightTop={2}
            colorMode="cycle"
          />
        </motion.div>

        {/* Productive vs Downtime */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Productive Hours vs Downtime</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productiveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="drilling" name="Drilling Hours" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="downtime" name="Downtime" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Formation vs ROP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Formation vs Average ROP</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="formation" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rop" name="ROP (m/hr)" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {formationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bit Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Bit Performance & Cost</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bitPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="meters" name="Meters" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Completion Type - Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Completion Type Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#111827" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost per Meter by Supplier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:24 }}
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Cost per Meter by Supplier</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="supplier" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} formatter={(value) => `$${value}/m`} />
                <Bar dataKey="cost" name="Cost/m" fill="#EC4899" radius={[4, 4, 0, 0]}>
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

