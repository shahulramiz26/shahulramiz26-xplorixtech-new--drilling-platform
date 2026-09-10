'use client'

import { useState, useMemo, Fragment, ReactNode } from 'react'
import {
  useInventory, FORMATIONS, CATEGORIES, costPerMetre, toolingPerMetre, normFormation,
  poValue, poStatus, poReceivedValue, poStoreValue, poIssuedValue,
  qtyReceived, qtyIssued, qtyInStore, qtyAwaitingDelivery,
  stockInStore, onOrder, consumption, consumptionValue, buildAlerts,
  supplierPerformance, daysBetween, projectCode,
  money, moneyL, perMetre, dayLabel, fullDate, monthLabel,
  COMPLETED_PROJECTS, RIGS,
  type ToolingItem, type PurchaseOrder, type Formation, type Alert,
  type AlertLevel, type ToolCategory,
} from '../../../lib/inventory-store'
import { useCosting, monthOf } from '../../../lib/costing-store'

/* ==========================================================================
 * XPLORIX INVENTORY
 *
 * Four views over one idea: a consumable costs what it costs per metre, and
 * that depends on the ground.
 *
 *   Catalogue     rate and life per formation -> cost per metre
 *   Orders        placed, promised, received, issued
 *   Store         what is sitting still, and what is about to run out
 *   Consumption   what rigs actually took, expected against actual
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
const th: React.CSSProperties = {
  padding: '7px 12px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)',
}
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '7px 12px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }
const tdN: React.CSSProperties = { ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const rowBorder = '1px solid rgba(30,41,59,0.5)'

const TODAY = '2026-09-09'

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
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{hint}</div>}
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

/* ==========================================================================
 * ALERTS
 * ========================================================================== */

const LEVEL_TONE: Record<AlertLevel, string> = { urgent: C.red, warn: C.amber, info: C.blue }

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [open, setOpen] = useState(true)
  if (alerts.length === 0) {
    return <Card><Empty>Nothing needs attention. No stock sitting idle, no late deliveries, nothing about to run out.</Empty></Card>
  }
  const urgent = alerts.filter(a => a.level === 'urgent').length
  const shown = open ? alerts : alerts.slice(0, 4)

  return (
    <Card title="Needs attention"
      subtitle={`${alerts.length} item${alerts.length === 1 ? '' : 's'}${urgent ? ` · ${urgent} urgent` : ''}`}
      pad={false} accent={urgent ? C.red : C.amber}
      right={alerts.length > 4 ? <Btn size="sm" onClick={() => setOpen(o => !o)}>{open ? 'Show fewer' : `Show all ${alerts.length}`}</Btn> : undefined}>
      <div>
        {shown.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderBottom: rowBorder, alignItems: 'flex-start' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: LEVEL_TONE[a.level], marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 3, lineHeight: 1.55 }}>{a.detail}</div>
            </div>
            {a.value != null && (
              <span style={{ fontSize: 12, fontWeight: 700, color: LEVEL_TONE[a.level], fontFamily: 'ui-monospace, monospace' }}>{money(a.value)}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ==========================================================================
 * CATALOGUE
 * ========================================================================== */

function CatalogueTab({ onEdit }: { onEdit: (i: ToolingItem) => void }) {
  const { state } = useInventory()
  const [cat, setCat] = useState<ToolCategory | 'All'>('All')
  const items = state.catalogue.filter(i => cat === 'All' || i.category === cat)
  const totals = FORMATIONS.map(f => toolingPerMetre(state.catalogue, f))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        Cost per metre is rate divided by life. Life is held per formation, because the same bit that runs 220 m through
        soft rock will not see 60 m in very hard — so a metre of hard ground genuinely costs more in tooling than a metre
        of soft, and the driller&apos;s log already says which is which.
      </Note>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        {FORMATIONS.map((f, i) => (
          <Stat key={f} label={`${f} ground`} value={perMetre(totals[i])} note="whole catalogue, per metre"
            color={i === 0 ? C.green : i === 1 ? C.teal : i === 2 ? C.amber : C.red} big />
        ))}
      </div>

      <Card title="Tooling catalogue" pad={false}
        subtitle="Rate and expected life per formation. Edit any figure — these are starting points, not claims."
        right={
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['All', ...CATEGORIES] as const).map(c => (
              <button key={c} onClick={() => setCat(c as ToolCategory | 'All')} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                background: cat === c ? C.orange : 'rgba(255,255,255,0.03)',
                border: `1px solid ${cat === c ? 'transparent' : C.border}`, color: cat === c ? '#fff' : C.faint,
              }}>{c}</button>
            ))}
          </div>
        }>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Item</th><th style={th}>Category</th><th style={thR}>Rate</th>
                <th style={thR} colSpan={4}>Life in metres</th>
                <th style={thR} colSpan={4}>Cost per metre</th>
                <th style={th}>Supplier</th><th style={thR}>Lead</th><th style={th} />
              </tr>
              <tr>
                <th style={th} /><th style={th} /><th style={th} />
                {FORMATIONS.map(f => <th key={`l${f}`} style={{ ...thR, fontSize: 9 }}>{f}</th>)}
                {FORMATIONS.map(f => <th key={`c${f}`} style={{ ...thR, fontSize: 9 }}>{f}</th>)}
                <th style={th} /><th style={th} /><th style={th} />
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} style={{ borderBottom: rowBorder, opacity: i.active ? 1 : 0.45 }}>
                  <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 240 }}>{i.name}</td>
                  <td style={td}><Tag tone={C.dim}>{i.category}</Tag></td>
                  <td style={tdN}>{money(i.rate)}</td>
                  {FORMATIONS.map(f => <td key={`l${f}`} style={{ ...tdN, color: C.faint }}>{i.life[f].toLocaleString('en-IN')}</td>)}
                  {FORMATIONS.map(f => (
                    <td key={`c${f}`} style={{ ...tdN, color: f === 'Very Hard' ? C.red : f === 'Hard' ? C.amber : C.muted }}>
                      {costPerMetre(i, f).toFixed(2)}
                    </td>
                  ))}
                  <td style={td}>{i.supplier}</td>
                  <td style={tdN}>{i.leadTimeDays}d</td>
                  <td style={{ ...td, textAlign: 'right' }}><Btn size="sm" onClick={() => onEdit(i)}>Edit</Btn></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>{items.length} items</td>
                <td style={tdN} colSpan={4} />
                {FORMATIONS.map((f, k) => (
                  <td key={f} style={{ ...tdN, fontWeight: 900, color: k === 3 ? C.red : k === 2 ? C.amber : C.text }}>
                    {toolingPerMetre(items, f).toFixed(2)}
                  </td>
                ))}
                <td style={td} colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ItemModal({ item, onSave, onClose }: { item: ToolingItem; onSave: (i: ToolingItem) => void; onClose: () => void }) {
  const { state } = useInventory()
  const [f, setF] = useState<ToolingItem>(item)
  const u = (p: Partial<ToolingItem>) => setF(x => ({ ...x, ...p }))

  return (
    <Modal title={f.name || 'New item'} subtitle="Life drives cost per metre, so it is the figure worth getting right" width={720} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" onClick={() => { onSave(f); onClose() }}>Save item</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Grid cols={2}>
          <Field label="Name"><input value={f.name} onChange={e => u({ name: e.target.value })} style={iStyle} /></Field>
          <Field label="Category">
            <select value={f.category} onChange={e => u({ category: e.target.value as ToolCategory })} style={{ ...iStyle, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Grid>
        <Grid cols={4}>
          <Field label="Rate">
            <input type="number" value={f.rate} onChange={e => u({ rate: parseFloat(e.target.value) || 0 })}
              style={{ ...iStyle, color: C.orange, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }} />
          </Field>
          <Field label="Supplier">
            <select value={f.supplier} onChange={e => u({ supplier: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
              {state.suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Lead time" hint="days">
            <input type="number" value={f.leadTimeDays} onChange={e => u({ leadTimeDays: parseFloat(e.target.value) || 0 })}
              style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
          </Field>
          <Field label="Minimum stock" hint="units">
            <input type="number" value={f.minStock} onChange={e => u({ minStock: parseFloat(e.target.value) || 0 })}
              style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
          </Field>
        </Grid>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Expected life by formation</div>
          <div style={{ fontSize: 11, color: C.faint, marginBottom: 12, lineHeight: 1.55 }}>
            Metres before replacement. Cost per metre follows directly, so a shorter life in hard ground is what makes a
            hard-rock metre cost more than a soft one.
          </div>
          <Grid cols={4}>
            {FORMATIONS.map(fo => (
              <Field key={fo} label={fo}>
                <input type="number" value={f.life[fo]}
                  onChange={e => u({ life: { ...f.life, [fo]: parseFloat(e.target.value) || 0 } })}
                  style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
                <div style={{ fontSize: 11, color: C.orange, marginTop: 5, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                  {perMetre(costPerMetre(f, fo))}
                </div>
              </Field>
            ))}
          </Grid>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.active} onChange={e => u({ active: e.target.checked })} />
          <span style={{ fontSize: 12.5, color: C.text }}>In use</span>
          <span style={{ fontSize: 11, color: C.faint }}>— unticked items are excluded from cost per metre</span>
        </label>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * ORDERS
 * ========================================================================== */

const PO_TONE: Record<string, string> = { draft: C.faint, ordered: C.blue, partial: C.amber, received: C.green }

function OrdersTab({ onReceive, onIssue }: {
  onReceive: (po: PurchaseOrder) => void; onIssue: (po: PurchaseOrder) => void
}) {
  const { state } = useInventory()
  const [open, setOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'draft' | 'ordered' | 'partial' | 'received'>('all')
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id

  const pos = state.pos.filter(p => filter === 'all' || poStatus(p) === filter)
    .sort((a, b) => (b.orderedDate ?? b.createdDate).localeCompare(a.orderedDate ?? a.createdDate))

  const t = state.pos.reduce((a, p) => ({
    ordered: a.ordered + (p.status === 'draft' ? 0 : poValue(p)),
    received: a.received + poReceivedValue(p),
    store: a.store + poStoreValue(p),
    issued: a.issued + poIssuedValue(p),
  }), { ordered: 0, received: 0, store: 0, issued: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={4}>
        <Stat label="On order" value={moneyL(t.ordered - t.received)} note="placed, not yet delivered" color={C.blue} />
        <Stat label="Received" value={moneyL(t.received)} note="arrived into the store" />
        <Stat label="In store" value={moneyL(t.store)} note="not yet on a rig" color={C.amber} />
        <Stat label="Consumed" value={moneyL(t.issued)} note="issued to a rig" color={C.green} />
      </Grid>

      <Card title="Purchase orders" pad={false}
        subtitle="Promised against actual delivery is what makes supplier lead time measurable"
        right={
          <div style={{ display: 'flex', gap: 5 }}>
            {(['all', 'draft', 'ordered', 'partial', 'received'] as const).map(k => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                textTransform: 'capitalize', fontFamily: 'inherit',
                background: filter === k ? C.orange : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === k ? 'transparent' : C.border}`, color: filter === k ? '#fff' : C.faint,
              }}>{k}</button>
            ))}
          </div>
        }>
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
              {pos.map(po => {
                const st = poStatus(po)
                const isOpen = open === po.id
                const lastReceipt = po.receipts.map(r => r.date).sort().pop()
                const delay = lastReceipt && po.promisedDate ? daysBetween(po.promisedDate, lastReceipt) : null
                return (
                  <Fragment key={po.id}>
                    <tr onClick={() => setOpen(isOpen ? null : po.id)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>{po.number}</td>
                      <td style={td}>{po.supplier}</td>
                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{projectCode(po.project)}</td>
                      <td style={td}><Tag tone={PO_TONE[st]}>{st}</Tag></td>
                      <td style={td}>{po.orderedDate ? dayLabel(po.orderedDate) : '—'}</td>
                      <td style={td}>{po.promisedDate ? dayLabel(po.promisedDate) : '—'}</td>
                      <td style={td}>{lastReceipt ? dayLabel(lastReceipt) : '—'}</td>
                      <td style={{ ...tdN, color: delay == null ? C.dim : delay > 0 ? C.red : C.green, fontWeight: 700 }}>
                        {delay == null ? '—' : delay > 0 ? `+${delay}d` : `${delay}d`}
                      </td>
                      <td style={tdN}>{money(poValue(po))}</td>
                      <td style={{ ...tdN, color: poStoreValue(po) > 0 ? C.amber : C.dim }}>{poStoreValue(po) > 0 ? money(poStoreValue(po)) : '—'}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {st !== 'draft' && st !== 'received' && <Btn size="sm" onClick={() => onReceive(po)}>Receive</Btn>}
                          {poStoreValue(po) > 0 && <Btn size="sm" tone="primary" onClick={() => onIssue(po)}>Issue</Btn>}
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
                            <div>
                              <SubHead tone={C.orange}>Lines</SubHead>
                              <table style={tableStyle}>
                                <thead><tr><th style={th}>Item</th><th style={thR}>Ordered</th><th style={thR}>Received</th><th style={thR}>Issued</th><th style={thR}>In store</th><th style={thR}>Value</th></tr></thead>
                                <tbody>
                                  {po.lines.map(l => (
                                    <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                                      <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                                      <td style={tdN}>{l.qty}</td>
                                      <td style={tdN}>{qtyReceived(po, l.itemId)}</td>
                                      <td style={{ ...tdN, color: C.green }}>{qtyIssued(po, l.itemId)}</td>
                                      <td style={{ ...tdN, color: qtyInStore(po, l.itemId) > 0 ? C.amber : C.dim }}>{qtyInStore(po, l.itemId)}</td>
                                      <td style={tdN}>{money(l.qty * l.rate)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div>
                              <SubHead tone={C.blue}>History</SubHead>
                              {po.receipts.length === 0 && po.issues.length === 0
                                ? <Empty>Nothing received or issued yet.</Empty>
                                : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {po.receipts.map(r => (
                                      <div key={r.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                                        <Tag tone={C.blue}>received</Tag>{' '}
                                        <span style={{ color: C.text }}>{fullDate(r.date)}</span>
                                        {' — '}{r.lines.map(l => `${l.qty} × ${nameOf(l.itemId)}`).join(', ')}
                                      </div>
                                    ))}
                                    {po.issues.map(i => (
                                      <div key={i.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                                        <Tag tone={C.green}>issued</Tag>{' '}
                                        <span style={{ color: C.text }}>{fullDate(i.date)}</span>
                                        {' → '}<span style={{ fontFamily: 'ui-monospace, monospace' }}>{i.rig}</span>
                                        {' — '}{i.lines.map(l => `${l.qty} × ${nameOf(l.itemId)}`).join(', ')}
                                      </div>
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

      <SupplierTable />
    </div>
  )
}

function SubHead({ children, tone }: { children: ReactNode; tone: string }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{children}</div>
}

function SupplierTable() {
  const { state } = useInventory()
  const rows = state.suppliers.map(s => supplierPerformance(state.pos, state.suppliers, s.name))
    .filter(r => r.orders > 0)
    .sort((a, b) => (a.avgDelay ?? 99) - (b.avgDelay ?? 99))

  return (
    <Card title="Suppliers" pad={false} subtitle="Lead time measured from what actually happened, not from a rating">
      <table style={tableStyle}>
        <thead>
          <tr><th style={th}>Supplier</th><th style={thR}>Orders</th><th style={thR}>Value</th>
            <th style={thR}>Quoted lead</th><th style={thR}>Actual lead</th><th style={thR}>Average delay</th><th style={thR}>On time</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.supplier} style={{ borderBottom: rowBorder }}>
              <td style={{ ...td, color: C.text, fontWeight: 700 }}>{r.supplier}</td>
              <td style={tdN}>{r.orders}</td>
              <td style={tdN}>{money(r.value)}</td>
              <td style={{ ...tdN, color: C.faint }}>{r.quotedLead != null ? `${r.quotedLead}d` : '—'}</td>
              <td style={tdN}>{r.actualLead != null ? `${Math.round(r.actualLead)}d` : '—'}</td>
              <td style={{ ...tdN, fontWeight: 700, color: r.avgDelay == null ? C.dim : r.avgDelay > 0 ? C.red : C.green }}>
                {r.avgDelay == null ? '—' : r.avgDelay > 0 ? `+${Math.round(r.avgDelay)}d late` : `${Math.round(Math.abs(r.avgDelay))}d early`}
              </td>
              <td style={{ ...tdN, color: r.onTimePct == null ? C.dim : r.onTimePct >= 80 ? C.green : r.onTimePct >= 50 ? C.amber : C.red }}>
                {r.onTimePct == null ? '—' : `${Math.round(r.onTimePct)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

/* ==========================================================================
 * STORE
 * ========================================================================== */

function StoreTab() {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const stock = stockInStore(state.pos, TODAY)
  const pending = onOrder(state.pos, TODAY)
  const stockValue = stock.reduce((s, l) => s + l.value, 0)
  const idle = stock.filter(l => l.ageDays >= state.alerts.idleDays)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={3}>
        <Stat label="In store" value={moneyL(stockValue)} note={`${stock.length} lines across ${new Set(stock.map(s => s.itemId)).size} items`} color={C.amber} big />
        <Stat label="Sitting over 30 days" value={moneyL(idle.reduce((s, l) => s + l.value, 0))} note={`${idle.length} lines`} color={idle.length ? C.red : C.dim} big />
        <Stat label="On order" value={moneyL(pending.reduce((s, l) => s + l.value, 0))} note={`${pending.filter(p => (p.overdueDays ?? 0) > 0).length} overdue`} color={C.blue} big />
      </Grid>

      <Card title="Sitting in the store" pad={false} subtitle="Received but not yet issued to a rig — money standing still">
        {stock.length === 0 ? <Empty>Nothing in store. Everything received has gone out to a rig.</Empty> : (
          <table style={tableStyle}>
            <thead><tr><th style={th}>Item</th><th style={th}>Project</th><th style={th}>On order</th><th style={thR}>Qty</th><th style={thR}>Age</th><th style={thR}>Value</th></tr></thead>
            <tbody>
              {stock.map((l, k) => {
                const old = l.ageDays >= state.alerts.idleDays
                const stranded = COMPLETED_PROJECTS.includes(l.project)
                return (
                  <tr key={k} style={{ borderBottom: rowBorder, background: stranded ? 'rgba(239,68,68,0.05)' : old ? 'rgba(245,158,11,0.04)' : undefined }}>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>
                      {projectCode(l.project)}
                      {stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>closed</Tag></span>}
                    </td>
                    <td style={td}>{l.poNumber}</td>
                    <td style={tdN}>{l.qty}</td>
                    <td style={{ ...tdN, color: old ? C.amber : C.faint, fontWeight: old ? 700 : 400 }}>{l.ageDays}d</td>
                    <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(l.value)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={5}>Total in store</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(stockValue)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </Card>

      <Card title="On order" pad={false} subtitle="Placed but not yet delivered">
        {pending.length === 0 ? <Empty>Nothing outstanding.</Empty> : (
          <table style={tableStyle}>
            <thead><tr><th style={th}>Item</th><th style={th}>Order</th><th style={th}>Supplier</th><th style={th}>Promised</th><th style={thR}>Qty</th><th style={thR}>Value</th><th style={thR}>Status</th></tr></thead>
            <tbody>
              {pending.map((l, k) => (
                <tr key={k} style={{ borderBottom: rowBorder, background: (l.overdueDays ?? 0) > 0 ? 'rgba(239,68,68,0.05)' : undefined }}>
                  <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                  <td style={td}>{l.poNumber}</td>
                  <td style={td}>{l.supplier}</td>
                  <td style={td}>{l.promisedDate ? dayLabel(l.promisedDate) : '—'}</td>
                  <td style={tdN}>{l.qty}</td>
                  <td style={tdN}>{money(l.value)}</td>
                  <td style={{ ...tdN, color: (l.overdueDays ?? 0) > 0 ? C.red : C.blue, fontWeight: 700 }}>
                    {(l.overdueDays ?? 0) > 0 ? `${l.overdueDays}d late` : 'awaiting'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

/* ==========================================================================
 * CONSUMPTION — expected against actual
 * ========================================================================== */

function ConsumptionTab({ month }: { month: string }) {
  const { state } = useInventory()
  const { state: cost } = useCosting()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id

  /* Expected comes from the catalogue and the metres the driller logged.
   * Actual comes from what the store issued. The gap is the point. */
  const byRig = useMemo(() => RIGS.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && monthOf(l.date) === month)
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
    const expected = shifts.reduce((s, l) =>
      s + l.metresDrilled * toolingPerMetre(state.catalogue, normFormation(l.formationType)), 0)
    const actual = consumptionValue(state.pos, { rig, month })
    const byFormation = FORMATIONS.map(f => {
      const m = shifts.filter(l => normFormation(l.formationType) === f).reduce((s, l) => s + l.metresDrilled, 0)
      return { formation: f, metres: m, cost: m * toolingPerMetre(state.catalogue, f) }
    }).filter(x => x.metres > 0)
    return { rig, metres, expected, actual, byFormation }
  }).filter(r => r.metres > 0 || r.actual > 0), [state.catalogue, state.pos, cost.shiftLogs, month])

  const totals = byRig.reduce((a, r) => ({
    metres: a.metres + r.metres, expected: a.expected + r.expected, actual: a.actual + r.actual,
  }), { metres: 0, expected: 0, actual: 0 })

  const issues = consumption(state.pos, { month })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        <strong style={{ color: C.text }}>Expected</strong> is the catalogue rate divided by expected life, applied to the metres
        the driller logged — this is the figure Finance charges and the one you tender on.{' '}
        <strong style={{ color: C.text }}>Actual</strong> is what the store issued in the same month. When actual runs above
        expected, something is wearing faster than the catalogue assumes and the next quote is already wrong.
      </Note>

      <Grid cols={4}>
        <Stat label="Metres drilled" value={`${totals.metres} m`} note={monthLabel(month)} big />
        <Stat label="Expected tooling" value={moneyL(totals.expected)}
          note={totals.metres ? perMetre(totals.expected / totals.metres) : '—'} color={C.blue} big />
        <Stat label="Actually issued" value={moneyL(totals.actual)}
          note={totals.metres ? perMetre(totals.actual / totals.metres) : '—'} color={C.amber} big />
        <Stat label="Difference" value={moneyL(totals.actual - totals.expected)}
          note={totals.actual > totals.expected ? 'issuing more than the catalogue assumes' : 'issuing less than assumed'}
          color={totals.actual > totals.expected ? C.red : C.green} big />
      </Grid>

      <Card title="By rig" pad={false} subtitle="Metres from the driller's log, priced by the ground they were drilled through">
        <table style={tableStyle}>
          <thead>
            <tr><th style={th}>Rig</th><th style={th}>Ground drilled</th><th style={thR}>Metres</th>
              <th style={thR}>Expected</th><th style={thR}>Per metre</th><th style={thR}>Actually issued</th><th style={thR}>Difference</th></tr>
          </thead>
          <tbody>
            {byRig.map(r => (
              <tr key={r.rig} style={{ borderBottom: rowBorder }}>
                <td style={{ ...td, color: C.text, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{r.rig}</td>
                <td style={{ ...td, whiteSpace: 'normal', maxWidth: 320, color: C.faint }}>
                  {r.byFormation.map(b => `${b.metres} m ${b.formation.toLowerCase()}`).join(' · ') || '—'}
                </td>
                <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{r.metres}</td>
                <td style={{ ...tdN, color: C.blue }}>{money(r.expected)}</td>
                <td style={{ ...tdN, color: C.blue }}>{r.metres ? perMetre(r.expected / r.metres) : '—'}</td>
                <td style={{ ...tdN, color: C.amber }}>{money(r.actual)}</td>
                <td style={{ ...tdN, fontWeight: 700, color: r.actual > r.expected ? C.red : C.green }}>
                  {money(r.actual - r.expected)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Issued this month" pad={false} subtitle="Every item that left the store">
        {issues.length === 0 ? <Empty>Nothing issued in {monthLabel(month)}.</Empty> : (
          <table style={tableStyle}>
            <thead><tr><th style={th}>Date</th><th style={th}>Rig</th><th style={th}>Item</th><th style={th}>Order</th><th style={thR}>Qty</th><th style={thR}>Value</th></tr></thead>
            <tbody>
              {issues.map((c, k) => (
                <tr key={k} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text }}>{dayLabel(c.date)}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{c.rig}</td>
                  <td style={{ ...td, whiteSpace: 'normal' }}>{nameOf(c.itemId)}</td>
                  <td style={td}>{c.poNumber}</td>
                  <td style={tdN}>{c.qty}</td>
                  <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(c.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

/* ==========================================================================
 * RECEIVE / ISSUE
 * ========================================================================== */

function ReceiveModal({ po, onSave, onClose }: {
  po: PurchaseOrder; onSave: (date: string, lines: { itemId: string; qty: number }[], note: string) => void; onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(po.lines.map(l => [l.itemId, qtyAwaitingDelivery(po, l.itemId)])))

  const lines = po.lines.map(l => ({ itemId: l.itemId, qty: qty[l.itemId] ?? 0 })).filter(l => l.qty > 0)
  const value = lines.reduce((s, l) => s + l.qty * (po.lines.find(x => x.itemId === l.itemId)?.rate ?? 0), 0)
  const delay = po.promisedDate ? daysBetween(po.promisedDate, date) : null

  return (
    <Modal title={`Receive against ${po.number}`} subtitle={`${po.supplier} · ${projectCode(po.project)}`} width={680} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={lines.length === 0} onClick={() => { onSave(date, lines, note); onClose() }}>Record receipt</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Note tone={C.dim}>
          Receipts are partial and dated. Stock that arrived last week takes last week&apos;s date, not today&apos;s — otherwise
          supplier lead time measures when someone got round to the paperwork.
        </Note>

        <Grid cols={2}>
          <Field label="Delivered on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        </Grid>

        {delay != null && (
          <Note tone={delay > 0 ? C.red : C.green}>
            {po.promisedDate && `Promised ${fullDate(po.promisedDate)}. `}
            {delay > 0 ? `${delay} days late.` : delay === 0 ? 'On time.' : `${Math.abs(delay)} days early.`}
            {' '}This feeds the supplier&apos;s measured lead time.
          </Note>
        )}

        <table style={tableStyle}>
          <thead><tr><th style={th}>Item</th><th style={thR}>Ordered</th><th style={thR}>Already in</th><th style={thR}>Outstanding</th><th style={thR}>Receiving now</th></tr></thead>
          <tbody>
            {po.lines.map(l => {
              const out = qtyAwaitingDelivery(po, l.itemId)
              return (
                <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                  <td style={tdN}>{l.qty}</td>
                  <td style={tdN}>{qtyReceived(po, l.itemId)}</td>
                  <td style={{ ...tdN, color: out > 0 ? C.amber : C.dim }}>{out}</td>
                  <td style={{ padding: '5px 10px', width: 110 }}>
                    <input type="number" min={0} max={out} value={qty[l.itemId] ?? 0}
                      onChange={e => setQty(q => ({ ...q, [l.itemId]: Math.min(out, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                      style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'baseline' }}>
          <span style={{ fontSize: 11, color: C.faint }}>Receiving</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: C.blue, fontFamily: 'ui-monospace, monospace' }}>{money(value)}</span>
        </div>
      </div>
    </Modal>
  )
}

function IssueModal({ po, onSave, onClose }: {
  po: PurchaseOrder; onSave: (date: string, rig: string, by: string, lines: { itemId: string; qty: number }[]) => void; onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const [date, setDate] = useState(TODAY)
  const [rig, setRig] = useState(RIGS[0])
  const [by, setBy] = useState('Store')
  const [qty, setQty] = useState<Record<string, number>>({})

  const lines = po.lines.map(l => ({ itemId: l.itemId, qty: qty[l.itemId] ?? 0 })).filter(l => l.qty > 0)
  const value = lines.reduce((s, l) => s + l.qty * (po.lines.find(x => x.itemId === l.itemId)?.rate ?? 0), 0)

  return (
    <Modal title={`Issue from ${po.number}`} subtitle={`${projectCode(po.project)} · pick the rig receiving it`} width={680} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={lines.length === 0} onClick={() => { onSave(date, rig, by, lines); onClose() }}>Issue to {rig}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={3}>
          <Field label="Issued on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="To rig">
            <select value={rig} onChange={e => setRig(e.target.value)} style={{ ...iStyle, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
              {RIGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Issued by"><input value={by} onChange={e => setBy(e.target.value)} style={iStyle} /></Field>
        </Grid>

        <table style={tableStyle}>
          <thead><tr><th style={th}>Item</th><th style={thR}>In store</th><th style={thR}>Issuing</th></tr></thead>
          <tbody>
            {po.lines.map(l => {
              const have = qtyInStore(po, l.itemId)
              return (
                <tr key={l.itemId} style={{ borderBottom: rowBorder, opacity: have > 0 ? 1 : 0.4 }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                  <td style={{ ...tdN, color: have > 0 ? C.amber : C.dim }}>{have}</td>
                  <td style={{ padding: '5px 10px', width: 110 }}>
                    <input type="number" min={0} max={have} disabled={have === 0} value={qty[l.itemId] ?? 0}
                      onChange={e => setQty(q => ({ ...q, [l.itemId]: Math.min(have, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                      style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <Note tone={C.blue}>
          {money(value)} leaves the store for {rig}. Finance charges tooling by metre from the catalogue, not on the day it
          was issued, so this does not spike that day&apos;s cost per metre — it shows up in the expected-against-actual
          comparison instead.
        </Note>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * SCREEN
 * ========================================================================== */

const TABS = ['Catalogue', 'Orders', 'Store', 'Consumption'] as const
type Tab = typeof TABS[number]

export default function InventoryPage() {
  const { state, saveItem, addReceipt, addIssue } = useInventory()
  const { state: cost } = useCosting()
  const [tab, setTab] = useState<Tab>('Catalogue')
  const [editItem, setEditItem] = useState<ToolingItem | null>(null)
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null)
  const [issuing, setIssuing] = useState<PurchaseOrder | null>(null)

  const month = '2026-08'

  /* How fast each rig is burning through ground, taken from the driller's log.
   * Feeding real consumption into the reorder maths is what turns "you have 3
   * bits" into "you run out on Thursday". */
  const burn = useMemo(() => RIGS.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && monthOf(l.date) === month && l.metresDrilled > 0)
    if (!shifts.length) return null
    const dates = new Set(shifts.map(s => s.date))
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
    const counts: Record<string, number> = {}
    shifts.forEach(s => { const f = normFormation(s.formationType); counts[f] = (counts[f] ?? 0) + s.metresDrilled })
    const formation = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hard') as Formation
    return { rig, metresPerDay: Math.round((metres / dates.size) * 10) / 10, formation }
  }).filter(Boolean) as { rig: string; metresPerDay: number; formation: Formation }[], [cost.shiftLogs])

  const alerts = useMemo(
    () => buildAlerts(state.pos, state.catalogue, TODAY, COMPLETED_PROJECTS, burn, state.alerts),
    [state.pos, state.catalogue, state.alerts, burn])

  const urgent = alerts.filter(a => a.level === 'urgent').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20, paddingBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Inventory</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 680, lineHeight: 1.6 }}>
            What tooling costs per metre, what it costs in each formation, and what is sitting in the store doing nothing.
            Finance charges tooling from this catalogue, so the two modules can never disagree.
          </p>
        </div>
        {alerts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 9,
            background: urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            border: `1px solid ${urgent ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
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

      {tab === 'Catalogue' && <CatalogueTab onEdit={setEditItem} />}
      {tab === 'Orders' && <OrdersTab onReceive={setReceiving} onIssue={setIssuing} />}
      {tab === 'Store' && <StoreTab />}
      {tab === 'Consumption' && <ConsumptionTab month={month} />}

      {editItem && <ItemModal item={editItem} onSave={saveItem} onClose={() => setEditItem(null)} />}
      {receiving && (
        <ReceiveModal po={receiving} onClose={() => setReceiving(null)}
          onSave={(date, lines, note) => addReceipt(receiving.id, { date, lines, note })} />
      )}
      {issuing && (
        <IssueModal po={issuing} onClose={() => setIssuing(null)}
          onSave={(date, rig, issuedBy, lines) => addIssue(issuing.id, { date, rig, issuedBy, lines })} />
      )}
    </div>
  )
}
