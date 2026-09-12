'use client'

import { useState, useMemo, Fragment, ReactNode } from 'react'
import {
  useInventory, TODAY, FORMATIONS, CATEGORIES, WEAR_BASES, WEAR_BASIS_LABEL, WEAR_BASIS_HINT,
  costPerMetre, costPerDay, toolingPerMetre, toolingPerDay, lifeLabel, costLabel, normFormation,
  poValue, poStatus, poReceivedValue, poStoreValue, poIssuedValue, poOpenReorderValue,
  qtyReceived, qtyInStore, qtyNeverDelivered, qtyFaulty, qtyToReorder,
  poHasSomethingToReorder, poHasSomethingToReceive, rateOfLine,
  openReorders, REORDER_STATUS_LABEL, REORDER_OPEN_STATUSES, DELAY_REASONS,
  stockInStore, onOrder, consumptionValue, buildAlerts, supplierPerformance,
  daysBetween, addDays, projectCode, isLiveProject,
  money, moneyL, perMetre, perDay, dayLabel, fullDate, monthLabel, uid,
  COMPLETED_PROJECTS, RIGS, PROJECTS,
  type Part, type PurchaseOrder, type Formation, type Alert, type AlertLevel, type AlertKind,
  type PartCategory, type WearBasis, type Reorder, type ReorderStatus, type ReorderReceipt,
  type DelayReason, type Supplier, type ReceiptLine, type StockLine,
} from '../../../lib/inventory-store'
import { useCosting, monthOf, shiftMonth } from '../../../lib/costing-store'

/* ==========================================================================
 * XPLORIX PARTS & INVENTORY
 *
 * Four views, following a part through the yard in the order it travels.
 *
 *   Catalogue     what a part is, what it costs, and what wears it out
 *   Orders        placed, promised, received — and reordered when it arrives faulty
 *   Store         what is on the shelf, and who it goes out to
 *   Consumption   what the rigs actually used, and what that came to per metre
 *
 * Two rules the screens hold to:
 *
 *   A part is never issued from an order. It is received into the store, and
 *   issued from the store to a project and a rig.
 *
 *   A faulty part never enters the store. It is reordered, and the replacement
 *   is chased on its own line until something usable turns up.
 * ========================================================================== */

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
const numStyle: React.CSSProperties = {
  ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700,
}
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

const BASIS_TONE: Record<WearBasis, string> = { terrain: C.orange, metres: C.blue, days: C.teal }

/* ==========================================================================
 * PRIMITIVES
 * ========================================================================== */

function Card({ title, subtitle, right, children, pad = true, accent }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; pad?: boolean; accent?: string
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden',
      borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
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

function Stat({ label, value, note, color = C.text, big }: {
  label: string; value: string; note?: string; color?: string; big?: boolean
}) {
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
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 5, color: tone,
      background: `${tone}1A`, border: `1px solid ${tone}33`, whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function Btn({ children, onClick, tone = 'ghost', disabled, size = 'md' }: {
  children: ReactNode; onClick?: () => void; tone?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; size?: 'sm' | 'md'
}) {
  const tones: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`, color: '#fff', border: 'none' },
    ghost: { background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted },
    danger: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: 8, fontWeight: 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1,
      padding: size === 'sm' ? '5px 11px' : '8px 15px', fontSize: size === 'sm' ? 11.5 : 12.5,
      whiteSpace: 'nowrap', ...tones[tone],
    }}>{children}</button>
  )
}

function Note({ tone = C.blue, children }: { tone?: string; children: ReactNode }) {
  return (
    <div style={{ padding: '9px 13px', borderRadius: 9, background: `${tone}0F`, border: `1px solid ${tone}33`, fontSize: 11.5, color: tone, lineHeight: 1.55 }}>
      {children}
    </div>
  )
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

function Modal({ title, subtitle, width = 760, onClose, children, footer }: {
  title: string; subtitle?: string; width?: number; onClose: () => void; children: ReactNode; footer?: ReactNode
}) {
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
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
      background: on ? C.orange : 'rgba(255,255,255,0.03)',
      border: `1px solid ${on ? 'transparent' : C.border}`, color: on ? '#fff' : C.muted,
    }}>{label}</button>
  )
}

const arrowStyle: React.CSSProperties = {
  padding: '5px 9px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
  background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, color: C.muted,
}

/* ==========================================================================
 * ALERTS
 * ========================================================================== */

const LEVEL_TONE: Record<AlertLevel, string> = { urgent: C.red, warn: C.amber, info: C.blue }

const KIND_LABEL: Record<AlertKind, string> = {
  runningOut: 'Running out',
  overdue: 'Late delivery',
  replacement: 'Replacement owed',
  idle: 'Idle stock',
  stranded: 'Stranded',
  lowStock: 'Low stock',
}
const KIND_ORDER: AlertKind[] = ['runningOut', 'overdue', 'replacement', 'idle', 'stranded', 'lowStock']
const KIND_TONE: Record<AlertKind, string> = {
  runningOut: C.red, overdue: C.red, replacement: C.amber, idle: C.amber, stranded: C.amber, lowStock: C.blue,
}

/* Eighteen alerts is a wall. They also split into different jobs — money
 * standing still, a supplier to chase, something about to run out — which
 * belong to different people, so the panel filters by kind with the count and
 * the value at stake on each chip. */
function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [kind, setKind] = useState<AlertKind | 'all'>('all')

  if (alerts.length === 0) {
    return <Card><Empty>Nothing needs attention. No stock sitting idle, no late deliveries, nothing about to run out.</Empty></Card>
  }

  const kinds = KIND_ORDER.map(k => {
    const mine = alerts.filter(a => a.kind === k)
    return { kind: k, count: mine.length, value: mine.reduce((s, a) => s + (a.value ?? 0), 0) }
  }).filter(x => x.count > 0)

  // A filter that empties itself is a dead end, so an emptied kind falls back.
  const active = kind !== 'all' && !kinds.some(k => k.kind === kind) ? 'all' : kind
  const shown = active === 'all' ? alerts : alerts.filter(a => a.kind === active)
  const urgent = alerts.filter(a => a.level === 'urgent').length
  const shownValue = shown.reduce((s, a) => s + (a.value ?? 0), 0)

  const chip = (label: string, count: number, value: number, on: boolean, tone: string, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{
      display: 'flex', alignItems: 'baseline', gap: 7, padding: '5px 11px', borderRadius: 7,
      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
      background: on ? `${tone}22` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${on ? `${tone}66` : C.border}`,
      color: on ? tone : C.faint,
    }}>
      <span style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>{count}</span>
      {value > 0 && <span style={{ fontSize: 10, opacity: 0.7, fontFamily: 'ui-monospace, monospace' }}>{moneyL(value)}</span>}
    </button>
  )

  return (
    <Card title="Needs attention"
      subtitle={`${alerts.length} item${alerts.length === 1 ? '' : 's'}${urgent ? ` · ${urgent} urgent` : ''}`}
      pad={false} accent={urgent ? C.red : C.amber}>
      <div style={{ display: 'flex', gap: 6, padding: '11px 16px', borderBottom: rowBorder, flexWrap: 'wrap' }}>
        {chip('All', alerts.length, alerts.reduce((s, a) => s + (a.value ?? 0), 0), active === 'all', C.orange, () => setKind('all'))}
        <span style={{ width: 1, background: C.border, margin: '2px 4px' }} />
        {kinds.map(k => chip(KIND_LABEL[k.kind], k.count, k.value, active === k.kind, KIND_TONE[k.kind],
          () => setKind(active === k.kind ? 'all' : k.kind)))}
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
            {a.value != null && (
              <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_TONE[a.level], fontFamily: 'ui-monospace, monospace' }}>{money(a.value)}</span>
            )}
          </div>
        ))}
      </div>

      {shown.length > 1 && (
        <div style={{ padding: '9px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontSize: 11, color: C.faint }}>
            {shown.length} shown{active !== 'all' ? ` of ${alerts.length}` : ''}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.text, fontFamily: 'ui-monospace, monospace' }}>{money(shownValue)}</span>
        </div>
      )}
    </Card>
  )
}

/* ==========================================================================
 * PARTS CATALOGUE
 * ========================================================================== */

function CatalogueTab({ onEdit, onImport }: { onEdit: (p: Part) => void; onImport: () => void }) {
  const { state, deletePart } = useInventory()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<PartCategory | 'All'>('All')
  const [sup, setSup] = useState('All')
  const [basis, setBasis] = useState<WearBasis | 'All'>('All')
  const [showRetired, setShowRetired] = useState(false)
  const [open, setOpen] = useState<string | null>(null)

  const parts = state.catalogue.filter(p =>
    (showRetired || p.active) &&
    (cat === 'All' || p.category === cat) &&
    (sup === 'All' || p.supplier === sup) &&
    (basis === 'All' || p.wearBasis === basis) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.partNumber.toLowerCase().includes(q.toLowerCase())))

  // The rate a metre carries is the whole catalogue, never the filtered view —
  // a filter is a way of looking, not a way of costing.
  const all = state.catalogue
  const filtered = q || cat !== 'All' || sup !== 'All' || basis !== 'All'

  const blank = (): Part => ({
    id: uid('t'), partNumber: '', name: '', category: 'Bit', rate: 0, wearBasis: 'terrain',
    life: { Soft: 0, Medium: 0, Hard: 0, 'Very Hard': 0 }, lifeMetres: 0, lifeDays: 0,
    supplier: state.suppliers[0]?.name ?? '', leadTimeDays: 14, minStock: 1, active: true,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        Every part says what wears it out. Bits and core lifters wear with metres and go faster in harder ground, so they
        carry a life per formation. Rods, barrels and casing wear with metres whatever the rock, so they carry one figure.
        The water swivel wears with time on the rig, so its life is in drilling days and it is charged per day.
      </Note>

      <Grid cols={5}>
        {FORMATIONS.map((f, k) => (
          <Stat key={f} label={`${f} ground`} value={perMetre(toolingPerMetre(all, f))}
            note="parts, per metre drilled" color={k === 3 ? C.red : k === 2 ? C.amber : C.text} />
        ))}
        <Stat label="Every drilling day" value={perDay(toolingPerDay(all))} note="parts charged by time" color={C.teal} />
      </Grid>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ width: 220 }}>
          <Field label="Search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Part number or name" style={iStyle} /></Field>
        </div>
        <div style={{ width: 155 }}>
          <Field label="Category">
            <select value={cat} onChange={e => setCat(e.target.value as PartCategory | 'All')} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ width: 180 }}>
          <Field label="Supplier">
            <select value={sup} onChange={e => setSup(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All suppliers</option>
              {state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ width: 160 }}>
          <Field label="Wears by">
            <select value={basis} onChange={e => setBasis(e.target.value as WearBasis | 'All')} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">Any</option>
              {WEAR_BASES.map(b => <option key={b} value={b}>{WEAR_BASIS_LABEL[b]}</option>)}
            </select>
          </Field>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', paddingBottom: 7 }}>
          <input type="checkbox" checked={showRetired} onChange={e => setShowRetired(e.target.checked)} />
          <span style={{ fontSize: 12, color: C.muted }}>Show retired</span>
        </label>
        <div style={{ flex: 1 }} />
        {filtered && <Btn size="sm" onClick={() => { setQ(''); setCat('All'); setSup('All'); setBasis('All') }}>Clear filters</Btn>}
        <Btn size="sm" onClick={onImport}>Import CSV</Btn>
        <Btn size="sm" tone="primary" onClick={() => onEdit(blank())}>Add part</Btn>
      </div>

      <Card title="Parts catalogue" pad={false}
        subtitle={`${parts.length} of ${state.catalogue.length} parts · click a row for the life and cost behind the figure`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Serial number</th>
                <th style={th}>Category</th><th style={thR}>Rate</th>
                <th style={th}>Wears by</th><th style={thR}>Life</th><th style={thR}>Cost</th>
                <th style={th}>Supplier</th><th style={thR}>Lead time</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 && (
                <tr><td colSpan={11}><Empty>
                  {state.catalogue.length === 0
                    ? <>No parts yet. Add one, or import your existing parts sheet as CSV.</>
                    : <>Nothing matches those filters.</>}
                </Empty></td></tr>
              )}
              {parts.map(p => {
                const isOpen = open === p.id
                return (
                  <Fragment key={p.id}>
                    <tr onClick={() => setOpen(isOpen ? null : p.id)} style={{
                      borderBottom: rowBorder, cursor: 'pointer', opacity: p.active ? 1 : 0.45,
                      background: isOpen ? 'rgba(249,115,22,0.05)' : undefined,
                    }}>
                      <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{p.partNumber || '—'}</td>
                      <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 230 }}>
                        {p.name}{!p.active && <span style={{ marginLeft: 7 }}><Tag tone={C.dim}>retired</Tag></span>}
                      </td>
                      <td style={{ ...tdMono, color: p.serialNumber ? C.muted : C.dim }}>{p.serialNumber || '—'}</td>
                      <td style={td}><Tag tone={C.dim}>{p.category}</Tag></td>
                      <td style={tdN}>{money(p.rate)}</td>
                      <td style={td}><Tag tone={BASIS_TONE[p.wearBasis]}>{WEAR_BASIS_LABEL[p.wearBasis]}</Tag></td>
                      <td style={{ ...tdN, color: C.faint }}>{lifeLabel(p)}</td>
                      <td style={{ ...tdN, color: BASIS_TONE[p.wearBasis], fontWeight: 700 }}>{costLabel(p)}</td>
                      <td style={td}>{p.supplier}</td>
                      <td style={tdN}>{p.leadTimeDays}d</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <Btn size="sm" onClick={() => onEdit(p)}>Edit</Btn>
                          <Btn size="sm" tone="danger" onClick={() => deletePart(p.id)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 320 }}>
                              <SubHead tone={BASIS_TONE[p.wearBasis]}>How this part is charged</SubHead>
                              {p.wearBasis === 'days' ? (
                                <pre style={preStyle}>
{`rate         ${money(p.rate)}
life         ${p.lifeDays} drilling days
             ${'─'.repeat(22)}
per day      ${perDay(costPerDay(p))}`}
                                </pre>
                              ) : p.wearBasis === 'metres' ? (
                                <pre style={preStyle}>
{`rate         ${money(p.rate)}
life         ${p.lifeMetres.toLocaleString('en-IN')} m, any ground
             ${'─'.repeat(22)}
per metre    ${perMetre(costPerMetre(p, 'Hard'))}`}
                                </pre>
                              ) : (
                                <table style={tableStyle}>
                                  <thead><tr><th style={th}>Ground</th><th style={thR}>Life</th><th style={thR}>Per metre</th></tr></thead>
                                  <tbody>
                                    {FORMATIONS.map(f => (
                                      <tr key={f} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, color: C.text }}>{f}</td>
                                        <td style={tdN}>{p.life[f].toLocaleString('en-IN')} m</td>
                                        <td style={{ ...tdN, color: f === 'Very Hard' ? C.red : f === 'Hard' ? C.amber : C.muted, fontWeight: 700 }}>
                                          {perMetre(costPerMetre(p, f))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                            <div style={{ minWidth: 240 }}>
                              <SubHead tone={C.blue}>Ordering</SubHead>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                <KV k="Supplier" v={p.supplier} />
                                <KV k="Lead time" v={`${p.leadTimeDays} days`} />
                                <KV k="Minimum stock" v={`${p.minStock}`} />
                                <KV k="Reorder point" v={`${p.minStock} in store`} />
                              </div>
                              <div style={{ marginTop: 12, fontSize: 11, color: C.faint, lineHeight: 1.6, maxWidth: 300 }}>
                                {WEAR_BASIS_HINT[p.wearBasis]}
                              </div>
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
    </div>
  )
}

const preStyle: React.CSSProperties = {
  margin: 0, padding: '14px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
  fontSize: 12, lineHeight: 1.7, color: C.text, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap',
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
      <span style={{ fontSize: 11, color: C.faint }}>{k}</span>
      <span style={{ fontSize: 12, color: C.text, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{v}</span>
    </div>
  )
}

/* ── Part editor ──────────────────────────────────────────────────────── */

function PartModal({ part, onSave, onClose }: { part: Part; onSave: (p: Part) => void; onClose: () => void }) {
  const { state } = useInventory()
  const [f, setF] = useState<Part>(part)
  const u = (p: Partial<Part>) => setF(x => ({ ...x, ...p }))
  const canSave = f.name.trim().length > 0

  return (
    <Modal title={f.name || 'New part'} subtitle="Life drives what a metre costs, so it is the figure worth getting right"
      width={760} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!canSave} onClick={() => { onSave(f); onClose() }}>Save part</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Grid cols={3}>
          <Field label="Part number" hint="Your own code for it">
            <input value={f.partNumber} onChange={e => u({ partNumber: e.target.value })}
              placeholder="HQ-BIT-IMP" style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} />
          </Field>
          <Field label="Item">
            <input value={f.name} onChange={e => u({ name: e.target.value })} style={iStyle} />
          </Field>
          <Field label="Serial number" hint="Optional — only for parts tracked individually">
            <input value={f.serialNumber ?? ''} onChange={e => u({ serialNumber: e.target.value || undefined })}
              style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} />
          </Field>
        </Grid>

        <Grid cols={4}>
          <Field label="Category">
            <select value={f.category} onChange={e => u({ category: e.target.value as PartCategory })} style={{ ...iStyle, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Rate">
            <input type="number" value={f.rate} onChange={e => u({ rate: parseFloat(e.target.value) || 0 })}
              style={{ ...numStyle, color: C.orange }} />
          </Field>
          <Field label="Supplier">
            <select value={f.supplier} onChange={e => u({ supplier: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
              {state.suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Lead time" hint="days">
            <input type="number" value={f.leadTimeDays} onChange={e => u({ leadTimeDays: parseFloat(e.target.value) || 0 })} style={numStyle} />
          </Field>
        </Grid>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>What wears this part out</div>
          <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 4 }}>
            {WEAR_BASES.map(b => (
              <button key={b} onClick={() => u({ wearBasis: b })} style={{
                flex: 1, padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: 'none', fontFamily: 'inherit',
                background: f.wearBasis === b ? BASIS_TONE[b] : 'transparent',
                color: f.wearBasis === b ? '#fff' : C.faint,
              }}>{WEAR_BASIS_LABEL[b]}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.faint, margin: '9px 0 13px', lineHeight: 1.55 }}>
            {WEAR_BASIS_HINT[f.wearBasis]}
          </div>

          {f.wearBasis === 'terrain' && (
            <Grid cols={4}>
              {FORMATIONS.map(fo => (
                <Field key={fo} label={fo} hint="metres">
                  <input type="number" value={f.life[fo]}
                    onChange={e => u({ life: { ...f.life, [fo]: parseFloat(e.target.value) || 0 } })} style={numStyle} />
                  <div style={{ fontSize: 11, color: C.orange, marginTop: 5, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                    {perMetre(costPerMetre(f, fo))}
                  </div>
                </Field>
              ))}
            </Grid>
          )}

          {f.wearBasis === 'metres' && (
            <Grid cols={4}>
              <Field label="Life" hint="metres, any ground">
                <input type="number" value={f.lifeMetres} onChange={e => u({ lifeMetres: parseFloat(e.target.value) || 0 })} style={numStyle} />
                <div style={{ fontSize: 11, color: C.blue, marginTop: 5, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                  {perMetre(costPerMetre(f, 'Hard'))}
                </div>
              </Field>
            </Grid>
          )}

          {f.wearBasis === 'days' && (
            <Grid cols={4}>
              <Field label="Life" hint="days the rig drills">
                <input type="number" value={f.lifeDays} onChange={e => u({ lifeDays: parseFloat(e.target.value) || 0 })} style={numStyle} />
                <div style={{ fontSize: 11, color: C.teal, marginTop: 5, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                  {perDay(costPerDay(f))}
                </div>
              </Field>
            </Grid>
          )}
        </div>

        <Grid cols={4}>
          <Field label="Minimum stock" hint="below this, reordering is already late">
            <input type="number" value={f.minStock} onChange={e => u({ minStock: parseFloat(e.target.value) || 0 })} style={numStyle} />
          </Field>
        </Grid>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.active} onChange={e => u({ active: e.target.checked })} />
          <span style={{ fontSize: 12.5, color: C.text }}>In use</span>
          <span style={{ fontSize: 11, color: C.faint }}>— retired parts are kept for history but drop out of what a metre costs</span>
        </label>
      </div>
    </Modal>
  )
}

/* ── CSV import ───────────────────────────────────────────────────────── */

/* Most contractors already keep parts in a spreadsheet — theirs is where this
 * catalogue came from — so reading that beats typing seventeen forms. */
function ImportModal({ onClose }: { onClose: () => void }) {
  const { state, importParts } = useInventory()
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  const TEMPLATE =
    'part_number,name,serial_number,category,rate,supplier,lead_days,min_stock,basis,life_soft,life_medium,life_hard,life_very_hard,life_metres,life_days\n'
    + 'HQ-BIT-IMP,HQ Impregnated Bit,,Bit,22000,Sandvik Mining,18,3,terrain,220,150,100,60,,\n'
    + 'HQ-ROD-30,HQ Wire Line Drill Rod 3.0 m,,Rod & Casing,7840,Boart Longyear India,21,6,metres,,,,,5000,\n'
    + 'WS-NQNW-01,Water Swivel NQ/NW Connection,SW-1182,Accessory,24990,Drillco Tools,14,1,days,,,,,,417\n'

  const parsed = useMemo<Part[]>(() => {
    if (!text.trim()) return []
    const rows = text.trim().split(/\r?\n/)
    const head = splitCsv(rows[0]).map(h => h.trim().toLowerCase())
    const idx = (n: string) => head.indexOf(n)
    const out: Part[] = []

    rows.slice(1).forEach(line => {
      const c = splitCsv(line)
      const at = (n: string) => { const k = idx(n); return k < 0 ? '' : (c[k] ?? '').trim() }
      const has = (n: string) => at(n) !== ''
      const num = (n: string, d = 0) => has(n) ? (parseFloat(at(n)) || d) : d

      const name = has('name') ? at('name') : c[0]?.trim()
      if (!name) return

      const sheetLife = num('life_hard') || num('life_metres') || num('life')
      const typed = at('basis').toLowerCase().replace(/[\s_+-]/g, '')
      const wearBasis: WearBasis =
        typed.startsWith('terrain') ? 'terrain'
          : typed === 'metres' || typed === 'meters' ? 'metres'
          : typed === 'days' ? 'days'
          // No basis column: a day figure on its own means days, four life
          // columns mean terrain, anything else is one life in metres.
          : has('life_days') && !sheetLife ? 'days'
          : ['life_soft', 'life_medium', 'life_very_hard'].some(has) ? 'terrain'
          : 'metres'

      const category = (CATEGORIES as string[]).includes(at('category')) ? at('category') as PartCategory : 'Accessory'

      out.push({
        id: uid('t'),
        partNumber: at('part_number'),
        name,
        serialNumber: at('serial_number') || undefined,
        category,
        rate: num('rate'),
        wearBasis,
        life: {
          Soft: has('life_soft') ? num('life_soft') : Math.round(sheetLife * 2.2),
          Medium: has('life_medium') ? num('life_medium') : Math.round(sheetLife * 1.5),
          Hard: sheetLife,
          'Very Hard': has('life_very_hard') ? num('life_very_hard') : Math.round(sheetLife * 0.6),
        },
        lifeMetres: num('life_metres') || sheetLife,
        lifeDays: num('life_days') || Math.round(sheetLife / 12),
        supplier: has('supplier') ? at('supplier') : (state.suppliers[0]?.name ?? ''),
        leadTimeDays: num('lead_days', 14),
        minStock: num('min_stock', 1),
        active: true,
      })
    })
    return out
  }, [text, state.suppliers])

  const existing = (p: Part) => state.catalogue.some(x =>
    (p.partNumber && x.partNumber.toLowerCase() === p.partNumber.toLowerCase()) ||
    x.name.toLowerCase() === p.name.toLowerCase())
  const updates = parsed.filter(existing).length

  return (
    <Modal title="Import parts" subtitle="Paste a CSV, or open your sheet and copy the rows in" width={900} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={parsed.length === 0} onClick={() => { importParts(parsed); onClose() }}>
          Import {parsed.length} part{parsed.length === 1 ? '' : 's'}
        </Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Note tone={C.dim}>
          Columns: <span style={{ fontFamily: 'ui-monospace, monospace' }}>part_number, name, serial_number, category, rate,
            supplier, lead_days, min_stock, basis, life_soft, life_medium, life_hard, life_very_hard, life_metres, life_days</span>.
          Set <span style={{ fontFamily: 'ui-monospace, monospace' }}>basis</span> to terrain, metres or days. A sheet with a
          single <span style={{ fontFamily: 'ui-monospace, monospace' }}>life</span> column still imports, and you can correct
          the basis afterwards. Parts are matched on part number, then name, so re-importing a corrected sheet updates
          rather than duplicates.
        </Note>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn size="sm" onClick={() => {
            const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }))
            const a = document.createElement('a')
            a.href = url; a.download = 'xplorix-parts-template.csv'; a.click()
            setTimeout(() => URL.revokeObjectURL(url), 2000)
          }}>Download template</Btn>
          <label style={{ cursor: 'pointer' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 8, fontSize: 11.5,
              fontWeight: 700, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted,
            }}>Upload a file</span>
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]; if (!file) return
                const fr = new FileReader()
                fr.onload = () => { setText(String(fr.result)); setErr('') }
                fr.onerror = () => setErr('That file could not be read. Save it as CSV and try again.')
                fr.readAsText(file)
              }} />
          </label>
        </div>

        <Field label="CSV">
          <textarea value={text} onChange={e => { setText(e.target.value); setErr('') }} rows={8} placeholder={TEMPLATE}
            style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, lineHeight: 1.6, resize: 'vertical' }} />
        </Field>
        {err && <Note tone={C.red}>{err}</Note>}

        {parsed.length > 0 && (
          <Card title="Preview" pad={false} subtitle={`${parsed.length - updates} new · ${updates} will update parts already in the catalogue`}>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={tableStyle}>
                <thead><tr>
                  <th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Category</th>
                  <th style={thR}>Rate</th><th style={th}>Wears by</th><th style={thR}>Life</th><th style={thR}>Cost</th><th style={th} />
                </tr></thead>
                <tbody>
                  {parsed.map((p, k) => (
                    <tr key={k} style={{ borderBottom: rowBorder }}>
                      <td style={tdMono}>{p.partNumber || '—'}</td>
                      <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{p.name}</td>
                      <td style={td}>{p.category}</td>
                      <td style={tdN}>{money(p.rate)}</td>
                      <td style={td}><Tag tone={BASIS_TONE[p.wearBasis]}>{WEAR_BASIS_LABEL[p.wearBasis]}</Tag></td>
                      <td style={{ ...tdN, color: C.faint }}>{lifeLabel(p)}</td>
                      <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{costLabel(p)}</td>
                      <td style={td}><Tag tone={existing(p) ? C.amber : C.green}>{existing(p) ? 'update' : 'new'}</Tag></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  )
}

/* Quoted fields are common in exported sheets, so a naive split on commas
 * mangles any part name containing one. */
function splitCsv(line: string): string[] {
  const out: string[] = []
  let cur = '', quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++ }
      else quoted = !quoted
    } else if (ch === ',' && !quoted) { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out.map(x => x.trim())
}

/* ==========================================================================
 * ORDERS
 * ========================================================================== */

const PO_TONE: Record<string, string> = { draft: C.faint, ordered: C.blue, partial: C.amber, received: C.green }

function OrdersTab({ onReceive, onCreate, onEdit, onRaiseReorder, onReceiveReorder }: {
  onReceive: (po: PurchaseOrder) => void
  onCreate: () => void
  onEdit: (po: PurchaseOrder) => void
  onRaiseReorder: (po: PurchaseOrder) => void
  onReceiveReorder: (po: PurchaseOrder, r: Reorder) => void
}) {
  const { state } = useInventory()
  const [open, setOpen] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'ordered' | 'partial' | 'received'>('all')
  const [sup, setSup] = useState('All')
  const [proj, setProj] = useState('All')
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id

  const pos = state.pos.filter(p =>
    (status === 'all' || poStatus(p) === status) &&
    (sup === 'All' || p.supplier === sup) &&
    (proj === 'All' || p.project === proj) &&
    (!q || p.number.toLowerCase().includes(q.toLowerCase()) || p.supplier.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.orderedDate ?? b.createdDate).localeCompare(a.orderedDate ?? a.createdDate))

  const t = state.pos.reduce((a, p) => ({
    ordered: a.ordered + (p.status === 'draft' ? 0 : poValue(p)),
    received: a.received + poReceivedValue(p),
    store: a.store + poStoreValue(p),
    issued: a.issued + poIssuedValue(p),
    owed: a.owed + poOpenReorderValue(p),
  }), { ordered: 0, received: 0, store: 0, issued: 0, owed: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={5}>
        <Stat label="On order" value={moneyL(t.ordered - t.received)} note="placed, not yet delivered" color={C.blue} />
        <Stat label="Received" value={moneyL(t.received)} note="accepted into the store" />
        <Stat label="In store" value={moneyL(t.store)} note="on the shelf, not yet on a rig" color={C.amber} />
        <Stat label="Issued to rigs" value={moneyL(t.issued)} note="gone out of the store" color={C.green} />
        <Stat label="Owed on reorders" value={moneyL(t.owed)} note="sent back, replacement pending" color={t.owed > 0 ? C.red : C.dim} />
      </Grid>

      <Note tone={C.dim}>
        An order ends when the parts are accepted. They go on the shelf and are issued from the Store, so the only place
        that says what is on site is the place that actually holds it. Anything faulty never reaches the shelf — reorder
        it and the replacement is chased on its own line below.
      </Note>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ width: 210 }}>
          <Field label="Search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Order number or supplier" style={iStyle} /></Field>
        </div>
        <div style={{ width: 150 }}>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as typeof status)} style={{ ...iStyle, cursor: 'pointer', textTransform: 'capitalize' }}>
              {(['all', 'draft', 'ordered', 'partial', 'received'] as const).map(k => <option key={k} value={k}>{k}</option>)}
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
        <div style={{ width: 175 }}>
          <Field label="Project">
            <select value={proj} onChange={e => setProj(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All projects</option>
              {PROJECTS.map(x => <option key={x} value={x}>{projectCode(x)}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }} />
        {(q || status !== 'all' || sup !== 'All' || proj !== 'All') && (
          <Btn size="sm" onClick={() => { setQ(''); setStatus('all'); setSup('All'); setProj('All') }}>Clear filters</Btn>
        )}
        <Btn size="sm" tone="primary" onClick={onCreate}>New order</Btn>
      </div>

      <Card title="Purchase orders" pad={false}
        subtitle={`${pos.length} of ${state.pos.length} · promised against actual delivery is what makes supplier lead time measurable`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Project</th><th style={th}>Status</th>
                <th style={th}>Ordered</th><th style={th}>Promised</th><th style={th}>Delivered</th><th style={thR}>Delay</th>
                <th style={thR}>Value</th><th style={thR}>In store</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {pos.length === 0 && <tr><td colSpan={11}><Empty>Nothing matches those filters.</Empty></td></tr>}
              {pos.map(po => {
                const st = poStatus(po)
                const isOpen = open === po.id
                const lastReceipt = po.receipts.map(r => r.date).sort().pop()
                const delay = lastReceipt && po.promisedDate ? daysBetween(po.promisedDate, lastReceipt) : null
                const late = st !== 'received' && !!po.promisedDate && po.promisedDate < TODAY
                const owed = openReorders(po)
                const toReorder = poHasSomethingToReorder(po)
                return (
                  <Fragment key={po.id}>
                    <tr onClick={() => setOpen(isOpen ? null : po.id)} style={{
                      borderBottom: rowBorder, cursor: 'pointer',
                      background: isOpen ? 'rgba(249,115,22,0.05)' : late ? 'rgba(239,68,68,0.05)' : undefined,
                    }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>
                        {po.number}
                        {owed.length > 0 && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>{owed.length} on reorder</Tag></span>}
                      </td>
                      <td style={td}>{po.supplier}</td>
                      <td style={tdMono}>{projectCode(po.project)}</td>
                      <td style={td}><Tag tone={PO_TONE[st]}>{st}</Tag></td>
                      <td style={td}>{po.orderedDate ? dayLabel(po.orderedDate) : '—'}</td>
                      <td style={{ ...td, color: late ? C.red : C.muted }}>{po.promisedDate ? dayLabel(po.promisedDate) : '—'}</td>
                      <td style={td}>{lastReceipt ? dayLabel(lastReceipt) : late ? 'overdue' : '—'}</td>
                      <td style={{ ...tdN, color: delay == null ? C.dim : delay > 0 ? C.red : C.green, fontWeight: 700 }}>
                        {delay == null ? '—' : delay > 0 ? `+${delay}d` : `${delay}d`}
                      </td>
                      <td style={tdN}>{money(poValue(po))}</td>
                      <td style={{ ...tdN, color: poStoreValue(po) > 0 ? C.amber : C.dim }}>
                        {poStoreValue(po) > 0 ? money(poStoreValue(po)) : '—'}
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          {st === 'draft' && <Btn size="sm" tone="primary" onClick={() => onEdit(po)}>Open draft</Btn>}
                          {poHasSomethingToReceive(po) && <Btn size="sm" tone="primary" onClick={() => onReceive(po)}>Receive</Btn>}
                          {toReorder && <Btn size="sm" tone="danger" onClick={() => onRaiseReorder(po)}>Reorder</Btn>}
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>
                            <div>
                              <SubHead tone={C.orange}>Lines</SubHead>
                              <table style={tableStyle}>
                                <thead><tr>
                                  <th style={th}>Part</th><th style={thR}>Ordered</th><th style={thR}>Accepted</th>
                                  <th style={thR}>Faulty</th><th style={thR}>Awaiting</th><th style={thR}>In store</th><th style={thR}>Value</th>
                                </tr></thead>
                                <tbody>
                                  {po.lines.map(l => {
                                    const faulty = qtyFaulty(po, l.itemId)
                                    const awaiting = qtyNeverDelivered(po, l.itemId)
                                    return (
                                      <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                                        <td style={tdN}>{l.qty}</td>
                                        <td style={{ ...tdN, color: C.green }}>{qtyReceived(po, l.itemId)}</td>
                                        <td style={{ ...tdN, color: faulty > 0 ? C.red : C.dim }}>{faulty || '—'}</td>
                                        <td style={{ ...tdN, color: awaiting > 0 ? C.blue : C.dim }}>{awaiting || '—'}</td>
                                        <td style={{ ...tdN, color: qtyInStore(po, l.itemId) > 0 ? C.amber : C.dim }}>{qtyInStore(po, l.itemId)}</td>
                                        <td style={tdN}>{money(l.qty * l.rate)}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                              {po.note && <div style={{ marginTop: 12, fontSize: 11.5, color: C.faint }}>{po.note}</div>}
                            </div>

                            <div>
                              <SubHead tone={C.blue}>History</SubHead>
                              {po.receipts.length === 0 && po.reorders.length === 0 && po.issues.length === 0 ? (
                                <Empty>Placed, nothing delivered yet.</Empty>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  {po.receipts.map(r => (
                                    <Line key={r.id} tone={C.blue} tag="received" date={r.date}>
                                      {r.lines.map(l => `${l.accepted} × ${nameOf(l.itemId)}`
                                        + (l.damaged ? `, ${l.damaged} damaged` : '')
                                        + (l.rejected ? `, ${l.rejected} wrong or short` : '')).join(' · ')}
                                      {r.delayReason && <span style={{ color: C.red }}> · {r.delayReason}</span>}
                                    </Line>
                                  ))}
                                  {po.reorders.map(r => (
                                    <Line key={r.id} tone={r.receipt ? C.amber : C.red}
                                      tag={`reorder r${r.round}`} date={r.raisedDate}>
                                      {r.qty} × {nameOf(r.itemId)} · {r.reason}
                                      {r.promisedDate && !r.receipt && <span style={{ color: C.faint }}> · due {dayLabel(r.promisedDate)}</span>}
                                      {r.receipt && <span style={{ color: r.receipt.accepted > 0 ? C.green : C.red }}>
                                        {' '}· {fullDate(r.receipt.date)}: {r.receipt.accepted} accepted
                                        {r.receipt.damaged + r.receipt.rejected > 0 ? `, ${r.receipt.damaged + r.receipt.rejected} faulty again` : ''}
                                      </span>}
                                    </Line>
                                  ))}
                                  {po.issues.map(i => (
                                    <Line key={i.id} tone={C.green} tag="issued" date={i.date}>
                                      {i.lines.map(l => `${l.qty} × ${nameOf(l.itemId)}`).join(', ')}
                                      {' → '}<span style={{ fontFamily: 'ui-monospace, monospace' }}>{i.rig}</span>
                                      {' · '}{projectCode(i.project)}
                                    </Line>
                                  ))}
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

function Line({ tone, tag, date, children }: { tone: string; tag: string; date: string; children: ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
      <Tag tone={tone}>{tag}</Tag>{' '}
      <span style={{ color: C.text }}>{fullDate(date)}</span>{' — '}{children}
    </div>
  )
}

/* ==========================================================================
 * REORDERS
 *
 * A faulty part gets its own line here and stays until something usable turns
 * up. Receiving a replacement closes the line; if that one is faulty too, the
 * next round opens automatically against the same order, so a supplier who
 * fails three times leaves three rows behind rather than one vague note.
 * ========================================================================== */

const REORDER_TONE: Record<ReorderStatus, string> = {
  raised: C.red, sent: C.amber, promised: C.amber, closed: C.green, credited: C.blue,
}

function ReordersTable({ onReceiveReorder }: { onReceiveReorder: (po: PurchaseOrder, r: Reorder) => void }) {
  const { state, updateReorder } = useInventory()
  const [showClosed, setShowClosed] = useState(true)
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id

  const rows = state.pos
    .flatMap(po => po.reorders.map(r => ({ po, r })))
    .filter(({ r }) => showClosed || (!r.receipt && r.status !== 'credited'))
    .sort((a, b) => b.r.raisedDate.localeCompare(a.r.raisedDate))

  const open = state.pos.flatMap(po => openReorders(po).map(r => ({ po, r })))
  const owed = open.reduce((s, { po, r }) => s + r.qty * rateOfLine(po, r.itemId), 0)
  const repeats = state.pos.flatMap(po => po.reorders).filter(r => r.round > 1).length

  return (
    <Card title="Reorders" pad={false}
      subtitle={`${open.length} open · ${money(owed)} owed by suppliers${repeats ? ` · ${repeats} replacement${repeats === 1 ? '' : 's'} failed and went round again` : ''}`}
      accent={open.length ? C.red : undefined}
      right={
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
          <input type="checkbox" checked={showClosed} onChange={e => setShowClosed(e.target.checked)} />
          <span style={{ fontSize: 11.5, color: C.muted }}>Show settled</span>
        </label>
      }>
      {rows.length === 0 ? (
        <Empty>
          No reorders. Nothing has come in faulty.<br />
          When something does, receive it as damaged and raise the reorder from the order row.
        </Empty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Raised</th><th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Part</th>
                <th style={thR}>Qty</th><th style={thR}>Round</th><th style={th}>Reason</th>
                <th style={th}>Due</th><th style={th}>Status</th><th style={th}>Outcome</th>
                <th style={thR}>Value</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ po, r }) => {
                const isOpen = !r.receipt && r.status !== 'credited'
                const overdue = isOpen && !!r.promisedDate && r.promisedDate < TODAY
                const failedAgain = r.receipt && (r.receipt.damaged + r.receipt.rejected) > 0
                return (
                  <tr key={r.id} style={{
                    borderBottom: rowBorder,
                    background: overdue ? 'rgba(239,68,68,0.06)' : failedAgain ? 'rgba(245,158,11,0.05)' : undefined,
                    opacity: isOpen ? 1 : 0.75,
                  }}>
                    <td style={{ ...td, color: C.text }}>{dayLabel(r.raisedDate)}</td>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>{po.number}</td>
                    <td style={td}>{po.supplier}</td>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal', maxWidth: 200 }}>{nameOf(r.itemId)}</td>
                    <td style={tdN}>{r.qty}</td>
                    <td style={{ ...tdN, color: r.round > 1 ? C.red : C.faint, fontWeight: r.round > 1 ? 800 : 400 }}>{r.round}</td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 220, color: C.faint }}>{r.reason}</td>
                    <td style={{ ...td, color: overdue ? C.red : C.muted }}>
                      {r.promisedDate ? dayLabel(r.promisedDate) : isOpen ? 'no date' : '—'}
                    </td>
                    <td style={td}>
                      {isOpen ? (
                        <select value={r.status} onChange={e => updateReorder(po.id, { ...r, status: e.target.value as ReorderStatus })}
                          style={{ ...iStyle, width: 168, cursor: 'pointer', fontSize: 11.5 }}>
                          {REORDER_OPEN_STATUSES.map(k => <option key={k} value={k}>{REORDER_STATUS_LABEL[k]}</option>)}
                          <option value="credited">{REORDER_STATUS_LABEL.credited}</option>
                        </select>
                      ) : <Tag tone={REORDER_TONE[r.status]}>{REORDER_STATUS_LABEL[r.status]}</Tag>}
                    </td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 210 }}>
                      {r.receipt ? (
                        <span style={{ color: failedAgain ? C.red : C.green }}>
                          {fullDate(r.receipt.date)} · {r.receipt.accepted} accepted
                          {failedAgain && `, ${r.receipt.damaged + r.receipt.rejected} faulty again`}
                        </span>
                      ) : r.status === 'credited' ? <span style={{ color: C.blue }}>Settled as a credit</span>
                        : <span style={{ color: C.dim }}>Waiting</span>}
                    </td>
                    <td style={tdN}>{money(r.qty * rateOfLine(po, r.itemId))}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {isOpen && <Btn size="sm" tone="primary" onClick={() => onReceiveReorder(po, r)}>Receive replacement</Btn>}
                    </td>
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

/* ==========================================================================
 * SUPPLIERS
 * ========================================================================== */

function Stars({ n }: { n?: number }) {
  if (!n) return <span style={{ color: C.dim, fontSize: 11 }}>not rated</span>
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= n ? C.amber : C.dim, fontSize: 12 }}>★</span>)}
    </span>
  )
}

/* Measured and given are shown side by side rather than blended. A supplier who
 * is always on time but ships damaged goods should not average out to "fine". */
function SupplierTable() {
  const { state, saveSupplier } = useInventory()
  const [editing, setEditing] = useState<Supplier | null>(null)
  const rows = state.suppliers.map(s => ({ s, p: supplierPerformance(state.pos, state.suppliers, s.name) }))
    .sort((a, b) => (a.p.avgDelay ?? 99) - (b.p.avgDelay ?? 99))

  const blank = (): Supplier => ({ id: uid('s'), name: '', contact: '', phone: '', quotedLeadDays: 14 })

  return (
    <>
      <Card title="Suppliers" pad={false}
        subtitle="Lead time and faults are measured from what actually happened; the rating is your own judgement"
        right={<Btn size="sm" tone="primary" onClick={() => setEditing(blank())}>Add supplier</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Supplier</th><th style={th}>Contact</th><th style={thR}>Orders</th><th style={thR}>Value</th>
                <th style={thR}>Quoted</th><th style={thR}>Actual</th><th style={thR}>Delay</th><th style={thR}>On time</th>
                <th style={thR}>Faulty</th><th style={thR}>Open reorders</th><th style={thR}>Failed twice</th>
                <th style={th}>Rating</th><th style={th} />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ s: sup, p: r }) => (
                <tr key={sup.id} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{sup.name}</td>
                  <td style={{ ...td, color: C.faint }}>{sup.contact}</td>
                  <td style={tdN}>{r.orders || '—'}</td>
                  <td style={tdN}>{r.value ? money(r.value) : '—'}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.quotedLead != null ? `${r.quotedLead}d` : '—'}</td>
                  <td style={tdN}>{r.actualLead != null ? `${Math.round(r.actualLead)}d` : '—'}</td>
                  <td style={{ ...tdN, fontWeight: 700, color: r.avgDelay == null ? C.dim : r.avgDelay > 0 ? C.red : C.green }}>
                    {r.avgDelay == null ? '—' : r.avgDelay > 0 ? `+${Math.round(r.avgDelay)}d` : `${Math.round(r.avgDelay)}d`}
                  </td>
                  <td style={{ ...tdN, color: r.onTimePct == null ? C.dim : r.onTimePct >= 80 ? C.green : r.onTimePct >= 50 ? C.amber : C.red }}>
                    {r.onTimePct == null ? '—' : `${Math.round(r.onTimePct)}%`}
                  </td>
                  <td style={{ ...tdN, color: r.faultyPct ? C.red : C.dim }}>{r.faultyPct ? `${r.faultyPct.toFixed(1)}%` : '—'}</td>
                  <td style={{ ...tdN, color: r.openReorders ? C.red : C.dim }}>{r.openReorders || '—'}</td>
                  <td style={{ ...tdN, color: r.repeatFailures ? C.red : C.dim }}>{r.repeatFailures || '—'}</td>
                  <td style={td}><Stars n={sup.rating} /></td>
                  <td style={{ ...td, textAlign: 'right' }}><Btn size="sm" onClick={() => setEditing(sup)}>Edit</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <Modal title={editing.name || 'New supplier'} width={560} onClose={() => setEditing(null)}
          footer={<><Btn onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn tone="primary" disabled={!editing.name.trim()} onClick={() => { saveSupplier(editing); setEditing(null) }}>Save supplier</Btn></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Grid cols={2}>
              <Field label="Name"><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={iStyle} /></Field>
              <Field label="Contact"><input value={editing.contact} onChange={e => setEditing({ ...editing, contact: e.target.value })} style={iStyle} /></Field>
              <Field label="Phone"><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} style={iStyle} /></Field>
              <Field label="Quoted lead time" hint="days, as they state it">
                <input type="number" value={editing.quotedLeadDays}
                  onChange={e => setEditing({ ...editing, quotedLeadDays: parseFloat(e.target.value) || 0 })} style={numStyle} />
              </Field>
            </Grid>
            <Field label="Your rating" hint="Your own judgement. Lead time and faults are measured separately and never folded into this.">
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setEditing({ ...editing, rating: n })} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 0,
                    color: (editing.rating ?? 0) >= n ? C.amber : C.dim,
                  }}>★</button>
                ))}
                {editing.rating != null && (
                  <button onClick={() => setEditing({ ...editing, rating: undefined })}
                    style={{ background: 'none', border: 'none', color: C.faint, fontSize: 11, cursor: 'pointer', marginLeft: 6, fontFamily: 'inherit' }}>clear</button>
                )}
              </div>
            </Field>
            <Field label="Note">
              <input value={editing.ratingNote ?? ''} onChange={e => setEditing({ ...editing, ratingNote: e.target.value })}
                placeholder="Why — e.g. cheap but packaging is poor" style={iStyle} />
            </Field>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ==========================================================================
 * NEW ORDER — the catalogue, not a dropdown
 *
 * Buying is choosing from what you stock, so the catalogue is on the screen
 * with its rates and lives visible. Type a quantity against a row and it
 * becomes a line.
 * ========================================================================== */

function POModal({ po, onSave, onPlace, onClose }: {
  po: PurchaseOrder
  onSave: (po: PurchaseOrder) => void
  onPlace: (id: string, ordered: string, promised: string) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const [f, setF] = useState<PurchaseOrder>(po)
  const [placing, setPlacing] = useState(false)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<PartCategory | 'All'>('All')
  const [allSuppliers, setAllSuppliers] = useState(false)
  const isNew = !state.pos.some(p => p.id === po.id)

  const quoted = state.suppliers.find(x => x.name === f.supplier)?.quotedLeadDays ?? 14
  const [ordered, setOrdered] = useState(TODAY)
  const [promised, setPromised] = useState(addDays(TODAY, quoted))

  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const qtyOf = (id: string) => f.lines.find(l => l.itemId === id)?.qty ?? 0
  const rateOf = (id: string) =>
    f.lines.find(l => l.itemId === id)?.rate ?? state.catalogue.find(p => p.id === id)?.rate ?? 0

  const setQty = (id: string, qty: number) => setF(x => {
    const part = state.catalogue.find(p => p.id === id)
    if (qty <= 0) return { ...x, lines: x.lines.filter(l => l.itemId !== id) }
    if (x.lines.some(l => l.itemId === id)) return { ...x, lines: x.lines.map(l => l.itemId === id ? { ...l, qty } : l) }
    return { ...x, lines: [...x.lines, { itemId: id, qty, rate: part?.rate ?? 0 }] }
  })
  const setRate = (id: string, rate: number) =>
    setF(x => ({ ...x, lines: x.lines.map(l => l.itemId === id ? { ...l, rate } : l) }))

  const catalogue = state.catalogue.filter(p =>
    p.active &&
    (allSuppliers || p.supplier === f.supplier) &&
    (cat === 'All' || p.category === cat) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.partNumber.toLowerCase().includes(q.toLowerCase())))

  const value = f.lines.reduce((s, l) => s + l.qty * l.rate, 0)

  if (placing) {
    return (
      <Modal title={`Place ${f.number}`} subtitle={`${f.supplier} · ${money(value)}`} width={560} onClose={() => setPlacing(false)}
        footer={<><Btn onClick={() => setPlacing(false)}>Back</Btn>
          <Btn tone="primary" onClick={() => { onSave(f); onPlace(f.id, ordered, promised); onClose() }}>Place order</Btn></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Grid cols={2}>
            <Field label="Ordered on">
              <input type="date" value={ordered}
                onChange={e => { setOrdered(e.target.value); setPromised(addDays(e.target.value, quoted)) }}
                style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Promised delivery" hint={`${f.supplier} quotes ${quoted} days`}>
              <input type="date" value={promised} onChange={e => setPromised(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
          </Grid>
          <Note tone={C.blue}>
            The promised date is what delivery is measured against. Without it a late order cannot be told from a slow one,
            and supplier lead time stays an opinion.
          </Note>
          <Note tone={C.dim}>Once placed, the lines are fixed — receipts are recorded against them.</Note>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={isNew ? 'New purchase order' : `Edit ${f.number}`}
      subtitle="Set a quantity against a part to add it to the order" width={980} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { onSave(f); onClose() }} disabled={f.lines.length === 0}>Save as draft</Btn>
        <Btn tone="primary" disabled={f.lines.length === 0}
          onClick={() => { setPromised(addDays(ordered, quoted)); setPlacing(true) }}>Place order</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={3}>
          <Field label="Order number">
            <input value={f.number} onChange={e => setF(x => ({ ...x, number: e.target.value }))}
              style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} />
          </Field>
          <Field label="Supplier" hint="Changing the supplier clears the lines">
            <select value={f.supplier} onChange={e => setF(x => ({ ...x, supplier: e.target.value, lines: [] }))}
              style={{ ...iStyle, cursor: 'pointer' }}>
              {state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}
            </select>
          </Field>
          <Field label="Project" hint="What the parts are bought against">
            <select value={f.project} onChange={e => setF(x => ({ ...x, project: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>
              {PROJECTS.filter(isLiveProject).map(x => <option key={x} value={x}>{projectCode(x)} — {x}</option>)}
            </select>
          </Field>
        </Grid>

        <Card title="Parts catalogue" pad={false}
          subtitle={allSuppliers ? 'Every part in the catalogue' : `${catalogue.length} parts supplied by ${f.supplier}`}
          right={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search parts"
                style={{ ...iStyle, width: 180 }} />
              <select value={cat} onChange={e => setCat(e.target.value as PartCategory | 'All')}
                style={{ ...iStyle, width: 150, cursor: 'pointer' }}>
                <option value="All">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input type="checkbox" checked={allSuppliers} onChange={e => setAllSuppliers(e.target.checked)} />
                <span style={{ fontSize: 11.5, color: C.muted }}>Show all suppliers</span>
              </label>
            </div>
          }>
          <div style={{ maxHeight: 330, overflowY: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Category</th>
                <th style={thR}>Life</th><th style={thR}>Cost</th><th style={thR}>Rate</th><th style={thR}>Quantity</th><th style={thR}>Line value</th>
              </tr></thead>
              <tbody>
                {catalogue.length === 0 && (
                  <tr><td colSpan={8}><Empty>
                    No parts match. Tick &quot;Show all suppliers&quot; to buy something listed under another supplier.
                  </Empty></td></tr>
                )}
                {catalogue.map(p => {
                  const qty = qtyOf(p.id)
                  const on = qty > 0
                  return (
                    <tr key={p.id} style={{ borderBottom: rowBorder, background: on ? 'rgba(249,115,22,0.06)' : undefined }}>
                      <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{p.partNumber || '—'}</td>
                      <td style={{ ...td, color: C.text, whiteSpace: 'normal', maxWidth: 230 }}>{p.name}</td>
                      <td style={td}><Tag tone={C.dim}>{p.category}</Tag></td>
                      <td style={{ ...tdN, color: C.faint }}>{lifeLabel(p)}</td>
                      <td style={{ ...tdN, color: BASIS_TONE[p.wearBasis] }}>{costLabel(p)}</td>
                      <td style={{ padding: '5px 8px', width: 120 }}>
                        <input type="number" min={0} value={rateOf(p.id)} disabled={!on}
                          onChange={e => setRate(p.id, parseFloat(e.target.value) || 0)}
                          style={{ ...numStyle, opacity: on ? 1 : 0.45 }} />
                      </td>
                      <td style={{ padding: '5px 8px', width: 104 }}>
                        <input type="number" min={0} value={qty}
                          onChange={e => setQty(p.id, Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ ...numStyle, color: on ? C.orange : C.muted }} />
                      </td>
                      <td style={{ ...tdN, color: on ? C.text : C.dim, fontWeight: on ? 700 : 400 }}>
                        {on ? money(qty * rateOf(p.id)) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Order lines" pad={false} subtitle={`${f.lines.length} line${f.lines.length === 1 ? '' : 's'}`}>
          {f.lines.length === 0 ? (
            <Empty>Nothing on this order yet. Set a quantity against a part above.</Empty>
          ) : (
            <table style={tableStyle}>
              <thead><tr><th style={th}>Part</th><th style={thR}>Quantity</th><th style={thR}>Rate</th><th style={thR}>Value</th><th style={th} /></tr></thead>
              <tbody>
                {f.lines.map(l => (
                  <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={tdN}>{l.qty}</td>
                    <td style={tdN}>{money(l.rate)}</td>
                    <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{money(l.qty * l.rate)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <Btn size="sm" tone="danger" onClick={() => setQty(l.itemId, 0)}>Remove</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Order value</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{money(value)}</td>
                  <td style={td} />
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * RECEIVING
 * ========================================================================== */

function ReceiveModal({ po, onSave, onClose }: {
  po: PurchaseOrder
  onSave: (date: string, lines: ReceiptLine[], delayReason: DelayReason | undefined, note: string) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState<DelayReason | ''>('')

  const outstanding = (id: string) => qtyNeverDelivered(po, id)
  const [rows, setRows] = useState<Record<string, { accepted: number; damaged: number; rejected: number }>>(
    Object.fromEntries(po.lines.map(l => [l.itemId, { accepted: outstanding(l.itemId), damaged: 0, rejected: 0 }])))

  /* Nothing can be received twice: the three boxes together are capped at what
   * is still owed on this line, and the box being typed in gives way. */
  const set = (itemId: string, k: 'accepted' | 'damaged' | 'rejected', v: number) =>
    setRows(r => {
      const row = r[itemId]
      const others = (['accepted', 'damaged', 'rejected'] as const)
        .filter(x => x !== k).reduce((s, x) => s + row[x], 0)
      const capped = Math.max(0, Math.min(v, Math.max(0, outstanding(itemId) - others)))
      return { ...r, [itemId]: { ...row, [k]: capped } }
    })

  const lines: ReceiptLine[] = po.lines
    .map(l => ({ itemId: l.itemId, ...rows[l.itemId] }))
    .filter(l => l.accepted + l.damaged + l.rejected > 0)

  const rate = (id: string) => rateOfLine(po, id)
  const acceptedValue = lines.reduce((s, l) => s + l.accepted * rate(l.itemId), 0)
  const faultyValue = lines.reduce((s, l) => s + (l.damaged + l.rejected) * rate(l.itemId), 0)
  const faultyCount = lines.reduce((s, l) => s + l.damaged + l.rejected, 0)
  const delay = po.promisedDate ? daysBetween(po.promisedDate, date) : null
  const late = delay != null && delay > 0
  const beforeOrder = !!po.orderedDate && date < po.orderedDate

  return (
    <Modal title={`Receive against ${po.number}`} subtitle={`${po.supplier} · ${projectCode(po.project)}`} width={780} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={lines.length === 0 || (late && !reason) || beforeOrder}
          onClick={() => { onSave(date, lines, reason || undefined, note); onClose() }}>Record receipt</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Note tone={C.dim}>
          Record what actually turned up. Accepted parts go straight onto the shelf and are issued from the Store.
          Damaged and wrong stock never reaches the shelf, so it becomes a reorder against the supplier rather than
          quietly disappearing.
        </Note>

        <Grid cols={2}>
          <Field label="Delivered on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        </Grid>

        {beforeOrder && <Note tone={C.red}>This is before the order was placed on {fullDate(po.orderedDate!)}. Check the date.</Note>}

        {delay != null && !beforeOrder && (
          <Note tone={late ? C.red : C.green}>
            {po.promisedDate && `Promised ${fullDate(po.promisedDate)}. `}
            {late ? `${delay} days late.` : delay === 0 ? 'On time.' : `${Math.abs(delay)} days early.`}
            {' '}This feeds the supplier&apos;s measured lead time.
          </Note>
        )}

        {late && (
          <Field label="Why was it late?" hint="A supplier held up by our own late order is not scored for it">
            <select value={reason} onChange={e => setReason(e.target.value as DelayReason)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="">Select a reason</option>
              {DELAY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead><tr>
              <th style={th}>Part</th><th style={thR}>Still owed</th>
              <th style={thR}>Accepted</th><th style={thR}>Damaged</th><th style={thR}>Wrong or short</th>
            </tr></thead>
            <tbody>
              {po.lines.map(l => {
                const out = outstanding(l.itemId)
                const r = rows[l.itemId]
                return (
                  <tr key={l.itemId} style={{ borderBottom: rowBorder, opacity: out > 0 ? 1 : 0.4 }}>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={{ ...tdN, color: out > 0 ? C.amber : C.dim }}>{out}</td>
                    {(['accepted', 'damaged', 'rejected'] as const).map(k => (
                      <td key={k} style={{ padding: '5px 8px', width: 104 }}>
                        <input type="number" min={0} max={out} disabled={out === 0} value={r[k]}
                          onChange={e => set(l.itemId, k, parseFloat(e.target.value) || 0)}
                          style={{ ...numStyle, color: k === 'accepted' ? C.green : k === 'damaged' ? C.red : C.amber }} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 26, alignItems: 'baseline' }}>
          <div>
            <span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Onto the shelf</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: C.green, fontFamily: 'ui-monospace, monospace' }}>{money(acceptedValue)}</span>
          </div>
          {faultyValue > 0 && (
            <div>
              <span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Not fit to use</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(faultyValue)}</span>
            </div>
          )}
        </div>

        {faultyCount > 0 && (
          <Note tone={C.amber}>
            {faultyCount} unit{faultyCount === 1 ? '' : 's'} will not enter the store. Raise the reorder from the order row
            once this is saved, and the replacement is tracked on its own line.
          </Note>
        )}
      </div>
    </Modal>
  )
}

/* ── Raise a reorder ──────────────────────────────────────────────────── */

function RaiseReorderModal({ po, onSave, onClose }: {
  po: PurchaseOrder
  onSave: (r: Omit<Reorder, 'id'>) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const candidates = po.lines.filter(l => qtyToReorder(po, l.itemId) > 0)
  const [itemId, setItemId] = useState(candidates[0]?.itemId ?? '')
  const max = itemId ? qtyToReorder(po, itemId) : 0
  const [qty, setQty] = useState(max || 1)
  const [reason, setReason] = useState('Damaged in transit')
  const [promisedDate, setPromisedDate] = useState('')

  const pick = (id: string) => { setItemId(id); setQty(qtyToReorder(po, id) || 1) }

  return (
    <Modal title={`Reorder against ${po.number}`} subtitle={`${po.supplier} · faulty units the supplier still owes`}
      width={640} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!itemId || qty < 1}
          onClick={() => {
            onSave({
              itemId, qty, reason: reason.trim() || 'Arrived unusable', raisedDate: TODAY,
              round: 1, status: promisedDate ? 'promised' : 'raised',
              promisedDate: promisedDate || undefined,
            })
            onClose()
          }}>Raise reorder</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {candidates.length === 0 ? (
          <Empty>Nothing on this order is waiting to be reordered.</Empty>
        ) : (
          <>
            <Note tone={C.dim}>
              The replacement is not a new order. It is chased on its own line in the Reorders table, and when it arrives
              you receive it there — so the order reconciles without anything being paid for twice.
            </Note>

            <Grid cols={2}>
              <Field label="Part">
                <select value={itemId} onChange={e => pick(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                  {candidates.map(l => (
                    <option key={l.itemId} value={l.itemId}>
                      {nameOf(l.itemId)} — {qtyToReorder(po, l.itemId)} faulty
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity" hint={`${max} waiting to be chased`}>
                <input type="number" min={1} max={max} value={qty}
                  onChange={e => setQty(Math.min(max, Math.max(1, parseFloat(e.target.value) || 1)))} style={numStyle} />
              </Field>
            </Grid>

            <Grid cols={2}>
              <Field label="What was wrong">
                <input value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="e.g. cases cracked in transit" style={iStyle} />
              </Field>
              <Field label="Replacement promised" hint="Optional. Without a date this shows as unchased after a week.">
                <input type="date" value={promisedDate} onChange={e => setPromisedDate(e.target.value)}
                  style={{ ...iStyle, colorScheme: 'dark' }} />
              </Field>
            </Grid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 11, color: C.faint }}>Value owed by {po.supplier}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>
                {money(qty * rateOfLine(po, itemId))}
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ── Receive a replacement ────────────────────────────────────────────── */

function ReceiveReorderModal({ po, reorder, onSave, onClose }: {
  po: PurchaseOrder
  reorder: Reorder
  onSave: (receipt: ReorderReceipt) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const name = state.catalogue.find(p => p.id === reorder.itemId)?.name ?? reorder.itemId
  const [date, setDate] = useState(TODAY)
  const [accepted, setAccepted] = useState(reorder.qty)
  const [damaged, setDamaged] = useState(0)
  const [rejected, setRejected] = useState(0)
  const [note, setNote] = useState('')

  const total = accepted + damaged + rejected
  const cap = (v: number, others: number) => Math.max(0, Math.min(v, reorder.qty - others))
  const faulty = damaged + rejected
  const rate = rateOfLine(po, reorder.itemId)

  return (
    <Modal title={`Receive replacement — round ${reorder.round}`}
      subtitle={`${name} · ${po.number} · ${po.supplier}`} width={660} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={total === 0}
          onClick={() => { onSave({ date, accepted, damaged, rejected, note: note || undefined }); onClose() }}>
          {faulty > 0 ? `Record and reorder ${faulty}` : 'Record replacement'}
        </Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 14px',
          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <KVBlock k="Sent back" v={`${reorder.qty} × ${name}`} />
          <KVBlock k="Raised" v={fullDate(reorder.raisedDate)} />
          <KVBlock k="Reason" v={reorder.reason} />
          {reorder.promisedDate && <KVBlock k="Promised" v={fullDate(reorder.promisedDate)} />}
        </div>

        <Grid cols={2}>
          <Field label="Replacement arrived on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        </Grid>

        <Grid cols={3}>
          <Field label="Accepted" hint="goes onto the shelf">
            <input type="number" min={0} max={reorder.qty} value={accepted}
              onChange={e => setAccepted(cap(parseFloat(e.target.value) || 0, damaged + rejected))}
              style={{ ...numStyle, color: C.green }} />
          </Field>
          <Field label="Damaged" hint="faulty all over again">
            <input type="number" min={0} max={reorder.qty} value={damaged}
              onChange={e => setDamaged(cap(parseFloat(e.target.value) || 0, accepted + rejected))}
              style={{ ...numStyle, color: C.red }} />
          </Field>
          <Field label="Wrong or short" hint="not what was sent back for">
            <input type="number" min={0} max={reorder.qty} value={rejected}
              onChange={e => setRejected(cap(parseFloat(e.target.value) || 0, accepted + damaged))}
              style={{ ...numStyle, color: C.amber }} />
          </Field>
        </Grid>

        {faulty > 0 ? (
          <Note tone={C.red}>
            {faulty} unit{faulty === 1 ? '' : 's'} still unusable, worth {money(faulty * rate)}. Saving closes this line and
            opens round {reorder.round + 1} against {po.supplier}, so the chase carries on and the failure stays on their record.
          </Note>
        ) : (
          <Note tone={C.green}>
            {accepted} unit{accepted === 1 ? '' : 's'} worth {money(accepted * rate)} go onto the shelf and can be issued
            from the Store. This reorder closes.
          </Note>
        )}
      </div>
    </Modal>
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

/* ==========================================================================
 * STORE — the shelf, and the only place a part leaves for a rig
 * ========================================================================== */

function StoreTab({ onIssue, onMove }: {
  onIssue: (project: string, line?: StockLine) => void
  onMove: (l: StockLine) => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const partOf = (id: string) => state.catalogue.find(p => p.id === id)

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
        <Stat label="On the shelf" value={moneyL(stockValue)}
          note={`${stock.length} lines across ${new Set(stock.map(s => s.itemId)).size} parts`} color={C.amber} big />
        <Stat label={`Sitting over ${state.alerts.idleDays} days`} value={moneyL(idle.reduce((s, l) => s + l.value, 0))}
          note={`${idle.length} line${idle.length === 1 ? '' : 's'}`} color={idle.length ? C.red : C.dim} big />
        <Stat label="On order" value={moneyL(pending.reduce((s, l) => s + l.value, 0))}
          note={`${pending.filter(p => (p.overdueDays ?? 0) > 0).length} overdue`} color={C.blue} big />
      </Grid>

      <Note tone={C.dim}>
        This is the only place a part leaves for a rig. Issue it to a project and a rig and it stops being stock and
        starts being cost. Stock bought against a project that has closed can be moved to a live one — the order keeps the
        project it was bought for, because rewriting that would falsify what was spent where.
      </Note>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        <Chain label="Project">
          <Chip on={project === 'all'} label="All" onClick={() => setProject('all')} />
          {projects.map(p => (
            <Chip key={p} on={project === p} label={projectCode(p)} onClick={() => setProject(project === p ? 'all' : p)} />
          ))}
        </Chain>
        <div style={{ flex: 1 }} />
        <Btn size="sm" tone="primary"
          disabled={shown.filter(l => isLiveProject(l.project)).length === 0}
          onClick={() => onIssue(project === 'all' ? (projects.find(isLiveProject) ?? PROJECTS[0]) : project)}>
          Issue parts to a rig
        </Btn>
      </div>

      <Card title="On the shelf" pad={false}
        subtitle={`${shown.length} line${shown.length === 1 ? '' : 's'} · ${money(shownValue)} received and not yet issued`}>
        {shown.length === 0 ? (
          <Empty>Nothing on the shelf. Everything received has gone out to a rig.</Empty>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Part</th><th style={th}>Project</th><th style={th}>From order</th>
                <th style={thR}>Quantity</th><th style={thR}>Age</th><th style={thR}>Cover</th><th style={thR}>Value</th><th style={th} />
              </tr></thead>
              <tbody>
                {shown.map(l => {
                  const old = l.ageDays >= state.alerts.idleDays
                  const stranded = COMPLETED_PROJECTS.includes(l.project)
                  const part = partOf(l.itemId)
                  return (
                    <tr key={l.key} style={{
                      borderBottom: rowBorder,
                      background: stranded ? 'rgba(239,68,68,0.05)' : old ? 'rgba(245,158,11,0.04)' : undefined,
                    }}>
                      <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>
                        {nameOf(l.itemId)}
                        {part?.partNumber && <span style={{ marginLeft: 8, fontSize: 11, color: C.dim, fontFamily: 'ui-monospace, monospace' }}>{part.partNumber}</span>}
                      </td>
                      <td style={tdMono}>
                        {projectCode(l.project)}
                        {stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>project ended</Tag></span>}
                        {l.movedHere && !stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.blue}>moved here</Tag></span>}
                      </td>
                      <td style={td}>{l.poNumber}</td>
                      <td style={tdN}>{l.qty}</td>
                      <td style={{ ...tdN, color: old ? C.amber : C.faint, fontWeight: old ? 700 : 400 }}>{l.ageDays}d</td>
                      <td style={{ ...tdN, color: C.faint }}>
                        {part ? (part.wearBasis === 'days'
                          ? `${(l.qty * part.lifeDays).toLocaleString('en-IN')} days`
                          : `${(l.qty * (part.wearBasis === 'metres' ? part.lifeMetres : part.life.Hard)).toLocaleString('en-IN')} m`) : '—'}
                      </td>
                      <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(l.value)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {!stranded && <Btn size="sm" tone="primary" onClick={() => onIssue(l.project, l)}>Issue</Btn>}
                          <Btn size="sm" onClick={() => onMove(l)}>Move</Btn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={6}>Total on the shelf</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(shownValue)}</td>
                  <td style={td} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Card title="On order" pad={false} subtitle="Placed and not yet on the shelf, including anything sent back for replacement">
        {pending.length === 0 ? <Empty>Nothing outstanding.</Empty> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Part</th><th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Due</th>
                <th style={thR}>Quantity</th><th style={thR}>Value</th><th style={thR}>Status</th>
              </tr></thead>
              <tbody>
                {pending.map((l, k) => (
                  <tr key={k} style={{ borderBottom: rowBorder, background: (l.overdueDays ?? 0) > 0 ? 'rgba(239,68,68,0.05)' : undefined }}>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={td}>{l.poNumber}</td>
                    <td style={td}>{l.supplier}</td>
                    <td style={td}>{l.promisedDate ? dayLabel(l.promisedDate) : '—'}</td>
                    <td style={tdN}>{l.qty}</td>
                    <td style={tdN}>{money(l.value)}</td>
                    <td style={{ ...tdN, color: (l.overdueDays ?? 0) > 0 ? C.red : l.awaitingReplacement ? C.amber : C.blue, fontWeight: 700 }}>
                      {(l.overdueDays ?? 0) > 0 ? `${l.overdueDays}d late`
                        : l.awaitingReplacement ? 'replacement' : 'awaiting'}
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

/* ── Issue from the store ─────────────────────────────────────────────── */

function IssueModal({ project, prefill, onSave, onClose }: {
  project: string
  prefill?: StockLine
  onSave: (date: string, project: string, rig: string, by: string, picks: { poId: string; itemId: string; qty: number }[]) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id

  const stock = stockInStore(state.pos, TODAY)
  const projects = Array.from(new Set(stock.filter(l => isLiveProject(l.project)).map(l => l.project)))
  const [proj, setProj] = useState(projects.includes(project) ? project : (projects[0] ?? project))
  const [rig, setRig] = useState(RIGS[0])
  const [date, setDate] = useState(TODAY)
  const [by, setBy] = useState('Store')
  const [qty, setQty] = useState<Record<string, number>>(
    prefill ? { [prefill.key]: prefill.qty } : {})

  const lines = stock.filter(l => l.project === proj)
  const picks = lines
    .map(l => ({ line: l, qty: Math.min(l.qty, qty[l.key] ?? 0) }))
    .filter(x => x.qty > 0)
  const value = picks.reduce((s, p) => s + p.qty * p.line.rate, 0)

  // A receipt dated after the issue would mean parts left the shelf before
  // they arrived, so the earliest sensible date is the newest receipt involved.
  const tooEarly = picks.some(p => daysBetween(date, TODAY) > p.line.ageDays)

  return (
    <Modal title="Issue parts to a rig" subtitle="What leaves the shelf, where it goes, and when" width={780} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={picks.length === 0 || tooEarly}
          onClick={() => {
            onSave(date, proj, rig, by, picks.map(p => ({ poId: p.line.poId, itemId: p.line.itemId, qty: p.qty })))
            onClose()
          }}>Issue {picks.length ? `${picks.reduce((s, p) => s + p.qty, 0)} to ${rig}` : 'to a rig'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={4}>
          <Field label="Project">
            <select value={proj} onChange={e => { setProj(e.target.value); setQty({}) }} style={{ ...iStyle, cursor: 'pointer' }}>
              {projects.map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}
            </select>
          </Field>
          <Field label="Rig">
            <select value={rig} onChange={e => setRig(e.target.value)}
              style={{ ...iStyle, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
              {RIGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Issued on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Issued by"><input value={by} onChange={e => setBy(e.target.value)} style={iStyle} /></Field>
        </Grid>

        {tooEarly && <Note tone={C.red}>Some of these parts had not arrived on {fullDate(date)}. Move the date forward.</Note>}

        {lines.length === 0 ? (
          <Empty>Nothing on the shelf for {projectCode(proj)}.</Empty>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Part</th><th style={th}>From order</th><th style={thR}>On the shelf</th>
                <th style={thR}>Issuing</th><th style={thR}>Value</th>
              </tr></thead>
              <tbody>
                {lines.map(l => {
                  const n = qty[l.key] ?? 0
                  return (
                    <tr key={l.key} style={{ borderBottom: rowBorder, background: n > 0 ? 'rgba(249,115,22,0.06)' : undefined }}>
                      <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                      <td style={td}>{l.poNumber}</td>
                      <td style={{ ...tdN, color: C.amber }}>{l.qty}</td>
                      <td style={{ padding: '5px 10px', width: 110 }}>
                        <input type="number" min={0} max={l.qty} value={n}
                          onChange={e => setQty(s => ({ ...s, [l.key]: Math.min(l.qty, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                          style={{ ...numStyle, color: n > 0 ? C.orange : C.muted }} />
                      </td>
                      <td style={{ ...tdN, color: n > 0 ? C.text : C.dim }}>{n > 0 ? money(n * l.rate) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={4}>Leaving the store</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{money(value)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <Note tone={C.blue}>
          Finance charges parts by the metre or the day from the catalogue, not on the day they were issued, so this does
          not spike the cost per metre of whatever hole happens to be running. It shows up in Consumption instead.
        </Note>
      </div>
    </Modal>
  )
}

/* ── Move stock between projects ──────────────────────────────────────── */

function MoveModal({ line, onSave, onClose }: {
  line: StockLine
  onSave: (poId: string, t: { date: string; itemId: string; qty: number; toProject: string; note?: string }) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(p => p.id === id)?.name ?? id
  const live = PROJECTS.filter(p => p !== line.project && isLiveProject(p))
  const [to, setTo] = useState(live[0] ?? '')
  const [qty, setQty] = useState(line.qty)
  const [note, setNote] = useState('')
  const closed = COMPLETED_PROJECTS.includes(line.project)

  return (
    <Modal title={`Move ${nameOf(line.itemId)}`}
      subtitle={`${line.qty} on the shelf against ${projectCode(line.project)}${closed ? ', which has ended' : ''}`}
      width={580} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!to || qty < 1}
          onClick={() => { onSave(line.poId, { date: TODAY, itemId: line.itemId, qty, toProject: to, note: note || undefined }); onClose() }}>
          Move to {to ? projectCode(to) : '—'}
        </Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={2}>
          <Field label="Quantity" hint={`${line.qty} available`}>
            <input type="number" min={1} max={line.qty} value={qty}
              onChange={e => setQty(Math.min(line.qty, Math.max(1, parseFloat(e.target.value) || 1)))} style={numStyle} />
          </Field>
          <Field label="Move to">
            <select value={to} onChange={e => setTo(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
              {live.map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}
            </select>
          </Field>
        </Grid>
        <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        <Note tone={C.dim}>
          {line.poNumber} keeps {projectCode(line.project)} as the project it was bought for. The move is recorded
          separately, so what was spent on that project stays true while the stock becomes usable again.
        </Note>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * CONSUMPTION — what a month of drilling actually used
 *
 * Three numbers, in the order they answer a question:
 *
 *   metres drilled, by ground     what was achieved
 *   parts used                    what it took, from the driller's log
 *   cost per metre                what that works out at
 *
 * Issued from the store sits alongside as a cross-check. Issuing and using are
 * different events — a bit issued in August may still be drilling in October —
 * so the two will not match, and the gap is what is sitting on the rig.
 * ========================================================================== */

function ConsumptionTab({ month, onMonth }: { month: string; onMonth: (m: string) => void }) {
  const { state } = useInventory()
  const { state: cost } = useCosting()
  const [openRig, setOpenRig] = useState<string | null>(null)
  const [project, setProject] = useState(PROJECTS[0])
  const [rigFilter, setRigFilter] = useState<string | 'all'>('all')
  const partOf = (id: string) => state.catalogue.find(p => p.id === id)
  const nameOf = (id: string) => partOf(id)?.name ?? id

  /* Which rigs worked this project — taken from the driller's log rather than a
   * fixed list, so a rig moved between projects appears where it actually was. */
  const projectRigs = useMemo(() => Array.from(new Set(
    cost.shiftLogs.filter(l => l.project === project).map(l => l.rig))).sort(),
    [cost.shiftLogs, project])

  const byRig = useMemo(() => projectRigs.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && l.project === project && monthOf(l.date) === month)
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
    const drillingDays = new Set(shifts.filter(l => l.metresDrilled > 0).map(l => l.date)).size

    const byFormation = FORMATIONS.map(f => ({
      formation: f,
      metres: shifts.filter(l => normFormation(l.formationType) === f).reduce((s, l) => s + l.metresDrilled, 0),
    })).filter(x => x.metres > 0)

    // Straight from the accessories section of the driller's log.
    const usedQty: Record<string, number> = {}
    shifts.forEach(l => (l.partsUsed ?? []).forEach(p => { usedQty[p.itemId] = (usedQty[p.itemId] ?? 0) + p.qty }))
    const used = Object.entries(usedQty).map(([itemId, qty]) => {
      const rate = partOf(itemId)?.rate ?? 0
      return { itemId, qty, rate, cost: qty * rate, perMetre: metres > 0 ? (qty * rate) / metres : 0 }
    }).sort((a, b) => b.cost - a.cost)

    const usedCost = used.reduce((s, u) => s + u.cost, 0)
    // Parts charged by time rather than by metre. They are consumed whether or
    // not anyone books them out, so they are added from the catalogue.
    const dayCost = drillingDays * toolingPerDay(state.catalogue)
    const total = usedCost + dayCost
    const issued = consumptionValue(state.pos, { rig, project, month })
    return {
      rig, metres, drillingDays, byFormation, used, usedCost, dayCost, total, issued,
      cpm: metres > 0 ? total / metres : 0,
    }
  }).filter(r => (r.metres > 0 || r.issued > 0) && (rigFilter === 'all' || r.rig === rigFilter)),
    [state.catalogue, state.pos, cost.shiftLogs, month, project, projectRigs, rigFilter])

  const t = byRig.reduce((a, r) => ({
    metres: a.metres + r.metres, used: a.used + r.total, issued: a.issued + r.issued,
  }), { metres: 0, used: 0, issued: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <Chain label="Project">
          {PROJECTS.map(p => (
            <Chip key={p} on={project === p} label={projectCode(p)}
              onClick={() => { setProject(p); setRigFilter('all'); setOpenRig(null) }} />
          ))}
        </Chain>
        {projectRigs.length > 0 && (
          <>
            <span style={{ width: 1, height: 22, background: C.border }} />
            <Chain label="Rig">
              <Chip on={rigFilter === 'all'} label="All" onClick={() => setRigFilter('all')} />
              {projectRigs.map(r => (
                <Chip key={r} on={rigFilter === r} label={r} onClick={() => setRigFilter(rigFilter === r ? 'all' : r)} />
              ))}
            </Chain>
          </>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={() => onMonth(shiftMonth(month, -1))} style={arrowStyle}>◀</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 128, textAlign: 'center' }}>{monthLabel(month)}</span>
          <button onClick={() => onMonth(shiftMonth(month, 1))} style={arrowStyle}>▶</button>
        </div>
      </div>

      <Note tone={C.dim}>
        <strong style={{ color: C.text }}>Parts used</strong> comes from the accessories section of the driller&apos;s log —
        what the supervisor recorded going into the ground — plus the parts charged by time, which wear whether or not
        anyone books them out. <strong style={{ color: C.text }}>Issued</strong> is what left the store. They do not match,
        and should not: a bit issued this month may still be drilling in three months&apos; time.
      </Note>

      <Grid cols={4}>
        <Stat label="Metres drilled" value={`${t.metres} m`} note={`${projectCode(project)} · ${monthLabel(month)}`} big />
        <Stat label="Parts used" value={moneyL(t.used)} note="from the log, plus time-based parts" color={C.green} big />
        <Stat label="Cost per metre" value={t.metres ? perMetre(t.used / t.metres) : '—'} note="parts only" color={C.orange} big />
        <Stat label="Issued from store" value={moneyL(t.issued)}
          note={t.issued > t.used ? `${moneyL(t.issued - t.used)} still on the rigs` : 'drawing on earlier stock'}
          color={C.amber} big />
      </Grid>

      {byRig.length === 0 ? (
        <Card><Empty>Nothing drilled or issued on {projectCode(project)} in {monthLabel(month)}.</Empty></Card>
      ) : (
        <Card title="By rig" pad={false}
          subtitle="Click a rig for the metres, the parts that went into them, and how the cost per metre is reached">
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Rig</th><th style={th}>Ground drilled</th><th style={thR}>Metres</th>
                <th style={thR}>Parts used</th><th style={thR}>Cost per metre</th>
                <th style={thR}>Issued from store</th><th style={thR}>On the rig</th>
              </tr></thead>
              <tbody>
                {byRig.map(r => {
                  const isOpen = openRig === r.rig
                  return (
                    <Fragment key={r.rig}>
                      <tr onClick={() => setOpenRig(isOpen ? null : r.rig)}
                        style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
                        <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{r.rig}</td>
                        <td style={{ ...td, whiteSpace: 'normal', maxWidth: 300, color: C.faint }}>
                          {r.byFormation.map(b => `${b.metres} m ${b.formation.toLowerCase()}`).join(' · ') || '—'}
                        </td>
                        <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{r.metres}</td>
                        <td style={{ ...tdN, color: C.green }}>{money(r.total)}</td>
                        <td style={{ ...tdN, color: C.orange, fontWeight: 700 }}>{r.metres ? perMetre(r.cpm) : '—'}</td>
                        <td style={{ ...tdN, color: C.amber }}>{money(r.issued)}</td>
                        <td style={{ ...tdN, color: r.issued > r.total ? C.amber : C.dim }}>
                          {r.issued > r.total ? money(r.issued - r.total) : '—'}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                          <td colSpan={7} style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 26, alignItems: 'start' }}>
                              <div>
                                <SubHead tone={C.blue}>Metres drilled</SubHead>
                                <table style={tableStyle}>
                                  <thead><tr><th style={th}>Ground</th><th style={thR}>Metres</th><th style={thR}>Share</th></tr></thead>
                                  <tbody>
                                    {r.byFormation.map(b => (
                                      <tr key={b.formation} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, color: C.text }}>{b.formation}</td>
                                        <td style={tdN}>{b.metres}</td>
                                        <td style={{ ...tdN, color: C.faint }}>
                                          {r.metres ? `${((b.metres / r.metres) * 100).toFixed(0)}%` : '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                      <td style={{ ...td, fontWeight: 800, color: C.text }}>Total</td>
                                      <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{r.metres}</td>
                                      <td style={tdN} />
                                    </tr>
                                  </tfoot>
                                </table>

                                <div style={{ marginTop: 20 }}>
                                  <SubHead tone={C.orange}>How the cost per metre is reached</SubHead>
                                  <pre style={preStyle}>
{`from the log   ${money(r.usedCost)}
by the day     ${money(r.dayCost)}   ${r.drillingDays} drilling days
               ${'─'.repeat(22)}
parts used     ${money(r.total)}
metres         ${r.metres} m
               ${'─'.repeat(22)}
per metre      ${r.metres ? perMetre(r.cpm) : '—'}`}
                                  </pre>
                                </div>
                              </div>

                              <div>
                                <SubHead tone={C.green}>Parts used — from the driller&apos;s log</SubHead>
                                {r.used.length === 0 ? (
                                  <Empty>No accessories recorded for {r.rig} this month.</Empty>
                                ) : (
                                  <table style={tableStyle}>
                                    <thead><tr>
                                      <th style={th}>Part</th><th style={thR}>Qty</th><th style={thR}>Rate</th>
                                      <th style={thR}>Cost</th><th style={thR}>Per metre</th>
                                    </tr></thead>
                                    <tbody>
                                      {r.used.map(u => (
                                        <tr key={u.itemId} style={{ borderBottom: rowBorder }}>
                                          <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(u.itemId)}</td>
                                          <td style={tdN}>{u.qty}</td>
                                          <td style={{ ...tdN, color: C.faint }}>{money(u.rate)}</td>
                                          <td style={{ ...tdN, color: C.green, fontWeight: 700 }}>{money(u.cost)}</td>
                                          <td style={{ ...tdN, color: C.orange }}>{u.perMetre.toFixed(2)}</td>
                                        </tr>
                                      ))}
                                      {r.dayCost > 0 && (
                                        <tr style={{ borderBottom: rowBorder }}>
                                          <td style={{ ...td, color: C.teal }}>Parts charged by the day</td>
                                          <td style={tdN}>{r.drillingDays}d</td>
                                          <td style={{ ...tdN, color: C.faint }}>{perDay(toolingPerDay(state.catalogue))}</td>
                                          <td style={{ ...tdN, color: C.teal, fontWeight: 700 }}>{money(r.dayCost)}</td>
                                          <td style={{ ...tdN, color: C.orange }}>
                                            {r.metres ? (r.dayCost / r.metres).toFixed(2) : '—'}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                        <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Total</td>
                                        <td style={{ ...tdN, fontWeight: 900, color: C.green }}>{money(r.total)}</td>
                                        <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>
                                          {r.metres ? r.cpm.toFixed(2) : '—'}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                )}

                                <div style={{ marginTop: 18, padding: '14px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                                  <Grid cols={3}>
                                    <Res k="Used" v={money(r.total)} tone={C.green} />
                                    <Res k="Issued from store" v={money(r.issued)} tone={C.amber} />
                                    <Res k="Sitting on the rig" v={r.issued > r.total ? money(r.issued - r.total) : '—'}
                                      tone={r.issued > r.total ? C.amber : C.dim} />
                                  </Grid>
                                  <div style={{ marginTop: 11, fontSize: 11, color: C.faint, lineHeight: 1.65 }}>
                                    {r.issued > r.total
                                      ? `${money(r.issued - r.total)} was drawn from the store but has not gone into the ground yet — it is on the rig, part-worn or unopened.`
                                      : 'More was used than drawn this month, so the rig was working through stock issued earlier.'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={2}>
                    {byRig.length} rig{byRig.length === 1 ? '' : 's'} on {projectCode(project)}
                  </td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{t.metres}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.green }}>{money(t.used)}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{t.metres ? perMetre(t.used / t.metres) : '—'}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(t.issued)}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{t.issued > t.used ? money(t.issued - t.used) : '—'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function Res({ k, v, tone }: { k: string; v: string; tone: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: tone, fontFamily: 'ui-monospace, monospace' }}>{v}</div>
    </div>
  )
}

/* ==========================================================================
 * SCREEN
 * ========================================================================== */

const TABS = ['Catalogue', 'Orders', 'Store', 'Consumption'] as const
type Tab = typeof TABS[number]

export default function InventoryPage() {
  const {
    state, savePart, savePO, placeOrder, addReceipt, addIssue,
    addReorder, receiveReorder, addTransfer,
  } = useInventory()
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
    id: uid('po'),
    number: `PO-${TODAY.slice(0, 4)}-${String(state.pos.length + 1).padStart(3, '0')}`,
    supplier: state.suppliers[0]?.name ?? '',
    project: PROJECTS.find(isLiveProject) ?? PROJECTS[0],
    status: 'draft', createdDate: TODAY,
    lines: [], receipts: [], reorders: [], issues: [], transfers: [],
  })

  /* One issue can span several orders, because the shelf does not care which
   * order a part came in on. It is split back out per order so each one keeps
   * its own history. */
  const issueFromStore = (
    date: string, project: string, rig: string, by: string,
    picks: { poId: string; itemId: string; qty: number }[],
  ) => {
    const byPO: Record<string, { itemId: string; qty: number }[]> = {}
    picks.forEach(p => { (byPO[p.poId] ??= []).push({ itemId: p.itemId, qty: p.qty }) })
    Object.entries(byPO).forEach(([poId, lines]) =>
      addIssue(poId, { date, project, rig, issuedBy: by, lines }))
  }

  /* The month the alerts are built from is the last month the rigs actually
   * worked, not whatever the Consumption tab happens to be showing — otherwise
   * paging back through the year silently changes what needs attention. */
  const burnMonth = useMemo(() => {
    const months = cost.shiftLogs.filter(l => l.metresDrilled > 0).map(l => monthOf(l.date)).sort()
    return months[months.length - 1] ?? monthOf(TODAY)
  }, [cost.shiftLogs])

  /* How fast each rig is burning through ground, from the driller's log.
   * Feeding real consumption into the reorder maths is what turns "you have
   * three bits" into "you run out on Thursday". */
  const burn = useMemo(() => RIGS.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && monthOf(l.date) === burnMonth && l.metresDrilled > 0)
    if (!shifts.length) return null
    const days = new Set(shifts.map(s => s.date)).size
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
    const counts: Record<string, number> = {}
    shifts.forEach(s => { const f = normFormation(s.formationType); counts[f] = (counts[f] ?? 0) + s.metresDrilled })
    const formation = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hard') as Formation
    return { rig, metresPerDay: Math.round((metres / days) * 10) / 10, formation }
  }).filter(Boolean) as { rig: string; metresPerDay: number; formation: Formation }[], [cost.shiftLogs, burnMonth])

  const alerts = useMemo(
    () => buildAlerts(state.pos, state.catalogue, TODAY, COMPLETED_PROJECTS, burn, state.alerts),
    [state.pos, state.catalogue, state.alerts, burn])

  const urgent = alerts.filter(a => a.level === 'urgent').length
  const [month, setMonth] = useState(burnMonth)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20, paddingBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Parts &amp; inventory</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 700, lineHeight: 1.6 }}>
            What a part costs to run, what is on the shelf, and where it went. Parts are ordered, received into the store,
            and issued from there to a project and a rig. Finance charges parts from this catalogue, so the two modules
            can never disagree.
          </p>
        </div>
        {alerts.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 9,
            background: urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: urgent ? C.red : C.amber }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: urgent ? C.red : C.amber }}>
              {alerts.length} need{alerts.length === 1 ? 's' : ''} attention
            </span>
          </div>
        )}
      </div>

      <AlertsPanel alerts={alerts} />

      <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            border: 'none', fontFamily: 'inherit',
            background: tab === t ? C.orange : 'transparent', color: tab === t ? '#fff' : C.muted,
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Catalogue' && <CatalogueTab onEdit={setEditPart} onImport={() => setImporting(true)} />}
      {tab === 'Orders' && (
        <OrdersTab
          onReceive={setReceiving}
          onCreate={() => setEditPO(blankPO())}
          onEdit={setEditPO}
          onRaiseReorder={setRaising}
          onReceiveReorder={(po, reorder) => setReplacing({ po, reorder })} />
      )}
      {tab === 'Store' && <StoreTab onIssue={(project, line) => setIssuing({ project, line })} onMove={setMoving} />}
      {tab === 'Consumption' && <ConsumptionTab month={month} onMonth={setMonth} />}

      {editPart && <PartModal part={editPart} onSave={savePart} onClose={() => setEditPart(null)} />}
      {importing && <ImportModal onClose={() => setImporting(false)} />}
      {editPO && <POModal po={editPO} onSave={savePO} onPlace={placeOrder} onClose={() => setEditPO(null)} />}
      {receiving && (
        <ReceiveModal po={receiving} onClose={() => setReceiving(null)}
          onSave={(date, lines, delayReason, note) => addReceipt(receiving.id, { date, lines, delayReason, note })} />
      )}
      {raising && (
        <RaiseReorderModal po={raising} onClose={() => setRaising(null)}
          onSave={r => addReorder(raising.id, r)} />
      )}
      {replacing && (
        <ReceiveReorderModal po={replacing.po} reorder={replacing.reorder} onClose={() => setReplacing(null)}
          onSave={receipt => receiveReorder(replacing.po.id, replacing.reorder.id, receipt)} />
      )}
      {issuing && (
        <IssueModal project={issuing.project} prefill={issuing.line}
          onSave={issueFromStore} onClose={() => setIssuing(null)} />
      )}
      {moving && <MoveModal line={moving} onSave={addTransfer} onClose={() => setMoving(null)} />}
    </div>
  )
}
