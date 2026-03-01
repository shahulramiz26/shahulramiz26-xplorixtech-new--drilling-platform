'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import AIInsights from '../../../components/AIInsights'

const incidentData = [
  { type: 'Minor', count: 8 },
  { type: 'Major', count: 3 },
  { type: 'Critical', count: 1 },
]

const incidentTrendData = [
  { date: 'Feb 20', injury: 1, equipment: 0, safety: 1 },
  { date: 'Feb 21', injury: 0, equipment: 1, safety: 0 },
  { date: 'Feb 22', injury: 0, equipment: 0, safety: 1 },
  { date: 'Feb 23', injury: 1, equipment: 1, safety: 0 },
  { date: 'Feb 24', injury: 0, equipment: 0, safety: 1 },
  { date: 'Feb 25', injury: 0, equipment: 1, safety: 1 },
  { date: 'Feb 26', injury: 1, equipment: 0, safety: 0 },
]

const severityTrendData = [
  { date: 'Feb 20', minor: 2, major: 0, critical: 0 },
  { date: 'Feb 21', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 22', minor: 1, major: 0, critical: 0 },
  { date: 'Feb 23', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 24', minor: 1, major: 0, critical: 1 },
  { date: 'Feb 25', minor: 1, major: 1, critical: 0 },
  { date: 'Feb 26', minor: 1, major: 0, critical: 0 },
]

const hscInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'Critical Incident Spike',
    description: '1 critical incident this week - requires immediate attention',
    metric: 'Critical Incidents',
    change: '1 this week',
    recommendation: 'Conduct immediate safety stand-down meeting'
  },
  {
    id: '2',
    type: 'prediction' as const,
    severity: 'warning' as const,
    title: 'Injury Risk Forecast',
    description: 'AI predicts elevated injury risk next week based on patterns',
    metric: 'Injury Risk',
    change: 'High risk predicted',
    recommendation: 'Increase safety inspections and PPE checks'
  },
  {
    id: '3',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'Safety Improvement',
    description: 'Minor incidents decreased 25% over last month',
    metric: 'Minor Incidents',
    change: '-25% trend',
    recommendation: 'Continue current safety training program'
  },
  {
    id: '4',
    type: 'recommendation' as const,
    severity: 'warning' as const,
    title: 'Equipment Damage Pattern',
    description: 'Equipment damage incidents concentrated in night shift',
    metric: 'Equipment Damage',
    change: '70% at night',
    recommendation: 'Review night shift equipment handling procedures'
  }
]

export default function AdminHSCDashboard() {
  return (
    <div className="space-y-8">
      <AIInsights dashboardType="hsc" insights={hscInsights} />

      <div>
        <h2 className="text-2xl font-bold text-slate-900">HSC Dashboard</h2>
        <p className="text-slate-600">Health, Safety & Compliance metrics - Admin View</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-slate-600 mb-1">Total Incidents</p>
          <p className="text-4xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Minor</p>
          <p className="text-4xl font-bold text-green-900">8</p>
          <p className="text-xs text-green-600 mt-1">67% of total</p>
        </div>
        <div className="bg-amber-50 rounded-xl shadow-sm p-6 border border-amber-200">
          <p className="text-sm text-amber-700 mb-1">Major</p>
          <p className="text-4xl font-bold text-amber-900">3</p>
          <p className="text-xs text-amber-600 mt-1">25% of total</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
          <p className="text-sm text-red-700 mb-1">Critical</p>
          <p className="text-4xl font-bold text-red-900">1</p>
          <p className="text-xs text-red-600 mt-1">8% of total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Incident Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="injury" name="Injury" stackId="a" fill="#ef4444" />
                <Bar dataKey="equipment" name="Equipment Damage" stackId="a" fill="#f59e0b" />
                <Bar dataKey="safety" name="Safety Violation" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Severity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minor" name="Minor" stackId="a" fill="#10b981" />
                <Bar dataKey="major" name="Major" stackId="a" fill="#f59e0b" />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Safety Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Days Without Incident</p>
            <p className="text-2xl font-bold text-green-900">5</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Safety Training Completed</p>
            <p className="text-2xl font-bold text-blue-900">24/24</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">PPE Compliance Rate</p>
            <p className="text-2xl font-bold text-purple-900">98%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
