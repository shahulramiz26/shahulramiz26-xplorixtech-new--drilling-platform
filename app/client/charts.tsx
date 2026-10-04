'use client'

import {
  ResponsiveContainer, ComposedChart, LineChart, BarChart, Line, Bar, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Cell,
} from 'recharts'
import {
  PROGRAMME, PROGRAMME_WEEKS, PROGRAMME_NOW, ROP_BY_WEEK, DEMO_HOLES, DOWNTIME_REASONS, CONTRACTORS, CONTRACTOR_IDS,
  downtimeFor, num, type ContractorId, type OwnerShift,
} from '../../lib/owner-portal'
import { T, Tip, Legend, axisTick, gridStroke } from './ui'

/* Charts follow one set of rules: thin marks, hairline solid grid, one axis,
 * a legend whenever there are two series, a label only where the story is,
 * and a tooltip on everything. Colour marks the series; text stays text. */

/* A value written at one point only — the latest week — instead of on every
 * point. `side` says where the label sits so it stays clear of its own line. */
const endLabel = (index: number, text: string, side: 'above' | 'right', fill: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function Label(p: any) {
    // An empty group, not null: Recharts types a label as always returning an element.
    if (p.index !== index) return <g />
    return side === 'above'
      ? <text x={p.x - 6} y={p.y - 12} textAnchor="end" fontSize={12} fontWeight={600} fill={fill}>{text}</text>
      : <text x={p.x + 12} y={p.y + 18} textAnchor="start" fontSize={12} fontWeight={600} fill={fill}>{text}</text>
  }

// ── PLAN AGAINST ACTUAL ───────────────────────────────────────────────────

export function ProgrammeChart({ forecast = false, height = 300 }: { forecast?: boolean; height?: number }) {
  const now = PROGRAMME.currentWeek
  const data = PROGRAMME_WEEKS
    .slice(0, forecast ? Math.max(18, PROGRAMME_NOW.forecastFinishWeek + 1) : PROGRAMME.weeks)
    .map(w => ({ ...w, band: w.low != null && w.high != null ? [w.low, w.high] : null }))
  const last = data[now - 1]
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Legend items={[
          { color: T.plan, label: 'Plan', line: true },
          { color: T.actual, label: 'Actual', line: true },
          ...(forecast ? [
            { color: T.forecast, label: 'Forecast', line: true, dash: true },
            { color: 'color-mix(in srgb, var(--x-orange-p) 35%, transparent)', label: 'Likely range' },
          ] : []),
        ]} />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 24, right: forecast ? 44 : 22, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={{ stroke: T.border }} interval={forecast ? 1 : 0} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={62}
            domain={[0, 7000]} ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]}
            tickFormatter={(v: number) => `${num(v)} m`} />
          <Tooltip cursor={{ stroke: T.dim }} content={<Tip unit=" m" names={{ plan: 'Plan', actual: 'Actual', forecast: 'Forecast' }} />} />
          {forecast && <Area dataKey="band" stroke="none" fill={T.forecast} fillOpacity={0.14} isAnimationActive={false} tooltipType="none" />}
          <Line dataKey="plan" stroke={T.plan} strokeWidth={2} dot={false} isAnimationActive={false}
            label={endLabel(now - 1, `Plan ${num(last.plan ?? 0)} m`, 'above', T.muted)} />
          {forecast && <Line dataKey="forecast" stroke={T.forecast} strokeWidth={2} strokeDasharray="6 5" dot={false} isAnimationActive={false} />}
          <Line dataKey="actual" stroke={T.actual} strokeWidth={2} isAnimationActive={false}
            dot={{ r: 3.5, fill: T.actual, stroke: T.card, strokeWidth: 2 }} activeDot={{ r: 5, stroke: T.card, strokeWidth: 2 }}
            label={endLabel(now - 1, `Actual ${num(last.actual ?? 0)} m`, 'right', T.text)} />
          {forecast && <ReferenceLine x={`W${PROGRAMME.weeks}`} stroke={T.dim} label={{ value: 'Planned finish', position: 'top', fill: T.faint, fontSize: 11 }} />}
          {forecast && <ReferenceLine x={`W${PROGRAMME_NOW.forecastFinishWeek}`} stroke={T.forecast} strokeOpacity={0.5} label={{ value: 'Forecast finish', position: 'top', fill: T.muted, fontSize: 11 }} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── ROP BY WEEK ───────────────────────────────────────────────────────────

export function RopChart({ height = 250 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={ROP_BY_WEEK} margin={{ top: 14, right: 18, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={{ stroke: T.border }} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} domain={[5, 7.5]} ticks={[5, 5.5, 6, 6.5, 7, 7.5]} />
        <Tooltip cursor={{ stroke: T.dim }} content={<Tip unit=" m/hr" names={{ rop: 'ROP' }} />} />
        <ReferenceLine y={PROGRAMME.ropTarget} stroke={T.plan} label={{ value: `Target ${PROGRAMME.ropTarget} m/hr`, position: 'insideTopLeft', fill: T.faint, fontSize: 11 }} />
        <Line dataKey="rop" stroke={T.actual} strokeWidth={2} isAnimationActive={false}
          dot={{ r: 3.5, fill: T.actual, stroke: T.card, strokeWidth: 2 }} activeDot={{ r: 5, stroke: T.card, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── CORE RECOVERY AGAINST THE CONTRACT LINE ───────────────────────────────

/* Bars grow from the contract minimum, not from zero: the question is who is
 * above the line and who is below it, and by how much. */
export function RecoveryChart({ height = 250 }: { height?: number }) {
  const min = PROGRAMME.contractRecovery
  const data = DEMO_HOLES.filter(h => h.recovery != null).slice(-8)
    .map(h => ({ hole: h.id, recovery: h.recovery as number, delta: (h.recovery as number) - min }))
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Legend items={[{ color: T.bar, label: 'At or above the contract minimum' }, { color: T.actual, label: 'Below it' }]} />
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 14, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="hole" tick={axisTick} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} domain={[-5, 4]} ticks={[-4, -2, 0, 2, 4]}
            tickFormatter={(v: number) => `${min + v}%`} />
          <Tooltip cursor={{ fill: 'rgba(var(--x-ov),0.03)' }}
            content={({ active, payload, label }) => active && payload?.length
              ? <Tip active label={label} payload={[{ dataKey: 'recovery', name: 'Core recovery', value: `${payload[0].payload.recovery}%`, color: payload[0].payload.delta < 0 ? T.actual : T.bar }]} />
              : null} />
          <ReferenceLine y={0} stroke={T.muted} label={{ value: `Contract minimum ${min}%`, position: 'insideTopLeft', fill: T.faint, fontSize: 11 }} />
          {/* A hole exactly on the line still gets a sliver, so it does not read as missing. */}
          <Bar dataKey="delta" maxBarSize={24} radius={[4, 4, 0, 0]} minPointSize={3} isAnimationActive={false}>
            {data.map(d => <Cell key={d.hole} fill={d.delta < 0 ? T.actual : T.bar} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── DOWNTIME ──────────────────────────────────────────────────────────────

const sideColor = { contractor: T.contractorSide, owner: T.ownerSide }
export const SIDE_LEGEND = [
  { color: T.contractorSide, label: 'Contractor-caused' },
  { color: T.ownerSide, label: 'Owner-side' },
]

export function DowntimeByReason({ contractor }: { contractor: 'all' | ContractorId }) {
  const rows = DOWNTIME_REASONS
    .map(r => ({ ...r, total: contractor === 'all' ? r.hours.A + r.hours.B + r.hours.C : r.hours[contractor] }))
    .filter(r => r.total > 0)
    .sort((a, b) => b.total - a.total)
  const max = Math.max(...rows.map(r => r.total))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {rows.map(r => (
        <div key={r.reason} title={`${r.reason}: ${r.total} hours (${r.side === 'owner' ? 'owner-side' : 'contractor-caused'})`}
          style={{ display: 'grid', gridTemplateColumns: '132px minmax(0,1fr) 44px', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: T.muted, textAlign: 'right' }}>{r.reason}</span>
          <div style={{ height: 16 }}>
            <div style={{ width: `${(r.total / max) * 100}%`, minWidth: 3, height: '100%', background: sideColor[r.side], borderRadius: '0 4px 4px 0' }} />
          </div>
          <span style={{ fontSize: 12.5, color: T.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.total} h</span>
        </div>
      ))}
    </div>
  )
}

export function DowntimeByContractor() {
  const rows = CONTRACTOR_IDS.map(c => ({ c, contractor: downtimeFor(c, 'contractor'), owner: downtimeFor(c, 'owner') }))
  const max = Math.max(...rows.map(r => r.contractor + r.owner))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map(r => (
        <div key={r.c} style={{ display: 'grid', gridTemplateColumns: '104px minmax(0,1fr) 52px', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{CONTRACTORS[r.c].name}</span>
          <div style={{ display: 'flex', gap: 2, height: 22, width: `${((r.contractor + r.owner) / max) * 100}%` }}>
            <div title={`${CONTRACTORS[r.c].name}: ${r.contractor} hours contractor-caused`} style={{
              flex: r.contractor, background: sideColor.contractor, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#fff', minWidth: 0,
            }}>{r.contractor}</div>
            <div title={`${CONTRACTORS[r.c].name}: ${r.owner} hours owner-side`} style={{
              flex: r.owner, background: sideColor.owner, borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#fff', minWidth: 0,
            }}>{r.owner}</div>
          </div>
          <span style={{ fontSize: 12.5, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{r.contractor + r.owner} h</span>
        </div>
      ))}
    </div>
  )
}

// ── ONE HOLE: DEPTH SHIFT BY SHIFT ────────────────────────────────────────

export function DepthChart({ shifts, planned, height = 240 }: { shifts: OwnerShift[]; planned?: number; height?: number }) {
  const data = shifts.filter(s => s.submitted).map((s, i) => ({
    i, label: `${s.date.slice(8)}/${s.date.slice(5, 7)} ${s.shift}`, depth: s.to,
  }))
  const top = Math.max(planned ?? 0, ...data.map(d => d.depth))
  const step = top > 300 ? 100 : top > 120 ? 50 : 25
  const ceil = Math.ceil(top / step) * step
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 14, right: 18, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={gridStroke} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: T.border }}
          interval={Math.max(0, Math.ceil(data.length / 8) - 1)} tickFormatter={(v: string) => v.split(' ')[0]} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} domain={[0, ceil]}
          ticks={Array.from({ length: ceil / step + 1 }, (_, k) => k * step)} tickFormatter={(v: number) => `${v} m`} />
        <Tooltip cursor={{ stroke: T.dim }} content={<Tip unit=" m" names={{ depth: 'Depth reached' }} />} />
        {planned != null && <ReferenceLine y={planned} stroke={T.plan} label={{ value: `Planned ${planned} m`, position: 'insideBottomRight', fill: T.faint, fontSize: 11 }} />}
        <Area dataKey="depth" stroke={T.actual} strokeWidth={2} fill={T.actual} fillOpacity={0.1} isAnimationActive={false}
          dot={false} activeDot={{ r: 5, stroke: T.card, strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
