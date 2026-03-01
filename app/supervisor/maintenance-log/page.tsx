'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Save, AlertTriangle, CheckCircle } from 'lucide-react'

export default function MaintenanceLogPage() {
  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    supervisor: 'John Smith',
    shift: '',
    date: new Date().toISOString().split('T')[0],
    maintenanceType: '',
    hours: '',
    component: '',
    action: '',
    cost: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Maintenance log submitted successfully!')
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Record Rig Maintenance</h1>
          <p className="text-[#94A3B8] mt-1">Log maintenance activities, repairs, and service details</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.6)] transition-all"
        >
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

      {/* Basic Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#F59E0B]" />
          Basic Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Project *', key: 'project', type: 'select', options: ['Gold Mine Project A', 'Copper Exploration Site'] },
            { label: 'Rig *', key: 'rig', type: 'select', options: ['RIG-001', 'RIG-002', 'RIG-003'] },
            { label: 'Supervisor *', key: 'supervisor', type: 'text', disabled: true },
            { label: 'Shift *', key: 'shift', type: 'select', options: ['Day', 'Night'] },
            { label: 'Date', key: 'date', type: 'date' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all disabled:opacity-50"
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
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all disabled:opacity-50"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                  disabled={field.disabled}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Service Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          Service Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Maintenance Type *', key: 'maintenanceType', type: 'select', options: ['Preventive', 'Breakdown', 'Scheduled', 'Component Replacement'] },
            { label: 'Maintenance Hours *', key: 'hours', type: 'number', step: '0.5' },
            { label: 'Component Affected *', key: 'component', type: 'select', options: ['Engine', 'Hydraulic System', 'Electrical', 'Transmission', 'Mud Pump', 'Compressor'] },
            { label: 'Action Taken *', key: 'action', type: 'select', options: ['Repair', 'Replace', 'Temporary Fix', 'Inspection'] },
            { label: 'Cost ($)', key: 'cost', type: 'number', step: '0.01' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
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
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Description */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#10B981]" />
          Work Description
        </h2>
        <textarea
          rows={4}
          className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all"
          placeholder="Describe the maintenance work performed, issues found, and resolution..."
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </motion.div>
    </div>
  )
}
