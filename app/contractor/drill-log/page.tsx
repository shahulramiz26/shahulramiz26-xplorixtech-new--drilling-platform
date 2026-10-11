'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { uid, nowStamp, chargeShift, HOLE_SIZES, type ShiftName, type ShiftLog } from '../../../lib/costing-store'
import { TODAY, addDays } from '../../../lib/inventory-store'
import { downtimeReasons } from '../../../lib/mock-data'
import { holeStands, payRateOn, reportProblems, type ContractorReport, type WorkOrder } from '../../../lib/contracting'
import { when } from '../../../lib/projects'
import { T, tint, Page, Head, Card, Btn, Note, Field, Switch, Seg, Status, Empty, Split, inputStyle, rowLine } from '../../components/kit'
import { n1, rs, shortDay, numInput, Sum } from '../../admin/contractors/shared'
import { useMe, NoLogin, CLIENT_NAME } from '../me'

/* ==========================================================================
 * DRILL LOG — the contractor writes his own shift and sends it
 *
 * This is the whole of how a contractor's work reaches the client: he enters
 * the shift here, once, and sends it. No sheet is emailed and nobody on the
 * client's side types it again. The shift then waits for the client's site
 * staff to check it; only a checked shift is paid.
 *
 * The form asks for what the client pays on and nothing else: the hole, the
 * depths, the core, and how the hours were spent. Fuel, crew and parts are
 * the contractor's own business and are not asked for.
 * ========================================================================== */

const GROUND = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Very Hard Formation']
const OTHER = '__other'
const num = (v: string) => (v.trim() === '' ? 0 : parseFloat(v) || 0)

function DrillLogForm() {
  const { state, me, side, saveReport, deleteReport } = useMe()
  const params = useSearchParams()
  const fixId = params.get('fix')
  const fixing = fixId ? side.returned.find(r => r.id === fixId) : undefined
  const active = useMemo(() => side.orders.filter(w => w.status === 'active'), [side.orders])

  /* The work order and the rig are worked out from what is chosen, never
   * trusted as typed: who is signed in is only known once the browser has
   * loaded, and a rig kept from before that would belong to someone else. */
  const [woId, setWoId] = useState(fixing?.workOrderId ?? '')
  const [rigPick, setRig] = useState(fixing?.rig ?? params.get('rig') ?? '')
  const wo: WorkOrder | undefined = active.find(w => w.id === woId) ?? active.find(w => w.rigs.includes(rigPick)) ?? active[0]
  const rig = wo ? (wo.rigs.includes(rigPick) ? rigPick : wo.rigs[0] ?? '') : ''
  const [date, setDate] = useState(fixing?.date ?? params.get('date') ?? TODAY)
  const [shift, setShift] = useState<ShiftName>(fixing?.shift ?? (params.get('shift') === 'Night' ? 'Night' : 'Day'))
  const [shiftHours, setShiftHours] = useState(String(fixing?.shiftHours ?? 12))
  const [holePick, setHolePick] = useState('')
  const [holeText, setHoleText] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [core, setCore] = useState('')
  const [size, setSize] = useState(fixing?.holeSize ?? 'HQ')
  const [ground, setGround] = useState(fixing?.formationType || 'Hard Formation')
  const [drill, setDrill] = useState(String(fixing?.drillingHours ?? 12))
  const [standby, setStandby] = useState(fixing?.standbyHours ? String(fixing.standbyHours) : '')
  const [breakdown, setBreakdown] = useState(fixing?.breakdownHours ? String(fixing.breakdownHours) : '')
  const [reason, setReason] = useState(fixing?.reason ?? '')
  const [closed, setClosed] = useState(!!fixing?.holeClosed)
  const [remarks, setRemarks] = useState(fixing?.remarks ?? '')
  const [sent, setSent] = useState<string | null>(null)

  /* Holes this contractor can be on: the ones his rigs have open, then the
   * holes on the client's plan that nobody has started. A hole another rig is
   * drilling is not his and is not listed. */
  const holes = useMemo(() => {
    if (!wo) return []
    const mineLogs = state.shiftLogs.filter(l => l.workOrderId === wo.id && l.holeNumber)
    const closedHoles = new Set(state.shiftLogs.filter(l => l.holeClosedThisShift && l.holeNumber).map(l => l.holeNumber!))
    const started = new Set(state.shiftLogs.filter(l => l.holeNumber).map(l => l.holeNumber!))
    const mineOpen = Array.from(new Set([
      ...mineLogs.map(l => l.holeNumber!),
      ...side.waiting.filter(r => r.workOrderId === wo.id && r.holeNumber).map(r => r.holeNumber!),
      ...(fixing?.holeNumber ? [fixing.holeNumber] : []),
    ])).filter(h => !closedHoles.has(h))
    const planned = Object.entries(state.holePlans ?? {})
      .filter(([id, p]) => p.project === wo.project && !started.has(id) && !mineOpen.includes(id)
        && !state.contractorReports.some(r => r.holeNumber === id && r.workOrderId !== wo.id))
      .map(([id]) => id)
    const sort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
    return [...mineOpen.sort(sort).map(id => ({ id, open: true })), ...planned.sort(sort).map(id => ({ id, open: false }))]
  }, [state, wo, side.waiting, fixing])

  /* The hole this rig was last on, so the usual shift needs no choosing. */
  const lastHole = (r: string) => {
    const mine = [
      ...state.shiftLogs.filter(l => l.rig === r && l.workOrderId === wo?.id && l.holeNumber).map(l => ({ h: l.holeNumber!, k: l.date + (l.shift === 'Day' ? '0' : '1') })),
      ...side.waiting.filter(x => x.rig === r && x.holeNumber).map(x => ({ h: x.holeNumber!, k: x.date + (x.shift === 'Day' ? '0' : '1') })),
    ].sort((a, b) => b.k.localeCompare(a.k))
    return mine.find(x => holes.some(h => h.id === x.h && h.open))?.h ?? ''
  }

  const hole = (holePick === OTHER ? holeText : holePick).trim().toUpperCase()
  const stands = hole ? holeStands(state, hole, { date, shift }, fixing?.id) : 0

  // First load, and whenever the rig changes: pick its hole.
  useEffect(() => {
    if (fixing) {
      /* The shift that came back, as it was sent. A shift saved in this
       * browser is only known after the store has loaded, so the form is
       * filled here and not just when the page first opens. */
      const h = fixing.holeNumber ?? ''
      setWoId(fixing.workOrderId); setRig(fixing.rig); setDate(fixing.date); setShift(fixing.shift)
      setShiftHours(String(fixing.shiftHours ?? 12)); setSize(fixing.holeSize || 'HQ'); setGround(fixing.formationType || 'Hard Formation')
      setDrill(String(fixing.drillingHours)); setStandby(fixing.standbyHours ? String(fixing.standbyHours) : '')
      setBreakdown(fixing.breakdownHours ? String(fixing.breakdownHours) : ''); setReason(fixing.reason ?? '')
      setClosed(!!fixing.holeClosed); setRemarks(fixing.remarks ?? '')
      setHolePick(h && holes.some(x => x.id === h) ? h : h ? OTHER : '')
      setHoleText(h && !holes.some(x => x.id === h) ? h : '')
      setCore(fixing.coreRecovery ? String(fixing.coreRecovery) : '')
      return
    }
    setHolePick(lastHole(rig))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rig, wo?.id, fixing?.id])
  // Whenever the hole changes: the shift starts where the record stands.
  useEffect(() => {
    if (!hole) { setFrom(''); setTo(''); return }
    setFrom(String(stands)); setTo('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hole, stands])

  if (!me) return <NoLogin />
  if (!wo) {
    return <Page><Head title="Drill log" /><Card><Empty>You are not on a running work order with {CLIENT_NAME}, so there is no shift to enter.</Empty></Card></Page>
  }

  const f = num(from), t = to.trim() === '' ? f : num(to)
  const metres = Math.round((t - f) * 100) / 100
  const coreM = num(core)
  const hrs = num(shiftHours) || 12
  const drilling = num(drill), sb = num(standby), bd = num(breakdown)
  const stopped = sb + bd

  const rate = payRateOn(wo, date)
  const worth = metres > 0 && hole
    ? chargeShift(rate, { date, shift, holeNumber: hole, holeSize: size, formationType: ground, metresDrilled: metres } as ShiftLog, f)
    : []
  const worthSum = worth.reduce((s, c) => s + c.amount, 0)

  const taken = [...side.waiting, ...side.returned].some(r => r.id !== fixing?.id && r.rig === rig && r.date === date && r.shift === shift)
    || side.accepted.some(l => l.rig === rig && l.date === date && l.shift === shift)
  const problems = [
    ...reportProblems({ rig, date, holeNumber: hole || null, metres, coreRecovery: coreM, drillingHours: drilling, standbyHours: sb, breakdownHours: bd, reason }, hrs, TODAY),
    ...(taken ? [`You have already sent the ${shift.toLowerCase()} shift for ${rig} on ${shortDay(date)}. Correct that one from the shift record.`] : []),
    ...(date < wo.startDate ? [`The work order starts on ${shortDay(wo.startDate)}.`] : []),
  ]
  const gap = hole && metres > 0 && Math.abs(f - stands) > 0.05

  const send = () => {
    if (problems.length) return
    const r: ContractorReport = {
      id: fixing?.id ?? uid('rp'), workOrderId: wo.id, rig, project: wo.project, date, shift,
      holeNumber: hole || null, holeSize: size, formationType: metres > 0 ? ground : '',
      fromDepth: hole ? f : undefined, toDepth: hole ? f + metres : undefined,
      metres, coreRecovery: coreM, shiftHours: hrs, drillingHours: drilling, standbyHours: sb, breakdownHours: bd,
      reason: stopped > 0 ? reason : '', holeClosed: closed || undefined, remarks: remarks.trim() || undefined,
      source: 'login', receivedAt: nowStamp(), status: 'waiting',
    }
    saveReport(r)
    setSent(`${shift} shift on ${rig}, ${shortDay(date)}: ${metres > 0 ? `${metres} m on ${hole}` : 'no metres'}`)
    // Ready for the next one: the night after the day, the next day after the night.
    if (shift === 'Day') setShift('Night')
    else { setShift('Day'); if (addDays(date, 1) <= TODAY) setDate(addDays(date, 1)) }
    setTo(''); setCore(''); setStandby(''); setBreakdown(''); setReason(''); setRemarks(''); setClosed(false); setDrill(String(hrs))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const recent = [...side.waiting].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)).slice(0, 6)
  const grid = (min: number): React.CSSProperties => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 14 })

  return (
    <Page>
      <Head title={fixing ? 'Correct a shift and send it again' : 'Drill log'}
        sub={<>Enter the shift once and send it to {CLIENT_NAME}. They check it against what they see on site. Only a checked shift is paid.</>} />

      {fixing && !sent && (
        <Note tone="bad">
          <b style={{ color: T.text }}>{CLIENT_NAME} sent this shift back.</b> {fixing.returnReason}
          <div style={{ fontSize: 12, color: T.faint, marginTop: 3 }}>{fixing.returnedBy}{fixing.returnedAt ? ` · ${when(fixing.returnedAt)}` : ''} · you had sent {fixing.metres} m{fixing.fromDepth != null ? `, ${n1(fixing.fromDepth)} to ${n1(fixing.fromDepth + fixing.metres)} m` : ''}</div>
        </Note>
      )}
      {sent && (
        <Note tone="good">
          <b style={{ color: T.text }}>Sent to {CLIENT_NAME}.</b> {sent}. It is waiting to be checked.{' '}
          <Link href="/contractor/shifts" style={{ color: T.orange, fontWeight: 600, textDecoration: 'none' }}>Open the shift record</Link>
        </Note>
      )}

      <Split left={1.9} right={1}>
        <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
          <Card title="Which shift">
            <div style={grid(150)}>
              {active.length > 1 && (
                <Field label="Work order">
                  <select value={wo.id} disabled={!!fixing} onChange={e => { const w = active.find(x => x.id === e.target.value); setWoId(e.target.value); setRig(w?.rigs[0] ?? '') }} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {active.map(w => <option key={w.id} value={w.id}>{w.number} · {w.project}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Rig">
                <select value={rig} disabled={!!fixing} onChange={e => setRig(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {wo.rigs.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Date"><input type="date" value={date} max={TODAY} min={wo.startDate} disabled={!!fixing} onChange={e => setDate(e.target.value)} style={inputStyle} /></Field>
              <Field label="Shift">
                {fixing ? <div style={{ ...inputStyle, opacity: 0.7 }}>{shift}</div>
                  : <Seg<ShiftName> options={[{ value: 'Day', label: 'Day' }, { value: 'Night', label: 'Night' }]} value={shift} onChange={setShift} />}
              </Field>
              <Field label="Shift length">
                <Seg<string> options={['8', '10', '12'].map(h => ({ value: h, label: `${h} h` }))} value={shiftHours}
                  onChange={v => { setShiftHours(v); setDrill(String(Math.max(0, (parseFloat(v) || 12) - stopped))) }} />
              </Field>
            </div>
          </Card>

          <Card title="Drilling" subtitle="Leave the depths empty for a shift with no metres.">
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={grid(150)}>
                <Field label="Hole" hint={hole ? `The record stands at ${n1(stands)} m` : 'Choose the hole you drilled'}>
                  <select value={holePick} onChange={e => setHolePick(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">No hole this shift</option>
                    {holes.filter(h => h.open).length > 0 && <optgroup label="Your open holes">{holes.filter(h => h.open).map(h => <option key={h.id} value={h.id}>{h.id}</option>)}</optgroup>}
                    {holes.filter(h => !h.open).length > 0 && <optgroup label="On the plan, not started">{holes.filter(h => !h.open).map(h => <option key={h.id} value={h.id}>{h.id}</option>)}</optgroup>}
                    <option value={OTHER}>Another hole…</option>
                  </select>
                </Field>
                {holePick === OTHER && (
                  <Field label="Hole number"><input value={holeText} onChange={e => setHoleText(e.target.value)} placeholder="DH-000" autoFocus style={inputStyle} /></Field>
                )}
                <Field label="From, m" hint={gap ? `The record stands at ${n1(stands)} m. Say why in the remarks.` : undefined}>
                  <input type="number" value={from} disabled={!hole} onChange={e => setFrom(e.target.value)} style={{ ...inputStyle, ...numInput }} />
                </Field>
                <Field label="To, m">
                  <input type="number" value={to} disabled={!hole} onChange={e => setTo(e.target.value)} placeholder={hole ? String(stands) : ''} style={{ ...inputStyle, ...numInput }} />
                </Field>
                <Field label="Core recovered, m" hint={metres > 0 && coreM > 0 ? `${((coreM / metres) * 100).toFixed(0)}% recovery` : undefined}>
                  <input type="number" value={core} disabled={metres <= 0} onChange={e => setCore(e.target.value)} placeholder="0" style={{ ...inputStyle, ...numInput }} />
                </Field>
              </div>
              <div style={grid(150)}>
                <Field label="Core size">
                  <select value={size} onChange={e => setSize(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{HOLE_SIZES.map(h => <option key={h}>{h}</option>)}</select>
                </Field>
                <Field label="Ground">
                  <select value={ground} onChange={e => setGround(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{GROUND.map(g => <option key={g} value={g}>{g.replace(' Formation', '')}</option>)}</select>
                </Field>
              </div>
              {hole && <Switch on={closed} onChange={setClosed} label={`${hole} was finished this shift`} hint="The hole is closed at this depth and goes to the client for approval." />}
            </div>
          </Card>

          <Card title="How the hours were spent" subtitle={`Drilling and stopped hours must add up to the ${hrs} h shift.`}>
            <div style={grid(150)}>
              <Field label="Drilling hours"><input type="number" value={drill} onChange={e => setDrill(e.target.value)} style={{ ...inputStyle, ...numInput }} /></Field>
              <Field label="Standby hours" hint="Stopped, and not by you: waiting for instruction, weather, access.">
                <input type="number" value={standby} onChange={e => { setStandby(e.target.value); setDrill(String(Math.max(0, hrs - num(e.target.value) - bd))) }} placeholder="0" style={{ ...inputStyle, ...numInput }} />
              </Field>
              <Field label="Breakdown hours" hint="Stopped by your own rig or crew. Not paid.">
                <input type="number" value={breakdown} onChange={e => { setBreakdown(e.target.value); setDrill(String(Math.max(0, hrs - sb - num(e.target.value)))) }} placeholder="0" style={{ ...inputStyle, ...numInput }} />
              </Field>
              <Field label="Reason for the stop">
                <select value={reason} disabled={stopped <= 0} onChange={e => setReason(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">{stopped > 0 ? 'Choose a reason' : 'No stop'}</option>
                  {downtimeReasons.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Remarks" hint="Anything the client's site staff should know when they check this shift.">
                <input value={remarks} onChange={e => setRemarks(e.target.value)} style={inputStyle} />
              </Field>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start', minWidth: 0 }}>
          <Card title="This shift">
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>{rig} · {shortDay(date)} · {shift.toLowerCase()} shift · {wo.number}</div>
            <Sum label="Metres drilled" value={metres > 0 ? `${metres} m` : '0 m'} note={metres > 0 && hole ? `${hole}, ${n1(f)} to ${n1(f + metres)} m` : undefined} />
            <Sum label="Core recovery" value={metres > 0 ? `${((coreM / metres) * 100).toFixed(0)}%` : '—'} />
            <Sum label="Hours" value={`${drilling} drilling${stopped ? ` · ${stopped} stopped` : ''}`} />
            {worth.length > 0 && (
              <Sum strong label="Worth, once checked" value={rs(worthSum)}
                note={worth.map(c => `${Math.round(c.metres * 100) / 100} m at ${rs(c.rate)}`).join(' + ') + (worth.some(c => !c.matched) ? ' · no rate in the work order for this size or depth' : ' · before deductions')} />
            )}
            {metres <= 0 && sb >= hrs && <Sum strong label="Standby day" value={rate?.standbyPerDay ? rs(rate.standbyPerDay) : '—'} note="Paid only if the client agrees the stop was not yours, and the rig did not drill that day." />}

            {problems.length > 0 && (
              <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: tint(T.amber, 8), border: `1px solid ${tint(T.amber, 34)}` }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, marginBottom: 5 }}>Before this can be sent</div>
                {problems.map((p, i) => <div key={i} style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}><span aria-hidden style={{ color: T.amber, fontWeight: 800, marginRight: 6 }}>!</span>{p}</div>)}
              </div>
            )}
            <div style={{ marginTop: 16, display: 'grid' }}>
              <Btn kind="primary" disabled={problems.length > 0} onClick={send}>{fixing ? 'Send the corrected shift' : `Send to ${CLIENT_NAME}`}</Btn>
            </div>
            <div style={{ fontSize: 12, color: T.faint, marginTop: 10, lineHeight: 1.5 }}>
              Your fuel, crew and parts are not asked for. They are your own business.
            </div>
          </Card>

          <Card title={`Sent, waiting to be checked · ${side.waiting.length}`} pad={false}>
            {recent.length === 0 && <Empty>Nothing is waiting.</Empty>}
            {recent.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 16px', borderTop: i ? rowLine : undefined, alignItems: 'center' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{r.rig} · {shortDay(r.date)} {r.shift.toLowerCase()}</div>
                  <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{r.metres > 0 ? `${r.metres} m on ${r.holeNumber}` : 'No metres'} · sent {when(r.receivedAt)}</div>
                </div>
                <button type="button" onClick={() => deleteReport(r.id)} style={{ background: 'none', border: 'none', color: T.faint, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Take back</button>
              </div>
            ))}
            {side.waiting.length > recent.length && <div style={{ padding: '10px 16px', borderTop: rowLine }}><Status tone="neutral">and {side.waiting.length - recent.length} more</Status></div>}
          </Card>
        </div>
      </Split>
    </Page>
  )
}

export default function DrillLogPage() {
  return (
    <Suspense fallback={null}>
      <DrillLogForm />
    </Suspense>
  )
}
