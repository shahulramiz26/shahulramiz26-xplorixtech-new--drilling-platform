'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { pickBillboard, trackBillboard, type Billboard, type Placement } from './billboards'

const C = {
  panel: '#0D1117', panelHi: '#11161F', border: '#1E293B',
  text: '#F8FAFC', dim: '#94A3B8', muted: '#64748B', faint: '#334155',
  green: '#10B981',
}
const display = "'Space Grotesk', sans-serif"

/** Small, always-present disclosure. Never hidden, never abbreviated away. */
function SponsoredTag({ b }: { b: Billboard }) {
  const house = b.tier === 'House'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px',
      borderRadius: 5, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${C.border}`, color: C.muted, whiteSpace: 'nowrap',
    }}>
      {house ? 'From XPLORIX' : 'Sponsored'}
    </span>
  )
}

function Attribution({ b }: { b: Billboard }) {
  if (b.tier === 'House') return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted, minWidth: 0 }}>
      {b.verified && <BadgeCheck size={12} style={{ color: C.green, flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.partnerName}</span>
    </span>
  )
}

/** Typographic backdrop so a slot looks intentional without partner artwork. */
function Backdrop({ accent, imageUrl }: { accent: string; imageUrl?: string }) {
  return (
    <>
      {imageUrl && (
        <div aria-hidden style={{
          position: 'absolute', inset: 0, backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.28,
        }} />
      )}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(115deg, rgba(148,163,184,0.05) 0 1px, transparent 1px 12px)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', right: -50, top: -50, width: 220, height: 220,
        borderRadius: 36, transform: 'rotate(15deg)',
        background: `linear-gradient(135deg, ${accent}22, transparent 62%)`,
      }} />
      <div aria-hidden style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent, opacity: 0.85,
      }} />
    </>
  )
}

interface Props {
  placement: Placement
  rotationKey?: number
  /** Restrict to a category — lets you sell targeted inventory later. */
  className?: string
}

export default function BillboardSlot({ placement, rotationKey = 0, className }: Props) {
  const [b] = useState<Billboard>(() => pickBillboard(placement, rotationKey))
  const [hover, setHover] = useState(false)

  useEffect(() => { trackBillboard(b.id, 'impression') }, [b.id])

  const common = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: () => trackBillboard(b.id, 'click'),
  }

  /* ---------------- hero ---------------- */
  if (placement === 'hero') {
    return (
      <Link href={b.href} {...common} className={className}
        style={{
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', minHeight: 244, padding: '18px 20px', borderRadius: 15,
          background: `linear-gradient(140deg, ${C.panelHi} 0%, #090D13 100%)`,
          border: `1px solid ${hover ? `${b.accent}66` : C.border}`,
          transition: 'border-color .22s, transform .22s',
          transform: hover ? 'translateY(-2px)' : 'none',
        }}>
        <Backdrop accent={b.accent} imageUrl={b.imageUrl} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <SponsoredTag b={b} />
          <Attribution b={b} />
        </div>

        <div style={{ position: 'relative', marginTop: 14 }}>
          <div style={{
            fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: b.accent, fontWeight: 700, marginBottom: 8,
          }}>{b.eyebrow}</div>
          <div style={{
            fontSize: 19, fontWeight: 700, color: C.text, fontFamily: display,
            lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 8,
          }}>{b.headline}</div>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: 0 }}>{b.subline}</p>
        </div>

        <div style={{
          position: 'relative', marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 12.5, fontWeight: 700, color: b.accent,
        }}>
          {b.ctaLabel}
          <ArrowRight size={14} style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform .2s' }} />
        </div>
      </Link>
    )
  }

  /* ---------------- banner ---------------- */
  if (placement === 'banner') {
    return (
      <Link href={b.href} {...common} className={className}
        style={{
          position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 24, padding: '18px 24px', borderRadius: 14,
          background: `linear-gradient(120deg, ${C.panelHi} 0%, #090D13 100%)`,
          border: `1px solid ${hover ? `${b.accent}55` : C.border}`,
          transition: 'border-color .22s', flexWrap: 'wrap',
        }}>
        <Backdrop accent={b.accent} imageUrl={b.imageUrl} />

        <div style={{ position: 'relative', minWidth: 0, flex: '1 1 380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, flexWrap: 'wrap' }}>
            <SponsoredTag b={b} />
            <span style={{
              fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: b.accent, fontWeight: 700,
            }}>{b.eyebrow}</span>
          </div>
          <div style={{
            fontSize: 16, fontWeight: 600, color: C.text, fontFamily: display,
            lineHeight: 1.3, marginBottom: 5,
          }}>{b.headline}</div>
          <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.55 }}>{b.subline}</p>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          <Attribution b={b} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
            borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: b.accent,
            background: `${b.accent}18`, border: `1px solid ${b.accent}44`, whiteSpace: 'nowrap',
          }}>
            {b.ctaLabel}
            <ArrowRight size={13} style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform .2s' }} />
          </span>
        </div>
      </Link>
    )
  }

  /* ---------------- in-grid ---------------- */
  return (
    <Link href={b.href} {...common} className={className}
      style={{
        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        padding: 18, borderRadius: 14,
        background: `linear-gradient(150deg, ${C.panelHi} 0%, #090D13 100%)`,
        border: `1px dashed ${hover ? `${b.accent}66` : C.border}`,
        transition: 'border-color .22s',
      }}>
      <Backdrop accent={b.accent} imageUrl={b.imageUrl} />

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <SponsoredTag b={b} />
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{
          fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: b.accent, fontWeight: 700, marginBottom: 9,
        }}>{b.eyebrow}</div>
        <div style={{
          fontSize: 17, fontWeight: 700, color: C.text, fontFamily: display,
          lineHeight: 1.3, letterSpacing: '-0.02em', marginBottom: 10,
        }}>{b.headline}</div>
        <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: 0 }}>{b.subline}</p>
      </div>

      <div style={{
        position: 'relative', marginTop: 18, paddingTop: 14,
        borderTop: `1px solid ${C.border}`, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <Attribution b={b} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5,
          fontWeight: 700, color: b.accent, whiteSpace: 'nowrap',
        }}>
          {b.ctaLabel}
          <ArrowRight size={13} style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform .2s' }} />
        </span>
      </div>
    </Link>
  )
}
