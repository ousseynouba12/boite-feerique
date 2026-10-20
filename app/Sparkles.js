'use client'
import { useEffect, useRef } from 'react'

// Paillettes dorées qui flottent + explosion quand un sceau se brise (événement "burst").
export default function Sparkles() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const cx = cv.getContext('2d')
    const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W, H, raf
    const P = []
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight }
    size()
    const spawn = (x, y, b) => {
      const a = Math.random() * 6.283, s = 1 + Math.random() * 3
      P.push({
        x, y, k: 0, b, t: Math.random() * 6.28, r: 0.8 + Math.random() * 2.4,
        vx: b ? Math.cos(a) * s : (Math.random() - 0.5) * 0.25,
        vy: b ? Math.sin(a) * s - 1 : -0.1 - Math.random() * 0.35,
        l: b ? 55 + Math.random() * 35 : 260 + Math.random() * 320,
        c: Math.random() < 0.5 ? '#e8c46a' : '#fff3c4',
      })
    }
    const star = (x, y, r) => {
      cx.beginPath()
      cx.moveTo(x, y - r * 2.4)
      cx.quadraticCurveTo(x, y, x + r * 2.4, y)
      cx.quadraticCurveTo(x, y, x, y + r * 2.4)
      cx.quadraticCurveTo(x, y, x - r * 2.4, y)
      cx.quadraticCurveTo(x, y, x, y - r * 2.4)
      cx.fill()
    }
    const loop = () => {
      cx.clearRect(0, 0, W, H)
      if (!calme && P.length < 90) spawn(Math.random() * W, Math.random() * H, false)
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]
        p.k++; p.x += p.vx; p.y += p.vy
        if (p.b) { p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.04 }
        if (p.k > p.l) { P.splice(i, 1); continue }
        cx.globalAlpha = Math.max(0, Math.sin((Math.PI * p.k) / p.l) * (0.55 + 0.45 * Math.sin(p.k * 0.12 + p.t)))
        cx.fillStyle = p.c
        if (p.r > 1.7) star(p.x, p.y, p.r)
        else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill() }
      }
      raf = requestAnimationFrame(loop)
    }
    const onBurst = (e) => { for (let i = 0; i < 48; i++) spawn(e.detail.x, e.detail.y, true) }
    window.addEventListener('resize', size)
    window.addEventListener('burst', onBurst)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('burst', onBurst)
    }
  }, [])
  return <canvas id="fx" ref={ref} />
}
