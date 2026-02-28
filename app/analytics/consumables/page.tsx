'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

const fluidData = [
  { date: 'Feb 20', water: 2500, fuel: 800, additives: 120 },
  { date: 'Feb 21', water: 2800, fuel: 950, additives: 150 },
  { date: 'Feb 22', water: 2200, fuel: 700, additives: 100 },
  { date: 'Feb 23', water: 3200, fuel: 1100, additives: 180 },
  { date: 'Feb 24', water: 2600, fuel: 850, additives: 130 },
  { date: 'Feb 25', water: 3000, fuel: 1000, additives: 160 },
  { date: 'Feb 26', water: 3400, fuel: 1200, additives: 200 },
]

const accessoriesData = [
  { accessory: 'Core Lifter', count: 45 },
  { accessory: 'Drill Pipe', count: 32 },
  { accessory: 'Casing', count: 28 },
  { accessory: 'O-Rings', count: 56 },
  { accessory: 'Coupling', count: 24 },
  { accessory: 'Core Barrel', count: 18 },
]

const accessoriesTrendData = [
  { date: 'Feb 20', count: 28 },
  { date: 'Feb 21', count: 35 },
  { date: 'Feb 22', count: 22 },
  { date: 'Feb 23', count: 42 },
  { date: 'Feb 24', count: 30 },
  { date: 'Feb 25', count: 38 },
  { date: 'Feb 26', count: 45 },
]

const equipmentData = [
  { date: 'Feb 20', hours: 48 },
  { date: 'Feb 21', hours: 52 },
  { date: 'Feb 22', hours: 44 },
  { date: 'Feb 23', hours: 60 },
  { date: 'Feb 24', hours: 50 },
  { date: 'Feb 25', hours: 56 },
  { date: 'Feb 26', hours: 64 },
]

export default function ConsumablesDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Consumable Dashboard</h2>
        <p className="text-slate-600">Resource utilization and consumption tracking</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Projects</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>All Rigs</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluid Consumption */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Fluid Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluidData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="water" name="Water (L)" fill="#3b82f6" />
                <Bar dataKey="fuel" name="Fuel (L)" fill="#ef4444" />
                <Bar dataKey="additives" name="Additives (kg)" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accessories Usage */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Accessories Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessoriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="accessory" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accessories Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Accessories Usage Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accessoriesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Usage Hours */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Equipment Usage Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
