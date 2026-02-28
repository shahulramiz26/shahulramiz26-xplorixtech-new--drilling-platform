import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Settings, 
  Truck, 
  CreditCard,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/rigs', label: 'Rigs & Equipment', icon: Truck },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
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
          <p className="text-sm text-slate-400">Admin Panel</p>
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
        {children}
      </main>
    </div>
  )
}
