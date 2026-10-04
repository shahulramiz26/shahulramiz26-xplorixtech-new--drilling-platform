'use client'

import { shortDate, CONTRACTORS, type OwnerShift } from '../../lib/owner-portal'
import { Table, Flag, Status, Legend, th, thR, td, tdR, tdStrong, rowLine, T } from './ui'
import { PROGRAMME } from '../../lib/owner-portal'

/* How a 12-hour shift was spent. Standby is the owner's side and breakdown the
 * contractor's — the same two colours the downtime charts use — because that
 * split is what decides whether the hours are paid for. */
export const HOUR_KEYS = [
  { key: 'drilling', label: 'Drilling', color: '#0D9488' },
  { key: 'trips', label: 'Trips', color: '#475569' },
  { key: 'standby', label: 'Standby (owner-side)', color: T.ownerSide },
  { key: 'breakdown', label: 'Breakdown (contractor)', color: T.contractorSide },
] as const

export function HoursLegend() {
  return <Legend items={HOUR_KEYS.map(k => ({ color: k.color, label: k.label }))} />
}

function Hours({ s }: { s: OwnerShift }) {
  const total = s.drilling + s.trips + s.standby + s.breakdown
  if (!s.submitted || total === 0) return <span style={{ color: T.dim }}>—</span>
  const text = HOUR_KEYS.filter(k => s[k.key] > 0).map(k => `${k.label.split(' ')[0]} ${s[k.key]}`).join(' · ')
  return (
    <div title={`${text} (hours)`} style={{ minWidth: 150 }}>
      <div style={{ display: 'flex', gap: 2, height: 8, borderRadius: 4, overflow: 'hidden' }}>
        {HOUR_KEYS.filter(k => s[k.key] > 0).map(k => <div key={k.key} style={{ flex: s[k.key], background: k.color }} />)}
      </div>
      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5 }}>{text}</div>
    </div>
  )
}

/* One row per shift, as the driller logged it. Used on the daily shift record
 * and on a hole's own page, so both read the same way. */
export function ShiftTable({ shifts, showRig = true, showHole = true }: {
  shifts: OwnerShift[]; showRig?: boolean; showHole?: boolean
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th style={th}>Date</th><th style={th}>Shift</th>
          {showRig && <th style={th}>Rig</th>}
          {showHole && <th style={th}>Hole</th>}
          <th style={thR}>Depth, m</th><th style={thR}>Metres</th><th style={thR}>Recovery</th>
          <th style={th}>Hours</th><th style={thR}>Crew</th><th style={th}>Stoppages</th><th style={th}>Received</th>
        </tr>
      </thead>
      <tbody>
        {shifts.map(s => (
          <tr key={s.id} style={{ borderBottom: rowLine, background: s.submitted ? undefined : 'rgba(245,158,11,0.05)', verticalAlign: 'top' }}>
            <td style={tdStrong}>{shortDate(s.date)}</td>
            <td style={td}>{s.shift}</td>
            {showRig && (
              <td style={td}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.text }}>
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: CONTRACTORS[s.contractor].color }} />{s.rig}
                </span>
                <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2, paddingLeft: 15 }}>{CONTRACTORS[s.contractor].name}</div>
              </td>
            )}
            {showHole && <td style={td}>{s.hole ?? '—'}</td>}
            {s.submitted ? <>
              <td style={tdR}>{s.from.toFixed(1)} → {s.to.toFixed(1)}</td>
              <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{s.metres.toFixed(1)}</td>
              <td style={tdR}>
                <Flag on={s.recoveryPct != null && s.recoveryPct < PROGRAMME.contractRecovery}>
                  {s.recoveryPct == null ? '—' : `${s.recoveryPct}%`}
                </Flag>
              </td>
              <td style={td}><Hours s={s} /></td>
              <td style={tdR}>{s.crew}</td>
              <td style={{ ...td, whiteSpace: 'normal', minWidth: 170, maxWidth: 260 }}>
                {s.stoppages.length === 0 ? <span style={{ color: T.dim }}>None</span> : s.stoppages.map((x, i) => (
                  <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'baseline', lineHeight: 1.5 }}>
                    <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: x.side === 'owner' ? T.ownerSide : T.contractorSide }} />
                    <span>{x.reason} · {x.hours} h <span style={{ color: T.faint }}>({x.side === 'owner' ? 'owner-side' : 'contractor'})</span></span>
                  </div>
                ))}
              </td>
              <td style={td}>{s.sameDay ? <Status tone="good">Same day</Status> : <Status tone="warn">Next day</Status>}</td>
            </> : <>
              <td style={{ ...td, color: T.muted }} colSpan={6}>This shift has not been submitted.</td>
              <td style={td}><Status tone="warn">Missing</Status></td>
            </>}
          </tr>
        ))}
        {shifts.length === 0 && <tr><td style={{ ...td, padding: 24 }} colSpan={11}>No shifts.</td></tr>}
      </tbody>
    </Table>
  )
}
