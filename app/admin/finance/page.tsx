'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, Gauge, AlertTriangle,
  Wrench, Package, Award, ChevronDown, BarChart2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const projects = ['All Projects', 'PRJ-001 Gold Mine A', 'PRJ-002 Copper Site', 'PRJ-003 Diamond Drill']
const rigs = ['All Rigs', 'RIG-001 Alpha', 'RIG-002 Beta', 'RIG-003 Gamma']
const dateRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Month', 'This Quarter']

const kpiData = {
  costPerMeter: { value: 142.50, unit: '$/m', change: -8.3, label: 'Cost Per Meter', good: true },
  fuelCostPerMeter: { value: 18.20, unit: '$/m', change: +12.1, label: 'Fuel Cost Per Meter', good: false },
  downtimeLoss: { value: 48600, unit: '$', change: -15.4, label: 'Downtime Loss', good: true },
  maintenanceCost: { value: 32400, unit: '$', change: +5.2, label: 'Maintenance Cost', good: false },
  consumableCost: { value: 21800, unit: '$', change: -3.1, label: 'Consumable Cost', good: true },
  totalDrillingCost: { value: 284500, unit: '$', change: -6.7, label: 'Total Drilling Cost', good: true },
  bestRig: { value: 'RIG-001 Alpha', unit: '$124/m', label: 'Best Performing Rig' },
  worstRig: { value: 'RIG-003 Gamma', unit: '$178/m', label: 'Worst Downtime Rig' },
}

const costTrendData = [
  { week: 'W1', costPerMeter: 168, fuel: 22, maintenance: 38, consumables: 29 },
  { week: 'W2', costPerMeter: 155, fuel: 20, maintenance: 35, consumables: 26 },
  { week: 'W3', costPerMeter: 162, fuel: 21, maintenance: 40, consumables: 28 },
  { week: 'W4', costPerMeter: 148, fuel: 19, maintenance: 32, consumables: 24 },
  { week: 'W5', costPerMeter: 143, fuel: 18, maintenance: 30, consumables: 22 },
  { week: 'W6', costPerMeter: 138, fuel: 17, maintenance: 28, consumables: 21 },
  { week: 'W7', costPerMeter: 142, fuel: 18, maintenance: 32, consumables: 22 },
  { week: 'W8', costPerMeter: 135, fuel: 16, maintenance: 27, consumables: 20 },
]

const downtimeTrendData = [
  { week: 'W1', mechanical: 12, hydraulic: 8, electrical: 4, weather: 3 },
  { week: 'W2', mechanical: 8, hydraulic: 6, electrical: 2, weather: 5 },
  { week: 'W3', mechanical: 15, hydraulic: 4, electrical: 6, weather: 2 },
  { week: 'W4', mechanical: 6, hydraulic: 9, electrical: 3, weather: 1 },
  { week: 'W5', mechanical: 10, hydraulic: 5, electrical: 5, weather: 4 },
  { week: 'W6', mechanical: 7, hydraulic: 7, electrical: 2, weather: 2 },
  { week: 'W7', mechanical: 9, hydraulic: 6, electrical: 4, weather: 3 },
  { week: 'W8', mechanical: 5, hydraulic: 4, electrical: 2, weather: 1 },
]

const rigPerformanceData = [
  { rig: 'RIG-001', costPerMeter: 124, efficiency: 91, downtime: 4.2 },
  { rig: 'RIG-002', costPerMeter: 147, efficiency: 84, downtime: 7.8 },
  { rig: 'RIG-003', costPerMeter: 178, efficiency: 71, downtime: 14.5 },
]

const projectCostData = [
  { name: 'PRJ-001 Gold Mine', value: 138400, color: '#3B82F6' },
  { name: 'PRJ-002 Copper', value: 94200, color: '#10B981' },
  { name: 'PRJ-003 Diamond', value: 51900, color: '#8B5CF6' },
]

const downtimeReasonsData = [
  { reason: 'Mechanical', hours: 48, cost: 14400 },
  { reason: 'Hydraulic', hours: 32, cost: 9600 },
  { reason: 'Electrical', hours: 18, cost: 5400 },
  { reason: 'Weather', hours: 14, cost: 4200 },
  { reason: 'Operator', hours: 10, cost: 3000 },
  { reason: 'Others', hours: 8, cost: 2400 },
]

const drillerPerfData = [
  { driller: 'Mike J.', metersDay: 42, costPerMeter: 131, efficiency: 94 },
  { driller: 'David C.', metersDay: 38, costPerMeter: 138, efficiency: 89 },
  { driller: 'Robert W.', metersDay: 35, costPerMeter: 152, efficiency: 82 },
  { driller: 'James B.', metersDay: 31, costPerMeter: 168, efficiency: 74 },
]

// ── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n: number, prefix = '$') =>
  n >= 1000 ? `${prefix}${(n / 1000).toFixed(1)}k` : `${prefix}${n.toFixed(0)}`

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

// ── COMPONENTS ─────────────────────────────────────────────────────────────
function FilterSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#0D1117] border border-[#1E293B] text-[#F8FAFC] text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[#3B82F6] cursor-pointer transition-colors"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-[#64748B] pointer-events-none" />
    </div>
  )
}

function KpiCard({ label, value, unit, change, good, icon: Icon, iconColor }: {
  label: string; value: number | string; unit: string; change?: number; good?: boolean; icon: any; iconColor: string
}) {
  const isPositive = change !== undefined && change > 0
  const isGoodChange = good ? !isPositive : isPositive
  return (
    <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#334155] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isGoodChange ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[#F8FAFC]">
            {typeof value === 'number' ? (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1)) : value}
          </span>
          <span className="text-[#64748B] text-sm">{unit}</span>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-[#F8FAFC] mb-4">{children}</h2>
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#1A2234', border: '1px solid #1E293B', borderRadius: '12px', color: '#F8FAFC' },
  labelStyle: { color: '#94A3B8' },
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function FinanceDashboardPage() {
  const [project, setProject] = useState('All Projects')
  const [rig, setRig] = useState('All Rigs')
  const [dateRange, setDateRange] = useState('Last 30 Days')

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Finance & Costing</h1>
          <p className="text-[#64748B] text-sm mt-1">Real-time cost analytics across all drilling operations</p>
        </div>
        {/* Sub-nav */}
        <div className="flex items-center gap-1 bg-[#0D1117] border border-[#1E293B] rounded-xl p-1">
          <Link href="/admin/finance" className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">Dashboard</Link>
          <Link href="/admin/finance/master-data" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Master Data</Link>
          <Link href="/admin/finance/reports" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Cost Reports</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <span className="text-[#64748B] text-sm font-medium">Filter by:</span>
        <FilterSelect value={project} options={projects} onChange={setProject} />
        <FilterSelect value={rig} options={rigs} onChange={setRig} />
        <FilterSelect value={dateRange} options={dateRanges} onChange={setDateRange} />
        <button className="ml-auto text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors">Reset filters</button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Cost Per Meter" value={kpiData.costPerMeter.value} unit="$/m"
          change={kpiData.costPerMeter.change} good={true}
          icon={Gauge} iconColor="bg-blue-500/10 text-blue-400" />
        <KpiCard label="Fuel Cost / Meter" value={kpiData.fuelCostPerMeter.value} unit="$/m"
          change={kpiData.fuelCostPerMeter.change} good={false}
          icon={TrendingUp} iconColor="bg-amber-500/10 text-amber-400" />
        <KpiCard label="Downtime Loss" value={kpiData.downtimeLoss.value} unit="$"
          change={kpiData.downtimeLoss.change} good={true}
          icon={AlertTriangle} iconColor="bg-red-500/10 text-red-400" />
        <KpiCard label="Total Drilling Cost" value={kpiData.totalDrillingCost.value} unit="$"
          change={kpiData.totalDrillingCost.change} good={true}
          icon={DollarSign} iconColor="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Maintenance Cost" value={kpiData.maintenanceCost.value} unit="$"
          change={kpiData.maintenanceCost.change} good={false}
          icon={Wrench} iconColor="bg-purple-500/10 text-purple-400" />
        <KpiCard label="Consumable Cost" value={kpiData.consumableCost.value} unit="$"
          change={kpiData.consumableCost.change} good={true}
          icon={Package} iconColor="bg-cyan-500/10 text-cyan-400" />

        {/* Best Rig */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400"><Award className="w-5 h-5" /></div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full font-medium">Best</span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mb-1">Best Performing Rig</p>
          <p className="text-lg font-bold text-[#F8FAFC]">{kpiData.bestRig.value}</p>
          <p className="text-emerald-400 text-sm font-medium">{kpiData.bestRig.unit}</p>
        </div>

        {/* Worst Rig */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-red-500/20 hover:border-red-500/40 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400"><TrendingDown className="w-5 h-5" /></div>
            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-medium">Alert</span>
          </div>
          <p className="text-[#64748B] text-xs font-medium uppercase tracking-wider mb-1">Worst Downtime Rig</p>
          <p className="text-lg font-bold text-[#F8FAFC]">{kpiData.worstRig.value}</p>
          <p className="text-red-400 text-sm font-medium">{kpiData.worstRig.unit}</p>
        </div>
      </div>

      {/* Charts Row 1: Cost Per Meter Trend + Project Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost Trend - 2/3 width */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Cost Per Meter Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              <Line type="monotone" dataKey="costPerMeter" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: '#3B82F6', r: 4 }} name="Cost/m ($)" />
              <Line type="monotone" dataKey="fuel" stroke="#F59E0B" strokeWidth={2} dot={false} name="Fuel/m ($)" />
              <Line type="monotone" dataKey="maintenance" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Maintenance/m ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Project Cost Breakdown - 1/3 width */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Project Cost Split</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={projectCostData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {projectCostData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`$${(v/1000).toFixed(1)}k`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {projectCostData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-[#94A3B8]">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                </div>
                <span className="text-[#F8FAFC] font-medium">${(p.value / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Downtime by Reason + Rig Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Downtime by Reason */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Downtime Loss by Reason</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={downtimeReasonsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v/1000}k`} />
              <YAxis type="category" dataKey="reason" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip {...tooltipStyle} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Loss']} />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {downtimeReasonsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rig Performance Comparison */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Rig Performance Comparison</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={rigPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="rig" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="costPerMeter" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Cost/m ($)" />
            </BarChart>
          </ResponsiveContainer>
          {/* Rig summary table */}
          <div className="mt-4 space-y-2">
            {rigPerformanceData.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#0D1117]">
                <span className="text-[#94A3B8] font-medium">{r.rig}</span>
                <span className="text-[#F8FAFC]">${r.costPerMeter}/m</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${r.efficiency >= 88 ? 'bg-emerald-500/10 text-emerald-400' : r.efficiency >= 78 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                  {r.efficiency}% eff
                </span>
                <span className="text-red-400">{r.downtime}h DT</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 3: Downtime Trend + Driller Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Downtime Trend */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Downtime Hours Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={downtimeTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 11 }} />
              <Bar dataKey="mechanical" stackId="a" fill="#EF4444" name="Mechanical" />
              <Bar dataKey="hydraulic" stackId="a" fill="#F59E0B" name="Hydraulic" />
              <Bar dataKey="electrical" stackId="a" fill="#8B5CF6" name="Electrical" />
              <Bar dataKey="weather" stackId="a" fill="#06B6D4" name="Weather" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Driller Performance */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <SectionTitle>Driller Performance</SectionTitle>
          <div className="space-y-3 mt-2">
            {drillerPerfData.map((d, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0D1117] border border-[#1E293B]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1A2234] border border-[#1E293B] flex items-center justify-center text-xs font-bold text-[#3B82F6]">
                      {d.driller.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[#F8FAFC]">{d.driller}</span>
                  </div>
                  <span className="text-xs text-[#64748B]">{d.metersDay} m/day</span>
                </div>
                {/* Efficiency bar */}
                <div className="w-full bg-[#1A2234] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${d.efficiency >= 88 ? 'bg-emerald-500' : d.efficiency >= 78 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${d.efficiency}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-[#64748B]">
                  <span>${d.costPerMeter}/m</span>
                  <span>{d.efficiency}% efficiency</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

