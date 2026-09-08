'use client'

import { useState, useMemo, useEffect, Fragment, ReactNode } from 'react'
import { useInventory } from '../../../lib/inventory-store'
import {
  CostingProvider, useCosting,
  C, LAYER, iStyle, derivedStyle, money, moneyL, perUnit, pct,
  cpuColor, marginColor, statusColor, holeStatusColor,
  monthLabel, dayLabel, fullDate, monthOf, daysInMonth,
  rigsFor, monthsFor, versionOn, newestFirst, uid,
  ownershipBreakdown, dayCost, rollup, withCumulative, holeResult,
  partsPerUnitFor, isBillable,
  blankOwnership, blankOperating, blankClientRate,
  PROJECT_CLIENTS, ROCK_CATEGORIES, HOLE_SIZES, DAY_STATUS_LABEL,
  type DayCost, type DayCostMTD, type Rollup, type OwnershipBreakdown,
  type RigOwnership, type OperatingRate, type ClientRate, type Hole, type HoleStatus,
  type HoleResult, type Invoice, type InvoiceLine, type RateRow, type RateAdjustment,
  type VersionKind,
} from '../../../lib/costing-store'

/* ==========================================================================
 * XPLORIX COSTING — one screen.
 *
 * Project -> rig -> month, then four views of the same costed data. Two
 * buttons top right: Set rates (three tabs) and Rates history.
 *
 * Sections below, in order:
 *   1  UI primitives
 *   2  The costing view (turns logs + dated rates into days)
 *   3  Set rates      — Rig cost / Operating cost / Client cost
 *   4  Rates history
 *   5  Overview / Daily / Holes / Billing
 *   6  Hole editor
 *   7  The screen
 * ========================================================================== */

/* ==========================================================================
 * 1  UI primitives
 * ========================================================================== */

function Card({ title, subtitle, right, children, pad = true, accent }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; pad?: boolean; accent?: string
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', borderLeft: accent ? `3px solid ${accent}` : undefined }}>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, height: 15 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

function NumField({ label, value, onChange, hint, color = C.text, suffix }: {
  label: string; value: number; onChange: (n: number) => void; hint?: string; color?: string; suffix?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ position: 'relative' }}>
        <input type="number" value={Number.isFinite(value) ? value : 0}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ ...iStyle, color, fontWeight: 700, fontFamily: 'ui-monospace, monospace', paddingRight: suffix ? 42 : 10 }} />
        {suffix && <span style={{ position: 'absolute', right: 9, top: 7, fontSize: 10.5, color: C.dim, pointerEvents: 'none' }}>{suffix}</span>}
      </div>
    </Field>
  )
}

function TextField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={iStyle} />
    </Field>
  )
}

function DateField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <input type="date" value={value} onChange={e => onChange(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
    </Field>
  )
}

/* A value XPLORIX worked out. `onOverride` makes it typeable — the calculation
 * is a starting point, never a lock — and an overridden value keeps the manual
 * tag so a month later you can still see which figures were computed. */
function Derived({ label, value, hint, color = C.text, overridden, onOverride, onClear }: {
  label: string; value: string; hint?: string; color?: string
  overridden?: number; onOverride?: (n: number) => void; onClear?: () => void
}) {
  const manual = overridden != null
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <Tag tone={manual ? C.amber : C.dim}>{manual ? 'manual' : 'auto'}</Tag>
      </div>
      {manual && onOverride ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="number" value={overridden} onChange={e => onOverride(parseFloat(e.target.value) || 0)}
            style={{ ...iStyle, color: C.amber, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }} />
          <button onClick={onClear} title="Back to the calculated value"
            style={{ padding: '0 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Reset</button>
        </div>
      ) : (
        <div style={{ ...derivedStyle, color, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span>{value}</span>
          {onOverride && (
            <button onClick={() => onOverride(0)} title="Enter this by hand"
              style={{ background: 'none', border: 'none', color: C.dim, fontSize: 10, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>edit</button>
          )}
        </div>
      )}
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{hint}</div>}
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

/* iOS-style switch. Used where the choice is genuinely on/off — a segmented
 * control is better when two named alternatives both need naming. */
function Switch({ on, onChange, label, hint }: {
  on: boolean; onChange: (v: boolean) => void; label: string; hint?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
      <button onClick={() => onChange(!on)} role="switch" aria-checked={on} style={{
        width: 38, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 1, cursor: 'pointer',
        border: 'none', padding: 0, position: 'relative',
        background: on ? C.orange : '#2A3444', transition: 'background 0.18s',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: on ? 19 : 3, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'left 0.18s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: C.faint, marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
      </div>
    </div>
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
      borderRadius: 9, fontWeight: 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1,
      padding: size === 'sm' ? '5px 11px' : '8px 15px', fontSize: size === 'sm' ? 11.5 : 12.5,
      whiteSpace: 'nowrap', ...tones[tone],
    }}>{children}</button>
  )
}

function Note({ tone = C.blue, children }: { tone?: string; children: ReactNode }) {
  return (
    <div style={{ padding: '9px 13px', borderRadius: 9, background: `${tone}0F`, border: `1px solid ${tone}33`, fontSize: 11.5, color: tone, lineHeight: 1.55 }}>{children}</div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <div style={{ padding: '34px 20px', textAlign: 'center', color: C.faint, fontSize: 12.5, lineHeight: 1.7 }}>{children}</div>
}

/* Dense financial tables: numerals monospace and right aligned, so a column
 * reads as a column of figures rather than of words. */
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

function Modal({ title, subtitle, width = 760, onClose, children, footer }: {
  title: string; subtitle?: string; width?: number; onClose: () => void; children: ReactNode; footer?: ReactNode
}) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width, maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
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

function Grid({ cols, children }: { cols: number; children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 12 }}>{children}</div>
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</div>
        {note && <div style={{ fontSize: 11, color: C.faint, marginTop: 4, maxWidth: 640, lineHeight: 1.6, minHeight: 17 }}>{note}</div>}
      </div>
      {children}
    </div>
  )
}

function KV({ k, v, tone = C.text, bold }: { k: string; v: string; tone?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 11, color: C.faint }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: bold ? 800 : 600, color: tone, fontFamily: 'ui-monospace, monospace' }}>{v}</span>
    </div>
  )
}

/* ==========================================================================
 * 2  The costing view
 *
 * One place turns logs plus dated rates into days, so the Daily table, the
 * Holes table, the Overview and the invoice can never disagree. If a number
 * appears in two tabs it came from the same call.
 * ========================================================================== */

interface RigMonthView {
  hasLogs: boolean
  ownership?: RigOwnership
  ob: OwnershipBreakdown
  operating?: OperatingRate
  clientRate?: ClientRate
  days: DayCostMTD[]
  roll: Rollup
  holes: HoleResult[]
  unallocated: number
  unallocatedDays: number
  budgetOwnershipCPU: number
  productionVariancePct: number
  // The committee assigns one rock category for the whole project. If the logs
  // disagree, every metre is underpriced and there is no line item to recover
  // it — so the mismatch is surfaced rather than left to final billing.
  loggedFormation: string
}

const EMPTY_OB: OwnershipBreakdown = {
  landedPrice: 0, depPerYear: 0, depPerMonth: 0, emi: 0,
  emiActive: false, emiMonthsLeft: 0, insurancePerMonth: 0, otherFixedPerMonth: 0,
  perMonth: 0, perDay: 0, perUnit: 0, basisLabel: '',
}

function useRigMonthView(project: string, rig: string, month: string): RigMonthView {
  const { state } = useCosting()
  const { state: inv } = useInventory()

  return useMemo(() => {
    const logs = state.shiftLogs.filter(l => l.rig === rig && l.project === project && monthOf(l.date) === month)
    if (logs.length === 0) {
      return {
        hasLogs: false, ob: EMPTY_OB, days: [], roll: rollup([]),
        holes: [], unallocated: 0, unallocatedDays: 0,
        budgetOwnershipCPU: 0, productionVariancePct: 0, loggedFormation: '',
      }
    }

    const ownVersions = state.ownership.filter(o => o.rig === rig)
    const opVersions = state.operating.filter(o => o.rig === rig && o.project === project)
    const crVersions = state.clientRates.filter(c => c.project === project)

    const monthEnd = `${month}-${String(daysInMonth(month)).padStart(2, '0')}`
    const lastLogged = logs.map(l => l.date).sort()[logs.length - 1]
    const lastDay = Math.min(Number(lastLogged.slice(8)), Number(monthEnd.slice(8)))

    const ownership = versionOn(ownVersions, monthEnd)
    const ob = ownership ? ownershipBreakdown(ownership, month) : EMPTY_OB
    const operating = versionOn(opVersions, monthEnd)
    const clientRate = versionOn(crVersions, monthEnd)

    const totalUnits = logs.reduce((s, l) => s + l.metresDrilled, 0)
    const partsPerU = partsPerUnitFor(rig, project, totalUnits, inv.purchaseOrders)

    const raw: DayCost[] = []
    const depthByHole: Record<string, number> = {}

    for (let n = 1; n <= lastDay; n++) {
      const date = `${month}-${String(n).padStart(2, '0')}`
      const shifts = logs.filter(l => l.date === date)
      const maint = state.maintenance.filter(m => m.rig === rig && m.project === project && m.date === date)
      const op = versionOn(opVersions, date) ?? blankOperating(rig, project, date)
      const own = versionOn(ownVersions, date) ?? blankOwnership(rig, date)
      const obDay = versionOn(ownVersions, date) ? ownershipBreakdown(own, month) : EMPTY_OB
      const cr = versionOn(crVersions, date)

      const hole = shifts.find(s => s.holeNumber)?.holeNumber ?? null
      const depthSoFar = hole ? (depthByHole[hole] ?? 0) : 0

      const d = dayCost(date, rig, project, shifts, maint, op, own, obDay, cr, partsPerU, depthSoFar)
      if (hole) depthByHole[hole] = depthSoFar + d.units
      raw.push(d)
    }

    const days = withCumulative(raw)
    const roll = rollup(raw)

    const holes = state.holes
      .filter(h => h.rig === rig && h.project === project)
      .map(h => holeResult(h, raw))
      .filter(h => h.days.length > 0)
      .sort((a, b) => a.hole.startDate.localeCompare(b.hole.startDate))

    const orphan = raw.filter(d => !d.holeNumber)

    // Most common lithology in the logs, for the category check.
    const counts: Record<string, number> = {}
    logs.forEach(l => { if (l.formationType) counts[l.formationType] = (counts[l.formationType] || 0) + l.metresDrilled })
    const loggedFormation = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''

    return {
      hasLogs: true, ownership, ob, operating, clientRate, days, roll, holes,
      unallocated: orphan.reduce((s, d) => s + d.total, 0),
      unallocatedDays: orphan.length,
      budgetOwnershipCPU: ownership && ownership.expectedUnitsPerMonth > 0 ? ob.perMonth / ownership.expectedUnitsPerMonth : 0,
      productionVariancePct: ownership && ownership.expectedUnitsPerMonth > 0
        ? ((roll.units - ownership.expectedUnitsPerMonth) / ownership.expectedUnitsPerMonth) * 100 : 0,
      loggedFormation,
    }
  }, [state, inv.purchaseOrders, project, rig, month])
}

/* Billing works across the whole project: a hole is billed when approved,
 * whichever rig drilled it and whatever month it closed in. */
function useProjectHoles(project: string): HoleResult[] {
  const { state } = useCosting()
  const { state: inv } = useInventory()

  return useMemo(() => {
    const crVersions = state.clientRates.filter(c => c.project === project)
    const projectHoles = state.holes.filter(h => h.project === project)
    const keys = new Set<string>()
    state.shiftLogs
      .filter(l => l.project === project && projectHoles.some(h => h.holeNumber === l.holeNumber))
      .forEach(l => keys.add(`${l.rig}|${monthOf(l.date)}`))

    const allDays: DayCost[] = []
    Array.from(keys).forEach(k => {
      const [rig, month] = k.split('|')
      const logs = state.shiftLogs.filter(l => l.rig === rig && l.project === project && monthOf(l.date) === month)
      if (!logs.length) return
      const ownV = state.ownership.filter(o => o.rig === rig)
      const opV = state.operating.filter(o => o.rig === rig && o.project === project)
      const lastDay = Number(logs.map(l => l.date).sort()[logs.length - 1].slice(8))
      const totalUnits = logs.reduce((s, l) => s + l.metresDrilled, 0)
      const ppu = partsPerUnitFor(rig, project, totalUnits, inv.purchaseOrders)
      const depthByHole: Record<string, number> = {}
      for (let n = 1; n <= lastDay; n++) {
        const date = `${month}-${String(n).padStart(2, '0')}`
        const shifts = logs.filter(l => l.date === date)
        const maint = state.maintenance.filter(m => m.rig === rig && m.project === project && m.date === date)
        const op = versionOn(opV, date) ?? blankOperating(rig, project, date)
        const own = versionOn(ownV, date) ?? blankOwnership(rig, date)
        const ob = versionOn(ownV, date) ? ownershipBreakdown(own, month) : EMPTY_OB
        const cr = versionOn(crVersions, date)
        const hole = shifts.find(s => s.holeNumber)?.holeNumber ?? null
        const depthSoFar = hole ? (depthByHole[hole] ?? 0) : 0
        const d = dayCost(date, rig, project, shifts, maint, op, own, ob, cr, ppu, depthSoFar)
        if (hole) depthByHole[hole] = depthSoFar + d.units
        allDays.push(d)
      }
    })

    return projectHoles
      .map(h => holeResult(h, allDays))
      .filter(h => h.days.length > 0)
      .sort((a, b) => (b.hole.endDate || '9999').localeCompare(a.hole.endDate || '9999'))
  }, [state, inv.purchaseOrders, project])
}

/* ==========================================================================
 * 3  Set rates
 * ========================================================================== */

type Section = 'rig' | 'operating' | 'client'

/* Effective dates are forward-only: a new set of rates can start today or
 * later, never before the last one. That is what makes history trustworthy —
 * nothing already costed can be rewritten from behind. */
function nextAllowedDate(latest: string | undefined): string {
  const today = new Date().toISOString().slice(0, 10)
  if (!latest) return today
  const d = new Date(latest + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  const after = d.toISOString().slice(0, 10)
  return after > today ? after : today
}

function SetRatesModal({ projects, initialProject, initialRig, rigsForProject, month, onClose }: {
  projects: string[]
  initialProject: string
  initialRig: string
  rigsForProject: (p: string) => string[]
  month: string
  onClose: () => void
}) {
  const { state, saveOwnership, saveOperating, saveClientRate } = useCosting()
  const [project, setProject] = useState(initialProject)
  const [rig, setRig] = useState(initialRig)
  const [confirmed, setConfirmed] = useState(false)
  const [section, setSection] = useState<Section>('operating')

  const rigs = rigsForProject(project)
  useEffect(() => { if (!rigs.includes(rig)) setRig(rigs[0] ?? '') }, [rigs, rig])

  // Which rig and project a rate belongs to is recorded on every version, so
  // the history can say exactly what was changed and where.
  if (!confirmed) {
    return (
      <Modal title="Set rates" subtitle="Which rig and project are these rates for?" width={620} onClose={onClose}
        footer={<><Btn onClick={onClose}>Cancel</Btn>
          <Btn tone="primary" disabled={!project || !rig} onClick={() => setConfirmed(true)}>Continue</Btn></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Project">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {projects.map(p => <Pick key={p} on={project === p} onClick={() => setProject(p)} title={p} sub={PROJECT_CLIENTS[p] || '—'} />)}
            </div>
          </Field>
          <Field label="Rig">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rigs.length === 0
                ? <span style={{ fontSize: 12, color: C.faint }}>No rigs on this project yet.</span>
                : rigs.map(r => <Pick key={r} on={rig === r} onClick={() => setRig(r)} title={r}
                    sub={state.ownership.some(o => o.rig === r) ? 'rig cost set' : 'no rig cost'} />)}
            </div>
          </Field>
          <Note tone={C.dim}>
            Rig cost applies to this rig on every project. Operating cost applies to this rig on this project.
            Client cost applies to the whole project, whichever rig drills it.
          </Note>
        </div>
      </Modal>
    )
  }

  const ownVersions = newestFirst(state.ownership.filter(o => o.rig === rig))
  const opVersions = newestFirst(state.operating.filter(o => o.rig === rig && o.project === project))
  const crVersions = newestFirst(state.clientRates.filter(c => c.project === project))

  const scope = section === 'rig' ? `${rig} · every project`
    : section === 'operating' ? `${rig} · ${project}`
    : `${project} · every rig`

  return (
    <Modal title="Set rates" subtitle={scope} width={980} onClose={onClose}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SideItem on={section === 'rig'} onClick={() => setSection('rig')} label="Rig cost" />
          <SideItem on={section === 'operating'} onClick={() => setSection('operating')} label="Operating cost" />
          <SideItem on={section === 'client'} onClick={() => setSection('client')} label="Client cost" />

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.dim, lineHeight: 1.6 }}>
              {project}<br />{rig}
            </div>
            <button onClick={() => setConfirmed(false)}
              style={{ marginTop: 8, background: 'none', border: 'none', color: C.faint, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}>
              Change
            </button>
          </div>
        </div>

        {/* Panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {section === 'rig' && <RigCostPanel rig={rig} month={month} versions={ownVersions}
            onSave={(o, from, why) => saveOwnership({ ...o, effectiveFrom: from, note: why })} />}
          {section === 'operating' && <OperatingPanel rig={rig} project={project} versions={opVersions}
            onSave={(o, from, why) => saveOperating({ ...o, effectiveFrom: from, note: why })} />}
          {section === 'client' && <ClientPanel project={project} versions={crVersions}
            onSave={(c, from, why) => saveClientRate({ ...c, effectiveFrom: from, note: why })} />}
        </div>
      </div>
    </Modal>
  )
}

function SideItem({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '8px 12px', borderRadius: 8,
      fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit',
      background: on ? 'rgba(249,115,22,0.12)' : 'transparent',
      border: 'none', borderLeft: `2px solid ${on ? C.orange : 'transparent'}`,
      color: on ? C.orange : C.muted, width: '100%',
    }}>{label}</button>
  )
}

function SaveRow({ onSave, label }: { onSave: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
      <Btn tone="primary" onClick={onSave}>{label}</Btn>
    </div>
  )
}

function RigCostPanel({ rig, month, versions, onSave }: {
  rig: string; month: string; versions: RigOwnership[]; onSave: (o: RigOwnership, from: string, why: string) => void
}) {
  const latest = versions[0]
  const minDate = nextAllowedDate(latest?.effectiveFrom)
  const [f, setF] = useState<RigOwnership>(() => latest ? { ...latest, id: uid('own') } : blankOwnership(rig, minDate))
  const [confirm, setConfirm] = useState(false)
  const u = (p: Partial<RigOwnership>) => setF(x => ({ ...x, ...p }))
  const b = ownershipBreakdown(f, month)

  return (
    <div>
      <InForce text={latest ? `${money(ownershipBreakdown(latest, month).perDay)}/day since ${fullDate(latest.effectiveFrom)}` : 'nothing set yet'} />

      {/* Both columns: one-line header, then a 2x2 grid, so the two sides line
          up on both axes. Depreciation's fourth cell is deliberately empty. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 18, alignItems: 'start' }}>
        <Section title="Landed cost" note="What the rig cost to put on site.">
          <Grid cols={2}>
            <NumField label="Basic price" value={f.basicPrice} onChange={n => u({ basicPrice: n })} suffix="₹" />
            <NumField label="GST" value={f.gstPercent} onChange={n => u({ gstPercent: n })} suffix="%" />
            <NumField label="Transportation" value={f.transportation} onChange={n => u({ transportation: n })} suffix="₹" />
            <Derived label="Landed price" value={money(b.landedPrice)} color={C.orange}
              overridden={f.landedPriceOverride} onOverride={n => u({ landedPriceOverride: n })}
              onClear={() => u({ landedPriceOverride: undefined })} />
          </Grid>
        </Section>
        <Section title="Depreciation" note="Straight line on the landed price.">
          <Grid cols={2}>
            <NumField label="Rate per year" value={f.depreciationRatePct} onChange={n => u({ depreciationRatePct: n })} suffix="%" />
            <Derived label="Per year" value={money(b.depPerYear)} color={C.muted} />
            <Derived label="Per month" value={money(b.depPerMonth)} color={C.purple}
              overridden={f.depPerMonthOverride} onOverride={n => u({ depPerMonthOverride: n })}
              onClear={() => u({ depPerMonthOverride: undefined })} />
            <div />
          </Grid>
        </Section>
      </div>

      <div style={{ marginTop: 22 }}>
        <Section title="Finance" note="Enter the EMI you actually pay each month.">
          <Grid cols={4}>
            <NumField label="EMI per month" value={f.emiPerMonth} onChange={n => u({ emiPerMonth: n })} suffix="₹" color={C.blue} />
            <Field label="EMI ends" hint="Optional. Without it a closed loan keeps charging forever.">
              <input type="month" value={f.emiEndsMonth ?? ''} onChange={e => u({ emiEndsMonth: e.target.value || undefined })}
                style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
            <NumField label="Insurance per year" value={f.insurancePerYear} onChange={n => u({ insurancePerYear: n })} suffix="₹" />
            <NumField label="Other fixed / month" value={f.otherFixedPerMonth} onChange={n => u({ otherFixedPerMonth: n })} suffix="₹" />
          </Grid>
          {f.emiPerMonth > 0 && b.emiMonthsLeft >= 0 && (
            <Note tone={b.emiActive ? C.blue : C.green}>
              {b.emiActive
                ? `${b.emiMonthsLeft} payments left after ${monthLabel(month)}. When the loan closes, ownership falls to ${money((b.perMonth - b.emi) / Math.max(1, f.expectedOperatingDays))} per operating day and every hole gets cheaper.`
                : `The loan closed before ${monthLabel(month)}, so ownership is depreciation and insurance only.`}
            </Note>
          )}
        </Section>
      </div>

      <div style={{ marginTop: 22 }}>
        <Section title="Charging rules">
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '2px 14px' }}>
            <Switch on={f.costBasis === 'cash'} onChange={v => u({ costBasis: v ? 'cash' : 'accounting' })}
              label="Include the EMI"
              hint="On, ownership is depreciation + EMI — how the money actually leaves the business. Off counts depreciation only." />
            <div style={{ height: 1, background: C.border }} />
            <Switch on={f.allocationBasis === 'expectedUnit'} onChange={v => u({ allocationBasis: v ? 'expectedUnit' : 'operatingDay' })}
              label="Charge per metre instead of per day"
              hint="Off, ownership lands on every day the rig is on site, so a standby day still carries it. On, it lands only on metres drilled — which makes a breakdown day look free." />
          </div>
          <Grid cols={4}>
            <NumField label="Expected operating days" value={f.expectedOperatingDays} onChange={n => u({ expectedOperatingDays: n })} suffix="/mth" />
            <NumField label="Expected metres" value={f.expectedUnitsPerMonth} onChange={n => u({ expectedUnitsPerMonth: n })} suffix="m/mth" />
            <div /><div />
          </Grid>
        </Section>
      </div>

      <Result title="What XPLORIX will charge" tag="ownership"
        pairs={[['Depreciation', money(b.depPerMonth), false], ['EMI', b.emi > 0 ? money(b.emi) : '—', b.emi === 0],
                ['Insurance', money(b.insurancePerMonth), false], ['Other fixed', money(b.otherFixedPerMonth), b.otherFixedPerMonth === 0]]}
        total={money(b.perMonth)} basis={b.basisLabel}
        answer={f.allocationBasis === 'expectedUnit' ? perUnit(b.perUnit) : `${money(b.perDay)}/day`} />

      <SaveRow label="Save rig cost" onSave={() => setConfirm(true)} />
      {confirm && <SaveDialog minDate={minDate} replacing={latest ? `${money(ownershipBreakdown(latest, month).perDay)}/day` : 'nothing'}
        onCancel={() => setConfirm(false)} onSave={(from, why) => { onSave(f, from, why); setConfirm(false) }} />}
    </div>
  )
}

function InForce({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 11, color: C.faint }}>
      Currently in force: <span style={{ color: C.text, fontFamily: 'ui-monospace, monospace' }}>{text}</span>
    </div>
  )
}

function Result({ title, tag, pairs, total, basis, answer }: {
  title: string; tag: string; pairs: [string, string, boolean][]; total: string; basis: string; answer: string
}) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{title}</span>
        <Tag tone={C.purple}>{tag}</Tag>
      </div>
      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
        {pairs.map(([k, v, dim]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 11, color: C.faint }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: dim ? C.dim : C.text, fontFamily: 'ui-monospace, monospace' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: C.border, margin: '13px 0' }} />
      <div style={{ fontSize: 13, color: C.muted, fontFamily: 'ui-monospace, monospace', display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span>{total}</span><span style={{ color: C.dim }}>{basis}</span><span style={{ color: C.dim }}>=</span>
        <span style={{ color: C.purple, fontWeight: 900, fontSize: 18 }}>{answer}</span>
      </div>
    </div>
  )
}

/* Date and reason are asked at the moment of saving, not while you are
 * entering numbers. Forward-only: a new set of rates starts today or later,
 * never before the last one, so nothing already costed can be rewritten. */
function SaveDialog({ minDate, replacing, onCancel, onSave }: {
  minDate: string; replacing: string; onCancel: () => void; onSave: (from: string, why: string) => void
}) {
  const [from, setFrom] = useState(minDate)
  const [why, setWhy] = useState('')
  const tooEarly = from < minDate
  return (
    <Modal title="When do these rates start?" subtitle={`Replacing ${replacing}`} width={520} onClose={onCancel}
      footer={<><Btn onClick={onCancel}>Cancel</Btn>
        <Btn tone="primary" disabled={tooEarly || !why.trim()} onClick={() => onSave(from, why.trim())}>Save rates</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DateField label="New rates start" value={from} onChange={setFrom} />
        <TextField label="Why" value={why} onChange={setWhy} placeholder="e.g. committee reclassification, fuel revision"
          hint="Shows in Rates history, so a year from now the change explains itself." />
        {tooEarly
          ? <Note tone={C.red}>Rates can only start on {fullDate(minDate)} or later — earlier work keeps the rate it was done under.</Note>
          : <Note tone={C.dim}>Work before {fullDate(from)} keeps the rate it was done under. Nothing already costed changes.</Note>}
      </div>
    </Modal>
  )
}

function OperatingPanel({ rig, project, versions, onSave }: {
  rig: string; project: string; versions: OperatingRate[]; onSave: (o: OperatingRate, from: string, why: string) => void
}) {
  const latest = versions[0]
  const minDate = nextAllowedDate(latest?.effectiveFrom)
  const [f, setF] = useState<OperatingRate>(() => latest ? { ...latest, id: uid('op') } : blankOperating(rig, project, minDate))
  const [confirm, setConfirm] = useState(false)
  const u = (p: Partial<OperatingRate>) => setF(x => ({ ...x, ...p }))
  const per = f.chargePerMetre ? '₹/m' : ''

  return (
    <div>
      <InForce text={latest ? `fuel ₹${latest.fuelPricePerLitre}/L, labour ${money(latest.labourRate)} since ${fullDate(latest.effectiveFrom)}` : 'nothing set yet'} />

      <div style={{ marginTop: 14 }}>
        <Note tone={C.dim}>
          Fuel, water, additives, metres and crew count come from the driller&apos;s log. Repairs come from the maintenance log,
          parts and tooling from inventory. Only the rates below are set here.
        </Note>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title="Unit prices" note="Consumption comes from the log; these turn it into rupees.">
          <Grid cols={3}>
            <NumField label="Fuel" value={f.fuelPricePerLitre} onChange={n => u({ fuelPricePerLitre: n })} suffix="₹/L" color={C.amber} />
            <NumField label="Water" value={f.waterPricePerLitre} onChange={n => u({ waterPricePerLitre: n })} suffix="₹/L" />
            <NumField label="Additives" value={f.additivePricePerKg} onChange={n => u({ additivePricePerKg: n })} suffix="₹/kg" />
          </Grid>
        </Section>
      </div>

      <div style={{ marginTop: 20 }}>
        <Section title="Labour">
          <Grid cols={3}>
            <NumField label="Labour cost" value={f.labourRate} onChange={n => u({ labourRate: n })}
              suffix={per || '₹'} color={C.blue} hint={f.chargePerMetre ? 'per metre drilled' : 'per head, per shift'} />
            <NumField label="Lodging cost" value={f.lodgingRate} onChange={n => u({ lodgingRate: n })}
              suffix={per || '₹'} hint={f.chargePerMetre ? 'per metre drilled' : 'per head, per night'} />
            <NumField label="Transportation cost" value={f.transportRate} onChange={n => u({ transportRate: n })}
              suffix={per || '₹/day'} hint={f.chargePerMetre ? 'per metre drilled' : 'per day on site'} />
          </Grid>
        </Section>
      </div>

      <div style={{ marginTop: 20 }}>
        <Section title="Charging rules">
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '2px 14px' }}>
            <Switch on={f.chargePerMetre} onChange={v => u({ chargePerMetre: v })}
              label="Charge per metre instead of per day"
              hint="Off, labour follows the crew count in the log and a standby day still costs. On, the three rates above are charged against metres drilled and crew count stops affecting cost." />
          </div>
        </Section>
      </div>

      <SaveRow label="Save operating cost" onSave={() => setConfirm(true)} />
      {confirm && <SaveDialog minDate={minDate} replacing={latest ? `fuel ₹${latest.fuelPricePerLitre}/L` : 'nothing'}
        onCancel={() => setConfirm(false)} onSave={(from, why) => { onSave(f, from, why); setConfirm(false) }} />}
    </div>
  )
}

/* One row per tender line: a size, a formation, a rate. Adjustments hang off
 * their own row because that is how the tender writes them. */
function ClientPanel({ project, versions, onSave }: {
  project: string; versions: ClientRate[]; onSave: (c: ClientRate, from: string, why: string) => void
}) {
  const latest = versions[0]
  const minDate = nextAllowedDate(latest?.effectiveFrom)
  const [f, setF] = useState<ClientRate>(() => latest ? { ...latest, id: uid('cr') } : blankClientRate(project, minDate))
  const [confirm, setConfirm] = useState(false)
  const u = (p: Partial<ClientRate>) => setF(x => ({ ...x, ...p }))
  const updRow = (i: number, p: Partial<RateRow>) => u({ rateRows: f.rateRows.map((r, j) => j === i ? { ...r, ...p } : r) })
  const updAdj = (i: number, j: number, p: Partial<RateAdjustment>) =>
    updRow(i, { adjustments: f.rateRows[i].adjustments.map((a, k) => k === j ? { ...a, ...p } : a) })

  const inForce = latest && latest.rateRows.length
    ? `${latest.rateRows.length} rate lines since ${fullDate(latest.effectiveFrom)}`
    : 'nothing set yet'

  return (
    <div>
      <InForce text={inForce} />

      <div style={{ marginTop: 18 }}>
        <Section title="Rates" note="One line per size and formation, straight off the tender schedule. The driller's log records both, so XPLORIX picks the matching line for each day.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {f.rateRows.map((r, i) => (
              <div key={r.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ width: 92 }}>
                    <Field label="Size">
                      <select value={r.holeSize} onChange={e => updRow(i, { holeSize: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
                        {HOLE_SIZES.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ width: 160 }}>
                    <Field label="Formation">
                      <select value={r.formation} onChange={e => updRow(i, { formation: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
                        {ROCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        {r.formation && !ROCK_CATEGORIES.includes(r.formation) && <option value={r.formation}>{r.formation}</option>}
                      </select>
                    </Field>
                  </div>
                  <div style={{ width: 140 }}>
                    <NumField label="Rate" value={r.rate} onChange={n => updRow(i, { rate: n })} suffix="₹/m" color={C.orange} />
                  </div>
                  <div style={{ flex: 1 }} />
                  <Btn size="sm" onClick={() => updRow(i, { adjustments: [...r.adjustments, { id: uid('a'), condition: 'above', depth: 400, adjustPct: -20 }] })}>
                    Add adjustment
                  </Btn>
                  {f.rateRows.length > 1 && <Btn size="sm" tone="danger" onClick={() => u({ rateRows: f.rateRows.filter((_, j) => j !== i) })}>Remove</Btn>}
                </div>

                {r.adjustments.map((a, j) => (
                  <div key={a.id} style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.faint }}>When drilled</span>
                    <select value={a.condition} onChange={e => updAdj(i, j, { condition: e.target.value as 'above' | 'below' })} style={{ ...iStyle, width: 92, cursor: 'pointer' }}>
                      <option value="above">above</option><option value="below">below</option>
                    </select>
                    <input type="number" value={a.depth} onChange={e => updAdj(i, j, { depth: parseFloat(e.target.value) || 0 })}
                      style={{ ...iStyle, width: 80, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
                    <span style={{ fontSize: 12, color: C.faint }}>m, adjust rate by</span>
                    <input type="number" value={a.adjustPct} onChange={e => updAdj(i, j, { adjustPct: parseFloat(e.target.value) || 0 })}
                      style={{ ...iStyle, width: 72, textAlign: 'right', color: a.adjustPct < 0 ? C.red : C.green, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }} />
                    <span style={{ fontSize: 12, color: C.faint }}>%</span>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: 'ui-monospace, monospace' }}>
                      → {perUnit(r.rate * (1 + a.adjustPct / 100))}
                    </span>
                    <Btn size="sm" tone="danger" onClick={() => updRow(i, { adjustments: r.adjustments.filter((_, k) => k !== j) })}>Remove</Btn>
                  </div>
                ))}
              </div>
            ))}
            <div>
              <Btn size="sm" onClick={() => u({ rateRows: [...f.rateRows, { id: uid('r'), holeSize: 'HQ', formation: 'Hard rock', rate: 0, adjustments: [] }] })}>
                Add rate
              </Btn>
            </div>
          </div>
        </Section>
      </div>

      <div style={{ marginTop: 20 }}>
        <Section title="Other billable lines">
          <Grid cols={3}>
            <NumField label="Standby" value={f.standbyPerDay} onChange={n => u({ standbyPerDay: n })} suffix="₹/day" color={C.amber}
              hint="Billed when the client stops work" />
            <NumField label="Mobilisation" value={f.mobilisation} onChange={n => u({ mobilisation: n })} suffix="₹" />
            <NumField label="Demobilisation" value={f.demobilisation} onChange={n => u({ demobilisation: n })} suffix="₹" />
          </Grid>
        </Section>
      </div>

      <SaveRow label="Save client cost" onSave={() => setConfirm(true)} />
      {confirm && <SaveDialog minDate={minDate} replacing={inForce}
        onCancel={() => setConfirm(false)} onSave={(from, why) => { onSave(f, from, why); setConfirm(false) }} />}
    </div>
  )
}

/* ==========================================================================
 * 4  Rates history
 * ========================================================================== */

function RatesHistoryModal({ project, rig, onClose }: { project: string; rig: string; onClose: () => void }) {
  const { state, deleteVersion } = useCosting()
  const today = new Date().toISOString().slice(0, 10)

  const rows: { kind: VersionKind; id: string; from: string; scope: string; what: string; detail: string; note?: string; live: boolean }[] = []

  const ownV = newestFirst(state.ownership.filter(o => o.rig === rig))
  ownV.forEach((o, i) => {
    const b = ownershipBreakdown(o, monthOf(o.effectiveFrom))
    rows.push({
      kind: 'ownership', id: o.id, from: o.effectiveFrom, scope: o.rig, what: 'Rig cost',
      detail: `${money(b.perMonth)}/month · ${money(b.perDay)}/day · ${o.costBasis} basis`,
      note: o.note, live: i === 0 && o.effectiveFrom <= today,
    })
  })

  const opV = newestFirst(state.operating.filter(o => o.rig === rig && o.project === project))
  opV.forEach((o, i) => rows.push({
    kind: 'operating', id: o.id, from: o.effectiveFrom, scope: `${o.rig} · ${o.project}`, what: 'Operating cost',
    detail: `Fuel ₹${o.fuelPricePerLitre}/L · labour ${money(o.labourRate)} · lodging ${money(o.lodgingRate)} · transport ${money(o.transportRate)}`,
    note: o.note, live: i === 0 && o.effectiveFrom <= today,
  }))

  const crV = newestFirst(state.clientRates.filter(c => c.project === project))
  crV.forEach((c, i) => rows.push({
    kind: 'clientRate', id: c.id, from: c.effectiveFrom, scope: c.project, what: 'Client cost',
    detail: c.rateRows.map(r => `${r.holeSize} ${r.formation} ${perUnit(r.rate)}`).join(' · ') + ` · standby ${money(c.standbyPerDay)}/day`,
    note: c.note, live: i === 0 && c.effectiveFrom <= today,
  }))

  rows.sort((a, b) => b.from.localeCompare(a.from))

  return (
    <Modal title="Rates history" subtitle={`${rig} · ${project} — every rate change, and what was in force when`} width={900} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Note tone={C.blue}>
          Costing looks up the rate in force on each day, so changing a rate never rewrites work already done.
          A hole closed in March keeps its March rate, and an invoice you have already sent cannot quietly stop matching the screen.
        </Note>

        {rows.length === 0 ? <Empty>No rates set yet.</Empty> : (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={tableStyle}>
              <thead>
                <tr><th style={th}>Effective from</th><th style={th}>What</th><th style={th}>Scope</th><th style={th}>Detail</th><th style={th} /></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>
                      {fullDate(r.from)}
                      {r.live && <span style={{ marginLeft: 8 }}><Tag tone={C.green}>in force</Tag></span>}
                      {r.from > today && <span style={{ marginLeft: 8 }}><Tag tone={C.blue}>scheduled</Tag></span>}
                    </td>
                    <td style={td}><Tag tone={r.what === 'Client cost' ? LAYER.revenue : r.what === 'Rig cost' ? LAYER.ownership : LAYER.operating}>{r.what}</Tag></td>
                    <td style={td}>{r.scope}</td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 340, lineHeight: 1.6 }}>
                      {r.detail}
                      {r.note && <div style={{ fontSize: 10, color: C.dim, marginTop: 3 }}>{r.note}</div>}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <Btn size="sm" tone="danger" onClick={() => deleteVersion(r.kind, r.id)}>Delete</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * 5  Tabs
 * ========================================================================== */

function OverviewTab({ v, rig, month, onSetRates }: { v: RigMonthView; rig: string; month: string; onSetRates: () => void }) {
  if (!v.hasLogs) {
    return <Card><Empty>No driller logs for {rig} in {monthLabel(month)}.<br />Costing reads metres, hours, crew and fuel from the log — once shifts are recorded, they cost out here automatically.</Empty></Card>
  }

  const r = v.roll
  const unit = 'm'
  const rate = r.revenuePerUnit
  const ownershipGap = r.ownershipCPU - v.budgetOwnershipCPU

  // Metres drilled with no matching rate line bill at zero, so it is surfaced
  // rather than quietly lost.
  const unmatchedDays = v.days.filter(d => d.unmatched)
  const unmatchedUnits = unmatchedDays.reduce((a, d) => a + d.units, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(!v.ownership || !v.operating) && (
        <Note tone={C.amber}>
          {!v.ownership && <>No rig cost set for {rig}, so ownership counts as zero and every figure below is understated. </>}
          {!v.operating && <>No operating rates set. </>}
          <button onClick={onSetRates} style={{ background: 'none', border: 'none', color: C.amber, textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>Set rates</button>
        </Note>
      )}

      {r.missingDays > 0 && (
        <Note tone={C.red}>
          {r.missingDays} {r.missingDays === 1 ? 'day has' : 'days have'} no shift log. They are costed as standby but bill nothing —
          a missing submission must never invent revenue. Get the logs in, or confirm those days were standby.
        </Note>
      )}

      {unmatchedUnits > 0 && (
        <Note tone={C.red}>
          {unmatchedUnits} m drilled with no matching rate line — the logs record a size and formation the client rate has no
          row for, so those metres bill at zero. Add the missing line in Set rates rather than letting it reach an invoice.
        </Note>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        <Stat label="Metres drilled" value={`${r.units} ${unit}`} note={`${r.drillingDays} drilling days`} big />
        <Stat label="Full cost" value={moneyL(r.total)} note="operating + ownership" color={LAYER.full} big />
        <Stat label="Cost per metre" value={perUnit(r.cpu)}
          note="what one unit actually costs" color={rate ? cpuColor(r.cpu, rate) : LAYER.full} big />
        <Stat label="Margin" value={r.revenue > 0 ? moneyL(r.margin) : '—'}
          note={r.revenue > 0 ? `${pct(r.marginPct)} of ${moneyL(r.revenue)}` : 'no client rate set'}
          color={r.revenue > 0 ? marginColor(r.margin) : C.faint} big />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        <LayerCard tone={LAYER.operating} title="Operating cost" value={moneyL(r.operating)} rate={perUnit(r.operatingCPU)}
          note="Fuel, water, additives, crew, repairs, parts. What running the rig consumed." />
        <LayerCard tone={LAYER.ownership} title="Ownership cost" value={moneyL(r.ownership)} rate={perUnit(r.ownershipCPU)}
          note={`${v.ob.basisLabel || 'not configured'}. Due whether or not a metre gets drilled.`} />
        <LayerCard tone={LAYER.full} title="Full cost" value={moneyL(r.total)} rate={perUnit(r.cpu)}
          note="The only figure that should ever be compared against a client rate." />
      </div>

      {v.ownership && v.ownership.expectedUnitsPerMonth > 0 && (
        <Card title="Budget against actual"
          subtitle="Ownership per metre assumes a monthly output. Miss it and the same fixed cost lands on fewer metres."
          accent={Math.abs(v.productionVariancePct) > 5 ? C.amber : undefined}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 20 }}>
            <Compare label="Metres" budget={`${v.ownership.expectedUnitsPerMonth} ${unit}`} actual={`${r.units} ${unit}`}
              delta={`${v.productionVariancePct >= 0 ? '+' : ''}${v.productionVariancePct.toFixed(1)}%`}
              tone={v.productionVariancePct >= 0 ? C.green : C.red} />
            <Compare label="Operating days" budget={`${v.ownership.expectedOperatingDays}`} actual={`${r.days - r.missingDays}`}
              delta={`${(r.days - r.missingDays) - v.ownership.expectedOperatingDays >= 0 ? '+' : ''}${(r.days - r.missingDays) - v.ownership.expectedOperatingDays}`}
              tone={(r.days - r.missingDays) >= v.ownership.expectedOperatingDays ? C.green : C.amber} />
            <Compare label="Ownership per metre" budget={perUnit(v.budgetOwnershipCPU)} actual={perUnit(r.ownershipCPU)}
              delta={`${ownershipGap >= 0 ? '+' : ''}${money(ownershipGap)}/${unit}`} tone={ownershipGap <= 0 ? C.green : C.red} />
            <Compare label="Ownership charged" budget={money(v.ob.perMonth)} actual={money(r.ownership)}
              delta={r.ownership > v.ob.perMonth ? `over by ${money(r.ownership - v.ob.perMonth)}` : `under by ${money(v.ob.perMonth - r.ownership)}`}
              tone={C.amber} />
          </div>
          <div style={{ marginTop: 18 }}>
            <Note tone={C.amber}>
              The divisor is held steady all month so a day&apos;s cost doesn&apos;t change every time the rig drills. That means the
              total charged to days rarely equals the {money(v.ob.perMonth)} actually due — here it came to {money(r.ownership)},
              a difference of {money(Math.abs(r.ownership - v.ob.perMonth))}. Reconcile it at month close rather than letting it drift into hole costs.
            </Note>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card title="Where the money went" subtitle={`${rig} · ${monthLabel(month)}`} pad={false}
          right={<Btn size="sm" onClick={onSetRates}>Set rates</Btn>}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Cost line</th><th style={th}>From</th><th style={thR}>Amount</th><th style={thR}>Per {unit}</th><th style={thR}>Share</th></tr></thead>
            <tbody>
              {[
                { k: 'Fuel', v: r.fuel, src: `${r.fuelLitres.toLocaleString('en-IN')} L, driller's log` },
                { k: 'Water & additives', v: r.water + r.additives, src: "driller's log" },
                { k: 'Crew', v: r.labour, src: 'crew count from the log' },
                { k: 'Repairs', v: r.repairs, src: 'maintenance log' },
                { k: 'Parts & tooling', v: r.parts, src: 'inventory' },
              ].map(x => (
                <tr key={x.k} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, fontWeight: 600 }}>{x.k}</td>
                  <td style={{ ...td, fontSize: 10, color: C.dim }}>{x.src}</td>
                  <td style={tdN}>{money(x.v)}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.units > 0 ? perUnit(x.v / r.units) : '—'}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((x.v / r.total) * 100) : '—'}</td>
                </tr>
              ))}
              <tr style={{ borderBottom: rowBorder, background: 'rgba(245,158,11,0.05)' }}>
                <td style={{ ...td, color: LAYER.operating, fontWeight: 800 }} colSpan={2}>Operating cost</td>
                <td style={{ ...tdN, color: LAYER.operating, fontWeight: 800 }}>{money(r.operating)}</td>
                <td style={{ ...tdN, color: LAYER.operating }}>{perUnit(r.operatingCPU)}</td>
                <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((r.operating / r.total) * 100) : '—'}</td>
              </tr>
              <tr style={{ borderBottom: rowBorder, background: 'rgba(139,92,246,0.05)' }}>
                <td style={{ ...td, color: LAYER.ownership, fontWeight: 800 }} colSpan={2}>
                  Ownership cost
                  <span style={{ fontSize: 10, color: C.dim, fontWeight: 400 }}> · {money(v.ob.perDay)}/day</span>
                </td>
                <td style={{ ...tdN, color: LAYER.ownership, fontWeight: 800 }}>{money(r.ownership)}</td>
                <td style={{ ...tdN, color: LAYER.ownership }}>{perUnit(r.ownershipCPU)}</td>
                <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((r.ownership / r.total) * 100) : '—'}</td>
              </tr>
              <tr style={{ background: 'rgba(249,115,22,0.08)' }}>
                <td style={{ ...td, color: LAYER.full, fontWeight: 900, fontSize: 13 }} colSpan={2}>Full cost</td>
                <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{money(r.total)}</td>
                <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{perUnit(r.cpu)}</td>
                <td style={tdN} />
              </tr>
            </tbody>
          </table>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Rig ownership" subtitle={v.ownership ? `${rig} · ${v.ownership.costBasis} basis · from ${fullDate(v.ownership.effectiveFrom)}` : 'not set up yet'}>
            {v.ownership ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <KV k="Landed price" v={money(v.ob.landedPrice)} />
                <KV k="Depreciation" v={`${money(v.ob.depPerMonth)}/mth`} />
                <KV k="EMI" v={v.ob.emi > 0 ? `${money(v.ob.emi)}/mth` : 'closed'} tone={v.ob.emi > 0 ? C.text : C.green} />
                <KV k="Insurance" v={`${money(v.ob.insurancePerMonth)}/mth`} />
                <div style={{ height: 1, background: C.border }} />
                <KV k="Ownership" v={`${money(v.ob.perMonth)}/mth`} tone={LAYER.ownership} bold />
                <KV k="Allocated" v={`${money(v.ob.perDay)}/day`} tone={LAYER.ownership} bold />
                {v.ob.emiActive && v.ob.emiMonthsLeft >= 0 && v.ob.emiMonthsLeft <= 24 && (
                  <Note tone={C.green}>{v.ob.emiMonthsLeft} EMI payments left. After that ownership falls to {money((v.ob.perMonth - v.ob.emi) / Math.max(1, v.ownership.expectedOperatingDays))}/day.</Note>
                )}
              </div>
            ) : <Empty>Set the purchase price, depreciation and loan terms and XPLORIX works out the daily cost.</Empty>}
          </Card>

          <Card title="Client rate" subtitle={v.clientRate ? `from ${fullDate(v.clientRate.effectiveFrom)}` : 'not set'}>
            {v.clientRate ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {v.clientRate.rateRows.map(rr => (
                  <KV key={rr.id} k={`${rr.holeSize} · ${rr.formation}`} v={perUnit(rr.rate)} tone={LAYER.revenue} />
                ))}
                <KV k="Standby" v={`${money(v.clientRate.standbyPerDay)}/day`} />
                <KV k="Revenue this month" v={money(r.revenue)} tone={LAYER.revenue} />
                <div style={{ height: 1, background: C.border }} />
                <KV k="Full cost" v={perUnit(r.cpu)} tone={LAYER.full} />
                <KV k="Realised rate" v={perUnit(r.revenuePerUnit)} tone={LAYER.revenue} />
                <KV k="Margin" v={pct(r.marginPct)} tone={marginColor(r.margin)} bold />
              </div>
            ) : <Empty>Set the client rate to see revenue and margin.</Empty>}
          </Card>

          {v.unallocated > 0 && (
            <Card title="Cost carried by no hole" subtitle={`${v.unallocatedDays} days`} accent={C.amber}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.amber, fontFamily: 'ui-monospace, monospace' }}>{money(v.unallocated)}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.7 }}>
                Standby and breakdown days between holes. Shown rather than spread around, because spreading it would make every
                hole look slightly worse and hide where the loss really is.
              </div>
            </Card>
          )}
        </div>
      </div>

    </div>
  )
}

function LayerCard({ tone, title, value, rate, note }: { tone: string; title: string; value: string; rate: string; note: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${tone}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: tone, fontFamily: 'ui-monospace, monospace' }}>{rate}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: tone, fontFamily: 'ui-monospace, monospace', margin: '10px 0 8px' }}>{value}</div>
      <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.6 }}>{note}</div>
    </div>
  )
}

function Compare({ label, budget, actual, delta, tone }: { label: string; budget: string; actual: string; delta: string; tone: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: C.dim, fontFamily: 'ui-monospace, monospace' }}>{budget}</span>
        <span style={{ fontSize: 11, color: C.dim }}>→</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: 'ui-monospace, monospace' }}>{actual}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: tone, marginTop: 5 }}>{delta}</div>
    </div>
  )
}

/* ── DAILY ────────────────────────────────────────────────────────────────
 * A zero-metre day shows its cost with cost-per-unit as "—", never zero: the
 * rig still cost money that day. And a day's rate is never shown alone —
 * today, month to date and the hole run together, because one metre against a
 * full day of cost reads as an enormous rate that means nothing. */

function DailyTab({ v, rig, month }: { v: RigMonthView; rig: string; month: string }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!v.hasLogs) return <Card><Empty>No driller logs for {rig} in {monthLabel(month)}.</Empty></Card>

  const unit = 'm'
  const days = v.days
  const last = days[days.length - 1]
  const lastDrilled = [...days].reverse().find(d => d.units > 0)
  const rate = v.roll.revenuePerUnit
  const currentHole = v.holes.find(h => h.hole.holeNumber === lastDrilled?.holeNumber)
  const zeroDays = days.filter(d => d.units === 0)
  const zeroCost = zeroDays.reduce((s, d) => s + d.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        <Stat label={`Last drilling day · ${lastDrilled ? dayLabel(lastDrilled.date) : '—'}`}
          value={lastDrilled?.cpu != null ? perUnit(lastDrilled.cpu) : '—'}
          note={lastDrilled ? `${lastDrilled.units} ${unit} · ${money(lastDrilled.total)}` : 'nothing drilled yet'}
          color={lastDrilled?.cpu != null && rate ? cpuColor(lastDrilled.cpu, rate) : C.text} big />
        <Stat label="Month to date" value={last?.mtdCPU != null ? perUnit(last.mtdCPU) : '—'}
          note={`${v.roll.units} ${unit} · ${money(v.roll.total)}`}
          color={last?.mtdCPU != null && rate ? cpuColor(last.mtdCPU, rate) : LAYER.full} big />
        <Stat label={currentHole ? `Current hole · ${currentHole.hole.holeNumber}` : 'Current hole'}
          value={currentHole && currentHole.roll.cpu > 0 ? perUnit(currentHole.roll.cpu) : '—'}
          note={currentHole ? `${currentHole.roll.units} ${unit} · ${money(currentHole.roll.total)}` : 'no hole in progress'}
          color={currentHole && rate ? cpuColor(currentHole.roll.cpu, rate) : C.text} big />
      </div>

      <CPUChart days={days} rate={rate} />

      <Card title="Day by day" subtitle={`${rig} · ${monthLabel(month)} · click a day for the full breakdown`} pad={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Date</th><th style={th}>Status</th><th style={th}>Hole</th>
                <th style={thR}>Hours</th><th style={thR}>Metres</th><th style={thR}>Crew</th>
                <th style={thR}>Operating</th><th style={thR}>Ownership</th><th style={thR}>Total</th>
                <th style={thR}>Per {unit}</th><th style={thR}>MTD</th><th style={thR}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {days.map(d => {
                const isOpen = open === d.date
                return (
                  <Fragment key={d.date}>
                    <tr onClick={() => setOpen(isOpen ? null : d.date)} style={{
                      borderBottom: rowBorder, cursor: 'pointer',
                      background: isOpen ? 'rgba(249,115,22,0.05)' : !d.submitted ? 'rgba(239,68,68,0.05)' : d.units === 0 ? 'rgba(239,68,68,0.03)' : undefined,
                    }}>
                      <td style={{ ...td, color: C.text, fontWeight: 600 }}>
                        {dayLabel(d.date)}
                        {!d.submitted && <span style={{ marginLeft: 7 }}><Tag tone={C.red}>no log</Tag></span>}
                      </td>
                      <td style={td}><Tag tone={statusColor(d.status)}>{DAY_STATUS_LABEL[d.status]}</Tag></td>
                      <td style={{ ...td, color: d.holeNumber ? C.muted : C.dim }}>{d.holeNumber || '—'}</td>
                      <td style={tdN}>{d.drillingHours || '—'}</td>
                      <td style={{ ...tdN, color: d.units ? C.text : C.dim, fontWeight: 700 }}>{d.units || '—'}</td>
                      <td style={tdN}>{d.labour.heads || '—'}</td>
                      <td style={{ ...tdN, color: LAYER.operating }}>{money(d.operating)}</td>
                      <td style={{ ...tdN, color: LAYER.ownership }}>{d.ownership > 0 ? money(d.ownership) : '—'}</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 800 }}>{money(d.total)}</td>
                      <td style={{ ...tdN, fontWeight: 800, color: d.cpu == null ? C.dim : rate ? cpuColor(d.cpu, rate) : C.text }}>
                        {d.cpu == null ? '—' : perUnit(d.cpu)}
                      </td>
                      <td style={{ ...tdN, color: C.faint }}>{d.mtdCPU == null ? '—' : perUnit(d.mtdCPU)}</td>
                      <td style={{ ...tdN, color: d.revenue > 0 ? LAYER.revenue : C.dim }}>{d.revenue > 0 ? money(d.revenue) : '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={12} style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 24 }}>
                            <Detail title="From the log" tone={C.blue} rows={[
                              ['Shifts', `${d.shifts.length}`],
                              ['Day crew', `${d.labour.dayCrew}`],
                              ['Night crew', `${d.labour.nightCrew}`],
                              ['Drilling hours', `${d.drillingHours}`],
                              ['Downtime', `${d.downtimeHours} hrs`],
                              ['Core recovery', d.units > 0 ? pct((d.coreRecovery / d.units) * 100) : '—'],
                            ]} />
                            <Detail title="Operating" tone={LAYER.operating} rows={[
                              ['Fuel', `${money(d.fuel)} · ${d.fuelLitres} L`],
                              ['Water', money(d.water)],
                              ['Additives', money(d.additives)],
                              ['Repairs', money(d.repairs)],
                              ['Parts & tooling', money(d.parts)],
                            ]} />
                            <Detail title="Crew" tone={C.teal} rows={d.labour.perMetre
                              ? [['Per metre', 'charged on metres'], ['Labour', money(d.labour.labour)], ['Lodging', money(d.labour.lodging)], ['Transport', money(d.labour.transport)], ['Crew cost', money(d.labour.total)]]
                              : [
                                ['Labour', money(d.labour.labour)],
                                ['Lodging', money(d.labour.lodging)],
                                ['Transport', money(d.labour.transport)],
                                ['Crew cost', money(d.labour.total)],
                              ]} />
                            <Detail title="Day" tone={LAYER.full} rows={[
                              ['Operating', money(d.operating)],
                              ['Ownership', money(d.ownership)],
                              ['Full cost', money(d.total)],
                              ['Cost per unit', d.cpu == null ? 'nothing drilled' : perUnit(d.cpu)],
                              ['Client rate', d.rate > 0 ? perUnit(d.rate) : '—'],
                              ['Revenue', money(d.revenue)],
                            ]} />
                          </div>
                          {d.adjustmentPct !== 0 && (
                            <div style={{ marginTop: 14 }}>
                              <Note tone={C.amber}>A size adjustment of {d.adjustmentPct}% applied to this day&apos;s rate.</Note>
                            </div>
                          )}
                          {d.status === 'breakdown' && (
                            <div style={{ marginTop: 14 }}>
                              <Note tone={C.red}>
                                Breakdown — {d.downtimeHours} hours lost and {money(d.total)} spent, none of it billable.
                                {d.repairs > 0 && ` Repairs of ${money(d.repairs)} came from the maintenance log.`}
                              </Note>
                            </div>
                          )}
                          {d.status === 'standby' && d.submitted && (
                            <div style={{ marginTop: 14 }}>
                              <Note tone={C.amber}>
                                Standby — the client stopped work, so this day cost {money(d.total)} and bills {money(d.revenue)}.
                              </Note>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ ...td, color: C.text, fontWeight: 800 }} colSpan={3}>{v.roll.days} days</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{v.roll.drillingHours}</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{v.roll.units}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.operating }}>{money(v.roll.operating)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.ownership }}>{money(v.roll.ownership)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{money(v.roll.total)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.full }}>{perUnit(v.roll.cpu)}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue }}>{money(v.roll.revenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
        {zeroDays.length > 0 && (
          <Card title="Days that produced nothing" accent={C.red}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(zeroCost)}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.7 }}>
              Across {zeroDays.length} {zeroDays.length === 1 ? 'day' : 'days'} ({zeroDays.map(d => dayLabel(d.date)).join(', ')}).
              Crew and ownership continued regardless. This is the cost a monthly average hides completely.
            </div>
          </Card>
        )}
        <Card title="Core recovery" accent={C.green}>
          <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'ui-monospace, monospace', color: C.green }}>
            {pct(v.roll.coreRecoveryPct)}
          </div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.7 }}>
            {v.roll.coreRecovery.toFixed(1)} m recovered from {v.roll.units} m drilled, straight from the driller&apos;s log.
          </div>
        </Card>
      </div>
    </div>
  )
}

function Detail({ title, tone, rows }: { title: string; tone: string; rows: string[][] }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 11, color: C.faint }}>{r[0]}</span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{r[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Daily points, month-to-date line. Daily cost is genuinely spiky, so joining
 * the points would imply a continuity that isn't there; month to date really
 * is cumulative, so that one is a line. */
function CPUChart({ days, rate }: { days: DayCostMTD[]; rate: number }) {
  const pts = days.filter(d => d.cpu != null)
  if (pts.length < 2) return null

  const W = 1000, H = 220, PL = 66, PR = 20, PT = 20, PB = 32
  const maxV = Math.max(...pts.map(p => p.cpu!), ...days.map(d => d.mtdCPU ?? 0), rate || 0) * 1.1
  const x = (i: number) => PL + (i / Math.max(1, days.length - 1)) * (W - PL - PR)
  const y = (val: number) => PT + (1 - val / maxV) * (H - PT - PB)
  const mtd = days.map((d, i) => d.mtdCPU == null ? null : `${i === 0 || days[i - 1].mtdCPU == null ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.mtdCPU).toFixed(1)}`).filter(Boolean).join(' ')

  return (
    <Card title="Cost per metre through the month"
      subtitle="Points are single days. The line is month to date, which is the figure that actually settles." pad={false}>
      <div style={{ padding: '18px 20px 8px', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          {[0, 0.25, 0.5, 0.75, 1].map(fr => {
            const val = maxV * (1 - fr)
            return (
              <g key={fr}>
                <line x1={PL} x2={W - PR} y1={y(val)} y2={y(val)} stroke={C.border} strokeWidth={1} />
                <text x={PL - 10} y={y(val) + 4} textAnchor="end" fill={C.dim} fontSize={11} fontFamily="ui-monospace, monospace">{Math.round(val / 1000)}k</text>
              </g>
            )
          })}
          {rate > 0 && (
            <g>
              <line x1={PL} x2={W - PR} y1={y(rate)} y2={y(rate)} stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 5" />
              <text x={W - PR} y={y(rate) - 8} textAnchor="end" fill={C.blue} fontSize={11} fontWeight={700}>client rate {Math.round(rate).toLocaleString('en-IN')}</text>
            </g>
          )}
          {mtd && <path d={mtd} fill="none" stroke={C.orange} strokeWidth={2.5} strokeLinejoin="round" />}
          {days.map((d, i) => d.cpu == null ? (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={PT} y2={H - PB} stroke={C.red} strokeWidth={1} strokeDasharray="3 4" opacity={0.4} />
              <circle cx={x(i)} cy={H - PB} r={3} fill={C.red} opacity={0.7} />
            </g>
          ) : (
            <circle key={i} cx={x(i)} cy={y(d.cpu)} r={4} fill={rate ? cpuColor(d.cpu, rate) : C.muted} />
          ))}
          {days.map((d, i) => (i % Math.ceil(days.length / 12) === 0
            ? <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fill={C.dim} fontSize={10}>{d.date.slice(8)}</text> : null))}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '4px 20px 16px', flexWrap: 'wrap' }}>
        <Legend color={C.orange} label="Month to date" line />
        <Legend color={C.green} label="Healthy margin" />
        <Legend color={C.amber} label="Thin margin" />
        <Legend color={C.red} label="Nothing drilled" />
        {rate > 0 && <Legend color={C.blue} label="Client rate" line />}
      </div>
    </Card>
  )
}

function Legend({ color, label, line }: { color: string; label: string; line?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: line ? 16 : 9, height: line ? 2 : 9, borderRadius: line ? 1 : '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: C.faint }}>{label}</span>
    </div>
  )
}

/* ── HOLES ────────────────────────────────────────────────────────────── */

function HolesTab({ v, onAddHole, onEditHole, onStatus }: {
  v: RigMonthView
  onAddHole: () => void
  onEditHole: (h: Hole) => void
  onStatus: (id: string, s: HoleStatus) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const unit = 'm'

  if (v.holes.length === 0) {
    return (
      <Card title="Holes" subtitle="Nothing recorded for this rig on this project yet" right={<Btn size="sm" onClick={onAddHole}>Add a hole</Btn>}>
        <Empty>Add a hole, and XPLORIX matches the driller&apos;s logs to it by hole number and works out the cost.</Empty>
      </Card>
    )
  }

  const t = v.holes.reduce((a, h) => ({
    units: a.units + h.roll.units, cost: a.cost + h.roll.total, revenue: a.revenue + h.roll.revenue,
  }), { units: 0, cost: 0, revenue: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {v.holes.some(h => h.unmatchedDays > 0) && (
        <Note tone={C.red}>
          A hole has metres with no matching rate line, so those metres bill at zero. Add the missing size and formation in Set rates.
        </Note>
      )}
      {v.holes.some(h => h.rates.length > 1) && (
        <Note tone={C.blue}>
          A hole spans a rate change. Metres bill at the rate in force on the day they were drilled, so the hole splits
          automatically — no metre is billed at the wrong rate.
        </Note>
      )}

      <Card title="Holes" subtitle="Cost and metres from the driller's log, revenue at the rate in force each day" pad={false}
        right={<Btn size="sm" onClick={onAddHole}>Add a hole</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Hole</th><th style={th}>Dates</th><th style={th}>Status</th>
                <th style={thR}>Days</th><th style={thR}>Metres</th><th style={thR}>Recovery</th>
                <th style={thR}>Cost</th><th style={thR}>Cost/{unit}</th><th style={thR}>Rate</th>
                <th style={thR}>Revenue</th><th style={thR}>Profit</th><th style={thR}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {v.holes.map(h => {
                const hole = h.hole
                const isOpen = open === hole.id
                return (
                  <Fragment key={hole.id}>
                    <tr onClick={() => setOpen(isOpen ? null : hole.id)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>
                        {hole.holeNumber}
                        {h.unmatchedDays > 0 && <span style={{ color: C.red, marginLeft: 7 }}>●</span>}
                        {h.rates.length > 1 && <span style={{ color: C.blue, marginLeft: 5 }}>●</span>}
                      </td>
                      <td style={td}>{dayLabel(hole.startDate)} → {hole.endDate ? dayLabel(hole.endDate) : 'open'}</td>
                      <td style={td}><Tag tone={holeStatusColor(hole.status)}>{hole.status}</Tag></td>
                      <td style={tdN}>{h.roll.days}</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{h.roll.units}</td>
                      <td style={{ ...tdN, color: C.faint }}>{pct(h.coreRecoveryPct)}</td>
                      <td style={{ ...tdN, color: LAYER.full }}>{money(h.roll.total)}</td>
                      <td style={{ ...tdN, color: LAYER.full, fontWeight: 700 }}>{perUnit(h.roll.cpu)}</td>
                      <td style={{ ...tdN, color: C.faint }}>{h.rates.length > 1 ? `${h.rates.length} rates` : perUnit(h.rates[0] ?? 0)}</td>
                      <td style={{ ...tdN, color: LAYER.revenue }}>{money(h.roll.revenue)}</td>
                      <td style={{ ...tdN, color: marginColor(h.roll.margin), fontWeight: 800 }}>{money(h.roll.margin)}</td>
                      <td style={{ ...tdN, color: marginColor(h.roll.margin), fontWeight: 800 }}>{h.roll.revenue > 0 ? pct(h.roll.marginPct) : '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={12} style={{ padding: '20px 22px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: LAYER.full, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                What {hole.holeNumber} cost
                              </div>
                              <table style={tableStyle}>
                                <tbody>
                                  {[
                                    ['Fuel', money(h.roll.fuel)],
                                    ['Water & additives', money(h.roll.water + h.roll.additives)],
                                    ['Crew', money(h.roll.labour)],
                                    ['Repairs', money(h.roll.repairs)],
                                    ['Parts & tooling', money(h.roll.parts)],
                                  ].map(([k, val]) => <tr key={k}><td style={td}>{k}</td><td style={tdN}>{val}</td></tr>)}
                                  <tr style={{ borderTop: rowBorder }}>
                                    <td style={{ ...td, color: LAYER.operating, fontWeight: 700 }}>Operating</td>
                                    <td style={{ ...tdN, color: LAYER.operating, fontWeight: 700 }}>{money(h.roll.operating)}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ ...td, color: LAYER.ownership, fontWeight: 700 }}>Ownership</td>
                                    <td style={{ ...tdN, color: LAYER.ownership, fontWeight: 700 }}>{money(h.roll.ownership)}</td>
                                  </tr>
                                  <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                    <td style={{ ...td, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>Full cost</td>
                                    <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{money(h.roll.total)}</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div style={{ marginTop: 16, display: 'flex', gap: 22, flexWrap: 'wrap' }}>
                                <Mini k="Drilling days" v={`${h.roll.drillingDays}`} />
                                <Mini k="Standby" v={`${h.roll.standbyDays}`} />
                                <Mini k="Breakdown" v={`${h.roll.breakdownDays}`} />
                                <Mini k="Downtime" v={`${h.roll.downtimeHours} hrs`} />
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: LAYER.revenue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                What {hole.holeNumber} bills
                              </div>
                              <table style={tableStyle}>
                                <thead><tr><th style={th}>Rate applied</th><th style={thR}>Metres</th><th style={thR}>Amount</th></tr></thead>
                                <tbody>
                                  {h.rates.map(rt => {
                                    const dd = h.days.filter(d => Math.round(d.rate) === rt && d.units > 0)
                                    const u = dd.reduce((s, d) => s + d.units, 0)
                                    const amt = dd.reduce((s, d) => s + d.revenue, 0)
                                    return (
                                      <tr key={rt} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, color: C.text }}>{perUnit(rt)}<span style={{ color: C.dim, fontSize: 10 }}> · {dayLabel(dd[0].date)}–{dayLabel(dd[dd.length - 1].date)}</span></td>
                                        <td style={tdN}>{u}</td>
                                        <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(amt)}</td>
                                      </tr>
                                    )
                                  })}
                                  {h.roll.standbyDays > 0 && (
                                    <tr style={{ borderBottom: rowBorder }}>
                                      <td style={{ ...td, color: C.text }}>Standby</td>
                                      <td style={tdN}>{h.roll.standbyDays} days</td>
                                      <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(h.days.filter(d => d.status === 'standby').reduce((s, d) => s + d.revenue, 0))}</td>
                                    </tr>
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                    <td style={{ ...td, fontWeight: 800, color: C.text }}>Revenue</td>
                                    <td style={{ ...tdN, fontWeight: 800 }}>{h.roll.units}</td>
                                    <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue, fontSize: 13 }}>{money(h.roll.revenue)}</td>
                                  </tr>
                                </tfoot>
                              </table>

                              <div style={{ marginTop: 18, padding: '16px 18px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                                <Grid cols={3}>
                                  <Res k="Revenue" v={money(h.roll.revenue)} tone={LAYER.revenue} />
                                  <Res k="Cost" v={money(h.roll.total)} tone={LAYER.full} />
                                  <Res k="Profit" v={money(h.roll.margin)} tone={marginColor(h.roll.margin)} big />
                                </Grid>
                                <div style={{ marginTop: 12, fontSize: 11, color: C.faint, lineHeight: 1.7 }}>
                                  {h.roll.units} {unit} at {perUnit(h.roll.revenuePerUnit)} against {perUnit(h.roll.cpu)} —
                                  a margin of {perUnit(h.roll.revenuePerUnit - h.roll.cpu)}, or {pct(h.roll.marginPct)}.
                                </div>
                              </div>
                            </div>
                          </div>

                          {h.unmatchedDays > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <Note tone={C.red}>
                                {h.unmatchedDays} {h.unmatchedDays === 1 ? 'day has' : 'days have'} metres with no matching rate line, billing at zero.
                              </Note>
                            </div>
                          )}

                          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Btn size="sm" onClick={() => onEditHole(hole)}>Edit hole</Btn>
                            {hole.status === 'drilling' && <Btn size="sm" tone="primary" onClick={() => onStatus(hole.id, 'closed')}>Close hole</Btn>}
                            {hole.status === 'closed' && <>
                              <Btn size="sm" tone="primary" onClick={() => onStatus(hole.id, 'approved')}>Approve for billing</Btn>
                              <Btn size="sm" onClick={() => onStatus(hole.id, 'drilling')}>Reopen</Btn>
                            </>}
                            {hole.status === 'approved' && <>
                              <span style={{ fontSize: 12, color: C.green }}>Ready to bill — pick it up in the Billing tab.</span>
                              <Btn size="sm" onClick={() => onStatus(hole.id, 'closed')}>Withdraw approval</Btn>
                            </>}
                            {hole.status === 'invoiced' && <span style={{ fontSize: 12, color: C.purple }}>Invoiced</span>}
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
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={4}>{v.holes.length} holes</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{t.units}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.full }}>{money(t.cost)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.full }}>{t.units > 0 ? perUnit(t.cost / t.units) : '—'}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.revenue }}>{money(t.revenue)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: marginColor(t.revenue - t.cost) }}>{money(t.revenue - t.cost)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: marginColor(t.revenue - t.cost) }}>{t.revenue > 0 ? pct(((t.revenue - t.cost) / t.revenue) * 100) : '—'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.dim, marginBottom: 3 }}>{k}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, fontFamily: 'ui-monospace, monospace' }}>{v}</div>
    </div>
  )
}
function Res({ k, v, tone, big }: { k: string; v: string; tone: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.faint, marginBottom: 5 }}>{k}</div>
      <div style={{ fontSize: big ? 19 : 15, fontWeight: 900, color: tone, fontFamily: 'ui-monospace, monospace' }}>{v}</div>
    </div>
  )
}

/* ── BILLING ──────────────────────────────────────────────────────────── */

function BillingTab({ project, holes, clientRate, invoices, onCreate, onDelete }: {
  project: string; holes: HoleResult[]; clientRate?: ClientRate
  invoices: Invoice[]
  onCreate: (i: Invoice) => void; onDelete: (id: string) => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [review, setReview] = useState(false)

  const ready = holes.filter(h => isBillable(h.hole))
  const waiting = holes.filter(h => h.hole.status === 'closed')
  const toggle = (id: string) => setPicked(s => { const n = new Set(Array.from(s)); n.has(id) ? n.delete(id) : n.add(id); return n })
  const chosen = ready.filter(h => picked.has(h.hole.id))
  const sel = {
    revenue: chosen.reduce((s, h) => s + h.roll.revenue, 0),
    cost: chosen.reduce((s, h) => s + h.roll.total, 0),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {waiting.length > 0 && (
        <Note tone={C.blue}>
          {waiting.length} {waiting.length === 1 ? 'hole is' : 'holes are'} closed but not approved
          ({waiting.map(h => h.hole.holeNumber).join(', ')}). Approve them in the Holes tab to bill.
        </Note>
      )}
      {ready.some(h => h.unmatchedDays > 0) && (
        <Note tone={C.red}>A hole ready to bill has metres with no matching rate line. Those metres will invoice at zero.</Note>
      )}

      <Card title="Ready to bill" pad={false}
        subtitle="Approved holes not yet invoiced. Cost sits beside revenue so nothing goes out at a loss unnoticed."
        right={ready.length > 0 ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" onClick={() => setPicked(picked.size === ready.length ? new Set() : new Set(ready.map(h => h.hole.id)))}>
              {picked.size === ready.length ? 'Clear' : 'Select all'}
            </Btn>
            <Btn size="sm" tone="primary" disabled={chosen.length === 0} onClick={() => setReview(true)}>
              Review{chosen.length > 0 ? ` (${chosen.length})` : ''}
            </Btn>
          </div>
        ) : undefined}>
        {ready.length === 0 ? <Empty>Nothing approved and waiting. Close a hole, approve it, and it appears here.</Empty> : (
          <table style={tableStyle}>
            <thead>
              <tr><th style={{ ...th, width: 40 }} /><th style={th}>Hole</th><th style={th}>Rig</th><th style={th}>Closed</th>
                <th style={thR}>Metres</th><th style={thR}>Recovery</th><th style={thR}>Cost</th>
                <th style={thR}>Revenue</th><th style={thR}>Profit</th><th style={thR}>Margin</th></tr>
            </thead>
            <tbody>
              {ready.map(h => {
                const on = picked.has(h.hole.id)
                return (
                  <tr key={h.hole.id} onClick={() => toggle(h.hole.id)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: on ? 'rgba(249,115,22,0.06)' : undefined }}>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${on ? C.orange : C.border}`, background: on ? C.orange : 'transparent', color: '#fff', fontSize: 10, lineHeight: '13px', textAlign: 'center' }}>{on ? '✓' : ''}</span>
                    </td>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>{h.hole.holeNumber}</td>
                    <td style={td}>{h.hole.rig}</td>
                    <td style={td}>{h.hole.endDate ? dayLabel(h.hole.endDate) : '—'}</td>
                    <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{h.roll.units}</td>
                    <td style={{ ...tdN, color: C.faint }}>{pct(h.coreRecoveryPct)}</td>
                    <td style={{ ...tdN, color: LAYER.full }}>{money(h.roll.total)}</td>
                    <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(h.roll.revenue)}</td>
                    <td style={{ ...tdN, color: marginColor(h.roll.margin), fontWeight: 800 }}>{money(h.roll.margin)}</td>
                    <td style={{ ...tdN, color: marginColor(h.roll.margin), fontWeight: 800 }}>{pct(h.roll.marginPct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {chosen.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
          <Stat label="Selected" value={`${chosen.length}`} />
          <Stat label="Revenue" value={money(sel.revenue)} color={LAYER.revenue} />
          <Stat label="Cost" value={money(sel.cost)} color={LAYER.full} />
          <Stat label="Profit" value={money(sel.revenue - sel.cost)} color={marginColor(sel.revenue - sel.cost)}
            note={sel.revenue > 0 ? pct(((sel.revenue - sel.cost) / sel.revenue) * 100) : ''} />
        </div>
      )}

      {invoices.length > 0 && (
        <Card title="Invoices" pad={false} subtitle="Deleting an invoice releases its holes back to Ready to bill">
          <table style={tableStyle}>
            <thead><tr><th style={th}>Number</th><th style={th}>Date</th><th style={thR}>Subtotal</th><th style={thR}>Tax</th><th style={thR}>Total</th><th style={th} /></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{inv.number}</td>
                  <td style={td}>{dayLabel(inv.date)}</td>
                  <td style={tdN}>{money(inv.subtotal)}</td>
                  <td style={tdN}>{inv.taxPercent}%</td>
                  <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 800 }}>{money(inv.total)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 7 }}>
                      <Btn size="sm" onClick={() => downloadInvoice(inv)}>Download</Btn>
                      <Btn size="sm" tone="danger" onClick={() => onDelete(inv.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {review && (
        <ReviewModal project={project} clientRate={clientRate} holes={chosen}
          nextNumber={`INV-${String(invoices.length + 1).padStart(4, '0')}`}
          onClose={() => setReview(false)}
          onCreate={inv => { onCreate(inv); setPicked(new Set()); setReview(false) }} />
      )}
    </div>
  )
}

function ReviewModal({ project, clientRate, holes, nextNumber, onClose, onCreate }: {
  project: string; clientRate?: ClientRate; holes: HoleResult[]
  nextNumber: string; onClose: () => void; onCreate: (i: Invoice) => void
}) {
  const [number, setNumber] = useState(nextNumber)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [taxPercent, setTax] = useState(18)
  // Anything billable that isn't metres — mobilisation, demobilisation, a
  // one-off the contract allows — is added here rather than tracked as a cost.
  const [extras, setExtras] = useState<{ id: string; label: string; amount: number }[]>([])

  // Lines come from the same day costing the Holes tab renders, so an invoice
  // can never disagree with what was on screen.
  const lines: InvoiceLine[] = []
  holes.forEach(h => {
    h.rates.forEach(rt => {
      const dd = h.days.filter(d => Math.round(d.rate) === rt && d.units > 0)
      const u = dd.reduce((s, d) => s + d.units, 0)
      const amt = dd.reduce((s, d) => s + d.revenue, 0)
      if (u > 0) lines.push({
        label: `${h.hole.holeNumber} · drilling, ${dayLabel(dd[0].date)} to ${dayLabel(dd[dd.length - 1].date)}`,
        qty: `${u} m`, rate: perUnit(rt), amount: amt,
      })
    })
    const sb = h.days.filter(d => d.status === 'standby' && d.revenue > 0)
    if (sb.length) lines.push({
      label: `${h.hole.holeNumber} · standby`, qty: `${sb.length} days`,
      rate: money(clientRate?.standbyPerDay ?? 0), amount: sb.reduce((s, d) => s + d.revenue, 0),
    })
  })
  extras.filter(e => e.label.trim() && e.amount).forEach(e =>
    lines.push({ label: e.label.trim(), qty: '1', rate: money(e.amount), amount: e.amount }))

  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const total = subtotal * (1 + taxPercent / 100)
  const cost = holes.reduce((s, h) => s + h.roll.total, 0)

  return (
    <Modal title="Review invoice" subtitle={project} width={840} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={() => onCreate({
          id: uid('inv'), number, project, client: '', date,
          holeIds: holes.map(h => h.hole.id), lines, subtotal, taxPercent, total,
        })}>Create invoice</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Grid cols={3}>
          <TextField label="Invoice number" value={number} onChange={setNumber} />
          <DateField label="Date" value={date} onChange={setDate} />
          <NumField label="Tax" value={taxPercent} onChange={setTax} suffix="%" />
        </Grid>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Description</th><th style={thR}>Quantity</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{l.label}</td>
                  <td style={tdN}>{l.qty}</td><td style={tdN}>{l.rate}</td>
                  <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{money(l.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}` }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Subtotal</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{money(subtotal)}</td>
              </tr>
              <tr><td style={td} colSpan={3}>Tax at {taxPercent}%</td><td style={tdN}>{money(subtotal * taxPercent / 100)}</td></tr>
              <tr style={{ background: 'rgba(59,130,246,0.06)' }}>
                <td style={{ ...td, fontWeight: 900, color: LAYER.revenue, fontSize: 13 }} colSpan={3}>Total</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue, fontSize: 13 }}>{money(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Section title="Other lines" note="Mobilisation, demobilisation, or anything else the contract lets you bill that isn't metres.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {extras.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={e.label} placeholder="Description"
                  onChange={ev => setExtras(x => x.map((y, j) => j === i ? { ...y, label: ev.target.value } : y))}
                  style={{ ...iStyle, flex: 2 }} />
                <input type="number" value={e.amount}
                  onChange={ev => setExtras(x => x.map((y, j) => j === i ? { ...y, amount: parseFloat(ev.target.value) || 0 } : y))}
                  style={{ ...iStyle, flex: 1, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: LAYER.revenue }} />
                <Btn size="sm" tone="danger" onClick={() => setExtras(x => x.filter((_, j) => j !== i))}>Remove</Btn>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" onClick={() => setExtras(x => [...x, { id: uid('x'), label: '', amount: 0 }])}>Add line</Btn>
              {clientRate && clientRate.mobilisation > 0 && (
                <Btn size="sm" onClick={() => setExtras(x => [...x, { id: uid('x'), label: 'Mobilisation', amount: clientRate.mobilisation }])}>Mobilisation</Btn>
              )}
              {clientRate && clientRate.demobilisation > 0 && (
                <Btn size="sm" onClick={() => setExtras(x => [...x, { id: uid('x'), label: 'Demobilisation', amount: clientRate.demobilisation }])}>Demobilisation</Btn>
              )}
            </div>
          </div>
        </Section>

        <Grid cols={4}>
          <Stat label="Revenue" value={money(subtotal)} color={LAYER.revenue} />
          <Stat label="Cost" value={money(cost)} color={LAYER.full} />
          <Stat label="Profit" value={money(subtotal - cost)} color={marginColor(subtotal - cost)} />
          <Stat label="Margin" value={subtotal > 0 ? pct(((subtotal - cost) / subtotal) * 100) : '—'} color={marginColor(subtotal - cost)} />
        </Grid>

        <Note tone={C.amber}>
          Cost and margin are for your own records and never appear on the client&apos;s copy. Once created, these holes are
          stamped as invoiced and cannot be billed again.
        </Note>
      </div>
    </Modal>
  )
}

function downloadInvoice(inv: Invoice) {
  const rows = inv.lines.map(l => `<tr><td>${l.label}</td><td class="r">${l.qty}</td><td class="r">${l.rate}</td><td class="r">${money(l.amount)}</td></tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.number}</title><style>
body{font-family:system-ui,Arial,sans-serif;padding:44px;color:#111;max-width:840px;margin:0 auto}
.head{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:22px;border-bottom:3px solid #F97316;margin-bottom:26px}
.t{font-size:26px;font-weight:800;color:#F97316}.s{font-size:12px;color:#666;margin-top:6px;line-height:1.6}
table{width:100%;border-collapse:collapse;margin:18px 0}
th{background:#111;color:#fff;padding:10px 12px;text-align:left;font-size:11px}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}
.r{text-align:right;font-variant-numeric:tabular-nums}th.r{text-align:right}
.tot td{font-weight:800;font-size:15px;border-top:2px solid #111;background:#fafafa}
.f{margin-top:34px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#999}
</style></head><body>
<div class="head"><div><div class="t">INVOICE</div><div class="s">${inv.number}<br>${inv.date}</div></div>
<div class="s" style="text-align:right">Bill to<br><strong style="font-size:14px;color:#111">${inv.client || inv.project}</strong><br>${inv.project}</div></div>
<table><thead><tr><th>Description</th><th class="r">Quantity</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
<tbody>${rows}</tbody><tfoot>
<tr><td colspan="3" class="r">Subtotal</td><td class="r">${money(inv.subtotal)}</td></tr>
<tr><td colspan="3" class="r">Tax at ${inv.taxPercent}%</td><td class="r">${money(inv.subtotal * inv.taxPercent / 100)}</td></tr>
<tr class="tot"><td colspan="3" class="r">Total</td><td class="r">${money(inv.total)}</td></tr>
</tfoot></table>
<div class="f">Generated from XPLORIX Costing</div></body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url; a.download = `${inv.number}_${inv.project.replace(/\s+/g, '-')}.html`; a.click()
  URL.revokeObjectURL(url)
}

/* ==========================================================================
 * 6  Hole editor
 * ========================================================================== */

function HoleModal({ rig, project, existing, onSave, onClose }: {
  rig: string; project: string; existing?: Hole
  onSave: (h: Omit<Hole, 'id'> & { id?: string }) => void; onClose: () => void
}) {
  const [holeNumber, setHoleNumber] = useState(existing?.holeNumber ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [status, setStatus] = useState<HoleStatus>(existing?.status ?? 'drilling')
  const [targetDepth, setTargetDepth] = useState(existing?.targetDepth ?? 0)

  return (
    <Modal title={existing ? `Edit ${existing.holeNumber}` : 'Add a hole'} subtitle={`${rig} · ${project}`} width={640} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!holeNumber.trim()} onClick={() => {
          onSave({ id: existing?.id, holeNumber: holeNumber.trim(), rig, project, startDate, endDate: endDate || undefined, status, targetDepth, invoiceId: existing?.invoiceId })
          onClose()
        }}>{existing ? 'Save hole' : 'Add hole'}</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Note tone={C.dim}>
          Metres, days and cost all come from the driller&apos;s logs, matched to this hole by its number. Nothing measurable is
          entered here — only which hole exists, when it ran, and whether it is ready to bill.
        </Note>
        <Grid cols={2}>
          <TextField label="Hole number" value={holeNumber} onChange={setHoleNumber} placeholder="DH-004"
            hint="Must match what the driller enters in the log" />
          <NumField label="Target depth" value={targetDepth} onChange={setTargetDepth} suffix="m" />
        </Grid>
        <Grid cols={3}>
          <DateField label="Started" value={startDate} onChange={setStartDate} />
          <DateField label="Finished" value={endDate} onChange={setEndDate} hint="Leave empty while drilling" />
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as HoleStatus)} style={{ ...iStyle, cursor: 'pointer' }}>
              <option value="drilling">Drilling</option><option value="closed">Closed</option>
              <option value="approved">Approved</option><option value="invoiced">Invoiced</option>
            </select>
          </Field>
        </Grid>
      </div>
    </Modal>
  )
}

/* ==========================================================================
 * 7  The screen
 * ========================================================================== */

const TABS = ['Overview', 'Daily', 'Holes', 'Billing'] as const
type Tab = typeof TABS[number]

function CostingScreen() {
  const { state: inv } = useInventory()
  const { state, setHole, setHoleStatus, addInvoice, deleteInvoice } = useCosting()

  const projects: string[] = inv.projects.map((p: { name: string }) => p.name)
  const [project, setProject] = useState(projects[0] ?? '')

  const rigs = useMemo(() => {
    const fromLogs = rigsFor(state.shiftLogs, project)
    if (fromLogs.length) return fromLogs
    return (inv.projects.find((p: { name: string }) => p.name === project)?.rigs ?? []) as string[]
  }, [state.shiftLogs, project, inv.projects])

  const [rig, setRig] = useState(rigs[0] ?? '')
  const months = useMemo(() => monthsFor(state.shiftLogs, rig, project), [state.shiftLogs, rig, project])
  const [month, setMonth] = useState(months[months.length - 1] ?? '')
  const [tab, setTab] = useState<Tab>('Overview')

  useEffect(() => { if (!rigs.includes(rig)) setRig(rigs[0] ?? '') }, [rigs, rig])
  useEffect(() => { if (!months.includes(month)) setMonth(months[months.length - 1] ?? '') }, [months, month])

  const [showRates, setShowRates] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [holeModal, setHoleModal] = useState<{ existing?: Hole } | null>(null)

  const v = useRigMonthView(project, rig, month)
  const projectHoles = useProjectHoles(project)
  const invoices = state.invoices.filter(i => i.project === project)

  if (!project) {
    return <div style={{ padding: 24 }}><Card><Empty>No projects yet. Create one in Projects to start costing.</Empty></Card></div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 20, paddingBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Costing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 660, lineHeight: 1.6 }}>
            What each hole cost, what it can be billed for, and what it made. Metres, hours, crew and fuel come from the
            driller&apos;s log, repairs from the maintenance log, parts from inventory — the only things set here are rates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn size="sm" onClick={() => setShowRates(true)}>⚙ Set rates</Btn>
          <Btn size="sm" onClick={() => setShowHistory(true)}>↺ Rates history</Btn>
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Row label="Project">
          {projects.map(p => <Pick key={p} on={project === p} onClick={() => setProject(p)} title={p} sub={PROJECT_CLIENTS[p] || '—'} />)}
        </Row>
        {rigs.length > 0 && (
          <Row label="Rig">
            {rigs.map(r => <Pick key={r} on={rig === r} onClick={() => setRig(r)} title={r}
              sub={state.ownership.some(o => o.rig === r) ? 'rig cost set' : 'no rig cost'} />)}
          </Row>
        )}
        {months.length > 0 && (
          <Row label="Month">
            {months.map(m => (
              <button key={m} onClick={() => setMonth(m)} style={{
                padding: '5px 14px', borderRadius: 18, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                background: month === m ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${month === m ? 'rgba(249,115,22,0.3)' : C.border}`,
                color: month === m ? C.orange : C.faint,
              }}>{monthLabel(m)}</button>
            ))}
          </Row>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              border: 'none', fontFamily: 'inherit',
              background: tab === t ? C.orange : 'transparent', color: tab === t ? '#fff' : C.muted,
            }}>{t}</button>
          ))}
        </div>
        {v.hasLogs && (
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            <Head k="Metres" v={`${v.roll.units}`} />
            <Head k="Full cost" v={money(v.roll.total)} />
            <Head k="Cost / m" v={perUnit(v.roll.cpu)} tone={C.orange} />
            {v.roll.revenue > 0 && <Head k="Margin" v={pct(v.roll.marginPct)} tone={marginColor(v.roll.margin)} />}
          </div>
        )}
      </div>

      {tab === 'Overview' && <OverviewTab v={v} rig={rig} month={month} onSetRates={() => setShowRates(true)} />}
      {tab === 'Daily' && <DailyTab v={v} rig={rig} month={month} />}
      {tab === 'Holes' && (
        <HolesTab v={v} onAddHole={() => setHoleModal({})} onEditHole={h => setHoleModal({ existing: h })}
          onStatus={(id, s) => setHoleStatus(id, s)} />
      )}
      {tab === 'Billing' && (
        <BillingTab project={project} holes={projectHoles} clientRate={v.clientRate}
          invoices={invoices} onCreate={addInvoice} onDelete={deleteInvoice} />
      )}

      {showRates && (
        <SetRatesModal projects={projects} initialProject={project} initialRig={rig} month={month}
          rigsForProject={p => {
            const fromLogs = rigsFor(state.shiftLogs, p)
            return fromLogs.length ? fromLogs : ((inv.projects.find((x: { name: string }) => x.name === p)?.rigs ?? []) as string[])
          }}
          onClose={() => setShowRates(false)} />
      )}
      {showHistory && <RatesHistoryModal project={project} rig={rig} onClose={() => setShowHistory(false)} />}
      {holeModal && (
        <HoleModal rig={rig} project={project} existing={holeModal.existing}
          onSave={h => setHole(h)} onClose={() => setHoleModal(null)} />
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.12em', width: 62, paddingTop: 12, flexShrink: 0 }}>{label}</div>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', flex: 1 }}>{children}</div>
    </div>
  )
}

function Pick({ on, onClick, title, sub }: { on: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
      background: on ? `linear-gradient(135deg, ${C.orange}, ${C.orangeD})` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${on ? 'transparent' : C.border}`, color: on ? '#fff' : C.muted,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{sub}</div>
    </button>
  )
}

function Head({ k, v, tone = C.text }: { k: string; v: string; tone?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: tone, fontFamily: 'ui-monospace, monospace', marginTop: 3 }}>{v}</div>
    </div>
  )
}

/* Provider is mounted here, so this one screen is self-contained. */
export default function CostingRoute() {
  return (
    <CostingProvider>
      <CostingScreen />
    </CostingProvider>
  )
}
