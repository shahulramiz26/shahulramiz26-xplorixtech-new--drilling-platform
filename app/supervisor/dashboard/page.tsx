'use client'

import Link from 'next/link'
import { FileText, Wrench, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const quickActions = [
  {
    title: 'Drilling Log',
    description: 'Submit daily drilling operations data',
    icon: FileText,
    href: '/supervisor/drilling-log',
    color: 'bg-blue-500'
  },
  {
    title: 'Maintenance Log',
    description: 'Record rig maintenance activities',
    icon: Wrench,
    href: '/supervisor/maintenance-log',
    color: 'bg-amber-500'
  },
  {
    title: 'View Analytics',
    description: 'Check performance dashboards',
    icon: BarChart3,
    href: '/supervisor/analytics',
    color: 'bg-green-500'
  }
]

const recentLogs = [
  { type: 'Drilling', project: 'Gold Mine Project A', rig: 'RIG-001', date: 'Today, 6:00 PM', status: 'Submitted' },
  { type: 'Maintenance', project: 'Gold Mine Project A', rig: 'RIG-001', date: 'Yesterday, 4:30 PM', status: 'Submitted' },
  { type: 'Drilling', project: 'Copper Exploration', rig: 'RIG-002', date: 'Feb 26, 6:00 PM', status: 'Submitted' },
]

export default function SupervisorDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Supervisor Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, John Smith (RIG01_SUP01)</p>
      </div>

      {/* Assigned Projects */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Assigned Projects:</strong> Gold Mine Project A, Copper Exploration Site
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {quickActions.map(action => (
          <Link
            key={action.title}
            href={action.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{action.title}</h3>
            <p className="text-sm text-slate-600">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  log.type === 'Drilling' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {log.type === 'Drilling' ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Wrench className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{log.type} Log</p>
                  <p className="text-sm text-slate-500">
                    {log.project} • {log.rig}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{log.date}</p>
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Reminder */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">Shift Log Reminder</p>
          <p className="text-sm text-amber-800">
            Please submit drilling logs within 2 hours after shift end. Night shift logs are due by 8:00 AM.
          </p>
        </div>
      </div>
    </div>
  )
}
