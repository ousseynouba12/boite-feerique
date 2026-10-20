import { notFound } from 'next/navigation'
import Admin from './Admin'

// N'importe quelle adresse autre que ADMIN_PATH renvoie une page 404 normale.
export default function Page({ params }) {
  if (!process.env.ADMIN_PATH || params.secret !== process.env.ADMIN_PATH) notFound()
  return (
    <main>
      <Admin />
    </main>
  )
}
