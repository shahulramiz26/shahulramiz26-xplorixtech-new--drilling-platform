'use client'

import { useState, useMemo, useEffect, Fragment, ReactNode } from 'react'
import { useInventory } from '../../../lib/inventory-store'
import {
  CostingProvider, useCosting,
  C, LAYER, iStyle, derivedStyle, money, perUnit, pct,
  cpuColor, marginColor, statusColor, holeStatusColor,
  monthLabel, dayLabel, fullDate, monthOf, daysInMonth, shiftMonth,
  projectCode, rigCode, holesFromDays,
  rigsFor, monthsFor, versionOn, newestFirst, uid,
  ownershipBreakdown, dayCost, rollup, withCumulative, holeResult,
  partsPerUnitFor, isBillable, ANY_FORMATION, INVOICE_STATUS_LABEL, isOverdue, outstanding,
  blankOwnership, blankOperating, blankClientRate,
  PROJECT_CLIENTS, ROCK_CATEGORIES, HOLE_SIZES, DAY_STATUS_LABEL,
  type DayCost, type DayCostMTD, type Rollup, type OwnershipBreakdown,
  type RigOwnership, type OperatingRate, type ClientRate, type HoleStatus,
  type HoleResult, type Invoice, type InvoiceLine, type RateRow, type RateAdjustment,

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

    const holes = holesFromDays(raw, state.holeStatus).map(h => holeResult(h, raw))

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
    const keys = new Set<string>()
    state.shiftLogs
      .filter(l => l.project === project && l.holeNumber)
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

    return holesFromDays(allDays, state.holeStatus)
      .map(h => holeResult(h, allDays))
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
              {projects.map(p => <Pick key={p} on={project === p} onClick={() => setProject(p)} title={projectCode(p)} sub={PROJECT_CLIENTS[p] || '—'} />)}
            </div>
          </Field>
          <Field label="Rig">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rigs.length === 0
                ? <span style={{ fontSize: 12, color: C.faint }}>No rigs on this project yet.</span>
                : rigs.map(r => <Pick key={r} on={rig === r} onClick={() => setRig(r)} title={rigCode(r)}
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
        <Section title="Rates" note="One line per size, formation and depth range. Leave formation as Any to price purely by depth band; leave the depth range blank to price purely by formation. The driller's log records size and formation, so XPLORIX picks the matching line for every stretch of hole.">
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
                  <div style={{ width: 150 }}>
                    <Field label="Formation">
                      <select value={r.formation} onChange={e => updRow(i, { formation: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
                        <option value={ANY_FORMATION}>{ANY_FORMATION}</option>
                        {ROCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        {r.formation && r.formation !== ANY_FORMATION && !ROCK_CATEGORIES.includes(r.formation) && <option value={r.formation}>{r.formation}</option>}
                      </select>
                    </Field>
                  </div>
                  <div style={{ width: 82 }}>
                    <Field label="From">
                      <input type="number" value={r.fromDepth ?? ''} placeholder="0"
                        onChange={e => updRow(i, { fromDepth: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                        style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
                    </Field>
                  </div>
                  <div style={{ width: 82 }}>
                    <Field label="To">
                      <input type="number" value={r.toDepth ?? ''} placeholder="∞"
                        onChange={e => updRow(i, { toDepth: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                        style={{ ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }} />
                    </Field>
                  </div>
                  <div style={{ width: 128 }}>
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

/* RATES HISTORY — a list of changes, not of states.
 *
 * Each row is diffed against the previous entry of the same kind, so it reads
 * "₹12,650 → ₹14,100" rather than making you compare two rows by eye. There is
 * no delete: forward-only dates exist so nothing already costed can be
 * rewritten, and a delete button would walk straight through that. */
function RatesHistoryModal({ project, rig, onClose }: { project: string; rig: string; onClose: () => void }) {
  const { state } = useCosting()

  interface Row { id: string; from: string; rigs: string; what: string; tone: string; changed: string[]; why: string }
  const rows: Row[] = []

  const own = newestFirst(state.ownership.filter(o => o.rig === rig))
  own.forEach((o, i) => {
    const prev = own[i + 1]
    const b = ownershipBreakdown(o, monthOf(o.effectiveFrom))
    const changed: string[] = []
    if (!prev) changed.push(`First set — ${money(b.perDay)}/day`)
    else {
      const pb = ownershipBreakdown(prev, monthOf(o.effectiveFrom))
      if (Math.round(pb.depPerMonth) !== Math.round(b.depPerMonth)) changed.push(`Depreciation ${money(pb.depPerMonth)} → ${money(b.depPerMonth)}`)
      if (Math.round(pb.emi) !== Math.round(b.emi)) changed.push(`EMI ${money(pb.emi)} → ${money(b.emi)}`)
      if (Math.round(pb.perDay) !== Math.round(b.perDay)) changed.push(`Per day ${money(pb.perDay)} → ${money(b.perDay)}${delta(pb.perDay, b.perDay)}`)
      if (!changed.length) changed.push('No change to the daily figure')
    }
    rows.push({ id: o.id, from: o.effectiveFrom, rigs: rigCode(o.rig), what: 'Rig cost', tone: LAYER.ownership, changed, why: o.note || '—' })
  })

  const ops = newestFirst(state.operating.filter(o => o.rig === rig && o.project === project))
  ops.forEach((o, i) => {
    const prev = ops[i + 1]
    const changed: string[] = []
    if (!prev) changed.push(`First set — fuel ₹${o.fuelPricePerLitre}/L, labour ${money(o.labourRate)}`)
    else {
      if (prev.fuelPricePerLitre !== o.fuelPricePerLitre) changed.push(`Fuel ₹${prev.fuelPricePerLitre} → ₹${o.fuelPricePerLitre}/L${delta(prev.fuelPricePerLitre, o.fuelPricePerLitre)}`)
      if (prev.labourRate !== o.labourRate) changed.push(`Labour ${money(prev.labourRate)} → ${money(o.labourRate)}${delta(prev.labourRate, o.labourRate)}`)
      if (prev.lodgingRate !== o.lodgingRate) changed.push(`Lodging ${money(prev.lodgingRate)} → ${money(o.lodgingRate)}`)
      if (prev.transportRate !== o.transportRate) changed.push(`Transport ${money(prev.transportRate)} → ${money(o.transportRate)}`)
      if (prev.waterPricePerLitre !== o.waterPricePerLitre) changed.push(`Water ₹${prev.waterPricePerLitre} → ₹${o.waterPricePerLitre}/L`)
      if (prev.additivePricePerKg !== o.additivePricePerKg) changed.push(`Additives ₹${prev.additivePricePerKg} → ₹${o.additivePricePerKg}/kg`)
      if (prev.chargePerMetre !== o.chargePerMetre) changed.push(o.chargePerMetre ? 'Switched to charging per metre' : 'Switched to charging per day')
      if (!changed.length) changed.push('No change')
    }
    rows.push({ id: o.id, from: o.effectiveFrom, rigs: rigCode(o.rig), what: 'Operating cost', tone: LAYER.operating, changed, why: o.note || '—' })
  })

  // Client cost belongs to the project, so it applies to every rig drilling it.
  const projectRigs = rigsFor(state.shiftLogs, project).map(rigCode)
  const crs = newestFirst(state.clientRates.filter(c => c.project === project))
  crs.forEach((c, i) => {
    const prev = crs[i + 1]
    const changed: string[] = []
    if (!prev) changed.push(`First set — ${c.rateRows.length} rate lines`)
    else {
      c.rateRows.forEach(r => {
        const pr = prev.rateRows.find(x => x.holeSize === r.holeSize && x.formation === r.formation && x.fromDepth === r.fromDepth)
        const band = r.fromDepth != null || r.toDepth != null ? ` ${r.fromDepth ?? 0}–${r.toDepth ?? '∞'} m` : ''
        if (!pr) changed.push(`Added ${r.holeSize} ${r.formation}${band} ${perUnit(r.rate)}`)
        else if (pr.rate !== r.rate) changed.push(`${r.holeSize} ${r.formation}${band} ${perUnit(pr.rate)} → ${perUnit(r.rate)}${delta(pr.rate, r.rate)}`)
      })
      prev.rateRows.forEach(pr => {
        if (!c.rateRows.some(r => r.holeSize === pr.holeSize && r.formation === pr.formation && r.fromDepth === pr.fromDepth)) changed.push(`Removed ${pr.holeSize} ${pr.formation}`)
      })
      if (prev.standbyPerDay !== c.standbyPerDay) changed.push(`Standby ${money(prev.standbyPerDay)} → ${money(c.standbyPerDay)}/day`)
      if (!changed.length) changed.push('No change')
    }
    rows.push({
      id: c.id, from: c.effectiveFrom,
      rigs: projectRigs.length ? projectRigs.slice(0, 3).join(', ') + (projectRigs.length > 3 ? ` +${projectRigs.length - 3}` : '') : '—',
      what: 'Client cost', tone: LAYER.revenue, changed, why: c.note || '—',
    })
  })

  rows.sort((a, b) => b.from.localeCompare(a.from))

  return (
    <Modal title="Rates history" subtitle={`${rigCode(rig)} · ${projectCode(project)} — what changed, when, and why`} width={960} onClose={onClose}>
      {rows.length === 0 ? <Empty>No rates set yet.</Empty> : (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Date</th><th style={th}>Rig</th><th style={th}>What</th><th style={th}>What changed</th><th style={th}>Why</th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ borderBottom: rowBorder, verticalAlign: 'top' }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{fullDate(r.from)}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{r.rigs}</td>
                  <td style={td}><Tag tone={r.tone}>{r.what}</Tag></td>
                  <td style={{ ...td, whiteSpace: 'normal', maxWidth: 300, color: C.muted, lineHeight: 1.7 }}>
                    {r.changed.map((c, k) => <div key={k}>{c}</div>)}
                  </td>
                  <td style={{ ...td, whiteSpace: 'normal', maxWidth: 220, color: C.text, lineHeight: 1.6 }}>{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

function delta(from: number, to: number) {
  if (!from) return ''
  const p = ((to - from) / from) * 100
  return ` (${p >= 0 ? '+' : ''}${p.toFixed(1)}%)`
}

/* ==========================================================================
 * 5  Tabs
 * ========================================================================== */

/* PERFORMANCE — how the month is going, day by day.
 *
 * Two things only: the table and the graph. A zero-metre day shows its cost
 * with CPM as "—", never zero, because the rig still cost money that day.
 *
 * Every figure left of Service cost comes from a log. Everything right of it
 * is that quantity priced by the rate version in force on that day. */

function PerformanceTab({ v, rig, month }: { v: RigMonthView; rig: string; month: string }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!v.hasLogs) {
    return <Card><Empty>No driller logs for {rigCode(rig)} in {monthLabel(month)}.<br />Costing reads metres, hours, crew and fuel from the log — once shifts are recorded they cost out here.</Empty></Card>
  }

  const days = v.days
  const rate = v.roll.revenuePerUnit
  const r = v.roll

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card title="Performance" subtitle={`${rigCode(rig)} · ${monthLabel(month)} · click a day for the full breakdown`} pad={false}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Date</th><th style={th}>Hole</th><th style={th}>Status</th>
                <th style={th}>Size</th><th style={th}>Formation</th><th style={thR}>Crew</th><th style={thR}>Drill hrs</th><th style={thR}>Downtime</th><th style={thR}>Metres</th>
                <th style={thR}>Maint hrs</th><th style={thR}>Service</th><th style={thR}>Parts</th>
                <th style={thR}>Fuel</th><th style={thR}>Labour</th>
                <th style={thR}>Operating</th><th style={thR}>Ownership</th><th style={thR}>Total</th>
                <th style={thR}>CPM</th><th style={thR}>Revenue</th>
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
                        {!d.submitted && <span style={{ marginLeft: 6 }}><Tag tone={C.red}>no log</Tag></span>}
                      </td>
                      <td style={{ ...td, color: d.holeNumber ? C.muted : C.dim }}>{d.holeNumber || '—'}</td>
                      <td style={td}><Tag tone={statusColor(d.status)}>{DAY_STATUS_LABEL[d.status]}</Tag></td>
                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{d.shifts[0]?.holeSize ?? '—'}</td>
                      <td style={{ ...td, color: d.units ? C.muted : C.dim }}>
                        {d.units ? Array.from(new Set(d.charges.map(c => c.formation.replace(/ Formation$/, '')))).join(' → ') : '—'}
                      </td>
                      <td style={tdN}>{d.labour.heads || '—'}</td>
                      <td style={tdN}>{d.drillingHours || '—'}</td>
                      <td style={{ ...tdN, color: d.downtimeHours ? C.red : C.dim }}>{d.downtimeHours || '—'}</td>
                      <td style={{ ...tdN, color: d.units ? C.text : C.dim, fontWeight: 700 }}>{d.units || '—'}</td>
                      <td style={tdN}>{d.maintenanceHours || '—'}</td>
                      <td style={{ ...tdN, color: d.repairs ? C.purple : C.dim }}>{d.repairs ? money(d.repairs) : '—'}</td>
                      <td style={{ ...tdN, color: d.parts ? C.muted : C.dim }}>{d.parts ? money(d.parts) : '—'}</td>
                      <td style={tdN}>{money(d.fuel)}</td>
                      <td style={tdN}>{money(d.labour.total)}</td>
                      <td style={{ ...tdN, color: LAYER.operating }}>{money(d.operating)}</td>
                      <td style={{ ...tdN, color: LAYER.ownership }}>{d.ownership > 0 ? money(d.ownership) : '—'}</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 800 }}>{money(d.total)}</td>
                      <td style={{ ...tdN, fontWeight: 800, color: d.cpu == null ? C.dim : rate ? cpuColor(d.cpu, rate) : C.text }}>
                        {d.cpu == null ? '—' : perUnit(d.cpu)}
                      </td>
                      <td style={{ ...tdN, color: d.revenue > 0 ? LAYER.revenue : C.dim }}>{d.revenue > 0 ? money(d.revenue) : '—'}</td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={19} style={{ padding: '16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 22 }}>
                            <Detail title="From the log" tone={C.blue} rows={[
                              ['Shifts', `${d.shifts.length}`],
                              ['Day crew', `${d.labour.dayCrew}`],
                              ['Night crew', `${d.labour.nightCrew}`],
                              ['Core recovery', d.units > 0 ? pct((d.coreRecovery / d.units) * 100) : '—'],
                            ]} />
                            <Detail title="Operating" tone={LAYER.operating} rows={[
                              ['Fuel', `${money(d.fuel)} · ${d.fuelLitres} L`],
                              ['Water', money(d.water)],
                              ['Additives', money(d.additives)],
                              ['Service', money(d.repairs)],
                              ['Parts & tooling', money(d.parts)],
                            ]} />
                            <Detail title="Crew" tone={C.teal} rows={d.labour.perMetre
                              ? [['Charged', 'per metre'], ['Labour', money(d.labour.labour)], ['Lodging', money(d.labour.lodging)], ['Transport', money(d.labour.transport)], ['Crew cost', money(d.labour.total)]]
                              : [['Labour', money(d.labour.labour)], ['Lodging', money(d.labour.lodging)], ['Transport', money(d.labour.transport)], ['Crew cost', money(d.labour.total)]]} />
                            <Detail title="Day" tone={LAYER.full} rows={[
                              ['Operating', money(d.operating)],
                              ['Ownership', money(d.ownership)],
                              ['Full cost', money(d.total)],
                              ['Cost per metre', d.cpu == null ? 'nothing drilled' : perUnit(d.cpu)],
                              ['Client rate', d.rate > 0 ? perUnit(d.rate) : 'no matching rate line'],
                              ['Revenue', money(d.revenue)],
                            ]} />
                          </div>
                          {d.charges.length > 0 && (
                            <div style={{ marginTop: 14 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: LAYER.revenue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                How this day billed
                              </div>
                              <table style={tableStyle}>
                                <thead><tr><th style={th}>Shift</th><th style={th}>Size</th><th style={th}>Formation</th><th style={th}>Depth</th><th style={thR}>Metres</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
                                <tbody>
                                  {d.charges.map((c, k) => (
                                    <tr key={k} style={{ borderBottom: rowBorder }}>
                                      <td style={td}>{c.shift}</td>
                                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{c.holeSize}</td>
                                      <td style={{ ...td, color: C.text }}>{c.formation}</td>
                                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{c.fromDepth}–{c.toDepth} m</td>
                                      <td style={tdN}>{c.metres}</td>
                                      <td style={{ ...tdN, color: c.matched ? C.orange : C.red }}>{c.matched ? perUnit(c.rate) : 'no rate'}</td>
                                      <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(c.amount)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {d.adjustmentPct !== 0 && (
                            <div style={{ marginTop: 12 }}><Note tone={C.amber}>A size adjustment of {d.adjustmentPct}% applied to this day&apos;s rate.</Note></div>
                          )}
                          {d.unmatched && (
                            <div style={{ marginTop: 12 }}><Note tone={C.red}>
                              No rate line for {d.shifts[0]?.holeSize} + {d.shifts[0]?.formationType}, so these metres bill at zero. Add it in Set rates.
                            </Note></div>
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
                <td style={{ ...td, color: C.text, fontWeight: 800 }} colSpan={5}>{r.days} days</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{r.drillingHours}</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.red }}>{r.downtimeHours}</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{r.units}</td>
                <td style={{ ...tdN, fontWeight: 800 }}>{r.maintenanceHours || '—'}</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.purple }}>{money(r.repairs)}</td>
                <td style={{ ...tdN, fontWeight: 800 }}>{money(r.parts)}</td>
                <td style={{ ...tdN, fontWeight: 800 }}>{money(r.fuel)}</td>
                <td style={{ ...tdN, fontWeight: 800 }}>{money(r.labour)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.operating }}>{money(r.operating)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.ownership }}>{money(r.ownership)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{money(r.total)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.full }}>{perUnit(r.cpu)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue }}>{money(r.revenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <CPUChart days={days} rate={rate} />
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

/* DRILLHOLES — every hole the driller's log mentions, costed and priced.
 *
 * The list is derived from the log, so there is nothing to add here: a hole
 * appears the moment a shift is logged against its number, and the only thing
 * stored is the decision to close, approve or invoice it. */
function DrillholesTab({ v, onStatus, onInvoice }: {
  v: RigMonthView
  onStatus: (holeNumber: string, s: HoleStatus) => void
  onInvoice: (h: HoleResult) => void
}) {
  const [open, setOpen] = useState<string | null>(null)
  const unit = 'm'

  if (v.holes.length === 0) {
    return <Card><Empty>No holes logged for this rig this month.<br />A hole appears here as soon as the driller logs a shift against its number.</Empty></Card>
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

      <Card title="Drillholes" subtitle="Metres and cost from the driller's log, revenue at the rate in force each day" pad={false}>
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
                const isOpen = open === hole.holeNumber
                return (
                  <Fragment key={hole.holeNumber}>
                    <tr onClick={() => setOpen(isOpen ? null : hole.holeNumber)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
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
                              {/* The measurement book: one line per size, formation
                                  and rate, in depth order. This is exactly what
                                  prints on the invoice. */}
                              <table style={tableStyle}>
                                <thead><tr><th style={th}>Size</th><th style={th}>Formation</th><th style={th}>Depth</th><th style={thR}>Metres</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
                                <tbody>
                                  {h.billing.map((l, k) => (
                                    <tr key={k} style={{ borderBottom: rowBorder }}>
                                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{l.holeSize}</td>
                                      <td style={{ ...td, color: C.text }}>{l.formation}</td>
                                      <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{l.fromDepth}–{l.toDepth} m</td>
                                      <td style={tdN}>{l.metres}</td>
                                      <td style={{ ...tdN, color: l.matched ? C.orange : C.red }}>{l.matched ? perUnit(l.rate) : 'no rate'}</td>
                                      <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(l.amount)}</td>
                                    </tr>
                                  ))}
                                  {h.roll.standbyDays > 0 && (
                                    <tr style={{ borderBottom: rowBorder }}>
                                      <td style={td} colSpan={2}>Standby</td>
                                      <td style={td} />
                                      <td style={tdN}>{h.roll.standbyDays} d</td>
                                      <td style={tdN} />
                                      <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>
                                        {money(h.days.filter(d => d.status === 'standby').reduce((a, d) => a + d.revenue, 0))}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                                <tfoot>
                                  <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                    <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Revenue</td>
                                    <td style={{ ...tdN, fontWeight: 800 }}>{h.roll.units}</td>
                                    <td style={tdN} />
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
                            {hole.status === 'drilling' && <Btn size="sm" tone="primary" onClick={() => onStatus(hole.holeNumber, 'closed')}>Close hole</Btn>}
                            {hole.status === 'closed' && <>
                              <Btn size="sm" tone="primary" onClick={() => onStatus(hole.holeNumber, 'approved')}>Approve for billing</Btn>
                              <Btn size="sm" onClick={() => onStatus(hole.holeNumber, 'drilling')}>Reopen</Btn>
                            </>}
                            {hole.status === 'approved' && <>
                              <Btn size="sm" onClick={() => onStatus(hole.holeNumber, 'closed')}>Withdraw approval</Btn>
                              <Btn size="sm" tone="primary" onClick={() => onInvoice(h)}>Create invoice</Btn>
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

function BillingTab({ project, holes, clientRate, invoices, onCreate, onUpdate, onDelete }: {
  project: string; holes: HoleResult[]; clientRate?: ClientRate
  invoices: Invoice[]
  onCreate: (i: Invoice) => void; onUpdate: (i: Invoice) => void; onDelete: (id: string) => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [review, setReview] = useState(false)

  const ready = holes.filter(h => isBillable(h.hole))
  const waiting = holes.filter(h => h.hole.status === 'closed')
  const toggle = (id: string) => setPicked(s => { const n = new Set(Array.from(s)); n.has(id) ? n.delete(id) : n.add(id); return n })
  const chosen = ready.filter(h => picked.has(h.hole.holeNumber))
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
            <Btn size="sm" onClick={() => setPicked(picked.size === ready.length ? new Set() : new Set(ready.map(h => h.hole.holeNumber)))}>
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
                const on = picked.has(h.hole.holeNumber)
                return (
                  <tr key={h.hole.holeNumber} onClick={() => toggle(h.hole.holeNumber)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: on ? 'rgba(249,115,22,0.06)' : undefined }}>
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

      {invoices.length > 0 && <InvoiceTracker invoices={invoices} onUpdate={onUpdate} onDelete={onDelete} />}

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
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10)
  })
  // Anything billable that isn't metres — mobilisation, demobilisation, a
  // one-off the contract allows — is added here rather than tracked as a cost.
  const [extras, setExtras] = useState<{ id: string; label: string; amount: number }[]>([])

  // Lines are the measurement book — one per size, formation and rate, in
  // depth order, exactly as shown on the hole. A formation-priced contract
  // reads by rock type; a band-priced one reads by depth. Both come out of the
  // same structure, so the invoice can never disagree with the screen.
  const lines: InvoiceLine[] = []
  holes.forEach(h => {
    h.billing.forEach(l => lines.push({
      label: `${h.hole.holeNumber} · ${l.holeSize} · ${l.formation === ANY_FORMATION ? `${l.fromDepth}–${l.toDepth} m` : l.formation}`,
      qty: `${l.metres} m`,
      rate: perUnit(l.rate),
      amount: l.amount,
      depth: `${l.fromDepth}–${l.toDepth} m`,
    }))
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
          holeNumbers: holes.map(h => h.hole.holeNumber), lines, subtotal, taxPercent, total,
          status: 'issued', dueDate,
        })}>Create invoice</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Grid cols={4}>
          <TextField label="Invoice number" value={number} onChange={setNumber} />
          <DateField label="Date" value={date} onChange={setDate} />
          <DateField label="Payment due" value={dueDate} onChange={setDueDate} />
          <NumField label="Tax" value={taxPercent} onChange={setTax} suffix="%" />
        </Grid>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Description</th><th style={th}>Depth</th><th style={thR}>Quantity</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{l.label}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', color: C.faint }}>{l.depth ?? '—'}</td>
                  <td style={tdN}>{l.qty}</td><td style={tdN}>{l.rate}</td>
                  <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{money(l.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${C.border}` }}>
                <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={4}>Subtotal</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{money(subtotal)}</td>
              </tr>
              <tr><td style={td} colSpan={4}>Tax at {taxPercent}%</td><td style={tdN}>{money(subtotal * taxPercent / 100)}</td></tr>
              <tr style={{ background: 'rgba(59,130,246,0.06)' }}>
                <td style={{ ...td, fontWeight: 900, color: LAYER.revenue, fontSize: 13 }} colSpan={4}>Total</td>
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

/* The tracker: what is out, what is overdue, what has been paid. Overdue is
 * derived from the due date rather than being a status someone has to
 * remember to set, so it can never go stale. */
function InvoiceTracker({ invoices, onUpdate, onDelete }: {
  invoices: Invoice[]; onUpdate: (i: Invoice) => void; onDelete: (id: string) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const totals = invoices.reduce((a, i) => ({
    billed: a.billed + i.total,
    paid: a.paid + (i.paidAmount ?? 0),
    overdue: a.overdue + (isOverdue(i, today) ? outstanding(i) : 0),
  }), { billed: 0, paid: 0, overdue: 0 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        <Stat label="Invoiced" value={money(totals.billed)} color={LAYER.revenue} note={`${invoices.length} invoices`} />
        <Stat label="Received" value={money(totals.paid)} color={C.green} />
        <Stat label="Outstanding" value={money(totals.billed - totals.paid)} color={C.amber} />
        <Stat label="Overdue" value={money(totals.overdue)} color={totals.overdue > 0 ? C.red : C.dim} />
      </div>

      <Card title="Invoices" pad={false} subtitle="Deleting an invoice releases its holes back to Ready to bill">
        <table style={tableStyle}>
          <thead>
            <tr><th style={th}>Number</th><th style={th}>Date</th><th style={th}>Due</th><th style={th}>Holes</th>
              <th style={thR}>Total</th><th style={thR}>Received</th><th style={thR}>Outstanding</th>
              <th style={th}>Status</th><th style={th} /></tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const over = isOverdue(inv, today)
              const out = outstanding(inv)
              return (
                <tr key={inv.id} style={{ borderBottom: rowBorder, background: over ? 'rgba(239,68,68,0.04)' : undefined }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{inv.number}</td>
                  <td style={td}>{dayLabel(inv.date)}</td>
                  <td style={{ ...td, color: over ? C.red : C.muted }}>{inv.dueDate ? dayLabel(inv.dueDate) : '—'}</td>
                  <td style={{ ...td, whiteSpace: 'normal', maxWidth: 180 }}>{inv.holeNumbers.join(', ')}</td>
                  <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 800 }}>{money(inv.total)}</td>
                  <td style={{ ...tdN, color: inv.paidAmount ? C.green : C.dim }}>{inv.paidAmount ? money(inv.paidAmount) : '—'}</td>
                  <td style={{ ...tdN, color: out > 0 ? C.amber : C.dim }}>{out > 0 ? money(out) : '—'}</td>
                  <td style={td}>
                    <Tag tone={over ? C.red : inv.status === 'paid' ? C.green : inv.status === 'issued' ? C.blue : C.faint}>
                      {over ? 'Overdue' : INVOICE_STATUS_LABEL[inv.status]}
                    </Tag>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {inv.status !== 'paid' && (
                        <Btn size="sm" onClick={() => onUpdate({ ...inv, status: 'paid', paidDate: today, paidAmount: inv.total })}>
                          Mark paid
                        </Btn>
                      )}
                      {inv.status === 'paid' && (
                        <Btn size="sm" onClick={() => onUpdate({ ...inv, status: 'issued', paidDate: undefined, paidAmount: undefined })}>
                          Unpay
                        </Btn>
                      )}
                      <Btn size="sm" onClick={() => downloadInvoice(inv)}>Download</Btn>
                      <Btn size="sm" tone="danger" onClick={() => onDelete(inv.id)}>Delete</Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function downloadInvoice(inv: Invoice) {
  const rows = inv.lines.map(l =>
    `<tr><td>${l.label}</td><td>${l.depth ?? ''}</td><td class="r">${l.qty}</td><td class="r">${l.rate}</td><td class="r">${money(l.amount)}</td></tr>`).join('')
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
<div class="s" style="text-align:right">Bill to<br><strong style="font-size:14px;color:#111">${inv.client || inv.project}</strong><br>${inv.project}${inv.dueDate ? `<br>Payment due ${inv.dueDate}` : ''}</div></div>
<table><thead><tr><th>Description</th><th>Depth</th><th class="r">Quantity</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
<tbody>${rows}</tbody><tfoot>
<tr><td colspan="4" class="r">Subtotal</td><td class="r">${money(inv.subtotal)}</td></tr>
<tr><td colspan="4" class="r">Tax at ${inv.taxPercent}%</td><td class="r">${money(inv.subtotal * inv.taxPercent / 100)}</td></tr>
<tr class="tot"><td colspan="4" class="r">Total</td><td class="r">${money(inv.total)}</td></tr>
</tfoot></table>
<div class="f">Generated from XPLORIX Costing</div></body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url; a.download = `${inv.number}_${inv.project.replace(/\s+/g, '-')}.html`; a.click()
  URL.revokeObjectURL(url)
}

/* ==========================================================================
 * 7  The screen
 * ========================================================================== */

const TABS = ['Performance', 'Drillholes', 'Invoicing'] as const
type Tab = typeof TABS[number]

function CostingScreen() {
  const { state: inv } = useInventory()
  const { state, setHoleStatus, addInvoice, updateInvoice, deleteInvoice } = useCosting()

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
  const [tab, setTab] = useState<Tab>('Performance')

  useEffect(() => { if (!rigs.includes(rig)) setRig(rigs[0] ?? '') }, [rigs, rig])
  useEffect(() => { if (!months.includes(month)) setMonth(months[months.length - 1] ?? '') }, [months, month])

  const [showRates, setShowRates] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [quickInvoice, setQuickInvoice] = useState<HoleResult | null>(null)

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

      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <Chain label="Project">
          {projects.map(p => <Chip key={p} on={project === p} onClick={() => setProject(p)} label={projectCode(p)} />)}
        </Chain>
        <span style={{ width: 1, height: 22, background: C.border }} />
        <Chain label="Rig">
          {rigs.map(r => <Chip key={r} on={rig === r} onClick={() => setRig(r)} label={rigCode(r)} />)}
        </Chain>
        <div style={{ flex: 1 }} />
        {/* Any month is reachable, not just ones with logs — a month with none
            simply shows an empty table rather than being hidden. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Arrow dir="◀" onClick={() => setMonth(shiftMonth(month, -1))} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 128, textAlign: 'center', fontFamily: 'inherit' }}>
            {monthLabel(month)}
          </span>
          <Arrow dir="▶" onClick={() => setMonth(shiftMonth(month, 1))} />
        </div>
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

      </div>

      {tab === 'Performance' && <PerformanceTab v={v} rig={rig} month={month} />}
      {tab === 'Drillholes' && <DrillholesTab v={v} onStatus={setHoleStatus} onInvoice={h => setQuickInvoice(h)} />}
      {tab === 'Invoicing' && (
        <BillingTab project={project} holes={projectHoles} clientRate={v.clientRate}
          invoices={invoices} onCreate={addInvoice} onUpdate={updateInvoice} onDelete={deleteInvoice} />
      )}

      {showRates && (
        <SetRatesModal projects={projects} initialProject={project} initialRig={rig} month={month}
          rigsForProject={p => {
            const fromLogs = rigsFor(state.shiftLogs, p)
            return fromLogs.length ? fromLogs : ((inv.projects.find((x: { name: string }) => x.name === p)?.rigs ?? []) as string[])
          }}
          onClose={() => setShowRates(false)} />
      )}
      {quickInvoice && (
        <ReviewModal project={project} clientRate={v.clientRate} holes={[quickInvoice]}
          nextNumber={`INV-${String(invoices.length + 1).padStart(4, '0')}`}
          onClose={() => setQuickInvoice(null)}
          onCreate={inv => { addInvoice(inv); setQuickInvoice(null); setTab('Invoicing') }} />
      )}
      {showHistory && <RatesHistoryModal project={project} rig={rig} onClose={() => setShowHistory(false)} />}
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
      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{title}</div>
      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{sub}</div>
    </button>
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

function Arrow({ dir, onClick }: { dir: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 9px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, color: C.muted,
    }}>{dir}</button>
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
