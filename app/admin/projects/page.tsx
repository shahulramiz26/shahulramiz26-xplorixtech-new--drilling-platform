'use client'

import { useState } from 'react'
import { Plus, FolderOpen, MapPin, User, X, Settings } from 'lucide-react'
import ManageResources from './manage-resources'

type Hole = { id: string; holeNumber: string; status: 'OPEN' | 'CLOSED' }
type Personnel = { id: string; name: string; email: string; type: string; status: string }
type Rig = { id: string; name: string; type: string; status: string }
type Bit = { id: string; code: string; name: string; type: string; holeSize: string; status: string }
type Project = {
  id: number; name: string; code: string; location: string; client: string; status: string
  rigs: Rig[]; supervisors: Personnel[]; drillers: Personnel[]; bits: Bit[]; holes: Hole[]
}

const initialProjects: Project[] = [
  { id:1, name:'RS-01 Chhindwara', code:'RS-01', location:'Chhindwara, Madhya Pradesh', client:'CMPDI', status:'ACTIVE',
    rigs:[{id:'KEM-1',name:'KEM-1',type:'CORE',status:'ACTIVE'},{id:'KEM-5',name:'KEM-5',type:'CORE',status:'ACTIVE'},{id:'KEM-8',name:'KEM-8',type:'CORE',status:'ACTIVE'}],
    supervisors:[{id:'s1',name:'SUKANTA MUKHERJEE',email:'—',type:'SUPERVISOR',status:'ACTIVE'}],
    drillers:[{id:'d1',name:'SIYARAM PATEL',email:'—',type:'DRILLER',status:'ACTIVE'},{id:'d2',name:'BRAJA NAYAK',email:'—',type:'DRILLER',status:'ACTIVE'}],
    bits:[{id:'b1',code:'NQ-CB-SR06',name:'NQ Core Bit SR-06',type:'SURFACE_SET',holeSize:'NQ',status:'ACTIVE'}],
    holes:[{id:'h1',holeNumber:'BH-001',status:'OPEN'},{id:'h2',holeNumber:'BH-002',status:'OPEN'}]
  },
  { id:2, name:'CMP-MAD Madheri', code:'CMP-MAD', location:'Madheri, Chhattisgarh', client:'CMPDI', status:'ACTIVE',
    rigs:[{id:'KEM-4',name:'KEM-4',type:'CORE',status:'ACTIVE'}],
    supervisors:[{id:'s2',name:'RAJESH KUMAR NAYAK',email:'—',type:'SUPERVISOR',status:'ACTIVE'}],
    drillers:[{id:'d3',name:'DEERAJ KEWAT',email:'—',type:'DRILLER',status:'ACTIVE'}],
    bits:[], holes:[]
  },
  { id:3, name:'DGMIL-BHK Bhalukona', code:'DGMIL-BHK', location:'Bhalukona, Odisha', client:'DGML', status:'ACTIVE',
    rigs:[{id:'KEM-6',name:'KEM-6',type:'CORE',status:'ACTIVE'}],
    supervisors:[{id:'s3',name:'BINDER MAAN',email:'—',type:'SUPERVISOR',status:'ACTIVE'}],
    drillers:[{id:'d4',name:'FIROZ SEKH',email:'—',type:'DRILLER',status:'ACTIVE'}],
    bits:[], holes:[]
  },
  { id:4, name:'CMPDI-DAM Bokaro', code:'CMPDI-DAM', location:'Bokaro, Jharkhand', client:'CMPDI', status:'ACTIVE',
    rigs:[{id:'KEM-9',name:'KEM-9',type:'CORE',status:'ACTIVE'}],
    supervisors:[], drillers:[], bits:[], holes:[]
  },
  { id:5, name:'PAT-CMPDI Pathakuri', code:'PAT-CMPDI', location:'Pathakuri, Assam', client:'CMPDI', status:'ACTIVE',
    rigs:[], supervisors:[], drillers:[], bits:[], holes:[]
  },
  { id:6, name:'MECL-HIN Bazar Gaon', code:'MECL-HIN', location:'Bazar Gaon, Assam', client:'MECL', status:'ON_HOLD',
    rigs:[], supervisors:[], drillers:[], bits:[], holes:[]
  },
]

const availableSupervisors = [
  {id:'as1',name:'SUKANTA MUKHERJEE'},{id:'as2',name:'RAJESH KUMAR NAYAK'},
  {id:'as3',name:'BINDER MAAN'},{id:'as4',name:'JAHID KHAN'},
  {id:'as5',name:'GULAB PATIL'},{id:'as6',name:'ANIL KUMAR'},
  {id:'as7',name:'NAGEN MAHAKHUD'},{id:'as8',name:'MOHAMMAD AFZAL ANSARI'},
]
const availableDrillers = [
  {id:'ad1',name:'SIYARAM PATEL'},{id:'ad2',name:'BRAJA NAYAK'},
  {id:'ad3',name:'DEERAJ KEWAT'},{id:'ad4',name:'FIROZ SEKH'},
  {id:'ad5',name:'HABIB SHEKH'},{id:'ad6',name:'MANOJ NAYAK'},
]
const availableRigs = [
  {id:'ar1',code:'KEM-2',type:'CORE'},{id:'ar2',code:'KEM-3',type:'CORE'},
  {id:'ar3',code:'KEM-7',type:'CORE'},{id:'ar4',code:'KEM-10',type:'DTH'},
]
const availableBits = [
  {id:'ab1',code:'NQ-CB-SR06',name:'NQ Core Bit SR-06',type:'SURFACE_SET',holeSize:'NQ'},
  {id:'ab2',code:'HQ-CB-SR08',name:'HQ Core Bit SR-08',type:'SURFACE_SET',holeSize:'HQ'},
  {id:'ab3',code:'NQ-CB-SR10',name:'NQ Core Bit SR-10',type:'IMPREGNATED',holeSize:'NQ'},
  {id:'ab4',code:'HQ-CB-SR12',name:'HQ Core Bit SR-12',type:'IMPREGNATED',holeSize:'HQ'},
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project|null>(null)
  const [formData, setFormData] = useState({ name:'', code:'', location:'', client:'', status:'ACTIVE' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProjects([...projects,{ id:projects.length+1, ...formData, rigs:[], supervisors:[], drillers:[], bits:[], holes:[] }])
    setShowModal(false)
    setFormData({ name:'', code:'', location:'', client:'', status:'ACTIVE' })
  }

  const handleUpdateProject = (updated: Project) => {
    setProjects(projects.map(p=>p.id===updated.id?updated:p))
    setSelectedProject(updated)
  }

  if (selectedProject) {
    const fresh = projects.find(p=>p.id===selectedProject.id) || selectedProject
    return (
      <ManageResources
        project={fresh}
        availableSupervisors={availableSupervisors}
        availableDrillers={availableDrillers}
        availableRigs={availableRigs}
        availableBits={availableBits}
        onUpdate={handleUpdateProject}
        onBack={()=>setSelectedProject(null)}
      />
    )
  }

  const iStyle: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#080B10', border:'1px solid #1E293B', borderRadius:9, color:'#F8FAFC', fontSize:13, outline:'none', fontFamily:'inherit' }
  const selStyle: React.CSSProperties = { ...iStyle, cursor:'pointer', appearance:'none' as any }
  const label11: React.CSSProperties = { fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }

  const activeCount = projects.filter(p=>p.status==='ACTIVE').length
  const totalRigs   = projects.reduce((s,p)=>s+p.rigs.length,0)
  const totalStaff  = projects.reduce((s,p)=>s+p.supervisors.length+p.drillers.length,0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28, paddingBottom:40 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Projects</h1>
          <p style={{ fontSize:13, color:'#94A3B8', marginTop:4 }}>Manage your drilling projects and allocate resources</p>
        </div>
        <button onClick={()=>setShowModal(true)}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:12, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.35)' }}>
          <Plus size={18}/> New Project
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { label:'Active Projects', value:activeCount,  color:'#10B981', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.15)',  icon:'🟢' },
          { label:'Total Rigs',      value:totalRigs,    color:'#F97316', bg:'rgba(249,115,22,0.08)',  border:'rgba(249,115,22,0.15)',  icon:'⚙️' },
          { label:'Total Personnel', value:totalStaff,   color:'#3B82F6', bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.15)',  icon:'👷' },
        ].map((k,i)=>(
          <div key={i} style={{ padding:'18px 20px', borderRadius:14, background:k.bg, border:`1px solid ${k.border}` }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>{k.label}</div>
            <div style={{ fontSize:28, fontWeight:800, color:k.color, fontFamily:"'Space Grotesk',sans-serif" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Projects Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {projects.map(project=>(
          <div key={project.id}
            style={{ padding:22, borderRadius:16, background:'#0D1117', border:'1px solid #1E293B', transition:'border-color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.3)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}>

            {/* Card Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(249,115,22,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FolderOpen size={22} style={{ color:'#F97316' }} />
              </div>
              <span style={{
                fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:20,
                background: project.status==='ACTIVE'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)',
                color: project.status==='ACTIVE'?'#10B981':'#F59E0B',
                border: `1px solid ${project.status==='ACTIVE'?'rgba(16,185,129,0.25)':'rgba(245,158,11,0.25)'}`,
              }}>{project.status==='ACTIVE'?'Active':'On Hold'}</span>
            </div>

            <div style={{ fontSize:15, fontWeight:700, color:'#F8FAFC', marginBottom:4 }}>{project.name}</div>
            <div style={{ fontSize:11, color:'#64748B', fontFamily:'monospace', marginBottom:10 }}>{project.code}</div>

            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#94A3B8', marginBottom:6 }}>
              <MapPin size={13} style={{ color:'#64748B' }}/> {project.location}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#94A3B8', marginBottom:16 }}>
              <User size={13} style={{ color:'#64748B' }}/> Client: <span style={{ color:'#F97316', fontWeight:600 }}>{project.client}</span>
            </div>

            <button onClick={()=>setSelectedProject(project)}
              style={{ width:'100%', padding:'9px', borderRadius:9, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.15)', color:'#F97316', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:16, transition:'background 0.15s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.15)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.08)'}>
              <Settings size={13}/> Manage Resources
            </button>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, paddingTop:14, borderTop:'1px solid #1E293B' }}>
              {[
                { label:'Rigs',        value:project.rigs.length        },
                { label:'Drillers',    value:project.drillers.length    },
                { label:'Supervisors', value:project.supervisors.length },
                { label:'Bits',        value:project.bits.length        },
              ].map((s,i)=>(
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize:9, color:'#64748B', marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, zIndex:1000 }}>
          <div style={{ width:'100%', maxWidth:500, padding:28, borderRadius:20, background:'#0D1117', border:'1px solid #1E293B', boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Create New Project</div>
                <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>Add a new drilling project to Xplorix</div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  { label:'Project Name *',  key:'name',     placeholder:'e.g. RS-01 Chhindwara',  required:true  },
                  { label:'Project Code *',  key:'code',     placeholder:'e.g. RS-01',              required:true  },
                  { label:'Location *',      key:'location', placeholder:'e.g. Chhindwara, MP',    required:true  },
                  { label:'Client Name',     key:'client',   placeholder:'e.g. CMPDI, MECL, DGML', required:false },
                ].map(f=>(
                  <div key={f.key}>
                    <div style={label11}>{f.label}</div>
                    <input required={f.required} value={(formData as any)[f.key]}
                      onChange={e=>setFormData({...formData,[f.key]:e.target.value})}
                      placeholder={f.placeholder} style={iStyle} />
                  </div>
                ))}
                <div>
                  <div style={label11}>Status</div>
                  <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} style={selStyle}>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
                <div style={{ display:'flex', gap:10, marginTop:8 }}>
                  <button type="button" onClick={()=>setShowModal(false)}
                    style={{ flex:1, padding:'12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex:2, padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 16px rgba(249,115,22,0.3)' }}>
                    Create Project →
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

