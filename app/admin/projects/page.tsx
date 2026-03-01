'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, MapPin, User, X, MoreVertical, Trash2, Edit } from 'lucide-react'

const initialProjects = [
  {
    id: 1,
    name: 'Gold Mine Project A',
    location: 'Nevada, USA',
    client: 'Golden Resources Inc.',
    status: 'ACTIVE',
    rigs: 2,
    drillers: 2,
    supervisors: 1,
    bits: 2
  },
  {
    id: 2,
    name: 'Copper Exploration Site',
    location: 'Chile',
    client: 'CopperCorp Mining',
    status: 'ACTIVE',
    rigs: 1,
    drillers: 1,
    supervisors: 1,
    bits: 0
  },
  {
    id: 3,
    name: 'Iron Ore Site B',
    location: 'Western Australia',
    client: 'Iron Mountain Ltd',
    status: 'ON_HOLD',
    rigs: 0,
    drillers: 0,
    supervisors: 0,
    bits: 0
  }
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    client: '',
    status: 'ACTIVE'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProject = {
      id: projects.length + 1,
      ...formData,
      rigs: 0,
      drillers: 0,
      supervisors: 0,
      bits: 0
    }
    setProjects([...projects, newProject])
    setShowModal(false)
    setFormData({ name: '', location: '', client: '', status: 'ACTIVE' })
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
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

      {/* Projects Grid */}
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
            <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{project.name}</h3>
            <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-4">
              <MapPin className="w-4 h-4" />
              {project.location}
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-4">
              <User className="w-4 h-4" />
              Client: {project.client}
            </div>
            <button className="w-full py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg font-medium hover:bg-[#3B82F6]/20 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Manage Resources
            </button>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1E293B]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F8FAFC]">{project.rigs}</p>
                <p className="text-xs text-[#64748B]">Rigs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F8FAFC]">{project.drillers}</p>
                <p className="text-xs text-[#64748B]">Drillers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F8FAFC]">{project.supervisors}</p>
                <p className="text-xs text-[#64748B]">Supervisors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#F8FAFC]">{project.bits}</p>
                <p className="text-xs text-[#64748B]">Bits</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-6 rounded-2xl bg-[#111827] border border-[#1E293B] shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Create New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-[#64748B] hover:text-[#F8FAFC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Project Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  placeholder="Enter project name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Location *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Status</label>
                <select
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE" className="bg-[#1A2234]">Active</option>
                  <option value="ON_HOLD" className="bg-[#1A2234]">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Client Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  placeholder="Enter client name"
                  value={formData.client}
                  onChange={e => setFormData({...formData, client: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-[#1E293B] text-[#94A3B8] rounded-xl font-medium hover:bg-[#1A2234] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-xl font-medium shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all"
                >
                  Create & Add Resources
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
