'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Trash2, Package } from 'lucide-react'
import { useInventory } from '../../../lib/inventory-store'
import { useFinance, rigCostBreakdown, C, iStyle, selStyle, money, moneyL, cpmColor, cpmLabel, FinanceNav } from '../../../lib/finance-store'
import type { RigCostEntry } from '../../../lib/finance-store'

export default function RigCostPage() {
  const { state: inv } = useInventory()
  const { state, addRigCost, updateRigCost, deleteRigCost } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [editEntry, setEditEntry] = useState<RigCostEntry | null>(null)

  const rows = state.rigCosts.map(e => ({ entry: e, breakdown: rigCostBreakdown(e, inv.purchaseOrders) }))
  const avgCPM = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.breakdown.cpm, 0) / rows.length) : 0
  const totalCost = rows.reduce((s, r) => s + r.breakdown.total, 0)
  const totalParts = rows.reduce((s, r) => s + r.breakdown.parts, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Rig Cost</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>What it actually costs to run each rig — no client rates here, pure cost</p>
        </div>
        <FinanceNav active="Rig Cost" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Average CPM', value: `₹${avgCPM}/m`, color: cpmColor(avgCPM), note: cpmLabel(avgCPM) },
          { label: 'Total Cost (all entries)', value: moneyL(totalCost), color: C.red, note: 'Rig + labour + fuel + parts' },
          { label: 'Parts & Consumables', value: moneyL(totalParts), color: C.blue, note: 'Live from Inventory' },
          { label: 'Rig Cost Entries', value: rows.length, color: C.purple, note: 'Rig × project × month' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
          <Plus size={14} /> Add Rig Cost Entry
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.length === 0 && <div style={{ padding: 60, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>No rig cost entries yet.</div>}
        {rows.map(({ entry, breakdown }) => (
          <div key={entry.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,115,22,0.02)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{entry.rig} <span style={{ fontWeight: 500, color: C.faint }}>· {entry.project}</span></div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{entry.month} · {entry.daysOperated} days operated · {entry.metersDrilled}m drilled</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: cpmColor(breakdown.cpm), fontFamily: 'monospace' }}>₹{Math.round(breakdown.cpm)}/m</div>
                  <div style={{ fontSize: 10, color: C.faint }}>CPM · {cpmLabel(breakdown.cpm)}</div>
                </div>
                <button onClick={() => setEditEntry(entry)} style={{ padding: 8, borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}><Edit2 size={13} /></button>
                <button onClick={() => deleteRigCost(entry.id)} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }}><Trash2 size={13} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>
              {[
                { label: 'Rig Cost', value: breakdown.rigCost, color: C.orange },
                { label: 'Labour', value: breakdown.labour, color: C.blue },
                { label: 'Fuel', value: breakdown.fuel, color: C.amber },
                { label: 'Maintenance', value: breakdown.maintenance, color: C.purple },
                { label: 'Mob + Demob', value: breakdown.mobDemob, color: C.muted },
                { label: 'Parts (Inventory)', value: breakdown.parts, color: C.green },
              ].map((c, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRight: i < 5 ? `1px solid ${C.border}` : 'none', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{c.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{money(c.value)}</div>
                </div>
              ))}
            </div>
            {breakdown.parts > 0 && (
              <div style={{ padding: '8px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.faint }}>
                <Package size={11} /> Parts & Consumables pulled live from Purchase Orders in Inventory for {entry.rig} on {entry.project} — nothing entered manually here.
              </div>
            )}
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.faint }}>Total cost this period</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>{money(breakdown.total)}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <RigCostModal onClose={() => setShowAdd(false)} onSave={e => { addRigCost(e); setShowAdd(false) }} />}
      {editEntry && <RigCostModal entry={editEntry} onClose={() => setEditEntry(null)} onSave={patch => { updateRigCost(editEntry.id, patch); setEditEntry(null) }} />}
    </div>
  )
}

function RigCostModal({ entry, onClose, onSave }: { entry?: RigCostEntry; onClose: () => void; onSave: (e: any) => void }) {
  const { state: inv } = useInventory()
  const [rig, setRig] = useState(entry?.rig || '')
  const [project, setProject] = useState(entry?.project || inv.projects[0].name)
  const [month, setMonth] = useState(entry?.month || '2026-07')
  const [daysOperated, setDaysOperated] = useState(entry?.daysOperated ?? 22)
  const [metersDrilled, setMetersDrilled] = useState(entry?.metersDrilled ?? 180)
  const [rigDayRate, setRigDayRate] = useState(entry?.rigDayRate ?? 9000)
  const [labourPerDay, setLabourPerDay] = useState(entry?.labourPerDay ?? 2300)
  const [fuelLitresPerDay, setFuelLitresPerDay] = useState(entry?.fuelLitresPerDay ?? 110)
  const [dieselPrice, setDieselPrice] = useState(entry?.dieselPrice ?? 97)
  const [maintenancePerMonth, setMaintenancePerMonth] = useState(entry?.maintenancePerMonth ?? 18000)
  const [mobilisation, setMobilisation] = useState(entry?.mobilisation ?? 0)
  const [demobilisation, setDemobilisation] = useState(entry?.demobilisation ?? 0)

  const currentProject = inv.projects.find(p => p.name === project)
  const rigOptions = currentProject?.rigs || []

  const save = () => {
    if (!rig) return
    onSave({ rig, project, month, daysOperated, metersDrilled, rigDayRate, labourPerDay, fuelLitresPerDay, dieselPrice, maintenancePerMonth, mobilisation, demobilisation })
  }

  const field = (label: string, value: number, set: (n: number) => void, color = C.text) => (
    <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      <input type="number" value={value} onChange={e => set(parseFloat(e.target.value) || 0)} style={{ ...iStyle, color, fontWeight: 700 }} /></div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{entry ? 'Edit' : 'Add'} Rig Cost Entry</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Project</div>
            <select value={project} onChange={e => { setProject(e.target.value); setRig('') }} style={selStyle}>
              {inv.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Rig</div>
            <select value={rig} onChange={e => setRig(e.target.value)} style={selStyle}>
              <option value="">Select rig...</option>
              {rigOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Month</div>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={iStyle} /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {field('Days Operated', daysOperated, setDaysOperated, C.text)}
          {field('Meters Drilled', metersDrilled, setMetersDrilled, C.orange)}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Cost Inputs</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
          {field('Rig Day Rate (₹/day)', rigDayRate, setRigDayRate, C.orange)}
          {field('Labour per Day (₹)', labourPerDay, setLabourPerDay, C.blue)}
          {field('Fuel (litres/day)', fuelLitresPerDay, setFuelLitresPerDay, C.amber)}
          {field('Diesel Price (₹/litre)', dieselPrice, setDieselPrice, C.amber)}
          {field('Maintenance this period (₹)', maintenancePerMonth, setMaintenancePerMonth, C.purple)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          {field('Mobilisation cost (₹, 0 if N/A)', mobilisation, setMobilisation, C.muted)}
          {field('Demobilisation cost (₹, 0 if N/A)', demobilisation, setDemobilisation, C.muted)}
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, color: C.muted, marginBottom: 18, display: 'flex', gap: 8 }}>
          <Package size={14} style={{ color: C.green, flexShrink: 0, marginTop: 1 }} />
          <span>Parts & Consumables cost isn't entered here — it's pulled automatically from Purchase Orders in Inventory for this rig on this project.</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, padding: 12, borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>{entry ? 'Save Changes' : 'Add Entry'}</button>
        </div>
      </div>
    </div>
  )
}

