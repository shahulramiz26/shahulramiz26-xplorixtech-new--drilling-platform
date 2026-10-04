'use client'

import { useState } from 'react'
import {
  ROP_BY_WEEK, PROGRAMME, DEMO_HOLES, DOWNTIME_REASONS, downtimeTotal, recoveryFlag,
} from '../../../lib/owner-portal'
import { Page, PageHead, Card, Split, Seg, Legend, CONTRACTOR_FILTER, T, type ContractorFilter } from '../ui'
import { RopChart, RecoveryChart, DowntimeByReason, SIDE_LEGEND } from '../charts'

/* OPERATIONS — rate of penetration, core recovery and downtime.
 * The three things that decide whether metres arrive on time and whether the
 * core that comes with them can be trusted. */

export default function OperationsPage() {
  const [who, setWho] = useState<ContractorFilter>('all')
  const under = ROP_BY_WEEK.filter(w => w.rop < PROGRAMME.ropTarget).length
  const low = DEMO_HOLES.filter(h => h.stage === 'Drilling' && recoveryFlag(h.recovery))
  const parts = DOWNTIME_REASONS.find(r => r.reason === 'Waiting for parts')!
  const partsHours = parts.hours.A + parts.hours.B + parts.hours.C

  return (
    <Page>
      <PageHead
        question="How is the drilling going?"
        tone="warn"
        answer={<>
          Rate of penetration was under the {PROGRAMME.ropTarget} m/hr target in {under} of the last {ROP_BY_WEEK.length} weeks.{' '}
          {low.length} {low.length === 1 ? 'hole' : 'holes'} drilling now {low.length === 1 ? 'is' : 'are'} below the {PROGRAMME.contractRecovery}% core recovery minimum
          ({low.map(h => h.id).join(' and ')}). {downtimeTotal()} hours were lost last month.
        </>}
      />

      <Split>
        <Card title="Rate of penetration by week" subtitle="Metres drilled per drilling hour, all rigs">
          <RopChart />
          <Insight title="ROP dropped 20% in weeks 4 to 6">
            Flagged by AI insights and traced to bit wear in harder ground, not to the crew.
          </Insight>
        </Card>
        <Card title="Core recovery by hole" subtitle={`Latest holes against the ${PROGRAMME.contractRecovery}% contract minimum`}>
          <RecoveryChart />
          <Insight title={`${low.length} holes below ${PROGRAMME.contractRecovery}% recovery`}>
            {low.map(h => h.id).join(' and ')} were flagged the day the runs were logged, before any invoice.
          </Insight>
        </Card>
      </Split>

      <Card title="Downtime by reason, last month" subtitle="Hours lost, and which side caused them"
        right={<Seg options={CONTRACTOR_FILTER} value={who} onChange={setWho} />}>
        <div style={{ marginBottom: 14 }}><Legend items={SIDE_LEGEND} /></div>
        <DowntimeByReason contractor={who} />
        <Insight title={`Waiting for parts: ${partsHours} hours`}>
          The second-largest cause of lost time, and avoidable. The contractor sees a stock-out warning before the rig stops; you see the hours it cost.
        </Insight>
      </Card>
    </Page>
  )
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{title}</div>
      <div style={{ fontSize: 12.5, color: T.faint, marginTop: 4, lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}
