'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { poReceivedValue } from './inventory-store'
import type { PurchaseOrder } from './inventory-store'

/* ==========================================================================
 * XPLORIX COSTING STORE
 *
 * One rule runs through this whole file:
 *
 *   Quantities come from the log. Rates come from the calculators.
 *
 * Metres, hours, crew counts and fuel litres are recorded in DailyLog and are
 * never editable from a costing screen. Everything a costing screen lets you
 * type is a rate, a price or an assumption. The moment someone can type
 * "103 metres" into Finance, Finance and Operations start disagreeing.
 *
 * Cost is built in layers, and the UI must keep them visually distinct:
 *
 *   operating cost   fuel + consumables + labour + maintenance + parts
 *   ownership cost   depreciation + EMI + insurance, allocated per day
 *   full cost        operating + ownership          <- CPM divides this
 *
 * Mobilisation and demobilisation are deliberately OUTSIDE that stack. They
 * are dated lump-sum events, usually billed on their own schedule line, and
 * folding them into a per-metre rate makes every hole in the month look
 * wrong. They are reported and billed separately.
 * ========================================================================== */

// ── DAILY LOG ─────────────────────────────────────────────────────────────
// The atomic record. Everything else in this file is a rollup of these:
// day -> hole -> rig-month -> project.

export type DayStatus =
  | 'drilling' | 'standby' | 'breakdown' | 'maintenance'
  | 'mobilisation' | 'demobilisation' | 'idle'

export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  drilling: 'Drilling', standby: 'Standby', breakdown: 'Breakdown',
  maintenance: 'Maintenance', mobilisation: 'Mobilisation',
  demobilisation: 'Demobilisation', idle: 'Idle',
}

export interface CrewShift { shiftNo: 1 | 2; crewCount: number }

export interface DailyLog {
  id: string
  rig: string
  project: string
  date: string            // YYYY-MM-DD
  holeId: string | null   // null = the day's cost belongs to no hole
  status: DayStatus
  drillingHours: number
  metres: number
  standbyHours: number
  downtimeHours: number
  fuelLitres: number      // actually issued, not a rate x days
  shifts: CrewShift[]     // straight from the driller log
  maintenanceCost: number // actual spend booked that day
  note?: string
}

// A rig is "operating" on any day it is on site and available — that is every
// status except idle. Ownership cost lands on operating days, because that is
// what the client's own sheet means by "25 days/month".
export function isOperatingDay(s: DayStatus) { return s !== 'idle' }
export function crewHeads(l: DailyLog) { return l.shifts.reduce((s, x) => s + x.crewCount, 0) }

// ── RIG OWNERSHIP (Calculator A) ──────────────────────────────────────────
// Mirrors block C of the client's spreadsheet, with one deliberate upgrade:
// the loan is stored as principal/rate/tenure rather than a flat monthly
// figure, so the system knows when the EMI ENDS. On the first month after
// tenure the rig gets materially cheaper, and no static sheet can show that.

export type AllocationBasis = 'operatingDay' | 'calendarDay' | 'expectedMetre'
export type CostBasis = 'cash' | 'accounting'

export interface RigOwnership {
  rig: string
  basicPrice: number
  gstPercent: number
  transportation: number
  landedPriceOverride?: number

  depreciationRatePct: number      // per annum, straight line
  depPerMonthOverride?: number

  loanPrincipal: number
  interestRatePct: number          // per annum
  tenureMonths: number
  emiStartDate: string             // YYYY-MM
  emiOverride?: number

  insurancePerYear: number
  otherFixedPerMonth: number

  // cash     = depreciation + EMI. How the contractor thinks. Default.
  // accounting = depreciation only, no EMI, so the same screen answers the
  //              auditor without anyone re-keying it into a second sheet.
  costBasis: CostBasis

  allocationBasis: AllocationBasis
  expectedOperatingDays: number
  expectedMetresPerMonth: number
  ownershipPerDayOverride?: number
}

// ── OPERATING RATES (Calculator B, part 1) ────────────────────────────────
export interface OtherVariableLine {
  id: string
  label: string
  basis: 'perMetre' | 'perDay'
  amount: number
}

export interface OperatingRateCard {
  id: string
  rig: string
  project: string
  month: string            // YYYY-MM
  fuelPricePerLitre: number
  waterPerMetre: number
  fluidsPerMetre: number
  maintenancePerMetre: number   // routine servicing; one-off repairs are logged
  coreBoxesPerMetre: number
  toolingPerMetre: number
  otherVariable: OtherVariableLine[]
}

// ── LABOUR RATES (Calculator B, part 2) ───────────────────────────────────
// Crew COUNT comes from the driller log, per shift. Only the rates live here.
// This is what makes one day cost differently from the next, and it is why
// hole-level costing stops being an average.

export interface LabourRateCard {
  id: string
  rig: string
  project: string
  month: string
  wageBasis: 'perHead' | 'perShift'
  shift1Rate: number
  shift2Rate: number            // night shift, usually carries a premium
  accommodationBasis: 'perHead' | 'flat'
  accommodationRate: number
  crewTransportPerDay: number   // LMV
  supervisionPerDay: number
  paidStatuses: DayStatus[]     // crew is paid on standby; usually not on idle
}

// ── CLIENT RATE (Calculator C) ────────────────────────────────────────────
// A manual formation x depth-band grid. Not additive: every cell is typed in
// straight from the client's rate schedule, because that is the only version
// guaranteed to agree with their measurement book.

export interface DepthBand {
  id: string
  label: string
  fromDepth: number
  toDepth: number | null   // null = open-ended top band
}

export interface ClientRate {
  project: string
  client: string
  contractType: 'meterage' | 'dayrate'
  formations: string[]
  bands: DepthBand[]
  grid: Record<string, Record<string, number>>   // grid[formation][bandId]
  standbyRate: number
  drillingDayRate: number
  standbyDayRate: number
  repairDayRate: number
  mobilisationBillable: number
  demobilisationBillable: number
}

// ── HOLE ──────────────────────────────────────────────────────────────────
// Ordered depth intervals, not an unordered bag of formations. To bill
// formation x band you have to know WHERE in the hole the hard rock was —
// an interval that straddles a band boundary gets split at that boundary.

export interface HoleInterval { fromDepth: number; toDepth: number; formation: string }
export type HoleStatus = 'drilling' | 'closed' | 'approved' | 'invoiced'

export interface Hole {
  id: string
  rig: string
  project: string
  holeNumber: string
  startDate: string
  endDate?: string
  status: HoleStatus
  intervals: HoleInterval[]
  invoiceId?: string
}

export function holeDepth(h: Hole) {
  return h.intervals.reduce((m, i) => Math.max(m, i.toDepth), 0)
}
// Kept so anything still thinking in the old shape keeps working.
export function metersByFormation(h: Hole) {
  const acc: Record<string, number> = {}
  h.intervals.forEach(i => { acc[i.formation] = (acc[i.formation] || 0) + (i.toDepth - i.fromDepth) })
  return Object.entries(acc).map(([formation, meters]) => ({ formation, meters }))
}

// ── MOB / DEMOB ───────────────────────────────────────────────────────────
export interface MobDemobLine { id: string; label: string; amount: number }
export interface MobDemobEvent {
  id: string
  rig: string
  project: string
  type: 'mobilisation' | 'demobilisation'
  date: string
  lines: MobDemobLine[]
  billable: boolean
  billedAmount: number
  invoiceId?: string
}
export function mobDemobCost(e: MobDemobEvent) { return e.lines.reduce((s, l) => s + l.amount, 0) }

// ── INVOICE ───────────────────────────────────────────────────────────────
export interface InvoiceLine { label: string; qty: string; rate: string; amount: number }
export interface Invoice {
  id: string
  number: string
  project: string
  client: string
  date: string
  holeIds: string[]
  mobDemobIds: string[]
  lines: InvoiceLine[]
  subtotal: number
  taxPercent: number
  total: number
  status: 'draft' | 'issued'
}

/* ==========================================================================
 * SEED DATA
 * Rig A1 and A2 on Site A - North Field, August 2026, logged day by day.
 * Ownership figures are the client's own rig: 60L basic + 2L transport,
 * 20%/yr depreciation, 36-month loan.
 * ========================================================================== */

export const SEED_OWNERSHIP: RigOwnership[] = [
  {
    rig: 'Rig A1',
    basicPrice: 6000000, gstPercent: 0, transportation: 200000,
    depreciationRatePct: 20,
    loanPrincipal: 4960000, interestRatePct: 10, tenureMonths: 36, emiStartDate: '2025-04',
    insurancePerYear: 120000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedMetresPerMonth: 125,
  },
  {
    rig: 'Rig A2',
    basicPrice: 5400000, gstPercent: 0, transportation: 180000,
    depreciationRatePct: 20,
    loanPrincipal: 4200000, interestRatePct: 10.5, tenureMonths: 36, emiStartDate: '2024-11',
    insurancePerYear: 108000, otherFixedPerMonth: 0,
    costBasis: 'cash', allocationBasis: 'operatingDay',
    expectedOperatingDays: 25, expectedMetresPerMonth: 125,
  },
]

const opCard = (rig: string, project: string, month: string, fuel: number): OperatingRateCard => ({
  id: `op_${rig}_${month}`, rig, project, month,
  fuelPricePerLitre: fuel,
  waterPerMetre: 500, fluidsPerMetre: 80, maintenancePerMetre: 450,
  coreBoxesPerMetre: 150, toolingPerMetre: 550,
  otherVariable: [],
})

export const SEED_OPERATING_RATES: OperatingRateCard[] = [
  opCard('Rig A1', 'Site A - North Field', '2026-08', 100),
  opCard('Rig A2', 'Site A - North Field', '2026-08', 100),
]

const labCard = (rig: string, project: string, month: string): LabourRateCard => ({
  id: `lab_${rig}_${month}`, rig, project, month,
  wageBasis: 'perHead', shift1Rate: 850, shift2Rate: 950,
  accommodationBasis: 'perHead', accommodationRate: 180,
  crewTransportPerDay: 1250, supervisionPerDay: 1000,
  paidStatuses: ['drilling', 'standby', 'breakdown', 'maintenance', 'mobilisation', 'demobilisation'],
})

export const SEED_LABOUR_RATES: LabourRateCard[] = [
  labCard('Rig A1', 'Site A - North Field', '2026-08'),
  labCard('Rig A2', 'Site A - North Field', '2026-08'),
]

const band = (id: string, label: string, fromDepth: number, toDepth: number | null): DepthBand =>
  ({ id, label, fromDepth, toDepth })

const NMET_BANDS = [band('b1', '0–25 m', 0, 25), band('b2', '25–50 m', 25, 50), band('b3', '50 m+', 50, null)]

export const PROJECT_CLIENTS: Record<string, string> = {
  'Site A - North Field': 'CMPDI',
  'Site B - South Ridge': 'DGML',
  'Site C - East Basin': 'MECL',
}

export const SEED_CLIENT_RATES: Record<string, ClientRate> = {
  'Site A - North Field': {
    project: 'Site A - North Field', client: 'CMPDI', contractType: 'meterage',
    formations: ['Soft', 'Medium', 'Hard'],
    bands: NMET_BANDS,
    grid: {
      Soft: { b1: 9500, b2: 10200, b3: 11000 },
      Medium: { b1: 11500, b2: 12400, b3: 13300 },
      Hard: { b1: 13800, b2: 14900, b3: 16100 },
    },
    standbyRate: 18000, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0,
    mobilisationBillable: 175000, demobilisationBillable: 140000,
  },
  'Site B - South Ridge': {
    project: 'Site B - South Ridge', client: 'DGML', contractType: 'meterage',
    formations: ['Soft', 'Medium', 'Hard'],
    bands: NMET_BANDS.map(b => ({ ...b })),
    grid: {
      Soft: { b1: 8900, b2: 9600, b3: 10300 },
      Medium: { b1: 10800, b2: 11600, b3: 12500 },
      Hard: { b1: 12900, b2: 13900, b3: 15000 },
    },
    standbyRate: 16000, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0,
    mobilisationBillable: 150000, demobilisationBillable: 120000,
  },
  'Site C - East Basin': {
    project: 'Site C - East Basin', client: 'MECL', contractType: 'dayrate',
    formations: [], bands: [], grid: {},
    standbyRate: 0, drillingDayRate: 62000, standbyDayRate: 24000, repairDayRate: 14000,
    mobilisationBillable: 160000, demobilisationBillable: 130000,
  },
}

export const SEED_HOLES: Hole[] = [
  {
    id: 'DH-001', rig: 'Rig A1', project: 'Site A - North Field', holeNumber: 'DH-001',
    startDate: '2026-08-01', endDate: '2026-08-04', status: 'approved',
    intervals: [
      { fromDepth: 0, toDepth: 8, formation: 'Soft' },
      { fromDepth: 8, toDepth: 20, formation: 'Medium' },
    ],
  },
  {
    id: 'DH-002', rig: 'Rig A1', project: 'Site A - North Field', holeNumber: 'DH-002',
    startDate: '2026-08-05', endDate: '2026-08-09', status: 'approved',
    intervals: [
      { fromDepth: 0, toDepth: 6, formation: 'Soft' },
      { fromDepth: 6, toDepth: 18, formation: 'Medium' },
      { fromDepth: 18, toDepth: 25, formation: 'Hard' },
    ],
  },
  {
    // Crosses the 25 m band boundary inside the Medium interval — the case an
    // unordered formation list physically cannot represent.
    id: 'DH-003', rig: 'Rig A1', project: 'Site A - North Field', holeNumber: 'DH-003',
    startDate: '2026-08-10', endDate: '2026-08-17', status: 'closed',
    intervals: [
      { fromDepth: 0, toDepth: 10, formation: 'Soft' },
      { fromDepth: 10, toDepth: 30, formation: 'Medium' },
      { fromDepth: 30, toDepth: 42, formation: 'Hard' },
    ],
  },
  {
    id: 'DH-004', rig: 'Rig A1', project: 'Site A - North Field', holeNumber: 'DH-004',
    startDate: '2026-08-19', status: 'drilling',
    intervals: [
      { fromDepth: 0, toDepth: 9, formation: 'Soft' },
      { fromDepth: 9, toDepth: 28, formation: 'Medium' },
    ],
  },
  {
    id: 'DH-011', rig: 'Rig A2', project: 'Site A - North Field', holeNumber: 'DH-011',
    startDate: '2026-08-01', endDate: '2026-08-13', status: 'closed',
    intervals: [
      { fromDepth: 0, toDepth: 14, formation: 'Soft' },
      { fromDepth: 14, toDepth: 38, formation: 'Medium' },
      { fromDepth: 38, toDepth: 55, formation: 'Hard' },
    ],
  },
  {
    id: 'DH-012', rig: 'Rig A2', project: 'Site A - North Field', holeNumber: 'DH-012',
    startDate: '2026-08-15', status: 'drilling',
    intervals: [
      { fromDepth: 0, toDepth: 12, formation: 'Soft' },
      { fromDepth: 12, toDepth: 33, formation: 'Medium' },
    ],
  },
]

// Compact day spec -> DailyLog. Crew and fuel follow from status and hours so
// the seed stays readable; real logs carry whatever the driller actually wrote.
type DaySpec = [day: number, hole: string, st: DayStatus, drillHrs: number, metres: number, downtime?: number, standby?: number, maint?: number]

const CREW_BY_STATUS: Record<DayStatus, [number, number]> = {
  drilling: [4, 3], standby: [2, 0], breakdown: [3, 0], maintenance: [2, 0],
  mobilisation: [4, 0], demobilisation: [4, 0], idle: [0, 0],
}

function expandDays(rig: string, project: string, ym: string, specs: DaySpec[]): DailyLog[] {
  return specs.map(([day, hole, st, dh, m, dt = 0, sb = 0, mc = 0]) => {
    const [c1, c2] = CREW_BY_STATUS[st]
    const shifts: CrewShift[] = []
    if (c1 > 0) shifts.push({ shiftNo: 1, crewCount: c1 })
    if (c2 > 0) shifts.push({ shiftNo: 2, crewCount: c2 })
    const fuelLitres = st === 'drilling' ? dh * 10 : st === 'idle' ? 0 : 12
    return {
      id: `${rig}_${ym}_${day}`.replace(/\s+/g, ''),
      rig, project,
      date: `${ym}-${String(day).padStart(2, '0')}`,
      holeId: hole || null,
      status: st,
      drillingHours: dh, metres: m,
      standbyHours: sb, downtimeHours: dt,
      fuelLitres, shifts, maintenanceCost: mc,
    }
  })
}

export const SEED_DAILY_LOGS: DailyLog[] = [
  ...expandDays('Rig A1', 'Site A - North Field', '2026-08', [
    [1, 'DH-001', 'drilling', 10, 5],
    [2, 'DH-001', 'drilling', 10, 5],
    [3, 'DH-001', 'drilling', 8, 4, 3, 0, 4500],
    [4, 'DH-001', 'drilling', 10, 6],
    [5, 'DH-002', 'drilling', 10, 5],
    [6, 'DH-002', 'drilling', 10, 5],
    [7, 'DH-002', 'drilling', 10, 5],
    [8, 'DH-002', 'drilling', 10, 5],
    [9, 'DH-002', 'drilling', 10, 5],
    [10, 'DH-003', 'drilling', 10, 6],
    [11, 'DH-003', 'drilling', 10, 6],
    [12, 'DH-003', 'drilling', 10, 5, 2],
    [13, 'DH-003', 'drilling', 10, 6],
    // The day that makes the whole module worth building: full ownership and
    // crew cost, zero metres. CPM for the day is undefined, not zero.
    [14, 'DH-003', 'breakdown', 0, 0, 20, 0, 68000],
    [15, 'DH-003', 'drilling', 9, 5, 2],
    [16, 'DH-003', 'drilling', 10, 7],
    [17, 'DH-003', 'drilling', 10, 7],
    [18, '', 'standby', 0, 0, 0, 10],
    [19, 'DH-004', 'drilling', 10, 4, 4],
    [20, 'DH-004', 'drilling', 10, 5],
    [21, 'DH-004', 'drilling', 10, 4, 3, 0, 12000],
    [22, 'DH-004', 'drilling', 10, 5],
    [23, 'DH-004', 'drilling', 10, 4, 5],
    [24, 'DH-004', 'drilling', 10, 3],
    [25, 'DH-004', 'drilling', 10, 3],
    [26, '', 'idle', 0, 0],
    [27, '', 'maintenance', 0, 0, 8, 0, 35000],
    [28, '', 'idle', 0, 0],
  ]),
  ...expandDays('Rig A2', 'Site A - North Field', '2026-08', [
    [1, 'DH-011', 'drilling', 10, 5],
    [2, 'DH-011', 'drilling', 10, 5],
    [3, 'DH-011', 'drilling', 10, 4, 2],
    [4, 'DH-011', 'drilling', 10, 5],
    [5, 'DH-011', 'drilling', 10, 5],
    [6, 'DH-011', 'drilling', 10, 4, 3],
    [7, 'DH-011', 'drilling', 10, 5],
    [8, 'DH-011', 'standby', 0, 0, 0, 10],
    [9, 'DH-011', 'drilling', 10, 4],
    [10, 'DH-011', 'drilling', 10, 5],
    [11, 'DH-011', 'drilling', 10, 4, 4, 0, 8500],
    [12, 'DH-011', 'drilling', 10, 5],
    [13, 'DH-011', 'drilling', 10, 4],
    [14, '', 'idle', 0, 0],
    [15, 'DH-012', 'drilling', 10, 4],
    [16, 'DH-012', 'drilling', 10, 4],
    [17, 'DH-012', 'drilling', 10, 3, 6],
    [18, 'DH-012', 'drilling', 10, 4],
    [19, 'DH-012', 'drilling', 10, 4],
    [20, 'DH-012', 'breakdown', 0, 0, 22, 0, 41000],
    [21, 'DH-012', 'drilling', 10, 3],
    [22, 'DH-012', 'drilling', 10, 4],
    [23, 'DH-012', 'drilling', 10, 3],
    [24, 'DH-012', 'drilling', 10, 4],
  ]),
]

export const SEED_MOBDEMOB: MobDemobEvent[] = [
  {
    id: 'mob1', rig: 'Rig A1', project: 'Site A - North Field', type: 'mobilisation',
    date: '2026-07-29', billable: true, billedAmount: 175000,
    lines: [
      { id: 'l1', label: 'Rig transport (low-bed, 340 km)', amount: 82000 },
      { id: 'l2', label: 'Support vehicle & compressor move', amount: 24000 },
      { id: 'l3', label: 'Crew transport to site', amount: 18000 },
      { id: 'l4', label: 'Site preparation & levelling', amount: 21000 },
      { id: 'l5', label: 'Permits and statutory clearance', amount: 9000 },
    ],
  },
  {
    id: 'mob2', rig: 'Rig A2', project: 'Site A - North Field', type: 'mobilisation',
    date: '2026-07-30', billable: true, billedAmount: 175000,
    lines: [
      { id: 'l1', label: 'Rig transport (low-bed, 340 km)', amount: 76000 },
      { id: 'l2', label: 'Crew transport to site', amount: 16000 },
      { id: 'l3', label: 'Site preparation & levelling', amount: 19000 },
    ],
  },
]

/* ==========================================================================
 * CALCULATION ENGINE
 * ========================================================================== */

export function daysInMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
export function monthOf(date: string) { return date.slice(0, 7) }

export function computeEMI(principal: number, annualRatePct: number, tenureMonths: number) {
  if (principal <= 0 || tenureMonths <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / tenureMonths
  const f = Math.pow(1 + r, tenureMonths)
  return (principal * r * f) / (f - 1)
}

export function emiMonthsElapsed(o: RigOwnership, ym: string) {
  const [sy, sm] = o.emiStartDate.split('-').map(Number)
  const [y, m] = ym.split('-').map(Number)
  return (y - sy) * 12 + (m - sm)
}
export function emiActiveFor(o: RigOwnership, ym: string) {
  const e = emiMonthsElapsed(o, ym)
  return e >= 0 && e < o.tenureMonths
}

export interface OwnershipBreakdown {
  landedPrice: number
  depPerYear: number
  depPerMonth: number
  emiFull: number          // the EMI itself, whether or not it applies this month
  emi: number              // what actually lands on this month
  emiActive: boolean
  emiMonthsLeft: number
  insurancePerMonth: number
  otherFixedPerMonth: number
  perMonth: number
  perDay: number
  perMetre: number
  basisLabel: string
}

export function ownershipBreakdown(o: RigOwnership, ym: string): OwnershipBreakdown {
  const landedPrice = o.landedPriceOverride ??
    (o.basicPrice + o.basicPrice * (o.gstPercent / 100) + o.transportation)

  const depPerYear = landedPrice * (o.depreciationRatePct / 100)
  const depPerMonth = o.depPerMonthOverride ?? depPerYear / 12

  const emiFull = o.emiOverride ?? computeEMI(o.loanPrincipal, o.interestRatePct, o.tenureMonths)
  const active = emiActiveFor(o, ym)
  // Accounting basis drops the EMI: depreciation and loan repayment write off
  // the same capital, so counting both is a cash view, not an accounting one.
  const emi = o.costBasis === 'accounting' ? 0 : (active ? emiFull : 0)
  const emiMonthsLeft = Math.max(0, o.tenureMonths - Math.max(0, emiMonthsElapsed(o, ym)))

  const insurancePerMonth = o.insurancePerYear / 12
  const perMonth = depPerMonth + emi + insurancePerMonth + o.otherFixedPerMonth

  let perDay = 0
  let basisLabel = ''
  if (o.allocationBasis === 'operatingDay') {
    perDay = o.expectedOperatingDays > 0 ? perMonth / o.expectedOperatingDays : 0
    basisLabel = `per operating day (÷ ${o.expectedOperatingDays})`
  } else if (o.allocationBasis === 'calendarDay') {
    const d = daysInMonth(ym)
    perDay = perMonth / d
    basisLabel = `per calendar day (÷ ${d})`
  } else {
    perDay = 0
    basisLabel = `per expected metre (÷ ${o.expectedMetresPerMonth} m)`
  }
  if (o.ownershipPerDayOverride != null && o.allocationBasis !== 'expectedMetre') {
    perDay = o.ownershipPerDayOverride
  }
  const perMetre = o.expectedMetresPerMonth > 0 ? perMonth / o.expectedMetresPerMonth : 0

  return {
    landedPrice, depPerYear, depPerMonth, emiFull, emi, emiActive: active, emiMonthsLeft,
    insurancePerMonth, otherFixedPerMonth: o.otherFixedPerMonth,
    perMonth, perDay, perMetre, basisLabel,
  }
}

export function ownershipForDay(log: DailyLog, ob: OwnershipBreakdown, o: RigOwnership) {
  if (o.allocationBasis === 'expectedMetre') return log.metres * ob.perMetre
  if (o.allocationBasis === 'calendarDay') return ob.perDay
  return isOperatingDay(log.status) ? ob.perDay : 0
}

export interface LabourBreakdown {
  wages: number; accommodation: number; transport: number; supervision: number
  heads: number; shift1: number; shift2: number; total: number; paid: boolean
}
export function labourForDay(log: DailyLog, c: LabourRateCard): LabourBreakdown {
  const shift1 = log.shifts.find(s => s.shiftNo === 1)?.crewCount ?? 0
  const shift2 = log.shifts.find(s => s.shiftNo === 2)?.crewCount ?? 0
  const heads = shift1 + shift2
  const paid = c.paidStatuses.includes(log.status) && heads > 0
  if (!paid) return { wages: 0, accommodation: 0, transport: 0, supervision: 0, heads, shift1, shift2, total: 0, paid: false }

  const wages = c.wageBasis === 'perHead'
    ? shift1 * c.shift1Rate + shift2 * c.shift2Rate
    : (shift1 > 0 ? c.shift1Rate : 0) + (shift2 > 0 ? c.shift2Rate : 0)
  const accommodation = c.accommodationBasis === 'perHead' ? heads * c.accommodationRate : c.accommodationRate
  const transport = c.crewTransportPerDay
  const supervision = c.supervisionPerDay
  return { wages, accommodation, transport, supervision, heads, shift1, shift2, total: wages + accommodation + transport + supervision, paid: true }
}

export interface DayCost {
  log: DailyLog
  fuel: number
  consumables: number
  labour: LabourBreakdown
  maintenance: number
  parts: number
  otherVariable: number
  operating: number
  ownership: number
  total: number
  cpm: number | null       // null, never 0, when no metres were drilled
}

export function dayCost(
  log: DailyLog,
  op: OperatingRateCard,
  lab: LabourRateCard,
  ob: OwnershipBreakdown,
  own: RigOwnership,
  partsPerMetre: number,
): DayCost {
  const fuel = log.fuelLitres * op.fuelPricePerLitre
  const consumables = log.metres * (op.waterPerMetre + op.fluidsPerMetre + op.maintenancePerMetre + op.coreBoxesPerMetre + op.toolingPerMetre)
  const otherVariable = op.otherVariable.reduce((s, o) =>
    s + (o.basis === 'perMetre' ? o.amount * log.metres : (isOperatingDay(log.status) ? o.amount : 0)), 0)
  const labour = labourForDay(log, lab)
  const maintenance = log.maintenanceCost
  const parts = log.metres * partsPerMetre
  const operating = fuel + consumables + otherVariable + labour.total + maintenance + parts
  const ownership = ownershipForDay(log, ob, own)
  const total = operating + ownership
  return {
    log, fuel, consumables, labour, maintenance, parts, otherVariable,
    operating, ownership, total,
    cpm: log.metres > 0 ? total / log.metres : null,
  }
}

// Parts come from Inventory purchase orders for the rig+project. They arrive as
// a monthly lump, so they are spread across the month's metres rather than
// dumped on whichever day the PO happened to be received.
export function partsPerMetreFor(rig: string, project: string, logs: DailyLog[], pos: PurchaseOrder[]) {
  const total = pos.filter(po => po.rig === rig && po.project === project).reduce((s, po) => s + poReceivedValue(po), 0)
  const metres = logs.reduce((s, l) => s + l.metres, 0)
  return metres > 0 ? total / metres : 0
}

export interface CostRollup {
  days: number; operatingDays: number
  drillingDays: number; standbyDays: number; breakdownDays: number; idleDays: number
  metres: number; drillingHours: number; downtimeHours: number; standbyHours: number
  fuelLitres: number
  fuel: number; consumables: number; labour: number; maintenance: number; parts: number; otherVariable: number
  operating: number; ownership: number; total: number
  cpm: number; operatingCPM: number; ownershipCPM: number
}

export function rollup(costs: DayCost[]): CostRollup {
  const z: CostRollup = {
    days: 0, operatingDays: 0, drillingDays: 0, standbyDays: 0, breakdownDays: 0, idleDays: 0,
    metres: 0, drillingHours: 0, downtimeHours: 0, standbyHours: 0, fuelLitres: 0,
    fuel: 0, consumables: 0, labour: 0, maintenance: 0, parts: 0, otherVariable: 0,
    operating: 0, ownership: 0, total: 0, cpm: 0, operatingCPM: 0, ownershipCPM: 0,
  }
  costs.forEach(c => {
    z.days++
    if (isOperatingDay(c.log.status)) z.operatingDays++
    if (c.log.status === 'drilling') z.drillingDays++
    if (c.log.status === 'standby') z.standbyDays++
    if (c.log.status === 'breakdown' || c.log.status === 'maintenance') z.breakdownDays++
    if (c.log.status === 'idle') z.idleDays++
    z.metres += c.log.metres
    z.drillingHours += c.log.drillingHours
    z.downtimeHours += c.log.downtimeHours
    z.standbyHours += c.log.standbyHours
    z.fuelLitres += c.log.fuelLitres
    z.fuel += c.fuel; z.consumables += c.consumables; z.labour += c.labour.total
    z.maintenance += c.maintenance; z.parts += c.parts; z.otherVariable += c.otherVariable
    z.operating += c.operating; z.ownership += c.ownership; z.total += c.total
  })
  if (z.metres > 0) {
    z.cpm = z.total / z.metres
    z.operatingCPM = z.operating / z.metres
    z.ownershipCPM = z.ownership / z.metres
  }
  return z
}

// Running month-to-date CPM alongside each day. Daily CPM on its own is
// misleading — one metre at 20,000 spend reads as 20,000/m, which is
// arithmetically right and operationally meaningless.
export function withCumulative(costs: DayCost[]) {
  let m = 0, t = 0
  return costs.map(c => {
    m += c.log.metres; t += c.total
    return { ...c, mtdMetres: m, mtdTotal: t, mtdCPM: m > 0 ? t / m : null }
  })
}
export type DayCostWithMTD = ReturnType<typeof withCumulative>[number]

// ── HOLE COSTING ──────────────────────────────────────────────────────────
export interface HoleCosting {
  hole: Hole
  costs: DayCost[]
  roll: CostRollup
  depth: number
  loggedMetres: number
  // True when the hole's recorded depth and the metres logged against it
  // disagree. Surfaced rather than silently reconciled.
  metresMismatch: boolean
}

export function holeCosting(hole: Hole, allCosts: DayCost[]): HoleCosting {
  const costs = allCosts.filter(c => c.log.holeId === hole.id)
  const roll = rollup(costs)
  const depth = holeDepth(hole)
  return {
    hole, costs, roll, depth, loggedMetres: roll.metres,
    metresMismatch: Math.abs(depth - roll.metres) > 0.01,
  }
}

// ── BILLING ───────────────────────────────────────────────────────────────
export interface BillingLine {
  formation: string; bandId: string; bandLabel: string
  fromDepth: number; toDepth: number
  metres: number; rate: number; amount: number
}
export interface HoleBilling {
  lines: BillingLine[]
  total: number
  metres: number
  unmatched: string[]
  effectiveRate: number
}

// Each interval is split at every band boundary it crosses, then priced from
// the formation x band grid. A rate the grid has no cell for contributes zero
// and is reported back so the UI can flag it — never silently guessed.
export function holeBilling(hole: Hole, rate: ClientRate | undefined): HoleBilling {
  const empty: HoleBilling = { lines: [], total: 0, metres: 0, unmatched: [], effectiveRate: 0 }
  if (!rate || rate.contractType !== 'meterage') return empty

  const lines: BillingLine[] = []
  const unmatched = new Set<string>()

  hole.intervals.forEach(iv => {
    rate.bands.forEach(b => {
      const bTo = b.toDepth ?? Infinity
      const lo = Math.max(iv.fromDepth, b.fromDepth)
      const hi = Math.min(iv.toDepth, bTo)
      const metres = hi - lo
      if (metres <= 0) return
      const cell = rate.grid[iv.formation]?.[b.id]
      if (cell == null) unmatched.add(`${iv.formation} × ${b.label}`)
      const r = cell ?? 0
      lines.push({
        formation: iv.formation, bandId: b.id, bandLabel: b.label,
        fromDepth: lo, toDepth: hi, metres, rate: r, amount: metres * r,
      })
    })
  })

  const total = lines.reduce((s, l) => s + l.amount, 0)
  const metres = lines.reduce((s, l) => s + l.metres, 0)
  return { lines, total, metres, unmatched: [...unmatched], effectiveRate: metres > 0 ? total / metres : 0 }
}

export interface HoleCommercial {
  costing: HoleCosting
  billing: HoleBilling
  revenue: number
  cost: number
  profit: number
  marginPct: number
  costCPM: number
  revenueCPM: number
  marginCPM: number
}

export function holeCommercial(hc: HoleCosting, rate: ClientRate | undefined): HoleCommercial {
  const billing = holeBilling(hc.hole, rate)
  const revenue = billing.total
  const cost = hc.roll.total
  const metres = hc.roll.metres || hc.depth
  return {
    costing: hc, billing, revenue, cost,
    profit: revenue - cost,
    marginPct: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
    costCPM: metres > 0 ? cost / metres : 0,
    revenueCPM: billing.effectiveRate,
    marginCPM: metres > 0 ? (revenue - cost) / metres : 0,
  }
}

export function isBillable(h: Hole) { return h.status === 'approved' && !h.invoiceId }

/* ==========================================================================
 * STORE
 * ========================================================================== */

interface State {
  dailyLogs: DailyLog[]
  ownership: RigOwnership[]
  operatingRates: OperatingRateCard[]
  labourRates: LabourRateCard[]
  clientRates: Record<string, ClientRate>
  holes: Hole[]
  mobDemob: MobDemobEvent[]
  invoices: Invoice[]
}

function initial(): State {
  return {
    dailyLogs: SEED_DAILY_LOGS,
    ownership: SEED_OWNERSHIP,
    operatingRates: SEED_OPERATING_RATES,
    labourRates: SEED_LABOUR_RATES,
    clientRates: SEED_CLIENT_RATES,
    holes: SEED_HOLES,
    mobDemob: SEED_MOBDEMOB,
    invoices: [],
  }
}

export const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  setOwnership: (o: RigOwnership) => void
  setOperatingRate: (r: OperatingRateCard) => void
  setLabourRate: (r: LabourRateCard) => void
  setClientRate: (project: string, r: ClientRate) => void
  setHole: (h: Omit<Hole, 'id'> & { id?: string }) => void
  deleteHole: (id: string) => void
  setHoleStatus: (id: string, status: HoleStatus) => void
  setMobDemob: (e: Omit<MobDemobEvent, 'id'> & { id?: string }) => void
  deleteMobDemob: (id: string) => void
  addInvoice: (inv: Invoice) => void
  deleteInvoice: (id: string) => void
  resetAll: () => void
}

const CostingContext = createContext<Ctx | null>(null)
const KEY = 'xplorix_costing_v1'

export function CostingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)

  // Merge over initial() rather than replacing it, so a saved state from an
  // earlier build that is missing a key doesn't crash on first render.
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(s => ({ ...initial(), ...JSON.parse(raw) })) } catch {}
    setLoaded(true)
  }, [])
  useEffect(() => {
    if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state, loaded])

  const setOwnership: Ctx['setOwnership'] = o => setState(s => ({
    ...s, ownership: s.ownership.some(x => x.rig === o.rig)
      ? s.ownership.map(x => x.rig === o.rig ? o : x) : [...s.ownership, o],
  }))

  const setOperatingRate: Ctx['setOperatingRate'] = r => setState(s => ({
    ...s, operatingRates: s.operatingRates.some(x => x.id === r.id)
      ? s.operatingRates.map(x => x.id === r.id ? r : x) : [...s.operatingRates, r],
  }))

  const setLabourRate: Ctx['setLabourRate'] = r => setState(s => ({
    ...s, labourRates: s.labourRates.some(x => x.id === r.id)
      ? s.labourRates.map(x => x.id === r.id ? r : x) : [...s.labourRates, r],
  }))

  const setClientRate: Ctx['setClientRate'] = (project, r) =>
    setState(s => ({ ...s, clientRates: { ...s.clientRates, [project]: r } }))

  const setHole: Ctx['setHole'] = h => setState(s => {
    if (h.id && s.holes.some(x => x.id === h.id)) {
      return { ...s, holes: s.holes.map(x => x.id === h.id ? ({ ...h, id: h.id } as Hole) : x) }
    }
    return { ...s, holes: [{ ...h, id: h.id || uid('hole') } as Hole, ...s.holes] }
  })
  const deleteHole: Ctx['deleteHole'] = id => setState(s => ({ ...s, holes: s.holes.filter(h => h.id !== id) }))
  const setHoleStatus: Ctx['setHoleStatus'] = (id, status) =>
    setState(s => ({ ...s, holes: s.holes.map(h => h.id === id ? { ...h, status } : h) }))

  const setMobDemob: Ctx['setMobDemob'] = e => setState(s => {
    if (e.id && s.mobDemob.some(x => x.id === e.id)) {
      return { ...s, mobDemob: s.mobDemob.map(x => x.id === e.id ? ({ ...e, id: e.id } as MobDemobEvent) : x) }
    }
    return { ...s, mobDemob: [{ ...e, id: e.id || uid('md') } as MobDemobEvent, ...s.mobDemob] }
  })
  const deleteMobDemob: Ctx['deleteMobDemob'] = id =>
    setState(s => ({ ...s, mobDemob: s.mobDemob.filter(e => e.id !== id) }))

  // Invoicing stamps the holes it consumed, so a hole can never appear on two
  // invoices. Deleting an invoice releases them back to Ready to bill.
  const addInvoice: Ctx['addInvoice'] = inv => setState(s => ({
    ...s,
    invoices: [inv, ...s.invoices],
    holes: s.holes.map(h => inv.holeIds.includes(h.id) ? { ...h, status: 'invoiced' as HoleStatus, invoiceId: inv.id } : h),
    mobDemob: s.mobDemob.map(e => inv.mobDemobIds.includes(e.id) ? { ...e, invoiceId: inv.id } : e),
  }))

  const deleteInvoice: Ctx['deleteInvoice'] = id => setState(s => ({
    ...s,
    invoices: s.invoices.filter(i => i.id !== id),
    holes: s.holes.map(h => h.invoiceId === id ? { ...h, status: 'approved' as HoleStatus, invoiceId: undefined } : h),
    mobDemob: s.mobDemob.map(e => e.invoiceId === id ? { ...e, invoiceId: undefined } : e),
  }))

  const resetAll = () => setState(initial())

  return (
    <CostingContext.Provider value={{
      state, setOwnership, setOperatingRate, setLabourRate, setClientRate,
      setHole, deleteHole, setHoleStatus, setMobDemob, deleteMobDemob,
      addInvoice, deleteInvoice, resetAll,
    }}>{children}</CostingContext.Provider>
  )
}

export function useCosting() {
  const c = useContext(CostingContext)
  if (!c) throw new Error('useCosting must be used inside CostingProvider')
  return c
}

/* ── Selectors ──────────────────────────────────────────────────────────── */

export function logsFor(logs: DailyLog[], rig: string, project: string, month: string) {
  return logs
    .filter(l => l.rig === rig && l.project === project && monthOf(l.date) === month)
    .sort((a, b) => a.date.localeCompare(b.date))
}
export function monthsFor(logs: DailyLog[], rig: string, project: string) {
  return [...new Set(logs.filter(l => l.rig === rig && l.project === project).map(l => monthOf(l.date)))].sort()
}
export function rigsFor(logs: DailyLog[], project: string) {
  return [...new Set(logs.filter(l => l.project === project).map(l => l.rig))].sort()
}
export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]} ${y}`
}
export function dayLabel(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]} ${d}`
}

// Fallback cards so a rig with no configured rates still costs out at zero
// instead of throwing. The UI prompts to configure rather than hiding this.
export function defaultOperatingCard(rig: string, project: string, month: string): OperatingRateCard {
  return { id: `op_${rig}_${project}_${month}`.replace(/\s+/g, ''), rig, project, month,
    fuelPricePerLitre: 100, waterPerMetre: 0, fluidsPerMetre: 0, maintenancePerMetre: 0,
    coreBoxesPerMetre: 0, toolingPerMetre: 0, otherVariable: [] }
}
export function defaultLabourCard(rig: string, project: string, month: string): LabourRateCard {
  return { id: `lab_${rig}_${project}_${month}`.replace(/\s+/g, ''), rig, project, month,
    wageBasis: 'perHead', shift1Rate: 0, shift2Rate: 0,
    accommodationBasis: 'perHead', accommodationRate: 0,
    crewTransportPerDay: 0, supervisionPerDay: 0,
    paidStatuses: ['drilling', 'standby', 'breakdown', 'maintenance'] }
}
export function defaultOwnership(rig: string): RigOwnership {
  return { rig, basicPrice: 0, gstPercent: 18, transportation: 0, depreciationRatePct: 20,
    loanPrincipal: 0, interestRatePct: 10, tenureMonths: 36, emiStartDate: '2026-01',
    insurancePerYear: 0, otherFixedPerMonth: 0, costBasis: 'cash',
    allocationBasis: 'operatingDay', expectedOperatingDays: 25, expectedMetresPerMonth: 125 }
}
export function defaultClientRate(project: string): ClientRate {
  return {
    project, client: PROJECT_CLIENTS[project] || '', contractType: 'meterage',
    formations: ['Soft', 'Medium', 'Hard'],
    bands: [band('b1', '0–25 m', 0, 25), band('b2', '25–50 m', 25, 50), band('b3', '50 m+', 50, null)],
    grid: {}, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0,
    mobilisationBillable: 0, demobilisationBillable: 0,
  }
}
export { band as makeBand }

/* ── Shared UI tokens ───────────────────────────────────────────────────── */

export const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B', dim: '#334155',
}

// The three cost layers get a fixed colour each, used everywhere. Operating is
// amber, ownership purple, full cost orange — so a number's layer is readable
// before you read its label.
export const LAYER = { operating: C.amber, ownership: C.purple, full: C.orange, revenue: C.blue }

export const iStyle: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13, outline: 'none',
  fontFamily: 'inherit', width: '100%',
}
export const selStyle: React.CSSProperties = { ...iStyle, cursor: 'pointer' }
export const derivedStyle: React.CSSProperties = {
  padding: '9px 12px', background: 'rgba(255,255,255,0.02)',
  border: `1px dashed ${C.border}`, borderRadius: 8, color: C.text,
  fontSize: 13, fontFamily: 'ui-monospace, monospace', width: '100%',
}

export function money(n: number) {
  const neg = n < 0
  return `${neg ? '−' : ''}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`
}
export function moneyL(n: number) {
  const a = Math.abs(n)
  if (a >= 10000000) return `${n < 0 ? '−' : ''}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${n < 0 ? '−' : ''}₹${(a / 100000).toFixed(1)}L`
  return money(n)
}
export function rate(n: number | null) { return n == null ? '—' : `₹${Math.round(n).toLocaleString('en-IN')}/m` }
export function pct(n: number) { return `${n.toFixed(1)}%` }

// CPM is only meaningful against what the client pays for that metre, so it is
// coloured by margin, never by an absolute threshold.
export function cpmColorVsRate(cpm: number, clientRate: number) {
  if (!clientRate) return C.muted
  const m = (clientRate - cpm) / clientRate
  return m >= 0.3 ? C.green : m >= 0.12 ? C.amber : C.red
}
export function marginColor(m: number) { return m >= 0 ? C.green : C.red }
export function statusColor(s: DayStatus) {
  return s === 'drilling' ? C.green : s === 'standby' ? C.amber
    : s === 'breakdown' ? C.red : s === 'maintenance' ? C.purple
    : s === 'idle' ? C.dim : C.blue
}
export function holeStatusColor(s: HoleStatus) {
  return s === 'drilling' ? C.blue : s === 'closed' ? C.amber
    : s === 'approved' ? C.green : C.purple
}
