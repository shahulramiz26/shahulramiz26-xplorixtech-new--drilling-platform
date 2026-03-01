'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Save, Clock, MapPin, User, Settings } from 'lucide-react'

export default function DrillingLogPage() {
  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    driller: '',
    supervisor: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Drilling log submitted successfully!')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Record Daily Drilling Operations</h1>
          <p className="text-[#94A3B8] mt-1">Log shift details, performance metrics, and resource consumption</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all"
        >
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

      {/* Basic Shift Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#3B82F6]" />
          Basic Shift Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Project *', key: 'project', type: 'select', options: ['Gold Mine Project A', 'Copper Exploration Site'] },
            { label: 'Rig *', key: 'rig', type: 'select', options: ['RIG-001', 'RIG-002', 'RIG-003'] },
            { label: 'Driller *', key: 'driller', type: 'select', options: ['Mike Johnson', 'David Brown', 'Chris Wilson'] },
            { label: 'Supervisor *', key: 'supervisor', type: 'text', value: 'John Smith', disabled: true },
            { label: 'Shift *', key: 'shift', type: 'select', options: ['Day', 'Night'] },
            { label: 'Hole Number *', key: 'holeNumber', type: 'text' },
            { label: 'Crew Count *', key: 'crewCount', type: 'number' },
            { label: 'Date', key: 'date', type: 'date' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all disabled:opacity-50"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                  disabled={field.disabled}
                >
                  <option value="" className="bg-[#1A2234]">Select {field.label.replace(' *', '')}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt} className="bg-[#1A2234]">{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all disabled:opacity-50"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                  disabled={field.disabled}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Operation Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#10B981]" />
          Operation Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Drilling Hours *', key: 'drillingHours', type: 'number', step: '0.5' },
            { label: 'Downtime Hours *', key: 'downtimeHours', type: 'number', step: '0.5' },
            { label: 'Meters Drilled *', key: 'metersDrilled', type: 'number', step: '0.1' },
            { label: 'ROP (m/hr)', key: 'rop', type: 'number', step: '0.1' },
            { label: 'Bit Type', key: 'bitType', type: 'select', options: ['Surface Set', 'Impregnated', 'PDC Core', 'DTH', 'Tricone'] },
            { label: 'Formation', key: 'formation', type: 'select', options: ['Soft', 'Medium', 'Hard', 'Mixed'] },
            { label: 'Water Used (L)', key: 'waterUsed', type: 'number' },
            { label: 'Fuel Used (L)', key: 'fuelUsed', type: 'number' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                >
                  <option value="" className="bg-[#1A2234]">Select {field.label.replace(' *', '')}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt} className="bg-[#1A2234]">{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  step={field.step}
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Remarks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4">Remarks</h2>
        <textarea
          rows={4}
          className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
          placeholder="Enter any additional notes or observations..."
          value={formData.remarks}
          onChange={e => setFormData({...formData, remarks: e.target.value})}
        />
      </motion.div>
    </div>
  )
}
