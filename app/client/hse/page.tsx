'use client'

import {
  HSE_INCIDENTS, HSE_COMPLIANCE, CONTRACTORS, CONTRACTOR_IDS, PORTAL_TODAY, shortDate, daysBetween,
} from '../../../lib/owner-portal'
import { Page, PageHead, Card, Tile, Grid, Table, Who, Status, Meter, Note, th, thR, td, tdR, tdStrong, rowLine, T } from '../ui'

/* HSE — incidents on the rigs, the day they are logged.
 *
 * Deliberately narrow: this is drilling only. A mine owner already runs a
 * safety system for the whole site; what it usually lacks is the contractor's
 * rig-level record on the same day, in one place, for every contractor. */

export default function HsePage() {
  const open = HSE_INCIDENTS.filter(i => i.status === 'Open')
  const last = HSE_INCIDENTS.map(i => i.date).sort().reverse()[0]
  const since = daysBetween(last, PORTAL_TODAY)

  return (
    <Page>
      <PageHead
        question="Is everyone working safely?"
        tone={open.length ? 'bad' : 'good'}
        answer={<>
          {open.length
            ? <>{open.length} incident is still open on {open[0].rig}: {open[0].type.toLowerCase()}, reported {shortDate(open[0].date)}. </>
            : <>No incident is open. </>}
          {HSE_INCIDENTS.length} incidents on the programme so far, {since} days since the last one.
        </>}
      />

      <Grid>
        <Tile label="Incidents, programme to date" value={HSE_INCIDENTS.length} note="Across all three contractors" />
        <Tile label="Open" value={open.length} tone={open.length ? 'bad' : 'good'} note={open.length ? 'Under investigation' : 'Nothing open'} />
        <Tile label="Days since last incident" value={since} note={`Last on ${shortDate(last)}`} />
        <Tile label="Lost-time injuries" value="0" tone="good" note="None on this programme" />
      </Grid>

      <Card title="Incidents" subtitle="Logged by the supervisor in the shift record, visible to you the same day" pad={false}>
        <Table>
          <thead><tr><th style={th}>Ref</th><th style={th}>Date</th><th style={th}>Contractor</th><th style={th}>Hole</th>
            <th style={th}>Type</th><th style={th}>Severity</th><th style={th}>What happened</th><th style={th}>Status</th></tr></thead>
          <tbody>
            {HSE_INCIDENTS.map(i => (
              <tr key={i.id} style={{ borderBottom: rowLine, verticalAlign: 'top' }}>
                <td style={tdStrong}>{i.id}</td>
                <td style={td}>{shortDate(i.date)}</td>
                <td style={td}><Who id={i.contractor} rig /></td>
                <td style={td}>{i.hole}</td>
                <td style={td}>{i.type}</td>
                <td style={td}>{i.severity}</td>
                <td style={{ ...td, whiteSpace: 'normal', minWidth: 260 }}>{i.what}</td>
                <td style={td}><Status tone={i.status === 'Open' ? 'bad' : 'good'}>{i.status}</Status></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card title="PPE and training by contractor" subtitle="PPE checks passed at the start of shift, and crew with current safety training" pad={false}>
        <Table>
          <thead><tr><th style={th}>Contractor</th><th style={thR}>Crew on programme</th><th style={thR}>Incidents</th>
            <th style={th}>PPE compliance</th><th style={th}>Training up to date</th></tr></thead>
          <tbody>
            {CONTRACTOR_IDS.map(c => {
              const h = HSE_COMPLIANCE[c]
              return (
                <tr key={c} style={{ borderBottom: rowLine }}>
                  <td style={{ ...td, color: T.text }}><Who id={c} /></td>
                  <td style={tdR}>{h.crew}</td>
                  <td style={tdR}>{HSE_INCIDENTS.filter(i => i.contractor === c).length}</td>
                  <td style={td}><Pct value={h.ppe} floor={95} /></td>
                  <td style={td}><Pct value={h.training} floor={90} /></td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>

      <Note>
        This screen covers the drilling contractors only. It is meant to feed the safety system you already run, not replace it.
      </Note>
    </Page>
  )
}

function Pct({ value, floor }: { value: number; floor: number }) {
  const low = value < floor
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px auto', alignItems: 'center', gap: 12, minWidth: 220 }}>
      <Meter value={value} max={100} color={low ? T.actual : T.bar} />
      <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>
        {value}%{low && <span style={{ color: T.faint, fontWeight: 400 }}> · below {floor}%</span>}
      </span>
    </div>
  )
}
