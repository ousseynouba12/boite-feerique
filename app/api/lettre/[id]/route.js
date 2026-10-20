import { db } from '@/lib/db'

// Appelé quand elle clique sur une enveloppe : note l'ouverture et donne les liens du PDF (valables 1 h).
export async function POST(_req, { params }) {
  const s = db()
  const { data: l } = await s.from('lettres').select('*').eq('id', params.id).single()
  if (!l) return Response.json({ error: 'introuvable' }, { status: 404 })
  if (!l.ouverte_le) await s.from('lettres').update({ ouverte_le: new Date().toISOString() }).eq('id', l.id)
  const bucket = s.storage.from('lettres')
  const view = await bucket.createSignedUrl(l.pdf_path, 3600)
  const dl = await bucket.createSignedUrl(l.pdf_path, 3600, { download: l.titre + '.pdf' })
  return Response.json({ url: view.data?.signedUrl, download: dl.data?.signedUrl })
}
