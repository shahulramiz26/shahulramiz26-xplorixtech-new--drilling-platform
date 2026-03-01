'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Activity } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Demo login - redirect based on role
    if (formData.role === 'admin') {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/supervisor/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#3B82F6]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#10B981]/10 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Welcome Back</h1>
          <p className="text-[#94A3B8] mt-2">Login to your drilling platform</p>
        </div>

        {/* Form */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-[#1E293B] rounded-2xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                placeholder="Enter your email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Login As (Demo)</label>
              <select
                className="w-full px-4 py-3 bg-[#1A2234] border border-[#1E293B] rounded-xl text-[#F8FAFC] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="" className="bg-[#1A2234]">Select Role</option>
                <option value="admin" className="bg-[#1A2234]">Company Admin</option>
                <option value="supervisor" className="bg-[#1A2234]">Supervisor</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <input type="checkbox" className="w-4 h-4 rounded border-[#1E293B] bg-[#1A2234] text-[#3B82F6]" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[#3B82F6] hover:text-[#60A5FA]">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.6)] transition-all"
            >
              Login
            </button>
          </form>

          <p className="text-center text-[#94A3B8] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#3B82F6] hover:text-[#60A5FA] font-medium">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
