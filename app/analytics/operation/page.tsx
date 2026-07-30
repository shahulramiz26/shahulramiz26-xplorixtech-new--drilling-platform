'use client'

import { useState, useMemo } from 'react'
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
import AIInsights from '../../components/AIInsights'

// Mock data
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

// Downtime data now carries a category so it can be filtered by Client / Internal.
// This should come from the same Client/Internal field captured on each downtime
// reason entry in the Drill Log (see Standby Mode logic).
type DowntimeCategory = 'Client' | 'Internal'

const downtimeData: { reason: string; hours: number; category: DowntimeCategory }[] = [
  { reason: 'Mechanical', hours: 12, category: 'Internal' },
  { reason: 'Bit Change', hours: 8, category: 'Internal' },
  { reason: 'Water Shortage', hours: 6, category: 'Client' },
  { reason: 'Weather', hours: 4, category: 'Client' },
  { reason: 'Operator Delay', hours: 3, category: 'Internal' },
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

type DowntimeFilter = 'All' | DowntimeCategory

export default function OperationDashboard() {
  const [dateRange, setDateRange] = useState('7d')
  const [downtimeFilter, setDowntimeFilter] = useState<DowntimeFilter>('All')

  // Filtered + sorted downtime data driven by the Client/Internal toggle
  const filteredDowntimeData = useMemo(() => {
    const rows =
      downtimeFilter === 'All'
        ? downtimeData
        : downtimeData.filter(d => d.category === downtimeFilter)
    return [...rows].sort((a, b) => b.hours - a.hours)
  }, [downtimeFilter])

  const downtimeTotal = filteredDowntimeData.reduce((sum, d) => sum + d.hours, 0)

  return (
    <div className="space-y-8">
      {/* AI Insights Panel */}
      <AIInsights dashboardType="operation" insights={operationInsights} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operation Dashboard</h2>
          <p className="text-slate-600">Drilling performance and productivity metrics</p>
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

        {/* Downtime by Reason — now with Client / Internal filter */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Downtime by Reason</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
              {downtimeTotal} hrs total
            </span>
          </div>

          {/* Client / Internal filter tabs */}
          <div className="flex gap-2 mb-4">
            {(['All', 'Client', 'Internal'] as DowntimeFilter[]).map(tab => (
              <button
                key={tab}
                onClick={() => setDowntimeFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  downtimeFilter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDowntimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="reason" type="category" width={100} />
                <Tooltip
                  formatter={(value: number, _name, item) => [
                    `${value} hrs`,
                    item?.payload?.category ?? ''
                  ]}
                />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                  {filteredDowntimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.category === 'Client' ? '#3b82f6' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend for category colors */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Client
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Internal
            </span>
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

