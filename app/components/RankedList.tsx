'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'

export interface RankedItem {
  label: string
  value: number
  unit?: string
  color?: string
  sublabel?: string
}

interface RankedListProps {
  items: RankedItem[]
  title?: string
  showPercent?: boolean
  showValue?: boolean
  showRank?: boolean
  maxVisible?: number
  valuePrefix?: string
  compact?: boolean
  searchable?: boolean
  othersThreshold?: number   // group items below this % into "Others"
  colorMode?: 'cycle' | 'single' | 'auto'
  singleColor?: string
  emptyMessage?: string
  highlightTop?: number      // highlight top N items differently
}

const COLORS = [
  'var(--x-orange)','var(--x-blue)','var(--x-green)','var(--x-purple)',
  'var(--x-amber)','var(--x-faint)','var(--x-cyan)','var(--x-red)',
  'var(--x-pink)','var(--x-teal)',
]

export default function RankedList({
  items,
  title,
  showPercent = true,
  showValue = true,
  showRank = false,
  maxVisible = 8,
  valuePrefix = '',
  compact = false,
  searchable = false,
  othersThreshold = 0,
  colorMode = 'cycle',
  singleColor = 'var(--x-orange)',
  emptyMessage = 'No data available',
  highlightTop = 0,
}: RankedListProps) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  if (!items || items.length === 0) {
    return <div style={{ padding:'20px 0', textAlign:'center', color:'var(--x-faint)', fontSize:13 }}>{emptyMessage}</div>
  }

  // Sort by value descending
  const sorted = [...items].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((s, i) => s + i.value, 0)
  const maxVal = sorted[0]?.value || 1

  // Group small items into "Others" if threshold set
  let displayItems = sorted
  let othersItem: RankedItem | null = null
  if (othersThreshold > 0) {
    const main = sorted.filter(i => (i.value / total) * 100 >= othersThreshold)
    const others = sorted.filter(i => (i.value / total) * 100 < othersThreshold)
    if (others.length > 1) {
      othersItem = {
        label: `Others (${others.length} items)`,
        value: others.reduce((s, i) => s + i.value, 0),
        color: 'var(--x-dim)',
      }
      displayItems = [...main, othersItem]
    }
  }

  // Apply search
  const searched = search
    ? displayItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : displayItems

  // Apply max visible
  const visible = expanded ? searched : searched.slice(0, maxVisible)
  const hiddenCount = searched.length - maxVisible

  const getColor = (item: RankedItem, index: number) => {
    if (item.color) return item.color
    if (colorMode === 'single') return singleColor
    return COLORS[index % COLORS.length]
  }

  const py = compact ? 9 : 13

  return (
    <div>
      {title && (
        <div style={{ fontSize:14, fontWeight:700, color:'var(--x-text)', marginBottom:14 }}>{title}</div>
      )}

      {searchable && (
        <div style={{ position:'relative', marginBottom:12 }}>
          <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--x-faint)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width:'100%', padding:'7px 10px 7px 28px',
              background:'rgba(var(--x-ov),0.04)', border:'1px solid var(--x-border)',
              borderRadius:8, color:'var(--x-text)', fontSize:12, outline:'none',
              fontFamily:'inherit',
            }}
          />
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column' }}>
        {visible.map((item, index) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0
          const barWidth = (item.value / maxVal) * 100
          const color = getColor(item, index)
          const isTop = highlightTop > 0 && index < highlightTop

          return (
            <div key={`${item.label}-${index}`}
              style={{
                paddingTop: py, paddingBottom: py,
                borderBottom: index < visible.length - 1 ? '1px solid color-mix(in srgb, var(--x-border) 40%, transparent)' : 'none',
              }}
            >
              {/* Label row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1 }}>
                  {showRank && (
                    <span style={{ fontSize:10, fontWeight:700, color:'var(--x-dim)', width:16, flexShrink:0, textAlign:'right' }}>
                      {index + 1}
                    </span>
                  )}
                  <div style={{ minWidth:0 }}>
                    <div style={{
                      fontSize: compact ? 12 : 13,
                      fontWeight: isTop ? 700 : 600,
                      color: isTop ? 'var(--x-text)' : 'var(--x-muted)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    }}>
                      {item.label}
                    </div>
                    {item.sublabel && (
                      <div style={{ fontSize:10, color:'var(--x-faint)', marginTop:1 }}>{item.sublabel}</div>
                    )}
                  </div>
                </div>

                {/* Value + Percent */}
                <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0, marginLeft:12 }}>
                  {showValue && (
                    <span style={{ fontSize: compact ? 12 : 13, fontWeight:700, color:'var(--x-text)', fontFamily:"'Space Grotesk',sans-serif" }}>
                      {valuePrefix}{item.value.toLocaleString()}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                  )}
                  {showPercent && (
                    <span style={{ fontSize: compact ? 11 : 12, fontWeight:700, color:'var(--x-muted)', minWidth:36, textAlign:'right' }}>
                      {pct.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ background:'var(--x-raised2)', borderRadius:4, height: compact ? 4 : 5, overflow:'hidden' }}>
                <div style={{
                  width:`${barWidth}%`, height:'100%',
                  background: color,
                  borderRadius:4,
                  transition:'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more / less */}
      {!search && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop:10, width:'100%', padding:'8px',
            background:'rgba(var(--x-ov),0.03)', border:'1px solid var(--x-border)',
            borderRadius:8, color:'var(--x-faint)', fontSize:12, fontWeight:600,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='var(--x-text)'; (e.currentTarget as HTMLElement).style.borderColor='var(--x-dim)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='var(--x-faint)'; (e.currentTarget as HTMLElement).style.borderColor='var(--x-border)' }}
        >
          {expanded
            ? <><ChevronUp size={13} /> Show less</>
            : <><ChevronDown size={13} /> Show {hiddenCount} more</>
          }
        </button>
      )}
    </div>
  )
}
