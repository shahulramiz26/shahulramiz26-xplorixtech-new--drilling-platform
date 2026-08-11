'use client'

import { useState } from 'react'
import { Plus, X, Phone } from 'lucide-react'
import { useInventory, supplierPerf, money, SubNav, S, inputStyle, selectStyle, StarRating } from '../../../../lib/inventory-store'

export default function SuppliersPage() {
  const { state, addSupplier } = useInventory()
  const [showAdd, setShowAdd] = useState(false)
  const [sortBy, setSortBy] = useState<'rank' | 'spend'>('rank')

  const ranked = [...state.suppliers]
    .map(s => ({ s, perf: supplierPerf(state, s.id) }))
    .sort((a, b) => sortBy === 'rank' ? b.perf.stars - a.perf.stars : b.perf.spend - a.perf.spend)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Suppliers</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Tracked and ranked automatically from actual receiving history</p>
        </div>
        <SubNav active="Suppliers" />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Sort by:</span>
        {(['rank', 'spend'] as const).map(k => (
          <button key={k} onClick={() => setSortBy(k)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: sortBy === k ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sortBy === k ? 'rgba(249,115,22,0.3)' : '#1E293B'}`, color: sortBy === k ? '#F97316' : '#64748B' }}>{k === 'rank' ? 'Ranking' : 'Total Spend'}</button>
        ))}
        <button onClick={() => setShowAdd(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
          <Plus size={14} /> Add Supplier
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ranked.map(({ s, perf }, rank) => (
          <div key={s.id} style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: rank === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: rank === 0 ? '#F59E0B' : '#64748B', flexShrink: 0 }}>#{rank + 1}</div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#64748B', display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}><span>{s.category}</span><span>·</span><Phone size={10} />{s.phone}</div>
            </div>
            <StarRating stars={perf.stars} size={14} />
            <div style={{ display: 'flex', gap: 18 }}>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{money(perf.spend)}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>SPEND</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: perf.onTimeRate >= 80 ? '#10B981' : '#F59E0B' }}>{perf.onTimeRate}%</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>ON-TIME</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 13, fontWeight: 700, color: '#60A5FA' }}>{perf.poCount}</div><div style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>POs</div></div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddSupplierModal onClose={() => setShowAdd(false)} onSave={addSupplier} />}
    </div>
  )
}

function AddSupplierModal({ onClose, onSave }: { onClose: () => void; onSave: (s: any) => void }) {
  const { state } = useInventory()
  const [name, setName] = useState('')
  const categories = Array.from(new Set(state.parts.map(p => p.category)))
  const [category, setCategory] = useState(categories[0])
  const [customCategory, setCustomCategory] = useState('')
  const [phone, setPhone] = useState('')
  const isOther = category === '__other__'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>Add Supplier</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Name *</div><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} /></div>
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Category</div>
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__other__">Other (type your own)</option>
            </select>
            {isOther && <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Enter category name" style={{ ...inputStyle, marginTop: 8 }} />}
          </div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Phone</div><input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (!name.trim()) return; const finalCategory = isOther ? customCategory.trim() : category; if (!finalCategory) return; onSave({ name, category: finalCategory, phone, status: 'Active' }); onClose() }} style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Add Supplier</button>
        </div>
      </div>
    </div>
  )
}

