'use client'

import { useState, useMemo, ReactNode } from 'react'
import { Plus, Trash2, Search, X, Drill, Wrench } from 'lucide-react'
import {
  useInventory, rigHoldings, formationUse, FORMATION_USE_LABEL,
  RIGS, PROJECTS, projectCode, isLiveProject, TODAY,
  type RigHoldingLine, type PartCategory,
} from '../../../lib/inventory-store'
import { useCostingOptional } from '../../../lib/costing-store'

/* ==========================================================================
 * DRILL LOG
 *
 * One submission per shift. Everything downstream — cost per metre, hole
 * status, parts life, supplier performance — is derived from what the
 * supervisor enters here, so the form has to be quick enough to fill at the
 * end of a twelve-hour shift and strict enough that the numbers mean
 * something.
 *
 * The one rule that shapes the pickers: a supervisor can only log a part
 * that is actually on their rig. Not the whole catalogue, not everything the
 * company owns — the starting kit plus whatever the store has issued to this
 * rig on this project. If it is not on the rig, it cannot have gone into the
 * ground, and letting someone pick it here is how stock records drift away
 * from reality.
 * ========================================================================== */

const C = {
  bg: '#080B10', card: '#0D1117', border: '#1E293B',
  orange: '#F97316', orangeD: '#EA580C',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  blue: '#3B82F6', purple: '#8B5CF6', teal: '#14B8A6',
  text: '#F8FAFC', muted: '#94A3B8', faint: '#64748B', dim: '#334155',
}

const iStyle: React.CSSProperties = {
  padding: '9px 12px', background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 9, color: C.text, fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%',
}
const numStyle: React.CSSProperties = { ...iStyle, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }
const th: React.CSSProperties = {
  padding: '8px 14px', textAlign: 'left', fontSize: 10, color: C.faint, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
  borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.02)',
}
const thR: React.CSSProperties = { ...th, textAlign: 'right' }
const td: React.CSSProperties = { padding: '10px 14px', fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap' }
const tdN: React.CSSProperties = { ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }
const tdMono: React.CSSProperties = { ...td, fontFamily: 'ui-monospace, monospace' }
const rowBorder = '1px solid rgba(30,41,59,0.5)'

const SHIFTS = ['Day', 'Night'] as const
const SHIFT_HOURS = [8, 10, 12] as const
const HOLE_SIZES = ['AQ', 'BQ', 'NQ', 'HQ', 'PQ'] as const
const FORMATIONS = ['Soft Formation', 'Medium Formation', 'Hard Formation', 'Very Hard Formation'] as const

/* Whose fault the lost time was. Internal is the contractor's own and is
 * never billable; client downtime is standby and usually is. Getting this
 * wrong is the difference between claiming a day and absorbing it. */
const INTERNAL_REASONS = [
  'Mechanical Breakdown', 'Hydraulic Issue', 'Electrical Fault',
  'Bit Change', 'Rod Change', 'Fuel Shortage', 'Operator Delay', 'Other internal',
]
const CLIENT_REASONS = [
  'Geologist Standby', 'Waiting for Instruction', 'Water Shortage',
  'Weather Condition', 'Site Access', 'Permit Pending', 'Safety Hold', 'Other client',
]

let seq = 0
const rid = () => `r${Date.now()}_${++seq}`

/* ── primitives ─────────────────────────────────────────────────────────── */

function Card({ title, subtitle, right, children, pad = true, accent }: {
  title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; pad?: boolean; accent?: string
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeft: accent ? `3px solid ${accent}` : undefined }}>
      {title && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: C.faint, marginTop: 3, maxWidth: 700, lineHeight: 1.55 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={pad ? { padding: 16 } : undefined}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 10, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

const Grid = ({ cols, children }: { cols: number; children: ReactNode }) =>
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 12 }}>{children}</div>

function Tag({ children, tone = C.faint }: { children: ReactNode; tone?: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 5, color: tone, background: `${tone}1A`, border: `1px solid ${tone}33`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function Btn({ children, onClick, tone = 'ghost', disabled, size = 'md', type = 'button' }: {
  children: ReactNode; onClick?: () => void; tone?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; size?: 'sm' | 'md'; type?: 'button' | 'submit'
}) {
  const tones: Record<string, React.CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.orange}, ${C.orangeD})`, color: '#fff', border: 'none' },
    ghost: { background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.muted },
    danger: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: 9, fontWeight: 700, fontFamily: 'inherit', opacity: disabled ? 0.45 : 1,
      padding: size === 'sm' ? '6px 12px' : '9px 17px', fontSize: size === 'sm' ? 11.5 : 13, whiteSpace: 'nowrap', ...tones[tone],
    }}>{children}</button>
  )
}

function Note({ tone = C.blue, children }: { tone?: string; children: ReactNode }) {
  return <div style={{ padding: '10px 13px', borderRadius: 9, background: `${tone}0F`, border: `1px solid ${tone}33`, fontSize: 11.5, color: tone, lineHeight: 1.6 }}>{children}</div>
}

function Switch({ on, onChange, label, hint, tone = C.orange }: {
  on: boolean; onChange: (v: boolean) => void; label: string; hint?: string; tone?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
      <button type="button" onClick={() => onChange(!on)} role="switch" aria-checked={on} style={{
        width: 40, height: 23, borderRadius: 12, flexShrink: 0, marginTop: 1, cursor: 'pointer',
        border: 'none', padding: 0, position: 'relative', background: on ? tone : '#2A3444', transition: 'background .18s',
      }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 20 : 3, width: 17, height: 17, borderRadius: '50%', background: '#fff', transition: 'left .18s' }} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: C.faint, marginTop: 3, lineHeight: 1.55 }}>{hint}</div>}
      </div>
    </div>
  )
}

/* ==========================================================================
 * RIG PART PICKER
 *
 * The same table serves bits and accessories, because it is the same
 * question: what is on this rig right now? Only what the store assigned as
 * the starting kit or has issued since appears — a supervisor cannot log a
 * bit the rig never received, which is what keeps the stock record and the
 * ground in agreement.
 * ========================================================================== */

export interface RigPart {
  itemId: string
  partNumber: string
  name: string
  serialNumber: string
  usedIn: string
  lifeMetres: number
  onRig: number
  category: PartCategory
}

function useRigParts(rig: string, project: string): RigPart[] {
  const { state } = useInventory()
  const costing = useCostingOptional()

  return useMemo(() => {
    /* What the driller's log already says was scrapped, so "on rig" is what
     * is genuinely left rather than everything ever delivered. */
    const used: { itemId: string; qty: number }[] = []
    costing?.state.shiftLogs
      .filter(l => l.rig === rig && l.project === project)
      .forEach(l => (l.partsUsed ?? []).forEach(u => {
        const e = used.find(x => x.itemId === u.itemId)
        if (e) e.qty += u.qty ?? 0
        else used.push({ itemId: u.itemId, qty: u.qty ?? 0 })
      }))

    return rigHoldings(state.pos, state.catalogue, rig, project, used, state.rigKit)
      .map((l: RigHoldingLine) => {
        const part = state.catalogue.find(p => p.id === l.itemId)
        return {
          itemId: l.itemId,
          partNumber: l.partNumber,
          name: l.name,
          serialNumber: part?.serialNumber ?? '—',
          usedIn: FORMATION_USE_LABEL[formationUse(part ?? ({ formationUse: 'all' } as never))],
          lifeMetres: l.lifeMetres,
          onRig: l.onRig,
          category: l.category,
        }
      })
  }, [state.pos, state.catalogue, state.rigKit, costing?.state.shiftLogs, rig, project])
}

function PartPickerModal({ title, subtitle, parts, onPick, onClose }: {
  title: string; subtitle: string; parts: RigPart[]; onPick: (p: RigPart) => void; onClose: () => void
}) {
  const [q, setQ] = useState('')
  const shown = parts.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase())
    || p.partNumber.toLowerCase().includes(q.toLowerCase())
    || p.serialNumber.toLowerCase().includes(q.toLowerCase()))

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
        width: 940, maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px 13px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{subtitle}</div>
          </div>
          <button type="button" onClick={onClose} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.faint, cursor: 'pointer', lineHeight: 0 }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: C.faint }} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search by part number, item or serial number"
              style={{ ...iStyle, paddingLeft: 34 }} />
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {shown.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: C.faint, fontSize: 12.5, lineHeight: 1.8 }}>
              {parts.length === 0
                ? <>Nothing of this kind is on the rig.<br />The store has to assign it as starting kit or issue it before it can be logged here.</>
                : 'Nothing matches that search.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0 }}>
                <tr>
                  <th style={th}>Part number</th><th style={th}>Item</th><th style={th}>Serial number</th>
                  <th style={th}>Used in</th><th style={thR}>Life</th><th style={thR}>On rig</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(p => (
                  <tr key={p.itemId} onClick={() => { onPick(p); onClose() }}
                    style={{ borderBottom: rowBorder, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.06)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ ...tdMono, color: C.text, fontWeight: 700 }}>{p.partNumber || '—'}</td>
                    <td style={{ ...td, color: C.text, fontWeight: 600, whiteSpace: 'normal', maxWidth: 230 }}>{p.name}</td>
                    <td style={{ ...tdMono, color: p.serialNumber === '—' ? C.dim : C.muted }}>{p.serialNumber}</td>
                    <td style={td}>{p.usedIn}</td>
                    <td style={{ ...tdN, color: C.faint }}>{p.lifeMetres.toLocaleString('en-IN')} m</td>
                    <td style={{ ...tdN, color: p.onRig > 0 ? C.green : C.red, fontWeight: 700 }}>{p.onRig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.faint, lineHeight: 1.6 }}>
          Only what this rig is carrying — its starting kit plus everything the store has issued to it, less what earlier logs
          already scrapped. If something is missing, it has not been issued yet.
        </div>
      </div>
    </div>
  )
}

/* ── the button that opens it ───────────────────────────────────────────── */

function PartSlot({ value, placeholder, onOpen }: { value?: RigPart; placeholder: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} style={{
      ...iStyle, textAlign: 'left', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', gap: 10,
      color: value ? C.text : C.faint, fontWeight: value ? 600 : 400,
    }}>
      {value ? (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'ui-monospace, monospace', color: C.orange, fontSize: 11.5 }}>{value.partNumber}</span>
          <span>{value.name}</span>
          <span style={{ fontSize: 10.5, color: C.faint }}>{value.lifeMetres.toLocaleString('en-IN')} m life</span>
        </span>
      ) : placeholder}
      <Search size={13} style={{ color: C.faint, flexShrink: 0 }} />
    </button>
  )
}

/* ==========================================================================
 * BIT USAGE
 * ========================================================================== */

interface BitRow {
  id: string
  part?: RigPart
  serialNo: string
  meterStart: string
  meterEnd: string
  replaced: boolean
  newPart?: RigPart
  newSerialNo: string
  notes: string
}

const blankBit = (): BitRow => ({
  id: rid(), serialNo: '', meterStart: '', meterEnd: '', replaced: false, newSerialNo: '', notes: '',
})

function BitUsageSection({ parts, rows, setRows }: {
  parts: RigPart[]; rows: BitRow[]; setRows: (r: BitRow[]) => void
}) {
  const [picking, setPicking] = useState<{ id: string; slot: 'old' | 'new' } | null>(null)
  const bits = parts.filter(p => p.category === 'Bit')
  const upd = (id: string, p: Partial<BitRow>) => setRows(rows.map(r => r.id === id ? { ...r, ...p } : r))

  return (
    <Card title="Bit usage" accent={C.orange}
      subtitle="Which bit ran this shift and how far it went. Metre start and end are what tell XPLORIX the bit's real life in this ground — the figure that later corrects the catalogue."
      right={<Btn size="sm" onClick={() => setRows([...rows, blankBit()])}><Plus size={13} /> Add</Btn>}>
      {rows.length === 0 ? (
        <div style={{ padding: '22px 0', textAlign: 'center', color: C.faint, fontSize: 12.5 }}>
          No bit logged for this shift. Add one if a bit was on the ground.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r, i) => {
            const run = (parseFloat(r.meterEnd) || 0) - (parseFloat(r.meterStart) || 0)
            const life = r.part?.lifeMetres ?? 0
            const worn = life > 0 ? (run / life) * 100 : 0
            return (
              <div key={r.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, color: C.faint, fontFamily: 'ui-monospace, monospace', paddingTop: 10, width: 16 }}>{i + 1}.</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 340px' }}>
                        <PartSlot value={r.part} placeholder="Select bit" onOpen={() => setPicking({ id: r.id, slot: 'old' })} />
                      </div>
                      <div style={{ width: 210 }}>
                        <input value={r.serialNo} onChange={e => upd(r.id, { serialNo: e.target.value })}
                          placeholder={r.part && r.part.serialNumber !== '—' ? r.part.serialNumber : 'Serial number (optional)'}
                          style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: 140 }}>
                        <input type="number" value={r.meterStart} onChange={e => upd(r.id, { meterStart: e.target.value })} placeholder="Meter start" style={numStyle} />
                      </div>
                      <span style={{ fontSize: 12, color: C.faint }}>to</span>
                      <div style={{ width: 140 }}>
                        <input type="number" value={r.meterEnd} onChange={e => upd(r.id, { meterEnd: e.target.value })} placeholder="Meter end" style={numStyle} />
                      </div>
                      {run > 0 && (
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12, color: C.muted, fontFamily: 'ui-monospace, monospace' }}>
                          <span style={{ color: C.text, fontWeight: 700 }}>{run.toFixed(1)} m</span>
                          {life > 0 && (
                            <span style={{ color: worn >= 100 ? C.red : worn >= 75 ? C.amber : C.green }}>
                              {worn.toFixed(0)}% of its {life.toLocaleString('en-IN')} m life
                            </span>
                          )}
                        </span>
                      )}
                      <div style={{ flex: 1 }} />
                      <button type="button" onClick={() => upd(r.id, { replaced: !r.replaced })} style={{
                        padding: '9px 14px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                        background: r.replaced ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${r.replaced ? `${C.orange}66` : C.border}`, color: r.replaced ? C.orange : C.muted,
                      }}>{r.replaced ? 'Bit was changed' : 'Not yet replaced'}</button>
                      <button type="button" onClick={() => setRows(rows.filter(x => x.id !== r.id))}
                        style={{ padding: 9, borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red, cursor: 'pointer', lineHeight: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {r.replaced && (
                      <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 340px' }}>
                          <Field label="New bit installed">
                            <PartSlot value={r.newPart} placeholder="Select the replacement" onOpen={() => setPicking({ id: r.id, slot: 'new' })} />
                          </Field>
                        </div>
                        <div style={{ width: 210 }}>
                          <Field label="Serial number">
                            <input value={r.newSerialNo} onChange={e => upd(r.id, { newSerialNo: e.target.value })}
                              placeholder="optional" style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} />
                          </Field>
                        </div>
                      </div>
                    )}

                    <input value={r.notes} onChange={e => upd(r.id, { notes: e.target.value })}
                      placeholder="Notes (optional) — e.g. shattered at 40 m, core blocked twice" style={iStyle} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {picking && (
        <PartPickerModal
          title="Bits on this rig"
          subtitle="Only bits the store has put on this rig. Life is what the catalogue expects; the metres you log are what it actually gave."
          parts={bits}
          onPick={p => upd(picking.id, picking.slot === 'old'
            ? { part: p, serialNo: p.serialNumber === '—' ? '' : p.serialNumber }
            : { newPart: p, newSerialNo: p.serialNumber === '—' ? '' : p.serialNumber })}
          onClose={() => setPicking(null)} />
      )}
    </Card>
  )
}

/* ==========================================================================
 * ACCESSORIES
 *
 * Everything consumed that is not the bit — lifters, cases, reamer shells,
 * rods, casing, core barrels, spares. Same picker, same rig-only rule.
 * ========================================================================== */

interface AccessoryRow {
  id: string
  part?: RigPart
  serialNo: string
  qty: string
  metres: string
  notes: string
}

const blankAccessory = (): AccessoryRow => ({ id: rid(), serialNo: '', qty: '1', metres: '', notes: '' })

function AccessoriesSection({ parts, rows, setRows, metresThisShift }: {
  parts: RigPart[]; rows: AccessoryRow[]; setRows: (r: AccessoryRow[]) => void; metresThisShift: number
}) {
  const [picking, setPicking] = useState<string | null>(null)
  const accessories = parts.filter(p => p.category !== 'Bit')
  const upd = (id: string, p: Partial<AccessoryRow>) => setRows(rows.map(r => r.id === id ? { ...r, ...p } : r))

  return (
    <Card title="Accessories used" accent={C.teal}
      subtitle="What was finished off and scrapped this shift — lifters, cases, reamer shells, rods, casing. Quantity is whole units written off, not units on the rig."
      right={<Btn size="sm" onClick={() => setRows([...rows, { ...blankAccessory(), metres: String(metresThisShift || '') }])}><Plus size={13} /> Add</Btn>}>
      {rows.length === 0 ? (
        <div style={{ padding: '22px 0', textAlign: 'center', color: C.faint, fontSize: 12.5, lineHeight: 1.7 }}>
          Nothing scrapped this shift. Leave it empty — this section records what was <em>used up</em>, not what is on the rig.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r, i) => {
            const over = r.part && parseFloat(r.qty) > r.part.onRig
            return (
              <div key={r.id} style={{ background: C.bg, border: `1px solid ${over ? `${C.red}55` : C.border}`, borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, color: C.faint, fontFamily: 'ui-monospace, monospace', paddingTop: 10, width: 16 }}>{i + 1}.</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 320px' }}>
                        <PartSlot value={r.part} placeholder="Select accessory" onOpen={() => setPicking(r.id)} />
                      </div>
                      <div style={{ width: 170 }}>
                        <input value={r.serialNo} onChange={e => upd(r.id, { serialNo: e.target.value })}
                          placeholder={r.part && r.part.serialNumber !== '—' ? r.part.serialNumber : 'Serial number'}
                          style={{ ...iStyle, fontFamily: 'ui-monospace, monospace', fontSize: 12 }} />
                      </div>
                      <div style={{ width: 96 }}>
                        <input type="number" min={0} value={r.qty} onChange={e => upd(r.id, { qty: e.target.value })}
                          placeholder="Qty" style={{ ...numStyle, color: over ? C.red : C.text }} />
                      </div>
                      <div style={{ width: 120 }}>
                        <input type="number" value={r.metres} onChange={e => upd(r.id, { metres: e.target.value })}
                          placeholder="Metres run" style={numStyle} />
                      </div>
                      <button type="button" onClick={() => setRows(rows.filter(x => x.id !== r.id))}
                        style={{ padding: 9, borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: C.red, cursor: 'pointer', lineHeight: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {over && (
                      <Note tone={C.red}>
                        Only {r.part!.onRig} on the rig. Either the store issued more than the system knows, or this quantity is wrong.
                      </Note>
                    )}
                    <input value={r.notes} onChange={e => upd(r.id, { notes: e.target.value })}
                      placeholder="Notes (optional)" style={iStyle} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {picking && (
        <PartPickerModal
          title="Accessories on this rig"
          subtitle="Everything other than bits that the store has put on this rig."
          parts={accessories}
          onPick={p => upd(picking, { part: p, serialNo: p.serialNumber === '—' ? '' : p.serialNumber })}
          onClose={() => setPicking(null)} />
      )}
    </Card>
  )
}

/* ==========================================================================
 * THE FORM
 * ========================================================================== */

export default function DrillingLogPage() {
  const costing = useCostingOptional()

  const [project, setProject] = useState(PROJECTS.find(isLiveProject) ?? PROJECTS[0])
  const [rig, setRig] = useState(RIGS[0])
  const [date, setDate] = useState(TODAY)
  const [shift, setShift] = useState<typeof SHIFTS[number]>('Day')
  const [shiftHours, setShiftHours] = useState<number>(12)
  const [supervisor, setSupervisor] = useState('')
  const [driller, setDriller] = useState('')

  const [standby, setStandby] = useState(false)
  const [holeNumber, setHoleNumber] = useState('')
  const [holeSize, setHoleSize] = useState<string>('HQ')
  const [formation, setFormation] = useState<string>('Hard Formation')
  const [crewCount, setCrewCount] = useState(4)

  const [drillingHours, setDrillingHours] = useState(12)
  const [metres, setMetres] = useState(0)
  const [coreRecovery, setCoreRecovery] = useState(0)
  const [fromDepth, setFromDepth] = useState(0)

  const [downtimeHours, setDowntimeHours] = useState(0)
  const [downtimeSide, setDowntimeSide] = useState<'internal' | 'client'>('internal')
  const [downtimeReason, setDowntimeReason] = useState('')

  const [holeClosed, setHoleClosed] = useState(false)
  const [nextHole, setNextHole] = useState('')
  const [nextHoleMetres, setNextHoleMetres] = useState(0)

  const [bits, setBits] = useState<BitRow[]>([])
  const [accessories, setAccessories] = useState<AccessoryRow[]>([])

  const [fuelLitres, setFuelLitres] = useState(0)
  const [waterLitres, setWaterLitres] = useState(0)
  const [additivesKg, setAdditivesKg] = useState(0)

  const [submitted, setSubmitted] = useState<string | null>(null)

  const parts = useRigParts(rig, project)

  /* Standby is the client stopping work, so there are no metres, no formation
   * and no parts to record — but the shift still has to be logged, because
   * the waiting is what gets billed. */
  const enterStandby = (on: boolean) => {
    setStandby(on)
    if (on) {
      setDrillingHours(0); setMetres(0); setCoreRecovery(0)
      setDowntimeHours(shiftHours); setDowntimeSide('client')
      setDowntimeReason('Geologist Standby')
      setBits([]); setAccessories([])
    } else {
      setDowntimeHours(0); setDowntimeReason(''); setDowntimeSide('internal')
      setDrillingHours(shiftHours)
    }
  }

  const recoveryPct = metres > 0 ? (coreRecovery / metres) * 100 : 0
  const hoursOk = Math.abs(drillingHours + downtimeHours - shiftHours) < 0.01

  const problems: string[] = []
  if (!standby && !holeNumber.trim()) problems.push('Hole number is missing.')
  if (!supervisor.trim()) problems.push('Supervisor name is missing.')
  if (!hoursOk) problems.push(`Drilling ${drillingHours} hr plus downtime ${downtimeHours} hr does not add up to the ${shiftHours} hr shift.`)
  if (downtimeHours > 0 && !downtimeReason) problems.push('Downtime needs a reason — it decides whether the hours are billable.')
  if (!standby && coreRecovery > metres) problems.push('Core recovered cannot exceed metres drilled.')
  if (holeClosed && !nextHole.trim() && nextHoleMetres > 0) problems.push('Metres were drilled on a new hole, but the hole number is missing.')

  /* The payload is a ShiftLog — the exact shape costing reads — so what is
   * submitted here and what is costed later cannot drift apart. */
  const buildPayload = () => ({
    rig, project, date, shift,
    holeNumber: standby ? null : holeNumber.trim() || null,
    crewCount, shiftHours, drillingHours, downtimeHours,
    downtimeReason: downtimeHours > 0 ? downtimeReason : '',
    downtimeSide,
    metresDrilled: standby ? 0 : metres,
    coreRecovery: standby ? 0 : coreRecovery,
    holeSize, formationType: standby ? '' : formation,
    holeClosedThisShift: holeClosed,
    nextHole: holeClosed && nextHole.trim() ? { holeNumber: nextHole.trim(), metresDrilled: nextHoleMetres } : undefined,
    partsUsed: [
      ...accessories.filter(a => a.part && parseFloat(a.qty) > 0).map(a => ({
        itemId: a.part!.itemId, qty: parseFloat(a.qty), metres: parseFloat(a.metres) || undefined, note: a.notes || undefined,
      })),
      /* A bit only counts as consumed when it was actually changed out. A bit
       * still on the rig has worn, not died. */
      ...bits.filter(b => b.part && b.replaced).map(b => ({
        itemId: b.part!.itemId, qty: 1,
        metres: (parseFloat(b.meterEnd) || 0) - (parseFloat(b.meterStart) || 0) || undefined,
        note: b.notes || undefined,
      })),
    ],
    bitRuns: bits.filter(b => b.part).map(b => ({
      itemId: b.part!.itemId, serialNo: b.serialNo,
      meterStart: parseFloat(b.meterStart) || 0, meterEnd: parseFloat(b.meterEnd) || 0,
      replaced: b.replaced, replacedWith: b.newPart?.itemId, newSerialNo: b.newSerialNo,
    })),
    fuelLitres, waterLitres, additivesKg,
    supervisor, driller,
  })

  const submit = () => {
    if (problems.length) return
    const payload = buildPayload()
    console.log('SHIFT LOG', payload)
    setSubmitted(`${shift} shift on ${rig}, ${date} — ${standby ? 'standby' : `${metres} m on ${holeNumber}`}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 56 }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Drill size={22} style={{ color: C.orange }} /> Drill log
          </h1>
          <p style={{ fontSize: 13, color: C.faint, marginTop: 5, maxWidth: 720, lineHeight: 1.6 }}>
            One submission per shift. Everything downstream reads from this — cost per metre, hole status, parts life,
            supplier performance. Fill it once, properly, and nobody compiles a report from it afterwards.
          </p>
        </div>
      </div>

      {submitted && (
        <Note tone={C.green}><b>Logged.</b> {submitted}. The operations dashboard and costing have it already.</Note>
      )}

      <Card title="Shift" accent={C.blue} subtitle="Project and rig decide which parts you can log further down, so set them first.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Grid cols={4}>
            <Field label="Project">
              <select value={project} onChange={e => setProject(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                {PROJECTS.filter(isLiveProject).map(p => <option key={p} value={p}>{projectCode(p)} — {p}</option>)}
              </select>
            </Field>
            <Field label="Rig">
              <select value={rig} onChange={e => setRig(e.target.value)} style={{ ...iStyle, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
                {RIGS.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...iStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Shift">
              <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 4 }}>
                {SHIFTS.map(s => (
                  <button key={s} type="button" onClick={() => setShift(s)} style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    border: 'none', fontFamily: 'inherit', background: shift === s ? C.orange : 'transparent', color: shift === s ? '#fff' : C.faint,
                  }}>{s}</button>
                ))}
              </div>
            </Field>
          </Grid>
          <Grid cols={4}>
            <Field label="Shift length">
              <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 4 }}>
                {SHIFT_HOURS.map(h => (
                  <button key={h} type="button" onClick={() => { setShiftHours(h); if (!standby) setDrillingHours(h - downtimeHours) }} style={{
                    flex: 1, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                    border: 'none', fontFamily: 'inherit', background: shiftHours === h ? C.orange : 'transparent', color: shiftHours === h ? '#fff' : C.faint,
                  }}>{h} hr</button>
                ))}
              </div>
            </Field>
            <Field label="Crew on shift">
              <input type="number" min={0} value={crewCount} onChange={e => setCrewCount(parseInt(e.target.value) || 0)} style={numStyle} />
            </Field>
            <Field label="Supervisor"><input value={supervisor} onChange={e => setSupervisor(e.target.value)} style={iStyle} /></Field>
            <Field label="Driller"><input value={driller} onChange={e => setDriller(e.target.value)} style={iStyle} /></Field>
          </Grid>
        </div>
      </Card>

      <Card accent={standby ? C.amber : undefined} pad>
        <div style={{ background: C.bg, border: `1px solid ${standby ? `${C.amber}44` : C.border}`, borderRadius: 11, padding: '4px 16px' }}>
          <Switch on={standby} onChange={enterStandby} tone={C.amber} label="Standby — the client stopped work"
            hint="No metres, no formation, no parts. The drilling fields come off the form and the whole shift is logged as client downtime, because the waiting is what gets billed." />
        </div>
      </Card>

      {!standby && (
        <>
          <Card title="The hole" accent={C.orange}>
            <Grid cols={4}>
              <Field label="Hole number"><input value={holeNumber} onChange={e => setHoleNumber(e.target.value)} placeholder="e.g. DH-004" style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} /></Field>
              <Field label="Hole size">
                <select value={holeSize} onChange={e => setHoleSize(e.target.value)} style={{ ...iStyle, cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}>
                  {HOLE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Formation" hint="Drives the tooling rate and the client rate for these metres">
                <select value={formation} onChange={e => setFormation(e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                  {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Depth at start of shift"><input type="number" value={fromDepth} onChange={e => setFromDepth(parseFloat(e.target.value) || 0)} style={numStyle} /></Field>
            </Grid>
          </Card>

          <Card title="Production" accent={C.green}>
            <Grid cols={4}>
              <Field label="Drilling hours">
                <input type="number" value={drillingHours} onChange={e => setDrillingHours(parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: hoursOk ? C.text : C.red }} />
              </Field>
              <Field label="Metres drilled">
                <input type="number" value={metres} onChange={e => setMetres(parseFloat(e.target.value) || 0)} style={{ ...numStyle, color: C.orange }} />
              </Field>
              <Field label="Core recovered" hint={metres > 0 ? `${recoveryPct.toFixed(1)}% recovery` : undefined}>
                <input type="number" value={coreRecovery} onChange={e => setCoreRecovery(parseFloat(e.target.value) || 0)}
                  style={{ ...numStyle, color: coreRecovery > metres ? C.red : recoveryPct >= 90 ? C.green : C.amber }} />
              </Field>
              <Field label="Depth at end of shift">
                <div style={{ ...iStyle, background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed', fontFamily: 'ui-monospace, monospace', textAlign: 'right', fontWeight: 700 }}>
                  {(fromDepth + metres).toFixed(1)} m
                </div>
              </Field>
            </Grid>
          </Card>
        </>
      )}

      <Card title="Downtime" accent={downtimeHours > 0 ? (downtimeSide === 'client' ? C.amber : C.red) : undefined}
        subtitle="Whose fault the lost time was decides whether it can be claimed. Internal is yours and is never billable; client downtime is standby and usually is.">
        <Grid cols={3}>
          <Field label="Downtime hours">
            <input type="number" value={downtimeHours} onChange={e => setDowntimeHours(parseFloat(e.target.value) || 0)}
              style={{ ...numStyle, color: downtimeHours > 0 ? C.red : C.text }} />
          </Field>
          <Field label="Whose time">
            <div style={{ display: 'flex', gap: 4, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 9, padding: 4 }}>
              {(['internal', 'client'] as const).map(s => (
                <button key={s} type="button" onClick={() => { setDowntimeSide(s); setDowntimeReason('') }} style={{
                  flex: 1, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                  background: downtimeSide === s ? (s === 'client' ? C.amber : C.red) : 'transparent',
                  color: downtimeSide === s ? '#fff' : C.faint,
                }}>{s === 'internal' ? 'Ours' : 'Client'}</button>
              ))}
            </div>
          </Field>
          <Field label="Reason">
            <select value={downtimeReason} onChange={e => setDowntimeReason(e.target.value)} disabled={downtimeHours === 0}
              style={{ ...iStyle, cursor: 'pointer', opacity: downtimeHours === 0 ? 0.45 : 1 }}>
              <option value="">Select a reason</option>
              {(downtimeSide === 'internal' ? INTERNAL_REASONS : CLIENT_REASONS).map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
        </Grid>
        {!hoursOk && (
          <div style={{ marginTop: 12 }}>
            <Note tone={C.red}>
              Drilling {drillingHours} hr plus downtime {downtimeHours} hr is {(drillingHours + downtimeHours).toFixed(1)} hr,
              against a {shiftHours} hr shift. Every hour has to be accounted for.
            </Note>
          </div>
        )}
      </Card>

      {!standby && (
        <>
          <BitUsageSection parts={parts} rows={bits} setRows={setBits} />
          <AccessoriesSection parts={parts} rows={accessories} setRows={setAccessories} metresThisShift={metres} />

          <Card title="Consumables" accent={C.amber} subtitle="Straight off the gauges. Costing turns these into rupees at the rate in force on the day.">
            <Grid cols={3}>
              <Field label="Fuel"><input type="number" value={fuelLitres} onChange={e => setFuelLitres(parseFloat(e.target.value) || 0)} style={numStyle} /></Field>
              <Field label="Water"><input type="number" value={waterLitres} onChange={e => setWaterLitres(parseFloat(e.target.value) || 0)} style={numStyle} /></Field>
              <Field label="Additives"><input type="number" value={additivesKg} onChange={e => setAdditivesKg(parseFloat(e.target.value) || 0)} style={numStyle} /></Field>
            </Grid>
          </Card>

          <Card title="End of hole" accent={holeClosed ? C.purple : undefined}
            subtitle="Finance never decides when a hole is finished — it reads this. Once ticked, the hole appears in Drillholes as closed and waits for approval.">
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 11, padding: '4px 16px' }}>
              <Switch on={holeClosed} onChange={setHoleClosed} tone={C.purple} label="Hole closed this shift"
                hint="If the crew moved onto a new hole in the same shift, record the first metres on it below rather than starting a second log." />
            </div>
            {holeClosed && (
              <div style={{ marginTop: 12 }}>
                <Grid cols={3}>
                  <Field label="Next hole started"><input value={nextHole} onChange={e => setNextHole(e.target.value)} placeholder="e.g. DH-005" style={{ ...iStyle, fontFamily: 'ui-monospace, monospace' }} /></Field>
                  <Field label="Metres on the new hole"><input type="number" value={nextHoleMetres} onChange={e => setNextHoleMetres(parseFloat(e.target.value) || 0)} style={numStyle} /></Field>
                </Grid>
              </div>
            )}
          </Card>
        </>
      )}

      {problems.length > 0 && (
        <Card accent={C.red}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.red, marginBottom: 8 }}>Before this can be submitted</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {problems.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red, flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11.5, color: C.faint, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {!standby && <span>{metres} m on {holeNumber || 'no hole'}</span>}
          {!standby && <span>{bits.filter(b => b.part).length} bit{bits.filter(b => b.part).length === 1 ? '' : 's'} logged</span>}
          {!standby && <span>{accessories.filter(a => a.part).length} accessor{accessories.filter(a => a.part).length === 1 ? 'y' : 'ies'} scrapped</span>}
          {standby && <span>Standby — {downtimeHours} hr to the client</span>}
        </div>
        <Btn tone="primary" disabled={problems.length > 0} onClick={submit}>Submit log</Btn>
      </div>
    </div>
  )
}
