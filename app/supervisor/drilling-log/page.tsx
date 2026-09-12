'use client'

import { useState, useMemo } from 'react'
import { Save, Plus, Trash2, Paperclip, AlertTriangle, ChevronDown } from 'lucide-react'
import {
  useInventory, money, perMetre, projectCode, normFormation,
  WEAR_BASIS_LABEL, costPerMetre, costPerDay,
  PROJECTS, RIGS,
  type Part, type Formation,
} from '../../../lib/inventory-store'
import { useCostingOptional } from '../../../lib/costing-store'

/* ==========================================================================
 * DAILY DRILLING LOG
 *
 * One shift, one form. Everything measurable is recorded here and nowhere
 * else — costing and inventory read it, they never ask for it again.
 *
 * Parts used works off what the store actually issued to this rig. The driller
 * cannot log a part the store never sent out, because the two records would
 * then disagree and there would be no way to tell which one was wrong. If a
 * part is missing from the list, the storeman issues it and it appears.
 *
 * Wear is carried as a fraction of a life rather than as raw metres, so seven
 * metres of very hard ground uses up more of a bit than seven metres of soft,
 * and the two still add up correctly across a month.
 * ========================================================================== */

const mockData = {
  drillers: ['Mike Johnson', 'David Chen', 'Robert Williams', 'James Brown'],
  supervisors: ['John Smith', 'Sarah Davis', 'Michael Wilson'],
}

const holeSizes = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"']
const formationTypes = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Very Hard Formation']
const lithologyTypes = ['Sandstone', 'Limestone', 'Granite', 'Basalt', 'Shale', 'Quartzite', 'Dolerite', 'Others']
const downtimeReasonsList = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault', 'Bit Change',
  'Rod Change', 'Casing Installation', 'Water Shortage', 'Fuel Shortage',
  'Operator Delay', 'Shift Change Delay', 'Ground Condition Issue',
  'Site Access Issue', 'Safety Hold', 'Weather Condition',
  'Waiting for Instruction', 'Others',
]
const incidentTypes = ['Injury', 'Near Miss', 'Equipment Damage', 'Safety Violation', 'Environmental', 'Others']
const severityTypes = ['Minor', 'Major', 'Critical']
const shifts = ['Day', 'Night']

interface DowntimeRow { id: string; reason: string; type: 'Internal' | 'Client'; hours: string }
interface PartRow { id: string; itemId: string; amount: string; qty: string; qtyTouched: boolean }
interface IncidentRow { id: string; type: string; severity: string; description: string }

const inputClass = "w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors"
const selectClass = "w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
const labelClass = "block text-sm text-[#94A3B8] mb-2"
const sectionClass = "p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
const sectionTitleClass = "text-lg font-bold text-[#F8FAFC]"
const disabledInputClass = "w-full px-4 py-3 bg-[#0D1117]/50 border border-[#1E293B]/50 rounded-xl text-[#4B5563] placeholder-[#2D3748] cursor-not-allowed"

let rowSeq = 0
const rowId = () => `r${Date.now()}_${++rowSeq}`

/* The life of one unit, in whatever the part is measured in. Terrain parts are
 * read against the ground this shift is drilling, which is what makes the same
 * bit worth more metres in soft rock than in very hard. */
function lifeOf(part: Part, formation: Formation): { value: number; unit: 'm' | 'days' } {
  if (part.wearBasis === 'days') return { value: part.lifeDays, unit: 'days' }
  if (part.wearBasis === 'metres') return { value: part.lifeMetres, unit: 'm' }
  return { value: part.life[formation], unit: 'm' }
}

export default function DrillingLogPage() {
  const { state: inv } = useInventory()
  /* Optional on purpose: the log still works without the costing provider
   * mounted, it just cannot show how worn a part already was. */
  const costing = useCostingOptional()
  const catalogue = inv.catalogue.filter(i => i.active)
  const partById = (id: string) => catalogue.find(i => i.id === id)

  const [shiftMode, setShiftMode] = useState<10 | 12>(12)
  const [isStandby, setIsStandby] = useState(false)

  // Basic shift details
  const [project, setProject] = useState('')
  const [rig, setRig] = useState('')
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().slice(0, 10))
  const [shift, setShift] = useState('')
  const [supervisor, setSupervisor] = useState('')
  const [driller, setDriller] = useState('')
  const [holeNumber, setHoleNumber] = useState('')
  const [crewCount, setCrewCount] = useState('0')

  // Hole closed / new hole
  const [holeClosed, setHoleClosed] = useState(false)
  const [newHoleDrilled, setNewHoleDrilled] = useState(false)
  const [newHoleNumber, setNewHoleNumber] = useState('')
  const [newHoleMeterStart, setNewHoleMeterStart] = useState('')
  const [newHoleMeterEnd, setNewHoleMeterEnd] = useState('')
  const [newHoleSize, setNewHoleSize] = useState('')
  const [newHoleFormation, setNewHoleFormation] = useState('')
  const [newHoleLithology, setNewHoleLithology] = useState('')

  // Operation details
  const [drillingHours, setDrillingHours] = useState('')
  const [downtimeHours, setDowntimeHours] = useState('')
  const [meterStart, setMeterStart] = useState('')
  const [meterEnd, setMeterEnd] = useState('')
  const [coreRecovery, setCoreRecovery] = useState('')
  const [holeSize, setHoleSize] = useState('')
  const [formationType, setFormationType] = useState('')
  const [lithology, setLithology] = useState('')
  const [engineHmr, setEngineHmr] = useState('')
  const [engineHours, setEngineHours] = useState('')

  const metersDrilled = meterStart && meterEnd
    ? Math.max(0, parseFloat(meterEnd) - parseFloat(meterStart)) : 0
  const newHoleMetersDrilled = newHoleMeterStart && newHoleMeterEnd
    ? Math.max(0, parseFloat(newHoleMeterEnd) - parseFloat(newHoleMeterStart)) : 0
  const shiftMetres = metersDrilled + (holeClosed && newHoleDrilled ? newHoleMetersDrilled : 0)

  // The ground this shift is drilling, used to read the life of terrain parts.
  const formation: Formation = normFormation(formationType || 'Hard')

  const [downtimeRows, setDowntimeRows] = useState<DowntimeRow[]>([
    { id: rowId(), reason: '', type: 'Internal', hours: '' },
  ])
  const [fuel, setFuel] = useState('')
  const [water, setWater] = useState('')
  const [additives, setAdditives] = useState('')
  const [partRows, setPartRows] = useState<PartRow[]>([{ id: rowId(), itemId: '', amount: '', qty: '', qtyTouched: false }])
  const [incidents, setIncidents] = useState<IncidentRow[]>([
    { id: rowId(), type: '', severity: '', description: '' },
  ])
  const [attachments, setAttachments] = useState<File[]>([])

  /* ── WHAT IS ON THIS RIG ────────────────────────────────────────────────
   * Issued to it by the store, less what previous shifts have already used
   * up. Wear carries across shifts as a fraction of a life, so a bit that is
   * 62% gone stays 62% gone when the next shift picks it up. */
  const onRig = useMemo(() => {
    const out: Record<string, { issued: number; consumed: number; lifeUsed: number }> = {}
    if (!rig || !project) return out

    inv.pos.forEach(po => po.issues
      .filter(i => i.rig === rig && i.project === project)
      .forEach(i => i.lines.forEach(l => {
        const e = out[l.itemId] ??= { issued: 0, consumed: 0, lifeUsed: 0 }
        e.issued += l.qty
      })))

    ;(costing?.state.shiftLogs ?? [])
      .filter(l => l.rig === rig && l.project === project)
      .forEach(l => {
        const f = normFormation(l.formationType)
        ;(l.partsUsed ?? []).forEach(u => {
          const part = partById(u.itemId)
          if (!part) return
          const e = out[u.itemId] ??= { issued: 0, consumed: 0, lifeUsed: 0 }
          e.consumed += u.qty ?? 0
          const life = lifeOf(part, f).value
          const amount = part.wearBasis === 'days' ? (u.days ?? 0) : (u.metres ?? 0)
          // A log written before wear was recorded only says how many units
          // went, so one unit counts as one whole life.
          e.lifeUsed += amount > 0 && life > 0 ? amount / life : (u.qty ?? 0)
        })
      })

    return out
  }, [inv.pos, inv.catalogue, costing?.state.shiftLogs, rig, project])

  /* What the driller can choose from: still on the rig, and not already on
   * another row of this form. */
  const available = (currentRow: string) => catalogue.filter(p => {
    const e = onRig[p.id]
    if (!e || e.issued - e.consumed <= 0) return false
    return !partRows.some(r => r.id !== currentRow && r.itemId === p.id)
  })
  const anythingOnRig = Object.values(onRig).some(e => e.issued - e.consumed > 0)

  /* Everything one row needs to know, in one place. */
  const readRow = (row: PartRow) => {
    const part = partById(row.itemId)
    if (!part) return null
    const e = onRig[row.itemId] ?? { issued: 0, consumed: 0, lifeUsed: 0 }
    const left = Math.max(0, e.issued - e.consumed)
    const { value: life, unit } = lifeOf(part, formation)

    // How far into the current unit the rig already was. Negative would mean a
    // unit was scrapped before it wore out, which leaves a fresh one.
    const priorFraction = Math.max(0, Math.min(1, e.lifeUsed - e.consumed))
    const amount = parseFloat(row.amount) || 0
    const thisShift = life > 0 ? amount / life : 0
    const suggestedQty = Math.min(left, Math.floor(priorFraction + thisShift))
    const qty = row.qtyTouched ? Math.min(left, parseFloat(row.qty) || 0) : suggestedQty

    // Where the current unit sits after this shift, once whole units are gone.
    const after = priorFraction + thisShift - qty
    const worn = Math.max(0, Math.min(1, after))
    const rate = part.wearBasis === 'days' ? costPerDay(part) : costPerMetre(part, formation)

    return {
      part, left, life, unit, priorFraction, amount, qty, suggestedQty, worn,
      remaining: Math.max(0, life * (1 - worn)),
      wearCost: amount * rate,
      unitCost: qty * part.rate,
    }
  }

  const partsTotal = partRows.reduce((s, r) => s + (readRow(r)?.unitCost ?? 0), 0)

  const handleStandbyToggle = (val: boolean) => {
    setIsStandby(val)
    setDowntimeRows([{ id: rowId(), reason: '', type: val ? 'Client' : 'Internal', hours: '' }])
    if (val) setPartRows([{ id: rowId(), itemId: '', amount: '', qty: '', qtyTouched: false }])
  }

  const addDowntime = () => setDowntimeRows(r => [...r, { id: rowId(), reason: '', type: isStandby ? 'Client' : 'Internal', hours: '' }])
  const removeDowntime = (id: string) => setDowntimeRows(r => r.filter(x => x.id !== id))
  const updateDowntime = (id: string, field: keyof DowntimeRow, value: string) =>
    setDowntimeRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  const addPart = () => setPartRows(r => [...r, { id: rowId(), itemId: '', amount: '', qty: '', qtyTouched: false }])
  const removePart = (id: string) => setPartRows(r => r.filter(x => x.id !== id))
  const updatePart = (id: string, patch: Partial<PartRow>) =>
    setPartRows(r => r.map(x => x.id === id ? { ...x, ...patch } : x))

  /* Picking a part pre-fills the metres, because a part in the hole runs every
   * metre the shift drills. The driller only touches it when something went in
   * or came out part way through. */
  const pickPart = (id: string, itemId: string) => {
    const part = partById(itemId)
    updatePart(id, {
      itemId,
      amount: !part ? '' : part.wearBasis === 'days' ? '1' : (shiftMetres > 0 ? String(shiftMetres) : ''),
      qty: '', qtyTouched: false,
    })
  }

  const addIncident = () => setIncidents(r => [...r, { id: rowId(), type: '', severity: '', description: '' }])
  const removeIncident = (id: string) => setIncidents(r => r.filter(x => x.id !== id))
  const updateIncident = (id: string, field: keyof IncidentRow, value: string) =>
    setIncidents(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  const handleSubmit = () => {
    // The shape costing reads. Nothing is persisted yet — wire this to the
    // costing store when the log is ready to write.
    const partsUsed = partRows.map(r => {
      const read = readRow(r)
      if (!read || read.amount <= 0) return null
      return {
        itemId: r.itemId,
        ...(read.part.wearBasis === 'days' ? { days: read.amount } : { metres: read.amount }),
        qty: read.qty,
      }
    }).filter(Boolean)
    console.log('drilling log', { project, rig, shiftDate, shift, partsUsed })
    alert('Drilling log submitted successfully!')
  }

  return (
    <div className="space-y-6 pb-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Daily Drilling Log</h1>
          <p className="text-[#94A3B8] mt-1 text-sm">Record shift details, performance metrics and resource consumption</p>
        </div>
        <button onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors font-medium">
          <Save className="w-4 h-4" />
          Submit Log
        </button>
      </div>

      {/* ── STANDBY MODE ── */}
      <div className={`rounded-2xl border p-4 transition-all ${isStandby ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#111827] border-[#1E293B]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${isStandby ? 'text-amber-400' : 'text-[#64748B]'}`} />
            <div>
              <p className={`font-semibold text-sm ${isStandby ? 'text-amber-300' : 'text-[#F8FAFC]'}`}>Standby Mode</p>
              <p className="text-xs text-[#64748B] mt-0.5">Enable if operations are on hold — drilling and parts are hidden and downtime is set to Client</p>
            </div>
          </div>
          <button onClick={() => handleStandbyToggle(!isStandby)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${isStandby ? 'bg-amber-500' : 'bg-[#1E293B]'}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isStandby ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {isStandby && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <p className="text-xs text-amber-300/70">
              Nothing wears on a standby day, so Parts used is hidden. Downtime is pre-set to{' '}
              <span className="font-semibold text-amber-300">Client</span> — add the standby reason and hours there.
            </p>
          </div>
        )}
      </div>

      {/* ── 1. BASIC SHIFT DETAILS ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={sectionTitleClass}>Basic Shift Details</h2>
          <div className="flex items-center gap-1 bg-[#1A2234] rounded-lg p-1">
            {[10, 12].map(h => (
              <button key={h} onClick={() => setShiftMode(h as 10 | 12)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${shiftMode === h ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}>
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Project *</label>
            <select className={selectClass} value={project}
              onChange={e => { setProject(e.target.value); setPartRows([{ id: rowId(), itemId: '', amount: '', qty: '', qtyTouched: false }]) }}>
              <option value="">Select project...</option>
              {PROJECTS.map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rig *</label>
            <select className={selectClass} value={rig} disabled={!project}
              onChange={e => { setRig(e.target.value); setPartRows([{ id: rowId(), itemId: '', amount: '', qty: '', qtyTouched: false }]) }}>
              <option value="">{project ? 'Select rig...' : 'Select a project first'}</option>
              {RIGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Shift Date *</label>
            <input type="date" className={inputClass} style={{ colorScheme: 'dark' }}
              value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Shift *</label>
            <select className={selectClass} value={shift} onChange={e => setShift(e.target.value)}>
              <option value="">Select shift...</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Supervisor *</label>
            <select className={selectClass} value={supervisor} onChange={e => setSupervisor(e.target.value)}>
              <option value="">Select supervisor...</option>
              {mockData.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Driller *</label>
            <select className={selectClass} value={driller} onChange={e => setDriller(e.target.value)}>
              <option value="">Select driller...</option>
              {mockData.drillers.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hole Number *</label>
            <select className={selectClass} value={holeNumber} onChange={e => setHoleNumber(e.target.value)}>
              <option value="">Select hole number...</option>
              <optgroup label="Open Holes">
                {['H1', 'H2', 'H3', 'BH-001', 'BH-002'].map(h => <option key={h} value={h}>{h} — OPEN</option>)}
              </optgroup>
              <optgroup label="Closed Holes">
                {['H0'].map(h => <option key={h} value={h}>{h} — CLOSED</option>)}
              </optgroup>
            </select>
            <p className="text-xs text-[#4B5563] mt-1">Holes are managed in Admin → Projects → Manage Resources</p>
          </div>
          <div>
            <label className={labelClass}>Crew Count *</label>
            <input type="number" className={inputClass} placeholder="0"
              value={crewCount} onChange={e => setCrewCount(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── 2. OPERATION DETAILS ── */}
      {!isStandby && (
        <div className={sectionClass}>
          <h2 className={`${sectionTitleClass} mb-6`}>Operation Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Drilling Hours *</label>
              <input type="number" step="0.5" className={inputClass} placeholder="0"
                value={drillingHours} onChange={e => setDrillingHours(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Downtime Hours *</label>
              <input type="number" step="0.5" className={inputClass} placeholder="0"
                value={downtimeHours} onChange={e => setDowntimeHours(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className={labelClass}>Meter Start (m) *</label>
              <input type="number" step="0.1" className={inputClass} placeholder="0"
                value={meterStart} onChange={e => setMeterStart(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Meter End (m) *</label>
              <input type="number" step="0.1" className={inputClass} placeholder="0"
                value={meterEnd} onChange={e => setMeterEnd(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Meters Drilled (m) *</label>
              <input type="number" className={`${inputClass} opacity-70 cursor-not-allowed`} placeholder="0"
                value={metersDrilled ? metersDrilled.toFixed(2) : ''} readOnly />
              <p className="text-xs text-[#4B5563] mt-1">Calculated from start/end</p>
            </div>
            <div>
              <label className={labelClass}>Core Recovery (m) *</label>
              <input type="number" step="0.1" className={inputClass} placeholder="0"
                value={coreRecovery} onChange={e => setCoreRecovery(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelClass}>Hole / Bit Size *</label>
              <select className={selectClass} value={holeSize} onChange={e => setHoleSize(e.target.value)}>
                <option value="">Select size...</option>
                {holeSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Formation Type *</label>
              <select className={selectClass} value={formationType} onChange={e => setFormationType(e.target.value)}>
                <option value="">Select formation...</option>
                {formationTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p className="text-xs text-[#4B5563] mt-1">Sets how fast parts wear this shift</p>
            </div>
            <div>
              <label className={labelClass}>Lithology Types</label>
              <select className={selectClass} value={lithology} onChange={e => setLithology(e.target.value)}>
                <option value="">Select lithology...</option>
                {lithologyTypes.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Engine HMR</label>
              <input type="number" step="0.1" className={inputClass} placeholder="0"
                value={engineHmr} onChange={e => setEngineHmr(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Engine Hours</label>
              <input type="number" step="0.5" className={inputClass} placeholder="0"
                value={engineHours} onChange={e => setEngineHours(e.target.value)} />
            </div>
          </div>

          {/* ── HOLE CLOSED ── */}
          <div className="mt-6 pt-6 border-t border-[#1E293B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Hole Closed This Shift?</p>
                <p className="text-xs text-[#64748B] mt-0.5">Enable if this hole was completed and a new hole was started in the same shift</p>
              </div>
              <button onClick={() => setHoleClosed(!holeClosed)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${holeClosed ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${holeClosed ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {holeClosed && (
              <div className="mt-4 p-4 rounded-xl bg-[#0D1117] border border-[#3B82F6]/30">
                <p className="text-sm font-semibold text-[#3B82F6] mb-4 flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" /> New Hole Started This Shift
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>New Hole Number *</label>
                    <input type="text" className={inputClass} placeholder="e.g. H3"
                      value={newHoleNumber} onChange={e => setNewHoleNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Hole / Bit Size</label>
                    <select className={selectClass} value={newHoleSize} onChange={e => setNewHoleSize(e.target.value)}>
                      <option value="">Select size...</option>
                      {holeSizes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-[#111827] rounded-xl border border-[#1E293B] mb-4">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Started drilling in new hole?</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Turn off if new hole was opened but no meters drilled yet</p>
                  </div>
                  <button onClick={() => setNewHoleDrilled(!newHoleDrilled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${newHoleDrilled ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${newHoleDrilled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {newHoleDrilled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>Meter Start (m)</label>
                        <input type="number" step="0.1" className={inputClass} placeholder="0"
                          value={newHoleMeterStart} onChange={e => setNewHoleMeterStart(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Meter End (m)</label>
                        <input type="number" step="0.1" className={inputClass} placeholder="0"
                          value={newHoleMeterEnd} onChange={e => setNewHoleMeterEnd(e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Meters Drilled (m)</label>
                        <input type="number" className={`${inputClass} opacity-70 cursor-not-allowed`} placeholder="0"
                          value={newHoleMetersDrilled ? newHoleMetersDrilled.toFixed(2) : ''} readOnly />
                        <p className="text-xs text-[#4B5563] mt-1">Calculated from start/end</p>
                      </div>
                      <div>
                        <label className={labelClass}>Formation Type</label>
                        <select className={selectClass} value={newHoleFormation} onChange={e => setNewHoleFormation(e.target.value)}>
                          <option value="">Select formation...</option>
                          {formationTypes.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Lithology</label>
                      <select className={selectClass} value={newHoleLithology} onChange={e => setNewHoleLithology(e.target.value)}>
                        <option value="">Select lithology...</option>
                        {lithologyTypes.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. DOWNTIME REASONS ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={sectionTitleClass}>Downtime Reasons</h2>
            {isStandby && <p className="text-xs text-amber-400/80 mt-0.5">Standby mode — all downtime defaulted to Client</p>}
          </div>
          <button onClick={addDowntime}
            className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {downtimeRows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
              <select
                className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                value={row.reason} onChange={e => updateDowntime(row.id, 'reason', e.target.value)}>
                <option value="">Select reason</option>
                {downtimeReasonsList.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex items-center bg-[#1A2234] rounded-lg p-1 shrink-0">
                <button onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Internal')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Internal' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'} ${isStandby ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  Internal
                </button>
                <button onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Client')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Client' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}>
                  Client
                </button>
              </div>
              <input type="number" step="0.5" placeholder="Hours"
                className="w-28 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0"
                value={row.hours} onChange={e => updateDowntime(row.id, 'hours', e.target.value)} />
              <button onClick={() => removeDowntime(row.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. CONSUMABLES ── */}
      <div className={sectionClass}>
        <h2 className={`${sectionTitleClass} mb-6`}>Consumables</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Fuel (L) *</label>
            <input type="number" step="0.1" className={isStandby ? disabledInputClass : inputClass} placeholder="0"
              value={fuel} onChange={e => !isStandby && setFuel(e.target.value)} readOnly={isStandby} />
          </div>
          <div>
            <label className={labelClass}>Water (L) *</label>
            <input type="number" step="0.1" className={isStandby ? disabledInputClass : inputClass} placeholder="0"
              value={water} onChange={e => !isStandby && setWater(e.target.value)} readOnly={isStandby} />
          </div>
          <div>
            <label className={labelClass}>Additives (kg) *</label>
            <input type="number" step="0.1" className={isStandby ? disabledInputClass : inputClass} placeholder="0"
              value={additives} onChange={e => !isStandby && setAdditives(e.target.value)} readOnly={isStandby} />
          </div>
        </div>
      </div>

      {/* ── 5. PARTS USED ── */}
      {!isStandby && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className={sectionTitleClass}>Parts used</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Only what the store has issued to {rig ? <span className="font-mono text-[#94A3B8]">{rig}</span> : 'this rig'}.
                Ask the store to issue anything missing, then log it here.
              </p>
            </div>
            {rig && project && anythingOnRig && (
              <button onClick={addPart}
                className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
          </div>

          {!project || !rig ? (
            <div className="mt-4 p-6 rounded-xl bg-[#0D1117] border border-[#1E293B] text-center">
              <p className="text-sm text-[#64748B]">Choose a project and a rig to see what is on it.</p>
            </div>
          ) : !anythingOnRig ? (
            <div className="mt-4 p-6 rounded-xl bg-[#0D1117] border border-[#1E293B] text-center">
              <p className="text-sm text-[#94A3B8]">Nothing is currently issued to {rig} on {projectCode(project)}.</p>
              <p className="text-xs text-[#64748B] mt-1">
                The store issues parts from Inventory → Store. Once they do, the parts appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {partRows.map((row, index) => {
                const read = readRow(row)
                const options = available(row.id)

                return (
                  <div key={row.id} className="p-4 rounded-xl bg-[#0D1117] border border-[#1E293B]">
                    <div className="flex items-center gap-3">
                      <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
                      <select
                        className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                        value={row.itemId} onChange={e => pickPart(row.id, e.target.value)}>
                        <option value="">Select a part on this rig</option>
                        {['Bit', 'Rod & Casing', 'Core Barrel', 'Accessory', 'Spares'].map(cat => {
                          const items = options.filter(i => i.category === cat)
                          if (!items.length) return null
                          return (
                            <optgroup key={cat} label={cat}>
                              {items.map(i => {
                                const e = onRig[i.id]
                                return (
                                  <option key={i.id} value={i.id}>
                                    {i.name} · {i.partNumber} · {e.issued - e.consumed} on the rig
                                  </option>
                                )
                              })}
                            </optgroup>
                          )
                        })}
                      </select>
                      <button onClick={() => removePart(row.id)}
                        className="p-2 text-[#64748B] hover:text-[#EF4444] hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {read && (
                      <div className="mt-4 pt-4 border-t border-[#1E293B]">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6]">
                            {WEAR_BASIS_LABEL[read.part.wearBasis]}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            One unit lasts <span className="text-[#94A3B8] font-mono">{read.life.toLocaleString('en-IN')} {read.unit}</span>
                            {read.part.wearBasis === 'terrain' && formationType && ` in ${formationType.toLowerCase()}`}
                            {' · '}
                            <span className="text-[#94A3B8] font-mono">
                              {read.part.wearBasis === 'days'
                                ? `${money(costPerDay(read.part))}/day`
                                : perMetre(costPerMetre(read.part, formation))}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className={labelClass}>
                              {read.part.wearBasis === 'days' ? 'Days used' : 'Metres run'}
                            </label>
                            <input type="number" step="0.1" min="0" className={inputClass} placeholder="0"
                              value={row.amount}
                              onChange={e => updatePart(row.id, { amount: e.target.value })} />
                            {read.part.wearBasis !== 'days' && shiftMetres > 0 && (
                              <p className="text-xs text-[#4B5563] mt-1">Shift drilled {shiftMetres.toFixed(2)} m</p>
                            )}
                          </div>

                          <div>
                            <label className={labelClass}>Units used up</label>
                            <input type="number" min="0" max={read.left} className={inputClass} placeholder="0"
                              value={row.qtyTouched ? row.qty : String(read.suggestedQty)}
                              onChange={e => updatePart(row.id, { qty: e.target.value, qtyTouched: true })} />
                            <p className="text-xs text-[#4B5563] mt-1">
                              {row.qtyTouched
                                ? <button onClick={() => updatePart(row.id, { qty: '', qtyTouched: false })}
                                    className="text-[#3B82F6] hover:underline">back to suggested {read.suggestedQty}</button>
                                : `Suggested from wear · ${read.left} on the rig`}
                            </p>
                          </div>

                          <div>
                            <label className={labelClass}>Scrapped value</label>
                            <div className="px-4 py-3 bg-[#111827] border border-dashed border-[#1E293B] rounded-xl font-mono text-[#F59E0B] font-semibold">
                              {read.unitCost > 0 ? money(read.unitCost) : '—'}
                            </div>
                            <p className="text-xs text-[#4B5563] mt-1">Units gone × rate</p>
                          </div>

                          <div>
                            <label className={labelClass}>Wear this shift</label>
                            <div className="px-4 py-3 bg-[#111827] border border-dashed border-[#1E293B] rounded-xl font-mono text-[#94A3B8]">
                              {read.wearCost > 0 ? money(read.wearCost) : '—'}
                            </div>
                            <p className="text-xs text-[#4B5563] mt-1">What the ground took out of it</p>
                          </div>
                        </div>

                        {/* How far through the current unit the rig is */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-[#64748B]">
                              Current unit after this shift
                              {read.priorFraction > 0 && (
                                <span className="text-[#4B5563]"> · started at {Math.round(read.priorFraction * 100)}%</span>
                              )}
                            </span>
                            <span className="font-mono text-[#94A3B8]">
                              {Math.round(read.worn * 100)}% worn · {read.remaining.toFixed(read.unit === 'days' ? 0 : 1)} {read.unit} left
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#1E293B] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-200"
                              style={{
                                width: `${Math.round(read.worn * 100)}%`,
                                background: read.worn > 0.85 ? '#EF4444' : read.worn > 0.6 ? '#F59E0B' : '#10B981',
                              }} />
                          </div>
                          {read.qty > 0 && (
                            <p className="text-xs text-[#F59E0B] mt-2">
                              {read.qty} unit{read.qty === 1 ? '' : 's'} used up this shift — {read.left - read.qty} left on the rig.
                            </p>
                          )}
                        </div>
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

      {/* ── 6. INCIDENTS ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionTitleClass}>Incidents</h2>
          <button onClick={addIncident}
            className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {incidents.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-xl border border-[#1E293B]">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
              <select
                className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                value={row.type} onChange={e => updateIncident(row.id, 'type', e.target.value)}>
                <option value="">Incident type</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                value={row.severity} onChange={e => updateIncident(row.id, 'severity', e.target.value)}>
                <option value="">Severity (optional)</option>
                {severityTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Description"
                className="flex-[2] px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors"
                value={row.description} onChange={e => updateIncident(row.id, 'description', e.target.value)} />
              <button onClick={() => removeIncident(row.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
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
              <Plus className="w-4 h-4" />
              Add Files
              <input type="file" multiple className="hidden"
                onChange={e => setAttachments(prev => [...prev, ...Array.from(e.target.files || [])])} />
            </label>
          </div>
          {attachments.length === 0 ? (
            <p className="text-[#4B5563] text-sm mt-3">No attachments added.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {attachments.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#0D1117] rounded-lg border border-[#1E293B]">
                  <span className="text-[#94A3B8] text-sm">{f.name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit}
          className="flex items-center gap-2 px-8 py-4 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors text-base font-semibold">
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

    </div>
  )
}
