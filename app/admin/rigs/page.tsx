'use client'

import { useState } from 'react'
import { projectCode } from '../../../lib/costing-store'
import { useAdminOverview, financeLink, RIG_STATUS_LABEL, type RigStatus } from '../../../lib/admin-overview'
import { num } from '../../../lib/owner-portal'
import {
  Page, Head, Card, Tile, Grid, Btn, Table, Status, Note, DepthBar, th, thR, td, tdR, rowLine, T, display, type Tone,
} from '../../components/kit'

/* RIGS — every rig, what it is doing, and what it costs on XPLORIX.
 *
 * Where the rig is and what it drilled comes from the shift logs, the same as
 * the Dashboard. The only thing set here is whether a rig is switched on for
 * XPLORIX: a rig that is on is charged per day and can log shifts; a rig that
 * is off costs nothing and cannot. */

const DAILY_RATE = 10   // USD per active rig per day — XPLORIX's own charge
const statusTone: Record<RigStatus, Tone> = { drilling: 'good', standby: 'warn', breakdown: 'bad', 'no-shift': 'neutral' }
const SPARE = [{ rig: 'RIG-004', type: 'Core' }, { rig: 'RIG-005', type: 'Core' }]

export default function RigsPage() {
  const o = useAdminOverview()
  const [off, setOff] = useState<string[]>(SPARE.map(s => s.rig))
  const isOn = (rig: string) => !off.includes(rig)
  const toggle = (rig: string) => setOff(isOn(rig) ? [...off, rig] : off.filter(r => r !== rig))

  const rows = [
    ...o.rigs.map(r => ({ ...r, type: 'Core', spare: false })),
    ...SPARE.map(s => ({
      rig: s.rig, type: s.type, spare: true, project: null, hole: null, status: 'no-shift' as RigStatus, note: 'Not assigned to a project',
      holeDrilled: 0, holePlanned: undefined, monthMetres: 0, monthDays: 0, monthLostHours: 0,
    })),
  ]
  const on = rows.filter(r => isOn(r.rig))
  const billDays = on.reduce((s, r) => s + (r.spare ? 0 : o.dayOfMonth), 0)

  return (
    <Page>
      <Head title="Rigs & equipment" sub="What each rig is doing today, and which rigs are switched on for XPLORIX." />

      <Grid>
        <Tile label="Rigs" value={rows.length} note={`${on.length} switched on`} />
        <Tile label="Drilling today" value={`${o.rigs.filter(r => r.status === 'drilling').length} of ${o.rigs.length}`} note="From today's shift logs" />
        <Tile label="Metres this month" value={`${num(o.now.metres)} m`} note={`${o.now.perRigDay.toFixed(1)} m per rig per day`} />
        <Tile label="XPLORIX charge this month" value={`$${num(billDays * DAILY_RATE)}`} note={`${billDays} rig-days at $${DAILY_RATE} a day`} />
      </Grid>

      <Card pad={false}>
        <Table>
          <thead>
            <tr>
              <th style={th}>Rig</th><th style={th}>Today</th><th style={th}>Project and hole</th><th style={th}>Hole depth</th>
              <th style={thR}>This month</th><th style={thR}>Hours lost</th><th style={th}>On XPLORIX</th><th style={th} />
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const active = isOn(r.rig)
              const busy = r.status !== 'no-shift'
              return (
                <tr key={r.rig} style={{ borderBottom: rowLine, opacity: active ? 1 : 0.62 }}>
                  <td style={td}>
                    <div style={{ color: T.text, fontWeight: 700, fontFamily: display, fontSize: 14 }}>{r.rig}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{r.type} rig</div>
                  </td>
                  <td style={td}>
                    <Status tone={statusTone[r.status]}>{r.spare ? 'Idle' : RIG_STATUS_LABEL[r.status]}</Status>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5, whiteSpace: 'normal', maxWidth: 200 }}>{r.note}</div>
                  </td>
                  <td style={td}>
                    {r.project ? <>
                      <div style={{ color: T.text }}>{r.hole ?? 'No hole'}</div>
                      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{projectCode(r.project)} · {r.project}</div>
                    </> : <span style={{ color: T.dim }}>Not assigned</span>}
                  </td>
                  <td style={td}>{r.hole ? <DepthBar drilled={r.holeDrilled} planned={r.holePlanned} /> : <span style={{ color: T.dim }}>—</span>}</td>
                  <td style={tdR}>
                    {r.monthDays ? <>
                      <div style={{ color: T.text, fontWeight: 600 }}>{num(r.monthMetres)} m</div>
                      <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{r.monthDays} days · {(r.monthMetres / r.monthDays).toFixed(1)} m a day</div>
                    </> : <span style={{ color: T.dim }}>—</span>}
                  </td>
                  <td style={tdR}>{r.monthLostHours ? `${r.monthLostHours} h` : <span style={{ color: T.dim }}>0</span>}</td>
                  <td style={td}>
                    <Status tone={active ? 'good' : 'neutral'}>{active ? 'On' : 'Off'}</Status>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5 }}>{active ? `$${DAILY_RATE} a day` : 'No charge'}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {r.project && <Btn size="sm" href={financeLink({ project: r.project, rig: r.rig, month: o.month })}>Costing</Btn>}
                      {active
                        ? <Btn size="sm" disabled={busy} onClick={() => toggle(r.rig)}>Switch off</Btn>
                        : <Btn size="sm" kind="good" onClick={() => toggle(r.rig)}>Switch on</Btn>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card>

      <Note>
        A rig that logged a shift today cannot be switched off, so no shift or maintenance record is lost. Switch it off once it is idle and off the project.
        The charge stops the same day.
      </Note>
    </Page>
  )
}
