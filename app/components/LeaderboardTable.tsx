'use client'

import { useState } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface LeaderboardColumn {
  key: string
  label: string
  unit?: string
  prefix?: string
  sortable?: boolean
  highlight?: boolean          // bold + colored
  highlightColor?: string
  lowerIsBetter?: boolean      // for coloring trend
  format?: 'number' | 'percent' | 'currency'
  width?: number
}

export interface LeaderboardRow {
  id: string
  name: string
  sublabel?: string
  avatar?: string              // initials
  avatarColor?: string
  trend?: 'up' | 'down' | 'flat'
  alert?: boolean
  [key: string]: any
}

interface LeaderboardTableProps {
  rows: LeaderboardRow[]
  columns: LeaderboardColumn[]
  title?: string
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  defaultSortKey?: string
  defaultSortDir?: 'asc' | 'desc'
  onRowClick?: (row: LeaderboardRow) => void
  compact?: boolean
  showRank?: boolean
  highlightTopN?: number
}

export default function LeaderboardTable({
  rows,
  columns,
  title,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  defaultSortKey,
  defaultSortDir = 'desc',
  onRowClick,
  compact = false,
  showRank = true,
  highlightTopN = 3,
}: LeaderboardTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState(defaultSortKey || columns[0]?.key || '')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>(defaultSortDir)
  const [page, setPage] = useState(1)

  // Filter
  const filtered = rows.filter(row =>
    !search ||
    row.name.toLowerCase().includes(search.toLowerCase()) ||
    (row.sublabel || '').toLowerCase().includes(search.toLowerCase())
  )

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'desc' ? bv - av : av - bv
    }
    return sortDir === 'desc'
      ? String(bv).localeCompare(String(av))
      : String(av).localeCompare(String(bv))
  })

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  const formatValue = (val: any, col: LeaderboardColumn) => {
    if (val === undefined || val === null) return '—'
    if (col.format === 'percent') return `${val}%`
    if (col.format === 'currency') return `${col.prefix || ''}${Number(val).toLocaleString()}`
    if (typeof val === 'number') return `${col.prefix || ''}${val.toLocaleString()}${col.unit ? ` ${col.unit}` : ''}`
    return `${val}`
  }

  const getValueColor = (val: any, col: LeaderboardColumn, rank: number) => {
    if (!col.highlight) return '#94A3B8'
    if (col.highlightColor) return col.highlightColor
    // Auto color based on rank among all sorted values
    const allVals = sorted.map(r => r[col.key]).filter(v => typeof v === 'number')
    const maxV = Math.max(...allVals)
    const minV = Math.min(...allVals)
    const range = maxV - minV || 1
    const ratio = (val - minV) / range
    const isGood = col.lowerIsBetter ? ratio < 0.33 : ratio > 0.66
    const isBad  = col.lowerIsBetter ? ratio > 0.66 : ratio < 0.33
    if (isGood) return '#10B981'
    if (isBad)  return '#EF4444'
    return '#F59E0B'
  }

  const py = compact ? '8px 12px' : '12px 16px'

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
        {title && <div style={{ fontSize:14, fontWeight:700, color:'#F8FAFC' }}>{title}</div>}
        {searchable && (
          <div style={{ position:'relative', flex:1, maxWidth:280 }}>
            <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={searchPlaceholder}
              style={{ width:'100%', padding:'7px 10px 7px 28px', background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', borderRadius:8, color:'#F8FAFC', fontSize:12, outline:'none', fontFamily:'inherit' }}
            />
          </div>
        )}
        <div style={{ fontSize:11, color:'#64748B' }}>
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #1E293B' }}>
              {showRank && (
                <th style={{ padding: py, width:36, textAlign:'center', fontSize:10, fontWeight:700, color:'#334155', letterSpacing:'0.1em' }}>#</th>
              )}
              <th style={{ padding: py, textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                Name
              </th>
              {columns.map(col => (
                <th key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: py, textAlign:'right', fontSize:10, fontWeight:700,
                    color: sortKey===col.key ? '#F97316' : '#64748B',
                    letterSpacing:'0.1em', textTransform:'uppercase',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    whiteSpace:'nowrap', width: col.width,
                    transition:'color 0.2s',
                    userSelect:'none',
                  }}
                >
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
                    {col.label}{col.unit ? ` (${col.unit})` : ''}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length + (showRank ? 2 : 1)}
                  style={{ padding:'30px', textAlign:'center', color:'#64748B', fontSize:13 }}>
                  No results found
                </td>
              </tr>
            )}
            {paginated.map((row, i) => {
              const globalRank = (page - 1) * pageSize + i + 1
              const isTopN = globalRank <= highlightTopN
              const isAlert = row.alert
              return (
                <tr key={row.id}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom:'1px solid rgba(30,41,59,0.4)',
                    background: isAlert ? 'rgba(239,68,68,0.02)' : 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isAlert ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isAlert ? 'rgba(239,68,68,0.02)' : 'transparent'}
                >
                  {/* Rank */}
                  {showRank && (
                    <td style={{ padding: py, textAlign:'center' }}>
                      <span style={{
                        fontSize:11, fontWeight:800,
                        color: globalRank === 1 ? '#F59E0B' : globalRank === 2 ? '#94A3B8' : globalRank === 3 ? '#CD7F32' : '#334155',
                      }}>
                        {globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : globalRank}
                      </span>
                    </td>
                  )}

                  {/* Name */}
                  <td style={{ padding: py }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {/* Avatar */}
                      <div style={{
                        width:28, height:28, borderRadius:'50%', flexShrink:0,
                        background: row.avatarColor || 'linear-gradient(135deg,#F97316,#F59E0B)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:700, color:'#fff',
                      }}>
                        {row.avatar || row.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: compact ? 12 : 13, fontWeight: isTopN ? 700 : 500, color: isTopN ? '#F8FAFC' : '#94A3B8', whiteSpace:'nowrap' }}>
                          {row.name}
                        </div>
                        {row.sublabel && (
                          <div style={{ fontSize:10, color:'#64748B', marginTop:1 }}>{row.sublabel}</div>
                        )}
                      </div>
                      {/* Trend */}
                      {row.trend && (
                        <div style={{ marginLeft:4 }}>
                          {row.trend === 'up'   && <TrendingUp   size={12} style={{ color:'#10B981' }} />}
                          {row.trend === 'down' && <TrendingDown size={12} style={{ color:'#EF4444' }} />}
                          {row.trend === 'flat' && <Minus        size={12} style={{ color:'#64748B' }} />}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Data columns */}
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: py, textAlign:'right', whiteSpace:'nowrap' }}>
                      <span style={{
                        fontSize: compact ? 12 : 13,
                        fontWeight: col.highlight ? 700 : 500,
                        color: getValueColor(row[col.key], col, globalRank),
                        fontFamily: typeof row[col.key] === 'number' ? "'Space Grotesk',sans-serif" : 'inherit',
                      }}>
                        {formatValue(row[col.key], col)}
                      </span>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:12, borderTop:'1px solid #1E293B' }}>
          <span style={{ fontSize:11, color:'#64748B' }}>
            Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding:'5px 8px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color: page===1 ? '#334155' : '#94A3B8', cursor: page===1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1
              if (totalPages > 5) {
                if (page <= 3) p = i + 1
                else if (page >= totalPages - 2) p = totalPages - 4 + i
                else p = page - 2 + i
              }
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding:'5px 10px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    background: page===p ? '#F97316' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${page===p ? '#F97316' : '#1E293B'}`,
                    color: page===p ? '#fff' : '#94A3B8',
                  }}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding:'5px 8px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid #1E293B', color: page===totalPages ? '#334155' : '#94A3B8', cursor: page===totalPages ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
