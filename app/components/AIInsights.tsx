'use client'

import { useState } from 'react'
import { Brain, X, ChevronDown } from 'lucide-react'
import { T, toneColor, type Tone } from './kit'

interface Insight {
  id: string
  type: 'anomaly' | 'prediction' | 'recommendation' | 'trend'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  metric?: string
  change?: string
  recommendation?: string
}

interface AIInsightsProps {
  dashboardType: 'operation' | 'maintenance' | 'driller' | 'consumables' | 'hsc'
  insights: Insight[]
}

/* AI INSIGHTS — what XPLORIX noticed on this dashboard.
 *
 * A button in the bottom corner, out of the way of the page's own filters,
 * opens a panel in the same dark surface as everything else. Each insight
 * opens in place to show what to do about it. */

const tone: Record<Insight['severity'], Tone> = { info: 'info', warning: 'warn', critical: 'bad' }
const kind: Record<Insight['type'], string> = { anomaly: 'Unusual', prediction: 'Forecast', recommendation: 'Suggestion', trend: 'Trend' }

export default function AIInsights({ insights }: AIInsightsProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label={`AI insights, ${insights.length} on this dashboard`} style={{
        position: 'fixed', right: 22, bottom: 22, zIndex: 40, display: 'flex', alignItems: 'center', gap: 9,
        padding: '10px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
        background: T.card, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, fontWeight: 600,
        boxShadow: '0 12px 32px rgba(var(--x-shadow),0.5)',
      }}>
        <Brain size={16} style={{ color: T.orange }} />
        AI insights
        {insights.length > 0 && (
          <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10, background: T.orange, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{insights.length}</span>
        )}
      </button>
    )
  }

  return (
    <aside aria-label="AI insights" style={{
      position: 'fixed', right: 22, bottom: 22, zIndex: 40, width: 'min(380px, calc(100vw - 32px))', maxHeight: 'min(70vh, 620px)',
      display: 'flex', flexDirection: 'column', background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
      boxShadow: '0 24px 60px rgba(var(--x-shadow),0.6)', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderBottom: `1px solid ${T.line}` }}>
        <Brain size={16} style={{ color: T.orange }} />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: T.text }}>AI insights{insights.length ? ` · ${insights.length}` : ''}</span>
        <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', color: T.faint, cursor: 'pointer', padding: 4, display: 'flex' }}><X size={16} /></button>
      </div>
      <div style={{ overflowY: 'auto' }}>
        {insights.length === 0 && <div style={{ padding: 18, fontSize: 13, color: T.faint }}>Nothing unusual on this dashboard. Insights appear here as shifts come in.</div>}
        {insights.map((i, n) => {
          const isOpen = expanded === i.id
          return (
            <div key={i.id} style={{ borderTop: n ? `1px solid ${T.line}` : 'none' }}>
              <button onClick={() => setExpanded(isOpen ? null : i.id)} aria-expanded={isOpen} className="xpl-row" style={{
                display: 'flex', gap: 11, width: '100%', padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'inherit', alignItems: 'flex-start',
              }}>
                <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: toneColor[tone[i.severity]], flexShrink: 0, marginTop: 5 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 11.5, color: T.faint, marginBottom: 2 }}>{kind[i.type]}</span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{i.title}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{i.description}</span>
                  {i.change && <span style={{ display: 'block', fontSize: 12.5, color: T.text, marginTop: 5 }}>Projected: {i.change}</span>}
                </span>
                {i.recommendation && <ChevronDown size={15} style={{ color: T.faint, flexShrink: 0, marginTop: 3, transform: isOpen ? 'rotate(180deg)' : undefined }} />}
              </button>
              {isOpen && i.recommendation && (
                <div style={{ margin: '0 14px 14px 33px', padding: '10px 12px', borderRadius: 9, background: 'color-mix(in srgb, var(--x-orange) 7%, transparent)', border: '1px solid color-mix(in srgb, var(--x-orange) 25%, transparent)' }}>
                  <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 3 }}>What to do</div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{i.recommendation}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
