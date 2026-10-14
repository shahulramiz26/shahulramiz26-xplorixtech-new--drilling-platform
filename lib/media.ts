'use client'

import { useEffect, useState } from 'react'
import { useSession } from './backend'

/* ==========================================================================
 * PHOTOS, IN THE BROWSER
 *
 * A photo is shrunk in the browser before it goes anywhere: the long side to
 * 1600 px, saved as JPEG. A phone photo of a core tray of 4–8 MB becomes
 * about 200–400 KB and the boxes and depth marks stay readable.
 *
 * Where it is kept depends on the mode:
 *   demo     in this browser (IndexedDB), beside the demo's own record
 *   server   on the server (/api/media), fetched only when it is shown
 * The record keeps only the photo's id, so both modes read the same record.
 * ========================================================================== */

const DB = 'xplorix_media'
const STORE = 'files'

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => { r.result.createObjectStore(STORE) }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}
async function idbPut(id: string, blob: Blob) {
  const d = await idb()
  await new Promise<void>((resolve, reject) => {
    const t = d.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(blob, id)
    t.oncomplete = () => resolve(); t.onerror = () => reject(t.error)
  })
}
async function idbGet(id: string): Promise<Blob | null> {
  const d = await idb()
  return new Promise((resolve, reject) => {
    const r = d.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    r.onsuccess = () => resolve((r.result as Blob) ?? null); r.onerror = () => reject(r.error)
  })
}

/* A photo file → a smaller JPEG. */
export async function shrinkPhoto(file: Blob, longSide = 1600, quality = 0.75): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error('This file could not be read as a photo.')); i.src = url
    })
    const k = Math.min(1, longSide / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k))
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const g = c.getContext('2d')!
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h)
    g.drawImage(img, 0, 0, w, h)
    return await new Promise<Blob>((resolve, reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('The photo could not be saved.')), 'image/jpeg', quality))
  } finally { URL.revokeObjectURL(url) }
}

/* Keep a photo; the answer is the id the record stores. */
export async function putPhoto(file: Blob, mode: 'demo' | 'server'): Promise<string> {
  const small = await shrinkPhoto(file)
  if (mode === 'server') {
    const res = await fetch('/api/media', { method: 'POST', body: small, headers: { 'content-type': 'image/jpeg' }, credentials: 'same-origin' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.id) throw new Error(data.error ?? 'The photo could not be sent. Check the connection and try again.')
    return data.id as string
  }
  const id = `md_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  await idbPut(id, small)
  return id
}

export function useMediaMode(): 'demo' | 'server' | 'loading' {
  const s = useSession()
  return s.status === 'loading' ? 'loading' : s.status === 'demo' ? 'demo' : 'server'
}

/* The address to show a photo at, or null while it is being found. */
export function usePhotoUrl(id: string | undefined): { url: string | null; missing: boolean } {
  const mode = useMediaMode()
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    setUrl(null); setMissing(false)
    if (!id || mode === 'loading') return
    if (mode === 'server') { setUrl(`/api/media/${encodeURIComponent(id)}`); return }
    let live = true, made: string | null = null
    idbGet(id).then(b => {
      if (!live) return
      if (!b) { setMissing(true); return }
      made = URL.createObjectURL(b); setUrl(made)
    }).catch(() => { if (live) setMissing(true) })
    return () => { live = false; if (made) URL.revokeObjectURL(made) }
  }, [id, mode])
  return { url, missing }
}
