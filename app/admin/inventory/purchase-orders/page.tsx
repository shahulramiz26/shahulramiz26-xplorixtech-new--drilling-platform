'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Truck, ChevronRight, PackageOpen, ArrowRight } from 'lucide-react'
import {
  useInventory, poOrderedValue, money, SubNav, S, inputStyle, Badge, poStatusColor,
  PartDetailCard, ManualPartEntry,
  // --- added: see inventory-store-additions.ts ---
  poIssues, qtyIssuedForItem, qtyRemainingForItem, poIssuedValue, poUnissuedValue,
  isFullyIssued, isAwaitingIssue, issueRecordValue, issueRig, rigsIssuedTo,
} from '../../../../lib/inventory-store'
import type { POStatus, LineItem, IssueRecord } from '../../../../lib/inventory-store'

type Filter = POStatus | 'All' | 'InStore'

const ISSUED = '#A855F7'

export default function PurchaseOrdersPage() {
  const { state, createPO, placeOrder, receivePO, issueItems } = useInventory()
  const [filterStatus, setFilterStatus] = useState<Filter>('All')
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [receiveId, setReceiveId] = useState<string | null>(null)
  const [issueId, setIssueId] = useState<string | null>(null)

  const filtered = state.purchaseOrders.filter(po =>
    filterStatus === 'All' ? true : filterStatus === 'InStore' ? isAwaitingIssue(po) : po.status === filterStatus
  )

  const statusCards: { key: Filter; label: string; count: number; c: { color: string; bg: string; border: string } }[] = [
    ...(['Draft', 'Ordered', 'Received'] as POStatus[]).map(s => ({
      key: s as Filter,
      label: s,
      count: state.purchaseOrders.filter(p => p.status === s).length,
      c: poStatusColor[s],
    })),
    {
      key: 'InStore',
      label: 'In store',
      count: state.purchaseOrders.filter(isAwaitingIssue).length,
      c: { color: ISSUED, bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' },
    },
  ]

  const receiveTarget = state.purchaseOrders.find(p => p.id === receiveId) || null
  const issueTarget = state.purchaseOrders.find(p => p.id === issueId) || null
  const valueInStore = state.purchaseOrders.filter(isAwaitingIssue).reduce((s, po) => s + poUnissuedValue(po), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Purchase Orders</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Order it, receive it, issue it to the rig — Finance counts the cost on the day it&apos;s issued</p>
        </div>
        <SubNav active="Purchase Orders" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {statusCards.map(({ key, label, count, c }) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'All' : key)} style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: filterStatus === key ? c.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${filterStatus === key ? c.border : '#1E293B'}` }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: filterStatus === key ? c.color : '#F8FAFC' }}>{count}</div>
            <div style={{ fontSize: 11, color: filterStatus === key ? c.color : '#64748B', fontWeight: 600, marginTop: 2 }}>
              {label}{key === 'InStore' && count > 0 ? ` · ${money(valueInStore)}` : ''}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
          <Plus size={14} /> New Purchase Order
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
            {filterStatus === 'InStore' ? 'Nothing waiting in the store — every received order has been issued.' : 'No purchase orders found.'}
          </div>
        )}
        {filtered.map(po => {
          const total = poOrderedValue(po)
          const issuedValue = poIssuedValue(po)
          const supplier = state.suppliers.find(s => s.id === po.supplierId)
          const isExpanded = expanded === po.id
          const received = po.status === 'Received'
          const fullyIssued = isFullyIssued(po)
          const pct = total > 0 ? Math.round((issuedValue / total) * 100) : 0

          return (
            <div key={po.id} style={{ ...S.card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : po.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>{po.poNumber}</span>
                    <Badge text={po.status} c={poStatusColor[po.status]} />
                    {rigsIssuedTo(po).map(r => (
                      <span key={r} style={{ fontSize: 11, fontWeight: 700, color: '#F97316', padding: '2px 8px', borderRadius: 5, background: 'rgba(249,115,22,0.08)' }}>{r}</span>
                    ))}
                    {received && fullyIssued && <Badge text="Issued" c={{ color: ISSUED, bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' }} />}
                    {received && !fullyIssued && issuedValue > 0 && <Badge text={`${pct}% issued`} c={{ color: ISSUED, bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' }} />}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{supplier?.name} · {po.project}</div>
                  {po.receivedBy && <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>✓ Received by {po.receivedBy} on {po.receivedDate}</div>}
                  {received && issuedValue > 0 && (
                    <div style={{ fontSize: 11, color: ISSUED, marginTop: 2 }}>
                      → {money(issuedValue)} issued{!fullyIssued && ` · ${money(poUnissuedValue(po))} still in store`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>{money(total)}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{po.items.length} item(s)</div>
                </div>
                {po.status === 'Draft' && <button onClick={e => { e.stopPropagation(); placeOrder(po.id) }} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Place Order</button>}
                {po.status === 'Ordered' && <button onClick={e => { e.stopPropagation(); setReceiveId(po.id) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><Truck size={12} /> Receive</button>}
                {received && !fullyIssued && <button onClick={e => { e.stopPropagation(); setIssueId(po.id) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: ISSUED, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><PackageOpen size={12} /> Issue stock</button>}
                <ChevronRight size={16} style={{ color: '#64748B', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid #1E293B' }}>
                  <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
                    {po.items.map((it, i) => {
                      const issued = qtyIssuedForItem(po, i)
                      const remaining = qtyRemainingForItem(po, i)
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                            <span style={{ color: it.qtyReceived >= it.qty ? '#10B981' : '#64748B' }}>
                              Qty {it.qty} {it.unit}{it.qtyReceived >= it.qty ? ' · Received' : ''}
                            </span>
                            {received && (
                              <span style={{ color: issued > 0 ? ISSUED : '#64748B' }}>
                                · Issued {issued}/{it.qty}{remaining > 0 ? ` · ${remaining} in store` : ''}
                              </span>
                            )}
                          </div>
                          <PartDetailCard item={it} />
                        </div>
                      )
                    })}
                  </div>

                  {poIssues(po).length > 0 && (
                    <div style={{ borderTop: '1px solid #1E293B', padding: '14px 20px' }}>
                      <div style={{ ...S.label, marginBottom: 10 }}>Issue history</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {poIssues(po).map(rec => (
                          <div key={rec.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderRadius: 10, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <PackageOpen size={13} style={{ color: ISSUED, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: '#F8FAFC', fontWeight: 600 }}>
                                {rec.lines.map(l => `${l.qty} ${po.items[l.itemIndex]?.unit ?? ''} ${po.items[l.itemIndex]?.name ?? 'item'}`).join(' · ')}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                                {rec.date} · <span style={{ color: '#F97316', fontWeight: 700 }}>{issueRig(po, rec)}</span> · issued by {rec.issuedBy}
                              </div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: ISSUED, fontFamily: 'monospace' }}>{money(issueRecordValue(po, rec))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showNew && <NewPOModal onClose={() => setShowNew(false)} onSave={createPO} />}
      {receiveTarget && <ReceiveModal po={receiveTarget} onClose={() => setReceiveId(null)} onConfirm={(by, onTime, quality) => { receivePO(receiveTarget.id, by, onTime, quality); setReceiveId(null) }} />}
      {issueTarget && <IssueModal po={issueTarget} onClose={() => setIssueId(null)} onConfirm={rec => { issueItems(issueTarget.id, rec); setIssueId(null) }} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Issue to rig
// ---------------------------------------------------------------------------

function IssueModal({ po, onClose, onConfirm }: { po: any; onClose: () => void; onConfirm: (rec: Omit<IssueRecord, 'id'>) => void }) {
  const { state } = useInventory()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [rig, setRig] = useState<string>('')
  const [by, setBy] = useState('')
  const [qtys, setQtys] = useState<number[]>(po.items.map((_: LineItem, i: number) => qtyRemainingForItem(po, i)))
  const [error, setError] = useState('')

  // Rigs currently working this project. Includes the PO's rig only if it's a
  // legacy order raised before the rig moved to the issue.
  const projectRigs = state.projects.find(p => p.name === po.project)?.rigs ?? []
  const rigOptions: string[] = Array.from(new Set([...projectRigs, po.rig].filter(Boolean)))

  // One rig on the project means there's nothing to choose — pick it.
  useEffect(() => { if (!rig && rigOptions.length === 1) setRig(rigOptions[0]) }, [rig, rigOptions])

  const setQty = (i: number, v: number) => setQtys(prev => prev.map((q, j) => (j === i ? v : q)))
  const value = po.items.reduce((s: number, it: LineItem, i: number) => s + (qtys[i] || 0) * it.unitCost, 0)
  const monthLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const beforeReceipt = po.receivedDate && date < po.receivedDate

  const confirm = () => {
    if (!rig) return setError('Choose which rig this stock is going to.')
    if (!by.trim()) return setError('Enter who is issuing this stock.')
    if (!date) return setError('Pick the date the stock left the store.')
    const over = po.items.findIndex((_: LineItem, i: number) => (qtys[i] || 0) > qtyRemainingForItem(po, i))
    if (over >= 0) return setError(`Only ${qtyRemainingForItem(po, over)} ${po.items[over].unit} of ${po.items[over].name} left in store.`)
    const lines = qtys.map((qty, itemIndex) => ({ itemIndex, qty })).filter(l => l.qty > 0)
    if (lines.length === 0) return setError('Enter a quantity for at least one item.')
    onConfirm({ date, rig, issuedBy: by.trim(), lines })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>Issue stock</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 18 }}>{po.poNumber} · {po.project}</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Issue to rig *</div>
          {rigOptions.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rigOptions.map(r => (
                <button key={r} onClick={() => { setRig(r); setError('') }} style={{ padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: rig === r ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${rig === r ? 'rgba(168,85,247,0.45)' : '#1E293B'}`, color: rig === r ? ISSUED : '#94A3B8' }}>
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ ...inputStyle, color: '#EF4444' }}>No rigs assigned to this project</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Date issued *</div>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setError('') }} style={{ ...inputStyle, cursor: 'pointer' }} />
          </div>
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Issued by *</div>
            <input value={by} onChange={e => { setBy(e.target.value); setError('') }} placeholder="Store keeper name" style={inputStyle} />
          </div>
        </div>

        <div style={{ ...S.label, marginBottom: 8 }}>Quantity leaving the store</div>
        <div style={{ border: '1px solid #1E293B', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }}>
          {po.items.map((it: LineItem, i: number) => {
            const remaining = qtyRemainingForItem(po, i)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < po.items.length - 1 ? '1px solid rgba(30,41,59,0.4)' : 'none', opacity: remaining === 0 ? 0.45 : 1 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#F8FAFC', fontWeight: 600 }}>{it.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {remaining} {it.unit} in store · {money(it.unitCost)} each
                  </div>
                </div>
                <input
                  type="number" min={0} max={remaining} value={qtys[i]} disabled={remaining === 0}
                  onChange={e => { setQty(i, Math.max(0, parseFloat(e.target.value) || 0)); setError('') }}
                  style={{ ...inputStyle, width: 90, textAlign: 'right', fontWeight: 700, color: (qtys[i] || 0) > 0 ? ISSUED : '#64748B' }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ padding: '11px 14px', borderRadius: 10, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
              Lands on <strong style={{ color: '#F97316' }}>{rig || '—'}</strong> cost for <ArrowRight size={11} /> <strong style={{ color: '#F8FAFC' }}>{monthLabel}</strong>
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: ISSUED, fontFamily: 'monospace' }}>{money(value)}</span>
          </div>
        </div>

        {beforeReceipt && (
          <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 12 }}>
            This date is before the stock was received on {po.receivedDate}. Change it if that isn&apos;t right.
          </div>
        )}
        {error && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={confirm} style={{ flex: 2, padding: 12, borderRadius: 10, background: `linear-gradient(135deg,${ISSUED},#7E22CE)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Issue to {rig || 'rig'}</button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Unchanged below
// ---------------------------------------------------------------------------

function NewPOModal({ onClose, onSave }: { onClose: () => void; onSave: (po: any, status: 'Draft' | 'Ordered') => void }) {
  const { state } = useInventory()
  const [supplierId, setSupplierId] = useState(state.suppliers[0].id)
  const [project, setProject] = useState(state.projects[0].name)
  const [items, setItems] = useState<LineItem[]>([])
  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0)
  const removeItem = (i: number) => setItems(prev => prev.filter((_, j) => j !== i))

  const save = (status: 'Draft' | 'Ordered') => { if (items.length === 0) return; onSave({ supplierId, project, orderDate: new Date().toISOString().split('T')[0], items }, status); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 620, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>New Purchase Order</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Supplier</div><select value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Project</div><select value={project} onChange={e => setProject(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 18 }}>You&apos;ll choose the rig when the stock is issued from the store.</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Add a part (typed manually — no catalogue lookup)</div>
          <ManualPartEntry onAdd={item => setItems(prev => [...prev, item])} />
        </div>

        {items.length > 0 && (
          <div style={{ marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ ...S.label }}>Line items</div>
            {items.map((it, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <button onClick={() => removeItem(i)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, color: '#EF4444', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                <div style={{ fontSize: 11, color: '#F97316', fontWeight: 700, marginBottom: 4 }}>Qty {it.qty} × {money(it.unitCost)} = {money(it.qty * it.unitCost)}</div>
                <PartDetailCard item={it} />
              </div>
            ))}
            <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#F97316' }}>Total: {money(total)}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => save('Draft')} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', color: '#94A3B8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Draft</button>
          <button onClick={() => save('Ordered')} style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Place Order →</button>
        </div>
      </div>
    </div>
  )
}

function ReceiveModal({ po, onClose, onConfirm }: { po: any; onClose: () => void; onConfirm: (by: string, onTime: boolean, quality: 'ok' | 'minor' | 'rejected') => void }) {
  const [by, setBy] = useState('')
  const [onTime, setOnTime] = useState<boolean | null>(null)
  const [quality, setQuality] = useState<'ok' | 'minor' | 'rejected'>('ok')
  const [error, setError] = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 440 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', marginBottom: 4 }}>Confirm Receipt</div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 18 }}>{po.poNumber} · {po.project} — marks the full order as received into the store</div>

        <div style={{ border: '1px solid #1E293B', borderRadius: 10, marginBottom: 18, overflow: 'hidden' }}>
          {po.items.map((it: LineItem, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
              <span style={{ fontSize: 12, color: '#F8FAFC' }}>{it.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{it.qty} {it.unit}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}><div style={{ ...S.label, marginBottom: 6 }}>Received By *</div><input value={by} onChange={e => { setBy(e.target.value); setError(false) }} style={inputStyle} /></div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>On time?</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setOnTime(true)} style={{ flex: 1, padding: 11, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: onTime === true ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${onTime === true ? 'rgba(16,185,129,0.4)' : '#1E293B'}`, color: onTime === true ? '#10B981' : '#94A3B8' }}>Yes</button>
            <button onClick={() => setOnTime(false)} style={{ flex: 1, padding: 11, borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: onTime === false ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${onTime === false ? 'rgba(239,68,68,0.35)' : '#1E293B'}`, color: onTime === false ? '#EF4444' : '#94A3B8' }}>No</button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Quality</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['ok', 'minor', 'rejected'] as const).map(q => <button key={q} onClick={() => setQuality(q)} style={{ flex: 1, padding: '9px 6px', borderRadius: 10, fontWeight: 600, fontSize: 11, cursor: 'pointer', background: quality === q ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${quality === q ? 'rgba(245,158,11,0.4)' : '#1E293B'}`, color: quality === q ? '#F59E0B' : '#94A3B8' }}>{q === 'ok' ? 'No Issues' : q === 'minor' ? 'Minor' : 'Rejected'}</button>)}
          </div>
        </div>

        {error && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 12 }}>Enter your name and select on-time status.</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (!by.trim() || onTime === null) { setError(true); return } onConfirm(by, onTime, quality) }} style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Confirm Receipt</button>
        </div>
      </div>
    </div>
  )
}
