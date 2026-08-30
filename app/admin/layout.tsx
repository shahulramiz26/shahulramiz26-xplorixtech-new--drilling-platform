'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import {
  LayoutDashboard, Users, FolderOpen, Settings,
  Truck, CreditCard, BarChart3, LogOut, Menu,
  ChevronRight, Search, DollarSign, X, Boxes, FileText, Brain,
  Store, MessageSquareQuote, Bookmark,
} from 'lucide-react'
import NotificationCenter from '../components/NotificationCenter'
import { CurrencyProvider } from '../components/currency-context'
import CurrencySwitcher from '../components/CurrencySwitcher'

/* ------------------------------------------------------------------ *
 * Nav is now grouped. Operations and Exchange are different mental
 * modes — a flat 14-item list buries both.
 * ------------------------------------------------------------------ */
type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Main Menu',
    items: [
      { href: '/admin/dashboard',            label: 'Dashboard',            icon: LayoutDashboard },
      { href: '/admin/finance',              label: 'Finance & Costing',    icon: DollarSign      },
      { href: '/admin/inventory',            label: 'Inventory',            icon: Boxes           },
      { href: '/admin/users',                label: 'User Management',      icon: Users           },
      { href: '/admin/projects',             label: 'Projects',             icon: FolderOpen      },
      { href: '/admin/rigs',                 label: 'Rigs & Equipment',     icon: Truck           },
      { href: '/admin/billing',              label: 'Billing',              icon: CreditCard      },
      { href: '/admin/analytics',            label: 'Analytics',            icon: BarChart3       },
      { href: '/admin/xplorix-intelligence', label: 'XPLORIX Intelligence', icon: Brain           },
      { href: '/admin/reports',              label: 'Performance Reports',  icon: FileText        },
      { href: '/admin/settings',             label: 'Settings',             icon: Settings        },
    ],
  },
  {
    title: 'Exchange',
    items: [
      { href: '/admin/marketplace',            label: 'Marketplace',   icon: Store              },
      { href: '/admin/marketplace/inquiries',  label: 'My Inquiries',  icon: MessageSquareQuote, badge: 3 },
      { href: '/admin/marketplace/saved',      label: 'Saved',         icon: Bookmark           },
    ],
  },
]

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Longest match wins, so /admin/marketplace/saved doesn't light up Marketplace.
  const currentPage = [...ALL_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))

  const pageLabel = currentPage?.label || pathname.split('/')[2] || 'Dashboard'

  const isActive = (href: string) => currentPage?.href === href

  return (
    <CurrencyProvider>
      <div className="min-h-screen flex" style={{ background: '#080B10', color: '#F8FAFC' }}>

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

        {/* SIDEBAR */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ background: 'linear-gradient(180deg, #0D1117 0%, #080B10 100%)', borderRight: '1px solid #1E293B' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #1E293B' }}>
            <Link href="/admin/dashboard" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.3))' }}>
                <polygon points="50,50 5,5 5,95" fill="#1a1a1a"/>
                <polygon points="50,50 5,5 30,5" fill="#2a2a2a"/>
                <polygon points="50,50 5,95 30,95" fill="#2a2a2a"/>
                <polygon points="50,50 95,5 95,95" fill="#F97316"/>
                <polygon points="50,50 95,5 70,5" fill="#EA580C"/>
                <polygon points="50,50 95,95 70,95" fill="#EA580C"/>
              </svg>
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
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.title} style={{ marginTop: gi === 0 ? 0 : 20 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: '#334155',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '8px 16px 12px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  {group.title}
                  {gi > 0 && <span style={{ flex: 1, height: 1, background: '#1E293B' }} />}
                </div>

                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 14px', borderRadius: 12,
                          textDecoration: 'none', transition: 'all 0.2s',
                          background: active ? 'linear-gradient(90deg, rgba(249,115,22,0.12), transparent)' : 'transparent',
                          borderLeft: active ? '2px solid #F97316' : '2px solid transparent',
                          color: active ? '#F8FAFC' : '#64748B',
                        }}
                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#F8FAFC' } }}
                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B' } }}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                          border: active ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
                        }}>
                          <item.icon size={16} style={{ color: active ? '#F97316' : 'inherit' }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{item.label}</span>

                        {item.badge && !active ? (
                          <span style={{
                            minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
                            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)',
                            color: '#F97316', fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {item.badge}
                          </span>
                        ) : active ? (
                          <ChevronRight size={14} style={{ color: '#F97316', opacity: 0.7 }} />
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Live status */}
          <div className="px-4 pb-2">
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>System Live</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>All rigs reporting</div>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="p-4" style={{ borderTop: '1px solid #1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid #1E293B' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #F97316, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', boxShadow: '0 0 12px rgba(249,115,22,0.3)' }}>A</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Admin User</div>
                <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>Apex Drilling Solutions</div>
              </div>
              <Link href="/auth/login" style={{ padding: 6, color: '#64748B', borderRadius: 8, display: 'flex' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <LogOut size={16} />
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* HEADER */}
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,11,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,41,59,0.6)', padding: '0 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
                  style={{ padding: 8, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex' }}>
                  <Menu size={22} />
                </button>
                <div className="hidden md:flex items-center gap-2" style={{ fontSize: 13 }}>
                  <span style={{ color: '#334155', fontWeight: 500 }}>XPLORIX</span>
                  <ChevronRight size={14} style={{ color: '#334155' }} />
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>{pageLabel}</span>
                  {pathname.split('/').length > 3 && !currentPage?.href.endsWith(pathname.split('/')[3]) && (
                    <>
                      <ChevronRight size={14} style={{ color: '#334155' }} />
                      <span style={{ color: '#F97316', fontWeight: 600, fontSize: 12 }}>
                        {pathname.split('/')[3]?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="hidden md:flex items-center gap-2"
                  style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B' }}>
                  <Search size={14} style={{ color: '#64748B', flexShrink: 0 }} />
                  <input type="text" placeholder="Search..."
                    style={{ background: 'none', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: 13, width: 160, fontFamily: 'inherit' }} />
                </div>
                <CurrencySwitcher />
                <NotificationCenter />
                <Link href="/admin/projects" className="hidden sm:flex items-center gap-2"
                  style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.3)', whiteSpace: 'nowrap' }}>
                  New Project
                </Link>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-auto" style={{ padding: '28px 32px' }}>
            {children}
          </div>

        </main>
      </div>
    </CurrencyProvider>
  )
}
