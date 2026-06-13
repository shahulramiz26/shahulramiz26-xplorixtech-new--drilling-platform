'use client'

import { useState } from 'react'
import { ArrowLeft, Users, Truck, Circle, Search, Trash2, Plus, X, Target } from 'lucide-react'

type Personnel = { id: string; name: string; email: string; type: string; status: string }
type Rig = { id: string; name: string; type: string; status: string }
type Bit = { id: string; code: string; name: string; type: string; holeSize: string; status: string }
type Hole = { id: string; holeNumber: string; status: 'OPEN' | 'CLOSED' }
type Project = {
  id: number; name: string; code: string; location: string; client: string; status: string
  rigs: Rig[]; supervisors: Personnel[]; drillers: Personnel[]; bits: Bit[]; holes: Hole[]
}

interface Props {
  project: Project
  availableSupervisors: { id: string; name: string }[]
  availableDrillers: { id: string; name: string }[]
  availableRigs: { id: string; code: string; type: string }[]
  availableBits: { id: string; code: string; name: string; type: string; holeSize: string }[]
  onUpdate: (p: Project) => void
  onBack: () => void
}

const tabClass = (active: boolean) =>
  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
    active ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
  }`

export default function ManageResources({ project, availableSupervisors, availableDrillers, availableRigs, availableBits, onUpdate, onBack }: Props) {
  const [tab, setTab] = useState<'personnel' | 'rigs' | 'bits' | 'holes'>('personnel')
  const [personnelTab, setPersonnelTab] = useState<'supervisors' | 'drillers'>('supervisors')
  const [search, setSearch] = useState('')

  // Modals
  const [showNewSupervisorModal, setShowNewSupervisorModal] = useState(false)
  const [showNewDrillerModal, setShowNewDrillerModal] = useState(false)
  const [showNewRigModal, setShowNewRigModal] = useState(false)
  const [showNewBitModal, setShowNewBitModal] = useState(false)
  const [showNewHoleModal, setShowNewHoleModal] = useState(false)

  // New forms
  const [newSupForm, setNewSupForm] = useState({ name: '', email: '' })
  const [newDrillerForm, setNewDrillerForm] = useState({ name: '' })
  const [newRigForm, setNewRigForm] = useState({ code: '', type: 'CORE' })
  const [newBitForm, setNewBitForm] = useState({ code: '', name: '', type: 'SURFACE_SET', holeSize: 'NQ' })
  const [newHoleForm, setNewHoleForm] = useState({ holeNumber: '' })

  const update = (changes: Partial<Project>) => onUpdate({ ...project, ...changes })

  // ── PERSONNEL ──
  const assignedIds = [...project.supervisors, ...project.drillers].map(p => p.id)
  const poolSups = availableSupervisors.filter(s =>
    !project.supervisors.find(x => x.id === s.id) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )
  const poolDrillers = availableDrillers.filter(d =>
    !project.drillers.find(x => x.id === d.id) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const assignSupervisor = (s: { id: string; name: string }) => {
    update({ supervisors: [...project.supervisors, { id: s.id, name: s.name, email: '—', type: 'SUPERVISOR', status: 'ACTIVE' }] })
  }
  const assignDriller = (d: { id: string; name: string }) => {
    update({ drillers: [...project.drillers, { id: d.id, name: d.name, email: '—', type: 'DRILLER', status: 'ACTIVE' }] })
  }
  const removeSupervisor = (id: string) => update({ supervisors: project.supervisors.filter(s => s.id !== id) })
  const removeDriller = (id: string) => update({ drillers: project.drillers.filter(d => d.id !== id) })

  const addNewSupervisor = () => {
    if (!newSupForm.name.trim()) return
    const newS: Personnel = { id: Date.now().toString(), name: newSupForm.name.toUpperCase(), email: newSupForm.email || '—', type: 'SUPERVISOR', status: 'ACTIVE' }
    update({ supervisors: [...project.supervisors, newS] })
    setNewSupForm({ name: '', email: '' })
    setShowNewSupervisorModal(false)
  }
  const addNewDriller = () => {
    if (!newDrillerForm.name.trim()) return
    const newD: Personnel = { id: Date.now().toString(), name: newDrillerForm.name.toUpperCase(), email: '—', type: 'DRILLER', status: 'ACTIVE' }
    update({ drillers: [...project.drillers, newD] })
    setNewDrillerForm({ name: '' })
    setShowNewDrillerModal(false)
  }

  // ── RIGS ──
  const poolRigs = availableRigs.filter(r =>
    !project.rigs.find(x => x.id === r.id)
  )
  const assignRig = (r: { id: string; code: string; type: string }) => {
    update({ rigs: [...project.rigs, { id: r.id, name: '—', type: r.type, status: 'ACTIVE' }] })
  }
  const removeRig = (id: string) => update({ rigs: project.rigs.filter(r => r.id !== id) })
  const addNewRig = () => {
    if (!newRigForm.code.trim()) return
    const newR: Rig = { id: Date.now().toString(), name: newRigForm.code, type: newRigForm.type, status: 'ACTIVE' }
    update({ rigs: [...project.rigs, newR] })
    setNewRigForm({ code: '', type: 'CORE' })
    setShowNewRigModal(false)
  }

  // ── BITS ──
  const poolBits = availableBits.filter(b => !project.bits.find(x => x.id === b.id))
  const assignBit = (b: typeof availableBits[0]) => {
    update({ bits: [...project.bits, { ...b, status: 'ACTIVE' }] })
  }
  const removeBit = (id: string) => update({ bits: project.bits.filter(b => b.id !== id) })
  const addNewBit = () => {
    if (!newBitForm.code.trim()) return
    const newB: Bit = { id: Date.now().toString(), ...newBitForm, status: 'ACTIVE' }
    update({ bits: [...project.bits, newB] })
    setNewBitForm({ code: '', name: '', type: 'SURFACE_SET', holeSize: 'NQ' })
    setShowNewBitModal(false)
  }

  // ── HOLES ──
  const addNewHole = () => {
    if (!newHoleForm.holeNumber.trim()) return
    if (project.holes.find(h => h.holeNumber === newHoleForm.holeNumber)) return
    const newH: Hole = { id: Date.now().toString(), holeNumber: newHoleForm.holeNumber.toUpperCase(), status: 'OPEN' }
    update({ holes: [...(project.holes || []), newH] })
    setNewHoleForm({ holeNumber: '' })
    setShowNewHoleModal(false)
  }
  const toggleHoleStatus = (id: string) => {
    update({ holes: project.holes.map(h => h.id === id ? { ...h, status: h.status === 'OPEN' ? 'CLOSED' : 'OPEN' } : h) })
  }
  const removeHole = (id: string) => update({ holes: project.holes.filter(h => h.id !== id) })

  const inputCls = "w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] outline-none transition-all"
  const selectCls = "w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] outline-none transition-all appearance-none"

  return (
    <div className="space-y-6 pb-8">
      {/* Back + Title */}
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] transition mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">{project.name}</h1>
        <p className="text-[#64748B] text-sm mt-1">{project.code}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111827] border border-[#1E293B] rounded-2xl w-fit">
        <button onClick={() => setTab('personnel')} className={tabClass(tab === 'personnel')}>
          <Users className="w-4 h-4" /> Personnel
        </button>
        <button onClick={() => setTab('rigs')} className={tabClass(tab === 'rigs')}>
          <Truck className="w-4 h-4" /> Rigs
        </button>
        <button onClick={() => setTab('bits')} className={tabClass(tab === 'bits')}>
          <Circle className="w-4 h-4" /> Bits
        </button>
        <button onClick={() => setTab('holes')} className={tabClass(tab === 'holes')}>
          <Target className="w-4 h-4" /> Holes
        </button>
      </div>

      {/* ── PERSONNEL TAB ── */}
      {tab === 'personnel' && (
        <div className="space-y-4">
          {/* Assign panel */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#94A3B8]">Assign Personnel</p>
              <button
                onClick={() => personnelTab === 'supervisors' ? setShowNewSupervisorModal(true) : setShowNewDrillerModal(true)}
                className="text-[#3B82F6] text-sm font-medium flex items-center gap-1 hover:text-[#60A5FA] transition"
              >
                <Plus className="w-4 h-4" />
                New {personnelTab === 'supervisors' ? 'Supervisor' : 'Driller'}
              </button>
            </div>
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setPersonnelTab('supervisors'); setSearch('') }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${personnelTab === 'supervisors' ? 'bg-[#3B82F6] text-white' : 'bg-[#1A2234] text-[#94A3B8] hover:text-white'}`}>
                Supervisors
              </button>
              <button onClick={() => { setPersonnelTab('drillers'); setSearch('') }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${personnelTab === 'drillers' ? 'bg-[#F59E0B] text-white' : 'bg-[#1A2234] text-[#94A3B8] hover:text-white'}`}>
                Drillers
              </button>
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input type="text" placeholder="Search by name..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#4B5563] focus:border-[#3B82F6] outline-none text-sm"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {/* Pool list */}
            <div className="max-h-48 overflow-y-auto divide-y divide-[#1E293B]">
              {(personnelTab === 'supervisors' ? poolSups : poolDrillers).length === 0
                ? <p className="text-[#4B5563] text-sm py-4 text-center">No available {personnelTab}</p>
                : (personnelTab === 'supervisors' ? poolSups : poolDrillers).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3 px-1">
                    <span className="text-sm font-semibold text-[#F8FAFC]">{p.name}</span>
                    <button
                      onClick={() => personnelTab === 'supervisors' ? assignSupervisor(p) : assignDriller(p)}
                      className="text-[#3B82F6] text-sm font-medium hover:text-[#60A5FA] transition"
                    >Assign</button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Assigned table */}
          <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {[...project.supervisors, ...project.drillers].length === 0
                  ? <tr><td colSpan={5} className="px-5 py-8 text-center text-[#4B5563] text-sm">No personnel assigned yet</td></tr>
                  : [...project.supervisors, ...project.drillers].map(p => (
                    <tr key={p.id} className="hover:bg-[#1A2234]/50 transition">
                      <td className="px-5 py-4 font-semibold text-[#F8FAFC] text-sm">{p.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          p.type === 'SUPERVISOR' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        }`}>
                          {p.type === 'SUPERVISOR' ? '👤' : '⛏️'} {p.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">{p.email}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => p.type === 'SUPERVISOR' ? removeSupervisor(p.id) : removeDriller(p.id)}
                          className="p-1.5 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RIGS TAB ── */}
      {tab === 'rigs' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#94A3B8]">Assign Rig</p>
              <button onClick={() => setShowNewRigModal(true)}
                className="text-[#3B82F6] text-sm font-medium flex items-center gap-1 hover:text-[#60A5FA] transition">
                <Plus className="w-4 h-4" /> New Rig
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-[#1E293B]">
              {poolRigs.length === 0
                ? <p className="text-[#4B5563] text-sm py-4 text-center">No available rigs</p>
                : poolRigs.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-3 px-1">
                    <div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">{r.code}</span>
                      <span className="text-xs text-[#64748B] ml-2">{r.type}</span>
                    </div>
                    <button onClick={() => assignRig(r)} className="text-[#3B82F6] text-sm font-medium hover:text-[#60A5FA] transition">Assign</button>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {project.rigs.length === 0
                  ? <tr><td colSpan={5} className="px-5 py-8 text-center text-[#4B5563] text-sm">No rigs assigned yet</td></tr>
                  : project.rigs.map(r => (
                    <tr key={r.id} className="hover:bg-[#1A2234]/50 transition">
                      <td className="px-5 py-4 font-bold text-[#F8FAFC] text-sm">{r.id.startsWith('ar') ? availableRigs.find(x => x.id === r.id)?.code || r.name : r.name}</td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">—</td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">{r.type}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => removeRig(r.id)}
                          className="p-1.5 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BITS TAB ── */}
      {tab === 'bits' && (
        <div className="space-y-4">
          {/* Assign Bit panel */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#94A3B8]">Assign Bit</p>
              <button onClick={() => setShowNewBitModal(true)}
                className="text-[#3B82F6] text-sm font-medium flex items-center gap-1 hover:text-[#60A5FA] transition">
                <Plus className="w-4 h-4" /> New Bit
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-[#1E293B]">
              {poolBits.length === 0
                ? <p className="text-[#4B5563] text-sm py-4 text-center">No available bits</p>
                : poolBits.map(b => (
                  <div key={b.id} className="flex items-center justify-between py-3 px-1">
                    <div>
                      <span className="text-sm font-semibold text-[#F8FAFC]">{b.code}</span>
                      <span className="text-xs text-[#64748B] ml-2">{b.name} · {b.holeSize}</span>
                    </div>
                    <button onClick={() => assignBit(b)} className="text-[#3B82F6] text-sm font-medium hover:text-[#60A5FA] transition">Assign</button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Assigned Bits table */}
          <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#1E293B]">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Hole Size</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {project.bits.length === 0
                  ? <tr><td colSpan={6} className="px-5 py-8 text-center text-[#4B5563] text-sm">No bits assigned yet</td></tr>
                  : project.bits.map(b => (
                    <tr key={b.id} className="hover:bg-[#1A2234]/50 transition">
                      <td className="px-5 py-4 font-bold text-[#F8FAFC] text-sm">{b.code}</td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">{b.name}</td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">{b.type}</td>
                      <td className="px-5 py-4 text-[#94A3B8] text-sm">{b.holeSize}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => removeBit(b.id)}
                          className="p-1.5 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HOLES TAB ── */}
      {tab === 'holes' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Hole Numbers</p>
                <p className="text-xs text-[#64748B] mt-0.5">Assigned holes appear in the Drilling Log dropdown (both open and closed)</p>
              </div>
              <button onClick={() => setShowNewHoleModal(true)}
                className="text-[#3B82F6] text-sm font-medium flex items-center gap-1 hover:text-[#60A5FA] transition">
                <Plus className="w-4 h-4" /> Add Hole
              </button>
            </div>
            {(project.holes || []).length === 0
              ? <p className="text-[#4B5563] text-sm text-center py-6">No holes added yet</p>
              : (
                <div className="divide-y divide-[#1E293B]">
                  {project.holes.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#F8FAFC]">{h.holeNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          h.status === 'OPEN'
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'OPEN' ? 'bg-[#10B981]' : 'bg-[#64748B]'}`} />
                          {h.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleHoleStatus(h.id)}
                          className="text-xs px-3 py-1 rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6] transition"
                        >
                          {h.status === 'OPEN' ? 'Mark Closed' : 'Reopen'}
                        </button>
                        <button onClick={() => removeHole(h.id)}
                          className="p-1.5 text-[#64748B] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {[
        { show: showNewSupervisorModal, title: 'Add New Supervisor', onClose: () => setShowNewSupervisorModal(false), onSave: addNewSupervisor, body: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Full Name *</label>
              <input type="text" className={inputCls} placeholder="Enter name"
                value={newSupForm.name} onChange={e => setNewSupForm({...newSupForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Email (Optional)</label>
              <input type="email" className={inputCls} placeholder="Enter email"
                value={newSupForm.email} onChange={e => setNewSupForm({...newSupForm, email: e.target.value})} />
            </div>
          </div>
        )},
        { show: showNewDrillerModal, title: 'Add New Driller', onClose: () => setShowNewDrillerModal(false), onSave: addNewDriller, body: (
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Full Name *</label>
            <input type="text" className={inputCls} placeholder="Enter name"
              value={newDrillerForm.name} onChange={e => setNewDrillerForm({...newDrillerForm, name: e.target.value})} />
          </div>
        )},
        { show: showNewRigModal, title: 'Add New Rig', onClose: () => setShowNewRigModal(false), onSave: addNewRig, body: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Rig Code *</label>
              <input type="text" className={inputCls} placeholder="e.g. KEM-15"
                value={newRigForm.code} onChange={e => setNewRigForm({...newRigForm, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Type</label>
              <select className={selectCls} value={newRigForm.type} onChange={e => setNewRigForm({...newRigForm, type: e.target.value})}>
                {['CORE', 'DTH', 'RC', 'BLAST_HOLE'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )},
        { show: showNewBitModal, title: 'Add New Bit', onClose: () => setShowNewBitModal(false), onSave: addNewBit, body: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Bit Code *</label>
              <input type="text" className={inputCls} placeholder="e.g. SS-NQ-15/32"
                value={newBitForm.code} onChange={e => setNewBitForm({...newBitForm, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2">Bit Name</label>
              <input type="text" className={inputCls} placeholder="e.g. NQ S/S CORE BIT SR-15/32"
                value={newBitForm.name} onChange={e => setNewBitForm({...newBitForm, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Type</label>
                <select className={selectCls} value={newBitForm.type} onChange={e => setNewBitForm({...newBitForm, type: e.target.value})}>
                  {['SURFACE_SET', 'IMPREGNATED', 'PDC_CORE', 'DTH', 'TRICONE'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Hole Size</label>
                <select className={selectCls} value={newBitForm.holeSize} onChange={e => setNewBitForm({...newBitForm, holeSize: e.target.value})}>
                  {['NQ', 'HQ', 'PQ', 'BQ', 'AQ'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )},
        { show: showNewHoleModal, title: 'Add Hole Number', onClose: () => setShowNewHoleModal(false), onSave: addNewHole, body: (
          <div>
            <label className="block text-sm text-[#94A3B8] mb-2">Hole Number *</label>
            <input type="text" className={inputCls} placeholder="e.g. H1, BH-001"
              value={newHoleForm.holeNumber} onChange={e => setNewHoleForm({holeNumber: e.target.value})} />
            <p className="text-xs text-[#64748B] mt-2">This hole will appear in the Drilling Log dropdown for this project</p>
          </div>
        )},
      ].map((m, i) => m.show && (
        <div key={i} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111827] border border-[#1E293B] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#F8FAFC]">{m.title}</h2>
              <button onClick={m.onClose} className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] transition"><X className="w-5 h-5" /></button>
            </div>
            {m.body}
            <div className="flex gap-3 mt-5">
              <button onClick={m.onClose}
                className="flex-1 py-2.5 border border-[#1E293B] text-[#94A3B8] rounded-xl text-sm font-medium hover:bg-[#1A2234] transition">
                Cancel
              </button>
              <button onClick={m.onSave}
                className="flex-1 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-medium hover:bg-[#2563EB] transition">
                Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

