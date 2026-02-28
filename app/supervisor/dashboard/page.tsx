'use client'

import Link from 'next/link'
import { 
  FileText, 
  Wrench, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Truck,
  FolderOpen,
  Activity,
  Gauge
} from 'lucide-react'

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

// Mock KPI Data
const productionKPIs = [
  { label: 'Total Meters Drilled', value: '8,450', unit: 'm', icon: TrendingUp, color: 'bg-blue-500' },
  { label: 'Total Drilling Hours', value: '1,240', unit: 'hrs', icon: Clock, color: 'bg-green-500' },
  { label: 'Total Downtime', value: '186', unit: 'hrs', icon: AlertCircle, color: 'bg-red-500' },
  { label: 'Average ROP', value: '6.8', unit: 'm/hr', icon: Activity, color: 'bg-purple-500' },
  { label: 'Active Projects', value: '3', unit: '', icon: FolderOpen, color: 'bg-amber-500' },
  { label: 'Active Rigs', value: '5', unit: '', icon: Truck, color: 'bg-cyan-500' },
]

const workforceKPIs = [
  { label: 'Total Drillers', value: '12', icon: Users, color: 'bg-blue-600' },
  { label: 'Total Supervisors', value: '4', icon: Users, color: 'bg-green-600' },
  { label: 'Shifts Logged', value: '156', icon: FileText, color: 'bg-purple-600' },
]

const maintenanceKPIs = [
  { label: 'Maintenance Logs', value: '28', icon: Wrench, color: 'bg-amber-600' },
  { label: 'Maintenance Hours', value: '84', unit: 'hrs', icon: Clock, color: 'bg-red-600' },
]

export default function SupervisorDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Supervisor Dashboard</h1>
        <p className="text-slate-600 mt-1 text-sm lg:text-base">Welcome back, John Smith (RIG01_SUP01)</p>
      </div>

      {/* Assigned Projects */}
      <div className="mb-6 p-3 lg:p-4 bg-blue-50 rounded-lg">
        <p className="text-xs lg:text-sm text-blue-800">
          <strong>Assigned Projects:</strong> Gold Mine Project A, Copper Exploration Site
        </p>
      </div>

      {/* Production Snapshot */}
      <div className="mb-6">
        <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" /> Production Snapshot
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 lg:gap-4">
          {productionKPIs.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-3 lg:p-4">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 ${kpi.color} rounded-lg flex items-center justify-center mb-2`}>
                <kpi.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-slate-900">
                {kpi.value}<span className="text-xs lg:text-sm font-normal text-slate-500">{kpi.unit}</span>
              </p>
              <p className="text-xs text-slate-600 truncate">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workforce & Maintenance Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Workforce Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 lg:w-5 lg:h-5" /> Workforce Snapshot
          </h2>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {workforceKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 lg:w-5 lg:h-5" /> Maintenance Snapshot
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {maintenanceKPIs.map((kpi, index) => (
              <div key={index} className="text-center p-3 lg:p-4 bg-slate-50 rounded-lg">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <kpi.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-900">
                  {kpi.value}{kpi.unit && <span className="text-xs lg:text-sm font-normal text-slate-500 ml-1">{kpi.unit}</span>}
                </p>
                <p className="text-xs text-slate-600">{kpi.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6">
        {quickActions.map(action => (
          <Link
            key={action.title}
            href={action.href}
            className="bg-white rounded-xl shadow-sm p-4 lg:p-6 hover:shadow-md transition flex sm:block items-center gap-4"
          >
            <div className={`w-10 h-10 lg:w-12 lg:h-12 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <action.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm lg:text-lg font-semibold text-slate-900">{action.title}</h3>
              <p className="text-xs lg:text-sm text-slate-600 hidden sm:block">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="space-y-3 lg:space-y-4">
          {recentLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  log.type === 'Drilling' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {log.type === 'Drilling' ? (
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  ) : (
                    <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{log.type} Log</p>
                  <p className="text-xs text-slate-500 truncate">
                    {log.project} • {log.rig}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs lg:text-sm text-slate-600">{log.date}</p>
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
      <div className="mt-6 p-3 lg:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-amber-900 text-sm">Shift Log Reminder</p>
          <p className="text-xs lg:text-sm text-amber-800">
            Please submit drilling logs within 2 hours after shift end. Night shift logs are due by 8:00 AM.
          </p>
        </div>
      </div>
    </div>
  )
}
