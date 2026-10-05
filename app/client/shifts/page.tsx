'use client'

import { useState } from 'react'
import { usePortal, RECENT_SHIFTS, CONTRACTORS, shortDate, downloadCsv } from '../../../lib/owner-portal'
import { Page, PageHead, Card, Seg, Btn, Status, Who, Note, CONTRACTOR_FILTER, T, type ContractorFilter } from '../ui'
import { ShiftTable, HoursLegend } from '../shift-table'

/* DAILY SHIFT RECORD — each shift the day it was worked.
 *
 * Standby is paid waiting time, which is why the owner decides it here, shift
 * by shift, with the rig's own record beside the claim — not at month end
 * from a letter. */

const DATES = Array.from(new Set(RECENT_SHIFTS.map(s => s.date))).sort().reverse()

export default function ShiftsPage() {
  const p = usePortal()
  const [date, setDate] = useState<string>('both')
  const [who, setWho] = useState<ContractorFilter>('all')
  const [reason, setReason] = useState<Record<string, string>>({})

  const rows = RECENT_SHIFTS
    .filter(s => date === 'both' || s.date === date)
    .filter(s => who === 'all' || s.contractor === who)
  const received = RECENT_SHIFTS.filter(s => s.submitted).length

  const exportCsv = () => downloadCsv('xplorix-shifts', [
    ['Date', 'Shift', 'Contractor', 'Rig', 'Hole', 'From m', 'To m', 'Metres', 'Recovery %', 'Drilling h', 'Trips h', 'Standby h', 'Breakdown h', 'Crew', 'Stoppages', 'Received'],
    ...rows.map(s => [s.date, s.shift, CONTRACTORS[s.contractor].name, s.rig, s.hole, s.from, s.to, s.metres, s.recoveryPct, s.drilling, s.trips, s.standby, s.breakdown, s.crew,
      s.stoppages.map(x => `${x.reason} ${x.hours}h (${x.side})`).join('; '), s.submitted ? (s.sameDay ? 'Same day' : 'Next day') : 'Missing']),
  ])

  return (
    <Page>
      <PageHead
        question="What happened on each shift?"
        tone={p.missingShifts.length || p.claimsWaiting.length ? 'warn' : 'good'}
        answer={<>
          {received} of {RECENT_SHIFTS.length} shifts are in for the last two days.{' '}
          {p.missingShifts.length > 0 && <>{p.missingShifts.length} {p.missingShifts.length === 1 ? 'shift is' : 'shifts are'} missing. </>}
          {p.claimsWaiting.length > 0
            ? <>{p.claimsWaiting.length} standby {p.claimsWaiting.length === 1 ? 'claim is' : 'claims are'} waiting for your decision.</>
            : <>No standby claims are waiting.</>}
        </>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Card title={`Standby claims · ${p.claims.length}`} subtitle="Standby is paid. Each claim is shown beside what the rig logged for the same hours." pad={false}>
        {p.claims.map((s, i) => {
          const c = s.claim!
          const d = p.standby[c.id]
          return (
            <div key={c.id} style={{ padding: '15px 18px', borderTop: i === 0 ? 'none' : `1px solid ${T.line}`, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 13.5, fontWeight: 600, color: T.text }}>
                  <Who id={s.contractor} rig />
                  <span style={{ color: T.faint, fontWeight: 500 }}>{shortDate(s.date)} · {s.shift} shift · {s.hole}</span>
                  {c.matches ? <Status tone="good">Matches the shift record</Status> : <Status tone="warn">Does not match the shift record</Status>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', columnGap: 14, rowGap: 5, marginTop: 10, fontSize: 13 }}>
                  <span style={{ color: T.faint }}>Claimed</span>
                  <span style={{ color: T.muted }}>{c.hours} h standby: {c.reason}</span>
                  <span style={{ color: T.faint }}>Shift record</span>
                  <span style={{ color: c.matches ? T.muted : T.text, fontWeight: c.matches ? 400 : 600 }}>{c.recordSays}</span>
                  {d?.reason && <><span style={{ color: T.faint }}>Your reason</span><span style={{ color: T.muted }}>{d.reason}</span></>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {d ? <>
                  <Status tone={d.status === 'approved' ? 'good' : 'bad'}>{d.status === 'approved' ? 'Standby approved' : 'Standby rejected'}</Status>
                  <Btn size="sm" onClick={() => p.decideStandby(c.id, null)}>Change decision</Btn>
                </> : <>
                  <input value={reason[c.id] ?? ''} onChange={e => setReason({ ...reason, [c.id]: e.target.value })}
                    placeholder="Reason, if you reject" aria-label="Reason for rejecting"
                    style={{ width: 250, padding: '7px 10px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn size="sm" kind="danger" onClick={() => p.decideStandby(c.id, { status: 'rejected', reason: reason[c.id]?.trim() || (c.matches ? undefined : c.recordSays) })}>Reject</Btn>
                    <Btn size="sm" kind="good" onClick={() => p.decideStandby(c.id, { status: 'approved' })}>Approve standby</Btn>
                  </div>
                </>}
              </div>
            </div>
          )
        })}
      </Card>

      <Card title="Shifts" subtitle="As logged at the rig. Metres, core recovery, hours and crew." pad={false}
        right={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg options={[{ value: 'both', label: 'Last two days' }, ...DATES.map(d => ({ value: d, label: shortDate(d) }))]} value={date} onChange={setDate} />
          <Seg options={CONTRACTOR_FILTER} value={who} onChange={setWho} />
        </div>}>
        <div style={{ padding: '12px 18px 4px' }}><HoursLegend /></div>
        <ShiftTable shifts={rows} />
      </Card>

      <Note>
        Standby decisions on this screen are saved in your browser for the demo. In the working product a rejected claim goes back to the contractor and cannot be invoiced.
      </Note>
    </Page>
  )
}
