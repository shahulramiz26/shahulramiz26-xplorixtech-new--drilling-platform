'use client'

import { useState } from 'react'
import { Plus, X, ArrowLeftRight } from 'lucide-react'
import { useInventory, SubNav, S, inputStyle, selectStyle, Badge, reqStatusColor } from '../../../../lib/inventory-store'
import type { ReqItem } from '../../../../lib/inventory-store'

export default function RequestsPage() {
  const { state, createRequest, setRequestStatus, convertToPO, createTransfer } = useInventory()
  const [tab, setTab] = useState<'requests' | 'transfers'>('requests')
  const [showReq, setShowReq] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [convertId, setConvertId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Requests & Transfers</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Raise part requests from a rig, move stock between projects, track both here</p>
        </div>
        <SubNav active="Requests & Transfers" />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['requests', 'transfers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === t ? 'linear-gradient(135deg,#F97316,#EA580C)' : 'rgba(255,255,255,0.04)', color: tab === t ? '#fff' : '#94A3B8', border: tab === t ? 'none' : '1px solid #1E293B' }}>
            {t === 'requests' ? `Part Requests (${state.requests.length})` : `Transfers (${state.transfers.length})`}
          </button>
        ))}
        <button onClick={() => tab === 'requests' ? setShowReq(true) : setShowTransfer(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={14} /> {tab === 'requests' ? 'New Request' : 'New Transfer'}
        </button>
      </div>

      {tab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.requests.length === 0 && <div style={{ ...S.card, padding: 40, textAlign: 'center', color: '#64748B' }}>No requests yet.</div>}
          {state.requests.map(r => (
            <div key={r.id} style={{ ...S.card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge text={r.urgency} c={{ color: r.urgency === 'Critical' ? '#EF4444' : r.urgency === 'Urgent' ? '#F59E0B' : '#10B981', bg: 'rgba(255,255,255,0.04)', border: '#1E293B' }} />
                    <Badge text={r.status} c={reqStatusColor[r.status]} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>{r.project.split(' - ')[0]} · {r.rig}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>By {r.requestedBy} · {r.date}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{r.reason}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {r.items.map((it, j) => <span key={j} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid #1E293B', color: '#94A3B8' }}>{it.name} × {it.qty} {it.unit}</span>)}
                  </div>
                </div>
                {r.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setRequestStatus(r.id, 'Approved')} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => setRequestStatus(r.id, 'Rejected')} style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                  </div>
                )}
                {r.status === 'Approved' && <button onClick={() => setConvertId(r.id)} style={{ padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Create PO →</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'transfers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.transfers.length === 0 && <div style={{ ...S.card, padding: 40, textAlign: 'center', color: '#64748B' }}>No transfers yet.</div>}
          {state.transfers.map(t => (
            <div key={t.id} style={{ ...S.card, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)' }}><ArrowLeftRight size={14} style={{ color: '#8B5CF6' }} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>{t.from.split(' - ')[0]} → {t.to.split(' - ')[0]}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{t.items.map(i => `${i.name} × ${i.qty}`).join(', ')} · {t.reason}</div>
              </div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: '#94A3B8' }}>By {t.by}</div><div style={{ fontSize: 10, color: '#64748B' }}>{t.date}</div></div>
            </div>
          ))}
        </div>
      )}

      {showReq && <RequestModal onClose={() => setShowReq(false)} onSave={createRequest} />}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} onSave={createTransfer} />}
      {convertId && <ConvertModal requestId={convertId} onClose={() => setConvertId(null)} onConvert={convertToPO} />}
    </div>
  )
}

function RequestModal({ onClose, onSave }: { onClose: () => void; onSave: (r: any) => void }) {
  const { state } = useInventory()
  const [requestedBy, setRequestedBy] = useState('')
  const [project, setProject] = useState(state.projects[0].name)
  const proj = state.projects.find(p => p.name === project)!
  const [rig, setRig] = useState(proj.rigs[0])
  const [urgency, setUrgency] = useState<'Normal' | 'Urgent' | 'Critical'>('Normal')
  const [reason, setReason] = useState('')
  const [partId, setPartId] = useState(state.parts[0].id)
  const [qty, setQty] = useState(1)
  const [items, setItems] = useState<ReqItem[]>([])
  const [error, setError] = useState('')

  const addItem = () => { const p = state.parts.find(p => p.id === partId)!; if (items.some(i => i.partId === partId)) return; setItems(prev => [...prev, { partId, name: p.name, qty, unit: p.unit }]) }

  const save = () => {
    if (!requestedBy.trim()) { setError('Enter your name'); return }
    if (items.length === 0) { setError('Add at least one part'); return }
    onSave({ requestedBy, project, rig, items, urgency, reason })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>Raise Part Request</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Requested By *</div><input value={requestedBy} onChange={e => setRequestedBy(e.target.value)} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><div style={{ ...S.label, marginBottom: 6 }}>Project</div><select value={project} onChange={e => { setProject(e.target.value); setRig(state.projects.find(p => p.name === e.target.value)!.rigs[0]) }} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
            <div><div style={{ ...S.label, marginBottom: 6 }}>Rig</div><select value={rig} onChange={e => setRig(e.target.value)} style={selectStyle}>{proj.rigs.map(r => <option key={r}>{r}</option>)}</select></div>
          </div>
          <div>
            <div style={{ ...S.label, marginBottom: 6 }}>Parts</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={partId} onChange={e => setPartId(e.target.value)} style={{ ...selectStyle, flex: 1 }}>{state.parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
              <button onClick={addItem} style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
            {items.length > 0 && <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>{items.map(it => <div key={it.partId} style={{ fontSize: 12, color: '#F8FAFC', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>{it.name} × {it.qty} {it.unit}</div>)}</div>}
          </div>
          <div>
            <div style={{ ...S.label, marginBottom: 8 }}>Urgency</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['Normal', 'Urgent', 'Critical'] as const).map(u => <button key={u} onClick={() => setUrgency(u)} style={{ flex: 1, padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: urgency === u ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${urgency === u ? 'rgba(249,115,22,0.4)' : '#1E293B'}`, color: urgency === u ? '#F97316' : '#64748B' }}>{u}</button>)}
            </div>
          </div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>Reason</div><input value={reason} onChange={e => setReason(e.target.value)} style={inputStyle} /></div>
        </div>
        {error && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Submit Request →</button>
        </div>
      </div>
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
  const [items, setItems] = useState<ReqItem[]>([])
  const [error, setError] = useState('')

  const addItem = () => { const p = state.parts.find(p => p.id === partId)!; setItems(prev => [...prev, { partId, name: p.name, qty, unit: p.unit }]) }
  const save = () => {
    if (!by.trim()) { setError('Enter your name'); return }
    if (from === to) { setError('From and To must differ'); return }
    if (items.length === 0) { setError('Add at least one part'); return }
    onSave({ from, to, items, by, reason })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>Transfer Between Projects</div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div><div style={{ ...S.label, marginBottom: 6 }}>From</div><select value={from} onChange={e => setFrom(e.target.value)} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
          <div><div style={{ ...S.label, marginBottom: 6 }}>To</div><select value={to} onChange={e => setTo(e.target.value)} style={selectStyle}>{state.projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 14 }}><div style={{ ...S.label, marginBottom: 6 }}>Transferred By *</div><input value={by} onChange={e => setBy(e.target.value)} style={inputStyle} /></div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Parts</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={partId} onChange={e => setPartId(e.target.value)} style={{ ...selectStyle, flex: 1 }}>{state.parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
            <button onClick={addItem} style={{ padding: '0 14px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6', fontWeight: 700, cursor: 'pointer' }}>Add</button>
          </div>
          {items.length > 0 && <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>{items.map((it, i) => <div key={i} style={{ fontSize: 12, color: '#F8FAFC', padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid #1E293B' }}>{it.name} × {it.qty} {it.unit}</div>)}</div>}
        </div>
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

function ConvertModal({ requestId, onClose, onConvert }: { requestId: string; onClose: () => void; onConvert: (id: string, supplierId: string) => void }) {
  const { state } = useInventory()
  const req = state.requests.find(r => r.id === requestId)!
  const [supplierId, setSupplierId] = useState(state.suppliers[0].id)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 28, width: 420 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Create Purchase Order</div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>{req.items.length} part(s) for {req.project.split(' - ')[0]}</div>
        <div style={{ ...S.label, marginBottom: 6 }}>Supplier</div>
        <select value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ ...selectStyle, marginBottom: 20 }}>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onConvert(requestId, supplierId); onClose() }} style={{ flex: 1, padding: 11, borderRadius: 9, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Create Draft PO</button>
        </div>
      </div>
    </div>
  )
}

