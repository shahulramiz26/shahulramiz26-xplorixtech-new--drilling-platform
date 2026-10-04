'use client'

import { useMemo } from 'react'
import {
  useInventory, buildAlerts, normFormation, TODAY, RIGS, COMPLETED_PROJECTS,
  type Alert, type Formation,
} from './inventory-store'
import {
  useCosting, BREAKDOWN_REASONS, statusForShifts, monthOf, shiftMonth, isOwnerLinked, isOverdue, outstanding,
  disputedAmount, money, moneyL, OWNER_NAME, type ShiftLog, type Invoice,
} from './costing-store'
import { computeRigMonth } from './costing-view'
import { holesFromLogs, type LiveHole } from './owner-portal'

/* ==========================================================================
 * THE CONTRACTOR'S DASHBOARD — what it reads
 *
 * Nothing here is typed in. Every figure comes from the same stores the rest
 * of the console uses: shift logs and rates (costing), parts and purchase
 * orders (inventory). So a number on the Dashboard is the number on Finance
 * or Inventory, and opening either screen confirms it.
 * ========================================================================== */

export type RigStatus = 'drilling' | 'standby' | 'breakdown' | 'no-shift'
export const RIG_STATUS_LABEL: Record<RigStatus, string> = {
  drilling: 'Drilling', standby: 'Standby', breakdown: 'Breakdown', 'no-shift': 'No shift received',
}

export interface RigRow {
  rig: string
  project: string | null
  hole: string | null
  status: RigStatus
  note: string
  holeDrilled: number
  holePlanned?: number
  recoveryPct: number | null
  day: number | null          // metres on today's day shift; null = not received
  night: number | null
  monthMetres: number
  monthDays: number           // days this rig has a log for, this month
  monthLostHours: number
  last14: { date: string; metres: number }[]
}

export interface MonthNumbers {
  month: string
  metres: number
  rigDays: number
  perRigDay: number
  revenue: number
  cost: number
  costPerMetre: number
  ratePerMetre: number
  margin: number
  marginPct: number
  standbyDays: number
  breakdownDays: number
  lostHours: number
}

export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'neutral'
export interface Attention { key: string; tone: Tone; title: string; detail: string; href: string; action: string }

const order = (l: { date: string; shift: string }) => `${l.date}${l.shift === 'Day' ? '0' : '1'}`
const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10)
}

/* Deep link into Finance: the screen opens on this project, rig, month and tab. */
export function financeLink(p: { project: string; rig: string; month: string; tab?: 'Performance' | 'Drillholes' | 'Tracker' }) {
  const q = new URLSearchParams({ project: p.project, rig: p.rig, month: p.month, tab: p.tab ?? 'Performance' })
  return `/admin/finance?${q.toString()}`
}

function monthNumbers(
  costing: ReturnType<typeof useCosting>['state'], inv: ReturnType<typeof useInventory>['state'], month: string, upToDay?: number,
): MonthNumbers {
  const pairs = new Map<string, { project: string; rig: string }>()
  costing.shiftLogs.forEach(l => { if (monthOf(l.date) === month) pairs.set(`${l.project}|${l.rig}`, { project: l.project, rig: l.rig }) })
  const z: MonthNumbers = {
    month, metres: 0, rigDays: 0, perRigDay: 0, revenue: 0, cost: 0, costPerMetre: 0, ratePerMetre: 0,
    margin: 0, marginPct: 0, standbyDays: 0, breakdownDays: 0, lostHours: 0,
  }
  pairs.forEach(({ project, rig }) => {
    const v = computeRigMonth(costing, inv, project, rig, month)
    // Same days as the other month where a like-for-like comparison is wanted.
    const days = upToDay ? v.days.filter(d => Number(d.date.slice(8)) <= upToDay) : v.days
    days.forEach(d => {
      if (!d.submitted) return
      z.metres += d.units; z.revenue += d.revenue; z.cost += d.total; z.rigDays += 1
      z.lostHours += d.downtimeHours
      if (d.status === 'standby') z.standbyDays += 1
      if (d.status === 'breakdown') z.breakdownDays += 1
    })
  })
  z.perRigDay = z.rigDays ? z.metres / z.rigDays : 0
  z.costPerMetre = z.metres ? z.cost / z.metres : 0
  z.ratePerMetre = z.metres ? z.revenue / z.metres : 0
  z.margin = z.revenue - z.cost
  z.marginPct = z.revenue ? (z.margin / z.revenue) * 100 : 0
  return z
}

export function useAdminOverview() {
  const { state: costing } = useCosting()
  const { state: inv } = useInventory()

  return useMemo(() => {
    const today = TODAY
    const month = monthOf(today)
    const dayOfMonth = Number(today.slice(8))
    const logs = costing.shiftLogs
    const holes = holesFromLogs(costing)
    const holeById = new Map(holes.map(h => [h.id, h]))

    // ── rigs ───────────────────────────────────────────────────────────────
    const rigNames = Array.from(new Set([...RIGS, ...logs.map(l => l.rig)])).sort()
    const rigs: RigRow[] = rigNames.map(rig => {
      const mine = logs.filter(l => l.rig === rig).sort((a, b) => order(a).localeCompare(order(b)))
      const todays = mine.filter(l => l.date === today)
      const latest = mine[mine.length - 1]
      const withHole = [...mine].reverse().find(l => l.holeNumber)
      const hole = withHole?.holeNumber ? holeById.get(withHole.holeNumber) : undefined
      const inMonth = mine.filter(l => monthOf(l.date) === month)
      const status: RigStatus = todays.length === 0 ? 'no-shift' : statusForShifts(todays)
      const lost = todays.filter(l => l.downtimeHours > 0)
      const shift = (name: 'Day' | 'Night') => todays.find(l => l.shift === name)?.metresDrilled ?? null
      return {
        rig, project: latest?.project ?? null, hole: hole?.id ?? null, status,
        note: status === 'no-shift' ? (latest ? `Last shift received ${latest.date}` : 'No shifts logged yet')
          : lost.length ? lost.map(l => `${l.downtimeReason || 'Stoppage'}, ${l.downtimeHours} h`).join(' · ')
          : 'No stoppages today',
        holeDrilled: hole?.drilled ?? 0, holePlanned: hole?.planned,
        recoveryPct: hole && hole.drilled > 0 ? hole.recoveryPct : null,
        day: shift('Day'), night: shift('Night'),
        monthMetres: inMonth.reduce((s, l) => s + l.metresDrilled, 0),
        monthDays: new Set(inMonth.map(l => l.date)).size,
        monthLostHours: inMonth.reduce((s, l) => s + l.downtimeHours, 0),
        last14: Array.from({ length: 14 }, (_, i) => {
          const date = addDays(today, i - 13)
          return { date, metres: mine.filter(l => l.date === date).reduce((s, l) => s + l.metresDrilled, 0) }
        }),
      }
    })

    // ── this month against last month, same number of days ─────────────────
    const now = monthNumbers(costing, inv, month)
    const prev = monthNumbers(costing, inv, shiftMonth(month, -1), dayOfMonth)

    const daily = Array.from({ length: dayOfMonth }, (_, i) => {
      const date = `${month}-${String(i + 1).padStart(2, '0')}`
      return { day: String(i + 1), date, metres: logs.filter(l => l.date === date).reduce((s, l) => s + l.metresDrilled, 0) }
    })

    const lostBy: Record<string, { reason: string; hours: number; own: boolean }> = {}
    logs.filter(l => monthOf(l.date) === month && l.downtimeHours > 0).forEach((l: ShiftLog) => {
      const reason = l.downtimeReason || 'Not stated'
      const e = (lostBy[reason] ||= { reason, hours: 0, own: BREAKDOWN_REASONS.includes(reason) })
      e.hours += l.downtimeHours
    })
    const lost = Object.values(lostBy).sort((a, b) => b.hours - a.hours)

    // ── money ──────────────────────────────────────────────────────────────
    const invoices = costing.invoices.filter(i => i.status !== 'cancelled')
    const unpaid = invoices.filter(i => i.status !== 'paid')
    const overdue = unpaid.filter(i => isOverdue(i, today))
    const disputed = invoices.filter(i => i.ownerStatus === 'disputed')
    const withOwner = unpaid.filter(i => i.ownerStatus === 'awaiting')
    const readyToInvoice = holes.filter(h => h.status === 'approved' && !h.invoiceId)
    const returned = holes.filter(h => h.status === 'closed' && h.returnReason)
    const toSend = holes.filter(h => h.status === 'closed' && !h.returnReason)
    const waitingOwner = holes.filter(h => h.status === 'submitted')
    const money_ = {
      outstanding: unpaid.reduce((s, i) => s + outstanding(i), 0),
      overdueValue: overdue.reduce((s, i) => s + outstanding(i), 0),
      readyValue: readyToInvoice.reduce((s, h) => s + h.value, 0),
      toSendValue: toSend.reduce((s, h) => s + h.value, 0),
      invoices, unpaid, overdue, disputed, withOwner, readyToInvoice, returned, toSend, waitingOwner,
    }

    // ── stock: the same alerts Inventory shows ─────────────────────────────
    const burnMonth = logs.filter(l => l.metresDrilled > 0).map(l => monthOf(l.date)).sort().pop() ?? month
    const burn = RIGS.map(rig => {
      const shifts = logs.filter(l => l.rig === rig && monthOf(l.date) === burnMonth && l.metresDrilled > 0)
      if (!shifts.length) return null
      const days = new Set(shifts.map(s => s.date)).size
      const metres = shifts.reduce((s, l) => s + l.metresDrilled, 0)
      const counts: Record<string, number> = {}
      shifts.forEach(s => { const f = normFormation(s.formationType); counts[f] = (counts[f] ?? 0) + s.metresDrilled })
      const formation = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Hard') as Formation
      return { rig, metresPerDay: Math.round((metres / days) * 10) / 10, formation }
    }).filter(Boolean) as { rig: string; metresPerDay: number; formation: Formation }[]
    const alerts: Alert[] = buildAlerts(inv.pos, inv.catalogue, today, COMPLETED_PROJECTS, burn, inv.alerts, inv.suppliers)
    const urgentAlerts = alerts.filter(a => a.level === 'urgent')

    // ── what needs the admin today ─────────────────────────────────────────
    const linkFor = (h: LiveHole, tab: 'Drillholes' | 'Tracker' = 'Drillholes') =>
      financeLink({ project: h.project, rig: h.rig, month: monthOf(h.end ?? h.start), tab })
    const invLink = (i: Invoice) => {
      const h = holeById.get(i.holeNumbers[0])
      return h ? linkFor(h, 'Tracker') : '/admin/finance'
    }
    const attention: Attention[] = [
      ...rigs.filter(r => r.status === 'breakdown').map(r => ({
        key: `bd_${r.rig}`, tone: 'bad' as Tone, action: 'Open rig', href: '/admin/rigs',
        title: `${r.rig} is broken down today`, detail: `${r.project ?? ''} · ${r.note}`,
      })),
      ...rigs.filter(r => r.status === 'no-shift' && r.project && !COMPLETED_PROJECTS.includes(r.project)).map(r => ({
        key: `ns_${r.rig}`, tone: 'warn' as Tone, action: 'Open rig', href: '/admin/rigs',
        title: `No shift received from ${r.rig} today`, detail: r.note,
      })),
      ...returned.map(h => ({
        key: `ret_${h.id}`, tone: 'bad' as Tone, action: 'Fix and resend', href: linkFor(h),
        title: `${OWNER_NAME} returned hole ${h.id}`, detail: h.returnReason ?? '',
      })),
      ...disputed.map(i => ({
        key: `dis_${i.id}`, tone: 'bad' as Tone, action: 'Open invoice', href: invLink(i),
        title: `Invoice ${i.number}: ${(i.lineReviews ?? []).filter(r => r?.status === 'disputed').length} line(s) disputed by the mine owner`,
        detail: `${money(disputedAmount(i))} held back before tax · ${i.project}`,
      })),
      ...overdue.map(i => ({
        key: `od_${i.id}`, tone: 'warn' as Tone, action: 'Open invoice', href: invLink(i),
        title: `Invoice ${i.number} is overdue · ${money(outstanding(i))}`, detail: `${i.project} · due ${i.dueDate}`,
      })),
      ...(readyToInvoice.length ? [{
        key: 'ready', tone: 'info' as Tone, action: 'Raise invoice', href: linkFor(readyToInvoice[0]),
        title: `${readyToInvoice.length} approved ${readyToInvoice.length === 1 ? 'hole is' : 'holes are'} ready to invoice · ${moneyL(money_.readyValue)}`,
        detail: readyToInvoice.map(h => h.id).join(', '),
      }] : []),
      ...(toSend.length ? [{
        key: 'tosend', tone: 'info' as Tone, action: 'Open holes', href: linkFor(toSend[0]),
        title: `${toSend.length} closed ${toSend.length === 1 ? 'hole is' : 'holes are'} not yet approved for billing · ${moneyL(money_.toSendValue)}`,
        detail: [
          toSend.some(h => isOwnerLinked(h.project)) ? `${toSend.filter(h => isOwnerLinked(h.project)).length} to send to the mine owner` : '',
          toSend.some(h => !isOwnerLinked(h.project)) ? `${toSend.filter(h => !isOwnerLinked(h.project)).length} for you to approve` : '',
          `${toSend.slice(0, 6).map(h => h.id).join(', ')}${toSend.length > 6 ? ' and more' : ''}`,
        ].filter(Boolean).join(' · '),
      }] : []),
      ...(urgentAlerts.length ? [{
        key: 'stock', tone: 'warn' as Tone, action: 'Open inventory', href: '/admin/inventory',
        title: `${urgentAlerts.length} urgent stock ${urgentAlerts.length === 1 ? 'problem' : 'problems'}`,
        detail: urgentAlerts.slice(0, 2).map(a => a.title).join(' · '),
      }] : []),
    ]

    return { today, month, dayOfMonth, rigs, now, prev, daily, lost, money: money_, alerts, urgentAlerts, attention, holes }
  }, [costing, inv])
}
