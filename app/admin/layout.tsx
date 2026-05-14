'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, FolderOpen, Settings,
  Truck, CreditCard, BarChart3, LogOut, Menu,
  ChevronRight, Search, DollarSign, Bell, X, Boxes, FileText
} from 'lucide-react'
import NotificationCenter from '../components/NotificationCenter'
import { CurrencyProvider } from '../components/currency-context'
import CurrencySwitcher from '../components/CurrencySwitcher'

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',            icon: LayoutDashboard },
  { href: '/admin/finance',    label: 'Finance & Costing',     icon: DollarSign      },
  { href: '/admin/inventory',  label: 'Inventory',             icon: Boxes           },
  { href: '/admin/users',      label: 'User Management',       icon: Users           },
  { href: '/admin/projects',   label: 'Projects',              icon: FolderOpen      },
  { href: '/admin/rigs',       label: 'Rigs & Equipment',      icon: Truck           },
  { href: '/admin/billing',    label: 'Billing',               icon: CreditCard      },
  { href: '/admin/analytics',  label: 'Analytics',             icon: BarChart3       },
  { href: '/admin/reports',    label: 'Performance Reports',   icon: FileText        },
  { href: '/admin/settings',   label: 'Settings',              icon: Settings        },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const currentPage = navItems.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  const pageLabel = currentPage?.label || pathname.split('/')[2] || 'Dashboard'

  return (
    <CurrencyProvider>
      <div className="min-h-screen flex" style={{ background: '#080B10', color: '#F8FAFC' }}>

        {/* ── MOBILE OVERLAY ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── SIDEBAR ── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72
            transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{
            background: 'linear-gradient(180deg, #0D1117 0%, #080B10 100%)',
            borderRight: '1px solid #1E293B',
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #1E293B' }}>
            <Link href="/admin/dashboard" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #F97316, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 18, color: '#000',
                boxShadow: '0 0 20px rgba(249,115,22,0.35)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>X</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.05em', fontFamily: "'Space Grotesk', sans-serif" }}>XPLORIX</div>
                <div style={{ fontSize: 9, color: '#64748B', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 1 }}>Admin Console</div>
              </div>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}
              style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px 12px' }}>
              Main Menu
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
                      background: isActive ? 'linear-gradient(90deg, rgba(249,115,22,0.12), transparent)' : 'transparent',
                      borderLeft: isActive ? '2px solid #F97316' : '2px solid transparent',
                      color: isActive ? '#F8FAFC' : '#64748B',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#F8FAFC' }}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isActive ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}>
                      <item.icon size={16} style={{ color: isActive ? '#F97316' : 'inherit' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} style={{ color: '#F97316', opacity: 0.7 }} />}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Live status */}
          <div className="px-4 pb-2">
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>System Live</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>All rigs reporting</div>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="p-4" style={{ borderTop: '1px solid #1E293B' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F97316, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, color: '#fff',
                boxShadow: '0 0 12px rgba(249,115,22,0.3)',
              }}>A</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</div>
                <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>Apex Drilling Solutions</div>
              </div>
              <Link href="/auth/login" style={{ padding: 6, color: '#64748B', borderRadius: 8, transition: 'all 0.2s', display: 'flex' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <LogOut size={16} />
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* ── HEADER ── */}
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(8,11,16,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(30,41,59,0.6)',
            padding: '0 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

              {/* Left */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                  style={{ padding: 8, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
                  <Menu size={22} />
                </button>
                <div className="hidden md:flex items-center gap-2" style={{ fontSize: 13 }}>
                  <span style={{ color: '#334155', fontWeight: 500 }}>XPLORIX</span>
                  <ChevronRight size={14} style={{ color: '#334155' }} />
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>{pageLabel}</span>
                  {pathname.split('/').length > 3 && (
                    <>
                      <ChevronRight size={14} style={{ color: '#334155' }} />
                      <span style={{ color: '#F97316', fontWeight: 600, fontSize: 12 }}>
                        {pathname.split('/')[3]?.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="hidden md:flex items-center gap-2"
                  style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', transition: 'all 0.2s' }}>
                  <Search size={14} style={{ color: '#64748B', flexShrink: 0 }} />
                  <input type="text" placeholder="Search..."
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: 13, width: 160, fontFamily: 'inherit' }} />
                </div>
                <CurrencySwitcher />
                <NotificationCenter />
                <Link href="/admin/projects"
                  className="hidden sm:flex items-center gap-2"
                  style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', transition: 'all 0.25s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(249,115,22,0.45)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(249,115,22,0.3)' }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                  New Project
                </Link>
              </div>
            </div>
          </header>

          {/* ── PAGE CONTENT ── */}
          <div className="flex-1 overflow-auto" style={{ padding: '28px 32px' }}>
            {children}
          </div>

        </main>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.4); }
          }
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        `}</style>
      </div>
    </CurrencyProvider>
  )
}

