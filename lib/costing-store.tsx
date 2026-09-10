'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toolingPerMetre, normFormation as normTerrain } from './inventory-store'
import type { ToolingItem } from './inventory-store'

/* ==========================================================================
 * XPLORIX COSTING
 *
 * Two rules run through this whole file.
 *
 * 1. Quantities come from the logs. Rates come from Set rates.
 *    Metres, hours, crew counts, fuel, water and additives are recorded in the
 *    driller's log; repair cost comes from the maintenance log; parts from
 *    inventory. Nothing measurable is ever typed on a costing screen.
 *
 * 2. Rates are dated, and costing looks up the rate in force on the day.
 *    A hole closed in March keeps its March rate forever. Reclassify in month
 *    four and month four onward changes; nothing before it moves. An invoice
 *    already sent can never silently stop matching the screen.
 *
 * Cost is built in layers and the UI keeps them apart:
 *
 *   operating   fuel + water + additives + crew + repairs + parts
 *   ownership   depreciation + EMI + insurance, allocated per day
 *   full        operating + ownership          <- cost per unit divides this
 *
 * Mobilisation and demobilisation sit outside that stack: dated lump sums,
 * billed on their own line. Spreading a one-off move across a month's metres
 * makes every hole that month read wrong.
 * ========================================================================== */

// ── LOGS (read-only sources) ──────────────────────────────────────────────

export type ShiftName = 'Day' | 'Night'

/* One row per shift, matching the driller's log form. Two shifts make a day. */
export interface ShiftLog {
  id: string
  rig: string
  project: string
  date: string              // YYYY-MM-DD
  shift: ShiftName
  holeNumber: string | null
  crewCount: number
  shiftHours: number
  drillingHours: number
  downtimeHours: number
  downtimeReason: string
  metresDrilled: number
  coreRecovery: number      // metres of core recovered
  holeSize: string          // NQ / HQ / PQ — drives the size adjustment
  formationType: string     // lithology; affects COST, not revenue
  // Set from "Hole Closed This Shift?" in the driller's log. Finance never
  // decides when a hole is finished — it reads that decision and the hole
  // appears in Drillholes as Closed, waiting for approval.
  holeClosedThisShift?: boolean
  fuelLitres: number
  waterLitres: number
  additivesKg: number
}

export interface MaintenanceLog {
  id: string
  rig: string
  project: string
  date: string
  maintenanceType: 'Preventive' | 'Breakdown' | 'Scheduled' | 'Component Replacement'
  hours: number
  component: string
  action: string
  cost: number              // already in rupees, straight from the log
}

/* A rig is drilling, broken, or standing by. There is no "idle": a day with no
 * drilling is standby — the client stopped work — and standby has its own
 * rate. Breakdown stays separate because it is the contractor's own fault and
 * can never be billed to the client. */
export type DayStatus = 'drilling' | 'standby' | 'breakdown'

export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  drilling: 'Drilling', standby: 'Standby', breakdown: 'Breakdown',
}

/* Downtime reasons that are the contractor's own problem. Everything else —
 * waiting for instruction, weather, safety hold, site access — is the client
 * stopping work, which is standby and is billable. */
export const BREAKDOWN_REASONS = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault',
  'Bit Change', 'Rod Change', 'Fuel Shortage', 'Operator Delay',
]

export function statusForShifts(shifts: ShiftLog[]): DayStatus {
  if (shifts.some(s => s.drillingHours > 0)) return 'drilling'
  if (shifts.some(s => BREAKDOWN_REASONS.includes(s.downtimeReason))) return 'breakdown'
  return 'standby'
}

// ── RIG OWNERSHIP (Set rates → Rig cost) ──────────────────────────────────

export type AllocationBasis = 'operatingDay' | 'expectedUnit'
export type CostBasis = 'cash' | 'accounting'

export interface RigOwnership {
  id: string
  rig: string
  effectiveFrom: string
  note?: string

  basicPrice: number
  gstPercent: number
  transportation: number
  landedPriceOverride?: number

  depreciationRatePct: number
  depPerMonthOverride?: number

  // The EMI is typed, not computed — contractors already know their monthly
  // figure. `emiEndsMonth` is optional but worth filling: without it a closed
  // loan keeps charging forever and the rig looks permanently expensive.
  emiPerMonth: number
  emiEndsMonth?: string     // YYYY-MM, blank = no expiry
  insurancePerYear: number
  otherFixedPerMonth: number

  costBasis: CostBasis
  allocationBasis: AllocationBasis
  expectedOperatingDays: number
  expectedUnitsPerMonth: number
  ownershipPerDayOverride?: number
}

// ── OPERATING & LABOUR (Set rates → Operating cost) ───────────────────────

export interface OperatingRate {
  id: string
  rig: string
  project: string
  effectiveFrom: string
  note?: string

  // Unit prices only — the quantities come from the driller's log
  fuelPricePerLitre: number
  waterPricePerLitre: number
  additivePricePerKg: number

  // Labour. Crew count per shift comes from the log; only the rates are here.
  labourRate: number      // per head per shift, or per metre
  lodgingRate: number     // per head per night, or per metre
  transportRate: number   // per day, or per metre
  // On, the three rates above are charged against metres drilled instead of
  // against days and heads. Crew count then stops affecting cost, which is
  // simpler but throws away what the log knows.
  chargePerMetre: boolean
}

// ── CLIENT RATE (Set rates → Client cost) ─────────────────────────────────

/* A rate line, straight off the tender: a size, a formation, and a rate.
 * "Drilling in soft rock, HQ size — ₹5,500 per m" is one row.
 *
 * Adjustments hang off their own row, not the project, because the tender's
 * conditions are written per line: "in case NQ size drilling is done before
 * 400 m depth, the rate shall decrease by 20%". Nothing about that is
 * standard, so the size, depth and percentage are all typed. */
export interface RateAdjustment {
  id: string
  condition: 'above' | 'below'
  depth: number
  adjustPct: number       // negative reduces the rate
}

/* One line covers a size, a formation and a depth range. Leave formation as
 * ANY_FORMATION and it matches whatever the log says; leave the depth range
 * blank and it applies at any depth. That one shape covers both contracts:
 *
 *   government   size + formation, no depth range
 *   private      size + ANY formation + depth bands
 *
 * and a contract that prices hard rock differently deep than shallow is just
 * both at once. */
export const ANY_FORMATION = 'Any formation'

export interface RateRow {
  id: string
  holeSize: string        // NQ / HQ / PQ / BQ / AQ
  formation: string       // a rock category, or ANY_FORMATION
  fromDepth?: number      // blank = from surface
  toDepth?: number        // blank = no limit
  rate: number            // ₹ per metre
  adjustments: RateAdjustment[]
}

/* Two shapes, chosen per project because a client contract is one or the other:
 *
 *   flat   priced by formation — soft, hard, very hard — at any depth
 *   slab   priced by depth band — 0–50, 50–100, 100+ — whatever the rock
 *
 * The rows carry both sets of fields; the structure decides which are used and
 * which the editor shows, so switching never destroys what was typed. */
export type RateStructure = 'flat' | 'slab'

export interface ClientRate {
  id: string
  project: string
  effectiveFrom: string
  note?: string
  structure: RateStructure
  rateRows: RateRow[]
  standbyPerDay: number
  mobilisation: number
  demobilisation: number
}

/* The driller's log says "Very Hard Formation"; a tender says "Very hard rock".
 * Same thing, so both are reduced to their bare words before matching. */
export function normFormation(v: string) {
  return v.toLowerCase().replace(/formation|strata|rock/g, '').replace(/\s+/g, ' ').trim()
}

export function rateRowFor(cr: ClientRate | undefined, holeSize: string, formation: string, depth: number): RateRow | undefined {
  if (!cr) return undefined
  if (cr.structure === 'flat') {
    // Formation decides the rate; depth is irrelevant.
    return cr.rateRows.find(r => r.holeSize === holeSize &&
      (r.formation === ANY_FORMATION || normFormation(r.formation) === normFormation(formation)))
  }
  // Depth decides the rate; the rock it happens to be passing through is not
  // part of the contract.
  return cr.rateRows.find(r => r.holeSize === holeSize &&
    (r.fromDepth == null || depth >= r.fromDepth) &&
    (r.toDepth == null || depth < r.toDepth))
}

export function structureLabel(cr: ClientRate | undefined) {
  if (!cr) return '—'
  return cr.structure === 'flat'
    ? `Flat · ${cr.rateRows.length} formation${cr.rateRows.length === 1 ? '' : 's'}`
    : `Slab · ${cr.rateRows.length} band${cr.rateRows.length === 1 ? '' : 's'}`
}

/* One priced run of metres: a stretch of hole at one size, one formation and
 * one rate. This is the unit a measurement book is written in, and the unit an
 * invoice line is printed from. */
export interface Charge {
  date: string
  shift: ShiftName
  holeNumber: string | null
  holeSize: string
  formation: string
  fromDepth: number
  toDepth: number
  metres: number
  rate: number
  adjustmentPct: number
  amount: number
  matched: boolean
}

/* Price one shift's metres. The shift is split wherever it crosses a rate
 * line's depth boundary, so a shift running 45 m to 55 m across a band edge at
 * 50 m produces two runs, not one mispriced one. */
export function chargeShift(cr: ClientRate | undefined, log: ShiftLog, fromDepth: number): Charge[] {
  const out: Charge[] = []
  const to = fromDepth + log.metresDrilled
  let d = fromDepth
  let guard = 0
  while (d < to && guard++ < 50) {
    const row = rateRowFor(cr, log.holeSize, log.formationType, d)
    const limit = row?.toDepth ?? to
    const hi = Math.min(to, limit)
    if (hi <= d) break
    const adjustmentPct = row ? adjustmentFor(row, d) : 0
    const rate = (row?.rate ?? 0) * (1 + adjustmentPct / 100)
    out.push({
      date: log.date, shift: log.shift, holeNumber: log.holeNumber,
      holeSize: log.holeSize, formation: log.formationType,
      fromDepth: d, toDepth: hi, metres: hi - d,
      rate, adjustmentPct, amount: (hi - d) * rate, matched: !!row,
    })
    d = hi
  }
  return out
}

// ── HOLE ──────────────────────────────────────────────────────────────────
/* A hole is not something you create in Finance. It exists because the driller
 * logged shifts against a hole number, so the list is derived from the log and
 * can never disagree with it. The only thing stored here is the decision —
 * closed, approved, invoiced — because that is a judgement, not a measurement. */
export type HoleStatus = 'drilling' | 'closed' | 'approved' | 'invoiced'

export interface HoleState { status: HoleStatus; invoiceId?: string }

export interface Hole {
  holeNumber: string
  rig: string
  project: string
  startDate: string
  endDate?: string
  status: HoleStatus
  invoiceId?: string
}

// ── INVOICE ───────────────────────────────────────────────────────────────
export interface InvoiceLine { label: string; qty: string; rate: string; amount: number; depth?: string }
export interface Invoice {
  id: string
  number: string
  project: string
  client: string
  date: string
  holeNumbers: string[]
  lines: InvoiceLine[]
  subtotal: number
  taxPercent: number
  total: number
  status: InvoiceStatus
  dueDate?: string
  paidDate?: string
  paidAmount?: number
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled'
export const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'pending', 'paid', 'cancelled']
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft', pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled',
}
/* Overdue is derived from the due date, never set by hand, so it cannot go
 * stale. An invoice forty days past due showing "Pending" is the one thing a
 * tracker should shout about. */
export function isOverdue(i: Invoice, today: string) {
  return i.status === 'pending' && !!i.dueDate && i.dueDate < today
}
export function outstanding(i: Invoice) {
  return i.status === 'cancelled' ? 0 : Math.max(0, i.total - (i.paidAmount ?? 0))
}

/* ==========================================================================
 * RATE LOOKUP — the version in force on a given date
 * ========================================================================== */

export interface Dated { effectiveFrom: string }

export function versionOn<T extends Dated>(versions: T[], date: string): T | undefined {
  return versions
    .filter(v => v.effectiveFrom <= date)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]
}
export function newestFirst<T extends Dated>(versions: T[]): T[] {
  return [...versions].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
}

/* ==========================================================================
 * OWNERSHIP
 * ========================================================================== */

export function daysInMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
export function monthOf(date: string) { return date.slice(0, 7) }
export function shiftMonth(ym: string, by: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + by, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthsBetween(from: string, to: string) {
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

export interface OwnershipBreakdown {
  landedPrice: number
  depPerYear: number; depPerMonth: number
  emi: number; emiActive: boolean; emiMonthsLeft: number   // -1 = no expiry set
  insurancePerMonth: number; otherFixedPerMonth: number
  perMonth: number; perDay: number; perUnit: number
  basisLabel: string
}

export function ownershipBreakdown(o: RigOwnership, ym: string): OwnershipBreakdown {
  const landedPrice = o.landedPriceOverride ??
    (o.basicPrice + o.basicPrice * (o.gstPercent / 100) + o.transportation)

  const depPerYear = landedPrice * (o.depreciationRatePct / 100)
  const depPerMonth = o.depPerMonthOverride ?? depPerYear / 12

  const notExpired = !o.emiEndsMonth || ym <= o.emiEndsMonth
  // Accounting basis drops the EMI: depreciation and loan repayment write off
  // the same capital, so counting both is a cash view, not an accounting one.
  const active = notExpired && o.costBasis !== 'accounting'
  const emi = active ? o.emiPerMonth : 0

  const insurancePerMonth = o.insurancePerYear / 12
  const perMonth = depPerMonth + emi + insurancePerMonth + o.otherFixedPerMonth

  let perDay = 0
  let basisLabel = ''
  if (o.allocationBasis === 'operatingDay') {
    perDay = o.expectedOperatingDays > 0 ? perMonth / o.expectedOperatingDays : 0
    basisLabel = `÷ ${o.expectedOperatingDays} operating days`
  } else {
    basisLabel = `÷ ${o.expectedUnitsPerMonth} expected metres`
  }
  if (o.ownershipPerDayOverride != null && o.allocationBasis !== 'expectedUnit') {
    perDay = o.ownershipPerDayOverride
  }

  return {
    landedPrice, depPerYear, depPerMonth,
    emi, emiActive: active,
    emiMonthsLeft: o.emiEndsMonth ? Math.max(0, monthsBetween(ym, o.emiEndsMonth)) : -1,
    insurancePerMonth, otherFixedPerMonth: o.otherFixedPerMonth,
    perMonth, perDay,
    perUnit: o.expectedUnitsPerMonth > 0 ? perMonth / o.expectedUnitsPerMonth : 0,
    basisLabel,
  }
}

/* ==========================================================================
 * DAILY COST — one row per calendar day, built from that day's shifts
 * ========================================================================== */

export interface LabourBreakdown {
  labour: number; lodging: number; transport: number
  heads: number; dayCrew: number; nightCrew: number; total: number
  perMetre: boolean
}

export function labourForDay(shifts: ShiftLog[], units: number, r: OperatingRate): LabourBreakdown {
  const dayCrew = shifts.filter(s => s.shift === 'Day').reduce((a, s) => a + s.crewCount, 0)
  const nightCrew = shifts.filter(s => s.shift === 'Night').reduce((a, s) => a + s.crewCount, 0)
  const heads = dayCrew + nightCrew

  if (r.chargePerMetre) {
    const labour = units * r.labourRate
    const lodging = units * r.lodgingRate
    const transport = units * r.transportRate
    return { labour, lodging, transport, heads, dayCrew, nightCrew, perMetre: true, total: labour + lodging + transport }
  }

  // Crew is on site and paid whether or not a metre gets drilled, so a standby
  // day carries the same labour as a drilling day.
  const labour = heads * r.labourRate
  const lodging = heads * r.lodgingRate
  const transport = heads > 0 ? r.transportRate : 0
  return { labour, lodging, transport, heads, dayCrew, nightCrew, perMetre: false, total: labour + lodging + transport }
}

export interface DayCost {
  date: string; rig: string; project: string
  shifts: ShiftLog[]
  status: DayStatus
  holeNumber: string | null
  submitted: boolean
  drillingHours: number; downtimeHours: number; maintenanceHours: number
  units: number; coreRecovery: number
  fuelLitres: number; waterLitres: number; additivesKg: number
  fuel: number; water: number; additives: number
  labour: LabourBreakdown
  repairs: number; parts: number
  operating: number; ownership: number; total: number
  cpu: number | null        // null, never 0, on a day with no metres
  rate: number              // rate in force on this day, after adjustment
  adjustmentPct: number
  revenue: number
  unmatched: boolean        // metres drilled with no matching rate line
  charges: Charge[]         // priced runs, the unit a measurement book uses
}

export function dayCost(
  date: string, rig: string, project: string,
  shifts: ShiftLog[], maint: MaintenanceLog[],
  op: OperatingRate, own: RigOwnership, ob: OwnershipBreakdown,
  cr: ClientRate | undefined, catalogue: ToolingItem[], depthSoFar: number,
): DayCost {
  const submitted = shifts.length > 0
  const status = submitted ? statusForShifts(shifts) : 'standby'
  const sum = (f: (s: ShiftLog) => number) => shifts.reduce((a, s) => a + f(s), 0)

  const units = sum(s => s.metresDrilled)
  const fuelLitres = sum(s => s.fuelLitres)
  const waterLitres = sum(s => s.waterLitres)
  const additivesKg = sum(s => s.additivesKg)

  const fuel = fuelLitres * op.fuelPricePerLitre
  const water = waterLitres * op.waterPricePerLitre
  const additives = additivesKg * op.additivePricePerKg
  const labour = labourForDay(shifts, units, op)
  const repairs = maint.reduce((a, m) => a + m.cost, 0)
  const maintenanceHours = maint.reduce((a, m) => a + m.hours, 0)
  /* Tooling is amortised, not charged on the day it was bought. A ₹22,000 bit
   * with 100 m of life in hard rock costs ₹220 for every metre it drills, so
   * the charge follows the ground the driller recorded rather than landing as
   * a spike on whichever hole happened to be running when it was issued. */
  const parts = shifts.reduce((a, sh) =>
    a + sh.metresDrilled * toolingPerMetre(catalogue, normTerrain(sh.formationType)), 0)

  const operating = fuel + water + additives + labour.total + repairs + parts
  const ownership = own.allocationBasis === 'expectedUnit' ? units * ob.perUnit : ob.perDay
  const total = operating + ownership

  // Each shift is priced by its own size, formation and depth. A day whose two
  // shifts pass from soft into hard bills each stretch at its own rate rather
  // than pricing the whole day off whichever shift happened to be first.
  const holeNumber = shifts.find(s => s.holeNumber)?.holeNumber ?? null
  const ordered = [...shifts].sort((a, b) => (a.shift === 'Day' ? -1 : 1) - (b.shift === 'Day' ? -1 : 1))
  const charges: Charge[] = []
  let depth = depthSoFar
  ordered.forEach(sh => {
    if (sh.metresDrilled <= 0) return
    chargeShift(cr, sh, depth).forEach(c => charges.push(c))
    depth += sh.metresDrilled
  })

  const drillRevenue = charges.reduce((a, c) => a + c.amount, 0)
  // A standby day only bills when someone actually submitted a log saying the
  // client stopped work. A missing submission must never invent revenue.
  const revenue = status === 'standby'
    ? (submitted ? (cr?.standbyPerDay ?? 0) : 0)
    : drillRevenue
  const rate = units > 0 ? drillRevenue / units : 0
  const adjustmentPct = charges.find(c => c.adjustmentPct !== 0)?.adjustmentPct ?? 0
  const unmatched = charges.some(c => !c.matched)

  return {
    date, rig, project, shifts, status, holeNumber, submitted,
    drillingHours: sum(s => s.drillingHours), downtimeHours: sum(s => s.downtimeHours), maintenanceHours,
    units, coreRecovery: sum(s => s.coreRecovery),
    fuelLitres, waterLitres, additivesKg,
    fuel, water, additives, labour, repairs, parts,
    operating, ownership, total,
    cpu: units > 0 ? total / units : null,
    rate, adjustmentPct, revenue, unmatched, charges,
  }
}

/* Adjustments are matched against how deep the hole already was when the day
 * started. "NQ used above 400 m" means shallower than 400 m — above in the
 * hole, not above the number. Several can stack. */
export function adjustmentFor(row: RateRow, depth: number): number {
  return row.adjustments.reduce((pct, a) =>
    pct + ((a.condition === 'above' ? depth < a.depth : depth >= a.depth) ? a.adjustPct : 0), 0)
}

/* ==========================================================================
 * ROLLUP
 * ========================================================================== */

export interface Rollup {
  days: number; drillingDays: number; standbyDays: number; breakdownDays: number
  missingDays: number
  units: number; coreRecovery: number; coreRecoveryPct: number
  drillingHours: number; downtimeHours: number; maintenanceHours: number; fuelLitres: number
  fuel: number; water: number; additives: number
  labour: number; repairs: number; parts: number
  operating: number; ownership: number; total: number; revenue: number
  cpu: number; operatingCPU: number; ownershipCPU: number
  revenuePerUnit: number; margin: number; marginPct: number
}

export function rollup(days: DayCost[]): Rollup {
  const z: Rollup = {
    days: 0, drillingDays: 0, standbyDays: 0, breakdownDays: 0, missingDays: 0,
    units: 0, coreRecovery: 0, coreRecoveryPct: 0, drillingHours: 0, downtimeHours: 0, maintenanceHours: 0,
    fuelLitres: 0, fuel: 0, water: 0, additives: 0,
    labour: 0, repairs: 0, parts: 0, operating: 0, ownership: 0, total: 0, revenue: 0,
    cpu: 0, operatingCPU: 0, ownershipCPU: 0, revenuePerUnit: 0, margin: 0, marginPct: 0,
  }
  days.forEach(d => {
    z.days++
    if (d.status === 'drilling') z.drillingDays++
    if (d.status === 'standby') z.standbyDays++
    if (d.status === 'breakdown') z.breakdownDays++
    if (!d.submitted) z.missingDays++
    z.units += d.units; z.coreRecovery += d.coreRecovery
    z.drillingHours += d.drillingHours; z.downtimeHours += d.downtimeHours
    z.maintenanceHours += d.maintenanceHours
    z.fuelLitres += d.fuelLitres
    z.fuel += d.fuel; z.water += d.water; z.additives += d.additives
    z.labour += d.labour.total
    z.repairs += d.repairs; z.parts += d.parts
    z.operating += d.operating; z.ownership += d.ownership; z.total += d.total
    z.revenue += d.revenue
  })
  if (z.units > 0) {
    z.cpu = z.total / z.units
    z.operatingCPU = z.operating / z.units
    z.ownershipCPU = z.ownership / z.units
    z.revenuePerUnit = z.revenue / z.units
    z.coreRecoveryPct = (z.coreRecovery / z.units) * 100
  }
  z.margin = z.revenue - z.total
  z.marginPct = z.revenue > 0 ? (z.margin / z.revenue) * 100 : 0
  return z
}

/* Running total alongside each day. A single day's cost per unit can mislead —
 * one metre against a full day of cost reads as an enormous rate that is
 * arithmetically right and operationally meaningless — so month-to-date is
 * always shown beside it. */
export function withCumulative(days: DayCost[]) {
  let u = 0, t = 0
  return days.map(d => {
    u += d.units; t += d.total
    return { ...d, mtdUnits: u, mtdTotal: t, mtdCPU: u > 0 ? t / u : null }
  })
}
export type DayCostMTD = ReturnType<typeof withCumulative>[number]

// ── HOLE ROLLUP ───────────────────────────────────────────────────────────
export interface HoleResult {
  hole: Hole
  days: DayCost[]
  roll: Rollup
  depth: number
  coreRecoveryPct: number
  rates: number[]           // more than one = the rate moved mid-hole
  unmatchedDays: number     // metres drilled with no matching rate line
  billing: BillingLine[]    // the measurement book for this hole
}

/* Grouped runs, in depth order — what goes on the invoice. Runs at the same
 * size, formation and rate merge, so a hole that passed through hard rock over
 * four separate days shows as one line. */
export interface BillingLine {
  holeSize: string
  formation: string
  fromDepth: number
  toDepth: number
  metres: number
  rate: number
  amount: number
  matched: boolean
}

export function billingLines(days: DayCost[]): BillingLine[] {
  const acc: Record<string, BillingLine> = {}
  days.forEach(d => d.charges.forEach(c => {
    const k = `${c.holeSize}|${c.formation}|${Math.round(c.rate)}`
    const e = acc[k]
    if (!e) {
      acc[k] = {
        holeSize: c.holeSize, formation: c.formation,
        fromDepth: c.fromDepth, toDepth: c.toDepth,
        metres: c.metres, rate: c.rate, amount: c.amount, matched: c.matched,
      }
    } else {
      e.fromDepth = Math.min(e.fromDepth, c.fromDepth)
      e.toDepth = Math.max(e.toDepth, c.toDepth)
      e.metres += c.metres
      e.amount += c.amount
    }
  }))
  return Object.values(acc).sort((a, b) => a.fromDepth - b.fromDepth)
}

/* Every hole number the log mentions becomes a row. Dates come from the first
 * and last shift logged against it, so a hole appears the moment drilling
 * starts and closes when someone says so. */
export function holesFromDays(allDays: DayCost[], statuses: Record<string, HoleState>): Hole[] {
  const byHole: Record<string, DayCost[]> = {}
  allDays.forEach(d => { if (d.holeNumber) (byHole[d.holeNumber] ||= []).push(d) })
  return Object.entries(byHole).map(([holeNumber, ds]) => {
    const sorted = [...ds].sort((a, b) => a.date.localeCompare(b.date))
    // The shift that closed it, if any. Its date is the hole's end date.
    const closingDay = sorted.find(d => d.shifts.some(sh => sh.holeClosedThisShift))
    const stored = statuses[holeNumber]?.status
    // Once closed in the log a hole can be approved or invoiced here, but it
    // can never go back to drilling — that would be Finance overruling the log.
    const st: HoleStatus = stored && stored !== 'drilling' ? stored : (closingDay ? 'closed' : 'drilling')
    return {
      holeNumber, rig: sorted[0].rig, project: sorted[0].project,
      startDate: sorted[0].date,
      endDate: closingDay?.date,
      status: st, invoiceId: statuses[holeNumber]?.invoiceId,
    }
  }).sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function holeResult(hole: Hole, allDays: DayCost[]): HoleResult {
  const days = allDays.filter(d => d.holeNumber === hole.holeNumber)
  const roll = rollup(days)
  return {
    hole, days, roll, depth: roll.units,
    coreRecoveryPct: roll.coreRecoveryPct,
    // Taken from the priced runs, not the day totals. A day whose ground
    // changed mid-shift has a blended average that is not a rate anyone ever
    // agreed to, and listing it would be misleading.
    rates: Array.from(new Set(days.flatMap(d => d.charges).filter(c => c.metres > 0).map(c => Math.round(c.rate)))).sort((a, b) => a - b),
    unmatchedDays: days.filter(d => d.unmatched).length,
    billing: billingLines(days),
  }
}

export function isBillable(h: Hole) { return h.status === 'approved' && !h.invoiceId }
/* Drillholes lists holes that are finished. One still drilling has nothing to
 * approve or bill, so it belongs on Performance, not here. */
export function isFinished(h: Hole) { return h.status !== 'drilling' }

/* ==========================================================================
 * SEED DATA
 * ========================================================================== */

/* Projects and rigs are shown by code. Inventory holds full names, so the code
 * is looked up here and falls back to any leading CODE- pattern in the name,
 * then to the name itself — nothing breaks if a code is missing. */
export const PROJECT_CODES: Record<string, string> = {
  'Site A - North Field': 'PRJ-001',
  'Site B - South Ridge': 'PRJ-002',
  'Site C - East Basin': 'PRJ-003',
}
export function projectCode(name: string) {
  return PROJECT_CODES[name] ?? name.match(/^([A-Za-z]+-\d+)/)?.[1] ?? name
}
export function rigCode(name: string) {
  return name.match(/^([A-Za-z]+-\d+)/)?.[1] ?? name
}

export const PROJECT_CLIENTS: Record<string, string> = {
  'Site A - North Field': 'CMPDI',
  'Site B - South Ridge': 'DGML',
  'Site C - East Basin': 'MECL',
}

export const ROCK_CATEGORIES = ['Soft rock', 'Medium rock', 'Hard rock', 'Very hard rock']
export const HOLE_SIZES = ['NQ', 'HQ', 'PQ', 'BQ', 'AQ']

export const SEED_OWNERSHIP: RigOwnership[] = [
  {
    id: 'own_r1', rig: 'RIG-001', effectiveFrom: '2026-01-01',
    basicPrice: 6000000, gstPercent: 0, transportation: 200000,
    depreciationRatePct: 20,
    emiPerMonth: 160045, emiEndsMonth: '2028-03',
    insurancePerYear: 120000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 125,
    note: 'Opening entry',
  },
  {
    id: 'own_r2', rig: 'RIG-002', effectiveFrom: '2026-01-01',
    basicPrice: 5400000, gstPercent: 0, transportation: 180000,
    depreciationRatePct: 20,
    emiPerMonth: 136500, emiEndsMonth: '2027-10',
    insurancePerYear: 108000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 125,
    note: 'Opening entry',
  },
  {
    id: 'own_r3', rig: 'RIG-003', effectiveFrom: '2026-01-01',
    basicPrice: 4800000, gstPercent: 0, transportation: 160000,
    depreciationRatePct: 20,
    emiPerMonth: 118000, emiEndsMonth: '2029-02',
    insurancePerYear: 96000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 130,
    note: 'Opening entry',
  },
]

const opRate = (id: string, rig: string, project: string, from: string, fuel: number, note: string): OperatingRate => ({
  id, rig, project, effectiveFrom: from, note,
  fuelPricePerLitre: fuel, waterPricePerLitre: 4, additivePricePerKg: 190,
  labourRate: 900, lodgingRate: 180, transportRate: 1250, chargePerMetre: false,
})

export const SEED_OPERATING: OperatingRate[] = [
  opRate('op_a1_1', 'RIG-001', 'Site A - North Field', '2026-01-01', 96, 'Opening entry'),
  opRate('op_a1_2', 'RIG-001', 'Site A - North Field', '2026-08-01', 100, 'Diesel price revision'),
  opRate('op_a2_1', 'RIG-002', 'Site A - North Field', '2026-01-01', 100, 'Opening entry'),
  opRate('op_b1_1', 'RIG-003', 'Site B - South Ridge', '2026-01-01', 100, 'Opening entry'),
]

export const SEED_CLIENT_RATES: ClientRate[] = [
  {
    // Priced by formation — the government shape. One version only, so every
    // screen shows the same rate. Adding a second dated version is what
    // demonstrates mid-hole rate splitting, and is better shown live.
    id: 'cr_a_1', project: 'Site A - North Field', effectiveFrom: '2026-06-01',
    structure: 'flat',
    rateRows: [
      { id: 'r1', holeSize: 'HQ', formation: 'Soft rock', rate: 6200, adjustments: [] },
      { id: 'r2', holeSize: 'HQ', formation: 'Hard rock', rate: 11200, adjustments: [] },
      { id: 'r3', holeSize: 'HQ', formation: 'Very hard rock', rate: 14100, adjustments: [] },
    ],
    standbyPerDay: 18000, mobilisation: 175000, demobilisation: 140000,
    note: 'Tender schedule 2.2.1.1c\u2013e',
  },
  {
    // Priced by depth band — the private shape. Formation is ignored and the
    // rate rises with depth.
    id: 'cr_b_1', project: 'Site B - South Ridge', effectiveFrom: '2026-01-01',
    structure: 'slab',
    rateRows: [
      { id: 'b1', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 0, toDepth: 50, rate: 7800, adjustments: [] },
      { id: 'b2', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 50, toDepth: 100, rate: 8900, adjustments: [] },
      { id: 'b3', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 100, rate: 10400, adjustments: [] },
    ],
    standbyPerDay: 14000, mobilisation: 150000, demobilisation: 120000,
    note: 'Contract rate card, depth bands',
  },
]

export const SEED_HOLE_STATUS: Record<string, HoleState> = {
  'DH-001': { status: 'approved' },
  'DH-011': { status: 'approved' },
  'DH-101': { status: 'approved' },
}

/* Marks the last shift of a hole as the one that closed it, mirroring the
 * driller ticking "Hole Closed This Shift?". */
function markClosures(logs: ShiftLog[], holeNumbers: string[]): ShiftLog[] {
  const lastOf: Record<string, string> = {}
  logs.forEach(l => {
    if (l.holeNumber && holeNumbers.includes(l.holeNumber) && l.metresDrilled > 0) {
      const k = `${l.date}|${l.shift}`
      if (!lastOf[l.holeNumber] || k > lastOf[l.holeNumber]) lastOf[l.holeNumber] = k
    }
  })
  return logs.map(l =>
    l.holeNumber && lastOf[l.holeNumber] === `${l.date}|${l.shift}`
      ? { ...l, holeClosedThisShift: true } : l)
}

/* [day, hole, dayMetres, nightMetres, dayDowntime, nightDowntime, reason]
 * Two shifts per day, 12-hour shifts, drilling hours = 12 − downtime.
 *
 * Formation is not fixed per rig — it follows depth, the way ground actually
 * behaves: soft near surface, then hard, then very hard. The generator tracks
 * each hole's depth and labels the shift accordingly, so one hole bills at
 * three different rates. */
type DaySpec = [number, string, number, number, number?, number?, string?]

function formationAt(depth: number, bands: [number, string][]): string {
  for (const [limit, name] of bands) if (depth < limit) return name
  return bands[bands.length - 1][1]
}

const DEPTH_BANDS: [number, string][] = [
  [18, 'Soft Formation'], [40, 'Hard Formation'], [Infinity, 'Very Hard Formation'],
]

function expand(rig: string, project: string, ym: string, size: string, specs: DaySpec[], bands = DEPTH_BANDS): ShiftLog[] {
  const out: ShiftLog[] = []
  const depth: Record<string, number> = {}
  specs.forEach(([day, hole, dm, nm, dd = 0, nd = 0, reason = '']) => {
    const date = `${ym}-${String(day).padStart(2, '0')}`
    const mk = (shift: ShiftName, metres: number, down: number, crew: number): ShiftLog => {
      const drillingHours = Math.max(0, 12 - down)
      const startDepth = hole ? (depth[hole] ?? 0) : 0
      if (hole) depth[hole] = startDepth + metres
      return {
        id: `${rig}_${date}_${shift}`.replace(/\s+/g, ''),
        rig, project, date, shift,
        holeNumber: hole || null,
        crewCount: down >= 12 ? 2 : crew,
        shiftHours: 12, drillingHours, downtimeHours: down,
        downtimeReason: down > 0 ? reason : '',
        metresDrilled: metres,
        coreRecovery: +(metres * 0.94).toFixed(2),
        holeSize: size,
        formationType: formationAt(startDepth, bands),
        fuelLitres: drillingHours * 10 + (down > 0 ? 6 : 0),
        waterLitres: metres * 120,
        additivesKg: +(metres * 0.8).toFixed(1),
      }
    }
    out.push(mk('Day', dm, dd, 4))
    out.push(mk('Night', nm, nd, 3))
  })
  return out
}

export const SEED_SHIFT_LOGS_A: ShiftLog[] = [
  ...expand('RIG-001', 'Site A - North Field', '2026-08', 'HQ', [
    [1, 'DH-001', 4, 3], [2, 'DH-001', 4, 3], [3, 'DH-001', 3, 3, 3, 0, 'Bit Change'],
    [4, 'DH-001', 4, 4], [5, 'DH-001', 4, 3], [6, 'DH-001', 4, 3],
    [7, 'DH-001', 3, 3, 2, 0, 'Ground Condition Issue'], [8, 'DH-001', 4, 3],
    // Client stopped work — standby, billable, flat cost
    [9, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [10, 'DH-002', 4, 3], [11, 'DH-002', 4, 3], [12, 'DH-002', 4, 3],
    // Breakdown — the contractor's own cost, never billable
    [13, 'DH-002', 0, 0, 12, 12, 'Mechanical Breakdown'],
    [14, 'DH-002', 3, 3, 2, 0, 'Hydraulic Issue'], [15, 'DH-002', 4, 4],
    [16, 'DH-002', 4, 3], [17, 'DH-002', 4, 3], [18, 'DH-002', 4, 4],
    [19, 'DH-002', 3, 3], [20, '', 0, 0, 12, 12, 'Weather Condition'],
    [21, 'DH-003', 4, 3], [22, 'DH-003', 4, 3], [23, 'DH-003', 3, 3, 3, 0, 'Rod Change'],
    [24, 'DH-003', 4, 4], [25, 'DH-003', 4, 3], [26, 'DH-003', 4, 3],
    [27, 'DH-003', 4, 4], [28, 'DH-003', 3, 3],
  ]),
  ...expand('RIG-002', 'Site A - North Field', '2026-08', 'HQ', [
    [1, 'DH-011', 4, 4], [2, 'DH-011', 4, 3], [3, 'DH-011', 4, 4],
    [4, 'DH-011', 3, 3, 2, 0, 'Water Shortage'], [5, 'DH-011', 4, 4],
    [6, 'DH-011', 4, 3], [7, 'DH-011', 4, 4], [8, 'DH-011', 4, 3],
    [9, 'DH-011', 4, 4], [10, 'DH-011', 3, 3, 3, 0, 'Bit Change'],
    [11, 'DH-011', 4, 3], [12, 'DH-011', 4, 4], [13, 'DH-011', 4, 3], [14, 'DH-011', 4, 4],
    [15, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [16, 'DH-012', 4, 3], [17, 'DH-012', 4, 4], [18, 'DH-012', 3, 3, 4, 0, 'Electrical Fault'],
    [19, 'DH-012', 4, 3], [20, 'DH-012', 4, 4], [21, 'DH-012', 4, 3],
    [22, 'DH-012', 4, 4], [23, 'DH-012', 4, 3],
  ]),
]

/* Site B prices by depth band rather than formation, so its rate lines use
 * ANY_FORMATION and depth ranges. Same engine, different contract shape. */
export const SEED_SHIFT_LOGS_B: ShiftLog[] = expand('RIG-003', 'Site B - South Ridge', '2026-08', 'HQ', [
  [1, 'DH-101', 5, 4], [2, 'DH-101', 5, 5], [3, 'DH-101', 5, 4],
  [4, 'DH-101', 4, 4, 2, 0, 'Water Shortage'], [5, 'DH-101', 5, 5],
  [6, 'DH-101', 5, 4], [7, 'DH-101', 5, 5], [8, 'DH-101', 4, 4],
  [9, 'DH-101', 5, 4], [10, 'DH-101', 5, 5], [11, 'DH-101', 4, 4],
  [12, 'DH-101', 5, 4], [13, 'DH-101', 5, 5], [14, 'DH-101', 4, 4],
], [[Infinity, 'Hard Formation']])

export const SEED_SHIFT_LOGS: ShiftLog[] =
  markClosures([...SEED_SHIFT_LOGS_A, ...SEED_SHIFT_LOGS_B], ['DH-001', 'DH-002', 'DH-011', 'DH-101'])

export const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm1', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-03', maintenanceType: 'Preventive', hours: 3, component: 'Engine', action: 'Inspection', cost: 4500 },
  { id: 'm2', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-13', maintenanceType: 'Breakdown', hours: 22, component: 'Hydraulic System', action: 'Replace', cost: 68000 },
  { id: 'm3', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-14', maintenanceType: 'Breakdown', hours: 4, component: 'Hydraulic System', action: 'Repair', cost: 12000 },
  { id: 'm4', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-23', maintenanceType: 'Scheduled', hours: 3, component: 'Compressor', action: 'Inspection', cost: 9500 },
  { id: 'm5', rig: 'RIG-002', project: 'Site A - North Field', date: '2026-08-18', maintenanceType: 'Breakdown', hours: 8, component: 'Electrical', action: 'Repair', cost: 41000 },
]

/* ==========================================================================
 * STORE
 * ========================================================================== */

interface State {
  shiftLogs: ShiftLog[]
  maintenance: MaintenanceLog[]
  ownership: RigOwnership[]
  operating: OperatingRate[]
  clientRates: ClientRate[]
  holeStatus: Record<string, HoleState>
  invoices: Invoice[]
}

function initial(): State {
  return {
    shiftLogs: SEED_SHIFT_LOGS, maintenance: SEED_MAINTENANCE,
    ownership: SEED_OWNERSHIP, operating: SEED_OPERATING,
    clientRates: SEED_CLIENT_RATES, holeStatus: SEED_HOLE_STATUS, invoices: [],
  }
}

export const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

export type VersionKind = 'ownership' | 'operating' | 'clientRate'

interface CtxValue {
  state: State
  saveOwnership: (o: RigOwnership) => void
  saveOperating: (o: OperatingRate) => void
  saveClientRate: (c: ClientRate) => void
  deleteVersion: (kind: VersionKind, id: string) => void
  setHoleStatus: (holeNumber: string, s: HoleStatus) => void
  addInvoice: (i: Invoice) => void
  updateInvoice: (i: Invoice) => void
  deleteInvoice: (id: string) => void
  resetAll: () => void
}

const CostingContext = createContext<CtxValue | null>(null)
const KEY = 'xplorix_costing_v2'

export function CostingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)

  // Merge over initial() rather than replacing it, so a saved state from an
  // older build that is missing a key doesn't crash on first render.
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(s => ({ ...initial(), ...JSON.parse(raw) })) } catch {}
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state, loaded])

  function upsert<T extends { id: string }>(list: T[], item: T): T[] {
    return list.some(x => x.id === item.id) ? list.map(x => x.id === item.id ? item : x) : [...list, item]
  }

  const saveOwnership: CtxValue['saveOwnership'] = o => setState(s => ({ ...s, ownership: upsert(s.ownership, o) }))
  const saveOperating: CtxValue['saveOperating'] = o => setState(s => ({ ...s, operating: upsert(s.operating, o) }))
  const saveClientRate: CtxValue['saveClientRate'] = c => setState(s => ({ ...s, clientRates: upsert(s.clientRates, c) }))

  const deleteVersion: CtxValue['deleteVersion'] = (kind, id) => setState(s => {
    if (kind === 'ownership') return { ...s, ownership: s.ownership.filter(x => x.id !== id) }
    if (kind === 'operating') return { ...s, operating: s.operating.filter(x => x.id !== id) }
    return { ...s, clientRates: s.clientRates.filter(x => x.id !== id) }
  })

  const setHoleStatus: CtxValue['setHoleStatus'] = (holeNumber, status) => setState(s => ({
    ...s, holeStatus: { ...s.holeStatus, [holeNumber]: { ...s.holeStatus[holeNumber], status } },
  }))

  // Invoicing stamps the holes it consumed, so a hole can never be billed
  // twice. Deleting the invoice releases them back to Ready to bill.
  // Invoicing stamps each hole so it can never be billed twice; deleting the
  // invoice releases them back to Ready to bill.
  const addInvoice: CtxValue['addInvoice'] = inv => setState(s => {
    const hs = { ...s.holeStatus }
    inv.holeNumbers.forEach(n => { hs[n] = { status: 'invoiced', invoiceId: inv.id } })
    return { ...s, invoices: [inv, ...s.invoices], holeStatus: hs }
  })
  /* Delete is gone from the tracker, so Cancelled is the only way back. It
   * releases the invoice's holes to Approved — otherwise a mistaken invoice
   * would lock those holes out of billing permanently. */
  const updateInvoice: CtxValue['updateInvoice'] = inv => setState(s => {
    const hs = { ...s.holeStatus }
    inv.holeNumbers.forEach(n => {
      hs[n] = inv.status === 'cancelled'
        ? { status: 'approved' }
        : { status: 'invoiced', invoiceId: inv.id }
    })
    return { ...s, invoices: s.invoices.map(i => i.id === inv.id ? inv : i), holeStatus: hs }
  })
  const deleteInvoice: CtxValue['deleteInvoice'] = id => setState(s => {
    const hs = { ...s.holeStatus }
    Object.keys(hs).forEach(n => { if (hs[n].invoiceId === id) hs[n] = { status: 'approved' } })
    return { ...s, invoices: s.invoices.filter(i => i.id !== id), holeStatus: hs }
  })

  return (
    <CostingContext.Provider value={{
      state, saveOwnership, saveOperating, saveClientRate, deleteVersion,
      setHoleStatus, addInvoice, updateInvoice, deleteInvoice,
      resetAll: () => setState(initial()),
    }}>{children}</CostingContext.Provider>
  )
}

export function useCosting() {
  const c = useContext(CostingContext)
  if (!c) throw new Error('useCosting must be used inside CostingProvider')
  return c
}

/* ── Selectors ──────────────────────────────────────────────────────────── */

export function rigsFor(logs: ShiftLog[], project: string) {
  return Array.from(new Set(logs.filter(l => l.project === project).map(l => l.rig))).sort()
}
export function monthsFor(logs: ShiftLog[], rig: string, project: string) {
  return Array.from(new Set(logs.filter(l => l.rig === rig && l.project === project).map(l => monthOf(l.date)))).sort()
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export function dayLabel(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return `${d} ${MON[m - 1]}`
}
export function fullDate(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return `${d} ${MON[m - 1]} ${y}`
}

/* Blank versions used when nothing is configured yet: costing reads zero
 * rather than throwing, and the UI prompts to set rates. */
export function blankOwnership(rig: string, from: string): RigOwnership {
  return {
    id: uid('own'), rig, effectiveFrom: from,
    basicPrice: 0, gstPercent: 18, transportation: 0, depreciationRatePct: 20,
    emiPerMonth: 0, insurancePerYear: 0, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 125,
  }
}
export function blankOperating(rig: string, project: string, from: string): OperatingRate {
  return {
    id: uid('op'), rig, project, effectiveFrom: from,
    fuelPricePerLitre: 0, waterPricePerLitre: 0, additivePricePerKg: 0,
    labourRate: 0, lodgingRate: 0, transportRate: 0, chargePerMetre: false,
  }
}
export function blankClientRate(project: string, from: string): ClientRate {
  return {
    id: uid('cr'), project, effectiveFrom: from, structure: 'flat',
    rateRows: [{ id: uid('r'), holeSize: 'HQ', formation: 'Hard rock', rate: 0, adjustments: [] }],
    standbyPerDay: 0, mobilisation: 0, demobilisation: 0,
  }
}

/* ── UI tokens ──────────────────────────────────────────────────────────── */

export const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B', dim: '#334155',
}

// Each cost layer has one fixed colour used everywhere, so a number's layer is
// readable before you read its label.
export const LAYER = { operating: C.amber, ownership: C.purple, full: C.orange, revenue: C.blue }

export const iStyle: React.CSSProperties = {
  padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 7, color: C.text, fontSize: 12.5, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}
export const derivedStyle: React.CSSProperties = {
  padding: '6px 10px', background: 'rgba(255,255,255,0.02)',
  border: `1px dashed ${C.border}`, borderRadius: 7, color: C.text,
  fontSize: 12.5, fontFamily: 'ui-monospace, monospace', width: '100%',
}

export function money(n: number) {
  return `${n < 0 ? '−' : ''}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`
}
export function moneyL(n: number) {
  const a = Math.abs(n)
  if (a >= 10000000) return `${n < 0 ? '−' : ''}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${n < 0 ? '−' : ''}₹${(a / 100000).toFixed(1)}L`
  return money(n)
}
export function perUnit(n: number | null) {
  return n == null ? '—' : `₹${Math.round(n).toLocaleString('en-IN')}/m`
}
export function pct(n: number) { return `${n.toFixed(1)}%` }

// Cost per unit only means something against what the client pays for that
// unit, so it is coloured by margin, never by an absolute threshold.
export function cpuColor(cpu: number, rate: number) {
  if (!rate) return C.muted
  const m = (rate - cpu) / rate
  return m >= 0.3 ? C.green : m >= 0.12 ? C.amber : C.red
}
export function marginColor(m: number) { return m >= 0 ? C.green : C.red }
export function statusColor(s: DayStatus) {
  return s === 'drilling' ? C.green : s === 'standby' ? C.amber : C.red
}
export function holeStatusColor(s: HoleStatus) {
  return s === 'drilling' ? C.blue : s === 'closed' ? C.amber : s === 'approved' ? C.green : C.purple
}
