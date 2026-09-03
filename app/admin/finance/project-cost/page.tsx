'use client'

import { useState } from 'react'
import { Check, TrendingUp, TrendingDown, AlertTriangle, FileDown, Plus, X, Trash2, Edit2 } from 'lucide-react'
import { useInventory } from '../../../../lib/inventory-store'
import {
  useFinance, projectCostForMonth, projectRevenueLineItems, C, iStyle, money, moneyL, cpmColor, marginColor,
  FinanceNav, PROJECT_CLIENTS, holeTotalMeters,
} from '../../../../lib/finance-store'
import type { ClientRate, Hole, FormationRate } from '../../../../lib/finance-store'
import { monthsForProject } from '../../../../lib/operations-store'

export default function ProjectCostPage() {
  const { state: inv } = useInventory()
  const { state, setClientRate, setHole, deleteHole } = useFinance()
  const [project, setProject] = useState(inv.projects[0].name)
  const months = monthsForProject(project)
  const [month, setMonth] = useState(months[months.length - 1] || '')
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [holeModalFor, setHoleModalFor] = useState<{ existing?: Hole } | null>(null)

  const clientRate = state.clientRates[project]
  const result = month ? projectCostForMonth(project, month, state.rigRates, clientRate, inv.purchaseOrders, state.holes) : null

  const handleProjectChange = (p: string) => {
    setProject(p)
    const m = monthsForProject(p)
    setMonth(m[m.length - 1] || '')
  }

  const downloadInvoice = () => {
    if (!result || !clientRate || !result.hasClientRate) return
    const lineItems = projectRevenueLineItems(result, clientRate)
    const rows = lineItems.map(li => `
      <tr><td>${li.label}</td><td>${li.qty}</td><td>${li.rate}</td><td style="text-align:right">₹${li.amount.toLocaleString()}</td></tr>`).join('')
    const html = `<!DOCTYPE html><html><head><title>Invoice — ${project} — ${month}</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:820px;margin:0 auto}
.header{display:flex;justify-content:space-between;padding-bottom:20px;border-bottom:3px solid #F97316;margin-bottom:24px}
.title{font-size:26px;font-weight:900;color:#F97316;text-align:right}
.from{font-size:14px;font-weight:700}
.sub{font-size:12px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#111;color:#fff;padding:9px 12px;text-align:left;font-size:11px}
td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}
.total-row td{font-weight:900;font-size:16px;border-top:2px solid #111;background:#fafafa}
.note{margin-top:18px;font-size:11px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;padding:10px 14px;border-radius:8px}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#9CA3AF}
</style></head><body>
<div class="header">
  <div>
    ${companyName ? `<div class="from">${companyName}</div>` : ''}
    ${companyAddress ? `<div class="sub">${companyAddress}</div>` : ''}
  </div>
  <div>
    <div class="title">INVOICE</div>
    <div class="sub" style="text-align:right">Bill To: <strong>${clientRate.client || project}</strong><br>${project}<br>${month}</div>
  </div>
</div>

<table>
<thead><tr><th>Description</th><th>Quantity</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr class="total-row"><td colspan="3">Total (excludes tax)</td><td style="text-align:right">₹${result.revenue.toLocaleString()}</td></tr></tfoot>
</table>

<div class="note">This total excludes GST and any other applicable tax — add tax before treating this as a final tax invoice.</div>

<div class="footer">Generated from XPLORIX Finance</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.replace(/\s+/g, '-')}_${month}_invoice-no-tax.html`
    a.click()
  }

  const monthHoles = state.holes.filter(h => h.project === project && h.month === month)
  const rigOptions = Array.from(new Set(result?.contributions.map(c => c.rig) || []))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Project Cost</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Billing is by hole — formation + depth band, the way the client's measurement book works</p>
        </div>
        <FinanceNav active="Project Cost" />
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Select Project</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {inv.projects.map(p => (
            <button key={p.id} onClick={() => handleProjectChange(p.name)} style={{ padding: '10px 18px', borderRadius: 10, cursor: 'pointer', background: project === p.name ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)', border: `1px solid ${project === p.name ? 'transparent' : C.border}`, color: project === p.name ? '#fff' : C.muted }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{PROJECT_CLIENTS[p.name] || '—'}</div>
            </button>
          ))}
        </div>
        {months.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Month</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {months.map(m => (
                <button key={m} onClick={() => setMonth(m)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: month === m ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${month === m ? 'rgba(249,115,22,0.3)' : C.border}`, color: month === m ? C.orange : C.faint }}>{m}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {!result || result.contributions.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>
          No priced rigs for {project} in {month || 'this month'} yet — set rig rates in the Rig Cost tab first.
        </div>
      ) : (
        <>
          {result.hasClientRate && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Company Name (optional, not saved)</div>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" style={iStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Company Address (optional, not saved)</div>
                <input value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Optional" style={iStyle} />
              </div>
              <button onClick={downloadInvoice} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' }}>
                <FileDown size={14} /> Invoice (No Tax)
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <div style={{ padding: '18px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Project CPM (combined)</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: cpmColor(result.projectCPM), fontFamily: 'monospace' }}>₹{Math.round(result.projectCPM)}/m</div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{result.combinedMeters}m across {result.contributions.length} rig(s)</div>
            </div>
            <div style={{ padding: '18px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Client Revenue</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.blue, fontFamily: 'monospace' }}>{result.hasClientRate ? money(result.revenue) : '—'}</div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
                {result.hasClientRate ? (result.usingHoleFallback ? 'Estimated — no holes entered yet' : `From ${result.holes.length} hole(s)`) : 'No rate set below'}
              </div>
            </div>
            <div style={{ padding: '18px 20px', background: C.card, border: `2px solid ${result.hasClientRate ? marginColor(result.marginPerMeter) + '50' : C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Margin (project-level)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {result.hasClientRate && (result.marginPerMeter >= 0 ? <TrendingUp size={18} style={{ color: C.green }} /> : <TrendingDown size={18} style={{ color: C.red }} />)}
                <div style={{ fontSize: 24, fontWeight: 900, color: result.hasClientRate ? marginColor(result.marginPerMeter) : C.faint, fontFamily: 'monospace' }}>{result.hasClientRate ? `${result.totalMargin >= 0 ? '+' : ''}${money(result.totalMargin)}` : '—'}</div>
              </div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{result.hasClientRate ? 'Revenue − rig cost, this project+month. Not split per hole.' : ''}</div>
            </div>
          </div>

          {result.usingHoleFallback && result.hasClientRate && (
            <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', fontSize: 12, color: C.blue, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={14} />
              <span>No holes entered for {project} in {month} yet — the revenue above is an estimate from combined meters only (band rate, no formation surcharge). Add holes below for accurate, invoice-ready billing.</span>
            </div>
          )}

          {result.missingRates.length > 0 && (
            <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: C.amber, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={14} />
              <span>{result.missingRates.map(m => m.rig).join(', ')} operated this month but {result.missingRates.length > 1 ? 'have' : 'has'} no rates set — not included in the combined figures above. Set rates in Rig Cost.</span>
            </div>
          )}

          {/* ── HOLES: the real billing table ───────────────────────────── */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Holes — {project} · {month}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>Each hole's formation + band billing, exactly as it'll appear on the invoice</div>
              </div>
              <button onClick={() => setHoleModalFor({})} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Plus size={12} /> Add Hole</button>
            </div>

            {result.holes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.faint, fontSize: 13 }}>No holes entered yet for this project+month. Click "Add Hole" to start billing per hole.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['Hole', 'Formation Breakdown', 'Total Meters', 'Band Rev.', 'Formation Rev.', 'Total Rev.', ''].map(h => <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {result.holes.map(hr => (
                    <tr key={hr.hole.id} style={{ borderBottom: `1px solid rgba(30,41,59,0.4)` }}>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: C.text }}>{hr.hole.holeNumber}</td>
                      <td style={{ padding: '10px 16px', color: C.muted }}>
                        {hr.hole.metersByFormation.map(mf => `${mf.formation}: ${mf.meters}m`).join(', ')}
                        {hr.unmatched.length > 0 && (
                          <div style={{ color: C.red, fontSize: 10, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} /> No rate set for: {hr.unmatched.join(', ')}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', color: C.muted, fontFamily: 'monospace' }}>{hr.totalMeters}m</td>
                      <td style={{ padding: '10px 16px', color: C.blue, fontFamily: 'monospace' }}>{money(hr.bandRevenue)}</td>
                      <td style={{ padding: '10px 16px', color: C.purple, fontFamily: 'monospace' }}>{money(hr.formationRevenue)}</td>
                      <td style={{ padding: '10px 16px', color: C.green, fontFamily: 'monospace', fontWeight: 700 }}>{money(hr.total)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setHoleModalFor({ existing: hr.hole })} style={{ padding: 6, borderRadius: 7, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}><Edit2 size={11} /></button>
                          <button onClick={() => deleteHole(hr.hole.id)} style={{ padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.red, cursor: 'pointer' }}><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                    <td colSpan={2} style={{ padding: '10px 16px', fontWeight: 800, color: C.text }}>Combined (holes)</td>
                    <td style={{ padding: '10px 16px', fontWeight: 800, color: C.text, fontFamily: 'monospace' }}>{result.holesMeters}m</td>
                    <td colSpan={2} />
                    <td style={{ padding: '10px 16px', fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>{money(result.holesRevenue)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* ── RIG COST SUMMARY: secondary, internal cost view ────────── */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.text }}>Rig Cost Summary <span style={{ color: C.faint, fontWeight: 400 }}>— what running this project cost us (internal, not the invoice)</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['Rig', 'Drilling Days', 'Standby Days', 'Repair Days', 'Meters', 'Cost', 'Own CPM'].map(h => <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
              <tbody>
                {result.contributions.map(c => (
                  <tr key={c.rig} style={{ borderBottom: `1px solid rgba(30,41,59,0.4)` }}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: C.text }}>{c.rig}</td>
                    <td style={{ padding: '10px 16px', color: C.green, fontFamily: 'monospace' }}>{c.ops.drillingDays}</td>
                    <td style={{ padding: '10px 16px', color: C.amber, fontFamily: 'monospace' }}>{c.ops.standbyDays}</td>
                    <td style={{ padding: '10px 16px', color: C.red, fontFamily: 'monospace' }}>{c.ops.repairDays}</td>
                    <td style={{ padding: '10px 16px', color: C.muted }}>{c.ops.metersDrilled}m</td>
                    <td style={{ padding: '10px 16px', color: C.red, fontFamily: 'monospace' }}>{money(c.cost.total)}</td>
                    <td style={{ padding: '10px 16px', color: cpmColor(c.cost.cpm), fontFamily: 'monospace' }}>₹{Math.round(c.cost.cpm)}/m</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.text }}>Combined</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>{result.contributions.reduce((s, c) => s + c.ops.drillingDays, 0)}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.amber, fontFamily: 'monospace' }}>{result.contributions.reduce((s, c) => s + c.ops.standbyDays, 0)}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.red, fontFamily: 'monospace' }}>{result.contributions.reduce((s, c) => s + c.ops.repairDays, 0)}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.text }}>{result.combinedMeters}m</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: C.red, fontFamily: 'monospace' }}>{money(result.combinedCost)}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: cpmColor(result.projectCPM), fontFamily: 'monospace' }}>₹{Math.round(result.projectCPM)}/m</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {clientRate ? <RateEditor rate={clientRate} onSave={r => setClientRate(project, r)} /> : (
        <div style={{ padding: 40, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>
          No billing rate set for {project} yet.
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setClientRate(project, { project, client: PROJECT_CLIENTS[project] || '', contractType: 'meterage', band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0, formationRates: [] })}
              style={{ padding: '10px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create Rate for {project}</button>
          </div>
        </div>
      )}

      {holeModalFor && (
        <HoleModal
          project={project}
          month={month}
          rigOptions={rigOptions}
          existing={holeModalFor.existing}
          onClose={() => setHoleModalFor(null)}
          onSave={h => { setHole(h); setHoleModalFor(null) }}
        />
      )}
    </div>
  )
}

function RateEditor({ rate, onSave }: { rate: ClientRate; onSave: (r: ClientRate) => void }) {
  const [form, setForm] = useState(rate)
  const upd = (patch: Partial<ClientRate>) => setForm(f => ({ ...f, ...patch }))
  const [saved, setSaved] = useState(false)

  const field = (label: string, value: number, key: keyof ClientRate, color = C.text) => (
    <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      <input type="number" value={value} onChange={e => upd({ [key]: parseFloat(e.target.value) || 0 } as any)} style={{ ...iStyle, color, fontWeight: 700 }} /></div>
  )

  const updFormation = (i: number, patch: Partial<FormationRate>) => {
    const list = [...form.formationRates]
    list[i] = { ...list[i], ...patch }
    upd({ formationRates: list })
  }
  const addFormation = () => upd({ formationRates: [...form.formationRates, { formation: '', ratePerMeter: 0 }] })
  const removeFormation = (i: number) => upd({ formationRates: form.formationRates.filter((_, idx) => idx !== i) })

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Client Rate — what we bill {form.client || 'this client'}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['meterage', 'dayrate'] as const).map(t => (
          <button key={t} onClick={() => upd({ contractType: t })} style={{ flex: 1, padding: 12, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: form.contractType === t ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.contractType === t ? 'rgba(249,115,22,0.4)' : C.border}`, color: form.contractType === t ? C.orange : C.faint }}>
            {t === 'meterage' ? '📏 Meterage Bands + Formation' : '📅 Day Rate'}
          </button>
        ))}
      </div>

      <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Client Name</div>
        <input value={form.client} onChange={e => upd({ client: e.target.value })} style={iStyle} /></div>

      {form.contractType === 'meterage' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {field('Band 1 up to (m)', form.band1To, 'band1To')}
            {field('Band 1 Rate (₹/m)', form.band1Rate, 'band1Rate', C.orange)}
            <div />
            {field('Band 2 up to (m)', form.band2To, 'band2To')}
            {field('Band 2 Rate (₹/m)', form.band2Rate, 'band2Rate', C.orange)}
            <div />
            <div />
            {field('Band 3 Rate (₹/m, beyond band 2)', form.band3Rate, 'band3Rate', C.orange)}
            <div />
            {field('Standby Rate (₹/day)', form.standbyRate, 'standbyRate', C.purple)}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Formation Rates <span style={{ color: C.faint, fontWeight: 400 }}>— added on top of band rate, per meter</span></div>
              </div>
              <button onClick={addFormation} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Plus size={11} /> Add Formation</button>
            </div>
            {form.formationRates.length === 0 ? (
              <div style={{ fontSize: 12, color: C.faint }}>No formation surcharge configured — meters will be billed by band only.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.formationRates.map((fr, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={fr.formation} onChange={e => updFormation(i, { formation: e.target.value })} placeholder="Formation name (e.g. Soft, Hard)" style={{ ...iStyle, flex: 2 }} />
                    <input type="number" value={fr.ratePerMeter} onChange={e => updFormation(i, { ratePerMeter: parseFloat(e.target.value) || 0 })} placeholder="₹/m" style={{ ...iStyle, flex: 1, color: C.purple, fontWeight: 700 }} />
                    <button onClick={() => removeFormation(i)} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.red, cursor: 'pointer' }}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {field('Drilling Day Rate (₹/day)', form.drillingDayRate, 'drillingDayRate', C.green)}
          {field('Standby Day Rate (₹/day)', form.standbyDayRate, 'standbyDayRate', C.amber)}
          {field('Repair Day Rate (₹/day)', form.repairDayRate, 'repairDayRate', C.red)}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000) }} style={{ padding: '11px 22px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none' }}>Save Rate</button>
        {saved && <span style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Saved</span>}
      </div>
    </div>
  )
}

function HoleModal({ project, month, rigOptions, existing, onClose, onSave }: {
  project: string; month: string; rigOptions: string[]; existing?: Hole
  onClose: () => void
  onSave: (h: Omit<Hole, 'id'> & { id?: string }) => void
}) {
  const [rig, setRig] = useState(existing?.rig ?? rigOptions[0] ?? '')
  const [holeNumber, setHoleNumber] = useState(existing?.holeNumber ?? '')
  const [rows, setRows] = useState<{ formation: string; meters: number }[]>(existing?.metersByFormation ?? [{ formation: '', meters: 0 }])

  const updRow = (i: number, patch: Partial<{ formation: string; meters: number }>) => setRows(r => r.map((row, idx) => idx === i ? { ...row, ...patch } : row))
  const addRow = () => setRows(r => [...r, { formation: '', meters: 0 }])
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i))
  const total = rows.reduce((s, r) => s + (r.meters || 0), 0)

  const canSave = rig && holeNumber.trim() && rows.some(r => r.formation.trim() && r.meters > 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{existing ? 'Edit' : 'Add'} Hole</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 18 }}>{project} · {month}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Rig</div>
            {rigOptions.length > 0 ? (
              <select value={rig} onChange={e => setRig(e.target.value)} style={iStyle}>
                {rigOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input value={rig} onChange={e => setRig(e.target.value)} placeholder="Rig name" style={iStyle} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Hole Number</div>
            <input value={holeNumber} onChange={e => setHoleNumber(e.target.value)} placeholder="e.g. BH-03" style={iStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Meters by Formation</div>
          <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Plus size={11} /> Add Row</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input value={row.formation} onChange={e => updRow(i, { formation: e.target.value })} placeholder="Formation (e.g. Soft)" style={{ ...iStyle, flex: 2 }} />
              <input type="number" value={row.meters} onChange={e => updRow(i, { meters: parseFloat(e.target.value) || 0 })} placeholder="Meters" style={{ ...iStyle, flex: 1, fontFamily: 'monospace' }} />
              <button onClick={() => removeRow(i)} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: C.red, cursor: 'pointer' }}><X size={13} /></button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 20 }}>Total: <strong style={{ color: C.text, fontFamily: 'monospace' }}>{total}m</strong></div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button
            disabled={!canSave}
            onClick={() => onSave({ id: existing?.id, rig, project, month, holeNumber: holeNumber.trim(), metersByFormation: rows.filter(r => r.formation.trim() && r.meters > 0) })}
            style={{ flex: 2, padding: 12, borderRadius: 10, background: canSave ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : C.border, color: canSave ? '#fff' : C.faint, fontSize: 13, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed', border: 'none' }}
          >{existing ? 'Save Changes' : 'Add Hole'}</button>
        </div>
      </div>
    </div>
  )
}
