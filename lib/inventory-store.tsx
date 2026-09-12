'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/* ==========================================================================
 * XPLORIX PARTS & INVENTORY
 *
 * The idea this module rests on comes from the client's own parts sheet: a
 * drilling consumable is not an expense on the day you buy it, it is a cost
 * spread across the work it does.
 *
 *     ₹22,000 bit / 100 m = ₹220 per metre
 *
 * What "the work it does" means is not the same for every part, so each one
 * says what wears it out:
 *
 *   Terrain + metres   metres drilled, and harder ground uses it up faster
 *                      bits, reamer shells, core lifters and their cases
 *   Metres             metres drilled, whatever the rock
 *                      rods, barrels, casing, adaptors
 *   Days               days the rig drilled, whatever was drilled
 *                      water swivel and its spares
 *
 * The flow of a part through the yard is deliberately one-way:
 *
 *   order -> receive -> store -> issue to a rig
 *
 * A part is never issued from a purchase order. It is received into the store
 * and issued from there, because the store is the only place that knows what
 * is actually on the shelf. Anything that arrives faulty never enters the
 * store at all: it is reordered, and the replacement is tracked on its own
 * line until something usable turns up.
 * ========================================================================== */

/* The whole module is dated against this. Seed data sits in 2026, so a fixed
 * "today" keeps the demo coherent. Swap for new Date().toISOString().slice(0,10)
 * when real data lands. */
export const TODAY = '2026-09-09'

// ── FORMATIONS ────────────────────────────────────────────────────────────

export const FORMATIONS = ['Soft', 'Medium', 'Hard', 'Very Hard'] as const
export type Formation = typeof FORMATIONS[number]

/* The log writes "Very Hard Formation"; a catalogue says "Very Hard". Both are
 * reduced to bare words before matching. */
export function normFormation(v: string): Formation {
  const t = (v || '').toLowerCase().replace(/formation|strata|rock/g, '').replace(/\s+/g, ' ').trim()
  if (t.startsWith('very')) return 'Very Hard'
  if (t.startsWith('hard')) return 'Hard'
  if (t.startsWith('med')) return 'Medium'
  return 'Soft'
}

// ── PARTS CATALOGUE ───────────────────────────────────────────────────────

export type PartCategory = 'Bit' | 'Rod & Casing' | 'Core Barrel' | 'Accessory' | 'Spares'
export const CATEGORIES: PartCategory[] = ['Bit', 'Rod & Casing', 'Core Barrel', 'Accessory', 'Spares']

export type WearBasis = 'terrain' | 'metres' | 'days'
export const WEAR_BASES: WearBasis[] = ['terrain', 'metres', 'days']
export const WEAR_BASIS_LABEL: Record<WearBasis, string> = {
  terrain: 'Terrain + metres', metres: 'Metres', days: 'Days',
}
export const WEAR_BASIS_HINT: Record<WearBasis, string> = {
  terrain: 'Metres before replacement, one figure per formation. Harder ground uses the part up faster, so a hard-rock metre costs more than a soft one.',
  metres: 'Metres before replacement. The rock makes no real difference, so one figure covers every formation.',
  days: 'Days of drilling before replacement. Charged once for each day the rig drilled — a standby or breakdown day wears nothing.',
}

export interface Part {
  id: string
  partNumber: string
  name: string
  serialNumber?: string              // optional, for parts the yard tracks individually
  category: PartCategory
  rate: number                       // ₹ per unit
  wearBasis: WearBasis
  life: Record<Formation, number>    // metres per formation — used when wearBasis is 'terrain'
  lifeMetres: number                 // metres, any ground — used when wearBasis is 'metres'
  lifeDays: number                   // drilling days — used when wearBasis is 'days'
  supplier: string
  leadTimeDays: number
  minStock: number                   // below this, reordering is already late
  active: boolean
}

/* Costing imports this name. Kept as an alias so the finance module needs no
 * change to its imports. */
export type ToolingItem = Part
export type ToolCategory = PartCategory

/* What one metre of drilling costs in this part. Day-based parts return zero:
 * they are a cost of the day, not of the metre, and costPerDay carries them. */
export function costPerMetre(p: Part, f: Formation): number {
  if (p.wearBasis === 'days') return 0
  const life = p.wearBasis === 'metres' ? p.lifeMetres : p.life[f]
  return life > 0 ? p.rate / life : 0
}

/* What one day of drilling costs in this part. Zero for everything charged by
 * the metre, so the two never double-count. */
export function costPerDay(p: Part): number {
  return p.wearBasis === 'days' && p.lifeDays > 0 ? p.rate / p.lifeDays : 0
}

export function toolingPerMetre(parts: Part[], f: Formation): number {
  return parts.filter(p => p.active).reduce((s, p) => s + costPerMetre(p, f), 0)
}

export function toolingPerDay(parts: Part[]): number {
  return parts.filter(p => p.active).reduce((s, p) => s + costPerDay(p), 0)
}

/* One line for the Life column, whichever basis the part uses. */
export function lifeLabel(p: Part): string {
  if (p.wearBasis === 'days') return `${p.lifeDays.toLocaleString('en-IN')} days`
  if (p.wearBasis === 'metres') return `${p.lifeMetres.toLocaleString('en-IN')} m`
  return `${p.life.Soft.toLocaleString('en-IN')} / ${p.life.Medium.toLocaleString('en-IN')} / `
    + `${p.life.Hard.toLocaleString('en-IN')} / ${p.life['Very Hard'].toLocaleString('en-IN')} m`
}

/* One line for the Cost column. */
export function costLabel(p: Part): string {
  if (p.wearBasis === 'days') return `₹${costPerDay(p).toFixed(2)}/day`
  return `₹${costPerMetre(p, 'Hard').toFixed(2)}/m`
}

// ── SUPPLIERS ─────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  /* Their quoted lead time. Measured performance is derived from receipts, not
   * stored, so it cannot go stale. */
  quotedLeadDays: number
  /* A person's judgement, 1–5. Kept separate from the measured figures rather
   * than blended into them: a supplier who is always on time but ships damaged
   * goods should not average out to "fine". */
  rating?: number
  ratingNote?: string
}

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────

export type POStatus = 'draft' | 'ordered' | 'partial' | 'received'

export interface POLine { itemId: string; qty: number; rate: number }

/* What actually turned up, not just how many. Damaged and rejected units never
 * enter the store — they cannot be issued to a rig, so counting them as
 * received would overstate both stock and spend. */
export interface ReceiptLine {
  itemId: string
  accepted: number
  damaged: number
  rejected: number      // wrong item, or short-shipped and written off
}

export const DELAY_REASONS = [
  'Supplier delay', 'Transport', 'Customs or documentation',
  'Our order raised late', 'Partial availability', 'Other',
] as const
export type DelayReason = typeof DELAY_REASONS[number]

/* Receipts are partial and dated. Stock that arrived last week carries last
 * week's date, not today's. */
export interface Receipt {
  id: string
  date: string
  lines: ReceiptLine[]
  delayReason?: DelayReason      // recorded only when it arrived late
  note?: string
}

// ── REORDERS ──────────────────────────────────────────────────────────────
/* A faulty unit is sent back and a replacement is chased on its own line. The
 * replacement is received against that line, not against the order, so the
 * order is never inflated by stock that was paid for once.
 *
 * If the replacement is faulty too, the round number goes up and a fresh line
 * is raised against the same order. The chain is as long as the supplier makes
 * it, and every attempt stays on the record. */
export type ReorderStatus = 'raised' | 'sent' | 'promised' | 'closed' | 'credited'
export const REORDER_STATUS_LABEL: Record<ReorderStatus, string> = {
  raised: 'Raised', sent: 'Sent back', promised: 'Replacement promised',
  closed: 'Replaced', credited: 'Credited',
}
export const REORDER_OPEN_STATUSES: ReorderStatus[] = ['raised', 'sent', 'promised']

export interface ReorderReceipt {
  date: string
  accepted: number
  damaged: number
  rejected: number
  note?: string
}

export interface Reorder {
  id: string
  itemId: string
  qty: number
  reason: string
  raisedDate: string
  round: number             // 1 = first replacement, 2 = replacement of that, and on
  parentId?: string         // the reorder this one replaces
  status: ReorderStatus
  promisedDate?: string
  receipt?: ReorderReceipt  // set once the replacement turns up
}

/* Open means still owed. A reorder with a receipt has been answered, whatever
 * the answer was; a credited one has been settled in money instead. */
export function isOpenReorder(r: Reorder) {
  return !r.receipt && r.status !== 'credited'
}
export function openReorders(po: PurchaseOrder) {
  return po.reorders.filter(isOpenReorder)
}

// ── TRANSFERS ─────────────────────────────────────────────────────────────
/* Stock bought against a project that has since closed can be moved to a live
 * one. The order keeps its original project — rewriting that would falsify
 * what was actually bought for what. */
export interface Transfer {
  id: string
  date: string
  itemId: string
  qty: number
  toProject: string
  note?: string
}

/* Issued from the store to a rig. The project is recorded on the issue rather
 * than read off the order, because stock moved to a live project is issued
 * against that project, not the one it was bought for. */
export interface Issue {
  id: string
  date: string
  project: string
  rig: string
  issuedBy: string
  lines: { itemId: string; qty: number }[]
}

export interface PurchaseOrder {
  id: string
  number: string
  supplier: string
  project: string
  status: POStatus
  createdDate: string
  orderedDate?: string
  /* Promised against actual is the pair that makes lead time measurable
   * instead of a star rating somebody typed in. */
  promisedDate?: string
  lines: POLine[]
  receipts: Receipt[]
  reorders: Reorder[]
  issues: Issue[]
  transfers: Transfer[]
  note?: string
}

export function poValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + l.qty * l.rate, 0)
}
export function rateOfLine(po: PurchaseOrder, itemId: string) {
  return po.lines.find(l => l.itemId === itemId)?.rate ?? 0
}
export function qtyOrdered(po: PurchaseOrder, itemId: string) {
  return po.lines.filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0)
}

/* Only accepted units count as received, and a replacement counts the same way
 * a first delivery does — it is the same unit, finally usable. */
export function qtyReceived(po: PurchaseOrder, itemId: string) {
  const first = po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId)
    .reduce((s, l) => s + l.accepted, 0)
  const replaced = po.reorders.filter(r => r.itemId === itemId)
    .reduce((s, r) => s + (r.receipt?.accepted ?? 0), 0)
  return first + replaced
}

/* Everything that arrived unusable, across deliveries and replacements. */
export function qtyFaulty(po: PurchaseOrder, itemId: string) {
  const first = po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId)
    .reduce((s, l) => s + l.damaged + l.rejected, 0)
  const again = po.reorders.filter(r => r.itemId === itemId)
    .reduce((s, r) => s + (r.receipt?.damaged ?? 0) + (r.receipt?.rejected ?? 0), 0)
  return first + again
}
export function qtyReorderedFor(po: PurchaseOrder, itemId: string) {
  return po.reorders.filter(r => r.itemId === itemId).reduce((s, r) => s + r.qty, 0)
}
/* Faulty units nobody has chased yet. This is what the Reorder button offers. */
export function qtyToReorder(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyFaulty(po, itemId) - qtyReorderedFor(po, itemId))
}
export function poHasSomethingToReorder(po: PurchaseOrder) {
  return po.lines.some(l => qtyToReorder(po, l.itemId) > 0)
}

export function qtyTransferred(po: PurchaseOrder, itemId: string) {
  return po.transfers.filter(t => t.itemId === itemId).reduce((s, t) => s + t.qty, 0)
}
export function qtyIssued(po: PurchaseOrder, itemId: string) {
  return po.issues.flatMap(i => i.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0)
}
export function qtyIssuedTo(po: PurchaseOrder, itemId: string, project: string) {
  return po.issues.filter(i => i.project === project)
    .flatMap(i => i.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0)
}
/* Faulty units still count as outstanding — the supplier owes a replacement. */
export function qtyAwaitingDelivery(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyOrdered(po, itemId) - qtyReceived(po, itemId))
}
/* Everything that physically turned up against the order itself, good or not.
 * Replacements are not counted here — they arrive on their own line. */
export function qtyDeliveredOnOrder(po: PurchaseOrder, itemId: string) {
  return po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId)
    .reduce((s, l) => s + l.accepted + l.damaged + l.rejected, 0)
}
/* Units that have never arrived at all, as opposed to arrived and gone back.
 * This is what the Receive screen offers, so a unit already being replaced is
 * not asked for twice. */
export function qtyNeverDelivered(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyOrdered(po, itemId) - qtyDeliveredOnOrder(po, itemId))
}
export function poHasSomethingToReceive(po: PurchaseOrder) {
  return po.status !== 'draft' && po.lines.some(l => qtyNeverDelivered(po, l.itemId) > 0)
}
/* Accepted into the store, not yet issued. */
export function qtyInStore(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyReceived(po, itemId) - qtyIssued(po, itemId))
}

export function poReceivedValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + qtyReceived(po, l.itemId) * l.rate, 0)
}
export function poIssuedValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + qtyIssued(po, l.itemId) * l.rate, 0)
}
export function poStoreValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + qtyInStore(po, l.itemId) * l.rate, 0)
}
export function poFaultyValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + qtyFaulty(po, l.itemId) * l.rate, 0)
}
export function poOpenReorderValue(po: PurchaseOrder) {
  return openReorders(po).reduce((s, r) => s + r.qty * rateOfLine(po, r.itemId), 0)
}

/* Derived, never stored, so it cannot drift from the receipts underneath. */
export function poStatus(po: PurchaseOrder): POStatus {
  if (po.status === 'draft') return 'draft'
  if (po.lines.every(l => qtyReceived(po, l.itemId) >= l.qty)) return 'received'
  return po.receipts.length > 0 ? 'partial' : 'ordered'
}

export function daysBetween(from: string, to: string) {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000)
}
export function addDays(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

/* Promised against actual, per receipt. Negative is early. */
export function receiptDelayDays(po: PurchaseOrder, r: Receipt): number | null {
  return po.promisedDate ? daysBetween(po.promisedDate, r.date) : null
}

// ── SUPPLIER PERFORMANCE ──────────────────────────────────────────────────

export interface SupplierPerformance {
  supplier: string
  orders: number
  completed: number
  value: number
  quotedLead: number | null
  actualLead: number | null
  avgDelay: number | null            // + late, − early
  onTimePct: number | null
  /* Quality, kept apart from timeliness. A supplier who is always on time but
   * ships damaged goods should not look the same as one who is merely slow. */
  delivered: number
  faulty: number
  faultyPct: number | null
  openReorders: number
  repeatFailures: number             // replacements that arrived faulty as well
  rating?: number
}

/* Lead time is measured from what happened, not from a rating field. A delay
 * the buyer caused is excluded: a supplier held up by our own late order
 * should not be scored for it. */
export function supplierPerformance(pos: PurchaseOrder[], suppliers: Supplier[], name: string): SupplierPerformance {
  const mine = pos.filter(p => p.supplier === name && p.status !== 'draft')
  const leads: number[] = []
  const delays: number[] = []
  mine.forEach(po => po.receipts.forEach(r => {
    if (po.orderedDate) leads.push(daysBetween(po.orderedDate, r.date))
    if (r.delayReason === 'Our order raised late') return
    const d = receiptDelayDays(po, r)
    if (d != null) delays.push(d)
  }))
  const avg = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null
  const sup = suppliers.find(s => s.name === name)

  let delivered = 0, faulty = 0
  mine.forEach(po => po.lines.forEach(l => {
    delivered += qtyReceived(po, l.itemId) + qtyFaulty(po, l.itemId)
    faulty += qtyFaulty(po, l.itemId)
  }))

  return {
    supplier: name,
    orders: mine.length,
    completed: mine.filter(p => poStatus(p) === 'received').length,
    value: mine.reduce((s, p) => s + poValue(p), 0),
    quotedLead: sup?.quotedLeadDays ?? null,
    actualLead: avg(leads),
    avgDelay: avg(delays),
    onTimePct: delays.length ? (delays.filter(d => d <= 0).length / delays.length) * 100 : null,
    delivered, faulty,
    faultyPct: delivered > 0 ? (faulty / delivered) * 100 : null,
    openReorders: mine.reduce((s, p) => s + openReorders(p).length, 0),
    repeatFailures: mine.reduce((s, p) =>
      s + p.reorders.filter(r => r.receipt && (r.receipt.damaged + r.receipt.rejected) > 0).length, 0),
    rating: sup?.rating,
  }
}

// ── STOCK ─────────────────────────────────────────────────────────────────

/* One shelf line: a part, on an order, held against a project. Issuing happens
 * from here, which is why the line carries everything an issue needs. */
export interface StockLine {
  key: string
  poId: string
  poNumber: string
  itemId: string
  project: string
  qty: number
  rate: number
  value: number
  /* Days since the receipt that put it there — what turns a stock list into an
   * alert. */
  ageDays: number
  movedHere: boolean
}

export function stockInStore(pos: PurchaseOrder[], today: string): StockLine[] {
  const out: StockLine[] = []

  pos.forEach(po => po.lines.forEach(l => {
    const rate = l.rate
    const lastReceipt = po.receipts
      .filter(r => r.lines.some(x => x.itemId === l.itemId && x.accepted > 0))
      .map(r => r.date).sort().pop()

    // Held against the project it was bought for.
    const home = qtyReceived(po, l.itemId)
      - qtyTransferred(po, l.itemId)
      - qtyIssuedTo(po, l.itemId, po.project)
    if (home > 0) {
      out.push({
        key: `${po.id}|${l.itemId}|${po.project}`,
        poId: po.id, poNumber: po.number, itemId: l.itemId, project: po.project,
        qty: home, rate, value: home * rate,
        ageDays: lastReceipt ? daysBetween(lastReceipt, today) : 0,
        movedHere: false,
      })
    }

    // Held against a project it was moved to. Transfers to the same project
    // are one shelf line, not one per move.
    const byProject: Record<string, { qty: number; last: string }> = {}
    po.transfers.filter(t => t.itemId === l.itemId).forEach(t => {
      const e = byProject[t.toProject] ??= { qty: 0, last: t.date }
      e.qty += t.qty
      if (t.date > e.last) e.last = t.date
    })
    Object.entries(byProject).forEach(([project, e]) => {
      const qty = e.qty - qtyIssuedTo(po, l.itemId, project)
      if (qty <= 0) return
      out.push({
        key: `${po.id}|${l.itemId}|${project}`,
        poId: po.id, poNumber: po.number, itemId: l.itemId, project,
        qty, rate, value: qty * rate,
        ageDays: daysBetween(e.last, today),
        movedHere: true,
      })
    })
  }))

  return out.sort((a, b) => b.value - a.value)
}

export interface OnOrderLine {
  itemId: string; qty: number; value: number
  poNumber: string; supplier: string
  promisedDate?: string; overdueDays: number | null
  awaitingReplacement: boolean
}

export function onOrder(pos: PurchaseOrder[], today: string): OnOrderLine[] {
  const out: OnOrderLine[] = []
  pos.filter(p => p.status !== 'draft').forEach(po => po.lines.forEach(l => {
    const q = qtyAwaitingDelivery(po, l.itemId)
    if (q <= 0) return
    const open = openReorders(po).filter(r => r.itemId === l.itemId)
    // A unit that came and went back is owed on the reorder's promised date,
    // not the order's — otherwise it reads as late from the day it arrived.
    const due = open.length ? (open.map(r => r.promisedDate).filter(Boolean).sort()[0] ?? undefined) : po.promisedDate
    out.push({
      itemId: l.itemId, qty: q, value: q * l.rate, poNumber: po.number, supplier: po.supplier,
      promisedDate: due,
      overdueDays: due && due < today ? daysBetween(due, today) : null,
      awaitingReplacement: open.length > 0,
    })
  }))
  return out.sort((a, b) => (b.overdueDays ?? -1) - (a.overdueDays ?? -1))
}

// ── CONSUMPTION ───────────────────────────────────────────────────────────
/* What left the store for a rig, on the day it left. */
export interface ConsumptionLine {
  date: string; rig: string; project: string
  itemId: string; qty: number; value: number; poNumber: string
}

export function consumption(pos: PurchaseOrder[], f?: { rig?: string; project?: string; month?: string }): ConsumptionLine[] {
  const out: ConsumptionLine[] = []
  pos.forEach(po => po.issues.forEach(i => {
    if (f?.rig && i.rig !== f.rig) return
    if (f?.project && i.project !== f.project) return
    if (f?.month && i.date.slice(0, 7) !== f.month) return
    i.lines.forEach(l => {
      const rate = rateOfLine(po, l.itemId)
      out.push({ date: i.date, rig: i.rig, project: i.project, itemId: l.itemId, qty: l.qty, value: l.qty * rate, poNumber: po.number })
    })
  }))
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export function consumptionValue(pos: PurchaseOrder[], f?: { rig?: string; project?: string; month?: string }) {
  return consumption(pos, f).reduce((s, c) => s + c.value, 0)
}

// ── ALERTS ────────────────────────────────────────────────────────────────

export type AlertKind = 'runningOut' | 'lowStock' | 'overdue' | 'replacement' | 'idle' | 'stranded'
export type AlertLevel = 'info' | 'warn' | 'urgent'

export interface Alert {
  id: string
  kind: AlertKind
  level: AlertLevel
  title: string
  detail: string
  value?: number
}

export interface AlertSettings {
  idleDays: number      // in store this long → flagged
  idleValue: number     // ...or worth at least this much
  coverDays: number     // days of cover to keep beyond lead time
}
export const DEFAULT_ALERTS: AlertSettings = { idleDays: 30, idleValue: 20000, coverDays: 5 }

export interface RigBurn { rig: string; metresPerDay: number; formation: Formation }

/* Things worth being told: stock standing still, deliveries running late,
 * replacements nobody chased, and parts about to run out. The last is the
 * expensive one — a rig standing for want of a bit costs far more per day
 * than the bit. */
export function buildAlerts(
  pos: PurchaseOrder[], parts: Part[], today: string,
  completedProjects: string[], burn: RigBurn[], s: AlertSettings = DEFAULT_ALERTS,
): Alert[] {
  const out: Alert[] = []
  const nameOf = (id: string) => parts.find(p => p.id === id)?.name ?? id
  const stock = stockInStore(pos, today)

  // 1 — stock against a project that has closed.
  stock.filter(l => completedProjects.includes(l.project)).forEach(l => {
    out.push({
      id: `stranded_${l.key}`, kind: 'stranded', level: 'warn',
      title: `${nameOf(l.itemId)} is stranded on a closed project`,
      detail: `${l.qty} in store against ${l.project}, which is complete. Move it to a live project or it stays invisible.`,
      value: l.value,
    })
  })

  // 2 — promised date passed with nothing delivered.
  onOrder(pos, today).forEach(l => {
    if (l.overdueDays == null || l.overdueDays <= 0) return
    out.push({
      id: `late_${l.poNumber}_${l.itemId}`,
      kind: l.awaitingReplacement ? 'replacement' : 'overdue',
      level: l.overdueDays > 14 ? 'urgent' : 'warn',
      title: l.awaitingReplacement
        ? `Replacement for ${nameOf(l.itemId)} is ${l.overdueDays} days late`
        : `${nameOf(l.itemId)} is ${l.overdueDays} days late`,
      detail: `${l.qty} on ${l.poNumber} from ${l.supplier}, due ${l.promisedDate}. Chase it or re-source.`,
      value: l.value,
    })
  })

  // 3 — replacements raised but never sent or chased.
  pos.forEach(po => openReorders(po).forEach(r => {
    if (r.promisedDate && r.promisedDate >= today) return
    if (r.promisedDate) return   // already covered as a late delivery above
    const age = daysBetween(r.raisedDate, today)
    if (age < 7) return
    out.push({
      id: `reorder_open_${r.id}`, kind: 'replacement', level: age > 21 ? 'urgent' : 'warn',
      title: `${nameOf(r.itemId)} sent back ${age} days ago with no replacement date`,
      detail: `${r.qty} on ${po.number} from ${po.supplier} — ${r.reason}. Get a date or ask for a credit.`,
      value: r.qty * rateOfLine(po, r.itemId),
    })
  }))

  // 4 — will run out before a replacement could arrive.
  //
  // Only parts this operation actually buys are considered: you cannot run out
  // of something you have never stocked. Burn is summed across rigs, because
  // the store is shared.
  const have: Record<string, number> = {}
  stock.forEach(l => { have[l.itemId] = (have[l.itemId] ?? 0) + l.qty })

  const everOrdered = new Set(pos.flatMap(p => p.lines.map(l => l.itemId)))
  const totalBurn = burn.reduce((a, b) => a + b.metresPerDay, 0)
  const rigsDrilling = burn.length
  // Ground is weighted by how much of it each rig is drilling, so a fleet
  // mostly in hard rock is not costed as if it were in soft.
  const weighted: Record<Formation, number> = { Soft: 0, Medium: 0, Hard: 0, 'Very Hard': 0 }
  burn.forEach(b => { weighted[b.formation] += b.metresPerDay })

  const live = parts.filter(p => p.active && everOrdered.has(p.id))

  live.forEach(part => {
    const n = have[part.id] ?? 0
    if (totalBurn <= 0 || rigsDrilling === 0) return

    // Cover in days, measured the way the part actually wears out.
    let days: number
    let covers: string
    if (part.wearBasis === 'days') {
      const rigDays = n * part.lifeDays
      days = rigDays / rigsDrilling
      covers = `${rigDays.toLocaleString('en-IN')} rig-days across ${rigsDrilling} drilling rig${rigsDrilling === 1 ? '' : 's'}`
    } else {
      const metresOfLife = part.wearBasis === 'metres'
        ? n * part.lifeMetres
        : FORMATIONS.reduce((a, f) => a + n * part.life[f] * (weighted[f] / totalBurn), 0)
      days = metresOfLife / totalBurn
      covers = `${Math.round(metresOfLife).toLocaleString('en-IN')} m at ${totalBurn.toFixed(1)} m/day across the fleet`
    }
    if (days >= part.leadTimeDays + s.coverDays) return

    const onWay = onOrder(pos, today).filter(o => o.itemId === part.id).reduce((a, o) => a + o.qty, 0)
    // Something already on its way and due in time is not a crisis.
    const level: AlertLevel = days < part.leadTimeDays && onWay === 0 ? 'urgent' : 'warn'
    out.push({
      id: `running_${part.id}`, kind: 'runningOut', level,
      title: n === 0 ? `${part.name} — none in store` : `${part.name} runs out in ${Math.floor(days)} days`,
      detail: `${n} in store covers ${covers}. Lead time is ${part.leadTimeDays} days`
        + (onWay > 0 ? `, and ${onWay} is already on order.` : days < part.leadTimeDays
          ? ' — already too late to avoid a gap.' : ' — order now.'),
      value: Math.max(1, part.minStock - n) * part.rate,
    })
  })

  live.forEach(part => {
    const n = have[part.id] ?? 0
    if (n < part.minStock && !out.some(a => a.id === `running_${part.id}`)) {
      out.push({
        id: `low_${part.id}`, kind: 'lowStock', level: 'info',
        title: `${part.name} is below minimum stock`,
        detail: `${n} in store against a minimum of ${part.minStock}.`,
        value: (part.minStock - n) * part.rate,
      })
    }
  })

  // 5 — received but never sent to a rig. Aggregated per part, and skipped for
  //      anything already flagged as running out: a bit you are about to need
  //      is not idle stock.
  const idle: Record<string, { qty: number; value: number; oldest: number; pos: Set<string> }> = {}
  stock.filter(l => !completedProjects.includes(l.project)).forEach(l => {
    const e = idle[l.itemId] ??= { qty: 0, value: 0, oldest: 0, pos: new Set() }
    e.qty += l.qty; e.value += l.value
    e.oldest = Math.max(e.oldest, l.ageDays)
    e.pos.add(l.poNumber)
  })

  Object.entries(idle).forEach(([itemId, e]) => {
    if (out.some(a => a.id === `running_${itemId}`)) return
    if (e.oldest < s.idleDays && e.value < s.idleValue) return
    out.push({
      id: `idle_${itemId}`, kind: 'idle',
      level: e.oldest >= s.idleDays * 2 ? 'warn' : 'info',
      title: `${nameOf(itemId)} is sitting in the store`,
      detail: `${e.qty} received up to ${e.oldest} days ago on ${Array.from(e.pos).join(', ')}, not yet issued to any rig.`,
      value: e.value,
    })
  })

  const rank: Record<AlertLevel, number> = { urgent: 0, warn: 1, info: 2 }
  return out.sort((a, b) => rank[a.level] - rank[b.level] || (b.value ?? 0) - (a.value ?? 0))
}

/* ==========================================================================
 * SEED
 *
 * The catalogue is the client's own parts sheet, all seventeen items. Their
 * sheet gives one life per part, in metres. Here each part says what wears it
 * out, and their figure is read accordingly:
 *
 *   terrain   their figure taken as the hard-rock case and scaled by ground
 *   metres    their figure as it stands
 *   days      their figure divided by 12 m of drilling a day, so a hard-rock
 *             day costs what it did before. Replace with real day counts as
 *             soon as the yard can give them.
 *
 * Every figure is editable. These are starting points, not claims.
 * ========================================================================== */

const TERRAIN: Record<Formation, number> = { Soft: 2.2, Medium: 1.5, Hard: 1.0, 'Very Hard': 0.6 }
const METRES_PER_DRILLING_DAY = 12

function lives(hardLife: number): Record<Formation, number> {
  return {
    Soft: Math.round(hardLife * TERRAIN.Soft),
    Medium: Math.round(hardLife * TERRAIN.Medium),
    Hard: hardLife,
    'Very Hard': Math.round(hardLife * TERRAIN['Very Hard']),
  }
}

const P = (
  id: string, partNumber: string, name: string, category: PartCategory,
  wearBasis: WearBasis, sheetLife: number, rate: number,
  supplier: string, leadTimeDays: number, minStock: number,
): Part => ({
  id, partNumber, name, category, rate, wearBasis,
  life: lives(sheetLife),
  lifeMetres: sheetLife,
  lifeDays: Math.round(sheetLife / METRES_PER_DRILLING_DAY),
  supplier, leadTimeDays, minStock, active: true,
})

export const SEED_CATALOGUE: Part[] = [
  P('t01', 'HQ-ROD-30', 'HQ Wire Line Drill Rod 3.0 m', 'Rod & Casing', 'metres', 5000, 7840, 'Boart Longyear India', 21, 6),
  P('t02', 'HQ-CB-30', 'HQ Core Barrel 3.0 m', 'Core Barrel', 'metres', 2000, 58800, 'Boart Longyear India', 28, 1),
  P('t03', 'HQ-ITA-01', 'HQ Inner Tube Assembly', 'Core Barrel', 'metres', 2000, 49000, 'Boart Longyear India', 28, 1),
  P('t04', 'HQ-RS-01', 'HQ Diamond Reamer Shell', 'Bit', 'terrain', 500, 17150, 'Sandvik Mining', 18, 2),
  P('t05', 'HQ-OS-01', 'HQ Over Shot Assembly', 'Accessory', 'metres', 2000, 34300, 'Boart Longyear India', 24, 1),
  P('t06', 'HQ-CL-01', 'HQ Core Lifter', 'Accessory', 'terrain', 20, 980, 'Drillco Tools', 10, 20),
  P('t07', 'HQ-CLC-01', 'HQ Core Lifter Case', 'Accessory', 'terrain', 50, 1274, 'Drillco Tools', 10, 12),
  P('t08', 'HQ-BIT-IMP', 'HQ Impregnated Bit', 'Bit', 'terrain', 100, 22000, 'Sandvik Mining', 18, 3),
  P('t09', 'HQ-CB-SPR', 'HQ Core Barrel Spares', 'Spares', 'metres', 500, 37440, 'Boart Longyear India', 28, 1),
  P('t10', 'WS-NQNW-01', 'Water Swivel NQ/NW Connection', 'Accessory', 'days', 5000, 24990, 'Drillco Tools', 14, 1),
  P('t11', 'HP-NQNW-01', 'Hoisting Plug NQ/NW Connection', 'Accessory', 'metres', 5000, 29400, 'Drillco Tools', 14, 1),
  P('t12', 'ADP-01', 'Adaptors', 'Accessory', 'metres', 5000, 4900, 'Drillco Tools', 10, 2),
  P('t13', 'PW-CSG-30', 'PW Casing 3.0 m', 'Rod & Casing', 'metres', 10000, 10780, 'Mahalaxmi Steel', 30, 4),
  P('t14', 'HW-CSG-30', 'HW Casing 3.0 m', 'Rod & Casing', 'metres', 10000, 8820, 'Mahalaxmi Steel', 30, 4),
  P('t15', 'PW-TC-BIT', 'PW Casing TC Bit', 'Bit', 'metres', 200, 5390, 'Mahalaxmi Steel', 30, 2),
  P('t16', 'HW-TC-BIT', 'HW Casing TC / Shoe Bit', 'Bit', 'metres', 200, 3773, 'Mahalaxmi Steel', 30, 2),
  P('t17', 'WS-SPR-02', 'Water Swivel Spares, 2 sets', 'Spares', 'days', 2000, 25000, 'Drillco Tools', 14, 1),
]

export const SEED_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Boart Longyear India', contact: 'R. Menon', phone: '+91 98450 11234', quotedLeadDays: 25, rating: 5, ratingNote: 'Reliable, never had to chase' },
  { id: 's2', name: 'Sandvik Mining', contact: 'A. Deshpande', phone: '+91 99870 44521', quotedLeadDays: 18, rating: 4 },
  { id: 's3', name: 'Drillco Tools', contact: 'S. Iyer', phone: '+91 90035 77810', quotedLeadDays: 12, rating: 2, ratingNote: 'Cheap but slow, and packaging is poor' },
  { id: 's4', name: 'Mahalaxmi Steel', contact: 'P. Shah', phone: '+91 98200 33456', quotedLeadDays: 30, rating: 3 },
]

const seedRate = (id: string) => SEED_CATALOGUE.find(p => p.id === id)!.rate

/* [itemId, accepted, damaged, rejected] */
type RLine = [string, number, number?, number?]
/* [date, rig, [[itemId, qty]]] — the project is the order's unless moved */
type ISpec = [string, string, [string, number][]]

const PO = (
  id: string, number: string, supplier: string, project: string,
  createdDate: string, orderedDate: string, promisedDate: string,
  lines: [string, number][],
  receipts: [string, RLine[], DelayReason?][],
  issues: ISpec[],
  reorders: Reorder[] = [],
): PurchaseOrder => ({
  id, number, supplier, project, status: 'ordered', createdDate, orderedDate, promisedDate,
  lines: lines.map(([itemId, qty]) => ({ itemId, qty, rate: seedRate(itemId) })),
  receipts: receipts.map(([date, ls, delayReason], k) => ({
    id: `${id}_r${k}`, date, delayReason,
    lines: ls.map(([itemId, accepted, damaged = 0, rejected = 0]) => ({ itemId, accepted, damaged, rejected })),
  })),
  issues: issues.map(([date, rig, ls], k) => ({
    id: `${id}_i${k}`, date, project, rig, issuedBy: 'Store',
    lines: ls.map(([itemId, qty]) => ({ itemId, qty })),
  })),
  reorders, transfers: [],
})

export const SEED_POS: PurchaseOrder[] = [
  // Delivered two days early, mostly issued.
  PO('po1', 'PO-2026-041', 'Sandvik Mining', 'Site A - North Field', '2026-07-02', '2026-07-03', '2026-07-21',
    [['t08', 3], ['t04', 2]],
    [['2026-07-19', [['t08', 3], ['t04', 2]]]],
    [['2026-08-01', 'RIG-001', [['t08', 1]]], ['2026-08-16', 'RIG-001', [['t04', 1]]], ['2026-08-02', 'RIG-002', [['t08', 1]]]]),

  // Part-delivered: casing arrived, rods still outstanding and now overdue.
  PO('po2', 'PO-2026-047', 'Mahalaxmi Steel', 'Site A - North Field', '2026-07-10', '2026-07-11', '2026-08-10',
    [['t13', 4], ['t14', 4], ['t16', 2]],
    [['2026-08-06', [['t14', 4]]]],
    []),

  // Arrived nine days late, and two lifter cases came in cracked — so they
  // never entered the store, and a replacement is running on its own line.
  PO('po3', 'PO-2026-052', 'Drillco Tools', 'Site A - North Field', '2026-07-18', '2026-07-19', '2026-07-31',
    [['t06', 30], ['t07', 20], ['t12', 2]],
    [['2026-08-09', [['t06', 30], ['t07', 18, 2], ['t12', 2]], 'Transport']],
    [['2026-08-12', 'RIG-001', [['t06', 2]]], ['2026-08-24', 'RIG-001', [['t06', 3]]], ['2026-08-14', 'RIG-002', [['t06', 2]]]],
    [{
      id: 'ro_1', itemId: 't07', qty: 2, reason: 'Cases cracked in transit',
      raisedDate: '2026-08-10', round: 1, status: 'promised', promisedDate: '2026-09-15',
    }]),

  // Received in June, barely touched — the idle-stock case.
  PO('po4', 'PO-2026-033', 'Boart Longyear India', 'Site A - North Field', '2026-06-05', '2026-06-06', '2026-07-01',
    [['t03', 1], ['t09', 1], ['t05', 1]],
    [['2026-06-28', [['t03', 1], ['t09', 1], ['t05', 1]]]],
    [['2026-08-13', 'RIG-001', [['t03', 1]]]]),

  // Site B.
  PO('po5', 'PO-2026-055', 'Sandvik Mining', 'Site B - South Ridge', '2026-07-20', '2026-07-21', '2026-08-08',
    [['t08', 2], ['t04', 1]],
    [['2026-08-05', [['t08', 2], ['t04', 1]]]],
    [['2026-08-07', 'RIG-003', [['t08', 1]]]]),

  // Bought against a project that has since closed — stranded stock.
  PO('po6', 'PO-2026-018', 'Drillco Tools', 'Site C - East Basin', '2026-05-02', '2026-05-03', '2026-05-20',
    [['t10', 1], ['t17', 1]],
    [['2026-05-18', [['t10', 1], ['t17', 1]]]],
    []),

  // Placed and confirmed, nothing delivered yet — the ordered state.
  PO('po7', 'PO-2026-058', 'Boart Longyear India', 'Site A - North Field', '2026-08-20', '2026-08-21', '2026-09-18',
    [['t01', 6], ['t02', 1]],
    [],
    []),

  // The replacement that failed twice. One inner tube arrived damaged, the
  // replacement arrived damaged as well, and a second replacement is now owed.
  PO('po9', 'PO-2026-060', 'Boart Longyear India', 'Site A - North Field', '2026-08-02', '2026-08-03', '2026-08-24',
    [['t03', 2]],
    [['2026-08-20', [['t03', 1, 1]]]],
    [],
    [
      {
        id: 'ro_2', itemId: 't03', qty: 1, reason: 'Tube bent, latch would not seat',
        raisedDate: '2026-08-21', round: 1, status: 'closed', promisedDate: '2026-09-02',
        receipt: { date: '2026-09-02', accepted: 0, damaged: 1, rejected: 0, note: 'Same fault again' },
      },
      {
        id: 'ro_3', itemId: 't03', qty: 1, reason: 'Replacement arrived with the same fault',
        raisedDate: '2026-09-02', round: 2, parentId: 'ro_2', status: 'promised', promisedDate: '2026-09-25',
      },
    ]),

  // Never placed.
  {
    id: 'po8', number: 'PO-2026-061', supplier: 'Drillco Tools', project: 'Site A - North Field',
    status: 'draft', createdDate: '2026-09-01',
    lines: [{ itemId: 't06', qty: 40, rate: seedRate('t06') }, { itemId: 't07', qty: 25, rate: seedRate('t07') }],
    receipts: [], reorders: [], issues: [], transfers: [], note: 'Awaiting approval',
  },
]

export const PROJECTS = ['Site A - North Field', 'Site B - South Ridge', 'Site C - East Basin']
export const COMPLETED_PROJECTS = ['Site C - East Basin']
export const RIGS = ['RIG-001', 'RIG-002', 'RIG-003']
export const PROJECT_CODES: Record<string, string> = {
  'Site A - North Field': 'PRJ-001',
  'Site B - South Ridge': 'PRJ-002',
  'Site C - East Basin': 'PRJ-003',
}
export function projectCode(name: string) {
  return PROJECT_CODES[name] ?? name.match(/^([A-Za-z]+-\d+)/)?.[1] ?? name
}
export function isLiveProject(name: string) {
  return !COMPLETED_PROJECTS.includes(name)
}

/* ==========================================================================
 * STORE
 * ========================================================================== */

interface State {
  catalogue: Part[]
  suppliers: Supplier[]
  pos: PurchaseOrder[]
  alerts: AlertSettings
}

function initial(): State {
  return { catalogue: SEED_CATALOGUE, suppliers: SEED_SUPPLIERS, pos: SEED_POS, alerts: DEFAULT_ALERTS }
}

/* A counter, not just a timestamp: raising four reorders at once happens inside
 * the same millisecond, and two rows sharing an id would make one of them
 * unaddressable. */
let seq = 0
export const uid = (p: string) => `${p}_${Date.now()}_${++seq}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  savePart: (p: Part) => void
  importParts: (parts: Part[]) => void
  deletePart: (id: string) => void
  saveSupplier: (s: Supplier) => void
  savePO: (po: PurchaseOrder) => void
  deletePO: (id: string) => void
  placeOrder: (id: string, orderedDate: string, promisedDate: string) => void
  addReceipt: (poId: string, r: Omit<Receipt, 'id'>) => void
  addReorder: (poId: string, r: Omit<Reorder, 'id'>) => void
  updateReorder: (poId: string, r: Reorder) => void
  receiveReorder: (poId: string, reorderId: string, receipt: ReorderReceipt) => void
  addIssue: (poId: string, i: Omit<Issue, 'id'>) => void
  addTransfer: (poId: string, t: Omit<Transfer, 'id'>) => void
  saveAlertSettings: (s: AlertSettings) => void
  resetAll: () => void
}

const InvCtx = createContext<Ctx | null>(null)
const KEY = 'xplorix_inventory_v3'

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial)
  const [loaded, setLoaded] = useState(false)

  // Merged over initial() rather than replacing it, so a saved state from an
  // earlier build that is missing a key degrades instead of crashing.
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setState(s => ({ ...initial(), ...JSON.parse(raw) })) } catch {}
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {} }, [state, loaded])

  function up<T extends { id: string }>(list: T[], x: T): T[] {
    return list.some(i => i.id === x.id) ? list.map(i => i.id === x.id ? x : i) : [...list, x]
  }
  const onPO = (id: string, f: (po: PurchaseOrder) => PurchaseOrder) =>
    setState(s => ({ ...s, pos: s.pos.map(p => p.id === id ? f(p) : p) }))

  return (
    <InvCtx.Provider value={{
      state,
      savePart: p => setState(s => ({ ...s, catalogue: up(s.catalogue, p) })),
      /* Matched on part number first, then name, so re-importing a corrected
       * sheet updates rather than duplicating. */
      importParts: parts => setState(s => {
        let cat = s.catalogue
        parts.forEach(p => {
          const existing = cat.find(x =>
            (p.partNumber && x.partNumber.toLowerCase() === p.partNumber.toLowerCase()) ||
            x.name.toLowerCase() === p.name.toLowerCase())
          cat = existing ? cat.map(x => x.id === existing.id ? { ...p, id: existing.id } : x) : [...cat, p]
        })
        return { ...s, catalogue: cat }
      }),
      /* Retire rather than delete anything an order or a log still points at,
       * so history keeps its names. */
      deletePart: id => setState(s => {
        const used = s.pos.some(p => p.lines.some(l => l.itemId === id))
        return {
          ...s,
          catalogue: used
            ? s.catalogue.map(p => p.id === id ? { ...p, active: false } : p)
            : s.catalogue.filter(p => p.id !== id),
        }
      }),
      saveSupplier: x => setState(s => ({ ...s, suppliers: up(s.suppliers, x) })),
      savePO: po => setState(s => ({ ...s, pos: up(s.pos, po) })),
      deletePO: id => setState(s => ({ ...s, pos: s.pos.filter(p => p.id !== id) })),
      placeOrder: (id, orderedDate, promisedDate) =>
        onPO(id, p => ({ ...p, status: 'ordered', orderedDate, promisedDate })),
      addReceipt: (poId, r) => onPO(poId, p => ({ ...p, receipts: [...p.receipts, { ...r, id: uid('rc') }] })),
      addReorder: (poId, r) => onPO(poId, p => ({ ...p, reorders: [...p.reorders, { ...r, id: uid('ro') }] })),
      updateReorder: (poId, r) => onPO(poId, p => ({ ...p, reorders: p.reorders.map(x => x.id === r.id ? r : x) })),
      /* Receiving a replacement closes that line. Anything faulty again opens
       * the next round against the same order, so the chain is unbroken and
       * nothing quietly disappears. */
      receiveReorder: (poId, reorderId, receipt) => onPO(poId, p => {
        const target = p.reorders.find(r => r.id === reorderId)
        if (!target) return p
        const closed: Reorder = { ...target, receipt, status: 'closed' }
        const faulty = receipt.damaged + receipt.rejected
        const next: Reorder[] = faulty > 0 ? [{
          id: uid('ro'), itemId: target.itemId, qty: faulty,
          reason: `Round ${target.round} replacement arrived unusable`,
          raisedDate: receipt.date, round: target.round + 1, parentId: target.id,
          status: 'raised',
        }] : []
        return { ...p, reorders: [...p.reorders.map(r => r.id === reorderId ? closed : r), ...next] }
      }),
      addIssue: (poId, i) => onPO(poId, p => ({ ...p, issues: [...p.issues, { ...i, id: uid('is') }] })),
      addTransfer: (poId, t) => onPO(poId, p => ({ ...p, transfers: [...p.transfers, { ...t, id: uid('tr') }] })),
      saveAlertSettings: a => setState(s => ({ ...s, alerts: a })),
      resetAll: () => setState(initial()),
    }}>{children}</InvCtx.Provider>
  )
}

export function useInventory() {
  const c = useContext(InvCtx)
  if (!c) throw new Error('useInventory must be used inside InventoryProvider')
  return c
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

export function money(n: number) {
  return `${n < 0 ? '−' : ''}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`
}
export function moneyL(n: number) {
  const a = Math.abs(n)
  if (a >= 10000000) return `${n < 0 ? '−' : ''}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${n < 0 ? '−' : ''}₹${(a / 100000).toFixed(1)}L`
  return money(n)
}
export function perMetre(n: number) { return `₹${n.toFixed(2)}/m` }
export function perDay(n: number) { return `₹${n.toFixed(2)}/day` }
export function dayLabel(d: string) {
  const [, m, day] = d.split('-').map(Number)
  return `${day} ${MON[m - 1]}`
}
export function fullDate(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  return `${day} ${MON[m - 1]} ${y}`
}
export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
