import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { BODY_COLORS, CALIPER_COLORS, MODEL, MODELS, POSES, RIM_FINISHES } from './config'
import { track, intro } from './rig'
import { Scene } from './components/Scene'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Spin } from './components/Spin'
import { Models } from './components/Models'
import { Finale } from './components/Finale'
import { Disclaimer } from './components/Disclaimer'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const root = useRef()
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  const [model, setModel] = useState(MODELS[0])
  const [body, setBody] = useState(BODY_COLORS[0].hex)
  const [rims, setRims] = useState(RIM_FINISHES[0])
  const [calipers, setCalipers] = useState(CALIPER_COLORS[0].hex)

  // Which models have their own .glb in public/models (missing ones use the shared Carrera)
  const [ownFile, setOwnFile] = useState({})
  useEffect(() => {
    let live = true
    Promise.all(
      MODELS.map((m) =>
        fetch(m.model.url, { method: 'HEAD' })
          // dev servers answer unknown paths with index.html, so check the type too
          .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
          .catch(() => false)
          .then((ok) => [m.id, ok])
      )
    ).then((pairs) => live && setOwnFile(Object.fromEntries(pairs)))
    return () => {
      live = false
    }
  }, [])

  const spec = useMemo(
    () => (ownFile[model.id] ? { ...MODEL, ...model.model } : MODEL),
    [ownFile, model]
  )

  const pickModel = (m) => {
    // transition: keep showing the current car while the next .glb loads
    startTransition(() => {
      setModel(m)
      setBody(m.color)
    })
  }

  // Scroll-driven car poses
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (ctx) => {
        track.poses = ctx.conditions.desktop ? POSES.desktop : POSES.mobile
        track.p.fill(0)

        const stage = (i, vars) => {
          const set = (self) => (track.p[i] = self.progress)
          return ScrollTrigger.create({ ...vars, onUpdate: set, onRefresh: set })
        }

        stage(0, { trigger: '#spin', start: 'top bottom', end: 'top top' })

        // Pinned 360° turn + captions
        const deg = document.querySelector('[data-deg]')
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '#spin',
            start: 'top top',
            end: '+=220%',
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              track.p[1] = self.progress
              deg.textContent = String(Math.round(self.progress * 360)).padStart(3, '0') + '°'
            },
            onRefresh: (self) => (track.p[1] = self.progress),
          },
        })
        tl.fromTo('.spin__bar i', { scaleX: 0 }, { scaleX: 1, duration: 4 }, 0)
        gsap.utils.toArray('.spin__feature').forEach((el, i) => {
          tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.35 }, i)
          tl.to(el, { autoAlpha: 0, y: -40, duration: 0.35 }, i + 0.75)
        })
        tl.fromTo('.spin__mega', { xPercent: 12 }, { xPercent: -12, duration: 4 }, 0)

        stage(2, { trigger: '#models', start: 'top bottom', end: 'top top' })
        stage(3, { trigger: '#finale', start: 'top bottom', end: 'top top' })
        // After the finale the car leaves together with the page
        stage(4, { trigger: '#services', start: 'top bottom', end: 'top top' })
      })

      // Giant titles drift against the car — decorative, so skipped for reduced motion
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-parallax]').forEach((el) => {
          gsap.fromTo(el, { yPercent: 18 }, {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      })

      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      return () => mm.revert()
    },
    { scope: root }
  )

  // Intro: loader out, letters rise, car drives in
  useGSAP(
    () => {
      if (!ready) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        intro.x = 0
        intro.wheel = 0
        gsap.to('.loader', { autoAlpha: 0, duration: 0.3 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.to('.loader', { autoAlpha: 0, duration: 0.6, ease: 'power2.inOut' })
        .from('.hero__title .ch', { yPercent: 105, duration: 1.3, stagger: 0.06 }, '-=0.2')
        .fromTo(intro, { x: -9, wheel: -18 }, { x: 0, wheel: 0, duration: 2, ease: 'power3.out' }, '<0.2')
        .from('.nav > *', { autoAlpha: 0, y: -20, duration: 0.8, stagger: 0.08 }, '<0.4')
        .from('.hero .stat, .hero .pill', { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.07 }, '<0.5')
    },
    { scope: root, dependencies: [ready] }
  )

  return (
    <div ref={root} className="app">
      <Loader done={ready} />
      <Scene spec={spec} body={body} rims={rims} calipers={calipers} onReady={onReady} />
      <Nav />
      <main>
        <Hero />
        <div>
          <Spin />
        </div>
        <Models
          model={model}
          onModel={pickModel}
          body={body}
          onBody={setBody}
          rims={rims}
          onRims={setRims}
          calipers={calipers}
          onCalipers={setCalipers}
        />
        <Finale />
      </main>
      <Disclaimer />
    </div>
  )
}
