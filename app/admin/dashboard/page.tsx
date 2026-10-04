'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { moneyL, perUnit, monthLabel, shiftMonth, projectCode, monthOf } from '../../../lib/costing-store'
import { useAdminOverview, financeLink, RIG_STATUS_LABEL, type RigStatus, type Attention } from '../../../lib/admin-overview'
import { num } from '../../../lib/owner-portal'
import {
  Page, Head, Card, Split, Btn, Table, Status, Legend, Tip, DepthBar, Spark, Delta, Empty,
  th, thR, td, tdR, rowLine, T, display, toneColor, axisTick, gridStroke, type Tone,
} from '../../components/kit'

/* DASHBOARD — the contractor's day on one screen.
 *
 * Nothing on this page is typed in. Rigs, metres and stoppages come from the
 * shift logs; cost, revenue and margin from the same costing call Finance
 * uses; stock problems from Inventory. Every figure links to the screen that
 * explains it.
 *
 * It is laid out in the order an owner asks his questions each morning:
 * what needs me, are the rigs turning, are we making money. */

const statusTone: Record<RigStatus, Tone> = { drilling: 'good', standby: 'warn', breakdown: 'bad', 'no-shift': 'neutral' }

export default function AdminDashboard() {
  const o = useAdminOverview()
  const drilling = o.rigs.filter(r => r.status === 'drilling').length
  const working = o.rigs.filter(r => r.project).length
  const todayMetres = o.rigs.reduce((s, r) => s + (r.day ?? 0) + (r.night ?? 0), 0)
  const prevPerDay = o.prev.rigDays ? o.prev.metres / o.dayOfMonth : 0
  const lostOwn = o.lost.filter(l => l.own).reduce((s, l) => s + l.hours, 0)
  const lostClient = o.lost.filter(l => !l.own).reduce((s, l) => s + l.hours, 0)
  const lostMax = Math.max(...o.lost.map(l => l.hours), 1)
  const lastMonth = monthLabel(shiftMonth(o.month, -1)).split(' ')[0]

  return (
    <Page>
      <Head
        title="Dashboard"
        sub={<>
          {drilling} of {working} rigs are drilling today, {num(todayMetres)} m so far.{' '}
          {o.attention.length
            ? <><b style={{ color: T.text }}>{o.attention.length} {o.attention.length === 1 ? 'thing needs' : 'things need'} you.</b></>
            : <>Nothing needs you right now.</>}
        </>}
        right={<>
          <Btn href="/admin/projects">New project</Btn>
          <Btn href="/admin/finance" kind="primary">Open Finance</Btn>
        </>}
      />

      <Split left={3} right={2}>
        <Card title={`Needs you${o.attention.length ? ` · ${o.attention.length}` : ''}`} subtitle="Most urgent first. Each line opens the screen where you fix it." pad={false}>
          {o.attention.length === 0
            ? <Empty>Nothing is waiting. Breakdowns, returned holes, disputed invoices and stock problems appear here as they happen.</Empty>
            : o.attention.map((a, i) => <AttentionRow key={a.key} a={a} first={i === 0} />)}
        </Card>

        <Card title={`${monthLabel(o.month)} so far`} subtitle={`Against the first ${o.dayOfMonth} days of ${lastMonth}`}>
          <Figure label="Metres drilled" value={`${num(o.now.metres)} m`}
            note={<>{o.now.perRigDay.toFixed(1)} m per rig per day · <Delta now={o.now.perRigDay} before={o.prev.perRigDay} /></>} />
          <Figure label="Billable value" value={moneyL(o.now.revenue)}
            note={<>{perUnit(o.now.ratePerMetre)} earned · <Delta now={o.now.revenue} before={o.prev.revenue} /></>} />
          <Figure label="Cost per metre" value={perUnit(o.now.costPerMetre)}
            note={<Delta now={o.now.costPerMetre} before={o.prev.costPerMetre} goodWhenUp={false} />} />
          <Figure label="Margin" value={`${o.now.marginPct.toFixed(1)}%`} last
            note={<>{moneyL(o.now.margin)} · <Delta now={o.now.marginPct} before={o.prev.marginPct} unit="pts" /></>} />
        </Card>
      </Split>

      <Card title="Rigs today" subtitle="Where each rig is, how deep its hole has gone, and what it did on today's two shifts" pad={false}
        right={<Link href="/admin/rigs" style={{ fontSize: 12.5, color: T.muted, textDecoration: 'none' }}>All rigs</Link>}>
        <Table>
          <thead>
            <tr>
              <th style={th}>Rig</th><th style={th}>Status</th><th style={th}>Project and hole</th><th style={th}>Hole depth</th>
              <th style={thR}>Day shift</th><th style={thR}>Night shift</th><th style={thR}>This month</th><th style={thR}>Hours lost</th>
              <th style={th}>Last 14 days</th><th style={th} />
            </tr>
          </thead>
          <tbody>
            {o.rigs.map(r => (
              <tr key={r.rig} className="xpl-row" style={{ borderBottom: rowLine }}>
                <td style={{ ...td, color: T.text, fontWeight: 700, fontFamily: display, fontSize: 14 }}>{r.rig}</td>
                <td style={td}>
                  <Status tone={statusTone[r.status]}>{RIG_STATUS_LABEL[r.status]}</Status>
                  <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5, whiteSpace: 'normal', maxWidth: 190 }}>{r.note}</div>
                </td>
                <td style={td}>
                  {r.project ? <>
                    <div style={{ color: T.text }}>{r.hole ?? 'No hole'}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{projectCode(r.project)} · {r.project}</div>
                  </> : <span style={{ color: T.dim }}>Not assigned</span>}
                </td>
                <td style={td}>{r.hole ? <DepthBar drilled={r.holeDrilled} planned={r.holePlanned} /> : <span style={{ color: T.dim }}>—</span>}</td>
                <td style={tdR}>{r.day == null ? <span style={{ color: T.dim }}>not in</span> : `${r.day} m`}</td>
                <td style={tdR}>{r.night == null ? <span style={{ color: T.dim }}>not in</span> : `${r.night} m`}</td>
                <td style={tdR}>
                  <div style={{ color: T.text, fontWeight: 600 }}>{num(r.monthMetres)} m</div>
                  <div style={{ fontSize: 11.5, color: T.faint, marginTop: 3 }}>{r.monthDays ? (r.monthMetres / r.monthDays).toFixed(1) : '0'} m a day</div>
                </td>
                <td style={tdR}>{r.monthLostHours ? `${r.monthLostHours} h` : <span style={{ color: T.dim }}>0</span>}</td>
                <td style={td}><Spark values={r.last14} /></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {r.project && <Btn size="sm" href={financeLink({ project: r.project, rig: r.rig, month: o.month })}>Costing</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Split left={3} right={2}>
        <Card title={`Metres per day, ${monthLabel(o.month)}`} subtitle="All rigs together">
          {prevPerDay > 0 && (
            <div style={{ marginBottom: 10 }}>
              <Legend items={[
                { color: T.bar, label: 'Metres drilled' },
                { color: T.muted, label: `${lastMonth} average for the same days, ${prevPerDay.toFixed(0)} m a day`, line: true },
              ]} />
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={o.daily} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={{ stroke: T.border }} interval={0} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => `${v} m`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload, label }) => active && payload?.length
                  ? <Tip active label={`${label} ${monthLabel(o.month).split(' ')[0]}`} unit=" m" payload={[{ dataKey: 'metres', name: 'Metres drilled', value: payload[0].value as number, color: T.bar }]} />
                  : null} />
              {prevPerDay > 0 && <ReferenceLine y={prevPerDay} stroke={T.muted} />}
              <Bar dataKey="metres" fill={T.bar} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Hours lost this month" subtitle={`${lostOwn} h on your side (not billable) · ${lostClient} h client-side (billable standby)`}>
          {o.lost.length === 0 ? <Empty>No stoppages logged this month.</Empty> : <>
            <div style={{ marginBottom: 14 }}>
              <Legend items={[{ color: T.contractorSide, label: 'Your side' }, { color: T.ownerSide, label: 'Client side' }]} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {o.lost.map(l => (
                <div key={l.reason} title={`${l.reason}: ${l.hours} hours`} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 40px', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12.5, color: T.muted, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</span>
                  <div style={{ height: 16 }}>
                    <div style={{ width: `${(l.hours / lostMax) * 100}%`, minWidth: 3, height: '100%', background: l.own ? T.contractorSide : T.ownerSide, borderRadius: '0 4px 4px 0' }} />
                  </div>
                  <span style={{ fontSize: 12.5, color: T.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{l.hours} h</span>
                </div>
              ))}
            </div>
          </>}
        </Card>
      </Split>

      <Card title="Money waiting" subtitle="From the hole being closed to the invoice being paid">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 0 }}>
          <Stage n={o.money.toSend.length} label="Closed, not yet approved" value={o.money.toSendValue}
            href={o.money.toSend[0] ? financeLink({ project: o.money.toSend[0].project, rig: o.money.toSend[0].rig, month: monthOf(o.money.toSend[0].end ?? o.money.toSend[0].start), tab: 'Drillholes' }) : '/admin/finance'} unit="holes" />
          <Stage n={o.money.waitingOwner.length} label="With the mine owner" value={o.money.waitingOwner.reduce((s, h) => s + h.value, 0)} href="/admin/finance" unit="holes" />
          <Stage n={o.money.readyToInvoice.length} label="Approved, ready to invoice" value={o.money.readyValue}
            href={o.money.readyToInvoice[0] ? financeLink({ project: o.money.readyToInvoice[0].project, rig: o.money.readyToInvoice[0].rig, month: monthOf(o.money.readyToInvoice[0].end ?? o.money.readyToInvoice[0].start), tab: 'Drillholes' }) : '/admin/finance'} unit="holes" />
          <Stage n={o.money.unpaid.length} label="Invoiced, not yet paid" value={o.money.outstanding} href="/admin/finance?tab=Tracker" unit="invoices"
            warn={o.money.overdue.length ? `${o.money.overdue.length} overdue` : undefined} last />
        </div>
      </Card>
    </Page>
  )
}

function AttentionRow({ a, first }: { a: Attention; first: boolean }) {
  return (
    <Link href={a.href} className="xpl-row" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 18px', textDecoration: 'none', borderTop: first ? 'none' : `1px solid ${T.line}` }}>
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: toneColor[a.tone], flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{a.title}</div>
        <div style={{ fontSize: 12.5, color: T.faint, marginTop: 3, lineHeight: 1.45 }}>{a.detail}</div>
      </div>
      <span style={{ fontSize: 12.5, color: T.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>{a.action}<ChevronRight size={14} /></span>
    </Link>
  )
}

function Figure({ label, value, note, last }: { label: string; value: string; note: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'baseline', padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${T.line}` }}>
      <div>
        <div style={{ fontSize: 13, color: T.muted }}>{label}</div>
        <div style={{ fontSize: 12, color: T.faint, marginTop: 4, lineHeight: 1.45 }}>{note}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: display, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  )
}

/* One step on the way from a closed hole to cash. The four sit in a row so the
 * place where money is stuck is the one with the big number. */
function Stage({ n, label, value, href, unit, warn, last }: { n: number; label: string; value: number; href: string; unit: string; warn?: string; last?: boolean }) {
  return (
    <Link href={href} className="xpl-row" style={{ display: 'block', padding: '4px 18px 6px', textDecoration: 'none', borderRight: last ? 'none' : `1px solid ${T.line}` }}>
      <div style={{ fontSize: 12.5, color: T.muted }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: n ? T.text : T.dim, fontFamily: display, margin: '6px 0 4px' }}>{n ? moneyL(value) : '—'}</div>
      <div style={{ fontSize: 12, color: T.faint }}>
        {n} {n === 1 ? unit.replace(/s$/, '') : unit}
        {warn && <span style={{ color: T.amber, marginLeft: 8, fontWeight: 600 }}>! {warn}</span>}
      </div>
    </Link>
  )
}
