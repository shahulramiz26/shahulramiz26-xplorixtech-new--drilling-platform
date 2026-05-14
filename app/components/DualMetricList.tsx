'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

export interface DualMetricItem {
  label: string
  metric1: number       // e.g. Failure Count
  metric2: number       // e.g. Downtime Hours
  metric1Unit?: string
  metric2Unit?: string
  sublabel?: string
  alert?: boolean       // flag this row as critical
}

interface DualMetricListProps {
  items: DualMetricItem[]
  title?: string
  metric1Label: string
  metric2Label: string
  metric1Color?: string
  metric2Color?: string
  metric1Prefix?: string
  metric2Prefix?: string
  maxVisible?: number
  searchable?: boolean
  compact?: boolean
  sortBy?: 'metric1' | 'metric2'
  alertThreshold?: number   // metric2 values above this get flagged
}

export default function DualMetricList({
  items,
  title,
  metric1Label,
  metric2Label,
  metric1Color = '#3B82F6',
  metric2Color = '#EF4444',
  metric1Prefix = '',
  metric2Prefix = '',
  maxVisible = 8,
  searchable = false,
  compact = false,
  sortBy = 'metric2',
  alertThreshold,
}: DualMetricListProps) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [activeSortBy, setActiveSortBy] = useState<'metric1'|'metric2'>(sortBy)

  const sorted = [...items].sort((a, b) =>
    activeSortBy === 'metric1' ? b.metric1 - a.metric1 : b.metric2 - a.metric2
  )

  const maxM1 = Math.max(...sorted.map(i => i.metric1), 1)
  const maxM2 = Math.max(...sorted.map(i => i.metric2), 1)

  const searched = search
    ? sorted.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : sorted

  const visible = expanded ? searched : searched.slice(0, maxVisible)
  const hiddenCount = searched.length - maxVisible
  const py = compact ? 9 : 13

  return (
    <div>
      {/* Header */}
      {(title || searchable) && (
        <div style={{ marginBottom:14 }}>
          {title && <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC', marginBottom: searchable ? 10 : 0 }}>{title}</div>}
          {searchable && (
            <div style={{ position:'relative' }}>
              <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search components..."
                style={{ width:'100%', padding:'7px 10px 7px 28px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit' }} />
            </div>
          )}
        </div>
      )}

      {/* Legend + Sort */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', gap:14 }}>
          {[{ label:metric1Label, color:metric1Color, key:'metric1' as const },
            { label:metric2Label, color:metric2Color, key:'metric2' as const }].map(m => (
            <button key={m.key} onClick={() => setActiveSortBy(m.key)}
              style={{
                display:'flex', alignItems:'center', gap:5, border:'none', cursor:'pointer',
                padding:'3px 8px', borderRadius:6,
                background: activeSortBy===m.key ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}>
              <div style={{ width:10, height:10, borderRadius:2, background:m.color, flexShrink:0 }} />
              <span style={{ fontSize:11, fontWeight:600, color: activeSortBy===m.key ? '#F8FAFC' : '#64748B' }}>{m.label}</span>
            </button>
          ))}
        </div>
        <span style={{ fontSize:10, color:'#334155' }}>tap legend to sort</span>
      </div>

      {/* Rows */}
      <div style={{ display:'flex', flexDirection:'column' }}>
        {visible.map((item, index) => {
          const isAlert = alertThreshold !== undefined && item.metric2 > alertThreshold
          return (
            <div key={`${item.label}-${index}`}
              style={{
                paddingTop: py, paddingBottom: py,
                borderBottom: index < visible.length - 1 ? '1px solid rgba(30,41,59,0.4)' : 'none',
                background: isAlert ? 'rgba(239,68,68,0.02)' : 'transparent',
                borderRadius: isAlert ? 6 : 0,
                paddingLeft: isAlert ? 6 : 0,
              }}
            >
              {/* Label */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {isAlert && <AlertTriangle size={11} style={{ color:'#EF4444', flexShrink:0 }} />}
                  <span style={{ fontSize: compact ? 12 : 13, fontWeight:600, color: isAlert ? '#F8FAFC' : '#94A3B8' }}>{item.label}</span>
                  {item.sublabel && <span style={{ fontSize:10, color:'#64748B' }}>· {item.sublabel}</span>}
                </div>
                {/* Values */}
                <div style={{ display:'flex', gap:16, flexShrink:0 }}>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize: compact ? 11 : 12, fontWeight:700, color:metric1Color }}>
                      {metric1Prefix}{item.metric1.toLocaleString()}{item.metric1Unit ? ` ${item.metric1Unit}` : ''}
                    </div>
                    <div style={{ fontSize:9, color:'#64748B', marginTop:1 }}>{metric1Label}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize: compact ? 11 : 12, fontWeight:700, color: isAlert ? '#EF4444' : metric2Color }}>
                      {metric2Prefix}{item.metric2.toLocaleString()}{item.metric2Unit ? ` ${item.metric2Unit}` : ''}
                    </div>
                    <div style={{ fontSize:9, color:'#64748B', marginTop:1 }}>{metric2Label}</div>
                  </div>
                </div>
              </div>

              {/* Dual bars */}
              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {/* Metric 1 bar */}
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:60, fontSize:9, color:'#334155', textAlign:'right', flexShrink:0 }}>{metric1Label}</div>
                  <div style={{ flex:1, background:'#1A2234', borderRadius:3, height: compact ? 4 : 5 }}>
                    <div style={{ width:`${(item.metric1/maxM1)*100}%`, height:'100%', borderRadius:3, background:metric1Color, transition:'width 0.6s ease' }} />
                  </div>
                </div>
                {/* Metric 2 bar */}
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:60, fontSize:9, color:'#334155', textAlign:'right', flexShrink:0 }}>{metric2Label}</div>
                  <div style={{ flex:1, background:'#1A2234', borderRadius:3, height: compact ? 4 : 5 }}>
                    <div style={{ width:`${(item.metric2/maxM2)*100}%`, height:'100%', borderRadius:3, background: isAlert ? '#EF4444' : metric2Color, transition:'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {!search && hiddenCount > 0 && (
        <button onClick={() => setExpanded(!expanded)}
          style={{ marginTop:10, width:'100%', padding:'8px', background:'rgba(255,255,255,0.03)', border:'1px solid #1E293B', borderRadius:8, color:'#64748B', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#F8FAFC' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#64748B' }}
        >
          {expanded ? <><ChevronUp size={13}/> Show less</> : <><ChevronDown size={13}/> Show {hiddenCount} more</>}
        </button>
      )}
    </div>
  )
}

