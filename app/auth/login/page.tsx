'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin' // For demo purposes
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    
    // Redirect based on role
    if (formData.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/supervisor/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-600 mt-2">Login to your drilling platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="company@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Login As (Demo)</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="admin">Company Admin</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <label className="ml-2 text-sm text-slate-600">Remember me</label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>

        <div className="mt-8 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Demo Credentials:</strong><br />
            Admin: admin@demo.com / password<br />
            Supervisor: supervisor@demo.com / password
          </p>
        </div>
      </div>
    </div>
  )
}
