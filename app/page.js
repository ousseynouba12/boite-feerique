import { db } from '@/lib/db'
import Boite from './Boite'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

function typeCle() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!k) return 'ABSENTE'
  if (k.startsWith('sb_secret')) return 'nouvelle clé secrète'
  if (k.startsWith('sb_publishable')) return 'nouvelle clé PUBLIQUE (mauvaise)'
  try {
    return 'rôle ' + JSON.parse(Buffer.from(k.split('.')[1], 'base64').toString()).role
  } catch (e) {
    return 'format inconnu'
  }
}

export default async function Home() {
  const r = await db()
    .from('lettres')
    .select('id,titre,date_lettre,ouverte_le', { count: 'exact' })
    .order('date_lettre', { ascending: false })
  return (
    <main>
      <header>
        <h1 className="title">Ma boîte aux lettres</h1>
        <p>Des mots doux, scellés rien que pour moi</p>
        <div className="deco">✦ ✧ ✦</div>
      </header>
      <p className="note">
        DIAGNOSTIC · clé : {typeCle()} · lignes : {String(r.count)} · statut : {r.status} · erreur :{' '}
        {r.error ? r.error.message : 'aucune'}
      </p>
      <Boite initial={r.data || []} />
    </main>
  )
}
