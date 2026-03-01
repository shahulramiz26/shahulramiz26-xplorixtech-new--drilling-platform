'use client'

import Link from 'next/link'
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
  Drill,
  MapPin,
  CheckCircle2
} from 'lucide-react'
import { calculateTrialDays, formatDate } from '@/lib/utils'

// Mock data for demo
const mockCompany = {
  name: "Apex Drilling Solutions",
  industryType: "Exploration",
  trialEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  subscriptionStatus: "TRIAL",
  dailyRate: 10
}

// Overall Company Stats
const overallStats = [
  { 
    label: 'Total Projects', 
    value: '3', 
    subtext: '2 Active, 1 On Hold',
    icon: FolderOpen, 
    color: 'bg-blue-500',
    href: '/admin/projects'
  },
  { 
    label: 'Total Rigs', 
    value: '5', 
    subtext: '3 Active, 2 Inactive',
    icon: Truck, 
    color: 'bg-green-500',
    href: '/admin/rigs'
  },
  { 
    label: 'Total Users', 
    value: '6', 
    subtext: '1 Admin + 5 Operational',
    icon: Users, 
    color: 'bg-purple-500',
    href: '/admin/users'
  },
  { 
    label: 'Monthly Bill', 
    value: '$830', 
    subtext: '83 active rig-days',
    icon: CreditCard, 
    color: 'bg-amber-500',
    href: '/admin/billing'
  },
]

// Production Snapshot Data
const productionKPIs = [
  { label: 'Total Meters Drilled', value: '8,450', unit: 'm', icon: TrendingUp, color: 'bg-blue-500', trend: '+12%' },
  { label: 'Total Drilling Hours', value: '1,240', unit: 'hrs', icon: Clock, color: 'bg-green-500', trend: '+8%' },
  { label: 'Total Downtime', value: '186', unit: 'hrs', icon: AlertCircle, color: 'bg-red-500', trend: '-5%' },
  { label: 'Average ROP', value: '6.8', unit: 'm/hr', icon: Activity, color: 'bg-purple-500', trend: '+15%' },
  { label: 'Active Projects', value: '3', unit: '', icon: FolderOpen, color: 'bg-amber-500', trend: '' },
  { label: 'Active Rigs', value: '3', unit: '', icon: Truck, color: 'bg-cyan-500', trend: '' },
]

// Workforce Snapshot
const workforceKPIs = [
  { label: 'Total Drillers', value: '12', icon: Users, color: 'bg-blue-600', subtext: 'Across all projects' },
  { label: 'Total Supervisors', value: '4', icon: Users, color: 'bg-green-600', subtext: 'Across all projects' },
  { label: 'Total Shifts Logged', value: '156', icon: Clock, color: 'bg-purple-600', subtext: 'This month' },
]

// Maintenance Snapshot
const maintenanceKPIs = [
  { label: 'Maintenance Logs', value: '28', icon: Wrench, color: 'bg-amber-600', subtext: 'This month' },
  { label: 'Maintenance Hours', value: '84', unit: 'hrs', icon: Clock, color: 'bg-red-600', subtext: 'Total downtime' },
  { label: 'Pending Service', value: '5', icon: AlertCircle, color: 'bg-orange-600', subtext: 'Rigs need attention' },
]

// Consumables Snapshot
const consumablesKPIs = [
  { label: 'Fuel Used', value: '6,150', unit: 'L', icon: Droplets, color: 'bg-red-500', trend: '+10%' },
  { label: 'Water Used', value: '18,900', unit: 'L', icon: Droplets, color: 'bg-blue-500', trend: '+5%' },
  { label: 'Additives Used', value: '1,140', unit: 'kg', icon: Droplets, color: 'bg-amber-500', trend: '+8%' },
]

// Safety Snapshot
const safetyKPIs = [
  { label: 'Days Without Incident', value: '5', icon: CheckCircle2, color: 'bg-green-500', subtext: 'Current streak' },
  { label: 'Total Incidents', value: '12', icon: ShieldAlert, color: 'bg-red-500', subtext: 'Last 30 days' },
  { label: 'PPE Compliance', value: '98%', icon: CheckCircle2, color: 'bg-blue-500', subtext: 'Across all sites' },
]

// Project Breakdown
const projectBreakdown = [
  { name: 'Gold Mine Project A', meters: 3240, rigs: 2, status: 'ACTIVE', completion: '68%' },
  { name: 'Copper Exploration Site', meters: 2890, rigs: 2, status: 'ACTIVE', completion: '45%' },
  { name: 'Iron Ore Site B', meters: 1320, rigs: 1, status: 'ON_HOLD', completion: '32%' },
]

const recentActivity = [
  { action: 'New drilling log submitted', project: 'Gold Mine Project A', time: '2 hours ago', user: 'John Smith' },
  { action: 'RIG-003 activated', project: 'Copper Exploration', time: '5 hours ago', user: 'Admin' },
  { action: 'Maintenance log added', project: 'Gold Mine Project A', time: '1 day ago', user: 'Mike Johnson' },
  { action: 'New project created', project: 'Iron Ore Site B', time: '2 days ago', user: 'Admin' },
]

export default function AdminDashboard() {
  const trialDays = calculateTrialDays(mockCompany.trialEndDate)
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1 text-sm lg:text-base">Welcome back, {mockCompany.name}</p>
      </div>

      {/* Trial Banner */}
      {trialDays > 0 && (
        <div className="mb-6 p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 text-sm lg:text-base">
                Free Trial: {trialDays} days remaining
              </p>
              <p className="text-xs lg:text-sm text-blue-700">
                All features unlocked until {formatDate(mockCompany.trialEndDate)}
              </p>
            </div>
          </div>
          <Link
            href="/admin/billing"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {overallStats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-xl lg:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1 hidden sm:block">{stat.subtext}</p>
              </div>
              <div className={`${stat.color} p-2 lg:p-3 rounded-lg flex-shrink-0`}>
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PRODUCTION SNAPSHOT */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Production Snapshot
          </h2>
          <Link href="/admin/analytics/operation" className="text-sm text-blue-600 hover:underline">
            View Details →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
          {productionKPIs.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-3 lg:p-4">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 ${kpi.color} rounded-lg flex items-center justify-center mb-2`}>
                <kpi.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">
                {kpi.value}<span className="text-xs lg:text-sm font-normal text-slate-500">{kpi.unit}</span>
              </p>
              <p className="text-xs text-slate-600 truncate">{kpi.label}</p>
              {kpi.trend && (
                <p className={`text-xs mt-1 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend} vs last month
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WORKFORCE & MAINTENANCE SNAPSHOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Workforce Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" /> Workforce Snapshot
            </h2>
            <Link href="/admin/analytics/driller-crew" className="text-xs text-blue-600 hover:underline">
              View Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {workforceKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-1 hidden lg:block">{kpi.subtext}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5" /> Maintenance Snapshot
            </h2>
            <Link href="/admin/analytics/maintenance" className="text-xs text-blue-600 hover:underline">
              View Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {maintenanceKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900">
                  {kpi.value}{kpi.unit && <span className="text-xs lg:text-sm font-normal text-slate-500 ml-1">{kpi.unit}</span>}
                </p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-1 hidden lg:block">{kpi.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONSUMABLES & SAFETY SNAPSHOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Consumables Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Droplets className="w-5 h-5" /> Consumables Snapshot
            </h2>
            <Link href="/admin/analytics/consumables" className="text-xs text-blue-600 hover:underline">
              View Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {consumablesKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-lg lg:text-xl font-bold text-slate-900">
                  {kpi.value}<span className="text-xs">{kpi.unit}</span>
                </p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
                {kpi.trend && (
                  <p className={`text-xs mt-1 ${kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Safety Snapshot
            </h2>
            <Link href="/admin/analytics/hsc" className="text-xs text-blue-600 hover:underline">
              View Details →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {safetyKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-1 hidden lg:block">{kpi.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROJECT BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Project Breakdown
          </h2>
          <Link href="/admin/projects" className="text-sm text-blue-600 hover:underline">
            Manage Projects →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900">Meters</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900">Rigs</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-900">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectBreakdown.map((project, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 text-sm">{project.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      project.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {project.meters.toLocaleString()} m
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {project.rigs}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: project.completion }}
                        />
                      </div>
                      <span className="text-xs text-slate-600">{project.completion}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
        <Link
          href="/admin/users"
          className="p-4 lg:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200"
        >
          <Users className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-medium text-slate-900 text-sm">Add User</p>
          <p className="text-xs text-slate-500 hidden lg:block">Create operational login</p>
        </Link>
        <Link
          href="/admin/projects"
          className="p-4 lg:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200"
        >
          <FolderOpen className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-medium text-slate-900 text-sm">New Project</p>
          <p className="text-xs text-slate-500 hidden lg:block">Set up drilling project</p>
        </Link>
        <Link
          href="/admin/rigs"
          className="p-4 lg:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200"
        >
          <Truck className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-medium text-slate-900 text-sm">Activate Rig</p>
          <p className="text-xs text-slate-500 hidden lg:block">Enable billing for rig</p>
        </Link>
        <Link
          href="/admin/analytics"
          className="p-4 lg:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200"
        >
          <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-medium text-slate-900 text-sm">View Analytics</p>
          <p className="text-xs text-slate-500 hidden lg:block">Detailed reports</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-3 lg:space-y-4">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {activity.project} • {activity.user}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs lg:text-sm text-slate-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Preview */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900">Billing Preview</h2>
          <Link href="/admin/billing" className="text-blue-600 hover:underline text-sm">
            View Details →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="p-3 lg:p-4 bg-slate-50 rounded-lg">
            <p className="text-xs lg:text-sm text-slate-600">Daily Rate</p>
            <p className="text-xl lg:text-2xl font-bold text-slate-900">${mockCompany.dailyRate}</p>
          </div>
          <div className="p-3 lg:p-4 bg-slate-50 rounded-lg">
            <p className="text-xs lg:text-sm text-slate-600">Active Rig-Days</p>
            <p className="text-xl lg:text-2xl font-bold text-slate-900">83</p>
          </div>
          <div className="p-3 lg:p-4 bg-slate-50 rounded-lg">
            <p className="text-xs lg:text-sm text-slate-600">Current Month</p>
            <p className="text-xl lg:text-2xl font-bold text-slate-900">$830</p>
          </div>
          <div className="p-3 lg:p-4 bg-green-50 rounded-lg">
            <p className="text-xs lg:text-sm text-green-700">Projected (Est.)</p>
            <p className="text-xl lg:text-2xl font-bold text-green-900">$1,240</p>
          </div>
        </div>
      </div>
    </div>
  )
}
