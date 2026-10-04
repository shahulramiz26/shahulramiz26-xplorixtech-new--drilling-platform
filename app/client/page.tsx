'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { moneyL, money } from '../../lib/costing-store'
import {
  usePortal, PROGRAMME, PROGRAMME_NOW, DEMO_HOLES, CONTRACTORS, HSE_INCIDENTS, AI_ALERTS, LIVE_CONTRACTOR,
  spendSummary, invoiceState, isInvoiceOverdue, payable, recoveryFlag, offPlanFlag, shortDate, num,
} from '../../lib/owner-portal'
import { Page, PageHead, Card, Tile, Grid, DemoTag, T, toneColor, type Tone } from './ui'
import { ProgrammeChart } from './charts'

/* TODAY — the home screen.
 *
 * A mine owner's first problem is not a lack of charts; it is finding out late.
 * So this screen opens on what needs a decision or a look today, and only then
 * shows where the programme stands. */

interface Item { key: string; tone: Tone; title: string; detail: string; href: string; live?: boolean; action: string }

export default function TodayPage() {
  const p = usePortal()

  const decide: Item[] = [
    ...p.liveWaiting.map(h => ({
      key: `lh_${h.id}`, tone: 'info' as Tone, live: true, action: 'Review hole',
      title: `Hole ${h.id} is closed and waiting for your approval`,
      detail: `${CONTRACTORS[LIVE_CONTRACTOR].name} · ${h.project} · ${num(h.drilled)} m drilled${h.planned ? ` against ${num(h.planned)} m planned` : ''} · sent ${shortDate(h.submittedAt)}`,
      href: '/client/approvals',
    })),
    ...p.demoWaiting.map(h => ({
      key: `dh_${h.id}`, tone: 'info' as Tone, action: 'Review hole',
      title: `Hole ${h.id} is closed and waiting for your approval`,
      detail: `${CONTRACTORS[h.contractor].name} · ${num(h.drilled ?? 0)} m drilled against ${num(h.planned)} m planned · closed ${shortDate(h.end)}`,
      href: '/client/approvals',
    })),
    ...p.toVerify.map(i => {
      const bad = i.lines.filter(l => l.check && l.check.claimed !== l.check.verified).length
      return {
        key: `inv_${i.id}`, tone: (bad ? 'warn' : 'info') as Tone, live: i.live, action: 'Check invoice',
        title: `Invoice ${i.number} to verify · ${money(i.total)}`,
        detail: `${CONTRACTORS[i.contractor].name} · ${i.holes.join(', ')} · ${bad ? `${bad} ${bad === 1 ? 'line does' : 'lines do'} not match the shift record` : 'every line matches the shift record'}`,
        href: '/client/invoices',
      }
    }),
    ...p.claimsWaiting.map(s => ({
      key: `sb_${s.claim!.id}`, tone: (s.claim!.matches ? 'info' : 'warn') as Tone, action: 'Decide standby',
      title: s.claim!.matches
        ? `Standby claim: ${s.claim!.hours} h on ${s.rig}, ${shortDate(s.date)} ${s.shift.toLowerCase()} shift`
        : `Standby claim does not match the shift record: ${s.rig}, ${shortDate(s.date)}`,
      detail: s.claim!.matches
        ? `Claimed for: ${s.claim!.reason}. The shift record agrees.`
        : `Claimed ${s.claim!.hours} h for "${s.claim!.reason}". The shift record says: ${s.claim!.recordSays}.`,
      href: '/client/shifts',
    })),
  ]

  const overdue = p.invoices.filter(isInvoiceOverdue)
  const look: Item[] = [
    ...p.missingShifts.map(s => ({
      key: `ms_${s.id}`, tone: 'warn' as Tone, action: 'Open shifts',
      title: `Shift not submitted: ${s.rig}, ${shortDate(s.date)} ${s.shift.toLowerCase()} shift`,
      detail: `${CONTRACTORS[s.contractor].name} has not sent this shift yet. Late shifts are where disputes start.`,
      href: '/client/shifts',
    })),
    ...DEMO_HOLES.filter(h => h.stage === 'Drilling' && recoveryFlag(h.recovery)).map(h => ({
      key: `rec_${h.id}`, tone: 'warn' as Tone, action: 'Open hole',
      title: `${h.id} core recovery is ${h.recovery}%, below the ${PROGRAMME.contractRecovery}% contract minimum`,
      detail: `${CONTRACTORS[h.contractor].name} · ${num(h.drilled ?? 0)} m drilled so far`,
      href: `/client/holes/${h.id}`,
    })),
    ...DEMO_HOLES.filter(h => h.stage === 'Drilling' && offPlanFlag(h.offPlan)).map(h => ({
      key: `off_${h.id}`, tone: 'warn' as Tone, action: 'Open hole',
      title: `${h.id} is ${h.offPlan} m off the planned path`,
      detail: `${CONTRACTORS[h.contractor].name} · more than ${PROGRAMME.maxOffPlan} m is flagged · survey view is in development`,
      href: `/client/holes/${h.id}`,
    })),
    ...HSE_INCIDENTS.filter(i => i.status === 'Open').map(i => ({
      key: i.id, tone: 'bad' as Tone, action: 'Open HSE',
      title: `Open HSE incident on ${i.rig}: ${i.type.toLowerCase()}`,
      detail: `${shortDate(i.date)} · ${i.what}`,
      href: '/client/hse',
    })),
    ...overdue.map(i => ({
      key: `od_${i.id}`, tone: 'warn' as Tone, action: 'Open invoice',
      title: `Payment overdue on invoice ${i.number} · ${money(payable(i))}`,
      detail: `${CONTRACTORS[i.contractor].name} · approved, due ${shortDate(i.due)}`,
      href: '/client/invoices',
    })),
    ...AI_ALERTS.map(a => ({ key: a.id, tone: 'warn' as Tone, title: a.title, detail: a.detail, href: a.href, action: 'Look' })),
  ]

  const demo = p.invoices.filter(i => !i.live)
  const spend = spendSummary(demo)
  const stages = { closed: 0, drilling: 0, planned: 0 }
  DEMO_HOLES.forEach(h => { stages[h.stage === 'Closed' ? 'closed' : h.stage === 'Drilling' ? 'drilling' : 'planned']++ })
  const behind = PROGRAMME_NOW.plan - PROGRAMME_NOW.actual

  return (
    <Page>
      <PageHead
        question="What needs my attention today?"
        tone={decide.length ? 'warn' : 'good'}
        answer={<>
          {decide.length
            ? <><b style={{ color: T.text }}>{decide.length} {decide.length === 1 ? 'item is' : 'items are'} waiting for your decision</b> and {look.length} more are worth a look. </>
            : <>Nothing is waiting for your decision. </>}
          The programme is {PROGRAMME_NOW.behindPct}% behind plan at week {PROGRAMME.currentWeek}.
        </>}
      />

      <List title="Waiting for your decision" empty="Nothing is waiting. New approvals and invoices appear here the moment a contractor sends them." items={decide} />
      <List title="Worth a look" empty="No flags today." items={look} />

      <Grid>
        <Tile label="Metres drilled" value={<>{num(PROGRAMME_NOW.actual)} m</>} note={`of ${num(PROGRAMME.plannedMetres)} m planned`} />
        <Tile label="Against plan" value={`${PROGRAMME_NOW.behindPct}% behind`} tone="warn" note={`${num(behind)} m short at week ${PROGRAMME.currentWeek}`} />
        <Tile label="Rigs drilling today" value="3 of 3" note="One rig per contractor" />
        <Tile label="Holes" value={`${stages.closed} closed`} note={`${stages.drilling} drilling · ${stages.planned} planned`} />
        <Tile label="Approved spend to date" value={moneyL(spend.approved)} note={`${Math.round((spend.approved / PROGRAMME.budget) * 100)}% of the ${moneyL(PROGRAMME.budget)} budget`} />
      </Grid>

      <Card title="Cumulative metres: plan against actual, all contractors"
        subtitle={`Plan is ${PROGRAMME.planPerWeek} m a week. Contractor C drives most of the gap.`}
        right={<Link href="/client/forecast" style={{ fontSize: 12.5, color: T.muted, textDecoration: 'none' }}>See the forecast →</Link>}>
        <ProgrammeChart />
      </Card>
    </Page>
  )
}

function List({ title, items, empty }: { title: string; items: Item[]; empty: string }) {
  return (
    <Card title={`${title}${items.length ? ` · ${items.length}` : ''}`} pad={false}>
      {items.length === 0
        ? <div style={{ padding: '18px', fontSize: 13, color: T.faint }}>{empty}</div>
        : items.map((it, i) => (
          <Link key={it.key} href={it.href} className="xpl-row" style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', textDecoration: 'none',
            borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
          }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: toneColor[it.tone], flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {it.title}{it.live && <DemoTag live />}
              </div>
              <div style={{ fontSize: 12.5, color: T.faint, marginTop: 3, lineHeight: 1.45 }}>{it.detail}</div>
            </div>
            <span style={{ fontSize: 12.5, color: T.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
              {it.action}<ChevronRight size={14} />
            </span>
          </Link>
        ))}
    </Card>
  )
}
