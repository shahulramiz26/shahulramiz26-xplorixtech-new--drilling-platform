'use client'

import { useState, useMemo, Fragment, ReactNode } from 'react'
import {
  useInventory, FORMATIONS, CATEGORIES, costPerMetre, toolingPerMetre, normFormation,
  poValue, poStatus, poReceivedValue, poStoreValue, poIssuedValue, poDamagedValue,
  qtyReceived, qtyIssued, qtyInStore, qtyAwaitingDelivery, qtyDamaged,
  openReturns, RETURN_STATUS_LABEL, DELAY_REASONS,
  stockInStore, onOrder, consumptionValue, buildAlerts,
  supplierPerformance, daysBetween, projectCode,
  money, moneyL, perMetre, dayLabel, fullDate, monthLabel, uid,
  COMPLETED_PROJECTS, RIGS, PROJECTS,
  type ToolingItem, type PurchaseOrder, type Formation, type Alert,
  type AlertLevel, type AlertKind, type ToolCategory, type ReturnRecord, type ReturnStatus,
  type DelayReason, type Supplier, type ReceiptLine, type StockLine, type Transfer,
} from '../../../lib/inventory-store'
import { useCosting, monthOf, shiftMonth } from '../../../lib/costing-store'

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

/* Eighteen alerts is a wall. They also split into two different jobs — money
 * standing still, and something about to run out — which belong to different
 * people, so the panel filters by kind with the count and the value at stake
 * on each chip. */
const KIND_LABEL: Record<AlertKind, string> = {
  reorder: 'Running out',
  overdue: 'Late delivery',
  idle: 'Idle stock',
  stranded: 'Stranded',
  lowStock: 'Low stock',
}
const KIND_ORDER: AlertKind[] = ['reorder', 'overdue', 'idle', 'stranded', 'lowStock']
const KIND_TONE: Record<AlertKind, string> = {
  reorder: C.red, overdue: C.red, idle: C.amber, stranded: C.amber, lowStock: C.blue,
}

function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const [kind, setKind] = useState<AlertKind | 'all'>('all')

  if (alerts.length === 0) {
    return <Card><Empty>Nothing needs attention. No stock sitting idle, no late deliveries, nothing about to run out.</Empty></Card>
  }

  const kinds = KIND_ORDER
    .map(k => {
      const mine = alerts.filter(a => a.kind === k)
      return { kind: k, count: mine.length, value: mine.reduce((s, a) => s + (a.value ?? 0), 0) }
    })
    .filter(x => x.count > 0)

  const shown = kind === 'all' ? alerts : alerts.filter(a => a.kind === kind)
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
        {chip('All', alerts.length, alerts.reduce((s, a) => s + (a.value ?? 0), 0), kind === 'all', C.orange, () => setKind('all'))}
        <span style={{ width: 1, background: C.border, margin: '2px 4px' }} />
        {kinds.map(k => chip(KIND_LABEL[k.kind], k.count, k.value, kind === k.kind, KIND_TONE[k.kind],
          () => setKind(kind === k.kind ? 'all' : k.kind)))}
      </div>

      <div>
        {shown.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderBottom: rowBorder, alignItems: 'flex-start' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: LEVEL_TONE[a.level], marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</span>
                {kind === 'all' && <Tag tone={KIND_TONE[a.kind]}>{KIND_LABEL[a.kind]}</Tag>}
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
            {shown.length} shown{kind !== 'all' ? ` of ${alerts.length}` : ''}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.text, fontFamily: 'ui-monospace, monospace' }}>{money(shownValue)}</span>
        </div>
      )}
    </Card>
  )
}

/* ==========================================================================
 * CATALOGUE
 * ========================================================================== */

function CatalogueTab({ onEdit, onImport }: { onEdit: (i: ToolingItem) => void; onImport: () => void }) {
  const { state, deleteItem } = useInventory()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<ToolCategory | 'All'>('All')
  const [sup, setSup] = useState('All')
  const [showRetired, setShowRetired] = useState(false)

  const items = state.catalogue.filter(i =>
    (showRetired || i.active) &&
    (cat === 'All' || i.category === cat) &&
    (sup === 'All' || i.supplier === sup) &&
    (!q || i.name.toLowerCase().includes(q.toLowerCase())))

  const blank = (): ToolingItem => ({
    id: uid('t'), name: '', category: 'Bit', rate: 0,
    life: { Soft: 0, Medium: 0, Hard: 0, 'Very Hard': 0 },
    supplier: state.suppliers[0]?.name ?? '', leadTimeDays: 14, minStock: 1, active: true,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Note tone={C.dim}>
        Cost per metre is rate divided by life. Life is held per formation, because the same bit that runs 220 m through
        soft rock will not see 60 m in very hard — so a metre of hard ground genuinely costs more in tooling than a metre
        of soft, and the driller&apos;s log already says which is which.
      </Note>

      {/* Filters sit in their own row rather than the card header, where the
          category chips previously read as tabs. */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ width: 230 }}>
          <Field label="Search"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Item name" style={iStyle} /></Field>
        </div>
        <div style={{ width: 160 }}>
          <Field label="Category">
            <select value={cat} onChange={e => setCat(e.target.value as ToolCategory | 'All')} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ width: 190 }}>
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
        {(q || cat !== 'All' || sup !== 'All') && (
          <Btn size="sm" onClick={() => { setQ(''); setCat('All'); setSup('All') }}>Clear</Btn>
        )}
        <Btn size="sm" onClick={onImport}>Import CSV</Btn>
        <Btn size="sm" tone="primary" onClick={() => onEdit(blank())}>Add item</Btn>
      </div>

      <Card title="Tooling catalogue" pad={false}
        subtitle={`${items.length} of ${state.catalogue.length} items · rate and expected life per formation, all editable`}>
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
              {items.length === 0 && (
                <tr><td colSpan={14}><Empty>
                  {state.catalogue.length === 0
                    ? <>No items yet. Add one, or import your existing tooling sheet as CSV.</>
                    : <>Nothing matches those filters.</>}
                </Empty></td></tr>
              )}
              {items.map(i => (
                <tr key={i.id} style={{ borderBottom: rowBorder, opacity: i.active ? 1 : 0.45 }}>
                  <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 240 }}>
                    {i.name}{!i.active && <span style={{ marginLeft: 7 }}><Tag tone={C.dim}>retired</Tag></span>}
                  </td>
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
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Btn size="sm" onClick={() => onEdit(i)}>Edit</Btn>
                      <Btn size="sm" tone="danger" onClick={() => deleteItem(i.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Tooling cost per metre</td>
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

/* Most contractors already keep tooling in a spreadsheet — theirs is where the
 * catalogue came from — so reading that beats typing seventeen forms. A sheet
 * with a single life column is accepted too: terrain multipliers fill in the
 * rest, which is what the seed does. */
function ImportModal({ onClose }: { onClose: () => void }) {
  const { state, importItems } = useInventory()
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  const TEMPLATE = 'name,category,rate,supplier,lead_days,min_stock,life_soft,life_medium,life_hard,life_very_hard\n'
    + 'HQ Impregnated Bit,Bit,22000,Sandvik Mining,18,3,220,150,100,60\n'
    + 'HQ Core Lifter,Accessory,980,Drillco Tools,10,20,44,30,20,12\n'

  const parsed = useMemo(() => {
    if (!text.trim()) return []
    const rows = text.trim().split(/\r?\n/)
    const head = rows[0].split(',').map(h => h.trim().toLowerCase())
    const idx = (n: string) => head.indexOf(n)
    const out: ToolingItem[] = []
    rows.slice(1).forEach(r => {
      const c = r.split(',').map(x => x.trim())
      if (!c[0]) return
      const num = (n: string, d = 0) => { const k = idx(n); return k < 0 ? d : (parseFloat(c[k]) || d) }
      const hard = num('life_hard') || num('life')
      const has = (n: string) => idx(n) >= 0 && c[idx(n)] !== ''
      out.push({
        id: uid('t'),
        name: c[0],
        category: (CATEGORIES.includes(c[idx('category')] as ToolCategory) ? c[idx('category')] : 'Accessory') as ToolCategory,
        rate: num('rate'),
        supplier: idx('supplier') >= 0 ? c[idx('supplier')] : (state.suppliers[0]?.name ?? ''),
        leadTimeDays: num('lead_days', 14),
        minStock: num('min_stock', 1),
        // A sheet with one life column gets the terrain split applied for it.
        life: {
          Soft: has('life_soft') ? num('life_soft') : Math.round(hard * 2.2),
          Medium: has('life_medium') ? num('life_medium') : Math.round(hard * 1.5),
          Hard: hard,
          'Very Hard': has('life_very_hard') ? num('life_very_hard') : Math.round(hard * 0.6),
        },
        active: true,
      })
    })
    return out
  }, [text, state.suppliers])

  const existing = (n: string) => state.catalogue.some(x => x.name.toLowerCase() === n.toLowerCase())
  const updates = parsed.filter(p => existing(p.name)).length

  return (
    <Modal title="Import catalogue" subtitle="Paste a CSV, or open your sheet and copy the rows in" width={840} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={parsed.length === 0}
          onClick={() => { importItems(parsed); onClose() }}>
          Import {parsed.length} item{parsed.length === 1 ? '' : 's'}
        </Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Note tone={C.dim}>
          Columns: <span style={{ fontFamily: 'ui-monospace, monospace' }}>name, category, rate, supplier, lead_days, min_stock,
          life_soft, life_medium, life_hard, life_very_hard</span>. If your sheet has a single <span style={{ fontFamily: 'ui-monospace, monospace' }}>life</span> column
          instead of four, that works — the terrain split is applied for you and you can correct it afterwards.
          Items are matched on name, so re-importing a corrected sheet updates rather than duplicates.
        </Note>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Btn size="sm" onClick={() => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }))
            a.download = 'xplorix-tooling-template.csv'; a.click()
          }}>Download template</Btn>
          <label style={{ cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 8, fontSize: 11.5,
              fontWeight: 700, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted }}>
              Upload a file
            </span>
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]; if (!file) return
                const fr = new FileReader()
                fr.onload = () => setText(String(fr.result))
                fr.onerror = () => setErr('Could not read that file')
                fr.readAsText(file)
              }} />
          </label>
        </div>

        <Field label="CSV">
          <textarea value={text} onChange={e => { setText(e.target.value); setErr('') }}
            rows={8} placeholder={TEMPLATE}
            style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, lineHeight: 1.6, resize: 'vertical' }} />
        </Field>
        {err && <Note tone={C.red}>{err}</Note>}

        {parsed.length > 0 && (
          <Card title="Preview" pad={false} subtitle={`${parsed.length - updates} new · ${updates} will update existing items`}>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <table style={tableStyle}>
                <thead><tr><th style={th}>Item</th><th style={th}>Category</th><th style={thR}>Rate</th>
                  {FORMATIONS.map(f => <th key={f} style={thR}>{f}</th>)}<th style={thR}>Hard ₹/m</th><th style={th} /></tr></thead>
                <tbody>
                  {parsed.map((i, k) => (
                    <tr key={k} style={{ borderBottom: rowBorder }}>
                      <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{i.name}</td>
                      <td style={td}>{i.category}</td>
                      <td style={tdN}>{money(i.rate)}</td>
                      {FORMATIONS.map(f => <td key={f} style={{ ...tdN, color: C.faint }}>{i.life[f]}</td>)}
                      <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{costPerMetre(i, 'Hard').toFixed(2)}</td>
                      <td style={td}><Tag tone={existing(i.name) ? C.amber : C.green}>{existing(i.name) ? 'update' : 'new'}</Tag></td>
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

function OrdersTab({ onReceive, onIssue, onCreate, onEdit, onReturn }: {
  onReceive: (po: PurchaseOrder) => void
  onIssue: (po: PurchaseOrder) => void
  onCreate: () => void
  onEdit: (po: PurchaseOrder) => void
  onReturn: (po: PurchaseOrder) => void
}) {
  const { state } = useInventory()
  const [open, setOpen] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'ordered' | 'partial' | 'received'>('all')
  const [sup, setSup] = useState('All')
  const [proj, setProj] = useState('All')
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id

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
    damaged: a.damaged + poDamagedValue(p),
  }), { ordered: 0, received: 0, store: 0, issued: 0, damaged: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Grid cols={5}>
        <Stat label="On order" value={moneyL(t.ordered - t.received)} note="placed, not yet delivered" color={C.blue} />
        <Stat label="Received" value={moneyL(t.received)} note="accepted into the store" />
        <Stat label="In store" value={moneyL(t.store)} note="not yet on a rig" color={C.amber} />
        <Stat label="Consumed" value={moneyL(t.issued)} note="issued to a rig" color={C.green} />
        <Stat label="Damaged" value={moneyL(t.damaged)} note="never entered the store" color={t.damaged > 0 ? C.red : C.dim} />
      </Grid>

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
          <Btn size="sm" onClick={() => { setQ(''); setStatus('all'); setSup('All'); setProj('All') }}>Clear</Btn>
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
                const late = st !== 'received' && po.promisedDate && po.promisedDate < TODAY
                const rets = openReturns(po)
                return (
                  <Fragment key={po.id}>
                    <tr onClick={() => setOpen(isOpen ? null : po.id)} style={{
                      borderBottom: rowBorder, cursor: 'pointer',
                      background: isOpen ? 'rgba(249,115,22,0.05)' : late ? 'rgba(239,68,68,0.05)' : undefined,
                    }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>
                        {po.number}
                        {rets.length > 0 && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>{rets.length} return{rets.length > 1 ? 's' : ''}</Tag></span>}
                      </td>
                      <td style={td}>{po.supplier}</td>
                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{projectCode(po.project)}</td>
                      <td style={td}><Tag tone={PO_TONE[st]}>{st}</Tag></td>
                      <td style={td}>{po.orderedDate ? dayLabel(po.orderedDate) : '—'}</td>
                      <td style={{ ...td, color: late ? C.red : C.muted }}>{po.promisedDate ? dayLabel(po.promisedDate) : '—'}</td>
                      <td style={td}>{lastReceipt ? dayLabel(lastReceipt) : late ? 'overdue' : '—'}</td>
                      <td style={{ ...tdN, color: delay == null ? C.dim : delay > 0 ? C.red : C.green, fontWeight: 700 }}>
                        {delay == null ? '—' : delay > 0 ? `+${delay}d` : `${delay}d`}
                      </td>
                      <td style={tdN}>{money(poValue(po))}</td>
                      <td style={{ ...tdN, color: poStoreValue(po) > 0 ? C.amber : C.dim }}>{poStoreValue(po) > 0 ? money(poStoreValue(po)) : '—'}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {st === 'draft' && <Btn size="sm" tone="primary" onClick={() => onEdit(po)}>Open</Btn>}
                          {st !== 'draft' && st !== 'received' && <Btn size="sm" onClick={() => onReceive(po)}>Receive</Btn>}
                          {poDamagedValue(po) > 0 && <Btn size="sm" tone="danger" onClick={() => onReturn(po)}>Returns</Btn>}
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
                                <thead><tr><th style={th}>Item</th><th style={thR}>Ordered</th><th style={thR}>Accepted</th>
                                  <th style={thR}>Damaged</th><th style={thR}>Issued</th><th style={thR}>In store</th><th style={thR}>Value</th></tr></thead>
                                <tbody>
                                  {po.lines.map(l => {
                                    const dmg = qtyDamaged(po, l.itemId)
                                    return (
                                      <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                                        <td style={tdN}>{l.qty}</td>
                                        <td style={tdN}>{qtyReceived(po, l.itemId)}</td>
                                        <td style={{ ...tdN, color: dmg > 0 ? C.red : C.dim }}>{dmg || '—'}</td>
                                        <td style={{ ...tdN, color: C.green }}>{qtyIssued(po, l.itemId)}</td>
                                        <td style={{ ...tdN, color: qtyInStore(po, l.itemId) > 0 ? C.amber : C.dim }}>{qtyInStore(po, l.itemId)}</td>
                                        <td style={tdN}>{money(l.qty * l.rate)}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <div>
                              <SubHead tone={C.blue}>History</SubHead>
                              {po.receipts.length === 0 && po.issues.length === 0 && po.returns.length === 0
                                ? <Empty>Placed, nothing delivered yet.</Empty>
                                : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {po.receipts.map(r => (
                                      <div key={r.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                                        <Tag tone={C.blue}>received</Tag>{' '}
                                        <span style={{ color: C.text }}>{fullDate(r.date)}</span>
                                        {' — '}{r.lines.map(l => `${l.accepted} × ${nameOf(l.itemId)}${l.damaged ? ` (+${l.damaged} damaged)` : ''}`).join(', ')}
                                        {r.delayReason && <span style={{ color: C.red }}> · {r.delayReason}</span>}
                                      </div>
                                    ))}
                                    {po.returns.map(r => (
                                      <div key={r.id} style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                                        <Tag tone={C.red}>{RETURN_STATUS_LABEL[r.status].toLowerCase()}</Tag>{' '}
                                        <span style={{ color: C.text }}>{fullDate(r.date)}</span>
                                        {' — '}{r.qty} × {nameOf(r.itemId)} · {r.reason}
                                        {r.promisedDate && <span style={{ color: C.faint }}> · replacement due {dayLabel(r.promisedDate)}</span>}
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

function Stars({ n }: { n?: number }) {
  if (!n) return <span style={{ color: C.dim, fontSize: 11 }}>not rated</span>
  return (
    <span style={{ letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? C.amber : C.dim, fontSize: 12 }}>★</span>
      ))}
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
        subtitle="Lead time and damage measured from what actually happened; the rating is your own judgement"
        right={<Btn size="sm" tone="primary" onClick={() => setEditing(blank())}>Add supplier</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Supplier</th><th style={th}>Contact</th><th style={thR}>Orders</th><th style={thR}>Value</th>
                <th style={thR}>Quoted</th><th style={thR}>Actual</th><th style={thR}>Delay</th><th style={thR}>On time</th>
                <th style={thR}>Damaged</th><th style={thR}>Open returns</th><th style={th}>Rating</th><th style={th} /></tr>
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
                  <td style={{ ...tdN, color: r.damagePct ? C.red : C.dim }}>
                    {r.damagePct ? `${r.damagePct.toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ ...tdN, color: r.openReturns ? C.red : C.dim }}>{r.openReturns || '—'}</td>
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
            <Btn tone="primary" disabled={!editing.name.trim()} onClick={() => { saveSupplier(editing); setEditing(null) }}>Save</Btn></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Grid cols={2}>
              <Field label="Name"><input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} style={iStyle} /></Field>
              <Field label="Contact"><input value={editing.contact} onChange={e => setEditing({ ...editing, contact: e.target.value })} style={iStyle} /></Field>
              <Field label="Phone"><input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} style={iStyle} /></Field>
              <Field label="Quoted lead time" hint="days, as they state it">
                <input type="number" value={editing.quotedLeadDays}
                  onChange={e => setEditing({ ...editing, quotedLeadDays: parseFloat(e.target.value) || 0 })}
                  style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
              </Field>
            </Grid>
            <Field label="Your rating" hint="Your own judgement. Lead time and damage are measured separately and never folded into this.">
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
 * STORE
 * ========================================================================== */

function StoreTab({ onMove }: { onMove: (l: StockLine) => void }) {
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
            <thead><tr><th style={th}>Item</th><th style={th}>Project</th><th style={th}>On order</th><th style={thR}>Qty</th><th style={thR}>Age</th><th style={thR}>Value</th><th style={th} /></tr></thead>
            <tbody>
              {stock.map((l, k) => {
                const old = l.ageDays >= state.alerts.idleDays
                const stranded = COMPLETED_PROJECTS.includes(l.project)
                return (
                  <tr key={k} style={{ borderBottom: rowBorder, background: stranded ? 'rgba(239,68,68,0.05)' : old ? 'rgba(245,158,11,0.04)' : undefined }}>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>
                      {projectCode(l.project)}
                      {stranded && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>project ended</Tag></span>}
                    </td>
                    <td style={td}>{l.poNumber}</td>
                    <td style={tdN}>{l.qty}</td>
                    <td style={{ ...tdN, color: old ? C.amber : C.faint, fontWeight: old ? 700 : 400 }}>{l.ageDays}d</td>
                    <td style={{ ...tdN, color: C.amber, fontWeight: 700 }}>{money(l.value)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      {stranded && <Btn size="sm" tone="primary" onClick={() => onMove(l)}>Move</Btn>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={5}>Total in store</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(stockValue)}</td>
                <td style={td} />
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

/* CONSUMPTION — what a month of drilling actually used.
 *
 * Three numbers, in the order they answer a question:
 *
 *   metres drilled, by ground     what was achieved
 *   parts used                    what it took, from the driller's log
 *   cost per metre                what that works out at
 *
 * Issued from store sits alongside as a cross-check. Issuing and using are
 * different events — a bit issued in August may still be drilling in October —
 * so the two will not match, and the gap is what is sitting on the rig. */
function ConsumptionTab({ month, onMonth }: { month: string; onMonth: (m: string) => void }) {
  const { state } = useInventory()
  const { state: cost } = useCosting()
  const [openRig, setOpenRig] = useState<string | null>(null)
  const [project, setProject] = useState(PROJECTS[0])
  const [rigFilter, setRigFilter] = useState<string | 'all'>('all')
  const itemOf = (id: string) => state.catalogue.find(i => i.id === id)
  const nameOf = (id: string) => itemOf(id)?.name ?? id

  /* Which rigs worked this project — taken from the driller's log rather than a
   * fixed list, so a rig moved between projects appears where it actually was. */
  const projectRigs = useMemo(() => Array.from(new Set(
    cost.shiftLogs.filter(l => l.project === project).map(l => l.rig))).sort(),
    [cost.shiftLogs, project])

  const byRig = useMemo(() => projectRigs.map(rig => {
    const shifts = cost.shiftLogs.filter(l => l.rig === rig && l.project === project && monthOf(l.date) === month)
    const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)

    const byFormation = FORMATIONS.map(f => ({
      formation: f,
      metres: shifts.filter(l => normFormation(l.formationType) === f).reduce((s, l) => s + l.metresDrilled, 0),
    })).filter(x => x.metres > 0)

    // Straight from the Accessories section of the driller's log.
    const usedQty: Record<string, number> = {}
    shifts.forEach(l => (l.partsUsed ?? []).forEach(p => { usedQty[p.itemId] = (usedQty[p.itemId] ?? 0) + p.qty }))
    const used = Object.entries(usedQty).map(([itemId, qty]) => {
      const it = itemOf(itemId)
      const rate = it?.rate ?? 0
      return { itemId, qty, rate, cost: qty * rate, perMetre: metres > 0 ? (qty * rate) / metres : 0 }
    }).sort((a, b) => b.cost - a.cost)

    const usedCost = used.reduce((s, u) => s + u.cost, 0)
    const issued = consumptionValue(state.pos, { rig, project, month })
    return { rig, metres, byFormation, used, usedCost, issued, cpm: metres > 0 ? usedCost / metres : 0 }
  }).filter(r => (r.metres > 0 || r.issued > 0) && (rigFilter === 'all' || r.rig === rigFilter)),
    [state.catalogue, state.pos, cost.shiftLogs, month, project, projectRigs, rigFilter])

  const t = byRig.reduce((a, r) => ({
    metres: a.metres + r.metres, used: a.used + r.usedCost, issued: a.issued + r.issued,
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <Note tone={C.dim}>
          <strong style={{ color: C.text }}>Parts used</strong> comes from the Accessories section of the driller&apos;s log —
          what the supervisor recorded going into the ground.{' '}
          <strong style={{ color: C.text }}>Issued</strong> is what left the store. They do not match, and should not: a bit
          issued this month may still be drilling in three months&apos; time.
        </Note>
      </div>

      <Grid cols={4}>
        <Stat label="Metres drilled" value={`${t.metres} m`} note={`${projectCode(project)} · ${monthLabel(month)}`} big />
        <Stat label="Parts used" value={moneyL(t.used)} note="recorded in the driller's log" color={C.green} big />
        <Stat label="Cost per metre" value={t.metres ? perMetre(t.used / t.metres) : '—'} note="tooling only" color={C.orange} big />
        <Stat label="Issued from store" value={moneyL(t.issued)}
          note={t.issued > t.used ? `${moneyL(t.issued - t.used)} still on the rigs` : 'drawing from earlier stock'}
          color={C.amber} big />
      </Grid>

      {byRig.length === 0 ? (
        <Card><Empty>Nothing drilled or issued on {projectCode(project)} in {monthLabel(month)}.</Empty></Card>
      ) : (
        <Card title="By rig" pad={false} subtitle="Click a rig for the metres, the parts that went into them, and how the cost per metre is reached">
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Rig</th><th style={th}>Ground drilled</th><th style={thR}>Metres</th>
                <th style={thR}>Parts used</th><th style={thR}>Cost per metre</th><th style={thR}>Issued from store</th><th style={thR}>On the rig</th></tr>
            </thead>
            <tbody>
              {byRig.map(r => {
                const isOpen = openRig === r.rig
                return (
                  <Fragment key={r.rig}>
                    <tr onClick={() => setOpenRig(isOpen ? null : r.rig)}
                      style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{r.rig}</td>
                      <td style={{ ...td, whiteSpace: 'normal', maxWidth: 300, color: C.faint }}>
                        {r.byFormation.map(b => `${b.metres} m ${b.formation.toLowerCase()}`).join(' · ') || '—'}
                      </td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{r.metres}</td>
                      <td style={{ ...tdN, color: C.green }}>{money(r.usedCost)}</td>
                      <td style={{ ...tdN, color: C.orange, fontWeight: 700 }}>{r.metres ? perMetre(r.cpm) : '—'}</td>
                      <td style={{ ...tdN, color: C.amber }}>{money(r.issued)}</td>
                      <td style={{ ...tdN, color: r.issued > r.usedCost ? C.amber : C.dim }}>
                        {r.issued > r.usedCost ? money(r.issued - r.usedCost) : '—'}
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
                                      <td style={{ ...tdN, color: C.faint }}>{r.metres ? ((b.metres / r.metres) * 100).toFixed(0) + '%' : '—'}</td>
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

                              <div style={{ marginTop: 20, padding: '14px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                  How the cost per metre is reached
                                </div>
                                <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: C.text, fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap' }}>
{`parts used   ${money(r.usedCost)}
metres       ${r.metres} m
             ${'─'.repeat(18)}
per metre    ${r.metres ? perMetre(r.cpm) : '—'}`}
                                </pre>
                              </div>
                            </div>

                            <div>
                              <SubHead tone={C.green}>Parts used — from the driller&apos;s log</SubHead>
                              {r.used.length === 0 ? <Empty>No accessories recorded for {r.rig} this month.</Empty> : (
                                <table style={tableStyle}>
                                  <thead><tr><th style={th}>Item</th><th style={thR}>Qty</th><th style={thR}>Rate</th><th style={thR}>Cost</th><th style={thR}>Per metre</th></tr></thead>
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
                                  </tbody>
                                  <tfoot>
                                    <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                      <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Total</td>
                                      <td style={{ ...tdN, fontWeight: 900, color: C.green }}>{money(r.usedCost)}</td>
                                      <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{r.metres ? r.cpm.toFixed(2) : '—'}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              )}

                              <div style={{ marginTop: 18, padding: '14px 16px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                                <Grid cols={3}>
                                  <div><div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Used</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: C.green, fontFamily: 'ui-monospace, monospace' }}>{money(r.usedCost)}</div></div>
                                  <div><div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Issued from store</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: C.amber, fontFamily: 'ui-monospace, monospace' }}>{money(r.issued)}</div></div>
                                  <div><div style={{ fontSize: 10, color: C.faint, marginBottom: 4 }}>Sitting on the rig</div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: r.issued > r.usedCost ? C.amber : C.dim, fontFamily: 'ui-monospace, monospace' }}>
                                      {r.issued > r.usedCost ? money(r.issued - r.usedCost) : '—'}</div></div>
                                </Grid>
                                <div style={{ marginTop: 11, fontSize: 11, color: C.faint, lineHeight: 1.65 }}>
                                  {r.issued > r.usedCost
                                    ? `${money(r.issued - r.usedCost)} was drawn from the store but has not gone into the ground yet — it is on the rig, part-worn or unopened.`
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
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={2}>{byRig.length} rig{byRig.length === 1 ? '' : 's'} on {projectCode(project)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{t.metres}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.green }}>{money(t.used)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{t.metres ? perMetre(t.used / t.metres) : '—'}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{money(t.issued)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.amber }}>{t.issued > t.used ? money(t.issued - t.used) : '—'}</td>
              </tr>
            </tfoot>
          </table>
        </Card>
      )}
    </div>
  )
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

function ReceiveModal({ po, onSave, onClose }: {
  po: PurchaseOrder
  onSave: (date: string, lines: ReceiptLine[], delayReason: DelayReason | undefined, note: string) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState<DelayReason | ''>('')
  const [rows, setRows] = useState<Record<string, { accepted: number; damaged: number; rejected: number }>>(
    Object.fromEntries(po.lines.map(l => [l.itemId, { accepted: qtyAwaitingDelivery(po, l.itemId), damaged: 0, rejected: 0 }])))

  const set = (itemId: string, k: 'accepted' | 'damaged' | 'rejected', v: number) =>
    setRows(r => ({ ...r, [itemId]: { ...r[itemId], [k]: Math.max(0, v) } }))

  const lines: ReceiptLine[] = po.lines
    .map(l => ({ itemId: l.itemId, ...rows[l.itemId] }))
    .filter(l => l.accepted + l.damaged + l.rejected > 0)

  const rateOf = (id: string) => po.lines.find(x => x.itemId === id)?.rate ?? 0
  const acceptedValue = lines.reduce((s2, l) => s2 + l.accepted * rateOf(l.itemId), 0)
  const damagedValue = lines.reduce((s2, l) => s2 + (l.damaged + l.rejected) * rateOf(l.itemId), 0)
  const delay = po.promisedDate ? daysBetween(po.promisedDate, date) : null
  const late = delay != null && delay > 0

  return (
    <Modal title={`Receive against ${po.number}`} subtitle={`${po.supplier} · ${projectCode(po.project)}`} width={760} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={lines.length === 0 || (late && !reason)}
          onClick={() => { onSave(date, lines, reason || undefined, note); onClose() }}>Record receipt</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Note tone={C.dim}>
          Record what actually turned up. Damaged and wrong stock arrived but cannot be issued, so it never counts as
          received value — and it becomes a return against the supplier rather than quietly disappearing.
        </Note>

        <Grid cols={2}>
          <Field label="Delivered on">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
          </Field>
          <Field label="Note"><input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" style={iStyle} /></Field>
        </Grid>

        {delay != null && (
          <Note tone={late ? C.red : C.green}>
            {po.promisedDate && `Promised ${fullDate(po.promisedDate)}. `}
            {late ? `${delay} days late.` : delay === 0 ? 'On time.' : `${Math.abs(delay)} days early.`}
            {' '}This feeds the supplier&apos;s measured lead time.
          </Note>
        )}

        {late && (
          <Field label="Why was it late?" hint="A supplier held up by our own late order should not be scored for it">
            <select value={reason} onChange={e => setReason(e.target.value as DelayReason)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="">Select a reason</option>
              {DELAY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Item</th><th style={thR}>Outstanding</th>
                <th style={thR}>Accepted</th><th style={thR}>Damaged</th><th style={thR}>Wrong / short</th>
              </tr>
            </thead>
            <tbody>
              {po.lines.map(l => {
                const out = qtyAwaitingDelivery(po, l.itemId)
                const r = rows[l.itemId]
                return (
                  <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                    <td style={{ ...tdN, color: out > 0 ? C.amber : C.dim }}>{out}</td>
                    {(['accepted', 'damaged', 'rejected'] as const).map(k => (
                      <td key={k} style={{ padding: '5px 8px', width: 100 }}>
                        <input type="number" min={0} value={r[k]}
                          onChange={e => set(l.itemId, k, parseFloat(e.target.value) || 0)}
                          style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700,
                            color: k === 'accepted' ? C.green : k === 'damaged' ? C.red : C.amber }} />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 26, alignItems: 'baseline' }}>
          <div><span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Into store</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: C.green, fontFamily: 'ui-monospace, monospace' }}>{money(acceptedValue)}</span></div>
          {damagedValue > 0 && (
            <div><span style={{ fontSize: 11, color: C.faint, marginRight: 8 }}>Not fit to use</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(damagedValue)}</span></div>
          )}
        </div>

        {damagedValue > 0 && (
          <Note tone={C.amber}>
            Raise a return for the damaged units from the order row once this is saved, so the replacement can be tracked
            back against the same line.
          </Note>
        )}
      </div>
    </Modal>
  )
}

/* Stock bought against a project that has closed can be moved to a live one.
 * The order keeps its original project — rewriting that would falsify what was
 * actually bought for what — so the move is recorded as its own event. */
function MoveModal({ line, onSave, onClose }: {
  line: StockLine
  onSave: (poId: string, t: Omit<Transfer, 'id'>) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const po = state.pos.find(p => p.number === line.poNumber)
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const live = PROJECTS.filter(p => p !== line.project && !COMPLETED_PROJECTS.includes(p))
  const [to, setTo] = useState(live[0] ?? '')
  const [qty, setQty] = useState(line.qty)
  const [note, setNote] = useState('')

  return (
    <Modal title={`Move ${nameOf(line.itemId)}`} subtitle={`${line.qty} in store against ${projectCode(line.project)}, which has ended`}
      width={560} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!to || !po || qty < 1}
          onClick={() => { if (po) onSave(po.id, { date: TODAY, itemId: line.itemId, qty, toProject: to, note }); onClose() }}>
          Move to {to ? projectCode(to) : '—'}
        </Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={2}>
          <Field label="Quantity" hint={`${line.qty} available`}>
            <input type="number" min={1} max={line.qty} value={qty}
              onChange={e => setQty(Math.min(line.qty, Math.max(1, parseFloat(e.target.value) || 1)))}
              style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }} />
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
          separately, so what was spent on the closed project stays true while the stock becomes usable again.
        </Note>
      </div>
    </Modal>
  )
}

function POModal({ po, onSave, onPlace, onClose }: {
  po: PurchaseOrder
  onSave: (po: PurchaseOrder) => void
  onPlace: (id: string, ordered: string, promised: string) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const [f, setF] = useState<PurchaseOrder>(po)
  const [placing, setPlacing] = useState(false)
  const [ordered, setOrdered] = useState(TODAY)
  const isNew = !state.pos.some(p => p.id === po.id)

  const supplierItems = state.catalogue.filter(i => i.active && i.supplier === f.supplier)
  /* Promised date defaults to the supplier's own quoted lead time — the figure
   * their delivery is then measured against. */
  const quoted = state.suppliers.find(x => x.name === f.supplier)?.quotedLeadDays ?? 14
  const defaultPromised = useMemo(() => {
    const d = new Date(ordered + 'T00:00:00'); d.setDate(d.getDate() + quoted)
    return d.toISOString().slice(0, 10)
  }, [ordered, quoted])
  const [promised, setPromised] = useState(defaultPromised)

  const addLine = (itemId: string) => {
    const item = state.catalogue.find(i => i.id === itemId)
    if (!item || f.lines.some(l => l.itemId === itemId)) return
    setF(x => ({ ...x, lines: [...x.lines, { itemId, qty: 1, rate: item.rate }] }))
  }
  const setLine = (itemId: string, p: Partial<{ qty: number; rate: number }>) =>
    setF(x => ({ ...x, lines: x.lines.map(l => l.itemId === itemId ? { ...l, ...p } : l) }))

  const value = f.lines.reduce((s2, l) => s2 + l.qty * l.rate, 0)
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id

  if (placing) {
    return (
      <Modal title={`Place ${f.number}`} subtitle={`${f.supplier} · ${money(value)}`} width={560} onClose={() => setPlacing(false)}
        footer={<><Btn onClick={() => setPlacing(false)}>Back</Btn>
          <Btn tone="primary" onClick={() => { onSave(f); onPlace(f.id, ordered, promised); onClose() }}>Place order</Btn></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Grid cols={2}>
            <Field label="Ordered on">
              <input type="date" value={ordered} onChange={e => { setOrdered(e.target.value); }} style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Promised delivery" hint={`${f.supplier} quotes ${quoted} days`}>
              <input type="date" value={promised} onChange={e => setPromised(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
          </Grid>
          <Note tone={C.blue}>
            The promised date is what delivery is measured against. Without it a late order cannot be told from a
            slow one, and supplier lead time stays an opinion.
          </Note>
          <Note tone={C.dim}>Once placed, the lines are fixed — receipts are recorded against them.</Note>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={isNew ? 'New purchase order' : `Edit ${f.number}`} width={780} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { onSave(f); onClose() }} disabled={f.lines.length === 0}>Save as draft</Btn>
        <Btn tone="primary" disabled={f.lines.length === 0} onClick={() => setPlacing(true)}>Place order</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Grid cols={3}>
          <Field label="Order number">
            <input value={f.number} onChange={e => setF(x => ({ ...x, number: e.target.value }))} style={iStyle} />
          </Field>
          <Field label="Supplier">
            <select value={f.supplier} onChange={e => setF(x => ({ ...x, supplier: e.target.value, lines: [] }))} style={{ ...iStyle, cursor: 'pointer' }}>
              {state.suppliers.map(x => <option key={x.id} value={x.name}>{x.name}</option>)}
            </select>
          </Field>
          <Field label="Project">
            <select value={f.project} onChange={e => setF(x => ({ ...x, project: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>
              {PROJECTS.map(x => <option key={x} value={x}>{projectCode(x)} — {x}</option>)}
            </select>
          </Field>
        </Grid>

        <Field label="Add an item" hint={supplierItems.length === 0 ? 'No catalogue items are set to this supplier yet' : `${supplierItems.length} items from ${f.supplier}`}>
          <select value="" onChange={e => addLine(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
            <option value="">Choose from the catalogue…</option>
            {supplierItems.filter(i => !f.lines.some(l => l.itemId === i.id))
              .map(i => <option key={i.id} value={i.id}>{i.name} — {money(i.rate)}</option>)}
          </select>
        </Field>

        {f.lines.length === 0 ? <Empty>No lines yet. Add items from the catalogue above.</Empty> : (
          <table style={tableStyle}>
            <thead><tr><th style={th}>Item</th><th style={thR}>Quantity</th><th style={thR}>Rate</th><th style={thR}>Value</th><th style={th} /></tr></thead>
            <tbody>
              {f.lines.map(l => (
                <tr key={l.itemId} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(l.itemId)}</td>
                  <td style={{ padding: '5px 8px', width: 96 }}>
                    <input type="number" min={1} value={l.qty} onChange={e => setLine(l.itemId, { qty: Math.max(1, parseFloat(e.target.value) || 1) })}
                      style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }} />
                  </td>
                  <td style={{ padding: '5px 8px', width: 120 }}>
                    <input type="number" value={l.rate} onChange={e => setLine(l.itemId, { rate: parseFloat(e.target.value) || 0 })}
                      style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
                  </td>
                  <td style={tdN}>{money(l.qty * l.rate)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <Btn size="sm" tone="danger" onClick={() => setF(x => ({ ...x, lines: x.lines.filter(y => y.itemId !== l.itemId) }))}>Remove</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}` }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Order value</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.orange }}>{money(value)}</td>
                <td style={td} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </Modal>
  )
}

/* A damaged unit goes back and follows its own course. The replacement lands
 * as a further receipt on the same line, so the order reconciles instead of
 * looking short forever. */
function ReturnModal({ po, onAdd, onUpdate, onClose }: {
  po: PurchaseOrder
  onAdd: (r: Omit<ReturnRecord, 'id'>) => void
  onUpdate: (r: ReturnRecord) => void
  onClose: () => void
}) {
  const { state } = useInventory()
  const nameOf = (id: string) => state.catalogue.find(i => i.id === id)?.name ?? id
  const damaged = po.lines.filter(l => qtyDamaged(po, l.itemId) > 0)
  const [itemId, setItemId] = useState(damaged[0]?.itemId ?? po.lines[0]?.itemId ?? '')
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('Damaged in transit')

  return (
    <Modal title={`Returns on ${po.number}`} subtitle={po.supplier} width={720} onClose={onClose}
      footer={<Btn onClick={onClose}>Close</Btn>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {po.returns.length > 0 && (
          <div>
            <SubHead tone={C.amber}>Open and closed returns</SubHead>
            <table style={tableStyle}>
              <thead><tr><th style={th}>Raised</th><th style={th}>Item</th><th style={thR}>Qty</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th} /></tr></thead>
              <tbody>
                {po.returns.map(r => (
                  <tr key={r.id} style={{ borderBottom: rowBorder }}>
                    <td style={td}>{dayLabel(r.date)}</td>
                    <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{nameOf(r.itemId)}</td>
                    <td style={tdN}>{r.qty}</td>
                    <td style={{ ...td, whiteSpace: 'normal' }}>{r.reason}</td>
                    <td style={td}>
                      <Tag tone={r.status === 'replaced' || r.status === 'credited' ? C.green : r.status === 'raised' ? C.red : C.amber}>
                        {RETURN_STATUS_LABEL[r.status]}
                      </Tag>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <select value={r.status} onChange={e => onUpdate({ ...r, status: e.target.value as ReturnStatus })}
                        style={{ ...iStyle, width: 180, cursor: 'pointer', fontSize: 11.5 }}>
                        {(Object.keys(RETURN_STATUS_LABEL) as ReturnStatus[]).map(k =>
                          <option key={k} value={k}>{RETURN_STATUS_LABEL[k]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <SubHead tone={C.orange}>Raise a return</SubHead>
          <Grid cols={3}>
            <Field label="Item">
              <select value={itemId} onChange={e => setItemId(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                {po.lines.map(l => (
                  <option key={l.itemId} value={l.itemId}>
                    {nameOf(l.itemId)}{qtyDamaged(po, l.itemId) > 0 ? ` — ${qtyDamaged(po, l.itemId)} damaged` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity">
              <input type="number" min={1} value={qty} onChange={e => setQty(Math.max(1, parseFloat(e.target.value) || 1))}
                style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
            </Field>
            <Field label="Reason">
              <input value={reason} onChange={e => setReason(e.target.value)} style={iStyle} />
            </Field>
          </Grid>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Btn tone="primary" disabled={!itemId} onClick={() => {
              onAdd({ date: TODAY, itemId, qty, reason, status: 'raised' })
              setQty(1)
            }}>Raise return</Btn>
          </div>
        </div>

        <Note tone={C.dim}>
          A replacement is not a new order. When it arrives, record it as another receipt against this order — the line
          then reconciles without inflating what was spent.
        </Note>
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
  const { state, saveItem, savePO, placeOrder, addReceipt, addIssue, addReturn, updateReturn, addTransfer } = useInventory()
  const { state: cost } = useCosting()
  const [tab, setTab] = useState<Tab>('Catalogue')
  const [editItem, setEditItem] = useState<ToolingItem | null>(null)
  const [importing, setImporting] = useState(false)
  const [editPO, setEditPO] = useState<PurchaseOrder | null>(null)
  const [receiving, setReceiving] = useState<PurchaseOrder | null>(null)
  const [issuing, setIssuing] = useState<PurchaseOrder | null>(null)
  const [returning, setReturning] = useState<PurchaseOrder | null>(null)
  const [moving, setMoving] = useState<StockLine | null>(null)

  const blankPO = (): PurchaseOrder => ({
    id: uid('po'),
    number: `PO-${new Date().getFullYear()}-${String(state.pos.length + 1).padStart(3, '0')}`,
    supplier: state.suppliers[0]?.name ?? '', project: PROJECTS[0],
    status: 'draft', createdDate: TODAY,
    lines: [], receipts: [], issues: [], returns: [], transfers: [],
  })


  const [month, setMonth] = useState('2026-08')

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
  }).filter(Boolean) as { rig: string; metresPerDay: number; formation: Formation }[], [cost.shiftLogs, month])

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

      {tab === 'Catalogue' && <CatalogueTab onEdit={setEditItem} onImport={() => setImporting(true)} />}
      {tab === 'Orders' && (
        <OrdersTab onReceive={setReceiving} onIssue={setIssuing} onReturn={setReturning}
          onCreate={() => setEditPO(blankPO())} onEdit={setEditPO} />
      )}
      {tab === 'Store' && <StoreTab onMove={setMoving} />}
      {tab === 'Consumption' && <ConsumptionTab month={month} onMonth={setMonth} />}

      {editItem && <ItemModal item={editItem} onSave={saveItem} onClose={() => setEditItem(null)} />}
      {importing && <ImportModal onClose={() => setImporting(false)} />}
      {moving && <MoveModal line={moving} onSave={addTransfer} onClose={() => setMoving(null)} />}
      {editPO && (
        <POModal po={editPO} onSave={savePO} onPlace={placeOrder} onClose={() => setEditPO(null)} />
      )}
      {returning && (
        <ReturnModal po={returning} onClose={() => setReturning(null)}
          onAdd={r => addReturn(returning.id, r)}
          onUpdate={r => updateReturn(returning.id, r)} />
      )}
      {receiving && (
        <ReceiveModal po={receiving} onClose={() => setReceiving(null)}
          onSave={(date, lines, delayReason, note) => addReceipt(receiving.id, { date, lines, delayReason, note })} />
      )}
      {issuing && (
        <IssueModal po={issuing} onClose={() => setIssuing(null)}
          onSave={(date, rig, issuedBy, lines) => addIssue(issuing.id, { date, rig, issuedBy, lines })} />
      )}
    </div>
  )
}
