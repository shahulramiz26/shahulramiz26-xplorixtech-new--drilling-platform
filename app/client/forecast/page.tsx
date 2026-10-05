'use client'

import { useMemo } from 'react'
import { moneyL } from '../../../lib/costing-store'
import { PROGRAMME, CONTRACTORS, usePortal, shortDate, num } from '../../../lib/owner-portal'
import { buildOwnerForecast } from '../../../lib/owner-forecast'
import { Page, PageHead, Card, Tile, Grid, InDevelopment, Who } from '../ui'
import { ProgrammeChart } from '../charts'
import { Timeline, TimelineKey, SwotGrid, RiskTable, Basis, type Lane } from '../../components/outlook'

/* AI PREDICTION — what is coming next month, for the mine owner.
 *
 * The forecast is calculated: the programme is walked forward hole by hole at
 * each contractor's own recent rate (lib/owner-forecast.ts). It reads metres,
 * holes, the rate card, the shift record and the invoices — the things an
 * owner is entitled to see — and nothing of a contractor's cost or stock.
 *
 * It is still marked as Phase 3, because the part that learns from surveys,
 * core and past programmes is not built. The banner says which is which. */

const nextDay = (date: string) => new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0, 10)

export default function ForecastPage() {
  const p = usePortal()
  const f = useMemo(() => buildOwnerForecast(p.invoices), [p.invoices])
  const end = f.horizonEnd
  const late = f.finish.week - PROGRAMME.weeks

  const lanes: Lane[] = f.contractors.map(c => ({
    key: c.id,
    label: <Who id={c.id} />,
    sub: `${CONTRACTORS[c.id].rig} · ${Math.round(c.perWeek)} m a week`,
    bars: [
      // A hole that starts on the day the last one finished is drawn from the next day.
      ...c.bars.map((b, i) => ({
        kind: 'work' as const, from: i > 0 && c.bars[i - 1].to === b.from && b.from < b.to ? nextDay(b.from) : b.from, to: b.to, label: b.hole, ends: b.closes,
        title: `${b.hole}: ${shortDate(b.from)} to ${shortDate(b.to)}, ${Math.round(b.metres)} m`,
      })),
      ...(c.finish < end ? [{
        kind: 'idle' as const, from: nextDay(c.finish), to: end,
        title: `${CONTRACTORS[c.id].rig} has no hole left after ${shortDate(c.finish)}`,
      }] : []),
    ],
  }))

  return (
    <Page>
      <PageHead
        question={`What is coming in ${f.nextName}?`}
        tone="warn"
        answer={<>
          At the pace of the last four weeks the programme finishes on {shortDate(f.finish.date)}, {late} weeks late.
          {' '}{f.nextName} brings about {num(Math.round(f.metres.next))} m and {moneyL(f.money.spendNext)} of invoices,
          and the cost at completion is heading for {moneyL(f.money.atCompletion)} against a budget of {moneyL(PROGRAMME.budget)}.
        </>}
      />

      <InDevelopment phase="PHASE 3">
        The forecast below is calculated now, from the shift record, the hole plan and the rate card, on sample data.
        Still to come in Phase 3: learning from surveys, core and past programmes, so the forecast sees a problem before the metres show it.
      </InDevelopment>

      <Grid min={200}>
        <Tile label="Programme finishes" value={shortDate(f.finish.date)} tone="warn"
          note={`Week ${f.finish.week}, planned week ${PROGRAMME.weeks} · slow run ${shortDate(f.slowFinish.date)}`} />
        <Tile label={`Metres in ${f.nextName}`} value={`${num(Math.round(f.metres.next))} m`}
          note={`${num(Math.round(f.metres.toGo))} m left in the programme · ${num(Math.round(f.metres.rest))} m more this month`} />
        <Tile label={`Invoices in ${f.nextName}`} value={moneyL(f.money.spendNext)}
          note={`Metres, about ${f.money.standbyNext.toFixed(1)} standby days and ${f.money.demobNext ? 'demobilisation' : 'no demobilisation'}`} />
        <Tile label="Cost at completion" value={moneyL(f.money.atCompletion)} tone={f.money.overBudget > 0 ? 'bad' : 'good'}
          note={f.money.overBudget > 0 ? `${moneyL(f.money.overBudget)} over the ${moneyL(PROGRAMME.budget)} budget` : `Inside the ${moneyL(PROGRAMME.budget)} budget`} />
        <Tile label="Holes coming to you" value={String(f.closingNext.length)}
          note={f.closingNext.length ? `${f.closingNext.map(c => c.hole).join(', ')} close in ${f.nextName} and need your approval` : `No hole closes in ${f.nextName}`} />
      </Grid>

      <Card title="Cumulative metres: plan, actual and forecast"
        subtitle={`Plan finishes at week ${PROGRAMME.weeks}. The forecast walks each contractor forward hole by hole; the shaded band is a slow run and a fast run.`}>
        <ProgrammeChart forecast height={320} />
      </Card>

      <Card title={`Who drills what, to ${shortDate(end)}`} subtitle="Each contractor finishes the hole he is on, then his planned holes in order, at his own pace of the last four weeks.">
        <div style={{ marginBottom: 14 }}><TimelineKey idle="Rig free: no hole left" move={false} /></div>
        <Timeline lanes={lanes} start={f.horizonStart} end={end} split={`${f.nextMonth}-01`} splitLabel={`${f.nextName} starts`} idleLabel="Rig free" />
      </Card>

      <SwotGrid swot={f.swot} />

      <Card title="Risk register" subtitle="Highest chance first. Each line has a date, what is at stake and one thing to do." pad={false}>
        <RiskTable risks={f.risks} />
      </Card>

      <Basis lines={f.basis} note={<>
        You see the full forecast for your own programme. A contractor sees only his own holes and dates in his own XPLORIX account,
        and never your budget, your cost at completion or the comparison with other contractors.
      </>} />
    </Page>
  )
}
