import { db } from '@/lib/db'

const err = (m, status = 400) => Response.json({ error: m }, { status })

export async function POST(req) {
  if (!process.env.ADMIN_PASSWORD || req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD)
    return err('mot de passe incorrect', 401)
  const b = await req.json()
  const s = db()

  // Étape 1 : un "ticket" pour que le navigateur envoie le PDF directement au stockage.
  if (b.action === 'url') {
    const path = Date.now() + '.pdf'
    const { data, error } = await s.storage.from('lettres').createSignedUploadUrl(path)
    return error ? err(error.message, 500) : Response.json({ path, token: data.token })
  }
  // Étape 2 : une fois le PDF envoyé, on ajoute la ligne dans le tableau.
  if (b.action === 'add') {
    const { error } = await s.from('lettres').insert({ titre: b.titre, date_lettre: b.date, pdf_path: b.path })
    return error ? err(error.message, 500) : Response.json({ ok: true })
  }
  return err('action inconnue')
}
