'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Save, Activity, Settings, Droplets, Zap } from 'lucide-react'

export default function DrillingLogPage() {
  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    driller: '',
    supervisor: 'John Smith',
    shift: '',
    holeNumber: '',
    crewCount: '',
    date: new Date().toISOString().split('T')[0],
    drillingHours: '',
    downtimeHours: '',
    metersDrilled: '',
    rop: '',
    bitType: '',
    formation: '',
    waterUsed: '',
    fuelUsed: '',
    remarks: ''
  })

  const handleSubmit = () => {
    alert('Drilling log submitted!')
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Record Daily Drilling Operations</h1>
          <p className="text-[#94A3B8] mt-1">Log shift details, performance metrics, and resource consumption</p>
        </div>
        <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl">
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

      {/* Basic Shift Details */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3B82F6]" />
          Basic Shift Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Project *', key: 'project' },
            { label: 'Rig *', key: 'rig' },
            { label: 'Driller *', key: 'driller' },
            { label: 'Supervisor *', key: 'supervisor', disabled: true },
            { label: 'Shift *', key: 'shift' },
            { label: 'Hole Number *', key: 'holeNumber' },
            { label: 'Crew Count *', key: 'crewCount' },
            { label: 'Date', key: 'date', type: 'date' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-[#94A3B8] mb-2">{field.label}</label>
              <input
                type={field.type || 'text'}
                disabled={field.disabled}
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] disabled:opacity-50"
                value={formData[field.key as keyof typeof formData]}
                onChange={e => setFormData({...formData, [field.key]: e.target.value})}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Operation Details */}
      <motion.div className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]">
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#10B981]" />
          Operation Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Drilling Hours', key: 'drillingHours' },
            { label: 'Downtime Hours', key: 'downtimeHours' },
            { label: 'Meters Drilled', key: 'metersDrilled' },
            { label: 'ROP (m/hr)', key: 'rop' },
            { label: 'Bit Type', key: 'bitType' },
            { label: 'Formation', key: 'formation' },
            { label: 'Water Used (L)', key: 'waterUsed' },
            { label: 'Fuel Used (L)', key: 'fuelUsed' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-[#94A3B8] mb-2">{field.label}</label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC]"
                value={formData[field.key as keyof typeof formData]}
                onChange={e => setFormData({...formData, [field.key]: e.target.value})}
              />
            </div>
          ))}
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
          onChange={e => setFormData({...formData, remarks: e.target.value})}
        />
      </motion.div>
    </div>
  )
}
