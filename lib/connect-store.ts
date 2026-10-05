'use client'

import { useSyncExternalStore } from 'react'

/* ==========================================================================
 * CONNECTIONS — how a contractor and a mine owner link on XPLORIX
 *
 * Each company has an XPLORIX ID: CT-#### for a contractor, MO-#### for a mine
 * owner. One side enters the other's ID and sends a request; the other side
 * accepts. Only then can a project be shared between them. When the work is
 * done the connection is ended and the history stays readable.
 *
 * MVP: there is no server yet. The list of companies below stands in for the
 * XPLORIX directory, and the connections are kept in this browser, the same
 * way the rest of the demo keeps its data. The Company Admin and the Client
 * Portal read the same list, so a request sent on one side shows on the other.
 * ========================================================================== */

export type Side = 'contractor' | 'owner'
export type ConnStatus = 'requested' | 'connected' | 'declined' | 'ended'

export interface Company {
  id: string
  name: string
  side: Side
  place: string
  /* The demo's client portal calls its contractors A, B and C. */
  alias?: string
}

export interface Connection {
  id: string
  contractor: string
  owner: string
  status: ConnStatus
  /* who sent the request */
  from: Side
  at: string
  answeredAt?: string
  endedAt?: string
}

/* The two companies you are signed in as in this demo. */
export const MY_ID: Record<Side, string> = { contractor: 'CT-2210', owner: 'MO-1042' }

export const DIRECTORY: Company[] = [
  { id: 'CT-2210', name: 'Apex Drilling Solutions', side: 'contractor', place: 'Nagpur, India', alias: 'Contractor A' },
  { id: 'CT-2318', name: 'Contractor B', side: 'contractor', place: 'Demo company' },
  { id: 'CT-2440', name: 'Contractor C', side: 'contractor', place: 'Demo company' },
  { id: 'CT-2507', name: 'Contractor D', side: 'contractor', place: 'Demo company' },
  { id: 'MO-1042', name: 'Demo Mining Co.', side: 'owner', place: 'North Block programme' },
  { id: 'MO-1077', name: 'South Ridge Minerals', side: 'owner', place: 'Demo company' },
  { id: 'MO-1103', name: 'East Basin Resources', side: 'owner', place: 'Demo company' },
  { id: 'MO-1150', name: 'Granite Hill Mining', side: 'owner', place: 'Demo company' },
]

const SEED: Connection[] = [
  { id: 'cn1', contractor: 'CT-2210', owner: 'MO-1042', status: 'connected', from: 'contractor', at: '2026-05-22', answeredAt: '2026-05-25' },
  { id: 'cn2', contractor: 'CT-2210', owner: 'MO-1103', status: 'connected', from: 'owner', at: '2026-01-26', answeredAt: '2026-01-28' },
  { id: 'cn3', contractor: 'CT-2210', owner: 'MO-1150', status: 'requested', from: 'owner', at: '2026-09-11' },
  { id: 'cn4', contractor: 'CT-2318', owner: 'MO-1042', status: 'connected', from: 'owner', at: '2026-05-18', answeredAt: '2026-05-19' },
  { id: 'cn5', contractor: 'CT-2440', owner: 'MO-1042', status: 'connected', from: 'owner', at: '2026-05-18', answeredAt: '2026-05-21' },
  { id: 'cn6', contractor: 'CT-2507', owner: 'MO-1042', status: 'requested', from: 'contractor', at: '2026-09-12' },
]

const KEY = 'xplorix_connect_v1'
const TODAY = '2026-09-13'

let cache: Connection[] | null = null
const listeners = new Set<() => void>()

function read(): Connection[] {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    const saved = raw ? JSON.parse(raw) : null
    cache = Array.isArray(saved?.connections) ? saved.connections : SEED
  } catch { cache = SEED }
  return cache as Connection[]
}
function write(next: Connection[]) {
  cache = next
  try { localStorage.setItem(KEY, JSON.stringify({ v: 1, connections: next })) } catch { /* private mode: kept for this visit */ }
  listeners.forEach(fn => fn())
}
function subscribe(fn: () => void) {
  listeners.add(fn)
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; fn() } }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}

export function useConnections(): Connection[] {
  return useSyncExternalStore(subscribe, read, () => SEED)
}

// ── READING ───────────────────────────────────────────────────────────────

/* "ct 2210", "CT2210" and "ct-2210" all find CT-2210. */
export function tidyId(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const m = s.match(/^(CT|MO)(\d{3,6})$/)
  return m ? `${m[1]}-${m[2]}` : raw.trim().toUpperCase()
}
export const company = (id: string) => DIRECTORY.find(c => c.id === id)
export const companyByName = (name: string) => DIRECTORY.find(c => c.name.toLowerCase() === name.trim().toLowerCase())
/* How a company is named to the side looking at it. */
export const nameFor = (c: Company, viewer: Side) => (viewer === 'owner' && c.alias) || c.name
export const otherId = (c: Connection, viewer: Side) => viewer === 'contractor' ? c.owner : c.contractor
export const mine = (list: Connection[], viewer: Side) =>
  list.filter(c => (viewer === 'contractor' ? c.contractor : c.owner) === MY_ID[viewer])
/* Requests the other side sent and this side has not answered. */
export const waitingForMe = (list: Connection[], viewer: Side) =>
  mine(list, viewer).filter(c => c.status === 'requested' && c.from !== viewer)
export function linkWith(list: Connection[], viewer: Side, other: string): Connection | undefined {
  const all = mine(list, viewer).filter(c => otherId(c, viewer) === other)
  return all.find(c => c.status === 'connected') ?? all.find(c => c.status === 'requested') ?? all[all.length - 1]
}
/* Is this client, by name, connected to the contractor right now? */
export function connectedClient(list: Connection[], clientName: string): Company | undefined {
  const c = companyByName(clientName)
  return c && c.side === 'owner' && linkWith(list, 'contractor', c.id)?.status === 'connected' ? c : undefined
}

// ── CHANGING ──────────────────────────────────────────────────────────────

export type Result = { ok: true; company: Company } | { ok: false; why: string }

/* Looks the ID up the way the XPLORIX directory will, and says in plain words
 * why a request cannot be sent. */
export function check(viewer: Side, raw: string): Result {
  const id = tidyId(raw)
  if (!raw.trim()) return { ok: false, why: 'Enter an XPLORIX ID.' }
  const c = company(id)
  const wanted = viewer === 'contractor' ? 'MO' : 'CT'
  if (!/^(CT|MO)-\d{3,6}$/.test(id)) return { ok: false, why: `An XPLORIX ID looks like ${wanted}-1234.` }
  if (id === MY_ID[viewer]) return { ok: false, why: 'That is your own XPLORIX ID.' }
  if (!id.startsWith(wanted)) return { ok: false, why: viewer === 'contractor' ? 'That ID belongs to a contractor. A mine owner’s ID starts with MO.' : 'That ID belongs to a mine owner. A contractor’s ID starts with CT.' }
  if (!c) return { ok: false, why: `No company on XPLORIX has the ID ${id}. Check it with them and try again.` }
  const link = linkWith(read(), viewer, id)
  if (link?.status === 'connected') return { ok: false, why: `You are already connected to ${nameFor(c, viewer)}.` }
  if (link?.status === 'requested') return { ok: false, why: link.from === viewer ? `A request to ${nameFor(c, viewer)} is already waiting for their answer.` : `${nameFor(c, viewer)} has already sent you a request. Accept it below.` }
  return { ok: true, company: c }
}

export function sendRequest(viewer: Side, raw: string): Result {
  const r = check(viewer, raw)
  if (!r.ok) return r
  const me = MY_ID[viewer]
  write([...read(), {
    id: 'cn' + Date.now().toString(36), status: 'requested', from: viewer, at: TODAY,
    contractor: viewer === 'contractor' ? me : r.company.id, owner: viewer === 'owner' ? me : r.company.id,
  }])
  return r
}
const patch = (id: string, p: Partial<Connection>) => write(read().map(c => c.id === id ? { ...c, ...p } : c))
export const answerRequest = (id: string, accept: boolean) => patch(id, { status: accept ? 'connected' : 'declined', answeredAt: TODAY })
export const withdrawRequest = (id: string) => write(read().filter(c => c.id !== id))
export const endConnection = (id: string) => patch(id, { status: 'ended', endedAt: TODAY })
export function resetConnections() { write(SEED) }
