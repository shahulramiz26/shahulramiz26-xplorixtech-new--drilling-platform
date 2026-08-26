'use client'

import { useState } from 'react'
import {
  useInventory, poReceivedValue, poOrderedValue, poUnissuedValue, poIssuedValue, poIssuedValueToRig,
  allRigs, rigTotalSpend, rigSpendByProject, projectStockInStore, projectOutstanding,
  poIssues, issueRig, supplierPerf, money, SubNav, S, StarRating,
} from '../../../lib/inventory-store'
import { TrendingUp, Wallet, Package, Star, ChevronRight, Drill, PackageOpen } from 'lucide-react'

const ISSUED = '#A855F7'

export default function Dashboard() {
  const { state } = useInventory()
  const [expandedRig, setExpandedRig] = useState<string | null>(null)

  // Three different numbers that used to be conflated:
  //   received  — value that arrived into the store
  //   consumed  — value issued out to a rig (this is the real cost)
  //   in store  — received but not yet issued; working capital sitting idle
  const totalReceived = state.purchaseOrders.reduce((s, po) => s + poReceivedValue(po), 0)
  const totalConsumed = state.purchaseOrders.reduce((s, po) => s + poIssuedValue(po), 0)
  const totalInStore = state.purchaseOrders.reduce((s, po) => s + poUnissuedValue(po), 0)
  const totalOutstanding = state.purchaseOrders.reduce((s, po) => s + (poOrderedValue(po) - poReceivedValue(po)), 0)

  const topSuppliers = [...state.suppliers].map(s => ({ s, perf: supplierPerf(state, s.id) })).sort((a, b) => b.perf.stars - a.perf.stars).slice(0, 4)

  const rigs = allRigs(state).map(rig => ({ rig, spend: rigTotalSpend(state, rig) })).sort((a, b) => b.spend - a.spend)
  const maxRigSpend = Math.max(1, ...rigs.map(r => r.spend))

  // Stock is bought for a project and only assigned to a rig when it's
  // issued, so anything still in the store belongs to the project.
  const projectStock = state.projects
    .map(p => ({ project: p.name, inStore: projectStockInStore(state, p.name), onOrder: projectOutstanding(state, p.name) }))
    .filter(p => p.inStore > 0 || p.onOrder > 0)
    .sort((a, b) => b.inStore - a.inStore)

  // Whichever project currently lists this rig in its rigs[] is the one
  // it's actively working — everything else in its spend history is a
  // completed project, not a second job it's somehow doing at the same time.
  const currentProjectForRig = (rig: string): string | null => state.projects.find(p => p.rigs.includes(rig))?.name || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Inventory Spend Dashboard</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>What each rig has actually consumed — counted when stock leaves the store, not when it&apos;s ordered</p>
        </div>
        <SubNav active="Dashboard" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Consumed (issued to rigs)', value: money(totalConsumed), color: '#10B981', icon: <TrendingUp size={16} /> },
          { label: 'In store (received, not yet issued)', value: money(totalInStore), color: ISSUED, icon: <PackageOpen size={16} /> },
          { label: 'On order (not yet received)', value: money(totalOutstanding), color: '#F59E0B', icon: <Wallet size={16} /> },
          { label: `Purchase orders · ${money(totalReceived)} received`, value: state.purchaseOrders.length, color: '#60A5FA', icon: <Package size={16} /> },
        ].map((k, i) => (
          <div key={i} style={{ ...S.card, padding: '16px 18px' }}>
            <div style={{ color: k.color, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Rig list — the primary view */}
      <div style={{ ...S.card, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Drill size={15} style={{ color: '#F97316' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Consumption by Rig</div>
        </div>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 18 }}>Click a rig to see which projects it&apos;s worked on and how much it consumed on each</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rigs.length === 0 && <div style={{ fontSize: 12, color: '#64748B' }}>No rigs found.</div>}
          {rigs.map(({ rig, spend }) => {
            const isExpanded = expandedRig === rig
            const byProject = rigSpendByProject(state, rig)
            const poCount = state.purchaseOrders.filter(po => poIssuedValueToRig(po, rig) > 0).length
            const issueCount = state.purchaseOrders.reduce((n, po) => n + poIssues(po).filter(rec => issueRig(po, rec) === rig).length, 0)
            const currentProject = currentProjectForRig(rig)

            return (
              <div key={rig} style={{ border: '1px solid #1E293B', borderRadius: 12, overflow: 'hidden' }}>
                <div onClick={() => setExpandedRig(isExpanded ? null : rig)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ minWidth: 150 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>{rig}</div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>{issueCount} issue{issueCount !== 1 ? 's' : ''} · {poCount} order{poCount !== 1 ? 's' : ''} · {byProject.length} project{byProject.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ flex: 1, background: '#1A2234', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${(spend / maxRigSpend) * 100}%`, height: 8, background: '#F97316', borderRadius: 5 }} />
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#10B981' }}>{money(spend)}</div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>CONSUMED</div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#64748B', transform: isExpanded ? 'rotate(90deg)' : 'none', flexShrink: 0 }} />
                </div>

                {isExpanded && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #1E293B' }}>
                    <div style={{ ...S.label, marginBottom: 10 }}>Consumed by project</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {byProject.map(p => {
                        const isCurrent = p.project === currentProject
                        return (
                          <div key={p.project} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${isCurrent ? 'rgba(16,185,129,0.25)' : '#1E293B'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 12, color: isCurrent ? '#F8FAFC' : '#94A3B8' }}>{p.project}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: isCurrent ? '#10B981' : '#64748B', background: isCurrent ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isCurrent ? 'rgba(16,185,129,0.25)' : '#1E293B'}` }}>
                                {isCurrent ? '● Current' : 'Completed'}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{money(p.spend)}</span>
                          </div>
                        )
                      })}
                      {byProject.length === 0 && <div style={{ fontSize: 12, color: '#64748B' }}>Nothing issued to this rig yet.</div>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stock is bought per project and only lands on a rig when it's issued */}
      {projectStock.length > 0 && (
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <PackageOpen size={15} style={{ color: ISSUED }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Not Yet on a Rig</div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginBottom: 18 }}>Bought against a project, waiting to be issued — no rig carries this cost yet</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projectStock.map(p => (
              <div key={p.project} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>
                <span style={{ fontSize: 12, color: '#F8FAFC', fontWeight: 600 }}>{p.project}</span>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: ISSUED }}>{money(p.inStore)}</div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>IN STORE</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.onOrder > 0 ? '#F59E0B' : '#334155' }}>{money(p.onOrder)}</div>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>ON ORDER</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
