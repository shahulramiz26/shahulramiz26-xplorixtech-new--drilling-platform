import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  BarChart3,
  LogOut
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
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Drilling Platform</h1>
          <p className="text-sm text-slate-400">Supervisor Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition text-red-400"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar with Notification Center */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <p className="font-medium text-slate-900">John Smith (RIG01_SUP01)</p>
          </div>
          <NotificationCenter />
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
