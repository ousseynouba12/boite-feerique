import { db } from '@/lib/db'
import Boite from './Boite'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data, error } = await db()
    .from('lettres')
    .select('id,titre,date_lettre,ouverte_le')
    .order('date_lettre', { ascending: false })
  const projet = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').split('.')[0]
  return (
    <main>
      <header>
        <h1 className="title">Ma boîte aux lettres</h1>
        <p>Des mots doux, scellés rien que pour moi</p>
        <div className="deco">✦ ✧ ✦</div>
      </header>
      <p className="note">
        DIAGNOSTIC · projet : {projet} · lettres lues : {data ? data.length : 'aucune'} · erreur :{' '}
        {error ? error.message : 'aucune'}
      </p>
      <Boite initial={data || []} />
    </main>
  )
}
