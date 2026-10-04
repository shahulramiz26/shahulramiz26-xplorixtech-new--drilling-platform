'use client'

import { demoHole, surveyStations, PROGRAMME } from '../../../lib/owner-portal'
import { Page, PageHead, Card, Split, Table, Flag, InDevelopment, Legend, Meter, th, thR, td, tdR, rowLine, T } from '../ui'

/* DIRECTION AND CORE — did the hole go where it was planned, and is the core
 * what it says it is.
 *
 * Phase 4 (DrilAxis downhole survey) and Phase 3 (XPLORIX Core). Sample data
 * throughout. There are no real photos here on purpose: a placeholder tile
 * cannot be mistaken for somebody's core. */

const HOLE = demoHole('DH-102')!
const STATIONS = surveyStations(HOLE)
const RQD = [
  { from: 0, to: 50, rqd: 84 }, { from: 50, to: 100, rqd: 78 }, { from: 100, to: 150, rqd: 71 },
  { from: 150, to: 200, rqd: 58 }, { from: 200, to: 250, rqd: 52 }, { from: 250, to: 300, rqd: 66 },
  { from: 300, to: 350, rqd: 74 }, { from: 350, to: 388, rqd: 80 },
]
const BOXES = Array.from({ length: 8 }, (_, i) => ({ n: 79 + i, from: 351 + i * 4.5, to: 351 + (i + 1) * 4.5, photo: i !== 5 }))

/* Section view. Depth is to scale; the sideways drift is drawn ten times
 * larger than life, because 6.8 m in 388 m would be a hair's width. */
function Section() {
  const W = 520, Ht = 330, x0 = 90, y0 = 46, scale = 0.66, dx = 0.42, ex = 10
  const planned = (d: number) => ({ x: x0 + d * dx, y: y0 + d * scale })
  const actual = [{ depth: 0, offset: 0 }, ...STATIONS]
    .map(s => ({ x: planned(s.depth).x - s.offset * ex * 0.55, y: planned(s.depth).y + s.offset * ex * 0.18, ...s }))
  const end = planned(HOLE.planned)
  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} width="100%" role="img" aria-label={`Section of hole ${HOLE.id}: planned path against surveyed path`} style={{ display: 'block' }}>
      <line x1={20} y1={y0} x2={W - 20} y2={y0} stroke={T.faint} strokeWidth={1} />
      <text x={W - 22} y={y0 - 8} textAnchor="end" fontSize={11} fill={T.faint}>surface</text>
      {[100, 200, 300, 400].map(d => (
        <g key={d}>
          <line x1={20} y1={y0 + d * scale} x2={W - 20} y2={y0 + d * scale} stroke="rgba(30,41,59,0.9)" strokeWidth={1} />
          <text x={24} y={y0 + d * scale - 5} fontSize={11} fill={T.faint}>{d} m</text>
        </g>
      ))}
      <ellipse cx={end.x} cy={end.y} rx={46} ry={20} fill="rgba(234,88,12,0.14)" stroke={T.actual} strokeWidth={1} />
      <text x={end.x} y={end.y + 4} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={T.text}>target</text>
      <line x1={x0} y1={y0} x2={end.x} y2={end.y} stroke={T.plan} strokeWidth={2} strokeDasharray="6 5" />
      <polyline points={actual.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={T.actual} strokeWidth={2} strokeLinejoin="round" />
      {actual.slice(1).map(p => (
        <circle key={p.depth} cx={p.x} cy={p.y} r={4} fill={T.actual} stroke={T.card} strokeWidth={2}>
          <title>{`${p.depth} m: ${p.offset} m off the planned path`}</title>
        </circle>
      ))}
      <text x={actual[actual.length - 1].x - 14} y={actual[actual.length - 1].y + 4} textAnchor="end" fontSize={12} fontWeight={600} fill={T.text}>
        {HOLE.offPlan} m off plan at {HOLE.drilled} m
      </text>
    </svg>
  )
}

export default function DirectionCorePage() {
  const worst = STATIONS.filter(s => s.offset > PROGRAMME.maxOffPlan)
  return (
    <Page>
      <PageHead
        question="Did the hole go where it was planned, and is the core sound?"
        tone="warn"
        answer={<>
          Sample view for {HOLE.id}: {HOLE.offPlan} m off the planned path at {HOLE.drilled} m, past the {PROGRAMME.maxOffPlan} m limit from {worst[0]?.depth ?? '—'} m down.
          A hole that misses its target costs twice: once to drill, once to drill again.
        </>}
      />

      <InDevelopment phase="PHASE 3 AND 4">
        Downhole surveys come with DrilAxis (Phase 4); core logging, RQD and core photos come with XPLORIX Core (Phase 3).
        Everything below is sample data showing what you will see.
      </InDevelopment>

      <Split left={3} right={2}>
        <Card title={`Hole ${HOLE.id}: planned path against surveyed path`} subtitle="Depth to scale. Sideways drift drawn ten times larger so it can be seen.">
          <div style={{ marginBottom: 8 }}>
            <Legend items={[{ color: T.plan, label: 'Planned', line: true, dash: true }, { color: T.actual, label: 'Surveyed', line: true }]} />
          </div>
          <Section />
        </Card>
        <Card title="Survey stations" subtitle={`Every 50 m and at the bottom. ▲ marks more than ${PROGRAMME.maxOffPlan} m off the planned path.`} pad={false}>
          <Table>
            <thead><tr><th style={thR}>Depth</th><th style={thR}>Dip</th><th style={thR}>Azimuth</th><th style={thR}>Off plan</th></tr></thead>
            <tbody>
              {STATIONS.map(s => (
                <tr key={s.depth} style={{ borderBottom: rowLine }}>
                  <td style={tdR}>{s.depth} m</td><td style={tdR}>{s.dip}°</td><td style={tdR}>{s.azimuth}°</td>
                  <td style={tdR}><Flag on={s.offset > PROGRAMME.maxOffPlan}>{s.offset.toFixed(1)} m</Flag></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Split>

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
              <div key={b.n} style={{ border: `1px solid ${b.photo ? T.border : 'rgba(245,158,11,0.4)'}`, borderRadius: 10, overflow: 'hidden', background: T.bg }}>
                <div style={{
                  height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: T.faint,
                  background: b.photo ? 'repeating-linear-gradient(0deg, #141B26 0 11px, #0F151E 11px 13px)' : 'transparent',
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
