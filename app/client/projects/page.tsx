'use client'

import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { useCosting, fullDate } from '../../../lib/costing-store'
import { LIVE_CONTRACTOR } from '../../../lib/owner-portal'
import { projectStats, contractOf, ownerInbox, structureWords, eventsFor, whenIn } from '../../../lib/projects'
import { Page, PageHead, Card, Empty, DepthBar, Status, Who, DemoTag, T } from '../ui'
import { ProjectStatusTag } from '../../components/project-ui'

/* PROJECTS — the contracts a contractor has shared with the mine owner.
 *
 * Read straight from the contractor's own project record, so what is agreed
 * here is what he bills at. The owner sees the contract — rates, holes, rigs
 * and crew — and every change to it. He does not see the contractor's costs. */

export default function ClientProjectsPage() {
  const { state } = useCosting()
  const inbox = ownerInbox(state)
  const rows = inbox.shared.map(p => ({
    p, stats: projectStats(state, p), contract: contractOf(state, p.name), last: eventsFor(state, p.name)[0],
    news: inbox.unseen.filter(e => e.project === p.name && e.kind !== 'rates').length,
  }))
  const toAccept = inbox.waiting.length

  return (
    <Page>
      <PageHead
        question="What is agreed with each contractor, and what has changed?"
        tone={toAccept ? 'warn' : inbox.count ? 'info' : 'good'}
        answer={<>
          {rows.length} {rows.length === 1 ? 'project is' : 'projects are'} shared with you.{' '}
          {toAccept ? <><b style={{ color: T.text }}>{toAccept} rate {toAccept === 1 ? 'change is' : 'changes are'} waiting for you to accept.</b>{' '}</> : null}
          {inbox.count - toAccept > 0 ? `${inbox.count - toAccept} other ${inbox.count - toAccept === 1 ? 'change' : 'changes'} since you last looked.` : toAccept ? '' : 'Nothing has changed since you last looked.'}
        </>}
      />

      <Card pad={false}>
        {rows.length === 0 && <Empty>No contractor has shared a project with you yet. A project appears here the moment a contractor creates it and shares it.</Empty>}
        {rows.map(({ p, stats, contract, last, news }, i) => (
          <Link key={p.id} href={`/client/projects/${p.id}`} className="xpl-row xpl-prow" style={{
            display: 'grid', gridTemplateColumns: 'minmax(220px, 1.5fr) minmax(190px, 1fr) minmax(150px, 0.9fr) minmax(190px, 1.1fr) 20px',
            gap: 18, alignItems: 'center', padding: '16px 18px', textDecoration: 'none', borderTop: i ? `1px solid ${T.line}` : undefined,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: T.text }}>{p.name}</span>
                <DemoTag live />
                <ProjectStatusTag status={p.status} />
              </div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 5 }}><Who id={LIVE_CONTRACTOR} /> · {p.code}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.faint, marginTop: 3 }}><MapPin size={12} />{p.location}</div>
            </div>
            <div>
              <DepthBar drilled={stats.drilled} planned={stats.target || undefined} width="100%" />
              <div style={{ fontSize: 12, color: T.faint, marginTop: 4 }}>{stats.counts.drilling} drilling · {stats.counts.planned} planned · {stats.counts.done} finished</div>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
              <div style={{ color: T.text, fontWeight: 600 }}>{p.rigs.length ? p.rigs.join(', ') : 'No rig on site'}</div>
              <div style={{ color: T.faint }}>{p.supervisors.length + p.drillers.length} people on site</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {contract.waiting && <Status tone="warn">New rates to accept</Status>}
                {news > 0 && <Status tone="info">{news} {news === 1 ? 'change' : 'changes'}</Status>}
                {!contract.waiting && news === 0 && <Status tone="good">Up to date</Status>}
              </div>
              <div style={{ fontSize: 12, color: T.faint, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contract.current ? `${structureWords(contract.current)} · since ${fullDate(contract.current.effectiveFrom)}` : 'No contract rates yet'}
              </div>
              {last && <div style={{ fontSize: 12, color: T.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Last change: {last.title.toLowerCase()}, {whenIn(last.at)}</div>}
            </div>
            <ChevronRight size={16} style={{ color: T.faint }} />
          </Link>
        ))}
      </Card>

      <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.6, maxWidth: 820 }}>
        Projects marked LIVE are read from the contractor&rsquo;s own XPLORIX account. You see the contract and what happens on your site.
        The contractor&rsquo;s costs, margin and stock are never part of what is shared.
      </div>
    </Page>
  )
}
