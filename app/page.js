import { db } from '@/lib/db'
import Boite from './Boite'

export const dynamic = 'force-dynamic' // toujours relire le tableau

export default async function Home() {
  const { data } = await db()
    .from('lettres')
    .select('id,titre,date_lettre,ouverte_le')
    .order('date_lettre', { ascending: false })
  return (
    <main>
      <header>
        <h1 className="title">Ma boîte aux lettres</h1>
        <p>Des mots doux, scellés rien que pour moi</p>
        <div className="deco">✦ ✧ ✦</div>
      </header>
      <Boite initial={data || []} />
    </main>
  )
}
