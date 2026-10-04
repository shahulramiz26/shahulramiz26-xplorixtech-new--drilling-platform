'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  usePortal, DEMO_HOLES, CONTRACTORS, PROGRAMME, recoveryFlag, offPlanFlag, num, downloadCsv, type ApprovalState,
} from '../../../lib/owner-portal'
import {
  Page, PageHead, Card, Seg, Btn, Table, Status, Who, Flag, CONTRACTOR_FILTER,
  th, thR, td, tdR, tdStrong, rowLine, T, type ContractorFilter, type Tone,
} from '../ui'

/* HOLES — every hole from collar to close on one screen.
 * Orange marks the two things a contract can be broken on: core recovery
 * below the minimum, and a hole more than 5 m off its planned path. */

type View = 'current' | 'all' | 'Drilling' | 'Closed' | 'Planned'
const VIEWS: { value: View; label: string }[] = [
  { value: 'current', label: 'Current holes' }, { value: 'all', label: 'All holes' },
  { value: 'Drilling', label: 'Drilling' }, { value: 'Closed', label: 'Closed' }, { value: 'Planned', label: 'Planned' },
]
const APPROVAL: Record<ApprovalState, { label: string; tone: Tone } | null> = {
  none: null,
  waiting: { label: 'Waiting for you', tone: 'info' },
  approved: { label: 'Approved', tone: 'good' },
  returned: { label: 'Returned', tone: 'bad' },
  invoiced: { label: 'Invoiced', tone: 'neutral' },
}
const stageTone: Record<string, Tone> = { Drilling: 'info', Closed: 'good', Planned: 'neutral' }

export default function HolesPage() {
  const p = usePortal()
  const router = useRouter()
  const [view, setView] = useState<View>('current')
  const [who, setWho] = useState<ContractorFilter>('all')

  const rows = DEMO_HOLES
    .filter(h => view === 'all' ? true : view === 'current' ? h.id >= 'DH-101' && h.id <= 'DH-106' : h.stage === view)
    .filter(h => who === 'all' || h.contractor === who)
  const drilling = DEMO_HOLES.filter(h => h.stage === 'Drilling')
  const flagged = drilling.filter(h => recoveryFlag(h.recovery) || offPlanFlag(h.offPlan))

  const exportCsv = () => downloadCsv('xplorix-holes', [
    ['Hole', 'Contractor', 'Planned m', 'Drilled m', 'Days', 'ROP m/hr', 'Recovery %', 'Off plan m', 'Status', 'Approval'],
    ...rows.map(h => [h.id, CONTRACTORS[h.contractor].name, h.planned, h.drilled, h.days, h.rop, h.recovery, h.offPlan, h.stage, APPROVAL[p.demoApproval(h)]?.label ?? '']),
  ])

  return (
    <Page>
      <PageHead
        question="How is each hole doing?"
        tone={flagged.length ? 'warn' : 'good'}
        answer={<>
          {drilling.length} holes are drilling. {flagged.length
            ? <>{flagged.length} {flagged.length === 1 ? 'has' : 'have'} a number outside the contract: {flagged.map(h => {
              const why = [recoveryFlag(h.recovery) ? `recovery ${h.recovery}%` : '', offPlanFlag(h.offPlan) ? `${h.offPlan} m off plan` : ''].filter(Boolean).join(', ')
              return `${h.id} (${why})`
            }).join(' and ')}.</>
            : 'All are inside the contract.'}
        </>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Card pad={false}
        title="Hole performance"
        subtitle={`▲ marks core recovery below ${PROGRAMME.contractRecovery}%, or a hole more than ${PROGRAMME.maxOffPlan} m off the planned path. Click a hole for its full history.`}
        right={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Seg options={VIEWS} value={view} onChange={setView} />
          <Seg options={CONTRACTOR_FILTER} value={who} onChange={setWho} />
        </div>}>
        <Table>
          <thead>
            <tr>
              <th style={th}>Hole</th><th style={th}>Contractor</th><th style={thR}>Planned</th><th style={thR}>Drilled</th>
              <th style={thR}>Days</th><th style={thR}>ROP m/hr</th><th style={thR}>Recovery</th><th style={thR}>Off plan</th>
              <th style={th}>Status</th><th style={th}>Billing approval</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(h => {
              const ap = APPROVAL[p.demoApproval(h)]
              return (
                <tr key={h.id} className="xpl-row" onClick={() => router.push(`/client/holes/${h.id}`)} style={{ borderBottom: rowLine, cursor: 'pointer' }}>
                  <td style={tdStrong}>{h.id}</td>
                  <td style={td}><Who id={h.contractor} /></td>
                  <td style={tdR}>{num(h.planned)} m</td>
                  <td style={{ ...tdR, color: T.text }}>{h.drilled == null ? '—' : `${num(h.drilled)} m`}</td>
                  <td style={tdR}>{h.days ?? '—'}</td>
                  <td style={tdR}>{h.rop == null ? '—' : h.rop.toFixed(1)}</td>
                  <td style={tdR}><Flag on={recoveryFlag(h.recovery)}>{h.recovery == null ? '—' : `${h.recovery}%`}</Flag></td>
                  <td style={tdR}><Flag on={offPlanFlag(h.offPlan)}>{h.offPlan == null ? '—' : `${h.offPlan.toFixed(1)} m`}</Flag></td>
                  <td style={td}><Status tone={stageTone[h.stage]}>{h.stage}</Status></td>
                  <td style={td}>{ap ? <Status tone={ap.tone}>{ap.label}</Status> : <span style={{ color: T.dim }}>—</span>}</td>
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td style={{ ...td, padding: 24 }} colSpan={10}>No holes match this filter.</td></tr>}
          </tbody>
        </Table>
      </Card>
    </Page>
  )
}
