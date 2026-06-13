'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, MapPin, User, X, Settings } from 'lucide-react'
import ManageResources from './manage-resources'

const initialProjects = [
  {
    id: 1,
    name: 'Gold Mine Project A',
    code: 'GMA-001',
    location: 'Nevada, USA',
    client: 'Golden Resources Inc.',
    status: 'ACTIVE',
    rigs: [
      { id: 'RIG-001', name: '—', type: 'CORE', status: 'ACTIVE' },
      { id: 'RIG-002', name: '—', type: 'CORE', status: 'ACTIVE' },
    ],
    supervisors: [
      { id: 's1', name: 'John Smith', email: 'john@example.com', type: 'SUPERVISOR', status: 'ACTIVE' },
    ],
    drillers: [
      { id: 'd1', name: 'Mike Johnson', email: '—', type: 'DRILLER', status: 'ACTIVE' },
      { id: 'd2', name: 'David Chen', email: '—', type: 'DRILLER', status: 'ACTIVE' },
    ],
    bits: [
      { id: 'b1', code: 'SS-NQ-15/32', name: 'NQ S/S CORE BIT SR-15/32', type: 'SURFACE_SET', holeSize: 'NQ', status: 'ACTIVE' },
    ],
    holes: []
  },
  {
    id: 2,
    name: 'Copper Exploration Site',
    code: 'CES-002',
    location: 'Chile',
    client: 'CopperCorp Mining',
    status: 'ACTIVE',
    rigs: [
      { id: 'RIG-003', name: '—', type: 'CORE', status: 'ACTIVE' },
    ],
    supervisors: [
      { id: 's2', name: 'Sarah Davis', email: 'sarah@example.com', type: 'SUPERVISOR', status: 'ACTIVE' },
    ],
    drillers: [
      { id: 'd3', name: 'Robert Williams', email: '—', type: 'DRILLER', status: 'ACTIVE' },
    ],
    bits: [],
    holes: []
  },
  {
    id: 3,
    name: 'Iron Ore Site B',
    code: 'IOB-003',
    location: 'Western Australia',
    client: 'Iron Mountain Ltd',
    status: 'ON_HOLD',
    rigs: [],
    supervisors: [],
    drillers: [],
    bits: [],
    holes: []
  }
]

// Global pool of available resources to assign
const availableSupervisors = [
  { id: 'as1', name: 'SUKANTA MUKHERJEE' }, { id: 'as2', name: 'RAJESH KUMAR NAYAK' },
  { id: 'as3', name: 'BINDER MAAN' }, { id: 'as4', name: 'JAHID KHAN' },
  { id: 'as5', name: 'GULAB PATIL' }, { id: 'as6', name: 'ANIL KUMAR' },
  { id: 'as7', name: 'NAGEN MAHAKHUD' }, { id: 'as8', name: 'MOHAMMAD AFZAL ANSARI' },
]
const availableDrillers = [
  { id: 'ad1', name: 'SIYARAM PATEL' }, { id: 'ad2', name: 'BRAJA NAYAK' },
  { id: 'ad3', name: 'DEERAJ KEWAT' }, { id: 'ad4', name: 'FIROZ SEKH' },
  { id: 'ad5', name: 'HABIB SHEKH' }, { id: 'ad6', name: 'MANOJ NAYAK' },
]
const availableRigs = [
  { id: 'ar1', code: 'KEM-14', type: 'CORE' }, { id: 'ar2', code: 'KEM-13', type: 'CORE' },
  { id: 'ar3', code: 'KEM-02', type: 'CORE' }, { id: 'ar4', code: 'KEM-07', type: 'DTH' },
]
const availableBits = [
  { id: 'ab1', code: 'SS-NQ-15/32', name: 'NQ S/S CORE BIT SR-15/32', type: 'SURFACE_SET', holeSize: 'NQ' },
  { id: 'ab2', code: 'SS-HQ-15/32', name: 'HQ S/S CORE BIT SR-15/32', type: 'SURFACE_SET', holeSize: 'HQ' },
  { id: 'ab3', code: 'CB-HQ-04', name: 'HQ CORE BIT SR-04', type: 'IMPREGNATED', holeSize: 'HQ' },
  { id: 'ab4', code: 'CB-NQ-07', name: 'NQ CORE BIT SR-07', type: 'IMPREGNATED', holeSize: 'NQ' },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<typeof initialProjects[0] | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', location: '', client: '', status: 'ACTIVE' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProject = {
      id: projects.length + 1,
      ...formData,
      rigs: [], supervisors: [], drillers: [], bits: [], holes: []
    }
    setProjects([...projects, newProject])
    setShowModal(false)
    setFormData({ name: '', code: '', location: '', client: '', status: 'ACTIVE' })
  }

  const handleUpdateProject = (updated: typeof initialProjects[0]) => {
    setProjects(projects.map(p => p.id === updated.id ? updated : p))
    setSelectedProject(updated)
  }

  if (selectedProject) {
    const fresh = projects.find(p => p.id === selectedProject.id) || selectedProject
    return (
      <ManageResources
        project={fresh}
        availableSupervisors={availableSupervisors}
        availableDrillers={availableDrillers}
        availableRigs={availableRigs}
        availableBits={availableBits}
        onUpdate={handleUpdateProject}
        onBack={() => setSelectedProject(null)}
      />
    )
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Projects</h1>
          <p className="text-[#94A3B8] mt-2">Manage your drilling projects and allocate resources</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B] hover:border-[#3B82F6]/30 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'ACTIVE'
                  ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
              }`}>
                {project.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">{project.name}</h3>
            {project.code && <p className="text-xs text-[#64748B] mb-3">{project.code}</p>}
            <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-2">
              <MapPin className="w-4 h-4" />{project.location}
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-4">
              <User className="w-4 h-4" />Client: {project.client}
            </div>
            <button
              onClick={() => setSelectedProject(project)}
              className="w-full py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg font-medium hover:bg-[#3B82F6]/20 transition flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Resources
            </button>
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#1E293B]">
              {[
                { label: 'Rigs', val: project.rigs.length },
                { label: 'Drillers', val: project.drillers.length },
                { label: 'Supervisors', val: project.supervisors.length },
                { label: 'Bits', val: project.bits.length },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="text-xl font-bold text-[#F8FAFC]">{item.val}</p>
                  <p className="text-xs text-[#64748B]">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 rounded-2xl bg-[#111827] border border-[#1E293B] shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Create New Project</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-[#64748B] hover:text-[#F8FAFC] transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Project Name *</label>
                <input type="text" required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] transition-all"
                  placeholder="Enter project name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Project Code *</label>
                <input type="text" required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] transition-all"
                  placeholder="e.g. CMPDI-DAM"
                  value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Location *</label>
                <input type="text" required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] transition-all"
                  placeholder="Enter location"
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Client Name (Optional)</label>
                <input type="text"
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] transition-all"
                  placeholder="Enter client name"
                  value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Status</label>
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] transition-all"
                  value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="ACTIVE" className="bg-[#1A2234]">Active</option>
                  <option value="ON_HOLD" className="bg-[#1A2234]">On Hold</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-[#1E293B] text-[#94A3B8] rounded-xl font-medium hover:bg-[#1A2234] transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-medium shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all">
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

