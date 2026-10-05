'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useCosting, money, moneyL, monthLabel } from '../../../lib/costing-store'
import { useInventory } from '../../../lib/inventory-store'
import { buildForecast, type Forecast, type PartNeed } from '../../../lib/forecast'
import { buildSurvey } from '../../../lib/survey'
import { shortDate } from '../../../lib/owner-portal'
import {
  T, Page, PageHead, Card, Tile, Grid, Split, Seg, Status, Table, InDevelopment, Empty,
  th, thR, td, tdR, tdStrong, rowLine, type Tone,
} from '../../components/kit'
import { Timeline, TimelineKey, SwotGrid, RiskTable, RangeBar, Basis, type Lane } from '../../components/outlook'
import { DrilAxis } from '../../components/drilaxis'

/* ==========================================================================
 * XPLORIX INTELLIGENCE
 *
 * Two things, and only two:
 *
 *   Next month     what the contractor is walking into — metres, money, parts
 *                  — read as strengths, weaknesses, opportunities and threats,
 *                  with a risk register that says what to do about each one.
 *
 *   DrilAxis       a preview of the downhole survey tool that comes after
 *                  Phase 3, on the contractor's own open holes.
 *
 * The forecast is calculated in lib/forecast.ts from the same stores Finance,
 * Inventory and the Dashboard read. Nothing on this screen is typed in.
 * ========================================================================== */

type Tab = 'next' | 'drilaxis'
const n0 = (v: number) => Math.round(v).toLocaleString('en-IN')

function lanesOf(f: Forecast): Lane[] {
  return f.rigs.map(r => ({
    key: r.rig,
    label: r.rig,
    sub: `${r.project.split(' - ')[0]} · ${r.perDay.toFixed(1)} m a day`,
    bars: r.segments.map(s => s.kind === 'hole'
      ? { kind: 'work' as const, from: s.from, to: s.to, label: s.hole, ends: s.closes,
          title: `${s.hole}: ${shortDate(s.from)} to ${shortDate(s.to)}, ${n0(s.metres)} m${s.closes ? `, reaches ${s.planned} m planned depth` : ''}` }
      : s.kind === 'move'
        ? { kind: 'move' as const, from: s.from, to: s.to, title: `Rig move, ${shortDate(s.from)}` }
        : { kind: 'idle' as const, from: s.from, to: s.to, title: `No hole planned from ${shortDate(s.from)}: ${s.days} days idle` }),
  }))
}

function PartRow({ p }: { p: PartNeed }) {
  const tone: Tone = p.status === 'late' ? 'bad' : 'warn'
  return (
    <tr style={{ borderBottom: rowLine }}>
      <td style={{ ...tdStrong, whiteSpace: 'normal', minWidth: 190 }}>
        {p.part.name}
        <div style={{ fontSize: 11.5, fontWeight: 400, color: T.faint, marginTop: 2 }}>{p.part.supplier} · {p.part.leadTimeDays} days to deliver</div>
      </td>
      <td style={tdR}>{p.need.toFixed(p.need < 10 ? 1 : 0)}</td>
      <td style={tdR}>{p.inStore}{p.onOrderQty > 0 && <span style={{ color: T.faint }}> + {p.onOrderQty} on order</span>}</td>
      <td style={{ ...tdR, color: T.text }}>{shortDate(p.runOut)}</td>
      <td style={td}>
        <Status tone={tone}>{p.status === 'late' ? 'Order today' : `Order by ${shortDate(p.orderBy)}`}</Status>
        {p.status === 'late' && p.gapDays > 0 && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 4 }}>about {p.gapDays} days short even so</div>}
      </td>
      <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{p.toOrder} · {moneyL(p.spend)}</td>
    </tr>
  )
}

function NextMonth({ f }: { f: Forecast }) {
  const [allParts, setAllParts] = useState(false)
  const nextName = monthLabel(f.nextMonth)
  const thisName = monthLabel(f.thisMonth).split(' ')[0]
  const short = f.parts.filter(p => p.status !== 'covered')
  const shown = allParts ? short : short.slice(0, 6)
  const idle = f.next.idleDays
  const capped = idle > 0
  const vs = f.thisMonthTotal.revenue ? ((f.next.revenue - f.thisMonthTotal.revenue) / f.thisMonthTotal.revenue) * 100 : 0
  const firstOrder = short.map(p => p.orderBy!).sort()[0]
  const split = `${f.nextMonth}-01`

  return (
    <>
      <Grid min={172}>
        <div style={{ padding: '14px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, marginBottom: 7 }}>Metres in {nextName.split(' ')[0]}</div>
          <div style={{ fontSize: 23, fontWeight: 700, color: T.text, fontFamily: "'Space Grotesk', 'Inter', sans-serif", lineHeight: 1.1 }}>{n0(f.next.metres)} m</div>
          <div style={{ marginTop: 10 }}><RangeBar low={f.next.low} mid={f.next.metres} high={f.next.high} unit=" m" /></div>
        </div>
        <Tile label="To be billed" value={moneyL(f.next.revenue)}
          tone={vs < -3 ? 'warn' : vs > 3 ? 'good' : 'neutral'}
          note={Math.abs(vs) < 3 ? `About the same as ${thisName}` : `${Math.abs(Math.round(vs))}% ${vs > 0 ? 'more' : 'less'} than ${thisName} will close at`} />
        <Tile label="It will cost" value={moneyL(f.next.cost)} note={`${money(f.next.costPerMetre)} a metre, against ${money(f.next.ratePerMetre)} billed`} />
        <Tile label="Margin" value={`${moneyL(f.next.margin)}`} tone={f.next.margin >= 0 ? 'good' : 'bad'}
          note={`${Math.round(f.next.marginPct)}% of billing · ${thisName} is running at ${Math.round(f.thisMonthTotal.marginPct)}%`} />
        <Tile label="Parts to order" value={short.length ? moneyL(f.partsSpend) : 'Nothing'} tone={short.some(p => p.status === 'late') ? 'bad' : short.length ? 'warn' : 'good'}
          note={short.length ? `${short.length} parts · ${firstOrder <= f.today ? 'first order today' : `first order by ${shortDate(firstOrder)}`}` : 'Store and orders cover the month'} />
        <Tile label="Idle rig-days" value={String(idle)} tone={idle ? 'warn' : 'good'}
          note={idle ? `${f.rigs.filter(r => r.next.idleDays > 0).map(r => r.rig).join(', ')} with no hole planned` : 'Every rig has holes for the whole month'} />
      </Grid>

      <Card title={`Rig plan to ${shortDate(f.horizonEnd)}`}
        subtitle={`Each rig finishes the hole it is on, then takes the next planned hole on its project. ${capped ? 'The striped blocks are days with nothing planned.' : ''}`}
        right={<Link href="/admin/projects" style={{ fontSize: 12.5, fontWeight: 600, color: T.orange, textDecoration: 'none' }}>Add planned holes</Link>}>
        <div style={{ marginBottom: 14 }}><TimelineKey /></div>
        <Timeline lanes={lanesOf(f)} start={f.horizonStart} end={f.horizonEnd} split={split} splitLabel={`${nextName} starts`} />
      </Card>

      <SwotGrid swot={f.swot} empty={{ weaknesses: 'Nothing is costing you today.', threats: 'Nothing found that can go wrong next month.' }} />

      <Card title="Risk register" subtitle="Highest chance first. Each line has a date, the money at stake and one thing to do." pad={false}>
        <RiskTable risks={f.risks.map(r => ({ ...r, impact: r.impact == null ? '—' : moneyL(r.impact) }))} />
      </Card>

      <Split left={3} right={2}>
        <Card title="Parts to order" subtitle="What the planned metres will use, against the store and what is on order." pad={false}>
          {short.length === 0 ? <Empty>The store and open orders cover every part to the end of {nextName}.</Empty> : (
            <>
              <Table>
                <thead><tr>
                  <th style={th}>Part</th><th style={thR}>Will use</th><th style={thR}>In store</th>
                  <th style={thR}>Store runs out</th><th style={th}>Order</th><th style={thR}>Qty · cost</th>
                </tr></thead>
                <tbody>{shown.map(p => <PartRow key={p.part.id} p={p} />)}</tbody>
              </Table>
              {short.length > 6 && (
                <button onClick={() => setAllParts(v => !v)} style={{ width: '100%', padding: '11px', background: 'none', border: 'none', borderTop: `1px solid ${T.line}`, color: T.muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {allParts ? 'Show fewer' : `Show all ${short.length} parts`}
                </button>
              )}
            </>
          )}
        </Card>

        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <Card title={`${nextName.split(' ')[0]} by project`} pad={false}>
            <Table>
              <thead><tr><th style={th}>Project</th><th style={thR}>Metres</th><th style={thR}>Billed</th><th style={thR}>Margin</th></tr></thead>
              <tbody>
                {f.byProject.map(p => (
                  <tr key={p.project} style={{ borderBottom: rowLine }}>
                    <td style={{ ...tdStrong, whiteSpace: 'normal' }}>
                      {p.project}
                      <div style={{ fontSize: 11.5, fontWeight: 400, color: T.faint, marginTop: 2 }}>
                        {p.rigs} {p.rigs === 1 ? 'rig' : 'rigs'} · {p.lastHoleEnds ? `planned holes end ${shortDate(p.lastHoleEnds)}` : 'holes planned beyond the month'}
                      </div>
                    </td>
                    <td style={tdR}>{n0(p.metres)}</td>
                    <td style={tdR}>{moneyL(p.revenue)}</td>
                    <td style={{ ...tdR, color: T.text, fontWeight: 600 }}>{moneyL(p.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Card title="Money you can bring forward" subtitle="Work already done that is not yet cash.">
            <div style={{ display: 'grid', gap: 11 }}>
              {[
                { label: 'Approved holes, ready to invoice', value: f.cash.readyToInvoice, note: `${f.cash.readyCount} holes` },
                { label: 'Closed holes, not yet approved', value: f.cash.notApproved, note: `${f.cash.notApprovedCount} holes` },
                { label: 'Open holes the rig has left', value: f.cash.stuckOpen.reduce((s, x) => s + x.value, 0), note: f.cash.stuckOpen.map(s => s.hole).join(', ') || 'none' },
                { label: `Holes that will close by ${shortDate(f.horizonEnd)}`, value: f.cash.closingValue, note: `${f.closings.length} holes` },
                ...(f.cash.overdue > 0 ? [{ label: 'Invoices overdue', value: f.cash.overdue, note: `${f.cash.overdueCount} invoices` }] : []),
                ...(f.cash.dueNext > 0 ? [{ label: `Invoices due in ${nextName.split(' ')[0]}`, value: f.cash.dueNext, note: `${f.cash.dueNextCount} invoices` }] : []),
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: T.muted }}>{r.label}</div>
                    <div style={{ fontSize: 11.5, color: T.faint, marginTop: 1 }}>{r.note}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{moneyL(r.value)}</div>
                </div>
              ))}
              <Link href="/admin/finance" style={{ fontSize: 12.5, fontWeight: 600, color: T.orange, textDecoration: 'none', marginTop: 2 }}>Open Finance</Link>
            </div>
          </Card>
        </div>
      </Split>

      <Basis lines={f.basis} note={<>
        This is a projection from your own records, not a guess and not a trained model yet. It updates every time a shift is logged, a hole is planned,
        a rate is changed or stock is received. Learning from past projects, ground and core comes with AI prediction in Phase 3.
      </>} />
    </>
  )
}

export default function IntelligencePage() {
  const { state: costing } = useCosting()
  const { state: inv } = useInventory()
  const [tab, setTab] = useState<Tab>('next')
  const f = useMemo(() => buildForecast(costing, inv), [costing, inv])
  // Lets a link open straight on the DrilAxis preview.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'drilaxis') setTab('drilaxis')
  }, [])

  /* DrilAxis has no readings yet. The preview runs on the holes the rigs are
   * on today, with sample stations, so the contractor sees his own holes. */
  const surveys = useMemo(() => {
    const drift = [{ off: 2.1, lift: 1, turn: 1.2 }, { off: 6.4, lift: 0.8, turn: -2.2 }, { off: 3.4, lift: -0.6, turn: 1.8 }]
    return f.rigs.filter(r => r.hole && r.hole.drilled >= 60).map((r, i) => {
      const d = drift[i % drift.length]
      return buildSurvey({
        id: r.hole!.id, plannedDepth: Math.max(r.hole!.planned ?? 0, Math.round(r.hole!.drilled)), drilled: Math.round(r.hole!.drilled),
        offPlan: d.off, lift: d.lift, turn: d.turn, spacing: 30,
      })
    })
  }, [f])

  return (
    <Page>
      <PageHead
        question={tab === 'next' ? `What is coming in ${monthLabel(f.nextMonth)}?` : 'Is the hole going where it was planned?'}
        tone={tab === 'next' ? f.headline.tone : 'info'}
        answer={tab === 'next'
          ? f.headline.text
          : 'DrilAxis reads the direction of the hole as it is drilled and shows the drift while there is still time to steer. This is a preview with sample readings.'}
        right={<Seg<Tab> options={[{ value: 'next', label: 'Next month' }, { value: 'drilaxis', label: 'DrilAxis preview' }]} value={tab} onChange={setTab} />}
      />

      {tab === 'next' && (f.rigs.length === 0
        ? <Card><Empty>No rig has logged a shift in the last 14 days, so there is nothing to forecast from yet.</Empty></Card>
        : <NextMonth f={f} />)}

      {tab === 'drilaxis' && (
        <>
          <InDevelopment phase="AFTER PHASE 3">
            DrilAxis is the XPLORIX downhole survey tool and is not built yet. The readings below are samples on your own open holes;
            the distances, the projected miss and the steer are worked out from them exactly as they will be from real readings.
          </InDevelopment>
          {surveys.length ? <DrilAxis surveys={surveys} audience="contractor" /> : <Card><Empty>No open hole is deep enough to show yet.</Empty></Card>}
        </>
      )}
    </Page>
  )
}
