'use client'

import { useState } from 'react'
import { Plus, FolderOpen, MapPin, User } from 'lucide-react'

// Mock projects - using any type to avoid TypeScript strict issues
const initialProjects: any[] = [
  {
    id: '1',
    name: 'Gold Mine Project A',
    location: 'Nevada, USA',
    status: 'ACTIVE',
    clientName: 'Golden Resources Inc.',
    createdAt: new Date('2024-01-10'),
    rigs: 2,
    drillers: 4,
    supervisors: 2,
    bits: 12
  },
  {
    id: '2',
    name: 'Copper Exploration Site',
    location: 'Chile',
    status: 'ACTIVE',
    clientName: 'CopperCorp Mining',
    createdAt: new Date('2024-01-15'),
    rigs: 2,
    drillers: 3,
    supervisors: 1,
    bits: 8
  },
  {
    id: '3',
    name: 'Iron Ore Site B',
    location: 'Western Australia',
    status: 'ON_HOLD',
    clientName: 'Iron Mountain Ltd',
    createdAt: new Date('2024-02-01'),
    rigs: 1,
    drillers: 2,
    supervisors: 1,
    bits: 6
  }
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>(initialProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    status: 'ACTIVE',
    clientName: ''
  })

  const handleCreateProject = () => {
    const project = {
      id: String(projects.length + 1),
      name: newProject.name,
      location: newProject.location,
      status: newProject.status,
      clientName: newProject.clientName || null,
      createdAt: new Date(),
      rigs: 0,
      drillers: 0,
      supervisors: 0,
      bits: 0
    }
    setProjects([...projects, project])
    setNewProject({ name: '', location: '', status: 'ACTIVE', clientName: '' })
    setShowCreateModal(false)
  }

  const openProjectDetail = (project: any) => {
    setSelectedProject(project)
    setShowDetailModal(true)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Manage drilling projects and associated resources</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => openProjectDetail(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                project.status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {project.status}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <MapPin className="w-4 h-4" />
              {project.location}
            </div>

            {project.clientName && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <User className="w-4 h-4" />
                Client: {project.clientName}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{project.rigs}</p>
                <p className="text-xs text-slate-500">Rigs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{project.drillers}</p>
                <p className="text-xs text-slate-500">Drillers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{project.supervisors}</p>
                <p className="text-xs text-slate-500">Supervisors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{project.bits}</p>
                <p className="text-xs text-slate-500">Bits</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newProject.location}
                  onChange={e => setNewProject({...newProject, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newProject.status}
                  onChange={e => setNewProject({...newProject, status: e.target.value})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newProject.clientName}
                  onChange={e => setNewProject({...newProject, clientName: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name || !newProject.location}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedProject.name}</h2>
                <p className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedProject.location}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <p className="text-slate-500">
                Resource management would open here with forms for Rigs, Drillers, Supervisors, and Bits.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
