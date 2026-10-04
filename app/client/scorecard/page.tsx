'use client'

import { SCORECARD, CONTRACTORS, CONTRACTOR_IDS, downloadCsv, type ContractorId } from '../../../lib/owner-portal'
import { Page, PageHead, Card, Btn, Table, Who, th, thR, td, tdR, rowLine, T } from '../ui'

/* CONTRACTOR SCORECARD — compare contractors on facts.
 *
 * Every contractor is measured the same way from the same shift logs, which
 * is the one thing three separate monthly reports can never give. Only the
 * mine owner sees this comparison. */

export default function ScorecardPage() {
  const best = (row: typeof SCORECARD[number]): ContractorId =>
    CONTRACTOR_IDS.reduce((m, c) => (row.better === 'high' ? row.num[c] > row.num[m] : row.num[c] < row.num[m]) ? c : m, 'A' as ContractorId)
  const worst = (row: typeof SCORECARD[number]): ContractorId =>
    CONTRACTOR_IDS.reduce((m, c) => (row.better === 'high' ? row.num[c] < row.num[m] : row.num[c] > row.num[m]) ? c : m, 'A' as ContractorId)
  const wins = (c: ContractorId) => SCORECARD.filter(r => best(r) === c).length
  const lasts = (c: ContractorId) => SCORECARD.filter(r => worst(r) === c).length
  const leader = CONTRACTOR_IDS.reduce((m, c) => wins(c) > wins(m) ? c : m, 'A' as ContractorId)
  const trailer = CONTRACTOR_IDS.reduce((m, c) => lasts(c) > lasts(m) ? c : m, 'A' as ContractorId)
  const rate = SCORECARD[0]
  const max = Math.max(...CONTRACTOR_IDS.map(c => rate.num[c]))

  const exportCsv = () => downloadCsv('xplorix-contractor-scorecard', [
    ['Measure', ...CONTRACTOR_IDS.map(c => CONTRACTORS[c].name)],
    ...SCORECARD.map(r => [r.measure, ...CONTRACTOR_IDS.map(c => r.values[c])]),
  ])

  return (
    <Page>
      <PageHead
        question="Which contractor is doing the job best?"
        tone="info"
        answer={<>
          {CONTRACTORS[leader].name} is best on {wins(leader)} of {SCORECARD.length} measures.{' '}
          {CONTRACTORS[trailer].name} is last on {lasts(trailer)}. Every contractor is measured the same way, from the same shift logs.
        </>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Card title="Metres per rig per day" subtitle="Average on days the rig drilled, last 30 days">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
          {CONTRACTOR_IDS.map(c => (
            <div key={c} title={`${CONTRACTORS[c].name}: ${rate.values[c]} m per rig per day`}
              style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) 56px', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: T.text }}><Who id={c} /></span>
              <div style={{ height: 20 }}>
                <div style={{ width: `${(rate.num[c] / max) * 100}%`, height: '100%', background: T.bar, borderRadius: '0 4px 4px 0' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontVariantNumeric: 'tabular-nums' }}>{rate.values[c]} m</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Like for like" subtitle="Last 30 days unless a row says otherwise. ✓ marks the best figure in each row." pad={false}>
        <Table>
          <thead>
            <tr><th style={th}>Measure</th>{CONTRACTOR_IDS.map(c => <th key={c} style={thR}><Who id={c} /></th>)}</tr>
          </thead>
          <tbody>
            {SCORECARD.map(r => {
              const b = best(r)
              return (
                <tr key={r.measure} style={{ borderBottom: rowLine }}>
                  <td style={{ ...td, whiteSpace: 'normal' }}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{r.measure}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{r.help}</div>
                  </td>
                  {CONTRACTOR_IDS.map(c => (
                    <td key={c} style={{ ...tdR, fontSize: 14, color: c === b ? T.text : T.muted, fontWeight: c === b ? 700 : 400 }}>
                      {c === b && <span aria-label="Best" style={{ color: T.green, marginRight: 6, fontWeight: 800 }}>✓</span>}
                      {r.values[c]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>

      <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.6, maxWidth: 820 }}>
        Use it for renewals, for allocating the next programme, and for setting realistic tender benchmarks.
        Contractors do not see this comparison, and nothing here shows a contractor&apos;s own costs or margin.
      </div>
    </Page>
  )
}
