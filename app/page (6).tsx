'use client'

import { PROGRAMME, PROGRAMME_NOW } from '../../../lib/owner-portal'
import { Page, PageHead, Card, InDevelopment, T, display } from '../ui'
import { ProgrammeChart } from '../charts'

/* AI PREDICTION — where the programme is heading.
 *
 * Phase 3. Nothing on this screen is calculated yet; the figures are a worked
 * example of what the forecast will say once it learns from real shifts,
 * surveys and invoices. The banner says so, and stays. */

const CARDS = [
  { title: 'Completion date', figure: 'Week 17 · 18 Oct', body: 'Three weeks after the planned finish of 27 Sep, at the real metres per day of the last twelve weeks. Likely range: week 16 to week 18.' },
  { title: 'Cost to complete', figure: '₹3.52 Cr', body: 'About ₹12 L over the ₹3.40 Cr budget. The extra is three more weeks of standby and more metres in the deepest rate band.' },
  { title: 'Contractor at risk', figure: 'Contractor C', body: 'Drilling 19 m per rig per day against the 24 the plan needs. Accounts for most of the gap.' },
  { title: 'Downtime ahead', figure: 'Parts, then water', body: 'Waiting for parts cost 58 hours last month and is rising on Rig C-1. Water shortfalls are building at Contractor B’s site.' },
  { title: 'Hole off-target risk', figure: 'DH-102', body: '6.8 m off the planned path at 388 m and still drifting. Flagged before the target is missed. Needs DrilAxis surveys (Phase 4).' },
  { title: 'Unusual claims', figure: 'Standby, Contractor C', body: '9 standby days claimed against 5 in the shift record. The pattern does not match the other two contractors.' },
]

export default function ForecastPage() {
  return (
    <Page>
      <PageHead
        question="Where is the programme heading?"
        tone="warn"
        answer={<>
          Forecast finish is week {PROGRAMME_NOW.forecastFinishWeek}, {PROGRAMME_NOW.weeksLate} weeks late. Contractor C drives most of the gap.
          Your reports tell you what went wrong last month; this tells you what will go wrong next month.
        </>}
      />

      <InDevelopment phase="PHASE 3">
        This screen shows what AI prediction will look like. The figures are an illustration built from the demo data, not a working forecast.
      </InDevelopment>

      <Card title="Cumulative metres: plan, actual and forecast" subtitle={`Illustrative. Plan finishes at week ${PROGRAMME.weeks}; the shaded band is the likely range.`}>
        <ProgrammeChart forecast height={320} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {CARDS.map(c => (
          <div key={c.title} style={{ padding: '16px 18px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.faint }}>{c.title}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.text, fontFamily: display, margin: '7px 0 8px' }}>{c.figure}</div>
            <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{c.body}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.6, maxWidth: 820 }}>
        You will see the full forecast for your own programme. A contractor sees only a summary of the completion date and of his own delay risk,
        and never your budget, your cost to complete or the comparison with other contractors.
      </div>
    </Page>
  )
}
