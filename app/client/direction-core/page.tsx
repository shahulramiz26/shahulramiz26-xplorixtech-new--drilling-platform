'use client'

import { demoHole, demoSurvey, DEMO_HOLES, PROGRAMME } from '../../../lib/owner-portal'
import { type Survey } from '../../../lib/survey'
import { Page, PageHead, Card, Split, Table, InDevelopment, Meter, th, thR, td, tdR, rowLine, T } from '../ui'
import { DrilAxis } from '../../components/drilaxis'

/* DIRECTION AND CORE — did the hole go where it was planned, and is the core
 * what it says it is.
 *
 * Phase 4 (DrilAxis downhole survey) and Phase 3 (XPLORIX Core). Sample data
 * throughout. There are no real photos here on purpose: a placeholder tile
 * cannot be mistaken for somebody's core. */

const HOLE = demoHole('DH-102')!
const SURVEYS = DEMO_HOLES.filter(h => h.stage === 'Drilling').map(demoSurvey).filter((s): s is Survey => !!s)
const RQD = [
  { from: 0, to: 50, rqd: 84 }, { from: 50, to: 100, rqd: 78 }, { from: 100, to: 150, rqd: 71 },
  { from: 150, to: 200, rqd: 58 }, { from: 200, to: 250, rqd: 52 }, { from: 250, to: 300, rqd: 66 },
  { from: 300, to: 350, rqd: 74 }, { from: 350, to: 388, rqd: 80 },
]
const BOXES = Array.from({ length: 8 }, (_, i) => ({ n: 79 + i, from: 351 + i * 4.5, to: 351 + (i + 1) * 4.5, photo: i !== 5 }))

export default function DirectionCorePage() {
  const first = SURVEYS.find(x => x.id === HOLE.id)
  return (
    <Page>
      <PageHead
        question="Did the hole go where it was planned, and is the core sound?"
        tone="warn"
        answer={<>
          Sample view for {HOLE.id}: {HOLE.offPlan} m off the planned path at {HOLE.drilled} m, past the {PROGRAMME.maxOffPlan} m limit from {first?.firstOver ?? '—'} m down.
          A hole that misses its target costs twice: once to drill, once to drill again.
        </>}
      />

      <InDevelopment phase="DRILAXIS AND XPLORIX CORE">
        Downhole surveys come with DrilAxis, after Phase 3; core logging, RQD and core photos come with XPLORIX Core in Phase 3.
        The readings below are samples. The distances, the projected miss and the steer are worked out from them exactly as they will be from real readings.
      </InDevelopment>

      <DrilAxis surveys={SURVEYS} audience="owner" />

      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginTop: 6 }}>Core from {HOLE.id}</div>
      <Split left={2} right={3}>
        <Card title="Rock quality (RQD) by depth" subtitle="Share of core in sound pieces of 10 cm or longer" pad={false}>
          <Table>
            <thead><tr><th style={th}>Interval</th><th style={th}>RQD</th><th style={thR} /></tr></thead>
            <tbody>
              {RQD.map(r => (
                <tr key={r.from} style={{ borderBottom: rowLine }}>
                  <td style={td}>{r.from}–{r.to} m</td>
                  <td style={{ ...td, width: '55%' }}><Meter value={r.rqd} max={100} color={r.rqd < 60 ? T.actual : T.bar} /></td>
                  <td style={{ ...tdR, color: T.text }}>{r.rqd}%{r.rqd < 60 && <span style={{ color: T.faint }}> · poor</span>}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Core boxes and photos" subtitle="Each box tied to its hole and depth, with who handled it and when. Sample: 86 boxes, 85 photographed.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {BOXES.map(b => (
              <div key={b.n} style={{ border: `1px solid ${b.photo ? T.border : 'color-mix(in srgb, var(--x-amber) 40%, transparent)'}`, borderRadius: 10, overflow: 'hidden', background: T.bg }}>
                <div style={{
                  height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: T.faint,
                  background: b.photo ? 'repeating-linear-gradient(0deg, var(--x-raised2) 0 11px, var(--x-raised) 11px 13px)' : 'transparent',
                }}>{b.photo ? 'Photo placeholder' : 'No photo yet'}</div>
                <div style={{ padding: '8px 10px', borderTop: `1px solid ${T.line}` }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>Box {b.n}</div>
                  <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{b.from.toFixed(1)}–{b.to.toFixed(1)} m</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Split>
    </Page>
  )
}
