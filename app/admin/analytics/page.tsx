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
    iconBg: 'rgba(249,115,22,0.1)',
    iconColor: '#F97316',
    borderHover: 'rgba(249,115,22,0.3)',
    tags: ['ROP Trend', 'Meters Drilled', 'Downtime Analysis', 'Bit Performance'],
    tagColor: 'rgba(249,115,22,0.08)',
    tagText: '#F97316',
  },
  {
    title: 'Maintenance Dashboard',
    description: 'Maintenance types, component frequency, oil consumption',
    icon: Wrench,
    href: '/admin/analytics/maintenance',
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#F59E0B',
    borderHover: 'rgba(245,158,11,0.3)',
    tags: ['Maintenance Types', 'Component Frequency', 'Oil Consumption'],
    tagColor: 'rgba(245,158,11,0.08)',
    tagText: '#F59E0B',
  },
  {
    title: 'Driller & Crew Dashboard',
    description: 'Performance by driller, crew hours, downtime tracking',
    icon: Users,
    href: '/admin/analytics/driller-crew',
    iconBg: 'rgba(59,130,246,0.1)',
    iconColor: '#60A5FA',
    borderHover: 'rgba(59,130,246,0.3)',
    tags: ['Meters per Driller', 'Average ROP', 'Crew Hours'],
    tagColor: 'rgba(59,130,246,0.08)',
    tagText: '#60A5FA',
  },
  {
    title: 'Consumables Dashboard',
    description: 'Fuel, water, additives, accessories usage tracking',
    icon: Droplets,
    href: '/admin/analytics/consumables',
    iconBg: 'rgba(139,92,246,0.1)',
    iconColor: '#A78BFA',
    borderHover: 'rgba(139,92,246,0.3)',
    tags: ['Fluid Consumption', 'Accessories Usage', 'Cost Breakdown'],
    tagColor: 'rgba(139,92,246,0.08)',
    tagText: '#A78BFA',
  },
  {
    title: 'HSC Dashboard',
    description: 'Safety metrics, incidents, PPE compliance, training',
    icon: ShieldAlert,
    href: '/admin/analytics/hsc',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#34D399',
    borderHover: 'rgba(16,185,129,0.3)',
    tags: ['Incident Tracking', 'PPE Compliance', 'Safety Training'],
    tagColor: 'rgba(16,185,129,0.08)',
    tagText: '#34D399',
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Analytics Dashboards</h1>
        <p className="text-[#64748B] mt-2">View comprehensive performance insights across all projects</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dashboards.map((dashboard, index) => (
          <motion.div
            key={dashboard.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link href={dashboard.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: 24, borderRadius: 18, height: '100%',
                  background: '#0D1117',
                  border: '1px solid #1E293B',
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = dashboard.borderHover
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1E293B'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* Icon + Arrow */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: dashboard.iconBg,
                    border: `1px solid ${dashboard.borderHover}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <dashboard.icon style={{ width: 22, height: 22, color: dashboard.iconColor }} />
                  </div>
                  <ArrowRight style={{ width: 16, height: 16, color: '#334155', marginTop: 4, transition: 'transform 0.2s' }} />
                </div>

                {/* Title + Description */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {dashboard.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
                    {dashboard.description}
                  </p>
                </div>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                  {dashboard.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      background: dashboard.tagColor,
                      color: dashboard.tagText,
                      border: `1px solid ${dashboard.borderHover}`,
                      letterSpacing: '0.04em',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  )
}

