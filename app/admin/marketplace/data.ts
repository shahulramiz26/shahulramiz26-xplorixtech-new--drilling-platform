// Mock data for the XPLORIX Exchange MVP.
// Replace with Supabase / API queries once the Exchange schema is live.
// Shape mirrors the planned tables: listings + listing_specs + partners.

export type PriceType = 'fixed' | 'on_request' | 'rental'
export type Condition = 'New' | 'Used' | 'Refurbished'

export interface SpecRow {
  label: string
  value: string
}

export interface Partner {
  id: string
  name: string
  country: string
  verified: boolean
  memberSince: string
  listingCount: number
}

export interface Listing {
  id: string
  slug: string
  title: string
  brand: string
  model: string
  categoryId: string
  categoryLabel: string
  condition: Condition
  year: number | null
  location: string
  country: string
  priceType: PriceType
  price: number | null
  currency: string
  availability: string
  featured: boolean
  // The three specs shown on the card — always the category's most
  // decision-relevant fields, not marketing copy.
  headlineSpecs: SpecRow[]
  specs: SpecRow[]
  description: string
  partner: Partner
  postedDaysAgo: number
}

export const CATEGORIES = [
  { id: 'all', label: 'All equipment', count: 9 },
  { id: 'rigs', label: 'Drilling rigs', count: 3 },
  { id: 'bits', label: 'Drill bits', count: 1 },
  { id: 'rods', label: 'Rods & casing', count: 1 },
  { id: 'downhole', label: 'Downhole tools', count: 1 },
  { id: 'support', label: 'Support equipment', count: 2 },
  { id: 'services', label: 'Services & rentals', count: 1 },
]

const PARTNERS: Record<string, Partner> = {
  meridian: {
    id: 'p1',
    name: 'Meridian Drilling Supplies',
    country: 'India',
    verified: true,
    memberSince: 'Jan 2026',
    listingCount: 24,
  },
  kalyan: {
    id: 'p2',
    name: 'Kalyan Exploration Equipment',
    country: 'India',
    verified: true,
    memberSince: 'Mar 2026',
    listingCount: 11,
  },
  sahara: {
    id: 'p3',
    name: 'Sahara Rig Services FZE',
    country: 'UAE',
    verified: false,
    memberSince: 'Jul 2026',
    listingCount: 6,
  },
  kivu: {
    id: 'p4',
    name: 'Kivu Mining Supply SARL',
    country: 'DRC',
    verified: true,
    memberSince: 'Feb 2026',
    listingCount: 9,
  },
}

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    slug: 'sandvik-de740-surface-core-drill',
    title: 'Sandvik DE740 surface core drill',
    brand: 'Sandvik',
    model: 'DE740',
    categoryId: 'rigs',
    categoryLabel: 'Surface core drill',
    condition: 'Used',
    year: 2019,
    location: 'Hospet, Karnataka',
    country: 'India',
    priceType: 'on_request',
    price: null,
    currency: 'INR',
    availability: 'Available now',
    featured: true,
    headlineSpecs: [
      { label: 'Max depth', value: '1,200 m' },
      { label: 'Hole size', value: 'NQ / HQ' },
      { label: 'Hours', value: '6,400' },
    ],
    specs: [
      { label: 'Maximum drilling depth', value: '1,200 m (NQ)' },
      { label: 'Hole diameter', value: 'NQ, HQ, PQ' },
      { label: 'Rod size', value: '3 m' },
      { label: 'Rotation speed', value: '0–1,250 rpm' },
      { label: 'Feed force', value: '45 kN' },
      { label: 'Pullback force', value: '75 kN' },
      { label: 'Engine', value: 'Caterpillar C7.1' },
      { label: 'Engine power', value: '168 kW / 225 HP' },
      { label: 'Operating hours', value: '6,400' },
      { label: 'Rig weight', value: '9,800 kg' },
    ],
    description:
      'Single owner since new, operated on iron ore exploration contracts in Karnataka. Full service history available. Rod handler and water pump included. Recent hydraulic overhaul at 6,100 hours. Available for inspection at our Hospet yard with two weeks notice.',
    partner: PARTNERS.meridian,
    postedDaysAgo: 4,
  },
  {
    id: 'l2',
    slug: 'boart-longyear-lf90d',
    title: 'Boart Longyear LF90D track-mounted rig',
    brand: 'Boart Longyear',
    model: 'LF90D',
    categoryId: 'rigs',
    categoryLabel: 'Surface core drill',
    condition: 'Refurbished',
    year: 2016,
    location: 'Lubumbashi',
    country: 'DRC',
    priceType: 'fixed',
    price: 18500000,
    currency: 'INR',
    availability: 'Available now',
    featured: true,
    headlineSpecs: [
      { label: 'Max depth', value: '1,500 m' },
      { label: 'Hole size', value: 'BQ – PQ' },
      { label: 'Hours', value: '11,200' },
    ],
    specs: [
      { label: 'Maximum drilling depth', value: '1,500 m (BQ)' },
      { label: 'Hole diameter', value: 'BQ, NQ, HQ, PQ' },
      { label: 'Rod size', value: '3 m' },
      { label: 'Rotation speed', value: '0–1,100 rpm' },
      { label: 'Feed force', value: '53 kN' },
      { label: 'Engine', value: 'Deutz TCD 2013' },
      { label: 'Engine power', value: '160 kW / 215 HP' },
      { label: 'Operating hours', value: '11,200' },
      { label: 'Mounting', value: 'Tracked carrier' },
    ],
    description:
      'Fully refurbished in 2025 — new mast bearings, rebuilt rotation head, new hydraulic hoses throughout. Suitable for copper-cobalt belt exploration. Price ex-yard Lubumbashi, export documentation supported.',
    partner: PARTNERS.kivu,
    postedDaysAgo: 9,
  },
  {
    id: 'l3',
    slug: 'epiroc-cm760d-dth-rig',
    title: 'Epiroc CM760D DTH blast hole rig',
    brand: 'Epiroc',
    model: 'CM760D',
    categoryId: 'rigs',
    categoryLabel: 'DTH rig',
    condition: 'Used',
    year: 2021,
    location: 'Bellary, Karnataka',
    country: 'India',
    priceType: 'on_request',
    price: null,
    currency: 'INR',
    availability: 'Available from Oct 2026',
    featured: false,
    headlineSpecs: [
      { label: 'Hole range', value: '105–165 mm' },
      { label: 'Max depth', value: '54 m' },
      { label: 'Hours', value: '3,900' },
    ],
    specs: [
      { label: 'Hole diameter range', value: '105–165 mm' },
      { label: 'Maximum hole depth', value: '54 m' },
      { label: 'Rod length', value: '3.5 m' },
      { label: 'Compressor', value: '25.5 bar, 21 m³/min' },
      { label: 'Engine', value: 'Cummins QSL9' },
      { label: 'Engine power', value: '242 kW / 325 HP' },
      { label: 'Operating hours', value: '3,900' },
    ],
    description:
      'Currently on contract until end of September. Well maintained, service records logged in XPLORIX. Dust collector and rod handling system in good condition.',
    partner: PARTNERS.kalyan,
    postedDaysAgo: 2,
  },
  {
    id: 'l4',
    slug: 'dth-hammer-bits-6-inch',
    title: '6" DTH hammer bits — QL60 shank, 152 mm',
    brand: 'Rockmore',
    model: 'QL60',
    categoryId: 'bits',
    categoryLabel: 'DTH bit',
    condition: 'New',
    year: null,
    location: 'Bengaluru, Karnataka',
    country: 'India',
    priceType: 'fixed',
    price: 34500,
    currency: 'INR',
    availability: '40 in stock',
    featured: false,
    headlineSpecs: [
      { label: 'Diameter', value: '152 mm' },
      { label: 'Shank', value: 'QL60' },
      { label: 'Face', value: 'Concave' },
      ],
    specs: [
      { label: 'Bit diameter', value: '152 mm (6")' },
      { label: 'Shank type', value: 'QL60' },
      { label: 'Face design', value: 'Concave' },
      { label: 'Button type', value: 'Spherical carbide' },
      { label: 'Button count', value: '8 gauge / 4 face' },
      { label: 'Recommended formation', value: 'Medium to hard abrasive' },
      { label: 'Minimum order', value: '5 units' },
    ],
    description:
      'Genuine Rockmore bits held in Bengaluru stock. Volume pricing available above 20 units. Same-day dispatch across South India.',
    partner: PARTNERS.meridian,
    postedDaysAgo: 1,
  },
  {
    id: 'l5',
    slug: 'nq-drill-rods-3m',
    title: 'NQ wireline drill rods — 3 m, heat treated',
    brand: 'Meridian',
    model: 'NQ-3000',
    categoryId: 'rods',
    categoryLabel: 'Drill rod',
    condition: 'New',
    year: null,
    location: 'Bengaluru, Karnataka',
    country: 'India',
    priceType: 'fixed',
    price: 12800,
    currency: 'INR',
    availability: '220 in stock',
    featured: false,
    headlineSpecs: [
      { label: 'Size', value: 'NQ' },
      { label: 'Length', value: '3.0 m' },
      { label: 'Wall', value: '4.85 mm' },
    ],
    specs: [
      { label: 'Rod size', value: 'NQ' },
      { label: 'Length', value: '3.0 m' },
      { label: 'Outside diameter', value: '69.9 mm' },
      { label: 'Wall thickness', value: '4.85 mm' },
      { label: 'Thread', value: 'NQ standard wireline' },
      { label: 'Material', value: 'Heat treated alloy steel' },
      { label: 'Weight per rod', value: '23.5 kg' },
    ],
    description:
      'Priced per rod. Threads gauge-checked before dispatch. Bulk rates for orders above 50 rods, delivered ex-Bengaluru.',
    partner: PARTNERS.meridian,
    postedDaysAgo: 6,
  },
  {
    id: 'l6',
    slug: 'hq3-core-barrel-assembly',
    title: 'HQ3 triple tube core barrel assembly',
    brand: 'Fordia',
    model: 'HQ3',
    categoryId: 'downhole',
    categoryLabel: 'Core barrel',
    condition: 'New',
    year: null,
    location: 'Sharjah',
    country: 'UAE',
    priceType: 'on_request',
    price: null,
    currency: 'USD',
    availability: 'Lead time 3 weeks',
    featured: false,
    headlineSpecs: [
      { label: 'Size', value: 'HQ3' },
      { label: 'Type', value: 'Triple tube' },
      { label: 'Length', value: '3.0 m' },
    ],
    specs: [
      { label: 'Barrel size', value: 'HQ3' },
      { label: 'Configuration', value: 'Triple tube wireline' },
      { label: 'Core diameter', value: '61.1 mm' },
      { label: 'Barrel length', value: '3.0 m' },
      { label: 'Split tube', value: 'Included' },
      { label: 'Application', value: 'Broken and fractured ground' },
    ],
    description:
      'Complete assembly including head, outer tube, inner tube and split tube. Improves recovery significantly in fractured ground compared with double tube.',
    partner: PARTNERS.sahara,
    postedDaysAgo: 13,
  },
  {
    id: 'l7',
    slug: 'atlas-copco-xas-186-compressor',
    title: 'Atlas Copco XAS 186 portable compressor',
    brand: 'Atlas Copco',
    model: 'XAS 186',
    categoryId: 'support',
    categoryLabel: 'Compressor',
    condition: 'Used',
    year: 2020,
    location: 'Hospet, Karnataka',
    country: 'India',
    priceType: 'fixed',
    price: 1450000,
    currency: 'INR',
    availability: 'Available now',
    featured: false,
    headlineSpecs: [
      { label: 'Free air', value: '10.6 m³/min' },
      { label: 'Pressure', value: '7 bar' },
      { label: 'Hours', value: '4,100' },
    ],
    specs: [
      { label: 'Free air delivery', value: '10.6 m³/min' },
      { label: 'Working pressure', value: '7 bar' },
      { label: 'Engine', value: 'Kubota V3307' },
      { label: 'Operating hours', value: '4,100' },
      { label: 'Fuel tank', value: '120 L' },
      { label: 'Mounting', value: 'Two-wheel towable' },
    ],
    description:
      'Reliable unit, used for air flush support on core drilling contracts. New air filters and oil separator fitted this year.',
    partner: PARTNERS.kalyan,
    postedDaysAgo: 20,
  },
  {
    id: 'l8',
    slug: 'bean-435-mud-pump',
    title: 'Bean 435 triplex mud pump',
    brand: 'Bean',
    model: '435',
    categoryId: 'support',
    categoryLabel: 'Mud pump',
    condition: 'Refurbished',
    year: 2018,
    location: 'Lubumbashi',
    country: 'DRC',
    priceType: 'on_request',
    price: null,
    currency: 'USD',
    availability: 'Available now',
    featured: false,
    headlineSpecs: [
      { label: 'Flow', value: '132 L/min' },
      { label: 'Pressure', value: '69 bar' },
      { label: 'Type', value: 'Triplex' },
    ],
    specs: [
      { label: 'Maximum flow', value: '132 L/min' },
      { label: 'Maximum pressure', value: '69 bar (1,000 psi)' },
      { label: 'Pump type', value: 'Triplex piston' },
      { label: 'Drive', value: 'Diesel, Yanmar' },
      { label: 'Condition note', value: 'New fluid end fitted 2025' },
    ],
    description:
      'Rebuilt fluid end and new pistons. Suitable as a direct replacement on LF90 and UDR class rigs.',
    partner: PARTNERS.kivu,
    postedDaysAgo: 16,
  },
  {
    id: 'l9',
    slug: 'core-drilling-rig-rental-karnataka',
    title: 'Core drilling rig rental — operated, Karnataka',
    brand: 'Kalyan',
    model: 'Rental',
    categoryId: 'services',
    categoryLabel: 'Rig rental',
    condition: 'New',
    year: null,
    location: 'Bellary, Karnataka',
    country: 'India',
    priceType: 'rental',
    price: 185000,
    currency: 'INR',
    availability: 'Two rigs available',
    featured: false,
    headlineSpecs: [
      { label: 'Rate basis', value: 'Per day' },
      { label: 'Crew', value: 'Included' },
      { label: 'Minimum', value: '30 days' },
    ],
    specs: [
      { label: 'Rate basis', value: 'Per rig, per day' },
      { label: 'Minimum hire period', value: '30 days' },
      { label: 'Crew', value: 'Driller and two assistants included' },
      { label: 'Consumables', value: 'Client supplied' },
      { label: 'Mobilisation', value: 'Quoted separately' },
      { label: 'Rig type', value: 'Surface core, NQ/HQ capable' },
    ],
    description:
      'Operated rig hire across Karnataka and northern Andhra Pradesh. Daily production reported through XPLORIX so you see metreage and downtime on your own dashboard.',
    partner: PARTNERS.kalyan,
    postedDaysAgo: 8,
  },
]

export const CONDITIONS: Condition[] = ['New', 'Used', 'Refurbished']
export const COUNTRIES = ['India', 'UAE', 'DRC']

export function formatPrice(l: Listing): string {
  if (l.priceType === 'on_request' || l.price === null) return 'Price on request'
  const symbol = l.currency === 'INR' ? '₹' : '$'
  const formatted =
    l.currency === 'INR'
      ? l.price.toLocaleString('en-IN')
      : l.price.toLocaleString('en-US')
  return l.priceType === 'rental'
    ? `${symbol}${formatted} / day`
    : `${symbol}${formatted}`
}

export function getListing(slug: string): Listing | undefined {
  return LISTINGS.find((l) => l.slug === slug || l.id === slug)
}
