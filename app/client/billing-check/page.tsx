'use client'

import { money, moneyL } from '../../../lib/costing-store'
import {
  usePortal, CONTRACTORS, CONTRACTOR_IDS, shortDate, num, downloadCsv, type ContractorId, type PortalInvoice, type PortalLine,
} from '../../../lib/owner-portal'
import { Page, PageHead, Card, Btn, Table, Status, Who, Legend, Grid, th, thR, td, tdR, tdStrong, rowLine, T } from '../ui'

/* BILLING CHECK — claimed against verified.
 *
 * Three things a drilling invoice can get wrong without anyone lying: metres
 * that are not in the shift record, standby days the rig logged as breakdown,
 * and metres billed in a deeper rate band than they were drilled in. Each is
 * a comparison of two numbers, so each is shown as two bars. */

interface Row { inv: PortalInvoice; line: PortalLine; k: number; diff: number; value: number }
const CLAIMED = 'var(--x-orange-d)'
const RECORD = 'var(--x-blue)'
const isDeep = (l: PortalLine) => l.label.includes('300 m+')

export default function BillingCheckPage() {
  const p = usePortal()
  const lines = p.invoices.flatMap(inv => inv.lines.map((line, k) => ({ inv, line, k })))
  const checked = lines.filter(x => x.line.check)
  const sum = (f: (x: typeof checked[number]) => boolean, key: 'claimed' | 'verified') =>
    checked.filter(f).reduce((s, x) => s + x.line.check![key], 0)

  const metres = { claimed: sum(x => x.line.check!.unit === 'm', 'claimed'), verified: sum(x => x.line.check!.unit === 'm', 'verified') }
  const standby = { claimed: sum(x => x.line.check!.unit === 'days', 'claimed'), verified: sum(x => x.line.check!.unit === 'days', 'verified') }
  const deep = { claimed: sum(x => isDeep(x.line), 'claimed'), verified: sum(x => isDeep(x.line), 'verified') }

  // Every line where the two numbers differ, with what the difference is worth
  // at that line's own rate. Positive = claimed more than the record supports.
  const rows: Row[] = checked
    .filter(x => x.line.check!.claimed !== x.line.check!.verified)
    .map(x => {
      const c = x.line.check!
      const rate = c.claimed > 0 ? x.line.amount / c.claimed : 0
      return { ...x, diff: c.claimed - c.verified, value: (c.claimed - c.verified) * rate }
    })
    .sort((a, b) => b.value - a.value)
  const net = rows.reduce((s, r) => s + r.value, 0)
  const over = metres.claimed - metres.verified
  const wrongBand = Math.max(0, (deep.claimed - deep.verified) - over)
  const byContractor = (c: ContractorId) => rows.filter(r => r.inv.contractor === c).reduce((s, r) => s + r.value, 0)
  const lineCount = (c: ContractorId) => rows.filter(r => r.inv.contractor === c).length

  const exportCsv = () => downloadCsv('xplorix-billing-check', [
    ['Invoice', 'Contractor', 'Date', 'Line', 'Claimed', 'Shift record', 'Unit', 'Difference', 'Value of difference'],
    ...rows.map(r => [r.inv.number, CONTRACTORS[r.inv.contractor].name, r.inv.date, r.line.label, r.line.check!.claimed, r.line.check!.verified, r.line.check!.unit, r.diff, Math.round(r.value)]),
  ])

  return (
    <Page>
      <PageHead
        question="Do the invoices match what was drilled?"
        tone={net > 0 ? 'warn' : 'good'}
        answer={net > 0
          ? <>Invoices to date claim <b style={{ color: T.text }}>{moneyL(net)}</b> more than the shift records support: {num(over)} m of drilling that is not in the record,{' '}
            {standby.claimed - standby.verified} standby days the rigs logged as breakdown, and {num(wrongBand)} m billed in a deeper rate band than they were drilled in.</>
          : <>Every invoice line matches the shift record.</>}
        right={<Btn size="sm" onClick={exportCsv}>Export</Btn>}
      />

      <Card title="Claimed against the shift record" subtitle="All invoices to date, all contractors"
        right={<Legend items={[{ color: CLAIMED, label: 'Claimed on invoices' }, { color: RECORD, label: 'In the shift record' }]} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
          <Compare title="Metres drilled" unit="m" {...metres} />
          <Compare title="Standby days" unit="days" {...standby} />
          <Compare title="Metres in the deepest rate band (300 m+)" unit="m" {...deep} />
        </div>
      </Card>

      <Grid>
        {CONTRACTOR_IDS.map(c => {
          const v = byContractor(c)
          return (
            <div key={c} style={{ padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 7 }}><Who id={c} /></div>
              <div style={{ fontSize: 21, fontWeight: 700, color: T.text, fontFamily: "'Space Grotesk','Inter',sans-serif" }}>{v > 0 ? moneyL(v) : '₹0'}</div>
              <div style={{ fontSize: 12, color: T.faint, marginTop: 6 }}>
                net claimed above the record · {lineCount(c)} {lineCount(c) === 1 ? 'line' : 'lines'}
              </div>
            </div>
          )
        })}
      </Grid>

      <Card title={`Lines that do not match · ${rows.length}`} subtitle="Largest difference first. Every line traces back to the shifts it was built from." pad={false}>
        <Table>
          <thead><tr><th style={th}>Invoice</th><th style={th}>Contractor</th><th style={th}>Date</th><th style={th}>Line</th>
            <th style={thR}>Claimed</th><th style={thR}>Shift record</th><th style={thR}>Difference</th><th style={thR}>Value</th><th style={th}>Your decision</th><th style={th} /></tr></thead>
          <tbody>
            {rows.map(r => {
              const c = r.line.check!
              const rev = r.inv.reviews[r.k]
              return (
                <tr key={`${r.inv.id}_${r.k}`} style={{ borderBottom: rowLine }}>
                  <td style={tdStrong}>{r.inv.number}</td>
                  <td style={td}><Who id={r.inv.contractor} /></td>
                  <td style={td}>{shortDate(r.inv.date)}</td>
                  <td style={{ ...td, color: T.text }}>{r.line.label}</td>
                  <td style={tdR}>{num(c.claimed)} {c.unit}</td>
                  <td style={tdR}>{num(c.verified)} {c.unit}</td>
                  <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{r.diff > 0 ? '+' : '−'}{num(Math.abs(r.diff))} {c.unit}</td>
                  <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{r.value >= 0 ? money(r.value) : `−${money(-r.value)}`}</td>
                  <td style={td}>
                    {!rev ? <Status tone="info">To verify</Status>
                      : rev.status === 'disputed' ? <Status tone="warn">Disputed</Status>
                      : <Status tone="neutral">Approved as claimed</Status>}
                  </td>
                  <td style={td}>{r.line.hole && <Btn size="sm" href={`/client/holes/${r.line.hole}`}>Shifts</Btn>}</td>
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td style={{ ...td, padding: 24 }} colSpan={10}>Every line matches the shift record.</td></tr>}
            {rows.length > 0 && (
              <tr>
                <td style={{ ...td, color: T.text, fontWeight: 700 }} colSpan={7}>Net claimed above the shift record, before tax</td>
                <td style={{ ...tdR, color: T.text, fontWeight: 700 }}>{money(net)}</td><td /><td />
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.6, maxWidth: 820 }}>
        A minus value is a line claimed below the record: metres the contractor put in a deeper band and so left out of the shallower one.
        He can bill those again at the correct, lower rate.
      </div>
    </Page>
  )
}

function Compare({ title, unit, claimed, verified }: { title: string; unit: string; claimed: number; verified: number }) {
  const max = Math.max(claimed, verified, 1)
  const gap = claimed - verified
  const bar = (label: string, value: number, color: string) => (
    <div title={`${label}: ${num(value)} ${unit}`} style={{ display: 'grid', gridTemplateColumns: '92px minmax(0,1fr)', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: T.faint }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: `${(value / max) * 78}%`, minWidth: 3, height: 18, background: color, borderRadius: '0 4px 4px 0' }} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{num(value)} {unit}</span>
      </div>
    </div>
  )
  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bar('Claimed', claimed, CLAIMED)}
        {bar('Shift record', verified, RECORD)}
      </div>
      <div style={{ fontSize: 12.5, color: gap > 0 ? 'var(--x-orange-p)' : T.faint, marginTop: 10, fontWeight: gap > 0 ? 600 : 400 }}>
        {gap > 0 ? <><span aria-hidden>▲ </span>{num(gap)} {unit} claimed above the record</> : 'Claimed and recorded agree'}
      </div>
    </div>
  )
}
