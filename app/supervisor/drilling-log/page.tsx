'use client'

import { useState } from 'react'
import { Save, Plus, Trash2, Paperclip, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

// Mock data
const mockData = {
  projects: ['PRJ-001 - Gold Mine Project A', 'PRJ-002 - Copper Exploration Site', 'PRJ-003 - Diamond Drilling'],
  rigs: ['RIG-001 - Drill Rig Alpha', 'RIG-002 - Drill Rig Beta', 'RIG-003 - Drill Rig Gamma'],
  drillers: ['Mike Johnson', 'David Chen', 'Robert Williams', 'James Brown'],
  supervisors: ['John Smith', 'Sarah Davis', 'Michael Wilson'],
  bits: ['BIT-001 - NQ Core Bit', 'BIT-002 - HQ Core Bit', 'BIT-003 - PQ Core Bit', 'BIT-004 - 6" Tricone'],
}

const holeSizes = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"']
const formationTypes = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Mixed']
const lithologyTypes = ['Sandstone', 'Limestone', 'Granite', 'Basalt', 'Shale', 'Quartzite', 'Dolerite', 'Others']
const downtimeReasonsList = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault', 'Bit Change',
  'Rod Change', 'Casing Installation', 'Water Shortage', 'Fuel Shortage',
  'Operator Delay', 'Shift Change Delay', 'Ground Condition Issue',
  'Site Access Issue', 'Safety Hold', 'Weather Condition',
  'Waiting for Instruction', 'Others'
]
const standbyReasons = [
  'Geologist Standby', 'Client Request', 'Survey in Progress',
  'Waiting for Casing', 'Waiting for Equipment', 'Weather Condition', 'Others'
]
const accessoriesList = [
  'Adaptor Sub', 'Air Hose', 'Casing', 'Core Barrel', 'Core Lifter',
  'Core Lifter Case', 'Coupling', 'DTH Hammer', 'Drill Pipe', 'Inner Tube',
  'Liner', 'O-Rings', 'Outer Tube', 'Reaming Shell', 'Shock Sub', 'Stabilizer', 'Others'
]
const incidentTypes = ['Injury', 'Near Miss', 'Equipment Damage', 'Safety Violation', 'Environmental', 'Others']
const severityTypes = ['Minor', 'Major', 'Critical']
const shifts = ['Day', 'Night']

interface DowntimeRow { id: string; reason: string; type: 'Internal' | 'Client'; hours: string }
interface BitRow { id: string; serialNo: string; bitId: string; meterStart: string; meterEnd: string; status: 'In Use' | 'Changed' }
interface AccessoryRow { id: string; name: string; quantity: string }
interface IncidentRow { id: string; type: string; severity: string; description: string }

const inputClass = "w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors"
const selectClass = "w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
const labelClass = "block text-sm text-[#94A3B8] mb-2"
const sectionClass = "p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
const sectionTitleClass = "text-lg font-bold text-[#F8FAFC]"
const disabledInputClass = "w-full px-4 py-3 bg-[#0D1117]/50 border border-[#1E293B]/50 rounded-xl text-[#4B5563] placeholder-[#2D3748] cursor-not-allowed"
const disabledSelectClass = "w-full px-4 py-3 bg-[#0D1117]/50 border border-[#1E293B]/50 rounded-xl text-[#4B5563] appearance-none cursor-not-allowed"

export default function DrillingLogPage() {
  const [shiftMode, setShiftMode] = useState<10 | 12>(12)

  // Standby Mode
  const [isStandby, setIsStandby] = useState(false)
  const [standbyReason, setStandbyReason] = useState('')
  const [standbyHours, setStandbyHours] = useState('')

  // Basic Shift Details
  const [project, setProject] = useState('')
  const [rig, setRig] = useState('')
  const [shiftDate, setShiftDate] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'))
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

  // Operation Details
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

  // Computed
  const metersDrilled = meterStart && meterEnd
    ? Math.max(0, parseFloat(meterEnd) - parseFloat(meterStart)).toFixed(2)
    : ''
  const newHoleMetersDrilled = newHoleMeterStart && newHoleMeterEnd
    ? Math.max(0, parseFloat(newHoleMeterEnd) - parseFloat(newHoleMeterStart)).toFixed(2)
    : ''

  // Dynamic sections
  const [downtimeRows, setDowntimeRows] = useState<DowntimeRow[]>([
    { id: '1', reason: '', type: 'Internal', hours: '' }
  ])
  const [bitRows, setBitRows] = useState<BitRow[]>([
    { id: '1', serialNo: '', bitId: '', meterStart: '', meterEnd: '', status: 'In Use' }
  ])

  // Consumables
  const [fuel, setFuel] = useState('')
  const [water, setWater] = useState('')
  const [additives, setAdditives] = useState('')

  // Accessories
  const [accessories, setAccessories] = useState<AccessoryRow[]>([
    { id: '1', name: '', quantity: '' }
  ])

  // Incidents
  const [incidents, setIncidents] = useState<IncidentRow[]>([
    { id: '1', type: '', severity: '', description: '' }
  ])

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([])

  // Standby toggle handler
  const handleStandbyToggle = (val: boolean) => {
    setIsStandby(val)
    if (val) {
      // Pre-set downtime to Client when standby is on
      setDowntimeRows([{ id: '1', reason: '', type: 'Client', hours: '' }])
    } else {
      setDowntimeRows([{ id: '1', reason: '', type: 'Internal', hours: '' }])
    }
  }

  // Downtime rows handlers
  const addDowntime = () => setDowntimeRows(r => [...r, { id: Date.now().toString(), reason: '', type: isStandby ? 'Client' : 'Internal', hours: '' }])
  const removeDowntime = (id: string) => setDowntimeRows(r => r.filter(x => x.id !== id))
  const updateDowntime = (id: string, field: keyof DowntimeRow, value: string) =>
    setDowntimeRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  // Bit rows handlers
  const addBit = () => setBitRows(r => [...r, { id: Date.now().toString(), serialNo: '', bitId: '', meterStart: '', meterEnd: '', status: 'In Use' }])
  const removeBit = (id: string) => setBitRows(r => r.filter(x => x.id !== id))
  const updateBit = (id: string, field: keyof BitRow, value: string) =>
    setBitRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  // Accessories handlers
  const addAccessory = () => setAccessories(r => [...r, { id: Date.now().toString(), name: '', quantity: '' }])
  const removeAccessory = (id: string) => setAccessories(r => r.filter(x => x.id !== id))
  const updateAccessory = (id: string, field: keyof AccessoryRow, value: string) =>
    setAccessories(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  // Incident handlers
  const addIncident = () => setIncidents(r => [...r, { id: Date.now().toString(), type: '', severity: '', description: '' }])
  const removeIncident = (id: string) => setIncidents(r => r.filter(x => x.id !== id))
  const updateIncident = (id: string, field: keyof IncidentRow, value: string) =>
    setIncidents(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  const handleSubmit = () => {
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
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          Submit Log
        </button>
      </div>

      {/* ── STANDBY MODE BANNER ── */}
      <div className={`rounded-2xl border p-4 transition-all ${isStandby ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#111827] border-[#1E293B]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${isStandby ? 'text-amber-400' : 'text-[#64748B]'}`} />
            <div>
              <p className={`font-semibold text-sm ${isStandby ? 'text-amber-300' : 'text-[#F8FAFC]'}`}>Standby Mode</p>
              <p className="text-xs text-[#64748B] mt-0.5">Enable if operations are on hold — drilling fields will be hidden and downtime set to Client</p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => handleStandbyToggle(!isStandby)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${isStandby ? 'bg-amber-500' : 'bg-[#1E293B]'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isStandby ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Standby reason + hours — only shown when standby is ON */}
        {isStandby && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-500/20">
            <div>
              <label className="block text-sm text-amber-300/70 mb-2">Standby Reason *</label>
              <select
                className="w-full px-4 py-3 bg-[#0D1117] border border-amber-500/30 rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-amber-500/60 transition-colors"
                value={standbyReason}
                onChange={e => setStandbyReason(e.target.value)}
              >
                <option value="">Select reason...</option>
                {standbyReasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-amber-300/70 mb-2">Standby Hours *</label>
              <input
                type="number" step="0.5"
                className="w-full px-4 py-3 bg-[#0D1117] border border-amber-500/30 rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-amber-500/60 transition-colors"
                placeholder="0"
                value={standbyHours}
                onChange={e => setStandbyHours(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 1. BASIC SHIFT DETAILS ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={sectionTitleClass}>Basic Shift Details</h2>
          {/* 10h / 12h toggle */}
          <div className="flex items-center gap-1 bg-[#1A2234] rounded-lg p-1">
            <button
              onClick={() => setShiftMode(10)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${shiftMode === 10 ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >10h</button>
            <button
              onClick={() => setShiftMode(12)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${shiftMode === 12 ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >12h</button>
          </div>
        </div>

        {/* Row 1: Project, Rig, Shift Date, Shift */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Project *</label>
            <select className={selectClass} value={project} onChange={e => setProject(e.target.value)}>
              <option value="">Select project...</option>
              {mockData.projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Rig *</label>
            <select className={selectClass} value={rig} onChange={e => setRig(e.target.value)} disabled={!project}>
              <option value="">{project ? 'Select rig...' : 'Select a project first'}</option>
              {mockData.rigs.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Shift Date *</label>
            <input type="text" className={inputClass} value={shiftDate} onChange={e => setShiftDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Shift *</label>
            <select className={selectClass} value={shift} onChange={e => setShift(e.target.value)}>
              <option value="">Select shift...</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Supervisor, Driller, Hole Number, Crew Count */}
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
                {['H1', 'H2', 'H3', 'BH-001', 'BH-002'].map(h => (
                  <option key={h} value={h}>{h} — OPEN</option>
                ))}
              </optgroup>
              <optgroup label="Closed Holes">
                {['H0'].map(h => (
                  <option key={h} value={h}>{h} — CLOSED</option>
                ))}
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

      {/* ── 2. OPERATION DETAILS ── (hidden in standby) */}
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
                value={metersDrilled} readOnly />
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

          {/* ── HOLE CLOSED TOGGLE ── */}
          <div className={`mt-6 pt-6 border-t border-[#1E293B]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Hole Closed This Shift?</p>
                <p className="text-xs text-[#64748B] mt-0.5">Enable if this hole was completed and a new hole was started in the same shift</p>
              </div>
              <button
                onClick={() => setHoleClosed(!holeClosed)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${holeClosed ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}
              >
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

                {/* Started drilling toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-[#111827] rounded-xl border border-[#1E293B] mb-4">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Started drilling in new hole?</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Turn off if new hole was opened but no meters drilled yet</p>
                  </div>
                  <button
                    onClick={() => setNewHoleDrilled(!newHoleDrilled)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${newHoleDrilled ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}
                  >
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
                          value={newHoleMetersDrilled} readOnly />
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
                value={row.reason}
                onChange={e => updateDowntime(row.id, 'reason', e.target.value)}
              >
                <option value="">Select reason</option>
                {isStandby
                  ? standbyReasons.map(r => <option key={r} value={r}>{r}</option>)
                  : downtimeReasonsList.map(r => <option key={r} value={r}>{r}</option>)
                }
              </select>
              {/* Internal / Client toggle */}
              <div className="flex items-center bg-[#1A2234] rounded-lg p-1 shrink-0">
                <button
                  onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Internal')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Internal' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'} ${isStandby ? 'opacity-40 cursor-not-allowed' : ''}`}
                >Internal</button>
                <button
                  onClick={() => !isStandby && updateDowntime(row.id, 'type', 'Client')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${row.type === 'Client' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
                >Client</button>
              </div>
              <input
                type="number" step="0.5"
                className="w-28 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0"
                placeholder="Hours"
                value={row.hours}
                onChange={e => updateDowntime(row.id, 'hours', e.target.value)}
              />
              <button onClick={() => removeDowntime(row.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. BIT USAGE ── (hidden in standby) */}
      {!isStandby && (
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={sectionTitleClass}>Bit Usage</h2>
            <button onClick={addBit}
              className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {bitRows.map((row, index) => (
              <div key={row.id} className="flex items-center gap-3">
                <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>

                {/* Serial Number — manual input */}
                <input type="text"
                  className="w-32 px-3 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0"
                  placeholder="Serial No."
                  value={row.serialNo}
                  onChange={e => updateBit(row.id, 'serialNo', e.target.value)}
                />

                {/* Bit type dropdown */}
                <select
                  className="flex-1 px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                  value={row.bitId}
                  onChange={e => updateBit(row.id, 'bitId', e.target.value)}
                >
                  <option value="">Select bit</option>
                  {mockData.bits.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                {/* Meter Start */}
                <input type="number" step="0.1"
                  className="w-28 px-3 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0"
                  placeholder="Meter S"
                  value={row.meterStart}
                  onChange={e => updateBit(row.id, 'meterStart', e.target.value)}
                />
                <span className="text-[#64748B] text-sm shrink-0">to</span>
                {/* Meter End */}
                <input type="number" step="0.1"
                  className="w-28 px-3 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors shrink-0"
                  placeholder="Meter E"
                  value={row.meterEnd}
                  onChange={e => updateBit(row.id, 'meterEnd', e.target.value)}
                />

                {/* Status toggle: In Use / Changed */}
                <div className="flex items-center bg-[#1A2234] border border-[#1E293B] rounded-lg p-1 shrink-0">
                  <button
                    onClick={() => updateBit(row.id, 'status', 'In Use')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${row.status === 'In Use' ? 'bg-emerald-600 text-white' : 'text-[#94A3B8] hover:text-white'}`}
                  >In Use</button>
                  <button
                    onClick={() => updateBit(row.id, 'status', 'Changed')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${row.status === 'Changed' ? 'bg-amber-500 text-white' : 'text-[#94A3B8] hover:text-white'}`}
                  >Changed</button>
                </div>

                <button onClick={() => removeBit(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. CONSUMABLES ── */}
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

      {/* ── 6. ACCESSORIES ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionTitleClass}>Accessories</h2>
          {!isStandby && (
            <button onClick={addAccessory}
              className="text-[#3B82F6] hover:text-[#60A5FA] text-sm font-medium flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>

        <div className="space-y-3">
          {accessories.map((row, index) => (
            <div key={row.id} className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-xl border border-[#1E293B]">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>
              <select
                className={`flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none ${isStandby ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus:outline-none focus:border-[#3B82F6] transition-colors`}
                value={row.name}
                onChange={e => !isStandby && updateAccessory(row.id, 'name', e.target.value)}
                disabled={isStandby}
              >
                <option value="">Select accessory</option>
                {accessoriesList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <input type="number" min="1"
                className={`w-24 px-3 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg ${isStandby ? 'text-[#4B5563] cursor-not-allowed opacity-50' : 'text-[#F8FAFC]'} placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors text-center shrink-0`}
                placeholder="Qty"
                value={row.quantity}
                onChange={e => !isStandby && updateAccessory(row.id, 'quantity', e.target.value)}
                readOnly={isStandby}
              />
              {!isStandby && (
                <button onClick={() => removeAccessory(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. INCIDENTS ── */}
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
                value={row.type}
                onChange={e => updateIncident(row.id, 'type', e.target.value)}
              >
                <option value="">Incident type</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                className="flex-1 px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer focus:outline-none focus:border-[#3B82F6] transition-colors"
                value={row.severity}
                onChange={e => updateIncident(row.id, 'severity', e.target.value)}
              >
                <option value="">Severity (optional)</option>
                {severityTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text"
                className="flex-[2] px-4 py-2.5 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors"
                placeholder="Description"
                value={row.description}
                onChange={e => updateIncident(row.id, 'description', e.target.value)}
              />
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

      {/* Submit */}
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

