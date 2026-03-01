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
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Area
} from 'recharts'
import { Users, Clock, TrendingUp, Target, Award, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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

const drillerPerformance = [
  { name: 'Mike J.', meters: 1245, rop: 52, downtime: 18, efficiency: 92, shifts: 24 },
  { name: 'David B.', meters: 1180, rop: 48, downtime: 24, efficiency: 88, shifts: 22 },
  { name: 'Chris W.', meters: 1320, rop: 58, downtime: 12, efficiency: 96, shifts: 26 },
  { name: 'Alex R.', meters: 1050, rop: 45, downtime: 32, efficiency: 78, shifts: 20 },
  { name: 'Sam T.', meters: 1150, rop: 50, downtime: 20, efficiency: 90, shifts: 23 },
]

const crewHoursData = [
  { date: 'Feb 20', hours: 336, target: 350, utilization: 96 },
  { date: 'Feb 21', hours: 384, target: 350, utilization: 110 },
  { date: 'Feb 22', hours: 352, target: 350, utilization: 101 },
  { date: 'Feb 23', hours: 400, target: 350, utilization: 114 },
  { date: 'Feb 24', hours: 368, target: 350, utilization: 105 },
  { date: 'Feb 25', hours: 392, target: 350, utilization: 112 },
  { date: 'Feb 26', hours: 416, target: 350, utilization: 119 },
]

const shiftDistribution = [
  { shift: 'Day', drillers: 8, supervisors: 3, hours: 720 },
  { shift: 'Night', drillers: 4, supervisors: 1, hours: 360 },
]

const experienceData = [
  { experience: '0-2 years', count: 3, avgROP: 42 },
  { experience: '2-5 years', count: 5, avgROP: 50 },
  { experience: '5-10 years', count: 3, avgROP: 56 },
  { experience: '10+ years', count: 1, avgROP: 60 },
]

const performanceRadar = [
  { subject: 'ROP', A: 92, B: 88, fullMark: 100 },
  { subject: 'Safety', A: 98, B: 95, fullMark: 100 },
  { subject: 'Attendance', A: 95, B: 90, fullMark: 100 },
  { subject: 'Efficiency', A: 96, B: 85, fullMark: 100 },
  { subject: 'Quality', A: 90, B: 88, fullMark: 100 },
  { subject: 'Teamwork', A: 94, B: 92, fullMark: 100 },
]

const productivityScatter = [
  { x: 52, y: 1245, z: 18, name: 'Mike J.' },
  { x: 48, y: 1180, z: 24, name: 'David B.' },
  { x: 58, y: 1320, z: 12, name: 'Chris W.' },
  { x: 45, y: 1050, z: 32, name: 'Alex R.' },
  { x: 50, y: 1150, z: 20, name: 'Sam T.' },
]

const drillerInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'warning' as const,
    title: 'Low ROP Alert',
    description: 'Alex R. showing ROP 20% below team average',
    metric: 'ROP Performance',
    change: '-20% vs avg',
    recommendation: 'Provide additional training on drilling parameters'
  },
  {
    id: '2',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'Top Performer',
    description: 'Chris W. consistently achieving highest ROP',
    metric: 'Best ROP',
    change: '58 m/hr avg',
    recommendation: 'Document best practices from Chris for team training'
  },
  {
    id: '3',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'High Downtime Pattern',
    description: 'Alex R. has 78% more downtime than other drillers',
    metric: 'Downtime',
    change: '+78% vs team avg',
    recommendation: 'Review equipment handling procedures with Alex'
  },
  {
    id: '4',
    type: 'prediction' as const,
    severity: 'info' as const,
    title: 'Crew Efficiency Forecast',
    description: 'Team efficiency projected to increase 8% next week',
    metric: 'Efficiency',
    change: '+8% projected',
    recommendation: 'Maintain current crew assignments'
  }
]

export default function AdminDrillerCrewDashboard() {
  return (
    <div className="space-y-8 pb-8">
      <AIInsights dashboardType="driller" insights={drillerInsights} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#F8FAFC]">Driller & Crew Dashboard</h2>
          <p className="text-[#94A3B8] mt-1">Personnel performance and workforce analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-xl">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select className="bg-transparent text-[#F8FAFC] text-sm outline-none">
              <option className="bg-[#1A2234]">All Projects</option>
              <option className="bg-[#1A2234]">Gold Mine Project A</option>
              <option className="bg-[#1A2234]">Copper Exploration</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Drillers', value: '12', icon: Users, color: COLORS.primary, trend: '+2', up: true },
          { label: 'Avg ROP', value: '50.6', unit: 'm/hr', icon: TrendingUp, color: COLORS.accent, trend: '+5%', up: true },
          { label: 'Total Hours', value: '2,448', unit: 'hrs', icon: Clock, color: COLORS.cyan, trend: '+12%', up: true },
          { label: 'Top Performer', value: 'Chris W.', icon: Award, color: COLORS.purple, trend: '96%', up: true },
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
              {kpi.trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-[#F8FAFC]">{kpi.value}<span className="text-sm font-normal text-[#64748B] ml-1">{kpi.unit}</span></p>
            <p className="text-sm text-[#94A3B8] mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driller Performance - Composed Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Driller Performance Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={drillerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="meters" name="Meters Drilled" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="rop" name="ROP (m/hr)" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency %" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ROP vs Downtime Scatter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">ROP vs Meters (Bubble = Downtime)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="x" name="ROP" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} label={{ value: 'ROP (m/hr)', position: 'bottom', fill: '#64748B' }} />
                <YAxis type="number" dataKey="y" name="Meters" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} label={{ value: 'Meters Drilled', angle: -90, position: 'insideLeft', fill: '#64748B' }} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Drillers" data={productivityScatter} fill="#8B5CF6">
                  {productivityScatter.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.z > 25 ? '#EF4444' : entry.z > 15 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crew Hours Trend - Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Crew Hours & Utilization</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={crewHoursData}>
                <defs>
                  <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area yAxisId="left" type="monotone" dataKey="hours" name="Hours Worked" stroke="#06B6D4" strokeWidth={3} fill="url(#hoursGradient)" />
                <Line yAxisId="left" type="monotone" dataKey="target" name="Target" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="utilization" name="Utilization %" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Shift Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Shift Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="shift" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="drillers" name="Drillers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="supervisors" name="Supervisors" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Experience vs Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Experience vs Average ROP</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="experience" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="left" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E293B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="count" name="Driller Count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgROP" name="Avg ROP" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-6">Performance Comparison (Top 2)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceRadar}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10 }} />
                <Radar name="Chris W." dataKey="A" stroke="#10B981" strokeWidth={3} fill="#10B981" fillOpacity={0.3} />
                <Radar name="Mike J." dataKey="B" stroke="#3B82F6" strokeWidth={3} fill="#3B82F6" fillOpacity={0.3} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
