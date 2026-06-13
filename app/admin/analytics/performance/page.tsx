'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Shift {
  date: string; shift: 'Day' | 'Night'
  depthFrom: number; depthTo: number; meters: number
  bit: string; newBit: boolean
  downtime: number; dtReason: string
}
interface Hole { status: 'OPEN' | 'CLOSED'; start: string; end: string; shifts: Shift[] }
interface RigData { holes: Record<string, Hole> }
interface ProjectData { name: string; rigs: Record<string, RigData> }

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const DATA: Record<string, ProjectData> = {
  GMA: {
    name: 'Gold Mine Project A',
    rigs: {
      'KEM-14': {
        holes: {
          'H1': { status: 'CLOSED', start: 'Jun 1', end: 'Jun 6',
            shifts: [
              { date:'Jun 1', shift:'Day',   depthFrom:0,   depthTo:28,  meters:28, bit:'CB-NQ-06', newBit:true,  downtime:0,   dtReason:'—' },
              { date:'Jun 1', shift:'Night', depthFrom:28,  depthTo:50,  meters:22, bit:'CB-NQ-06', newBit:false, downtime:1.5, dtReason:'Water shortage' },
              { date:'Jun 2', shift:'Day',   depthFrom:50,  depthTo:81,  meters:31, bit:'CB-NQ-06', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 2', shift:'Night', depthFrom:81,  depthTo:106, meters:25, bit:'CB-NQ-06', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 3', shift:'Day',   depthFrom:106, depthTo:124, meters:18, bit:'CB-HQ-14', newBit:true,  downtime:2,   dtReason:'Bit change' },
              { date:'Jun 3', shift:'Night', depthFrom:124, depthTo:153, meters:29, bit:'CB-HQ-14', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 4', shift:'Day',   depthFrom:153, depthTo:186, meters:33, bit:'CB-HQ-14', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 4', shift:'Night', depthFrom:186, depthTo:213, meters:27, bit:'CB-HQ-14', newBit:false, downtime:1,   dtReason:'Operator delay' },
              { date:'Jun 5', shift:'Day',   depthFrom:213, depthTo:248, meters:35, bit:'CB-HQ-14', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 5', shift:'Night', depthFrom:248, depthTo:278, meters:30, bit:'CB-HQ-14', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 6', shift:'Day',   depthFrom:278, depthTo:312, meters:34, bit:'CB-HQ-14', newBit:false, downtime:0,   dtReason:'—' },
            ]
          },
          'H2': { status: 'OPEN', start: 'Jun 6', end: '—',
            shifts: [
              { date:'Jun 6',  shift:'Night', depthFrom:0,   depthTo:15,  meters:15, bit:'SS-NQ-15', newBit:true,  downtime:0,   dtReason:'—' },
              { date:'Jun 7',  shift:'Day',   depthFrom:15,  depthTo:47,  meters:32, bit:'SS-NQ-15', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 7',  shift:'Night', depthFrom:47,  depthTo:75,  meters:28, bit:'SS-NQ-15', newBit:false, downtime:1,   dtReason:'Mechanical' },
              { date:'Jun 8',  shift:'Day',   depthFrom:75,  depthTo:110, meters:35, bit:'SS-NQ-15', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 8',  shift:'Night', depthFrom:110, depthTo:132, meters:22, bit:'CB-NQ-07', newBit:true,  downtime:1,   dtReason:'Bit change' },
              { date:'Jun 9',  shift:'Day',   depthFrom:132, depthTo:162, meters:30, bit:'CB-NQ-07', newBit:false, downtime:0,   dtReason:'—' },
              { date:'Jun 9',  shift:'Night', depthFrom:162, depthTo:187, meters:25, bit:'CB-NQ-07', newBit:false, downtime:0,   dtReason:'—' },
            ]
          },
          'H3': { status: 'OPEN', start: 'Jun 10', end: '—',
            shifts: [
              { date:'Jun 10', shift:'Day',   depthFrom:0,  depthTo:20, meters:20, bit:'CB-NQ-07', newBit:true,  downtime:0, dtReason:'—' },
              { date:'Jun 10', shift:'Night', depthFrom:20, depthTo:48, meters:28, bit:'CB-NQ-07', newBit:false, downtime:0, dtReason:'—' },
            ]
          },
        }
      },
      'KEM-13': {
        holes: {
          'BH-01': { status: 'CLOSED', start: 'Jun 1', end: 'Jun 8',
            shifts: [
              { date:'Jun 1', shift:'Day',   depthFrom:0,  depthTo:25,  meters:25, bit:'CB-NQ-06', newBit:true,  downtime:0, dtReason:'—' },
              { date:'Jun 1', shift:'Night', depthFrom:25, depthTo:45,  meters:20, bit:'CB-NQ-06', newBit:false, downtime:2, dtReason:'Hydraulic issue' },
              { date:'Jun 2', shift:'Day',   depthFrom:45, depthTo:75,  meters:30, bit:'CB-NQ-06', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 2', shift:'Night', depthFrom:75, depthTo:100, meters:25, bit:'SS-HQ-15', newBit:true,  downtime:3, dtReason:'Bit change' },
            ]
          },
          'BH-02': { status: 'OPEN', start: 'Jun 9', end: '—',
            shifts: [
              { date:'Jun 9', shift:'Day',   depthFrom:0,  depthTo:48, meters:48, bit:'SS-HQ-15', newBit:true,  downtime:0, dtReason:'—' },
              { date:'Jun 9', shift:'Night', depthFrom:48, depthTo:95, meters:47, bit:'SS-HQ-15', newBit:false, downtime:1, dtReason:'Weather' },
            ]
          },
        }
      }
    }
  },
  CES: {
    name: 'Copper Exploration Site',
    rigs: {
      'KEM-02': {
        holes: {
          'P-01': { status: 'CLOSED', start: 'Jun 1', end: 'Jun 5',
            shifts: [
              { date:'Jun 1', shift:'Day',   depthFrom:0,   depthTo:30,  meters:30, bit:'CB-HQ-14', newBit:true,  downtime:0, dtReason:'—' },
              { date:'Jun 1', shift:'Night', depthFrom:30,  depthTo:55,  meters:25, bit:'CB-HQ-14', newBit:false, downtime:1, dtReason:'Operator delay' },
              { date:'Jun 2', shift:'Day',   depthFrom:55,  depthTo:90,  meters:35, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 2', shift:'Night', depthFrom:90,  depthTo:120, meters:30, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 3', shift:'Day',   depthFrom:120, depthTo:155, meters:35, bit:'CB-HQ-14', newBit:false, downtime:2, dtReason:'Mechanical' },
              { date:'Jun 3', shift:'Night', depthFrom:155, depthTo:185, meters:30, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 4', shift:'Day',   depthFrom:185, depthTo:220, meters:35, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 4', shift:'Night', depthFrom:220, depthTo:250, meters:30, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
              { date:'Jun 5', shift:'Day',   depthFrom:250, depthTo:280, meters:30, bit:'CB-HQ-14', newBit:false, downtime:0, dtReason:'—' },
            ]
          },
          'P-02': { status: 'OPEN', start: 'Jun 6', end: '—',
            shifts: [
              { date:'Jun 6', shift:'Day',   depthFrom:0,  depthTo:55,  meters:55, bit:'SS-NQ-15', newBit:true,  downtime:0,   dtReason:'—' },
              { date:'Jun 6', shift:'Night', depthFrom:55, depthTo:110, meters:55, bit:'SS-NQ-15', newBit:false, downtime:1.5, dtReason:'Safety hold' },
            ]
          },
        }
      }
    }
  }
}

const rigsByProject: Record<string, string[]> = { GMA: ['KEM-14', 'KEM-13'], CES: ['KEM-02'] }

// ── STYLES ────────────────────────────────────────────────────────────────────
const selectCls = "w-full px-4 py-2.5 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] text-sm appearance-none outline-none focus:border-[#3B82F6] transition-colors cursor-pointer"
const sectionCls = "rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden"

export default function PerformanceDashboard() {
  const [project, setProject] = useState('')
  const [rig,     setRig]     = useState('')
  const [hole,    setHole]    = useState('')

  const onProject = (p: string) => { setProject(p); setRig(''); setHole('') }
  const onRig     = (r: string) => { setRig(r); setHole('') }

  const rigs  = project ? rigsByProject[project] || [] : []
  const holes = project && rig ? Object.keys(DATA[project]?.rigs[rig]?.holes || {}) : []
  const holeData: Hole | null = project && rig && hole ? DATA[project]?.rigs[rig]?.holes[hole] || null : null

  const maxMeters = holeData ? Math.max(...holeData.shifts.map(s => s.meters)) : 1
  const totalMeters = holeData ? holeData.shifts.reduce((s, r) => s + r.meters, 0) : 0
  const totalDt     = holeData ? holeData.shifts.reduce((s, r) => s + r.downtime, 0) : 0
  const bitsUsed    = holeData ? [...new Set(holeData.shifts.map(s => s.bit))].length : 0
  const finalDepth  = holeData ? holeData.shifts[holeData.shifts.length - 1].depthTo : 0

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Performance Dashboard</h1>
        <p className="text-[#64748B] mt-1">Select a hole to see the full shift-by-shift breakdown</p>
      </div>

      {/* Filter bar */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Project */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-[#64748B] mb-1.5">Project</label>
            <div className="relative">
              <select className={selectCls} value={project} onChange={e => onProject(e.target.value)}>
                <option value="">Select project...</option>
                {Object.entries(DATA).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[#334155] flex-shrink-0 mt-4" />

          {/* Rig */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-[#64748B] mb-1.5">Rig</label>
            <select className={selectCls} value={rig} onChange={e => onRig(e.target.value)} disabled={!project}>
              <option value="">{project ? 'Select rig...' : '— select project first'}</option>
              {rigs.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <ChevronRight className="w-4 h-4 text-[#334155] flex-shrink-0 mt-4" />

          {/* Hole */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-[#64748B] mb-1.5">Hole Number</label>
            <select className={selectCls} value={hole} onChange={e => setHole(e.target.value)} disabled={!rig}>
              <option value="">{rig ? 'Select hole...' : '— select rig first'}</option>
              {holes.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Reset */}
          {(project || rig || hole) && (
            <button
              onClick={() => { setProject(''); setRig(''); setHole('') }}
              className="mt-4 px-4 py-2.5 text-sm text-[#64748B] border border-[#1E293B] rounded-xl hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Prompt state */}
      {!holeData && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-4">
            <ChevronRight className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <p className="text-[#F8FAFC] font-semibold mb-2">
            {!project ? 'Select a project to begin' : !rig ? 'Now select a rig' : 'Now select a hole'}
          </p>
          <p className="text-sm text-[#64748B]">
            {!hole ? "You'll see a full shift-by-shift breakdown of the selected hole" : ''}
          </p>
        </div>
      )}

      {/* Hole view */}
      {holeData && (
        <>
          {/* Hole header */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-xl font-bold text-[#F8FAFC]">{hole}</h2>
              <span className="text-[#64748B] text-sm">·</span>
              <span className="text-[#94A3B8] text-sm">{rig}</span>
              <span className="text-[#64748B] text-sm">·</span>
              <span className="text-[#94A3B8] text-sm">{DATA[project].name}</span>
              <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                holeData.status === 'OPEN'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${holeData.status === 'OPEN' ? 'bg-[#10B981]' : 'bg-[#64748B]'}`} />
                {holeData.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Started',      val: holeData.start },
                { label: 'Ended',        val: holeData.end },
                { label: 'Final Depth',  val: `${finalDepth}m` },
                { label: 'Total Meters', val: `${totalMeters}m` },
                { label: 'Total Downtime', val: `${totalDt} hrs` },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-[#0D1117] border border-[#1E293B]">
                  <p className="text-xs text-[#64748B] mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-[#F8FAFC]">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shift-by-shift table */}
          <div className={sectionCls}>
            <div className="px-5 py-4 border-b border-[#1E293B]">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Shift-by-shift log</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{holeData.shifts.length} shifts · {bitsUsed} bit{bitsUsed > 1 ? 's' : ''} used</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-[#1E293B] bg-[#0D1117]">
                    {['Date', 'Shift', 'Depth From', 'Depth To', 'Meters Drilled', 'Bit', 'Downtime', 'Reason'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {holeData.shifts.map((s, i) => {
                    const pct = Math.round((s.meters / maxMeters) * 100)
                    return (
                      <tr key={i} className={`hover:bg-[#1A2234]/50 transition ${s.newBit ? 'bg-[#10B981]/5' : ''}`}>
                        <td className="px-5 py-3 text-sm text-[#94A3B8] whitespace-nowrap">{s.date}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.shift === 'Day'
                              ? 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20'
                              : 'bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20'
                          }`}>
                            {s.shift === 'Day' ? '☀ Day' : '🌙 Night'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm font-mono text-[#94A3B8]">{s.depthFrom}m</td>
                        <td className="px-5 py-3 text-sm font-mono font-bold text-[#F8FAFC]">{s.depthTo}m</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                              <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-bold text-[#F8FAFC]">{s.meters}m</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {s.newBit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                              ↻ {s.bit}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                              {s.bit}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {s.downtime > 0 ? (
                            <span className="text-sm font-bold text-[#EF4444]">{s.downtime} hrs</span>
                          ) : (
                            <span className="text-sm text-[#334155]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-[#94A3B8]">
                          {s.dtReason !== '—' ? s.dtReason : <span className="text-[#334155]">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

