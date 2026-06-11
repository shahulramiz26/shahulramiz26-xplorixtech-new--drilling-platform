'use client'

import { useState, useEffect, useRef } from 'react'

// ── SCREENSHOT IMAGES ─────────────────────────────────────────────────────
// Map each module to its screenshot filename from /mnt/user-data/uploads/
const SCREENSHOTS: Record<string, string> = {
  ops:     '/screenshots/1780815310237_image.png',
  driller: '/screenshots/1780815405343_image.png',
  consm:   '/screenshots/1780815469952_image.png',
  maint:   '/screenshots/1780815509289_image.png',
  hsc:     '/screenshots/1780815546013_image.png',
  inv:     '/screenshots/1780815805645_image.png',
  finance: '/screenshots/1780750801145_image.png',
}

// ── MODULE DATA ───────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'ops',
    icon: '⚡',
    label: 'Operations',
    color: '#F97316',
    kpi1: { val: '14.2', label: 'Avg ROP (m/hr)' },
    kpi2: { val: '92%', label: 'Efficiency' },
    delta: '+18%',
    deltaPos: true,
    title: 'Operations Dashboard',
    desc: 'Live ROP trending, downtime analysis and bit performance across all rigs.',
    feats: ['Live ROP & downtime alerts', 'Metres drilled vs target', 'Bit performance & cost/m', 'Formation comparison'],
    bars: [40, 55, 48, 62, 58, 70, 65],
  },
  {
    id: 'driller',
    icon: '👷',
    label: 'Driller Perf',
    color: '#10B981',
    kpi1: { val: '32', label: 'Active Drillers' },
    kpi2: { val: '96%', label: 'On-time Logs' },
    delta: '+12%',
    deltaPos: true,
    title: 'Driller Performance',
    desc: 'Every metre attributed to the driller who drilled it. Ranked performance tables, efficiency trends, and individual records.',
    feats: ['Per-driller ROP ranking', 'Core recovery rate', 'Shift score & trends', 'Performance radar'],
    bars: [50, 45, 60, 55, 65, 70, 68],
  },
  {
    id: 'consm',
    icon: '📦',
    label: 'Consumables',
    color: '#8B5CF6',
    kpi1: { val: '450 L', label: 'Fuel/shift' },
    kpi2: { val: '10 kL', label: 'Water/shift' },
    delta: '-8%',
    deltaPos: false,
    title: 'Consumables & Fluids',
    desc: 'Fuel, water, drilling fluid and additives aggregated across all projects in real time.',
    feats: ['Fuel burn by rig', 'Water & fluid usage', 'Additives tracking', 'Consumption forecast'],
    bars: [70, 65, 72, 68, 60, 58, 55],
  },
  {
    id: 'maint',
    icon: '🔧',
    label: 'Maintenance',
    color: '#3B82F6',
    kpi1: { val: '4.2d', label: 'MTBF' },
    kpi2: { val: '87%', label: 'Uptime' },
    delta: '-35%',
    deltaPos: false,
    title: 'Maintenance Intelligence',
    desc: 'Component failure attribution, maintenance cost trends, and per-rig service history.',
    feats: ['Component failure analysis', 'MTBF by rig', 'Oil consumption trend', 'Maintenance cost tracking'],
    bars: [60, 55, 50, 65, 58, 62, 48],
  },
  {
    id: 'hsc',
    icon: '🛡',
    label: 'HSC & Safety',
    color: '#EF4444',
    kpi1: { val: '186', label: 'Safe Days' },
    kpi2: { val: '100%', label: 'PPE Comp.' },
    delta: '+22%',
    deltaPos: true,
    title: 'Health, Safety & Compliance',
    desc: 'Track incidents, PPE compliance, near-misses and safety training across all sites.',
    feats: ['Incident tracking', 'PPE compliance', 'Near-miss resolution', 'Training progress'],
    bars: [45, 50, 55, 48, 60, 65, 70],
  },
  {
    id: 'inv',
    icon: '🗄',
    label: 'Inventory',
    color: '#06B6D4',
    kpi1: { val: '94%', label: 'In Stock' },
    kpi2: { val: '12', label: 'Reorders' },
    delta: '+9%',
    deltaPos: true,
    title: 'Inventory & Procurement',
    desc: 'AI-driven stock-out prediction, supplier performance scoring, and PO lifecycle tracking.',
    feats: ['Bit lifecycle tracking', 'Spare parts management', 'Lead time monitoring', 'Auto stock deduction'],
    bars: [55, 60, 58, 65, 70, 68, 72],
  },
  {
    id: 'finance',
    icon: '💰',
    label: 'Finance',
    color: '#F59E0B',
    kpi1: { val: '₹4.2L', label: 'Cost/rig' },
    kpi2: { val: '+14%', label: 'Margin' },
    delta: '+14%',
    deltaPos: true,
    title: 'Finance & Invoicing',
    desc: 'Contract-rate invoicing with automated GST, TDS and retention deductions from approved drill logs.',
    feats: ['Cost per metre live', 'Project P&L tracking', 'Burn rate analysis', 'Auto invoice generation'],
    bars: [48, 52, 60, 65, 62, 70, 75],
  },
]

// ── DASHBOARD CARD (the floating card in center) ───────────────────────────
function DashCard({ mod, visible }: { mod: typeof MODULES[0]; visible: boolean }) {
  const rgb = (hex: string) =>
    `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`
  const c = mod.color
  const r = rgb(c)

  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      margin: '0 auto',
      background: '#0D1117',
      borderRadius: 18,
      border: `1px solid rgba(${r},0.25)`,
      overflow: 'hidden',
      boxShadow: `0 0 60px rgba(${r},0.12), 0 32px 64px rgba(0,0,0,0.5)`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      position: 'relative',
    }}>
      {/* Top accent bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${c}, transparent)` }} />

      {/* Window chrome */}
      <div style={{
        height: 40, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 7,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((dc, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: dc }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
          XPLORIX › <span style={{ color: 'rgba(255,255,255,0.6)' }}>{mod.title}</span>
        </span>
      </div>

      {/* Screenshot area */}
      <div style={{ position: 'relative', height: 200, background: '#080B10', overflow: 'hidden' }}>
        {/* Synthetic dashboard visualization since we can't load actual screenshots */}
        <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[mod.kpi1, mod.kpi2].map((kpi, i) => (
              <div key={i} style={{
                background: '#111827', borderRadius: 8,
                border: `1px solid rgba(${r}, ${i === 0 ? 0.25 : 0.08})`,
                padding: '10px 12px',
              }}>
                <div style={{
                  fontFamily: 'Inter Tight, sans-serif', fontWeight: 800,
                  fontSize: 26, color: i === 0 ? c : '#F8FAFC', lineHeight: 1,
                }}>{kpi.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
          {/* Bar chart */}
          <div style={{
            flex: 1, background: '#111827', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.05)', padding: '10px 12px',
          }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              7-Day Trend
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 52 }}>
              {mod.bars.map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`,
                  borderRadius: '3px 3px 0 0',
                  background: i >= 4 ? c : `rgba(${r},0.25)`,
                  transition: 'height 0.6s ease',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{d}</div>
              ))}
            </div>
          </div>
        </div>
        {/* Screenshot overlay badge */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}>+ Screenshot</div>
      </div>

      {/* Info panel */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `rgba(${r},0.1)`, border: `1px solid rgba(${r},0.2)`,
            borderRadius: 20, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 12 }}>{mod.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{mod.label}</span>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 7,
            background: mod.deltaPos ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)',
            color: mod.deltaPos ? '#22C55E' : '#F97316',
            border: `1px solid ${mod.deltaPos ? 'rgba(34,197,94,0.2)' : 'rgba(249,115,22,0.2)'}`,
          }}>{mod.delta}</div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 10 }}>{mod.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {mod.feats.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: c, fontSize: 10 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export function FeaturesSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = (idx: number) => {
    if (idx === active) return
    setVisible(false)
    setTimeout(() => {
      setActive(idx)
      setVisible(true)
    }, 250)
  }

  const prev = () => { setAutoPlay(false); goTo((active - 1 + MODULES.length) % MODULES.length) }
  const next = () => { setAutoPlay(false); goTo((active + 1) % MODULES.length) }

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(a => (a + 1) % MODULES.length)
        setVisible(true)
      }, 250)
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoPlay, active])

  const mod = MODULES[active]
  const rgb = (hex: string) =>
    `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`

  return (
    <div style={{
      background: '#080B10',
      borderTop: '1px solid rgba(249,115,22,0.08)',
      borderBottom: '1px solid rgba(249,115,22,0.08)',
      padding: '0 0 60px',
    }}>

      {/* ── TAB BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', overflowX: 'auto',
        scrollbarWidth: 'none',
        gap: 0,
      }}>
        {MODULES.map((m, i) => {
          const isActive = i === active
          return (
            <button
              key={m.id}
              onClick={() => { setAutoPlay(false); goTo(i) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '16px 20px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: isActive ? `2px solid ${m.color}` : '2px solid transparent',
                color: isActive ? m.color : 'rgba(255,255,255,0.4)',
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                marginBottom: -1,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
            >
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              {m.label}
            </button>
          )
        })}
      </div>

      {/* ── MAIN DISPLAY ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px 0', gap: 24, position: 'relative',
        minHeight: 520,
      }}>

        {/* Left arrow */}
        <button
          onClick={prev}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `rgba(${rgb(mod.color)},0.1)`
            ;(e.currentTarget as HTMLElement).style.borderColor = `rgba(${rgb(mod.color)},0.3)`
            ;(e.currentTarget as HTMLElement).style.color = mod.color
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'
          }}
        >‹</button>

        {/* Card */}
        <div style={{ width: '100%', maxWidth: 440 }}>
          <DashCard mod={mod} visible={visible} />
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `rgba(${rgb(mod.color)},0.1)`
            ;(e.currentTarget as HTMLElement).style.borderColor = `rgba(${rgb(mod.color)},0.3)`
            ;(e.currentTarget as HTMLElement).style.color = mod.color
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'
          }}
        >›</button>
      </div>

      {/* ── DOT INDICATORS ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 24 }}>
        {MODULES.map((m, i) => (
          <button
            key={i}
            onClick={() => { setAutoPlay(false); goTo(i) }}
            style={{
              width: i === active ? 24 : 7, height: 7,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === active ? mod.color : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease', padding: 0,
            }}
          />
        ))}
      </div>

    </div>
  )
}

