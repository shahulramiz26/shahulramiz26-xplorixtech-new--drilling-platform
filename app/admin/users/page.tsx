'use client'

import { useState } from 'react'
import { RIGS } from '../../../lib/inventory-store'
import {
  Page, Head, Card, Btn, Table, Status, Modal, Field, Note, Empty, inputStyle, th, td, tdStrong, rowLine, T,
} from '../../components/kit'

/* USERS — logins for the people at the rig.
 *
 * A supervisor's username is made from his rig and a running number
 * (RIG01_SUP04) and his password is generated, shown once, and never stored
 * where it can be read back. The admin hands both over; nobody picks a weak
 * password and nobody has to remember a naming rule. */

interface User { id: number; name: string; username: string; role: string; rig: string; active: boolean; created: string }
const START: User[] = [
  { id: 1, name: 'Arun Verma', username: 'RIG01_SUP01', role: 'Supervisor', rig: 'RIG-001', active: true, created: '2026-06-01' },
  { id: 2, name: 'Imran Shaikh', username: 'RIG02_SUP01', role: 'Supervisor', rig: 'RIG-002', active: true, created: '2026-06-01' },
  { id: 3, name: 'Pradeep Rao', username: 'RIG03_SUP01', role: 'Supervisor', rig: 'RIG-003', active: false, created: '2026-08-01' },
]
const INCLUDED = 5
const TODAY_ISO = '2026-09-13'

function makePassword() {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789']
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
  return Array.from({ length: 10 }, (_, i) => pick(sets[i % 3])).join('')
}

export default function UsersPage() {
  const [users, setUsers] = useState(START)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', rig: RIGS[0] })
  const [secret, setSecret] = useState<{ title: string; username: string; password: string } | null>(null)
  const [removing, setRemoving] = useState<User | null>(null)

  const active = users.filter(u => u.active).length
  const full = users.length >= INCLUDED
  const nextUsername = (rig: string) => {
    const prefix = `${rig.replace('-0', '').replace('-', '')}_SUP`
    const n = users.filter(u => u.username.startsWith(prefix)).length + 1
    return `${prefix}${String(n).padStart(2, '0')}`
  }

  const create = () => {
    if (!form.name.trim()) return
    const username = nextUsername(form.rig)
    setUsers([...users, { id: Date.now(), name: form.name.trim(), username, role: 'Supervisor', rig: form.rig, active: true, created: TODAY_ISO }])
    setCreating(false); setForm({ name: '', rig: RIGS[0] })
    setSecret({ title: 'Login created', username, password: makePassword() })
  }

  return (
    <Page>
      <Head
        title="Users"
        sub={<>{active} of {users.length} logins are active. Your plan includes {INCLUDED} operational logins; {Math.max(0, INCLUDED - users.length)} still free.</>}
        right={<Btn kind="primary" disabled={full} onClick={() => setCreating(true)}>Create login</Btn>}
      />

      {full && <Note tone="warn">All {INCLUDED} logins on your plan are used. Remove one, or <a href="/admin/billing" style={{ color: T.text }}>add logins to your plan</a>.</Note>}

      <Card pad={false}>
        <Table>
          <thead><tr><th style={th}>Name</th><th style={th}>Username</th><th style={th}>Role</th><th style={th}>Rig</th><th style={th}>Status</th><th style={th}>Created</th><th style={th} /></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: rowLine }}>
                <td style={tdStrong}>{u.name}</td>
                <td style={{ ...td, fontVariantNumeric: 'tabular-nums' }}>{u.username}</td>
                <td style={td}>{u.role}</td>
                <td style={td}>{u.rig}</td>
                <td style={td}><Status tone={u.active ? 'good' : 'neutral'}>{u.active ? 'Active' : 'Switched off'}</Status></td>
                <td style={td}>{u.created}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <Btn size="sm" onClick={() => setSecret({ title: 'Password reset', username: u.username, password: makePassword() })}>Reset password</Btn>
                    <Btn size="sm" onClick={() => setUsers(users.map(x => x.id === u.id ? { ...x, active: !x.active } : x))}>{u.active ? 'Switch off' : 'Switch on'}</Btn>
                    <Btn size="sm" kind="danger" onClick={() => setRemoving(u)}>Remove</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {users.length === 0 && <Empty>No logins yet. Create one for each supervisor who logs shifts.</Empty>}
      </Card>

      {creating && (
        <Modal title="Create login" subtitle="For a supervisor who logs shifts at the rig" width={480} onClose={() => setCreating(false)}
          footer={<><Btn onClick={() => setCreating(false)}>Cancel</Btn><Btn kind="primary" disabled={!form.name.trim()} onClick={create}>Create login</Btn></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Supervisor's name">
              <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Anil Kumar" style={inputStyle} />
            </Field>
            <Field label="Rig" hint={`Username will be ${nextUsername(form.rig)}. The password is generated for you.`}>
              <select value={form.rig} onChange={e => setForm({ ...form, rig: e.target.value })} style={inputStyle}>
                {RIGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {secret && (
        <Modal title={secret.title} subtitle="Write these down or copy them now. The password is shown only once." width={460} onClose={() => setSecret(null)}
          footer={<>
            <Btn onClick={() => navigator.clipboard?.writeText(`Username: ${secret.username}\nPassword: ${secret.password}`)}>Copy both</Btn>
            <Btn kind="primary" onClick={() => setSecret(null)}>Done</Btn>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 18px', fontSize: 14 }}>
            <span style={{ color: T.faint }}>Username</span><span style={{ color: T.text, fontWeight: 600 }}>{secret.username}</span>
            <span style={{ color: T.faint }}>Password</span><span style={{ color: T.text, fontWeight: 600, letterSpacing: '0.04em' }}>{secret.password}</span>
          </div>
        </Modal>
      )}

      {removing && (
        <Modal title={`Remove ${removing.name}?`} subtitle={`${removing.username} will no longer be able to sign in. Shifts already logged are kept.`} width={460} onClose={() => setRemoving(null)}
          footer={<><Btn onClick={() => setRemoving(null)}>Keep login</Btn>
            <Btn kind="danger" onClick={() => { setUsers(users.filter(u => u.id !== removing.id)); setRemoving(null) }}>Remove login</Btn></>}>
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>If he is only away for a while, switch the login off instead. It can be switched back on.</div>
        </Modal>
      )}
    </Page>
  )
}
