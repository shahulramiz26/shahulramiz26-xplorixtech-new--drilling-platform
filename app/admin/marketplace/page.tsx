'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, SlidersHorizontal, BadgeCheck, MapPin, Bookmark,
  ArrowRight, Package, X,
} from 'lucide-react'
import {
  LISTINGS, CATEGORIES, CONDITIONS, COUNTRIES,
  formatPrice, type Listing,
} from './data'

/* ------------------------------------------------------------------ */
/* Tokens — inherited from the Admin Console shell                     */
/* ------------------------------------------------------------------ */
const C = {
  accent: '#F97316',
  accentDim: 'rgba(249,115,22,0.12)',
  accentBorder: 'rgba(249,115,22,0.25)',
  panel: '#0D1117',
  border: '#1E293B',
  text: '#F8FAFC',
  dim: '#94A3B8',
  muted: '#64748B',
  faint: '#334155',
  green: '#10B981',
}

const display = "'Space Grotesk', sans-serif"

/* ------------------------------------------------------------------ */
/* Equipment plate — stands in for photography until partners upload   */
/* ------------------------------------------------------------------ */
function EquipmentPlate({ listing, height = 168 }: { listing: Listing; height?: number }) {
  return (
    <div
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #11161F 0%, #0A0E14 100%)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'flex-end',
        padding: 16,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(148,163,184,0.05) 0px, rgba(148,163,184,0.05) 1px, transparent 1px, transparent 11px)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute', right: -30, top: -30,
          width: 150, height: 150, transform: 'rotate(15deg)',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.10), transparent 65%)',
          borderRadius: 24,
        }}
      />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.faint, fontWeight: 700 }}>
          {listing.brand}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'rgba(248,250,252,0.13)', fontFamily: display, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {listing.model}
        </div>
      </div>
    </div>
  )
}

function ConditionPill({ condition }: { condition: string }) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    New: { bg: 'rgba(16,185,129,0.10)', fg: '#34D399', bd: 'rgba(16,185,129,0.22)' },
    Used: { bg: 'rgba(148,163,184,0.10)', fg: '#94A3B8', bd: 'rgba(148,163,184,0.20)' },
    Refurbished: { bg: 'rgba(245,158,11,0.10)', fg: '#FBBF24', bd: 'rgba(245,158,11,0.22)' },
  }
  const s = map[condition] ?? map.Used
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
      whiteSpace: 'nowrap',
    }}>
      {condition}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Listing card — the spec strip is the point                          */
/* ------------------------------------------------------------------ */
function ListingCard({
  listing, saved, onToggleSave, onQuote,
}: {
  listing: Listing
  saved: boolean
  onToggleSave: (id: string) => void
  onQuote: (l: Listing) => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        background: C.panel,
        border: `1px solid ${hover ? 'rgba(249,115,22,0.28)' : C.border}`,
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform .22s ease, border-color .22s ease, box-shadow .22s ease',
        boxShadow: hover ? '0 14px 34px rgba(0,0,0,0.45)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative' }}>
        <Link href={`/admin/marketplace/${listing.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          <EquipmentPlate listing={listing} />
        </Link>
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <ConditionPill condition={listing.condition} />
        </div>
        <button
          onClick={() => onToggleSave(listing.id)}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: saved ? C.accentDim : 'rgba(8,11,16,0.7)',
            border: `1px solid ${saved ? C.accentBorder : C.border}`,
            color: saved ? C.accent : C.muted,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Bookmark size={14} fill={saved ? C.accent : 'none'} />
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700, marginBottom: 6 }}>
          {listing.categoryLabel}
        </div>

        <Link
          href={`/admin/marketplace/${listing.slug}`}
          style={{ textDecoration: 'none', color: C.text, fontSize: 15, fontWeight: 600, lineHeight: 1.35, fontFamily: display }}
        >
          {listing.title}
        </Link>

        {/* Spec strip — what a drilling engineer actually buys on */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, margin: '14px 0', background: C.border,
          border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden',
        }}>
          {listing.headlineSpecs.map((s) => (
            <div key={s.label} style={{ background: '#0A0E14', padding: '9px 8px' }}>
              <div style={{ fontSize: 9, color: C.faint, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600, marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.muted, marginBottom: 12 }}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.location}
          </span>
          {listing.year && <span style={{ color: C.faint }}>· {listing.year}</span>}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{
              fontSize: listing.priceType === 'on_request' ? 13 : 16,
              fontWeight: 700, fontFamily: display,
              color: listing.priceType === 'on_request' ? C.dim : C.text,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatPrice(listing)}
            </div>
            {listing.partner.verified && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: C.green, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <BadgeCheck size={13} /> Verified
              </span>
            )}
          </div>

          <button
            onClick={() => onQuote(listing)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: hover ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(249,115,22,0.10)',
              color: hover ? '#fff' : C.accent,
              border: `1px solid ${hover ? 'transparent' : C.accentBorder}`,
              transition: 'all .22s ease',
            }}
          >
            Request quote <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Quote drawer — pre-filled from the tenant's own XPLORIX profile     */
/* ------------------------------------------------------------------ */
function QuoteModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  const [qty, setQty] = useState('1')
  const [needBy, setNeedBy] = useState('')
  const [message, setMessage] = useState('')

  const field: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
    color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
  }
  const label: React.CSSProperties = {
    fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: C.muted, fontWeight: 700, marginBottom: 6, display: 'block',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto',
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16,
        }}
      >
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: display }}>
              {sent ? 'Request sent' : 'Request a quote'}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
              {listing.title}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div style={{ padding: '30px 22px 26px', textAlign: 'center' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, margin: '0 auto 14px',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BadgeCheck size={22} style={{ color: C.green }} />
            </div>
            <div style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 6 }}>
              {listing.partner.name} has your request
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 340, margin: '0 auto 20px' }}>
              They will contact you about pricing and availability. Track the status under My inquiries.
            </p>
            <Link href="/admin/marketplace/inquiries" onClick={onClose}
              style={{
                display: 'inline-block', padding: '10px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff',
                fontWeight: 700, fontSize: 13, textDecoration: 'none',
              }}>
              View my inquiries
            </Link>
          </div>
        ) : (
          <div style={{ padding: 22 }}>
            {/* The differentiator: none of this is typed by the customer */}
            <div style={{
              padding: 14, borderRadius: 11, marginBottom: 20,
              background: 'rgba(249,115,22,0.05)', border: `1px solid rgba(249,115,22,0.14)`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, fontWeight: 700, marginBottom: 10 }}>
                Sent with your request
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                {[
                  ['Company', 'Apex Drilling Solutions'],
                  ['Country', 'India'],
                  ['Active rigs', '14'],
                  ['Contact', 'Admin User'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={label}>Quantity</label>
                <input style={field} value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" />
              </div>
              <div>
                <label style={label}>Required by</label>
                <input style={field} type="date" value={needBy} onChange={(e) => setNeedBy(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={label}>Message</label>
              <textarea
                style={{ ...field, minHeight: 96, resize: 'vertical' }}
                placeholder="Anything the supplier should know — site conditions, delivery terms, inspection window."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              onClick={() => setSent(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(135deg, #F97316, #EA580C)', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
              }}
            >
              Send request
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function MarketplacePage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [sort, setSort] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [quoteFor, setQuoteFor] = useState<Listing | null>(null)

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = LISTINGS.filter((l) => {
      if (category !== 'all' && l.categoryId !== category) return false
      if (condition && l.condition !== condition) return false
      if (country && l.country !== country) return false
      if (q) {
        const hay = `${l.title} ${l.brand} ${l.model} ${l.categoryLabel} ${l.location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    if (sort === 'recent') out = [...out].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
    if (sort === 'price_low') out = [...out].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    return out
  }, [query, category, condition, country, sort])

  const activeFilters = [condition, country].filter(Boolean).length
  const clearAll = () => { setCondition(null); setCountry(null); setQuery(''); setCategory('all') }

  return (
    <div style={{ maxWidth: 1280 }}>

      {/* ---------- Header ---------- */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.accent, fontWeight: 700, marginBottom: 8 }}>
          XPLORIX Exchange
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.text, fontFamily: display, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.15 }}>
          Equipment, parts and services
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 8, maxWidth: 560, lineHeight: 1.6 }}>
          Listed by verified suppliers to the exploration drilling industry. Request a quote and
          your company details go across automatically.
        </p>
      </div>

      {/* ---------- Search ---------- */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 340px', display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 16px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
        }}>
          <Search size={17} style={{ color: C.muted, flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by model, brand or part — LF90, DTH bit, NQ rods"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: C.text, fontSize: 14, fontFamily: 'inherit', minWidth: 0,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search"
              style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', padding: 0 }}>
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px',
            borderRadius: 12, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
            background: activeFilters ? C.accentDim : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeFilters ? C.accentBorder : C.border}`,
            color: activeFilters ? C.accent : C.dim,
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilters > 0 && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 9, background: C.accent, color: '#fff',
              fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
            }}>{activeFilters}</span>
          )}
        </button>
      </div>

      {/* ---------- Category rail ---------- */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {CATEGORIES.map((c) => {
          const on = category === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
                padding: '8px 15px', borderRadius: 999, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                background: on ? C.accentDim : 'rgba(255,255,255,0.03)',
                border: `1px solid ${on ? C.accentBorder : C.border}`,
                color: on ? C.accent : C.dim,
                transition: 'all .18s',
              }}
            >
              {c.label}
              <span style={{ fontSize: 11, color: on ? 'rgba(249,115,22,0.65)' : C.faint, fontVariantNumeric: 'tabular-nums' }}>
                {c.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ---------- Filter panel ---------- */}
      {showFilters && (
        <div style={{
          padding: 18, borderRadius: 13, marginBottom: 20,
          background: C.panel, border: `1px solid ${C.border}`,
          display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'flex-start',
        }}>
          <FilterGroup title="Condition" options={CONDITIONS} value={condition} onChange={setCondition} />
          <FilterGroup title="Country" options={COUNTRIES} value={country} onChange={setCountry} />
          <FilterGroup
            title="Sort by"
            options={['recent', 'price_low']}
            labels={{ recent: 'Recently listed', price_low: 'Price, low to high' }}
            value={sort}
            onChange={(v) => setSort(v ?? 'recent')}
            allowNull={false}
          />
        </div>
      )}

      {/* ---------- Result count ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ fontSize: 13, color: C.muted }}>
          <strong style={{ color: C.text, fontWeight: 600 }}>{results.length}</strong>{' '}
          {results.length === 1 ? 'listing' : 'listings'}
        </div>
        {(activeFilters > 0 || query || category !== 'all') && (
          <button onClick={clearAll}
            style={{ background: 'none', border: 'none', color: C.accent, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear all
          </button>
        )}
      </div>

      {/* ---------- Grid ---------- */}
      {results.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(288px, 1fr))',
          gap: 18,
        }}>
          {results.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              saved={saved.has(l.id)}
              onToggleSave={toggleSave}
              onQuote={setQuoteFor}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          borderRadius: 14, background: C.panel, border: `1px dashed ${C.border}`,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, margin: '0 auto 16px',
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={20} style={{ color: C.muted }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: display }}>
            Nothing matches those filters
          </div>
          <p style={{ fontSize: 13, color: C.muted, maxWidth: 320, margin: '0 auto 18px', lineHeight: 1.6 }}>
            Try a wider search, or tell us what you are looking for and we will source it from our supplier network.
          </p>
          <button onClick={clearAll}
            style={{
              padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(249,115,22,0.10)', border: `1px solid ${C.accentBorder}`,
              color: C.accent, fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
            }}>
            Clear filters
          </button>
        </div>
      )}

      {quoteFor && <QuoteModal listing={quoteFor} onClose={() => setQuoteFor(null)} />}
    </div>
  )
}

function FilterGroup({
  title, options, value, onChange, labels, allowNull = true,
}: {
  title: string
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
  labels?: Record<string, string>
  allowNull?: boolean
}) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const on = value === o
          return (
            <button
              key={o}
              onClick={() => onChange(on && allowNull ? null : o)}
              style={{
                padding: '6px 13px', borderRadius: 8, cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                background: on ? C.accentDim : 'rgba(255,255,255,0.03)',
                border: `1px solid ${on ? C.accentBorder : C.border}`,
                color: on ? C.accent : C.dim,
              }}
            >
              {labels?.[o] ?? o}
            </button>
          )
        })}
      </div>
    </div>
  )
}
