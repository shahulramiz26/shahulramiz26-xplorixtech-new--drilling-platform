'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Save, Edit2, Check, X, Upload, Info } from 'lucide-react'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface RigCost { id: string; rigName: string; hourlyRate: string; currency: string; editing?: boolean }
interface FluidCost { id: string; fluidName: string; unit: string; unitCost: string; editing?: boolean }
interface AccessoryItem { id: string; partNumber: string; description: string; unitPrice: string; editing?: boolean }

const currencies = ['USD', 'AUD', 'CAD', 'ZAR']
const fluidUnits = ['Litre (L)', 'Kilogram (kg)', 'Gallon (gal)', 'Barrel (bbl)']

// ── SEED DATA ──────────────────────────────────────────────────────────────
const seedRigs: RigCost[] = [
  { id: '1', rigName: 'RIG-001 Alpha', hourlyRate: '300', currency: 'USD' },
  { id: '2', rigName: 'RIG-002 Beta', hourlyRate: '280', currency: 'USD' },
  { id: '3', rigName: 'RIG-003 Gamma', hourlyRate: '320', currency: 'USD' },
]
const seedFluids: FluidCost[] = [
  { id: '1', fluidName: 'Diesel Fuel', unit: 'Litre (L)', unitCost: '1.45' },
  { id: '2', fluidName: 'Water', unit: 'Litre (L)', unitCost: '0.12' },
  { id: '3', fluidName: 'Engine Oil', unit: 'Litre (L)', unitCost: '8.50' },
  { id: '4', fluidName: 'Drilling Additive', unit: 'Kilogram (kg)', unitCost: '22.00' },
]
const seedAccessories: AccessoryItem[] = [
  { id: '1', partNumber: 'ACC-001', description: 'NQ Core Bit', unitPrice: '480' },
  { id: '2', partNumber: 'ACC-002', description: 'HQ Core Bit', unitPrice: '620' },
  { id: '3', partNumber: 'ACC-003', description: 'Core Barrel NQ', unitPrice: '340' },
  { id: '4', partNumber: 'ACC-004', description: 'Reaming Shell', unitPrice: '210' },
  { id: '5', partNumber: 'ACC-005', description: 'DTH Hammer 5"', unitPrice: '1850' },
]

// ── INLINE ROW COMPONENTS ──────────────────────────────────────────────────
const cellInput = "w-full px-3 py-2 bg-[#0D1117] border border-[#3B82F6] rounded-lg text-[#F8FAFC] text-sm focus:outline-none"
const cellDisplay = "text-sm text-[#F8FAFC]"
const cellSub = "text-xs text-[#64748B]"

export default function MasterDataPage() {
  const [rigs, setRigs] = useState<RigCost[]>(seedRigs)
  const [fluids, setFluids] = useState<FluidCost[]>(seedFluids)
  const [accessories, setAccessories] = useState<AccessoryItem[]>(seedAccessories)
  const [saved, setSaved] = useState(false)

  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  // ── RIG HANDLERS ──
  const addRig = () => setRigs(r => [...r, { id: Date.now().toString(), rigName: '', hourlyRate: '', currency: 'USD', editing: true }])
  const editRig = (id: string) => setRigs(r => r.map(x => ({ ...x, editing: x.id === id })))
  const saveRig = (id: string) => setRigs(r => r.map(x => x.id === id ? { ...x, editing: false } : x))
  const deleteRig = (id: string) => setRigs(r => r.filter(x => x.id !== id))
  const updateRig = (id: string, field: keyof RigCost, value: string) =>
    setRigs(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  // ── FLUID HANDLERS ──
  const addFluid = () => setFluids(r => [...r, { id: Date.now().toString(), fluidName: '', unit: 'Litre (L)', unitCost: '', editing: true }])
  const editFluid = (id: string) => setFluids(r => r.map(x => ({ ...x, editing: x.id === id })))
  const saveFluid = (id: string) => setFluids(r => r.map(x => x.id === id ? { ...x, editing: false } : x))
  const deleteFluid = (id: string) => setFluids(r => r.filter(x => x.id !== id))
  const updateFluid = (id: string, field: keyof FluidCost, value: string) =>
    setFluids(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  // ── ACCESSORY HANDLERS ──
  const addAccessory = () => setAccessories(r => [...r, { id: Date.now().toString(), partNumber: '', description: '', unitPrice: '', editing: true }])
  const editAccessory = (id: string) => setAccessories(r => r.map(x => ({ ...x, editing: x.id === id })))
  const saveAccessory = (id: string) => setAccessories(r => r.map(x => x.id === id ? { ...x, editing: false } : x))
  const deleteAccessory = (id: string) => setAccessories(r => r.filter(x => x.id !== id))
  const updateAccessory = (id: string, field: keyof AccessoryItem, value: string) =>
    setAccessories(r => r.map(x => x.id === id ? { ...x, [field]: value } : x))

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Finance & Costing</h1>
          <p className="text-[#64748B] text-sm mt-1">Set pricing rates — used automatically in all cost calculations</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sub-nav */}
          <div className="flex items-center gap-1 bg-[#0D1117] border border-[#1E293B] rounded-xl p-1">
            <Link href="/admin/finance" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Dashboard</Link>
            <Link href="/admin/finance/master-data" className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium">Master Data</Link>
            <Link href="/admin/finance/reports" className="px-4 py-2 rounded-lg text-[#94A3B8] hover:text-white text-sm font-medium transition-colors">Cost Reports</Link>
          </div>
          <button
            onClick={showSaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'}`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save All</>}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-[#94A3B8]">
          These rates power the <span className="text-[#F8FAFC] font-medium">Cost Engine</span> automatically.
          Once set, all drill log data will be priced without any manual entry.
          Click the <span className="text-[#F8FAFC] font-medium">✏️ edit</span> icon on any row to update a rate.
        </p>
      </div>

      {/* ── TABLE 1: RIG COST MASTER ── */}
      <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">Rig Cost Master</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Hourly operating cost per rig — drives downtime loss calculations</p>
          </div>
          <button onClick={addRig}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2234] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Rig
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Rig Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Hourly Rate</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Currency</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Daily Cost (12h)</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {rigs.map((row, i) => (
              <tr key={row.id} className="border-b border-[#1E293B] hover:bg-[#0D1117]/50 transition-colors">
                <td className="px-6 py-4 text-[#64748B] text-sm">{i + 1}</td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={cellInput} value={row.rigName} placeholder="Rig name" onChange={e => updateRig(row.id, 'rigName', e.target.value)} />
                    : <span className={cellDisplay}>{row.rigName || '—'}</span>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={`${cellInput} w-28`} type="number" value={row.hourlyRate} placeholder="0.00" onChange={e => updateRig(row.id, 'hourlyRate', e.target.value)} />
                    : <div><span className={cellDisplay}>${row.hourlyRate}/hr</span></div>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <select className={`${cellInput} w-24`} value={row.currency} onChange={e => updateRig(row.id, 'currency', e.target.value)}>
                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    : <span className={`text-xs px-2 py-1 rounded-full bg-[#1A2234] text-[#94A3B8]`}>{row.currency}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-emerald-400">
                    ${row.hourlyRate ? (parseFloat(row.hourlyRate) * 12).toLocaleString() : '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {row.editing
                      ? <>
                          <button onClick={() => saveRig(row.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => saveRig(row.id)} className="p-1.5 text-[#64748B] hover:bg-[#1A2234] rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      : <button onClick={() => editRig(row.id)} className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A2234] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>}
                    <button onClick={() => deleteRig(row.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rigs.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#64748B] text-sm">No rigs added yet. Click "Add Rig" to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── TABLE 2: FLUID COST MASTER ── */}
      <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">Fluid Cost Master</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Unit cost for fuel, water, engine oil and drilling additives</p>
          </div>
          <button onClick={addFluid}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2234] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> Add Fluid
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Fluid Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Unit</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Unit Cost</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {fluids.map((row, i) => (
              <tr key={row.id} className="border-b border-[#1E293B] hover:bg-[#0D1117]/50 transition-colors">
                <td className="px-6 py-4 text-[#64748B] text-sm">{i + 1}</td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={cellInput} value={row.fluidName} placeholder="e.g. Diesel Fuel" onChange={e => updateFluid(row.id, 'fluidName', e.target.value)} />
                    : <span className={cellDisplay}>{row.fluidName}</span>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <select className={`${cellInput} w-36`} value={row.unit} onChange={e => updateFluid(row.id, 'unit', e.target.value)}>
                        {fluidUnits.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    : <span className="text-xs px-2 py-1 rounded-full bg-[#1A2234] text-[#94A3B8]">{row.unit}</span>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={`${cellInput} w-28`} type="number" step="0.01" value={row.unitCost} placeholder="0.00" onChange={e => updateFluid(row.id, 'unitCost', e.target.value)} />
                    : <span className={`${cellDisplay} text-amber-400 font-medium`}>${row.unitCost}/{row.unit.split(' ')[0]}</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {row.editing
                      ? <>
                          <button onClick={() => saveFluid(row.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => saveFluid(row.id)} className="p-1.5 text-[#64748B] hover:bg-[#1A2234] rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      : <button onClick={() => editFluid(row.id)} className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A2234] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>}
                    <button onClick={() => deleteFluid(row.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── TABLE 3: ACCESSORIES MASTER ── */}
      <div className="rounded-2xl bg-[#111827] border border-[#1E293B] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">Accessories & Parts Master</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Unit pricing for bits, rods, core barrels and accessories</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2234] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] rounded-lg text-sm transition-colors">
              <Upload className="w-4 h-4" /> Import CSV
            </button>
            <button onClick={addAccessory}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A2234] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Part Number</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Description</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {accessories.map((row, i) => (
              <tr key={row.id} className="border-b border-[#1E293B] hover:bg-[#0D1117]/50 transition-colors">
                <td className="px-6 py-4 text-[#64748B] text-sm">{i + 1}</td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={`${cellInput} w-32`} value={row.partNumber} placeholder="ACC-XXX" onChange={e => updateAccessory(row.id, 'partNumber', e.target.value)} />
                    : <span className="text-xs px-2 py-1 rounded-full bg-[#1A2234] font-mono text-[#94A3B8]">{row.partNumber}</span>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={cellInput} value={row.description} placeholder="Item description" onChange={e => updateAccessory(row.id, 'description', e.target.value)} />
                    : <span className={cellDisplay}>{row.description}</span>}
                </td>
                <td className="px-6 py-4">
                  {row.editing
                    ? <input className={`${cellInput} w-28`} type="number" value={row.unitPrice} placeholder="0.00" onChange={e => updateAccessory(row.id, 'unitPrice', e.target.value)} />
                    : <span className="text-sm font-medium text-purple-400">${parseFloat(row.unitPrice || '0').toLocaleString()}</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    {row.editing
                      ? <>
                          <button onClick={() => saveAccessory(row.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                          <button onClick={() => saveAccessory(row.id)} className="p-1.5 text-[#64748B] hover:bg-[#1A2234] rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      : <button onClick={() => editAccessory(row.id)} className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1A2234] rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>}
                    <button onClick={() => deleteAccessory(row.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

