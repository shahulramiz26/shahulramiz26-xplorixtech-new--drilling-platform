'use client'

import { useState } from 'react'
import { money, HOLE_STATUS_LABEL } from '../../../lib/costing-store'
import {
  usePortal, DEMO_HOLES, CONTRACTORS, LIVE_CONTRACTOR, PROGRAMME, demoHoleBilling, shiftsForDemoHole,
  num, shortDate, type ContractorId,
} from '../../../lib/owner-portal'
import { Page, PageHead, Card, Btn, Table, Status, Who, DemoTag, Note, th, thR, td, tdR, tdStrong, rowLine, T, type Tone } from '../ui'

/* HOLE APPROVALS — approve each hole at closure, before it is invoiced.
 *
 * The contractor sends a closed hole across; nothing can be invoiced on it
 * until the owner approves it here. A hole is approved once and invoiced once,
 * which is what stops the same metres being billed twice.
 *
 * A live hole is approved in the contractor's own record, so his Finance
 * screen changes the moment the button is pressed. */

interface Check { label: string; value: string; tone: Tone }
interface Waiting {
  id: string; live: boolean; contractor: ContractorId; project: string
  sent?: string; checks: Check[]; value: number
}

export default function ApprovalsPage() {
  const p = usePortal()
  const [returning, setReturning] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const min = PROGRAMME.contractRecovery
  const waiting: Waiting[] = [
    ...p.liveWaiting.map(h => ({
      id: h.id, live: true, contractor: LIVE_CONTRACTOR, project: h.project, sent: h.submittedAt, value: h.value,
      checks: [
        { label: 'Metres drilled', value: h.planned ? `${num(h.drilled)} m of ${num(h.planned)} m planned` : `${num(h.drilled)} m`, tone: (h.planned && h.drilled < h.planned * 0.97 ? 'warn' : 'good') as Tone },
        { label: 'Core recovery', value: `${h.recoveryPct.toFixed(1)}% (contract minimum ${min}%)`, tone: (h.recoveryPct < min ? 'warn' : 'good') as Tone },
        { label: 'Shift record', value: `${h.shifts.length} shifts over ${h.days} days, all submitted`, tone: 'good' as Tone },
        { label: 'Days not drilling', value: `${h.standbyDays} standby (billable) · ${h.breakdownDays} breakdown (not billable)`, tone: 'neutral' as Tone },
        { label: 'Core boxes, photos, surveys', value: 'Not recorded yet · in development', tone: 'neutral' as Tone },
      ],
    })),
    ...p.demoWaiting.map(h => {
      const shifts = shiftsForDemoHole(h)
      return {
        id: h.id, live: false, contractor: h.contractor, project: PROGRAMME.name, sent: h.end,
        value: demoHoleBilling(h).reduce((s, b) => s + b.amount, 0),
        checks: [
          { label: 'Metres drilled', value: `${num(h.drilled ?? 0)} m of ${num(h.planned)} m planned`, tone: 'good' as Tone },
          { label: 'Core recovery', value: `${h.recovery}% (contract minimum ${min}%)`, tone: ((h.recovery ?? 0) < min ? 'warn' : 'good') as Tone },
          { label: 'Shift record', value: `${shifts.length} shifts over ${h.days} days, all submitted`, tone: 'good' as Tone },
          { label: 'Off planned path', value: `${h.offPlan} m (flagged above ${PROGRAMME.maxOffPlan} m) · sample survey data`, tone: ((h.offPlan ?? 0) > PROGRAMME.maxOffPlan ? 'warn' : 'good') as Tone },
          { label: 'Core boxes and photos', value: 'Sample: 67 of 67 boxes photographed · in development', tone: 'neutral' as Tone },
        ],
      }
    }),
  ]

  const approve = (w: Waiting) => w.live ? p.decideLiveHole(w.id, true) : p.decideDemoHole(w.id, true)
  const sendBack = (w: Waiting) => {
    if (!reason.trim()) return
    if (w.live) p.decideLiveHole(w.id, false, reason); else p.decideDemoHole(w.id, false, reason)
    setReturning(null); setReason('')
  }

  // What has already been decided, newest first.
  const decided = [
    ...p.live.filter(h => h.status !== 'submitted' && (h.decidedAt || h.status === 'approved' || h.status === 'invoiced')).map(h => ({
      id: h.id, live: true, contractor: LIVE_CONTRACTOR, project: h.project, drilled: h.drilled, value: h.value,
      state: h.status === 'closed' ? 'Returned' : HOLE_STATUS_LABEL[h.status], when: h.decidedAt, note: h.returnReason,
    })),
    ...DEMO_HOLES.filter(h => ['approved', 'returned', 'invoiced'].includes(p.demoApproval(h))).reverse().map(h => {
      const a = p.demoApproval(h)
      return {
        id: h.id, live: false, contractor: h.contractor, project: PROGRAMME.name, drilled: h.drilled ?? 0,
        value: demoHoleBilling(h).reduce((s, b) => s + b.amount, 0),
        state: a === 'approved' ? 'Approved' : a === 'returned' ? 'Returned' : 'Invoiced', when: h.end, note: h.invoice,
      }
    }),
  ]

  return (
    <Page>
      <PageHead
        question="Which closed holes can I approve for billing?"
        tone={waiting.length ? 'info' : 'good'}
        answer={waiting.length
          ? <>{waiting.length} {waiting.length === 1 ? 'hole is' : 'holes are'} closed and waiting for you. A contractor cannot invoice a hole until you approve it, and an approved hole can be invoiced only once.</>
          : <>Nothing is waiting. A hole appears here the moment a contractor closes it and sends it for approval.</>}
      />

      {waiting.map(w => (
        <Card key={w.id} pad={false}
          title={`Hole ${w.id}`}
          subtitle={`${w.project} · sent ${shortDate(w.sent)}`}
          right={<div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: T.muted }}><Who id={w.contractor} /><DemoTag live={w.live} /></div>}>
          <div style={{ padding: '6px 18px 2px' }}>
            {w.checks.map(c => (
              <div key={c.label} style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 14, padding: '9px 0', borderBottom: rowLine, fontSize: 13, alignItems: 'baseline' }}>
                <span style={{ color: T.faint }}>{c.label}</span>
                <span style={{ color: c.tone === 'neutral' ? T.muted : T.text }}>
                  {c.tone !== 'neutral' && <span aria-hidden style={{ color: c.tone === 'good' ? T.green : T.amber, fontWeight: 800, marginRight: 8 }}>{c.tone === 'good' ? '✓' : '!'}</span>}
                  {c.value}
                </span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: 14, padding: '11px 0', fontSize: 13, alignItems: 'baseline' }}>
              <span style={{ color: T.faint }}>Will bill, before tax</span>
              <span style={{ color: T.text, fontWeight: 700, fontSize: 15 }}>{money(w.value)}</span>
            </div>
          </div>
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            {returning === w.id ? <>
              <input autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="Tell the contractor what to fix"
                aria-label="Reason for returning the hole"
                style={{ flex: '1 1 260px', padding: '8px 11px', borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
              <Btn size="sm" onClick={() => { setReturning(null); setReason('') }}>Cancel</Btn>
              <Btn size="sm" kind="danger" disabled={!reason.trim()} onClick={() => sendBack(w)}>Return to contractor</Btn>
            </> : <>
              <Btn size="sm" href={`/client/holes/${w.id}`}>Open the full shift record</Btn>
              <Btn size="sm" kind="danger" onClick={() => { setReturning(w.id); setReason('') }}>Return to contractor</Btn>
              <Btn size="sm" kind="good" onClick={() => approve(w)}>Approve for billing</Btn>
            </>}
          </div>
        </Card>
      ))}

      <Card title="Already decided" subtitle="Approved holes move to the contractor for invoicing. Returned holes go back with your reason." pad={false}>
        <Table>
          <thead><tr><th style={th}>Hole</th><th style={th}>Contractor</th><th style={th}>Project</th><th style={thR}>Drilled</th>
            <th style={thR}>Value</th><th style={th}>Decision</th><th style={th}>Date</th><th style={th}>Note</th></tr></thead>
          <tbody>
            {decided.map(d => (
              <tr key={`${d.live}_${d.id}`} style={{ borderBottom: rowLine }}>
                <td style={tdStrong}>{d.id} {d.live && <span style={{ marginLeft: 6 }}><DemoTag live /></span>}</td>
                <td style={td}><Who id={d.contractor} /></td>
                <td style={td}>{d.project}</td>
                <td style={tdR}>{num(d.drilled)} m</td>
                <td style={tdR}>{money(d.value)}</td>
                <td style={td}><Status tone={d.state === 'Returned' ? 'bad' : d.state === 'Invoiced' ? 'neutral' : 'good'}>{d.state}</Status></td>
                <td style={td}>{shortDate(d.when)}</td>
                <td style={{ ...td, whiteSpace: 'normal', maxWidth: 260 }}>{d.note ?? '—'}</td>
              </tr>
            ))}
            {decided.length === 0 && <tr><td style={{ ...td, padding: 20 }} colSpan={8}>Nothing decided yet.</td></tr>}
          </tbody>
        </Table>
      </Card>

      <Note>
        Holes marked LIVE come from the contractor&apos;s own XPLORIX account. Approving or returning one changes his Finance screen straight away.
      </Note>
    </Page>
  )
}
