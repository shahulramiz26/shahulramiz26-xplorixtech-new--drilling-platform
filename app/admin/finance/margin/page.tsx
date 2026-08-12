'use client'

import { useInventory } from '../../../../lib/inventory-store'
import { useFinance, rigCostBreakdown, calcClientRevenue, C, money, moneyL, cpmColor, FinanceNav } from '../../../../lib/finance-store'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'

export default function MarginPage() {
  const { state: inv } = useInventory()
  const { state } = useFinance()

  const rows = state.rigCosts.map(entry => {
    const cost = rigCostBreakdown(entry, inv.purchaseOrders)
    const rate = state.clientRates[entry.project]
    if (!rate) return { entry, cost, clientRevenue: 0, clientRatePerMeter: 0, marginPerMeter: 0, totalMargin: 0, hasRate: false }

    // Meterage: use the entry's actual meters against the band structure.
    // Day rate: no natural "per meter" client rate exists, so we treat every
    // operated day as a drilling day for this comparison — a simplification,
    // since a rig-cost entry doesn't currently split days by drilling/standby/repair.
    const clientRevenue = rate.contractType === 'meterage'
      ? calcClientRevenue(rate, { meters: entry.metersDrilled })
      : calcClientRevenue(rate, { meters: entry.metersDrilled, drillingDays: entry.daysOperated })

    const clientRatePerMeter = entry.metersDrilled > 0 ? clientRevenue / entry.metersDrilled : 0
    const marginPerMeter = clientRatePerMeter - cost.cpm
    const totalMargin = clientRevenue - cost.total
    return { entry, cost, clientRevenue, clientRatePerMeter, marginPerMeter, totalMargin, hasRate: true }
  })

  const totalMargin = rows.reduce((s, r) => s + r.totalMargin, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.clientRevenue, 0)
  const totalCost = rows.reduce((s, r) => s + r.cost.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>Margin</h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 4 }}>Rig Cost vs. Client Contracts, side by side — nothing entered here, it's all derived</p>
        </div>
        <FinanceNav active="Margin" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Total Client Revenue', value: moneyL(totalRevenue), color: C.green },
          { label: 'Total Rig Cost', value: moneyL(totalCost), color: C.red },
          { label: 'Total Margin', value: `${totalMargin >= 0 ? '+' : ''}${moneyL(Math.abs(totalMargin))}`, color: totalMargin >= 0 ? C.green : C.red },
        ].map((k, i) => (
          <div key={i} style={{ padding: '16px 18px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.color, fontFamily: 'monospace' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 12, color: C.muted, display: 'flex', gap: 8 }}>
        <Info size={14} style={{ color: C.blue, flexShrink: 0, marginTop: 1 }} />
        <span>For day-rate contracts, every operated day is treated as a drilling day for this comparison, since a Rig Cost entry doesn't split days by drilling/standby/repair. Treat day-rate margins here as an approximation.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.length === 0 && <div style={{ padding: 60, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, color: C.faint }}>No rig cost entries yet — add some in the Rig Cost tab.</div>}
        {rows.map(({ entry, cost, clientRatePerMeter, marginPerMeter, totalMargin, hasRate, clientRevenue }) => {
          const isProfit = marginPerMeter >= 0
          return (
            <div key={entry.id} style={{ background: C.card, border: `1px solid ${hasRate ? (isProfit ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)') : C.border}`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{entry.rig} <span style={{ fontWeight: 500, color: C.faint }}>· {entry.project}</span></div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{entry.month} · {entry.metersDrilled}m drilled</div>
                </div>
                {!hasRate ? (
                  <span style={{ fontSize: 11, color: C.amber, padding: '5px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>⚠ No client rate set for this project</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isProfit ? <TrendingUp size={16} style={{ color: C.green }} /> : <TrendingDown size={16} style={{ color: C.red }} />}
                    <span style={{ fontSize: 20, fontWeight: 900, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>{isProfit ? '+' : ''}₹{Math.round(marginPerMeter)}/m</span>
                  </div>
                )}
              </div>

              {hasRate && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                    <div style={{ padding: '14px 18px', borderRight: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>CPM (Rig Cost)</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: cpmColor(cost.cpm), fontFamily: 'monospace' }}>₹{Math.round(cost.cpm)}/m</div>
                    </div>
                    <div style={{ padding: '14px 18px', borderRight: `1px solid ${C.border}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Client Rate</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: C.blue, fontFamily: 'monospace' }}>₹{Math.round(clientRatePerMeter)}/m</div>
                    </div>
                    <div style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Margin per Meter</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>{isProfit ? '+' : ''}₹{Math.round(marginPerMeter)}/m</div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
                    <span style={{ fontSize: 12, color: C.faint }}>Revenue {money(clientRevenue)} − Cost {money(cost.total)} = Total margin</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: isProfit ? C.green : C.red, fontFamily: 'monospace' }}>{isProfit ? '+' : ''}{money(totalMargin)}</span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

