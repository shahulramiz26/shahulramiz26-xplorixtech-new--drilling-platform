'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import AIInsights from '../../components/AIInsights'

const drillerMetersData = [
  { driller: 'Mike J.', meters: 1245 },
  { driller: 'David B.', meters: 1180 },
  { driller: 'Chris W.', meters: 1320 },
  { driller: 'Alex R.', meters: 1050 },
]

const drillerRopData = [
  { driller: 'Mike J.', rop: 52 },
  { driller: 'David B.', rop: 48 },
  { driller: 'Chris W.', rop: 58 },
  { driller: 'Alex R.', rop: 45 },
]

const drillerDowntimeData = [
  { driller: 'Mike J.', hours: 18 },
  { driller: 'David B.', hours: 24 },
  { driller: 'Chris W.', hours: 12 },
  { driller: 'Alex R.', hours: 32 },
]

const crewHoursData = [
  { date: 'Feb 20', hours: 336 },
  { date: 'Feb 21', hours: 384 },
  { date: 'Feb 22', hours: 352 },
  { date: 'Feb 23', hours: 400 },
  { date: 'Feb 24', hours: 368 },
  { date: 'Feb 25', hours: 392 },
  { date: 'Feb 26', hours: 416 },
]

// AI Insights for Driller & Crew Dashboard
const drillerInsights = [
  {
    id: '1',
    type: 'anomaly' as const,
    severity: 'warning' as const,
    title: 'Low ROP Alert',
    description: 'Alex R. showing ROP 20% below team average',
    metric: 'ROP Performance',
    change: '-20% vs avg',
    recommendation: 'Provide additional training on drilling parameters'
  },
  {
    id: '2',
    type: 'trend' as const,
    severity: 'info' as const,
    title: 'Top Performer',
    description: 'Chris W. consistently achieving highest ROP',
    metric: 'Best ROP',
    change: '58 m/hr avg',
    recommendation: 'Document best practices from Chris for team training'
  },
  {
    id: '3',
    type: 'anomaly' as const,
    severity: 'critical' as const,
    title: 'High Downtime Pattern',
    description: 'Alex R. has 78% more downtime than other drillers',
    metric: 'Downtime',
    change: '+78% vs team avg',
    recommendation: 'Review equipment handling procedures with Alex'
  },
  {
    id: '4',
    type: 'prediction' as const,
    severity: 'info' as const,
    title: 'Crew Efficiency Forecast',
    description: 'Team efficiency projected to increase 8% next week',
    metric: 'Efficiency',
    change: '+8% projected',
    recommendation: 'Maintain current crew assignments'
  }
]

export default function DrillerCrewDashboard() {
  return (
    <div className="space-y-8">
      {/* AI Insights Panel */}
      <AIInsights dashboardType="driller" insights={drillerInsights} />

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Driller & Crew Dashboard</h2>
        <p className="text-slate-600">Personnel performance metrics</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Projects</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Rigs</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Shifts</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meters per Driller */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Meters per Driller</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drillerMetersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driller" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="meters" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average ROP per Driller */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Average ROP per Driller</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drillerRopData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driller" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rop" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime per Driller */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Downtime per Driller</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drillerDowntimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driller" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crew Hours Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Crew Hours Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crewHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-2">Drilling Hours × Crew Count</p>
        </div>
      </div>
    </div>
  )
}
