'use client'

import { useState } from 'react'
import Link from 'next/link'
import { money, moneyL, perUnit, type LineReview } from '../../../lib/costing-store'
import {
  usePortal, CONTRACTORS, PROGRAMME, RATE_CARD, PROJECT_BUDGETS, spendSummary, invoiceState, INVOICE_STATE_LABEL,
  isInvoiceOverdue, payable, disputedValue, shortDate, num, downloadCsv, type PortalInvoice, type InvoiceState,
} from '../../../lib/owner-portal'
import {
  Page, PageHead, Card, Tile, Grid, Split, Btn, Table, Status, Who, DemoTag, Modal, Meter, Seg, Note,
  CONTRACTOR_FILTER, th, thR, td, tdR, tdStrong, rowLine, T, type Tone, type ContractorFilter,
} from '../ui'

/* INVOICES AND SPEND — what am I being asked to pay, and is it right.
 *
 * An invoice is checked line by line. Every line that came from metres or
 * standby carries the figure from the shift record beside the figure claimed,
 * so approving is reading two numbers, not rebuilding a measurement book.
 * Disputing a line holds back only the part the record does not support. */

const stateTone: Record<InvoiceState, Tone> = { 'to-verify': 'info', disputed: 'warn', approved: 'good', paid: 'neutral' }

export default function InvoicesPage() {
  const p = usePortal()
  const [openId, setOpenId] = useState<string | null>(null)
  const [who, setWho] = useState<ContractorFilter>('all')

  const all = p.invoices
  const rows = all.filter(i => who === 'all' || i.contractor === who)
  const s = spendSummary(all)
  const open = all.find(i => i.id === openId) ?? null
  const overdue = all.filter(isInvoiceOverdue)

  const projects = Array.from(new Set(all.map(i => i.project)))
  const budgetRows = [PROGRAMME.name, ...projects.filter(x => x !== PROGRAMME.name)].map(name => {
    const sum = spendSummary(all.filter(i => i.project === name))
    return { name, budget: PROJECT_BUDGETS[name], ...sum }
  })

  const exportCsv = () => downloadCsv('xplorix-invoices', [
    ['Invoice', 'Contractor', 'Project', 'Date', 'Due', 'Holes', 'Total incl. tax', 'Disputed before tax', 'Payable incl. tax', 'Status'],
    ...rows.map(i => [i.number, CONTRACTORS[i.contractor].name, i.project, i.date, i.due, i.holes.join(' '), Math.round(i.total), Math.round(disputedValue(i)), Math.round(payable(i)), INVOICE_STATE_LABEL[invoiceState(i)]]),
  ])

  return (
    <Page>
      <PageHead
        question="What am I being asked to pay, and is it right?"
        tone={p.toVerify.length ? 'info' : overdue.length ? 'warn' : 'good'}
        answer={<>
          {p.toVerify.length
            ? <>{p.toVerify.length} {p.toVerify.length === 1 ? 'invoice is' : 'invoices are'} waiting for you to verify. </>
            : <>No invoice is waiting to be verified. </>}
          Contractors have raised {moneyL(s.raised)} before tax; you have approved {moneyL(s.approved)} and disputed {moneyL(s.disputed)}.
          {overdue.length > 0 && <> {overdue.length} approved {overdue.length === 1 ? 'invoice is' : 'invoices are'} past the due date.</>}
        </>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Grid min={170}>
        <Tile label="Raised" value={moneyL(s.raised)} note={`${all.length} invoices, before tax`} />
        <Tile label="Waiting to verify" value={moneyL(s.waiting)} tone={s.waiting ? 'info' : undefined} note={`${p.toVerify.length} ${p.toVerify.length === 1 ? 'invoice' : 'invoices'}`} />
        <Tile label="Approved" value={moneyL(s.approved)} note="Lines you accepted" />
        <Tile label="Disputed" value={moneyL(s.disputed)} tone={s.disputed ? 'warn' : undefined} note="Not supported by the shift record" />
        <Tile label="Paid" value={moneyL(s.paid)} note={s.metresPaid ? `${perUnit(s.paid / s.metresPaid)} paid, all-in` : undefined} />
        <Tile label="Overdue" value={moneyL(s.overdue)} tone={s.overdue ? 'warn' : 'good'} note={s.overdue ? 'Approved, past due date' : 'Nothing overdue'} />
      </Grid>

      <Card title="Invoices" subtitle="Newest first. LIVE invoices were sent from the contractor's Finance screen." pad={false}
        right={<Seg options={CONTRACTOR_FILTER} value={who} onChange={setWho} />}>
        <Table>
          <thead><tr><th style={th}>Invoice</th><th style={th}>Contractor</th><th style={th}>Date</th><th style={th}>Due</th><th style={th}>Holes</th>
            <th style={thR}>Total incl. tax</th><th style={thR}>Payable</th><th style={th}>Status</th><th style={th} /></tr></thead>
          <tbody>
            {rows.map(i => {
              const st = invoiceState(i)
              const late = isInvoiceOverdue(i)
              return (
                <tr key={i.id} className="xpl-row" style={{ borderBottom: rowLine }}>
                  <td style={tdStrong}>{i.number} {i.live && <span style={{ marginLeft: 6 }}><DemoTag live /></span>}</td>
                  <td style={td}><Who id={i.contractor} /></td>
                  <td style={td}>{shortDate(i.date)}</td>
                  <td style={td}>{shortDate(i.due)}{late && <span style={{ color: T.amber, marginLeft: 7, fontWeight: 600 }}>! overdue</span>}</td>
                  <td style={{ ...td, whiteSpace: 'normal', maxWidth: 170 }}>{i.holes.join(', ')}</td>
                  <td style={tdR}>{money(i.total)}</td>
                  <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{st === 'to-verify' ? '—' : money(payable(i))}</td>
                  <td style={td}><Status tone={stateTone[st]}>{INVOICE_STATE_LABEL[st]}</Status></td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <Btn size="sm" kind={st === 'to-verify' ? 'primary' : 'ghost'} onClick={() => setOpenId(i.id)}>{st === 'to-verify' ? 'Verify' : 'Open'}</Btn>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td style={{ ...td, padding: 24 }} colSpan={9}>No invoices.</td></tr>}
          </tbody>
        </Table>
      </Card>

      <Split left={3} right={2}>
        <Card title="Budget against actual, by project" subtitle="Approved spend before tax. Only you see this." pad={false}>
          <Table>
            <thead><tr><th style={th}>Project</th><th style={thR}>Budget</th><th style={thR}>Approved</th><th style={th}>Used</th><th style={thR}>Waiting</th></tr></thead>
            <tbody>
              {budgetRows.map(b => (
                <tr key={b.name} style={{ borderBottom: rowLine }}>
                  <td style={{ ...td, color: T.text, fontWeight: 600, whiteSpace: 'normal' }}>{b.name}</td>
                  <td style={tdR}>{b.budget ? moneyL(b.budget) : '—'}</td>
                  <td style={{ ...tdR, color: T.text }}>{moneyL(b.approved)}</td>
                  <td style={td}>
                    {b.budget ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '90px auto', gap: 10, alignItems: 'center' }}>
                        <Meter value={b.approved} max={b.budget} />
                        <span style={{ fontSize: 12.5, color: T.muted }}>{Math.round((b.approved / b.budget) * 100)}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={tdR}>{b.waiting ? moneyL(b.waiting) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card title="Contract rates" subtitle={RATE_CARD.note} pad={false}>
          <Table>
            <thead><tr><th style={th}>Size</th><th style={th}>Depth band</th><th style={thR}>Rate</th></tr></thead>
            <tbody>
              {RATE_CARD.bands.map(b => (
                <tr key={b.from} style={{ borderBottom: rowLine }}>
                  <td style={td}>{b.size}</td>
                  <td style={td}>{b.to == null ? `${b.from} m and deeper` : `${b.from}–${b.to} m`}</td>
                  <td style={{ ...tdR, color: T.text }}>{perUnit(b.rate)}</td>
                </tr>
              ))}
              <tr style={{ borderBottom: rowLine }}><td style={td} colSpan={2}>Standby</td><td style={{ ...tdR, color: T.text }}>{money(RATE_CARD.standbyPerDay)}/day</td></tr>
              <tr style={{ borderBottom: rowLine }}><td style={td} colSpan={2}>Mobilisation</td><td style={{ ...tdR, color: T.text }}>{money(RATE_CARD.mobilisation)}</td></tr>
              <tr><td style={td} colSpan={2}>Demobilisation</td><td style={{ ...tdR, color: T.text }}>{money(RATE_CARD.demobilisation)}</td></tr>
            </tbody>
          </Table>
        </Card>
      </Split>

      {open && <Review inv={open} onClose={() => setOpenId(null)} onReview={r => p.reviewInvoice(open, r)} onPaid={() => p.markPaid(open)} />}
    </Page>
  )
}

/* Line-by-line check. Each click is saved straight away — for a live invoice
 * that means the contractor sees it in his Tracker without a refresh. */
function Review({ inv, onClose, onReview, onPaid }: {
  inv: PortalInvoice; onClose: () => void; onReview: (r: (LineReview | null)[]) => void; onPaid: () => void
}) {
  const [disputing, setDisputing] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const st = invoiceState(inv)
  const locked = inv.paid
  const set = (k: number, r: LineReview | null) => onReview(inv.reviews.map((x, j) => j === k ? r : x))
  const mismatch = (k: number) => { const c = inv.lines[k].check; return !!c && c.claimed !== c.verified }
  const approveMatching = () => onReview(inv.lines.map((_, k) => inv.reviews[k] ?? (mismatch(k) ? null : { status: 'approved' })))
  const untouched = inv.reviews.filter(r => !r).length
  const matchingLeft = inv.lines.filter((_, k) => !inv.reviews[k] && !mismatch(k)).length

  return (
    <Modal title={`Invoice ${inv.number}`} width={1040} onClose={onClose}
      subtitle={<span style={{ display: 'inline-flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Who id={inv.contractor} /><span>· {inv.project} · dated {shortDate(inv.date)} · due {shortDate(inv.due)}</span>
        <DemoTag live={inv.live} /><Status tone={stateTone[st]}>{INVOICE_STATE_LABEL[st]}</Status>
      </span>}
      footer={<>
        <span style={{ marginRight: 'auto', fontSize: 12.5, color: T.faint, alignSelf: 'center' }}>
          {locked ? `Paid ${shortDate(inv.paidDate)}` : untouched ? `${untouched} ${untouched === 1 ? 'line' : 'lines'} still to check` : 'Every line has been checked'}
        </span>
        {!locked && matchingLeft > 0 && <Btn kind="good" onClick={approveMatching}>Approve the {matchingLeft} matching {matchingLeft === 1 ? 'line' : 'lines'}</Btn>}
        {!locked && untouched === 0 && <Btn kind="primary" onClick={onPaid}>Mark as paid · {money(payable(inv))}</Btn>}
        <Btn onClick={onClose}>Close</Btn>
      </>}>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', background: T.bg }}>
        <Table>
          <thead><tr><th style={th}>Line</th><th style={thR}>Claimed</th><th style={thR}>Shift record</th><th style={thR}>Rate</th><th style={thR}>Amount</th><th style={th}>Your decision</th></tr></thead>
          <tbody>
            {inv.lines.map((l, k) => {
              const r = inv.reviews[k]
              const bad = mismatch(k)
              return (
                <tr key={k} style={{ borderBottom: rowLine, verticalAlign: 'top', background: r?.status === 'disputed' ? 'color-mix(in srgb, var(--x-amber) 5%, transparent)' : undefined }}>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: 230 }}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{l.label}</div>
                    {l.check && (
                      <div style={{ fontSize: 12, marginTop: 4, color: bad ? 'var(--x-orange-p)' : T.faint }}>
                        <span aria-hidden style={{ marginRight: 5, fontWeight: 800, color: bad ? 'var(--x-orange-p)' : T.green }}>{bad ? '▲' : '✓'}</span>{l.check.note}
                      </div>
                    )}
                    {!l.check && <div style={{ fontSize: 12, marginTop: 4, color: T.faint }}>Contract lump sum, nothing on the rig to compare</div>}
                    {l.hole && <Link href={`/client/holes/${l.hole}`} style={{ fontSize: 12, color: T.muted, marginTop: 4, display: 'inline-block' }}>Open the shifts behind this line →</Link>}
                    {r?.status === 'disputed' && r.reason && <div style={{ fontSize: 12, marginTop: 6, color: T.muted }}>Your reason: {r.reason}</div>}
                  </td>
                  <td style={tdR}>{l.qty}</td>
                  <td style={{ ...tdR, color: bad ? T.text : T.muted, fontWeight: bad ? 700 : 400 }}>{l.check ? `${num(l.check.verified, l.check.verified % 1 ? 1 : 0)} ${l.check.unit}` : '—'}</td>
                  <td style={tdR}>{l.rate}</td>
                  <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{money(l.amount)}</td>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: 230 }}>
                    {disputing === k ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        <input autoFocus value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this line wrong?" aria-label="Reason for dispute"
                          style={{ padding: '7px 10px', borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, color: T.text, fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Btn size="sm" onClick={() => setDisputing(null)}>Cancel</Btn>
                          <Btn size="sm" kind="danger" disabled={!reason.trim()} onClick={() => { set(k, { status: 'disputed', reason: reason.trim() }); setDisputing(null) }}>Dispute line</Btn>
                        </div>
                      </div>
                    ) : r ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Status tone={r.status === 'approved' ? 'good' : 'warn'}>{r.status === 'approved' ? 'Approved' : 'Disputed'}</Status>
                        {!locked && <Btn size="sm" onClick={() => set(k, null)}>Undo</Btn>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" kind="danger" onClick={() => { setDisputing(k); setReason(bad ? l.check!.note : '') }}>Dispute</Btn>
                        <Btn size="sm" kind="good" onClick={() => set(k, { status: 'approved' })}>Approve</Btn>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 16 }}>
        <Tile label="Claimed, before tax" value={money(inv.subtotal)} />
        <Tile label="In dispute" value={money(disputedValue(inv))} tone={disputedValue(inv) ? 'warn' : undefined} note={disputedValue(inv) ? 'Held back until resolved' : 'Nothing disputed'} />
        <Tile label={`Payable incl. ${inv.taxPercent}% tax`} value={money(payable(inv))} note={untouched ? 'Assumes the unchecked lines are approved' : undefined} />
      </div>

      <div style={{ marginTop: 14 }}>
        <Note>
          {inv.live
            ? 'This invoice was built from the contractor’s own shift logs, so each line already agrees with the record. Your decisions appear in his Finance screen as you make them.'
            : 'You see the lines, quantities and your contract rates. The contractor’s cost and margin are never part of an invoice.'}
        </Note>
      </div>
    </Modal>
  )
}
