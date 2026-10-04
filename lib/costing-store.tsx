'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  normFormation as groundOf, TODAY,
  PROJECTS as INV_PROJECTS, COMPLETED_PROJECTS as INV_COMPLETED, RIGS as INV_RIGS, PROJECT_CODES as INV_CODES,
} from './inventory-store'
import type { ToolingRates, Formation } from './inventory-store'

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

/* What a shift took out of a part.
 *
 *   metres / days   how far the part ran — wear, which carries across shifts
 *   qty             how many whole units were finished off and scrapped
 *
 * The two are different facts. Seven metres of very hard ground wears a bit
 * far more than seven metres of soft, and a bit that shatters at 40 m is
 * scrapped whole even though it had barely worn. Only the driller knows that
 * happened, so qty is suggested from the wear and then left editable.
 *
 * metres and days are optional: a log written before wear was recorded still
 * reads, with each unit counting as one whole life. */
export interface PartUsage {
  itemId: string
  qty: number
  metres?: number
  days?: number
  note?: string
}

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
  formationType: string     // lithology; drives both cost and revenue
  // Set from "Hole Closed This Shift?" in the driller's log. Finance never
  // decides when a hole is finished — it reads that decision and the hole
  // appears in Drillholes as Closed, waiting for approval.
  holeClosedThisShift?: boolean
  /* Parts consumed this shift, picked from the parts catalogue. This is the
   * only place parts actually used gets recorded — the store knows what it
   * issued, but only the driller knows what went into the ground. */
  partsUsed?: PartUsage[]
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
    return cr.rateRows.find(r => r.holeSize === holeSize &&
      (r.formation === ANY_FORMATION || normFormation(r.formation) === normFormation(formation)))
  }
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

/* 'submitted' only exists on a project whose mine owner is on XPLORIX: the
 * contractor sends the closed hole across, and it is the owner who approves
 * it. On every other project the contractor still approves his own hole and
 * the status goes straight from closed to approved, exactly as before. */
export type HoleStatus = 'drilling' | 'closed' | 'submitted' | 'approved' | 'invoiced'

export const HOLE_STATUS_LABEL: Record<HoleStatus, string> = {
  drilling: 'Drilling', closed: 'Closed', submitted: 'With mine owner',
  approved: 'Approved', invoiced: 'Invoiced',
}

export interface HoleState {
  status: HoleStatus
  invoiceId?: string
  submittedAt?: string      // when the contractor sent it to the mine owner
  decidedAt?: string        // when the mine owner approved or returned it
  returnReason?: string     // set when the owner sent it back; cleared on resend
}

export interface Hole {
  holeNumber: string
  rig: string
  project: string
  startDate: string
  endDate?: string
  status: HoleStatus
  invoiceId?: string
  submittedAt?: string
  decidedAt?: string
  returnReason?: string
}

/* What was planned for a hole before the first metre. Planned depth is the one
 * number the mine owner needs to read progress: "planned 400 m, drilled 388 m". */
export interface HolePlan {
  plannedDepth: number
  project?: string
  holeSize?: string
  note?: string                       // what the hole is for, in the planner's words
  by?: 'contractor' | 'owner'         // who put it on the plan
  addedAt?: string
}

// ── PROJECT ───────────────────────────────────────────────────────────────
/* One record per project, and the only one. Finance, Inventory, the drill log,
 * the Dashboard and the Client Portal all read it, so a project created on the
 * Projects screen exists everywhere at once.
 *
 * `name` is what every shift log, rate and invoice is filed under. `shared`
 * means the client is on XPLORIX: the project, its contract rates, its planned
 * holes and the rigs and crew on site appear in the Client Portal, a closed
 * hole goes to the client for approval, and an invoice goes to him for
 * line-by-line checking. Costs and margin are never part of what is shared. */
export type ProjectStatus = 'active' | 'on-hold' | 'completed'
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active', 'on-hold': 'On hold', completed: 'Completed',
}
export interface ProjectRecord {
  id: string              // the project code: stable, used in links
  name: string
  code: string
  location: string
  client: string
  status: ProjectStatus
  startDate: string
  plannedMetres?: number
  holeSize: string
  shared: boolean
  rigs: string[]
  supervisors: string[]
  drillers: string[]
  createdAt: string
}

/* Everything that changes on a project leaves a line here: who changed what
 * and when. It is the contractor's activity list and the client's "what
 * changed" list — the same lines — and the unseen ones are the notifications. */
export type ProjectEventKind = 'created' | 'shared' | 'details' | 'status' | 'rig' | 'crew' | 'hole' | 'rates'
export interface ProjectEvent {
  id: string
  project: string
  at: string              // YYYY-MM-DDTHH:MM
  kind: ProjectEventKind
  by: 'contractor' | 'owner'
  title: string
  detail?: string
  seenByOwner?: boolean
  seenByContractor?: boolean
}

/* A rate is a contract, so on a shared project the contractor cannot change it
 * alone. A new set of rates is a proposal; it becomes a client rate — and
 * starts pricing metres — only when the client accepts it. */
export type ProposalStatus = 'waiting' | 'accepted' | 'returned' | 'withdrawn'
export interface RateProposal {
  id: string
  project: string
  rate: ClientRate
  proposedAt: string
  status: ProposalStatus
  answeredAt?: string
  ownerNote?: string
}

// ── MINE OWNER LINK ───────────────────────────────────────────────────────
/* Mirrors of the project list for the plain functions in this file and others
 * that are not components and cannot read the store. The store keeps them in
 * step with its own list (see syncRegistry), so they are never typed by hand. */
export const OWNER_NAME = 'Demo Mining Co.'
export const OWNER_LINKED_PROJECTS: string[] = []
export function isOwnerLinked(project: string) { return OWNER_LINKED_PROJECTS.includes(project) }

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
  // Set only on a project whose mine owner is on XPLORIX.
  ownerStatus?: OwnerInvoiceStatus
  lineReviews?: (LineReview | null)[]   // same order as lines; null = not looked at yet
  sentAt?: string
  reviewedAt?: string
}

/* The mine owner's answer, kept apart from the contractor's own status so
 * neither side can overwrite the other. */
export type OwnerInvoiceStatus = 'awaiting' | 'approved' | 'disputed'
export const OWNER_INVOICE_LABEL: Record<OwnerInvoiceStatus, string> = {
  awaiting: 'Waiting for mine owner', approved: 'Approved by mine owner', disputed: 'Disputed by mine owner',
}
export interface LineReview { status: 'approved' | 'disputed'; reason?: string }

export function ownerStatusFor(lines: InvoiceLine[], reviews: (LineReview | null)[]): OwnerInvoiceStatus {
  if (reviews.some(r => r?.status === 'disputed')) return 'disputed'
  if (lines.length > 0 && lines.every((_, i) => reviews[i]?.status === 'approved')) return 'approved'
  return 'awaiting'
}
export function disputedAmount(i: Invoice) {
  return i.lines.reduce((s, l, k) => s + (i.lineReviews?.[k]?.status === 'disputed' ? l.amount : 0), 0)
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled'
export const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'pending', 'paid', 'cancelled']
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft', pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled',
}
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
  emi: number; emiActive: boolean; emiMonthsLeft: number
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

  const labour = heads * r.labourRate
  const lodging = heads * r.lodgingRate
  const transport = heads > 0 ? r.transportRate : 0
  return { labour, lodging, transport, heads, dayCrew, nightCrew, perMetre: false, total: labour + lodging + transport }
}

/* What the parts cost on a day, split by the ground that wore them out. */
export interface ToolingCharge {
  formation: Formation
  metres: number
  rate: number
  amount: number
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
  partsByMetre: number
  /* The tooling rate this day was actually charged at — a weighted average
   * across the formations drilled, so a day that cut soft and then hard reads
   * between the two. Shown in the day breakdown so any figure can be traced
   * back to the rig that produced it. */
  toolingRate: number
  toolingByFormation: ToolingCharge[]
  operating: number; ownership: number; total: number
  cpu: number | null
  rate: number
  adjustmentPct: number
  revenue: number
  unmatched: boolean
  charges: Charge[]
}

export function dayCost(
  date: string, rig: string, project: string,
  shifts: ShiftLog[], maint: MaintenanceLog[],
  op: OperatingRate, own: RigOwnership, ob: OwnershipBreakdown,
  cr: ClientRate | undefined, tooling: ToolingRates, depthSoFar: number,
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

  /* Parts are amortised, not charged on the day they were bought, and each
   * stretch of hole is charged for the ground it was actually in. Seven metres
   * of soft and eleven of hard on the same day are two different rates,
   * because they wear out two different sets of parts.
   *
   * The rate comes from what this rig was carrying on this date — its starting
   * kit plus everything issued up to it — so issuing a bit on the 14th moves
   * the 14th onward and leaves every day already costed exactly as it was. A
   * standby or breakdown day drills nothing, wears nothing and carries
   * nothing. */
  const toolingByFormation: ToolingCharge[] = []
  shifts.forEach(sh => {
    if (sh.metresDrilled <= 0) return
    const formation = groundOf(sh.formationType)
    const rate = tooling.byFormation[formation] ?? tooling.blended
    const existing = toolingByFormation.find(x => x.formation === formation)
    if (existing) {
      existing.metres += sh.metresDrilled
      existing.amount += sh.metresDrilled * rate
    } else {
      toolingByFormation.push({ formation, metres: sh.metresDrilled, rate, amount: sh.metresDrilled * rate })
    }
  })
  const partsByMetre = toolingByFormation.reduce((a, x) => a + x.amount, 0)
  const parts = partsByMetre
  const toolingRate = units > 0 ? partsByMetre / units : tooling.blended

  const operating = fuel + water + additives + labour.total + repairs + parts
  const ownership = own.allocationBasis === 'expectedUnit' ? units * ob.perUnit : ob.perDay
  const total = operating + ownership

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
    fuel, water, additives, labour, repairs, parts, partsByMetre,
    toolingRate, toolingByFormation,
    operating, ownership, total,
    cpu: units > 0 ? total / units : null,
    rate, adjustmentPct, revenue, unmatched, charges,
  }
}

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
  toolingPerUnit: number
  revenuePerUnit: number; margin: number; marginPct: number
}

export function rollup(days: DayCost[]): Rollup {
  const z: Rollup = {
    days: 0, drillingDays: 0, standbyDays: 0, breakdownDays: 0, missingDays: 0,
    units: 0, coreRecovery: 0, coreRecoveryPct: 0, drillingHours: 0, downtimeHours: 0, maintenanceHours: 0,
    fuelLitres: 0, fuel: 0, water: 0, additives: 0,
    labour: 0, repairs: 0, parts: 0, operating: 0, ownership: 0, total: 0, revenue: 0,
    cpu: 0, operatingCPU: 0, ownershipCPU: 0, toolingPerUnit: 0,
    revenuePerUnit: 0, margin: 0, marginPct: 0,
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
    z.toolingPerUnit = z.parts / z.units
    z.revenuePerUnit = z.revenue / z.units
    z.coreRecoveryPct = (z.coreRecovery / z.units) * 100
  }
  z.margin = z.revenue - z.total
  z.marginPct = z.revenue > 0 ? (z.margin / z.revenue) * 100 : 0
  return z
}

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
  rates: number[]
  unmatchedDays: number
  billing: BillingLine[]
}

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

export function holesFromDays(allDays: DayCost[], statuses: Record<string, HoleState>): Hole[] {
  const byHole: Record<string, DayCost[]> = {}
  allDays.forEach(d => { if (d.holeNumber) (byHole[d.holeNumber] ||= []).push(d) })
  return Object.entries(byHole).map(([holeNumber, ds]) => {
    const sorted = [...ds].sort((a, b) => a.date.localeCompare(b.date))
    const closingDay = sorted.find(d => d.shifts.some(sh => sh.holeClosedThisShift))
    const stored = statuses[holeNumber]?.status
    const st: HoleStatus = stored && stored !== 'drilling' ? stored : (closingDay ? 'closed' : 'drilling')
    return {
      holeNumber, rig: sorted[0].rig, project: sorted[0].project,
      startDate: sorted[0].date,
      endDate: closingDay?.date,
      status: st, invoiceId: statuses[holeNumber]?.invoiceId,
      submittedAt: statuses[holeNumber]?.submittedAt,
      decidedAt: statuses[holeNumber]?.decidedAt,
      returnReason: statuses[holeNumber]?.returnReason,
    }
  }).sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function holeResult(hole: Hole, allDays: DayCost[]): HoleResult {
  const days = allDays.filter(d => d.holeNumber === hole.holeNumber)
  const roll = rollup(days)
  return {
    hole, days, roll, depth: roll.units,
    coreRecoveryPct: roll.coreRecoveryPct,
    rates: Array.from(new Set(days.flatMap(d => d.charges).filter(c => c.metres > 0).map(c => Math.round(c.rate)))).sort((a, b) => a - b),
    unmatchedDays: days.filter(d => d.unmatched).length,
    billing: billingLines(days),
  }
}

export function isBillable(h: Hole) { return h.status === 'approved' && !h.invoiceId }
export function isFinished(h: Hole) { return h.status !== 'drilling' }

/* ==========================================================================
 * SEED DATA
 * ========================================================================== */

export const PROJECT_CODES: Record<string, string> = {}
export function projectCode(name: string) {
  return PROJECT_CODES[name] ?? name.match(/^([A-Za-z]+-\d+)/)?.[1] ?? name
}
export function rigCode(name: string) {
  return name.match(/^([A-Za-z]+-\d+)/)?.[1] ?? name
}

export const PROJECT_CLIENTS: Record<string, string> = {}

/* The company's rigs and people, to pick from when a project is staffed. */
export const FLEET = [
  { rig: 'RIG-001', type: 'Core' }, { rig: 'RIG-002', type: 'Core' }, { rig: 'RIG-003', type: 'Core' },
  { rig: 'RIG-004', type: 'Core' }, { rig: 'RIG-005', type: 'Core' },
]
export const PEOPLE = {
  supervisors: ['Arun Verma', 'Imran Shaikh', 'Pradeep Rao', 'Kiran Joshi', 'Suresh Nair'],
  drillers: ['Mahesh Yadav', 'Ravi Kumar', 'Santosh Patil', 'Dinesh Sahu', 'Farid Khan', 'Gopal Das', 'Naveen Reddy', 'Lokesh Meena'],
}

export const SEED_PROJECTS: ProjectRecord[] = [
  {
    id: 'PRJ-001', code: 'PRJ-001', name: 'Site A - North Field', location: 'North Field block', client: OWNER_NAME,
    status: 'active', startDate: '2026-06-01', plannedMetres: 2400, holeSize: 'HQ', shared: true,
    rigs: ['RIG-001', 'RIG-002'], supervisors: ['Arun Verma', 'Imran Shaikh'],
    drillers: ['Mahesh Yadav', 'Ravi Kumar', 'Santosh Patil', 'Dinesh Sahu'], createdAt: '2026-05-25',
  },
  {
    id: 'PRJ-002', code: 'PRJ-002', name: 'Site B - South Ridge', location: 'South Ridge block', client: 'South Ridge Minerals',
    status: 'active', startDate: '2026-01-01', plannedMetres: 1500, holeSize: 'HQ', shared: false,
    rigs: ['RIG-003'], supervisors: ['Pradeep Rao'], drillers: ['Farid Khan', 'Gopal Das'], createdAt: '2025-12-15',
  },
  {
    id: 'PRJ-003', code: 'PRJ-003', name: 'Site C - East Basin', location: 'East Basin block', client: 'East Basin Resources',
    status: 'completed', startDate: '2026-02-01', plannedMetres: 900, holeSize: 'HQ', shared: false,
    rigs: [], supervisors: [], drillers: [], createdAt: '2026-01-20',
  },
]

/* Brings the mirrors into step with the store's project list. Called by the
 * store before anything below it renders, and once here so a screen that is
 * outside the store still sees the seed projects. */
export function syncRegistry(projects: ProjectRecord[]) {
  const fill = (target: string[], values: string[]) => { target.length = 0; target.push(...values) }
  const refill = (target: Record<string, string>, pairs: [string, string][]) => {
    Object.keys(target).forEach(k => { delete target[k] })
    pairs.forEach(([k, v]) => { target[k] = v })
  }
  fill(OWNER_LINKED_PROJECTS, projects.filter(p => p.shared).map(p => p.name))
  fill(INV_PROJECTS, projects.map(p => p.name))
  fill(INV_COMPLETED, projects.filter(p => p.status === 'completed').map(p => p.name))
  fill(INV_RIGS, Array.from(new Set([...FLEET.slice(0, 3).map(f => f.rig), ...projects.flatMap(p => p.rigs)])).sort())
  const codes = projects.map(p => [p.name, p.code] as [string, string])
  refill(PROJECT_CODES, codes)
  refill(INV_CODES, codes)
  refill(PROJECT_CLIENTS, projects.map(p => [p.name, p.client] as [string, string]))
}
syncRegistry(SEED_PROJECTS)

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
    expectedOperatingDays: 25, expectedUnitsPerMonth: 300,
    note: 'Opening entry',
  },
  {
    id: 'own_r2', rig: 'RIG-002', effectiveFrom: '2026-01-01',
    basicPrice: 5400000, gstPercent: 0, transportation: 180000,
    depreciationRatePct: 20,
    emiPerMonth: 136500, emiEndsMonth: '2027-10',
    insurancePerYear: 108000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 300,
    note: 'Opening entry',
  },
  {
    id: 'own_r3', rig: 'RIG-003', effectiveFrom: '2026-01-01',
    basicPrice: 4800000, gstPercent: 0, transportation: 160000,
    depreciationRatePct: 20,
    emiPerMonth: 118000, emiEndsMonth: '2029-02',
    insurancePerYear: 96000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 300,
    note: 'Opening entry',
  },
]

const opRate = (id: string, rig: string, project: string, from: string, fuel: number, note: string): OperatingRate => ({
  id, rig, project, effectiveFrom: from, note,
  fuelPricePerLitre: fuel, waterPricePerLitre: 4, additivePricePerKg: 190,
  labourRate: 900, lodgingRate: 180, transportRate: 1250, chargePerMetre: false,
})

export const SEED_OPERATING: OperatingRate[] = [
  opRate('op_a1_1', 'RIG-001', 'Site A - North Field', '2026-01-01', 92, 'Opening entry'),
  opRate('op_a1_2', 'RIG-001', 'Site A - North Field', '2026-07-01', 96, 'Diesel price revision'),
  opRate('op_a1_3', 'RIG-001', 'Site A - North Field', '2026-08-01', 100, 'Diesel price revision'),
  opRate('op_a1_4', 'RIG-001', 'Site A - North Field', '2026-09-01', 104, 'Diesel price revision'),
  opRate('op_a2_1', 'RIG-002', 'Site A - North Field', '2026-01-01', 96, 'Opening entry'),
  opRate('op_a2_2', 'RIG-002', 'Site A - North Field', '2026-08-01', 100, 'Diesel price revision'),
  opRate('op_a2_3', 'RIG-002', 'Site A - North Field', '2026-09-01', 104, 'Diesel price revision'),
  opRate('op_b1_1', 'RIG-003', 'Site B - South Ridge', '2026-01-01', 100, 'Opening entry'),
]

export const SEED_CLIENT_RATES: ClientRate[] = [
  {
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
    id: 'cr_b_1', project: 'Site B - South Ridge', effectiveFrom: '2026-01-01',
    structure: 'slab',
    rateRows: [
      { id: 'b1', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 0, toDepth: 75, rate: 7800, adjustments: [] },
      { id: 'b2', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 75, toDepth: 150, rate: 8900, adjustments: [] },
      { id: 'b3', holeSize: 'HQ', formation: ANY_FORMATION, fromDepth: 150, rate: 10400, adjustments: [] },
    ],
    standbyPerDay: 14000, mobilisation: 150000, demobilisation: 120000,
    note: 'Contract rate card, depth bands',
  },
]

export const SEED_HOLE_STATUS: Record<string, HoleState> = {
  'DH-001': { status: 'approved' },
  'DH-011': { status: 'approved' },
  'DH-101': { status: 'approved' },
  // Waiting with the mine owner, so the Client Portal has a live approval on first load.
  'DH-002': { status: 'submitted', submittedAt: '2026-09-12' },
}

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

type DaySpec = [number, string, number, number, number?, number?, string?]

/* Core recovery differs hole to hole — ground, bit and crew all move it — so
 * the seed gives each hole its own figure instead of one flat percentage. */
const RECOVERY_STEPS = [0.96, 0.975, 0.94, 0.985, 0.955, 0.93]
function recoveryFor(hole: string) {
  if (!hole) return 0.95
  const n = hole.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return RECOVERY_STEPS[n % RECOVERY_STEPS.length]
}

function formationAt(depth: number, bands: [number, string][]): string {
  for (const [limit, name] of bands) if (depth < limit) return name
  return bands[bands.length - 1][1]
}

const DEPTH_BANDS: [number, string][] = [
  [35, 'Soft Formation'], [75, 'Hard Formation'], [Infinity, 'Very Hard Formation'],
]

const WEAR: Record<string, number> = { Soft: 2.2, Medium: 1.5, Hard: 1.0, 'Very Hard': 0.6 }

/* How a part wears.
 *
 *   terrain   harder ground eats it faster — bits, lifters, reamers
 *   flat      metres are metres whatever the rock — rods, swivels, barrels
 *   soft      only consumed in the overburden — casing and casing shoes,
 *             which are set near surface and never touched at depth
 */
type WearMode = 'terrain' | 'flat' | 'soft'

function partsFor(
  run: Record<string, number>, metres: number, formation: string,
): PartUsage[] {
  const out: PartUsage[] = []
  const key = formation.includes('Very') ? 'Very Hard' : formation.includes('Hard') ? 'Hard' : 'Soft'
  const factor = WEAR[key]
  const inSoft = key === 'Soft'

  // [catalogue id, life in metres, how it wears]
  const wearing: [string, number, WearMode][] = [
    ['t06', 20, 'terrain'],    // HQ Core Lifter
    ['t07', 50, 'terrain'],    // HQ Core Lifter Case
    ['t08', 100, 'terrain'],   // HQ Impregnated Bit
    ['t15', 200, 'soft'],      // PW Casing TC Bit
    ['t16', 200, 'soft'],      // HW Casing TC / Shoe Bit
    ['t04', 500, 'terrain'],   // HQ Diamond Reamer Shell
    ['t09', 500, 'terrain'],   // HQ Core Barrel Spares
    ['t02', 2000, 'flat'],     // HQ Core Barrel 3.0 m
    ['t03', 2000, 'flat'],     // HQ Inner Tube Assembly
    ['t05', 2000, 'flat'],     // HQ Over Shot Assembly
    ['t17', 2000, 'flat'],     // Water Swivel Spares
    ['t01', 5000, 'flat'],     // HQ Wire Line Drill Rod
    ['t10', 5000, 'flat'],     // Water Swivel
    ['t11', 5000, 'flat'],     // Hoisting Plug
    ['t12', 5000, 'flat'],     // Adaptors
    ['t13', 10000, 'soft'],    // PW Casing 3.0 m
    ['t14', 10000, 'soft'],    // HW Casing 3.0 m
  ]

  wearing.forEach(([id, baseLife, mode]) => {
    if (mode === 'soft' && !inSoft) return
    const life = mode === 'terrain' ? baseLife * factor : baseLife
    run[id] = (run[id] ?? 0) + metres
    while (run[id] >= life) {
      run[id] -= life
      const existing = out.find(o => o.itemId === id)
      if (existing) existing.qty += 1
      else out.push({ itemId: id, qty: 1, metres })
    }
  })
  return out
}

function expand(rig: string, project: string, ym: string, size: string, specs: DaySpec[], bands = DEPTH_BANDS): ShiftLog[] {
  const out: ShiftLog[] = []
  const depth: Record<string, number> = {}
  const wear: Record<string, number> = {}
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
        coreRecovery: +(metres * recoveryFor(hole)).toFixed(2),
        holeSize: size,
        formationType: formationAt(startDepth, bands),
        fuelLitres: drillingHours * 10 + (down > 0 ? 6 : 0),
        waterLitres: metres * 120,
        additivesKg: +(metres * 0.8).toFixed(1),
        partsUsed: metres > 0 ? partsFor(wear, metres, formationAt(startDepth, bands)) : [],
      }
    }
    out.push(mk('Day', dm, dd, 4))
    out.push(mk('Night', nm, nd, 3))
  })
  return out
}

export const SEED_SHIFT_LOGS_A: ShiftLog[] = [
  ...expand('RIG-001', 'Site A - North Field', '2026-08', 'HQ', [
    [1, 'DH-001', 7, 5], [2, 'DH-001', 7, 5], [3, 'DH-001', 5, 5, 3, 0, 'Bit Change'],
    [4, 'DH-001', 7, 7], [5, 'DH-001', 7, 5], [6, 'DH-001', 7, 5],
    [7, 'DH-001', 5, 5, 2, 0, 'Ground Condition Issue'], [8, 'DH-001', 7, 5],
    [9, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [10, 'DH-002', 7, 5], [11, 'DH-002', 7, 5], [12, 'DH-002', 7, 5],
    [13, 'DH-002', 0, 0, 12, 12, 'Mechanical Breakdown'],
    [14, 'DH-002', 5, 5, 2, 0, 'Hydraulic Issue'], [15, 'DH-002', 7, 7],
    [16, 'DH-002', 7, 5], [17, 'DH-002', 7, 5], [18, 'DH-002', 7, 7],
    [19, 'DH-002', 5, 5], [20, '', 0, 0, 12, 12, 'Weather Condition'],
    [21, 'DH-003', 7, 5], [22, 'DH-003', 7, 5], [23, 'DH-003', 5, 5, 3, 0, 'Rod Change'],
    [24, 'DH-003', 7, 7], [25, 'DH-003', 7, 5], [26, 'DH-003', 7, 5],
    [27, 'DH-003', 7, 7], [28, 'DH-003', 5, 5],
  ]),
  ...expand('RIG-002', 'Site A - North Field', '2026-08', 'HQ', [
    [1, 'DH-011', 7, 7], [2, 'DH-011', 7, 5], [3, 'DH-011', 7, 7],
    [4, 'DH-011', 5, 5, 2, 0, 'Water Shortage'], [5, 'DH-011', 7, 7],
    [6, 'DH-011', 7, 5], [7, 'DH-011', 7, 7], [8, 'DH-011', 7, 5],
    [9, 'DH-011', 7, 7], [10, 'DH-011', 5, 5, 3, 0, 'Bit Change'],
    [11, 'DH-011', 7, 5], [12, 'DH-011', 7, 7], [13, 'DH-011', 7, 5], [14, 'DH-011', 7, 7],
    [15, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [16, 'DH-012', 7, 5], [17, 'DH-012', 7, 7], [18, 'DH-012', 5, 5, 4, 0, 'Electrical Fault'],
    [19, 'DH-012', 7, 5], [20, 'DH-012', 7, 7], [21, 'DH-012', 7, 5],
    [22, 'DH-012', 7, 7], [23, 'DH-012', 7, 5],
  ]),
]

export const SEED_SHIFT_LOGS_B: ShiftLog[] = expand('RIG-003', 'Site B - South Ridge', '2026-08', 'HQ', [
  [1, 'DH-101', 8, 7], [2, 'DH-101', 8, 8], [3, 'DH-101', 8, 7],
  [4, 'DH-101', 7, 7, 2, 0, 'Water Shortage'], [5, 'DH-101', 8, 8],
  [6, 'DH-101', 8, 7], [7, 'DH-101', 8, 8], [8, 'DH-101', 7, 7],
  [9, 'DH-101', 8, 7], [10, 'DH-101', 8, 8], [11, 'DH-101', 7, 7],
  [12, 'DH-101', 8, 7], [13, 'DH-101', 8, 8], [14, 'DH-101', 7, 7],
], [[Infinity, 'Hard Formation']])

/* June and July give the month strip something to compare against, and they
 * are deliberately different months rather than noise: June carries a bad
 * breakdown run and two weather stoppages, July is clean. September runs to
 * the 13th, which is where the system's today sits. */
export const SEED_SHIFT_LOGS_JUNE: ShiftLog[] = [
  ...expand('RIG-001', 'Site A - North Field', '2026-06', 'HQ', [
    [1, 'DH-901', 6, 5], [2, 'DH-901', 6, 5], [3, 'DH-901', 5, 4, 3, 0, 'Bit Change'],
    [4, 'DH-901', 0, 0, 12, 12, 'Mechanical Breakdown'],
    [5, 'DH-901', 0, 0, 12, 12, 'Mechanical Breakdown'],
    [6, 'DH-901', 4, 4, 5, 2, 'Hydraulic Issue'], [7, 'DH-901', 6, 5],
    [8, 'DH-901', 6, 6], [9, 'DH-901', 5, 5, 2, 0, 'Rod Change'],
    [10, '', 0, 0, 12, 12, 'Weather Condition'],
    [11, '', 0, 0, 12, 12, 'Weather Condition'],
    [12, 'DH-902', 6, 5], [13, 'DH-902', 6, 5], [14, 'DH-902', 6, 6],
    [15, 'DH-902', 5, 4, 3, 0, 'Electrical Fault'], [16, 'DH-902', 6, 5],
    [17, 'DH-902', 6, 6], [18, 'DH-902', 6, 5], [19, 'DH-902', 6, 6],
    [20, 'DH-902', 5, 5], [21, 'DH-902', 6, 5], [22, 'DH-902', 6, 6],
    [23, 'DH-902', 5, 5, 2, 0, 'Operator Delay'], [24, 'DH-902', 6, 5],
    [25, 'DH-902', 6, 6], [26, 'DH-902', 6, 5],
  ]),
  ...expand('RIG-002', 'Site A - North Field', '2026-06', 'HQ', [
    [2, 'DH-911', 7, 6], [3, 'DH-911', 7, 6], [4, 'DH-911', 7, 7],
    [5, 'DH-911', 6, 5, 2, 0, 'Water Shortage'], [6, 'DH-911', 7, 6],
    [7, 'DH-911', 7, 7], [8, 'DH-911', 7, 6], [9, 'DH-911', 7, 7],
    [10, '', 0, 0, 12, 12, 'Weather Condition'],
    [11, 'DH-911', 7, 6], [12, 'DH-911', 7, 7], [13, 'DH-911', 6, 6, 3, 0, 'Bit Change'],
    [14, 'DH-911', 7, 6], [15, 'DH-911', 7, 7], [16, 'DH-911', 7, 6],
    [17, 'DH-911', 7, 7], [18, 'DH-911', 6, 6],
  ]),
]

export const SEED_SHIFT_LOGS_JULY: ShiftLog[] = [
  ...expand('RIG-001', 'Site A - North Field', '2026-07', 'HQ', [
    [1, 'DH-951', 8, 6], [2, 'DH-951', 8, 7], [3, 'DH-951', 8, 6],
    [4, 'DH-951', 8, 7], [5, 'DH-951', 7, 7], [6, 'DH-951', 8, 6],
    [7, 'DH-951', 8, 7], [8, 'DH-951', 8, 7], [9, 'DH-951', 7, 6],
    [10, 'DH-951', 8, 7], [11, 'DH-951', 8, 6],
    [12, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [13, 'DH-952', 8, 7], [14, 'DH-952', 8, 6], [15, 'DH-952', 8, 7],
    [16, 'DH-952', 7, 7], [17, 'DH-952', 8, 6], [18, 'DH-952', 8, 7],
    [19, 'DH-952', 8, 6], [20, 'DH-952', 7, 7], [21, 'DH-952', 8, 6],
    [22, 'DH-952', 8, 7], [23, 'DH-952', 6, 6, 2, 0, 'Bit Change'],
    [24, 'DH-952', 8, 7], [25, 'DH-952', 8, 6], [26, 'DH-952', 8, 7],
    [27, 'DH-952', 7, 7], [28, 'DH-952', 8, 6], [29, 'DH-952', 8, 7],
  ]),
  ...expand('RIG-002', 'Site A - North Field', '2026-07', 'HQ', [
    [1, 'DH-961', 7, 7], [2, 'DH-961', 8, 6], [3, 'DH-961', 7, 7],
    [4, 'DH-961', 8, 7], [5, 'DH-961', 7, 6], [6, 'DH-961', 8, 7],
    [7, 'DH-961', 7, 7], [8, 'DH-961', 8, 6], [9, 'DH-961', 7, 7],
    [10, 'DH-961', 6, 6, 3, 0, 'Rod Change'], [11, 'DH-961', 8, 7],
    [12, 'DH-961', 7, 6], [13, 'DH-961', 8, 7], [14, 'DH-961', 7, 7],
    [15, 'DH-961', 8, 6], [16, 'DH-961', 7, 7], [17, 'DH-961', 8, 7],
    [18, 'DH-961', 7, 6], [19, 'DH-961', 8, 7], [20, 'DH-961', 7, 7],
    [21, 'DH-961', 8, 6], [22, 'DH-961', 7, 7],
  ]),
]

export const SEED_SHIFT_LOGS_SEP: ShiftLog[] = [
  ...expand('RIG-001', 'Site A - North Field', '2026-09', 'HQ', [
    [1, 'DH-004', 7, 6], [2, 'DH-004', 7, 5], [3, 'DH-004', 7, 6],
    [4, 'DH-004', 6, 5, 2, 0, 'Bit Change'], [5, 'DH-004', 7, 6],
    [6, 'DH-004', 7, 7], [7, 'DH-004', 7, 6],
    [8, '', 0, 0, 12, 12, 'Waiting for Instruction'],
    [9, 'DH-004', 7, 6], [10, 'DH-004', 7, 7], [11, 'DH-004', 6, 6],
    [12, 'DH-004', 7, 6], [13, 'DH-004', 7, 7],
  ]),
  ...expand('RIG-002', 'Site A - North Field', '2026-09', 'HQ', [
    [1, 'DH-013', 7, 7], [2, 'DH-013', 7, 6], [3, 'DH-013', 7, 7],
    [4, 'DH-013', 7, 6], [5, 'DH-013', 6, 6, 3, 0, 'Hydraulic Issue'],
    [6, 'DH-013', 7, 7], [7, 'DH-013', 7, 6], [8, 'DH-013', 7, 7],
    [9, 'DH-013', 7, 6], [10, 'DH-013', 7, 7], [11, 'DH-013', 6, 6],
    [12, 'DH-013', 7, 7], [13, 'DH-013', 7, 6],
  ]),
  ...expand('RIG-003', 'Site B - South Ridge', '2026-09', 'HQ', [
    [1, 'DH-102', 8, 7], [2, 'DH-102', 8, 8], [3, 'DH-102', 8, 7],
    [4, 'DH-102', 7, 7], [5, 'DH-102', 8, 8], [6, 'DH-102', 8, 7],
    [7, 'DH-102', 8, 8], [8, 'DH-102', 7, 7], [9, 'DH-102', 8, 7],
    [10, 'DH-102', 8, 8], [11, 'DH-102', 7, 7], [12, 'DH-102', 8, 7],
    [13, 'DH-102', 8, 8],
  ], [[Infinity, 'Hard Formation']]),
]

export const SEED_SHIFT_LOGS: ShiftLog[] =
  markClosures(
    [...SEED_SHIFT_LOGS_JUNE, ...SEED_SHIFT_LOGS_JULY, ...SEED_SHIFT_LOGS_A,
     ...SEED_SHIFT_LOGS_B, ...SEED_SHIFT_LOGS_SEP],
    ['DH-901', 'DH-902', 'DH-911', 'DH-951', 'DH-952', 'DH-961',
     'DH-001', 'DH-002', 'DH-011', 'DH-101'])

/* Planned depth for every seeded hole. A closed hole was planned at what it
 * reached, rounded up to the next 5 m; a hole still drilling has further to go. */
const OPEN_HOLE_PLANS: Record<string, number> = {
  'DH-003': 120, 'DH-012': 150, 'DH-004': 200, 'DH-013': 220, 'DH-102': 300,
}
const UPCOMING_HOLES: [string, string, number][] = [
  ['DH-005', 'Site A - North Field', 200],
  ['DH-006', 'Site A - North Field', 180],
  ['DH-014', 'Site A - North Field', 220],
  ['DH-015', 'Site A - North Field', 240],
  ['DH-121', 'Site B - South Ridge', 300],
  ['DH-122', 'Site B - South Ridge', 280],
  ['DH-123', 'Site B - South Ridge', 320],
]
export const SEED_HOLE_PLANS: Record<string, HolePlan> = (() => {
  const drilled: Record<string, { m: number; project: string }> = {}
  SEED_SHIFT_LOGS.forEach(l => {
    if (!l.holeNumber) return
    const e = (drilled[l.holeNumber] ||= { m: 0, project: l.project })
    e.m += l.metresDrilled
  })
  const out: Record<string, HolePlan> = {}
  Object.entries(drilled).forEach(([hole, d]) => {
    out[hole] = { plannedDepth: OPEN_HOLE_PLANS[hole] ?? Math.ceil(d.m / 5) * 5, project: d.project }
  })
  // Holes that are planned but not started. These are what the next-month
  // forecast drills into once the current holes reach their planned depth.
  UPCOMING_HOLES.forEach(([hole, project, plannedDepth]) => { out[hole] = { plannedDepth, project } })
  return out
})()

export const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm1', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-03', maintenanceType: 'Preventive', hours: 3, component: 'Engine', action: 'Inspection', cost: 4500 },
  { id: 'm2', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-13', maintenanceType: 'Breakdown', hours: 22, component: 'Hydraulic System', action: 'Replace', cost: 68000 },
  { id: 'm3', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-14', maintenanceType: 'Breakdown', hours: 4, component: 'Hydraulic System', action: 'Repair', cost: 12000 },
  { id: 'm4', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-08-23', maintenanceType: 'Scheduled', hours: 3, component: 'Compressor', action: 'Inspection', cost: 9500 },
  { id: 'm5', rig: 'RIG-002', project: 'Site A - North Field', date: '2026-08-18', maintenanceType: 'Breakdown', hours: 8, component: 'Electrical', action: 'Repair', cost: 41000 },
  { id: 'm6', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-06-04', maintenanceType: 'Breakdown', hours: 24, component: 'Engine', action: 'Replace', cost: 118000 },
  { id: 'm7', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-06-05', maintenanceType: 'Breakdown', hours: 20, component: 'Engine', action: 'Repair', cost: 34000 },
  { id: 'm8', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-06-15', maintenanceType: 'Breakdown', hours: 6, component: 'Electrical', action: 'Repair', cost: 22000 },
  { id: 'm9', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-07-05', maintenanceType: 'Preventive', hours: 3, component: 'Engine', action: 'Inspection', cost: 4500 },
  { id: 'm10', rig: 'RIG-002', project: 'Site A - North Field', date: '2026-07-12', maintenanceType: 'Preventive', hours: 2, component: 'Compressor', action: 'Inspection', cost: 3800 },
  { id: 'm11', rig: 'RIG-001', project: 'Site A - North Field', date: '2026-09-04', maintenanceType: 'Scheduled', hours: 3, component: 'Mud Pump', action: 'Inspection', cost: 7200 },
  { id: 'm12', rig: 'RIG-002', project: 'Site A - North Field', date: '2026-09-05', maintenanceType: 'Breakdown', hours: 9, component: 'Hydraulic System', action: 'Repair', cost: 28500 },
]

/* ==========================================================================
 * STORE
 * ========================================================================== */

/* What has already happened on the seeded projects. Two lines are left unseen
 * by the client, and one rate proposal is waiting for him, so the Client
 * Portal opens with something to read and something to decide. */
export const SEED_PROJECT_EVENTS: ProjectEvent[] = [
  { id: 'pe_1', project: 'Site A - North Field', at: '2026-05-25T10:20', kind: 'created', by: 'contractor', title: 'Project created', detail: 'Site A - North Field · North Field block', seenByOwner: true, seenByContractor: true },
  { id: 'pe_2', project: 'Site A - North Field', at: '2026-05-25T10:24', kind: 'shared', by: 'contractor', title: `Shared with ${OWNER_NAME}`, detail: 'Contract rates, planned holes, rigs and crew are now visible in the Client Portal.', seenByOwner: true, seenByContractor: true },
  { id: 'pe_3', project: 'Site A - North Field', at: '2026-05-25T10:31', kind: 'rates', by: 'contractor', title: 'Contract rates set, from 1 Jun 2026', detail: 'Tender schedule 2.2.1.1c\u2013e', seenByOwner: true, seenByContractor: true },
  { id: 'pe_4', project: 'Site A - North Field', at: '2026-05-28T09:05', kind: 'rig', by: 'contractor', title: 'RIG-001 and RIG-002 assigned', seenByOwner: true, seenByContractor: true },
  { id: 'pe_5', project: 'Site A - North Field', at: '2026-05-28T09:12', kind: 'crew', by: 'contractor', title: 'Crew assigned', detail: '2 supervisors, 4 drillers', seenByOwner: true, seenByContractor: true },
  { id: 'pe_6', project: 'Site A - North Field', at: '2026-09-11T16:40', kind: 'hole', by: 'contractor', title: '4 holes added to the plan', detail: 'DH-005 (200 m), DH-006 (180 m), DH-014 (220 m), DH-015 (240 m)', seenByOwner: false, seenByContractor: true },
  { id: 'pe_7', project: 'Site A - North Field', at: '2026-09-12T11:15', kind: 'rates', by: 'contractor', title: 'New rates proposed, from 1 Oct 2026', detail: 'Diesel price escalation, contract clause 14.2', seenByOwner: false, seenByContractor: true },
  { id: 'pe_8', project: 'Site B - South Ridge', at: '2025-12-15T12:00', kind: 'created', by: 'contractor', title: 'Project created', detail: 'Site B - South Ridge · South Ridge block', seenByContractor: true },
  { id: 'pe_9', project: 'Site C - East Basin', at: '2026-01-20T12:00', kind: 'created', by: 'contractor', title: 'Project created', detail: 'Site C - East Basin · East Basin block', seenByContractor: true },
  { id: 'pe_10', project: 'Site C - East Basin', at: '2026-08-30T17:30', kind: 'status', by: 'contractor', title: 'Project completed', seenByContractor: true },
]
export const SEED_RATE_PROPOSALS: RateProposal[] = [
  {
    id: 'rp_1', project: 'Site A - North Field', proposedAt: '2026-09-12T11:15', status: 'waiting',
    rate: {
      id: 'cr_a_2', project: 'Site A - North Field', effectiveFrom: '2026-10-01', structure: 'flat',
      rateRows: [
        { id: 'r1', holeSize: 'HQ', formation: 'Soft rock', rate: 6200, adjustments: [] },
        { id: 'r2', holeSize: 'HQ', formation: 'Hard rock', rate: 11650, adjustments: [] },
        { id: 'r3', holeSize: 'HQ', formation: 'Very hard rock', rate: 14650, adjustments: [] },
      ],
      standbyPerDay: 19000, mobilisation: 175000, demobilisation: 140000,
      note: 'Diesel price escalation, contract clause 14.2',
    },
  },
]

interface State {
  shiftLogs: ShiftLog[]
  maintenance: MaintenanceLog[]
  ownership: RigOwnership[]
  operating: OperatingRate[]
  clientRates: ClientRate[]
  holeStatus: Record<string, HoleState>
  invoices: Invoice[]
  holePlans: Record<string, HolePlan>
  projects: ProjectRecord[]
  projectEvents: ProjectEvent[]
  rateProposals: RateProposal[]
}

function initial(): State {
  return {
    shiftLogs: SEED_SHIFT_LOGS, maintenance: SEED_MAINTENANCE,
    ownership: SEED_OWNERSHIP, operating: SEED_OPERATING,
    clientRates: SEED_CLIENT_RATES, holeStatus: SEED_HOLE_STATUS, invoices: [],
    holePlans: SEED_HOLE_PLANS,
    projects: SEED_PROJECTS, projectEvents: SEED_PROJECT_EVENTS, rateProposals: SEED_RATE_PROPOSALS,
  }
}

/* A browser that saved its state before a seed plan existed still gets that
 * plan; anything the user set himself wins over the seed. */
function withSeedPlans(s: State): State {
  return { ...s, holePlans: { ...SEED_HOLE_PLANS, ...(s.holePlans ?? {}) } }
}

export const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

/* The system's date with the clock's time: every seeded record sits on the
 * system date, so a change made now has to sit on it too or the change list
 * would jump a month. */
export function nowStamp() {
  const d = new Date()
  return `${TODAY}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
export function listOf(items: string[]) {
  return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
export function crewLine(p: { supervisors: string[]; drillers: string[] }) {
  const n = (k: number, one: string) => `${k} ${one}${k === 1 ? '' : 's'}`
  return `${n(p.supervisors.length, 'supervisor')}, ${n(p.drillers.length, 'driller')}`
}

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
  // Contractor → mine owner
  submitHole: (holeNumber: string) => void
  withdrawHole: (holeNumber: string) => void
  // Mine owner → contractor
  ownerDecideHole: (holeNumber: string, approve: boolean, reason?: string) => void
  ownerReviewInvoice: (id: string, reviews: (LineReview | null)[]) => void
  ownerMarkPaid: (id: string) => void
  setHolePlan: (holeNumber: string, plan: HolePlan | null) => void
  // Projects
  createProject: (p: ProjectRecord, opening?: { rate?: ClientRate; holes?: { id: string; plan: HolePlan }[] }) => void
  updateProject: (id: string, patch: Partial<ProjectRecord>, log?: ProjectLog | ProjectLog[]) => void
  planHoles: (project: string, holes: { id: string; plan: HolePlan | null }[], by: 'contractor' | 'owner', log: ProjectLog) => void
  proposeRates: (project: string, rate: ClientRate) => void
  withdrawProposal: (id: string) => void
  ownerAnswerRates: (id: string, accept: boolean, note?: string) => void
  markProjectSeen: (project: string, who: 'contractor' | 'owner') => void
  resetAll: () => void
}

/* What a change is called in the project's change list. */
export interface ProjectLog { kind: ProjectEventKind; title: string; detail?: string }

const CostingContext = createContext<CtxValue | null>(null)
const KEY = 'xplorix_costing_v2'

/* One store per browser tab. A layout mounts the provider once; a screen that
 * also wraps itself in <CostingProvider> (Finance, Inventory, Projects do, so
 * each still works on its own) joins the one already above it instead of
 * starting a second copy that would drift from the first. */
export function CostingProvider({ children }: { children: ReactNode }) {
  const parent = useContext(CostingContext)
  if (parent) return <>{children}</>
  return <CostingRoot>{children}</CostingRoot>
}

function CostingRoot({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(() => withSeedPlans({ ...initial(), ...JSON.parse(raw) })) } catch {}
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state, loaded])

  /* The contractor and the mine owner are two tabs on the same store. When one
   * tab saves, the browser tells every other tab; taking that value here is
   * what makes an invoice raised in Finance appear in the Client Portal without
   * a refresh — and stops a tab that loaded earlier from saving its older copy
   * back over the newer one. Writing an identical value fires no event, so the
   * two tabs settle instead of echoing. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return
      try { setState(withSeedPlans({ ...initial(), ...JSON.parse(e.newValue) })) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

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

  const addInvoice: CtxValue['addInvoice'] = inv => setState(s => {
    const hs = { ...s.holeStatus }
    inv.holeNumbers.forEach(n => { hs[n] = { status: 'invoiced', invoiceId: inv.id } })
    return { ...s, invoices: [inv, ...s.invoices], holeStatus: hs }
  })
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

  const stamp = () => new Date().toISOString().slice(0, 10)

  const submitHole: CtxValue['submitHole'] = holeNumber => setState(s => ({
    ...s, holeStatus: { ...s.holeStatus, [holeNumber]: { status: 'submitted', submittedAt: stamp() } },
  }))
  const withdrawHole: CtxValue['withdrawHole'] = holeNumber => setState(s => ({
    ...s, holeStatus: { ...s.holeStatus, [holeNumber]: { status: 'closed' } },
  }))
  /* Approve moves the hole on to where the contractor can invoice it. Return
   * sends it back to closed and keeps the owner's reason beside it, so the
   * contractor knows what to fix before sending it again. */
  const ownerDecideHole: CtxValue['ownerDecideHole'] = (holeNumber, approve, reason) => setState(s => {
    const prev = s.holeStatus[holeNumber]
    return {
      ...s, holeStatus: {
        ...s.holeStatus,
        [holeNumber]: approve
          ? { status: 'approved', submittedAt: prev?.submittedAt, decidedAt: stamp() }
          : { status: 'closed', submittedAt: prev?.submittedAt, decidedAt: stamp(), returnReason: reason?.trim() || 'Returned by the mine owner' },
      },
    }
  })
  const ownerReviewInvoice: CtxValue['ownerReviewInvoice'] = (id, reviews) => setState(s => ({
    ...s, invoices: s.invoices.map(i => i.id !== id ? i : {
      ...i, lineReviews: reviews, ownerStatus: ownerStatusFor(i.lines, reviews), reviewedAt: stamp(),
    }),
  }))
  const ownerMarkPaid: CtxValue['ownerMarkPaid'] = id => setState(s => ({
    ...s, invoices: s.invoices.map(i => i.id !== id ? i : {
      ...i, status: 'paid', paidDate: stamp(), paidAmount: i.total - disputedAmount(i) * (1 + i.taxPercent / 100),
    }),
  }))
  const setHolePlan: CtxValue['setHolePlan'] = (holeNumber, plan) => setState(s => {
    const next = { ...s.holePlans }
    if (plan) next[holeNumber] = plan; else delete next[holeNumber]
    return { ...s, holePlans: next }
  })

  // ── projects ─────────────────────────────────────────────────────────────
  /* Every project change goes through one of these, and every one of them
   * writes its own line in the change list. The side that made the change has
   * seen it; the other side has not, and that is its notification. */
  const event = (project: string, by: 'contractor' | 'owner', l: ProjectLog): ProjectEvent => ({
    id: uid('pe'), project, at: nowStamp(), by, kind: l.kind, title: l.title, detail: l.detail,
    seenByContractor: by === 'contractor', seenByOwner: by === 'owner',
  })

  const createProject: CtxValue['createProject'] = (p, opening) => setState(s => {
    const events: ProjectEvent[] = [event(p.name, 'contractor', { kind: 'created', title: 'Project created', detail: `${p.name} · ${p.location}` })]
    if (p.shared) events.push(event(p.name, 'contractor', { kind: 'shared', title: `Shared with ${p.client}`, detail: 'Contract rates, planned holes, rigs and crew are now visible in the Client Portal.' }))
    if (opening?.rate) events.push(event(p.name, 'contractor', { kind: 'rates', title: `Contract rates set, from ${fullDate(opening.rate.effectiveFrom)}`, detail: opening.rate.note }))
    if (p.rigs.length) events.push(event(p.name, 'contractor', { kind: 'rig', title: `${listOf(p.rigs)} assigned` }))
    if (p.supervisors.length + p.drillers.length) events.push(event(p.name, 'contractor', { kind: 'crew', title: 'Crew assigned', detail: crewLine(p) }))
    const plans = { ...s.holePlans }
    const holes = opening?.holes ?? []
    holes.forEach(h => { plans[h.id] = { ...h.plan, project: p.name, by: 'contractor', addedAt: nowStamp() } })
    if (holes.length) events.push(event(p.name, 'contractor', {
      kind: 'hole', title: `${holes.length} ${holes.length === 1 ? 'hole' : 'holes'} added to the plan`,
      detail: holes.map(h => `${h.id} (${h.plan.plannedDepth} m)`).join(', '),
    }))
    return {
      ...s, projects: [...s.projects, p], holePlans: plans,
      clientRates: opening?.rate ? [...s.clientRates, opening.rate] : s.clientRates,
      projectEvents: [...s.projectEvents, ...events],
    }
  })

  const updateProject: CtxValue['updateProject'] = (id, patch, log) => setState(s => {
    const before = s.projects.find(p => p.id === id)
    if (!before) return s
    const logs = log ? (Array.isArray(log) ? log : [log]) : []
    return {
      ...s, projects: s.projects.map(p => p.id === id ? { ...p, ...patch } : p),
      projectEvents: [...s.projectEvents, ...logs.map(l => event(before.name, 'contractor', l))],
    }
  })

  const planHoles: CtxValue['planHoles'] = (project, holes, by, log) => setState(s => {
    const plans = { ...s.holePlans }
    holes.forEach(h => {
      if (h.plan) plans[h.id] = { by, addedAt: nowStamp(), ...plans[h.id], ...h.plan, project }
      else delete plans[h.id]
    })
    return { ...s, holePlans: plans, projectEvents: [...s.projectEvents, event(project, by, log)] }
  })

  const proposeRates: CtxValue['proposeRates'] = (project, rate) => setState(s => {
    const shared = s.projects.find(p => p.name === project)?.shared
    if (!shared) {
      return {
        ...s, clientRates: upsert(s.clientRates, rate),
        projectEvents: [...s.projectEvents, event(project, 'contractor', { kind: 'rates', title: `Contract rates changed, from ${fullDate(rate.effectiveFrom)}`, detail: rate.note })],
      }
    }
    // One proposal at a time: a new one replaces the one still waiting.
    const open = s.rateProposals.map(r => r.project === project && r.status === 'waiting' ? { ...r, status: 'withdrawn' as ProposalStatus } : r)
    return {
      ...s,
      rateProposals: [...open, { id: uid('rp'), project, rate, proposedAt: nowStamp(), status: 'waiting' }],
      projectEvents: [...s.projectEvents, event(project, 'contractor', { kind: 'rates', title: `New rates proposed, from ${fullDate(rate.effectiveFrom)}`, detail: rate.note })],
    }
  })

  const withdrawProposal: CtxValue['withdrawProposal'] = id => setState(s => {
    const r = s.rateProposals.find(x => x.id === id)
    if (!r || r.status !== 'waiting') return s
    return {
      ...s, rateProposals: s.rateProposals.map(x => x.id === id ? { ...x, status: 'withdrawn' } : x),
      projectEvents: [...s.projectEvents, event(r.project, 'contractor', { kind: 'rates', title: 'Rate proposal withdrawn', detail: 'The agreed rates stay in force.' })],
    }
  })

  const ownerAnswerRates: CtxValue['ownerAnswerRates'] = (id, accept, note) => setState(s => {
    const r = s.rateProposals.find(x => x.id === id)
    if (!r || r.status !== 'waiting') return s
    const answered: RateProposal = { ...r, status: accept ? 'accepted' : 'returned', answeredAt: nowStamp(), ownerNote: note?.trim() || undefined }
    return {
      ...s,
      rateProposals: s.rateProposals.map(x => x.id === id ? answered : x),
      clientRates: accept ? upsert(s.clientRates, r.rate) : s.clientRates,
      projectEvents: [...s.projectEvents, event(r.project, 'owner', accept
        ? { kind: 'rates', title: `New rates accepted, in force from ${fullDate(r.rate.effectiveFrom)}`, detail: note?.trim() || undefined }
        : { kind: 'rates', title: 'New rates sent back', detail: note?.trim() || 'No reason given' })],
    }
  })

  const markProjectSeen: CtxValue['markProjectSeen'] = (project, who) => setState(s => {
    const key = who === 'owner' ? 'seenByOwner' : 'seenByContractor'
    if (!s.projectEvents.some(e => e.project === project && !e[key])) return s
    return { ...s, projectEvents: s.projectEvents.map(e => e.project === project && !e[key] ? { ...e, [key]: true } : e) }
  })

  // Plain helper functions elsewhere read the project list through mirrors;
  // bring them into step before anything below renders.
  syncRegistry(state.projects ?? SEED_PROJECTS)

  return (
    <CostingContext.Provider value={{
      state, saveOwnership, saveOperating, saveClientRate, deleteVersion,
      setHoleStatus, addInvoice, updateInvoice, deleteInvoice,
      submitHole, withdrawHole, ownerDecideHole, ownerReviewInvoice, ownerMarkPaid, setHolePlan,
      createProject, updateProject, planHoles, proposeRates, withdrawProposal, ownerAnswerRates, markProjectSeen,
      resetAll: () => setState(initial()),
    }}>{children}</CostingContext.Provider>
  )
}

export function useCosting() {
  const c = useContext(CostingContext)
  if (!c) throw new Error('useCosting must be used inside CostingProvider')
  return c
}

/* Same context, but null instead of a throw when the provider is absent. A
 * screen that only wants the log history to enrich what it shows should
 * degrade rather than break the page. */
export function useCostingOptional() {
  return useContext(CostingContext)
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
export function monthShort(ym: string) {
  const [, m] = ym.split('-').map(Number)
  return MON[m - 1]
}
export function dayLabel(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return `${d} ${MON[m - 1]}`
}
export function fullDate(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return `${d} ${MON[m - 1]} ${y}`
}

export function blankOwnership(rig: string, from: string): RigOwnership {
  return {
    id: uid('own'), rig, effectiveFrom: from,
    basicPrice: 0, gstPercent: 18, transportation: 0, depreciationRatePct: 20,
    emiPerMonth: 0, insurancePerYear: 0, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedUnitsPerMonth: 300,
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
  bg: 'var(--x-bg)', card: 'var(--x-card)', border: 'var(--x-border)',
  orange: 'var(--x-orange)', orangeD: 'var(--x-orange-d)',
  green: 'var(--x-green)', red: 'var(--x-red)', amber: 'var(--x-amber)',
  blue: 'var(--x-blue)', purple: 'var(--x-purple)', teal: 'var(--x-teal)',
  text: 'var(--x-text)', muted: 'var(--x-muted)', faint: 'var(--x-faint)', dim: 'var(--x-dim)',
}

export const LAYER = { operating: C.amber, ownership: C.purple, full: C.orange, revenue: C.blue }

export const iStyle: React.CSSProperties = {
  padding: '6px 10px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 7, color: C.text, fontSize: 12.5, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}
export const derivedStyle: React.CSSProperties = {
  padding: '6px 10px', background: 'rgba(var(--x-ov),0.02)',
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
  return s === 'drilling' ? C.blue : s === 'closed' ? C.amber : s === 'submitted' ? C.teal : s === 'approved' ? C.green : C.purple
}
