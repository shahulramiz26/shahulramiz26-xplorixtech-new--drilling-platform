'use client'

import { useState } from 'react'
import { Wrench, CheckCircle, Upload, AlertCircle } from 'lucide-react'

const projects = ['Gold Mine Project A', 'Copper Exploration Site']
const rigs = ['RIG-001', 'RIG-002', 'RIG-003']
const supervisors = ['John Smith', 'Sarah Williams']
const maintenanceTypes = ['Preventive Maintenance', 'Breakdown Maintenance', 'Scheduled Service', 'Component Replacement']
const components = [
  'Engine', 'Hydraulic System', 'Electrical System', 'Rotation Head', 'Feed System',
  'Compressor', 'Mud Pump', 'Water Pump', 'Transmission', 'Undercarriage / Mast',
  'Control Panel'
]
const actions = ['Repair Performed', 'Part Replaced', 'Temporary Fix']

export default function MaintenanceLogPage() {
  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    supervisor: '',
    shift: 'DAY',
    maintenanceType: '',
    maintenanceHours: '',
    componentAffected: '',
    actionTaken: '',
    engineOil: '',
    hydraulicOil: '',
    transmissionOil: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Maintenance Log Entry</h1>
        <p className="text-slate-600 mt-1">Record rig maintenance activities</p>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Maintenance log submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Details</h2>
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

        {/* Service Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Type *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.maintenanceType}
                onChange={e => setFormData({...formData, maintenanceType: e.target.value})}
              >
                <option value="">Select Type</option>
                {maintenanceTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maintenance Hours *</label>
              <input
                type="number"
                step="0.5"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.maintenanceHours}
                onChange={e => setFormData({...formData, maintenanceHours: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Component Affected *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.componentAffected}
                onChange={e => setFormData({...formData, componentAffected: e.target.value})}
              >
                <option value="">Select Component</option>
                {components.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action Taken *</label>
              <select
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.actionTaken}
                onChange={e => setFormData({...formData, actionTaken: e.target.value})}
              >
                <option value="">Select Action</option>
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Fluid Consumables */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Fluid Consumables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Engine Oil (L)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.engineOil}
                onChange={e => setFormData({...formData, engineOil: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hydraulic Oil (L)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.hydraulicOil}
                onChange={e => setFormData({...formData, hydraulicOil: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Transmission Oil (L)</label>
              <input
                type="number"
                step="0.1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.transmissionOil}
                onChange={e => setFormData({...formData, transmissionOil: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Attachments</h2>
          <div className="flex gap-4">
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Upload className="w-4 h-4" /> Upload Photo
            </button>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Submit Maintenance Log
        </button>
      </form>
    </div>
  )
}
