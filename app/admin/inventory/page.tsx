'use client'

import { useState, useMemo, Fragment, ReactNode } from 'react'
import {
  useInventory, TODAY, FORMATIONS, CATEGORIES, costPerMetre, toolingPerMetre,
  normFormation, poValue, poStatus, poReceivedValue, poStoreValue, poOpenReorderValue,
  qtyReceived, qtyInStore, qtyNeverDelivered, qtyFaulty, qtyToReorder,
  poHasSomethingToReorder, poHasSomethingToReceive, rateOfLine,
  openReorders, REORDER_STATUS_LABEL, REORDER_OPEN_STATUSES, DELAY_REASONS,
  stockInStore, onOrder, consumptionValue, buildAlerts, supplierPerformance,
  startupStore,
  daysBetween, addDays, projectCode, isLiveProject, money, moneyL, perMetre,
  dayLabel, fullDate, monthLabel, uid,
  COMPLETED_PROJECTS, RIGS, PROJECTS,
  type Part, type PurchaseOrder, type Alert, type AlertLevel, type AlertKind,
  type PartCategory, type Reorder, type ReorderStatus, type ReorderReceipt,
  type DelayReason, type Supplier, type ReceiptLine, type StockLine,
} from '../../../lib/inventory-store'
import { useCosting, monthOf, shiftMonth } from '../../../lib/costing-store'

const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B', dim: '#334155',
}

const iStyle: React.CSSProperties = {
  padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 7, color: C.text, fontSize: 12.5, outline: 'none', fontFamily: 'inherit', width: '100%',
}
const numStyle: React.CSSProperties = { ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }
const th: React.CSSProperties = {
  padding: '7px 12px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)',
}
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '7px 12px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }
const tdN: React.CSSProperties = { ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'ui-monospace, monospace' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const rowBorder = '1px solid rgba(30,41,59,0.5)'

/* ── primitives ─────────────────────────────────────────────────────────── */

function Card({ title, subtitle, right, children, pad = true, accent }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; pad?: boolean; accent?: string
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      {title && (
        <div style={{ padding: '11px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={pad ? { padding: 16 } : undefined}>{children}</div>
    </div>
  )
}

function Stat({ label, value, note, color = C.text, big }: { label: string; value: string; note?: string; color?: string; big?: boolean }) {
  return (
    <div style={{ padding: '12px 14px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: big ? 21 : 17, fontWeight: 900, color, fontFamily: 'ui-monospace, monospace', lineHeight: 1.15 }}>{value}</div>
      {note && <div style={{ fontSize: 10, color: C.faint, marginTop: 5 }}>{note}</div>}
    </div>
  )
}

function Tag({ children, tone = C.faint }: { children: ReactNode; tone?: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 5, color: tone, background: `${tone}1A`, border: `1px solid ${tone}33`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function Btn({ children, onClick, tone = 'ghost', disabled, size = 'md' }: { children: ReactNode; onClick?: () => void; tone?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; size?: 'sm' | 'md' }) {
  const tones: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`, color: '#fff', border: 'none' },
    ghost: { background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted },
    danger: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 8, fontWeight: 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1, padding: size === 'sm' ? '5px 11px' : '8px 15px', fontSize: size === 'sm' ? 11.5 : 12.5, whiteSpace: 'nowrap', ...tones[tone] }}>
      {children}
    </button>
  )
}

function Note({ tone = C.blue, children }: { tone?: string; children: ReactNode }) {
  return <div style={{ padding: '9px 13px', borderRadius: 9, background: `${tone}0F`, border: `1px solid ${tone}33`, fontSize: 11.5, color: tone, lineHeight: 1.55 }}>{children}</div>
}

function Empty({ children }: { children: ReactNode }) {
  return <div style={{ padding: '34px 20px', textAlign: 'center', color: C.faint, fontSize: 12.5, lineHeight: 1.7 }}>{children}</div>
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, height: 15 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

function Modal({ title, subtitle, width = 760, onClose, children, footer }: { title: string; subtitle?: string; width?: number; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, width, maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px 13px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ padding: 7, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer', lineHeight: 0, fontFamily: 'inherit' }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '13px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}

const Grid = ({ cols, children }: { cols: number; children: ReactNode }) =>
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 12 }}>{children}</div>

function SubHead({ children, tone }: { children: ReactNode; tone: string }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{children}</div>
}

function Chain({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', background: on ? C.orange : 'rgba(255,255,255,0.03)', border: `1px solid ${on ? 'transparent' : C.border}`, color: on ? '#fff' : C.muted }}>
      {label}
    </button>
  )
}

const arrowStyle: React.CSSProperties = { padding: '5px 9px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, color: C.muted }

/* ==========================================================================
 * ALERTS
 * ========================================================================== */

const LEVEL_TONE: Record<AlertLevel, string> = { urgent: C.red, warn: C.amber, info: C.blue }
const KIND_LABEL: Record<AlertKind, string> = { runningOut: 'Running out', overdue: 'Late delivery', replacement: 'Replacement owed', idle: 'Idle stock', stranded: 'Stranded', lowStock: 'Low stock' }
const KIND_ORDER: AlertKind[] = ['runningOut', 'overdue', 'replacement', 'idle', 'stranded', 'lowStock']
const KIND_TONE: Record<AlertKind, string> = { runningOut: C.red, overdue: C.red, replacement: C.amber, idle: C.amber, stranded: C.amber, lowStock: C.blue }

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [kind, setKind] = useState<AlertKind | 'all'>('all')
  if (alerts.length === 0) return <Card><Empty>Nothing needs attention.</Empty></Card>

  const kinds = KIND_ORDER.map(k => {
    const mine = alerts.filter(a => a.kind === k)
    return { kind: k, count: mine.length, value: mine.reduce((s, a) => s + (a.value ?? 0), 0) }
  }).filter(x => x.count > 0)

  const active = kind !== 'all' && !kinds.some(k => k.kind === kind) ? 'all' : kind
  const shown = active === 'all' ? alerts : alerts.filter(a => a.kind === active)
  const urgent = alerts.filter(a => a.level === 'urgent').length
  const shownValue = shown.reduce((s, a) => s + (a.value ?? 0), 0)

  const chip = (label: string, count: number, value: number, on: boolean, tone: string, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'baseline', gap: 7, padding: '5px 11px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', background: on ? `${tone}22` : 'rgba(255,255,255,0.03)', border: `1px solid ${on ? `${tone}66` : C.border}`, color: on ? tone : C.faint }}>
      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{count}</span>
      {value > 0 && <span style={{ fontSize: 10, opacity: 0.7, fontFamily: 'ui-monospace, monospace' }}>{moneyL(value)}</span>}
    </button>
  )

  return (
    <Card title="Needs attention" subtitle={`${alerts.length} item${alerts.length === 1 ? '' : 's'}${urgent ? ` · ${urgent} urgent` : ''}`} pad={false} accent={urgent ? C.red : C.amber}>
      <div style={{ display: 'flex', gap: 6, padding: '11px 16px', borderBottom: rowBorder, flexWrap: 'wrap' }}>
        {chip('All', alerts.length, alerts.reduce((s, a) => s + (a.value ?? 0), 0), active === 'all', C.orange, () => setKind('all'))}
        <span style={{ width: 1, background: C.border, margin: '2px 4px' }} />
        {kinds.map(k => chip(KIND_LABEL[k.kind], k.count, k.value, active === k.kind, KIND_TONE[k.kind], () => setKind(active === k.kind ? 'all' : k.kind)))}
      </div>
      <div>
        {shown.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderBottom: rowBorder, alignItems: 'flex-start' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: LEVEL_TONE[a.level], marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</span>
                {active === 'all' && <Tag tone={KIND_TONE[a.kind]}>{KIND_LABEL[a.kind]}</Tag>}
              </div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3, lineHeight: 1.55 }}>{a.detail}</div>
            </div>
            {a.value != null && <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_TONE[a.level], fontFamily: 'ui-monospace, monospace' }}>{money(a.value)}</span>}
          </div>
        ))}
      </div>
      {shown.length > 1 && (
        <div style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: 11, color: C.faint }}>{shown.length} shown{active !== 'all' ? ` of ${alerts.length}` : ''}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.text, fontFamily: 'ui-monospace, monospace' }}>{money(shownValue)}</span>
        </div>
      )}
    </Card>
  )
}

/* ==========================================================================
 * CATALOGUE
 * ========================================================================== */

function CatalogueTab({ onEdit, onImport }: { onEdit: (p: Part) => void; onImport: () => void }) {
  const { state, deletePart } = useInventory()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<PartCategory | 'All'>('All')
  const [sup, setSup] = useState('All')
  const [showRetired, setShowRetired] = useState(false)
  const parts = state.catalogue.filter(p =>
    (showRetired || p.active) &&
    (cat === 'All' || p.category === cat) &&
    (sup === 'All' || p.supplier === sup) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.partNumber.toLowerCase().includes(q.toLowerCase())))

  const blank = (): Part => ({
    id: uid('t'), partNumber: '', name: '', category: 'Bit', formation: 'Hard', rate: 0,
    lifeMetres: 0, supplier: state.suppliers[0]?.name ?? '', leadTimeDays: 14, minStock: 1, active: true,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        Cost per metre is rate divided by life in metres. The same figure is what finance charges for every metre drilled.
      </Note>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ width: 220 }}><Field label="Search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Part number or name" style={iStyle} /></Field></div>
        <div style={{ width: 155 }}>
          <Field label="Category">
            <select value={cat} onChange={e => setCat(e.target.value as PartCategory | 'All')} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ width: 185 }}>
          <Field label="Supplier">
            <select value={sup} onChange={e => setSup(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All suppliers</option>
              {state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}
            </select>
          </Field>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', paddingBottom: 7 }}>
          <input type="checkbox" checked={showRetired} onChange={e => setShowRetired(e.target.checked)} />
          <span style={{ fontSize: 12, color: C.muted }}>Show retired</span>
        </label>
        <div style={{ flex: 1 }} />
        {(q || cat !== 'All' || sup !== 'All') && <Btn size="sm" onClick={() => { setQ(''); setCat('All'); setSup('All') }}>Clear</Btn>}
        <Btn size="sm" onClick={onImport}>Import CSV</Btn>
        <Btn size="sm" tone="primary" onClick={() => onEdit(blank())}>Add part</Btn>
      </div>

      <Card title="Parts catalogue" pad={false} subtitle={`${parts.length} of ${state.catalogue.length} parts · ₹${toolingPerMetre(parts).toFixed(2)}/m total across active parts`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Serial no.</th>
                <th style={th}>Category</th><th style={th}>Formation</th><th style={thR}>Rate</th><th style={thR}>Life</th>
                <th style={thR}>Cost / metre</th><th style={th}>Supplier</th><th style={thR}>Lead</th><th style={thR}>Min stock</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 && (
                <tr><td colSpan={10}><Empty>{state.catalogue.length === 0 ? 'No parts yet. Add one or import a CSV.' : 'Nothing matches those filters.'}</Empty></td></tr>
              )}
              {parts.map(p => {
                return (
                  <tr key={p.id} style={{ borderBottom: rowBorder, opacity: p.active ? 1 : 0.45 }}>
                    <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{p.partNumber || '—'}</td>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 230 }}>
                      {p.name}{!p.active && <span style={{ marginLeft: 7 }}><Tag tone={C.dim}>retired</Tag></span>}
                    </td>
                    <td style={{ ...tdMono, color: p.serialNumber ? C.muted : C.dim }}>{p.serialNumber || '—'}</td>
                    <td style={td}><Tag tone={C.dim}>{p.category}</Tag></td>
                    <td style={{ ...td, color: C.muted }}>{p.formation || '—'}</td>
                    <td style={tdN}>{money(p.rate)}</td>
                    <td style={{ ...tdN, color: C.faint }}>{p.lifeMetres.toLocaleString('en-IN')} m</td>
                    <td style={{ ...tdN, color: C.orange, fontWeight: 700 }}>{perMetre(costPerMetre(p))}</td>
                    <td style={td}>{p.supplier}</td>
                    <td style={tdN}>{p.leadTimeDays}d</td>
                    <td style={{ ...tdN, color: C.faint }}>{p.minStock}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <Btn size="sm" onClick={() => onEdit(p)}>Edit</Btn>
                        <Btn size="sm" tone="danger" onClick={() => deletePart(p.id)}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={8}>Total cost per metre (active parts)</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{perMetre(toolingPerMetre(parts))}</td>
                <td style={td} colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function KVBlock({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{v}</div>
    </div>
  )
}

function PartModal({ part, onSave, onClose }: { part: Part; onSave: (p: Part) => void; onClose: () => void }) {
  const { state } = useInventory()
  const [f, setF] = useState<Part>(part)
  const u = (p: Partial<Part>) => setF(x => ({ ...x, ...p }))
  return (
    <Modal title={f.name || 'New part'} subtitle="Life in metres drives cost per metre — the figure worth getting right" width={720} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={!f.name.trim()} onClick={() => { onSave(f); onClose() }}>Save part</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={3}>
          <Field label="Part number"><input value={f.partNumber} onChange={e => u({ partNumber: e.target.value })} style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} placeholder="e.g. HQ-BIT-IMP" /></Field>
          <Field label="Item"><input value={f.name} onChange={e => u({ name: e.target.value })} style={iStyle} /></Field>
          <Field label="Serial number" hint="Optional"><input value={f.serialNumber ?? ''} onChange={e => u({ serialNumber: e.target.value || undefined })} style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} /></Field>
        </Grid>
        <Grid cols={4}>
          <Field label="Category">
            <select value={f.category} onChange={e => u({ category: e.target.value as PartCategory })} style={{ ...iStyle, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Rate (₹)"><input type="number" value={f.rate} onChange={e => u({ rate: parseFloat(e.target.value) || 0 })} style={{ ...numStyle, color: C.orange }} /></Field>
          <Field label="Formation"><select value={f.formation ?? 'Hard'} onChange={e => u({ formation: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}><option value="Soft">Soft</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Very Hard">Very Hard</option></select></Field>
          </Grid>
        <Grid cols={4}>
          <Field label="Life in metres" hint="Metres before replacement">
            <input type="number" value={f.lifeMetres} onChange={e => u({ lifeMetres: parseFloat(e.target.value) || 0 })} style={numStyle} />
            {f.lifeMetres > 0 && f.rate > 0 && <div style={{ fontSize: 11, color: C.orange, marginTop: 5, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>{perMetre(f.rate / f.lifeMetres)}</div>}
          </Field>
          <Field label="Minimum stock" hint="units"><input type="number" value={f.minStock} onChange={e => u({ minStock: parseFloat(e.target.value) || 0 })} style={numStyle} /></Field>
        </Grid>
        <Grid cols={3}>
          <Field label="Supplier">
            <select value={f.supplier} onChange={e => u({ supplier: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
              {state.suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Lead time" hint="days"><input type="number" value={f.leadTimeDays} onChange={e => u({ leadTimeDays: parseFloat(e.target.value) || 0 })} style={numStyle} /></Field>
        </Grid>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.active} onChange={e => u({ active: e.target.checked })} />
          <span style={{ fontSize: 12.5, color: C.text }}>In use</span>
          <span style={{ fontSize: 11, color: C.faint }}>— retired parts drop out of cost per metre</span>
        </label>
      </div>
    </Modal>
  )
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const { state, importParts } = useInventory()
  const [text, setText] = useState('')
  const TEMPLATE = 'part_number,name,serial_number,category,rate,life_metres,supplier,lead_days,min_stock\nHQ-BIT-IMP,HQ Impregnated Bit,,Bit,22000,100,Sandvik Mining,18,3\nHQ-ROD-30,HQ Wire Line Drill Rod 3.0 m,,Rod & Casing,7840,5000,Boart Longyear India,21,6\n'

  const parsed = useMemo<Part[]>(() => {
    if (!text.trim()) return []
    const rows = text.trim().split(/\r?\n/)
    const head = rows[0].split(',').map(h => h.trim().toLowerCase())
    const idx = (n: string) => head.indexOf(n)
    const out: Part[] = []
    rows.slice(1).forEach(line => {
      const c = line.split(',').map(x => x.trim())
      const at = (n: string) => { const k = idx(n); return k < 0 ? '' : (c[k] ?? '').trim() }
      const num = (n: string, d = 0) => parseFloat(at(n)) || d
      const name = at('name') || c[0]?.trim()
      if (!name) return
      out.push({
        id: uid('t'), partNumber: at('part_number'), name, serialNumber: at('serial_number') || undefined,
        category: (CATEGORIES as string[]).includes(at('category')) ? at('category') as PartCategory : 'Accessory',
        formation: at('formation') || 'Hard',
        rate: num('rate'), lifeMetres: num('life_metres') || num('life'),
        supplier: at('supplier') || (state.suppliers[0]?.name ?? ''),
        leadTimeDays: num('lead_days', 14), minStock: num('min_stock', 1), active: true,
      })
    })
    return out
  }, [text, state.suppliers])

  const existing = (p: Part) => state.catalogue.some(x => x.name.toLowerCase() === p.name.toLowerCase() || (p.partNumber && x.partNumber?.toLowerCase() === p.partNumber.toLowerCase()))

  return (
    <Modal title="Import parts" subtitle="Paste a CSV with part_number, name, category, rate, life_metres, supplier, lead_days, min_stock" width={840} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={parsed.length === 0} onClick={() => { importParts(parsed); onClose() }}>Import {parsed.length} part{parsed.length === 1 ? '' : 's'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Btn size="sm" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' })); a.download = 'xplorix-parts-template.csv'; a.click() }}>Download template</Btn>
        <Field label="CSV"><textarea value={text} onChange={e => setText(e.target.value)} rows={7} placeholder={TEMPLATE} style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, lineHeight: 1.6, resize: 'vertical' }} /></Field>
        {parsed.length > 0 && (
          <Card title="Preview" pad={false} subtitle={`${parsed.filter(p => !existing(p)).length} new · ${parsed.filter(existing).length} updates`}>
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part</th><th style={thR}>Rate</th><th style={thR}>Life</th><th style={thR}>Cost/m</th><th style={th} /></tr></thead>
              <tbody>
                {parsed.map((p, k) => (
                  <tr key={k} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, color: C.text }}>{p.name}</td>
                    <td style={tdN}>{money(p.rate)}</td>
                    <td style={{ ...tdN, color: C.faint }}>{p.lifeMetres.toLocaleString('en-IN')} m</td>
                    <td style={{ ...tdN, color: C.orange, fontWeight: 700 }}>{p.lifeMetres > 0 ? perMetre(p.rate / p.lifeMetres) : '—'}</td>
                    <td style={td}><Tag tone={existing(p) ? C.amber : C.green}>{existing(p) ? 'update' : 'new'}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * ORDERS (unchanged from previous version, abbreviated)
 * ========================================================================== */

const PO_TONE: Record<string, string> = { draft: C.faint, ordered: C.blue, partial: C.amber, received: C.green }
const REORDER_TONE: Record<ReorderStatus, string> = { raised: C.red, sent: C.amber, promised: C.amber, closed: C.green, credited: C.blue }

function OrdersTab({ onReceive, onCreate, onEdit, onRaiseReorder, onReceiveReorder }: {
  onReceive: (po: PurchaseOrder) => void; onCreate: () => void; onEdit: (po: PurchaseOrder) => void
  onRaiseReorder: (po: PurchaseOrder) => void; onReceiveReorder: (po: PurchaseOrder, r: Reorder) => void
}) {
  const { state } = useInventory()
  const [open, setOpen] = useState<string | null>(null)
  const [q, setQ] = useState(''); const [status, setStatus] = useState<'all' | 'draft' | 'ordered' | 'partial' | 'received'>('all')
  const [sup, setSup] = useState('All'); const [proj, setProj] = useState('All')
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id

  const pos = state.pos.filter(p =>
    (status === 'all' || poStatus(p) === status) && (sup === 'All' || p.supplier === sup) &&
    (proj === 'All' || p.project === proj) &&
    (!q || p.number.toLowerCase().includes(q.toLowerCase()) || p.supplier.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.orderedDate ?? b.createdDate).localeCompare(a.orderedDate ?? a.createdDate))

  const t = state.pos.reduce((a, p) => ({ ordered: a.ordered + (p.status === 'draft' ? 0 : poValue(p)), received: a.received + poReceivedValue(p), store: a.store + poStoreValue(p), owed: a.owed + poOpenReorderValue(p) }), { ordered: 0, received: 0, store: 0, owed: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={4}>
        <Stat label="On order" value={moneyL(t.ordered - t.received)} note="placed, not yet delivered" color={C.blue} />
        <Stat label="Received" value={moneyL(t.received)} note="accepted into regular store" />
        <Stat label="In regular store" value={moneyL(t.store)} note="on the shelf, not yet on a rig" color={C.amber} />
        <Stat label="Owed on reorders" value={moneyL(t.owed)} note="sent back, replacement pending" color={t.owed > 0 ? C.red : C.dim} />
      </Grid>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ width: 210 }}><Field label="Search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Order number or supplier" style={iStyle} /></Field></div>
        <div style={{ width: 150 }}><Field label="Status"><select value={status} onChange={e => setStatus(e.target.value as typeof status)} style={{ ...iStyle, cursor: 'pointer' }}>{(['all', 'draft', 'ordered', 'partial', 'received'] as const).map(k => <option key={k} value={k}>{k}</option>)}</select></Field></div>
        <div style={{ width: 185 }}><Field label="Supplier"><select value={sup} onChange={e => setSup(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}><option value="All">All suppliers</option>{state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}</select></Field></div>
        <div style={{ width: 175 }}><Field label="Project"><select value={proj} onChange={e => setProj(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}><option value="All">All projects</option>{PROJECTS.map(x => <option key={x} value={x}>{projectCode(x)}</option>)}</select></Field></div>
        <div style={{ flex: 1 }} />
        {(q || status !== 'all' || sup !== 'All' || proj !== 'All') && <Btn size="sm" onClick={() => { setQ(''); setStatus('all'); setSup('All'); setProj('All') }}>Clear</Btn>}
        <Btn size="sm" tone="primary" onClick={onCreate}>New order</Btn>
      </div>

      <Card title="Purchase orders" pad={false} subtitle={`${pos.length} of ${state.pos.length} · all receipts land in the regular store`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Project</th><th style={th}>Status</th><th style={th}>Ordered</th><th style={th}>Promised</th><th style={th}>Delivered</th><th style={thR}>Delay</th><th style={thR}>Value</th><th style={thR}>In store</th><th style={th} /></tr></thead>
            <tbody>
              {pos.length === 0 && <tr><td colSpan={11}><Empty>Nothing matches those filters.</Empty></td></tr>}
              {pos.map(po => {
                const st = poStatus(po)
                const isOpen = open === po.id
                const lastReceipt = po.receipts.map(r => r.date).sort().pop()
                const delay = lastReceipt && po.promisedDate ? daysBetween(po.promisedDate, lastReceipt) : null
                const late = st !== 'received' && !!po.promisedDate && po.promisedDate < TODAY
                const owed = openReorders(po)
                return (
                  <Fragment key={po.id}>
                    <tr onClick={() => setOpen(isOpen ? null : po.id)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : late ? 'rgba(239,68,68,0.05)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>{po.number}{owed.length > 0 && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>{owed.length} on reorder</Tag></span>}</td>
                      <td style={td}>{po.supplier}</td><td style={tdMono}>{projectCode(po.project)}</td>
                      <td style={td}><Tag tone={PO_TONE[st]}>{st}</Tag></td>
                      <td style={td}>{po.orderedDate ? dayLabel(po.orderedDate) : '—'}</td>
                      <td style={{ ...td, color: late ? C.red : C.muted }}>{po.promisedDate ? dayLabel(po.promisedDate) : '—'}</td>
                      <td style={td}>{lastReceipt ? dayLabel(lastReceipt) : late ? 'overdue' : '—'}</td>
                      <td style={{ ...tdN, color: delay == null ? C.dim : delay > 0 ? C.red : C.green, fontWeight: 700 }}>{delay == null ? '—' : delay > 0 ? `+${delay}d` : `${delay}d`}</td>
                      <td style={tdN}>{money(poValue(po))}</td>
                      <td style={{ ...tdN, color: poStoreValue(po) > 0 ? C.amber : C.dim }}>{poStoreValue(po) > 0 ? money(poStoreValue(po)) : '—'}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          {st === 'draft' && <Btn size="sm" tone="primary" onClick={() => onEdit(po)}>Open draft</Btn>}
                          {poHasSomethingToReceive(po) && <Btn size="sm" tone="primary" onClick={() => onReceive(po)}>Receive</Btn>}
                          {poHasSomethingToReorder(po) && <Btn size="sm" tone="danger" onClick={() => onRaiseReorder(po)}>Reorder</Btn>}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>
                            <div>
                              <SubHead tone={C.orange}>Lines</SubHead>
                              <table style={tableStyle}><thead><tr><th style={th}>Part</th><th style={thR}>Ordered</th><th style={thR}>Accepted</th><th style={thR}>Faulty</th><th style={thR}>In store</th><th style={thR}>Value</th></tr></thead>
                                <tbody>{po.lines.map(l => (<tr key={l.itemId} style={{ borderBottom: rowBorder }}><td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td><td style={tdN}>{l.qty}</td><td style={{ ...tdN, color: C.green }}>{qtyReceived(po, l.itemId)}</td><td style={{ ...tdN, color: qtyFaulty(po, l.itemId) > 0 ? C.red : C.dim }}>{qtyFaulty(po, l.itemId) || '—'}</td><td style={{ ...tdN, color: qtyInStore(po, l.itemId) > 0 ? C.amber : C.dim }}>{qtyInStore(po, l.itemId)}</td><td style={tdN}>{money(l.qty * l.rate)}</td></tr>))}</tbody>
                              </table>
                            </div>
                            <div>
                              <SubHead tone={C.blue}>History</SubHead>
                              {po.receipts.length === 0 && po.reorders.length === 0 && po.issues.length === 0 ? <Empty>Placed, nothing delivered yet.</Empty> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {po.receipts.map(r => (<div key={r.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}><Tag tone={C.blue}>received</Tag>{' '}<span style={{ color: C.text }}>{fullDate(r.date)}</span>{' — '}{r.lines.map(l => `${l.accepted} × ${nameOf(l.itemId)}${l.damaged ? ` (+${l.damaged} damaged)` : ''}`).join(', ')}{r.delayReason && <span style={{ color: C.red }}> · {r.delayReason}</span>}</div>))}
                                  {po.reorders.map(r => (<div key={r.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}><Tag tone={r.receipt ? C.amber : C.red}>reorder r{r.round}</Tag>{' '}<span style={{ color: C.text }}>{fullDate(r.raisedDate)}</span>{' — '}{r.qty} × {nameOf(r.itemId)} · {r.reason}{r.receipt && <span style={{ color: r.receipt.accepted > 0 ? C.green : C.red }}>{' · '}{fullDate(r.receipt.date)}: {r.receipt.accepted} accepted{r.receipt.damaged + r.receipt.rejected > 0 ? `, ${r.receipt.damaged + r.receipt.rejected} faulty again` : ''}</span>}</div>))}
                                  {po.issues.map(i => (<div key={i.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}><Tag tone={C.green}>issued to rig</Tag>{' '}<span style={{ color: C.text }}>{fullDate(i.date)}</span>{' → '}<span style={{ fontFamily: 'ui-monospace, monospace' }}>{i.rig}</span>{' · '}{projectCode(i.project ?? po.project)}{' — '}{i.lines.map(l => `${l.qty} × ${nameOf(l.itemId)}`).join(', ')}</div>))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ReordersTable onReceiveReorder={onReceiveReorder} />
      <SupplierTable />
    </div>
  )
}

function ReordersTable({ onReceiveReorder }: { onReceiveReorder: (po: PurchaseOrder, r: Reorder) => void }) {
  const { state, updateReorder } = useInventory()
  const [showClosed, setShowClosed] = useState(false)
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const rows = state.pos.flatMap(po => po.reorders.map(r => ({ po, r }))).filter(({ r }) => showClosed || (!r.receipt && r.status !== 'credited')).sort((a, b) => b.r.raisedDate.localeCompare(a.r.raisedDate))
  const open = state.pos.flatMap(po => openReorders(po).map(r => ({ po, r })))
  const owed = open.reduce((s, { po, r }) => s + r.qty * rateOfLine(po, r.itemId), 0)
  return (
    <Card title="Reorders" pad={false} subtitle={`${open.length} open · ${money(owed)} owed by suppliers`} accent={open.length ? C.red : undefined} right={<label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}><input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} /><span style={{ fontSize: 11.5, color: C.muted }}>Show settled</span></label>}>
      {rows.length === 0 ? <Empty>No reorders. Nothing has come in faulty.</Empty> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Raised</th><th style={th}>Order</th><th style={th}>Part</th><th style={thR}>Qty</th><th style={thR}>Round</th><th style={th}>Reason</th><th style={th}>Due</th><th style={th}>Status</th><th style={th}>Outcome</th><th style={thR}>Value</th><th style={th} /></tr></thead>
            <tbody>
              {rows.map(({ po, r }) => {
                const isOpen = !r.receipt && r.status !== 'credited'
                const overdue = isOpen && !!r.promisedDate && r.promisedDate < TODAY
                const failedAgain = r.receipt && (r.receipt.damaged + r.receipt.rejected) > 0
                return (
                  <tr key={r.id} style={{ borderBottom: rowBorder, background: overdue ? 'rgba(239,68,68,0.06)' : failedAgain ? 'rgba(245,158,11,0.05)' : undefined, opacity: isOpen ? 1 : 0.75 }}>
                    <td style={{ ...td, color: C.text }}>{dayLabel(r.raisedDate)}</td>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>{po.number}</td>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal', maxWidth: 200 }}>{nameOf(r.itemId)}</td>
                    <td style={tdN}>{r.qty}</td>
                    <td style={{ ...tdN, color: r.round > 1 ? C.red : C.faint, fontWeight: r.round > 1 ? 800 : 400 }}>{r.round}</td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 200, color: C.faint }}>{r.reason}</td>
                    <td style={{ ...td, color: overdue ? C.red : C.muted }}>{r.promisedDate ? dayLabel(r.promisedDate) : isOpen ? 'no date' : '—'}</td>
                    <td style={td}>{isOpen ? (<select value={r.status} onChange={e => updateReorder(po.id, { ...r, status: e.target.value as ReorderStatus })} style={{ ...iStyle, width: 168, cursor: 'pointer', fontSize: 11.5 }}>{REORDER_OPEN_STATUSES.map(k => <option key={k} value={k}>{REORDER_STATUS_LABEL[k]}</option>)}<option value="credited">{REORDER_STATUS_LABEL.credited}</option></select>) : <Tag tone={REORDER_TONE[r.status]}>{REORDER_STATUS_LABEL[r.status]}</Tag>}</td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 200 }}>{r.receipt ? <span style={{ color: failedAgain ? C.red : C.green }}>{fullDate(r.receipt.date)} · {r.receipt.accepted} accepted{failedAgain ? `, ${r.receipt.damaged + r.receipt.rejected} faulty again` : ''}</span> : r.status === 'credited' ? <span style={{ color: C.blue }}>Settled as credit</span> : <span style={{ color: C.dim }}>Waiting</span>}</td>
                    <td style={tdN}>{money(r.qty * rateOfLine(po, r.itemId))}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{isOpen && <Btn size="sm" tone="primary" onClick={() => onReceiveReorder(po, r)}>Receive replacement</Btn>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function Stars({ n }: { n?: number }) {
  if (!n) return <span style={{ color: C.dim, fontSize: 11 }}>not rated</span>
  return <span style={{ letterSpacing: 1 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? C.amber : C.dim, fontSize: 12 }}>★</span>)}</span>
}

function SupplierTable() {
  const { state, saveSupplier } = useInventory()
  const [editing, setEditing] = useState<Supplier | null>(null)
  const rows = state.suppliers.map(s => ({ s, p: supplierPerformance(state.pos, state.suppliers, s.name) })).sort((a, b) => (a.p.avgDelay ?? 99) - (b.p.avgDelay ?? 99))
  const blank = (): Supplier => ({ id: uid('s'), name: '', contact: '', phone: '', quotedLeadDays: 14 })
  return (
    <>
      <Card title="Suppliers" pad={false} subtitle="Lead time and faults measured from what actually happened" right={<Btn size="sm" tone="primary" onClick={() => setEditing(blank())}>Add supplier</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Supplier</th><th style={th}>Contact</th><th style={thR}>Orders</th><th style={thR}>Value</th><th style={thR}>Quoted</th><th style={thR}>Actual</th><th style={thR}>Delay</th><th style={thR}>On time</th><th style={thR}>Faulty</th><th style={thR}>Open reorders</th><th style={th}>Rating</th><th style={th} /></tr></thead>
            <tbody>
              {rows.map(({ s: sup, p: r }) => (
                <tr key={sup.id} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{sup.name}</td><td style={{ ...td, color: C.faint }}>{sup.contact}</td>
                  <td style={tdN}>{r.orders || '—'}</td><td style={tdN}>{r.value ? money(r.value) : '—'}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.quotedLead != null ? `${r.quotedLead}d` : '—'}</td>
                  <td style={tdN}>{r.actualLead != null ? `${Math.round(r.actualLead)}d` : '—'}</td>
                  <td style={{ ...tdN, fontWeight: 700, color: r.avgDelay == null ? C.dim : r.avgDelay > 0 ? C.red : C.green }}>{r.avgDelay == null ? '—' : r.avgDelay > 0 ? `+${Math.round(r.avgDelay)}d` : `${Math.round(r.avgDelay)}d`}</td>
                  <td style={{ ...tdN, color: r.onTimePct == null ? C.dim : r.onTimePct >= 80 ? C.green : r.onTimePct >= 50 ? C.amber : C.red }}>{r.onTimePct == null ? '—' : `${Math.round(r.onTimePct)}%`}</td>
                  <td style={{ ...tdN, color: r.faultyPct ? C.red : C.dim }}>{r.faultyPct ? `${r.faultyPct.toFixed(1)}%` : '—'}</td>
                  <td style={{ ...tdN, color: r.openReorders ? C.red : C.dim }}>{r.openReorders || '—'}</td>
                  <td style={td}><Stars n={sup.rating} /></td>
                  <td style={{ ...td, textAlign: 'right' }}><Btn size="sm" onClick={() => setEditing(sup)}>Edit</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {editing && (
        <Modal title={editing.name || 'New supplier'} width={500} onClose={() => setEditing(null)} footer={<><Btn onClick={() => setEditing(null)}>Cancel</Btn><Btn tone="primary" disabled={!editing.name.trim()} onClick={() => { saveSupplier(editing); setEditing(null) }}>Save</Btn></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Grid cols={2}>
              <Field label="Name"><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={iStyle} /></Field>
              <Field label="Contact"><input value={editing.contact} onChange={e => setEditing({ ...editing, contact: e.target.value })} style={iStyle} /></Field>
              <Field label="Phone"><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} style={iStyle} /></Field>
              <Field label="Quoted lead time" hint="days"><input type="number" value={editing.quotedLeadDays} onChange={e => setEditing({ ...editing, quotedLeadDays: parseFloat(e.target.value) || 0 })} style={numStyle} /></Field>
            </Grid>
            <Field label="Your rating"><div style={{ display: 'flex', gap: 6 }}>{[1,2,3,4,5].map(n => (<button key={n} onClick={() => setEditing({ ...editing, rating: n })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 0, color: (editing.rating ?? 0) >= n ? C.amber : C.dim }}>★</button>))}{editing.rating != null && <button onClick={() => setEditing({ ...editing, rating: undefined })} style={{ background: 'none', border: 'none', color: C.faint, fontSize: 11, cursor: 'pointer', marginLeft: 6, fontFamily: 'inherit' }}>clear</button>}</div></Field>
            <Field label="Note"><input value={editing.ratingNote ?? ''} onChange={e => setEditing({ ...editing, ratingNote: e.target.value })} placeholder="e.g. cheap but packaging is poor" style={iStyle} /></Field>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ==========================================================================
 * REGULAR STORE
 * ========================================================================== */

function RegularStoreTab({ onIssue, onMove }: { onIssue: (project: string, line?: StockLine) => void; onMove: (l: StockLine) => void }) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const [project, setProject] = useState<string | 'all'>('all')
  const stock = stockInStore(state.pos, TODAY)
  const pending = onOrder(state.pos, TODAY)
  const shown = stock.filter(l => project === 'all' || l.project === project)
  const stockValue = stock.reduce((s, l) => s + l.value, 0)
  const shownValue = shown.reduce((s, l) => s + l.value, 0)
  const idle = stock.filter(l => l.ageDays >= state.alerts.idleDays)
  const projects = Array.from(new Set(stock.map(l => l.project)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={3}>
        <Stat label="On the shelf" value={moneyL(stockValue)} note={`${stock.length} lines · ${new Set(stock.map(s => s.itemId)).size} parts`} color={C.amber} big />
        <Stat label={`Sitting over ${state.alerts.idleDays} days`} value={moneyL(idle.reduce((s, l) => s + l.value, 0))} note={`${idle.length} lines`} color={idle.length ? C.red : C.dim} big />
        <Stat label="On order" value={moneyL(pending.reduce((s, l) => s + l.value, 0))} note={`${pending.filter(p => (p.overdueDays ?? 0) > 0).length} overdue`} color={C.blue} big />
      </Grid>

      <Note tone={C.dim}>
        All purchase order receipts land here. Issue parts from here to a rig — once issued they appear in that rig&apos;s startup store and the driller can log them.
      </Note>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        <Chain label="Project">
          <Chip on={project === 'all'} label="All" onClick={() => setProject('all')} />
          {projects.map(p => <Chip key={p} on={project === p} label={projectCode(p)} onClick={() => setProject(project === p ? 'all' : p)} />)}
        </Chain>
        <div style={{ flex: 1 }} />
        <Btn size="sm" tone="primary" disabled={shown.filter(l => isLiveProject(l.project)).length === 0}
          onClick={() => onIssue(project === 'all' ? (projects.find(isLiveProject) ?? PROJECTS[0]) : project)}>
          Issue parts to a rig
        </Btn>
      </div>

      <Card title="On the shelf" pad={false} subtitle={`${shown.length} lines · ${money(shownValue)} received and not yet issued`}>
        {shown.length === 0 ? <Empty>Nothing on the shelf. Everything received has gone to a rig.</Empty> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part</th><th style={th}>Project</th><th style={th}>From order</th><th style={thR}>Qty</th><th style={thR}>Age</th><th style={thR}>Value</th><th style={th} /></tr></thead>
              <tbody>
                {shown.map(l => {
                  const old = l.ageDays >= state.alerts.idleDays
                  const stranded = COMPLETED_PROJECTS.includes(l.project)
                  return (
                    <tr key={l.key} style={{ borderBottom: rowBorder, background: stranded ? 'rgba(239,68,68,0.05)' : old ? 'rgba(245,158,11,0.04)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                      <td style={tdMono}>{projectCode(l.project)}{stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>project ended</Tag></span>}{l.movedHere && !stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.blue}>moved</Tag></span>}</td>
                      <td style={td}>{l.poNumber}</td>
                      <td style={tdN}>{l.qty}</td>
                      <td style={{ ...tdN, color: old ? C.amber : C.faint, fontWeight: old ? 700 : 400 }}>{l.ageDays}d</td>
                      <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(l.value)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {!stranded && <Btn size="sm" tone="primary" onClick={() => onIssue(l.project, l)}>Issue to rig</Btn>}
                          <Btn size="sm" onClick={() => onMove(l)}>Move</Btn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={5}>Total on the shelf</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(shownValue)}</td>
                  <td style={td} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card title="On order" pad={false} subtitle="Placed and not yet received">
        {pending.length === 0 ? <Empty>Nothing outstanding.</Empty> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part</th><th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Due</th><th style={thR}>Qty</th><th style={thR}>Value</th><th style={thR}>Status</th></tr></thead>
              <tbody>
                {pending.map((l, k) => (
                  <tr key={k} style={{ borderBottom: rowBorder, background: (l.overdueDays ?? 0) > 0 ? 'rgba(239,68,68,0.05)' : undefined }}>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{state.catalogue.find(p => p.id === l.itemId)?.name ?? l.itemId}</td>
                    <td style={td}>{l.poNumber}</td><td style={td}>{l.supplier}</td>
                    <td style={td}>{l.promisedDate ? dayLabel(l.promisedDate) : '—'}</td>
                    <td style={tdN}>{l.qty}</td><td style={tdN}>{money(l.value)}</td>
                    <td style={{ ...tdN, color: (l.overdueDays ?? 0) > 0 ? C.red : l.awaitingReplacement ? C.amber : C.blue, fontWeight: 700 }}>
                      {(l.overdueDays ?? 0) > 0 ? `${l.overdueDays}d late` : l.awaitingReplacement ? 'replacement' : 'awaiting'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ==========================================================================
 * STARTUP STORE
 * ========================================================================== */

function StartupStoreTab() {
  const { state } = useInventory()
  const { state: cost } = useCosting()

  const [project, setProject] = useState(PROJECTS[0])
  const [rig, setRig] = useState(RIGS[0])

  /* All parts used on this rig and project, from the shift logs. */
  const partsUsed = useMemo(() => {
    const counts: Record<string, number> = {}
    cost.shiftLogs
      .filter(l => l.rig === rig && l.project === project)
      .forEach(l => (l.partsUsed ?? []).forEach(u => { counts[u.itemId] = (counts[u.itemId] ?? 0) + u.qty }))
    return Object.entries(counts).map(([itemId, qty]) => ({ itemId, qty }))
  }, [cost.shiftLogs, rig, project])

  const lines = useMemo(
    () => startupStore(state.pos, state.catalogue, rig, project, partsUsed),
    [state.pos, state.catalogue, rig, project, partsUsed])

  const totalIssued = lines.reduce((s, l) => s + l.valueIssued, 0)
  const totalUsedQty = lines.reduce((s, l) => s + l.totalUsed, 0)
  const totalOnRig = lines.reduce((s, l) => s + l.onRig * (l.valueIssued / Math.max(1, l.totalIssued)), 0)

  /* Metres drilled by this rig on this project — for context alongside cost. */
  const metresDrilled = useMemo(() =>
    cost.shiftLogs.filter(l => l.rig === rig && l.project === project).reduce((s, l) => s + l.metresDrilled, 0),
    [cost.shiftLogs, rig, project])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        Everything the regular store has ever issued to this rig on this project. Each new issue adds to the running total.
        <strong style={{ color: C.text }}> Total used</strong> comes from the driller&apos;s log.
      </Note>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        <Chain label="Project">
          {PROJECTS.map(p => <Chip key={p} on={project === p} label={projectCode(p)} onClick={() => setProject(p)} />)}
        </Chain>
        <span style={{ width: 1, height: 22, background: C.border }} />
        <Chain label="Rig">
          {RIGS.map(r => <Chip key={r} on={rig === r} label={r} onClick={() => setRig(r)} />)}
        </Chain>
      </div>

      <Grid cols={4}>
        <Stat label="Total value issued" value={moneyL(totalIssued)} note={`to ${rig} on ${projectCode(project)}`} color={C.amber} big />
        <Stat label="Total used" value={`${totalUsedQty} units`} note="from the driller's log" color={C.green} big />
        <Stat label="Still on the rig" value={moneyL(totalOnRig)} note="issued minus used" color={C.blue} big />
        <Stat label="Metres drilled" value={`${metresDrilled.toLocaleString('en-IN')} m`} note={`by ${rig}`} color={C.text} big />
      </Grid>

      <Card title={`Parts on ${rig} · ${projectCode(project)}`} pad={false}
        subtitle="Cumulative — every issue ever made to this rig on this project">
        {lines.length === 0 ? (
          <Empty>
            Nothing has been issued to {rig} on {projectCode(project)} yet.<br />
            Go to Regular store and issue parts to this rig — they will appear here.
          </Empty>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Part number</th>
                  <th style={th}>Item</th>
                  <th style={thR}>Life</th>
                  <th style={thR}>Total issued</th>
                  <th style={thR}>Total used</th>
                  <th style={thR}>On the rig</th>
                  <th style={thR}>Value issued</th>
                  <th style={thR}>Cost / metre</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(l => {
                  const usedPct = l.totalIssued > 0 ? (l.totalUsed / l.totalIssued) * 100 : 0
                  return (
                    <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                      <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{l.partNumber || '—'}</td>
                      <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 230 }}>{l.name}</td>
                      <td style={{ ...tdN, color: C.faint }}>{l.lifeMetres.toLocaleString('en-IN')} m</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{l.totalIssued}</td>
                      <td style={{ ...tdN, color: C.green }}>{l.totalUsed}</td>
                      <td style={{ ...tdN, color: l.onRig > 0 ? C.blue : C.dim, fontWeight: l.onRig > 0 ? 700 : 400 }}>{l.onRig}</td>
                      <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(l.valueIssued)}</td>
                      <td style={{ ...tdN, color: C.orange, fontWeight: 700 }}>{perMetre(l.costPerMetre)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={6}>Total</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(totalIssued)}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>
                    {metresDrilled > 0 ? perMetre(totalIssued / metresDrilled) : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

/* ==========================================================================
 * MODALS (receive, reorder, issue, move)
 * ========================================================================== */

function ReceiveModal({ po, onSave, onClose }: { po: PurchaseOrder; onSave: (date: string, lines: ReceiptLine[], delayReason: DelayReason | undefined, note: string) => void; onClose: () => void }) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const [date, setDate] = useState(TODAY); const [note, setNote] = useState(''); const [reason, setReason] = useState<DelayReason | ''>('')
  const outstanding = (id: string) => qtyNeverDelivered(po, id)
  const [rows, setRows] = useState<Record<string, { accepted: number; damaged: number; rejected: number }>>(Object.fromEntries(po.lines.map(l => [l.itemId, { accepted: outstanding(l.itemId), damaged: 0, rejected: 0 }])))

  const set = (itemId: string, k: 'accepted' | 'damaged' | 'rejected', v: number) => setRows(r => {
    const out = outstanding(itemId)
    const next = { ...r[itemId], [k]: Math.max(0, Math.min(v, out)) }
    const others = (['accepted', 'rejected', 'damaged'] as const).filter(x => x !== k)
    let over = others.reduce((s, x) => s + next[x], 0) + next[k] - out
    others.forEach(x => { if (over <= 0) return; const take = Math.min(next[x], over); next[x] -= take; over -= take })
    return { ...r, [itemId]: next }
  })

  const lines: ReceiptLine[] = po.lines.map(l => ({ itemId: l.itemId, ...rows[l.itemId] })).filter(l => l.accepted + l.damaged + l.rejected > 0)
  const rate = (id: string) => rateOfLine(po, id)
  const acceptedValue = lines.reduce((s, l) => s + l.accepted * rate(l.itemId), 0)
  const faultyValue = lines.reduce((s, l) => s + (l.damaged + l.rejected) * rate(l.itemId), 0)
  const delay = po.promisedDate ? daysBetween(po.promisedDate, date) : null
  const late = delay != null && delay > 0

  return (
    <Modal title={`Receive against ${po.number}`} subtitle={`${po.supplier} · ${projectCode(po.project)}`} width={760} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={lines.length === 0 || (late && !reason)} onClick={() => { onSave(date, lines, reason || undefined, note); onClose() }}>Record receipt</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Note tone={C.dim}>Accepted parts go straight onto the shelf in the regular store. Damaged and wrong stock becomes a reorder.</Note>
        <Grid cols={2}>
          <Field label="Delivered on"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} /></Field>
          <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        </Grid>
        {delay != null && <Note tone={late ? C.red : C.green}>{po.promisedDate && `Promised ${fullDate(po.promisedDate)}. `}{late ? `${delay} days late.` : delay === 0 ? 'On time.' : `${Math.abs(delay)} days early.`}</Note>}
        {late && <Field label="Why was it late?" hint="A delay caused by our own late order is not scored against the supplier"><select value={reason} onChange={e => setReason(e.target.value as DelayReason)} style={{ ...iStyle, cursor: 'pointer' }}><option value="">Select a reason</option>{DELAY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select></Field>}
        <table style={tableStyle}>
          <thead><tr><th style={th}>Part</th><th style={thR}>Still owed</th><th style={thR}>Accepted</th><th style={thR}>Damaged</th><th style={thR}>Wrong / short</th></tr></thead>
          <tbody>{po.lines.map(l => { const out = outstanding(l.itemId); const r = rows[l.itemId]; return (<tr key={l.itemId} style={{ borderBottom: rowBorder, opacity: out > 0 ? 1 : 0.4 }}><td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td><td style={{ ...tdN, color: out > 0 ? C.amber : C.dim }}>{out}</td>{(['accepted', 'damaged', 'rejected'] as const).map(k => (<td key={k} style={{ padding: '5px 8px', width: 104 }}><input type="number" min={0} max={out} disabled={out === 0} value={r[k]} onChange={e => set(l.itemId, k, parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: k === 'accepted' ? C.green : k === 'damaged' ? C.red : C.amber }} /></td>))}</tr>) })}</tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, alignItems: 'baseline' }}>
          <div><span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Onto the shelf</span><span style={{ fontSize: 15, fontWeight: 900, color: C.green, fontFamily: 'ui-monospace, monospace' }}>{money(acceptedValue)}</span></div>
          {faultyValue > 0 && <div><span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Not fit to use</span><span style={{ fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(faultyValue)}</span></div>}
        </div>
      </div>
    </Modal>
  )
}

function RaiseReorderModal({ po, onSave, onClose }: { po: PurchaseOrder; onSave: (rs: Omit<Reorder, 'id'>[]) => void; onClose: () => void }) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const candidates = po.lines.filter(l => qtyToReorder(po, l.itemId) > 0)
  const [rows, setRows] = useState<Record<string, { qty: number; reason: string }>>(Object.fromEntries(candidates.map(l => [l.itemId, { qty: qtyToReorder(po, l.itemId), reason: 'Damaged in transit' }])))
  const [promisedDate, setPromisedDate] = useState('')
  const set = (itemId: string, p: Partial<{ qty: number; reason: string }>) => setRows(r => ({ ...r, [itemId]: { ...r[itemId], ...p } }))
  const picked = candidates.map(l => ({ itemId: l.itemId, ...rows[l.itemId] })).filter(r => r.qty > 0)
  const owed = picked.reduce((s, r) => s + r.qty * rateOfLine(po, r.itemId), 0)
  return (
    <Modal title={`Reorder against ${po.number}`} subtitle={po.supplier} width={780} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={picked.length === 0} onClick={() => { onSave(picked.map(r => ({ itemId: r.itemId, qty: r.qty, reason: r.reason.trim() || 'Arrived unusable', raisedDate: TODAY, round: 1, status: promisedDate ? 'promised' : 'raised', promisedDate: promisedDate || undefined }))); onClose() }}>Raise {picked.length} reorder{picked.length === 1 ? '' : 's'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Note tone={C.dim}>Each part gets its own line in the Reorders table. Set quantity to zero to skip a part.</Note>
        <Grid cols={2}><Field label="Replacement promised" hint="Optional — applies to all parts on this reorder"><input type="date" value={promisedDate} onChange={e => setPromisedDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} /></Field></Grid>
        <table style={tableStyle}>
          <thead><tr><th style={th}>Part</th><th style={thR}>Faulty</th><th style={thR}>Reordering</th><th style={th}>What was wrong</th><th style={thR}>Value</th></tr></thead>
          <tbody>{candidates.map(l => { const max = qtyToReorder(po, l.itemId); const r = rows[l.itemId]; const on = r.qty > 0; return (<tr key={l.itemId} style={{ borderBottom: rowBorder, opacity: on ? 1 : 0.5 }}><td style={{ ...td, color: C.text, whiteSpace: 'normal', maxWidth: 220 }}>{nameOf(l.itemId)}</td><td style={{ ...tdN, color: C.red }}>{max}</td><td style={{ padding: '5px 8px', width: 104 }}><input type="number" min={0} max={max} value={r.qty} onChange={e => set(l.itemId, { qty: Math.min(max, Math.max(0, parseFloat(e.target.value) || 0)) })} style={{ ...numStyle, color: on ? C.orange : C.muted }} /></td><td style={{ padding: '5px 8px', minWidth: 220 }}><input value={r.reason} disabled={!on} onChange={e => set(l.itemId, { reason: e.target.value })} placeholder="e.g. cases cracked in transit" style={{ ...iStyle, opacity: on ? 1 : 0.45 }} /></td><td style={{ ...tdN, color: on ? C.text : C.dim, fontWeight: on ? 700 : 400 }}>{on ? money(r.qty * rateOfLine(po, l.itemId)) : '—'}</td></tr>) })}</tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 10 }}><span style={{ fontSize: 11, color: C.faint }}>Value owed by {po.supplier}</span><span style={{ fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(owed)}</span></div>
      </div>
    </Modal>
  )
}

function ReceiveReorderModal({ po, reorder, onSave, onClose }: { po: PurchaseOrder; reorder: Reorder; onSave: (r: ReorderReceipt) => void; onClose: () => void }) {
  const { state } = useInventory()
  const name = state.catalogue.find(p => p.id === reorder.itemId)?.name ?? reorder.itemId
  const [date, setDate] = useState(TODAY); const [note, setNote] = useState('')
  const [row, setRow] = useState({ accepted: reorder.qty, damaged: 0, rejected: 0 })
  const set = (k: 'accepted' | 'damaged' | 'rejected', v: number) => setRow(r => {
    const next = { ...r, [k]: Math.max(0, Math.min(v, reorder.qty)) }
    const others = (['accepted', 'rejected', 'damaged'] as const).filter(x => x !== k)
    let over = others.reduce((s, x) => s + next[x], 0) + next[k] - reorder.qty
    others.forEach(x => { if (over <= 0) return; const take = Math.min(next[x], over); next[x] -= take; over -= take })
    return next
  })
  const { accepted, damaged, rejected } = row
  const faulty = damaged + rejected
  const rate = rateOfLine(po, reorder.itemId)
  return (
    <Modal title={`Receive replacement — round ${reorder.round}`} subtitle={`${name} · ${po.number} · ${po.supplier}`} width={640} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={accepted + damaged + rejected === 0} onClick={() => { onSave({ date, accepted, damaged, rejected, note: note || undefined }); onClose() }}>{faulty > 0 ? `Record and reorder ${faulty}` : 'Record replacement'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Grid cols={2}><Field label="Arrived on"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} /></Field><Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field></Grid>
        <Grid cols={3}>
          <Field label="Accepted" hint="goes onto the shelf"><input type="number" min={0} max={reorder.qty} value={accepted} onChange={e => set('accepted', parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: C.green }} /></Field>
          <Field label="Damaged" hint="faulty again"><input type="number" min={0} max={reorder.qty} value={damaged} onChange={e => set('damaged', parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: C.red }} /></Field>
          <Field label="Wrong / short"><input type="number" min={0} max={reorder.qty} value={rejected} onChange={e => set('rejected', parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: C.amber }} /></Field>
        </Grid>
        {faulty > 0 ? <Note tone={C.red}>{faulty} still unusable ({money(faulty * rate)}). Saving opens round {reorder.round + 1} automatically.</Note> : <Note tone={C.green}>{accepted} unit{accepted === 1 ? '' : 's'} ({money(accepted * rate)}) go onto the shelf. This reorder closes.</Note>}
      </div>
    </Modal>
  )
}

function POModal({ po, onSave, onPlace, onClose }: { po: PurchaseOrder; onSave: (po: PurchaseOrder) => void; onPlace: (id: string, ordered: string, promised: string) => void; onClose: () => void }) {
  const { state } = useInventory()
  const [f, setF] = useState<PurchaseOrder>(po)
  const [placing, setPlacing] = useState(false)
  const [q, setQ] = useState(''); const [cat, setCat] = useState<PartCategory | 'All'>('All'); const [allSuppliers, setAllSuppliers] = useState(false)
  const isNew = !state.pos.some(p => p.id === po.id)
  const quoted = state.suppliers.find(x => x.name === f.supplier)?.quotedLeadDays ?? 14
  const [ordered, setOrdered] = useState(TODAY); const [promised, setPromised] = useState(addDays(TODAY, quoted))
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const qtyOf = (id: string) => f.lines.find(l => l.itemId === id)?.qty ?? 0
  const rateOf = (id: string) => f.lines.find(l => l.itemId === id)?.rate ?? state.catalogue.find(p => p.id === id)?.rate ?? 0
  const setQty = (id: string, qty: number) => setF(x => { const part = state.catalogue.find(p => p.id === id); if (qty <= 0) return { ...x, lines: x.lines.filter(l => l.itemId !== id) }; if (x.lines.some(l => l.itemId === id)) return { ...x, lines: x.lines.map(l => l.itemId === id ? { ...l, qty } : l) }; return { ...x, lines: [...x.lines, { itemId: id, qty, rate: part?.rate ?? 0 }] } })
  const setRate = (id: string, rate: number) => setF(x => ({ ...x, lines: x.lines.map(l => l.itemId === id ? { ...l, rate } : l) }))
  const catalogue = state.catalogue.filter(p => p.active && (allSuppliers || p.supplier === f.supplier) && (cat === 'All' || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.partNumber.toLowerCase().includes(q.toLowerCase())))
  const value = f.lines.reduce((s, l) => s + l.qty * l.rate, 0)

  if (placing) return (
    <Modal title={`Place ${f.number}`} subtitle={`${f.supplier} · ${money(value)}`} width={520} onClose={() => setPlacing(false)}
      footer={<><Btn onClick={() => setPlacing(false)}>Back</Btn><Btn tone="primary" onClick={() => { onSave(f); onPlace(f.id, ordered, promised); onClose() }}>Place order</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Grid cols={2}><Field label="Ordered on"><input type="date" value={ordered} onChange={e => { setOrdered(e.target.value); setPromised(addDays(e.target.value, quoted)) }} style={{ ...iStyle, colorScheme: 'dark' }} /></Field><Field label="Promised delivery" hint={`${f.supplier} quotes ${quoted} days`}><input type="date" value={promised} onChange={e => setPromised(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} /></Field></Grid>
        <Note tone={C.dim}>Once placed, lines are fixed — receipts are recorded against them.</Note>
      </div>
    </Modal>
  )

  return (
    <Modal title={isNew ? 'New purchase order' : `Edit ${f.number}`} subtitle="Set a quantity against a part to add it to the order" width={980} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn onClick={() => { onSave(f); onClose() }} disabled={f.lines.length === 0}>Save as draft</Btn><Btn tone="primary" disabled={f.lines.length === 0} onClick={() => { setPromised(addDays(ordered, quoted)); setPlacing(true) }}>Place order</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Grid cols={3}>
          <Field label="Order number"><input value={f.number} onChange={e => setF(x => ({ ...x, number: e.target.value }))} style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} /></Field>
          <Field label="Supplier" hint="Changing the supplier clears the lines"><select value={f.supplier} onChange={e => setF(x => ({ ...x, supplier: e.target.value, lines: [] }))} style={{ ...iStyle, cursor: 'pointer' }}>{state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}</select></Field>
          <Field label="Project"><select value={f.project} onChange={e => setF(x => ({ ...x, project: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>{PROJECTS.filter(isLiveProject).map(x => <option key={x} value={x}>{projectCode(x)} — {x}</option>)}</select></Field>
        </Grid>
        <Card title="Parts catalogue" pad={false} subtitle={allSuppliers ? 'All parts' : `Parts supplied by ${f.supplier}`} right={<div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ ...iStyle, width: 160 }} /><select value={cat} onChange={e => setCat(e.target.value as PartCategory | 'All')} style={{ ...iStyle, width: 140, cursor: 'pointer' }}><option value="All">All categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select><label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}><input type="checkbox" checked={allSuppliers} onChange={e => setAllSuppliers(e.target.checked)} /><span style={{ fontSize: 11.5, color: C.muted }}>All suppliers</span></label></div>}>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Category</th><th style={thR}>Life</th><th style={thR}>Cost/m</th><th style={thR}>Rate</th><th style={thR}>Quantity</th><th style={thR}>Line value</th></tr></thead>
              <tbody>
                {catalogue.length === 0 && <tr><td colSpan={8}><Empty>No parts match. Tick &quot;All suppliers&quot; to buy from another supplier.</Empty></td></tr>}
                {catalogue.map(p => { const qty = qtyOf(p.id); const on = qty > 0; return (<tr key={p.id} style={{ borderBottom: rowBorder, background: on ? 'rgba(249,115,22,0.06)' : undefined }}><td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{p.partNumber || '—'}</td><td style={{ ...td, color: C.text, whiteSpace: 'normal', maxWidth: 220 }}>{p.name}</td><td style={td}><Tag tone={C.dim}>{p.category}</Tag></td><td style={{ ...tdN, color: C.faint }}>{p.lifeMetres.toLocaleString('en-IN')} m</td><td style={{ ...tdN, color: C.orange }}>{perMetre(costPerMetre(p))}</td><td style={{ padding: '5px 8px', width: 120 }}><input type="number" min={0} value={rateOf(p.id)} disabled={!on} onChange={e => setRate(p.id, parseFloat(e.target.value) || 0)} style={{ ...numStyle, opacity: on ? 1 : 0.45 }} /></td><td style={{ padding: '5px 8px', width: 100 }}><input type="number" min={0} value={qty} onChange={e => setQty(p.id, Math.max(0, parseFloat(e.target.value) || 0))} style={{ ...numStyle, color: on ? C.orange : C.muted }} /></td><td style={{ ...tdN, color: on ? C.text : C.dim, fontWeight: on ? 700 : 400 }}>{on ? money(qty * rateOf(p.id)) : '—'}</td></tr>) })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Order lines" pad={false}>
          {f.lines.length === 0 ? <Empty>Set a quantity against a part above.</Empty> : (
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part</th><th style={thR}>Qty</th><th style={thR}>Rate</th><th style={thR}>Value</th><th style={th} /></tr></thead>
              <tbody>{f.lines.map(l => (<tr key={l.itemId} style={{ borderBottom: rowBorder }}><td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td><td style={tdN}>{l.qty}</td><td style={tdN}>{money(l.rate)}</td><td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{money(l.qty * l.rate)}</td><td style={{ ...td, textAlign: 'right' }}><Btn size="sm" tone="danger" onClick={() => setQty(l.itemId, 0)}>Remove</Btn></td></tr>))}</tbody>
              <tfoot><tr style={{ borderTop: `2px solid ${C.border}` }}><td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Order value</td><td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{money(value)}</td><td style={td} /></tr></tfoot>
            </table>
          )}
        </Card>
      </div>
    </Modal>
  )
}

function IssueModal({ project, prefill, onSave, onClose }: { project: string; prefill?: StockLine; onSave: (date: string, project: string, rig: string, by: string, picks: { poId: string; itemId: string; qty: number }[]) => void; onClose: () => void }) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const stock = stockInStore(state.pos, TODAY)
  const projects = Array.from(new Set(stock.filter(l => isLiveProject(l.project)).map(l => l.project)))
  const [proj, setProj] = useState(projects.includes(project) ? project : (projects[0] ?? project))
  const [rig, setRig] = useState(RIGS[0]); const [date, setDate] = useState(TODAY); const [by, setBy] = useState('Store')
  const [qty, setQty] = useState<Record<string, number>>(prefill ? { [prefill.key]: prefill.qty } : {})
  const lines = stock.filter(l => l.project === proj)
  const picks = lines.map(l => ({ line: l, qty: Math.min(l.qty, qty[l.key] ?? 0) })).filter(x => x.qty > 0)
  const value = picks.reduce((s, p) => s + p.qty * p.line.rate, 0)
  return (
    <Modal title="Issue parts to a rig" subtitle="Parts move from the regular store to the rig's startup store" width={760} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={picks.length === 0} onClick={() => { onSave(date, proj, rig, by, picks.map(p => ({ poId: p.line.poId, itemId: p.line.itemId, qty: p.qty }))); onClose() }}>Issue {picks.reduce((s, p) => s + p.qty, 0)} parts to {rig}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Grid cols={4}>
          <Field label="Project"><select value={proj} onChange={e => { setProj(e.target.value); setQty({}) }} style={{ ...iStyle, cursor: 'pointer' }}>{projects.map(p => <option key={p} value={p}>{projectCode(p)}</option>)}</select></Field>
          <Field label="Rig"><select value={rig} onChange={e => setRig(e.target.value)} style={{ ...iStyle, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>{RIGS.map(r => <option key={r} value={r}>{r}</option>)}</select></Field>
          <Field label="Issued on"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} /></Field>
          <Field label="Issued by"><input value={by} onChange={e => setBy(e.target.value)} style={iStyle} /></Field>
        </Grid>
        {lines.length === 0 ? <Empty>Nothing on the shelf for {projectCode(proj)}.</Empty> : (
          <table style={tableStyle}>
            <thead><tr><th style={th}>Part</th><th style={th}>From order</th><th style={thR}>On shelf</th><th style={thR}>Issuing</th><th style={thR}>Value</th></tr></thead>
            <tbody>{lines.map(l => { const n = qty[l.key] ?? 0; return (<tr key={l.key} style={{ borderBottom: rowBorder, background: n > 0 ? 'rgba(249,115,22,0.06)' : undefined }}><td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td><td style={td}>{l.poNumber}</td><td style={{ ...tdN, color: C.amber }}>{l.qty}</td><td style={{ padding: '5px 10px', width: 110 }}><input type="number" min={0} max={l.qty} value={n} onChange={e => setQty(s => ({ ...s, [l.key]: Math.min(l.qty, Math.max(0, parseFloat(e.target.value) || 0)) }))} style={{ ...numStyle, color: n > 0 ? C.orange : C.muted }} /></td><td style={{ ...tdN, color: n > 0 ? C.text : C.dim }}>{n > 0 ? money(n * l.rate) : '—'}</td></tr>) })}</tbody>
            <tfoot><tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}><td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={4}>Leaving the shelf</td><td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{money(value)}</td></tr></tfoot>
          </table>
        )}
        <Note tone={C.blue}>Once issued, these parts appear in the startup store for {rig} and the driller can log them.</Note>
      </div>
    </Modal>
  )
}

function MoveModal({ line, onSave, onClose }: { line: StockLine; onSave: (poId: string, t: { date: string; itemId: string; qty: number; toProject: string; note?: string }) => void; onClose: () => void }) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const live = PROJECTS.filter(p => p !== line.project && isLiveProject(p))
  const [to, setTo] = useState(live[0] ?? ''); const [qty, setQty] = useState(line.qty); const [note, setNote] = useState('')
  return (
    <Modal title={`Move ${nameOf(line.itemId)}`} subtitle={`${line.qty} on the shelf against ${projectCode(line.project)}`} width={560} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={!to || qty < 1} onClick={() => { onSave(line.poId, { date: TODAY, itemId: line.itemId, qty, toProject: to, note: note || undefined }); onClose() }}>Move to {to ? projectCode(to) : '—'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Grid cols={2}>
          <Field label="Quantity" hint={`${line.qty} available`}><input type="number" min={1} max={line.qty} value={qty} onChange={e => setQty(Math.min(line.qty, Math.max(1, parseFloat(e.target.value) || 1)))} style={numStyle} /></Field>
          <Field label="Move to"><select value={to} onChange={e => setTo(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>{live.map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}</select></Field>
        </Grid>
        <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        <Note tone={C.dim}>The order keeps its original project. The move is recorded separately so both records stay true.</Note>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * SCREEN
 * ========================================================================== */

const TABS = ['Catalogue', 'Orders', 'Regular store', 'Startup store'] as const
type Tab = typeof TABS[number]

export default function InventoryPage() {
  const { state, savePart, savePO, placeOrder, addReceipt, addIssue, addReorder, receiveReorder, addTransfer } = useInventory()
  const { state: cost } = useCosting()
  const [tab, setTab] = useState<Tab>('Catalogue')
  const [editPart, setEditPart] = useState<Part | null>(null)
  const [importing, setImporting] = useState(false)
  const [editPO, setEditPO] = useState<PurchaseOrder | null>(null)
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null)
  const [raising, setRaising] = useState<PurchaseOrder | null>(null)
  const [replacing, setReplacing] = useState<{ po: PurchaseOrder; reorder: Reorder } | null>(null)
  const [issuing, setIssuing] = useState<{ project: string; line?: StockLine } | null>(null)
  const [moving, setMoving] = useState<StockLine | null>(null)

  const blankPO = (): PurchaseOrder => ({
    id: uid('po'), number: `PO-${TODAY.slice(0, 4)}-${String(state.pos.length + 1).padStart(3, '0')}`,
    supplier: state.suppliers[0]?.name ?? '', project: PROJECTS.find(isLiveProject) ?? PROJECTS[0],
    status: 'draft', createdDate: TODAY, lines: [], receipts: [], reorders: [], issues: [], transfers: [],
  })

  const issueFromStore = (date: string, project: string, rig: string, by: string, picks: { poId: string; itemId: string; qty: number }[]) => {
    const byPO: Record<string, { itemId: string; qty: number }[]> = {}
    picks.forEach(p => { (byPO[p.poId] ??= []).push({ itemId: p.itemId, qty: p.qty }) })
    Object.entries(byPO).forEach(([poId, lines]) => addIssue(poId, { date, project, rig, issuedBy: by, lines }))
  }

  const burnMonth = useMemo(() => {
    const months = cost.shiftLogs.filter(l => l.metresDrilled > 0).map(l => monthOf(l.date)).sort()
    return months[months.length - 1] ?? monthOf(TODAY)
  }, [cost.shiftLogs])

  const burn = useMemo(() => RIGS.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && monthOf(l.date) === burnMonth && l.metresDrilled > 0)
    if (!shifts.length) return null
    const days = new Set(shifts.map(s => s.date)).size
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
    const counts: Record<string, number> = {}
    shifts.forEach(s => { const f = normFormation(s.formationType); counts[f] = (counts[f] ?? 0) + s.metresDrilled })
    const formation = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hard') as typeof FORMATIONS[number]
    return { rig, metresPerDay: Math.round((metres / days) * 10) / 10, formation }
  }).filter(Boolean) as { rig: string; metresPerDay: number; formation: typeof FORMATIONS[number] }[], [cost.shiftLogs, burnMonth])

  const alerts = useMemo(() => buildAlerts(state.pos, state.catalogue, TODAY, COMPLETED_PROJECTS, burn, state.alerts), [state.pos, state.catalogue, state.alerts, burn])
  const urgent = alerts.filter(a => a.level === 'urgent').length

  const [month, setMonth] = useState(burnMonth)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20, paddingBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Parts &amp; inventory</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 700, lineHeight: 1.6 }}>
            Parts catalogue · purchase orders · regular store · startup store per rig.
            Finance charges parts from this catalogue, so the two modules can never disagree.
          </p>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 9, background: urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: urgent ? C.red : C.amber }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: urgent ? C.red : C.amber }}>{alerts.length} need{alerts.length === 1 ? 's' : ''} attention</span>
          </div>
        )}
      </div>

      <AlertsPanel alerts={alerts} />

      <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: tab === t ? C.orange : 'transparent', color: tab === t ? '#fff' : C.muted }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Catalogue' && <CatalogueTab onEdit={setEditPart} onImport={() => setImporting(true)} />}
      {tab === 'Orders' && <OrdersTab onReceive={setReceiving} onCreate={() => setEditPO(blankPO())} onEdit={setEditPO} onRaiseReorder={setRaising} onReceiveReorder={(po, reorder) => setReplacing({ po, reorder })} />}
      {tab === 'Regular store' && <RegularStoreTab onIssue={(project, line) => setIssuing({ project, line })} onMove={setMoving} />}
      {tab === 'Startup store' && <StartupStoreTab />}

      {editPart && <PartModal part={editPart} onSave={savePart} onClose={() => setEditPart(null)} />}
      {importing && <ImportModal onClose={() => setImporting(false)} />}
      {editPO && <POModal po={editPO} onSave={savePO} onPlace={placeOrder} onClose={() => setEditPO(null)} />}
      {receiving && <ReceiveModal po={receiving} onClose={() => setReceiving(null)} onSave={(date, lines, delayReason, note) => addReceipt(receiving.id, { date, lines, delayReason, note })} />}
      {raising && <RaiseReorderModal po={raising} onClose={() => setRaising(null)} onSave={rs => rs.forEach(r => addReorder(raising.id, r))} />}
      {replacing && <ReceiveReorderModal po={replacing.po} reorder={replacing.reorder} onClose={() => setReplacing(null)} onSave={receipt => receiveReorder(replacing.po.id, replacing.reorder.id, receipt)} />}
      {issuing && <IssueModal project={issuing.project} prefill={issuing.line} onSave={issueFromStore} onClose={() => setIssuing(null)} />}
      {moving && <MoveModal line={moving} onSave={addTransfer} onClose={() => setMoving(null)} />}
    </div>
  )
}
