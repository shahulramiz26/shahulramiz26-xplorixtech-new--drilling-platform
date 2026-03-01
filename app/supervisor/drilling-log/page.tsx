'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Save, Activity, Settings, Droplets, Zap, Plus, Trash2, AlertTriangle, Upload, Clock } from 'lucide-react'

// Mock data for dropdowns - In production, these would come from API/Database
const mockData = {
  projects: ['PRJ-001 - Gold Mine Project A', 'PRJ-002 - Copper Exploration Site', 'PRJ-003 - Diamond Drilling'],
  rigs: ['RIG-001 - Drill Rig Alpha', 'RIG-002 - Drill Rig Beta', 'RIG-003 - Drill Rig Gamma'],
  drillers: ['Mike Johnson', 'David Chen', 'Robert Williams', 'James Brown'],
  supervisors: ['John Smith', 'Sarah Davis', 'Michael Wilson'],
  bits: ['BIT-001 - NQ Core Bit', 'BIT-002 - HQ Core Bit', 'BIT-003 - PQ Core Bit', 'BIT-004 - 6" Tricone'],
}

const holeSizes = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"']
const formationTypes = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Mixed']
const downtimeReasons = [
  'Mechanical Breakdown',
  'Hydraulic Issue',
  'Electrical Fault',
  'Bit Change',
  'Rod Change',
  'Casing Installation',
  'Water Shortage',
  'Fuel Shortage',
  'Operator Delay',
  'Shift Change Delay',
  'Ground Condition Issue',
  'Site Access Issue',
  'Safety Hold',
  'Weather Condition',
  'Waiting for Instruction',
  'Others'
]
const completionTypes = ['Inner Worn', 'Outer Worn', 'Flat Worn', 'Broken']
const equipmentList = [
  'Air Compressor',
  'Booster Compressor',
  'Water Pump',
  'Mud Pump',
  'Generator',
  'Welding Machine',
  'Crane',
  'Excavator',
  'Loader',
  'Service Truck',
  'Others'
]
const accessoriesList = [
  'Adaptor Sub',
  'Air Hose',
  'Casing',
  'Core Barrel',
  'Core Lifter',
  'Core Lifter Case',
  'Coupling',
  'DTH Hammer',
  'Drill Pipe',
  'Inner Tube',
  'Liner',
  'O-Rings',
  'Outer Tube',
  'Reaming Shell',
  'Shock Sub',
  'Stabilizer',
  'Others'
]
const incidentTypes = ['Injury', 'Equipment Damage', 'Safety Violation']
const severityTypes = ['Minor', 'Major', 'Critical']
const shifts = ['Day', 'Night']

interface AccessoryItem {
  id: string
  name: string
  quantity: number
}

export default function DrillingLogPage() {
  const [shiftMode, setShiftMode] = useState<10 | 12>(12)
  const [hourError, setHourError] = useState('')
  const [downtimeReasonOther, setDowntimeReasonOther] = useState('')
  const [equipmentOther, setEquipmentOther] = useState('')
  
  const [formData, setFormData] = useState({
    projectId: '',
    rigId: '',
    drillerName: '',
    supervisorName: 'John Smith',
    shift: '',
    holeNumber: '',
    crewCount: '',
    date: new Date().toISOString().split('T')[0],
    drillingHours: '',
    downtime: '',
    metersDrilled: '',
    coreRecovery: '',
    holeSize: '',
    formationType: '',
    downtimeReason: '',
    bitId: '',
    bitMetersDrilled: '',
    completionType: '',
    fuel: '',
    water: '',
    additives: '',
    equipment: '',
    equipmentHours: '',
    incidentType: '',
    severityType: '',
    remarks: ''
  })

  const [accessories, setAccessories] = useState<AccessoryItem[]>([])

  const validateHours = (drilling: string, downtime: string) => {
    const drillingHrs = parseFloat(drilling) || 0
    const downtimeHrs = parseFloat(downtime) || 0
    const total = drillingHrs + downtimeHrs
    
    if (total > 0 && total !== shiftMode) {
      setHourError(`Total shift hours must match ${shiftMode} hours. Current: ${total} hours`)
    } else {
      setHourError('')
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: value }
      
      // Validate hours when drilling or downtime changes
      if (key === 'drillingHours' || key === 'downtime') {
        validateHours(
          key === 'drillingHours' ? value : newData.drillingHours,
          key === 'downtime' ? value : newData.downtime
        )
      }
      
      return newData
    })
  }

  const addAccessory = () => {
    const newAccessory: AccessoryItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1
    }
    setAccessories([...accessories, newAccessory])
  }

  const updateAccessory = (id: string, field: 'name' | 'quantity', value: string | number) => {
    setAccessories(accessories.map(acc => 
      acc.id === id ? { ...acc, [field]: value } : acc
    ))
  }

  const removeAccessory = (id: string) => {
    setAccessories(accessories.filter(acc => acc.id !== id))
  }

  const handleSubmit = () => {
    // Final validation
    const drillingHrs = parseFloat(formData.drillingHours) || 0
    const downtimeHrs = parseFloat(formData.downtime) || 0
    const total = drillingHrs + downtimeHrs
    
    if (total !== shiftMode) {
      alert(`Validation Error: Total shift hours must match ${shiftMode} hours. Current: ${total} hours`)
      return
    }
    
    console.log('Form Data:', formData)
    console.log('Accessories:', accessories)
    alert('Drilling log submitted successfully!')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Record Daily Drilling Operations</h1>
          <p className="text-[#94A3B8] mt-1">Log shift details, performance metrics, and resource consumption</p>
        </div>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors">
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

      {/* Shift Mode Toggle */}
      <motion.div className="p-4 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#3B82F6]" />
            <span className="text-[#F8FAFC] font-medium">Shift Mode</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1A2234] rounded-lg p-1">
            <button
              onClick={() => {
                setShiftMode(10)
                validateHours(formData.drillingHours, formData.downtime)
              }}
              className={`px-4 py-2 rounded-md transition-colors ${shiftMode === 10 ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              10 Hours
            </button>
            <button
              onClick={() => {
                setShiftMode(12)
                validateHours(formData.drillingHours, formData.downtime)
              }}
              className={`px-4 py-2 rounded-md transition-colors ${shiftMode === 12 ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'}`}
            >
              12 Hours
            </button>
          </div>
        </div>
      </motion.div>

      {/* Basic Shift Details */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3B82F6]" />
          Basic Shift Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Project ID *</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.projectId}
              onChange={e => handleInputChange('projectId', e.target.value)}
            >
              <option value="">Select Project</option>
              {mockData.projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Rig ID *</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.rigId}
              onChange={e => handleInputChange('rigId', e.target.value)}
            >
              <option value="">Select Rig</option>
              {mockData.rigs.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Driller Name *</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.drillerName}
              onChange={e => handleInputChange('drillerName', e.target.value)}
            >
              <option value="">Select Driller</option>
              {mockData.drillers.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Supervisor Name *</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.supervisorName}
              onChange={e => handleInputChange('supervisorName', e.target.value)}
            >
              <option value="">Select Supervisor</option>
              {mockData.supervisors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Shift *</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.shift}
              onChange={e => handleInputChange('shift', e.target.value)}
            >
              <option value="">Select Shift</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Hole Number *</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="Enter hole number"
              value={formData.holeNumber}
              onChange={e => handleInputChange('holeNumber', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Crew Count *</label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="Enter crew count"
              value={formData.crewCount}
              onChange={e => handleInputChange('crewCount', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Operation Details */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#10B981]" />
          Operation Details
        </h2>
        
        {/* Hour Validation Alert */}
        {hourError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{hourError}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Drilling Hours (hrs)</label>
            <input
              type="number"
              step="0.5"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.drillingHours}
              onChange={e => handleInputChange('drillingHours', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Downtime (hrs)</label>
            <input
              type="number"
              step="0.5"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.downtime}
              onChange={e => handleInputChange('downtime', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Meters Drilled (m)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.metersDrilled}
              onChange={e => handleInputChange('metersDrilled', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Core Recovery (m)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.coreRecovery}
              onChange={e => handleInputChange('coreRecovery', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Hole Size / Bit Size</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.holeSize}
              onChange={e => handleInputChange('holeSize', e.target.value)}
            >
              <option value="">Select Size</option>
              {holeSizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Formation Type</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.formationType}
              onChange={e => handleInputChange('formationType', e.target.value)}
            >
              <option value="">Select Formation</option>
              {formationTypes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm text-[#94A3B8] mb-2">Downtime Reason</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.downtimeReason}
              onChange={e => handleInputChange('downtimeReason', e.target.value)}
            >
              <option value="">Select Reason</option>
              {downtimeReasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {formData.downtimeReason === 'Others' && (
              <input
                type="text"
                className="w-full mt-2 px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
                placeholder="Specify other reason..."
                value={downtimeReasonOther}
                onChange={e => setDowntimeReasonOther(e.target.value)}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Bit Usage */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#8B5CF6]" />
          Bit Usage
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Bit ID</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.bitId}
              onChange={e => handleInputChange('bitId', e.target.value)}
            >
              <option value="">Select Bit</option>
              {mockData.bits.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Meters Drilled (m)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.bitMetersDrilled}
              onChange={e => handleInputChange('bitMetersDrilled', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Completion Type</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.completionType}
              onChange={e => handleInputChange('completionType', e.target.value)}
            >
              <option value="">Select Type</option>
              {completionTypes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Consumables */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-[#06B6D4]" />
          Consumables
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Fuel (L)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.fuel}
              onChange={e => handleInputChange('fuel', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Water (L)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.water}
              onChange={e => handleInputChange('water', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Additives (kg)</label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.additives}
              onChange={e => handleInputChange('additives', e.target.value)}
            />
          </div>
        </div>

        {/* Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Equipment</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.equipment}
              onChange={e => handleInputChange('equipment', e.target.value)}
            >
              <option value="">Select Equipment</option>
              {equipmentList.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            {formData.equipment === 'Others' && (
              <input
                type="text"
                className="w-full mt-2 px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
                placeholder="Specify other equipment..."
                value={equipmentOther}
                onChange={e => setEquipmentOther(e.target.value)}
              />
            )}
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Equipment Used (hrs)</label>
            <input
              type="number"
              step="0.5"
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
              placeholder="0.0"
              value={formData.equipmentHours}
              onChange={e => handleInputChange('equipmentHours', e.target.value)}
            />
          </div>
        </div>

        {/* Accessories */}
        <div className="border-t border-[#1E293B] pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#F8FAFC]">Accessories</h3>
            <button
              onClick={addAccessory}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/20 text-[#10B981] rounded-lg hover:bg-[#10B981]/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Accessories
            </button>
          </div>
          
          {accessories.length === 0 && (
            <p className="text-[#64748B] text-sm italic">No accessories added. Click "Add Accessories" to add items.</p>
          )}
          
          {accessories.map((accessory, index) => (
            <div key={accessory.id} className="flex items-center gap-4 mb-3 p-3 bg-[#1A2234] rounded-xl">
              <span className="text-[#64748B] text-sm w-8">{index + 1}.</span>
              <select
                className="flex-1 px-4 py-2 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] appearance-none cursor-pointer"
                value={accessory.name}
                onChange={e => updateAccessory(accessory.id, 'name', e.target.value)}
              >
                <option value="">Select Accessory</option>
                {accessoriesList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-sm">Qty:</span>
                <input
                  type="number"
                  min="1"
                  className="w-20 px-3 py-2 bg-[#111827] border border-[#1E293B] rounded-lg text-[#F8FAFC] text-center"
                  value={accessory.quantity}
                  onChange={e => updateAccessory(accessory.id, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <button
                onClick={() => removeAccessory(accessory.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Incident Reporting */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          Incident Reporting
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Incident Type</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.incidentType}
              onChange={e => handleInputChange('incidentType', e.target.value)}
            >
              <option value="">Select Type</option>
              {incidentTypes.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Severity Type</label>
            <select
              className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] appearance-none cursor-pointer"
              value={formData.severityType}
              onChange={e => handleInputChange('severityType', e.target.value)}
            >
              <option value="">Select Severity</option>
              {severityTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Attachments */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#F59E0B]" />
          Attachments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Photo Upload (Optional)</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3B82F6] file:text-white file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Document Upload (Optional)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3B82F6] file:text-white file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Remarks */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4">Remarks</h2>
        <textarea
          rows={4}
          className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
          placeholder="Enter any additional notes or observations..."
          value={formData.remarks}
          onChange={e => handleInputChange('remarks', e.target.value)}
        />
      </motion.div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSubmit} 
          className="flex items-center gap-2 px-8 py-4 bg-[#3B82F6] text-white rounded-xl hover:bg-[#2563EB] transition-colors text-lg font-medium"
        >
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>
    </div>
  )
}
