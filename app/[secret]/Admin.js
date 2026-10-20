'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Admin() {
  const [pw, setPw] = useState('')
  const [titre, setTitre] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [k, setK] = useState(0)

  const call = async (body) => {
    const r = await fetch('/api/admin', { method: 'POST', headers: { 'x-admin-password': pw }, body: JSON.stringify(body) })
    const j = await r.json()
    if (!r.ok) throw new Error(j.error)
    return j
  }

  async function envoyer(e) {
    e.preventDefault()
    if (!file) return setMsg('Choisis un PDF.')
    setMsg('Envoi…')
    try {
      const { path, token } = await call({ action: 'url' })
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      const up = await sb.storage.from('lettres').uploadToSignedUrl(path, token, file)
      if (up.error) throw up.error
      await call({ action: 'add', titre, date, path })
      setMsg('Lettre déposée dans la boîte ✉️')
      setTitre('')
      setFile(null)
      setK(k + 1)
    } catch (er) {
      setMsg('Oups : ' + er.message)
    }
  }

  return (
    <form key={k} onSubmit={envoyer}>
      <h2 className="hand" style={{ margin: 0, fontSize: 34, color: 'var(--accent)' }}>Ajouter une lettre</h2>
      <label>Mot de passe<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
      <label>Titre<input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} required /></label>
      <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
      <label>Lettre (PDF)<input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} /></label>
      <button type="submit" className="btn">Déposer dans la boîte</button>
      {msg && <p className="note" style={{ margin: 0 }}>{msg}</p>}
    </form>
  )
}
