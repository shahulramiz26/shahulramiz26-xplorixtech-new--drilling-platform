'use client'

import { useState } from 'react'
import { Check, TrendingUp, TrendingDown, AlertTriangle, Download } from 'lucide-react'
import { useInventory } from '../../../../lib/inventory-store'
import { useFinance, projectCostForMonth, C, iStyle, money, moneyL, cpmColor, marginColor, FinanceNav, PROJECT_CLIENTS } from '../../../../lib/finance-store'
import type { ClientRate } from '../../../../lib/finance-store'
import { monthsForProject } from '../../../../lib/operations-store'

export default function ProjectCostPage() {
  const { state: inv } = useInventory()
  const { state, setClientRate } = useFinance()
  const [project, setProject] = useState(inv.projects[0].name)
  const months = monthsForProject(project)
  const [month, setMonth] = useState(months[months.length - 1] || '')

  const clientRate = state.clientRates[project]
  const result = month ? projectCostForMonth(project, month, state.rigRates, clientRate, inv.purchaseOrders) : null

  const handleProjectChange = (p: string) => {
    setProject(p)
    const m = monthsForProject(p)
    setMonth(m[m.length - 1] || '')
  }

  const downloadSummary = () => {
    if (!result) return
    const rows = result.contributions.map(c => `
      <tr><td>${c.rig}</td><td>${c.ops.metersDrilled}m</td><td>₹${c.cost.total.toLocaleString()}</td><td>₹${Math.round(c.cost.cpm)}/m</td></tr>`).join('')
    const html = `<!DOCTYPE html><html><head><title>${project} — ${month} cost summary</title>
<style>
body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:820px;margin:0 auto}
h1{font-size:20px;margin-bottom:2px}
.sub{color:#666;font-size:13px;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#111;color:#fff;padding:9px 12px;text-align:left;font-size:11px}
td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
tfoot td{font-weight:800;border-top:2px solid #111}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}
.kpi{border:1px solid #ddd;border-radius:10px;padding:14px}
.kpi .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px}
.kpi .value{font-size:20px;font-weight:800}
.cpm{color:#c2410c}.rate{color:#2563eb}.margin-pos{color:#059669}.margin-neg{color:#dc2626}
.footer{margin-top:32px;padding-top:14px;border-top:1px solid #eee;font-size:11px;color:#9CA3AF}
</style></head><body>
<h1>Project Cost Summary</h1>
<div class="sub">${project} · ${month}</div>

<div class="kpis">
  <div class="kpi"><div class="label">Project CPM (combined)</div><div class="value cpm">₹${Math.round(result.projectCPM)}/m</div><div style="font-size:11px;color:#888;margin-top:4px">${result.combinedMeters}m across ${result.contributions.length} rig(s)</div></div>
  <div class="kpi"><div class="label">Client Rate</div><div class="value rate">${result.hasClientRate ? `₹${Math.round(result.clientRatePerMeter)}/m` : '—'}</div><div style="font-size:11px;color:#888;margin-top:4px">${result.hasClientRate ? `₹${result.revenue.toLocaleString()} total` : 'No rate set'}</div></div>
  <div class="kpi"><div class="label">Margin</div><div class="value ${result.marginPerMeter >= 0 ? 'margin-pos' : 'margin-neg'}">${result.hasClientRate ? `${result.marginPerMeter >= 0 ? '+' : ''}₹${Math.round(result.marginPerMeter)}/m` : '—'}</div><div style="font-size:11px;color:#888;margin-top:4px">${result.hasClientRate ? `${result.totalMargin >= 0 ? '+' : ''}₹${result.totalMargin.toLocaleString()} total` : ''}</div></div>
</div>

<table>
<thead><tr><th>Rig</th><th>Meters</th><th>Cost</th><th>Own CPM</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td>Combined</td><td>${result.combinedMeters}m</td><td>₹${result.combinedCost.toLocaleString()}</td><td>₹${Math.round(result.projectCPM)}/m</td></tr></tfoot>
</table>

${result.missingRates.length > 0 ? `<p style="color:#b45309;font-size:12px">Note: ${result.missingRates.map(m => m.rig).join(', ')} operated this month but ${result.missingRates.length > 1 ? 'have' : 'has'} no rates set, so ${result.missingRates.length > 1 ? 'they are' : 'it is'} not included above.</p>` : ''}

<div class="footer">Internal cost summary — generated from XPLORIX Finance</div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.replace(/\s+/g, '-')}_${month}_cost-summary.html`
    a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Project Cost</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Every rig on the project, combined — then compared against what the client's actually paying</p>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={downloadSummary} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Download size={14} /> Download Summary
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            <div style={{ padding: '18px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Project CPM (combined)</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: cpmColor(result.projectCPM), fontFamily: 'monospace' }}>₹{Math.round(result.projectCPM)}/m</div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{result.combinedMeters}m across {result.contributions.length} rig(s)</div>
            </div>
            <div style={{ padding: '18px 20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Client Rate</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.blue, fontFamily: 'monospace' }}>{result.hasClientRate ? `₹${Math.round(result.clientRatePerMeter)}/m` : '—'}</div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{result.hasClientRate ? money(result.revenue) + ' total' : 'No rate set below'}</div>
            </div>
            <div style={{ padding: '18px 20px', background: C.card, border: `2px solid ${result.hasClientRate ? marginColor(result.marginPerMeter) + '50' : C.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Margin</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {result.hasClientRate && (result.marginPerMeter >= 0 ? <TrendingUp size={18} style={{ color: C.green }} /> : <TrendingDown size={18} style={{ color: C.red }} />)}
                <div style={{ fontSize: 24, fontWeight: 900, color: result.hasClientRate ? marginColor(result.marginPerMeter) : C.faint, fontFamily: 'monospace' }}>{result.hasClientRate ? `${result.marginPerMeter >= 0 ? '+' : ''}₹${Math.round(result.marginPerMeter)}/m` : '—'}</div>
              </div>
              <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{result.hasClientRate ? `${result.totalMargin >= 0 ? '+' : ''}${money(result.totalMargin)} total` : ''}</div>
            </div>
          </div>

          {result.missingRates.length > 0 && (
            <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: C.amber, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle size={14} />
              <span>{result.missingRates.map(m => m.rig).join(', ')} operated this month but {result.missingRates.length > 1 ? 'have' : 'has'} no rates set — not included in the combined figures above. Set rates in Rig Cost.</span>
            </div>
          )}

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, color: C.text }}>Rig Contributions</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['Rig', 'Meters', 'Cost', 'Own CPM'].map(h => <th key={h} style={{ padding: '9px 20px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr></thead>
              <tbody>
                {result.contributions.map(c => (
                  <tr key={c.rig} style={{ borderBottom: `1px solid rgba(30,41,59,0.4)` }}>
                    <td style={{ padding: '10px 20px', fontWeight: 700, color: C.text }}>{c.rig}</td>
                    <td style={{ padding: '10px 20px', color: C.muted }}>{c.ops.metersDrilled}m</td>
                    <td style={{ padding: '10px 20px', color: C.red, fontFamily: 'monospace' }}>{money(c.cost.total)}</td>
                    <td style={{ padding: '10px 20px', color: cpmColor(c.cost.cpm), fontFamily: 'monospace' }}>₹{Math.round(c.cost.cpm)}/m</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}`, background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 20px', fontWeight: 800, color: C.text }}>Combined</td>
                  <td style={{ padding: '10px 20px', fontWeight: 800, color: C.text }}>{result.combinedMeters}m</td>
                  <td style={{ padding: '10px 20px', fontWeight: 800, color: C.red, fontFamily: 'monospace' }}>{money(result.combinedCost)}</td>
                  <td style={{ padding: '10px 20px', fontWeight: 800, color: cpmColor(result.projectCPM), fontFamily: 'monospace' }}>₹{Math.round(result.projectCPM)}/m</td>
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
            <button onClick={() => setClientRate(project, { project, client: PROJECT_CLIENTS[project] || '', contractType: 'meterage', band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0 })}
              style={{ padding: '10px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create Rate for {project}</button>
          </div>
        </div>
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

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Client Rate — what we bill {form.client || 'this client'}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['meterage', 'dayrate'] as const).map(t => (
          <button key={t} onClick={() => upd({ contractType: t })} style={{ flex: 1, padding: 12, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: form.contractType === t ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.contractType === t ? 'rgba(249,115,22,0.4)' : C.border}`, color: form.contractType === t ? C.orange : C.faint }}>
            {t === 'meterage' ? '📏 Meterage Bands' : '📅 Day Rate'}
          </button>
        ))}
      </div>

      <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Client Name</div>
        <input value={form.client} onChange={e => upd({ client: e.target.value })} style={iStyle} /></div>

      {form.contractType === 'meterage' ? (
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
