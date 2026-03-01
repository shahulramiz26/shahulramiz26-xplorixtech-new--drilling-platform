'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Users, 
  FolderOpen, 
  Truck, 
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3,
  Wrench,
  Droplets,
  ShieldAlert,
  Activity,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain
} from 'lucide-react'
import { calculateTrialDays, formatDate } from '@/lib/utils'

// Mock data
const mockCompany = {
  name: "Apex Drilling Solutions",
  industryType: "Exploration",
  trialEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  subscriptionStatus: "TRIAL",
  dailyRate: 10
}

// Premium Stat Cards
const overallStats = [
  { 
    label: 'Total Projects', 
    value: '3', 
    subtext: '2 Active, 1 On Hold',
    icon: FolderOpen, 
    color: 'from-blue-500 to-cyan-500',
    trend: '+1',
    href: '/admin/projects'
  },
  { 
    label: 'Total Rigs', 
    value: '5', 
    subtext: '3 Active, 2 Inactive',
    icon: Truck, 
    color: 'from-emerald-500 to-teal-500',
    trend: '+2',
    href: '/admin/rigs'
  },
  { 
    label: 'Total Users', 
    value: '6', 
    subtext: '1 Admin + 5 Operational',
    icon: Users, 
    color: 'from-purple-500 to-violet-500',
    trend: '+3',
    href: '/admin/users'
  },
  { 
    label: 'Monthly Bill', 
    value: '$830', 
    subtext: '83 active rig-days',
    icon: CreditCard, 
    color: 'from-amber-500 to-orange-500',
    trend: '+12%',
    href: '/admin/billing'
  },
]

// Production KPIs
const productionKPIs = [
  { label: 'Total Meters', value: '8,450', unit: 'm', icon: TrendingUp, color: 'blue', trend: '+12%', trendUp: true },
  { label: 'Drilling Hours', value: '1,240', unit: 'hrs', icon: Clock, color: 'emerald', trend: '+8%', trendUp: true },
  { label: 'Downtime', value: '186', unit: 'hrs', icon: AlertCircle, color: 'red', trend: '-5%', trendUp: false },
  { label: 'Avg ROP', value: '6.8', unit: 'm/hr', icon: Activity, color: 'purple', trend: '+15%', trendUp: true },
  { label: 'Active Projects', value: '3', unit: '', icon: FolderOpen, color: 'cyan', trend: '', trendUp: true },
  { label: 'Active Rigs', value: '3', unit: '', icon: Truck, color: 'amber', trend: '', trendUp: true },
]

// Workforce KPIs
const workforceKPIs = [
  { label: 'Total Drillers', value: '12', icon: Users, color: 'blue', subtext: 'Across all projects' },
  { label: 'Total Supervisors', value: '4', icon: Users, color: 'emerald', subtext: 'Across all projects' },
  { label: 'Shifts Logged', value: '156', icon: Clock, color: 'purple', subtext: 'This month' },
]

// Maintenance KPIs
const maintenanceKPIs = [
  { label: 'Maint. Logs', value: '28', icon: Wrench, color: 'amber', subtext: 'This month' },
  { label: 'Maint. Hours', value: '84', unit: 'hrs', icon: Clock, color: 'red', subtext: 'Total downtime' },
  { label: 'Pending Service', value: '5', icon: AlertCircle, color: 'orange', subtext: 'Rigs need attention' },
]

// Consumables KPIs
const consumablesKPIs = [
  { label: 'Fuel Used', value: '6,150', unit: 'L', icon: Droplets, color: 'red', trend: '+10%' },
  { label: 'Water Used', value: '18,900', unit: 'L', icon: Droplets, color: 'blue', trend: '+5%' },
  { label: 'Additives', value: '1,140', unit: 'kg', icon: Droplets, color: 'amber', trend: '+8%' },
]

// Safety KPIs
const safetyKPIs = [
  { label: 'Days Safe', value: '5', icon: CheckCircle2, color: 'emerald', subtext: 'Current streak' },
  { label: 'Incidents', value: '12', icon: ShieldAlert, color: 'red', subtext: 'Last 30 days' },
  { label: 'PPE Compliance', value: '98%', icon: CheckCircle2, color: 'blue', subtext: 'Across all sites' },
]

// Project Breakdown
const projectBreakdown = [
  { name: 'Gold Mine Project A', meters: 3240, rigs: 2, status: 'ACTIVE', completion: '68%', color: 'blue' },
  { name: 'Copper Exploration Site', meters: 2890, rigs: 2, status: 'ACTIVE', completion: '45%', color: 'emerald' },
  { name: 'Iron Ore Site B', meters: 1320, rigs: 1, status: 'ON_HOLD', completion: '32%', color: 'amber' },
]

// Recent Activity
const recentActivity = [
  { action: 'New drilling log submitted', project: 'Gold Mine Project A', time: '2 hours ago', user: 'John Smith', type: 'drilling' },
  { action: 'RIG-003 activated', project: 'Copper Exploration', time: '5 hours ago', user: 'Admin', type: 'rig' },
  { action: 'Maintenance log added', project: 'Gold Mine Project A', time: '1 day ago', user: 'Mike Johnson', type: 'maintenance' },
  { action: 'New project created', project: 'Iron Ore Site B', time: '2 days ago', user: 'Admin', type: 'project' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AdminDashboard() {
  const trialDays = calculateTrialDays(mockCompany.trialEndDate)
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {mockCompany.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">Last updated: Just now</span>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition">
            <Zap className="w-5 h-5 text-[#0066FF]" />
          </button>
        </div>
      </motion.div>

      {/* Trial Banner */}
      {trialDays > 0 && (
        <motion.div 
          variants={itemVariants}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#0066FF]/20 via-[#111827] to-[#00D4AA]/10 
                     border border-[#0066FF]/30 backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] 
                              flex items-center justify-center shadow-[0_8px_32px_rgba(0,102,255,0.3)]">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Free Trial: {trialDays} days remaining</p>
                <p className="text-sm text-slate-400">
                  All features unlocked until {formatDate(mockCompany.trialEndDate)}
                </p>
              </div>
            </div>
            <Link
              href="/admin/billing"
              className="px-6 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white font-semibold 
                         rounded-xl shadow-[0_4px_20px_rgba(0,102,255,0.4)] hover:shadow-[0_8px_30px_rgba(0,102,255,0.6)]
                         transition-all duration-300 text-center"
            >
              Upgrade Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* Overall Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overallStats.map((stat, i) => (
          <Link key={i} href={stat.href}>
            <div className="group p-5 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50 
                            hover:border-[#0066FF]/30 hover:bg-[#111827]/80
                            transition-all duration-500">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} 
                                flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  {stat.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Production Snapshot */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            Production Snapshot
          </h2>
          <Link href="/admin/analytics/operation" 
                className="text-sm text-[#0066FF] hover:text-[#4D94FF] flex items-center gap-1 transition">
            View Analytics <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {productionKPIs.map((kpi, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
              <div className={`w-10 h-10 rounded-lg bg-${kpi.color}-500/20 flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 text-${kpi.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-white">
                {kpi.value}<span className="text-sm font-normal text-slate-500 ml-1">{kpi.unit}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
              {kpi.trend && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium
                  ${kpi.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Workforce & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workforce */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              Workforce
            </h2>
            <Link href="/admin/analytics/driller-crew" className="text-xs text-[#0066FF] hover:underline">
              Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {workforceKPIs.map((kpi, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                <div className={`w-12 h-12 rounded-full bg-${kpi.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              Maintenance
            </h2>
            <Link href="/admin/analytics/maintenance" className="text-xs text-[#0066FF] hover:underline">
              Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {maintenanceKPIs.map((kpi, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                <div className={`w-12 h-12 rounded-full bg-${kpi.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}{kpi.unit && <span className="text-sm">{kpi.unit}</span>}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Consumables & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumables */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              Consumables
            </h2>
            <Link href="/admin/analytics/consumables" className="text-xs text-[#0066FF] hover:underline">
              Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {consumablesKPIs.map((kpi, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                <div className={`w-12 h-12 rounded-full bg-${kpi.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
                </div>
                <p className="text-xl font-bold text-white">{kpi.value}<span className="text-xs">{kpi.unit}</span></p>
                <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Safety */}
        <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
              </div>
              Safety & Compliance
            </h2>
            <Link href="/admin/analytics/hsc" className="text-xs text-[#0066FF] hover:underline">
              Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {safetyKPIs.map((kpi, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                <div className={`w-12 h-12 rounded-full bg-${kpi.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                  <kpi.icon className={`w-6 h-6 text-${kpi.color}-400`} />
                </div>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Project Breakdown */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-indigo-400" />
            </div>
            Project Breakdown
          </h2>
          <Link href="/admin/projects" className="text-sm text-[#0066FF] hover:underline">
            Manage All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-4">Project</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Meters</th>
                <th className="pb-4 text-right">Rigs</th>
                <th className="pb-4 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/50">
              {projectBreakdown.map((project, i) => (
                <tr key={i} className="group hover:bg-white/5 transition">
                  <td className="py-4">
                    <p className="font-medium text-white">{project.name}</p>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                      ${project.status === 'ACTIVE' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-white">
                    {project.meters.toLocaleString()} m
                  </td>
                  <td className="py-4 text-right text-slate-400">{project.rigs}</td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 bg-[#1E293B] rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-${project.color}-500 to-${project.color}-400 rounded-full`}
                          style={{ width: project.completion }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-10">{project.completion}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Add User', desc: 'Create operational login', href: '/admin/users', color: 'blue' },
          { icon: FolderOpen, label: 'New Project', desc: 'Set up drilling project', href: '/admin/projects', color: 'emerald' },
          { icon: Truck, label: 'Activate Rig', desc: 'Enable billing for rig', href: '/admin/rigs', color: 'amber' },
          { icon: BarChart3, label: 'View Analytics', desc: 'Detailed reports', href: '/admin/analytics', color: 'purple' },
        ].map((action, i) => (
          <Link key={i} href={action.href}>
            <div className="group p-5 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50 
                            hover:border-[#0066FF]/30 hover:bg-[#111827]/80 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/20 flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 text-${action.color}-400`} />
              </div>
              <p className="font-medium text-white mb-1">{action.label}</p>
              <p className="text-xs text-slate-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#111827]/50 border border-[#1E293B]/50">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-pink-400" />
          </div>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#1E293B]/50 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'drilling' ? 'bg-blue-500' :
                  activity.type === 'rig' ? 'bg-emerald-500' :
                  activity.type === 'maintenance' ? 'bg-amber-500' : 'bg-purple-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.project} • {activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
