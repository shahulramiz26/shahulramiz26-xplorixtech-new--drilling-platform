'use client'

import { useState } from 'react'
import { ArrowLeft, Users, Truck, Circle, Search, Trash2, Plus, X, Target } from 'lucide-react'

type Personnel = { id: string; name: string; email: string; type: string; status: string }
type Rig = { id: string; name: string; type: string; status: string }
type Bit = { id: string; code: string; name: string; type: string; holeSize: string; status: string }
type Hole = { id: string; holeNumber: string; status: 'OPEN' | 'CLOSED' }
type Project = {
  id: number; name: string; code: string; location: string; client: string; status: string
  rigs: Rig[]; supervisors: Personnel[]; drillers: Personnel[]; bits: Bit[]; holes: Hole[]
}

interface Props {
  project: Project
  availableSupervisors: { id: string; name: string }[]
  availableDrillers: { id: string; name: string }[]
  availableRigs: { id: string; code: string; type: string }[]
  availableBits: { id: string; code: string; name: string; type: string; holeSize: string }[]
  onUpdate: (p: Project) => void
  onBack: () => void
}

export default function ManageResources({ project, availableSupervisors, availableDrillers, availableRigs, availableBits, onUpdate, onBack }: Props) {
  const [tab, setTab] = useState<'personnel'|'rigs'|'bits'|'holes'>('personnel')
  const [personnelTab, setPersonnelTab] = useState<'supervisors'|'drillers'>('supervisors')
  const [search, setSearch] = useState('')
  const [showNewSupervisorModal, setShowNewSupervisorModal] = useState(false)
  const [showNewDrillerModal, setShowNewDrillerModal] = useState(false)
  const [showNewRigModal, setShowNewRigModal] = useState(false)
  const [showNewBitModal, setShowNewBitModal] = useState(false)
  const [showNewHoleModal, setShowNewHoleModal] = useState(false)
  const [newSupForm, setNewSupForm] = useState({ name:'', email:'' })
  const [newDrillerForm, setNewDrillerForm] = useState({ name:'' })
  const [newRigForm, setNewRigForm] = useState({ code:'', type:'CORE' })
  const [newBitForm, setNewBitForm] = useState({ code:'', name:'', type:'SURFACE_SET', holeSize:'NQ' })
  const [newHoleForm, setNewHoleForm] = useState({ holeNumber:'' })

  const update = (changes: Partial<Project>) => onUpdate({ ...project, ...changes })

  const poolSups = availableSupervisors.filter(s => !project.supervisors.find(x=>x.id===s.id) && s.name.toLowerCase().includes(search.toLowerCase()))
  const poolDrillers = availableDrillers.filter(d => !project.drillers.find(x=>x.id===d.id) && d.name.toLowerCase().includes(search.toLowerCase()))
  const poolRigs = availableRigs.filter(r => !project.rigs.find(x=>x.id===r.id))
  const poolBits = availableBits.filter(b => !project.bits.find(x=>x.id===b.id))

  const assignSupervisor = (s:{id:string;name:string}) => update({ supervisors:[...project.supervisors,{id:s.id,name:s.name,email:'—',type:'SUPERVISOR',status:'ACTIVE'}] })
  const assignDriller    = (d:{id:string;name:string}) => update({ drillers:[...project.drillers,{id:d.id,name:d.name,email:'—',type:'DRILLER',status:'ACTIVE'}] })
  const removeSupervisor = (id:string) => update({ supervisors:project.supervisors.filter(s=>s.id!==id) })
  const removeDriller    = (id:string) => update({ drillers:project.drillers.filter(d=>d.id!==id) })
  const assignRig = (r:{id:string;code:string;type:string}) => update({ rigs:[...project.rigs,{id:r.id,name:r.code,type:r.type,status:'ACTIVE'}] })
  const removeRig = (id:string) => update({ rigs:project.rigs.filter(r=>r.id!==id) })
  const assignBit = (b:typeof availableBits[0]) => update({ bits:[...project.bits,{...b,status:'ACTIVE'}] })
  const removeBit = (id:string) => update({ bits:project.bits.filter(b=>b.id!==id) })
  const toggleHoleStatus = (id:string) => update({ holes:project.holes.map(h=>h.id===id?{...h,status:h.status==='OPEN'?'CLOSED':'OPEN' as const}:h) })
  const removeHole = (id:string) => update({ holes:project.holes.filter(h=>h.id!==id) })

  const addNewSupervisor = () => {
    if(!newSupForm.name.trim()) return
    update({ supervisors:[...project.supervisors,{id:Date.now().toString(),name:newSupForm.name.toUpperCase(),email:newSupForm.email||'—',type:'SUPERVISOR',status:'ACTIVE'}] })
    setNewSupForm({name:'',email:''}); setShowNewSupervisorModal(false)
  }
  const addNewDriller = () => {
    if(!newDrillerForm.name.trim()) return
    update({ drillers:[...project.drillers,{id:Date.now().toString(),name:newDrillerForm.name.toUpperCase(),email:'—',type:'DRILLER',status:'ACTIVE'}] })
    setNewDrillerForm({name:''}); setShowNewDrillerModal(false)
  }
  const addNewRig = () => {
    if(!newRigForm.code.trim()) return
    update({ rigs:[...project.rigs,{id:Date.now().toString(),name:newRigForm.code,type:newRigForm.type,status:'ACTIVE'}] })
    setNewRigForm({code:'',type:'CORE'}); setShowNewRigModal(false)
  }
  const addNewBit = () => {
    if(!newBitForm.code.trim()) return
    update({ bits:[...project.bits,{id:Date.now().toString(),...newBitForm,status:'ACTIVE'}] })
    setNewBitForm({code:'',name:'',type:'SURFACE_SET',holeSize:'NQ'}); setShowNewBitModal(false)
  }
  const addNewHole = () => {
    if(!newHoleForm.holeNumber.trim()) return
    if(project.holes.find(h=>h.holeNumber===newHoleForm.holeNumber)) return
    update({ holes:[...(project.holes||[]),{id:Date.now().toString(),holeNumber:newHoleForm.holeNumber.toUpperCase(),status:'OPEN'}] })
    setNewHoleForm({holeNumber:''}); setShowNewHoleModal(false)
  }

  // ── STYLES ──
  const card: React.CSSProperties = { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16, padding:20 }
  const iStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#080B10', border:'1px solid #1E293B', borderRadius:9, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }
  const selStyle: React.CSSProperties = { ...iStyle, cursor:'pointer', appearance:'none' as any }
  const label11: React.CSSProperties = { fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }
  const thStyle: React.CSSProperties = { padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.08em', textTransform:'uppercase' }
  const tdStyle: React.CSSProperties = { padding:'10px 14px', fontSize:13 }

  const tabBtn = (active:boolean, color='#F97316'): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:10,
    fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s', border:'none',
    background: active ? color : 'transparent',
    color: active ? '#fff' : '#94A3B8',
  })

  const Modal = ({ show, title, onClose, onSave, children }: any) => !show ? null : (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:1000 }}>
      <div style={{ width:'100%', maxWidth:460, padding:26, borderRadius:18, background:'#0D1117', border:'1px solid #1E293B', boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={15}/></button>
        </div>
        {children}
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancel</button>
          <button onClick={onSave} style={{ flex:2, padding:'10px', borderRadius:9, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' }}>Save →</button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, paddingBottom:40 }}>

      {/* Back + Title */}
      <div>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, color:'#94A3B8', background:'none', border:'none', cursor:'pointer', fontSize:13, marginBottom:12, padding:0 }}>
          <ArrowLeft size={15}/> Back to Projects
        </button>
        <div style={{ fontSize:24, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>{project.name}</div>
        <div style={{ fontSize:12, color:'#64748B', marginTop:4 }}>{project.code} · {project.location} · {project.client}</div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4, width:'fit-content' }}>
        {([
          { key:'personnel', icon:<Users size={14}/>,  label:'Personnel' },
          { key:'rigs',      icon:<Truck size={14}/>,  label:'Rigs'      },
          { key:'bits',      icon:<Circle size={14}/>, label:'Bits'      },
          { key:'holes',     icon:<Target size={14}/>, label:'Holes'     },
        ] as const).map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={tabBtn(tab===t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── PERSONNEL TAB ── */}
      {tab==='personnel' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Assign panel */}
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8' }}>Assign Personnel</div>
              <button onClick={()=>personnelTab==='supervisors'?setShowNewSupervisorModal(true):setShowNewDrillerModal(true)}
                style={{ display:'flex', alignItems:'center', gap:5, color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                <Plus size={13}/> New {personnelTab==='supervisors'?'Supervisor':'Driller'}
              </button>
            </div>
            {/* Sub-tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {(['supervisors','drillers'] as const).map(pt=>(
                <button key={pt} onClick={()=>{setPersonnelTab(pt);setSearch('')}}
                  style={{ padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', transition:'all 0.2s',
                    background: personnelTab===pt?(pt==='supervisors'?'#F97316':'#F59E0B'):'rgba(255,255,255,0.04)',
                    color: personnelTab===pt?'#fff':'#94A3B8' }}>
                  {pt==='supervisors'?'Supervisors':'Drillers'}
                </button>
              ))}
            </div>
            {/* Search */}
            <div style={{ position:'relative', marginBottom:12 }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name..."
                style={{...iStyle, paddingLeft:30}} />
            </div>
            {/* Pool */}
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {(personnelTab==='supervisors'?poolSups:poolDrillers).length===0
                ? <div style={{ textAlign:'center', padding:'16px', color:'#64748B', fontSize:12 }}>No available {personnelTab}</div>
                : (personnelTab==='supervisors'?poolSups:poolDrillers).map(p=>(
                  <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 4px', borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{p.name}</span>
                    <button onClick={()=>personnelTab==='supervisors'?assignSupervisor(p):assignDriller(p)}
                      style={{ color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:700 }}>Assign</button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Assigned table */}
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                  {['Name','Type','Email','Status',''].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[...project.supervisors,...project.drillers].length===0
                  ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign:'center', color:'#64748B', padding:'32px' }}>No personnel assigned yet</td></tr>
                  : [...project.supervisors,...project.drillers].map(p=>(
                    <tr key={p.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ ...tdStyle, fontWeight:700, color:'#F8FAFC' }}>{p.name}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20,
                          background: p.type==='SUPERVISOR'?'rgba(249,115,22,0.1)':'rgba(245,158,11,0.1)',
                          color: p.type==='SUPERVISOR'?'#F97316':'#F59E0B',
                          border: `1px solid ${p.type==='SUPERVISOR'?'rgba(249,115,22,0.2)':'rgba(245,158,11,0.2)'}` }}>
                          {p.type==='SUPERVISOR'?'👤':'⛏️'} {p.type}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color:'#94A3B8' }}>{p.email}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)' }}>
                          ● ACTIVE
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={()=>p.type==='SUPERVISOR'?removeSupervisor(p.id):removeDriller(p.id)}
                          style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer' }}><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── RIGS TAB ── */}
      {tab==='rigs' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8' }}>Assign Rig</div>
              <button onClick={()=>setShowNewRigModal(true)}
                style={{ display:'flex', alignItems:'center', gap:5, color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                <Plus size={13}/> New Rig
              </button>
            </div>
            <div style={{ maxHeight:180, overflowY:'auto' }}>
              {poolRigs.length===0
                ? <div style={{ textAlign:'center', padding:'16px', color:'#64748B', fontSize:12 }}>No available rigs</div>
                : poolRigs.map(r=>(
                  <div key={r.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 4px', borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{r.code}</span>
                      <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>{r.type}</span>
                    </div>
                    <button onClick={()=>assignRig(r)} style={{ color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:700 }}>Assign</button>
                  </div>
                ))
              }
            </div>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                  {['Rig Name','Type','Status',''].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {project.rigs.length===0
                  ? <tr><td colSpan={4} style={{ ...tdStyle, textAlign:'center', color:'#64748B', padding:'32px' }}>No rigs assigned yet</td></tr>
                  : project.rigs.map(r=>(
                    <tr key={r.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ ...tdStyle, fontWeight:700, color:'#F8FAFC', fontFamily:'monospace' }}>{r.name}</td>
                      <td style={{ ...tdStyle, color:'#94A3B8' }}>{r.type}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)' }}>● ACTIVE</span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={()=>removeRig(r.id)} style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer' }}><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BITS TAB ── */}
      {tab==='bits' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8' }}>Assign Bit</div>
              <button onClick={()=>setShowNewBitModal(true)}
                style={{ display:'flex', alignItems:'center', gap:5, color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                <Plus size={13}/> New Bit
              </button>
            </div>
            <div style={{ maxHeight:160, overflowY:'auto' }}>
              {poolBits.length===0
                ? <div style={{ textAlign:'center', padding:'16px', color:'#64748B', fontSize:12 }}>No available bits</div>
                : poolBits.map(b=>(
                  <div key={b.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 4px', borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:700, color:'#F8FAFC' }}>{b.code}</span>
                      <span style={{ fontSize:11, color:'#64748B', marginLeft:8 }}>{b.name} · {b.holeSize}</span>
                    </div>
                    <button onClick={()=>assignBit(b)} style={{ color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:700 }}>Assign</button>
                  </div>
                ))
              }
            </div>
          </div>
          <div style={{ ...card, padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
                  {['Code','Name','Type','Hole Size','Status',''].map(h=><th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {project.bits.length===0
                  ? <tr><td colSpan={6} style={{ ...tdStyle, textAlign:'center', color:'#64748B', padding:'32px' }}>No bits assigned yet</td></tr>
                  : project.bits.map(b=>(
                    <tr key={b.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td style={{ ...tdStyle, fontWeight:700, color:'#F8FAFC' }}>{b.code}</td>
                      <td style={{ ...tdStyle, color:'#94A3B8' }}>{b.name}</td>
                      <td style={{ ...tdStyle, color:'#94A3B8' }}>{b.type}</td>
                      <td style={{ ...tdStyle, color:'#94A3B8' }}>{b.holeSize}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)' }}>● ACTIVE</span>
                      </td>
                      <td style={tdStyle}>
                        <button onClick={()=>removeBit(b.id)} style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer' }}><Trash2 size={13}/></button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HOLES TAB ── */}
      {tab==='holes' && (
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>Hole Numbers</div>
              <div style={{ fontSize:11, color:'#64748B', marginTop:3 }}>Assigned holes appear in the Drilling Log dropdown</div>
            </div>
            <button onClick={()=>setShowNewHoleModal(true)}
              style={{ display:'flex', alignItems:'center', gap:5, color:'#F97316', background:'none', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>
              <Plus size={13}/> Add Hole
            </button>
          </div>
          {(project.holes||[]).length===0
            ? <div style={{ textAlign:'center', padding:'24px', color:'#64748B', fontSize:13 }}>No holes added yet</div>
            : (project.holes||[]).map(h=>(
              <div key={h.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>{h.holeNumber}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20,
                    background: h.status==='OPEN'?'rgba(16,185,129,0.1)':'rgba(100,116,139,0.1)',
                    color: h.status==='OPEN'?'#10B981':'#64748B',
                    border: `1px solid ${h.status==='OPEN'?'rgba(16,185,129,0.2)':'rgba(100,116,139,0.2)'}` }}>
                    ● {h.status}
                  </span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>toggleHoleStatus(h.id)}
                    style={{ padding:'5px 12px', borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:11, cursor:'pointer' }}>
                    {h.status==='OPEN'?'Mark Closed':'Reopen'}
                  </button>
                  <button onClick={()=>removeHole(h.id)} style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'none', color:'rgba(239,68,68,0.4)', cursor:'pointer' }}><Trash2 size={13}/></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── MODALS ── */}
      <Modal show={showNewSupervisorModal} title="Add New Supervisor" onClose={()=>setShowNewSupervisorModal(false)} onSave={addNewSupervisor}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={label11}>Full Name *</div><input style={iStyle} placeholder="Enter name" value={newSupForm.name} onChange={e=>setNewSupForm({...newSupForm,name:e.target.value})} /></div>
          <div><div style={label11}>Email (Optional)</div><input style={iStyle} placeholder="Enter email" value={newSupForm.email} onChange={e=>setNewSupForm({...newSupForm,email:e.target.value})} /></div>
        </div>
      </Modal>

      <Modal show={showNewDrillerModal} title="Add New Driller" onClose={()=>setShowNewDrillerModal(false)} onSave={addNewDriller}>
        <div><div style={label11}>Full Name *</div><input style={iStyle} placeholder="Enter name" value={newDrillerForm.name} onChange={e=>setNewDrillerForm({name:e.target.value})} /></div>
      </Modal>

      <Modal show={showNewRigModal} title="Add New Rig" onClose={()=>setShowNewRigModal(false)} onSave={addNewRig}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={label11}>Rig Code *</div><input style={iStyle} placeholder="e.g. KEM-15" value={newRigForm.code} onChange={e=>setNewRigForm({...newRigForm,code:e.target.value})} /></div>
          <div><div style={label11}>Type</div>
            <select style={selStyle} value={newRigForm.type} onChange={e=>setNewRigForm({...newRigForm,type:e.target.value})}>
              {['CORE','DTH','RC','BLAST_HOLE'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal show={showNewBitModal} title="Add New Bit" onClose={()=>setShowNewBitModal(false)} onSave={addNewBit}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><div style={label11}>Bit Code *</div><input style={iStyle} placeholder="e.g. SS-NQ-15/32" value={newBitForm.code} onChange={e=>setNewBitForm({...newBitForm,code:e.target.value})} /></div>
          <div><div style={label11}>Bit Name</div><input style={iStyle} placeholder="e.g. NQ S/S CORE BIT SR-15/32" value={newBitForm.name} onChange={e=>setNewBitForm({...newBitForm,name:e.target.value})} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><div style={label11}>Type</div>
              <select style={selStyle} value={newBitForm.type} onChange={e=>setNewBitForm({...newBitForm,type:e.target.value})}>
                {['SURFACE_SET','IMPREGNATED','PDC_CORE','DTH','TRICONE'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><div style={label11}>Hole Size</div>
              <select style={selStyle} value={newBitForm.holeSize} onChange={e=>setNewBitForm({...newBitForm,holeSize:e.target.value})}>
                {['NQ','HQ','PQ','BQ','AQ'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <Modal show={showNewHoleModal} title="Add Hole Number" onClose={()=>setShowNewHoleModal(false)} onSave={addNewHole}>
        <div>
          <div style={label11}>Hole Number *</div>
          <input style={iStyle} placeholder="e.g. H1, BH-001" value={newHoleForm.holeNumber} onChange={e=>setNewHoleForm({holeNumber:e.target.value})} />
          <div style={{ fontSize:11, color:'#64748B', marginTop:6 }}>This hole will appear in the Drilling Log dropdown for this project</div>
        </div>
      </Modal>

    </div>
  )
}

