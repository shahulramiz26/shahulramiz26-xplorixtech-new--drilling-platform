'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useCosting } from '../../lib/costing-store'
import { company, MY_ID } from '../../lib/connect-store'
import { contractorSide, type Contractor, type ContractorReport } from '../../lib/contracting'
import type { ShiftLog } from '../../lib/costing-store'
import { Page, Card, Empty } from '../components/kit'

/* ==========================================================================
 * WHO IS SIGNED IN TO THE CONTRACTOR LOGIN
 *
 * A contractor login belongs to one contractor and opens only his own work
 * orders with the company that gave it to him. The MVP has no accounts yet,
 * so the contractor is chosen by the link he arrived on (?as=) and kept in
 * this browser; with real logins it is simply the account that signed in.
 * ========================================================================== */

const KEY = 'xplorix_contractor_as'
const listeners = new Set<() => void>()
const read = () => { try { return localStorage.getItem(KEY) ?? '' } catch { return '' } }
function subscribe(fn: () => void) {
  listeners.add(fn)
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) fn() }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(fn); window.removeEventListener('storage', onStorage) }
}
export function signInAs(id: string) {
  try { localStorage.setItem(KEY, id) } catch { /* private mode: lasts for this visit */ }
  listeners.forEach(fn => fn())
}

/* The company that gave the login: the client, from where the contractor sits. */
export const CLIENT_NAME = company(MY_ID.contractor)?.name ?? 'Your client'

export function useMe() {
  const store = useCosting()
  const { state } = store
  const saved = useSyncExternalStore(subscribe, read, () => '')
  const withLogin = useMemo(() => state.contractors.filter(c => c.login), [state.contractors])
  const me: Contractor | undefined = withLogin.find(c => c.id === saved) ?? withLogin[0]
  const side = useMemo(() => contractorSide(state, me?.id ?? ''), [state, me?.id])
  return { ...store, me, withLogin, side }
}

/* Reads ?as= once, so "See what they see" in the Company Admin lands on the
 * right contractor, and marks an invitation as opened the first time. */
export function useArrival() {
  const { state, saveContractor } = useCosting()
  useEffect(() => {
    const as = new URLSearchParams(window.location.search).get('as')
    if (as) signInAs(as)
  }, [])
  const saved = useSyncExternalStore(subscribe, read, () => '')
  useEffect(() => {
    const c = state.contractors.find(x => x.id === saved) ?? state.contractors.find(x => x.login)
    if (c?.login?.status === 'invited') saveContractor({ ...c, login: { ...c.login, status: 'active' } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, state.contractors])
}

// ── one shift, wherever it stands ─────────────────────────────────────────

export type ShiftState = 'waiting' | 'returned' | 'checked'
export interface MyShift {
  key: string
  state: ShiftState
  rig: string
  date: string
  shift: 'Day' | 'Night'
  hole: string | null
  metres: number
  core: number
  stoppedHours: number
  reason: string
  report?: ContractorReport
  log?: ShiftLog
}
const order = (x: { date: string; shift: string; rig: string }) => `${x.date}${x.shift === 'Day' ? '0' : '1'}${x.rig}`

/* Everything the contractor has sent, newest first: waiting, sent back, and
 * checked into the record. */
export function myShifts(side: ReturnType<typeof contractorSide>): MyShift[] {
  const fromReport = (r: ContractorReport): MyShift => ({
    key: r.id, state: r.status === 'returned' ? 'returned' : 'waiting', rig: r.rig, date: r.date, shift: r.shift, hole: r.holeNumber,
    metres: r.metres, core: r.coreRecovery, stoppedHours: r.standbyHours + r.breakdownHours, reason: r.reason, report: r,
  })
  const fromLog = (l: ShiftLog): MyShift => ({
    key: l.id, state: 'checked', rig: l.rig, date: l.date, shift: l.shift, hole: l.holeNumber,
    metres: l.metresDrilled, core: l.coreRecovery, stoppedHours: l.downtimeHours, reason: l.downtimeReason, log: l,
  })
  return [...side.waiting.map(fromReport), ...side.returned.map(fromReport), ...side.accepted.map(fromLog)]
    .sort((a, b) => order(b).localeCompare(order(a)))
}

/* Shown on every screen when nobody has been given a login yet. */
export function NoLogin() {
  return (
    <Page>
      <Card><Empty>
        No contractor has a login yet.<br />
        In the Company Admin, open Contractors, then Work orders, and create a login for a contractor.
      </Empty></Card>
    </Page>
  )
}
