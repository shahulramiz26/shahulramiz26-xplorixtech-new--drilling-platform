'use client'

import { motion } from 'framer-motion'
import {
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
  AreaChart,
  Area,
  ComposedChart,
  Line,
  ReferenceLine
} from 'recharts'
import { ShieldAlert, CheckCircle2, AlertTriangle, TrendingDown, TrendingUp, Filter, Clock, Users } from 'lucide-react'
import AIInsights from '../../../components/AIInsights'

const COLORS = {
  primary: '#3B82F6',
  accent: '#10B981',
  purple: '#8B5CF6',
  warning: '#F59E0B',
  danger: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899'
}

const SEVERITY_COLORS = ['#10B981', '#F59E0B', '#EF4444']
const TYPE_COLORS = ['#3B82F6', '#F59E0B', '#EF4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2234] border border-[#1E293B] rounded-xl p-4 shadow-[0_16px_64px_rgba(0,0,0,0.8)]">
        <p className="text-[#94A3B8] text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-[#94A3B8] text-sm">{entry.name}:</span>
            <span className="text-[#F8FAFC] font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const incidentSummary = [
  { type: 'Minor', count: 8, cost: 2400, days: 16 },
  { type: 'Major', count: 3, cost: 15000, days: 45 },
  { type: 'Critical', count: 1, cost: 50000, days: 120 },
]

const incidentTrend = [
  { date: 'Feb 20', injury: 1, equipment: 0, safety: 1, total: 2 },
  { date: 'Feb 21', injury: 0, equipment: 1, safety: 0, total: 1 },
  { date: 'Feb 22', injury: 0, equipment: 0, safety: 1, total: 1 },
  { date: 'Feb 23', injury: 1, equipment: 1, safety: 0, total: 2 },
  { date: 'Feb 24', injury: 0, equipment: 0, safety: 1, total: 1 },
  { date: 'Feb 25', injury: 0, equipment: 1, safety: 1, total: 2 },
  { date: 'Feb 26', injury: 1, equipment: 0, safety: 0, total: 1 },
]

const severityTrend = [
  { date: 'Feb 20', minor: 2, major: 0, critical: 0 },
  { date: 'Feb 21', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 22', minor: 1, major: 0, critical: 0 },
  { date: 'Feb 23', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 24', minor: 1, major: 0, critical: 1 },
  { date: 'Feb 25', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 26', minor: 1, major: 0, critical: 0 },
]

const ppeCompliance = [
  { item: 'Hard Hat', compliance: 98, target: 100 },
  { item: 'Safety Glasses', compliance: 96, target: 100 },
  { item: 'Safety Boots', compliance: 99, target: 100 },
  { item: 'Gloves', compliance: 94, target: 100 },
  { item: 'High-Vis Vest', compliance: 97, target: 100 },
  { item: 'Hearing Protection', compliance: 92, target: 100 },
]

const safetyTraining = [
  { topic: 'Hazard Awareness', completed: 24, total: 24, score: 94 },
  { topic: 'Emergency Response', completed: 22, total: 24, score: 88 },
  { topic: 'PPE Usage', completed: 24, total: 24, score: 98 },
  { topic: 'Equipment Safety', completed: 20, total: 24, score: 85 },
  { topic: 'First Aid', completed: 18, total: 24, score: 90 },
]

const nearMissData = [
  { date: 'Week 1', count: 3, resolved: 3 },
  { date: 'Week 2', count: 5, resolved: 4 },
  { date: 'Week 3', count: 2, resolved: 2 },
  { date: 'Week 4', count: 4, resolved: 3 },
]

const hscInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'Critical Incident Spike',
    description: '1 critical incident this week - requires immediate attention',
    metric: 'Critical Incidents',
    change: '1 this week',
    recommendation: 'Conduct immediate safety stand-down meeting'
  },
  {
    id: '2',
    type: 'prediction' as const,
    severity: 'warning' as const,
    title: 'Injury Risk Forecast',
    description: 'AI predicts elevated injury risk next week based on patterns',
    metric: 'Injury Risk',
    change: 'High risk predicted',
    recommendation: 'Increase safety inspections and PPE checks'
  },
  {
    id: '3',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'Safety Improvement',
    description: 'Minor incidents decreased 25% over last month',
    metric: 'Minor Incidents',
    change: '-25% trend',
    recommendation: 'Continue current safety training program'
  },
  {
    id: '4',
    type: 'recommendation' as const,
    severity: 'warning' as const,
    title: 'Equipment Damage Pattern',
    description: 'Equipment damage incidents concentrated in night shift',
    metric: 'Equipment Damage',
    change: '70% at night',
    recommendation: 'Review night shift equipment handling procedures'
  }
]

export default function AdminHSCDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="hsc" insights={hscInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">HSC Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Health, Safety & Compliance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select className="bg-transparent text-[#F8FAFC] text-sm outline-none">
              <option className="bg-[#1A2234]">Last 30 Days</option>
              <option className="bg-[#1A2234]">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Days Without Incident', value: '5', icon: CheckCircle2, color: COLORS.accent, trend: 'Current Streak' },
          { label: 'Total Incidents', value: '12', icon: ShieldAlert, color: COLORS.danger, trend: 'Last 30 days' },
          { label: 'PPE Compliance', value: '98%', icon: Users, color: COLORS.primary, trend: '+2%' },
          { label: 'Safety Score', value: '94', icon: TrendingUp, color: COLORS.cyan, trend: 'Excellent' },
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
              <span className="text-xs text-[#64748B]">{kpi.trend}</span>
            </div>
            <p className="text-3xl font-bold text-[#F8FAFC]">{kpi.value}</p>
            <p className="text-sm text-[#94A3B8] mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Type Distribution - Stacked Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Incident Type Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="injury" name="Injury" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="equipment" name="Equipment Damage" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safety" name="Safety Violation" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Severity Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="minor" name="Minor" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="major" name="Major" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Incident Summary with Cost */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Incident Summary & Impact</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={incidentSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="type" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} formatter={(value, name) => name === 'cost' ? `$${value.toLocaleString()}` : value} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="count" name="Count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {incidentSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index]} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost ($)" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* PPE Compliance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">PPE Compliance by Item</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ppeCompliance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis dataKey="item" type="category" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={100} stroke="#10B981" strokeDasharray="5 5" />
                <Bar dataKey="compliance" name="Compliance %" radius={[0, 4, 4, 0]}>
                  {ppeCompliance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.compliance >= 95 ? '#10B981' : entry.compliance >= 90 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Safety Training Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Safety Training Progress</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={safetyTraining} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" domain={[0, 24]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis dataKey="topic" type="category" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" name="Completed" fill="#3B82F6" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="total" name="Total Required" fill="#1E293B" radius={[0, 4, 4, 0]} stackId="a" />
                <Line type="monotone" dataKey="score" name="Avg Score %" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Near Miss Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Near Miss Reports & Resolution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={nearMissData}>
                <defs>
                  <linearGradient id="nearMissGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="count" name="Near Misses" stroke="#F59E0B" strokeWidth={3} fill="url(#nearMissGrad)" />
                <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Safety Metrics Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Safety Metrics Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Lost Time Injury Rate', value: '0.0', unit: 'LTIF', status: 'good' },
              { label: 'Total Recordable', value: '2.1', unit: 'TRIF', status: 'good' },
              { label: 'Severity Rate', value: '12.5', unit: 'SR', status: 'warning' },
              { label: 'Reported Hazards', value: '47', unit: 'this month', status: 'good' },
            ].map((metric, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#1A2234]/50 border border-[#1E293B]/50">
                <p className="text-xs text-[#64748B] mb-1">{metric.label}</p>
                <p className="text-2xl font-bold text-[#F8FAFC]">{metric.value}</p>
                <p className={`text-xs ${
                  metric.status === 'good' ? 'text-[#10B981]' : 
                  metric.status === 'warning' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                }`}>{metric.unit}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
