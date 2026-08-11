'use client'

import { useInventory, stockFor, poReceivedValue, supplierPerf, money, SubNav, S, StarRating } from '../../../lib/inventory-store'
import { Bell, AlertTriangle, TrendingUp, Truck, Star } from 'lucide-react'

export default function Dashboard() {
  const { state } = useInventory()

  const totalSpend = state.purchaseOrders.filter(po => po.status === 'Received' || po.status === 'Partially Received').reduce((s, po) => s + poReceivedValue(po), 0)
  const pendingRequests = state.requests.filter(r => r.status === 'Pending')
  const openPOs = state.purchaseOrders.filter(po => po.status === 'Ordered' || po.status === 'Partially Received')

  const lowStock = state.projects.flatMap(proj =>
    stockFor(state, proj.name).filter(s => s.qty > 0 && s.qty <= s.part.reorderLevel).map(s => ({ project: proj.name.split(' - ')[0], ...s }))
  ).slice(0, 6)

  const topSuppliers = [...state.suppliers].map(s => ({ s, perf: supplierPerf(state, s.id) })).sort((a, b) => b.perf.stars - a.perf.stars).slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Inventory Dashboard</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Requests, purchase orders, stock and suppliers — by project</p>
        </div>
        <SubNav active="Dashboard" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Spend (Received)', value: money(totalSpend), color: '#10B981', icon: <TrendingUp size={16} /> },
          { label: 'Pending Requests', value: pendingRequests.length, color: '#F97316', icon: <Bell size={16} /> },
          { label: 'Open Purchase Orders', value: openPOs.length, color: '#60A5FA', icon: <Truck size={16} /> },
          { label: 'Low Stock Items', value: lowStock.length, color: lowStock.length ? '#EF4444' : '#10B981', icon: <AlertTriangle size={16} /> },
        ].map((k, i) => (
          <div key={i} style={{ ...S.card, padding: '16px 18px' }}>
            <div style={{ color: k.color, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertTriangle size={15} style={{ color: '#EF4444' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Low Stock</div>
          </div>
          {lowStock.length === 0 && <div style={{ fontSize: 12, color: '#64748B' }}>Nothing below reorder level.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lowStock.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>{s.part.name}</div><div style={{ fontSize: 10, color: '#64748B' }}>{s.project}</div></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>{s.qty} / {s.part.reorderLevel} {s.part.unit}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={15} style={{ color: '#F59E0B' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Top Ranked Suppliers</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topSuppliers.map(({ s, perf }) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>{s.name}</div><div style={{ fontSize: 10, color: '#64748B' }}>{s.category}</div></div>
                <StarRating stars={perf.stars} size={12} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>By Project</div>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 16 }}>Spend is received-value only</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.projects.map(proj => {
            const spend = state.purchaseOrders.filter(po => po.project === proj.name && (po.status === 'Received' || po.status === 'Partially Received')).reduce((s, po) => s + poReceivedValue(po), 0)
            const pending = state.requests.filter(r => r.project === proj.name && r.status === 'Pending').length
            const low = stockFor(state, proj.name).filter(s => s.qty > 0 && s.qty <= s.part.reorderLevel).length
            return (
              <div key={proj.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 180 }}><div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{proj.name}</div><div style={{ fontSize: 10, color: '#64748B' }}>Rigs: {proj.rigs.join(', ')}</div></div>
                <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{money(spend)}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>SPEND</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: pending ? '#F97316' : '#64748B' }}>{pending}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>PENDING</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: low ? '#EF4444' : '#10B981' }}>{low}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>LOW STOCK</div></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

