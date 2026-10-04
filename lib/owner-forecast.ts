'use client'

import { moneyL, monthOf, shiftMonth, monthLabel, daysInMonth } from './costing-store'
import {
  PROGRAMME, PROGRAMME_NOW, PORTAL_TODAY, CONTRACTORS, CONTRACTOR_IDS, DEMO_HOLES, RATE_CARD, SCORECARD,
  DOWNTIME_REASONS, HSE_INCIDENTS,
  walkProgramme, programmeFinish, weeklyRate, weekOf, demoHoleBilling, downtimeTotal, downtimeFor,
  spendSummary, shortDate, num,
  type ContractorId, type PortalInvoice, type ProgrammeDay,
} from './owner-portal'

/* ==========================================================================
 * NEXT MONTH — the mine owner's forecast
 *
 * The same idea as the contractor's forecast, read from the other side of the
 * contract. It walks the programme forward hole by hole at each contractor's
 * own recent rate and asks the owner's questions: when does it finish, what
 * will I be invoiced, what will it cost me at the end, and what can go wrong.
 *
 * It reads only what the owner is entitled to see — metres, holes, the rate
 * card, the shift record and the invoices. Nothing here knows a contractor's
 * cost, stock or margin.
 * ========================================================================== */

export type Likelihood = 'High' | 'Medium' | 'Low'
export interface OwnerSwotItem { title: string; detail: string; figure?: string; href?: string }
export interface OwnerRisk {
  key: string; title: string; detail: string; when: string
  impact: string; impactNote?: string; likelihood: Likelihood
  action: string; href: string; linkLabel: string
}
export interface ContractorOutlook {
  id: ContractorId
  perWeek: number; slow: number; fast: number
  toGo: number
  nextMetres: number
  finish: string; finishWeek: number
  bars: { hole: string; from: string; to: string; metres: number; closes: boolean }[]
}

const sum = <T,>(list: T[], f: (x: T) => number) => list.reduce((s, x) => s + f(x), 0)
const score = (measure: string, c: ContractorId) => SCORECARD.find(r => r.measure.startsWith(measure))?.num[c] ?? 0

export function buildOwnerForecast(invoices: PortalInvoice[]) {
  const today = PORTAL_TODAY
  const thisMonth = monthOf(today)
  const nextMonth = shiftMonth(thisMonth, 1)
  const nextName = monthLabel(nextMonth).split(' ')[0]
  const restEnd = `${thisMonth}-${String(daysInMonth(thisMonth)).padStart(2, '0')}`
  const inNext = (d: ProgrammeDay) => monthOf(d.date) === nextMonth
  const inRest = (d: ProgrammeDay) => d.date <= restEnd

  const days = walkProgramme('expected')
  const slowDays = walkProgramme('slow')
  const fastDays = walkProgramme('fast')
  const finish = programmeFinish('expected')
  const slowFinish = programmeFinish('slow')
  const fastFinish = programmeFinish('fast')
  const plannedFinish = new Date(Date.parse(`${PROGRAMME.weekOneStart}T00:00:00Z`) + (PROGRAMME.weeks * 7 - 1) * 86400000).toISOString().slice(0, 10)

  // ── by contractor ────────────────────────────────────────────────────────
  const contractors: ContractorOutlook[] = CONTRACTOR_IDS.map(id => {
    const mine = days.filter(d => d.contractor === id)
    const bars: ContractorOutlook['bars'] = []
    mine.forEach(d => {
      const last = bars[bars.length - 1]
      if (last && last.hole === d.hole) { last.to = d.date; last.metres += d.metres; last.closes = d.closes }
      else bars.push({ hole: d.hole, from: d.date, to: d.date, metres: d.metres, closes: d.closes })
    })
    const end = mine.map(d => d.date).sort().pop() ?? today
    return {
      id, perWeek: weeklyRate(id), slow: weeklyRate(id, 'slow'), fast: weeklyRate(id, 'fast'),
      toGo: sum(mine, d => d.metres), nextMetres: sum(mine.filter(inNext), d => d.metres),
      finish: end, finishWeek: weekOf(end), bars,
    }
  })

  // ── metres ───────────────────────────────────────────────────────────────
  const metres = {
    rest: sum(days.filter(inRest), d => d.metres),
    next: sum(days.filter(inNext), d => d.metres),
    nextLow: sum(slowDays.filter(inNext), d => d.metres),
    nextHigh: sum(fastDays.filter(inNext), d => d.metres),
    toGo: sum(days, d => d.metres),
  }

  // ── money ────────────────────────────────────────────────────────────────
  /* Standby the shift record supports, per contractor per week so far. The
   * same rate is carried forward for the weeks each contractor still has. */
  const standbyRow = SCORECARD.find(r => r.measure.startsWith('Standby'))
  const standbyDays = (i: 1 | 2) => Object.fromEntries(CONTRACTOR_IDS.map(id => [id, Number(standbyRow?.values[id].match(/(\d+) \/ (\d+)/)?.[i] ?? 0)])) as Record<ContractorId, number>
  const standbyClaimed = standbyDays(1)
  const standbyRecorded = standbyDays(2)
  const weeksLeft = (c: ContractorOutlook) => Math.max(0, (Date.parse(c.finish) - Date.parse(today)) / (7 * 86400000))
  const standbyAhead = sum(contractors, c => (standbyRecorded[c.id] / PROGRAMME.currentWeek) * weeksLeft(c))
  const shareNext = (c: ContractorOutlook) => {
    const total = days.filter(d => d.contractor === c.id).length
    return total ? days.filter(d => d.contractor === c.id && inNext(d)).length / total : 0
  }
  const standbyNext = sum(contractors, c => (standbyRecorded[c.id] / PROGRAMME.currentWeek) * weeksLeft(c) * shareNext(c))
  const demobNext = contractors.filter(c => monthOf(c.finish) === nextMonth).length * RATE_CARD.demobilisation

  const drilledValue = sum(DEMO_HOLES, h => sum(demoHoleBilling(h), b => b.amount))
  const toDate = drilledValue + sum(CONTRACTOR_IDS, c => standbyRecorded[c]) * RATE_CARD.standbyPerDay + CONTRACTOR_IDS.length * RATE_CARD.mobilisation
  const toGoValue = sum(days, d => d.amount) + standbyAhead * RATE_CARD.standbyPerDay + CONTRACTOR_IDS.length * RATE_CARD.demobilisation
  const atCompletion = toDate + toGoValue
  const overBudget = atCompletion - PROGRAMME.budget
  const spendNext = sum(days.filter(inNext), d => d.amount) + standbyNext * RATE_CARD.standbyPerDay + demobNext
  const spendRest = sum(days.filter(inRest), d => d.amount)
  const spent = spendSummary(invoices)

  // ── holes that will close and come to the owner for approval ─────────────
  const closings = days.filter(d => d.closes).map(d => ({ hole: d.hole, contractor: d.contractor, date: d.date }))
  const closingNext = closings.filter(c => monthOf(c.date) === nextMonth)

  // ── facts the reading below leans on ─────────────────────────────────────
  const ownerHours = downtimeTotal('owner')
  const ownerTop = DOWNTIME_REASONS.filter(r => r.side === 'owner')
    .map(r => ({ reason: r.reason, hours: r.hours.A + r.hours.B + r.hours.C })).sort((a, b) => b.hours - a.hours)
  const avgPerRigDay = sum(CONTRACTOR_IDS, c => score('Metres per rig', c)) / CONTRACTOR_IDS.length
  const ownerMetres = (ownerHours / 24) * avgPerRigDay
  const ownerStandbyDays = ownerHours / 24
  const dh102 = DEMO_HOLES.find(h => h.id === 'DH-102')!
  const dh104 = DEMO_HOLES.find(h => h.id === 'DH-104')!
  const redrill = sum(demoHoleBilling({ ...dh102, drilled: dh102.planned }), b => b.amount)
  const redrillWeeks = dh102.planned / weeklyRate(dh102.contractor)
  const overClaimDays = sum(CONTRACTOR_IDS, c => standbyClaimed[c] - standbyRecorded[c])
  const c = Object.fromEntries(contractors.map(x => [x.id, x])) as Record<ContractorId, ContractorOutlook>
  const firstFree = [...contractors].sort((a, b) => a.finish.localeCompare(b.finish))[0]
  const lastTwo = contractors.filter(x => x.id !== firstFree.id)
  const weekLateCost = 3 * (standbyRecorded.A + standbyRecorded.B + standbyRecorded.C) / PROGRAMME.currentWeek * RATE_CARD.standbyPerDay
  const openHse = HSE_INCIDENTS.filter(i => i.status === 'Open')

  // ── strengths, weaknesses, opportunities, threats ────────────────────────
  const strengths: OwnerSwotItem[] = [
    {
      title: 'Contractor B is carrying the programme',
      detail: `${score('Metres per rig', 'B')} m per rig per day, ${score('Core recovery', 'B')}% core recovery and the least downtime of the three. On course to finish its holes on ${shortDate(c.B.finish)}.`,
      figure: `${Math.round(c.B.perWeek)} m/week`, href: '/client/scorecard',
    },
    {
      title: 'Every invoice line is checked against the shift record',
      detail: `Claims that the record does not support are held back before you pay, not argued about afterwards.`,
      figure: `${moneyL(spent.disputed)} held`, href: '/client/billing-check',
    },
    {
      title: 'Shift data arrives the same day',
      detail: `${score('Shifts submitted', 'A')}% from Contractor A and ${score('Shifts submitted', 'B')}% from Contractor B, so this forecast is built on this week's drilling, not last month's report.`,
      href: '/client/shifts',
    },
  ]
  const weaknesses: OwnerSwotItem[] = [
    {
      title: `${PROGRAMME_NOW.behindPct}% behind plan at week ${PROGRAMME.currentWeek}`,
      detail: `${num(PROGRAMME_NOW.actual)} m drilled against ${num(PROGRAMME_NOW.plan)} m planned. The last four weeks averaged ${Math.round(sum(contractors, x => x.perWeek))} m against the ${PROGRAMME.planPerWeek} m the plan needs.`,
      figure: `${num(PROGRAMME_NOW.plan - PROGRAMME_NOW.actual)} m short`, href: '/client/operations',
    },
    {
      title: 'Contractor C is the slow rig',
      detail: `${score('Metres per rig', 'C')} m per rig per day, ${score('Downtime', 'C')}% of shift hours lost and core recovery of ${score('Core recovery', 'C')}% against the ${PROGRAMME.contractRecovery}% in the contract.`,
      figure: `${Math.round(c.C.perWeek)} m/week`, href: '/client/scorecard',
    },
    {
      title: `${ownerHours} hours were lost on your side last month`,
      detail: `${ownerTop.slice(0, 3).map(r => `${r.reason} ${r.hours} h`).join(', ')}. These hours are standby, and standby is billed to you.`,
      figure: `${ownerHours} h`, href: '/client/downtime',
    },
  ]
  const opportunities: OwnerSwotItem[] = [
    {
      title: 'Clear access and water before the next holes start',
      detail: `If ${nextName} loses the same hours on your side, that is about ${Math.round(ownerMetres)} m not drilled and ${ownerStandbyDays.toFixed(1)} standby days you pay for. ${ownerTop[0].reason} and ${ownerTop[1].reason.toLowerCase()} are most of it.`,
      figure: `+${Math.round(ownerMetres)} m`, href: '/client/downtime',
    },
    {
      title: `${CONTRACTORS[firstFree.id].rig} is free from ${shortDate(firstFree.finish)}`,
      detail: `${CONTRACTORS[firstFree.id].name} finishes its last hole about two weeks before the others. Release the rig then, or keep it for a redrill of ${dh102.id} if that hole misses.`,
      href: '/client/holes',
    },
    {
      title: `Decide on ${dh102.id} while there is hole left`,
      detail: `${dh102.planned - (dh102.drilled ?? 0)} m to go and ${dh102.offPlan} m off the planned path. A decision this week costs a survey; a decision after the hole is closed costs a redrill.`,
      figure: `saves ${moneyL(redrill)}`, href: '/client/direction-core',
    },
  ]
  const threats: OwnerSwotItem[] = [
    {
      title: `Finish slips to ${shortDate(finish.date)}`,
      detail: `Week ${finish.week} against a planned finish of ${shortDate(plannedFinish)} in week ${PROGRAMME.weeks}. In a slow run it is ${shortDate(slowFinish.date)}.`,
      figure: `${finish.week - PROGRAMME.weeks} weeks late`, href: '/client/operations',
    },
    {
      title: overBudget > 0 ? 'Cost at completion is over budget' : 'Cost at completion is inside budget',
      detail: `${moneyL(atCompletion)} at the end against a budget of ${moneyL(PROGRAMME.budget)}. The gap is standby and metres in the deepest rate band.`,
      figure: `${overBudget > 0 ? '+' : '−'}${moneyL(Math.abs(overBudget))}`, href: '/client/invoices',
    },
    {
      title: `${dh102.id} may miss its target`,
      detail: `${dh102.offPlan} m off the planned path at ${dh102.drilled} m, past the ${PROGRAMME.maxOffPlan} m limit. A redrill is ${dh102.planned} m and about ${redrillWeeks.toFixed(1)} more weeks.`,
      figure: moneyL(redrill), href: '/client/direction-core',
    },
    {
      title: `${CONTRACTORS.C.rig} keeps stopping`,
      detail: `Third hoist or hydraulic stoppage in 30 days${openHse.length ? `, and ${openHse[0].id} is still open` : ''}. ${dh104.id} has ${dh104.planned - (dh104.drilled ?? 0)} m to go on that rig.`,
      href: '/client/hse',
    },
  ]

  // ── risk register ────────────────────────────────────────────────────────
  const risks: OwnerRisk[] = [
    {
      key: 'late', title: 'The programme finishes late',
      detail: `Forecast finish ${shortDate(finish.date)} (week ${finish.week}); planned ${shortDate(plannedFinish)}. ${lastTwo.map(x => CONTRACTORS[x.id].name).join(' and ')} each still have a full hole to start.`,
      when: shortDate(finish.date), impact: `${finish.week - PROGRAMME.weeks} weeks`, impactNote: `about ${moneyL(weekLateCost)} more standby`,
      likelihood: 'High',
      action: `Ask ${lastTwo.map(x => CONTRACTORS[x.id].name).join(' and ')} for a dated plan for ${DEMO_HOLES.filter(h => h.stage === 'Planned').map(h => h.id).join(', ')}, and review it every week.`,
      href: '/client/operations', linkLabel: 'Open operations',
    },
    {
      key: 'budget', title: 'Cost at completion goes over budget',
      detail: `${moneyL(toDate)} of work done so far and ${moneyL(toGoValue)} still to come, against a budget of ${moneyL(PROGRAMME.budget)}.`,
      when: shortDate(finish.date), impact: overBudget > 0 ? moneyL(overBudget) : '—', impactNote: overBudget > 0 ? 'over budget' : 'inside budget',
      likelihood: overBudget > PROGRAMME.budget * 0.03 ? 'High' : overBudget > 0 ? 'Medium' : 'Low',
      action: 'Agree the final depth of each planned hole before it starts, and pay only the metres and standby days the shift record supports.',
      href: '/client/invoices', linkLabel: 'Open invoices',
    },
    {
      key: 'owner-side', title: 'Stoppages on your own side repeat',
      detail: `${ownerHours} hours last month: ${ownerTop.map(r => `${r.reason.toLowerCase()} ${r.hours} h`).join(', ')}. Contractor B lost the most (${downtimeFor('B', 'owner')} h).`,
      when: nextName, impact: moneyL(ownerStandbyDays * RATE_CARD.standbyPerDay), impactNote: `standby, and about ${Math.round(ownerMetres)} m not drilled`,
      likelihood: 'High',
      action: `Sort out water at Contractor B's site and clear access for the planned holes before the rigs move.`,
      href: '/client/downtime', linkLabel: 'Open downtime',
    },
    {
      key: 'dh102', title: `${dh102.id} misses its target`,
      detail: `${dh102.offPlan} m off at ${dh102.drilled} m of ${dh102.planned} m, and still drifting. If it misses, the hole is drilled again.`,
      when: shortDate(days.find(d => d.hole === dh102.id && d.closes)?.date), impact: moneyL(redrill), impactNote: `redrill, about ${redrillWeeks.toFixed(1)} weeks`,
      likelihood: 'Medium',
      action: 'Ask for a survey at the bottom of the hole now and decide before the last metres: accept, wedge or redrill.',
      href: '/client/direction-core', linkLabel: 'Open direction and core',
    },
    {
      key: 'rig-c', title: `${CONTRACTORS.C.rig} stops again`,
      detail: `Three hoist or hydraulic stoppages in 30 days. A week lost on ${dh104.id} moves Contractor C's finish from ${shortDate(c.C.finish)} to about ${shortDate(new Date(Date.parse(c.C.finish) + 7 * 86400000).toISOString().slice(0, 10))}.`,
      when: `Before ${shortDate(c.C.finish)}`, impact: `${Math.round(c.C.perWeek)} m`, impactNote: 'for each week lost',
      likelihood: 'Medium',
      action: openHse.length ? `Ask for the hoist inspection record before pulling resumes; ${openHse[0].id} is still open.` : 'Ask for the maintenance record of the hoist.',
      href: '/client/hse', linkLabel: 'Open HSE',
    },
    {
      key: 'recovery', title: `Core recovery on ${dh104.id} stays under the contract`,
      detail: `${dh104.recovery}% over ${dh104.drilled} m against a contract minimum of ${PROGRAMME.contractRecovery}%. Poor core in the deepest ${dh104.planned - (dh104.drilled ?? 0)} m is the part you most need.`,
      when: `To ${shortDate(c.C.finish)}`, impact: moneyL(sum(demoHoleBilling(dh104), b => b.amount)), impactNote: 'drilled so far on this hole',
      likelihood: 'Medium',
      action: 'Raise it with Contractor C now and hold approval of the hole until recovery by run is shown.',
      href: `/client/holes/${dh104.id}`, linkLabel: `Open ${dh104.id}`,
    },
    {
      key: 'standby', title: 'Standby is claimed above the record',
      detail: `${overClaimDays} more standby days claimed than the shift record shows so far, ${standbyClaimed.C - standbyRecorded.C} of them from Contractor C.`,
      when: `${nextName} invoices`, impact: moneyL(overClaimDays * RATE_CARD.standbyPerDay), impactNote: 'claimed, not supported',
      likelihood: 'Medium',
      action: 'Keep checking every standby line against the shift record before approving it.',
      href: '/client/billing-check', linkLabel: 'Open billing check',
    },
  ]
  const rank: Record<Likelihood, number> = { High: 0, Medium: 1, Low: 2 }
  risks.sort((a, b) => rank[a.likelihood] - rank[b.likelihood])

  const basis = [
    `Metres: each contractor's average over the last four weeks. ${contractors.map(x => `${CONTRACTORS[x.id].name} ${Math.round(x.perWeek)} m a week`).join(', ')}.`,
    `What is drilled: the rest of the hole each rig is on, then its planned holes in order, to planned depth.`,
    `What you will be invoiced: each metre at the contract rate for its depth band, plus standby at the rate the shift record has supported so far, plus demobilisation when a contractor finishes.`,
    `Cost at completion: the value of everything drilled to date, plus the walk forward to the last metre.`,
    `Range: the slow and fast cases are each contractor's worst and best of the last four weeks (${contractors.map(x => `${x.id} ${x.slow} to ${x.fast}`).join(', ')}).`,
  ]

  return {
    today, thisMonth, nextMonth, nextName,
    finish, slowFinish, fastFinish, plannedFinish,
    contractors, metres, closings, closingNext,
    money: { toDate, toGo: toGoValue, atCompletion, overBudget, spendNext, spendRest, standbyNext, demobNext },
    swot: { strengths, weaknesses, opportunities, threats },
    risks, basis,
    horizonStart: days[0]?.date ?? today,
    horizonEnd: slowFinish.date > finish.date ? slowFinish.date : finish.date,
  }
}

export type OwnerForecast = ReturnType<typeof buildOwnerForecast>
