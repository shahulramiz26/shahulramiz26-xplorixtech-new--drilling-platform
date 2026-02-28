'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import NotificationCenter from '../components/NotificationCenter'

const navItems = [
  { href: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supervisor/drilling-log', label: 'Drilling Log', icon: FileText },
  { href: '/supervisor/maintenance-log', label: 'Maintenance', icon: Wrench },
  { href: '/supervisor/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-bold">XPLORIX</h1>
          <p className="text-xs text-slate-400">Supervisor</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="scale-75 origin-right">
            <NotificationCenter />
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-slate-800 hidden lg:block">
            <h1 className="text-xl font-bold">XPLORIX</h1>
            <p className="text-sm text-slate-400">Supervisor Panel</p>
          </div>
          
          {/* Mobile Close Button */}
          <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">Menu</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <Link
              href="/auth/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition text-red-400"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <p className="font-medium text-slate-900">John Smith (RIG01_SUP01)</p>
            </div>
            <NotificationCenter />
          </div>
          
          {/* Page Content */}
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
