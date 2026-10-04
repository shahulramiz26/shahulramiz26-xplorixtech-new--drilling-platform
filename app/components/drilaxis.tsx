'use client'

import { useState } from 'react'
import { type Survey } from '../../lib/survey'
import { T, tint, display, Card, Tile, Grid, Split, Table, Flag, Legend, Seg, Status, thR, tdR, rowLine, type Tone } from './kit'

/* ==========================================================================
 * DRILAXIS PREVIEW
 *
 * DrilAxis is the XPLORIX downhole survey tool. It is not built yet. This is
 * what its readings will look like inside XPLORIX: where the hole was planned
 * to go, where it actually is, and where it will come out if nothing changes
 * — while there is still hole left to steer.
 *
 * The stations are sample readings. Everything drawn from them — the path,
 * the distance off plan, the projected miss, the suggested steer — is real
 * arithmetic on those readings, so the screen behaves as the product will.
 * ========================================================================== */

const EX = 10    // sideways drift is drawn ten times larger than life

type P3 = { north: number; east: number; down: number }
// Server and browser can differ in the last digit of a sine; one decimal is plenty for a drawing.
const r1 = (n: number) => Math.round(n * 10) / 10

function geometry(s: Survey) {
  const r = (d: number) => (d * Math.PI) / 180
  const line: P3 = {
    north: Math.cos(r(s.plannedDip)) * Math.cos(r(s.plannedAzimuth)),
    east: Math.cos(r(s.plannedDip)) * Math.sin(r(s.plannedAzimuth)),
    down: -Math.sin(r(s.plannedDip)),
  }
  const onPlan = (depth: number): P3 => ({ north: line.north * depth, east: line.east * depth, down: line.down * depth })
  // Push a point away from the planned line so a few metres can be seen.
  const stretch = (p: P3, depth: number): P3 => {
    const o = onPlan(depth)
    return { north: o.north + (p.north - o.north) * EX, east: o.east + (p.east - o.east) * EX, down: o.down + (p.down - o.down) * EX }
  }
  const az = r(s.plannedAzimuth)
  const along = (p: P3) => p.north * Math.cos(az) + p.east * Math.sin(az)
  return { onPlan, stretch, along }
}

function SectionView({ s }: { s: Survey }) {
  const g = geometry(s)
  const W = 520, H = 350, top = 44, left = 70
  const target = g.onPlan(s.plannedDepth)
  const scale = Math.min((H - top - 40) / target.down, (W - left - 110) / Math.max(g.along(target), 1))
  const xy = (p: P3) => ({ x: r1(left + g.along(p) * scale), y: r1(top + p.down * scale) })
  const pts = s.stations.map(st => ({ ...xy(g.stretch(st, st.depth)), st }))
  const end = xy(target)
  const proj = xy(g.stretch(s.projectedEnd, s.plannedDepth))
  const last = pts[pts.length - 1]
  const step = s.plannedDepth > 320 ? 100 : 50
  const lines: number[] = []
  for (let d = step; d < target.down + 10; d += step) lines.push(d)
  const tol = s.tolerance * EX * scale
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Side view of hole ${s.id}: planned path, surveyed path and where it is heading`} style={{ display: 'block' }}>
      <line x1={16} y1={top} x2={W - 16} y2={top} stroke={T.faint} strokeWidth={1} />
      <text x={W - 18} y={top - 8} textAnchor="end" fontSize={11} fill={T.faint}>surface</text>
      {lines.map(d => (
        <g key={d}>
          <line x1={16} y1={r1(top + d * scale)} x2={W - 16} y2={r1(top + d * scale)} stroke={T.line} strokeWidth={1} />
          <text x={W - 18} y={r1(top + d * scale - 5)} textAnchor="end" fontSize={11} fill={T.faint}>{d} m down</text>
        </g>
      ))}
      <ellipse cx={end.x} cy={end.y} rx={r1(tol)} ry={r1(tol * 0.45)} fill={tint(T.green, 12)} stroke={T.green} strokeWidth={1} />
      <text x={r1(end.x - tol - 9)} y={r1(end.y + 4)} textAnchor="end" fontSize={11.5} fontWeight={600} fill={T.text}>target, ±{s.tolerance} m</text>
      <line x1={left} y1={top} x2={end.x} y2={end.y} stroke={T.plan} strokeWidth={2} strokeDasharray="6 5" />
      {s.plannedDepth > s.drilled && (
        <line x1={last.x} y1={last.y} x2={proj.x} y2={proj.y} stroke={T.actual} strokeWidth={2} strokeDasharray="2 5" strokeLinecap="round" />
      )}
      <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={T.actual} strokeWidth={2} strokeLinejoin="round" />
      {pts.slice(1).map(p => (
        <circle key={p.st.depth} cx={p.x} cy={p.y} r={3.5} fill={T.actual} stroke={T.card} strokeWidth={2}>
          <title>{`${p.st.depth} m: ${p.st.offset} m off the planned path`}</title>
        </circle>
      ))}
      {s.plannedDepth > s.drilled && <circle cx={proj.x} cy={proj.y} r={4} fill={T.card} stroke={T.actual} strokeWidth={2} />}
      <circle cx={left} cy={top} r={4} fill={T.text} />
      <text x={left} y={top - 10} textAnchor="middle" fontSize={11} fill={T.muted}>collar</text>
      <text x={last.x + 12} y={last.y - 4} fontSize={12} fontWeight={600} fill={T.text}>{s.offNow.toFixed(1)} m off at {s.drilled} m</text>
    </svg>
  )
}

function PlanView({ s }: { s: Survey }) {
  const g = geometry(s)
  const W = 320, H = 350, pad = 46
  const target = g.onPlan(s.plannedDepth)
  const all: P3[] = [
    { north: 0, east: 0, down: 0 }, target,
    ...s.stations.map(st => g.stretch(st, st.depth)), g.stretch(s.projectedEnd, s.plannedDepth),
  ]
  const tolR = s.tolerance * EX
  const minE = Math.min(...all.map(p => p.east), target.east - tolR), maxE = Math.max(...all.map(p => p.east), target.east + tolR)
  const minN = Math.min(...all.map(p => p.north), target.north - tolR), maxN = Math.max(...all.map(p => p.north), target.north + tolR)
  const scale = Math.min((W - pad * 2) / Math.max(maxE - minE, 1), (H - pad * 2) / Math.max(maxN - minN, 1))
  const ox = (W - (maxE - minE) * scale) / 2, oy = (H - (maxN - minN) * scale) / 2
  const xy = (p: P3) => ({ x: r1(ox + (p.east - minE) * scale), y: r1(oy + (maxN - p.north) * scale) })
  const pts = s.stations.map(st => ({ ...xy(g.stretch(st, st.depth)), st }))
  const c = xy({ north: 0, east: 0, down: 0 }), t = xy(target), pr = xy(g.stretch(s.projectedEnd, s.plannedDepth))
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Hole ${s.id} seen from above: planned direction against surveyed direction`} style={{ display: 'block' }}>
      <g transform={`translate(${W - 26}, 30)`}>
        <line x1={0} y1={12} x2={0} y2={-8} stroke={T.muted} strokeWidth={1.5} />
        <path d="M -4 -4 L 0 -12 L 4 -4 Z" fill={T.muted} />
        <text x={0} y={26} textAnchor="middle" fontSize={11} fontWeight={600} fill={T.muted}>N</text>
      </g>
      <circle cx={t.x} cy={t.y} r={r1(tolR * scale)} fill={tint(T.green, 12)} stroke={T.green} strokeWidth={1} />
      <line x1={c.x} y1={c.y} x2={t.x} y2={t.y} stroke={T.plan} strokeWidth={2} strokeDasharray="6 5" />
      {s.plannedDepth > s.drilled && (
        <line x1={last.x} y1={last.y} x2={pr.x} y2={pr.y} stroke={T.actual} strokeWidth={2} strokeDasharray="2 5" strokeLinecap="round" />
      )}
      <polyline points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={T.actual} strokeWidth={2} strokeLinejoin="round" />
      {pts.slice(1).map(p => (
        <circle key={p.st.depth} cx={p.x} cy={p.y} r={3.5} fill={T.actual} stroke={T.card} strokeWidth={2}>
          <title>{`${p.st.depth} m: pointing ${p.st.azimuth}°`}</title>
        </circle>
      ))}
      {s.plannedDepth > s.drilled && <circle cx={pr.x} cy={pr.y} r={4} fill={T.card} stroke={T.actual} strokeWidth={2} />}
      <circle cx={c.x} cy={c.y} r={4} fill={T.text} />
      <text x={c.x + 9} y={c.y - 7} fontSize={11} fill={T.muted}>collar</text>
      <text x={t.x} y={r1(t.y + tolR * scale + 15)} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={T.text}>target</text>
    </svg>
  )
}

function steer(c: NonNullable<Survey['correction']>) {
  const lift = Math.abs(c.lift) < 0.1 ? '' : `${c.lift > 0 ? 'lift' : 'drop'} ${Math.abs(c.lift).toFixed(1)}°`
  const turn = Math.abs(c.turn) < 0.1 ? '' : `turn ${Math.abs(c.turn).toFixed(1)}° ${c.turn > 0 ? 'right' : 'left'}`
  return [lift, turn].filter(Boolean).join(' and ')
}

export function DrilAxis({ surveys, audience }: { surveys: Survey[]; audience: 'contractor' | 'owner' }) {
  const [id, setId] = useState(surveys[0]?.id)
  const s = surveys.find(x => x.id === id) ?? surveys[0]
  if (!s) return null

  const togo = s.plannedDepth - s.drilled
  const over = s.offNow > s.tolerance
  const willMiss = s.projectedMiss > s.tolerance
  const tone: Tone = over ? 'bad' : willMiss ? 'warn' : 'good'
  const verdict = over
    ? `Off the planned path by more than ${s.tolerance} m. It crossed the limit at ${s.firstOver} m.`
    : willMiss
      ? `Inside the limit now, but heading out of the target if nothing changes.`
      : `On the planned path and heading for the target.`
  const cost = audience === 'owner'
    ? 'A hole that misses its target is paid for twice: once to drill it and once to drill it again.'
    : 'A hole that misses its target is redrilled, and the redrill is the argument nobody wins.'

  const checks: { label: string; detail: string; tone: Tone; state: string }[] = [
    { label: 'Station spacing', detail: `A reading every ${s.stations[1]?.depth ?? 30} m and at the bottom of the hole`, tone: 'good', state: 'Complete' },
    { label: 'Repeat reading', detail: 'Each station read twice; the two must agree', tone: 'good', state: 'Agree' },
    { label: 'Magnetic check', detail: 'Flags a reading taken next to steel or magnetic rock', tone: 'good', state: 'Normal' },
    { label: 'Bend in the hole', detail: 'More than 2° in 30 m wears rods and risks a stuck string', tone: s.stations.some(x => x.dogleg > 2) ? 'warn' : 'good', state: `Max ${Math.max(...s.stations.map(x => x.dogleg)).toFixed(1)}°` },
  ]

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: T.text }}>Hole {s.id}</span>
          <Status tone={tone}>{over ? 'Off path' : willMiss ? 'Drifting' : 'On path'}</Status>
          <span style={{ fontSize: 13, color: T.muted }}>{verdict}</span>
        </div>
        {surveys.length > 1 && <Seg options={surveys.map(x => ({ value: x.id, label: x.id }))} value={s.id} onChange={setId} />}
      </div>

      <Grid min={200}>
        <Tile label="Surveyed to" value={`${Math.round(s.drilled)} m`} note={`of ${s.plannedDepth} m planned · ${s.stations.length - 1} stations`} />
        <Tile label="Off the planned path now" value={`${s.offNow.toFixed(1)} m`} tone={over ? 'bad' : 'good'} note={over ? `Limit is ${s.tolerance} m` : `Inside the ${s.tolerance} m limit`} />
        <Tile label="Still drifting" value={`${s.driftPer100 > 0 ? '+' : ''}${s.driftPer100.toFixed(1)} m`} note="further off for every 100 m drilled" tone={s.driftPer100 > 1.5 ? 'warn' : 'neutral'} />
        <Tile label={togo <= 0 ? 'Off the target centre' : willMiss ? 'Will miss the target by' : 'Will land off centre by'} value={`${s.projectedMiss.toFixed(1)} m`}
          tone={willMiss ? 'bad' : 'good'} note={togo <= 0 ? 'at final depth' : willMiss ? `at ${s.plannedDepth} m, if nothing changes` : `inside the ${s.tolerance} m target at ${s.plannedDepth} m`} />
      </Grid>

      <Split left={3} right={2}>
        <Card title="Side view" subtitle="Depth to scale. Drift off the planned line is drawn ten times larger so it can be seen.">
          <div style={{ marginBottom: 8 }}>
            <Legend items={[
              { color: T.plan, label: 'Planned', line: true, dash: true },
              { color: T.actual, label: 'Surveyed', line: true },
              { color: T.actual, label: 'Where it is heading', line: true, dash: true },
            ]} />
          </div>
          <SectionView s={s} />
        </Card>
        <Card title="From above" subtitle="Which way the hole has swung, drawn ten times larger. North is up.">
          <PlanView s={s} />
        </Card>
      </Split>

      <Split left={2} right={3}>
        <Card title="What DrilAxis tells you" subtitle={cost}>
          <div style={{ display: 'grid', gap: 12 }}>
            {s.correction && togo > 0 && s.correction.feasible && (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: tint(T.orange, 10), border: `1px solid ${tint(T.orange, 35)}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, letterSpacing: '0.04em' }}>TO LAND IN THE TARGET</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: display, marginTop: 5, lineHeight: 1.3 }}>
                  {steer(s.correction).replace(/^./, c => c.toUpperCase())}
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 5, lineHeight: 1.5 }}>
                  over the next {s.correction.over} m, with {Math.round(togo)} m of hole left to do it in. The sooner it is steered, the smaller the turn.
                </div>
              </div>
            )}
            {s.correction && togo > 0 && !s.correction.feasible && (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: tint(T.red, 9), border: `1px solid ${tint(T.red, 35)}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, letterSpacing: '0.04em' }}>TOO LATE TO STEER BACK</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: display, marginTop: 5, lineHeight: 1.3 }}>
                  {Math.round(togo)} m is not enough hole to turn it in
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 5, lineHeight: 1.5 }}>
                  The turn it needs is sharper than a drill string can make. Decide now: accept a miss of {s.projectedMiss.toFixed(1)} m, wedge the hole, or stop and redrill.
                </div>
              </div>
            )}
            {(!s.correction || togo <= 0) && (
              <div style={{ padding: '12px 14px', borderRadius: 10, background: tint(T.green, 10), border: `1px solid ${tint(T.green, 35)}`, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: T.text }}>No steer needed.</span> Carry on as it is going.
              </div>
            )}
            {s.warnedAt != null && s.warnedAt < s.drilled && (
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>
                <span style={{ fontWeight: 600, color: T.text }}>First warning at {Math.round(s.warnedAt)} m.</span>{' '}
                From that station the hole was already heading out of the target. A survey taken only at the end of the hole would have found it {Math.round(s.plannedDepth - s.warnedAt)} m too late.
              </div>
            )}
            {checks.map(c => (
              <div key={c.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: T.faint, marginTop: 2, lineHeight: 1.45 }}>{c.detail}</div>
                </div>
                <Status tone={c.tone}>{c.state}</Status>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Survey stations" subtitle={`▲ marks more than ${s.tolerance} m off the planned path.`} pad={false}>
          <Table>
            <thead><tr>
              <th style={thR}>Depth</th><th style={thR}>Dip</th><th style={thR}>Direction</th><th style={thR}>Bend / 30 m</th><th style={thR}>Off plan</th>
            </tr></thead>
            <tbody>
              {s.stations.slice(1).map(st => (
                <tr key={st.depth} style={{ borderBottom: rowLine }}>
                  <td style={{ ...tdR, color: T.text }}>{Math.round(st.depth)} m</td>
                  <td style={tdR}>{st.dip.toFixed(1)}°</td>
                  <td style={tdR}>{st.azimuth.toFixed(1)}°</td>
                  <td style={tdR}>{st.dogleg.toFixed(1)}°</td>
                  <td style={tdR}><Flag on={st.offset > s.tolerance}>{st.offset.toFixed(1)} m</Flag></td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{ padding: '10px 14px', fontSize: 12, color: T.faint, borderTop: `1px solid ${T.line}` }}>
            Planned: dip {s.plannedDip}°, direction {s.plannedAzimuth}°.
          </div>
        </Card>
      </Split>
    </>
  )
}
