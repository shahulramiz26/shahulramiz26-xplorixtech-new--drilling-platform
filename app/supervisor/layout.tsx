'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, BarChart3,
  ClipboardList, LogOut, Menu, ChevronRight,
  Bell, X, HardHat, Wrench
} from 'lucide-react'
import { ThemeScope, ThemeToggle } from '../components/theme'
import { CostingProvider } from '../../lib/costing-store'

const navItems = [
  { href: '/supervisor/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/supervisor/drilling-log',    label: 'Drilling Log',     icon: FileText        },
  { href: '/supervisor/maintenance-log', label: 'Maintenance Log',  icon: Wrench          },
  { href: '/supervisor/reports',         label: 'Reports',          icon: BarChart3       },
  { href: '/supervisor/logs',            label: 'Log History',      icon: ClipboardList   },
]

/* The supervisor's screens read the same store as the office: the projects he
 * can log against, the rigs on each, and the holes on the plan all come from
 * the project record. */
export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return <CostingProvider><SupervisorShell>{children}</SupervisorShell></CostingProvider>
}

function SupervisorShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const currentPage = navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  const pageLabel = currentPage?.label || pathname.split('/')[2] || 'Dashboard'

  return (
    <div className="min-h-screen flex xpl-app" style={{ background: 'var(--x-bg)', color: 'var(--x-text)' }}>
      <ThemeScope />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(var(--x-shadow),0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'linear-gradient(180deg, var(--x-card) 0%, var(--x-bg) 100%)', borderRight: '1px solid var(--x-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--x-border)' }}>
          <Link href="/supervisor/dashboard" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px color-mix(in srgb, var(--x-orange) 30%, transparent))' }}>
              <polygon points="50,50 5,5 5,95" fill="#1a1a1a"/>
              <polygon points="50,50 5,5 30,5" fill="#2a2a2a"/>
              <polygon points="50,50 5,95 30,95" fill="#2a2a2a"/>
              <polygon points="50,50 95,5 95,95" fill="#F97316"/>
              <polygon points="50,50 95,5 70,5" fill="#EA580C"/>
              <polygon points="50,50 95,95 70,95" fill="#EA580C"/>
            </svg>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--x-text)', letterSpacing: '0.05em', fontFamily: "'Space Grotesk', sans-serif" }}>XPLORIX</div>
              <div style={{ fontSize: 9, color: 'var(--x-faint)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 1 }}>Supervisor Portal</div>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}
            style={{ color: 'var(--x-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--x-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px 12px' }}>
            Supervisor Menu
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 12,
                    textDecoration: 'none', transition: 'all 0.2s',
                    background: isActive ? 'linear-gradient(90deg, color-mix(in srgb, var(--x-orange) 12%, transparent), transparent)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--x-orange)' : '2px solid transparent',
                    color: isActive ? 'var(--x-text)' : 'var(--x-faint)',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(var(--x-ov),0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--x-text)' }}}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--x-faint)' }}}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'color-mix(in srgb, var(--x-orange) 15%, transparent)' : 'rgba(var(--x-ov),0.04)',
                    border: isActive ? '1px solid color-mix(in srgb, var(--x-orange) 25%, transparent)' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                    <item.icon size={16} style={{ color: isActive ? 'var(--x-orange)' : 'inherit' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight size={14} style={{ color: 'var(--x-orange)', opacity: 0.7 }} />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Shift status */}
        <div className="px-4 pb-2">
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'color-mix(in srgb, var(--x-blue) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--x-blue) 15%, transparent)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <HardHat size={14} style={{ color: 'var(--x-blue-b)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--x-text)' }}>Day Shift Active</div>
              <div style={{ fontSize: 10, color: 'var(--x-faint)', marginTop: 1 }}>12h shift · 6 rigs online</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="p-4" style={{ borderTop: '1px solid var(--x-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(var(--x-ov),0.03)', border: '1px solid var(--x-border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--x-blue), var(--x-blue-b))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', boxShadow: '0 0 12px color-mix(in srgb, var(--x-blue) 30%, transparent)' }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--x-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Supervisor</div>
              <div style={{ fontSize: 11, color: 'var(--x-faint)', marginTop: 1 }}>Field Operations</div>
            </div>
            <Link href="/auth/login" style={{ padding: 6, color: 'var(--x-faint)', borderRadius: 8, transition: 'all 0.2s', display: 'flex' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--x-red)'; (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--x-red) 8%, transparent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--x-faint)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--x-bg) 85%, transparent)', backdropFilter: 'blur(20px)', borderBottom: '1px solid color-mix(in srgb, var(--x-border) 60%, transparent)', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
                style={{ padding: 8, color: 'var(--x-faint)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
                <Menu size={22} />
              </button>
              <div className="hidden md:flex items-center gap-2" style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--x-dim)', fontWeight: 500 }}>XPLORIX</span>
                <ChevronRight size={14} style={{ color: 'var(--x-dim)' }} />
                <span style={{ color: 'var(--x-muted)', fontWeight: 600 }}>{pageLabel}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ThemeToggle size={36} />
              <div className="hidden sm:block" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(var(--x-ov),0.04)', border: '1px solid var(--x-border)', fontSize: 12, color: 'var(--x-muted)', fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <button aria-label="Notifications" style={{ padding: 8, borderRadius: 10, position: 'relative', background: 'rgba(var(--x-ov),0.04)', border: '1px solid var(--x-border)', color: 'var(--x-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
                <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--x-orange)', border: '1.5px solid var(--x-bg)' }} />
              </button>
              <Link href="/supervisor/drilling-log"
                style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg, var(--x-orange), var(--x-orange-d))', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 20px color-mix(in srgb, var(--x-orange) 30%, transparent)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                <FileText size={14} />
                New Drill Log
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto" style={{ padding: '28px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

