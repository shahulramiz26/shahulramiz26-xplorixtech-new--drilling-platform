'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import AIInsights from '../../../components/AIInsights'

// Mock data - same as supervisor
const ropData = [
  { date: 'Feb 20', rop: 45 },
  { date: 'Feb 21', rop: 52 },
  { date: 'Feb 22', rop: 48 },
  { date: 'Feb 23', rop: 61 },
  { date: 'Feb 24', rop: 55 },
  { date: 'Feb 25', rop: 58 },
  { date: 'Feb 26', rop: 63 },
]

const metersData = [
  { date: 'Feb 20', meters: 180, recovery: 165 },
  { date: 'Feb 21', meters: 220, recovery: 205 },
  { date: 'Feb 22', meters: 195, recovery: 180 },
  { date: 'Feb 23', meters: 245, recovery: 230 },
  { date: 'Feb 24', meters: 210, recovery: 195 },
  { date: 'Feb 25', meters: 230, recovery: 215 },
  { date: 'Feb 26', meters: 250, recovery: 235 },
]

const downtimeData = [
  { reason: 'Mechanical', hours: 12 },
  { reason: 'Bit Change', hours: 8 },
  { reason: 'Water Shortage', hours: 6 },
  { reason: 'Weather', hours: 4 },
  { reason: 'Operator Delay', hours: 3 },
]

const productiveData = [
  { date: 'Feb 20', drilling: 84, downtime: 12 },
  { date: 'Feb 21', drilling: 96, downtime: 8 },
  { date: 'Feb 22', drilling: 88, downtime: 10 },
  { date: 'Feb 23', drilling: 100, downtime: 6 },
  { date: 'Feb 24', drilling: 92, downtime: 8 },
  { date: 'Feb 25', drilling: 98, downtime: 6 },
  { date: 'Feb 26', drilling: 104, downtime: 4 },
]

const formationData = [
  { formation: 'Soft', rop: 62 },
  { formation: 'Medium', rop: 48 },
  { formation: 'Hard', rop: 35 },
  { formation: 'Mixed', rop: 45 },
]

const bitPerformanceData = [
  { date: 'Feb 20', meters: 180 },
  { date: 'Feb 21', meters: 220 },
  { date: 'Feb 22', meters: 195 },
  { date: 'Feb 23', meters: 245 },
  { date: 'Feb 24', meters: 210 },
  { date: 'Feb 25', meters: 230 },
  { date: 'Feb 26', meters: 250 },
]

const completionData = [
  { name: 'Inner Worn', value: 35 },
  { name: 'Outer Worn', value: 28 },
  { name: 'Flat Worn', value: 25 },
  { name: 'Broken', value: 12 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

// AI Insights for Operation Dashboard
const operationInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'warning' as const,
    title: 'Downtime Spike Detected',
    description: 'RIG-001 showing 40% higher downtime than average this week',
    metric: 'Downtime',
    change: '+40% vs last week',
    recommendation: 'Schedule preventive maintenance for hydraulic system'
  },
  {
    id: '2',
    type: 'prediction' as const,
    severity: 'warning' as const,
    title: 'Weekly Downtime Forecast',
    description: 'Based on current trends, expect 40hrs downtime next week',
    metric: 'Projected Downtime',
    change: '40 hours',
    recommendation: 'Pre-order replacement bits to reduce delays'
  },
  {
    id: '3',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'ROP Improvement',
    description: 'Average ROP increased by 15% over last 7 days',
    metric: 'ROP',
    change: '+15%',
    recommendation: 'Continue current drilling parameters'
  },
  {
    id: '4',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'Bit Wear Acceleration',
    description: 'BIT-003 wearing 2x faster than normal in hard formation',
    metric: 'Bit Life',
    change: '-50% expected life',
    recommendation: 'Switch to impregnated bit for hard formation'
  },
  {
    id: '5',
    type: 'recommendation' as const,
    severity: 'info' as const,
    title: 'Optimal Drilling Window',
    description: 'AI analysis shows best ROP between 6-8 AM',
    metric: 'Peak Performance',
    change: '6-8 AM daily',
    recommendation: 'Schedule critical drilling during morning shift'
  }
]

export default function AdminOperationDashboard() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="space-y-8">
      {/* AI Insights Panel */}
      <AIInsights dashboardType="operation" insights={operationInsights} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operation Dashboard</h2>
          <p className="text-slate-600">Drilling performance and productivity metrics - Admin View</p>
        </div>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Projects</option>
          <option>Gold Mine Project A</option>
          <option>Copper Exploration</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Rigs</option>
          <option>RIG-001</option>
          <option>RIG-002</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Shifts</option>
          <option>Day</option>
          <option>Night</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROP Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">ROP Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ropData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rop" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">Rate of Penetration (m/hr)</p>
        </div>

        {/* Meters Drilled + Core Recovery */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Meters Drilled vs Core Recovery</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="meters" fill="#3b82f6" />
                <Bar dataKey="recovery" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime by Reason */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Downtime by Reason</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="reason" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="hours" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productive vs Downtime */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Productive Hours vs Downtime</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="drilling" stackId="a" fill="#10b981" />
                <Bar dataKey="downtime" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formation vs ROP */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Formation vs Average ROP</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formation" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rop" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bit Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Bit Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bitPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="meters" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Completion Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost per Meter */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cost per Meter by Supplier</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { supplier: 'Supplier A', cost: 8.5 },
                { supplier: 'Supplier B', cost: 9.2 },
                { supplier: 'Supplier C', cost: 7.8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}/m`} />
                <Bar dataKey="cost" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
