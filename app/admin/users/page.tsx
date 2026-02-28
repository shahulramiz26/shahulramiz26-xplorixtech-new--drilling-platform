'use client'

import { useState } from 'react'
import { Plus, Copy, RefreshCw, Trash2, Power, PowerOff, Eye, EyeOff } from 'lucide-react'
import { generateUsername, generatePassword } from '@/lib/utils'

// Mock users data
const initialUsers = [
  { 
    id: '1', 
    name: 'John Smith', 
    username: 'RIG01_SUP01', 
    role: 'Supervisor', 
    status: 'ACTIVE',
    createdAt: '2024-01-15'
  },
  { 
    id: '2', 
    name: 'Mike Johnson', 
    username: 'RIG01_SUP02', 
    role: 'Supervisor', 
    status: 'ACTIVE',
    createdAt: '2024-01-15'
  },
  { 
    id: '3', 
    name: 'Sarah Williams', 
    username: 'RIG01_SUP03', 
    role: 'Supervisor', 
    status: 'INACTIVE',
    createdAt: '2024-01-20'
  },
]

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', role: 'Supervisor' })
  const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleCreateUser = () => {
    const username = generateUsername('company-1', 'SUPERVISOR', users.length + 1)
    const password = generatePassword()
    
    setGeneratedCredentials({ username, password })
    
    const user = {
      id: String(users.length + 1),
      name: newUser.name,
      username,
      role: newUser.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setUsers([...users, user])
    setShowCredentials(true)
    setNewUser({ name: '', role: 'Supervisor' })
  }

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u
    ))
  }

  const resetPassword = (id: string) => {
    const newPassword = generatePassword()
    alert(`New password for ${users.find(u => u.id === id)?.username}: ${newPassword}`)
  }

  const deleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">
            Manage operational logins • {users.length}/5 users created
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={users.length >= 5}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Subscription Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Standard Subscription:</strong> 5 operational logins included. 
          Need more? <a href="/admin/billing" className="underline">Upgrade your plan</a>.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Username</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Created</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{user.username}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`p-2 rounded-lg transition ${
                        user.status === 'ACTIVE'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      {user.status === 'ACTIVE' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => resetPassword(user.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Reset Password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Auto-Generation Mode:</strong> System will automatically generate username and secure password.
                </p>
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
                onClick={handleCreateUser}
                disabled={!newUser.name}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
              >
                Generate User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">User Created Successfully!</h2>
              <p className="text-sm text-slate-500 mt-1">Share these credentials with the user</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">Username:</span>
                <span className="font-mono font-medium text-slate-900">{generatedCredentials.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-900">
                    {showPassword ? generatedCredentials.password : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> User must change password on first login.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyCredentials}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={() => {
                  setShowCredentials(false)
                  setShowCreateModal(false)
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
