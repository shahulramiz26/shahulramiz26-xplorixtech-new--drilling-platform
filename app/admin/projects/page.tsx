'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, MapPin, User, Power, PauseCircle, PlayCircle, MoreVertical, Trash2, Edit, X, ChevronRight, CheckCircle } from 'lucide-react'

// Types
interface Rig {
  id: string
  rigId: string
  rigType: string
  status: string
}

interface Driller {
  id: string
  name: string
  drillerType: string
  phone: string
  emergencyContact: string
}

interface Supervisor {
  id: string
  name: string
  supervisorType: string
  phone: string
  emergencyContact: string
}

interface Bit {
  id: string
  bitId: string
  bitType: string
  bitSize: string
  manufacturer: string
  purchasePrice: string
}

interface Project {
  id: string
  name: string
  location: string
  status: string
  clientName: string | null
  createdAt: Date
  rigs: Rig[]
  drillers: Driller[]
  supervisors: Supervisor[]
  bits: Bit[]
}

// Mock projects with resources
const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Gold Mine Project A',
    location: 'Nevada, USA',
    status: 'ACTIVE',
    clientName: 'Golden Resources Inc.',
    createdAt: new Date('2024-01-10'),
    rigs: [
      { id: '1', rigId: 'RIG-001', rigType: 'CORE', status: 'ACTIVE' },
      { id: '2', rigId: 'RIG-002', rigType: 'RC', status: 'ACTIVE' }
    ],
    drillers: [
      { id: '1', name: 'Mike Johnson', drillerType: 'CORE', phone: '+1-555-0101', emergencyContact: '+1-555-0102' },
      { id: '2', name: 'David Brown', drillerType: 'RC', phone: '+1-555-0103', emergencyContact: '+1-555-0104' }
    ],
    supervisors: [
      { id: '1', name: 'John Smith', supervisorType: 'CORE', phone: '+1-555-0201', emergencyContact: '+1-555-0202' }
    ],
    bits: [
      { id: '1', bitId: 'BIT-001', bitType: 'SURFACE_SET', bitSize: 'HQ', manufacturer: 'Atlas Copco', purchasePrice: '2500' },
      { id: '2', bitId: 'BIT-002', bitType: 'IMPREGNATED', bitSize: 'NQ', manufacturer: 'Boart Longyear', purchasePrice: '3200' }
    ]
  },
  {
    id: '2',
    name: 'Copper Exploration Site',
    location: 'Chile',
    status: 'ACTIVE',
    clientName: 'CopperCorp Mining',
    createdAt: new Date('2024-01-15'),
    rigs: [
      { id: '3', rigId: 'RIG-003', rigType: 'CORE', status: 'ACTIVE' }
    ],
    drillers: [
      { id: '3', name: 'Chris Wilson', drillerType: 'CORE', phone: '+56-2-5555-0101', emergencyContact: '+56-2-5555-0102' }
    ],
    supervisors: [],
    bits: []
  },
  {
    id: '3',
    name: 'Iron Ore Site B',
    location: 'Western Australia',
    status: 'ON_HOLD',
    clientName: 'Iron Mountain Ltd',
    createdAt: new Date('2024-02-01'),
    rigs: [],
    drillers: [],
    supervisors: [],
    bits: []
  }
]

const statusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800', icon: PlayCircle },
  { value: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-100 text-amber-800', icon: PauseCircle },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-slate-100 text-slate-800', icon: CheckCircle },
  { value: 'INACTIVE', label: 'Inactive', color: 'bg-red-100 text-red-800', icon: Power }
]

const rigTypes = ['CORE', 'RC', 'BLAST_HOLE']
const bitTypes = ['SURFACE_SET', 'IMPREGNATED', 'PDC_CORE', 'DTH', 'TRICONE']
const bitSizes = ['AQ', 'BQ', 'NQ', 'HQ', 'PQ', '4.5"', '5"', '5.5"', '6"', '6.5"', '8"', '9"', '12"']

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null)
  const [activeResourceTab, setActiveResourceTab] = useState('rigs')
  const [newProject, setNewProject] = useState({
    name: '',
    location: '',
    status: 'ACTIVE',
    clientName: ''
  })

  // Resource states for "Add More" functionality
  const [rigs, setRigs] = useState<Rig[]>([])
  const [drillers, setDrillers] = useState<Driller[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [bits, setBits] = useState<Bit[]>([])

  // Single item states
  const [newRig, setNewRig] = useState({ rigId: '', rigType: 'CORE', status: 'ACTIVE' })
  const [newDriller, setNewDriller] = useState({ name: '', drillerType: 'CORE', phone: '', emergencyContact: '' })
  const [newSupervisor, setNewSupervisor] = useState({ name: '', supervisorType: 'CORE', phone: '', emergencyContact: '' })
  const [newBit, setNewBit] = useState({ bitId: '', bitType: 'SURFACE_SET', bitSize: 'HQ', manufacturer: '', purchasePrice: '' })

  const handleCreateProject = () => {
    const project: Project = {
      id: String(projects.length + 1),
      name: newProject.name,
      location: newProject.location,
      status: newProject.status,
      clientName: newProject.clientName || null,
      createdAt: new Date(),
      rigs: [],
      drillers: [],
      supervisors: [],
      bits: []
    }
    setProjects([...projects, project])
    setNewProject({ name: '', location: '', status: 'ACTIVE', clientName: '' })
    setShowCreateModal(false)
    
    // Open resource modal for the new project
    setSelectedProject(project)
    setRigs([])
    setDrillers([])
    setSupervisors([])
    setBits([])
    setActiveResourceTab('rigs')
    setShowResourceModal(true)
  }

  const openResourceModal = (project: Project) => {
    setSelectedProject(project)
    setRigs(project.rigs || [])
    setDrillers(project.drillers || [])
    setSupervisors(project.supervisors || [])
    setBits(project.bits || [])
    setActiveResourceTab('rigs')
    setShowResourceModal(true)
  }

  const saveResources = () => {
    if (selectedProject) {
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, rigs, drillers, supervisors, bits }
          : p
      ))
    }
    setShowResourceModal(false)
    setSelectedProject(null)
  }

  // Add More functions
  const addRig = () => {
    if (newRig.rigId) {
      setRigs([...rigs, { ...newRig, id: Date.now().toString() }])
      setNewRig({ rigId: '', rigType: 'CORE', status: 'ACTIVE' })
    }
  }

  const addDriller = () => {
    if (newDriller.name && newDriller.emergencyContact) {
      setDrillers([...drillers, { ...newDriller, id: Date.now().toString() }])
      setNewDriller({ name: '', drillerType: 'CORE', phone: '', emergencyContact: '' })
    }
  }

  const addSupervisor = () => {
    if (newSupervisor.name && newSupervisor.emergencyContact) {
      setSupervisors([...supervisors, { ...newSupervisor, id: Date.now().toString() }])
      setNewSupervisor({ name: '', supervisorType: 'CORE', phone: '', emergencyContact: '' })
    }
  }

  const addBit = () => {
    if (newBit.bitId && newBit.manufacturer && newBit.purchasePrice) {
      setBits([...bits, { ...newBit, id: Date.now().toString() }])
      setNewBit({ bitId: '', bitType: 'SURFACE_SET', bitSize: 'HQ', manufacturer: '', purchasePrice: '' })
    }
  }

  // Remove functions
  const removeRig = (id: string) => setRigs(rigs.filter(r => r.id !== id))
  const removeDriller = (id: string) => setDrillers(drillers.filter(d => d.id !== id))
  const removeSupervisor = (id: string) => setSupervisors(supervisors.filter(s => s.id !== id))
  const removeBit = (id: string) => setBits(bits.filter(b => b.id !== id))

  const updateProjectStatus = (projectId: string, newStatus: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    ))
    setShowStatusMenu(null)
  }

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId))
    }
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Manage drilling projects and associated resources</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const statusConfig = getStatusConfig(project.status)
          const StatusIcon = statusConfig.icon
          return (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(showStatusMenu === project.id ? null : project.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    
                    {showStatusMenu === project.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                          <p className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">Change Status</p>
                          {statusOptions.map(option => {
                            const OptionIcon = option.icon
                            return (
                              <button
                                key={option.value}
                                onClick={() => updateProjectStatus(project.id, option.value)}
                                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 transition ${
                                  project.status === option.value ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                                }`}
                              >
                                <OptionIcon className="w-4 h-4" />
                                {option.label}
                                {project.status === option.value && <span className="ml-auto text-xs">✓</span>}
                              </button>
                            )
                          })}
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                              onClick={() => { setShowStatusMenu(null); openResourceModal(project); }}
                              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                              Manage Resources
                            </button>
                            <button
                              onClick={() => { setShowStatusMenu(null); deleteProject(project.id); }}
                              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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

              {/* Manage Resources Button */}
              <button
                onClick={() => openResourceModal(project)}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Manage Resources
              </button>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.rigs.length}</p>
                  <p className="text-xs text-slate-500">Rigs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.drillers.length}</p>
                  <p className="text-xs text-slate-500">Drillers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.supervisors.length}</p>
                  <p className="text-xs text-slate-500">Supervisors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{project.bits.length}</p>
                  <p className="text-xs text-slate-500">Bits</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newProject.location}
                  onChange={e => setNewProject({...newProject, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newProject.status}
                  onChange={e => setNewProject({...newProject, status: e.target.value})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                Create & Add Resources
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Management Modal */}
      {showResourceModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage Resources</h2>
                <p className="text-slate-600">{selectedProject.name} - {selectedProject.location}</p>
              </div>
              <button onClick={() => setShowResourceModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resource Tabs */}
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200">
                {[
                  { id: 'rigs', label: `Rigs (${rigs.length})`, icon: '🔧' },
                  { id: 'drillers', label: `Drillers (${drillers.length})`, icon: '👷' },
                  { id: 'supervisors', label: `Supervisors (${supervisors.length})`, icon: '👔' },
                  { id: 'bits', label: `Bits (${bits.length})`, icon: '⚙️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveResourceTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                      activeResourceTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Rigs Tab */}
              {activeResourceTab === 'rigs' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Add Rigs</h3>
                  
                  {/* Add Rig Form */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rig ID *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newRig.rigId}
                          onChange={e => setNewRig({...newRig, rigId: e.target.value})}
                          placeholder="e.g., RIG-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rig Type *</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newRig.rigType}
                          onChange={e => setNewRig({...newRig, rigType: e.target.value})}
                        >
                          {rigTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newRig.status}
                          onChange={e => setNewRig({...newRig, status: e.target.value})}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={addRig}
                      disabled={!newRig.rigId}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Rig
                    </button>
                  </div>

                  {/* Added Rigs List */}
                  {rigs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Added Rigs ({rigs.length})</h4>
                      {rigs.map(rig => (
                        <div key={rig.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-medium">{rig.rigId}</span>
                            <span className="text-sm text-slate-600">{rig.rigType}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${rig.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                              {rig.status}
                            </span>
                          </div>
                          <button onClick={() => removeRig(rig.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Drillers Tab */}
              {activeResourceTab === 'drillers' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Add Drillers</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newDriller.name}
                          onChange={e => setNewDriller({...newDriller, name: e.target.value})}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Driller Type *</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newDriller.drillerType}
                          onChange={e => setNewDriller({...newDriller, drillerType: e.target.value})}
                        >
                          {rigTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newDriller.phone}
                          onChange={e => setNewDriller({...newDriller, phone: e.target.value})}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newDriller.emergencyContact}
                          onChange={e => setNewDriller({...newDriller, emergencyContact: e.target.value})}
                          placeholder="Emergency contact number"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addDriller}
                      disabled={!newDriller.name || !newDriller.emergencyContact}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Driller
                    </button>
                  </div>

                  {drillers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Added Drillers ({drillers.length})</h4>
                      {drillers.map(driller => (
                        <div key={driller.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                          <div>
                            <span className="font-medium">{driller.name}</span>
                            <span className="text-sm text-slate-600 ml-3">{driller.drillerType}</span>
                            <div className="text-xs text-slate-500 mt-1">
                              📞 {driller.phone} | 🚨 {driller.emergencyContact}
                            </div>
                          </div>
                          <button onClick={() => removeDriller(driller.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Supervisors Tab */}
              {activeResourceTab === 'supervisors' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Add Supervisors</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newSupervisor.name}
                          onChange={e => setNewSupervisor({...newSupervisor, name: e.target.value})}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Supervisor Type *</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newSupervisor.supervisorType}
                          onChange={e => setNewSupervisor({...newSupervisor, supervisorType: e.target.value})}
                        >
                          {rigTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newSupervisor.phone}
                          onChange={e => setNewSupervisor({...newSupervisor, phone: e.target.value})}
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newSupervisor.emergencyContact}
                          onChange={e => setNewSupervisor({...newSupervisor, emergencyContact: e.target.value})}
                          placeholder="Emergency contact number"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addSupervisor}
                      disabled={!newSupervisor.name || !newSupervisor.emergencyContact}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Supervisor
                    </button>
                  </div>

                  {supervisors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Added Supervisors ({supervisors.length})</h4>
                      {supervisors.map(supervisor => (
                        <div key={supervisor.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                          <div>
                            <span className="font-medium">{supervisor.name}</span>
                            <span className="text-sm text-slate-600 ml-3">{supervisor.supervisorType}</span>
                            <div className="text-xs text-slate-500 mt-1">
                              📞 {supervisor.phone} | 🚨 {supervisor.emergencyContact}
                            </div>
                          </div>
                          <button onClick={() => removeSupervisor(supervisor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bits Tab */}
              {activeResourceTab === 'bits' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Add Bits</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bit ID *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newBit.bitId}
                          onChange={e => setNewBit({...newBit, bitId: e.target.value})}
                          placeholder="e.g., BIT-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bit Type</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newBit.bitType}
                          onChange={e => setNewBit({...newBit, bitType: e.target.value})}
                        >
                          {bitTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bit Size</label>
                        <select
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newBit.bitSize}
                          onChange={e => setNewBit({...newBit, bitSize: e.target.value})}
                        >
                          {bitSizes.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newBit.manufacturer}
                          onChange={e => setNewBit({...newBit, manufacturer: e.target.value})}
                          placeholder="e.g., Atlas Copco"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price * ($)</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={newBit.purchasePrice}
                          onChange={e => setNewBit({...newBit, purchasePrice: e.target.value})}
                          placeholder="Enter price in USD"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addBit}
                      disabled={!newBit.bitId || !newBit.manufacturer || !newBit.purchasePrice}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Bit
                    </button>
                  </div>

                  {bits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Added Bits ({bits.length})</h4>
                      {bits.map(bit => (
                        <div key={bit.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                          <div>
                            <span className="font-mono font-medium">{bit.bitId}</span>
                            <span className="text-sm text-slate-600 ml-3">{bit.bitType.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-slate-500 ml-3">{bit.bitSize}</span>
                            <div className="text-xs text-slate-500 mt-1">
                              🏭 {bit.manufacturer} | 💰 ${bit.purchasePrice}
                            </div>
                          </div>
                          <button onClick={() => removeBit(bit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowResourceModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveResources}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Save All Resources
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
