'use client'

import { useState } from 'react'
import {
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

const maintenanceTypeData = [
  { name: 'Preventive', value: 45 },
  { name: 'Breakdown', value: 25 },
  { name: 'Scheduled', value: 20 },
  { name: 'Component', value: 10 },
]

const maintenanceHoursData = [
  { date: 'Feb 20', hours: 8 },
  { date: 'Feb 21', hours: 4 },
  { date: 'Feb 22', hours: 12 },
  { date: 'Feb 23', hours: 6 },
  { date: 'Feb 24', hours: 10 },
  { date: 'Feb 25', hours: 5 },
  { date: 'Feb 26', hours: 7 },
]

const componentData = [
  { component: 'Engine', count: 8 },
  { component: 'Hydraulic', count: 12 },
  { component: 'Electrical', count: 6 },
  { component: 'Transmission', count: 5 },
  { component: 'Mud Pump', count: 7 },
  { component: 'Compressor', count: 4 },
]

const actionData = [
  { action: 'Repair', count: 28 },
  { action: 'Replace', count: 15 },
  { action: 'Temporary', count: 8 },
]

const oilData = [
  { date: 'Feb 20', engine: 15, hydraulic: 25, transmission: 10 },
  { date: 'Feb 21', engine: 8, hydraulic: 12, transmission: 5 },
  { date: 'Feb 22', engine: 20, hydraulic: 35, transmission: 15 },
  { date: 'Feb 23', engine: 10, hydraulic: 18, transmission: 8 },
  { date: 'Feb 24', engine: 18, hydraulic: 30, transmission: 12 },
  { date: 'Feb 25', engine: 12, hydraulic: 20, transmission: 9 },
  { date: 'Feb 26', engine: 14, hydraulic: 22, transmission: 11 },
]

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981']

export default function MaintenanceDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Maintenance Dashboard</h2>
          <p className="text-slate-600">Rig maintenance and component health metrics</p>
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
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
        {/* Maintenance Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maintenanceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {maintenanceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Hours per Rig */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Hours per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Component Affected Frequency */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Component Affected Frequency</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="component" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Taken Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Action Taken Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Oil Consumption */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Oil Consumption per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={oilData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="engine" name="Engine Oil" fill="#3b82f6" />
                <Bar dataKey="hydraulic" name="Hydraulic Oil" fill="#ef4444" />
                <Bar dataKey="transmission" name="Transmission Oil" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
