'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { TODAY } from './inventory-store'
import {
  BREAKDOWN_REASONS, chargeShift, versionOn, isOwnerLinked, money, perUnit, useCosting,
  type ShiftLog, type HoleStatus, type Invoice, type LineReview, type ClientRate,
} from './costing-store'

/* ==========================================================================
 * XPLORIX CLIENT PORTAL — what the mine owner reads
 *
 * Two kinds of data sit behind the portal and this file keeps them apart.
 *
 *   LIVE   Hole approvals and invoices for the contractor on this XPLORIX
 *          account. They are read straight out of the costing store — the same
 *          shifts, the same rates, the same invoice the contractor raised in
 *          Finance — so the two sides cannot be looking at different numbers.
 *
 *   DEMO   The programme picture: three contractors, plan against actual,
 *          downtime, scorecard, billing check. Fixed sample data that matches
 *          the XPLORIX Platform Overview document. No real customer data.
 *
 * One privacy rule runs through every selector here: the owner sees what he
 * pays for and what happened on the rig. Fuel, crew cost, parts, inventory,
 * rig ownership cost and margin never leave the contractor's side, so nothing
 * in this file reads them.
 * ========================================================================== */

export const PORTAL_TODAY = TODAY
export const PROGRAMME = {
  name: 'North Block programme',
  plannedMetres: 7000,
  planPerWeek: 500,
  weeks: 14,
  currentWeek: 12,
  weekOneStart: '2026-06-22',
  budget: 34000000,          // ₹3.40 Cr, before tax
  contractRecovery: 95,      // % — the contract minimum
  maxOffPlan: 5,             // m — flagged beyond this
  ropTarget: 6.5,            // m/hr
}

// ── CONTRACTORS ───────────────────────────────────────────────────────────

export type ContractorId = 'A' | 'B' | 'C'
export const CONTRACTOR_IDS: ContractorId[] = ['A', 'B', 'C']

/* Colours validated as a categorical set on the dark card surface (lightness
 * band, colour-blind separation, contrast). Used for small identity marks
 * only — text always stays in the text colours. */
export const CONTRACTORS: Record<ContractorId, { id: ContractorId; name: string; rig: string; color: string }> = {
  A: { id: 'A', name: 'Contractor A', rig: 'Rig A-1', color: '#3B82F6' },
  B: { id: 'B', name: 'Contractor B', rig: 'Rig B-1', color: '#0D9488' },
  C: { id: 'C', name: 'Contractor C', rig: 'Rig C-1', color: '#B265E0' },
}
/* The contractor whose own XPLORIX account feeds the live approvals and
 * invoices. In the demo that is Contractor A. */
export const LIVE_CONTRACTOR: ContractorId = 'A'

// ── PROGRAMME: PLAN, ACTUAL, FORECAST ─────────────────────────────────────

const ACTUAL_CUM = [420, 880, 1300, 1650, 2150, 2600, 2950, 3400, 3850, 4200, 4650, 5100]

export interface WeekPoint {
  week: string; plan: number | null; actual: number | null
  forecast: number | null; high: number | null; low: number | null
}
/* Plan is 500 m a week to 7,000 m at week 14. Actual runs to week 12. The
 * forecast carries on from the last twelve weeks' real rate and lands in
 * week 17; the range is what a better and a worse run of weeks would give. */
export const PROGRAMME_WEEKS: WeekPoint[] = Array.from({ length: 18 }, (_, i) => {
  const w = i + 1
  const now = PROGRAMME.currentWeek
  const done = ACTUAL_CUM[now - 1]
  const ahead = w - now
  const proj = (perWeek: number) => (w < now ? null : Math.min(PROGRAMME.plannedMetres, Math.round(done + ahead * perWeek)))
  return {
    week: `W${w}`,
    plan: Math.min(PROGRAMME.plannedMetres, w * PROGRAMME.planPerWeek),
    actual: w <= now ? ACTUAL_CUM[w - 1] : null,
    forecast: proj(380),
    high: proj(475),
    low: proj(317),
  }
})
export const PROGRAMME_NOW = {
  actual: ACTUAL_CUM[PROGRAMME.currentWeek - 1],
  plan: PROGRAMME.currentWeek * PROGRAMME.planPerWeek,
  get behindPct() { return Math.round(((this.plan - this.actual) / this.plan) * 100) },
  forecastFinishWeek: 17,
  weeksLate: 3,
}

export const ROP_BY_WEEK = [6.8, 7.1, 6.9, 6.2, 5.8, 5.5, 6.0, 6.4, 6.6, 6.3, 6.4, 6.2]
  .map((rop, i) => ({ week: `W${i + 1}`, rop, target: PROGRAMME.ropTarget }))

// ── DOWNTIME (last month, hours) ──────────────────────────────────────────

export type Side = 'contractor' | 'owner'
export const DOWNTIME_REASONS: { reason: string; side: Side; hours: Record<ContractorId, number> }[] = [
  { reason: 'Mechanical', side: 'contractor', hours: { A: 26, B: 14, C: 35 } },
  { reason: 'Waiting for parts', side: 'contractor', hours: { A: 20, B: 8, C: 30 } },
  { reason: 'Rod trips', side: 'contractor', hours: { A: 14, B: 14, C: 16 } },
  { reason: 'Crew delay', side: 'contractor', hours: { A: 2, B: 2, C: 4 } },
  { reason: 'Client access', side: 'owner', hours: { A: 10, B: 24, C: 6 } },
  { reason: 'Water', side: 'owner', hours: { A: 6, B: 12, C: 6 } },
  { reason: 'Weather', side: 'owner', hours: { A: 4, B: 6, C: 3 } },
  { reason: 'Permits', side: 'owner', hours: { A: 0, B: 3, C: 0 } },
]
export function downtimeFor(c: ContractorId, side: Side) {
  return DOWNTIME_REASONS.filter(r => r.side === side).reduce((s, r) => s + r.hours[c], 0)
}
export function downtimeTotal(side?: Side) {
  return DOWNTIME_REASONS.filter(r => !side || r.side === side)
    .reduce((s, r) => s + r.hours.A + r.hours.B + r.hours.C, 0)
}

// ── SCORECARD ─────────────────────────────────────────────────────────────

export interface ScoreRow {
  measure: string
  help: string
  values: Record<ContractorId, string>
  num: Record<ContractorId, number>
  better: 'high' | 'low'
}
export const SCORECARD: ScoreRow[] = [
  { measure: 'Metres per rig per day', help: 'Average on days the rig drilled', better: 'high',
    values: { A: '24', B: '31', C: '19' }, num: { A: 24, B: 31, C: 19 } },
  { measure: 'Downtime, % of shift hours', help: 'All stoppages, both sides', better: 'low',
    values: { A: '12%', B: '8%', C: '17%' }, num: { A: 12, B: 8, C: 17 } },
  { measure: 'Core recovery', help: 'Contract minimum is 95%', better: 'high',
    values: { A: '94%', B: '97%', C: '91%' }, num: { A: 94, B: 97, C: 91 } },
  { measure: 'Standby claimed / recorded', help: 'Days claimed on invoices against days in the shift record', better: 'low',
    values: { A: '11 / 9 days', B: '6 / 6 days', C: '9 / 5 days' }, num: { A: 2, B: 0, C: 4 } },
  { measure: 'Invoice lines disputed', help: 'Share of lines that did not match the shift record', better: 'low',
    values: { A: '4%', B: '1%', C: '9%' }, num: { A: 4, B: 1, C: 9 } },
  { measure: 'HSE incidents', help: 'Programme to date', better: 'low',
    values: { A: '1', B: '0', C: '2' }, num: { A: 1, B: 0, C: 2 } },
  { measure: 'Shifts submitted the same day', help: 'Late data is where disputes start', better: 'high',
    values: { A: '96%', B: '99%', C: '81%' }, num: { A: 96, B: 99, C: 81 } },
]

// ── HOLES ─────────────────────────────────────────────────────────────────

export type HoleStage = 'Planned' | 'Drilling' | 'Closed'
export type ApprovalState = 'none' | 'waiting' | 'approved' | 'returned' | 'invoiced'

export interface DemoHole {
  id: string; contractor: ContractorId; planned: number
  drilled: number | null; days: number | null; rop: number | null
  recovery: number | null; offPlan: number | null
  stage: HoleStage; start?: string; end?: string
  approval: ApprovalState; invoice?: string
}

const H = (
  id: string, contractor: ContractorId, planned: number, drilled: number | null, days: number | null,
  rop: number | null, recovery: number | null, offPlan: number | null, stage: HoleStage,
  start?: string, end?: string, approval: ApprovalState = 'none', invoice?: string,
): DemoHole => ({ id, contractor, planned, drilled, days, rop, recovery, offPlan, stage, start, end, approval, invoice })

/* Twenty holes make the 7,000 m programme. The six from DH-101 on are the ones
 * shown in the Platform Overview document, with the same numbers. Drilled
 * metres across the list add up to the 5,100 m on the programme chart. */
export const DEMO_HOLES: DemoHole[] = [
  H('DH-090', 'A', 320, 320, 13, 6.6, 95, 2.4, 'Closed', '2026-06-22', '2026-07-04', 'invoiced', 'NB-A-001'),
  H('DH-091', 'B', 340, 340, 11, 7.0, 97, 1.2, 'Closed', '2026-06-22', '2026-07-02', 'invoiced', 'NB-B-001'),
  H('DH-092', 'C', 350, 350, 18, 5.6, 95, 3.8, 'Closed', '2026-06-22', '2026-07-09', 'invoiced', 'NB-C-001'),
  H('DH-093', 'B', 350, 350, 11, 7.1, 98, 0.9, 'Closed', '2026-07-04', '2026-07-14', 'invoiced', 'NB-B-001'),
  H('DH-094', 'A', 325, 322, 14, 6.4, 95, 3.1, 'Closed', '2026-07-06', '2026-07-19', 'invoiced', 'NB-A-001'),
  H('DH-095', 'B', 340, 338, 11, 6.9, 97, 1.6, 'Closed', '2026-07-16', '2026-07-26', 'invoiced', 'NB-B-002'),
  H('DH-096', 'C', 340, 340, 18, 5.4, 95, 4.2, 'Closed', '2026-07-12', '2026-07-29', 'invoiced', 'NB-C-002'),
  H('DH-097', 'B', 340, 340, 11, 7.3, 98, 1.1, 'Closed', '2026-07-28', '2026-08-07', 'invoiced', 'NB-B-002'),
  H('DH-098', 'A', 320, 320, 13, 6.7, 96, 1.9, 'Closed', '2026-07-21', '2026-08-02', 'invoiced', 'NB-A-002'),
  H('DH-099', 'C', 350, 350, 19, 5.5, 95, 3.5, 'Closed', '2026-08-02', '2026-08-20', 'invoiced', 'NB-C-003'),
  H('DH-100', 'B', 340, 340, 11, 7.0, 97, 1.3, 'Closed', '2026-08-09', '2026-08-19', 'invoiced', 'NB-B-003'),
  H('DH-101', 'A', 350, 350, 14, 6.8, 97, 2.1, 'Closed', '2026-08-13', '2026-08-26', 'invoiced', 'NB-A-003'),
  H('DH-102', 'A', 400, 388, 17, 6.1, 94, 6.8, 'Drilling', '2026-08-28'),
  H('DH-103', 'B', 300, 300, 11, 7.2, 98, 1.4, 'Closed', '2026-08-27', '2026-09-06', 'waiting'),
  H('DH-104', 'C', 450, 210, 12, 5.2, 91, 3.0, 'Drilling', '2026-09-02'),
  H('DH-105', 'C', 350, null, null, null, null, null, 'Planned'),
  H('DH-106', 'B', 300, 142, 6, 6.9, 96, 1.1, 'Drilling', '2026-09-08'),
  H('DH-107', 'A', 380, null, null, null, null, null, 'Planned'),
  H('DH-108', 'B', 380, null, null, null, null, null, 'Planned'),
  H('DH-109', 'C', 375, null, null, null, null, null, 'Planned'),
]
export function demoHole(id: string) { return DEMO_HOLES.find(h => h.id === id) }

export function recoveryFlag(r: number | null) { return r != null && r < PROGRAMME.contractRecovery }
export function offPlanFlag(o: number | null) { return o != null && o > PROGRAMME.maxOffPlan }

// ── SHIFTS ────────────────────────────────────────────────────────────────

export interface Stoppage { reason: string; hours: number; side: Side }
export interface StandbyClaim { id: string; hours: number; reason: string; recordSays: string; matches: boolean }

/* One shift as the mine owner sees it. Deliberately no fuel, water, additives,
 * parts or crew cost — those stay with the contractor. */
export interface OwnerShift {
  id: string
  date: string; shift: 'Day' | 'Night'
  contractor: ContractorId; rig: string; hole: string | null
  from: number; to: number; metres: number; recoveryPct: number | null
  drilling: number; trips: number; standby: number; breakdown: number
  crew: number
  stoppages: Stoppage[]
  submitted: boolean          // false = the shift has not reached XPLORIX yet
  sameDay: boolean            // submitted the day it was worked
  claim?: StandbyClaim        // standby the contractor wants paid for
}

const S = (
  date: string, shift: 'Day' | 'Night', c: ContractorId, hole: string, from: number, to: number, rec: number | null,
  hrs: [number, number, number, number], crew: number, stoppages: Stoppage[] = [],
  extra: Partial<OwnerShift> = {},
): OwnerShift => ({
  id: `${c}_${date}_${shift}`, date, shift, contractor: c, rig: CONTRACTORS[c].rig, hole, from, to,
  metres: +(to - from).toFixed(1), recoveryPct: rec,
  drilling: hrs[0], trips: hrs[1], standby: hrs[2], breakdown: hrs[3], crew, stoppages,
  submitted: true, sameDay: true, ...extra,
})

/* The last two days on the programme, written out by hand so the standby
 * claims and the one missing shift tell a clear story. */
export const RECENT_SHIFTS: OwnerShift[] = [
  S('2026-09-13', 'Day', 'A', 'DH-102', 364, 376.5, 94, [8.5, 3, 0, 0.5], 4, [{ reason: 'Hydraulic hose', hours: 0.5, side: 'contractor' }]),
  S('2026-09-13', 'Night', 'A', 'DH-102', 376.5, 388, 93, [8, 3.5, 0, 0.5], 3, [{ reason: 'Rod trips', hours: 0.5, side: 'contractor' }]),
  S('2026-09-13', 'Day', 'B', 'DH-106', 120, 131.5, 96, [9, 3, 0, 0], 4),
  S('2026-09-13', 'Night', 'B', 'DH-106', 131.5, 142, 97, [8.5, 3.5, 0, 0], 3),
  S('2026-09-13', 'Day', 'C', 'DH-104', 204, 210, 90, [4, 2, 0, 6], 4,
    [{ reason: 'Mechanical: hoist cable', hours: 6, side: 'contractor' }],
    { claim: { id: 'sb_C_0913_D', hours: 6, reason: 'Waiting for water', recordSays: 'Mechanical breakdown, 6 h (hoist cable)', matches: false } }),
  { ...S('2026-09-13', 'Night', 'C', 'DH-104', 210, 210, null, [0, 0, 0, 0], 0), submitted: false, sameDay: false },
  S('2026-09-12', 'Day', 'A', 'DH-102', 343, 355.5, 95, [8.5, 3.5, 0, 0], 4),
  S('2026-09-12', 'Night', 'A', 'DH-102', 355.5, 364, 94, [5.5, 2.5, 4, 0], 3,
    [{ reason: 'Client access: road closed for blasting', hours: 4, side: 'owner' }],
    { claim: { id: 'sb_A_0912_N', hours: 4, reason: 'Access road closed for blasting', recordSays: 'Standby, 4 h (client access)', matches: true } }),
  S('2026-09-12', 'Day', 'B', 'DH-106', 96, 108.5, 96, [9, 3, 0, 0], 4),
  S('2026-09-12', 'Night', 'B', 'DH-106', 108.5, 120, 96, [8.5, 3, 0.5, 0], 3,
    [{ reason: 'Water', hours: 0.5, side: 'owner' }]),
  S('2026-09-12', 'Day', 'C', 'DH-104', 186, 195, 91, [7, 3, 0, 2], 4,
    [{ reason: 'Waiting for parts', hours: 2, side: 'contractor' }]),
  S('2026-09-12', 'Night', 'C', 'DH-104', 195, 204, 92, [7.5, 3, 1.5, 0], 3,
    [{ reason: 'Water', hours: 1.5, side: 'owner' }],
    { sameDay: false, claim: { id: 'sb_C_0912_N', hours: 1.5, reason: 'Water tanker late', recordSays: 'Standby, 1.5 h (water)', matches: true } }),
]

function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/* Shift history for a demo hole. The same hole always produces the same
 * shifts, and they add up exactly to the hole's drilled metres. For a hole
 * still drilling, the last two days are the hand-written records above. */
export function shiftsForDemoHole(h: DemoHole): OwnerShift[] {
  if (h.drilled == null || h.days == null || !h.start) return []
  const tail = RECENT_SHIFTS.filter(s => s.hole === h.id)
  const tailDates = new Set(tail.map(s => s.date))
  const tailStart = tail.length ? Math.min(...tail.map(s => s.from)) : h.drilled
  const dates = Array.from({ length: h.days }, (_, i) => addDays(h.start!, i)).filter(d => !tailDates.has(d))
  const slots = dates.length * 2
  const seed = h.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  // Deterministic unevenness: a few slow shifts, one stoppage every few days.
  const weights = Array.from({ length: slots }, (_, i) => {
    const r = ((seed * 31 + i * 17) % 11) / 10
    return (i % 2 === 0 ? 1.08 : 0.92) * (0.82 + r * 0.36) * ((seed + i) % 9 === 4 ? 0.45 : 1)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  const out: OwnerShift[] = []
  let depth = 0
  weights.forEach((w, i) => {
    const last = i === slots - 1
    const to = last ? tailStart : Math.round((depth + (tailStart * w) / total) * 2) / 2
    const slow = (seed + i) % 9 === 4
    const ownerSide = (seed + i) % 2 === 0
    const lost = slow ? 4 : 0
    const stoppages: Stoppage[] = slow
      ? [{ reason: ownerSide ? 'Client access' : 'Mechanical', hours: lost, side: ownerSide ? 'owner' : 'contractor' }]
      : []
    const rec = h.recovery == null ? null : Math.max(80, Math.min(100, h.recovery + (((seed + i * 7) % 5) - 2)))
    out.push(S(dates[Math.floor(i / 2)], i % 2 === 0 ? 'Day' : 'Night', h.contractor, h.id, depth, to, rec,
      [slow ? 5.5 : 8.5, slow ? 2.5 : 3.5, slow && ownerSide ? lost : 0, slow && !ownerSide ? lost : 0],
      i % 2 === 0 ? 4 : 3, stoppages))
    depth = to
  })
  return [...out, ...[...tail].sort((a, b) => (a.date + (a.shift === 'Day' ? '0' : '1')).localeCompare(b.date + (b.shift === 'Day' ? '0' : '1')))]
}

// ── CONTRACT RATES (demo programme) ───────────────────────────────────────

export const RATE_CARD = {
  note: 'Sample rates for the demo programme',
  bands: [
    { size: 'HQ', from: 0, to: 150, rate: 4200 },
    { size: 'HQ', from: 150, to: 300, rate: 4900 },
    { size: 'HQ', from: 300, to: null as number | null, rate: 5600 },
  ],
  standbyPerDay: 18000,
  mobilisation: 175000,
  demobilisation: 140000,
}
const BAND_LABEL = ['0–150 m', '150–300 m', '300 m+']
function bandSplit(depth: number): [number, number, number] {
  return [Math.min(depth, 150), Math.min(Math.max(depth - 150, 0), 150), Math.max(depth - 300, 0)]
}

/* What a demo hole bills: its drilled depth split across the rate bands. */
export function demoHoleBilling(h: DemoHole) {
  return bandSplit(h.drilled ?? 0).map((m, i) => ({
    label: `${RATE_CARD.bands[i].size} · ${BAND_LABEL[i]}`, metres: m,
    rate: RATE_CARD.bands[i].rate, amount: m * RATE_CARD.bands[i].rate,
  })).filter(b => b.metres > 0)
}

/* Survey stations for a demo hole — illustrative until DrilAxis (Phase 4).
 * Offset from the planned path grows with depth and ends at the hole's
 * recorded off-plan distance. */
export function surveyStations(h: DemoHole) {
  if (h.drilled == null || h.offPlan == null) return []
  const out: { depth: number; dip: number; azimuth: number; offset: number }[] = []
  for (let d = 50; d <= h.drilled; d += 50) {
    const f = d / h.drilled
    out.push({
      depth: d,
      dip: +(-60 + f * (h.offPlan > 5 ? 4.2 : 1.6)).toFixed(1),
      azimuth: +(135 + f * (h.offPlan > 5 ? 5.5 : 1.8)).toFixed(1),
      offset: +(h.offPlan * Math.pow(f, 1.6)).toFixed(1),
    })
  }
  // The last station is always at the bottom of the hole as drilled.
  if (h.drilled % 50 !== 0) {
    out.push({
      depth: h.drilled,
      dip: +(-60 + (h.offPlan > 5 ? 4.2 : 1.6)).toFixed(1),
      azimuth: +(135 + (h.offPlan > 5 ? 5.5 : 1.8)).toFixed(1),
      offset: h.offPlan,
    })
  }
  return out
}

// ── INVOICES ──────────────────────────────────────────────────────────────

/* What the shift record says against what the line claims. Present on every
 * line that can be checked; a line with no check (mobilisation) is a contract
 * lump sum with nothing on the rig to compare it to. */
export interface LineCheck { claimed: number; verified: number; unit: 'm' | 'days'; note: string }
export interface PortalLine {
  label: string; depth?: string; qty: string; rate: string; amount: number
  hole?: string; check?: LineCheck
}
export interface PortalInvoice {
  id: string; number: string; contractor: ContractorId; project: string
  date: string; due?: string; holes: string[]
  lines: PortalLine[]; subtotal: number; taxPercent: number; total: number
  reviews: (LineReview | null)[]
  paid: boolean; paidDate?: string
  live: boolean
}

interface InvSpec {
  number: string; contractor: ContractorId; date: string; due: string
  holes: [string, [number, number, number]?][]   // hole, and the band metres claimed if they differ from the record
  standby?: [number, number]                     // days claimed, days in the shift record
  mob?: boolean
  state: 'paid' | 'approved' | 'to-verify'
  paidDate?: string
}
const INV_SPECS: InvSpec[] = [
  { number: 'NB-C-001', contractor: 'C', date: '2026-07-15', due: '2026-08-14', holes: [['DH-092', [150, 110, 120]]], mob: true, state: 'paid', paidDate: '2026-08-12' },
  { number: 'NB-B-001', contractor: 'B', date: '2026-07-20', due: '2026-08-19', holes: [['DH-091'], ['DH-093']], mob: true, state: 'paid', paidDate: '2026-08-14' },
  { number: 'NB-A-001', contractor: 'A', date: '2026-07-24', due: '2026-08-23', holes: [['DH-090'], ['DH-094', [150, 120, 72]]], mob: true, state: 'paid', paidDate: '2026-08-21' },
  { number: 'NB-C-002', contractor: 'C', date: '2026-08-05', due: '2026-09-04', holes: [['DH-096', [150, 120, 95]]], standby: [4, 2], state: 'approved' },
  { number: 'NB-B-002', contractor: 'B', date: '2026-08-12', due: '2026-09-11', holes: [['DH-095'], ['DH-097', [150, 150, 45]]], state: 'paid', paidDate: '2026-09-08' },
  { number: 'NB-A-002', contractor: 'A', date: '2026-08-20', due: '2026-09-19', holes: [['DH-098', [150, 150, 30]]], standby: [11, 9], state: 'approved' },
  { number: 'NB-B-003', contractor: 'B', date: '2026-09-01', due: '2026-10-01', holes: [['DH-100']], standby: [6, 6], state: 'approved' },
  { number: 'NB-C-003', contractor: 'C', date: '2026-09-03', due: '2026-10-03', holes: [['DH-099', [150, 150, 90]]], standby: [5, 3], state: 'to-verify' },
  { number: 'NB-A-003', contractor: 'A', date: '2026-09-08', due: '2026-10-08', holes: [['DH-101']], state: 'to-verify' },
]

function buildDemoInvoice(spec: InvSpec): PortalInvoice {
  const lines: PortalLine[] = []
  spec.holes.forEach(([id, claimed]) => {
    const hole = demoHole(id)!
    const verified = bandSplit(hole.drilled ?? 0)
    const claim = claimed ?? verified
    RATE_CARD.bands.forEach((b, i) => {
      if (claim[i] === 0 && verified[i] === 0) return
      const diff = claim[i] - verified[i]
      lines.push({
        label: `${id} · ${b.size} · ${BAND_LABEL[i]}`, depth: BAND_LABEL[i],
        qty: `${claim[i]} m`, rate: perUnit(b.rate), amount: claim[i] * b.rate, hole: id,
        check: {
          claimed: claim[i], verified: verified[i], unit: 'm',
          note: diff === 0 ? 'Matches the shift record'
            : diff > 0 ? `Shift record shows ${verified[i]} m in this band, ${diff} m less than claimed`
            : `Shift record shows ${verified[i]} m in this band, ${-diff} m more than claimed`,
        },
      })
    })
  })
  if (spec.standby) {
    const [c, v] = spec.standby
    lines.push({
      label: 'Standby', qty: `${c} days`, rate: `${money(RATE_CARD.standbyPerDay)}/day`, amount: c * RATE_CARD.standbyPerDay,
      check: {
        claimed: c, verified: v, unit: 'days',
        note: c === v ? 'Matches the shift record' : `Shift record shows ${v} standby days; the other ${c - v} were logged as breakdown`,
      },
    })
  }
  if (spec.mob) lines.push({ label: 'Mobilisation', qty: '1', rate: money(RATE_CARD.mobilisation), amount: RATE_CARD.mobilisation })
  const subtotal = lines.reduce((s, l) => s + l.amount, 0)
  // An invoice already dealt with has every line answered: approved where it
  // matched the record, disputed where it did not.
  const reviews: (LineReview | null)[] = spec.state === 'to-verify'
    ? lines.map(() => null)
    : lines.map(l => l.check && l.check.claimed !== l.check.verified
      ? { status: 'disputed', reason: l.check.note }
      : { status: 'approved' })
  return {
    id: spec.number, number: spec.number, contractor: spec.contractor, project: PROGRAMME.name,
    date: spec.date, due: spec.due, holes: spec.holes.map(h => h[0]),
    lines, subtotal, taxPercent: 18, total: subtotal * 1.18, reviews,
    paid: spec.state === 'paid', paidDate: spec.paidDate, live: false,
  }
}
export const DEMO_INVOICES: PortalInvoice[] = INV_SPECS.map(buildDemoInvoice)

/* The amount a line is supported for: what the shift record says, at the
 * line's own rate. A line with no check is taken at face value. */
export function verifiedAmount(l: PortalLine) {
  if (!l.check) return l.amount
  if (l.check.claimed === 0) return 0
  return (l.amount / l.check.claimed) * l.check.verified
}
export type InvoiceState = 'to-verify' | 'disputed' | 'approved' | 'paid'
export function invoiceState(i: PortalInvoice): InvoiceState {
  if (i.paid) return 'paid'
  if (i.reviews.some(r => !r)) return 'to-verify'
  return i.reviews.some(r => r?.status === 'disputed') ? 'disputed' : 'approved'
}
export const INVOICE_STATE_LABEL: Record<InvoiceState, string> = {
  'to-verify': 'To verify', disputed: 'Part disputed', approved: 'Approved', paid: 'Paid',
}
/* What a dispute on a line is worth. Where the shift record supports part of
 * the line, only the unsupported part is in dispute and the rest is still
 * payable. A line with no record to compare against is disputed in full. */
export function disputedLineValue(l: PortalLine) {
  if (l.check && l.check.claimed > 0 && l.check.claimed !== l.check.verified) {
    const supported = (l.amount / l.check.claimed) * Math.min(l.check.claimed, l.check.verified)
    return Math.max(0, l.amount - supported)
  }
  return l.amount
}
export function disputedValue(i: PortalInvoice) {
  return i.lines.reduce((s, l, k) => s + (i.reviews[k]?.status === 'disputed' ? disputedLineValue(l) : 0), 0)
}
/* What the owner owes on an invoice: everything he has not disputed, plus tax. */
export function payable(i: PortalInvoice) {
  return (i.subtotal - disputedValue(i)) * (1 + i.taxPercent / 100)
}
export function isInvoiceOverdue(i: PortalInvoice) {
  return !i.paid && !!i.due && i.due < PORTAL_TODAY && invoiceState(i) !== 'to-verify'
}

/* Money on a set of invoices, all before tax so it compares with a budget.
 *   raised     everything the contractors have asked for
 *   approved   lines the owner has accepted
 *   disputed   lines the owner has refused
 *   waiting    lines not looked at yet
 *   paid       accepted lines on invoices that have been paid
 *   overdue    accepted lines on unpaid invoices past their due date */
export function spendSummary(list: PortalInvoice[]) {
  const z = { raised: 0, approved: 0, disputed: 0, waiting: 0, paid: 0, overdue: 0, metresPaid: 0 }
  list.forEach(i => {
    const late = isInvoiceOverdue(i)
    i.lines.forEach((l, k) => {
      const r = i.reviews[k]
      z.raised += l.amount
      if (!r) { z.waiting += l.amount; return }
      const out = r.status === 'disputed' ? disputedLineValue(l) : 0
      const ok = l.amount - out
      z.disputed += out
      z.approved += ok
      if (i.paid) {
        z.paid += ok
        if (l.check?.unit === 'm') z.metresPaid += r.status === 'disputed' ? Math.min(l.check.claimed, l.check.verified) : l.check.claimed
      } else if (late) z.overdue += ok
    })
  })
  return z
}
export const PROJECT_BUDGETS: Record<string, number> = {
  [PROGRAMME.name]: PROGRAMME.budget,
  'Site A - North Field': 25000000,
}

// ── HSE ───────────────────────────────────────────────────────────────────

export const HSE_INCIDENTS = [
  { id: 'HSE-014', date: '2026-09-09', contractor: 'C' as ContractorId, rig: 'Rig C-1', hole: 'DH-104', type: 'Equipment damage', severity: 'Major',
    what: 'Hoist cable failed while pulling the inner tube. No injury.', status: 'Open' },
  { id: 'HSE-011', date: '2026-08-18', contractor: 'A' as ContractorId, rig: 'Rig A-1', hole: 'DH-101', type: 'Injury', severity: 'Minor',
    what: 'Hand injury during rod handling. First aid on site.', status: 'Closed' },
  { id: 'HSE-008', date: '2026-07-30', contractor: 'C' as ContractorId, rig: 'Rig C-1', hole: 'DH-096', type: 'Injury', severity: 'Minor',
    what: 'Slip on a wet rig deck. Medical treatment, back at work next shift.', status: 'Closed' },
]
export const HSE_COMPLIANCE: Record<ContractorId, { ppe: number; training: number; crew: number }> = {
  A: { ppe: 97, training: 92, crew: 12 },
  B: { ppe: 99, training: 100, crew: 12 },
  C: { ppe: 91, training: 78, crew: 11 },
}

// ── ALERTS ────────────────────────────────────────────────────────────────

export const AI_ALERTS = [
  { id: 'al1', tone: 'warn' as const, title: 'ROP on DH-104 is falling', detail: 'Down 18% over the last five shifts. The other two rigs are steady.', href: '/client/holes/DH-104' },
  { id: 'al2', tone: 'warn' as const, title: 'Repeat failure on Rig C-1', detail: 'Third hoist or hydraulic stoppage in 30 days.', href: '/client/downtime' },
]

/* ==========================================================================
 * LIVE — read from the contractor's costing store
 * ========================================================================== */

export interface CostingStateLike {
  shiftLogs: ShiftLog[]
  clientRates: ClientRate[]
  holeStatus: Record<string, { status: HoleStatus; invoiceId?: string; submittedAt?: string; decidedAt?: string; returnReason?: string }>
  invoices: Invoice[]
  holePlans: Record<string, { plannedDepth: number; project?: string }>
}

export interface LiveHole {
  id: string; project: string; rig: string
  planned?: number; drilled: number; recoveryPct: number
  days: number; drillingDays: number; standbyDays: number; breakdownDays: number
  start: string; end?: string
  status: HoleStatus; submittedAt?: string; decidedAt?: string; returnReason?: string; invoiceId?: string
  shifts: OwnerShift[]
  billing: { label: string; metres: number; rate: number; amount: number }[]
  standbyAmount: number
  value: number
}

const order = (l: { date: string; shift: string }) => `${l.date}${l.shift === 'Day' ? '0' : '1'}`

/* Every hole on a project whose mine owner is on XPLORIX, built from the
 * contractor's own shift logs and the client rate in force on each day —
 * the same inputs Finance uses, so the value here is the value on the
 * invoice. Only what the owner is entitled to see is carried across. */
export function liveHoles(state: CostingStateLike): LiveHole[] {
  const byHole: Record<string, ShiftLog[]> = {}
  state.shiftLogs.forEach(l => {
    if (l.holeNumber && isOwnerLinked(l.project)) (byHole[l.holeNumber] ||= []).push(l)
  })
  return Object.entries(byHole).map(([id, raw]) => {
    const logs = [...raw].sort((a, b) => order(a).localeCompare(order(b)))
    const project = logs[0].project
    const rates = state.clientRates.filter(c => c.project === project)
    let depth = 0
    const lines: Record<string, { label: string; metres: number; rate: number; amount: number }> = {}
    const shifts: OwnerShift[] = logs.map(l => {
      const from = depth
      const cr = versionOn(rates, l.date)
      if (l.metresDrilled > 0) {
        chargeShift(cr, l, depth).forEach(c => {
          const flat = cr?.structure !== 'slab'
          const label = flat ? `${c.holeSize} · ${c.formation}` : `${c.holeSize} · ${c.fromDepth}–${c.toDepth} m`
          const k = `${c.holeSize}|${c.formation}|${Math.round(c.rate)}`
          const e = (lines[k] ||= { label, metres: 0, rate: c.rate, amount: 0 })
          e.metres += c.metres; e.amount += c.amount
        })
        depth += l.metresDrilled
      }
      const contractorSide = BREAKDOWN_REASONS.includes(l.downtimeReason)
      const lost = l.downtimeHours
      return {
        id: l.id, date: l.date, shift: l.shift, contractor: LIVE_CONTRACTOR, rig: l.rig, hole: id,
        from, to: depth, metres: l.metresDrilled,
        recoveryPct: l.metresDrilled > 0 ? Math.round((l.coreRecovery / l.metresDrilled) * 100) : null,
        drilling: l.drillingHours, trips: Math.max(0, l.shiftHours - l.drillingHours - lost),
        standby: lost > 0 && !contractorSide ? lost : 0,
        breakdown: lost > 0 && contractorSide ? lost : 0,
        crew: l.crewCount,
        stoppages: lost > 0 ? [{ reason: l.downtimeReason || 'Not stated', hours: lost, side: contractorSide ? 'contractor' as Side : 'owner' as Side }] : [],
        submitted: true, sameDay: true,
      }
    })
    const dates = Array.from(new Set(logs.map(l => l.date)))
    const dayKind = (d: string) => {
      const s = logs.filter(l => l.date === d)
      if (s.some(x => x.drillingHours > 0)) return 'drilling'
      return s.some(x => BREAKDOWN_REASONS.includes(x.downtimeReason)) ? 'breakdown' : 'standby'
    }
    const standbyDays = dates.filter(d => dayKind(d) === 'standby')
    const standbyAmount = standbyDays.reduce((s, d) => s + (versionOn(rates, d)?.standbyPerDay ?? 0), 0)
    const closing = logs.find(l => l.holeClosedThisShift)
    const st = state.holeStatus[id]
    const status: HoleStatus = st?.status && st.status !== 'drilling' ? st.status : closing ? 'closed' : 'drilling'
    const drilled = depth
    const core = logs.reduce((s, l) => s + l.coreRecovery, 0)
    const billing = Object.values(lines)
    return {
      id, project, rig: logs[0].rig,
      planned: state.holePlans?.[id]?.plannedDepth, drilled,
      recoveryPct: drilled > 0 ? (core / drilled) * 100 : 0,
      days: dates.length,
      drillingDays: dates.filter(d => dayKind(d) === 'drilling').length,
      standbyDays: standbyDays.length,
      breakdownDays: dates.filter(d => dayKind(d) === 'breakdown').length,
      start: logs[0].date, end: closing?.date,
      status, submittedAt: st?.submittedAt, decidedAt: st?.decidedAt, returnReason: st?.returnReason, invoiceId: st?.invoiceId,
      shifts, billing, standbyAmount,
      value: billing.reduce((s, b) => s + b.amount, 0) + standbyAmount,
    }
  }).sort((a, b) => b.start.localeCompare(a.start))
}

/* An invoice the contractor sent from Finance, reshaped for the owner. Each
 * metres line is checked against the hole's shift record; because the invoice
 * was built from that same record, a live line can only fail the check if the
 * record changed after the invoice was sent. */
export function liveInvoices(state: CostingStateLike, holes: LiveHole[]): PortalInvoice[] {
  return state.invoices
    .filter(i => isOwnerLinked(i.project) && i.ownerStatus && i.status !== 'cancelled' && i.status !== 'draft')
    .map(i => ({
      id: i.id, number: i.number, contractor: LIVE_CONTRACTOR, project: i.project,
      date: i.date, due: i.dueDate, holes: i.holeNumbers,
      lines: i.lines.map(l => {
        const [holeId, ...rest] = l.label.split(' · ')
        const hole = holes.find(h => h.id === holeId)
        const claimed = parseFloat(l.qty)
        let check: LineCheck | undefined
        if (hole && rest[0] === 'standby') {
          check = { claimed, verified: hole.standbyDays, unit: 'days', note: claimed === hole.standbyDays ? 'Matches the shift record' : `Shift record shows ${hole.standbyDays} standby days` }
        } else if (hole) {
          const match = hole.billing.find(b => b.label === rest.join(' · '))
          const verified = match ? +match.metres.toFixed(1) : 0
          check = { claimed, verified, unit: 'm', note: claimed === verified ? 'Matches the shift record' : `Shift record shows ${verified} m` }
        }
        return { label: l.label, depth: l.depth, qty: l.qty, rate: l.rate, amount: l.amount, hole: hole?.id, check }
      }),
      subtotal: i.subtotal, taxPercent: i.taxPercent, total: i.total,
      reviews: i.lines.map((_, k) => i.lineReviews?.[k] ?? null),
      paid: i.status === 'paid', paidDate: i.paidDate, live: true,
    }))
}

/* ==========================================================================
 * THE OWNER'S OWN DECISIONS ON DEMO ITEMS
 *
 * A decision on a live hole or invoice is written to the costing store, which
 * is how it reaches the contractor. A decision on a demo item has no
 * contractor on the other side, so it is kept here, in the owner's browser.
 * ========================================================================== */

export interface Decision { status: 'approved' | 'rejected'; reason?: string }
interface PortalState {
  holes: Record<string, Decision>
  standby: Record<string, Decision>
  reviews: Record<string, (LineReview | null)[]>
  paid: Record<string, string>
}
const blank = (): PortalState => ({ holes: {}, standby: {}, reviews: {}, paid: {} })

interface PortalCtx {
  state: PortalState
  decideHole: (id: string, d: Decision) => void
  decideStandby: (id: string, d: Decision | null) => void
  reviewInvoice: (id: string, reviews: (LineReview | null)[]) => void
  markPaid: (id: string) => void
  reset: () => void
}
const Ctx = createContext<PortalCtx | null>(null)
const KEY = 'xplorix_owner_portal_v1'

export function OwnerPortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalState>(blank)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState({ ...blank(), ...JSON.parse(raw) }) } catch {}
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state, loaded])

  return (
    <Ctx.Provider value={{
      state,
      decideHole: (id, d) => setState(s => ({ ...s, holes: { ...s.holes, [id]: d } })),
      decideStandby: (id, d) => setState(s => {
        const next = { ...s.standby }
        if (d) next[id] = d; else delete next[id]
        return { ...s, standby: next }
      }),
      reviewInvoice: (id, reviews) => setState(s => ({ ...s, reviews: { ...s.reviews, [id]: reviews } })),
      markPaid: id => setState(s => ({ ...s, paid: { ...s.paid, [id]: new Date().toISOString().slice(0, 10) } })),
      reset: () => setState(blank()),
    }}>{children}</Ctx.Provider>
  )
}
export function useOwnerPortal() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useOwnerPortal must be used inside OwnerPortalProvider')
  return c
}

/* Demo invoices with the owner's own answers laid over the starting ones. */
export function demoInvoices(p: PortalState): PortalInvoice[] {
  return DEMO_INVOICES.map(i => ({
    ...i,
    reviews: p.reviews[i.id] ?? i.reviews,
    paid: i.paid || !!p.paid[i.id],
    paidDate: i.paidDate ?? p.paid[i.id],
  }))
}
export function demoHoleApproval(h: DemoHole, p: PortalState): ApprovalState {
  const d = p.holes[h.id]
  if (h.approval !== 'waiting' || !d) return h.approval
  return d.status === 'approved' ? 'approved' : 'returned'
}

// ── SMALL FORMATTERS ──────────────────────────────────────────────────────

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function shortDate(date?: string) {
  if (!date) return '—'
  const [, m, d] = date.split('-').map(Number)
  return `${d} ${MON[m - 1]}`
}
export function num(n: number, digits = 0) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
export function daysBetween(a: string, b: string) {
  return Math.round((new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime()) / 86400000)
}

/* Turns rows into a CSV download. Used by every table's Export button. */
export function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const blob = new Blob(['﻿' + rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${name}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ==========================================================================
 * ONE HOOK FOR EVERY SCREEN
 *
 * Joins the live side and the demo side so a screen never has to know which
 * is which, and routes each decision to the place it belongs: the costing
 * store for a live item, the portal's own store for a demo one.
 * ========================================================================== */

export function usePortal() {
  const costing = useCosting()
  const portal = useOwnerPortal()

  const live = useMemo(() => liveHoles(costing.state), [costing.state])
  const invoices = useMemo(
    () => [...liveInvoices(costing.state, live), ...demoInvoices(portal.state)]
      .sort((a, b) => b.date.localeCompare(a.date)),
    [costing.state, live, portal.state],
  )

  const liveWaiting = live.filter(h => h.status === 'submitted')
  const demoWaiting = DEMO_HOLES.filter(h => demoHoleApproval(h, portal.state) === 'waiting')
  const toVerify = invoices.filter(i => invoiceState(i) === 'to-verify')
  const claims = RECENT_SHIFTS.filter(s => s.claim)
  const claimsWaiting = claims.filter(s => !portal.state.standby[s.claim!.id])
  const missingShifts = RECENT_SHIFTS.filter(s => !s.submitted)

  return {
    live, invoices, liveWaiting, demoWaiting, toVerify, claims, claimsWaiting, missingShifts,
    holesWaiting: liveWaiting.length + demoWaiting.length,
    standby: portal.state.standby,
    demoApproval: (h: DemoHole) => demoHoleApproval(h, portal.state),
    decideLiveHole: (id: string, approve: boolean, reason?: string) => costing.ownerDecideHole(id, approve, reason),
    decideDemoHole: (id: string, approve: boolean, reason?: string) =>
      portal.decideHole(id, { status: approve ? 'approved' : 'rejected', reason }),
    decideStandby: portal.decideStandby,
    reviewInvoice: (inv: PortalInvoice, reviews: (LineReview | null)[]) =>
      inv.live ? costing.ownerReviewInvoice(inv.id, reviews) : portal.reviewInvoice(inv.id, reviews),
    markPaid: (inv: PortalInvoice) => inv.live ? costing.ownerMarkPaid(inv.id) : portal.markPaid(inv.id),
    resetDemo: portal.reset,
  }
}
