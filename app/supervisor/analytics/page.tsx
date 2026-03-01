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
import { TrendingUp, Clock, AlertCircle, Activity, Filter, Droplets, Wrench, Users, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

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

// Dashboard cards for supervisor
const dashboardCards = [
  { title: 'Operation', icon: TrendingUp, href: '/supervisor/analytics/operation', color: 'blue', desc: 'ROP, meters, downtime' },
  { title: 'Maintenance', icon: Wrench, href: '/supervisor/analytics/maintenance', color: 'amber', desc: 'Service logs, components' },
  { title: 'Driller & Crew', icon: Users, href: '/supervisor/analytics/driller-crew', color: 'emerald', desc: 'Performance metrics' },
  { title: 'Consumables', icon: Droplets, href: '/supervisor/analytics/consumables', color: 'purple', desc: 'Resource usage' },
  { title: 'HSC', icon: ShieldAlert, href: '/supervisor/analytics/hsc', color: 'red', desc: 'Safety compliance' },
]

// Sample data for charts
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

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dashboardCards.map((card, i) => (
          <Link key={card.title} href={card.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/20 flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
              <p className="font-semibold text-[#F8FAFC] text-sm">{card.title}</p>
              <p className="text-xs text-[#64748B] mt-1">{card.desc}</p>
            </motion.div>
          </Link>
        ))}
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
            transition={{ delay: 0.2 + i * 0.1 }}
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

      {/* Charts Grid */}
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
      </div>
    </div>
  )
}
