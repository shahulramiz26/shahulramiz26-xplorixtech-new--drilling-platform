'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useInventory } from '../../../../lib/inventory-store'
import { useFinance, computeMargin, currentProjectForRig, operationalRecordsForRig, C, money, moneyL, cpmColor, marginColor, FinanceNav } from '../../../../lib/finance-store'
import { allRigsWithOperationalData } from '../../../../lib/operations-store'

export default function MarginPage() {
  const { state: inv } = useInventory()
  const { state } = useFinance()
  const rigs = allRigsWithOperationalData()
  const [selectedRig, setSelectedRig] = useState<'all' | string>('all')

  const rigResults = rigs.map(rig => {
    const currentProject = currentProjectForRig(inv.projects, rig)
    const periods = operationalRecordsForRig(rig).map(ops => {
      const rates = state.rigRates.find(r => r.rig === ops.rig && r.project === ops.project && r.month === ops.month)
      const clientRate = state.clientRates[ops.project]
      if (!rates || !clientRate) return { ops, result: null }
      return { ops, result: computeMargin(ops, rates, clientRate, inv.purchaseOrders) }
    })
    const priced = periods.filter(p => p.result)
    const totalMargin = priced.reduce((s, p) => s + (p.result!.totalMargin), 0)
    return { rig, currentProject, periods, totalMargin }
  })

  const visible = selectedRig === 'all' ? rigResults : rigResults.filter(r => r.rig === selectedRig)
  const grandTotalMargin = rigResults.reduce((s, r) => s + r.totalMargin, 0)
  const grandRevenue = rigResults.flatMap(r => r.periods).reduce((s, p) => s + (p.result?.revenue || 0), 0)
  const grandCost = rigResults.flatMap(r => r.periods).reduce((s, p) => s + (p.result?.cost.total || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Margin</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Rig Cost vs. Client Contracts, month by month — nothing entered here, it's all derived</p>
        </div>
        <FinanceNav active="Margin" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Total Client Revenue', value: moneyL(grandRevenue), color: C.green },
          { label: 'Total Rig Cost', value: moneyL(grandCost), color: C.red },
          { label: 'Total Margin', value: `${grandTotalMargin >= 0 ? '+' : ''}${moneyL(Math.abs(grandTotalMargin))}`, color: marginColor(grandTotalMargin) },
        ].map((k, i) => (
          <div key={i} style={{ padding: '18px 20px', background: C.card, border: `2px solid ${i === 2 ? (marginColor(grandTotalMargin) + '50') : C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: C.muted, display: 'flex', gap: 8 }}>
        <Info size={14} style={{ color: C.blue, flexShrink: 0, marginTop: 1 }} />
        <span>For day-rate contracts, every operated day is treated as a drilling day for this comparison — treat those margins as an approximation.</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedRig('all')} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: selectedRig === 'all' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedRig === 'all' ? 'rgba(249,115,22,0.3)' : C.border}`, color: selectedRig === 'all' ? C.orange : C.faint }}>All Rigs</button>
        {rigs.map(rig => (
          <button key={rig} onClick={() => setSelectedRig(rig)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: selectedRig === rig ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedRig === rig ? 'rgba(249,115,22,0.3)' : C.border}`, color: selectedRig === rig ? C.orange : C.faint }}>{rig}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {visible.map(({ rig, currentProject, periods, totalMargin }) => (
          <div key={rig} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.01)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{rig}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{currentProject ? `Currently on ${currentProject}` : 'Unassigned'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {totalMargin >= 0 ? <TrendingUp size={16} style={{ color: C.green }} /> : <TrendingDown size={16} style={{ color: C.red }} />}
                <span style={{ fontSize: 18, fontWeight: 900, color: marginColor(totalMargin), fontFamily: 'monospace' }}>{totalMargin >= 0 ? '+' : ''}{money(totalMargin)}</span>
              </div>
            </div>

            {/* Monthly margin trend */}
            <div style={{ padding: '14px 20px', display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
              {periods.map(({ ops, result }) => (
                <div key={ops.month} style={{ padding: '8px 14px', borderRadius: 10, minWidth: 110, textAlign: 'center', background: !result ? 'rgba(255,255,255,0.02)' : `${marginColor(result.marginPerMeter)}18`, border: `1px solid ${!result ? C.border : marginColor(result.marginPerMeter) + '40'}` }}>
                  <div style={{ fontSize: 10, color: C.faint, marginBottom: 3 }}>{ops.month} · {ops.project.split(' - ')[0]}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: !result ? C.faint : marginColor(result.marginPerMeter) }}>
                    {!result ? 'No data' : `${result.marginPerMeter >= 0 ? '+' : ''}₹${Math.round(result.marginPerMeter)}/m`}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail rows */}
            {periods.filter(p => p.result).map(({ ops, result }) => (
              <div key={ops.month} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ padding: '10px 14px', borderRight: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 4 }}>{ops.month}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{ops.project.split(' - ')[0]}</div>
                </div>
                <div style={{ padding: '10px 14px', borderRight: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 4 }}>CPM</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: cpmColor(result!.cost.cpm), fontFamily: 'monospace' }}>₹{Math.round(result!.cost.cpm)}/m</div>
                </div>
                <div style={{ padding: '10px 14px', borderRight: `1px solid ${C.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 4 }}>Client Rate</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.blue, fontFamily: 'monospace' }}>₹{Math.round(result!.clientRatePerMeter)}/m</div>
                </div>
                <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', marginBottom: 4 }}>Margin</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: marginColor(result!.marginPerMeter), fontFamily: 'monospace' }}>{result!.marginPerMeter >= 0 ? '+' : ''}₹{Math.round(result!.marginPerMeter)}/m</div>
                </div>
              </div>
            ))}
            {periods.every(p => !p.result) && (
              <div style={{ padding: 20, textAlign: 'center', color: C.faint, fontSize: 12 }}>No priced months yet — set rig rates and a client rate to see margin here.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

