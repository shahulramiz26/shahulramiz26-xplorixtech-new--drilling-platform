'use client'

import { useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'

export interface CategoryChild {
  label: string
  value: number
  unit?: string
  valuePrefix?: string
}

export interface CategoryItem {
  label: string
  value: number
  unit?: string
  valuePrefix?: string
  color?: string
  children?: CategoryChild[]
  icon?: string
}

interface ExpandableCategoryProps {
  items: CategoryItem[]
  title?: string
  showPercent?: boolean
  showValue?: boolean
  maxChildrenVisible?: number
  compact?: boolean
  searchable?: boolean
}

const COLORS = [
  '#F97316','#3B82F6','#10B981','#8B5CF6',
  '#F59E0B','#64748B','#06B6D4','#EF4444',
]

export default function ExpandableCategory({
  items,
  title,
  showPercent = true,
  showValue = true,
  maxChildrenVisible = 5,
  compact = false,
  searchable = false,
}: ExpandableCategoryProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [childExpanded, setChildExpanded] = useState<Record<string, boolean>>({})

  const sorted = [...items].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((s, i) => s + i.value, 0)
  const maxVal = sorted[0]?.value || 1

  const filtered = search
    ? sorted.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : sorted

  const py = compact ? 9 : 13

  return (
    <div>
      {title && <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom:14 }}>{title}</div>}

      {searchable && (
        <div style={{ position:'relative', marginBottom:12 }}>
          <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories..."
            style={{ width:'100%', padding:'7px 10px 7px 28px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit' }} />
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column' }}>
        {filtered.map((item, index) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          const barWidth = (item.value / maxVal) * 100
          const color = item.color || COLORS[index % COLORS.length]
          const isOpen = openCategory === item.label
          const hasChildren = item.children && item.children.length > 0
          const childMax = item.children ? Math.max(...item.children.map(c => c.value), 1) : 1
          const visibleChildren = childExpanded[item.label]
            ? item.children || []
            : (item.children || []).slice(0, maxChildrenVisible)
          const hiddenChildren = (item.children?.length || 0) - maxChildrenVisible

          return (
            <div key={item.label}>
              {/* Category Row */}
              <div
                onClick={() => hasChildren ? setOpenCategory(isOpen ? null : item.label) : undefined}
                style={{
                  paddingTop: py, paddingBottom: py,
                  borderBottom: (!isOpen && index < filtered.length - 1) ? '1px solid rgba(30,41,59,0.4)' : 'none',
                  cursor: hasChildren ? 'pointer' : 'default',
                  transition:'background 0.15s',
                  borderRadius: 6,
                  paddingLeft: 4, paddingRight: 4,
                }}
                onMouseEnter={e => { if (hasChildren) (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)' }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}
              >
                {/* Top row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:0 }}>
                    {item.icon && <span style={{ fontSize:14 }}>{item.icon}</span>}
                    <span style={{ fontSize: compact ? 12 : 13, fontWeight:700, color:'#F8FAFC', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.label}
                    </span>
                    {hasChildren && (
                      <ChevronRight size={12} style={{ color:'#64748B', flexShrink:0, transition:'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0, marginLeft:12 }}>
                    {showValue && (
                      <span style={{ fontSize: compact ? 12 : 13, fontWeight:700, color:'#F8FAFC', fontFamily:"'Space Grotesk',sans-serif" }}>
                        {item.valuePrefix || ''}{item.value.toLocaleString()}{item.unit ? ` ${item.unit}` : ''}
                      </span>
                    )}
                    {showPercent && (
                      <span style={{ fontSize: compact ? 11 : 12, fontWeight:700, color:'#94A3B8', minWidth:36, textAlign:'right' }}>
                        {pct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Category bar */}
                <div style={{ background:'#1A2234', borderRadius:4, height: compact ? 4 : 5 }}>
                  <div style={{ width:`${barWidth}%`, height:'100%', borderRadius:4, background:color, transition:'width 0.6s ease' }} />
                </div>
              </div>

              {/* Children (expanded) */}
              {isOpen && hasChildren && (
                <div style={{ marginLeft:16, marginBottom:8, paddingLeft:12, borderLeft:`2px solid ${color}33` }}>
                  {visibleChildren.map((child, ci) => {
                    const childPct = item.value > 0 ? (child.value / item.value) * 100 : 0
                    const childBar = (child.value / childMax) * 100
                    return (
                      <div key={`${child.label}-${ci}`}
                        style={{ paddingTop:8, paddingBottom:8, borderBottom: ci < visibleChildren.length - 1 ? '1px solid rgba(30,41,59,0.3)' : 'none' }}
                      >
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:11, fontWeight:500, color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                            {child.label}
                          </span>
                          <div style={{ display:'flex', gap:10, flexShrink:0, marginLeft:8 }}>
                            {showValue && (
                              <span style={{ fontSize:11, fontWeight:700, color:'#F8FAFC' }}>
                                {child.valuePrefix || ''}{child.value.toLocaleString()}{child.unit ? ` ${child.unit}` : ''}
                              </span>
                            )}
                            {showPercent && (
                              <span style={{ fontSize:10, color:'#64748B', minWidth:30, textAlign:'right' }}>
                                {childPct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ background:'#1A2234', borderRadius:3, height:3 }}>
                          <div style={{ width:`${childBar}%`, height:'100%', borderRadius:3, background:`${color}99`, transition:'width 0.5s ease' }} />
                        </div>
                      </div>
                    )
                  })}

                  {/* Show more children */}
                  {hiddenChildren > 0 && (
                    <button
                      onClick={e => { e.stopPropagation(); setChildExpanded(prev => ({...prev, [item.label]: !prev[item.label]})) }}
                      style={{ marginTop:6, width:'100%', padding:'6px', background:'transparent', border:'1px solid rgba(30,41,59,0.5)', borderRadius:6, color:'#64748B', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
                    >
                      {childExpanded[item.label] ? `▲ Show less` : `▼ Show ${hiddenChildren} more`}
                    </button>
                  )}
                </div>
              )}

              {isOpen && index < filtered.length - 1 && (
                <div style={{ height:1, background:'rgba(30,41,59,0.4)', marginBottom:2 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

