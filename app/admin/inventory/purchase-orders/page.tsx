'use client'

import { useState } from 'react'
import { Plus, X, Truck, ChevronRight } from 'lucide-react'
import { useInventory, poValue, money, SubNav, S, inputStyle, selectStyle, Badge, poStatusColor } from '../../../../lib/inventory-store'
import type { POStatus, POItem } from '../../../../lib/inventory-store'

export default function PurchaseOrdersPage() {
  const { state, createPO, receivePO } = useInventory()
  const [filterStatus, setFilterStatus] = useState<POStatus | 'All'>('All')
  const [showNew, setShowNew] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [receiveId, setReceiveId] = useState<string | null>(null)

  const filtered = state.purchaseOrders.filter(po => filterStatus === 'All' || po.status === filterStatus)
  const statusCounts = (['Draft', 'Ordered', 'Partially Received', 'Received'] as POStatus[]).map(s => ({ status: s, count: state.purchaseOrders.filter(p => p.status === s).length }))
  const receiveTarget = state.purchaseOrders.find(p => p.id === receiveId) || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Purchase Orders</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Create, track and receive — receiving updates stock and supplier ranking automatically</p>
        </div>
        <SubNav active="Purchase Orders" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {statusCounts.map(({ status, count }) => {
          const c = poStatusColor[status]
          return (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'All' : status)} style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: filterStatus === status ? c.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${filterStatus === status ? c.border : '#1E293B'}` }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: filterStatus === status ? c.color : '#F8FAFC' }}>{count}</div>
              <div style={{ fontSize: 11, color: filterStatus === status ? c.color : '#64748B', fontWeight: 600, marginTop: 2 }}>{status}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
          <Plus size={14} /> New Purchase Order
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && <div style={{ ...S.card, textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>No purchase orders found.</div>}
        {filtered.map(po => {
          const total = poValue(po)
          const supplier = state.suppliers.find(s => s.id === po.supplierId)
          const isExpanded = expanded === po.id
          const pending = po.status === 'Ordered' || po.status === 'Partially Received'
          return (
            <div key={po.id} style={{ ...S.card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : po.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>{po.poNumber}</span>
                    <Badge text={po.status} c={poStatusColor[po.status]} />
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{supplier?.name} · {po.project.split(' - ')[0]}</div>
                  {po.receivedBy && <div style={{ fontSize: 11, color: '#10B981', marginTop: 2 }}>✓ Received by {po.receivedBy} on {po.receivedDate}</div>}
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}><div style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>{money(total)}</div><div style={{ fontSize: 11, color: '#64748B' }}>{po.items.length} items</div></div>
                {pending && <button onClick={e => { e.stopPropagation(); setReceiveId(po.id) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}><Truck size={12} /> Receive</button>}
                <ChevronRight size={16} style={{ color: '#64748B', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
              </div>
              {isExpanded && (
                <div style={{ borderTop: '1px solid #1E293B' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead><tr style={{ background: 'rgba(255,255,255,0.02)' }}>{['Part', 'Unit', 'Qty', 'Received', 'Unit Cost', 'Amount'].map(h => <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, color: '#64748B', fontWeight: 700, borderBottom: '1px solid #1E293B' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {po.items.map((it, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: '#F8FAFC' }}>{it.name}</td>
                          <td style={{ padding: '10px 16px', color: '#64748B' }}>{it.unit}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: '#F8FAFC' }}>{it.qty}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: it.qtyReceived === it.qty ? '#10B981' : it.qtyReceived > 0 ? '#F59E0B' : '#64748B' }}>{it.qtyReceived}</td>
                          <td style={{ padding: '10px 16px', color: '#94A3B8' }}>{money(it.unitCost)}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: '#10B981' }}>{money(it.qty * it.unitCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showNew && <NewPOModal onClose={() => setShowNew(false)} onSave={createPO} />}
      {receiveTarget && <ReceiveModal po={receiveTarget} onClose={() => setReceiveId(null)} onConfirm={(by, onTime, quality) => { receivePO(receiveTarget.id, by, onTime, quality); setReceiveId(null) }} />}
    </div>
  )
}

function NewPOModal({ onClose, onSave }: { onClose: () => void; onSave: (po: any, status: 'Draft' | 'Ordered') => void }) {
  const { state } = useInventory()
  const [supplierId, setSupplierId] = useState(state.suppliers[0].id)
  const [project, setProject] = useState(state.projects[0].name)
  const [partId, setPartId] = useState(state.parts[0].id)
  const [qty, setQty] = useState(1)
  const [items, setItems] = useState<Omit<POItem, 'qtyReceived'>[]>([])

  const addItem = () => { const p = state.parts.find(p => p.id === partId)!; setItems(prev => [...prev, { partId, name: p.name, qty, unitCost: p.unitCost, unit: p.unit }]) }
  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0)
  const save = (status: 'Draft' | 'Ordered') => { if (items.length === 0) return; onSave({ supplierId, project, orderDate: new Date().toISOString().split('T')[0], items }, status); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>New Purchase Order</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Supplier</div><select value={supplierId} onChange={e => setSupplierId(e.target.value)} style={selectStyle}>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Project</div><select value={project} onChange={e => setProject(e.target.value)} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Line Items</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select value={partId} onChange={e => setPartId(e.target.value)} style={{ ...selectStyle, flex: 1 }}>{state.parts.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.unitCost)}</option>)}</select>
            <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
            <button onClick={addItem} style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
          {items.map((it, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B', marginBottom: 6, fontSize: 12 }}><span style={{ color: '#F8FAFC' }}>{it.name} × {it.qty}</span><span style={{ color: '#10B981', fontWeight: 700 }}>{money(it.qty * it.unitCost)}</span></div>)}
          {items.length > 0 && <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#F97316', marginTop: 8 }}>Total: {money(total)}</div>}
        </div>
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
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 18 }}>{po.poNumber} — updates stock in {po.project.split(' - ')[0]}</div>
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

