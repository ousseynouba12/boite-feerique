import { createClient } from '@supabase/supabase-js'

// Client "serveur" : utilise la clé secrète, ne tourne jamais dans le navigateur.
export const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
