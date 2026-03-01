'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, AlertCircle, Activity, FolderOpen, Truck, FileText, Wrench, BarChart3 } from 'lucide-react'
import Link from 'next/link'

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

const quickActions = [
  { icon: FileText, label: 'Drilling Log', href: '/supervisor/drilling-log', color: 'blue' },
  { icon: Wrench, label: 'Maintenance', href: '/supervisor/maintenance-log', color: 'amber' },
  { icon: BarChart3, label: 'Analytics', href: '/supervisor/analytics', color: 'purple' },
]

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

      {/* Production Snapshot */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
          Production Snapshot
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Meters Drilled', value: supervisorData.stats.totalMeters, unit: 'm', icon: TrendingUp, color: 'blue' },
            { label: 'Total Drilling Hours', value: supervisorData.stats.drillingHours, unit: 'hrs', icon: Clock, color: 'green' },
            { label: 'Total Downtime', value: supervisorData.stats.downtime, unit: 'hrs', icon: AlertCircle, color: 'red' },
            { label: 'Average ROP', value: supervisorData.stats.avgROP, unit: 'm/hr', icon: Activity, color: 'purple' },
            { label: 'Active Projects', value: supervisorData.stats.activeProjects, unit: '', icon: FolderOpen, color: 'amber' },
            { label: 'Active Rigs', value: supervisorData.stats.activeRigs, unit: '', icon: Truck, color: 'cyan' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-[#F8FAFC]">
                {stat.value}<span className="text-sm font-normal text-[#64748B] ml-1">{stat.unit}</span>
              </p>
              <p className="text-sm text-[#94A3B8] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
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
