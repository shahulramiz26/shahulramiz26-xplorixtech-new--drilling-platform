'use client'

import { useState } from 'react'
import {
  useCosting, uid, blankClientRate, fullDate, type ClientRate,
} from '../../../lib/costing-store'
import { TODAY } from '../../../lib/inventory-store'
import {
  workOrderProgress, currentPayRate, contractorOf, unbilled, words, reportsVia, ruleWords, DEDUCTION_LABEL, SOURCE_LABEL,
  type WorkOrder, type DeductionRule, type DeductionKind, type Contractor,
} from '../../../lib/contracting'
import { day } from '../../../lib/projects'
import { T, tint, Card, Btn, Note, Modal, Field, Switch, Status, Empty, Seg, DepthBar, inputStyle } from '../../components/kit'
import { RateSchedule, RateEditor, ratesUsable } from '../../components/rate-card'
import { n0, rs, linkBtn, numInput, OnXplorix, Rows } from './shared'

/* WORK ORDERS — what each contractor is here to do, and on what terms.
 *
 * A work order names the contractor, the rigs he brings, the metres and the
 * dates, the rates we pay, and what the contract lets us take off his bill.
 * Everything that happens to his shifts and bills afterwards is read against
 * this one record.
 *
 * It is also where the contractor gets his way in. If he has his own XPLORIX
 * his drill log arrives from there. If he does not, we give him a contractor
 * login, and he writes the drill log and sends his bills in that. */

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const idOk = (v: string) => /^CT-?\d{3,6}$/i.test(v.trim())

const KINDS: DeductionKind[] = ['coreRecovery', 'lateCompletion', 'shortfall', 'retention']

const blankRules = (): DeductionRule[] => [
  { id: 'd1', kind: 'coreRecovery', on: false, slabs: [{ belowPct: 90, deductPct: 10 }] },
  { id: 'd2', kind: 'lateCompletion', on: false, pctPerWeek: 0.5, capPct: 10 },
  { id: 'd3', kind: 'shortfall', on: false, minMetres: 250, perMetre: 200 },
  { id: 'd4', kind: 'retention', on: false, holdPct: 5 },
]

// ── the deductions section ────────────────────────────────────────────────

function RulesEditor({ rules, onChange }: { rules: DeductionRule[]; onChange: (r: DeductionRule[]) => void }) {
  const all = KINDS.map(k => rules.find(r => r.kind === k) ?? blankRules().find(r => r.kind === k)!)
  const set = (kind: DeductionKind, p: Partial<DeductionRule>) => onChange(all.map(r => r.kind === kind ? { ...r, ...p } : r))
  const num = (v: string) => (v === '' ? 0 : Math.max(0, parseFloat(v) || 0))
  const small: React.CSSProperties = { ...inputStyle, ...numInput, width: 96 }
  const row: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', fontSize: 13, color: T.muted }
  const hints: Record<DeductionKind, string> = {
    coreRecovery: 'Judged hole by hole, on the core in the checked shifts.',
    lateCompletion: 'Applies once the finish date has passed with metres still to drill.',
    shortfall: 'A part month counts in proportion to the days the rig was on the work order.',
    retention: 'Money held, not lost. Shown on its own line on every bill.',
  }
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {all.map(r => (
        <div key={r.kind} style={{ padding: '6px 14px 12px', borderRadius: 10, border: `1px solid ${r.on ? tint(T.orange, 38) : T.border}`, background: r.on ? tint(T.orange, 4) : T.raised }}>
          <Switch on={r.on} onChange={v => set(r.kind, { on: v })} label={DEDUCTION_LABEL[r.kind]} hint={hints[r.kind]} />
          {r.on && (
            <div style={{ display: 'grid', gap: 10, marginTop: 6, paddingLeft: 48 }}>
              {r.kind === 'coreRecovery' && (
                <>
                  {(r.slabs ?? []).map((s, i) => (
                    <div key={i} style={row}>
                      Below <input type="number" aria-label="Recovery below, percent" value={s.belowPct || ''} onChange={e => set(r.kind, { slabs: r.slabs!.map((x, j) => j === i ? { ...x, belowPct: num(e.target.value) } : x) })} style={small} /> % recovery, take
                      <input type="number" aria-label="Deduction, percent" value={s.deductPct || ''} onChange={e => set(r.kind, { slabs: r.slabs!.map((x, j) => j === i ? { ...x, deductPct: num(e.target.value) } : x) })} style={small} /> % off the hole
                      {(r.slabs ?? []).length > 1 && <button type="button" style={{ ...linkBtn, color: T.faint }} onClick={() => set(r.kind, { slabs: r.slabs!.filter((_, j) => j !== i) })}>Remove</button>}
                    </div>
                  ))}
                  <div><Btn size="sm" onClick={() => set(r.kind, { slabs: [...(r.slabs ?? []), { belowPct: 80, deductPct: 25 }] })}>Add a band</Btn></div>
                </>
              )}
              {r.kind === 'lateCompletion' && (
                <div style={row}>
                  <input type="number" aria-label="Percent a week" value={r.pctPerWeek || ''} onChange={e => set(r.kind, { pctPerWeek: num(e.target.value) })} style={small} /> % a week, up to
                  <input type="number" aria-label="Cap, percent" value={r.capPct || ''} onChange={e => set(r.kind, { capPct: num(e.target.value) })} style={small} /> %
                </div>
              )}
              {r.kind === 'shortfall' && (
                <div style={row}>
                  Under <input type="number" aria-label="Metres a rig a month" value={r.minMetres || ''} onChange={e => set(r.kind, { minMetres: num(e.target.value) })} style={small} /> m a rig a month, charge ₹
                  <input type="number" aria-label="Rupees a metre short" value={r.perMetre || ''} onChange={e => set(r.kind, { perMetre: num(e.target.value) })} style={small} /> a metre short
                </div>
              )}
              {r.kind === 'retention' && (
                <div style={row}>
                  Hold <input type="number" aria-label="Retention, percent" value={r.holdPct || ''} onChange={e => set(r.kind, { holdPct: num(e.target.value) })} style={small} /> % of every bill
                </div>
              )}
              <div style={{ maxWidth: 360 }}>
                <input value={r.clause ?? ''} onChange={e => set(r.kind, { clause: e.target.value })} placeholder="Clause in the contract, e.g. 9.1" aria-label="Clause" style={inputStyle} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── new or changed work order ─────────────────────────────────────────────

function OrderModal({ project, projects, existing, onClose }: { project: string; projects: string[]; existing?: WorkOrder; onClose: () => void }) {
  const { state, saveWorkOrder, saveContractor } = useCosting()
  const first = existing ? currentPayRate(existing, TODAY) : undefined
  const [f, setF] = useState({
    contractorId: existing?.contractorId ?? state.contractors[0]?.id ?? 'new',
    newName: '', newId: '', newEmail: '', access: 'login' as 'login' | 'xplorix', loginEmail: '',
    project: existing?.project ?? project,
    number: existing?.number ?? `WO-${String(state.workOrders.length + 1).padStart(3, '0')}`,
    rigs: existing?.rigs.join(', ') ?? '',
    startDate: existing?.startDate ?? TODAY, endDate: existing?.endDate ?? '',
    plannedMetres: existing ? String(existing.plannedMetres) : '',
    paymentDays: String(existing?.paymentDays ?? 30),
  })
  const [rate, setRate] = useState<ClientRate>(() => first
    ? { ...first, rateRows: first.rateRows.map(r => ({ ...r })) }
    : { ...blankClientRate(project, TODAY), structure: 'slab', rateRows: [{ id: uid('r'), holeSize: 'HQ', formation: 'Any formation', fromDepth: 0, rate: 0, adjustments: [] }] })
  const [rateFrom, setRateFrom] = useState(first?.effectiveFrom ?? TODAY)
  const [rules, setRules] = useState<DeductionRule[]>(existing?.rules ?? blankRules())
  const u = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))

  const rigs = Array.from(new Set(f.rigs.split(/[,\n]/).map(x => x.trim().toUpperCase()).filter(Boolean)))
  const ownRigNames = new Set(state.projects.flatMap(p => p.rigs))
  const clash = rigs.filter(r => ownRigNames.has(r) || state.workOrders.some(w => w.id !== existing?.id && w.status === 'active' && w.project === f.project && w.rigs.includes(r)))
  const isNew = f.contractorId === 'new'
  const chosen = contractorOf(state, f.contractorId)
  const needsLogin = !isNew && !!chosen && !chosen.xplorixId && !chosen.login
  const wayIn = isNew
    ? (f.access === 'xplorix' ? idOk(f.newId) : emailOk(f.newEmail))
    : !needsLogin || f.loginEmail.trim() === '' || emailOk(f.loginEmail)
  const ok = (isNew ? f.newName.trim().length > 1 : !!chosen) && wayIn && !!f.number.trim() && rigs.length > 0 && !clash.length
    && !!f.startDate && !!f.endDate && f.endDate >= f.startDate && parseFloat(f.plannedMetres) > 0 && ratesUsable(rate)

  const save = () => {
    let contractorId = f.contractorId
    let who: Contractor | undefined = chosen
    if (isNew) {
      who = f.access === 'xplorix'
        ? { id: uid('ctr'), name: f.newName.trim(), xplorixId: f.newId.trim().toUpperCase().replace(/^CT(\d)/, 'CT-$1') }
        : { id: uid('ctr'), name: f.newName.trim(), login: { email: f.newEmail.trim().toLowerCase(), status: 'invited', since: TODAY } }
      saveContractor(who); contractorId = who.id
    } else if (needsLogin && emailOk(f.loginEmail)) {
      who = { ...chosen!, login: { email: f.loginEmail.trim().toLowerCase(), status: 'invited', since: TODAY } }
      saveContractor(who)
    }
    const version: ClientRate = { ...rate, project: f.project, effectiveFrom: existing ? rateFrom : f.startDate, note: rate.note || 'Work order schedule of rates' }
    const kept = (existing?.rates ?? []).filter(r => r.effectiveFrom !== version.effectiveFrom)
    saveWorkOrder({
      id: existing?.id ?? uid('wo'), number: f.number.trim(), project: f.project, contractorId, rigs,
      startDate: f.startDate, endDate: f.endDate, plannedMetres: parseFloat(f.plannedMetres), paymentDays: parseFloat(f.paymentDays) || 30,
      reportsBy: reportsVia(who), status: existing?.status ?? 'active',
      rates: [...kept, { ...version, id: kept.length || !existing ? uid('wr') : version.id }], rules,
    })
    onClose()
  }

  return (
    <Modal title={existing ? `Change work order ${existing.number}` : 'New work order'} width={900} onClose={onClose}
      subtitle="The contractor's rigs join the project. Their checked shifts count in the same record as your own rigs."
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" disabled={!ok} onClick={save}>{existing ? 'Save changes' : 'Create work order'}</Btn></>}>
      <div style={{ display: 'grid', gap: 22 }}>
        <section style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Field label="Contractor">
              <select value={f.contractorId} disabled={!!existing} onChange={e => u({ contractorId: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                {state.contractors.map(c => <option key={c.id} value={c.id}>{c.name}{c.xplorixId ? ` · ${c.xplorixId}` : ''}</option>)}
                <option value="new">A contractor not on the list…</option>
              </select>
            </Field>
            <Field label="Project">
              <select value={f.project} disabled={!!existing} onChange={e => u({ project: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                {projects.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Work order number"><input value={f.number} onChange={e => u({ number: e.target.value })} style={inputStyle} /></Field>
          </div>
          {isNew && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <Field label="Contractor's name"><input value={f.newName} onChange={e => u({ newName: e.target.value })} autoFocus style={inputStyle} /></Field>
            </div>
          )}
          <div style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.raised, display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>How the contractor writes the drill log</div>
              <div style={{ fontSize: 12.5, color: T.faint, marginTop: 3, lineHeight: 1.5 }}>
                The contractor enters each shift and sends it to you. You check it before it counts. Nobody on your side types it in.
              </div>
            </div>
            {isNew ? (
              <>
                <Seg<'login' | 'xplorix'> value={f.access} onChange={v => u({ access: v })}
                  options={[{ value: 'login', label: 'Give them a contractor login' }, { value: 'xplorix', label: 'They have their own XPLORIX' }]} />
                {f.access === 'login' ? (
                  <div style={{ maxWidth: 380 }}>
                    <Field label="Email for their login" hint={f.newEmail && !emailOk(f.newEmail) ? 'That does not look like an email address.' : 'They get a link to set a password. The login opens only their own work with you.'}>
                      <input type="email" value={f.newEmail} onChange={e => u({ newEmail: e.target.value })} placeholder="site@contractor.com" style={inputStyle} />
                    </Field>
                  </div>
                ) : (
                  <div style={{ maxWidth: 380 }}>
                    <Field label="Their XPLORIX ID" hint={f.newId && !idOk(f.newId) ? 'A contractor’s ID looks like CT-1234.' : 'Their shifts and bills then arrive from their own XPLORIX.'}>
                      <input value={f.newId} onChange={e => u({ newId: e.target.value })} placeholder="CT-0000" style={inputStyle} />
                    </Field>
                  </div>
                )}
              </>
            ) : chosen?.xplorixId ? (
              <div style={{ fontSize: 13, color: T.muted }}><span aria-hidden style={{ color: T.green, fontWeight: 800 }}>✓ </span>{chosen.name} is on XPLORIX ({chosen.xplorixId}). Their shifts and bills arrive from their own XPLORIX.</div>
            ) : chosen?.login ? (
              <div style={{ fontSize: 13, color: T.muted }}><span aria-hidden style={{ color: T.green, fontWeight: 800 }}>✓ </span>{chosen.name} has a contractor login ({chosen.login.email}). The rigs on this work order appear in it.</div>
            ) : (
              <div style={{ maxWidth: 380 }}>
                <Field label={`Email for ${chosen?.name ?? 'their'} login`} hint={f.loginEmail && !emailOk(f.loginEmail) ? 'That does not look like an email address.' : 'They have no login yet. You can also create it later from the work order.'}>
                  <input type="email" value={f.loginEmail} onChange={e => u({ loginEmail: e.target.value })} placeholder="site@contractor.com" style={inputStyle} />
                </Field>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            <Field label="Their rigs on this job" hint={clash.length ? `${clash.join(', ')} is already on a project.` : 'As the contractor numbers them, separated by commas.'}>
              <input value={f.rigs} onChange={e => u({ rigs: e.target.value })} placeholder="e.g. KD-07, KD-11" style={inputStyle} />
            </Field>
            <Field label="Starts"><input type="date" value={f.startDate} onChange={e => u({ startDate: e.target.value })} style={inputStyle} /></Field>
            <Field label="To finish by" hint={f.endDate && f.endDate < f.startDate ? 'Before the start date.' : undefined}>
              <input type="date" value={f.endDate} min={f.startDate} onChange={e => u({ endDate: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Metres to drill"><input type="number" value={f.plannedMetres} onChange={e => u({ plannedMetres: e.target.value })} style={{ ...inputStyle, ...numInput }} /></Field>
            <Field label="Bills paid within, days"><input type="number" value={f.paymentDays} onChange={e => u({ paymentDays: e.target.value })} style={{ ...inputStyle, ...numInput }} /></Field>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>What you pay the contractor</h3>
          <p style={{ fontSize: 12.5, color: T.faint, margin: '0 0 12px', lineHeight: 1.5 }}>The same kind of rate card your client gives you, read from the paying side.</p>
          <RateEditor value={rate} onChange={setRate} paying />
          {existing && (
            <div style={{ maxWidth: 260, marginTop: 14 }}>
              <Field label="These rates apply from" hint="A later date starts a new set and leaves earlier metres at the old rates.">
                <input type="date" value={rateFrom} onChange={e => setRateFrom(e.target.value)} style={inputStyle} />
              </Field>
            </div>
          )}
        </section>

        <section>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>What the contract takes off the bill</h3>
          <p style={{ fontSize: 12.5, color: T.faint, margin: '0 0 12px', lineHeight: 1.5 }}>
            Switch on only what the contract says, with its own figures. Each one is then worked out on every bill and shown with its arithmetic.
          </p>
          <RulesEditor rules={rules} onChange={setRules} />
        </section>
      </div>
    </Modal>
  )
}

// ── the contractor's way in ───────────────────────────────────────────────

/* One contractor has one login, however many work orders he holds. A
 * contractor with his own XPLORIX needs none. */
function LoginStrip({ c }: { c?: Contractor }) {
  const { saveContractor } = useCosting()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  if (!c) return null
  const box: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', padding: '12px 14px', borderRadius: 10, border: `1px solid ${T.border}`, background: T.raised }
  if (c.xplorixId) {
    return (
      <div style={box}>
        <div style={{ flex: '1 1 320px', fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
          <b style={{ color: T.text }}>Drill log: from their own XPLORIX.</b> {c.name} ({c.xplorixId}) is connected to you, so their shifts and bills arrive by themselves and wait here to be checked.
        </div>
      </div>
    )
  }
  if (!c.login) {
    return (
      <form style={{ ...box, borderColor: tint(T.amber, 40), background: tint(T.amber, 5) }} onSubmit={e => { e.preventDefault(); if (emailOk(email)) saveContractor({ ...c, login: { email: email.trim().toLowerCase(), status: 'invited', since: TODAY } }) }}>
        <div style={{ flex: '1 1 300px', fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
          <b style={{ color: T.text }}>{c.name} has no login yet.</b> They cannot send a shift until they have one.
        </div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="site@contractor.com" aria-label="Email for their login" style={{ ...inputStyle, width: 240 }} />
        <Btn kind="primary" size="sm" disabled={!emailOk(email)} onClick={() => saveContractor({ ...c, login: { email: email.trim().toLowerCase(), status: 'invited', since: TODAY } })}>Create login</Btn>
      </form>
    )
  }
  return (
    <div style={box}>
      <div style={{ flex: '1 1 320px', minWidth: 0, fontSize: 13, color: T.muted, lineHeight: 1.5 }}>
        <b style={{ color: T.text }}>Drill log: contractor login.</b> {c.name} signs in as <span style={{ color: T.text }}>{c.login.email}</span> to enter each shift, see what you sent back, and send bills.
        <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>
          {c.login.status === 'active' ? `In use since ${day(c.login.since)}.` : `Invitation sent ${day(c.login.since)}. Not opened yet.`}
          {' '}The login shows only their own work orders with you.
        </div>
      </div>
      {sent ? <Status tone="good">Invitation sent again</Status> : <Btn size="sm" onClick={() => setSent(true)}>Send invitation again</Btn>}
      <Btn size="sm" href={`/contractor?as=${c.id}`}>See what they see</Btn>
    </div>
  )
}

// ── the tab ───────────────────────────────────────────────────────────────

export function OrdersTab({ project, projects, orders, openNew, onOpened, onBills }: {
  project: string; projects: string[]; orders: WorkOrder[]; openNew: boolean; onOpened: () => void; onBills: () => void
}) {
  const { state, saveWorkOrder } = useCosting()
  const [editing, setEditing] = useState<WorkOrder | null>(null)
  const w = words(state.wording)

  return (
    <>
      {orders.length === 0 && (
        <Card>
          <Empty>
            No contractor is working on {project} yet. Every rig here is your own.<br />
            Create a work order to bring a contractor&apos;s rigs onto the project.
          </Empty>
        </Card>
      )}

      {orders.map(wo => {
        const c = contractorOf(state, wo.contractorId)
        const p = workOrderProgress(state, wo, TODAY)
        const rate = currentPayRate(wo, TODAY)
        const rulesOn = wo.rules.filter(r => r.on)
        const owed = unbilled(state, wo, TODAY)
        return (
          <Card key={wo.id} title={`${c?.name ?? 'Contractor'} · ${wo.number}`} pad={false}
            subtitle={`${w.outRigs}: ${wo.rigs.join(', ')} · ${day(wo.startDate)} to ${day(wo.endDate)}`}
            right={<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {wo.status === 'closed' ? <Status tone="neutral">Closed</Status> : p.late ? <Status tone="bad">{p.daysLate} days past the finish date</Status> : <Status tone="good">Running</Status>}
              <Btn size="sm" onClick={() => setEditing(wo)}>Change</Btn>
              <Btn size="sm" onClick={() => saveWorkOrder({ ...wo, status: wo.status === 'active' ? 'closed' : 'active' })}>{wo.status === 'active' ? 'Close' : 'Reopen'}</Btn>
            </div>}>
            <div style={{ padding: 18, display: 'grid', gap: 18 }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 220px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, marginBottom: 6 }}>Drilled, checked</div>
                  <DepthBar drilled={p.metres} planned={wo.plannedMetres} width="100%" />
                </div>
                <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                  <Rows items={[
                    ['Still to drill', `${n0(p.plannedLeft)} m`],
                    ['Metres a rig-day', p.days ? p.perRigDay.toFixed(1) : '—'],
                    ['Core recovery', p.metres ? `${p.recoveryPct.toFixed(1)}%` : '—'],
                    ['Drill log comes from', SOURCE_LABEL[reportsVia(c)]],
                    ['Bills paid within', `${wo.paymentDays} days`],
                    ['Contractor', <OnXplorix key="x" c={c} />],
                  ]} />
                </div>
              </div>

              <div className="xpl-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18 }}>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.line}` }}>
                    What you pay{rate ? <span style={{ fontWeight: 400, color: T.faint }}> · since {fullDate(rate.effectiveFrom)}</span> : null}
                  </div>
                  {rate ? <RateSchedule rate={rate} /> : <Empty>No rates set.</Empty>}
                </div>
                <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: T.text, borderBottom: `1px solid ${T.line}` }}>What the contract takes off the bill</div>
                  {rulesOn.length === 0 && <Empty>Nothing is switched on. Bills are paid as the record supports them.</Empty>}
                  {rulesOn.map((r, i) => (
                    <div key={r.id} style={{ padding: '10px 14px', borderTop: i ? `1px solid ${T.line}` : undefined }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{DEDUCTION_LABEL[r.kind]}{r.clause ? <span style={{ fontWeight: 400, color: T.faint }}> · {r.clause}</span> : null}</div>
                      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{ruleWords(r)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <LoginStrip c={c} />

              {owed && (
                <Note tone="info">
                  <b style={{ color: T.text }}>{rs(owed.net)} of checked work is not on a bill yet</b> ({n0(owed.rec.metres)} m since {day(owed.from)}
                  {owed.deducted ? `, after ${rs(owed.deducted)} of deductions` : ''}{owed.retention ? ` and ${rs(owed.retention.amount)} held as retention` : ''}).{' '}
                  <button type="button" style={linkBtn} onClick={onBills}>Open bills</button>
                </Note>
              )}
            </div>
          </Card>
        )
      })}

      {(openNew || editing) && <OrderModal project={project} projects={projects} existing={editing ?? undefined} onClose={() => { setEditing(null); onOpened() }} />}
    </>
  )
}
