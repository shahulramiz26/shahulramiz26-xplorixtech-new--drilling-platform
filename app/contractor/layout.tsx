'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardPen, ClipboardList, FileText, ScrollText, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { CostingProvider } from '../../lib/costing-store'
import { T, display } from '../components/kit'
import { ThemeScope, ThemeToggle } from '../components/theme'
import { useMe, useArrival, signInAs, CLIENT_NAME } from './me'

/* ==========================================================================
 * CONTRACTOR LOGIN — a contractor's side of the work he does for a client
 *
 * A company on XPLORIX that hires a contractor gives him this login with the
 * work order. In it the contractor writes his own drill log and sends it,
 * sees what the client said about each shift, sends his bills and reads the
 * terms he is working under.
 *
 * It mounts the same store the client's Company Admin uses, so a shift sent
 * here is waiting on the client's Contractors screen at once, and the
 * client's answer shows here without a refresh.
 *
 * What it never shows: the client's own rigs, what the client is paid, or
 * any other contractor. And it never asks the contractor for his costs.
 * ========================================================================== */

type Item = { href: string; label: string; icon: React.ElementType; badge?: 'back' | 'bills' }
const NAV: Item[] = [
  { href: '/contractor', label: 'Home', icon: LayoutDashboard },
  { href: '/contractor/drill-log', label: 'Drill log', icon: ClipboardPen },
  { href: '/contractor/shifts', label: 'Shift record', icon: ClipboardList, badge: 'back' },
  { href: '/contractor/bills', label: 'Bills', icon: FileText, badge: 'bills' },
  { href: '/contractor/work-order', label: 'Work order', icon: ScrollText },
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
  @media (max-width: 900px) { .xpl-split { grid-template-columns: minmax(0,1fr) !important; } .xpl-prow { grid-template-columns: minmax(0,1fr) !important; gap: 10px !important; } }
  .xpl-row:hover { background: rgba(var(--x-ov),0.025); }
  .xpl-nav:hover { background: rgba(var(--x-ov),0.04); color: var(--x-text) !important; }
`

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useArrival()
  const { me, withLogin, side } = useMe()

  const current = [...NAV].sort((a, b) => b.href.length - a.href.length).find(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  const badge = (b?: Item['badge']) => b === 'back' ? side.returned.length : b === 'bills' ? side.bills.filter(x => x.status === 'returned').length : 0

  return (
    <div className="min-h-screen flex xpl-app" style={{ background: T.bg, color: T.text }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {open && <div className="lg:hidden fixed inset-0 z-40" style={{ background: 'rgba(var(--x-shadow),0.7)' }} onClick={() => setOpen(false)} />}

      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 flex flex-col w-64 lg:h-screen transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'var(--x-side)', borderRight: `1px solid ${T.border}` }}
      >
        <div className="flex items-center justify-between" style={{ padding: '18px 18px 16px', borderBottom: `1px solid ${T.border}` }}>
          <Link href="/contractor" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
              <polygon points="50,50 5,5 5,95" fill="#1a1a1a" /><polygon points="50,50 5,5 30,5" fill="#2a2a2a" />
              <polygon points="50,50 5,95 30,95" fill="#2a2a2a" /><polygon points="50,50 95,5 95,95" fill="#F97316" />
              <polygon points="50,50 95,5 70,5" fill="#EA580C" /><polygon points="50,50 95,95 70,95" fill="#EA580C" />
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, letterSpacing: '0.05em', fontFamily: display }}>XPLORIX</div>
              <div style={{ fontSize: 9.5, color: T.faint, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 1 }}>Contractor Login</div>
            </div>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"
            style={{ color: T.faint, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto" style={{ padding: '16px 10px', scrollbarWidth: 'none' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.dim, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 10px 7px' }}>Work for {CLIENT_NAME}</div>
          {NAV.map(item => {
            const active = current?.href === item.href
            const n = badge(item.badge)
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={active ? '' : 'xpl-nav'} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, marginBottom: 1,
                textDecoration: 'none', fontSize: 13.5, fontWeight: active ? 600 : 500,
                background: active ? 'color-mix(in srgb, var(--x-orange) 12%, transparent)' : 'transparent',
                color: active ? T.text : T.muted,
              }}>
                <item.icon size={16} style={{ color: active ? T.orange : T.faint, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {n > 0 && (
                  <span aria-label={`${n} sent back`} style={{
                    minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    background: T.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{n}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: 12, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, background: 'rgba(var(--x-ov),0.03)', border: `1px solid ${T.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'var(--x-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: T.text }}>
              {(me?.name ?? 'C').replace(/^Contractor /, '').charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.name ?? 'Contractor'}</div>
              <div style={{ fontSize: 11, color: T.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me?.login?.email ?? 'No login'}</div>
            </div>
            <Link href="/auth/login" aria-label="Sign out" style={{ padding: 6, color: T.faint, borderRadius: 8, display: 'flex' }}><LogOut size={15} /></Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--x-bg) 92%, transparent)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.line}`, padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <button onClick={() => setOpen(true)} className="lg:hidden flex" aria-label="Open menu"
                style={{ padding: 6, color: T.faint, background: 'none', border: 'none', cursor: 'pointer' }}><Menu size={20} /></button>
              <div className="hidden md:flex items-center gap-2" style={{ fontSize: 13, minWidth: 0 }}>
                <span style={{ color: T.faint }}>{me?.name ?? 'Contractor'}</span>
                <ChevronRight size={14} style={{ color: T.dim }} />
                <span style={{ color: T.text, fontWeight: 600 }}>{current?.label ?? 'Home'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {withLogin.length > 1 && me && (
                <label className="hidden sm:flex" style={{ alignItems: 'center', gap: 7, fontSize: 12, color: T.faint }}>
                  Demo: signed in as
                  <select value={me.id} onChange={e => signInAs(e.target.value)} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7, color: T.text, fontSize: 12, padding: '5px 8px', fontFamily: 'inherit', cursor: 'pointer' }}>
                    {withLogin.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
              <ThemeToggle />
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 6,
                background: 'color-mix(in srgb, var(--x-amber) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--x-amber) 35%, transparent)', color: T.amber, whiteSpace: 'nowrap',
              }}>DEMO DATA</span>
            </div>
          </div>
        </header>
        <div className="flex-1" style={{ padding: '24px 24px 0' }}>{children}</div>
      </main>
    </div>
  )
}

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <CostingProvider>
      <ThemeScope />
      <Shell>{children}</Shell>
    </CostingProvider>
  )
}
