
import { db } from '@/lib/db'
import Boite from './Boite'

export const dynamic = 'force-dynamic'

export default async function Home() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error('Configuration Supabase manquante sur Vercel')
    throw new Error('Configuration Supabase manquante')
  }

  const { data, error } = await db()
    .from('lettres')
    .select('id,titre,date_lettre,ouverte_le')
    .order('date_lettre', { ascending: false })

  if (error) {
    console.error('Erreur de lecture des lettres :', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })

    throw new Error('Échec du chargement des lettres depuis Supabase')
  }

  console.log('Nombre de lettres chargées :', data.length)

  return (
    <main>
      <header>
        <h1 className="title">Ma boîte aux lettres</h1>
        <p>Des mots doux, scellés rien que pour moi</p>
        <div className="deco">✦ ✧ ✦</div>
      </header>
      <Boite initial={data} />
    </main>
  )
}
