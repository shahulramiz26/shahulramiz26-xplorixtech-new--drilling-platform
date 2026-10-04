'use client'

import { useState } from 'react'
import {
  DOWNTIME_REASONS, CONTRACTORS, CONTRACTOR_IDS, downtimeFor, downtimeTotal, downloadCsv,
} from '../../../lib/owner-portal'
import { Page, PageHead, Card, Split, Seg, Btn, Table, Legend, Tile, Grid, CONTRACTOR_FILTER, th, thR, td, tdR, rowLine, T, type ContractorFilter } from '../ui'
import { DowntimeByContractor, DowntimeByReason, SIDE_LEGEND } from '../charts'

/* DOWNTIME — who is holding the programme up.
 *
 * Kept fair on purpose. A contractor's breakdown is his cost; a road you
 * closed or a permit you had not issued is yours, and you are paying standby
 * for it. Both are shown, because the second kind is the one you can fix. */

export default function DowntimePage() {
  const [who, setWho] = useState<ContractorFilter>('all')
  const total = downtimeTotal()
  const owner = downtimeTotal('owner')
  const contractor = downtimeTotal('contractor')
  const b = { c: downtimeFor('B', 'contractor'), o: downtimeFor('B', 'owner') }
  const ownerRows = DOWNTIME_REASONS.filter(r => r.side === 'owner')
    .map(r => ({ ...r, total: r.hours.A + r.hours.B + r.hours.C, worst: CONTRACTOR_IDS.reduce((m, c) => r.hours[c] > r.hours[m] ? c : m, 'A' as typeof CONTRACTOR_IDS[number]) }))
    .sort((x, y) => y.total - x.total)

  const exportCsv = () => downloadCsv('xplorix-downtime', [
    ['Reason', 'Who caused it', 'Contractor A h', 'Contractor B h', 'Contractor C h', 'Total h'],
    ...DOWNTIME_REASONS.map(r => [r.reason, r.side === 'owner' ? 'Owner-side' : 'Contractor', r.hours.A, r.hours.B, r.hours.C, r.hours.A + r.hours.B + r.hours.C]),
  ])

  return (
    <Page>
      <PageHead
        question="Who is holding the programme up?"
        tone="warn"
        answer={<>
          {total} hours were lost last month: {contractor} caused by the contractors and {owner} on your side.
          More than half of Contractor B&apos;s lost hours ({b.o} of {b.c + b.o}) were on your side.
        </>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Grid>
        <Tile label="Hours lost last month" value={`${total} h`} note="All three contractors" />
        <Tile label="Contractor-caused" value={`${contractor} h`} note="Mechanical, parts, rod trips, crew" />
        <Tile label="Owner-side" value={`${owner} h`} tone="warn" note="Access, water, weather, permits" />
      </Grid>

      <Split>
        <Card title="Lost hours by contractor" subtitle="Last month, split by who caused the stoppage">
          <div style={{ marginBottom: 16 }}><Legend items={SIDE_LEGEND} /></div>
          <DowntimeByContractor />
        </Card>
        <Card title="Lost hours by reason" subtitle="Largest first"
          right={<Seg options={CONTRACTOR_FILTER} value={who} onChange={setWho} />}>
          <div style={{ marginBottom: 14 }}><Legend items={SIDE_LEGEND} /></div>
          <DowntimeByReason contractor={who} />
        </Card>
      </Split>

      <Card title="What you can fix" subtitle="Owner-side stoppages. These hours are billable to you as standby." pad={false}>
        <Table>
          <thead><tr><th style={th}>Reason</th><th style={thR}>Hours</th><th style={th}>Hit hardest</th><th style={th}>What it usually means</th></tr></thead>
          <tbody>
            {ownerRows.map(r => (
              <tr key={r.reason} style={{ borderBottom: rowLine }}>
                <td style={{ ...td, color: T.text, fontWeight: 600 }}>{r.reason}</td>
                <td style={tdR}>{r.total} h</td>
                <td style={td}>{CONTRACTORS[r.worst].name} · {r.hours[r.worst]} h</td>
                <td style={{ ...td, whiteSpace: 'normal', minWidth: 260 }}>{MEANING[r.reason]}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card title="All reasons, by contractor" pad={false}>
        <Table>
          <thead><tr><th style={th}>Reason</th><th style={th}>Who caused it</th>
            {CONTRACTOR_IDS.map(c => <th key={c} style={thR}>{CONTRACTORS[c].name}</th>)}<th style={thR}>Total</th></tr></thead>
          <tbody>
            {DOWNTIME_REASONS.map(r => (
              <tr key={r.reason} style={{ borderBottom: rowLine }}>
                <td style={{ ...td, color: T.text }}>{r.reason}</td>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: r.side === 'owner' ? T.ownerSide : T.contractorSide }} />
                    {r.side === 'owner' ? 'Owner-side' : 'Contractor'}
                  </span>
                </td>
                {CONTRACTOR_IDS.map(c => <td key={c} style={tdR}>{r.hours[c] || '—'}</td>)}
                <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{r.hours.A + r.hours.B + r.hours.C}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...td, color: T.text, fontWeight: 700 }} colSpan={2}>Total hours</td>
              {CONTRACTOR_IDS.map(c => <td key={c} style={{ ...tdR, color: T.text, fontWeight: 700 }}>{downtimeFor(c, 'contractor') + downtimeFor(c, 'owner')}</td>)}
              <td style={{ ...tdR, color: T.text, fontWeight: 700 }}>{total}</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Page>
  )
}

const MEANING: Record<string, string> = {
  'Client access': 'Road or pad not ready, or the area closed for blasting. Plan access before the rig moves.',
  Water: 'Water supply to the rig ran short or the tanker was late.',
  Weather: 'Rain or lightning stopped work. Nobody can fix this, but it is still standby.',
  Permits: 'Work permit or clearance not issued when the crew was ready.',
}
