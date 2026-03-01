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
import { TrendingUp, Clock, AlertCircle, Activity, Filter } from 'lucide-react'

// Same chart components as Admin but with supervisor-specific data
const COLORS = {
  primary: '#3B82F6',
  accent: '#10B981',
  purple: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899'
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

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

// Supervisor-specific data (filtered to their assigned projects)
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

const downtimeData = [
  { reason: 'Mechanical', hours: 12 },
  { reason: 'Bit Change', hours: 8 },
  { reason: 'Water Shortage', hours: 6 },
  { reason: 'Weather', hours: 4 },
]

const formationData = [
  { formation: 'Soft', rop: 62 },
  { formation: 'Medium', rop: 48 },
  { formation: 'Hard', rop: 35 },
  { formation: 'Mixed', rop: 45 },
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
  { name: 'Inner Worn', value: 35 },
  { name: 'Outer Worn', value: 28 },
  { name: 'Flat Worn', value: 25 },
  { name: 'Broken', value: 12 },
]

export default function SupervisorAnalytics() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Analytics Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Performance metrics for your assigned projects</p>
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
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg ROP', value: '6.8', unit: 'm/hr', icon: Activity, color: COLORS.primary, trend: '+15%', up: true },
          { label: 'Total Meters', value: '3,240', unit: 'm', icon: TrendingUp, color: COLORS.accent, trend: '+12%', up: true },
          { label: 'Drilling Hours', value: '520', unit: 'hrs', icon: Clock, color: COLORS.cyan, trend: '+8%', up: true },
          { label: 'Downtime', value: '48', unit: 'hrs', icon: AlertCircle, color: COLORS.danger, trend: '-5%', up: false },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 hover:border-[#3B82F6]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{kpi.value}<span className="text-sm font-normal text-[#64748B] ml-1">{kpi.unit}</span></p>
            <p className="text-sm text-[#94A3B8] mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid - Same as Admin but with supervisor view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROP Trend */}
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">ROP Trend Analysis</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ropData}>
                <defs>
                  <linearGradient id="ropGradientSuper" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#64748B" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="rop" stroke="#3B82F6" strokeWidth={3} fill="url(#ropGradientSuper)" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Meters Drilled */}
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
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

        {/* Downtime Analysis */}
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Downtime by Reason</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis dataKey="reason" type="category" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours" fill="#EF4444" radius={[0, 4, 4, 0]}>
                  {downtimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#64748B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Formation vs ROP */}
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
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
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
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

        {/* Completion Type */}
        <motion.div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6">
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
      </div>
    </div>
  )
}
