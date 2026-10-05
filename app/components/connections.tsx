'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, KeyRound, Link2, Send, ShieldCheck, Unlink } from 'lucide-react'
import { OWNER_NAME, useCosting, type ProjectRecord } from '../../lib/costing-store'
import {
  MY_ID, check, company, nameFor, otherId, mine, waitingForMe, sendRequest, answerRequest, withdrawRequest, endConnection,
  resetConnections, tidyId, useConnections, type Company, type Connection, type Side,
} from '../../lib/connect-store'
import { T, tint, display, mono, Page, Head, Card, Split, Note, Btn, Status, Modal, Empty, inputStyle, rowLine } from './kit'
import { ProjectStatusTag, SharedTag } from './project-ui'

/* ==========================================================================
 * CONNECTIONS — one screen, used by both sides.
 *
 * The contractor sees it in Company Admin, the mine owner in the Client
 * Portal. Each shows the company's own XPLORIX ID, lets it send a request to
 * the other side by ID, answer requests it has received, and end a connection
 * when the work is over.
 * ========================================================================== */

const date = (d?: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const WORD: Record<Side, { them: string; themA: string; tryId: string }> = {
  contractor: { them: 'mine owner', themA: 'a mine owner', tryId: 'MO-1077' },
  owner: { them: 'contractor', themA: 'a contractor', tryId: 'CT-2507' },
}

function IdBadge({ id, big }: { id: string; big?: boolean }) {
  return <span style={{ fontFamily: mono, fontWeight: 700, fontSize: big ? 34 : 12.5, letterSpacing: big ? '0.04em' : '0.02em', color: big ? T.text : T.muted }}>{id}</span>
}

function Row({ c, viewer, children, sub }: { c: Company; viewer: Side; children?: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="xpl-prow" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 18px', borderTop: rowLine, flexWrap: 'wrap' }}>
      <span aria-hidden style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tint(T.orange, 12), color: T.orange, fontWeight: 700, fontFamily: display }}>
        {nameFor(c, viewer).replace(/^Contractor /, '').charAt(0)}
      </span>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: T.text }}>{nameFor(c, viewer)}</span>
          <IdBadge id={c.id} />
        </div>
        <div style={{ fontSize: 12.5, color: T.faint, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

export default function ConnectionsScreen({ viewer }: { viewer: Side }) {
  const all = useConnections()
  const { state, updateProject } = useCosting()
  const w = WORD[viewer]
  const my = mine(all, viewer)
  const incoming = waitingForMe(all, viewer)
  const outgoing = my.filter(c => c.status === 'requested' && c.from === viewer)
  const live = my.filter(c => c.status === 'connected')
  const past = my.filter(c => c.status === 'ended' || c.status === 'declined')

  const [id, setId] = useState('')
  const [found, setFound] = useState<Company | null>(null)
  const [problem, setProblem] = useState('')
  const [sent, setSent] = useState('')
  const [copied, setCopied] = useState(false)
  const [ending, setEnding] = useState<Connection | null>(null)

  const find = () => {
    setSent('')
    const r = check(viewer, id)
    if (r.ok) { setFound(r.company); setProblem('') } else { setFound(null); setProblem(r.why) }
  }
  const send = () => {
    const r = sendRequest(viewer, id)
    if (r.ok) { setSent(`Request sent to ${nameFor(r.company, viewer)}. It connects as soon as they accept.`); setFound(null); setId('') }
    else { setProblem(r.why); setFound(null) }
  }
  const copy = () => { try { navigator.clipboard?.writeText(MY_ID[viewer]) } catch { /* nothing to do */ } setCopied(true); setTimeout(() => setCopied(false), 1600) }

  /* Projects that hang on a connection, as this side knows them. */
  const projectsWith = (c: Company): ProjectRecord[] =>
    viewer === 'contractor' ? state.projects.filter(p => p.client === c.name)
      : c.id === MY_ID.contractor ? state.projects.filter(p => p.shared && p.client === OWNER_NAME) : []
  const activeShared = (c: Company) => projectsWith(c).filter(p => p.shared && p.status !== 'completed')
  const demoOnly = (c: Company) => viewer === 'owner' && c.id !== MY_ID.contractor
  const share = (p: ProjectRecord, on: boolean, c: Company) =>
    updateProject(p.id, { shared: on }, { kind: 'shared', title: on ? `Project shared with ${c.name}` : `Sharing with ${c.name} stopped`, detail: on ? 'The client now reads this project in his portal.' : 'The client keeps what he has already seen. Nothing new is sent.' })

  return (
    <Page>
      <Head title="Connections"
        sub={viewer === 'contractor'
          ? 'How your company links to a mine owner on XPLORIX. A project can be shared only with a mine owner you are connected to.'
          : 'How your company links to a drilling contractor on XPLORIX. You see a contractor’s project only after you are connected and he shares it.'} />

      <Note tone="info">
        <b style={{ color: T.text }}>MVP preview.</b> This shows how two companies will connect. There is no server yet, so the companies you can find are
        sample ones and everything is kept in this browser. Open the {viewer === 'contractor' ? 'Client Portal' : 'Company Admin'} in another tab to see the other side.
      </Note>

      <Split left={5} right={7}>
        <Card title="Your XPLORIX ID" subtitle={`Give it to ${w.themA} so they can find your company.`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span aria-hidden style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tint(T.orange, 12), color: T.orange }}><KeyRound size={24} /></span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <IdBadge id={MY_ID[viewer]} big />
              <div style={{ fontSize: 12.5, color: T.faint, marginTop: 2 }}>{company(MY_ID[viewer])?.name} · {viewer === 'contractor' ? 'CT is a contractor' : 'MO is a mine owner'}</div>
            </div>
            <Btn onClick={copy}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}</Btn>
          </div>
        </Card>

        <Card title={`Connect to ${w.themA}`} subtitle={`Ask them for their XPLORIX ID. In this demo, try ${w.tryId}.`}>
          <form onSubmit={e => { e.preventDefault(); find() }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input value={id} onChange={e => { setId(e.target.value); setFound(null); setProblem('') }} onBlur={() => id && setId(tidyId(id))}
              placeholder={viewer === 'contractor' ? 'MO-0000' : 'CT-0000'} aria-label={`XPLORIX ID of the ${w.them}`}
              style={{ ...inputStyle, flex: '1 1 180px', width: 'auto', fontFamily: mono, fontSize: 15, letterSpacing: '0.04em' }} />
            <Btn kind="primary" onClick={find}>Find company</Btn>
          </form>
          {problem && <div style={{ marginTop: 12 }}><Note tone="warn">{problem}</Note></div>}
          {sent && <div style={{ marginTop: 12 }}><Note tone="good">{sent}</Note></div>}
          {found && (
            <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${tint(T.orange, 40)}`, background: tint(T.orange, 6), display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{nameFor(found, viewer)} <IdBadge id={found.id} /></div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>{found.place} · on XPLORIX</div>
              </div>
              <Btn kind="primary" onClick={send}><Send size={14} /> Send request</Btn>
            </div>
          )}
        </Card>
      </Split>

      <Card title="How connecting works">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { icon: KeyRound, t: 'Each company has an ID', d: 'XPLORIX gives it when the company subscribes: CT for a contractor, MO for a mine owner.' },
            { icon: Send, t: 'One side sends a request', d: 'Enter the other company’s ID. They see the request in their own XPLORIX.' },
            { icon: Link2, t: 'The other side accepts', d: 'Now the contractor can share a project: rates, holes, shift record, invoices.' },
            { icon: ShieldCheck, t: 'The rest stays private', d: 'Costs, margin and stock stay with the contractor. Budget and comparisons stay with the mine owner.' },
            { icon: Unlink, t: 'End it when the work is done', d: 'Nothing new is shared after that. What was agreed and invoiced stays readable.' },
          ].map((s, i) => (
            <div key={s.t} style={{ display: 'flex', gap: 11 }}>
              <span aria-hidden style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--x-ov),0.05)', color: T.muted }}><s.icon size={15} /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{i + 1}. {s.t}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {incoming.length > 0 && (
        <Card title={`Waiting for your answer · ${incoming.length}`} subtitle="These companies asked to connect with you." pad={false}>
          {incoming.map(c => { const o = company(otherId(c, viewer))!; return (
            <Row key={c.id} c={o} viewer={viewer} sub={<>Sent {date(c.at)} · {o.place}</>}>
              <Btn kind="danger" size="sm" onClick={() => answerRequest(c.id, false)}>Decline</Btn>
              <Btn kind="good" size="sm" onClick={() => answerRequest(c.id, true)}><Check size={13} /> Accept</Btn>
            </Row>
          ) })}
        </Card>
      )}

      {outgoing.length > 0 && (
        <Card title={`Waiting for their answer · ${outgoing.length}`} subtitle="You sent these. They connect when the other company accepts." pad={false}>
          {outgoing.map(c => { const o = company(otherId(c, viewer))!; const theirs = o.id === MY_ID[viewer === 'contractor' ? 'owner' : 'contractor']; return (
            <Row key={c.id} c={o} viewer={viewer}
              sub={theirs ? <>Sent {date(c.at)} · open the {viewer === 'contractor' ? 'Client Portal' : 'Company Admin'} to answer it as them</>
                : <>Sent {date(c.at)} · a sample company, so nobody is there to answer. Use the demo buttons to play their part.</>}>
              {!theirs && <>
                <Btn size="sm" onClick={() => answerRequest(c.id, true)}>Demo: they accept</Btn>
                <Btn size="sm" onClick={() => answerRequest(c.id, false)}>Demo: they decline</Btn>
              </>}
              <Btn size="sm" onClick={() => withdrawRequest(c.id)}>Withdraw</Btn>
            </Row>
          ) })}
        </Card>
      )}

      <Card title={`Connected · ${live.length}`} subtitle={viewer === 'contractor' ? 'Mine owners you can share a project with.' : 'Contractors who can share a project with you.'} pad={false}>
        {live.length === 0 && <Empty>No connections yet. Send a request with an XPLORIX ID above.</Empty>}
        {live.map(c => {
          const o = company(otherId(c, viewer))!, ps = projectsWith(o), held = activeShared(o).length > 0 || demoOnly(o)
          return (
            <div key={c.id}>
              <Row c={o} viewer={viewer} sub={<>Connected since {date(c.answeredAt ?? c.at)} · {c.from === viewer ? 'you sent the request' : 'they sent the request'}</>}>
                <Status tone="good">Connected</Status>
                <Btn size="sm" onClick={() => setEnding(c)}><Unlink size={13} /> End connection</Btn>
              </Row>
              <div style={{ padding: '0 18px 14px 70px' }}>
                {ps.length === 0 && <div style={{ fontSize: 12.5, color: T.faint }}>{demoOnly(o) ? 'Drilling on the North Block programme (sample data).' : viewer === 'contractor' ? 'No project for this client yet. Create one under Projects and choose this client.' : 'No project shared yet.'}</div>}
                {ps.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '7px 0', borderTop: `1px dashed ${T.line}` }}>
                    <Link href={`/${viewer === 'contractor' ? 'admin' : 'client'}/projects/${p.id}`} style={{ fontSize: 13, fontWeight: 600, color: T.text, textDecoration: 'none', flex: '1 1 200px' }}>{p.name} <span style={{ color: T.faint, fontWeight: 400 }}>· {p.code}</span></Link>
                    <ProjectStatusTag status={p.status} />
                    {viewer === 'contractor' && <SharedTag shared={p.shared} client={p.client} />}
                    {viewer === 'contractor' && p.status !== 'completed' && (p.shared
                      ? <Btn size="sm" onClick={() => share(p, false, o)}>Stop sharing</Btn>
                      : <Btn size="sm" kind="primary" onClick={() => share(p, true, o)}>Share project</Btn>)}
                  </div>
                ))}
                {held && <div style={{ fontSize: 12, color: T.faint, marginTop: 8 }}>{demoOnly(o) ? 'This contractor is drilling for you now, so the connection cannot be ended yet.' : 'A shared project is still running, so the connection cannot be ended yet.'}</div>}
              </div>
            </div>
          )
        })}
      </Card>

      {past.length > 0 && (
        <Card title="Ended and declined" subtitle="Kept as a record. Send a new request to connect again." pad={false}>
          {past.map(c => { const o = company(otherId(c, viewer))!; return (
            <Row key={c.id} c={o} viewer={viewer} sub={c.status === 'ended' ? <>Connected {date(c.answeredAt ?? c.at)} to {date(c.endedAt)} · shared history stays readable</> : <>Request of {date(c.at)} was declined on {date(c.answeredAt)}</>}>
              <Status tone="neutral">{c.status === 'ended' ? 'Ended' : 'Declined'}</Status>
            </Row>
          ) })}
        </Card>
      )}

      <div style={{ fontSize: 12.5, color: T.faint }}>
        Finished trying it? <button type="button" onClick={() => { resetConnections(); setFound(null); setProblem(''); setSent('') }} style={{ background: 'none', border: 'none', padding: 0, color: T.orange, cursor: 'pointer', font: 'inherit', textDecoration: 'underline' }}>Put the sample connections back</button>.
      </div>

      {ending && (() => {
        const o = company(otherId(ending, viewer))!, blocked = activeShared(o).length > 0 || demoOnly(o)
        return (
          <Modal title={`End the connection with ${nameFor(o, viewer)}?`} width={560} onClose={() => setEnding(null)}
            footer={<><Btn onClick={() => setEnding(null)}>{blocked ? 'Close' : 'Keep it'}</Btn>{!blocked && <Btn kind="danger" onClick={() => { endConnection(ending.id); setEnding(null) }}>End connection</Btn>}</>}>
            {blocked
              ? <Note tone="warn">{demoOnly(o) ? `${nameFor(o, viewer)} is drilling on your programme now.` : `${activeShared(o).map(p => p.name).join(', ')} is still shared and running.`} Finish the project or stop sharing it first. That way no hole or invoice is left half way.</Note>
              : <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.65 }}>
                  Nothing new will be shared between the two companies after this.
                  <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                    <li>Rates, holes and invoices already agreed stay readable on both sides.</li>
                    <li>Neither side loses its own data.</li>
                    <li>To work together again, either side sends a new request.</li>
                  </ul>
                </div>}
          </Modal>
        )
      })()}
    </Page>
  )
}
