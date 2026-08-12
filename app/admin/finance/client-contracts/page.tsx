'use client'

import { useState } from 'react'
import { Download, ChevronDown, Check } from 'lucide-react'
import { useInventory } from '../../../../lib/inventory-store'
import { useFinance, calcClientRevenue, C, iStyle, selStyle, money, moneyL, STATUS_CONFIG, FinanceNav, PROJECT_CLIENTS } from '../../../../lib/finance-store'
import type { ClientRate, Invoice, InvStatus } from '../../../../lib/finance-store'

export default function ClientContractsPage() {
  const [tab, setTab] = useState<'rates' | 'generate' | 'track'>('rates')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Client Contracts</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>What you bill the client — set once, invoice and track from here</p>
        </div>
        <FinanceNav active="Client Contracts" />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {([['rates', 'Billing Rates'], ['generate', 'Generate Invoice'], ['track', 'Track Invoices']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === id ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.04)', color: tab === id ? '#fff' : C.muted }}>{label}</button>
        ))}
      </div>

      {tab === 'rates' && <RatesTab />}
      {tab === 'generate' && <GenerateTab />}
      {tab === 'track' && <TrackTab />}
    </div>
  )
}

// ── BILLING RATES ─────────────────────────────────────────────────────────
function RatesTab() {
  const { state: inv } = useInventory()
  const { state, setClientRate } = useFinance()
  const [selected, setSelected] = useState(inv.projects[0].name)
  const rate = state.clientRates[selected]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Select Project</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {inv.projects.map(p => (
            <button key={p.id} onClick={() => setSelected(p.name)} style={{ padding: '10px 18px', borderRadius: 10, cursor: 'pointer', background: selected === p.name ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)', border: `1px solid ${selected === p.name ? 'transparent' : C.border}`, color: selected === p.name ? '#fff' : C.muted }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{PROJECT_CLIENTS[p.name] || '—'}</div>
            </button>
          ))}
        </div>
      </div>

      {rate ? <RateEditor rate={rate} onSave={r => setClientRate(selected, r)} /> : (
        <div style={{ padding: 60, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>
          No billing rate set for {selected} yet.
          <div style={{ marginTop: 14 }}>
            <button onClick={() => setClientRate(selected, { project: selected, client: PROJECT_CLIENTS[selected] || '', contractType: 'meterage', band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0, mobilisation: 0, demobilisation: 0, gst: 18, tds: 2, retention: 5 })}
              style={{ padding: '10px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Create Rate for {selected}</button>
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
          <div style={{ gridColumn: '1/2' }} />
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {field('Mobilisation billed to client (₹)', form.mobilisation, 'mobilisation')}
        {field('Demobilisation billed to client (₹)', form.demobilisation, 'demobilisation')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {field('GST %', form.gst, 'gst', C.blue)}
        {field('TDS %', form.tds, 'tds', C.red)}
        {field('Retention %', form.retention, 'retention', C.amber)}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000) }} style={{ padding: '11px 22px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none' }}>Save Rate</button>
        {saved && <span style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} /> Saved</span>}
      </div>
    </div>
  )
}

// ── GENERATE INVOICE ───────────────────────────────────────────────────────
function GenerateTab() {
  const { state: inv } = useInventory()
  const { state, addInvoice } = useFinance()
  const [project, setProject] = useState(inv.projects[0].name)
  const rate = state.clientRates[project]
  const [month, setMonth] = useState('Jul 2026')
  const [meters, setMeters] = useState(200)
  const [standbyDays, setStandbyDays] = useState(2)
  const [drillingDays, setDrillingDays] = useState(22)
  const [repairDays, setRepairDays] = useState(2)
  const [includeMob, setIncludeMob] = useState(false)
  const [includeDemob, setIncludeDemob] = useState(false)
  const [justGenerated, setJustGenerated] = useState<Invoice | null>(null)

  if (!rate) return <div style={{ padding: 60, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>Set a billing rate for {project} first, in the Billing Rates tab.</div>

  const isMeterage = rate.contractType === 'meterage'
  const gross = calcClientRevenue(rate, { meters, standbyDays, drillingDays, repairDays, includeMob, includeDemob })
  const gstAmt = Math.round(gross * rate.gst / 100)
  const tdsAmt = Math.round(gross * rate.tds / 100)
  const retAmt = Math.round(gross * rate.retention / 100)
  const net = gross + gstAmt - tdsAmt - retAmt

  const generate = () => {
    addInvoice({ project, client: rate.client, month, meters, standbyDays, drillingDays, repairDays, includeMob, includeDemob, grossAmount: gross, gstAmt, tdsAmt, retentionAmt: retAmt, netReceivable: net, dueDate: '' })
    setJustGenerated({ id: 'preview', invNumber: 'Preview', project, client: rate.client, month, meters, standbyDays, drillingDays, repairDays, includeMob, includeDemob, grossAmount: gross, gstAmt, tdsAmt, retentionAmt: retAmt, netReceivable: net, status: 'Draft', raisedDate: '', dueDate: '', paidAmount: 0 })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Invoice Details</div>
        <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Project</div>
          <select value={project} onChange={e => setProject(e.target.value)} style={selStyle}>{inv.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select>
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: isMeterage ? 'rgba(249,115,22,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${isMeterage ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)'}`, fontSize: 12, fontWeight: 700, color: isMeterage ? C.orange : C.blue }}>
          {isMeterage ? '📏 Meterage contract' : '📅 Day rate contract'}
        </div>
        <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Billing Month</div>
          <input value={month} onChange={e => setMonth(e.target.value)} style={iStyle} /></div>

        {isMeterage ? (
          <>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Meters Drilled</div>
              <input type="number" value={meters} onChange={e => setMeters(parseInt(e.target.value) || 0)} style={{ ...iStyle, fontSize: 20, fontWeight: 900, color: C.orange, textAlign: 'center' }} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Standby Days</div>
              <input type="number" value={standbyDays} onChange={e => setStandbyDays(parseInt(e.target.value) || 0)} style={iStyle} /></div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, marginBottom: 6 }}>Drilling Days</div><input type="number" value={drillingDays} onChange={e => setDrillingDays(parseInt(e.target.value) || 0)} style={iStyle} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, marginBottom: 6 }}>Standby Days</div><input type="number" value={standbyDays} onChange={e => setStandbyDays(parseInt(e.target.value) || 0)} style={iStyle} /></div>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, marginBottom: 6 }}>Repair Days</div><input type="number" value={repairDays} onChange={e => setRepairDays(parseInt(e.target.value) || 0)} style={iStyle} /></div>
          </div>
        )}

        {rate.mobilisation > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeMob} onChange={e => setIncludeMob(e.target.checked)} /> Include Mobilisation ({money(rate.mobilisation)})
          </label>
        )}
        {rate.demobilisation > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.text, cursor: 'pointer' }}>
            <input type="checkbox" checked={includeDemob} onChange={e => setIncludeDemob(e.target.checked)} /> Include Demobilisation ({money(rate.demobilisation)})
          </label>
        )}

        <button onClick={generate} style={{ padding: 13, borderRadius: 12, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', border: 'none' }}>Generate Invoice →</button>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Live Calculation</div>
        {[
          { label: 'Gross Invoice Value', value: gross, color: C.green, size: 18 },
          { label: `+ GST @${rate.gst}%`, value: gstAmt, color: C.blue, size: 14 },
          { label: `− TDS @${rate.tds}%`, value: tdsAmt, color: C.red, size: 14 },
          { label: `− Retention @${rate.retention}%`, value: retAmt, color: C.amber, size: 14 },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 12, color: C.muted }}>{r.label}</span>
            <span style={{ fontSize: r.size, fontWeight: 800, color: r.color, fontFamily: 'monospace' }}>{money(r.value)}</span>
          </div>
        ))}
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>NET RECEIVABLE</div></div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.green, fontFamily: 'monospace' }}>{money(net)}</div>
        </div>
        {justGenerated && <div style={{ fontSize: 12, color: C.green, display: 'flex', alignItems: 'center', gap: 6 }}><Check size={13} /> Invoice added — see it in Track Invoices</div>}
      </div>
    </div>
  )
}

// ── TRACK INVOICES ─────────────────────────────────────────────────────────
function TrackTab() {
  const { state, setInvoiceStatus } = useFinance()
  const [filter, setFilter] = useState<InvStatus | 'All'>('All')
  const filtered = state.invoices.filter(i => filter === 'All' || i.status === filter)
  const totalRetention = state.invoices.reduce((s, i) => s + i.retentionAmt, 0)
  const totalTDS = state.invoices.reduce((s, i) => s + i.tdsAmt, 0)

  const download = (inv: Invoice) => {
    const html = `<!DOCTYPE html><html><head><title>${inv.invNumber}</title><style>body{font-family:Arial;padding:40px;max-width:820px;margin:0 auto}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;padding:10px}td{padding:9px;border-bottom:1px solid #eee}</style></head><body><h2 style="color:#F97316">${inv.invNumber}</h2><p>${inv.project} · ${inv.client} · ${inv.month}</p><table><tr><th>Description</th><th>Amount</th></tr><tr><td>Services</td><td>₹${inv.grossAmount.toLocaleString()}</td></tr><tr><td>+ GST</td><td>+₹${inv.gstAmt.toLocaleString()}</td></tr><tr><td>− TDS</td><td>−₹${inv.tdsAmt.toLocaleString()}</td></tr><tr><td>− Retention</td><td>−₹${inv.retentionAmt.toLocaleString()}</td></tr><tr style="background:#f0fdf4;font-weight:800"><td>NET RECEIVABLE</td><td>₹${inv.netReceivable.toLocaleString()}</td></tr></table></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${inv.invNumber}.html`; a.click()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ padding: '18px 22px', borderRadius: 14, background: C.card, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🔒 Retention Locked</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>{moneyL(totalRetention)}</div>
        </div>
        <div style={{ padding: '18px 22px', borderRadius: 14, background: C.card, border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>🔒 TDS Deducted</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.purple, fontFamily: 'monospace' }}>{moneyL(totalTDS)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 14px' }}>
        {(['All', ...Object.keys(STATUS_CONFIG)] as const).map(s => (
          <button key={s} onClick={() => setFilter(s as any)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: filter === s ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filter === s ? 'rgba(249,115,22,0.35)' : C.border}`, color: filter === s ? C.orange : C.faint }}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, color: C.faint }}>No invoices found.</div>}
        {filtered.map(inv => {
          const sc = STATUS_CONFIG[inv.status]
          return (
            <div key={inv.id} style={{ background: C.card, border: `1px solid ${inv.status === 'Overdue' ? 'rgba(239,68,68,0.25)' : C.border}`, borderRadius: 14, padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.orange, fontFamily: 'monospace' }}>{inv.invNumber}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>{sc.icon} {inv.status}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{inv.project} · {inv.client} · {inv.month}</div>
              </div>
              <div><div style={{ fontSize: 15, fontWeight: 800, color: C.green, fontFamily: 'monospace' }}>{money(inv.netReceivable)}</div><div style={{ fontSize: 11, color: C.faint }}>Net receivable</div></div>
              <div style={{ fontSize: 12, color: C.muted }}>Raised: {inv.raisedDate || '—'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <select value={inv.status} onChange={e => setInvoiceStatus(inv.id, e.target.value as InvStatus)} style={{ appearance: 'none', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: 11, fontWeight: 700, padding: '5px 22px 5px 9px', borderRadius: 20, cursor: 'pointer', outline: 'none', width: '100%' }}>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', color: sc.color, pointerEvents: 'none' }} />
                </div>
                <button onClick={() => download(inv)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}><Download size={11} /> Download</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

