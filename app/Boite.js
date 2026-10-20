'use client'
import { useEffect, useRef, useState } from 'react'

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
const fmt = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const tablet = () => window.matchMedia('(min-width:521px) and (max-width:1100px)').matches
const calme = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const burst = (x, y) => {
  if (!calme()) window.dispatchEvent(new CustomEvent('burst', { detail: { x, y } }))
}

export default function Boite({ initial }) {
  const [letters, setLetters] = useState(initial)
  const [cur, setCur] = useState(null)
  const [count, setCount] = useState('')
  const [breaking, setBreaking] = useState(null)
  const track = useRef(null)
  const pos = useRef(0)

  const upd = () => {
    const t = track.current
    const c = t && t.children[0]
    if (!c) return
    const w = c.offsetWidth + 24
    const i = Math.round(t.scrollLeft / w) * (tablet() ? 2 : 1) + 1
    setCount(Math.min(letters.length, i) + ' / ' + letters.length)
  }
  const go = (d) => {
    const t = track.current
    const c = t && t.children[0]
    if (!c) return
    const w = c.offsetWidth + 24
    const cols = Math.max(1, Math.round((t.clientWidth + 4) / w))
    t.scrollBy({ left: d * cols * w, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!cur && track.current) {
      track.current.scrollLeft = pos.current
      upd()
    }
  }, [cur])

  async function ouvrir(l, e) {
    if (breaking) return
    pos.current = track.current.scrollLeft
    if (!l.ouverte_le && !calme()) {
      // Le sceau de cire se brise avant que la lettre s'ouvre.
      const r = e.currentTarget.querySelector('.seal').getBoundingClientRect()
      setBreaking(l.id)
      burst(r.left + r.width / 2, r.top + r.height / 2)
      await new Promise((ok) => setTimeout(ok, 750))
      setBreaking(null)
    }
    const res = await fetch('/api/lettre/' + l.id, { method: 'POST' })
    const j = await res.json()
    setLetters((ls) =>
      ls.map((x) => (x.id === l.id ? { ...x, ouverte_le: x.ouverte_le || new Date().toISOString() } : x))
    )
    setCur({ ...l, ...j })
    window.scrollTo(0, 0)
  }

  if (cur) return <Lecteur l={cur} onBack={() => setCur(null)} />

  return (
    <section>
      {letters.length === 0 && <p className="note">Pas encore de lettre… bientôt ✨</p>}
      <div className="track" ref={track} onScroll={upd}>
        {letters.map((l) => (
          <button
            key={l.id}
            className={'env' + (l.ouverte_le ? ' read' : '') + (breaking === l.id ? ' break' : '')}
            onClick={(e) => ouvrir(l, e)}
          >
            {!l.ouverte_le && <span className="new">nouvelle</span>}
            <div className="body">
              <div className="flap" />
              <div className="paper" />
              <div className="front" />
              <div className="seal">✦</div>
              <div className="label">
                <span className="t">{l.titre}</span>
                <span className="d">{fmt(l.date_lettre)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {letters.length > 0 && (
        <div className="nav">
          <button className="arrow" onClick={() => go(-1)} aria-label="Lettres précédentes">‹</button>
          <span>{count}</span>
          <button className="arrow" onClick={() => go(1)} aria-label="Lettres suivantes">›</button>
        </div>
      )}
    </section>
  )
}

function Lecteur({ l, onBack }) {
  const box = useRef(null)
  const [err, setErr] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let off = false
    const run = async () => {
      if (!l.url) throw new Error('pas de lien')
      if (!window.pdfjsLib) {
        await new Promise((ok, ko) => {
          const s = document.createElement('script')
          s.src = PDFJS
          s.onload = ok
          s.onerror = ko
          document.head.appendChild(s)
        })
      }
      const lib = window.pdfjsLib
      lib.GlobalWorkerOptions.workerSrc = WORKER
      const pdf = await lib.getDocument(l.url).promise
      box.current.innerHTML = ''
      const w = box.current.clientWidth
      for (let i = 1; i <= pdf.numPages && !off; i++) {
        const p = await pdf.getPage(i)
        const scale = (w / p.getViewport({ scale: 1 }).width) * (window.devicePixelRatio || 1)
        const v = p.getViewport({ scale })
        const c = document.createElement('canvas')
        c.width = v.width
        c.height = v.height
        box.current.appendChild(c)
        await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise
        if (i === 1) {
          // La 1re page est prête : la lettre commence à s'éclaircir.
          setReady(true)
          burst(window.innerWidth / 2, 200)
        }
      }
    }
    run().catch(() => { setErr(true); setReady(true) })
    return () => { off = true }
  }, [l.url])

  return (
    <section>
      <div className="bar">
        <button className="btn ghost" onClick={onBack}>← Retour</button>
        {l.download && <a className="btn" href={l.download}>Garder cette lettre</a>}
      </div>
      <article className={'sheet ' + (ready ? 'reveal' : 'pre')}>
        <h2>{l.titre}</h2>
        <div className="meta">Écrite le {fmt(l.date_lettre)}</div>
        <div className="pages" ref={box} />
        {err && <p className="note">Impossible d’afficher la lettre ici. {l.url && <a href={l.url}>Ouvrir le PDF</a>}</p>}
      </article>
    </section>
  )
}
