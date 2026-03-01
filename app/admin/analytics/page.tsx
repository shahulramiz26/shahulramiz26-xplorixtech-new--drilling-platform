'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, Wrench, Users, Droplets, ShieldAlert, ArrowRight } from 'lucide-react'

const dashboards = [
  {
    title: 'Operation Dashboard',
    description: 'ROP trends, meters drilled, downtime analysis, bit performance',
    icon: BarChart3,
    href: '/admin/analytics/operation',
    color: 'blue',
    features: ['ROP Trend', 'Meters Drilled', 'Downtime Analysis', 'Bit Performance']
  },
  {
    title: 'Maintenance Dashboard',
    description: 'Maintenance types, component frequency, oil consumption',
    icon: Wrench,
    href: '/admin/analytics/maintenance',
    color: 'amber',
    features: ['Maintenance Types', 'Component Frequency', 'Oil Consumption']
  },
  {
    title: 'Driller & Crew Dashboard',
    description: 'Performance by driller, crew hours, downtime tracking',
    icon: Users,
    href: '/admin/analytics/driller-crew',
    color: 'emerald',
    features: ['Meters per Driller', 'Average ROP', 'Crew Hours']
  },
  {
    title: 'Consumables Dashboard',
    description: 'Fuel, water, additives, accessories usage tracking',
    icon: Droplets,
    href: '/admin/analytics/consumables',
    color: 'purple',
    features: ['Fluid Consumption', 'Accessories Usage', 'Cost Breakdown']
  },
  {
    title: 'HSC Dashboard',
    description: 'Safety metrics, incidents, PPE compliance, training',
    icon: ShieldAlert,
    href: '/admin/analytics/hsc',
    color: 'red',
    features: ['Incident Tracking', 'PPE Compliance', 'Safety Training']
  },
]

const colorClasses: any = {
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  emerald: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Analytics Dashboards</h1>
        <p className="text-[#94A3B8] mt-2">
          View comprehensive performance insights across all projects
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard, index) => (
          <motion.div
            key={dashboard.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={dashboard.href}>
              <div className="group h-full p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[dashboard.color]} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <dashboard.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">{dashboard.title}</h3>
                <p className="text-[#94A3B8] text-sm mb-4">{dashboard.description}</p>
                <ul className="space-y-1 mb-4">
                  {dashboard.features.map((feature, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[#3B82F6] font-medium text-sm group-hover:gap-3 transition-all">
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
