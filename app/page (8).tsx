'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { money, perUnit, HOLE_STATUS_LABEL } from '../../../../lib/costing-store'
import {
  usePortal, demoHole, shiftsForDemoHole, demoHoleBilling, surveyStations, CONTRACTORS, LIVE_CONTRACTOR, PROGRAMME,
  recoveryFlag, offPlanFlag, num, shortDate, type OwnerShift, type ContractorId,
} from '../../../../lib/owner-portal'
import { Page, PageHead, Card, Tile, Grid, Split, Table, Who, Flag, DemoTag, InDevelopment, th, thR, td, tdR, rowLine, T, type Tone } from '../../ui'
import { DepthChart } from '../../charts'
import { ShiftTable, HoursLegend } from '../../shift-table'

/* ONE HOLE — collar to close.
 *
 * The same page serves a demo hole and a live one. Whichever it is, the owner
 * reads the same things in the same order: how deep, how well, what stopped
 * it, and what it bills. What it cost the contractor to drill is not here and
 * is never sent to this side. */

interface View {
  id: string; contractor: ContractorId; project: string; live: boolean; stage: string
  planned?: number; drilled: number; days: number
  rop: number | null; recovery: number; offPlan: number | null
  shifts: OwnerShift[]
  billing: { label: string; metres: number; rate: number; amount: number }[]
  standbyAmount: number
  stations: { depth: number; dip: number; azimuth: number; offset: number }[]
}

export default function HolePage() {
  const { id } = useParams<{ id: string }>()
  const p = usePortal()
  const holeId = decodeURIComponent(id)

  const demo = demoHole(holeId)
  const live = p.live.find(h => h.id === holeId)
  let v: View | null = null
  if (demo) {
    v = {
      id: demo.id, contractor: demo.contractor, project: PROGRAMME.name, live: false, stage: demo.stage,
      planned: demo.planned, drilled: demo.drilled ?? 0, days: demo.days ?? 0, rop: demo.rop,
      recovery: demo.recovery ?? 0, offPlan: demo.offPlan,
      shifts: shiftsForDemoHole(demo), billing: demoHoleBilling(demo), standbyAmount: 0, stations: surveyStations(demo),
    }
  } else if (live) {
    const hrs = live.shifts.reduce((s, x) => s + x.drilling, 0)
    v = {
      id: live.id, contractor: LIVE_CONTRACTOR, project: live.project, live: true, stage: HOLE_STATUS_LABEL[live.status],
      planned: live.planned, drilled: live.drilled, days: live.days, rop: hrs > 0 ? live.drilled / hrs : null,
      recovery: Math.round(live.recoveryPct), offPlan: null,
      shifts: live.shifts, billing: live.billing, standbyAmount: live.standbyAmount, stations: [],
    }
  }

  if (!v) {
    return (
      <Page>
        <Back />
        <Card><div style={{ fontSize: 14, color: T.muted }}>No hole called {holeId} was found.</div></Card>
      </Page>
    )
  }

  const stops = v.shifts.flatMap(s => s.stoppages.map(x => ({ ...x, date: s.date, shift: s.shift })))
  const lost = (side: 'owner' | 'contractor') => stops.filter(s => s.side === side).reduce((a, s) => a + s.hours, 0)
  const flagRec = recoveryFlag(v.recovery)
  const flagOff = offPlanFlag(v.offPlan)
  const tone: Tone = flagRec || flagOff ? 'warn' : 'good'
  const value = v.billing.reduce((s, b) => s + b.amount, 0) + v.standbyAmount
  const notStarted = v.shifts.length === 0

  return (
    <Page>
      <Back />
      <PageHead
        question={`Hole ${v.id}`}
        tone={notStarted ? 'neutral' : tone}
        answer={notStarted
          ? <>Planned at {num(v.planned ?? 0)} m. Drilling has not started.</>
          : <>
            {num(v.drilled)} m drilled{v.planned ? ` of ${num(v.planned)} m planned` : ''} in {v.days} days.{' '}
            {flagRec ? `Core recovery is ${v.recovery}%, below the ${PROGRAMME.contractRecovery}% contract minimum. ` : `Core recovery is ${v.recovery}%. `}
            {flagOff ? `The hole is ${v.offPlan} m off the planned path. ` : ''}
            {lost('owner') + lost('contractor')} hours were lost to stoppages.
          </>}
        right={<div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: T.muted }}>
          <Who id={v.contractor} /><span style={{ color: T.dim }}>·</span>{v.project}<DemoTag live={v.live} />
        </div>}
      />

      <Grid min={150}>
        <Tile label="Status" value={v.stage} />
        <Tile label="Planned depth" value={v.planned ? `${num(v.planned)} m` : '—'} />
        <Tile label="Drilled" value={`${num(v.drilled)} m`} note={v.planned ? `${Math.round((v.drilled / v.planned) * 100)}% of plan` : undefined} />
        <Tile label="Days on hole" value={v.days || '—'} />
        <Tile label="ROP" value={v.rop == null ? '—' : `${v.rop.toFixed(1)} m/hr`} />
        <Tile label="Core recovery" value={notStarted ? '—' : `${v.recovery}%`} tone={notStarted ? undefined : flagRec ? 'warn' : 'good'}
          note={notStarted ? undefined : flagRec ? `Below ${PROGRAMME.contractRecovery}% minimum` : 'Meets the contract'} />
        {v.offPlan != null && <Tile label="Off planned path" value={`${v.offPlan.toFixed(1)} m`} tone={flagOff ? 'warn' : 'good'} note={flagOff ? `More than ${PROGRAMME.maxOffPlan} m` : 'Inside tolerance'} />}
      </Grid>

      {!notStarted && <>
        <Split left={3} right={2}>
          <Card title="Depth progress, shift by shift" subtitle="A flat stretch is a shift that drilled little or nothing">
            <DepthChart shifts={v.shifts} planned={v.planned} />
          </Card>
          <Card title="What this hole bills" subtitle="Metres from the shift record at your contract rates">
            <Table>
              <thead><tr><th style={th}>Rate line</th><th style={thR}>Metres</th><th style={thR}>Rate</th><th style={thR}>Amount</th></tr></thead>
              <tbody>
                {v.billing.map(b => (
                  <tr key={b.label} style={{ borderBottom: rowLine }}>
                    <td style={{ ...td, whiteSpace: 'normal' }}>{b.label}</td>
                    <td style={tdR}>{num(b.metres, b.metres % 1 ? 1 : 0)} m</td>
                    <td style={tdR}>{perUnit(b.rate)}</td>
                    <td style={{ ...tdR, color: T.text }}>{money(b.amount)}</td>
                  </tr>
                ))}
                {v.standbyAmount > 0 && (
                  <tr style={{ borderBottom: rowLine }}>
                    <td style={td}>Standby</td><td style={tdR} /><td style={tdR} />
                    <td style={{ ...tdR, color: T.text }}>{money(v.standbyAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ ...td, color: T.text, fontWeight: 700 }} colSpan={3}>Total before tax</td>
                  <td style={{ ...tdR, color: T.text, fontWeight: 700 }}>{money(value)}</td>
                </tr>
              </tbody>
            </Table>
            <div style={{ fontSize: 12, color: T.faint, marginTop: 12, lineHeight: 1.5 }}>
              This is what you pay. What the hole cost the contractor to drill stays on the contractor&apos;s side.
            </div>
          </Card>
        </Split>

        <Card title="Stoppages on this hole" subtitle={`${lost('contractor')} hours contractor-caused · ${lost('owner')} hours owner-side`} pad={false}>
          <Table>
            <thead><tr><th style={th}>Date</th><th style={th}>Shift</th><th style={th}>Reason</th><th style={thR}>Hours</th><th style={th}>Who caused it</th></tr></thead>
            <tbody>
              {stops.map((s, i) => (
                <tr key={i} style={{ borderBottom: rowLine }}>
                  <td style={td}>{shortDate(s.date)}</td><td style={td}>{s.shift}</td>
                  <td style={{ ...td, color: T.text }}>{s.reason}</td><td style={tdR}>{s.hours}</td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: s.side === 'owner' ? T.ownerSide : T.contractorSide }} />
                      {s.side === 'owner' ? 'Owner-side' : 'Contractor'}
                    </span>
                  </td>
                </tr>
              ))}
              {stops.length === 0 && <tr><td style={{ ...td, padding: 20 }} colSpan={5}>No stoppages recorded.</td></tr>}
            </tbody>
          </Table>
        </Card>

        <Card title="Every shift on this hole" subtitle="Each run: depth, metres, core recovery and how the hours were spent" pad={false}
          right={<HoursLegend />}>
          <ShiftTable shifts={[...v.shifts].reverse()} showRig={false} showHole={false} />
        </Card>

        <InDevelopment phase="PHASE 3 AND 4">
          Survey stations and deviation (DrilAxis) and core boxes, photos and RQD (XPLORIX Core) will sit on this page.{' '}
          {v.stations.length > 0 && <>The off-plan figure above is sample data. </>}
          <Link href="/client/direction-core" style={{ color: T.text }}>See what the direction and core view will show →</Link>
        </InDevelopment>
      </>}
    </Page>
  )
}

function Back() {
  return <Link href="/client/holes" style={{ fontSize: 12.5, color: T.faint, textDecoration: 'none' }}>← All holes</Link>
}
