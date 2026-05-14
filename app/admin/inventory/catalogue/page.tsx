'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Trash2, Edit2, Check, X, Upload, Download,
  Search, ChevronDown, Package, AlertCircle, FileSpreadsheet
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Part {
  id: string
  partNumber: string
  name: string
  category: string
  manufacturer: string
  unit: string
  unitCost: number
  reorderLevel: number
  notes: string
  editing?: boolean
}

// ── SEED DATA (Universal — not company-specific) ───────────────────────────
const defaultCategories = ['Core Bits','Core Barrel','Reaming Shells','Drilling Additives','Filters','Seals & Packings','Bearings','Hoses & Pipes','Lubricants & Greases','Mechanical Parts','Tools & Hardware','Safety & PPE','Other']
const defaultManufacturers = ['ROCKTEK','IDP','Sandvik','Epiroc','Boart Longyear','WESTFIELDS','AB EMULTECH','EZYDRILL','DRILLMAN','AMOGH','MSE','SKF','Mincon','Fordia','Atlas Copco','Custom / Other']
const defaultUnits = ['Each','Kg','Litre','Set','Metre','Box','Barrel','Gallon','Bucket','Roll','Pair']

const seedParts: Part[] = [
  { id:'1',  partNumber:'NQ-CB-SR06',  name:'NQ Core Bit SR-06',          category:'Core Bits',        manufacturer:'IDP',        unit:'Each',  unitCost:11500,  reorderLevel:10, notes:'' },
  { id:'2',  partNumber:'HQ-CB-SR08',  name:'HQ Core Bit SR-08',          category:'Core Bits',        manufacturer:'IDP',        unit:'Each',  unitCost:19000,  reorderLevel:8,  notes:'' },
  { id:'3',  partNumber:'BQ-CB-SR06',  name:'BQ Core Bit SR-06',          category:'Core Bits',        manufacturer:'IDP',        unit:'Each',  unitCost:10000,  reorderLevel:6,  notes:'' },
  { id:'4',  partNumber:'NQ-CL-001',   name:'NQ Core Lifter',             category:'Core Barrel',      manufacturer:'IDP',        unit:'Each',  unitCost:400,    reorderLevel:20, notes:'' },
  { id:'5',  partNumber:'HQ-CL-001',   name:'HQ Core Lifter',             category:'Core Barrel',      manufacturer:'IDP',        unit:'Each',  unitCost:646,    reorderLevel:15, notes:'' },
  { id:'6',  partNumber:'NQ-RS-SPR',   name:'NQ Reaming Shell Spiral',    category:'Reaming Shells',   manufacturer:'EZYDRILL',   unit:'Each',  unitCost:13455,  reorderLevel:4,  notes:'' },
  { id:'7',  partNumber:'MTX-DD955',   name:'MATEX DD955 Liquid',         category:'Drilling Additives',manufacturer:'WESTFIELDS', unit:'Bucket',unitCost:12151,  reorderLevel:15, notes:'Drilling fluid' },
  { id:'8',  partNumber:'MTX-SD-PPL',  name:'MATEX Sand Drill Poly Pail', category:'Drilling Additives',manufacturer:'WESTFIELDS', unit:'Bucket',unitCost:16886,  reorderLevel:15, notes:'' },
  { id:'9',  partNumber:'ADD-EA-20',   name:'ADDRILL EA-20 KG',           category:'Drilling Additives',manufacturer:'AB EMULTECH',unit:'Kg',    unitCost:3200,   reorderLevel:20, notes:'' },
  { id:'10', partNumber:'ADD-PAB-25',  name:'ADDRILL PAB 25 KG',          category:'Drilling Additives',manufacturer:'AB EMULTECH',unit:'Kg',    unitCost:4375,   reorderLevel:20, notes:'' },
  { id:'11', partNumber:'FLT-FWS-01',  name:'Fuel Water Separator',       category:'Filters',          manufacturer:'MSE',        unit:'Each',  unitCost:2374,   reorderLevel:12, notes:'' },
  { id:'12', partNumber:'FLT-LB-B71',  name:'Lube Filter B7125',          category:'Filters',          manufacturer:'MSE',        unit:'Each',  unitCost:1990,   reorderLevel:8,  notes:'' },
  { id:'13', partNumber:'FLT-RC-PI2',  name:'Racor Filter PI2020PM',      category:'Filters',          manufacturer:'MSE',        unit:'Each',  unitCost:1155,   reorderLevel:8,  notes:'' },
  { id:'14', partNumber:'FLT-AIR-01',  name:'Air Filter (Primary)',       category:'Filters',          manufacturer:'MOULI',      unit:'Each',  unitCost:5000,   reorderLevel:6,  notes:'' },
  { id:'15', partNumber:'SEL-VP-25K',  name:'V-Packing W/S 25K',         category:'Seals & Packings', manufacturer:'ROCKTEK',    unit:'Each',  unitCost:780,    reorderLevel:10, notes:'' },
  { id:'16', partNumber:'BRG-SKF-61830',name:'Bearing 61830 MA SKF',     category:'Bearings',         manufacturer:'SKF',        unit:'Each',  unitCost:41074,  reorderLevel:2,  notes:'' },
]

// ── EXCEL TEMPLATE COLUMNS ─────────────────────────────────────────────────
const TEMPLATE_HEADERS = ['Part Number','Part Name','Category','Manufacturer','Unit','Unit Cost','Reorder Level','Notes']

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href:'/admin/inventory',                label:'Dashboard'        },
  { href:'/admin/inventory/catalogue',      label:'Parts Catalogue'  },
  { href:'/admin/inventory/stock',          label:'Stock Management' },
  { href:'/admin/inventory/purchase-orders',label:'Purchase Orders'  },
]

function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display:'flex', gap:4, background:'#080B10', border:'1px solid #1E293B', borderRadius:12, padding:4 }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s', background:active===n.label?'#F97316':'transparent', color:active===n.label?'#fff':'#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width:'100%', padding:'8px 12px', background:'#080B10', border:'1px solid #3B82F6', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit' }
const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer', appearance:'none' }
const S = {
  card: { background:'#0D1117', border:'1px solid #1E293B', borderRadius:16 },
  label: { fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' as const },
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function PartsCataloguePage() {
  const { format, currency } = useCurrency()
  const [parts, setParts] = useState<Part[]>(seedParts)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [categories, setCategories] = useState(defaultCategories)
  const [manufacturers, setManufacturers] = useState(defaultManufacturers)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState<Part[]>([])
  const [importStatus, setImportStatus] = useState<'idle'|'preview'|'success'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Filtered parts ──
  const filtered = parts.filter(p =>
    (filterCat === 'All' || p.category === filterCat) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase()) || p.manufacturer.toLowerCase().includes(search.toLowerCase()))
  )

  // ── CRUD ──
  const addPart = () => {
    const newPart: Part = { id:Date.now().toString(), partNumber:'', name:'', category:categories[0], manufacturer:manufacturers[0], unit:'Each', unitCost:0, reorderLevel:5, notes:'', editing:true }
    setParts(p => [newPart, ...p])
  }
  const savePart = (id: string) => setParts(p => p.map(x => x.id===id ? {...x, editing:false} : x))
  const editPart = (id: string) => setParts(p => p.map(x => ({...x, editing:x.id===id})))
  const deletePart = (id: string) => setParts(p => p.filter(x => x.id!==id))
  const updatePart = (id: string, field: keyof Part, value: any) => setParts(p => p.map(x => x.id===id ? {...x, [field]:value} : x))

  // ── Download Excel Template ──
  const downloadTemplate = () => {
    const csvRows = [
      TEMPLATE_HEADERS.join(','),
      'NQ-CB-SR06,NQ Core Bit SR-06,Core Bits,IDP,Each,11500,10,',
      'HQ-CB-SR08,HQ Core Bit SR-08,Core Bits,IDP,Each,19000,8,',
      'MTX-DD955,MATEX DD955 Liquid,Drilling Additives,WESTFIELDS,Bucket,12151,15,Drilling fluid',
    ].join('\n')
    const blob = new Blob([csvRows], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='xplorix_parts_template.csv'; a.click()
  }

  // ── Download Current Catalogue ──
  const exportCatalogue = () => {
    const rows = [TEMPLATE_HEADERS.join(','), ...parts.map(p => [p.partNumber,`"${p.name}"`,p.category,p.manufacturer,p.unit,p.unitCost,p.reorderLevel,`"${p.notes}"`].join(','))]
    const blob = new Blob([rows.join('\n')], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='xplorix_parts_catalogue.csv'; a.click()
  }

  // ── Parse Uploaded CSV ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const lines = text.trim().split('\n').slice(1) // skip header
      const parsed: Part[] = lines.filter(l => l.trim()).map((line, i) => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').trim())
        return {
          id: `import_${i}_${Date.now()}`,
          partNumber: cols[0] || '',
          name: cols[1] || '',
          category: cols[2] || categories[0],
          manufacturer: cols[3] || '',
          unit: cols[4] || 'Each',
          unitCost: parseFloat(cols[5]) || 0,
          reorderLevel: parseInt(cols[6]) || 5,
          notes: cols[7] || '',
        }
      })
      setImportPreview(parsed)
      setImportStatus('preview')
    }
    reader.readAsText(file)
  }

  const confirmImport = (mode: 'replace'|'merge') => {
    if (mode === 'replace') {
      setParts(importPreview)
    } else {
      // Merge: skip duplicates by partNumber
      const existing = new Set(parts.map(p => p.partNumber))
      const newOnes = importPreview.filter(p => !existing.has(p.partNumber))
      setParts(prev => [...prev, ...newOnes])
    }
    setImportStatus('success')
    setTimeout(() => { setShowImportModal(false); setImportStatus('idle'); setImportPreview([]) }, 1500)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:'#F8FAFC' }}>Parts Catalogue</h1>
          <p style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Your company's master parts list — used across all sites and purchase orders</p>
        </div>
        <SubNav active="Parts Catalogue" />
      </div>

      {/* Action Bar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', ...S.card, padding:'14px 20px' }}>
        {/* Search */}
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts, part numbers, manufacturers..."
            style={{ width:'100%', padding:'8px 12px 8px 30px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:13, outline:'none' }} />
        </div>

        {/* Category filter */}
        <div style={{ position:'relative' }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ appearance:'none', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#F8FAFC', fontSize:13, padding:'8px 28px 8px 12px', borderRadius:8, cursor:'pointer', outline:'none' }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', color:'#64748B', pointerEvents:'none' }} />
        </div>

        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          {/* Import */}
          <button onClick={() => setShowImportModal(true)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#60A5FA', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Upload size={14} /> Import Excel/CSV
          </button>
          {/* Export */}
          <button onClick={exportCatalogue}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Download size={14} /> Export
          </button>
          {/* Add */}
          <button onClick={addPart}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:9, background:'linear-gradient(135deg,#F97316,#EA580C)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', border:'none', boxShadow:'0 4px 20px rgba(249,115,22,0.25)' }}>
            <Plus size={14} /> Add Part
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Parts',   value:parts.length,                                          color:'#60A5FA' },
          { label:'Categories',    value:new Set(parts.map(p=>p.category)).size,                 color:'#F97316' },
          { label:'Manufacturers', value:new Set(parts.map(p=>p.manufacturer)).size,             color:'#10B981' },
          { label:'Catalogue Value',value:`${currency.symbol}${parts.reduce((s,p)=>s+p.unitCost,0).toLocaleString()}`,color:'#8B5CF6' },
        ].map((s,i)=>(
          <div key={i} style={{ ...S.card, padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:'#64748B', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              {['Part Number','Name','Category','Manufacturer','Unit','Unit Cost','Reorder Lvl','Notes','Actions'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding:'40px 20px', textAlign:'center', color:'#64748B', fontSize:14 }}>No parts found. Add a part or import from Excel.</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.015)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
              >
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? <input style={inputStyle} value={p.partNumber} placeholder="Part No" onChange={e=>updatePart(p.id,'partNumber',e.target.value)} />
                    : <span style={{ fontSize:12, fontFamily:'monospace', color:'#94A3B8', background:'rgba(255,255,255,0.04)', padding:'3px 8px', borderRadius:5 }}>{p.partNumber}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? <input style={{...inputStyle,minWidth:180}} value={p.name} placeholder="Part name" onChange={e=>updatePart(p.id,'name',e.target.value)} />
                    : <span style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>{p.name}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? (
                    <select style={{...selectStyle,minWidth:130}} value={p.category} onChange={e=>updatePart(p.id,'category',e.target.value)}>
                      {categories.map(c=><option key={c}>{c}</option>)}
                    </select>
                  ) : <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:5, background:'rgba(59,130,246,0.1)', color:'#60A5FA', border:'1px solid rgba(59,130,246,0.15)', whiteSpace:'nowrap' }}>{p.category}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? (
                    <select style={{...selectStyle,minWidth:130}} value={p.manufacturer} onChange={e=>updatePart(p.id,'manufacturer',e.target.value)}>
                      {manufacturers.map(m=><option key={m}>{m}</option>)}
                    </select>
                  ) : <span style={{ fontSize:12, color:'#94A3B8' }}>{p.manufacturer}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? (
                    <select style={{...selectStyle,width:80}} value={p.unit} onChange={e=>updatePart(p.id,'unit',e.target.value)}>
                      {defaultUnits.map(u=><option key={u}>{u}</option>)}
                    </select>
                  ) : <span style={{ fontSize:12, color:'#94A3B8' }}>{p.unit}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? <input style={{...inputStyle,width:100}} type="number" value={p.unitCost} onChange={e=>updatePart(p.id,'unitCost',parseFloat(e.target.value)||0)} />
                    : <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>{format(p.unitCost)}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? <input style={{...inputStyle,width:70}} type="number" value={p.reorderLevel} onChange={e=>updatePart(p.id,'reorderLevel',parseInt(e.target.value)||0)} />
                    : <span style={{ fontSize:12, color:'#94A3B8' }}>{p.reorderLevel}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  {p.editing ? <input style={{...inputStyle,minWidth:120}} value={p.notes} placeholder="Notes..." onChange={e=>updatePart(p.id,'notes',e.target.value)} />
                    : <span style={{ fontSize:11, color:'#64748B' }}>{p.notes || '—'}</span>}
                </td>
                <td style={{ padding:'10px 16px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    {p.editing ? (
                      <>
                        <button onClick={()=>savePart(p.id)} style={{ padding:6, borderRadius:7, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', cursor:'pointer' }}><Check size={13} /></button>
                        <button onClick={()=>savePart(p.id)} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={13} /></button>
                      </>
                    ) : (
                      <button onClick={()=>editPart(p.id)} style={{ padding:6, borderRadius:7, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer', transition:'all 0.2s' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#F8FAFC';(e.currentTarget as HTMLElement).style.borderColor='#334155'}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#64748B';(e.currentTarget as HTMLElement).style.borderColor='#1E293B'}}
                      ><Edit2 size={13} /></button>
                    )}
                    <button onClick={()=>deletePart(p.id)} style={{ padding:6, borderRadius:7, background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.1)', color:'rgba(239,68,68,0.5)', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#EF4444';(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.1)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(239,68,68,0.5)';(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.05)'}}
                    ><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop:'2px solid #1E293B', background:'rgba(255,255,255,0.02)' }}>
              <td colSpan={5} style={{ padding:'12px 16px', fontSize:12, fontWeight:700, color:'#64748B' }}>{filtered.length} parts shown</td>
              <td style={{ padding:'12px 16px', fontSize:13, fontWeight:800, color:'#10B981' }}>
                {format(filtered.reduce((s,p)=>s+p.unitCost,0))} avg
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── IMPORT MODAL ── */}
      {showImportModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#0D1117', border:'1px solid #1E293B', borderRadius:20, padding:32, maxWidth:680, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>

            {importStatus === 'success' ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#10B981' }}>Import Successful!</div>
                <div style={{ fontSize:13, color:'#64748B', marginTop:8 }}>Parts catalogue has been updated.</div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>Import Parts Catalogue</div>
                    <div style={{ fontSize:13, color:'#64748B', marginTop:4 }}>Upload a CSV or Excel file to bulk-import your parts</div>
                  </div>
                  <button onClick={()=>{setShowImportModal(false);setImportStatus('idle');setImportPreview([])}} style={{ padding:8, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#64748B', cursor:'pointer' }}><X size={16} /></button>
                </div>

                {importStatus === 'idle' && (
                  <>
                    {/* Template download */}
                    <div style={{ padding:16, borderRadius:12, background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.15)', marginBottom:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <FileSpreadsheet size={20} style={{ color:'#60A5FA' }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#F8FAFC' }}>First time? Download the template</div>
                          <div style={{ fontSize:11, color:'#64748B', marginTop:2 }}>Fill in your parts data and upload below</div>
                        </div>
                        <button onClick={downloadTemplate}
                          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8, background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.25)', color:'#60A5FA', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          <Download size={13} /> Download Template
                        </button>
                      </div>
                    </div>

                    {/* Template columns */}
                    <div style={{ marginBottom:20 }}>
                      <div style={{ fontSize:11, color:'#64748B', fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.1em' }}>Template Columns</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {TEMPLATE_HEADERS.map(h => (
                          <span key={h} style={{ fontSize:11, padding:'3px 8px', borderRadius:5, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color:'#94A3B8' }}>{h}</span>
                        ))}
                      </div>
                    </div>

                    {/* Upload zone */}
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{ border:'2px dashed #1E293B', borderRadius:12, padding:'32px 20px', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.4)';(e.currentTarget as HTMLElement).style.background='rgba(249,115,22,0.02)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1E293B';(e.currentTarget as HTMLElement).style.background='transparent'}}
                    >
                      <Upload size={28} style={{ color:'#64748B', margin:'0 auto 12px' }} />
                      <div style={{ fontSize:14, fontWeight:600, color:'#F8FAFC' }}>Click to upload CSV or Excel</div>
                      <div style={{ fontSize:12, color:'#64748B', marginTop:4 }}>Supported: .csv, .xlsx, .xls</div>
                      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display:'none' }} onChange={handleFileUpload} />
                    </div>
                  </>
                )}

                {importStatus === 'preview' && importPreview.length > 0 && (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', marginBottom:16 }}>
                      <Check size={14} style={{ color:'#10B981' }} />
                      <span style={{ fontSize:13, color:'#10B981', fontWeight:600 }}>{importPreview.length} parts found in file. Preview below.</span>
                    </div>

                    {/* Preview table */}
                    <div style={{ overflowX:'auto', maxHeight:300, overflowY:'auto', border:'1px solid #1E293B', borderRadius:10, marginBottom:20 }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                        <thead style={{ position:'sticky', top:0, background:'#111827' }}>
                          <tr>{['Part No','Name','Category','Manufacturer','Unit','Cost','Reorder'].map(h=><th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:10, color:'#64748B', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', borderBottom:'1px solid #1E293B', whiteSpace:'nowrap' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0,20).map((p,i)=>(
                            <tr key={i} style={{ borderBottom:'1px solid rgba(30,41,59,0.5)' }}>
                              <td style={{ padding:'7px 12px', color:'#94A3B8', fontFamily:'monospace' }}>{p.partNumber}</td>
                              <td style={{ padding:'7px 12px', color:'#F8FAFC', fontWeight:600 }}>{p.name}</td>
                              <td style={{ padding:'7px 12px', color:'#60A5FA' }}>{p.category}</td>
                              <td style={{ padding:'7px 12px', color:'#94A3B8' }}>{p.manufacturer}</td>
                              <td style={{ padding:'7px 12px', color:'#64748B' }}>{p.unit}</td>
                              <td style={{ padding:'7px 12px', color:'#10B981' }}>{p.unitCost.toLocaleString()}</td>
                              <td style={{ padding:'7px 12px', color:'#64748B' }}>{p.reorderLevel}</td>
                            </tr>
                          ))}
                          {importPreview.length > 20 && (
                            <tr><td colSpan={7} style={{ padding:'10px 12px', textAlign:'center', color:'#64748B', fontSize:12 }}>...and {importPreview.length-20} more parts</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Import mode */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <button onClick={()=>confirmImport('merge')}
                        style={{ padding:'12px 16px', borderRadius:10, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#10B981', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        ➕ Merge with Existing<br/><span style={{ fontSize:11, fontWeight:400, opacity:0.7 }}>Adds new parts, skips duplicates</span>
                      </button>
                      <button onClick={()=>confirmImport('replace')}
                        style={{ padding:'12px 16px', borderRadius:10, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', color:'#F97316', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        🔄 Replace All<br/><span style={{ fontSize:11, fontWeight:400, opacity:0.7 }}>Replaces entire catalogue</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

