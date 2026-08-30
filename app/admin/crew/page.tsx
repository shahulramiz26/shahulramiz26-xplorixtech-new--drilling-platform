'use client'

import { useState, useMemo } from 'react'
import {
  Search, BadgeCheck, MapPin, X, Plus, Users, Briefcase, Clock,
  CalendarDays, ShieldCheck, Send, Eye, ChevronRight, Plane, RotateCw,
} from 'lucide-react'
import {
  CREW, JOBS, CREW_ROLES, ROTATIONS, RIG_FAMILIES, CERTIFICATIONS,
  CREW_STATS, availabilityLabel, freshness,
  type CrewProfile, type JobPosting,
} from './data'

const C = {
  accent: '#F97316', accentSoft: 'rgba(249,115,22,0.10)',
  accentDim: 'rgba(249,115,22,0.14)', accentBorder: 'rgba(249,115,22,0.28)',
  panel: '#0D1117', panelHi: '#11161F', bg: '#080B10',
  border: '#1E293B', text: '#F8FAFC', dim: '#94A3B8',
  muted: '#64748B', faint: '#334155', green: '#10B981', amber: '#FBBF24',
}
const display = "'Space Grotesk', sans-serif"

/* ---------------- shared bits ---------------- */
function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'accent' | 'green' | 'amber' }) {
  const map = {
    neutral: ['rgba(255,255,255,0.04)', C.dim, C.border],
    accent: [C.accentSoft, C.accent, C.accentBorder],
    green: ['rgba(16,185,129,0.10)', '#34D399', 'rgba(16,185,129,0.22)'],
    amber: ['rgba(245,158,11,0.10)', C.amber, 'rgba(245,158,11,0.22)'],
  } as const
  const [bg, fg, bd] = map[tone]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
      borderRadius: 6, fontSize: 11, fontWeight: 600, background: bg, color: fg,
      border: `1px solid ${bd}`, whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

function StatBlock({ value, label, tone }: { value: string | number; label: string; tone?: string }) {
  return (
    <div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: tone ?? C.text, fontFamily: display,
        letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}

/* ---------------- crew card ---------------- */
function CrewCard({ c, onRequest }: { c: CrewProfile; onRequest: (c: CrewProfile) => void }) {
  const [hover, setHover] = useState(false)
  const avail = availabilityLabel(c.availableFrom)

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.panel, borderRadius: 14, padding: 18,
        border: `1px solid ${hover ? C.accentBorder : C.border}`,
        transition: 'border-color .2s', display: 'flex', flexDirection: 'column',
      }}>

      <div style={{ display: 'flex', gap: 13, marginBottom: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(245,158,11,0.10))',
          border: `1px solid ${C.accentBorder}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: display, fontWeight: 700, fontSize: 15, color: C.accent,
        }}>{c.initials}</div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: display, lineHeight: 1.3 }}>
            {c.displayName}
          </div>
          <div style={{ fontSize: 12.5, color: C.accent, fontWeight: 600, marginTop: 2 }}>
            {c.role} · {c.yearsExperience} yrs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.muted, marginTop: 4 }}>
            <MapPin size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.basedIn}</span>
          </div>
        </div>
      </div>

      {/* availability — the hard constraint, so it leads */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '10px 12px', borderRadius: 10, marginBottom: 13,
        background: avail.tone === 'now' ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${avail.tone === 'now' ? 'rgba(16,185,129,0.18)' : C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <CalendarDays size={13} style={{ color: avail.tone === 'now' ? C.green : C.dim, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: avail.tone === 'now' ? C.green : C.text }}>
            {avail.text}
          </span>
        </div>
        <span style={{ fontSize: 10.5, color: C.faint }}>{freshness(c.lastConfirmed)}</span>
      </div>

      {/* verified metreage — the thing only XPLORIX can attest to */}
      {c.verifiedMetres !== null ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 12px',
          borderRadius: 10, marginBottom: 13,
          background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.16)',
        }}>
          <ShieldCheck size={15} style={{ color: C.accent, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12.5, color: C.accent, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {c.verifiedMetres.toLocaleString()} m verified
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>
              Logged on XPLORIX rigs, {c.verifiedPeriod}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '11px 12px', borderRadius: 10, marginBottom: 13, fontSize: 11.5,
          color: C.muted, background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, lineHeight: 1.45,
        }}>
          Experience self-reported — no XPLORIX-logged production on record.
        </div>
      )}

      <div style={{ marginBottom: 11 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint, fontWeight: 700, marginBottom: 7 }}>
          Rig experience
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {c.rigFamilies.map((r) => <Pill key={r}>{r}</Pill>)}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 13 }}>
        <Pill><RotateCw size={10} />{c.rotationPrefs.join(', ')}</Pill>
        {c.passportValid && <Pill tone="green"><Plane size={10} />Passport valid</Pill>}
      </div>

      <p style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.6, margin: '0 0 15px' }}>{c.summary}</p>

      <button onClick={() => onRequest(c)} style={{
        marginTop: 'auto', width: '100%', padding: '10px', borderRadius: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
        background: hover ? 'linear-gradient(135deg,#F97316,#EA580C)' : C.accentSoft,
        color: hover ? '#fff' : C.accent,
        border: `1px solid ${hover ? 'transparent' : C.accentBorder}`, transition: 'all .2s',
      }}>
        <Send size={13} /> Request contact
      </button>
    </div>
  )
}

/* ---------------- job row ---------------- */
function JobRow({ j }: { j: JobPosting }) {
  const [hover, setHover] = useState(false)
  const tone = j.status === 'Live' ? 'green' : j.status === 'Draft' ? 'amber' : 'neutral'

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: C.panel, borderRadius: 13, padding: 18,
        border: `1px solid ${hover ? C.accentBorder : C.border}`,
        transition: 'border-color .2s', display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) auto', gap: 20, alignItems: 'center',
      }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8, flexWrap: 'wrap' }}>
          <Pill tone={tone as 'green' | 'amber' | 'neutral'}>{j.status}</Pill>
          <span style={{ fontSize: 11.5, color: C.faint }}>
            {j.status === 'Draft' ? 'Not published' : `Posted ${j.postedDaysAgo}d ago`}
          </span>
          {j.positions > 1 && <span style={{ fontSize: 11.5, color: C.muted }}>· {j.positions} positions</span>}
        </div>

        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: display, marginBottom: 9 }}>
          {j.title}
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: C.muted, marginBottom: 11 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} />{j.location}, {j.country}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><RotateCw size={12} />{j.rotation}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={12} />{j.experienceYears}+ yrs</span>
          <span style={{ color: C.dim, fontWeight: 600 }}>{j.salaryRange}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {j.rigFamilies.map((r) => <Pill key={r}>{r}</Pill>)}
          {j.certifications.slice(0, 2).map((c) => <Pill key={c}>{c}</Pill>)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: display, fontVariantNumeric: 'tabular-nums' }}>
            {j.applicants}
          </div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Applicants
          </div>
          {j.newApplicants > 0 && (
            <div style={{ fontSize: 10.5, color: C.accent, fontWeight: 700, marginTop: 3 }}>
              {j.newApplicants} new
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right', paddingLeft: 22, borderLeft: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.accent, fontFamily: display, fontVariantNumeric: 'tabular-nums' }}>
            {j.poolMatches}
          </div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Pool matches
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: C.faint, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{j.views}</span>
          <ChevronRight size={16} style={{ color: C.muted }} />
        </div>
      </div>
    </div>
  )
}

/* ---------------- page ---------------- */
export default function CrewPage() {
  const [tab, setTab] = useState<'pool' | 'jobs'>('pool')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [rotation, setRotation] = useState<string | null>(null)
  const [rig, setRig] = useState<string | null>(null)
  const [within, setWithin] = useState<number | null>(null)   // days
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [contactFor, setContactFor] = useState<CrewProfile | null>(null)
  const [showPost, setShowPost] = useState(false)

  const crew = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CREW.filter((c) => {
      if (role && c.role !== role) return false
      if (rotation && !c.rotationPrefs.includes(rotation)) return false
      if (rig && !c.rigFamilies.includes(rig)) return false
      if (verifiedOnly && c.verifiedMetres === null) return false
      if (within !== null) {
        const d = (new Date(c.availableFrom).getTime() - new Date('2026-08-30').getTime()) / 86_400_000
        if (d > within) return false
      }
      if (q) {
        const hay = `${c.displayName} ${c.role} ${c.basedIn} ${c.rigFamilies.join(' ')} ${c.summary}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    }).sort((a, b) => new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime())
  }, [query, role, rotation, rig, within, verifiedOnly])

  const clear = () => { setRole(null); setRotation(null); setRig(null); setWithin(null); setVerifiedOnly(false); setQuery('') }
  const hasFilters = !!(role || rotation || rig || within !== null || verifiedOnly || query)

  return (
    <div style={{ maxWidth: 1400 }}>

      {/* header */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 18, padding: '28px 32px',
        background: `linear-gradient(135deg, ${C.panelHi} 0%, ${C.bg} 70%)`,
        border: `1px solid ${C.border}`, marginBottom: 22,
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: 'repeating-linear-gradient(115deg, rgba(148,163,184,0.045) 0 1px, transparent 1px 14px)',
        }} />
        <div aria-hidden style={{
          position: 'absolute', right: -80, top: -90, width: 320, height: 320, borderRadius: 50,
          transform: 'rotate(15deg)', background: 'linear-gradient(135deg, rgba(249,115,22,0.12), transparent 60%)',
        }} />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.accent, fontWeight: 700, marginBottom: 10 }}>
              XPLORIX Crew
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: C.text, fontFamily: display, letterSpacing: '-0.03em', margin: '0 0 10px', lineHeight: 1.12, maxWidth: 560 }}>
              Crew who can run your rig from day one
            </h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, maxWidth: 500, lineHeight: 1.65 }}>
              Matched on rig experience, rotation and availability date — not job titles. Production
              figures are verified against rigs logged on XPLORIX.
            </p>
          </div>

          <button onClick={() => setShowPost(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 11,
            background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', border: 'none',
            fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(249,115,22,0.3)', whiteSpace: 'nowrap',
          }}>
            <Plus size={16} /> Post a job
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 30, marginTop: 24, flexWrap: 'wrap' }}>
          <StatBlock value={CREW_STATS.available} label="Available now" />
          <StatBlock value={CREW_STATS.verified} label="XPLORIX verified" tone={C.accent} />
          <StatBlock value={CREW_STATS.liveJobs} label="Your live jobs" />
          <StatBlock value={CREW_STATS.newApplicants} label="New applicants" tone={C.green} />
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, width: 'fit-content', marginBottom: 20 }}>
        {([['pool', 'Availability pool', Users], ['jobs', 'My job postings', Briefcase]] as const).map(([id, label, Icon]) => {
          const on = tab === id
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9,
              cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: on ? C.accentDim : 'transparent', color: on ? C.accent : C.muted,
            }}><Icon size={15} />{label}</button>
          )
        })}
      </div>

      {/* ============ POOL ============ */}
      {tab === 'pool' && (
        <>
          <div style={{
            padding: 18, borderRadius: 14, background: C.panel,
            border: `1px solid ${C.border}`, marginBottom: 20,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, marginBottom: 16,
            }}>
              <Search size={16} style={{ color: C.muted, flexShrink: 0 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by rig, location or experience — LF90, Copperbelt, DTH"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 13.5, fontFamily: 'inherit', minWidth: 0 }} />
              {query && <button onClick={() => setQuery('')} aria-label="Clear" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>}
            </div>

            <FilterRow label="Available within" options={[['2 weeks', 14], ['30 days', 30], ['90 days', 90]]}
              value={within} onChange={setWithin} />
            <FilterRow label="Role" options={CREW_ROLES.map((r) => [r, r])} value={role} onChange={setRole} />
            <FilterRow label="Rotation" options={ROTATIONS.map((r) => [r, r])} value={rotation} onChange={setRotation} />
            <FilterRow label="Rig experience" options={RIG_FAMILIES.map((r) => [r, r])} value={rig} onChange={setRig} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
              <button onClick={() => setVerifiedOnly(!verifiedOnly)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 9,
                cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                background: verifiedOnly ? C.accentDim : 'rgba(255,255,255,0.03)',
                border: `1px solid ${verifiedOnly ? C.accentBorder : C.border}`,
                color: verifiedOnly ? C.accent : C.dim,
              }}>
                <ShieldCheck size={14} /> XPLORIX-verified production only
              </button>
              {hasFilters && (
                <button onClick={clear} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Reset
                </button>
              )}
            </div>
          </div>

          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
            <strong style={{ color: C.text, fontWeight: 700 }}>{crew.length}</strong>{' '}
            {crew.length === 1 ? 'person' : 'people'} available · sorted by earliest start
          </div>

          {crew.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
              {crew.map((c) => <CrewCard key={c.id} c={c} onRequest={setContactFor} />)}
            </div>
          ) : (
            <EmptyState
              title="Nobody matches those constraints"
              body="Try widening the availability window or removing a rig family. You can also post the job — matched crew are notified automatically."
              action="Post a job" onAction={() => setShowPost(true)}
            />
          )}

          <div style={{
            marginTop: 24, padding: 16, borderRadius: 12, fontSize: 12, color: C.muted,
            background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, lineHeight: 1.65,
          }}>
            Everyone here has opted in to being visible and confirmed their availability within the
            last 30 days. Contact details are released only after the person accepts your request.
          </div>
        </>
      )}

      {/* ============ JOBS ============ */}
      {tab === 'jobs' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {JOBS.map((j) => <JobRow key={j.id} j={j} />)}
          </div>
          <button onClick={() => setShowPost(true)} style={{
            width: '100%', marginTop: 14, padding: '16px', borderRadius: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            background: 'transparent', border: `1px dashed ${C.border}`, color: C.muted,
            fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
          }}>
            <Plus size={16} /> Post another job
          </button>
        </>
      )}

      {contactFor && <ContactModal c={contactFor} onClose={() => setContactFor(null)} />}
      {showPost && <PostJobModal onClose={() => setShowPost(false)} />}
    </div>
  )
}

/* ---------------- helpers ---------------- */
function FilterRow<T extends string | number>({ label, options, value, onChange }: {
  label: string
  options: [string, T][]
  value: T | null
  onChange: (v: T | null) => void
}) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint, fontWeight: 700, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(([text, v]) => {
          const on = value === v
          return (
            <button key={text} onClick={() => onChange(on ? null : v)} style={{
              padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
              fontWeight: 600, fontFamily: 'inherit',
              background: on ? C.accentDim : 'rgba(255,255,255,0.03)',
              border: `1px solid ${on ? C.accentBorder : C.border}`, color: on ? C.accent : C.dim,
            }}>{text}</button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ title, body, action, onAction }: {
  title: string; body: string; action: string; onAction: () => void
}) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center', borderRadius: 14, background: C.panel, border: `1px dashed ${C.border}` }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, margin: '0 auto 16px',
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Users size={20} style={{ color: C.muted }} /></div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, fontFamily: display }}>{title}</div>
      <p style={{ fontSize: 13, color: C.muted, maxWidth: 360, margin: '0 auto 18px', lineHeight: 1.6 }}>{body}</p>
      <button onClick={onAction} style={{
        padding: '9px 18px', borderRadius: 10, cursor: 'pointer', background: C.accentSoft,
        border: `1px solid ${C.accentBorder}`, color: C.accent, fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
      }}>{action}</button>
    </div>
  )
}

/* ---------------- modals ---------------- */
const shell: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100, padding: 20,
  background: 'rgba(0,0,0,0.74)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const field: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
  color: C.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
}
const flabel: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: C.muted, fontWeight: 700, marginBottom: 6, display: 'block',
}

function ContactModal({ c, onClose }: { c: CrewProfile; onClose: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <div onClick={onClose} style={shell}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, background: C.panel,
        border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: display }}>
              {sent ? 'Request sent' : 'Request contact'}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{c.displayName} · {c.role}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', height: 'fit-content' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {sent ? (
            <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.7, margin: 0 }}>
              {c.displayName} has been notified. If they accept, their phone number and full name
              are released to you and the conversation moves off XPLORIX. You will get a
              notification either way, usually within 48 hours.
            </p>
          ) : (
            <>
              <div style={{ padding: 14, borderRadius: 11, marginBottom: 18, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.14)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, fontWeight: 700, marginBottom: 10 }}>
                  They will see
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
                  {[['Company', 'Apex Drilling Solutions'], ['Active rigs', '14'], ['Country', 'India'], ['Contact', 'Admin User']].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{k}</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={flabel}>Which role is this for</label>
                <select style={{ ...field, cursor: 'pointer' }}>
                  {JOBS.filter((j) => j.status === 'Live').map((j) => <option key={j.id}>{j.title}</option>)}
                  <option>Not linked to a posting</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={flabel}>Message</label>
                <textarea style={{ ...field, minHeight: 88, resize: 'vertical' }}
                  placeholder="Site, start date and what the rotation looks like." />
              </div>

              <button onClick={() => setSent(true)} style={{
                width: '100%', padding: 12, borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              }}>Send request</button>

              <p style={{ fontSize: 11.5, color: C.faint, textAlign: 'center', margin: '12px 0 0', lineHeight: 1.5 }}>
                Contact details are released only if they accept.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PostJobModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [rigs, setRigs] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div onClick={onClose} style={shell}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 580, maxHeight: '88vh', overflowY: 'auto',
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16,
      }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', gap: 12, position: 'sticky', top: 0, background: C.panel, zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: display }}>
              {step === 3 ? 'Job posted' : 'Post a job'}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
              {step === 3 ? 'Live on XPLORIX Crew' : `Step ${step} of 2`}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', height: 'fit-content' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          {step === 1 && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={flabel}>Job title</label>
                <input style={field} placeholder="Senior driller — surface diamond core" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={flabel}>Role</label>
                  <select style={{ ...field, cursor: 'pointer' }}>
                    {CREW_ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={flabel}>Positions</label>
                  <input style={field} defaultValue="1" inputMode="numeric" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={flabel}>Site location</label>
                  <input style={field} placeholder="Hospet, Karnataka" />
                </div>
                <div>
                  <label style={flabel}>Rotation</label>
                  <select style={{ ...field, cursor: 'pointer' }}>
                    {ROTATIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={flabel}>Start date</label>
                  <input style={field} type="date" />
                </div>
                <div>
                  <label style={flabel}>Minimum experience</label>
                  <input style={field} placeholder="8 years" />
                </div>
              </div>
              <button onClick={() => setStep(2)} style={{
                width: '100%', padding: 12, borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              }}>Continue</button>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: '0 0 18px' }}>
                Rig experience is what the matching runs on. Pick every family the person could
                step onto — being too narrow here is the main reason a posting gets no matches.
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={flabel}>Rig experience required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {RIG_FAMILIES.map((r) => {
                    const on = rigs.includes(r)
                    return (
                      <button key={r} onClick={() => toggle(rigs, r, setRigs)} style={{
                        padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        fontWeight: 600, fontFamily: 'inherit',
                        background: on ? C.accentDim : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${on ? C.accentBorder : C.border}`, color: on ? C.accent : C.dim,
                      }}>{r}</button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={flabel}>Certifications required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CERTIFICATIONS.map((c) => {
                    const on = certs.includes(c)
                    return (
                      <button key={c} onClick={() => toggle(certs, c, setCerts)} style={{
                        padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                        fontWeight: 600, fontFamily: 'inherit',
                        background: on ? C.accentDim : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${on ? C.accentBorder : C.border}`, color: on ? C.accent : C.dim,
                      }}>{c}</button>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={flabel}>Salary range</label>
                <input style={field} placeholder="₹85,000 – ₹1,10,000 / month" />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={flabel}>Description</label>
                <textarea style={{ ...field, minHeight: 100, resize: 'vertical' }}
                  placeholder="What the programme is, depth and hole sizes, crew size, camp arrangements." />
              </div>

              {rigs.length > 0 && (
                <div style={{
                  padding: 13, borderRadius: 11, marginBottom: 18, display: 'flex', gap: 10,
                  background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.14)',
                }}>
                  <Users size={16} style={{ color: C.accent, flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.55 }}>
                    <strong style={{ color: C.accent, fontWeight: 700 }}>
                      {CREW.filter((c) => c.rigFamilies.some((r) => rigs.includes(r))).length} people
                    </strong>{' '}
                    in the availability pool match this rig experience. They are notified when you publish.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={{
                  padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,
                  color: C.dim, fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit',
                }}>Back</button>
                <button onClick={() => setStep(3)} style={{
                  flex: 1, padding: 12, borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                }}>Publish job</button>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 13, margin: '0 auto 16px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><BadgeCheck size={23} style={{ color: C.green }} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8, fontFamily: display }}>
                Your job is live
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, maxWidth: 380, margin: '0 auto 20px' }}>
                It is published at xplorixtech.com/jobs and matched crew have been notified.
                Applications appear under My job postings.
              </p>
              <button onClick={onClose} style={{
                padding: '10px 22px', borderRadius: 10, cursor: 'pointer',
                background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit',
              }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
