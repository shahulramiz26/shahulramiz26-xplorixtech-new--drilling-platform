'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, Search, X, Drill } from 'lucide-react'

/**
 * Drop-in replacement for the old "Bit Usage" block.
 * - Compact row layout (matches your other sections' style)
 * - "Select bit" opens a searchable picker modal instead of a native <select>
 * - Picker only lists BIT-category catalog items (no rods/casing/accessories),
 *   across all available sizes (NQ, HQ, PQ, BQ, AQ, tricone, DTH, ...)
 * - "Not yet replaced" toggle reveals a "New bit installed" sub-section,
 *   each with its own picker
 *
 * Wire `bitCatalog` up to your real parts/inventory data source —
 * it's mocked here to only include category === 'BIT'.
 */

// ---- Replace with your real catalog source (filtered server-side or here) ----
interface CatalogPart {
  partNumber: string
  item: string
  category: 'BIT' | 'ROD & CASING' | 'CORE BARREL' | 'ACCESSORY' | 'SPARES'
  usedIn: string
}

const partsCatalog: CatalogPart[] = [
  { partNumber: 'NQ-BIT-SS', item: 'NQ Surface Set Bit', category: 'BIT', usedIn: 'Hard formation' },
  { partNumber: 'NQ-BIT-IMP', item: 'NQ Impregnated Bit', category: 'BIT', usedIn: 'Hard and very hard' },
  { partNumber: 'HQ-BIT-SS', item: 'HQ Surface Set Bit', category: 'BIT', usedIn: 'Hard formation' },
  { partNumber: 'HQ-BIT-IMP', item: 'HQ Impregnated Bit', category: 'BIT', usedIn: 'Hard and very hard' },
  { partNumber: 'PQ-BIT-SS', item: 'PQ Surface Set Bit', category: 'BIT', usedIn: 'Hard formation' },
  { partNumber: 'PQ-BIT-IMP', item: 'PQ Impregnated Bit', category: 'BIT', usedIn: 'Hard and very hard' },
  { partNumber: 'BQ-BIT-SS', item: 'BQ Surface Set Bit', category: 'BIT', usedIn: 'All ground' },
  { partNumber: 'AQ-BIT-SS', item: 'AQ Surface Set Bit', category: 'BIT', usedIn: 'All ground' },
  { partNumber: '4.5IN-TRI', item: '4.5" Tricone Bit', category: 'BIT', usedIn: 'Soft to medium' },
  { partNumber: '5IN-TRI', item: '5" Tricone Bit', category: 'BIT', usedIn: 'Soft to medium' },
  { partNumber: '6IN-TRI', item: '6" Tricone Bit', category: 'BIT', usedIn: 'Medium to hard' },
  { partNumber: '6.5IN-DTH', item: '6.5" DTH Hammer Bit', category: 'BIT', usedIn: 'Hard rock' },
  { partNumber: '8IN-DTH', item: '8" DTH Hammer Bit', category: 'BIT', usedIn: 'Hard rock' },
  // non-bit parts stay in your catalog for other sections, they're just filtered out below
]

interface BitRow {
  id: string
  bitId: string          // selected part number
  bitLabel: string        // selected item name (denormalized for display)
  serialNo: string
  meterStart: string
  meterEnd: string
  replaced: boolean
  newBitId: string
  newBitLabel: string
  newSerialNo: string
  newMeterStart: string
  newMeterEnd: string
  notes: string
}

const makeRow = (): BitRow => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
  bitId: '', bitLabel: '',
  serialNo: '', meterStart: '', meterEnd: '',
  replaced: false,
  newBitId: '', newBitLabel: '', newSerialNo: '', newMeterStart: '', newMeterEnd: '',
  notes: '',
})

const inputClass =
  'px-3 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none focus:border-[#3B82F6] transition-colors'

type PickerTarget = { rowId: string; field: 'primary' | 'new' } | null

export default function BitUsageSection() {
  const [bitRows, setBitRows] = useState<BitRow[]>([makeRow()])
  const [picker, setPicker] = useState<PickerTarget>(null)
  const [search, setSearch] = useState('')

  const addBit = () => setBitRows(r => [...r, makeRow()])
  const removeBit = (id: string) =>
    setBitRows(r => (r.length > 1 ? r.filter(x => x.id !== id) : [makeRow()]))
  const updateBit = (id: string, field: keyof BitRow, value: string | boolean) =>
    setBitRows(r => r.map(x => (x.id === id ? { ...x, [field]: value } : x)))

  const openPicker = (rowId: string, field: 'primary' | 'new') => {
    setSearch('')
    setPicker({ rowId, field })
  }

  const pickBit = (part: CatalogPart) => {
    if (!picker) return
    if (picker.field === 'primary') {
      updateBit(picker.rowId, 'bitId', part.partNumber)
      updateBit(picker.rowId, 'bitLabel', part.item)
    } else {
      updateBit(picker.rowId, 'newBitId', part.partNumber)
      updateBit(picker.rowId, 'newBitLabel', part.item)
    }
    setPicker(null)
  }

  // Only show drill bits (of any size) in the picker — everything else is excluded.
  const bitOnlyResults = partsCatalog.filter(
    p =>
      p.category === 'BIT' &&
      (!search.trim() ||
        p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.item.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="rounded-2xl bg-[#0F1522] border border-[#1E293B] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#F8FAFC]">Bit Usage</h3>
        <button
          onClick={addBit}
          className="flex items-center gap-1.5 text-[#F59E0B] text-sm font-medium hover:text-[#FBBF24] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-4">
        {bitRows.map((row, index) => (
          <div key={row.id} className="rounded-xl bg-[#0D1117] border border-[#1E293B] p-4">
            <div className="flex items-center gap-3">
              <span className="text-[#64748B] text-sm w-5 shrink-0">{index + 1}.</span>

              <button
                onClick={() => openPicker(row.id, 'primary')}
                className="flex-1 flex items-center justify-between px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl hover:border-[#3B82F6] transition-colors text-left"
              >
                {row.bitLabel ? (
                  <span className="truncate">
                    <span className="text-[#F8FAFC] font-medium">{row.bitLabel}</span>
                    <span className="text-[#64748B] ml-2 text-xs">{row.bitId}</span>
                  </span>
                ) : (
                  <span className="text-[#64748B]">Select bit</span>
                )}
                <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0 ml-2" />
              </button>

              <input
                type="text"
                className={`${inputClass} w-48 shrink-0`}
                placeholder="Serial Number (optional)"
                value={row.serialNo}
                onChange={e => updateBit(row.id, 'serialNo', e.target.value)}
              />

              <button
                onClick={() => removeBit(row.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <input
                type="number" step="0.1"
                className={`${inputClass} w-32`}
                placeholder="Meter Start"
                value={row.meterStart}
                onChange={e => updateBit(row.id, 'meterStart', e.target.value)}
              />
              <span className="text-[#64748B] text-sm shrink-0">to</span>
              <input
                type="number" step="0.1"
                className={`${inputClass} w-32`}
                placeholder="Meter End"
                value={row.meterEnd}
                onChange={e => updateBit(row.id, 'meterEnd', e.target.value)}
              />

              <button
                onClick={() => updateBit(row.id, 'replaced', !row.replaced)}
                className={`ml-auto px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  row.replaced ? 'bg-amber-500 text-white' : 'bg-[#1A2234] text-[#94A3B8] hover:text-white'
                }`}
              >
                {row.replaced ? 'Replaced' : 'Not yet replaced'}
              </button>
            </div>

            {row.replaced && (
              <div className="mt-3 p-3 rounded-xl bg-[#111827] border border-[#3B82F6]/30 space-y-3">
                <p className="text-xs font-semibold text-[#3B82F6]">↳ New bit installed</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openPicker(row.id, 'new')}
                    className="flex-1 flex items-center justify-between px-4 py-3 bg-[#0D1117] border border-[#1E293B] rounded-xl hover:border-[#3B82F6] transition-colors text-left"
                  >
                    {row.newBitLabel ? (
                      <span className="truncate">
                        <span className="text-[#F8FAFC] font-medium">{row.newBitLabel}</span>
                        <span className="text-[#64748B] ml-2 text-xs">{row.newBitId}</span>
                      </span>
                    ) : (
                      <span className="text-[#64748B]">Select new bit</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-[#64748B] shrink-0 ml-2" />
                  </button>
                  <input
                    type="text"
                    className={`${inputClass} w-48 shrink-0`}
                    placeholder="Serial Number (optional)"
                    value={row.newSerialNo}
                    onChange={e => updateBit(row.id, 'newSerialNo', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number" step="0.1"
                    className={`${inputClass} w-32`}
                    placeholder="Meter Start"
                    value={row.newMeterStart}
                    onChange={e => updateBit(row.id, 'newMeterStart', e.target.value)}
                  />
                  <span className="text-[#64748B] text-sm shrink-0">to</span>
                  <input
                    type="number" step="0.1"
                    className={`${inputClass} w-32`}
                    placeholder="Meter End"
                    value={row.newMeterEnd}
                    onChange={e => updateBit(row.id, 'newMeterEnd', e.target.value)}
                  />
                </div>
              </div>
            )}

            <input
              type="text"
              className={`${inputClass} w-full mt-3`}
              placeholder="Notes (optional)"
              value={row.notes}
              onChange={e => updateBit(row.id, 'notes', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* ---- Bit picker modal ---- */}
      {picker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setPicker(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-[#0F1522] border border-[#1E293B] rounded-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Drill className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-[15px] font-semibold text-[#F8FAFC]">Select Bit</h3>
              </div>
              <button
                onClick={() => setPicker(null)}
                className="p-1.5 text-[#64748B] hover:text-white rounded-lg transition-colors"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[#1E293B]">
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0D1117] border border-[#1E293B] rounded-xl focus-within:border-[#3B82F6] transition-colors">
                <Search className="w-4 h-4 text-[#64748B]" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by size or bit type…"
                  className="flex-1 bg-transparent text-[#F8FAFC] placeholder-[#4B5563] focus:outline-none text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0F1522]">
                  <tr className="text-left text-[#64748B] text-xs">
                    <th className="px-5 py-2.5 font-medium">Part Number</th>
                    <th className="px-3 py-2.5 font-medium">Item</th>
                    <th className="px-3 py-2.5 font-medium">Category</th>
                    <th className="px-5 py-2.5 font-medium">Used In</th>
                  </tr>
                </thead>
                <tbody>
                  {bitOnlyResults.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-[#64748B] text-sm">
                        No bits match your search.
                      </td>
                    </tr>
                  )}
                  {bitOnlyResults.map(part => (
                    <tr
                      key={part.partNumber}
                      onClick={() => pickBit(part)}
                      className="border-t border-[#1E293B] hover:bg-[#1A2234] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 text-[#F8FAFC] font-mono text-xs">{part.partNumber}</td>
                      <td className="px-3 py-3 text-[#F8FAFC]">{part.item}</td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A2234] text-[#94A3B8]">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#94A3B8]">{part.usedIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

