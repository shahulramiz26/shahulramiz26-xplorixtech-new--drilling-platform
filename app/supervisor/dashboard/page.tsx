'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, AlertCircle, Activity, FolderOpen, Truck, FileText, Wrench, BarChart3, TrendingDown, Zap } from 'lucide-react'
import Link from 'next/link'
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data
const supervisorData = {
  name: 'John Smith',
  rigId: 'RIG01_SUP01',
  assignedProjects: ['Gold Mine Project A', 'Copper Exploration Site'],
  stats: {
    totalMeters: '8,450',
    drillingHours: '1,240',
    downtime: '186',
    avgROP: '6.8',
    activeProjects: 3,
    activeRigs: 5
  }
}

// Chart data
const ropData = [
  { date: 'Mon', rop: 5.2, target: 6.0 },
  { date: 'Tue', rop: 6.1, target: 6.0 },
  { date: 'Wed', rop: 5.8, target: 6.0 },
  { date: 'Thu', rop: 7.2, target: 6.0 },
  { date: 'Fri', rop: 6.5, target: 6.0 },
  { date: 'Sat', rop: 6.9, target: 6.0 },
  { date: 'Sun', rop: 7.5, target: 6.0 },
]

const metersData = [
  { date: 'Week 1', meters: 1240, target: 1200 },
  { date: 'Week 2', meters: 1380, target: 1200 },
  { date: 'Week 3', meters: 1150, target: 1200 },
  { date: 'Week 4', meters: 1420, target: 1200 },
]

const downtimeData = [
  { reason: 'Mechanical', hours: 45, cost: 4500 },
  { reason: 'Bit Change', hours: 32, cost: 3200 },
  { reason: 'Water', hours: 24, cost: 2400 },
  { reason: 'Weather', hours: 18, cost: 1800 },
  { reason: 'Other', hours: 67, cost: 6700 },
]

const formationData = [
  { name: 'Soft', value: 35, color: '#10B981' },
  { name: 'Medium', value: 28, color: '#3B82F6' },
  { name: 'Hard', value: 22, color: '#F59E0B' },
  { name: 'Mixed', value: 15, color: '#8B5CF6' },
]

const quickActions = [
  { icon: FileText, label: 'Drilling Log', href: '/supervisor/drilling-log', color: 'blue' },
  { icon: Wrench, label: 'Maintenance', href: '/supervisor/maintenance-log', color: 'amber' },
  { icon: BarChart3, label: 'Analytics', href: '/supervisor/analytics', color: 'purple' },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2234] border border-[#1E293B] rounded-xl p-3 shadow-lg">
        <p className="text-[#94A3B8] text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#94A3B8] text-xs">{entry.name}:</span>
            <span className="text-[#F8FAFC] font-semibold text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function SupervisorDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Supervisor Dashboard</h1>
          <p className="text-[#94A3B8] mt-1">
            Welcome back, {supervisorData.name} <span className="text-[#64748B]">({supervisorData.rigId})</span>
          </p>
        </div>
      </motion.div>

      {/* Assigned Projects Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/30"
      >
        <p className="text-[#F8FAFC]">
          <span className="font-semibold text-[#3B82F6]">Assigned Projects:</span>{' '}
          <span className="text-[#94A3B8]">{supervisorData.assignedProjects.join(', ')}</span>
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
          Production Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Meters', value: supervisorData.stats.totalMeters, unit: 'm', icon: TrendingUp, color: 'blue', trend: '+12%', up: true },
            { label: 'Drilling Hours', value: supervisorData.stats.drillingHours, unit: 'hrs', icon: Clock, color: 'green', trend: '+8%', up: true },
            { label: 'Downtime', value: supervisorData.stats.downtime, unit: 'hrs', icon: AlertCircle, color: 'red', trend: '-5%', up: false },
            { label: 'Avg ROP', value: supervisorData.stats.avgROP, unit: 'm/hr', icon: Activity, color: 'purple', trend: '+15%', up: true },
            { label: 'Active Projects', value: supervisorData.stats.activeProjects, unit: '', icon: FolderOpen, color: 'amber', trend: '+1', up: true },
            { label: 'Active Rigs', value: supervisorData.stats.activeRigs, unit: '', icon: Truck, color: 'cyan', trend: '0', up: true },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#94A3B8] text-xs">{stat.label}</span>
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              </div>
              <p className="text-xl font-bold text-[#F8FAFC]">
                {stat.value}<span className="text-xs font-normal text-[#64748B] ml-1">{stat.unit}</span>
              </p>
              <div className={`flex items-center gap-1 mt-1 text-xs ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROP Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
            ROP Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ropData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="rop" name="ROP (m/hr)" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Meters Drilled Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            Weekly Meters Drilled
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="meters" name="Meters Drilled" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Downtime Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
            Downtime Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={12} />
                <YAxis dataKey="reason" type="category" stroke="#64748B" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Hours Lost" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Formation Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F59E0B]" />
            Formation Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className={`w-6 h-6 text-${action.color}-400`} />
                </div>
                <p className="font-medium text-[#F8FAFC]">{action.label}</p>
                <p className="text-sm text-[#64748B] mt-1">Click to access</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
