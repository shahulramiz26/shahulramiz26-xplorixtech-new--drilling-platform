'use client'

import { useState, useMemo } from 'react'
import { Save, Plus, Trash2, Paperclip, AlertTriangle, ChevronDown } from 'lucide-react'
import {
  useInventory, money, perMetre, projectCode, costPerMetre,
  PROJECTS, RIGS,
  type Part,
} from '../../../lib/inventory-store'
import { useCostingOptional } from '../../../lib/costing-store'

/* ==========================================================================
 * DAILY DRILLING LOG
 *
 * Parts used section: shows only what the regular store has issued to this rig
 * on this project. Every part wears in metres — one life figure, one cost per
 * metre. The driller enters metres run; units used up is suggested and editable.
 * Standby hides the section because nothing wears on a standby day.
 * ========================================================================== */

const mockData = {
  drillers:    ['Mike Johnson', 'David Chen', 'Robert Williams', 'James Brown'],
  supervisors: ['John Smith', 'Sarah Davis', 'Michael Wilson'],
}

const holeSizes        = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"']
const formationTypes   = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Very Hard Formation']
const lithologyTypes   = ['Sandstone', 'Limestone', 'Granite', 'Basalt', 'Shale', 'Quartzite', 'Dolerite', 'Others']
const downtimeReasonsList = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault', 'Bit Change',
  'Rod Change', 'Casing Installation', 'Water Shortage', 'Fuel Shortage',
  'Operator Delay', 'Shift Change Delay', 'Ground Condition Issue',
  'Site Access Issue', 'Safety Hold', 'Weather Condition',
  'Waiting for Instruction', 'Others',
]
const incidentTypes  = ['Injury', 'Near Miss', 'Equipment Damage', 'Safety Violation', 'Environmental', 'Others']
const severityTypes  = ['Minor', 'Major', 'Critical']
const shifts         = ['Day', 'Night']

interface DowntimeRow { id: string; reason: string; type: 'Internal' | 'Client'; hours: string }
interface PartRow     { id: string; itemId: string; metresRun: string; qty: string; qtyTouched: boolean; reason: string }
interface IncidentRow { id: string; type: string; severity: string; description: string }

const ic = 'w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors'
const sc = 'w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors'
const lc = 'block text-sm text-[#94A3B8] mb-2'
const sec = 'p-6 rounded-2xl bg-[#111827] border border-[#1E293B]'
const stc = 'text-lg font-bold text-[#F8FAFC]'
const dic = 'w-full px-4 py-3 bg-[#0D1117]/50 border border-[#1E293B]/50 rounded-xl text-[#4B5563] cursor-not-allowed'

let rowSeq = 0
const rowId = () => `r${Date.now()}_${++rowSeq}`

export default function DrillingLogPage() {
  const { state: inv } = useInventory()
  const costing        = useCostingOptional()
  const catalogue      = inv.catalogue.filter(i => i.active)
  const partById       = (id: string) => catalogue.find(i => i.id === id)

  const [shiftMode, setShiftMode] = useState<10 | 12>(12)
  const [isStandby,  setIsStandby]  = useState(false)

  // Basic shift details
  const [project,    setProject]    = useState('')
  const [rig,        setRig]        = useState('')
  const [shiftDate,  setShiftDate]  = useState(new Date().toISOString().slice(0, 10))
  const [shift,      setShift]      = useState('')
  const [supervisor, setSupervisor] = useState('')
  const [driller,    setDriller]    = useState('')
  const [holeNumber, setHoleNumber] = useState('')
  const [crewCount,  setCrewCount]  = useState('0')

  // Hole closed / new hole
  const [holeClosed,        setHoleClosed]        = useState(false)
  const [newHoleDrilled,    setNewHoleDrilled]    = useState(false)
  const [newHoleNumber,     setNewHoleNumber]     = useState('')
  const [newHoleMeterStart, setNewHoleMeterStart] = useState('')
  const [newHoleMeterEnd,   setNewHoleMeterEnd]   = useState('')
  const [newHoleSize,       setNewHoleSize]       = useState('')
  const [newHoleFormation,  setNewHoleFormation]  = useState('')
  const [newHoleLithology,  setNewHoleLithology]  = useState('')

  // Operation details
  const [drillingHours, setDrillingHours] = useState('')
  const [downtimeHours, setDowntimeHours] = useState('')
  const [meterStart,    setMeterStart]    = useState('')
  const [meterEnd,      setMeterEnd]      = useState('')
  const [coreRecovery,  setCoreRecovery]  = useState('')
  const [holeSize,      setHoleSize]      = useState('')
  const [formationType, setFormationType] = useState('')
  const [lithology,     setLithology]     = useState('')
  const [engineHmr,     setEngineHmr]     = useState('')
  const [engineHours,   setEngineHours]   = useState('')

  const metersDrilled = meterStart && meterEnd
    ? Math.max(0, parseFloat(meterEnd) - parseFloat(meterStart)) : 0
  const newHoleMetersDrilled = newHoleMeterStart && newHoleMeterEnd
    ? Math.max(0, parseFloat(newHoleMeterEnd) - parseFloat(newHoleMeterStart)) : 0
  const shiftMetres = metersDrilled + (holeClosed && newHoleDrilled ? newHoleMetersDrilled : 0)

  // Downtime, consumables, parts, incidents, attachments
  const [downtimeRows, setDowntimeRows] = useState<DowntimeRow[]>([
    { id: rowId(), reason: '', type: 'Internal', hours: '' },
  ])
  const [fuel,      setFuel]      = useState('')
  const [water,     setWater]     = useState('')
  const [additives, setAdditives] = useState('')
  const [partRows,  setPartRows]  = useState<PartRow[]>([
    { id: rowId(), itemId: '', metresRun: '', qty: '', qtyTouched: false, reason: '' },
  ])
  const [incidents,    setIncidents]    = useState<IncidentRow[]>([
    { id: rowId(), type: '', severity: '', description: '' },
  ])
  const [attachments, setAttachments] = useState<File[]>([])

  /* ── What is on this rig ─────────────────────────────────────────────────
   * Sum every issue to this rig on this project, then subtract what the
   * driller's logs say was used. The remainder is on the rig right now. */
  const onRig = useMemo(() => {
    const out: Record<string, { issued: number; used: number }> = {}
    if (!rig || !project) return out

    inv.pos.forEach(po => po.issues
      .filter(i => i.rig === rig && (i.project ?? po.project) === project)
      .forEach(i => i.lines.forEach(l => {
        const e = out[l.itemId] ??= { issued: 0, used: 0 }
        e.issued += l.qty
      })))

    ;(costing?.state.shiftLogs ?? [])
      .filter(l => l.rig === rig && l.project === project)
      .forEach(l => (l.partsUsed ?? []).forEach(u => {
        const e = out[u.itemId] ??= { issued: 0, used: 0 }
        e.used += u.qty ?? 0
      }))

    return out
  }, [inv.pos, costing?.state.shiftLogs, rig, project])

  /* Parts the driller can choose — still on the rig, not already in another row */
  const available = (currentRowId: string) =>
    catalogue.filter(p => {
      const e = onRig[p.id]
      if (!e || e.issued - e.used <= 0) return false
      return !partRows.some(r => r.id !== currentRowId && r.itemId === p.id)
    })

  const anythingOnRig = Object.values(onRig).some(e => e.issued - e.used > 0)

  /* Suggested units used: floor of (metresRun / lifeMetres), capped by what is on the rig */
  const suggestQty = (part: Part, metresRun: number, onRigNow: number) => {
    const life = part.lifeMetres
    if (life <= 0 || metresRun <= 0) return 0
    return Math.min(onRigNow, Math.floor(metresRun / life))
  }

  /* When a part is selected, pre-fill metres with the shift's total. */
  const pickPart = (id: string, itemId: string) => {
    updatePart(id, {
      itemId,
      metresRun: shiftMetres > 0 ? String(shiftMetres) : '',
      qty: '', qtyTouched: false, reason: '',
    })
  }

  // Handlers
  const handleStandbyToggle = (val: boolean) => {
    setIsStandby(val)
    setDowntimeRows([{ id: rowId(), reason: '', type: val ? 'Client' : 'Internal', hours: '' }])
    if (val) setPartRows([{ id: rowId(), itemId: '', metresRun: '', qty: '', qtyTouched: false, reason: '' }])
  }

  const addDowntime    = () => setDowntimeRows(r => [...r, { id: rowId(), reason: '', type: isStandby ? 'Client' : 'Internal', hours: '' }])
  const removeDowntime = (id: string) => setDowntimeRows(r => r.filter(x => x.id !== id))
  const updateDowntime = (id: string, field: keyof DowntimeRow, value: string) =>
    setDowntimeRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  const addPart    = () => setPartRows(r => [...r, { id: rowId(), itemId: '', metresRun: '', qty: '', qtyTouched: false, reason: '' }])
  const removePart = (id: string) => setPartRows(r => r.filter(x => x.id !== id))
  const updatePart = (id: string, patch: Partial<PartRow>) =>
    setPartRows(r => r.map(x => x.id === id ? { ...x, ...patch } : x))

  const addIncident    = () => setIncidents(r => [...r, { id: rowId(), type: '', severity: '', description: '' }])
  const removeIncident = (id: string) => setIncidents(r => r.filter(x => x.id !== id))
  const updateIncident = (id: string, field: keyof IncidentRow, value: string) =>
    setIncidents(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  const handleSubmit = () => {
    const partsUsed = partRows.map(r => {
      const part = partById(r.itemId)
      if (!part || !r.itemId) return null
      const metres = parseFloat(r.metresRun) || 0
      const onRigNow = Math.max(0, (onRig[r.itemId]?.issued ?? 0) - (onRig[r.itemId]?.used ?? 0))
      const qty = r.qtyTouched
        ? Math.min(onRigNow, parseFloat(r.qty) || 0)
        : suggestQty(part, metres, onRigNow)
      return { itemId: r.itemId, metres, qty }
    }).filter(Boolean)
    console.log('drilling log', { project, rig, shiftDate, shift, partsUsed })
    alert('Drilling log submitted successfully!')
  }

  /* Total value of parts used up this shift */
  const partsTotal = partRows.reduce((s, r) => {
    const part = partById(r.itemId)
    if (!part) return s
    const onRigNow = Math.max(0, (onRig[r.itemId]?.issued ?? 0) - (onRig[r.itemId]?.used ?? 0))
    const metres = parseFloat(r.metresRun) || 0
    const qty = r.qtyTouched
      ? Math.min(onRigNow, parseFloat(r.qty) || 0)
      : suggestQty(part, metres, onRigNow)
    return s + qty * part.rate
  }, 0)

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${on ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Daily Drilling Log</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Record shift details, performance metrics and resource consumption</p>
        </div>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors font-medium">
          <Save className="w-4 h-4" /> Submit Log
        </button>
      </div>

      {/* Standby banner */}
      <div className={`rounded-2xl border p-4 transition-all ${isStandby ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#111827] border-[#1E293B]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${isStandby ? 'text-amber-400' : 'text-[#64748B]'}`} />
            <div>
              <p className={`font-semibold text-sm ${isStandby ? 'text-amber-300' : 'text-[#F8FAFC]'}`}>Standby Mode</p>
              <p className="text-xs text-[#64748B] mt-0.5">Enable if operations are on hold — drilling and parts are hidden, downtime set to Client</p>
            </div>
          </div>
          <button onClick={() => handleStandbyToggle(!isStandby)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${isStandby ? 'bg-amber-500' : 'bg-[#1E293B]'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isStandby ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {isStandby && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-xs text-amber-300/70">Nothing wears on a standby day. Downtime is pre-set to <span className="font-semibold text-amber-300">Client</span> — add the reason and hours there.</p>
          </div>
        )}
      </div>

      {/* 1. Basic Shift Details */}
      <div className={sec}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={stc}>Basic Shift Details</h2>
          <div className="flex items-center gap-1 bg-[#1A2234] rounded-lg p-1">
            {([10, 12] as const).map(h => (
              <button key={h} onClick={() => setShiftMode(h)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${shiftMode === h ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}>
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={lc}>Project *</label>
            <select className={sc} value={project}
              onChange={e => { setProject(e.target.value); setPartRows([{ id: rowId(), itemId: '', metresRun: '', qty: '', qtyTouched: false, reason: '' }]) }}>
              <option value="">Select project...</option>
              {PROJECTS.map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Rig *</label>
            <select className={sc} value={rig} disabled={!project}
              onChange={e => { setRig(e.target.value); setPartRows([{ id: rowId(), itemId: '', metresRun: '', qty: '', qtyTouched: false, reason: '' }]) }}>
              <option value="">{project ? 'Select rig...' : 'Select a project first'}</option>
              {RIGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Shift Date *</label>
            <input type="date" className={ic} style={{ colorScheme: 'dark' }}
              value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
          </div>
          <div>
            <label className={lc}>Shift *</label>
            <select className={sc} value={shift} onChange={e => setShift(e.target.value)}>
              <option value="">Select shift...</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={lc}>Supervisor *</label>
            <select className={sc} value={supervisor} onChange={e => setSupervisor(e.target.value)}>
              <option value="">Select supervisor...</option>
              {mockData.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Driller *</label>
            <select className={sc} value={driller} onChange={e => setDriller(e.target.value)}>
              <option value="">Select driller...</option>
              {mockData.drillers.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Hole Number *</label>
            <select className={sc} value={holeNumber} onChange={e => setHoleNumber(e.target.value)}>
              <option value="">Select hole number...</option>
              <optgroup label="Open Holes">
                {['H1', 'H2', 'H3', 'BH-001', 'BH-002'].map(h => <option key={h} value={h}>{h} — OPEN</option>)}
              </optgroup>
              <optgroup label="Closed Holes">
                {['H0'].map(h => <option key={h} value={h}>{h} — CLOSED</option>)}
              </optgroup>
            </select>
            <p className="text-xs text-[#4B5563] mt-1">Managed in Admin → Projects</p>
          </div>
          <div>
            <label className={lc}>Crew Count *</label>
            <input type="number" className={ic} placeholder="0" value={crewCount} onChange={e => setCrewCount(e.target.value)} />
          </div>
        </div>
      </div>

      {/* 2. Operation Details */}
      {!isStandby && (
        <div className={sec}>
          <h2 className={`${stc} mb-6`}>Operation Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className={lc}>Drilling Hours *</label><input type="number" step="0.5" className={ic} placeholder="0" value={drillingHours} onChange={e => setDrillingHours(e.target.value)} /></div>
            <div><label className={lc}>Downtime Hours *</label><input type="number" step="0.5" className={ic} placeholder="0" value={downtimeHours} onChange={e => setDowntimeHours(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div><label className={lc}>Meter Start (m) *</label><input type="number" step="0.1" className={ic} placeholder="0" value={meterStart} onChange={e => setMeterStart(e.target.value)} /></div>
            <div><label className={lc}>Meter End (m) *</label><input type="number" step="0.1" className={ic} placeholder="0" value={meterEnd} onChange={e => setMeterEnd(e.target.value)} /></div>
            <div>
              <label className={lc}>Metres Drilled (m)</label>
              <input type="number" className={`${ic} opacity-70 cursor-not-allowed`} value={metersDrilled ? metersDrilled.toFixed(2) : ''} readOnly />
              <p className="text-xs text-[#4B5563] mt-1">Calculated</p>
            </div>
            <div><label className={lc}>Core Recovery (m) *</label><input type="number" step="0.1" className={ic} placeholder="0" value={coreRecovery} onChange={e => setCoreRecovery(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={lc}>Hole / Bit Size *</label>
              <select className={sc} value={holeSize} onChange={e => setHoleSize(e.target.value)}>
                <option value="">Select size...</option>
                {holeSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Formation Type *</label>
              <select className={sc} value={formationType} onChange={e => setFormationType(e.target.value)}>
                <option value="">Select formation...</option>
                {formationTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={lc}>Lithology</label>
              <select className={sc} value={lithology} onChange={e => setLithology(e.target.value)}>
                <option value="">Select lithology...</option>
                {lithologyTypes.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lc}>Engine HMR</label><input type="number" step="0.1" className={ic} placeholder="0" value={engineHmr} onChange={e => setEngineHmr(e.target.value)} /></div>
            <div><label className={lc}>Engine Hours</label><input type="number" step="0.5" className={ic} placeholder="0" value={engineHours} onChange={e => setEngineHours(e.target.value)} /></div>
          </div>

          {/* Hole Closed */}
          <div className="mt-6 pt-6 border-t border-[#1E293B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Hole Closed This Shift?</p>
                <p className="text-xs text-[#64748B] mt-0.5">Enable if this hole was completed and a new hole started in the same shift</p>
              </div>
              <Toggle on={holeClosed} onClick={() => setHoleClosed(!holeClosed)} />
            </div>
            {holeClosed && (
              <div className="mt-4 p-4 rounded-xl bg-[#0D1117] border border-[#3B82F6]/30">
                <p className="text-sm font-semibold text-[#3B82F6] mb-4 flex items-center gap-2"><ChevronDown className="w-4 h-4" /> New Hole Started This Shift</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className={lc}>New Hole Number *</label><input type="text" className={ic} placeholder="e.g. H3" value={newHoleNumber} onChange={e => setNewHoleNumber(e.target.value)} /></div>
                  <div><label className={lc}>Hole / Bit Size</label><select className={sc} value={newHoleSize} onChange={e => setNewHoleSize(e.target.value)}><option value="">Select size...</option>{holeSizes.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-[#111827] rounded-xl border border-[#1E293B] mb-4">
                  <div><p className="text-sm font-medium text-[#F8FAFC]">Started drilling in new hole?</p><p className="text-xs text-[#64748B] mt-0.5">Turn off if hole was opened but no metres drilled yet</p></div>
                  <Toggle on={newHoleDrilled} onClick={() => setNewHoleDrilled(!newHoleDrilled)} />
                </div>
                {newHoleDrilled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div><label className={lc}>Meter Start (m)</label><input type="number" step="0.1" className={ic} placeholder="0" value={newHoleMeterStart} onChange={e => setNewHoleMeterStart(e.target.value)} /></div>
                      <div><label className={lc}>Meter End (m)</label><input type="number" step="0.1" className={ic} placeholder="0" value={newHoleMeterEnd} onChange={e => setNewHoleMeterEnd(e.target.value)} /></div>
                      <div><label className={lc}>Metres Drilled</label><input type="number" className={`${ic} opacity-70 cursor-not-allowed`} value={newHoleMetersDrilled ? newHoleMetersDrilled.toFixed(2) : ''} readOnly /></div>
                      <div><label className={lc}>Formation Type</label><select className={sc} value={newHoleFormation} onChange={e => setNewHoleFormation(e.target.value)}><option value="">Select...</option>{formationTypes.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                    </div>
                    <div><label className={lc}>Lithology</label><select className={sc} value={newHoleLithology} onChange={e => setNewHoleLithology(e.target.value)}><option value="">Select...</option>{lithologyTypes.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Downtime Reasons */}
      <div className={sec}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={stc}>Downtime Reasons</h2>
            {isStandby && <p className="text-xs text-amber-400/80 mt-0.5">Standby mode — all downtime defaulted to Client</p>}
          </div>
          <button onClick={addDowntime} className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="space-y-3">
          {downtimeRows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
              <select className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors" value={row.reason} onChange={e => updateDowntime(row.id, 'reason', e.target.value)}>
                <option value="">Select reason</option>
                {downtimeReasonsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex items-center bg-[#1A2234] rounded-lg p-1 shrink-0">
                <button onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Internal')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Internal' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'} ${isStandby ? 'opacity-40 cursor-not-allowed' : ''}`}>Internal</button>
                <button onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Client')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Client' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}>Client</button>
              </div>
              <input type="number" step="0.5" className="w-28 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0" placeholder="Hours" value={row.hours} onChange={e => updateDowntime(row.id, 'hours', e.target.value)} />
              <button onClick={() => removeDowntime(row.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Consumables */}
      <div className={sec}>
        <h2 className={`${stc} mb-6`}>Consumables</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={lc}>Fuel (L) *</label><input type="number" step="0.1" className={isStandby ? dic : ic} placeholder="0" value={fuel} onChange={e => !isStandby && setFuel(e.target.value)} readOnly={isStandby} /></div>
          <div><label className={lc}>Water (L) *</label><input type="number" step="0.1" className={isStandby ? dic : ic} placeholder="0" value={water} onChange={e => !isStandby && setWater(e.target.value)} readOnly={isStandby} /></div>
          <div><label className={lc}>Additives (kg) *</label><input type="number" step="0.1" className={isStandby ? dic : ic} placeholder="0" value={additives} onChange={e => !isStandby && setAdditives(e.target.value)} readOnly={isStandby} /></div>
        </div>
      </div>

      {/* 5. Parts Used */}
      {!isStandby && (
        <div className={sec}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className={stc}>Parts used</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Only parts issued to{' '}
                <span className="font-mono text-[#94A3B8]">{rig || 'this rig'}</span>{' '}
                from the regular store. If a part is missing, ask the store manager to issue it.
              </p>
            </div>
            {rig && project && anythingOnRig && (
              <button onClick={addPart} className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors"><Plus className="w-4 h-4" /> Add</button>
            )}
          </div>

          {!project || !rig ? (
            <div className="mt-4 p-6 rounded-xl bg-[#0D1117] border border-[#1E293B] text-center">
              <p className="text-sm text-[#64748B]">Choose a project and a rig to see what is on it.</p>
            </div>
          ) : !anythingOnRig ? (
            <div className="mt-4 p-6 rounded-xl bg-[#0D1117] border border-[#1E293B] text-center">
              <p className="text-sm text-[#94A3B8] font-semibold">Nothing issued to {rig} on {projectCode(project)} yet.</p>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Go to <span className="text-[#3B82F6]">Inventory → Regular store</span>, find the part on the shelf,
                and click <span className="text-[#F97316] font-medium">Issue to rig</span> — selecting this rig and project.
                It will then appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {partRows.map((row, index) => {
                const part = partById(row.itemId)
                const opts = available(row.id)
                const onRigEntry = onRig[row.itemId]
                const onRigNow   = part ? Math.max(0, (onRigEntry?.issued ?? 0) - (onRigEntry?.used ?? 0)) : 0
                const metres     = parseFloat(row.metresRun) || 0
                const suggested  = part ? suggestQty(part, metres, onRigNow) : 0
                const qty        = row.qtyTouched ? Math.min(onRigNow, parseFloat(row.qty) || 0) : suggested
                const wornPct    = part && part.lifeMetres > 0 ? Math.min(100, (metres / part.lifeMetres) * 100) : 0
                const unitCost   = qty * (part?.rate ?? 0)

                return (
                  <div key={row.id} className="p-4 rounded-xl bg-[#0D1117] border border-[#1E293B]">
                    {/* Part picker */}
                    <div className="flex items-center gap-3">
                      <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
                      <select
                        className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                        value={row.itemId} onChange={e => pickPart(row.id, e.target.value)}>
                        <option value="">Select a part on this rig</option>
                        {['Bit', 'Rod & Casing', 'Core Barrel', 'Accessory', 'Spares'].map(cat => {
                          const items = opts.filter(i => i.category === cat)
                          if (!items.length) return null
                          return (
                            <optgroup key={cat} label={cat}>
                              {items.map(i => {
                                const e = onRig[i.id]
                                const left = (e?.issued ?? 0) - (e?.used ?? 0)
                                return <option key={i.id} value={i.id}>{i.name} · {i.partNumber} · {left} on the rig</option>
                              })}
                            </optgroup>
                          )
                        })}
                      </select>
                      <button onClick={() => removePart(row.id)} className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {/* Part detail — only shown once a part is picked */}
                    {part && (
                      <div className="mt-4 pt-4 border-t border-[#1E293B]">
                        {/* Life + cost info */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6]">
                            Metres
                          </span>
                          <span className="text-xs text-[#64748B]">
                            One unit lasts{' '}
                            <span className="text-[#94A3B8] font-mono">{part.lifeMetres.toLocaleString('en-IN')} m</span>
                            {' · '}
                            <span className="text-[#94A3B8] font-mono">{perMetre(costPerMetre(part))}</span>
                          </span>
                          <span className="text-xs text-[#64748B] ml-auto">{onRigNow} on the rig</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Reason for replacement */}
                          <div>
                            <label className={lc}>Reason for replacement</label>
                            <input
                              type="text"
                              className={ic}
                              placeholder="e.g. Worn out, damaged crown..."
                              value={row.reason}
                              onChange={e => updatePart(row.id, { reason: e.target.value })}
                            />
                          </div>
                          {/* Metres run */}
                          <div>
                            <label className={lc}>Metres run this shift</label>
                            <input
                              type="number" step="0.1" min="0"
                              className={ic}
                              placeholder="0"
                              value={row.metresRun}
                              onChange={e => updatePart(row.id, { metresRun: e.target.value })}
                            />
                            {shiftMetres > 0 && (
                              <p className="text-xs text-[#4B5563] mt-1">Shift drilled {shiftMetres.toFixed(2)} m</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Units used up */}
                          <div>
                            <label className={lc}>Units used up</label>
                            <input
                              type="number" min="0" max={onRigNow}
                              className={ic}
                              placeholder="0"
                              value={row.qtyTouched ? row.qty : String(suggested)}
                              onChange={e => updatePart(row.id, { qty: e.target.value, qtyTouched: true })}
                            />
                            <p className="text-xs text-[#4B5563] mt-1">
                              {row.qtyTouched
                                ? <button onClick={() => updatePart(row.id, { qty: '', qtyTouched: false })} className="text-[#3B82F6] hover:underline">back to suggested {suggested}</button>
                                : `Suggested from wear`}
                            </p>
                          </div>

                          {/* Scrapped value */}
                          <div>
                            <label className={lc}>Scrapped value</label>
                            <div className="px-4 py-3 bg-[#111827] border border-dashed border-[#1E293B] rounded-xl font-mono text-[#F59E0B] font-semibold">
                              {unitCost > 0 ? money(unitCost) : '—'}
                            </div>
                            <p className="text-xs text-[#4B5563] mt-1">Units gone × rate</p>
                          </div>

                          {/* Wear cost */}
                          <div>
                            <label className={lc}>Wear this shift</label>
                            <div className="px-4 py-3 bg-[#111827] border border-dashed border-[#1E293B] rounded-xl font-mono text-[#94A3B8]">
                              {metres > 0 && part ? money(metres * costPerMetre(part)) : '—'}
                            </div>
                            <p className="text-xs text-[#4B5563] mt-1">Metres × cost per metre</p>
                          </div>
                        </div>

                        {/* Wear bar */}
                        {metres > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-[#64748B]">This unit after {metres.toFixed(1)} m</span>
                              <span className="font-mono text-[#94A3B8]">{wornPct.toFixed(0)}% of one life</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-200"
                                style={{
                                  width: `${Math.min(100, wornPct)}%`,
                                  background: wornPct > 85 ? '#EF4444' : wornPct > 60 ? '#F59E0B' : '#10B981',
                                }} />
                            </div>
                            {qty > 0 && (
                              <p className="text-xs text-[#F59E0B] mt-2">
                                {qty} unit{qty === 1 ? '' : 's'} used up this shift — {onRigNow - qty} left on the rig.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {partsTotal > 0 && (
                <div className="flex justify-end gap-3 pt-2 pr-12 text-sm">
                  <span className="text-[#64748B]">Parts used up this shift</span>
                  <span className="font-semibold text-[#F59E0B] font-mono">{money(partsTotal)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Incidents */}
      <div className={sec}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={stc}>Incidents</h2>
          <button onClick={addIncident} className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="space-y-3">
          {incidents.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-xl border border-[#1E293B]">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
              <select className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors" value={row.type} onChange={e => updateIncident(row.id, 'type', e.target.value)}>
                <option value="">Incident type</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors" value={row.severity} onChange={e => updateIncident(row.id, 'severity', e.target.value)}>
                <option value="">Severity (optional)</option>
                {severityTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Description" className="flex-[2] px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors" value={row.description} onChange={e => updateIncident(row.id, 'description', e.target.value)} />
              <button onClick={() => removeIncident(row.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Attachments */}
        <div className="mt-6 pt-6 border-t border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Paperclip className="w-4 h-4" />
              <span className="text-sm font-medium text-[#F8FAFC]">Attachments</span>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-[#1A2234] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-sm cursor-pointer hover:bg-[#1E293B] transition-colors">
              <Plus className="w-4 h-4" /> Add Files
              <input type="file" multiple className="hidden" onChange={e => setAttachments(prev => [...prev, ...Array.from(e.target.files || [])])} />
            </label>
          </div>
          {attachments.length === 0
            ? <p className="text-[#4B5563] text-sm mt-3">No attachments added.</p>
            : (
              <div className="mt-3 space-y-2">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#0D1117] rounded-lg border border-[#1E293B]">
                    <span className="text-[#94A3B8] text-sm">{f.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-4 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors text-base font-semibold">
          <Save className="w-5 h-5" /> Submit Log
        </button>
      </div>
    </div>
  )
}
