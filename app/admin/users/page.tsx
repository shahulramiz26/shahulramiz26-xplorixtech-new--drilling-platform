'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Power, RotateCcw, Trash2, CheckCircle, XCircle } from 'lucide-react'

const initialUsers = [
  { id: 1, name: '', username: 'RIG01_SUP01', role: 'Supervisor', status: 'ACTIVE', created: '2024-01-15' },
  { id: 2, name: '', username: 'RIG01_SUP02', role: 'Supervisor', status: 'ACTIVE', created: '2024-01-15' },
  { id: 3, name: '', username: 'RIG01_SUP03', role: 'Supervisor', status: 'INACTIVE', created: '2024-01-20' },
]

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [showModal, setShowModal] = useState(false)

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">User Management</h1>
          <p className="text-[#94A3B8] mt-2">Manage operational logins • {users.filter(u => u.status === 'ACTIVE').length}/{users.length} users active</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Subscription Info - Dark Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 border border-[#3B82F6]/30"
      >
        <p className="text-[#F8FAFC]">
          <span className="font-semibold text-[#3B82F6]">Standard Subscription:</span>{' '}
          <span className="text-[#94A3B8]">5 operational logins included. Need more? </span>
          <a href="/admin/billing" className="text-[#3B82F6] hover:underline">Upgrade your plan</a>
        </p>
      </motion.div>

      {/* Users Table - Dark Theme */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-[#111827] border border-[#1E293B]"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="pb-4">Username</th>
                <th className="pb-4">Role</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Created</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#1A2234]/50 transition">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <span className="font-medium text-[#F8FAFC]">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-4 text-[#94A3B8]">{user.role}</td>
                  <td className="py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'ACTIVE'
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-[#94A3B8]">{user.created}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`p-2 rounded-lg transition ${
                          user.status === 'ACTIVE' 
                            ? 'text-[#EF4444] hover:bg-[#EF4444]/10' 
                            : 'text-[#10B981] hover:bg-[#10B981]/10'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg transition">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
