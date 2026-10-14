import { randomBytes } from 'crypto'
import { whoIs, json } from '../../../lib/server/auth'
import { db, ensureSchema } from '../../../lib/server/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

/* ==========================================================================
 * PHOTOS
 *
 * A core tray photo is kept apart from the company's record, so the record
 * every screen loads stays small. The record holds the photo's id; the screen
 * asks for the picture only when it shows it.
 *
 * Only the company admin and supervisors add photos. The browser shrinks a
 * photo before sending it, so one is a few hundred kilobytes.
 * ========================================================================== */

const MAX = 4 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: Request) {
  const who = await whoIs()
  if (!who) return json({ error: 'signed out' }, 401)
  if (who.role !== 'admin' && who.role !== 'supervisor') return json({ error: 'not allowed' }, 403)
  const mime = (req.headers.get('content-type') ?? '').split(';')[0].trim()
  if (!TYPES.includes(mime)) return json({ error: 'Only JPEG, PNG or WebP photos can be added.' }, 415)
  const buf = Buffer.from(await req.arrayBuffer())
  if (!buf.length) return json({ error: 'empty' }, 400)
  if (buf.length > MAX) return json({ error: 'The photo is larger than 4 MB.' }, 413)
  await ensureSchema()
  const id = `md_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`
  await db().query('insert into xp_media (company_id, id, mime, bytes, size, created_by) values ($1, $2, $3, $4, $5, $6)',
    [who.companyId, id, mime, buf, buf.length, who.username])
  return json({ id })
}
