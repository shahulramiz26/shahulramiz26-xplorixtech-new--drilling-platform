'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, AlertCircle, CheckCircle, X, MoreVertical, Power } from 'lucide-react'

const initialRigs = [
  {
    id: 'RIG-001',
    type: 'CORE',
    project: 'Gold Mine Project A',
    status: 'ACTIVE',
    activeDays: 48,
    monthCost: 480
  },
  {
    id: 'RIG-002',
    type: 'DTH',
    project: 'Gold Mine Project A',
    status: 'ACTIVE',
    activeDays: 35,
    monthCost: 350
  },
  {
    id: 'RIG-003',
    type: 'CORE',
    project: 'Copper Exploration Site',
    status: 'INACTIVE',
    activeDays: 0,
    monthCost: 0
  },
  {
    id: 'RIG-004',
    type: 'DTH',
    project: 'Copper Exploration Site',
    status: 'ACTIVE',
    activeDays: 42,
    monthCost: 420
  },
  {
    id: 'RIG-005',
    type: 'CORE',
    project: 'Unassigned',
    status: 'INACTIVE',
    activeDays: 0,
    monthCost: 0
  }
]

export default function RigsPage() {
  const [rigs, setRigs] = useState(initialRigs)

  const toggleRigStatus = (rigId: string) => {
    setRigs(rigs.map(rig => {
      if (rig.id === rigId) {
        return {
          ...rig,
          status: rig.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        }
      }
      return rig
    }))
  }

  const stats = {
    total: rigs.length,
    active: rigs.filter(r => r.status === 'ACTIVE').length,
    monthCost: rigs.reduce((sum, r) => sum + r.monthCost, 0)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Rigs & Equipment</h1>
        <p className="text-[#94A3B8] mt-2">Manage your drilling rigs and equipment inventory</p>
      </div>

      {/* Billing Model Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/30 flex items-center justify-center">
            <span className="text-[#3B82F6] font-bold">$</span>
          </div>
          <div>
            <p className="font-semibold text-[#F8FAFC]">Per-Rig Per-Day Billing Model</p>
            <p className="text-sm text-[#94A3B8]">Daily Rate: $10.00 | Billing starts only when rig is activated. Deactivation pauses billing immediately.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <p className="text-sm text-[#94A3B8]">Total Rigs</p>
          <p className="text-3xl font-bold text-[#F8FAFC] mt-1">{stats.total}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <p className="text-sm text-[#94A3B8]">Active (Billable)</p>
          <p className="text-3xl font-bold text-[#10B981] mt-1">{stats.active}</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E293B]">
          <p className="text-sm text-[#94A3B8]">Current Month Cost</p>
          <p className="text-3xl font-bold text-[#F8FAFC] mt-1">${stats.monthCost}</p>
        </div>
      </motion.div>

      {/* Maintenance Warning */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
          <div>
            <p className="font-semibold text-[#F59E0B]">Important: Maintenance Rigs</p>
            <p className="text-sm text-[#94A3B8] mt-1">
              Rigs under maintenance must remain ACTIVE to allow maintenance logging. Deactivation is only allowed for idle, unallocated rigs.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Rigs Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="pb-4">Rig ID</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Project</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Active Days</th>
                <th className="pb-4">Month Cost</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {rigs.map((rig) => (
                <tr key={rig.id} className="hover:bg-[#1A2234]/50 transition">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <span className="font-medium text-[#F8FAFC]">{rig.id}</span>
                    </div>
                  </td>
                  <td className="py-4 text-[#94A3B8]">{rig.type}</td>
                  <td className="py-4 text-[#94A3B8]">{rig.project}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      rig.status === 'ACTIVE'
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30'
                    }`}>
                      {rig.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
                      {rig.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#94A3B8]">{rig.activeDays}</td>
                  <td className="py-4 font-medium text-[#F8FAFC]">${rig.monthCost}</td>
                  <td className="py-4">
                    <button
                      onClick={() => toggleRigStatus(rig.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        rig.status === 'ACTIVE'
                          ? 'border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10'
                          : 'border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      {rig.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
