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
interface BitRow { id: string; serialNo: string; bitId: string; meterStart: string; meterEnd: string; replaced: boolean; newSerialNo: string; newBitId: string; newMeterStart: string; newMeterEnd: string }
interface AccessoryRow { id: string; name: string; quantity: string }
interface IncidentRow { id: string; type: string; severity: string; description: string }

@@ -95,7 +95,7 @@
{ id: '1', reason: '', type: 'Internal', hours: '' }
])
const [bitRows, setBitRows] = useState<BitRow[]>([
    { id: '1', serialNo: '', bitId: '', meterStart: '', meterEnd: '', status: 'In Use' }
    { id: '1', serialNo: '', bitId: '', meterStart: '', meterEnd: '', replaced: false, newSerialNo: '', newBitId: '', newMeterStart: '', newMeterEnd: '' }
])

// Consumables
@@ -134,9 +134,9 @@
setDowntimeRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

// Bit rows handlers
  const addBit = () => setBitRows(r => [...r, { id: Date.now().toString(), serialNo: '', bitId: '', meterStart: '', meterEnd: '', status: 'In Use' }])
  const addBit = () => setBitRows(r => [...r, { id: Date.now().toString(), serialNo: '', bitId: '', meterStart: '', meterEnd: '', replaced: false, newSerialNo: '', newBitId: '', newMeterStart: '', newMeterEnd: '' }])
const removeBit = (id: string) => setBitRows(r => r.filter(x => x.id !== id))
  const updateBit = (id: string, field: keyof BitRow, value: string) =>
  const updateBit = (id: string, field: keyof BitRow, value: string | boolean) =>
setBitRows(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

// Accessories handlers
@@ -520,61 +520,93 @@
</button>
</div>

          <div className="space-y-3">
          <div className="space-y-4">
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
              <div key={row.id} className="p-4 rounded-xl bg-[#0D1117] border border-[#1E293B] space-y-3">

                {/* ── BIT ROW HEADER ── */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#64748B]">Bit {index + 1}</span>
                  <button onClick={() => removeBit(row.id)}
                    className="ml-auto p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* ── BIT FIELDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>Serial No.</label>
                    <input type="text"
                      className={inputClass} placeholder="e.g. SN-001"
                      value={row.serialNo}
                      onChange={e => updateBit(row.id, 'serialNo', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Bit Type</label>
                    <select className={selectClass} value={row.bitId} onChange={e => updateBit(row.id, 'bitId', e.target.value)}>
                      <option value="">Select bit</option>
                      {mockData.bits.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Meter Start (m)</label>
                    <input type="number" step="0.1" className={inputClass} placeholder="0"
                      value={row.meterStart} onChange={e => updateBit(row.id, 'meterStart', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Meter End (m)</label>
                    <input type="number" step="0.1" className={inputClass} placeholder="0"
                      value={row.meterEnd} onChange={e => updateBit(row.id, 'meterEnd', e.target.value)} />
                  </div>
                </div>

                {/* ── BIT REPLACED TOGGLE ── */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">Bit replaced this shift?</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Turn on if this bit was replaced and a new one was installed</p>
                  </div>
<button
                    onClick={() => updateBit(row.id, 'status', 'Changed')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${row.status === 'Changed' ? 'bg-amber-500 text-white' : 'text-[#94A3B8] hover:text-white'}`}
                  >Changed</button>
                    onClick={() => updateBit(row.id, 'replaced', !row.replaced)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${row.replaced ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${row.replaced ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
</div>

                <button onClick={() => removeBit(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
                {/* ── NEW BIT FIELDS (shown when replaced) ── */}
                {row.replaced && (
                  <div className="p-3 rounded-xl bg-[#111827] border border-[#3B82F6]/30 space-y-3">
                    <p className="text-xs font-semibold text-[#3B82F6]">↳ New bit installed</p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className={labelClass}>Serial No.</label>
                        <input type="text" className={inputClass} placeholder="e.g. SN-002"
                          value={row.newSerialNo} onChange={e => updateBit(row.id, 'newSerialNo', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Bit Type</label>
                        <select className={selectClass} value={row.newBitId} onChange={e => updateBit(row.id, 'newBitId', e.target.value)}>
                          <option value="">Select bit</option>
                          {mockData.bits.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Meter Start (m)</label>
                        <input type="number" step="0.1" className={inputClass} placeholder="0"
                          value={row.newMeterStart} onChange={e => updateBit(row.id, 'newMeterStart', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Meter End (m)</label>
                        <input type="number" step="0.1" className={inputClass} placeholder="0"
                          value={row.newMeterEnd} onChange={e => updateBit(row.id, 'newMeterEnd', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

</div>
))}
</div>
@@ -735,3 +767,4 @@
)
}

