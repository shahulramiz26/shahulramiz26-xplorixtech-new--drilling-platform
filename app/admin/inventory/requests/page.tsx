'use client'

import { useState } from 'react'
import { Plus, X, ArrowLeftRight } from 'lucide-react'
import { useInventory, SubNav, S, inputStyle, selectStyle, PartDetailCard } from '../../../../lib/inventory-store'
import type { LineItem } from '../../../../lib/inventory-store'

export default function TransfersPage() {
  const { state, createTransfer } = useInventory()
  const [showNew, setShowNew] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Transfers</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Move parts between projects and keep a full history of every transfer</p>
        </div>
        <SubNav active="Transfers" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
          <Plus size={14} /> New Transfer
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.transfers.length === 0 && <div style={{ ...S.card, padding: 40, textAlign: 'center', color: '#64748B' }}>No transfers yet.</div>}
        {state.transfers.map(t => (
          <div key={t.id} style={{ ...S.card, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)', flexShrink: 0 }}><ArrowLeftRight size={14} style={{ color: '#8B5CF6' }} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{t.from} → {t.to}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{t.reason}</div>
              </div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: '#94A3B8' }}>By {t.by}</div><div style={{ fontSize: 10, color: '#64748B' }}>{t.date}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
              {t.items.map((it, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700, marginBottom: 4 }}>Qty: {it.qty} {it.unit}</div>
                  <PartDetailCard item={it} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showNew && <TransferModal onClose={() => setShowNew(false)} onSave={createTransfer} />}
    </div>
  )
}

function TransferModal({ onClose, onSave }: { onClose: () => void; onSave: (t: any) => void }) {
  const { state } = useInventory()
  const [from, setFrom] = useState(state.projects[0].name)
  const [to, setTo] = useState(state.projects[1].name)
  const [by, setBy] = useState('')
  const [reason, setReason] = useState('')
  const [partId, setPartId] = useState(state.parts[0].id)
  const [qty, setQty] = useState(1)
  const [items, setItems] = useState<LineItem[]>([])
  const [error, setError] = useState('')

  const selectedPart = state.parts.find(p => p.id === partId)!

  const addItem = () => {
    if (items.some(i => i.partId === partId)) { setError('That part is already added'); return }
    setItems(prev => [...prev, { partId: selectedPart.id, partNumber: selectedPart.partNumber, name: selectedPart.name, category: selectedPart.category, manufacturer: selectedPart.manufacturer, unit: selectedPart.unit, unitCost: selectedPart.unitCost, qty }])
    setError('')
  }
  const removeItem = (pid: string) => setItems(prev => prev.filter(i => i.partId !== pid))

  const save = () => {
    if (!by.trim()) { setError('Enter who is transferring'); return }
    if (from === to) { setError('From and To must differ'); return }
    if (items.length === 0) { setError('Add at least one part'); return }
    onSave({ from, to, by, reason, items })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 600, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>Transfer Between Projects</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>From</div><select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>To</div><select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 14 }}><div style={{ ...S.label, marginBottom: 6 }}>Transferred By *</div><input value={by} onChange={e => setBy(e.target.value)} style={inputStyle} placeholder="Your name" /></div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Add a part</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <select value={partId} onChange={e => setPartId(e.target.value)} style={{ ...selectStyle, flex: 1 }}>{state.parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.partNumber})</option>)}</select>
            <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
            <button onClick={addItem} style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
          <PartDetailCard item={{ ...selectedPart, partId: selectedPart.id, qty: 1 }} />
        </div>

        {items.length > 0 && (
          <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ ...S.label }}>Parts on this transfer</div>
            {items.map(it => (
              <div key={it.partId} style={{ position: 'relative' }}>
                <button onClick={() => removeItem(it.partId)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, color: '#EF4444', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                <div style={{ fontSize: 11, color: '#8B5CF6', fontWeight: 700, marginBottom: 4 }}>Qty: {it.qty} {it.unit}</div>
                <PartDetailCard item={it} />
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 14 }}><div style={{ ...S.label, marginBottom: 6 }}>Reason</div><input value={reason} onChange={e => setReason(e.target.value)} style={inputStyle} /></div>
        {error && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Confirm Transfer</button>
        </div>
      </div>
    </div>
  )
}

