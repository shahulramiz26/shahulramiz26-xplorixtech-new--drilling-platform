'use client'

/* XPLORIX COSTING — the whole screen.
 *
 * One route, one context chain (project -> rig -> month), four tabs over the
 * same costed data. Replaces the old Rig Cost / Project Cost split, where cost
 * and billing lived in different places and disagreed with each other.
 *
 * All calculation lives in lib/costing-store.tsx. This file is only the
 * interface. Sections below, in order:
 *
 *   1  Shared UI primitives
 *   2  Costing selectors (the hooks that cost a rig-month and a project)
 *   3  Calculator A — rig ownership
 *   4  Calculator B — operating & labour
 *   5  Calculator C — client rate grid
 *   6  Hole editor
 *   7  Overview tab
 *   8  Daily tab
 *   9  Holes tab
 *  10  Billing tab
 *  11  The screen itself
 */

import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { type PurchaseOrder, useInventory } from '../../../lib/inventory-store'
import {
  C,
  CostingProvider,
  DAY_STATUS_LABEL,
  LAYER,
  PROJECT_CLIENTS,
  cpmColorVsRate,
  crewHeads,
  dayCost,
  dayLabel,
  defaultClientRate,
  defaultLabourCard,
  defaultOperatingCard,
  defaultOwnership,
  derivedStyle,
  holeBilling,
  holeCommercial,
  holeCosting,
  holeDepth,
  holeStatusColor,
  iStyle,
  isBillable,
  labourForDay,
  logsFor,
  makeBand,
  marginColor,
  mobDemobCost,
  money,
  moneyL,
  monthLabel,
  monthOf,
  monthsFor,
  ownershipBreakdown,
  partsPerMetreFor,
  pct,
  rate as fmtRate,
  rigsFor,
  rollup,
  statusColor,
  uid,
  useCosting,
  withCumulative,
  type AllocationBasis,
  type ClientRate,
  type CostBasis,
  type CostRollup,
  type DailyLog,
  type DayCostWithMTD,
  type DayStatus,
  type DepthBand,
  type Hole,
  type HoleCommercial,
  type HoleInterval,
  type HoleStatus,
  type Invoice,
  type InvoiceLine,
  type LabourRateCard,
  type MobDemobEvent,
  type OperatingRateCard,
  type OwnershipBreakdown,
  type RigOwnership,
} from '../../../lib/costing-store'


/* ==========================================================================
 * Shared UI primitives
 * ========================================================================== */

/* Small shared primitives. The one idea worth naming: derived values are shown
 * in a dashed box, typed values in a solid one, so you can tell at a glance
 * which numbers XPLORIX worked out and which someone entered. */

function Card({ title, subtitle, right, children, pad = true, accent }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; pad?: boolean; accent?: string
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
      overflow: 'hidden', borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
      {title && (
        <div style={{
          padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: C.faint, marginTop: 3 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={pad ? { padding: 20 } : undefined}>{children}</div>
    </div>
  )
}

function Stat({ label, value, note, color = C.text, big }: {
  label: string; value: string; note?: string; color?: string; big?: boolean
}) {
  return (
    <div style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: big ? 26 : 19, fontWeight: 900, color, fontFamily: 'ui-monospace, monospace', lineHeight: 1.1 }}>{value}</div>
      {note && <div style={{ fontSize: 10, color: C.faint, marginTop: 5 }}>{note}</div>}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{hint}</div>}
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
          style={{ ...iStyle, color, fontWeight: 700, fontFamily: 'ui-monospace, monospace', paddingRight: suffix ? 44 : 12 }} />
        {suffix && <span style={{ position: 'absolute', right: 11, top: 10, fontSize: 11, color: C.dim, pointerEvents: 'none' }}>{suffix}</span>}
      </div>
    </Field>
  )
}

/* A value XPLORIX worked out. `onOverride` makes it typeable — the calculation
 * is a starting point, never a lock. Overridden values keep the manual tag so
 * a month later you can still see which figures were computed. */
function Derived({ label, value, hint, color = C.text, overridden, onOverride, onClear }: {
  label: string; value: string; hint?: string; color?: string
  overridden?: number | undefined
  onOverride?: (n: number) => void
  onClear?: () => void
}) {
  const isManual = overridden != null
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <Tag tone={isManual ? C.amber : C.dim}>{isManual ? 'manual' : 'auto'}</Tag>
      </div>
      {isManual && onOverride ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="number" value={overridden} onChange={e => onOverride(parseFloat(e.target.value) || 0)}
            style={{ ...iStyle, color: C.amber, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }} />
          <button onClick={onClear} title="Back to the calculated value"
            style={{ padding: '0 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>Reset</button>
        </div>
      ) : (
        <div style={{ ...derivedStyle, color, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span>{value}</span>
          {onOverride && (
            <button onClick={() => onOverride(0)} title="Enter this figure by hand"
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

function Toggle<T extends string>({ options, value, onChange, labels }: {
  options: readonly T[]; value: T; onChange: (v: T) => void; labels?: Record<string, string>
}) {
  return (
    <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, padding: '8px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          border: 'none', whiteSpace: 'nowrap', fontFamily: 'inherit',
          background: value === o ? C.orange : 'transparent', color: value === o ? '#fff' : C.faint,
        }}>{labels?.[o] ?? o}</button>
      ))}
    </div>
  )
}

function Btn({ children, onClick, tone = 'ghost', disabled, size = 'md' }: {
  children: ReactNode; onClick?: () => void; tone?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; size?: 'sm' | 'md'
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 9, fontWeight: 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1,
    padding: size === 'sm' ? '7px 13px' : '10px 18px', fontSize: size === 'sm' ? 12 : 13, whiteSpace: 'nowrap',
  }
  const tones: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`, color: '#fff', border: 'none' },
    ghost: { background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted },
    danger: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red },
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...tones[tone] }}>{children}</button>
}

function Note({ tone = C.blue, children }: { tone?: string; children: ReactNode }) {
  return (
    <div style={{
      padding: '11px 15px', borderRadius: 10, background: `${tone}0F`, border: `1px solid ${tone}33`,
      fontSize: 12, color: tone, display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.5,
    }}>{children}</div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: C.faint, fontSize: 13, lineHeight: 1.6 }}>{children}</div>
  )
}

/* Tables here are dense financial ledgers, so numerals are monospace and right
 * aligned — the column should read as a column of figures, not of words. */
const th: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)',
}
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 14px', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }
const tdN: React.CSSProperties = { ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const rowBorder = `1px solid rgba(30,41,59,0.5)`

function Modal({ title, subtitle, width = 620, onClose, children, footer }: {
  title: string; subtitle?: string; width?: number; onClose: () => void; children: ReactNode; footer?: ReactNode
}) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
        width, maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 26px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ padding: 7, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer', lineHeight: 0 }}>✕</button>
        </div>
        <div style={{ padding: 26, overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  )
}


/* ==========================================================================
 * Costing selectors
 * ========================================================================== */

/* One place computes cost, so the Daily table, the Holes table, the Overview
 * and the invoice can never disagree with each other. If a number appears in
 * two tabs it came from the same call. */

interface RigMonthView {
  hasLogs: boolean
  hasOwnership: boolean
  hasRates: boolean
  ownership: RigOwnership
  ob: OwnershipBreakdown
  days: DayCostWithMTD[]
  roll: CostRollup
  clientRate?: ClientRate
  holes: HoleCommercial[]
  mobDemob: MobDemobEvent[]
  mobDemobCostTotal: number
  // Cost on days that belong to no hole — standby between holes, idle, a
  // maintenance day after the last hole closed. Real money that no hole will
  // ever carry, so it is reported rather than quietly spread around.
  unallocated: number
  unallocatedDays: number
  // Budget vs actual: the client's sheet fixes ownership per metre by assuming
  // a monthly output. Under-produce and the same fixed cost lands on fewer
  // metres, which is exactly the leak a static sheet cannot show.
  budgetOwnershipCPM: number
  actualOwnershipCPM: number
  productionVariancePct: number
  avgClientRate: number
}

function useRigMonthView(
  project: string, rig: string, month: string, purchaseOrders: PurchaseOrder[],
): RigMonthView {
  const { state } = useCosting()

  return useMemo(() => {
    const logs = logsFor(state.dailyLogs, rig, project, month)

    const ownRec = state.ownership.find(o => o.rig === rig)
    const ownership = ownRec ?? defaultOwnership(rig)
    const ob = ownershipBreakdown(ownership, month)

    const opRec = state.operatingRates.find(r => r.rig === rig && r.project === project && r.month === month)
    const labRec = state.labourRates.find(r => r.rig === rig && r.project === project && r.month === month)
    const op = opRec ?? defaultOperatingCard(rig, project, month)
    const lab = labRec ?? defaultLabourCard(rig, project, month)

    const ppm = partsPerMetreFor(rig, project, logs, purchaseOrders)
    const costs = logs.map(l => dayCost(l, op, lab, ob, ownership, ppm))
    const days = withCumulative(costs)
    const roll = rollup(costs)

    const clientRate = state.clientRates[project]

    const holes = state.holes
      .filter(h => h.rig === rig && h.project === project)
      .map(h => holeCommercial(holeCosting(h, costs), clientRate))
      .sort((a, b) => a.costing.hole.startDate.localeCompare(b.costing.hole.startDate))

    const orphan = costs.filter(c => !c.log.holeId)
    const unallocated = orphan.reduce((s, c) => s + c.total, 0)

    const md = state.mobDemob.filter(e => e.rig === rig && e.project === project)

    const budgetOwnershipCPM = ownership.expectedMetresPerMonth > 0 ? ob.perMonth / ownership.expectedMetresPerMonth : 0
    const actualOwnershipCPM = roll.ownershipCPM
    const productionVariancePct = ownership.expectedMetresPerMonth > 0
      ? ((roll.metres - ownership.expectedMetresPerMonth) / ownership.expectedMetresPerMonth) * 100 : 0

    const billedMetres = holes.reduce((s, h) => s + h.billing.metres, 0)
    const billedRevenue = holes.reduce((s, h) => s + h.revenue, 0)
    const avgClientRate = billedMetres > 0 ? billedRevenue / billedMetres : 0

    return {
      hasLogs: logs.length > 0,
      hasOwnership: !!ownRec,
      hasRates: !!opRec && !!labRec,
      ownership, ob, days, roll, clientRate, holes,
      mobDemob: md,
      mobDemobCostTotal: md.reduce((s, e) => s + mobDemobCost(e), 0),
      unallocated, unallocatedDays: orphan.length,
      budgetOwnershipCPM, actualOwnershipCPM, productionVariancePct, avgClientRate,
    }
  }, [state, project, rig, month, purchaseOrders])
}

/* Billing works across the whole project, not one rig-month: a hole is billed
 * when it is approved, whichever rig drilled it and whatever month it closed
 * in. Holes span month boundaries and invoices follow the hole, not the
 * calendar. */
function useProjectHoles(project: string, purchaseOrders: PurchaseOrder[]): HoleCommercial[] {
  const { state } = useCosting()

  return useMemo(() => {
    const clientRate = state.clientRates[project]
    const projectHoles = state.holes.filter(h => h.project === project)

    // Cost every rig-month that this project's holes touch, once, then match
    // each hole against the resulting days.
    const keys = new Set<string>()
    projectHoles.forEach(h => {
      state.dailyLogs
        .filter(l => l.holeId === h.id)
        .forEach(l => keys.add(`${l.rig}|${monthOf(l.date)}`))
    })

    const allCosts = Array.from(keys).flatMap(k => {
      const [rig, month] = k.split('|')
      const logs = logsFor(state.dailyLogs, rig, project, month)
      const ownership = state.ownership.find(o => o.rig === rig) ?? defaultOwnership(rig)
      const ob = ownershipBreakdown(ownership, month)
      const op = state.operatingRates.find(r => r.rig === rig && r.project === project && r.month === month)
        ?? defaultOperatingCard(rig, project, month)
      const lab = state.labourRates.find(r => r.rig === rig && r.project === project && r.month === month)
        ?? defaultLabourCard(rig, project, month)
      const ppm = partsPerMetreFor(rig, project, logs, purchaseOrders)
      return logs.map(l => dayCost(l, op, lab, ob, ownership, ppm))
    })

    return projectHoles
      .map(h => holeCommercial(holeCosting(h, allCosts), clientRate))
      .sort((a, b) => (b.costing.hole.endDate || '9999').localeCompare(a.costing.hole.endDate || '9999'))
  }, [state, project, purchaseOrders])
}


/* ==========================================================================
 * Calculator A — rig ownership
 * ========================================================================== */

/* CALCULATOR A — Rig cost (ownership)
 *
 * Block C of the client's spreadsheet, with one deliberate change: the loan is
 * stored as principal / rate / tenure instead of a flat monthly figure, so the
 * system knows when the EMI ENDS. On the first month after tenure the rig gets
 * materially cheaper. A static sheet can never show that; this screen can. */

function RigCostCalculator({ rig, month, existing, onSave, onClose }: {
  rig: string; month: string
  existing?: RigOwnership
  onSave: (o: RigOwnership) => void
  onClose: () => void
}) {
  const [f, setF] = useState<RigOwnership>(existing ?? defaultOwnership(rig))
  const u = (p: Partial<RigOwnership>) => setF(x => ({ ...x, ...p }))
  const b = ownershipBreakdown(f, month)

  return (
    <Modal
      title="Rig cost calculator"
      subtitle={`${rig} · ${monthLabel(month)} · enter what you paid for the rig, XPLORIX works out the daily cost`}
      width={760} onClose={onClose}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={() => { onSave(f); onClose() }}>Save rig cost</Btn>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Landed price */}
        <Section title="What the rig cost to put on site">
          <Grid cols={4}>
            <NumField label="Basic price" value={f.basicPrice} onChange={n => u({ basicPrice: n })} suffix="₹" />
            <NumField label="GST" value={f.gstPercent} onChange={n => u({ gstPercent: n })} suffix="%" />
            <NumField label="Transportation" value={f.transportation} onChange={n => u({ transportation: n })} suffix="₹" />
            <Derived label="Landed price at site" value={money(b.landedPrice)} color={C.orange}
              overridden={f.landedPriceOverride}
              onOverride={n => u({ landedPriceOverride: n })}
              onClear={() => u({ landedPriceOverride: undefined })} />
          </Grid>
        </Section>

        {/* Depreciation */}
        <Section title="Depreciation">
          <Grid cols={4}>
            <NumField label="Rate per year" value={f.depreciationRatePct} onChange={n => u({ depreciationRatePct: n })} suffix="%" />
            <Derived label="Per year" value={money(b.depPerYear)} color={C.muted} />
            <Derived label="Per month" value={money(b.depPerMonth)} color={C.purple}
              overridden={f.depPerMonthOverride}
              onOverride={n => u({ depPerMonthOverride: n })}
              onClear={() => u({ depPerMonthOverride: undefined })} />
            <div />
          </Grid>
        </Section>

        {/* Finance */}
        <Section title="Finance">
          <Grid cols={4}>
            <NumField label="Loan principal" value={f.loanPrincipal} onChange={n => u({ loanPrincipal: n })} suffix="₹" />
            <NumField label="Interest per year" value={f.interestRatePct} onChange={n => u({ interestRatePct: n })} suffix="%" />
            <NumField label="Tenure" value={f.tenureMonths} onChange={n => u({ tenureMonths: n })} suffix="mth" />
            <Field label="First EMI month">
              <input type="month" value={f.emiStartDate} onChange={e => u({ emiStartDate: e.target.value })}
                style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, width: '100%', fontFamily: 'inherit', colorScheme: 'dark' }} />
            </Field>
          </Grid>
          <Grid cols={4}>
            <Derived label="EMI per month" value={money(b.emiFull)} color={C.blue}
              overridden={f.emiOverride}
              onOverride={n => u({ emiOverride: n })}
              onClear={() => u({ emiOverride: undefined })} />
            <NumField label="Insurance per year" value={f.insurancePerYear} onChange={n => u({ insurancePerYear: n })} suffix="₹" />
            <NumField label="Other fixed / month" value={f.otherFixedPerMonth} onChange={n => u({ otherFixedPerMonth: n })} suffix="₹" />
            <div />
          </Grid>

          {f.loanPrincipal > 0 && (
            <Note tone={b.emiActive ? C.blue : C.green}>
              {b.emiActive
                ? <span>{b.emiMonthsLeft} EMI {b.emiMonthsLeft === 1 ? 'payment' : 'payments'} left after {monthLabel(month)}. When the loan closes, ownership drops to {money(b.perDay - (b.emi / Math.max(1, f.expectedOperatingDays)))} per operating day and every hole this rig drills gets cheaper.</span>
                : <span>The loan is closed for {monthLabel(month)}, so no EMI is charged. Ownership is depreciation and insurance only.</span>}
            </Note>
          )}
        </Section>

        {/* Basis */}
        <Section title="How the cost is counted and spread">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Cost basis" hint={f.costBasis === 'cash'
              ? 'Depreciation + EMI. How the money actually leaves the business — the default, and what your spreadsheet does.'
              : 'Depreciation only. The loan repays the same capital depreciation writes off, so an accountant counts it once.'}>
              <Toggle options={['cash', 'accounting'] as const} value={f.costBasis}
                onChange={(v: CostBasis) => u({ costBasis: v })}
                labels={{ cash: 'Cash', accounting: 'Accounting' }} />
            </Field>

            <Field label="Spread ownership" hint="Per operating day is the default: the rig earns its keep on days it is on site and available.">
              <Toggle options={['operatingDay', 'calendarDay', 'expectedMetre'] as const} value={f.allocationBasis}
                onChange={(v: AllocationBasis) => u({ allocationBasis: v })}
                labels={{ operatingDay: 'Operating day', calendarDay: 'Calendar day', expectedMetre: 'Expected metre' }} />
            </Field>
          </div>

          <Grid cols={4}>
            <NumField label="Expected operating days" value={f.expectedOperatingDays} onChange={n => u({ expectedOperatingDays: n })} suffix="/mth"
              hint="Held steady on purpose" />
            <NumField label="Expected metres" value={f.expectedMetresPerMonth} onChange={n => u({ expectedMetresPerMonth: n })} suffix="m/mth" />
            <div /><div />
          </Grid>

          <Note tone={C.amber}>
            This denominator is an expectation, not a measurement, and it is held steady all month so a day&apos;s cost doesn&apos;t change
            retrospectively every time the rig drills. At month close the Overview compares it against the days actually worked.
          </Note>
        </Section>

        {/* Result */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>What XPLORIX will charge</span>
            <Tag tone={C.purple}>ownership</Tag>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <Line label="Depreciation" value={money(b.depPerMonth)} />
            <Line label="EMI" value={b.emi > 0 ? money(b.emi) : '—'} muted={b.emi === 0} />
            <Line label="Insurance" value={money(b.insurancePerMonth)} />
            <Line label="Other fixed" value={money(b.otherFixedPerMonth)} />
          </div>
          <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            <Line label="Ownership per month" value={money(b.perMonth)} big color={C.purple} />
            <Derived
              label={f.allocationBasis === 'expectedMetre' ? 'Ownership per metre' : 'Ownership per day'}
              value={f.allocationBasis === 'expectedMetre' ? `₹${Math.round(b.perMetre).toLocaleString('en-IN')}/m` : money(b.perDay)}
              hint={b.basisLabel}
              color={C.purple}
              overridden={f.allocationBasis === 'expectedMetre' ? undefined : f.ownershipPerDayOverride}
              onOverride={f.allocationBasis === 'expectedMetre' ? undefined : (n => u({ ownershipPerDayOverride: n }))}
              onClear={() => u({ ownershipPerDayOverride: undefined })}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</div>
      {children}
    </div>
  )
}
function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 14 }}>{children}</div>
}
function Line({ label, value, big, color = C.text, muted }: { label: string; value: string; big?: boolean; color?: string; muted?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: C.faint, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: big ? 20 : 14, fontWeight: 800, color: muted ? C.dim : color, fontFamily: 'ui-monospace, monospace' }}>{value}</div>
    </div>
  )
}


/* ==========================================================================
 * Calculator B — operating & labour
 * ========================================================================== */

const ALL_STATUSES: DayStatus[] = ['drilling', 'standby', 'breakdown', 'maintenance', 'mobilisation', 'demobilisation', 'idle']

/* CALCULATOR B — Operating and labour rates
 *
 * Rates only. Crew COUNT comes from the driller log, per shift, and is shown
 * here read-only so you can see the calculation working on real days. This is
 * what makes one day cost differently from the next, and it is why hole-level
 * costing stops being a monthly average sliced up. */

function OperatingCalculator({ rig, project, month, logs, existingOp, existingLab, onSave, onClose }: {
  rig: string; project: string; month: string
  logs: DailyLog[]
  existingOp?: OperatingRateCard
  existingLab?: LabourRateCard
  onSave: (op: OperatingRateCard, lab: LabourRateCard) => void
  onClose: () => void
}) {
  const [op, setOp] = useState<OperatingRateCard>(existingOp ?? defaultOperatingCard(rig, project, month))
  const [lab, setLab] = useState<LabourRateCard>(existingLab ?? defaultLabourCard(rig, project, month))
  const uo = (p: Partial<OperatingRateCard>) => setOp(x => ({ ...x, ...p }))
  const ul = (p: Partial<LabourRateCard>) => setLab(x => ({ ...x, ...p }))

  const consumablesPerMetre = op.waterPerMetre + op.fluidsPerMetre + op.maintenancePerMetre + op.coreBoxesPerMetre + op.toolingPerMetre
  const otherPerMetre = op.otherVariable.filter(o => o.basis === 'perMetre').reduce((s, o) => s + o.amount, 0)
  const otherPerDay = op.otherVariable.filter(o => o.basis === 'perDay').reduce((s, o) => s + o.amount, 0)

  // Preview against real logged days, so the rates are checked against what
  // actually happened rather than an imagined average day.
  const preview = logs.slice(0, 6).map(l => ({ log: l, lb: labourForDay(l, lab) }))

  const toggleStatus = (s: DayStatus) => ul({
    paidStatuses: lab.paidStatuses.includes(s) ? lab.paidStatuses.filter(x => x !== s) : [...lab.paidStatuses, s],
  })

  return (
    <Modal
      title="Operating & labour calculator"
      subtitle={`${rig} · ${project} · ${monthLabel(month)}`}
      width={840} onClose={onClose}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={() => { onSave(op, lab); onClose() }}>Save rates</Btn>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>

        <OpSection title="Fuel" note="Litres come from the log. Only the price is set here — so a standby day that burns fuel at zero metres still shows its true cost.">
          <OpGrid cols={4}>
            <NumField label="Fuel price" value={op.fuelPricePerLitre} onChange={n => uo({ fuelPricePerLitre: n })} suffix="₹/L" color={C.amber} />
            <div /><div /><div />
          </OpGrid>
        </OpSection>

        <OpSection title="Consumables" note="Charged against each metre drilled.">
          <OpGrid cols={5}>
            <NumField label="Water" value={op.waterPerMetre} onChange={n => uo({ waterPerMetre: n })} suffix="₹/m" />
            <NumField label="Fluids & additives" value={op.fluidsPerMetre} onChange={n => uo({ fluidsPerMetre: n })} suffix="₹/m" />
            <NumField label="Routine maintenance" value={op.maintenancePerMetre} onChange={n => uo({ maintenancePerMetre: n })} suffix="₹/m" />
            <NumField label="Core boxes" value={op.coreBoxesPerMetre} onChange={n => uo({ coreBoxesPerMetre: n })} suffix="₹/m" />
            <NumField label="Tooling" value={op.toolingPerMetre} onChange={n => uo({ toolingPerMetre: n })} suffix="₹/m" />
          </OpGrid>
          <OpGrid cols={3}>
            <Derived label="Consumables per metre" value={`₹${consumablesPerMetre.toLocaleString('en-IN')}/m`} color={C.amber} />
            <div /><div />
          </OpGrid>
          <Note tone={C.dim}>
            One-off repairs are not entered here — they are booked on the day they happened in the driller log, so a breakdown
            shows up on the day it hurt rather than smeared across the month.
          </Note>
        </OpSection>

        <OpSection title="Other variable costs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {op.otherVariable.map((o, i) => (
              <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={o.label} placeholder="What is it?"
                  onChange={e => uo({ otherVariable: op.otherVariable.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })}
                  style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, flex: 2, fontFamily: 'inherit' }} />
                <select value={o.basis}
                  onChange={e => uo({ otherVariable: op.otherVariable.map((x, j) => j === i ? { ...x, basis: e.target.value as 'perMetre' | 'perDay' } : x) })}
                  style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, flex: 1, fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="perMetre">per metre</option>
                  <option value="perDay">per day</option>
                </select>
                <input type="number" value={o.amount}
                  onChange={e => uo({ otherVariable: op.otherVariable.map((x, j) => j === i ? { ...x, amount: parseFloat(e.target.value) || 0 } : x) })}
                  style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.amber, fontSize: 13, flex: 1, fontFamily: 'ui-monospace, monospace', fontWeight: 700 }} />
                <Btn tone="danger" size="sm" onClick={() => uo({ otherVariable: op.otherVariable.filter((_, j) => j !== i) })}>Remove</Btn>
              </div>
            ))}
            <div>
              <Btn size="sm" onClick={() => uo({ otherVariable: [...op.otherVariable, { id: uid('ov'), label: '', basis: 'perMetre', amount: 0 }] })}>
                Add a cost line
              </Btn>
            </div>
          </div>
        </OpSection>

        <div style={{ height: 1, background: C.border }} />

        <OpSection title="Crew wages" note="Crew count per shift comes from the driller log. Set only what a head or a shift is paid.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Wage basis" hint={lab.wageBasis === 'perHead'
              ? 'Each person on shift is paid the shift rate.'
              : 'A flat amount per shift run, whatever the headcount.'}>
              <Toggle options={['perHead', 'perShift'] as const} value={lab.wageBasis}
                onChange={v => ul({ wageBasis: v })}
                labels={{ perHead: 'Per head, per shift', perShift: 'Flat per shift' }} />
            </Field>
            <Field label="Accommodation basis" hint={lab.accommodationBasis === 'perHead'
              ? 'Charged for every head on site that night.'
              : 'A flat camp or lodging charge per day.'}>
              <Toggle options={['perHead', 'flat'] as const} value={lab.accommodationBasis}
                onChange={v => ul({ accommodationBasis: v })}
                labels={{ perHead: 'Per head, per night', flat: 'Flat per day' }} />
            </Field>
          </div>
          <OpGrid cols={5}>
            <NumField label="Shift 1 rate" value={lab.shift1Rate} onChange={n => ul({ shift1Rate: n })} suffix="₹" color={C.blue} />
            <NumField label="Shift 2 rate" value={lab.shift2Rate} onChange={n => ul({ shift2Rate: n })} suffix="₹" color={C.blue}
              hint="Night premium goes here" />
            <NumField label="Accommodation" value={lab.accommodationRate} onChange={n => ul({ accommodationRate: n })} suffix="₹" />
            <NumField label="Crew transport (LMV)" value={lab.crewTransportPerDay} onChange={n => ul({ crewTransportPerDay: n })} suffix="₹/day" />
            <NumField label="Site supervision" value={lab.supervisionPerDay} onChange={n => ul({ supervisionPerDay: n })} suffix="₹/day" />
          </OpGrid>
        </OpSection>

        <OpSection title="Days the crew is paid" note="Crew is usually paid through standby and breakdown, and stood down when the rig is idle.">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(s => {
              const on = lab.paidStatuses.includes(s)
              return (
                <button key={s} onClick={() => toggleStatus(s)} style={{
                  padding: '8px 15px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  background: on ? 'rgba(59,130,246,0.14)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${on ? 'rgba(59,130,246,0.35)' : C.border}`,
                  color: on ? C.blue : C.faint,
                }}>{DAY_STATUS_LABEL[s]}</button>
              )
            })}
          </div>
        </OpSection>

        {preview.length > 0 && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>These rates, on real logged days</span>
              <Tag tone={C.dim}>crew from the log</Tag>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Date</th><th style={th}>Status</th>
                  <th style={thR}>Shift 1</th><th style={thR}>Shift 2</th>
                  <th style={thR}>Wages</th><th style={thR}>Stay</th>
                  <th style={thR}>Transport</th><th style={thR}>Supervision</th>
                  <th style={thR}>Labour</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(({ log, lb }) => (
                  <tr key={log.id} style={{ borderBottom: rowBorder }}>
                    <td style={td}>{log.date.slice(8)} {monthLabel(month).slice(0, 3)}</td>
                    <td style={td}>{DAY_STATUS_LABEL[log.status]}</td>
                    <td style={tdN}>{lb.shift1 || '—'}</td>
                    <td style={tdN}>{lb.shift2 || '—'}</td>
                    <td style={tdN}>{lb.wages ? money(lb.wages) : '—'}</td>
                    <td style={tdN}>{lb.accommodation ? money(lb.accommodation) : '—'}</td>
                    <td style={tdN}>{lb.transport ? money(lb.transport) : '—'}</td>
                    <td style={tdN}>{lb.supervision ? money(lb.supervision) : '—'}</td>
                    <td style={{ ...tdN, color: C.blue, fontWeight: 800 }}>{money(lb.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Note tone={C.amber}>
          Nothing on this screen is a quantity. Metres, hours, crew counts and fuel litres all come from the driller log —
          if a figure here could be measured on site, it belongs in the log instead.
          {otherPerDay > 0 || otherPerMetre > 0
            ? ` Other variable costs currently add ₹${otherPerMetre.toLocaleString('en-IN')}/m and ₹${otherPerDay.toLocaleString('en-IN')}/day.`
            : ''}
        </Note>
      </div>
    </Modal>
  )
}

function OpSection({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</div>
        {note && <div style={{ fontSize: 11, color: C.faint, marginTop: 4, maxWidth: 620, lineHeight: 1.5 }}>{note}</div>}
      </div>
      {children}
    </div>
  )
}
function OpGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 14 }}>{children}</div>
}


/* ==========================================================================
 * Calculator C — client rate grid
 * ========================================================================== */

/* CALCULATOR C — Client rate
 *
 * A manual formation x depth-band grid. Every cell is typed straight from the
 * client's rate schedule, because that is the only version guaranteed to agree
 * with their measurement book. Additive schedules are a special case of this —
 * the reverse isn't true, which is why the grid is the model.
 *
 * The margin preview beside it prices each cell against the rig's real full
 * CPM, so a rate is set against what the work actually costs today rather than
 * against a budget figure. */

function ClientRateCalculator({ project, existing, currentCPM, onSave, onClose }: {
  project: string
  existing?: ClientRate
  currentCPM: number
  onSave: (r: ClientRate) => void
  onClose: () => void
}) {
  const [f, setF] = useState<ClientRate>(existing ?? defaultClientRate(project))
  const [newFormation, setNewFormation] = useState('')
  const u = (p: Partial<ClientRate>) => setF(x => ({ ...x, ...p }))

  const setCell = (formation: string, bandId: string, v: number) =>
    u({ grid: { ...f.grid, [formation]: { ...(f.grid[formation] || {}), [bandId]: v } } })

  const addFormation = () => {
    const n = newFormation.trim()
    if (!n || f.formations.includes(n)) return
    u({ formations: [...f.formations, n] })
    setNewFormation('')
  }
  const removeFormation = (n: string) => {
    const g = { ...f.grid }; delete g[n]
    u({ formations: f.formations.filter(x => x !== n), grid: g })
  }

  const addBand = () => {
    const last = f.bands[f.bands.length - 1]
    const from = last ? (last.toDepth ?? last.fromDepth + 25) : 0
    const to = from + 25
    const nb = makeBand(uid('b'), `${from}–${to} m`, from, to)
    // The previous top band was open-ended; it now closes where this one starts.
    const bands = f.bands.map((b, i) => i === f.bands.length - 1 ? { ...b, toDepth: from, label: `${b.fromDepth}–${from} m` } : b)
    u({ bands: [...bands, { ...nb, toDepth: null, label: `${from} m+` }] })
  }
  const updBand = (id: string, p: Partial<DepthBand>) => u({ bands: f.bands.map(b => b.id === id ? { ...b, ...p } : b) })
  const removeBand = (id: string) => {
    const g: ClientRate['grid'] = {}
    Object.entries(f.grid).forEach(([form, row]) => {
      const r = { ...row }; delete r[id]; g[form] = r
    })
    u({ bands: f.bands.filter(b => b.id !== id), grid: g })
  }

  return (
    <Modal
      title="Client rate"
      subtitle={`${project} · ${f.client || 'set the client below'} · type each cell from the client's rate schedule`}
      width={900} onClose={onClose}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" onClick={() => { onSave(f); onClose() }}>Save client rate</Btn>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Client">
            <input value={f.client} onChange={e => u({ client: e.target.value })} placeholder="e.g. CMPDI"
              style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
          </Field>
          <Field label="Contract type">
            <Toggle options={['meterage', 'dayrate'] as const} value={f.contractType}
              onChange={v => u({ contractType: v })}
              labels={{ meterage: 'Paid per metre', dayrate: 'Paid per day' }} />
          </Field>
        </div>

        {f.contractType === 'meterage' ? (
          <>
            {/* Bands */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Depth bands</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>Measured from surface, in each hole. The top band stays open-ended.</div>
                </div>
                <Btn size="sm" onClick={addBand}>Add band</Btn>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {f.bands.map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                    <input value={b.label} onChange={e => updBand(b.id, { label: e.target.value })}
                      style={{ width: 84, background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }} />
                    <span style={{ fontSize: 10, color: C.dim }}>from</span>
                    <input type="number" value={b.fromDepth} onChange={e => updBand(b.id, { fromDepth: parseFloat(e.target.value) || 0 })}
                      style={{ width: 48, background: 'none', border: 'none', outline: 'none', color: C.muted, fontSize: 12, fontFamily: 'ui-monospace, monospace' }} />
                    <span style={{ fontSize: 10, color: C.dim }}>to</span>
                    <input type="number" value={b.toDepth ?? ''} placeholder="∞"
                      onChange={e => updBand(b.id, { toDepth: e.target.value === '' ? null : parseFloat(e.target.value) })}
                      style={{ width: 48, background: 'none', border: 'none', outline: 'none', color: C.muted, fontSize: 12, fontFamily: 'ui-monospace, monospace' }} />
                    {f.bands.length > 1 && (
                      <button onClick={() => removeBand(b.id)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 13, padding: 0 }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Rate per metre</span>
                  <Tag tone={C.orange}>typed, not calculated</Tag>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <input value={newFormation} onChange={e => setNewFormation(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addFormation() }}
                    placeholder="Add a formation"
                    style={{ padding: '7px 11px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12, width: 170, fontFamily: 'inherit' }} />
                  <Btn size="sm" onClick={addFormation}>Add</Btn>
                </div>
              </div>

              {f.formations.length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', color: C.faint, fontSize: 13 }}>
                  Add a formation to start the grid — whatever names the client&apos;s schedule uses.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={th}>Formation</th>
                        {f.bands.map(b => <th key={b.id} style={thR}>{b.label}</th>)}
                        <th style={th} />
                      </tr>
                    </thead>
                    <tbody>
                      {f.formations.map(form => (
                        <tr key={form} style={{ borderBottom: rowBorder }}>
                          <td style={{ ...td, color: C.text, fontWeight: 700 }}>{form}</td>
                          {f.bands.map(b => {
                            const v = f.grid[form]?.[b.id] ?? 0
                            return (
                              <td key={b.id} style={{ padding: '6px 8px' }}>
                                <input type="number" value={v}
                                  onChange={e => setCell(form, b.id, parseFloat(e.target.value) || 0)}
                                  style={{
                                    width: '100%', minWidth: 90, padding: '8px 10px', textAlign: 'right',
                                    background: v > 0 ? 'rgba(249,115,22,0.06)' : C.card,
                                    border: `1px solid ${v > 0 ? 'rgba(249,115,22,0.22)' : C.border}`,
                                    borderRadius: 7, color: v > 0 ? C.orange : C.faint,
                                    fontSize: 12, fontWeight: 700, fontFamily: 'ui-monospace, monospace', outline: 'none',
                                  }} />
                              </td>
                            )
                          })}
                          <td style={{ padding: '6px 10px' }}>
                            <button onClick={() => removeFormation(form)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 13 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Margin preview */}
            {currentCPM > 0 && f.formations.length > 0 && (
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Margin at each rate</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>
                    Against this rig&apos;s full cost of {fmtRate(currentCPM)} — what the work costs today, not what the budget assumed.
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={th}>Formation</th>
                        {f.bands.map(b => <th key={b.id} style={thR}>{b.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {f.formations.map(form => (
                        <tr key={form} style={{ borderBottom: rowBorder }}>
                          <td style={{ ...td, color: C.text, fontWeight: 700 }}>{form}</td>
                          {f.bands.map(b => {
                            const r = f.grid[form]?.[b.id] ?? 0
                            if (!r) return <td key={b.id} style={{ ...tdN, color: C.dim }}>—</td>
                            const m = r - currentCPM
                            return (
                              <td key={b.id} style={{ ...tdN, color: marginColor(m) }}>
                                {money(m)}<span style={{ color: C.dim, fontSize: 10 }}>/m</span>
                                <div style={{ fontSize: 10, color: C.faint }}>{pct((m / r) * 100)}</div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
              <NumField label="Standby" value={f.standbyRate} onChange={n => u({ standbyRate: n })} suffix="₹/day" color={C.purple} />
              <NumField label="Mobilisation, billable" value={f.mobilisationBillable} onChange={n => u({ mobilisationBillable: n })} suffix="₹" />
              <NumField label="Demobilisation, billable" value={f.demobilisationBillable} onChange={n => u({ demobilisationBillable: n })} suffix="₹" />
            </div>

            <Note tone={C.blue}>
              Mobilisation and demobilisation are billed as their own lines and never folded into the per-metre rate —
              spreading a one-off move across the month&apos;s metres makes every hole in that month read wrong.
            </Note>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            <NumField label="Drilling day" value={f.drillingDayRate} onChange={n => u({ drillingDayRate: n })} suffix="₹/day" color={C.green} />
            <NumField label="Standby day" value={f.standbyDayRate} onChange={n => u({ standbyDayRate: n })} suffix="₹/day" color={C.amber} />
            <NumField label="Repair day" value={f.repairDayRate} onChange={n => u({ repairDayRate: n })} suffix="₹/day" color={C.red} />
            <NumField label="Mobilisation, billable" value={f.mobilisationBillable} onChange={n => u({ mobilisationBillable: n })} suffix="₹" />
            <NumField label="Demobilisation, billable" value={f.demobilisationBillable} onChange={n => u({ demobilisationBillable: n })} suffix="₹" />
          </div>
        )}
      </div>
    </Modal>
  )
}


/* ==========================================================================
 * Hole editor
 * ========================================================================== */

/* Depth intervals, in order, contiguous. This is the change that makes
 * formation x band billing possible at all: an unordered {Soft: 20, Hard: 10}
 * cannot say WHERE the hard rock was, so it cannot be priced against a band.
 *
 * Each interval starts where the last one ended, so a hole is always a
 * continuous run from surface and no metre can be billed twice or missed. */

function HoleModal({ rig, project, clientRate, existing, onSave, onClose }: {
  rig: string; project: string
  clientRate?: ClientRate
  existing?: Hole
  onSave: (h: Omit<Hole, 'id'> & { id?: string }) => void
  onClose: () => void
}) {
  const [holeNumber, setHoleNumber] = useState(existing?.holeNumber ?? '')
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(existing?.endDate ?? '')
  const [status, setStatus] = useState<HoleStatus>(existing?.status ?? 'drilling')
  const [rows, setRows] = useState<{ to: number; formation: string }[]>(
    existing?.intervals.map(i => ({ to: i.toDepth, formation: i.formation })) ?? [{ to: 0, formation: '' }],
  )

  const formations = clientRate?.formations ?? []

  // Rebuild contiguous intervals from the running depths.
  const intervals: HoleInterval[] = []
  let from = 0
  rows.forEach(r => {
    if (r.to > from && r.formation.trim()) intervals.push({ fromDepth: from, toDepth: r.to, formation: r.formation.trim() })
    if (r.to > from) from = r.to
  })
  const depth = intervals.reduce((m, i) => Math.max(m, i.toDepth), 0)

  const preview = holeBilling(
    { id: existing?.id ?? 'preview', rig, project, holeNumber, startDate, status, intervals },
    clientRate,
  )

  const upd = (i: number, p: Partial<{ to: number; formation: string }>) =>
    setRows(rs => rs.map((r, j) => j === i ? { ...r, ...p } : r))
  const addRow = () => setRows(rs => [...rs, { to: (rs[rs.length - 1]?.to ?? 0) + 10, formation: '' }])
  const delRow = (i: number) => setRows(rs => rs.filter((_, j) => j !== i))

  const canSave = holeNumber.trim() !== '' && intervals.length > 0

  return (
    <Modal
      title={existing ? `Edit ${existing.holeNumber}` : 'Add a hole'}
      subtitle={`${rig} · ${project}`}
      width={820} onClose={onClose}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn tone="primary" disabled={!canSave}
          onClick={() => {
            onSave({
              id: existing?.id, rig, project,
              holeNumber: holeNumber.trim(), startDate,
              endDate: endDate || undefined, status, intervals,
              invoiceId: existing?.invoiceId,
            })
            onClose()
          }}>{existing ? 'Save hole' : 'Add hole'}</Btn>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
          <Field label="Hole number">
            <input value={holeNumber} onChange={e => setHoleNumber(e.target.value)} placeholder="DH-005"
              style={inp} />
          </Field>
          <Field label="Started">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inp, colorScheme: 'dark' }} />
          </Field>
          <Field label="Finished" hint="Leave empty while drilling">
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inp, colorScheme: 'dark' }} />
          </Field>
          <Field label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as HoleStatus)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="drilling">Drilling</option>
              <option value="closed">Closed</option>
              <option value="approved">Approved</option>
              <option value="invoiced">Invoiced</option>
            </select>
          </Field>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Depth intervals</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 4, maxWidth: 560, lineHeight: 1.5 }}>
                In order from surface. Each interval starts where the last one ended, so the hole is one continuous run and
                no metre can be billed twice or missed.
              </div>
            </div>
            <Btn size="sm" onClick={addRow}>Add interval</Btn>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r, i) => {
              const rFrom = i === 0 ? 0 : rows.slice(0, i).reduce((m, x) => Math.max(m, x.to), 0)
              const bad = r.to <= rFrom
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 76, padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: `1px dashed ${C.border}`, borderRadius: 8, color: C.faint, fontSize: 13, fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>
                    {rFrom}
                  </div>
                  <span style={{ color: C.dim, fontSize: 12 }}>to</span>
                  <input type="number" value={r.to} onChange={e => upd(i, { to: parseFloat(e.target.value) || 0 })}
                    style={{ ...inp, width: 96, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700, borderColor: bad ? C.red : C.border, color: bad ? C.red : C.text }} />
                  <span style={{ color: C.dim, fontSize: 12 }}>m</span>
                  {formations.length > 0 ? (
                    <select value={r.formation} onChange={e => upd(i, { formation: e.target.value })} style={{ ...inp, flex: 1, cursor: 'pointer' }}>
                      <option value="">Pick a formation</option>
                      {formations.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  ) : (
                    <input value={r.formation} onChange={e => upd(i, { formation: e.target.value })} placeholder="Formation" style={{ ...inp, flex: 1 }} />
                  )}
                  <span style={{ fontSize: 12, color: C.faint, width: 62, fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>
                    {r.to > rFrom ? `${r.to - rFrom} m` : '—'}
                  </span>
                  {rows.length > 1 && <Btn size="sm" tone="danger" onClick={() => delRow(i)}>Remove</Btn>}
                </div>
              )
            })}
          </div>

          {depth > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.faint }}>
              Total depth <strong style={{ color: C.text, fontFamily: 'ui-monospace, monospace' }}>{depth} m</strong>
            </div>
          )}
        </div>

        {preview.lines.length > 0 && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>How this bills</span>
              <Tag tone={LAYER.revenue}>split at each band boundary</Tag>
            </div>
            <table style={tableStyle}>
              <thead>
                <tr><th style={th}>Interval</th><th style={th}>Formation</th><th style={th}>Band</th><th style={thR}>Metres</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr>
              </thead>
              <tbody>
                {preview.lines.map((l, i) => (
                  <tr key={i} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{l.fromDepth}–{l.toDepth} m</td>
                    <td style={{ ...td, color: C.text }}>{l.formation}</td>
                    <td style={td}>{l.bandLabel}</td>
                    <td style={tdN}>{l.metres}</td>
                    <td style={{ ...tdN, color: l.rate ? C.orange : C.red }}>{l.rate ? fmtRate(l.rate) : 'no rate'}</td>
                    <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}` }}>
                  <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Revenue</td>
                  <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{preview.metres}</td>
                  <td style={{ ...tdN, color: C.faint }}>{fmtRate(preview.effectiveRate)}</td>
                  <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue }}>{money(preview.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {preview.unmatched.length > 0 && (
          <Note tone={C.red}>No rate in the grid for: {preview.unmatched.join(', ')}. Those metres bill at zero until the grid is filled in.</Note>
        )}

        {!clientRate && (
          <Note tone={C.amber}>No client rate for this project yet, so there is nothing to price these intervals against.</Note>
        )}
      </div>
    </Modal>
  )
}

const inp: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%',
}


/* ==========================================================================
 * Tab 1 — Overview
 * ========================================================================== */

/* OVERVIEW
 *
 * Deliberately not the primary workflow — monthly rig reporting lives here so
 * it stops being the thing the whole product is organised around. Its one job
 * the other tabs can't do: compare the budget the rate card assumes against
 * what the month actually delivered. */

function OverviewTab({ v, rig, month, onConfigureRig, onConfigureRates, onSetClientRate }: {
  v: RigMonthView; rig: string; month: string
  onConfigureRig: () => void; onConfigureRates: () => void; onSetClientRate: () => void
}) {
  if (!v.hasLogs) {
    return (
      <Card>
        <Empty>
          No driller logs for {rig} in {monthLabel(month)}.<br />
          Costing reads metres, hours, crew and fuel from the log — once days are recorded, they cost out here automatically.
        </Empty>
      </Card>
    )
  }

  const r = v.roll
  const full = r.cpm
  const clientRate = v.avgClientRate
  const marginCPM = clientRate > 0 ? clientRate - full : 0
  const ownershipGap = v.actualOwnershipCPM - v.budgetOwnershipCPM

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {(!v.hasOwnership || !v.hasRates) && (
        <Note tone={C.amber}>
          <span>
            {!v.hasOwnership && <>No rig cost is set for {rig}, so ownership is counting as zero and every CPM below is understated. </>}
            {!v.hasRates && <>No operating or labour rates are set for {monthLabel(month)}. </>}
            <button onClick={!v.hasOwnership ? onConfigureRig : onConfigureRates}
              style={{ background: 'none', border: 'none', color: C.amber, textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>
              Set them now
            </button>
          </span>
        </Note>
      )}

      {/* Headline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        <Stat label="Metres drilled" value={`${r.metres} m`} note={`${r.drillingDays} drilling days`} color={C.text} big />
        <Stat label="Full cost" value={moneyL(r.total)} note="operating + ownership" color={LAYER.full} big />
        <Stat label="Full cost per metre" value={fmtRate(full)} note="what a metre actually costs"
          color={clientRate ? cpmColorVsRate(full, clientRate) : LAYER.full} big />
        <Stat label="Margin per metre" value={clientRate ? fmtRate(marginCPM) : '—'}
          note={clientRate ? `${pct((marginCPM / clientRate) * 100)} at ${fmtRate(clientRate)}` : 'no client rate set'}
          color={clientRate ? marginColor(marginCPM) : C.faint} big />
      </div>

      {/* The three layers, kept apart on purpose */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        <LayerCard tone={LAYER.operating} title="Operating cost" value={moneyL(r.operating)} cpm={fmtRate(r.operatingCPM)}
          note="Fuel, consumables, crew, repairs, parts. What running the rig consumed." />
        <LayerCard tone={LAYER.ownership} title="Ownership cost" value={moneyL(r.ownership)} cpm={fmtRate(r.ownershipCPM)}
          note={`Depreciation, EMI, insurance — ${v.ob.basisLabel}. Due whether or not a metre gets drilled.`} />
        <LayerCard tone={LAYER.full} title="Full cost" value={moneyL(r.total)} cpm={fmtRate(full)}
          note="The only figure that should ever be compared against a client rate." />
      </div>

      {/* Budget vs actual — the thing the spreadsheet cannot do */}
      {v.hasOwnership && v.ownership.expectedMetresPerMonth > 0 && (
        <Card title="Budget against actual"
          subtitle="The rate card fixes ownership per metre by assuming a monthly output. Miss it and the same fixed cost lands on fewer metres."
          accent={Math.abs(v.productionVariancePct) > 5 ? C.amber : C.border}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 20 }}>
            <Compare label="Metres" budget={`${v.ownership.expectedMetresPerMonth} m`} actual={`${r.metres} m`}
              delta={`${v.productionVariancePct >= 0 ? '+' : ''}${v.productionVariancePct.toFixed(1)}%`}
              tone={v.productionVariancePct >= 0 ? C.green : C.red} />
            <Compare label="Operating days" budget={`${v.ownership.expectedOperatingDays}`} actual={`${r.operatingDays}`}
              delta={`${r.operatingDays - v.ownership.expectedOperatingDays >= 0 ? '+' : ''}${r.operatingDays - v.ownership.expectedOperatingDays}`}
              tone={r.operatingDays >= v.ownership.expectedOperatingDays ? C.green : C.amber} />
            <Compare label="Ownership per metre" budget={fmtRate(v.budgetOwnershipCPM)} actual={fmtRate(v.actualOwnershipCPM)}
              delta={`${ownershipGap >= 0 ? '+' : ''}${money(ownershipGap)}/m`}
              tone={ownershipGap <= 0 ? C.green : C.red} />
            <Compare label="Lost margin" budget="—"
              actual={ownershipGap > 0 ? money(ownershipGap * r.metres) : '—'}
              delta={ownershipGap > 0 ? 'from under-production' : 'output on target'}
              tone={ownershipGap > 0 ? C.red : C.green} />
          </div>
          {Math.abs(v.productionVariancePct) > 5 && (
            <div style={{ marginTop: 18 }}>
              <Note tone={ownershipGap > 0 ? C.red : C.green}>
                {ownershipGap > 0
                  ? <span>Output came in {Math.abs(v.productionVariancePct).toFixed(1)}% under the assumption, so {money(v.ob.perMonth)} of fixed cost spread across {r.metres} m instead of {v.ownership.expectedMetresPerMonth} m. That is {money(ownershipGap)} per metre of margin gone before anyone overspent on anything.</span>
                  : <span>Output ran {v.productionVariancePct.toFixed(1)}% above the assumption, so fixed cost spread further than budgeted and every metre carried {money(Math.abs(ownershipGap))} less ownership.</span>}
              </Note>
            </div>
          )}
        </Card>
      )}

      {/* Where the money went */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        <Card title="Where the money went" subtitle={`${monthLabel(month)} · ${rig}`} pad={false}
          right={<Btn size="sm" onClick={onConfigureRates}>Edit rates</Btn>}>
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Cost line</th><th style={thR}>Amount</th><th style={thR}>Per metre</th><th style={thR}>Share</th></tr>
            </thead>
            <tbody>
              {[
                { k: 'Fuel', v: r.fuel, note: `${r.fuelLitres.toLocaleString('en-IN')} L` },
                { k: 'Consumables', v: r.consumables, note: 'water, fluids, tooling, core boxes' },
                { k: 'Crew', v: r.labour, note: 'wages, stay, transport, supervision' },
                { k: 'Repairs booked', v: r.maintenance, note: 'one-off, on the day' },
                { k: 'Parts from inventory', v: r.parts, note: 'spread across the month\u2019s metres' },
                ...(r.otherVariable > 0 ? [{ k: 'Other variable', v: r.otherVariable, note: '' }] : []),
              ].map(x => (
                <tr key={x.k} style={{ borderBottom: rowBorder }}>
                  <td style={td}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{x.k}</div>
                    {x.note && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{x.note}</div>}
                  </td>
                  <td style={tdN}>{money(x.v)}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.metres > 0 ? fmtRate(x.v / r.metres) : '—'}</td>
                  <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((x.v / r.total) * 100) : '—'}</td>
                </tr>
              ))}
              <tr style={{ borderBottom: rowBorder, background: 'rgba(245,158,11,0.04)' }}>
                <td style={{ ...td, color: LAYER.operating, fontWeight: 800 }}>Operating cost</td>
                <td style={{ ...tdN, color: LAYER.operating, fontWeight: 800 }}>{money(r.operating)}</td>
                <td style={{ ...tdN, color: LAYER.operating }}>{fmtRate(r.operatingCPM)}</td>
                <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((r.operating / r.total) * 100) : '—'}</td>
              </tr>
              <tr style={{ borderBottom: rowBorder, background: 'rgba(139,92,246,0.04)' }}>
                <td style={{ ...td, color: LAYER.ownership, fontWeight: 800 }}>
                  Ownership cost
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{money(v.ob.perDay)}/day × {r.operatingDays} operating days</div>
                </td>
                <td style={{ ...tdN, color: LAYER.ownership, fontWeight: 800 }}>{money(r.ownership)}</td>
                <td style={{ ...tdN, color: LAYER.ownership }}>{fmtRate(r.ownershipCPM)}</td>
                <td style={{ ...tdN, color: C.faint }}>{r.total > 0 ? pct((r.ownership / r.total) * 100) : '—'}</td>
              </tr>
              <tr style={{ background: 'rgba(249,115,22,0.07)' }}>
                <td style={{ ...td, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>Full cost</td>
                <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{money(r.total)}</td>
                <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{fmtRate(full)}</td>
                <td style={tdN} />
              </tr>
            </tbody>
          </table>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Ownership detail */}
          <Card title="Rig ownership" subtitle={v.hasOwnership ? `${rig} · ${v.ownership.costBasis === 'cash' ? 'cash basis' : 'accounting basis'}` : 'not set up yet'}
            right={<Btn size="sm" onClick={onConfigureRig}>{v.hasOwnership ? 'Edit' : 'Set up'}</Btn>}>
            {v.hasOwnership ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <KV k="Landed price" v={money(v.ob.landedPrice)} />
                <KV k="Depreciation" v={`${money(v.ob.depPerMonth)}/mth`} />
                <KV k="EMI" v={v.ob.emi > 0 ? `${money(v.ob.emi)}/mth` : 'closed'} tone={v.ob.emi > 0 ? C.text : C.green} />
                <KV k="Insurance" v={`${money(v.ob.insurancePerMonth)}/mth`} />
                <div style={{ height: 1, background: C.border }} />
                <KV k="Ownership" v={`${money(v.ob.perMonth)}/mth`} tone={LAYER.ownership} bold />
                <KV k="Allocated" v={`${money(v.ob.perDay)}/day`} tone={LAYER.ownership} bold />
                {v.ob.emiActive && v.ob.emiMonthsLeft <= 24 && (
                  <div style={{ marginTop: 4 }}>
                    <Note tone={C.green}>
                      {v.ob.emiMonthsLeft} EMI payments left. After that ownership falls to {money((v.ob.perMonth - v.ob.emiFull) / Math.max(1, v.ownership.expectedOperatingDays))}/day.
                    </Note>
                  </div>
                )}
              </div>
            ) : <Empty>Set the purchase price, depreciation and loan terms and XPLORIX works out the daily cost.</Empty>}
          </Card>

          {/* Unallocated */}
          {v.unallocated > 0 && (
            <Card title="Cost carried by no hole" subtitle={`${v.unallocatedDays} days`} accent={C.amber}>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.amber, fontFamily: 'ui-monospace, monospace' }}>{money(v.unallocated)}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.6 }}>
                Standby between holes, idle days and maintenance after the last hole closed. Real money that no hole will ever
                carry and no client will ever be billed for. It is shown rather than spread around, because spreading it would
                make every hole look slightly worse and hide where the loss really is.
              </div>
            </Card>
          )}

          {/* Client rate */}
          <Card title="Client rate" subtitle={v.clientRate ? `${v.clientRate.client} · ${v.clientRate.contractType === 'meterage' ? 'paid per metre' : 'paid per day'}` : 'not set'}
            right={<Btn size="sm" onClick={onSetClientRate}>{v.clientRate ? 'Edit' : 'Set'}</Btn>}>
            {v.clientRate && clientRate > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <KV k="Average billed rate" v={fmtRate(clientRate)} tone={LAYER.revenue} bold />
                <KV k="Full cost" v={fmtRate(full)} tone={LAYER.full} />
                <div style={{ height: 1, background: C.border }} />
                <KV k="Margin" v={fmtRate(marginCPM)} tone={marginColor(marginCPM)} bold />
                <KV k="Margin %" v={pct((marginCPM / clientRate) * 100)} tone={marginColor(marginCPM)} />
              </div>
            ) : <Empty>Set the formation and depth-band grid to see margin.</Empty>}
          </Card>
        </div>
      </div>

      {/* Mob / demob */}
      {v.mobDemob.length > 0 && (
        <Card title="Mobilisation & demobilisation" pad={false}
          subtitle="Dated lump sums, kept out of the per-metre rate on purpose — a one-off move spread across the month's metres makes every hole read wrong.">
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Event</th><th style={th}>Date</th><th style={th}>What it covered</th><th style={thR}>Cost</th><th style={thR}>Billable</th><th style={thR}>Net</th></tr>
            </thead>
            <tbody>
              {v.mobDemob.map(e => {
                const c = mobDemobCost(e)
                const net = (e.billable ? e.billedAmount : 0) - c
                return (
                  <tr key={e.id} style={{ borderBottom: rowBorder }}>
                    <td style={{ ...td, color: C.text, fontWeight: 600, textTransform: 'capitalize' }}>{e.type}</td>
                    <td style={td}>{dayLabel(e.date)}</td>
                    <td style={{ ...td, whiteSpace: 'normal', maxWidth: 420, lineHeight: 1.6 }}>
                      {e.lines.map(l => `${l.label} ${money(l.amount)}`).join(' · ')}
                    </td>
                    <td style={{ ...tdN, color: C.red }}>{money(c)}</td>
                    <td style={{ ...tdN, color: LAYER.revenue }}>{e.billable ? money(e.billedAmount) : '—'}</td>
                    <td style={{ ...tdN, color: marginColor(net), fontWeight: 800 }}>{money(net)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function LayerCard({ tone, title, value, cpm, note }: { tone: string; title: string; value: string; cpm: string; note: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${tone}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: tone, fontFamily: 'ui-monospace, monospace' }}>{cpm}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: tone, fontFamily: 'ui-monospace, monospace', margin: '10px 0 8px' }}>{value}</div>
      <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.55 }}>{note}</div>
    </div>
  )
}

function Compare({ label, budget, actual, delta, tone }: { label: string; budget: string; actual: string; delta: string; tone: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 9 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.dim, fontFamily: 'ui-monospace, monospace', textDecoration: budget === '—' ? 'none' : undefined }}>{budget}</span>
        <span style={{ fontSize: 11, color: C.dim }}>→</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: 'ui-monospace, monospace' }}>{actual}</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: tone, marginTop: 5 }}>{delta}</div>
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
 * Tab 2 — Daily
 * ========================================================================== */

/* DAILY
 *
 * The tab the client asked for. Two decisions shape it:
 *
 * 1. A zero-metre day shows its cost with CPM as "—", never as zero. The rig
 *    still cost money that day; pretending otherwise is the whole problem with
 *    reading a month as one number.
 *
 * 2. CPM is never shown alone. Today, month-to-date and the hole run together,
 *    because a single metre against a full day of cost reads as an enormous
 *    CPM that is arithmetically correct and operationally meaningless. */

function DailyTab({ v, rig, month, onConfigureRates }: {
  v: RigMonthView; rig: string; month: string; onConfigureRates: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!v.hasLogs) {
    return <Card><Empty>No driller logs for {rig} in {monthLabel(month)}.</Empty></Card>
  }

  const days = v.days
  const last = days[days.length - 1]
  const lastDrilled = [...days].reverse().find(d => d.log.metres > 0)
  const clientRate = v.avgClientRate

  // The hole reading, taken from whichever hole the most recent day worked on.
  const currentHoleId = lastDrilled?.log.holeId
  const currentHole = v.holes.find(h => h.costing.hole.id === currentHoleId)

  const worst = [...days].filter(d => d.cpm != null).sort((a, b) => (b.cpm! - a.cpm!))[0]
  const zeroMetreDays = days.filter(d => d.log.metres === 0)
  const zeroMetreCost = zeroMetreDays.reduce((s, d) => s + d.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Three readings, never one */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        <Stat label={`Last drilling day · ${lastDrilled ? dayLabel(lastDrilled.log.date) : '—'}`}
          value={lastDrilled?.cpm != null ? fmtRate(lastDrilled.cpm) : '—'}
          note={lastDrilled ? `${lastDrilled.log.metres} m · ${money(lastDrilled.total)}` : 'no metres drilled yet'}
          color={lastDrilled?.cpm != null && clientRate ? cpmColorVsRate(lastDrilled.cpm, clientRate) : C.text} big />
        <Stat label="Month to date"
          value={last?.mtdCPM != null ? fmtRate(last.mtdCPM) : '—'}
          note={`${v.roll.metres} m · ${money(v.roll.total)}`}
          color={last?.mtdCPM != null && clientRate ? cpmColorVsRate(last.mtdCPM, clientRate) : LAYER.full} big />
        <Stat label={currentHole ? `Current hole · ${currentHole.costing.hole.holeNumber}` : 'Current hole'}
          value={currentHole && currentHole.costCPM > 0 ? fmtRate(currentHole.costCPM) : '—'}
          note={currentHole ? `${currentHole.costing.roll.metres} m · ${money(currentHole.cost)}` : 'no hole in progress'}
          color={currentHole && clientRate ? cpmColorVsRate(currentHole.costCPM, clientRate) : C.text} big />
      </div>

      <Note tone={C.dim}>
        A day&apos;s CPM on its own can mislead. One metre against a full day of cost reads as an enormous rate that is
        arithmetically right and tells you nothing about whether the rig is expensive — which is why month-to-date and the
        hole are always shown beside it.
      </Note>

      <CPMChart days={days} clientRate={clientRate} />

      {/* The table */}
      <Card title="Day by day" subtitle={`${rig} · ${monthLabel(month)} · click a day for the full cost breakdown`} pad={false}
        right={<Btn size="sm" onClick={onConfigureRates}>Edit rates</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Status</th>
                <th style={th}>Hole</th>
                <th style={thR}>Hours</th>
                <th style={thR}>Metres</th>
                <th style={thR}>Crew</th>
                <th style={thR}>Operating</th>
                <th style={thR}>Ownership</th>
                <th style={thR}>Total</th>
                <th style={thR}>CPM</th>
                <th style={thR}>MTD CPM</th>
              </tr>
            </thead>
            <tbody>
              {days.map(d => {
                const isOpen = expanded === d.log.id
                const zero = d.log.metres === 0
                return (
                  <Fragment key={d.log.id}>
                    <tr onClick={() => setExpanded(isOpen ? null : d.log.id)}
                      style={{
                        borderBottom: rowBorder, cursor: 'pointer',
                        background: isOpen ? 'rgba(249,115,22,0.05)' : zero ? 'rgba(239,68,68,0.03)' : undefined,
                      }}>
                      <td style={{ ...td, color: C.text, fontWeight: 600 }}>{dayLabel(d.log.date)}</td>
                      <td style={td}>
                        <Tag tone={statusColor(d.log.status)}>{DAY_STATUS_LABEL[d.log.status]}</Tag>
                      </td>
                      <td style={{ ...td, color: d.log.holeId ? C.muted : C.dim }}>{d.log.holeId || '—'}</td>
                      <td style={tdN}>{d.log.drillingHours || '—'}</td>
                      <td style={{ ...tdN, color: zero ? C.dim : C.text, fontWeight: 700 }}>{d.log.metres || '—'}</td>
                      <td style={tdN}>{crewHeads(d.log) || '—'}</td>
                      <td style={{ ...tdN, color: LAYER.operating }}>{money(d.operating)}</td>
                      <td style={{ ...tdN, color: LAYER.ownership }}>{d.ownership > 0 ? money(d.ownership) : '—'}</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 800 }}>{money(d.total)}</td>
                      <td style={{ ...tdN, fontWeight: 800, color: d.cpm == null ? C.dim : clientRate ? cpmColorVsRate(d.cpm, clientRate) : C.text }}>
                        {d.cpm == null ? '—' : fmtRate(d.cpm)}
                      </td>
                      <td style={{ ...tdN, color: C.faint }}>{d.mtdCPM == null ? '—' : fmtRate(d.mtdCPM)}</td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 22 }}>
                            <Detail title="Operating" tone={LAYER.operating} rows={[
                              ['Fuel', `${d.log.fuelLitres} L`, money(d.fuel)],
                              ['Consumables', `${d.log.metres} m`, money(d.consumables)],
                              ['Repairs booked', '', money(d.maintenance)],
                              ['Parts', '', money(d.parts)],
                              ...(d.otherVariable > 0 ? [['Other', '', money(d.otherVariable)] as [string, string, string]] : []),
                            ]} />
                            <Detail title="Crew" tone={C.blue} rows={[
                              ['On shift', `${d.labour.shift1} + ${d.labour.shift2}`, `${d.labour.heads} heads`],
                              ['Wages', '', money(d.labour.wages)],
                              ['Accommodation', '', money(d.labour.accommodation)],
                              ['Transport', '', money(d.labour.transport)],
                              ['Supervision', '', money(d.labour.supervision)],
                              ['Crew cost', '', d.labour.paid ? money(d.labour.total) : 'stood down'],
                            ]} />
                            <Detail title="Ownership" tone={LAYER.ownership} rows={[
                              ['Allocated', v.ob.basisLabel.replace('per ', ''), money(d.ownership)],
                              ['Depreciation share', '', money(v.ob.perMonth > 0 ? d.ownership * (v.ob.depPerMonth / v.ob.perMonth) : 0)],
                              ['EMI share', '', money(v.ob.perMonth > 0 ? d.ownership * (v.ob.emi / v.ob.perMonth) : 0)],
                            ]} />
                            <Detail title="Day" tone={LAYER.full} rows={[
                              ['Operating', '', money(d.operating)],
                              ['Ownership', '', money(d.ownership)],
                              ['Full cost', '', money(d.total)],
                              ['Metres', '', `${d.log.metres} m`],
                              ['CPM', '', d.cpm == null ? 'no metres drilled' : fmtRate(d.cpm)],
                            ]} />
                          </div>
                          {d.log.downtimeHours > 0 && (
                            <div style={{ marginTop: 14 }}>
                              <Note tone={C.red}>
                                {d.log.downtimeHours} hours of downtime on this day.
                                {d.log.metres === 0
                                  ? ` The rig produced nothing and still cost ${money(d.total)}.`
                                  : ` Cost per metre came out at ${fmtRate(d.cpm!)} against a month-to-date ${fmtRate(d.mtdCPM!)}.`}
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
                <td style={{ ...td, color: C.text, fontWeight: 800 }} colSpan={3}>{days.length} days</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{v.roll.drillingHours}</td>
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{v.roll.metres}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.operating }}>{money(v.roll.operating)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.ownership }}>{money(v.roll.ownership)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: C.text }}>{money(v.roll.total)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.full }}>{fmtRate(v.roll.cpm)}</td>
                <td style={tdN} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* What the table just told you */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
        {zeroMetreDays.length > 0 && (
          <Card title="Days that produced nothing" accent={C.red}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.red, fontFamily: 'ui-monospace, monospace' }}>{money(zeroMetreCost)}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.6 }}>
              Spent across {zeroMetreDays.length} {zeroMetreDays.length === 1 ? 'day' : 'days'} with no metres drilled
              ({zeroMetreDays.map(d => dayLabel(d.log.date)).join(', ')}). Crew, ownership and standing costs all continued.
              This is the cost a monthly average hides completely.
            </div>
          </Card>
        )}
        {worst && (
          <Card title="Most expensive metre" accent={C.amber}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.amber, fontFamily: 'ui-monospace, monospace' }}>{fmtRate(worst.cpm!)}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.6 }}>
              {dayLabel(worst.log.date)} — {worst.log.metres} m for {money(worst.total)}
              {worst.log.downtimeHours > 0 && `, with ${worst.log.downtimeHours} hours lost to downtime`}.
              Month-to-date sat at {fmtRate(worst.mtdCPM!)} that day.
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function Detail({ title, tone, rows }: { title: string; tone: string; rows: [string, string, string][] }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: tone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {rows.map(([k, sub, val], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
            <span style={{ fontSize: 11, color: C.faint }}>
              {k}{sub && <span style={{ color: C.dim }}> · {sub}</span>}
            </span>
            <span style={{ fontSize: 12, color: C.text, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* CPM trend. Daily CPM is drawn as points because it is genuinely spiky and a
 * connected line would imply a continuity that isn't there; month-to-date is
 * the line, because that one really is cumulative. */
function CPMChart({ days, clientRate }: { days: DayCostWithMTD[]; clientRate: number }) {
  const pts = days.filter(d => d.cpm != null)
  if (pts.length < 2) return null

  const W = 1000, H = 220, PL = 64, PR = 20, PT = 20, PB = 32
  const maxV = Math.max(...pts.map(p => p.cpm!), ...days.map(d => d.mtdCPM ?? 0), clientRate || 0) * 1.1
  const x = (i: number) => PL + (i / Math.max(1, days.length - 1)) * (W - PL - PR)
  const y = (v: number) => PT + (1 - v / maxV) * (H - PT - PB)

  const mtdPath = days
    .map((d, i) => d.mtdCPM == null ? null : `${i === 0 || days[i - 1].mtdCPM == null ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.mtdCPM).toFixed(1)}`)
    .filter(Boolean).join(' ')

  return (
    <Card title="Cost per metre through the month" subtitle="Points are single days. The line is month-to-date, which is the figure that actually settles." pad={false}>
      <div style={{ padding: '18px 20px 8px', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 620, height: 'auto', display: 'block' }}>
          {[0, 0.25, 0.5, 0.75, 1].map(f => {
            const v = maxV * (1 - f)
            return (
              <g key={f}>
                <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke={C.border} strokeWidth={1} />
                <text x={PL - 10} y={y(v) + 4} textAnchor="end" fill={C.dim} fontSize={11} fontFamily="ui-monospace, monospace">
                  {Math.round(v / 1000)}k
                </text>
              </g>
            )
          })}

          {clientRate > 0 && (
            <g>
              <line x1={PL} x2={W - PR} y1={y(clientRate)} y2={y(clientRate)} stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 5" />
              <text x={W - PR} y={y(clientRate) - 8} textAnchor="end" fill={C.blue} fontSize={11} fontWeight={700}>
                client rate {Math.round(clientRate).toLocaleString('en-IN')}
              </text>
            </g>
          )}

          {mtdPath && <path d={mtdPath} fill="none" stroke={C.orange} strokeWidth={2.5} strokeLinejoin="round" />}

          {days.map((d, i) => d.cpm == null ? (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={PT} y2={H - PB} stroke={C.red} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
              <circle cx={x(i)} cy={H - PB} r={3} fill={C.red} opacity={0.7} />
            </g>
          ) : (
            <circle key={i} cx={x(i)} cy={y(d.cpm)} r={4}
              fill={clientRate ? cpmColorVsRate(d.cpm, clientRate) : C.muted} />
          ))}

          {days.map((d, i) => (i % Math.ceil(days.length / 12) === 0 ? (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fill={C.dim} fontSize={10}>{d.log.date.slice(8)}</text>
          ) : null))}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '4px 20px 16px', flexWrap: 'wrap' }}>
        <Legend color={C.orange} label="Month to date" line />
        <Legend color={C.green} label="Day, healthy margin" />
        <Legend color={C.amber} label="Day, thin margin" />
        <Legend color={C.red} label="Day with no metres drilled" />
        {clientRate > 0 && <Legend color={C.blue} label="Client rate" line />}
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


/* ==========================================================================
 * Tab 3 — Holes
 * ========================================================================== */

/* HOLES
 *
 * The commercial heart. A contractor doesn't think "what did this rig cost in
 * August" — they think "what did this hole cost me, what can I bill for it,
 * and what did I make".
 *
 * Depth bands are a property of the hole, measured from surface in that hole,
 * which is why they can be applied here without the double-count that comes
 * from banding a monthly rig total. */

function HolesTab({ v, onSetClientRate, onEditHole, onAddHole, onStatus }: {
  v: RigMonthView
  onSetClientRate: () => void
  onEditHole: (h: Hole) => void
  onAddHole: () => void
  onStatus: (id: string, s: HoleStatus) => void
}) {
  const [open, setOpen] = useState<string | null>(null)

  if (v.holes.length === 0) {
    return (
      <Card right={<Btn tone="primary" size="sm" onClick={onAddHole}>Add a hole</Btn>} title="Holes"
        subtitle="Nothing recorded for this rig on this project yet">
        <Empty>Add a hole and record its depth intervals — XPLORIX matches the logged days to it and works out the cost.</Empty>
      </Card>
    )
  }

  const totals = v.holes.reduce((a, h) => ({
    metres: a.metres + h.costing.roll.metres,
    cost: a.cost + h.cost,
    revenue: a.revenue + h.revenue,
  }), { metres: 0, cost: 0, revenue: 0 })
  const totalProfit = totals.revenue - totals.cost

  const anyUnmatched = v.holes.some(h => h.billing.unmatched.length > 0)
  const anyMismatch = v.holes.some(h => h.costing.metresMismatch)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {!v.clientRate && (
        <Note tone={C.amber}>
          <span>
            No client rate for this project, so revenue and margin read as zero.{' '}
            <button onClick={onSetClientRate} style={{ background: 'none', border: 'none', color: C.amber, textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>
              Set the formation and depth-band grid
            </button>
          </span>
        </Note>
      )}

      {anyUnmatched && (
        <Note tone={C.red}>
          Some intervals have no rate in the grid. Those metres are priced at zero and flagged below rather than guessed —
          an invoice built on a guessed rate is worse than one that is obviously incomplete.
        </Note>
      )}

      {anyMismatch && (
        <Note tone={C.amber}>
          A hole&apos;s recorded depth doesn&apos;t match the metres logged against it. Billing follows the recorded depth,
          cost follows the log — so the two need reconciling before the hole is approved.
        </Note>
      )}

      <Card title="Holes" subtitle="Cost from the daily log, revenue from the rate grid, click a hole for the full billing breakdown"
        pad={false} right={<Btn size="sm" onClick={onAddHole}>Add a hole</Btn>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Hole</th>
                <th style={th}>Dates</th>
                <th style={th}>Status</th>
                <th style={thR}>Days</th>
                <th style={thR}>Metres</th>
                <th style={thR}>Cost</th>
                <th style={thR}>Cost / m</th>
                <th style={thR}>Client rate</th>
                <th style={thR}>Revenue</th>
                <th style={thR}>Profit</th>
                <th style={thR}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {v.holes.map(h => {
                const hole = h.costing.hole
                const isOpen = open === hole.id
                return (
                  <Fragment key={hole.id}>
                    <tr onClick={() => setOpen(isOpen ? null : hole.id)}
                      style={{ borderBottom: rowBorder, cursor: 'pointer', background: isOpen ? 'rgba(249,115,22,0.05)' : undefined }}>
                      <td style={{ ...td, color: C.text, fontWeight: 700 }}>
                        {hole.holeNumber}
                        {h.billing.unmatched.length > 0 && <span style={{ color: C.red, marginLeft: 7 }}>●</span>}
                        {h.costing.metresMismatch && <span style={{ color: C.amber, marginLeft: 5 }}>●</span>}
                      </td>
                      <td style={td}>{dayLabel(hole.startDate)} → {hole.endDate ? dayLabel(hole.endDate) : 'open'}</td>
                      <td style={td}><Tag tone={holeStatusColor(hole.status)}>{hole.status}</Tag></td>
                      <td style={tdN}>{h.costing.roll.days}</td>
                      <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{h.costing.roll.metres}</td>
                      <td style={{ ...tdN, color: LAYER.full }}>{money(h.cost)}</td>
                      <td style={{ ...tdN, color: LAYER.full, fontWeight: 700 }}>{fmtRate(h.costCPM)}</td>
                      <td style={{ ...tdN, color: C.faint }}>{h.revenueCPM > 0 ? fmtRate(h.revenueCPM) : '—'}</td>
                      <td style={{ ...tdN, color: LAYER.revenue }}>{h.revenue > 0 ? money(h.revenue) : '—'}</td>
                      <td style={{ ...tdN, color: marginColor(h.profit), fontWeight: 800 }}>{h.revenue > 0 ? money(h.profit) : '—'}</td>
                      <td style={{ ...tdN, color: marginColor(h.profit), fontWeight: 800 }}>{h.revenue > 0 ? pct(h.marginPct) : '—'}</td>
                    </tr>

                    {isOpen && (
                      <tr style={{ borderBottom: rowBorder, background: 'rgba(249,115,22,0.03)' }}>
                        <td colSpan={11} style={{ padding: '20px 22px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>

                            {/* What it cost */}
                            <div>
                              <SubHead tone={LAYER.full}>What {hole.holeNumber} cost</SubHead>
                              <table style={tableStyle}>
                                <tbody>
                                  {[
                                    ['Fuel', money(h.costing.roll.fuel)],
                                    ['Consumables', money(h.costing.roll.consumables)],
                                    ['Crew', money(h.costing.roll.labour)],
                                    ['Repairs booked', money(h.costing.roll.maintenance)],
                                    ['Parts', money(h.costing.roll.parts)],
                                  ].map(([k, val]) => (
                                    <tr key={k}><td style={td}>{k}</td><td style={tdN}>{val}</td></tr>
                                  ))}
                                  <tr style={{ borderTop: rowBorder }}>
                                    <td style={{ ...td, color: LAYER.operating, fontWeight: 700 }}>Operating</td>
                                    <td style={{ ...tdN, color: LAYER.operating, fontWeight: 700 }}>{money(h.costing.roll.operating)}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ ...td, color: LAYER.ownership, fontWeight: 700 }}>
                                      Ownership
                                      <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{h.costing.roll.operatingDays} operating days</div>
                                    </td>
                                    <td style={{ ...tdN, color: LAYER.ownership, fontWeight: 700 }}>{money(h.costing.roll.ownership)}</td>
                                  </tr>
                                  <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                    <td style={{ ...td, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>Full cost</td>
                                    <td style={{ ...tdN, color: LAYER.full, fontWeight: 900, fontSize: 13 }}>{money(h.cost)}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ ...td, color: C.faint }}>Cost per metre</td>
                                    <td style={{ ...tdN, color: LAYER.full, fontWeight: 800 }}>{fmtRate(h.costCPM)}</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                <Mini k="Drilling days" v={`${h.costing.roll.drillingDays}`} />
                                <Mini k="Standby" v={`${h.costing.roll.standbyDays}`} />
                                <Mini k="Breakdown" v={`${h.costing.roll.breakdownDays}`} />
                                <Mini k="Downtime" v={`${h.costing.roll.downtimeHours} hrs`} />
                                <Mini k="Fuel" v={`${h.costing.roll.fuelLitres.toLocaleString('en-IN')} L`} />
                              </div>
                            </div>

                            {/* What it bills */}
                            <div>
                              <SubHead tone={LAYER.revenue}>What {hole.holeNumber} bills</SubHead>
                              {h.billing.lines.length === 0 ? (
                                <Empty>No rate grid set, so this hole has no revenue yet.</Empty>
                              ) : (
                                <table style={tableStyle}>
                                  <thead>
                                    <tr>
                                      <th style={th}>Interval</th><th style={th}>Formation</th><th style={th}>Band</th>
                                      <th style={thR}>Metres</th><th style={thR}>Rate</th><th style={thR}>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {h.billing.lines.map((l, i) => (
                                      <tr key={i} style={{ borderBottom: rowBorder }}>
                                        <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{l.fromDepth}–{l.toDepth} m</td>
                                        <td style={{ ...td, color: C.text }}>{l.formation}</td>
                                        <td style={td}>{l.bandLabel}</td>
                                        <td style={tdN}>{l.metres}</td>
                                        <td style={{ ...tdN, color: l.rate ? C.orange : C.red }}>{l.rate ? fmtRate(l.rate) : 'no rate'}</td>
                                        <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(l.amount)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                      <td style={{ ...td, fontWeight: 800, color: C.text }} colSpan={3}>Revenue</td>
                                      <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{h.billing.metres}</td>
                                      <td style={{ ...tdN, color: C.faint }}>{fmtRate(h.billing.effectiveRate)}</td>
                                      <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue, fontSize: 13 }}>{money(h.revenue)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              )}

                              {h.billing.unmatched.length > 0 && (
                                <div style={{ marginTop: 14 }}>
                                  <Note tone={C.red}>No rate in the grid for: {h.billing.unmatched.join(', ')}. Those metres are billing at zero.</Note>
                                </div>
                              )}

                              {h.revenue > 0 && (
                                <div style={{ marginTop: 18, padding: '16px 18px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                    <Res k="Revenue" v={money(h.revenue)} tone={LAYER.revenue} />
                                    <Res k="Cost" v={money(h.cost)} tone={LAYER.full} />
                                    <Res k="Profit" v={money(h.profit)} tone={marginColor(h.profit)} big />
                                  </div>
                                  <div style={{ marginTop: 14, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
                                    {h.costing.roll.metres} m at {fmtRate(h.revenueCPM)} against {fmtRate(h.costCPM)} —
                                    a margin of {fmtRate(h.marginCPM)} per metre, or {pct(h.marginPct)}.
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {h.costing.metresMismatch && (
                            <div style={{ marginTop: 16 }}>
                              <Note tone={C.amber}>
                                Recorded depth is {holeDepth(hole)} m but {h.costing.roll.metres} m are logged against this hole.
                                Billing uses the recorded depth, cost uses the log — reconcile before approving.
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
                            {hole.status === 'invoiced' && <span style={{ fontSize: 12, color: C.purple }}>On invoice {hole.invoiceId}</span>}
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
                <td style={{ ...tdN, fontWeight: 800, color: C.text }}>{totals.metres}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.full }}>{money(totals.cost)}</td>
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.full }}>{totals.metres > 0 ? fmtRate(totals.cost / totals.metres) : '—'}</td>
                <td style={tdN} />
                <td style={{ ...tdN, fontWeight: 800, color: LAYER.revenue }}>{money(totals.revenue)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: marginColor(totalProfit) }}>{money(totalProfit)}</td>
                <td style={{ ...tdN, fontWeight: 900, color: marginColor(totalProfit) }}>{totals.revenue > 0 ? pct((totalProfit / totals.revenue) * 100) : '—'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {v.unallocated > 0 && (
        <Note tone={C.amber}>
          These holes carry {money(totals.cost)} between them, but the rig spent {money(totals.cost + v.unallocated)} this month.
          The difference of {money(v.unallocated)} sat on {v.unallocatedDays} days that belonged to no hole. Add it back before
          comparing hole margin to the month&apos;s bottom line.
        </Note>
      )}
    </div>
  )
}

function SubHead({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: tone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{children}</div>
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


/* ==========================================================================
 * Tab 4 — Billing
 * ========================================================================== */

/* BILLING
 *
 * Only holes that are approved and not already invoiced. Invoicing stamps each
 * hole with its invoice id, so the same hole can never be billed twice —
 * deleting the invoice releases them back.
 *
 * Billing is project-wide rather than rig-month, because a hole is billed when
 * it is approved, whichever rig drilled it and whatever month it closed in.
 * Holes cross month boundaries; invoices follow the hole, not the calendar. */

function BillingTab({ project, holes, clientRate, mobDemob, invoices, onCreate, onDelete, onSetClientRate }: {
  project: string
  holes: HoleCommercial[]
  clientRate?: ClientRate
  mobDemob: MobDemobEvent[]
  invoices: Invoice[]
  onCreate: (inv: Invoice) => void
  onDelete: (id: string) => void
  onSetClientRate: () => void
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [pickedMD, setPickedMD] = useState<Set<string>>(new Set())
  const [review, setReview] = useState(false)

  const ready = holes.filter(h => isBillable(h.costing.hole))
  const waiting = holes.filter(h => h.costing.hole.status === 'closed')
  const readyMD = mobDemob.filter(e => e.billable && !e.invoiceId)

  const toggle = (id: string) => setPicked(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const toggleMD = (id: string) => setPickedMD(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const chosen = ready.filter(h => picked.has(h.costing.hole.id))
  const chosenMD = readyMD.filter(e => pickedMD.has(e.id))
  const sel = {
    metres: chosen.reduce((s, h) => s + h.billing.metres, 0),
    revenue: chosen.reduce((s, h) => s + h.revenue, 0) + chosenMD.reduce((s, e) => s + e.billedAmount, 0),
    cost: chosen.reduce((s, h) => s + h.cost, 0) + chosenMD.reduce((s, e) => s + mobDemobCost(e), 0),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {!clientRate && (
        <Note tone={C.amber}>
          <span>No client rate set for {project}, so nothing can be billed.{' '}
            <button onClick={onSetClientRate} style={{ background: 'none', border: 'none', color: C.amber, textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}>Set it now</button>
          </span>
        </Note>
      )}

      {waiting.length > 0 && (
        <Note tone={C.blue}>
          {waiting.length} {waiting.length === 1 ? 'hole is' : 'holes are'} closed but not yet approved
          ({waiting.map(h => h.costing.hole.holeNumber).join(', ')}). Approve them in the Holes tab to bill.
        </Note>
      )}

      <Card title="Ready to bill" pad={false}
        subtitle="Approved holes that haven't been invoiced. Cost is shown beside revenue so nothing goes out at a loss unnoticed."
        right={ready.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Btn size="sm" onClick={() => setPicked(picked.size === ready.length ? new Set() : new Set(ready.map(h => h.costing.hole.id)))}>
              {picked.size === ready.length ? 'Clear' : 'Select all'}
            </Btn>
            <Btn size="sm" tone="primary" disabled={chosen.length === 0 && chosenMD.length === 0} onClick={() => setReview(true)}>
              Review {chosen.length + chosenMD.length > 0 ? `(${chosen.length + chosenMD.length})` : ''}
            </Btn>
          </div>
        ) : undefined}>
        {ready.length === 0 ? (
          <Empty>Nothing approved and waiting. Close a hole, approve it, and it appears here.</Empty>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...th, width: 44 }} />
                <th style={th}>Hole</th><th style={th}>Rig</th><th style={th}>Closed</th>
                <th style={thR}>Metres</th><th style={thR}>Cost</th><th style={thR}>Cost / m</th>
                <th style={thR}>Rate</th><th style={thR}>Revenue</th><th style={thR}>Profit</th><th style={thR}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {ready.map(h => {
                const hole = h.costing.hole
                const on = picked.has(hole.id)
                return (
                  <tr key={hole.id} onClick={() => toggle(hole.id)}
                    style={{ borderBottom: rowBorder, cursor: 'pointer', background: on ? 'rgba(249,115,22,0.06)' : undefined }}>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', width: 16, height: 16, borderRadius: 5,
                        border: `1.5px solid ${on ? C.orange : C.border}`, background: on ? C.orange : 'transparent',
                        color: '#fff', fontSize: 11, lineHeight: '14px', textAlign: 'center',
                      }}>{on ? '✓' : ''}</span>
                    </td>
                    <td style={{ ...td, color: C.text, fontWeight: 700 }}>{hole.holeNumber}</td>
                    <td style={td}>{hole.rig}</td>
                    <td style={td}>{hole.endDate ? dayLabel(hole.endDate) : '—'}</td>
                    <td style={{ ...tdN, color: C.text, fontWeight: 700 }}>{h.billing.metres}</td>
                    <td style={{ ...tdN, color: LAYER.full }}>{money(h.cost)}</td>
                    <td style={{ ...tdN, color: LAYER.full }}>{fmtRate(h.costCPM)}</td>
                    <td style={{ ...tdN, color: C.faint }}>{fmtRate(h.revenueCPM)}</td>
                    <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(h.revenue)}</td>
                    <td style={{ ...tdN, color: marginColor(h.profit), fontWeight: 800 }}>{money(h.profit)}</td>
                    <td style={{ ...tdN, color: marginColor(h.profit), fontWeight: 800 }}>{pct(h.marginPct)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      {readyMD.length > 0 && (
        <Card title="Mobilisation & demobilisation" pad={false} subtitle="Billed as their own lines, never folded into the metre rate">
          <table style={tableStyle}>
            <thead>
              <tr><th style={{ ...th, width: 44 }} /><th style={th}>Event</th><th style={th}>Rig</th><th style={th}>Date</th><th style={thR}>Cost</th><th style={thR}>Billable</th><th style={thR}>Net</th></tr>
            </thead>
            <tbody>
              {readyMD.map(e => {
                const on = pickedMD.has(e.id); const c = mobDemobCost(e); const net = e.billedAmount - c
                return (
                  <tr key={e.id} onClick={() => toggleMD(e.id)} style={{ borderBottom: rowBorder, cursor: 'pointer', background: on ? 'rgba(249,115,22,0.06)' : undefined }}>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${on ? C.orange : C.border}`, background: on ? C.orange : 'transparent', color: '#fff', fontSize: 11, lineHeight: '14px', textAlign: 'center' }}>{on ? '✓' : ''}</span>
                    </td>
                    <td style={{ ...td, color: C.text, fontWeight: 600, textTransform: 'capitalize' }}>{e.type}</td>
                    <td style={td}>{e.rig}</td>
                    <td style={td}>{dayLabel(e.date)}</td>
                    <td style={{ ...tdN, color: C.red }}>{money(c)}</td>
                    <td style={{ ...tdN, color: LAYER.revenue, fontWeight: 700 }}>{money(e.billedAmount)}</td>
                    <td style={{ ...tdN, color: marginColor(net), fontWeight: 800 }}>{money(net)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {(chosen.length > 0 || chosenMD.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
          <SelStat k="Selected" v={`${chosen.length + chosenMD.length}`} note={`${sel.metres} m`} />
          <SelStat k="Revenue" v={money(sel.revenue)} tone={LAYER.revenue} />
          <SelStat k="Cost" v={money(sel.cost)} tone={LAYER.full} />
          <SelStat k="Profit" v={money(sel.revenue - sel.cost)} tone={marginColor(sel.revenue - sel.cost)}
            note={sel.revenue > 0 ? pct(((sel.revenue - sel.cost) / sel.revenue) * 100) : ''} />
        </div>
      )}

      {invoices.length > 0 && (
        <Card title="Invoices" pad={false} subtitle="Deleting an invoice releases its holes back to Ready to bill">
          <table style={tableStyle}>
            <thead>
              <tr><th style={th}>Number</th><th style={th}>Date</th><th style={th}>Covers</th><th style={thR}>Subtotal</th><th style={thR}>Tax</th><th style={thR}>Total</th><th style={th} /></tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, fontWeight: 700 }}>{inv.number}</td>
                  <td style={td}>{dayLabel(inv.date)}</td>
                  <td style={td}>{[...inv.holeIds, ...inv.mobDemobIds.map(() => 'mob/demob')].join(', ')}</td>
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
        <ReviewModal
          project={project} clientRate={clientRate}
          holes={chosen} mobDemob={chosenMD}
          onClose={() => setReview(false)}
          onCreate={inv => { onCreate(inv); setPicked(new Set()); setPickedMD(new Set()); setReview(false) }}
          nextNumber={`INV-${String(invoices.length + 1).padStart(4, '0')}`}
        />
      )}
    </div>
  )
}

function SelStat({ k, v, note, tone = C.text }: { k: string; v: string; note?: string; tone?: string }) {
  return (
    <div style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{k}</div>
      <div style={{ fontSize: 19, fontWeight: 900, color: tone, fontFamily: 'ui-monospace, monospace' }}>{v}</div>
      {note && <div style={{ fontSize: 10, color: C.faint, marginTop: 5 }}>{note}</div>}
    </div>
  )
}

/* Invoice lines are built from the same holeBilling() call the Holes tab
 * renders, so what goes out can never disagree with what was on screen. */
function buildLines(holes: HoleCommercial[], mds: MobDemobEvent[]): InvoiceLine[] {
  const lines: InvoiceLine[] = []
  holes.forEach(h => {
    h.billing.lines.forEach(l => lines.push({
      label: `${h.costing.hole.holeNumber} · ${l.formation}, ${l.fromDepth}–${l.toDepth} m (${l.bandLabel})`,
      qty: `${l.metres} m`, rate: fmtRate(l.rate), amount: l.amount,
    }))
  })
  mds.forEach(e => lines.push({
    label: `${e.type === 'mobilisation' ? 'Mobilisation' : 'Demobilisation'} · ${e.rig}`,
    qty: '1', rate: money(e.billedAmount), amount: e.billedAmount,
  }))
  return lines
}

function ReviewModal({ project, clientRate, holes, mobDemob, nextNumber, onClose, onCreate }: {
  project: string; clientRate?: ClientRate
  holes: HoleCommercial[]; mobDemob: MobDemobEvent[]
  nextNumber: string
  onClose: () => void
  onCreate: (inv: Invoice) => void
}) {
  const [number, setNumber] = useState(nextNumber)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [taxPercent, setTax] = useState(18)

  const lines = buildLines(holes, mobDemob)
  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  const total = subtotal * (1 + taxPercent / 100)
  const cost = holes.reduce((s, h) => s + h.cost, 0) + mobDemob.reduce((s, e) => s + mobDemobCost(e), 0)
  const profit = subtotal - cost

  const create = () => onCreate({
    id: uid('inv'), number, project, client: clientRate?.client || '', date,
    holeIds: holes.map(h => h.costing.hole.id),
    mobDemobIds: mobDemob.map(e => e.id),
    lines, subtotal, taxPercent, total, status: 'issued',
  })

  return (
    <Modal title="Review invoice" subtitle={`${project} · ${clientRate?.client || 'no client set'}`} width={860} onClose={onClose}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" onClick={create}>Create invoice</Btn></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
          <Field label="Invoice number">
            <input value={number} onChange={e => setNumber(e.target.value)}
              style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, width: '100%', fontFamily: 'inherit', colorScheme: 'dark' }} />
          </Field>
          <NumField label="Tax" value={taxPercent} onChange={setTax} suffix="%" />
        </div>

        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead><tr><th style={th}>Description</th><th style={thR}>Quantity</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} style={{ borderBottom: rowBorder }}>
                  <td style={{ ...td, color: C.text, whiteSpace: 'normal' }}>{l.label}</td>
                  <td style={tdN}>{l.qty}</td>
                  <td style={tdN}>{l.rate}</td>
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
                <td style={{ ...td, fontWeight: 900, color: LAYER.revenue, fontSize: 14 }} colSpan={3}>Total</td>
                <td style={{ ...tdN, fontWeight: 900, color: LAYER.revenue, fontSize: 14 }}>{money(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ padding: '16px 18px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            What this invoice earns
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <SelStat k="Revenue" v={money(subtotal)} tone={LAYER.revenue} />
            <SelStat k="Cost" v={money(cost)} tone={LAYER.full} />
            <SelStat k="Profit" v={money(profit)} tone={marginColor(profit)} />
            <SelStat k="Margin" v={subtotal > 0 ? pct((profit / subtotal) * 100) : '—'} tone={marginColor(profit)} />
          </div>
        </div>

        <Note tone={C.amber}>
          Cost and margin are for your own records and never appear on the client&apos;s copy. Once created, these holes are
          stamped as invoiced and can&apos;t be billed again.
        </Note>
      </div>
    </Modal>
  )
}

function downloadInvoice(inv: Invoice) {
  const rows = inv.lines.map(l =>
    `<tr><td>${l.label}</td><td>${l.qty}</td><td>${l.rate}</td><td class="r">${money(l.amount)}</td></tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${inv.number}</title><style>
body{font-family:system-ui,Arial,sans-serif;padding:44px;color:#111;max-width:840px;margin:0 auto}
.head{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:22px;border-bottom:3px solid #F97316;margin-bottom:26px}
.t{font-size:26px;font-weight:800;color:#F97316}
.s{font-size:12px;color:#666;margin-top:6px;line-height:1.6}
table{width:100%;border-collapse:collapse;margin:18px 0}
th{background:#111;color:#fff;padding:10px 12px;text-align:left;font-size:11px;letter-spacing:.04em}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:13px}
.r{text-align:right;font-variant-numeric:tabular-nums}
th.r{text-align:right}
.tot td{font-weight:800;font-size:15px;border-top:2px solid #111;background:#fafafa}
.f{margin-top:34px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#999}
</style></head><body>
<div class="head">
  <div><div class="t">INVOICE</div><div class="s">${inv.number}<br>${inv.date}</div></div>
  <div class="s" style="text-align:right">Bill to<br><strong style="font-size:14px;color:#111">${inv.client || inv.project}</strong><br>${inv.project}</div>
</div>
<table>
<thead><tr><th>Description</th><th class="r">Quantity</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot>
<tr><td colspan="3" class="r">Subtotal</td><td class="r">${money(inv.subtotal)}</td></tr>
<tr><td colspan="3" class="r">Tax at ${inv.taxPercent}%</td><td class="r">${money(inv.subtotal * inv.taxPercent / 100)}</td></tr>
<tr class="tot"><td colspan="3" class="r">Total</td><td class="r">${money(inv.total)}</td></tr>
</tfoot>
</table>
<div class="f">Generated from XPLORIX Costing · billed per hole, by formation and depth band</div>
</body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${inv.number}_${inv.project.replace(/\s+/g, '-')}.html`
  a.click()
  URL.revokeObjectURL(url)
}


/* ==========================================================================
 * The screen
 * ========================================================================== */


/* XPLORIX COSTING
 *
 * One module, one context chain: project -> rig -> month, then four views of
 * the same costed data. This replaces the old Rig Cost / Project Cost split,
 * where cost and billing lived in different places and disagreed.
 *
 * The old Project Cost had to combine rigs before applying depth bands, or
 * band 1's cheap rate got counted once per rig. That bug is gone by
 * construction here: bands belong to a hole, measured from surface in that
 * hole, so there is nothing to double-count. */

const TABS = ['Overview', 'Daily', 'Holes', 'Billing'] as const
type Tab = typeof TABS[number]

function CostingScreen() {
  const { state: inv } = useInventory()
  const { state, setOwnership, setOperatingRate, setLabourRate, setClientRate, setHole, setHoleStatus, addInvoice, deleteInvoice } = useCosting()

  const projects: string[] = inv.projects.map((p: { name: string }) => p.name)
  const [project, setProject] = useState(projects[0] ?? '')
  const rigs = useMemo(() => {
    const fromLogs = rigsFor(state.dailyLogs, project)
    if (fromLogs.length) return fromLogs
    return (inv.projects.find((p: { name: string }) => p.name === project)?.rigs ?? []) as string[]
  }, [state.dailyLogs, project, inv.projects])

  const [rig, setRig] = useState(rigs[0] ?? '')
  const months = useMemo(() => monthsFor(state.dailyLogs, rig, project), [state.dailyLogs, rig, project])
  const [month, setMonth] = useState(months[months.length - 1] ?? '')
  const [tab, setTab] = useState<Tab>('Overview')

  // Keep the chain valid when a link above changes.
  useEffect(() => { if (!rigs.includes(rig)) setRig(rigs[0] ?? '') }, [rigs, rig])
  useEffect(() => { if (!months.includes(month)) setMonth(months[months.length - 1] ?? '') }, [months, month])

  const [calcRig, setCalcRig] = useState(false)
  const [calcRates, setCalcRates] = useState(false)
  const [calcClient, setCalcClient] = useState(false)
  const [holeModal, setHoleModal] = useState<{ existing?: Hole } | null>(null)

  const v = useRigMonthView(project, rig, month, inv.purchaseOrders)
  const projectHoles = useProjectHoles(project, inv.purchaseOrders)
  const invoices = state.invoices.filter(i => i.project === project)

  const logsForRates = useMemo(
    () => state.dailyLogs.filter(l => l.rig === rig && l.project === project && l.date.startsWith(month)),
    [state.dailyLogs, rig, project, month])

  if (!project) {
    return <div style={{ padding: 24 }}><Card><Empty>No projects yet. Create one in Projects to start costing.</Empty></Card></div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: 24, paddingBottom: 64 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Costing</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 640, lineHeight: 1.6 }}>
            What each hole cost, what it can be billed for, and what it made. Metres, hours, crew and fuel come from the
            driller log — the only things set here are rates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn size="sm" onClick={() => setCalcRig(true)}>Rig cost</Btn>
          <Btn size="sm" onClick={() => setCalcRates(true)}>Operating &amp; labour</Btn>
          <Btn size="sm" onClick={() => setCalcClient(true)}>Client rate</Btn>
        </div>
      </div>

      {/* Context chain */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Row label="Project">
          {projects.map(p => (
            <Pick key={p} on={project === p} onClick={() => setProject(p)} title={p} sub={PROJECT_CLIENTS[p] || '—'} />
          ))}
        </Row>

        {rigs.length > 0 && (
          <Row label="Rig">
            {rigs.map(r => (
              <Pick key={r} on={rig === r} onClick={() => setRig(r)} title={r}
                sub={state.ownership.some(o => o.rig === r) ? 'ownership set' : 'no rig cost'} />
            ))}
          </Row>
        )}

        {months.length > 0 && (
          <Row label="Month">
            {months.map(m => (
              <button key={m} onClick={() => setMonth(m)} style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                background: month === m ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${month === m ? 'rgba(249,115,22,0.3)' : C.border}`,
                color: month === m ? C.orange : C.faint,
              }}>{monthLabel(m)}</button>
            ))}
          </Row>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 22px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: 'none', fontFamily: 'inherit',
              background: tab === t ? C.orange : 'transparent', color: tab === t ? '#fff' : C.muted,
            }}>{t}</button>
          ))}
        </div>

        {v.hasLogs && (
          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <Head k="Metres" v={`${v.roll.metres} m`} />
            <Head k="Full cost" v={money(v.roll.total)} />
            <Head k="Cost per metre" v={fmtRate(v.roll.cpm)} tone={C.orange} />
            {v.avgClientRate > 0 && <Head k="Margin" v={fmtRate(v.avgClientRate - v.roll.cpm)} tone={C.green} />}
          </div>
        )}
      </div>

      {tab === 'Overview' && (
        <OverviewTab v={v} rig={rig} month={month}
          onConfigureRig={() => setCalcRig(true)}
          onConfigureRates={() => setCalcRates(true)}
          onSetClientRate={() => setCalcClient(true)} />
      )}
      {tab === 'Daily' && <DailyTab v={v} rig={rig} month={month} onConfigureRates={() => setCalcRates(true)} />}
      {tab === 'Holes' && (
        <HolesTab v={v}
          onSetClientRate={() => setCalcClient(true)}
          onEditHole={h => setHoleModal({ existing: h })}
          onAddHole={() => setHoleModal({})}
          onStatus={(id: string, s: HoleStatus) => setHoleStatus(id, s)} />
      )}
      {tab === 'Billing' && (
        <BillingTab project={project} holes={projectHoles} clientRate={v.clientRate}
          mobDemob={state.mobDemob.filter(e => e.project === project)}
          invoices={invoices}
          onCreate={addInvoice} onDelete={deleteInvoice}
          onSetClientRate={() => setCalcClient(true)} />
      )}

      {calcRig && rig && (
        <RigCostCalculator rig={rig} month={month}
          existing={state.ownership.find(o => o.rig === rig)}
          onSave={setOwnership} onClose={() => setCalcRig(false)} />
      )}
      {calcRates && rig && (
        <OperatingCalculator rig={rig} project={project} month={month} logs={logsForRates}
          existingOp={state.operatingRates.find(r => r.rig === rig && r.project === project && r.month === month)}
          existingLab={state.labourRates.find(r => r.rig === rig && r.project === project && r.month === month)}
          onSave={(op, lab) => { setOperatingRate(op); setLabourRate(lab) }}
          onClose={() => setCalcRates(false)} />
      )}
      {calcClient && (
        <ClientRateCalculator project={project}
          existing={state.clientRates[project]}
          currentCPM={v.roll.cpm}
          onSave={r => setClientRate(project, r)}
          onClose={() => setCalcClient(false)} />
      )}
      {holeModal && (
        <HoleModal rig={rig} project={project} clientRate={v.clientRate}
          existing={holeModal.existing}
          onSave={h => setHole(h)}
          onClose={() => setHoleModal(null)} />
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
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
      padding: '9px 17px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
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


/* Provider is mounted here rather than in a layout file, so this single screen
 * is genuinely self-contained — nothing else in the app has to change. */
export default function CostingRoute() {
  return (
    <CostingProvider>
      <CostingScreen />
    </CostingProvider>
  )
}
