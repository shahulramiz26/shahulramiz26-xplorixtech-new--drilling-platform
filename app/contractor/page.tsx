'use client'

import Link from 'next/link'
import { TODAY, addDays } from '../../lib/inventory-store'
import { workOrderProgress, unbilled, billFigures, BILL_STATUS_LABEL } from '../../lib/contracting'
import { day } from '../../lib/projects'
import { T, Page, Head, Card, Tile, Grid, Btn, Note, Status, Empty, DepthBar, rowLine, type Tone } from '../components/kit'
import { n0, rs, shortDay } from '../admin/contractors/shared'
import { useMe, myShifts, NoLogin, CLIENT_NAME, type ShiftState } from './me'

/* ==========================================================================
 * HOME — what the contractor needs to do today
 *
 * Three questions, in the order a site manager asks them: has every shift
 * been sent, has anything come back, and what am I owed.
 * ========================================================================== */

const STATE_TONE: Record<ShiftState | 'none', Tone> = { none: 'neutral', waiting: 'warn', returned: 'bad', checked: 'good' }
const STATE_WORD: Record<ShiftState | 'none', string> = { none: 'Not sent', waiting: 'Waiting to be checked', returned: 'Sent back', checked: 'Checked' }

export default function ContractorHome() {
  const { state, me, side } = useMe()
  if (!me) return <NoLogin />

  const shifts = myShifts(side)
  const active = side.orders.filter(w => w.status === 'active')
  const month = TODAY.slice(0, 7)
  const checkedMonth = side.accepted.filter(l => l.date.startsWith(month)).reduce((s, l) => s + l.metresDrilled, 0)
  const waitingMetres = side.waiting.reduce((s, r) => s + r.metres, 0)
  const owed = active.map(w => ({ w, u: unbilled(state, w, TODAY) })).filter(x => x.u)
  const billsBack = side.bills.filter(b => b.status === 'returned')
  const billsOpen = side.bills.filter(b => b.status === 'received' || b.status === 'approved')

  // Every rig, the last two days, both shifts: sent or not.
  const lastTwo = [TODAY, addDays(TODAY, -1)]
  const slots = active.flatMap(w => w.rigs.map(rig => ({ w, rig, days: lastTwo.filter(d => d >= w.startDate) })))
  const find = (rig: string, date: string, shift: 'Day' | 'Night') => shifts.find(s => s.rig === rig && s.date === date && s.shift === shift)
  /* A rig that has only ever sent day shifts works one shift a day, so a
   * night shift is not expected from it. A rig with no history gets both. */
  const worked = (rig: string): ('Day' | 'Night')[] => {
    const seen = new Set(shifts.filter(s => s.rig === rig).map(s => s.shift))
    return seen.size ? (['Day', 'Night'] as const).filter(sh => seen.has(sh)) : ['Day', 'Night']
  }
  const missing = slots.flatMap(({ rig, days }) => days.flatMap(d => worked(rig).filter(sh => !find(rig, d, sh)).map(sh => ({ rig, d, sh }))))

  return (
    <Page>
      <Head title={`Work for ${CLIENT_NAME}`}
        sub={<>Enter each shift in the drill log and send it. {CLIENT_NAME} checks it, and only checked metres are paid. Whatever they say about a shift or a bill shows here.</>}
        right={<Btn kind="primary" href="/contractor/drill-log">Add a shift</Btn>} />

      {(side.returned.length > 0 || billsBack.length > 0) && (
        <Note tone="bad">
          <b style={{ color: T.text }}>Sent back to you: </b>
          {side.returned.length > 0 && <><Link href="/contractor/shifts" style={{ color: T.orange, fontWeight: 600, textDecoration: 'none' }}>{side.returned.length} {side.returned.length === 1 ? 'shift' : 'shifts'}</Link>{billsBack.length ? ' and ' : '. '}</>}
          {billsBack.length > 0 && <><Link href="/contractor/bills" style={{ color: T.orange, fontWeight: 600, textDecoration: 'none' }}>{billsBack.length} {billsBack.length === 1 ? 'bill' : 'bills'}</Link>. </>}
          They are not in the record until you correct them and send them again.
        </Note>
      )}

      <Grid min={210}>
        <Tile label="Shifts not sent yet" value={missing.length} tone={missing.length ? 'warn' : 'good'}
          note={missing.length ? 'Today and yesterday, across your rigs' : 'Every shift for today and yesterday is in'} />
        <Tile label="Waiting to be checked" value={side.waiting.length} note={side.waiting.length ? `${n0(waitingMetres)} m, not counted yet` : 'Nothing waiting'} />
        <Tile label="Checked this month" value={`${n0(checkedMonth)} m`} note="In the record, payable" />
        <Tile label="Checked work not billed yet" value={rs(owed.reduce((s, x) => s + x.u!.net, 0))} note={owed.length ? 'After the work order’s deductions' : 'Everything checked is on a bill'} />
      </Grid>

      <Card title="Today and yesterday" pad={false} subtitle="One line for every shift each rig should have sent.">
        {slots.length === 0 && <Empty>No rig of yours is on a running work order.</Empty>}
        {slots.map(({ w, rig, days }, i) => (
          <div key={rig} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.7fr) minmax(0, 3fr)', gap: 16, padding: '13px 18px', borderTop: i ? rowLine : undefined, alignItems: 'center' }} className="xpl-prow">
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{rig}</div>
              <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{w.number}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 8 }}>
              {days.flatMap(d => worked(rig).map(sh => {
                const s = find(rig, d, sh)
                const st = s?.state ?? 'none'
                return (
                  <div key={d + sh} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.raised }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: T.text, fontWeight: 600 }}>{d === TODAY ? 'Today' : shortDay(d)} · {sh.toLowerCase()}</div>
                      <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{s ? (s.metres > 0 ? `${s.metres} m on ${s.hole}` : 'No metres') : 'Nothing sent'}</div>
                    </div>
                    {s
                      ? <Status tone={STATE_TONE[st]}>{STATE_WORD[st]}</Status>
                      : <Btn size="sm" href={`/contractor/drill-log?rig=${encodeURIComponent(rig)}&date=${d}&shift=${sh}`}>Add</Btn>}
                  </div>
                )
              }))}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Your work orders" pad={false} right={<Btn size="sm" href="/contractor/work-order">Rates and terms</Btn>}>
        {side.orders.length === 0 && <Empty>{CLIENT_NAME} has not put you on a work order yet.</Empty>}
        {side.orders.map((w, i) => {
          const p = workOrderProgress(state, w, TODAY)
          return (
            <div key={w.id} className="xpl-prow" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,0.9fr)', gap: 18, padding: '14px 18px', borderTop: i ? rowLine : undefined, alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{w.number} <span style={{ fontWeight: 400, color: T.faint }}>· {w.project}</span></div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>{w.rigs.join(', ')} · {day(w.startDate)} to {day(w.endDate)}</div>
              </div>
              <DepthBar drilled={p.metres} planned={w.plannedMetres} width="100%" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {w.status === 'closed' ? <Status tone="neutral">Closed</Status> : p.late ? <Status tone="bad">{p.daysLate} days past the finish date</Status> : <Status tone="good">Running</Status>}
              </div>
            </div>
          )
        })}
      </Card>

      {billsOpen.length > 0 && (
        <Card title="Bills with the client" pad={false} right={<Btn size="sm" href="/contractor/bills">Open bills</Btn>}>
          {billsOpen.map((b, i) => {
            const f = billFigures(state, b)
            return (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 18px', borderTop: i ? rowLine : undefined, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{b.number}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{day(b.periodFrom)} to {day(b.periodTo)} · claimed {rs(f.claimed)}</div>
                </div>
                <Status tone={b.status === 'approved' ? 'good' : 'warn'}>{b.status === 'approved' ? `Approved for ${rs(f.net)}` : BILL_STATUS_LABEL[b.status] === 'To check' ? 'Being checked' : BILL_STATUS_LABEL[b.status]}</Status>
              </div>
            )
          })}
        </Card>
      )}
    </Page>
  )
}
