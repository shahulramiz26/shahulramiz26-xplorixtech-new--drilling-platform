'use client'

import Link from 'next/link'
import { 
  BarChart3, 
  Wrench, 
  Users, 
  Droplets, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react'

const dashboards = [
  {
    title: 'Operation Dashboard',
    description: 'ROP trends, meters drilled, downtime analysis, bit performance',
    icon: BarChart3,
    href: '/analytics/operation',
    color: 'bg-blue-500',
    metrics: ['ROP Trend', 'Meters Drilled', 'Downtime Analysis', 'Bit Performance']
  },
  {
    title: 'Maintenance Dashboard',
    description: 'Maintenance types, component frequency, oil consumption',
    icon: Wrench,
    href: '/analytics/maintenance',
    color: 'bg-amber-500',
    metrics: ['Maintenance Types', 'Component Frequency', 'Oil Consumption']
  },
  {
    title: 'Driller & Crew Dashboard',
    description: 'Performance by driller, crew hours, downtime tracking',
    icon: Users,
    href: '/analytics/driller-crew',
    color: 'bg-green-500',
    metrics: ['Meters per Driller', 'Average ROP', 'Crew Hours']
  },
  {
    title: 'Consumable Dashboard',
    description: 'Fluid usage, accessories, equipment hours',
    icon: Droplets,
    href: '/analytics/consumables',
    color: 'bg-purple-500',
    metrics: ['Fluid Consumption', 'Accessories Usage', 'Equipment Hours']
  },
  {
    title: 'HSC Dashboard',
    description: 'Incidents, severity analysis, safety metrics',
    icon: ShieldAlert,
    href: '/analytics/hsc',
    color: 'bg-red-500',
    metrics: ['Total Incidents', 'Severity Distribution', 'Trend Analysis']
  }
]

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboards</h1>
        <p className="text-slate-600 mt-1">View comprehensive performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map(dashboard => (
          <Link
            key={dashboard.title}
            href={dashboard.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
          >
            <div className={`w-12 h-12 ${dashboard.color} rounded-lg flex items-center justify-center mb-4`}>
              <dashboard.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{dashboard.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{dashboard.description}</p>
            <div className="space-y-1">
              {dashboard.metrics.map(metric => (
                <div key={metric} className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  {metric}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
              View Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
