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

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Analytics Dashboards</h1>
        <p className="text-[#94A3B8] mt-2">View comprehensive performance insights across all projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map((dashboard, index) => (
          <motion.div
            key={dashboard.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={dashboard.href}>
              <div className="group h-full p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all">
                <dashboard.icon className="w-8 h-8 text-[#3B82F6] mb-4" />
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">{dashboard.title}</h3>
                <p className="text-[#94A3B8] text-sm">{dashboard.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
