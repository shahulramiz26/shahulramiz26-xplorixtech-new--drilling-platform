'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Settings, 
  Truck, 
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  DollarSign
} from 'lucide-react'
import NotificationCenter from '../components/NotificationCenter'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/finance', label: 'Finance & Costing', icon: DollarSign },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/rigs', label: 'Rigs & Equipment', icon: Truck },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 
                    bg-gradient-to-b from-[#0D1320] via-[#111827] to-[#0A0F1C]
                    border-r border-[#1E293B]/50 flex flex-col
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    transition-transform duration-300 ease-out`}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-[#1E293B]/50">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#00D4AA] 
                            flex items-center justify-center shadow-[0_8px_32px_rgba(0,102,255,0.3)]">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">XPLORIX</h1>
              <p className="text-xs text-slate-500">Admin Console</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Main Menu
          </p>
          {navItems.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#0066FF]/20 to-transparent text-white border-l-2 border-[#0066FF]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300
                  ${isActive ? 'bg-[#0066FF]/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#0066FF]' : ''}`} />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#0066FF]" />}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1E293B]/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066FF] to-[#7B61FF] 
                            flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">Apex Drilling Solutions</p>
            </div>
            <Link 
              href="/auth/login" 
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Premium Header */}
        <header className="sticky top-0 z-30 bg-[#0A0F1C]/80 backdrop-blur-xl border-b border-[#1E293B]/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-slate-500">XPLORIX</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-slate-300 capitalize">
                  {pathname.split('/')[2] || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[#1E293B]/50
                              focus-within:border-[#0066FF]/50 focus-within:bg-white/10 transition-all">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500 w-48"
                />
              </div>

              {/* Notifications */}
              <NotificationCenter />

              {/* Quick Actions */}
              <Link 
                href="/admin/projects"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#0052CC]
                           text-white text-sm font-medium rounded-xl shadow-[0_4px_20px_rgba(0,102,255,0.3)]
                           hover:shadow-[0_8px_30px_rgba(0,102,255,0.5)] transition-all"
              >
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                New Project
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

