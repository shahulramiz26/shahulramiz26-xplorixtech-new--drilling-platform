'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Save, Edit2, Check, X, Info, ChevronDown } from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ───────────────────────────────────────────────────────────────────
interface RigCost {
  id: string; rigName: string; project: string
  drillingRate: string; standbyRate: string; repairRate: string
  currency: string; editing?: boolean
}
interface ProjectContract {
  id: string; projectName: string; client: string
  contractType: 'meterage' | 'dayrate'
  // Meterage bands
  band1Rate: string; band1To: string
  band2Rate: string; band2From: string; band2To: string
  band3Rate: string; band3From: string
  // Day rate
  drillingDayRate: string; standbyDayRate: string; repairDayRate: string
  // One-time
  mobilisation: string; demobilisation: string
  editing?: boolean
}

const currencies = ['INR (₹)', 'USD ($)', 'AUD (A$)', 'CAD (C$)', 'ZAR (R)']

// ── SEED DATA ────────────────────────────────────────────────────────────────
const seedRigs: RigCost[] = [
  { id:'1', rigName:'KEM-1', project:'RS-01 - Chhindwara',   drillingRate:'9000', standbyRate:'4500', repairRate:'3000', currency:'INR (₹)' },
  { id:'2', rigName:'KEM-4', project:'CMP-MAD - Madheri',    drillingRate:'9000', standbyRate:'4500', repairRate:'3000', currency:'INR (₹)' },
  { id:'3', rigName:'KEM-5', project:'RS-01 - Chhindwara',   drillingRate:'9500', standbyRate:'4800', repairRate:'3200', currency:'INR (₹)' },
  { id:'4', rigName:'KEM-6', project:'DGMIL-BHK - Bhalukona',drillingRate:'9000', standbyRate:'4500', repairRate:'3000', currency:'INR (₹)' },
  { id:'5', rigName:'KEM-8', project:'RS-01 - Chhindwara',   drillingRate:'9500', standbyRate:'4800', repairRate:'3200', currency:'INR (₹)' },
  { id:'6', rigName:'KEM-9', project:'RS-01 - Chhindwara',   drillingRate:'9000', standbyRate:'4500', repairRate:'3000', currency:'INR (₹)' },
]

const seedContracts: ProjectContract[] = [
  {
    id:'1', projectName:'RS-01 - Chhindwara', client:'CMPDI',
    contractType:'meterage',
    band1Rate:'850', band1To:'200',
    band2Rate:'950', band2From:'200', band2To:'400',
    band3Rate:'1050', band3From:'400',
    drillingDayRate:'', standbyDayRate:'', repairDayRate:'',
    mobilisation:'250000', demobilisation:'150000',
  },
  {
    id:'2', projectName:'DGMIL-BHK - Bhalukona', client:'DGML',
    contractType:'meterage',
    band1Rate:'800', band1To:'200',
    band2Rate:'900', band2From:'200', band2To:'400',
    band3Rate:'1000', band3From:'400',
    drillingDayRate:'', standbyDayRate:'', repairDayRate:'',
    mobilisation:'200000', demobilisation:'120000',
  },
  {
    id:'3', projectName:'MECL-HIN - Bazar Gaon', client:'MECL',
    contractType:'dayrate',
    band1Rate:'', band1To:'200', band2Rate:'', band2From:'200', band2To:'400', band3Rate:'', band3From:'400',
    drillingDayRate:'28000', standbyDayRate:'12000', repairDayRate:'8000',
    mobilisation:'180000', demobilisation:'100000',
  },
]

// ── SUBNAV ───────────────────────────────────────────────────────────────────
function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4 }}>
      {[
        { href:'/admin/finance', label:'Dashboard' },
        { href:'/admin/finance/master-data', label:'Master Data' },
        { href:'/admin/finance/reports', label:'Cost Reports' },
      ].map(n=>(
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#3B82F6':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const iStyle: React.CSSProperties = { padding:'8px 10px', background:'#080B10', border:'1px solid #3B82F6', borderRadius:7, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit', width:'100%' }
const selStyle: React.CSSProperties = { ...iStyle, cursor:'pointer', appearance:'none' as any }

const S = {
  card: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, overflow:'hidden' as const },
  hdr:  { padding:'16px 24px', borderBottom:'1px solid #1E293B', display:'flex' as const, alignItems:'center' as const, justifyContent:'space-between' as const },
}

export default function MasterDataPage() {
  const { format } = useCurrency()
  const [rigs, setRigs] = useState<RigCost[]>(seedRigs)
  const [contracts, setContracts] = useState<ProjectContract[]>(seedContracts)
  const [saved, setSaved] = useState(false)

  const showSaved = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000) }

  // ── RIG HANDLERS ──
  const addRig = () => setRigs(r=>[...r,{ id:Date.now().toString(), rigName:'', project:'', drillingRate:'', standbyRate:'', repairRate:'', currency:'INR (₹)', editing:true }])
  const saveRig = (id:string) => setRigs(r=>r.map(x=>x.id===id?{...x,editing:false}:x))
  const editRig = (id:string) => setRigs(r=>r.map(x=>({...x,editing:x.id===id})))
  const deleteRig = (id:string) => setRigs(r=>r.filter(x=>x.id!==id))
  const updateRig = (id:string, field:keyof RigCost, val:string) => setRigs(r=>r.map(x=>x.id===id?{...x,[field]:val}:x))

  // ── CONTRACT HANDLERS ──
  const addContract = () => setContracts(c=>[...c,{
    id:Date.now().toString(), projectName:'', client:'', contractType:'meterage',
    band1Rate:'', band1To:'200', band2Rate:'', band2From:'200', band2To:'400', band3Rate:'', band3From:'400',
    drillingDayRate:'', standbyDayRate:'', repairDayRate:'',
    mobilisation:'', demobilisation:'', editing:true
  }])
  const saveContract = (id:string) => setContracts(c=>c.map(x=>x.id===id?{...x,editing:false}:x))
  const editContract = (id:string) => setContracts(c=>c.map(x=>({...x,editing:x.id===id})))
  const deleteContract = (id:string) => setContracts(c=>c.filter(x=>x.id!==id))
  const updateContract = (id:string, field:keyof ProjectContract, val:any) => setContracts(c=>c.map(x=>x.id===id?{...x,[field]:val}:x))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Finance &amp; Costing</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Set rig rates and contract pricing — powers all cost and revenue calculations</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <SubNav active="Master Data" />
          <button onClick={showSaved}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 20px', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.2s',
              background: saved ? '#10B981' : '#3B82F6', color:'#fff' }}>
            {saved ? <><Check size={15}/> Saved!</> : <><Save size={15}/> Save All</>}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderRadius:12, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.2)' }}>
        <Info size={15} style={{ color:'#60A5FA', marginTop:1, flexShrink:0 }} />
        <div style={{ fontSize:12, color:'#94A3B8' }}>
          <span style={{ color:'#F8FAFC', fontWeight:600 }}>Fluid &amp; Parts pricing</span> is managed in the{' '}
          <Link href="/admin/inventory/catalogue" style={{ color:'#60A5FA', fontWeight:600 }}>Inventory Parts Catalogue</Link>.
          {' '}Finance automatically reads prices from there — no duplicate entry needed.
        </div>
      </div>

      {/* ── TABLE 1: RIG COST MASTER ── */}
      <div style={S.card}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#F8FAFC' }}>Rig Cost Master</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:3 }}>Daily operating rates per rig — drilling, standby and repair rates</div>
          </div>
          <button onClick={addRig}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60A5FA', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Plus size={13}/> Add Rig
          </button>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              {['#','Rig Name','Project','Drilling Rate/Day','Standby Rate/Day','Repair Rate/Day','Currency',''].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rigs.map((row,i)=>(
              <tr key={row.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.015)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                <td style={{ padding:'10px 16px', color:'#64748B', fontSize:13 }}>{i+1}</td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing ? <input style={{...iStyle,width:90}} value={row.rigName} placeholder="KEM-1" onChange={e=>updateRig(row.id,'rigName',e.target.value)} />
                    : <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{row.rigName||'—'}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing ? <input style={{...iStyle,minWidth:150}} value={row.project} placeholder="Project name" onChange={e=>updateRig(row.id,'project',e.target.value)} />
                    : <span style={{ fontSize:12, color:'#94A3B8' }}>{row.project||'—'}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing ? <input style={{...iStyle,width:100}} type="number" value={row.drillingRate} placeholder="9000" onChange={e=>updateRig(row.id,'drillingRate',e.target.value)} />
                    : <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>₹{Number(row.drillingRate).toLocaleString()}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing ? <input style={{...iStyle,width:100}} type="number" value={row.standbyRate} placeholder="4500" onChange={e=>updateRig(row.id,'standbyRate',e.target.value)} />
                    : <span style={{ fontSize:13, fontWeight:700, color:'#F59E0B' }}>₹{Number(row.standbyRate).toLocaleString()}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing ? <input style={{...iStyle,width:100}} type="number" value={row.repairRate} placeholder="3000" onChange={e=>updateRig(row.id,'repairRate',e.target.value)} />
                    : <span style={{ fontSize:13, fontWeight:700, color:'#EF4444' }}>₹{Number(row.repairRate).toLocaleString()}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {row.editing
                    ? <select style={{...selStyle,width:100}} value={row.currency} onChange={e=>updateRig(row.id,'currency',e.target.value)}>
                        {currencies.map(c=><option key={c}>{c}</option>)}
                      </select>
                    : <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, background:'rgba(255,255,255,0.05)', color:'#64748B', border:'1px solid #1E293B' }}>{row.currency}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                    {row.editing
                      ? <>
                          <button onClick={()=>saveRig(row.id)} style={{ padding:6, borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', cursor:'pointer' }}><Check size={13}/></button>
                          <button onClick={()=>saveRig(row.id)} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={13}/></button>
                        </>
                      : <button onClick={()=>editRig(row.id)} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><Edit2 size={13}/></button>}
                    <button onClick={()=>deleteRig(row.id)} style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.1)', color:'rgba(239,68,68,0.5)', cursor:'pointer' }}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {rigs.length===0 && <tr><td colSpan={8} style={{ padding:'32px', textAlign:'center', color:'#64748B' }}>No rigs added yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── TABLE 2: PROJECT CONTRACT SETUP ── */}
      <div style={S.card}>
        <div style={S.hdr}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#F8FAFC' }}>Project Contract Rates</div>
            <div style={{ fontSize:12, color:'#64748B', marginTop:3 }}>Set contract type and billing rates per project — used to calculate revenue automatically</div>
          </div>
          <button onClick={addContract}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Plus size={13}/> Add Contract
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {contracts.map((c,i)=>(
            <div key={c.id} style={{ borderBottom:'1px solid #1E293B', padding:'20px 24px', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:16, alignItems:'start' }}>

                {/* Left — Project + Client + Contract Type */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Project</div>
                      {c.editing
                        ? <input style={iStyle} value={c.projectName} placeholder="RS-01 - Chhindwara" onChange={e=>updateContract(c.id,'projectName',e.target.value)} />
                        : <div style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>{c.projectName}</div>}
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>Client</div>
                      {c.editing
                        ? <input style={iStyle} value={c.client} placeholder="CMPDI" onChange={e=>updateContract(c.id,'client',e.target.value)} />
                        : <div style={{ fontSize:13, color:'#94A3B8' }}>{c.client}</div>}
                    </div>
                  </div>

                  {/* Contract Type toggle */}
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Contract Type</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {(['meterage','dayrate'] as const).map(type=>(
                        <button key={type} onClick={()=>c.editing && updateContract(c.id,'contractType',type)}
                          style={{ padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:c.editing?'pointer':'default', transition:'all 0.2s',
                            background: c.contractType===type ? (type==='meterage'?'rgba(249,115,22,0.15)':'rgba(59,130,246,0.15)') : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${c.contractType===type ? (type==='meterage'?'rgba(249,115,22,0.4)':'rgba(59,130,246,0.4)') : '#1E293B'}`,
                            color: c.contractType===type ? (type==='meterage'?'#F97316':'#60A5FA') : '#64748B',
                          }}>
                          {type==='meterage' ? '📏 Meterage (₹/m)' : '📅 Day Rate (₹/day)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle — Rates */}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {c.contractType==='meterage' ? (
                    <>
                      <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Depth Bands (₹ per meter)</div>
                      {[
                        { label:`Band 1: 0 – ${c.band1To}m`, field:'band1Rate' as const, color:'#10B981' },
                        { label:`Band 2: ${c.band2From} – ${c.band2To}m`, field:'band2Rate' as const, color:'#F59E0B' },
                        { label:`Band 3: ${c.band3From}m +`, field:'band3Rate' as const, color:'#F97316' },
                      ].map((band,j)=>(
                        <div key={j} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:11, color:'#64748B', whiteSpace:'nowrap', minWidth:110 }}>{band.label}</span>
                          {c.editing
                            ? <input style={{...iStyle,width:100}} type="number" value={(c as any)[band.field]} placeholder="850" onChange={e=>updateContract(c.id,band.field,e.target.value)} />
                            : <span style={{ fontSize:14, fontWeight:800, color:band.color, fontFamily:"'Space Grotesk',sans-serif" }}>₹{Number((c as any)[band.field]).toLocaleString()}/m</span>}
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>Day Rates</div>
                      {[
                        { label:'Drilling Rate', field:'drillingDayRate' as const, color:'#10B981' },
                        { label:'Standby Rate', field:'standbyDayRate' as const, color:'#F59E0B' },
                        { label:'Repair Rate', field:'repairDayRate' as const, color:'#EF4444' },
                      ].map((rate,j)=>(
                        <div key={j} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:11, color:'#64748B', whiteSpace:'nowrap', minWidth:110 }}>{rate.label}</span>
                          {c.editing
                            ? <input style={{...iStyle,width:100}} type="number" value={(c as any)[rate.field]} placeholder="28000" onChange={e=>updateContract(c.id,rate.field,e.target.value)} />
                            : <span style={{ fontSize:14, fontWeight:800, color:rate.color, fontFamily:"'Space Grotesk',sans-serif" }}>₹{Number((c as any)[rate.field]).toLocaleString()}/day</span>}
                        </div>
                      ))}
                    </>
                  )}

                  {/* One-time charges */}
                  <div style={{ paddingTop:10, borderTop:'1px solid #1E293B' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>One-time Charges</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[
                        { label:'Mobilisation', field:'mobilisation' as const },
                        { label:'Demobilisation', field:'demobilisation' as const },
                      ].map((charge,j)=>(
                        <div key={j}>
                          <div style={{ fontSize:10, color:'#64748B', marginBottom:4 }}>{charge.label}</div>
                          {c.editing
                            ? <input style={iStyle} type="number" value={(c as any)[charge.field]} placeholder="250000" onChange={e=>updateContract(c.id,charge.field,e.target.value)} />
                            : <span style={{ fontSize:13, fontWeight:700, color:'#8B5CF6' }}>₹{Number((c as any)[charge.field]).toLocaleString()}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right — Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', paddingTop:4 }}>
                  {c.editing
                    ? <>
                        <button onClick={()=>saveContract(c.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:12, fontWeight:700, cursor:'pointer' }}><Check size={13}/> Save</button>
                        <button onClick={()=>saveContract(c.id)} style={{ padding:'6px 14px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', fontSize:12, fontWeight:600, cursor:'pointer' }}>Cancel</button>
                      </>
                    : <button onClick={()=>editContract(c.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', fontSize:12, fontWeight:600, cursor:'pointer' }}><Edit2 size={13}/> Edit</button>}
                  <button onClick={()=>deleteContract(c.id)} style={{ padding:'6px 12px', borderRadius:9, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.1)', color:'rgba(239,68,68,0.5)', fontSize:11, cursor:'pointer' }}><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
          {contracts.length===0 && (
            <div style={{ padding:'40px', textAlign:'center', color:'#64748B' }}>No contracts set up yet. Click "Add Contract" to get started.</div>
          )}
        </div>
      </div>

      {/* Note about parts pricing */}
      <div style={{ padding:'16px 20px', borderRadius:12, background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.15)', display:'flex', alignItems:'flex-start', gap:12 }}>
        <span style={{ fontSize:16 }}>🔗</span>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'#10B981', marginBottom:4 }}>Parts &amp; Fluids pricing is connected from Inventory</div>
          <div style={{ fontSize:12, color:'#94A3B8' }}>
            When a store keeper issues parts from Stock Management, the cost is automatically pulled from the{' '}
            <Link href="/admin/inventory/catalogue" style={{ color:'#60A5FA' }}>Parts Catalogue</Link>{' '}
            and added to the project's cost in Finance. No manual entry needed.
          </div>
        </div>
      </div>

    </div>
  )
}


