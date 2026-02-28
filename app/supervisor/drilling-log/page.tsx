'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2, AlertCircle, CheckCircle, Upload } from 'lucide-react'

// Mock dropdown data
const projects = ['Gold Mine Project A', 'Copper Exploration Site']
const rigs = ['RIG-001', 'RIG-002', 'RIG-003']
const drillers = ['Mike Johnson', 'David Brown', 'Chris Wilson']
const supervisors = ['John Smith', 'Sarah Williams']
const holeSizes = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"']
const formationTypes = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Mixed']
const downtimeReasons = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault', 'Bit Change',
  'Rod Change', 'Casing Installation', 'Water Shortage', 'Fuel Shortage',
  'Operator Delay', 'Shift Change Delay', 'Ground Condition Issue',
  'Site Access Issue', 'Safety Hold', 'Weather Condition', 'Waiting for Instruction'
]
const completionTypes = ['Inner Worn', 'Outer Worn', 'Flat Worn', 'Broken']
const accessories = [
  'Adaptor Sub', 'Air Hose', 'Casing', 'Core Barrel', 'Core Lifter',
  'Core Lifter Case', 'Coupling', 'DTH Hammer', 'Drill Pipe', 'Inner Tube',
  'Liner', 'O-Rings', 'Outer Tube', 'Reaming Shell', 'Shock Sub', 'Stabilizer'
]
const equipment = [
  'Air Compressor', 'Booster Compressor', 'Water Pump', 'Mud Pump',
  'Generator', 'Welding Machine', 'Crane', 'Excavator', 'Loader', 'Service Truck'
]
const incidentTypes = ['Injury', 'Equipment Damage', 'Safety Violation']
const severityTypes = ['Minor', 'Major', 'Critical']

export default function DrillingLogPage() {
  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    driller: '',
    supervisor: '',
    shift: 'DAY',
    holeNumber: '',
    crewCount: '',
    drillingHours: '',
    downtimeHours: '',
    metersDrilled: '',
    coreRecovery: '',
    holeSize: '',
    formationType: '',
    fuel: '',
    water: '',
    additives: '',
    incidentType: '',
    incidentSeverity: ''
  })

  const [downtimeReasonsList, setDowntimeReasonsList] = useState<string[]>([])
  const [accessoriesList, setAccessoriesList] = useState<{name: string, qty: number}[]>([])
  const [equipmentList, setEquipmentList] = useState<{name: string, hours: number}[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  const totalHours = (parseFloat(formData.drillingHours) || 0) + (parseFloat(formData.downtimeHours) || 0)
  const isValid = totalHours === 12

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (totalHours !== 12) {
      setValidationError('Total shift hours must equal 12 hours.')
      return
    }
    
    setValidationError('')
    setShowSuccess(true)
    
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const addAccessory = () => {
    setAccessoriesList([...accessoriesList, { name: '', qty: 1 }])
  }

  const updateAccessory = (index: number, field: string, value: string | number) => {
    const updated = [...accessoriesList]
    updated[index] = { ...updated[index], [field]: value }
    setAccessoriesList(updated)
  }

  const removeAccessory = (index: number) => {
    setAccessoriesList(accessoriesList.filter((_, i) => i !== index))
  }

  const addEquipment = () => {
    setEquipmentList([...equipmentList, { name: '', hours: 0 }])
  }

  const updateEquipment = (index: number, field: string, value: string | number) => {
    const updated = [...equipmentList]
    updated[index] = { ...updated[index], [field]: value }
    setEquipmentList(updated)
  }

  const removeEquipment = (index: number) => {
    setEquipmentList(equipmentList.filter((_, i) => i !== index))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Drilling Log Entry</h1>
        <p className="text-slate-600 mt-1">Record daily drilling operations</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Drilling log submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Shift Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Shift Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.project}
                onChange={e => setFormData({...formData, project: e.target.value})}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rig *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.rig}
                onChange={e => setFormData({...formData, rig: e.target.value})}
              >
                <option value="">Select Rig</option>
                {rigs.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Driller *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.driller}
                onChange={e => setFormData({...formData, driller: e.target.value})}
              >
                <option value="">Select Driller</option>
                {drillers.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Supervisor *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.supervisor}
                onChange={e => setFormData({...formData, supervisor: e.target.value})}
              >
                <option value="">Select Supervisor</option>
                {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Shift *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.shift}
                onChange={e => setFormData({...formData, shift: e.target.value})}
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hole Number *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.holeNumber}
                onChange={e => setFormData({...formData, holeNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Crew Count *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.crewCount}
                onChange={e => setFormData({...formData, crewCount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
              <input
                type="text"
                disabled
                className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                value={new Date().toLocaleDateString()}
              />
            </div>
          </div>
        </div>

        {/* Operation Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Operation Details</h2>
          
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{validationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Drilling Hours *</label>
              <input
                type="number"
                step="0.5"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.drillingHours}
                onChange={e => setFormData({...formData, drillingHours: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Downtime Hours *</label>
              <input
                type="number"
                step="0.5"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.downtimeHours}
                onChange={e => setFormData({...formData, downtimeHours: e.target.value})}
              />
            </div>
            <div className="flex items-end pb-2">
              <div className={`px-4 py-2 rounded-lg font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Total: {totalHours} / 12 hours
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Meters Drilled *</label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.metersDrilled}
                onChange={e => setFormData({...formData, metersDrilled: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Core Recovery (m)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.coreRecovery}
                onChange={e => setFormData({...formData, coreRecovery: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hole/Bit Size</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.holeSize}
                onChange={e => setFormData({...formData, holeSize: e.target.value})}
              >
                <option value="">Select Size</option>
                {holeSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formation Type</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.formationType}
                onChange={e => setFormData({...formData, formationType: e.target.value})}
              >
                <option value="">Select Formation</option>
                {formationTypes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Downtime Reasons */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Downtime Reasons</label>
            <div className="flex flex-wrap gap-2">
              {downtimeReasons.map(reason => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    if (downtimeReasonsList.includes(reason)) {
                      setDowntimeReasonsList(downtimeReasonsList.filter(r => r !== reason))
                    } else {
                      setDowntimeReasonsList([...downtimeReasonsList, reason])
                    }
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition ${
                    downtimeReasonsList.includes(reason)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Consumables */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Consumables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fuel (L)</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.fuel}
                onChange={e => setFormData({...formData, fuel: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Water (L)</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.water}
                onChange={e => setFormData({...formData, water: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Additives (kg)</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.additives}
                onChange={e => setFormData({...formData, additives: e.target.value})}
              />
            </div>
          </div>

          {/* Accessories */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Accessories Used</label>
              <button
                type="button"
                onClick={addAccessory}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Add Accessory
              </button>
            </div>
            {accessoriesList.map((acc, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                  value={acc.name}
                  onChange={e => updateAccessory(index, 'name', e.target.value)}
                >
                  <option value="">Select Accessory</option>
                  {accessories.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-24 px-4 py-2 border border-slate-300 rounded-lg"
                  value={acc.qty}
                  onChange={e => updateAccessory(index, 'qty', parseInt(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => removeAccessory(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Equipment */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Equipment Used</label>
              <button
                type="button"
                onClick={addEquipment}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" /> Add Equipment
              </button>
            </div>
            {equipmentList.map((eq, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                  value={eq.name}
                  onChange={e => updateEquipment(index, 'name', e.target.value)}
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours"
                  className="w-24 px-4 py-2 border border-slate-300 rounded-lg"
                  value={eq.hours}
                  onChange={e => updateEquipment(index, 'hours', parseFloat(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => removeEquipment(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Reporting */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Incident Reporting (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Incident Type</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.incidentType}
                onChange={e => setFormData({...formData, incidentType: e.target.value})}
              >
                <option value="">Select Type</option>
                {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.incidentSeverity}
                onChange={e => setFormData({...formData, incidentSeverity: e.target.value})}
              >
                <option value="">Select Severity</option>
                {severityTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
            <div className="flex gap-4">
              <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
              <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Submit Drilling Log
          </button>
          <button
            type="button"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  )
}
