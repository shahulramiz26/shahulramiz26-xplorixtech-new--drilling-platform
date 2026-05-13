'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown, Download, Search, TrendingUp,
  AlertTriangle, DollarSign, ChevronRight
} from 'lucide-react'

// ── MOCK COST ENGINE DATA ──────────────────────────────────────────────────
const projects = ['All Projects', 'PRJ-001 Gold Mine A', 'PRJ-002 Copper Site', 'PRJ-003 Diamond Drill']
const rigs = ['All Rigs', 'RIG-001 Alpha', 'RIG-002 Beta', 'RIG-003 Gamma']
const shifts = ['All Shifts', 'Day', 'Night']
const drillers = ['All Drillers', 'Mike Johnson', 'David Chen', 'Robert Williams', 'James Brown']

interface HoleCost {
  id: string
  project: string
  rig: string
  hole: string
  date: string
  shift: string
  driller: string
  metersDrilled: number
  drillingHours: number
  downtimeHours: number
  operationalCost: number
  downtimeCost: number
  fluidCost: number
  accessoryCost: number
  maintenanceCost: number
  totalCost: number
  costPerMeter: number
  alert: boolean
}

const mockHoles: HoleCost[] = [
  { id: '1', project: 'PRJ-001 Gold Mine A', rig: 'RIG-001 Alpha', hole: 'H-001', date: '2026-05-10', shift: 'Day', driller: 'Mike Johnson', metersDrilled: 48, drillingHours: 10.5, downtimeHours: 1.5, operationalCost: 3780, downtimeCost: 450, fluidCost: 892, accessoryCost: 620, maintenanceCost: 340, totalCost: 6082, costPerMeter: 126.7, alert: false },
  { id: '2', project: 'PRJ-001 Gold Mine A', rig: 'RIG-001 Alpha', hole: 'H-002', date: '2026-05-10', shift: 'Night', driller: 'David Chen', metersDrilled: 42, drillingHours: 9.0, downtimeHours: 3.0, operationalCost: 3240, downtimeCost: 900, fluidCost: 780, accessoryCost: 480, maintenanceCost: 210, totalCost: 5610, costPerMeter: 133.6, alert: false },
  { id: '3', project: 'PRJ-001 Gold Mine A', rig: 'RIG-002 Beta', hole: 'H-003', date: '2026-05-09', shift: 'Day', driller: 'Robert Williams', metersDrilled: 31, drillingHours: 7.5, downtimeHours: 4.5, operationalCost: 2700, downtimeCost: 1260, fluidCost: 612, accessoryCost: 480, maintenanceCost: 680, totalCost: 5732, costPerMeter: 184.9, alert: true },
  { id: '4', project: 'PRJ-002 Copper Site', rig: 'RIG-002 Beta', hole: 'H-004', date: '2026-05-09', shift: 'Night', driller: 'James Brown', metersDrilled: 28, drillingHours: 6.0, downtimeHours: 6.0, operationalCost: 2160, downtimeCost: 1680, fluidCost: 524, accessoryCost: 340, maintenanceCost: 920, totalCost: 5624, costPerMeter: 200.9, alert: true },
  { id: '5', project: 'PRJ-002 Copper Site', rig: 'RIG-003 Gamma', hole: 'H-005', date: '2026-05-08', shift: 'Day', driller: 'Mike Johnson', metersDrilled: 52, drillingHours: 11.0, downtimeHours: 1.0, operationalCost: 3960, downtimeCost: 320, fluidCost: 962, accessoryCost: 620, maintenanceCost: 180, totalCost: 6042, costPerMeter: 116.2, alert: false },
  { id: '6', project: 'PRJ-003 Diamond Drill', rig: 'RIG-003 Gamma', hole: 'H-006', date: '2026-05-08', shift: 'Night', driller: 'David Chen', metersDrilled: 38, drillingHours: 8.5, downtimeHours: 3.5, operationalCost: 3060, downtimeCost: 1120, fluidCost: 704, accessoryCost: 340, maintenanceCost: 450, totalCost: 5674, costPerMeter: 149.3, alert: false },
  { id: '7', project: 'PRJ-003 Diamond Drill', rig: 'RIG-001 Alpha', hole: 'H-007', date: '2026-05-07', shift: 'Day', driller: 'Robert Williams', metersDrilled: 44, drillingHours: 10.0, downtimeHours: 2.0, operationalCost: 3600, downtimeCost: 600, fluidCost: 816, accessoryCost: 480, maintenanceCost: 290, totalCost: 5786, costPerMeter: 131.5, alert: false },
  { id: '8', project: 'PRJ-001 Gold Mine A', rig: 'RIG-003 Gamma', hole: 'H-008', date: '2026-05-07', shift: 'Night', driller: 'James Brown', metersDrilled: 22, drillingHours: 5.0, downtimeHours: 7.0, operationalCost: 1800, downtimeCost: 2240, fluidCost: 412, accessoryCost: 210, maintenanceCost: 1240, totalCost: 5902, costPerMeter: 268.3, alert: true },
]

// ── RIG SUMMARY ────────────────────────────────────────────────────────────
const rigSummary = [
  { rig: 'RIG-001 Alpha', totalMeters: 134, totalCost: 17478, costPerMeter: 130.4, downtime: 6.5, efficiency: 91 },
  { rig: 'RIG-002 Beta', totalMeters: 101, totalCost: 16706, costPerMeter: 165.4, downtime: 13.5, efficiency: 78 },
  { rig: 'RIG-003 Gamma', totalMeters: 112, totalCost: 17618, costPerMeter: 157.3, downtime: 11.5, efficiency: 82 },
]

// ── HELPERS ────────────────────────────────────────────────────────────────
const COST_ALERT_THRESHOLD = 180 // $/m

function FilterSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#0D1117] border border-[#1E293B] text-[#F8FAFC] text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-[#3B82F6] cursor-pointer transition-colors">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-[#64748B] pointer-events-none" />
    </div>
  )
}

function CostBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg bg-[#0D1117] border border-[#1E293B]`}>
      <span className={`text-sm font-semibold ${color}`}>${value.toLocaleString()}</span>
      <span className="text-xs text-[#64748B] mt-0.5">{label}</span>
    </div>
  )
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function CostReportsPage() {
  const [project, setProject] = useState('All Projects')
  const [rig, setRig] = useState('All Rigs')
  const [shift, setShift] = useState('All Shifts')
  const [driller, setDriller] = useState('All Drillers')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [view, setView] = useState<'holes' | 'rigs'>('holes')

  const filtered = mockHoles.filter(h =>
    (project === 'All Projects' || h.project === project) &&
    (rig === 'All Rigs' || h.rig === rig) &&
    (shift === 'All Shifts' || h.shift === shift) &&
    (driller === 'All Drillers' || h.driller === driller) &&
    (search === '' || h.hole.toLowerCase().includes(search.toLowerCase()) || h.driller.toLowerCase().includes(search.toLowerCase()))
  )

  const totalMeters = filtered.reduce((s, h) => s + h.metersDrilled, 0)
  const totalCost = filtered.reduce((s, h) => s + h.totalCost, 0)
  const avgCostPerMeter = totalMeters > 0 ? totalCost / totalMeters : 0
  const totalDowntimeCost = filtered.reduce((s, h) => s + h.downtimeCost, 0)
  const alertCount = filtered.filter(h => h.alert).length

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Finance & Costing</h1>
          <p className="text-[#64748B] text-sm mt-1">Hole-by-hole cost breakdown powered by the cost engine</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sub-nav */}
          <div className="flex items-center gap-1 bg-[#0D1117] border border-[#1E293B] rounded-xl p-1">
            <Link href="/admin/finance" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
            <Link href="/admin/finance/master-data" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Master Data</Link>
            <Link href="/admin/finance/reports" className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">Cost Reports</Link>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] text-[#94A3B8] hover:text-white rounded-xl text-sm transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Holes', value: filtered.length, unit: 'holes', color: 'text-[#F8FAFC]', icon: Drill },
          { label: 'Total Meters', value: totalMeters, unit: 'm', color: 'text-blue-400', icon: TrendingUp },
          { label: 'Total Cost', value: `$${(totalCost / 1000).toFixed(1)}k`, unit: '', color: 'text-emerald-400', icon: DollarSign },
          { label: 'Avg Cost/m', value: `$${avgCostPerMeter.toFixed(1)}`, unit: '/m', color: avgCostPerMeter > COST_ALERT_THRESHOLD ? 'text-red-400' : 'text-amber-400', icon: TrendingUp },
          { label: 'Cost Alerts', value: alertCount, unit: 'holes', color: alertCount > 0 ? 'text-red-400' : 'text-emerald-400', icon: AlertTriangle },
        ].map((k, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-2 mb-2">
              <k.icon className="w-4 h-4 text-[#64748B]" />
              <span className="text-xs text-[#64748B] uppercase tracking-wider">{k.label}</span>
            </div>
            <div className={`text-xl font-bold ${k.color}`}>
              {k.value}<span className="text-sm font-normal text-[#64748B] ml-1">{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cost Alert Banner */}
      {alertCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-[#94A3B8]">
            <span className="text-red-400 font-semibold">{alertCount} hole{alertCount > 1 ? 's' : ''}</span> exceeded the cost alert threshold of{' '}
            <span className="text-[#F8FAFC] font-medium">${COST_ALERT_THRESHOLD}/m</span>. Review downtime and maintenance entries.
          </p>
        </div>
      )}

      {/* View toggle + Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#0D1117] border border-[#1E293B] rounded-lg p-1">
          <button onClick={() => setView('holes')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'holes' ? 'bg-[#1A2234] text-[#F8FAFC]' : 'text-[#64748B] hover:text-white'}`}>
            Hole View
          </button>
          <button onClick={() => setView('rigs')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'rigs' ? 'bg-[#1A2234] text-[#F8FAFC]' : 'text-[#64748B] hover:text-white'}`}>
            Rig Summary
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search hole / driller..."
              className="pl-9 pr-4 py-2 bg-[#0D1117] border border-[#1E293B] text-[#F8FAFC] text-sm rounded-lg focus:outline-none focus:border-[#3B82F6] transition-colors w-48" />
          </div>
          <FilterSelect value={project} options={projects} onChange={setProject} />
          <FilterSelect value={rig} options={rigs} onChange={setRig} />
          <FilterSelect value={shift} options={shifts} onChange={setShift} />
          <FilterSelect value={driller} options={drillers} onChange={setDriller} />
        </div>
      </div>

      {/* ── HOLE VIEW ── */}
      {view === 'holes' && (
        <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0D1117]">
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Hole</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Project / Rig</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Date / Shift</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Meters</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Total Cost</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Cost/m</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">DT Hours</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <>
                  <tr key={h.id}
                    className={`border-b border-[#1E293B] hover:bg-[#0D1117]/60 transition-colors cursor-pointer ${h.alert ? 'bg-red-500/3' : ''}`}
                    onClick={() => setExpandedRow(expandedRow === h.id ? null : h.id)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {h.alert && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <span className="text-sm font-semibold text-[#F8FAFC] font-mono">{h.hole}</span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">{h.driller}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[#F8FAFC]">{h.project.split(' ').slice(0, 2).join(' ')}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{h.rig}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[#F8FAFC]">{h.date}</div>
                      <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${h.shift === 'Day' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>{h.shift}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#F8FAFC]">{h.metersDrilled}m</span>
                      <div className="text-xs text-[#64748B] mt-0.5">{h.drillingHours}h drill</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-emerald-400">${h.totalCost.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${h.costPerMeter > COST_ALERT_THRESHOLD ? 'text-red-400' : h.costPerMeter > 150 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ${h.costPerMeter.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm ${h.downtimeHours > 4 ? 'text-red-400' : 'text-[#94A3B8]'}`}>{h.downtimeHours}h</span>
                      <div className="text-xs text-[#64748B] mt-0.5">${h.downtimeCost.toLocaleString()} loss</div>
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className={`w-4 h-4 text-[#64748B] transition-transform ${expandedRow === h.id ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>

                  {/* Expanded cost breakdown row */}
                  {expandedRow === h.id && (
                    <tr key={`${h.id}-exp`} className="border-b border-[#1E293B] bg-[#0A0F1A]">
                      <td colSpan={8} className="px-5 py-5">
                        <div className="flex flex-col gap-4">
                          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Cost Breakdown — {h.hole}</p>
                          {/* Cost bars */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <CostBadge label="Operational" value={h.operationalCost} color="text-blue-400" />
                            <CostBadge label="Downtime Loss" value={h.downtimeCost} color="text-red-400" />
                            <CostBadge label="Fluids" value={h.fluidCost} color="text-amber-400" />
                            <CostBadge label="Accessories" value={h.accessoryCost} color="text-purple-400" />
                            <CostBadge label="Maintenance" value={h.maintenanceCost} color="text-cyan-400" />
                          </div>
                          {/* Formula display */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] bg-[#0D1117] px-4 py-3 rounded-xl border border-[#1E293B] font-mono">
                            <span className="text-blue-400">${h.operationalCost.toLocaleString()}</span>
                            <span>+</span>
                            <span className="text-red-400">${h.downtimeCost.toLocaleString()}</span>
                            <span>+</span>
                            <span className="text-amber-400">${h.fluidCost.toLocaleString()}</span>
                            <span>+</span>
                            <span className="text-purple-400">${h.accessoryCost.toLocaleString()}</span>
                            <span>+</span>
                            <span className="text-cyan-400">${h.maintenanceCost.toLocaleString()}</span>
                            <span>=</span>
                            <span className="text-emerald-400 font-bold text-sm">${h.totalCost.toLocaleString()} total</span>
                            <span className="ml-2 text-[#334155]">|</span>
                            <span className={`font-bold ${h.costPerMeter > COST_ALERT_THRESHOLD ? 'text-red-400' : 'text-emerald-400'}`}>
                              ${h.costPerMeter.toFixed(1)}/m
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-[#64748B]">No records match your filters.</td></tr>
              )}
            </tbody>
            {/* Footer totals */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-[#0D1117] border-t-2 border-[#1E293B]">
                  <td className="px-5 py-4 text-sm font-bold text-[#F8FAFC]">TOTAL</td>
                  <td colSpan={2} className="px-5 py-4 text-xs text-[#64748B]">{filtered.length} holes</td>
                  <td className="px-5 py-4 text-sm font-bold text-blue-400">{totalMeters}m</td>
                  <td className="px-5 py-4 text-sm font-bold text-emerald-400">${totalCost.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm font-bold text-amber-400">${avgCostPerMeter.toFixed(1)}/m avg</td>
                  <td className="px-5 py-4 text-sm font-bold text-red-400">${totalDowntimeCost.toLocaleString()} loss</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ── RIG SUMMARY VIEW ── */}
      {view === 'rigs' && (
        <div className="space-y-4">
          {rigSummary.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">{r.rig}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.efficiency >= 88 ? 'bg-emerald-500/10 text-emerald-400' : r.efficiency >= 78 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.efficiency}% efficiency
                    </span>
                    <span className="text-xs text-[#64748B]">{r.downtime}h total downtime</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F8FAFC]">${r.costPerMeter}/m</div>
                  <div className="text-xs text-[#64748B] mt-0.5">average cost per meter</div>
                </div>
              </div>

              {/* Efficiency bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                  <span>Rig Efficiency</span>
                  <span>{r.efficiency}%</span>
                </div>
                <div className="w-full bg-[#0D1117] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${r.efficiency >= 88 ? 'bg-emerald-500' : r.efficiency >= 78 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${r.efficiency}%` }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total Meters', value: `${r.totalMeters}m`, icon: TrendingUp, color: 'text-blue-400' },
                  { label: 'Total Cost', value: `$${(r.totalCost / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-emerald-400' },
                  { label: 'Downtime Loss', value: `${r.downtime}h`, icon: AlertTriangle, color: 'text-red-400' },
                  { label: 'Cost Per Meter', value: `$${r.costPerMeter}`, icon: Gauge, color: r.costPerMeter > 160 ? 'text-red-400' : 'text-amber-400' },
                ].map((s, j) => (
                  <div key={j} className="p-3 rounded-xl bg-[#0D1117] border border-[#1E293B] flex items-center gap-3">
                    <s.icon className={`w-4 h-4 ${s.color} shrink-0`} />
                    <div>
                      <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-[#64748B]">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

// Missing icon import fix
function Drill({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l7 7-3 3-7-7 3-3z"/><path d="M3 21l7-7"/><path d="M7 17l3-3"/></svg>
}
function Gauge({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12l4-4"/></svg>
}

