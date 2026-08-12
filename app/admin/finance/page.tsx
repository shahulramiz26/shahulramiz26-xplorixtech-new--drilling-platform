'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Package } from 'lucide-react'
import { useInventory } from '../../../lib/inventory-store'
import {
  useFinance, costBreakdown, computeMargin, currentProjectForRig, operationalRecordsForRig,
  C, iStyle, money, moneyL, cpmColor, cpmLabel, marginColor, FinanceNav,
} from '../../../lib/finance-store'
import type { RigRateInputs, OperationalRecord } from '../../../lib/finance-store'
import { allRigsWithOperationalData } from '../../../lib/operations-store'

export default function RigCostPage() {
  const { state: inv } = useInventory()
  const { state, setRigRate } = useFinance()
  const rigs = allRigsWithOperationalData()
  const [selectedRig, setSelectedRig] = useState(rigs[0] || '')
  const [rateModalFor, setRateModalFor] = useState<{ ops: OperationalRecord; existing?: RigRateInputs } | null>(null)

  // Overall KPIs — every period where we have ops + rates + a client rate.
  const allPeriods = rigs.flatMap(rig => operationalRecordsForRig(rig).map(ops => {
    const rates = state.rigRates.find(r => r.rig === ops.rig && r.project === ops.project && r.month === ops.month)
    const clientRate = state.clientRates[ops.project]
    if (!rates || !clientRate) return null
    return computeMargin(ops, rates, clientRate, inv.purchaseOrders)
  }).filter(Boolean) as ReturnType<typeof computeMargin>[])

  const totalMargin = allPeriods.reduce((s, p) => s + p.totalMargin, 0)
  const avgCPM = allPeriods.length > 0 ? Math.round(allPeriods.reduce((s, p) => s + p.cost.cpm, 0) / allPeriods.length) : 0
  const totalParts = allPeriods.reduce((s, p) => s + p.cost.parts, 0)

  const records = operationalRecordsForRig(selectedRig)
  const currentProject = currentProjectForRig(inv.projects, selectedRig)
  const byProject = records.reduce((acc, r) => { (acc[r.project] ||= []).push(r); return acc }, {} as Record<string, OperationalRecord[]>)
  const projectGroups = Object.entries(byProject).sort(([a], [b]) => (a === currentProject ? -1 : b === currentProject ? 1 : 0))

  const trend = records.map(ops => {
    const rates = state.rigRates.find(r => r.rig === ops.rig && r.project === ops.project && r.month === ops.month)
    return rates ? { month: ops.month, cpm: costBreakdown(ops, rates, inv.purchaseOrders).cpm } : { month: ops.month, cpm: null }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Rig Cost</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>What it costs to run each rig — operational figures are read-only, pulled from the Operational &amp; Maintenance Dashboards</p>
        </div>
        <FinanceNav active="Rig Cost" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Average CPM', value: `₹${avgCPM}/m`, color: cpmColor(avgCPM), note: cpmLabel(avgCPM) },
          { label: 'Overall Margin', value: `${totalMargin >= 0 ? '+' : ''}${moneyL(Math.abs(totalMargin))}`, color: marginColor(totalMargin), note: totalMargin >= 0 ? 'Profitable' : 'Loss' },
          { label: 'Parts & Consumables', value: moneyL(totalParts), color: C.blue, note: 'Live from Inventory' },
          { label: 'Periods Priced', value: `${allPeriods.length}`, color: C.purple, note: 'Rig × project × month' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>{k.note}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Select Rig</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {rigs.map(rig => {
            const cur = currentProjectForRig(inv.projects, rig)
            return (
              <button key={rig} onClick={() => setSelectedRig(rig)} style={{ padding: '10px 18px', borderRadius: 10, cursor: 'pointer', background: selectedRig === rig ? `linear-gradient(135deg,${C.orange},${C.orangeD})` : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedRig === rig ? 'transparent' : C.border}`, color: selectedRig === rig ? '#fff' : C.muted }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{rig}</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{cur ? `On ${cur.split(' - ')[0]}` : 'Unassigned'}</div>
              </button>
            )
          })}
        </div>
      </div>

      {trend.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>CPM Trend — {selectedRig}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {trend.map((t, i) => (
              <div key={i} style={{ padding: '8px 14px', borderRadius: 10, background: t.cpm === null ? 'rgba(255,255,255,0.02)' : `${cpmColor(t.cpm)}18`, border: `1px solid ${t.cpm === null ? C.border : cpmColor(t.cpm) + '40'}`, textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 10, color: C.faint, marginBottom: 3 }}>{t.month}</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color: t.cpm === null ? C.faint : cpmColor(t.cpm) }}>{t.cpm === null ? 'No rates' : `₹${Math.round(t.cpm)}/m`}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectGroups.map(([project, periods]) => {
        const isCurrent = project === currentProject
        return (
          <div key={project} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{project}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: isCurrent ? C.green : C.faint, background: isCurrent ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isCurrent ? 'rgba(16,185,129,0.25)' : C.border}` }}>{isCurrent ? '● Current' : 'Completed'}</span>
            </div>

            {periods.map(ops => {
              const rates = state.rigRates.find(r => r.rig === ops.rig && r.project === ops.project && r.month === ops.month)
              const cost = rates ? costBreakdown(ops, rates, inv.purchaseOrders) : null
              return (
                <div key={ops.month} style={{ background: C.card, border: `1px solid ${isCurrent ? C.border : 'rgba(30,41,59,0.6)'}`, borderRadius: 16, overflow: 'hidden', opacity: isCurrent ? 1 : 0.85 }}>
                  <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{ops.month}</div>
                    {cost ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: cpmColor(cost.cpm), fontFamily: 'monospace' }}>₹{Math.round(cost.cpm)}/m</div>
                          <div style={{ fontSize: 9, color: C.faint }}>CPM · {cpmLabel(cost.cpm)}</div>
                        </div>
                        <button onClick={() => setRateModalFor({ ops, existing: rates })} style={{ padding: 7, borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, cursor: 'pointer' }}><Edit2 size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setRateModalFor({ ops })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: C.orange, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Plus size={12} /> Set Rates</button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}` }}>
                    {[
                      { label: 'Days Operated', value: ops.daysOperated },
                      { label: 'Meters Drilled', value: `${ops.metersDrilled}m` },
                      { label: 'Fuel (L/day)', value: ops.fuelLitresPerDay },
                      { label: 'Maintenance', value: money(ops.maintenanceCost) },
                    ].map((f, i) => (
                      <div key={i} style={{ padding: '10px 14px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{f.label} <span style={{ color: '#334155' }}>· from ops</span></div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, fontFamily: 'monospace' }}>{f.value}</div>
                      </div>
                    ))}
                  </div>

                  {cost && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)' }}>
                        {[
                          { label: 'Rig Cost', value: cost.rigCost, color: C.orange },
                          { label: 'Labour', value: cost.labour, color: C.blue },
                          { label: 'Fuel', value: cost.fuel, color: C.amber },
                          { label: 'Mob + Demob', value: cost.mobDemob, color: C.muted },
                          { label: 'Parts (Inventory)', value: cost.parts, color: C.green },
                        ].map((c, i) => (
                          <div key={i} style={{ padding: '10px 12px', borderRight: i < 4 ? `1px solid ${C.border}` : 'none', textAlign: 'center' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{c.label}</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>{money(c.value)}</div>
                          </div>
                        ))}
                      </div>
                      {cost.parts > 0 && (
                        <div style={{ padding: '7px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: C.faint }}>
                          <Package size={10} /> Parts pulled live from Inventory Purchase Orders for {ops.rig} on {ops.project}
                        </div>
                      )}
                      <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: C.faint }}>Total cost this month</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: C.red, fontFamily: 'monospace' }}>{money(cost.total)}</span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {rateModalFor && (
        <RateModal
          ops={rateModalFor.ops}
          existing={rateModalFor.existing}
          onClose={() => setRateModalFor(null)}
          onSave={patch => { setRigRate({ rig: rateModalFor.ops.rig, project: rateModalFor.ops.project, month: rateModalFor.ops.month, ...patch }); setRateModalFor(null) }}
        />
      )}
    </div>
  )
}

function RateModal({ ops, existing, onClose, onSave }: { ops: OperationalRecord; existing?: RigRateInputs; onClose: () => void; onSave: (r: Omit<RigRateInputs, 'id' | 'rig' | 'project' | 'month'>) => void }) {
  const [rigDayRate, setRigDayRate] = useState(existing?.rigDayRate ?? 9000)
  const [labourPerDay, setLabourPerDay] = useState(existing?.labourPerDay ?? 2300)
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState(existing?.fuelPricePerLitre ?? 97)
  const [mobilisation, setMobilisation] = useState(existing?.mobilisation ?? 0)
  const [demobilisation, setDemobilisation] = useState(existing?.demobilisation ?? 0)

  const field = (label: string, value: number, set: (n: number) => void, color = C.text) => (
    <div><div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      <input type="number" value={value} onChange={e => set(parseFloat(e.target.value) || 0)} style={{ ...iStyle, color, fontWeight: 700 }} /></div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, width: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{existing ? 'Edit' : 'Set'} Rates</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ fontSize: 12, color: C.faint, marginBottom: 18 }}>{ops.rig} · {ops.project} · {ops.month}</div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>From operations (read-only)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: C.muted }}>
            <div>Days operated: <strong style={{ color: C.text }}>{ops.daysOperated}</strong></div>
            <div>Meters drilled: <strong style={{ color: C.text }}>{ops.metersDrilled}m</strong></div>
            <div>Fuel: <strong style={{ color: C.text }}>{ops.fuelLitresPerDay} L/day</strong></div>
            <div>Maintenance: <strong style={{ color: C.text }}>{money(ops.maintenanceCost)}</strong></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {field('Rig Day Rate (₹/day)', rigDayRate, setRigDayRate, C.orange)}
          {field('Labour per Day (₹)', labourPerDay, setLabourPerDay, C.blue)}
          {field('Fuel Price (₹/litre)', fuelPricePerLitre, setFuelPricePerLitre, C.amber)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          {field('Mobilisation cost (₹, 0 if N/A)', mobilisation, setMobilisation, C.muted)}
          {field('Demobilisation cost (₹, 0 if N/A)', demobilisation, setDemobilisation, C.muted)}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave({ rigDayRate, labourPerDay, fuelPricePerLitre, mobilisation, demobilisation })} style={{ flex: 2, padding: 12, borderRadius: 10, background: `linear-gradient(135deg,${C.orange},${C.orangeD})`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>{existing ? 'Save Changes' : 'Set Rates'}</button>
        </div>
      </div>
    </div>
  )
}

