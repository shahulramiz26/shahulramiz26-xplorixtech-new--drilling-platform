'use client'

import { useInventory, poReceivedValue, poOrderedValue, projectSpendByCategory, projectTotalSpend, projectOutstanding, supplierPerf, money, SubNav, S, StarRating, Badge, poStatusColor } from '../../../lib/inventory-store'
import { TrendingUp, Wallet, Package, Star } from 'lucide-react'

export default function Dashboard() {
  const { state } = useInventory()

  const totalSpend = state.purchaseOrders.reduce((s, po) => s + poReceivedValue(po), 0)
  const totalOutstanding = state.purchaseOrders.reduce((s, po) => s + (poOrderedValue(po) - poReceivedValue(po)), 0)
  const topSuppliers = [...state.suppliers].map(s => ({ s, perf: supplierPerf(state, s.id) })).sort((a, b) => b.perf.stars - a.perf.stars).slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Inventory Spend Dashboard</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>How much is being spent, project by project</p>
        </div>
        <SubNav active="Dashboard" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Spend (Confirmed)', value: money(totalSpend), color: '#10B981', icon: <TrendingUp size={16} /> },
          { label: 'Outstanding (Ordered, not yet received)', value: money(totalOutstanding), color: '#F59E0B', icon: <Wallet size={16} /> },
          { label: 'Purchase Orders', value: state.purchaseOrders.length, color: '#60A5FA', icon: <Package size={16} /> },
          { label: 'Active Suppliers', value: state.suppliers.filter(s => s.status === 'Active').length, color: '#8B5CF6', icon: <Star size={16} /> },
        ].map((k, i) => (
          <div key={i} style={{ ...S.card, padding: '16px 18px' }}>
            <div style={{ color: k.color, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Per-project spend breakdown — the core view */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {state.projects.map(proj => {
          const total = projectTotalSpend(state, proj.name)
          const outstanding = projectOutstanding(state, proj.name)
          const byCategory = projectSpendByCategory(state, proj.name)
          const pos = state.purchaseOrders.filter(po => po.project === proj.name)
          const maxCat = Math.max(1, ...byCategory.map(c => c.spend))

          return (
            <div key={proj.id} style={{ ...S.card, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#F8FAFC', fontFamily: "'Space Grotesk',sans-serif" }}>{proj.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{pos.length} purchase order{pos.length !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>{money(total)}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>SPENT</div></div>
                  {outstanding > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B' }}>{money(outstanding)}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>OUTSTANDING</div></div>}
                </div>
              </div>

              {byCategory.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ ...S.label, marginBottom: 10 }}>Spend by category</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {byCategory.map(c => (
                      <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 130, fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>{c.category}</div>
                        <div style={{ flex: 1, background: '#1A2234', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                          <div style={{ width: `${(c.spend / maxCat) * 100}%`, height: 8, background: '#F97316', borderRadius: 5 }} />
                        </div>
                        <div style={{ width: 90, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#F8FAFC', flexShrink: 0 }}>{money(c.spend)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ ...S.label, marginBottom: 10 }}>Purchase items</div>
              <div style={{ border: '1px solid #1E293B', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['PO', 'Part', 'Category', 'Qty', 'Unit Cost', 'Amount', 'Status'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: '#64748B', fontWeight: 700, borderBottom: '1px solid #1E293B' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pos.flatMap(po => po.items.map((it, i) => (
                      <tr key={po.id + i} style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
                        <td style={{ padding: '8px 12px', color: '#F97316', fontFamily: 'monospace' }}>{po.poNumber}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#F8FAFC' }}>{it.name}</td>
                        <td style={{ padding: '8px 12px', color: '#60A5FA' }}>{it.category}</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>{it.qtyReceived}/{it.qty} {it.unit}</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>{money(it.unitCost)}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#10B981' }}>{money(it.qtyReceived * it.unitCost)}</td>
                        <td style={{ padding: '8px 12px' }}><Badge text={po.status} c={poStatusColor[po.status]} /></td>
                      </tr>
                    )))}
                    {pos.length === 0 && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#64748B' }}>No purchase orders for this project yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Star size={15} style={{ color: '#F59E0B' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Top Ranked Suppliers</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {topSuppliers.map(({ s, perf }) => (
            <div key={s.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{s.name}</div>
              <StarRating stars={perf.stars} size={12} />
              <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 6 }}>{money(perf.spend)} spent</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

