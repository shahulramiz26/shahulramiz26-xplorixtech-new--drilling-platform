'use client'

import Link from 'next/link'
import { 
  Users, 
  FolderOpen, 
  Truck, 
  CreditCard,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import { calculateTrialDays, formatDate } from '@/lib/utils'

// Mock data for demo
const mockCompany = {
  name: "Apex Drilling Solutions",
  industryType: "Exploration",
  trialEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days remaining
  subscriptionStatus: "TRIAL",
  dailyRate: 10
}

const stats = [
  { 
    label: 'Total Users', 
    value: '6', 
    subtext: '1 Admin + 5 Operational',
    icon: Users, 
    color: 'bg-blue-500',
    href: '/admin/users'
  },
  { 
    label: 'Active Projects', 
    value: '3', 
    subtext: '2 Active, 1 On Hold',
    icon: FolderOpen, 
    color: 'bg-green-500',
    href: '/admin/projects'
  },
  { 
    label: 'Rigs', 
    value: '5', 
    subtext: '3 Active, 2 Inactive',
    icon: Truck, 
    color: 'bg-amber-500',
    href: '/admin/rigs'
  },
  { 
    label: 'Monthly Bill', 
    value: '$830', 
    subtext: '83 active rig-days',
    icon: CreditCard, 
    color: 'bg-purple-500',
    href: '/admin/billing'
  },
]

const recentActivity = [
  { action: 'New drilling log submitted', project: 'Gold Mine Project A', time: '2 hours ago', user: 'John Smith' },
  { action: 'Rig RIG-003 activated', project: 'Copper Exploration', time: '5 hours ago', user: 'Admin' },
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {stats.map(stat => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <Link
              href="/admin/users"
              className="p-3 lg:p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">Add User</p>
              <p className="text-xs text-slate-500 hidden sm:block">Create operational login</p>
            </Link>
            <Link
              href="/admin/projects"
              className="p-3 lg:p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">New Project</p>
              <p className="text-xs text-slate-500 hidden sm:block">Set up drilling project</p>
            </Link>
            <Link
              href="/admin/rigs"
              className="p-3 lg:p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">Activate Rig</p>
              <p className="text-xs text-slate-500 hidden sm:block">Enable billing for rig</p>
            </Link>
            <Link
              href="/admin/billing"
              className="p-3 lg:p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">View Invoice</p>
              <p className="text-xs text-slate-500 hidden sm:block">Check monthly billing</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 lg:space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 lg:pb-4 border-b border-slate-100 last:border-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {activity.project} • {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Preview */}
      <div className="mt-4 lg:mt-8 bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900">Billing Preview</h2>
          <Link href="/admin/billing" className="text-blue-600 hover:underline text-sm">
            View Details
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
