'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { useInventory } from '../../../../lib/inventory-store'
import { useFinance, C, iStyle, FinanceNav, PROJECT_CLIENTS } from '../../../../lib/finance-store'
import type { ClientRate } from '../../../../lib/finance-store'

export default function ClientContractsPage() {
  const { state: inv } = useInventory()
  const { state, setClientRate } = useFinance()
  const [selected, setSelected] = useState(inv.projects[0].name)
  const rate = state.clientRates[selected]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Client Contracts</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>What you've agreed to bill each client, per project</p>
        </div>
        <FinanceNav active="Client Contracts" />
      </div>

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
            <button onClick={() => setClientRate(selected, { project: selected, client: PROJECT_CLIENTS[selected] || '', contractType: 'meterage', band1To: 200, band1Rate: 0, band2To: 400, band2Rate: 0, band3Rate: 0, standbyRate: 0, drillingDayRate: 0, standbyDayRate: 0, repairDayRate: 0 })}
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

