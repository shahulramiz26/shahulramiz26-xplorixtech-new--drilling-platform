'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/* ==========================================================================
 * XPLORIX INVENTORY
 *
 * The idea this module rests on comes from the client's own tooling sheet: a
 * drilling consumable is not an expense on the day you buy it, it is a cost
 * spread across the metres it drills.
 *
 *     cost per metre = rate / life in metres
 *     ₹22,000 bit / 100 m = ₹220 per metre
 *
 * Their sheet totals ₹548.41 per metre across seventeen items. XPLORIX takes
 * that model and adds the thing a spreadsheet cannot hold: life varies with
 * the ground. A bit that runs 220 m through soft rock will not see 60 m in
 * very hard, so cost per metre follows the formation the driller recorded
 * rather than one blended figure.
 *
 * That gives two numbers worth comparing:
 *
 *   expected   catalogue rate / expected life  — what you tender on
 *   actual     what tooling really cost, per metre really drilled
 *
 * When actual runs above expected, something is wearing faster than the tender
 * assumed and the next quote is already wrong.
 * ========================================================================== */

// ── FORMATIONS ────────────────────────────────────────────────────────────
/* Matches the driller's log. Life is held per formation, so what a metre costs
 * depends on what it was drilled through. */
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

// ── CATALOGUE ─────────────────────────────────────────────────────────────

export type ToolCategory = 'Bit' | 'Rod & Casing' | 'Core Barrel' | 'Accessory' | 'Spares'
export const CATEGORIES: ToolCategory[] = ['Bit', 'Rod & Casing', 'Core Barrel', 'Accessory', 'Spares']

export interface ToolingItem {
  id: string
  name: string
  category: ToolCategory
  rate: number                       // ₹ per unit
  life: Record<Formation, number>    // metres before replacement
  supplier: string
  leadTimeDays: number
  minStock: number                   // below this, reordering is already late
  active: boolean
}

/* rate / life. The single calculation the whole module rests on. */
export function costPerMetre(item: ToolingItem, f: Formation): number {
  const life = item.life[f]
  return life > 0 ? item.rate / life : 0
}

/* What a metre of a given formation costs in tooling, across the catalogue.
 * This is the client's ₹548.41, recomputed per formation. */
export function toolingPerMetre(items: ToolingItem[], f: Formation): number {
  return items.filter(i => i.active).reduce((s, i) => s + costPerMetre(i, f), 0)
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

/* Receipts are partial and dated, the same way issues are. Stock that arrived
 * last week carries last week's date, not today's. */
export interface Receipt {
  id: string
  date: string
  lines: ReceiptLine[]
  delayReason?: DelayReason      // recorded only when it arrived late
  note?: string
  /* Set when this receipt is a replacement for a returned item, so it does not
   * count again as new spend. */
  replacesReturn?: string
}

// ── RETURNS ───────────────────────────────────────────────────────────────
/* A damaged unit goes back to the supplier and follows its own course. The
 * replacement arrives as a further receipt against the same order, so the line
 * eventually reconciles rather than looking short forever. */
export type ReturnStatus = 'raised' | 'sent' | 'replacementPromised' | 'replaced' | 'credited'
export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  raised: 'Raised', sent: 'Sent back', replacementPromised: 'Replacement promised',
  replaced: 'Replaced', credited: 'Credited',
}

export interface ReturnRecord {
  id: string
  date: string
  itemId: string
  qty: number
  reason: string
  status: ReturnStatus
  promisedDate?: string
  closedDate?: string
  note?: string
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

export interface Issue {
  id: string
  date: string
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
  issues: Issue[]
  returns: ReturnRecord[]
  transfers: Transfer[]
  note?: string
}

export function poValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + l.qty * l.rate, 0)
}
export function qtyOrdered(po: PurchaseOrder, itemId: string) {
  return po.lines.filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0)
}
/* Only accepted units count as received. Damaged and rejected ones arrived but
 * cannot be used, so they are tracked separately. */
export function qtyReceived(po: PurchaseOrder, itemId: string) {
  return po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.accepted, 0)
}
export function qtyDamaged(po: PurchaseOrder, itemId: string) {
  return po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.damaged, 0)
}
export function qtyRejected(po: PurchaseOrder, itemId: string) {
  return po.receipts.flatMap(r => r.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.rejected, 0)
}
export function qtyDelivered(po: PurchaseOrder, itemId: string) {
  return qtyReceived(po, itemId) + qtyDamaged(po, itemId) + qtyRejected(po, itemId)
}
export function qtyTransferred(po: PurchaseOrder, itemId: string) {
  return po.transfers.filter(t => t.itemId === itemId).reduce((s, t) => s + t.qty, 0)
}
export function qtyIssued(po: PurchaseOrder, itemId: string) {
  return po.issues.flatMap(i => i.lines).filter(l => l.itemId === itemId).reduce((s, l) => s + l.qty, 0)
}
/* Damaged units still count as outstanding — the supplier owes a replacement. */
export function qtyAwaitingDelivery(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyOrdered(po, itemId) - qtyReceived(po, itemId))
}
/* Received into the store, not yet sent to a rig and not moved elsewhere. */
export function qtyInStore(po: PurchaseOrder, itemId: string) {
  return Math.max(0, qtyReceived(po, itemId) - qtyIssued(po, itemId) - qtyTransferred(po, itemId))
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
export function poDamagedValue(po: PurchaseOrder) {
  return po.lines.reduce((s, l) => s + qtyDamaged(po, l.itemId) * l.rate, 0)
}
export function openReturns(po: PurchaseOrder) {
  return po.returns.filter(r => r.status !== 'replaced' && r.status !== 'credited')
}

/* Derived, never stored, so it cannot drift from the receipts underneath. */
export function poStatus(po: PurchaseOrder): POStatus {
  if (po.status === 'draft') return 'draft'
  if (po.lines.every(l => qtyReceived(po, l.itemId) >= l.qty)) return 'received'
  return po.receipts.length > 0 ? 'partial' : 'ordered'
}

export function daysBetween(from: string, to: string) {
  return Math.round((new Date(to + 'T00:00:00').getTime() - new Date(from + 'T00:00:00').getTime()) / 86400000)
}

/* Promised against actual, per receipt. Negative is early. */
export function receiptDelayDays(po: PurchaseOrder, r: Receipt): number | null {
  return po.promisedDate ? daysBetween(po.promisedDate, r.date) : null
}

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
  damaged: number
  damagePct: number | null
  openReturns: number
  rating?: number
}

/* Lead time is measured from what happened, not from a rating field. */
export function supplierPerformance(pos: PurchaseOrder[], suppliers: Supplier[], name: string): SupplierPerformance {
  const mine = pos.filter(p => p.supplier === name && p.status !== 'draft')
  const leads: number[] = []
  const delays: number[] = []
  mine.forEach(po => po.receipts.forEach(r => {
    if (po.orderedDate) leads.push(daysBetween(po.orderedDate, r.date))
    const d = receiptDelayDays(po, r)
    if (d != null) delays.push(d)
  }))
  const avg = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null
  const sup = suppliers.find(s => s.name === name)

  let delivered = 0, damaged = 0
  mine.forEach(po => po.lines.forEach(l => {
    delivered += qtyDelivered(po, l.itemId)
    damaged += qtyDamaged(po, l.itemId) + qtyRejected(po, l.itemId)
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
    delivered, damaged,
    damagePct: delivered > 0 ? (damaged / delivered) * 100 : null,
    openReturns: mine.reduce((s, p) => s + openReturns(p).length, 0),
    rating: sup?.rating,
  }
}

// ── STOCK ─────────────────────────────────────────────────────────────────

export interface StockLine {
  itemId: string
  qty: number
  value: number
  project: string
  poNumber: string
  /* Days since the receipt that put it there — what turns a stock list into an
   * alert. */
  ageDays: number
}

export function stockInStore(pos: PurchaseOrder[], today: string): StockLine[] {
  const out: StockLine[] = []
  pos.forEach(po => po.lines.forEach(l => {
    const q = qtyInStore(po, l.itemId)
    if (q <= 0) return
    const last = po.receipts.filter(r => r.lines.some(x => x.itemId === l.itemId)).map(r => r.date).sort().pop()
    out.push({
      itemId: l.itemId, qty: q, value: q * l.rate, project: po.project,
      poNumber: po.number, ageDays: last ? daysBetween(last, today) : 0,
    })
  }))
  // Anything moved off a closed project shows against the project it moved to.
  pos.forEach(po => po.transfers.forEach(t => {
    const rate = po.lines.find(l => l.itemId === t.itemId)?.rate ?? 0
    out.push({
      itemId: t.itemId, qty: t.qty, value: t.qty * rate, project: t.toProject,
      poNumber: po.number, ageDays: daysBetween(t.date, today),
    })
  }))
  return out.sort((a, b) => b.value - a.value)
}

export interface OnOrderLine {
  itemId: string; qty: number; value: number
  poNumber: string; supplier: string
  promisedDate?: string; overdueDays: number | null
}

export function onOrder(pos: PurchaseOrder[], today: string): OnOrderLine[] {
  const out: OnOrderLine[] = []
  pos.filter(p => p.status !== 'draft').forEach(po => po.lines.forEach(l => {
    const q = qtyAwaitingDelivery(po, l.itemId)
    if (q <= 0) return
    out.push({
      itemId: l.itemId, qty: q, value: q * l.rate, poNumber: po.number, supplier: po.supplier,
      promisedDate: po.promisedDate,
      overdueDays: po.promisedDate && po.promisedDate < today ? daysBetween(po.promisedDate, today) : null,
    })
  }))
  return out.sort((a, b) => (b.overdueDays ?? -1) - (a.overdueDays ?? -1))
}

// ── CONSUMPTION ───────────────────────────────────────────────────────────
/* What was issued to a rig, on the day it was issued. The actual side of the
 * comparison; the expected side comes from the catalogue. */
export interface ConsumptionLine {
  date: string; rig: string; project: string
  itemId: string; qty: number; value: number; poNumber: string
}

export function consumption(pos: PurchaseOrder[], f?: { rig?: string; project?: string; month?: string }): ConsumptionLine[] {
  const out: ConsumptionLine[] = []
  pos.forEach(po => po.issues.forEach(i => {
    if (f?.rig && i.rig !== f.rig) return
    if (f?.project && po.project !== f.project) return
    if (f?.month && i.date.slice(0, 7) !== f.month) return
    i.lines.forEach(l => {
      const rate = po.lines.find(x => x.itemId === l.itemId)?.rate ?? 0
      out.push({ date: i.date, rig: i.rig, project: po.project, itemId: l.itemId, qty: l.qty, value: l.qty * rate, poNumber: po.number })
    })
  }))
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export function consumptionValue(pos: PurchaseOrder[], f?: { rig?: string; project?: string; month?: string }) {
  return consumption(pos, f).reduce((s, c) => s + c.value, 0)
}

// ── ALERTS ────────────────────────────────────────────────────────────────

export type AlertKind = 'idle' | 'stranded' | 'overdue' | 'reorder' | 'lowStock'
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

/* Three things worth being told: stock standing still, deliveries running
 * late, and tooling about to run out. The last is the expensive one — a rig
 * standing for want of a bit costs far more per day than the bit. */
export function buildAlerts(
  pos: PurchaseOrder[], items: ToolingItem[], today: string,
  completedProjects: string[], burn: RigBurn[], s: AlertSettings = DEFAULT_ALERTS,
): Alert[] {
  const out: Alert[] = []
  const nameOf = (id: string) => items.find(i => i.id === id)?.name ?? id
  const stock = stockInStore(pos, today)

  // 1 — stock against a project that has closed. Stranded rather than merely
  //      slow, so it is called out separately and never suppressed.
  stock.filter(l => completedProjects.includes(l.project)).forEach(l => {
    out.push({
      id: `stranded_${l.poNumber}_${l.itemId}`, kind: 'stranded', level: 'warn',
      title: `${nameOf(l.itemId)} stranded on a closed project`,
      detail: `${l.qty} in store against ${l.project}, which is complete. Move it to a live project or it stays invisible.`,
      value: l.value,
    })
  })

  // 2 — promised date passed with nothing delivered
  onOrder(pos, today).forEach(l => {
    if (l.overdueDays == null || l.overdueDays <= 0) return
    out.push({
      id: `late_${l.poNumber}_${l.itemId}`, kind: 'overdue',
      level: l.overdueDays > 14 ? 'urgent' : 'warn',
      title: `${nameOf(l.itemId)} is ${l.overdueDays} days late`,
      detail: `${l.qty} on ${l.poNumber} from ${l.supplier}, promised ${l.promisedDate}. Chase it or re-source.`,
      value: l.value,
    })
  })

  // 3 — will run out before a replacement could arrive.
  //
  // Only items this operation actually buys are considered: you cannot run out
  // of something you have never stocked, and warning about all of them would
  // bury the two or three that matter. Burn is summed across rigs rather than
  // raising one alert per rig, because the store is shared.
  const have: Record<string, number> = {}
  stock.forEach(l => { have[l.itemId] = (have[l.itemId] ?? 0) + l.qty })

  const everOrdered = new Set(pos.flatMap(p => p.lines.map(l => l.itemId)))
  const totalBurn = burn.reduce((s2, b) => s2 + b.metresPerDay, 0)
  // Ground is weighted by how much of it each rig is drilling, so a fleet
  // mostly in hard rock is not costed as if it were in soft.
  const weighted: Record<Formation, number> = { Soft: 0, Medium: 0, Hard: 0, 'Very Hard': 0 }
  burn.forEach(b => { weighted[b.formation] += b.metresPerDay })

  items.filter(i => i.active && everOrdered.has(i.id)).forEach(item => {
    const n = have[item.id] ?? 0
    if (totalBurn <= 0) return

    // Metres of life in stock, against the mix of ground actually being drilled.
    const metresOfLife = FORMATIONS.reduce((s2, f) => {
      const share = weighted[f] / totalBurn
      return s2 + (item.life[f] > 0 ? n * item.life[f] * share : 0)
    }, 0)
    const days = metresOfLife / totalBurn
    if (days >= item.leadTimeDays + s.coverDays) return

    const onWay = onOrder(pos, today).filter(o => o.itemId === item.id).reduce((a, o) => a + o.qty, 0)
    out.push({
      id: `reorder_${item.id}`, kind: 'reorder',
      level: days < item.leadTimeDays ? 'urgent' : 'warn',
      title: n === 0
        ? `${item.name} — none in store`
        : `${item.name} runs out in ${Math.floor(days)} days`,
      detail: `${n} in store covers ${Math.round(metresOfLife)} m across the fleet at ${totalBurn.toFixed(1)} m/day. `
        + `Lead time is ${item.leadTimeDays} days`
        + (onWay > 0 ? `, and ${onWay} is already on order.` : ` — ${days < item.leadTimeDays ? 'already too late to avoid a gap' : 'order now'}.`),
      value: Math.max(1, item.minStock - n) * item.rate,
    })
  })

  items.filter(i => i.active && everOrdered.has(i.id)).forEach(item => {
    const n = have[item.id] ?? 0
    // Only worth saying if it isn't already covered by a reorder warning.
    if (n < item.minStock && !out.some(a => a.id === `reorder_${item.id}`)) {
      out.push({
        id: `low_${item.id}`, kind: 'lowStock', level: 'info',
        title: `${item.name} below minimum stock`,
        detail: `${n} in store against a minimum of ${item.minStock}.`,
        value: (item.minStock - n) * item.rate,
      })
    }
  })

  // 4 — received but never sent to a rig. Aggregated per item rather than per
  //      purchase order, and skipped entirely for anything already flagged as
  //      running out: a bit you are about to need is not idle stock.
  const idleByItem: Record<string, { qty: number; value: number; oldest: number; pos: Set<string> }> = {}
  stock.filter(l => !completedProjects.includes(l.project)).forEach(l => {
    const e = idleByItem[l.itemId] ??= { qty: 0, value: 0, oldest: 0, pos: new Set() }
    e.qty += l.qty; e.value += l.value
    e.oldest = Math.max(e.oldest, l.ageDays)
    e.pos.add(l.poNumber)
  })

  Object.entries(idleByItem).forEach(([itemId, e]) => {
    if (out.some(a => a.id === `reorder_${itemId}`)) return
    if (e.oldest < s.idleDays && e.value < s.idleValue) return
    out.push({
      id: `idle_${itemId}`, kind: 'idle',
      level: e.oldest >= s.idleDays * 2 ? 'warn' : 'info',
      title: `${nameOf(itemId)} sitting in store`,
      detail: `${e.qty} received up to ${e.oldest} days ago on ${Array.from(e.pos).join(', ')}, not yet issued to any rig.`,
      value: e.value,
    })
  })

  const rank: Record<AlertLevel, number> = { urgent: 0, warn: 1, info: 2 }
  return out.sort((a, b) => rank[a.level] - rank[b.level] || (b.value ?? 0) - (a.value ?? 0))
}

/* ==========================================================================
 * SEED
 * The catalogue is the client's own tooling sheet, all seventeen items. Their
 * sheet gives one life per item; XPLORIX splits that by formation, taking
 * their figure as the hard-rock case and scaling from there. Every figure is
 * editable — these are starting points, not claims.
 * ========================================================================== */

const TERRAIN: Record<Formation, number> = { Soft: 2.2, Medium: 1.5, Hard: 1.0, 'Very Hard': 0.6 }

function lives(hardLife: number): Record<Formation, number> {
  return {
    Soft: Math.round(hardLife * TERRAIN.Soft),
    Medium: Math.round(hardLife * TERRAIN.Medium),
    Hard: hardLife,
    'Very Hard': Math.round(hardLife * TERRAIN['Very Hard']),
  }
}

const T = (id: string, name: string, category: ToolCategory, hardLife: number, rate: number,
           supplier: string, leadTimeDays: number, minStock: number): ToolingItem =>
  ({ id, name, category, rate, life: lives(hardLife), supplier, leadTimeDays, minStock, active: true })

export const SEED_CATALOGUE: ToolingItem[] = [
  T('t01', 'HQ Wire Line Drill Rod 3.0 m', 'Rod & Casing', 5000, 7840, 'Boart Longyear India', 21, 6),
  T('t02', 'HQ Core Barrel 3.0 m', 'Core Barrel', 2000, 58800, 'Boart Longyear India', 28, 1),
  T('t03', 'HQ Inner Tube Assembly', 'Core Barrel', 2000, 49000, 'Boart Longyear India', 28, 1),
  T('t04', 'HQ Diamond Reamer Shell', 'Bit', 500, 17150, 'Sandvik Mining', 18, 2),
  T('t05', 'HQ Over Shot Assembly', 'Accessory', 2000, 34300, 'Boart Longyear India', 24, 1),
  T('t06', 'HQ Core Lifter', 'Accessory', 20, 980, 'Drillco Tools', 10, 20),
  T('t07', 'HQ Core Lifter Case', 'Accessory', 50, 1274, 'Drillco Tools', 10, 12),
  T('t08', 'HQ Impregnated Bit', 'Bit', 100, 22000, 'Sandvik Mining', 18, 3),
  T('t09', 'HQ Core Barrel Spares', 'Spares', 500, 37440, 'Boart Longyear India', 28, 1),
  T('t10', 'Water Swivel NQ/NW Connection', 'Accessory', 5000, 24990, 'Drillco Tools', 14, 1),
  T('t11', 'Hoisting Plug NQ/NW Connection', 'Accessory', 5000, 29400, 'Drillco Tools', 14, 1),
  T('t12', 'Adaptors', 'Accessory', 5000, 4900, 'Drillco Tools', 10, 2),
  T('t13', 'PW Casing 3.0 m', 'Rod & Casing', 10000, 10780, 'Mahalaxmi Steel', 30, 4),
  T('t14', 'HW Casing 3.0 m', 'Rod & Casing', 10000, 8820, 'Mahalaxmi Steel', 30, 4),
  T('t15', 'PW Casing TC Bit', 'Bit', 200, 5390, 'Mahalaxmi Steel', 30, 2),
  T('t16', 'HW Casing TC / Shoe Bit', 'Bit', 200, 3773, 'Mahalaxmi Steel', 30, 2),
  T('t17', 'Water Swivel Spares, 2 sets', 'Spares', 2000, 25000, 'Drillco Tools', 14, 1),
]

export const SEED_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Boart Longyear India', contact: 'R. Menon', phone: '+91 98450 11234', quotedLeadDays: 25, rating: 5, ratingNote: 'Reliable, never had to chase' },
  { id: 's2', name: 'Sandvik Mining', contact: 'A. Deshpande', phone: '+91 99870 44521', quotedLeadDays: 18, rating: 4 },
  { id: 's3', name: 'Drillco Tools', contact: 'S. Iyer', phone: '+91 90035 77810', quotedLeadDays: 12, rating: 2, ratingNote: 'Cheap but slow, and packaging is poor' },
  { id: 's4', name: 'Mahalaxmi Steel', contact: 'P. Shah', phone: '+91 98200 33456', quotedLeadDays: 30, rating: 3 },
]

const rateOf = (id: string) => SEED_CATALOGUE.find(t => t.id === id)!.rate

/* [itemId, accepted, damaged, rejected] */
type RLine = [string, number, number?, number?]

const PO = (
  id: string, number: string, supplier: string, project: string,
  createdDate: string, orderedDate: string, promisedDate: string,
  lines: [string, number][],
  receipts: [string, RLine[], DelayReason?][],
  issues: [string, string, [string, number][]][],
  returns: ReturnRecord[] = [],
): PurchaseOrder => ({
  id, number, supplier, project, status: 'ordered', createdDate, orderedDate, promisedDate,
  lines: lines.map(([itemId, qty]) => ({ itemId, qty, rate: rateOf(itemId) })),
  receipts: receipts.map(([date, ls, delayReason], k) => ({
    id: `${id}_r${k}`, date, delayReason,
    lines: ls.map(([itemId, accepted, damaged = 0, rejected = 0]) => ({ itemId, accepted, damaged, rejected })),
  })),
  issues: issues.map(([date, rig, ls], k) => ({
    id: `${id}_i${k}`, date, rig, issuedBy: 'Store',
    lines: ls.map(([itemId, qty]) => ({ itemId, qty })),
  })),
  returns, transfers: [],
})

export const SEED_POS: PurchaseOrder[] = [
  // Delivered two days early, mostly issued.
  PO('po1', 'PO-2026-041', 'Sandvik Mining', 'Site A - North Field', '2026-07-02', '2026-07-03', '2026-07-21',
    [['t08', 3], ['t04', 2]],
    [['2026-07-19', [['t08', 3], ['t04', 2]]]],
    [['2026-08-01', 'RIG-001', [['t08', 1]]], ['2026-08-16', 'RIG-001', [['t04', 1]]], ['2026-08-01', 'RIG-002', [['t08', 1]]]]),

  // Part-delivered: casing arrived, rods still outstanding and now overdue.
  PO('po2', 'PO-2026-047', 'Mahalaxmi Steel', 'Site A - North Field', '2026-07-10', '2026-07-11', '2026-08-10',
    [['t13', 4], ['t14', 4], ['t16', 2]],
    [['2026-08-06', [['t14', 4]]]],
    []),

  // Arrived nine days late, and one core lifter case came in damaged — so it
  // never entered the store, and a return is running against the supplier.
  PO('po3', 'PO-2026-052', 'Drillco Tools', 'Site A - North Field', '2026-07-18', '2026-07-19', '2026-07-31',
    [['t06', 30], ['t07', 20], ['t12', 2]],
    [['2026-08-09', [['t06', 30], ['t07', 18, 2], ['t12', 2]], 'Transport']],
    [['2026-08-03', 'RIG-001', [['t06', 2]]], ['2026-08-24', 'RIG-001', [['t06', 3]]], ['2026-08-07', 'RIG-002', [['t06', 2]]]],
    [{ id: 'ret1', date: '2026-08-10', itemId: 't07', qty: 2, reason: 'Cases cracked in transit',
       status: 'replacementPromised', promisedDate: '2026-09-15', note: 'Supplier accepted liability' }]),

  // Received in June, barely touched — the idle-stock case.
  PO('po4', 'PO-2026-033', 'Boart Longyear India', 'Site A - North Field', '2026-06-05', '2026-06-06', '2026-07-01',
    [['t03', 1], ['t09', 1], ['t05', 1]],
    [['2026-06-28', [['t03', 1], ['t09', 1], ['t05', 1]]]],
    [['2026-08-13', 'RIG-001', [['t03', 1]]]]),

  // Site B.
  PO('po5', 'PO-2026-055', 'Sandvik Mining', 'Site B - South Ridge', '2026-07-20', '2026-07-21', '2026-08-08',
    [['t08', 2], ['t04', 1]],
    [['2026-08-05', [['t08', 2], ['t04', 1]]]],
    [['2026-08-01', 'RIG-003', [['t08', 1]]]]),

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

  // Never placed.
  { id: 'po8', number: 'PO-2026-061', supplier: 'Drillco Tools', project: 'Site A - North Field',
    status: 'draft', createdDate: '2026-09-01',
    lines: [{ itemId: 't06', qty: 40, rate: rateOf('t06') }, { itemId: 't07', qty: 25, rate: rateOf('t07') }],
    receipts: [], issues: [], returns: [], transfers: [], note: 'Awaiting approval' },
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

/* ==========================================================================
 * STORE
 * ========================================================================== */

interface State {
  catalogue: ToolingItem[]
  suppliers: Supplier[]
  pos: PurchaseOrder[]
  alerts: AlertSettings
}

function initial(): State {
  return { catalogue: SEED_CATALOGUE, suppliers: SEED_SUPPLIERS, pos: SEED_POS, alerts: DEFAULT_ALERTS }
}

export const uid = (p: string) => `${p}_${Date.now()}_${Math.floor(Math.random() * 9999)}`

interface Ctx {
  state: State
  saveItem: (i: ToolingItem) => void
  importItems: (items: ToolingItem[]) => void
  deleteItem: (id: string) => void
  saveSupplier: (s: Supplier) => void
  savePO: (po: PurchaseOrder) => void
  deletePO: (id: string) => void
  placeOrder: (id: string, orderedDate: string, promisedDate: string) => void
  addReceipt: (poId: string, r: Omit<Receipt, 'id'>) => void
  addIssue: (poId: string, i: Omit<Issue, 'id'>) => void
  addReturn: (poId: string, r: Omit<ReturnRecord, 'id'>) => void
  updateReturn: (poId: string, r: ReturnRecord) => void
  addTransfer: (poId: string, t: Omit<Transfer, 'id'>) => void
  saveAlertSettings: (s: AlertSettings) => void
  resetAll: () => void
}

const InvCtx = createContext<Ctx | null>(null)
const KEY = 'xplorix_inventory_v2'

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

  return (
    <InvCtx.Provider value={{
      state,
      saveItem: i => setState(s => ({ ...s, catalogue: up(s.catalogue, i) })),
      /* Matched on name, so re-importing a corrected sheet updates rather than
       * duplicating. */
      importItems: items => setState(s => {
        let cat = s.catalogue
        items.forEach(i => {
          const existing = cat.find(x => x.name.toLowerCase() === i.name.toLowerCase())
          cat = existing ? cat.map(x => x.id === existing.id ? { ...i, id: existing.id } : x) : [...cat, i]
        })
        return { ...s, catalogue: cat }
      }),
      deleteItem: id => setState(s => ({ ...s, catalogue: s.catalogue.filter(i => i.id !== id) })),
      saveSupplier: x => setState(s => ({ ...s, suppliers: up(s.suppliers, x) })),
      savePO: po => setState(s => ({ ...s, pos: up(s.pos, po) })),
      deletePO: id => setState(s => ({ ...s, pos: s.pos.filter(p => p.id !== id) })),
      placeOrder: (id, orderedDate, promisedDate) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === id ? { ...p, status: 'ordered' as POStatus, orderedDate, promisedDate } : p),
      })),
      addReceipt: (poId, r) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === poId ? { ...p, receipts: [...p.receipts, { ...r, id: uid('r') }] } : p),
      })),
      addIssue: (poId, i) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === poId ? { ...p, issues: [...p.issues, { ...i, id: uid('i') }] } : p),
      })),
      addReturn: (poId, r) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === poId ? { ...p, returns: [...p.returns, { ...r, id: uid('ret') }] } : p),
      })),
      updateReturn: (poId, r) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === poId ? { ...p, returns: p.returns.map(x => x.id === r.id ? r : x) } : p),
      })),
      addTransfer: (poId, t) => setState(s => ({
        ...s, pos: s.pos.map(p => p.id === poId ? { ...p, transfers: [...p.transfers, { ...t, id: uid('tr') }] } : p),
      })),
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
export function dayLabel(d: string) {
  const [, m, day] = d.split('-').map(Number)
  return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]}`
}
export function fullDate(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1]} ${y}`
}
export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]} ${y}`
}
