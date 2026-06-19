'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Save, AlertTriangle, CheckCircle, Plus, Trash2, Paperclip, Upload } from 'lucide-react'

interface Part {
  id: string
  name: string
  quantity: number
  unit: string
}

interface Attachment {
  id: string
  name: string
  size: string
}

export default function MaintenanceLogPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    project: '',
    rig: '',
    date: new Date().toISOString().split('T')[0],
    shift: '',
    maintenanceType: '',
    duration: '',
    component: '',
    action: '',
    cost: '',
    engineOil: '',
    hydraulicOil: '',
    transmissionOil: '',
    notes: '',
  })

  const [parts, setParts] = useState<Part[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // ── Parts Used ──────────────────────────────────────────────
  const addPart = () => {
    setParts(prev => [...prev, { id: crypto.randomUUID(), name: '', quantity: 1, unit: 'pcs' }])
  }

  const updatePart = (id: string, field: keyof Part, value: string | number) => {
    setParts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id))
  }

  // ── Attachments ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Attachment[] = files.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(1)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = () => {
    alert('Maintenance log submitted successfully!')
  }

  // ── Shared input/select styles ───────────────────────────────
  const inputCls = "w-full px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/30 transition-all"
  const labelCls = "block text-sm font-medium text-[#94A3B8] mb-2"

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Record Rig Maintenance</h1>
          <p className="text-[#94A3B8] mt-1">Log maintenance activities, repairs, and service details</p>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
          }}
        >
          <Save className="w-5 h-5" />
          Submit Log
        </button>
      </div>

      {/* ── Basic Details ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{ background: '#111827', border: '1px solid #1E293B' }}
      >
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#F59E0B]" />
          Basic Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Project */}
          <div>
            <label className={labelCls}>Project *</label>
            <select className={inputCls} value={formData.project}
              onChange={e => setFormData({ ...formData, project: e.target.value, rig: '' })}>
              <option value="">Select project...</option>
              <option>Gold Mine Project A</option>
              <option>Copper Exploration Site</option>
            </select>
          </div>

          {/* Rig */}
          <div>
            <label className={labelCls}>Rig *</label>
            <select className={inputCls} value={formData.rig}
              onChange={e => setFormData({ ...formData, rig: e.target.value })}
              disabled={!formData.project}>
              <option value="">{formData.project ? 'Select a rig...' : 'Select a project first'}</option>
              {formData.project && ['RIG-001', 'RIG-002', 'RIG-003'].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </div>

          {/* Shift */}
          <div>
            <label className={labelCls}>Shift *</label>
            <select className={inputCls} value={formData.shift}
              onChange={e => setFormData({ ...formData, shift: e.target.value })}>
              <option value="">Select shift...</option>
              <option>Day</option>
              <option>Night</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── Service Details ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl p-6"
        style={{ background: '#111827', border: '1px solid #1E293B' }}
      >
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          Service Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Maintenance Type */}
          <div>
            <label className={labelCls}>Maintenance Type *</label>
            <select className={inputCls} value={formData.maintenanceType}
              onChange={e => setFormData({ ...formData, maintenanceType: e.target.value })}>
              <option value="">Select type...</option>
              <option>Preventive</option>
              <option>Breakdown</option>
              <option>Scheduled</option>
              <option>Component Replacement</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className={labelCls}>Duration (hours) *</label>
            <input type="number" min="0" step="0.5" className={inputCls}
              placeholder="0" value={formData.duration}
              onChange={e => setFormData({ ...formData, duration: e.target.value })} />
          </div>

          {/* Component Affected */}
          <div>
            <label className={labelCls}>Component Affected *</label>
            <select className={inputCls} value={formData.component}
              onChange={e => setFormData({ ...formData, component: e.target.value })}>
              <option value="">Select component(s)</option>
              <option>Engine</option>
              <option>Hydraulic System</option>
              <option>Electrical</option>
              <option>Transmission</option>
              <option>Mud Pump</option>
              <option>Compressor</option>
            </select>
          </div>

          {/* Action Taken */}
          <div>
            <label className={labelCls}>Action Taken *</label>
            <select className={inputCls} value={formData.action}
              onChange={e => setFormData({ ...formData, action: e.target.value })}>
              <option value="">Select action...</option>
              <option>Repair</option>
              <option>Replace</option>
              <option>Temporary Fix</option>
              <option>Inspection</option>
            </select>
          </div>

          {/* Cost */}
          <div>
            <label className={labelCls}>Cost (USD) *</label>
            <input type="number" min="0" step="0.01" className={inputCls}
              placeholder="0" value={formData.cost}
              onChange={e => setFormData({ ...formData, cost: e.target.value })} />
          </div>
        </div>

        {/* ── Parts Used ── */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 20 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#F8FAFC]">Parts Used</span>
            <button onClick={addPart}
              style={{ color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={14} /> Add
            </button>
          </div>

          {parts.length === 0 ? (
            <p className="text-sm text-[#475569]">No parts added.</p>
          ) : (
            <div className="space-y-3">
              {parts.map(part => (
                <div key={part.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input className={inputCls} placeholder="Part name"
                      value={part.name} onChange={e => updatePart(part.id, 'name', e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="1" className={inputCls} placeholder="Qty"
                      value={part.quantity} onChange={e => updatePart(part.id, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                    <select className={inputCls} value={part.unit}
                      onChange={e => updatePart(part.id, 'unit', e.target.value)}>
                      <option>pcs</option>
                      <option>L</option>
                      <option>kg</option>
                      <option>m</option>
                      <option>set</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removePart(part.id)}
                      style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Fluid Consumables ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: '#111827', border: '1px solid #1E293B' }}
      >
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#10B981]" />
          Fluid Consumables
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelCls}>Engine Oil (L) *</label>
            <input type="number" min="0" step="0.1" className={inputCls}
              placeholder="0" value={formData.engineOil}
              onChange={e => setFormData({ ...formData, engineOil: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Hydraulic Oil (L) *</label>
            <input type="number" min="0" step="0.1" className={inputCls}
              placeholder="0" value={formData.hydraulicOil}
              onChange={e => setFormData({ ...formData, hydraulicOil: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Transmission Oil (L) *</label>
            <input type="number" min="0" step="0.1" className={inputCls}
              placeholder="0" value={formData.transmissionOil}
              onChange={e => setFormData({ ...formData, transmissionOil: e.target.value })} />
          </div>
        </div>
      </motion.div>

      {/* ── Maintenance Attachments ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-6"
        style={{ background: '#111827', border: '1px solid #1E293B' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F8FAFC] flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-[#94A3B8]" />
            Maintenance Attachments
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
              color: '#60A5FA', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Upload size={14} /> Add Files
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange} />
        </div>

        {attachments.length === 0 ? (
          <p className="text-sm text-[#475569]">No attachments added.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: '#0D1117', border: '1px solid #1E293B' }}>
                <div className="flex items-center gap-3">
                  <Paperclip size={14} style={{ color: '#60A5FA' }} />
                  <span className="text-sm text-[#F8FAFC]">{att.name}</span>
                  <span className="text-xs text-[#475569]">{att.size}</span>
                </div>
                <button onClick={() => removeAttachment(att.id)}
                  style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Notes ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl p-6"
        style={{ background: '#111827', border: '1px solid #1E293B' }}
      >
        <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">Notes</h2>
        <textarea
          rows={4}
          className={inputCls}
          placeholder="Describe maintenance work..."
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
        />
      </motion.div>

    </div>
  )
}

