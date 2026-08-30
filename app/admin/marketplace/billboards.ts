/* ------------------------------------------------------------------ *
 * XPLORIX Exchange — billboards (paid placements)
 *
 * Planned tables:
 *   billboards        id, partner_id, placement, headline, subline,
 *                     cta_label, href, accent, image_url, tier,
 *                     starts_on, ends_on, weight, status
 *   billboard_events  id, billboard_id, type (impression|click),
 *                     actor_company_id, placement, created_at
 *
 * Rules enforced here rather than left to the UI:
 *   - every paid slot renders a "Sponsored" label
 *   - unsold inventory falls back to a house ad, never a blank box
 *   - placement is bought; ranking in results is not for sale
 * ------------------------------------------------------------------ */

export type Placement = 'hero' | 'banner' | 'grid'
export type Tier = 'Standard' | 'Premium' | 'Takeover' | 'House'

export interface Billboard {
  id: string
  partnerId: string | null      // null = house ad
  partnerName: string
  verified: boolean
  placement: Placement
  tier: Tier
  eyebrow: string               // small label above the headline
  headline: string
  subline: string
  ctaLabel: string
  href: string
  accent: string                // partner brand colour, used sparingly
  imageUrl?: string             // optional; falls back to a typographic plate
  startsOn: string
  endsOn: string
  weight: number                // rotation share within a placement
  impressions: number
  clicks: number
}

/* ---------------- Rate card ----------------
   Kept in code so the Partner Console and the invoice logic read
   from one source. Rates are monthly, USD. */

export const SLOT_SPECS: Record<Placement, {
  label: string
  description: string
  size: string
  monthlyRate: number
  maxConcurrent: number
}> = {
  hero: {
    label: 'Hero billboard',
    description: 'Top of the Exchange, beside the search. Seen by every buyer on entry.',
    size: '360 × 260',
    monthlyRate: 1800,
    maxConcurrent: 3,
  },
  banner: {
    label: 'Banner',
    description: 'Full width, between featured and results. Category targeting available.',
    size: '1100 × 110',
    monthlyRate: 900,
    maxConcurrent: 4,
  },
  grid: {
    label: 'In-grid placement',
    description: 'One card inside the results grid, clearly marked. Never affects ranking.',
    size: '258 × 400',
    monthlyRate: 650,
    maxConcurrent: 6,
  },
}

/* ---------------- Live campaigns ---------------- */

export const BILLBOARDS: Billboard[] = [
  {
    id: 'b1', partnerId: 'p6', partnerName: 'Perth Core Systems', verified: true,
    placement: 'hero', tier: 'Premium',
    eyebrow: 'New season stock',
    headline: 'Impregnated core bits, series 4 to 10',
    subline: 'BQ through PQ held in Perth and Kalgoorlie. Dispatch within 24 hours across APAC.',
    ctaLabel: 'View the range',
    href: '/admin/marketplace?partner=p6',
    accent: '#38BDF8',
    startsOn: '2026-08-01', endsOn: '2026-10-31', weight: 3,
    impressions: 18420, clicks: 604,
  },
  {
    id: 'b2', partnerId: 'p1', partnerName: 'Meridian Drilling Supplies', verified: true,
    placement: 'hero', tier: 'Standard',
    eyebrow: 'Monsoon stock clearance',
    headline: 'NQ and HQ rods at 12% off',
    subline: 'Heat treated, gauge checked, 220 rods ready to ship from Bengaluru.',
    ctaLabel: 'See rod stock',
    href: '/admin/marketplace?category=rods',
    accent: '#F97316',
    startsOn: '2026-08-15', endsOn: '2026-09-30', weight: 2,
    impressions: 9310, clicks: 388,
  },
  {
    id: 'b3', partnerId: 'p4', partnerName: 'Kivu Mining Supply SARL', verified: true,
    placement: 'banner', tier: 'Standard',
    eyebrow: 'Katanga and Lualaba',
    headline: 'Rig transport, customs and mobilisation across the copper belt',
    subline: 'Lowbed to 30 tonnes, permits and border crossings handled.',
    ctaLabel: 'Request a route quote',
    href: '/admin/marketplace/rig-transport-mobilisation-drc',
    accent: '#34D399',
    startsOn: '2026-07-01', endsOn: '2026-12-31', weight: 2,
    impressions: 12040, clicks: 271,
  },
  {
    id: 'b4', partnerId: 'p2', partnerName: 'Kalyan Exploration Equipment', verified: true,
    placement: 'grid', tier: 'Standard',
    eyebrow: 'Operated hire',
    headline: 'Two core rigs available in Karnataka',
    subline: 'Crew included, production reported straight into your XPLORIX dashboard.',
    ctaLabel: 'Check availability',
    href: '/admin/marketplace/core-drilling-rig-rental-karnataka',
    accent: '#FBBF24',
    startsOn: '2026-08-10', endsOn: '2026-11-30', weight: 2,
    impressions: 5120, clicks: 196,
  },
]

/* ---------------- House ads (unsold inventory) ---------------- */

export const HOUSE_ADS: Billboard[] = [
  {
    id: 'h1', partnerId: null, partnerName: 'XPLORIX', verified: false,
    placement: 'hero', tier: 'House',
    eyebrow: 'Supply the industry',
    headline: 'Sell to every drilling contractor on XPLORIX',
    subline: 'List equipment, parts and services. Quote requests arrive with the buyer\'s rig count and country already attached.',
    ctaLabel: 'Become a partner',
    href: '/partner/register',
    accent: '#F97316',
    startsOn: '2026-01-01', endsOn: '2099-01-01', weight: 1,
    impressions: 0, clicks: 0,
  },
  {
    id: 'h2', partnerId: null, partnerName: 'XPLORIX', verified: false,
    placement: 'banner', tier: 'House',
    eyebrow: 'Cannot find it',
    headline: 'Post a wanted request and we will put it to the supplier network',
    subline: 'Tell us the spec. Verified partners respond with pricing and lead times.',
    ctaLabel: 'Post a request',
    href: '/admin/marketplace/wanted/new',
    accent: '#F97316',
    startsOn: '2026-01-01', endsOn: '2099-01-01', weight: 1,
    impressions: 0, clicks: 0,
  },
  {
    id: 'h3', partnerId: null, partnerName: 'XPLORIX', verified: false,
    placement: 'grid', tier: 'House',
    eyebrow: 'Crew shortage',
    headline: 'Find a driller who can run your rig from day one',
    subline: 'Matched on rig experience and availability date, with production verified by XPLORIX.',
    ctaLabel: 'Browse available crew',
    href: '/admin/crew',
    accent: '#F97316',
    startsOn: '2026-01-01', endsOn: '2099-01-01', weight: 1,
    impressions: 0, clicks: 0,
  },
]

/* ---------------- Selection ---------------- */

const TODAY = '2026-08-30'

function isActive(b: Billboard): boolean {
  return b.startsOn <= TODAY && b.endsOn >= TODAY
}

/**
 * Weighted pick for a placement. `rotationKey` keeps the choice stable
 * within a render pass but lets callers rotate between slots.
 * Falls back to a house ad when nothing is sold.
 */
export function pickBillboard(placement: Placement, rotationKey = 0): Billboard {
  const pool = BILLBOARDS.filter((b) => b.placement === placement && isActive(b))
  if (pool.length === 0) {
    const house = HOUSE_ADS.filter((h) => h.placement === placement)
    return house[rotationKey % house.length]
  }
  const expanded = pool.flatMap((b) => Array<Billboard>(b.weight).fill(b))
  return expanded[rotationKey % expanded.length]
}

export function activeCount(placement: Placement): number {
  return BILLBOARDS.filter((b) => b.placement === placement && isActive(b)).length
}

/** Stub — replace with a POST to /api/billboard-events. */
export function trackBillboard(id: string, type: 'impression' | 'click') {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-console
  console.debug('[billboard]', type, id)
}

export function ctr(b: Billboard): string {
  if (!b.impressions) return '—'
  return `${((b.clicks / b.impressions) * 100).toFixed(2)}%`
}
