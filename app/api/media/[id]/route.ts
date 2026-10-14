import { whoIs, json } from '../../../../lib/server/auth'
import { db, ensureSchema } from '../../../../lib/server/db'
import { visibleRecords } from '../../../../lib/server/records'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* One photo. The admin may open any photo in his company. Anyone else may
 * open a photo only when a record they can read points to it: a client sees
 * the core photos of his own holes and no others. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const who = await whoIs()
  if (!who) return json({ error: 'signed out' }, 401)
  const id = String(params.id ?? '')
  if (!/^md_[a-z0-9_]+$/i.test(id)) return json({ error: 'not found' }, 404)
  if (who.role !== 'admin') {
    const recs = await visibleRecords(who)
    const named = recs.some(r =>
      (r.coll === 'corePhotos' && r.data?.media === id) ||
      (r.coll === 'shiftLogs' && Array.isArray(r.data?.corePhotos) && r.data.corePhotos.some((p: { media?: string }) => p?.media === id)))
    if (!named) return json({ error: 'not found' }, 404)
  }
  await ensureSchema()
  const { rows } = await db().query('select mime, bytes from xp_media where company_id = $1 and id = $2', [who.companyId, id])
  if (!rows[0]) return json({ error: 'not found' }, 404)
  return new Response(rows[0].bytes, { headers: { 'content-type': rows[0].mime, 'cache-control': 'private, max-age=31536000, immutable' } })
}
