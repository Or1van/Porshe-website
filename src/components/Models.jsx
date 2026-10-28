import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { BODY_COLORS, CALIPER_COLORS, MODELS, RIM_FINISHES } from '../config'
import { Mega } from './Mega'
import { DragZone } from './DragZone'
import { Gallery } from './Gallery'

export function Models({ model, onModel, body, onBody, rims, onRims, calipers, onCalipers }) {
  const scope = useRef()
  const first = useRef(true)

  // Title and stats re-animate when another model is picked
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      // fromTo (not from) so rapid re-clicks can't freeze the letters mid-way
      gsap.fromTo('.models__title .ch', { yPercent: 100 }, { yPercent: 0, duration: 0.9, stagger: 0.04, ease: 'power4.out', overwrite: true })
      gsap.fromTo('.models__stats li', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', overwrite: true })
    },
    { scope, dependencies: [model.id] }
  )

  const bodyName = BODY_COLORS.find((c) => c.hex === body)?.name ?? 'Custom paint'
  const caliperName = CALIPER_COLORS.find((c) => c.hex === calipers)?.name

  return (
    <section id="models" className="models" ref={scope}>
      <div className="glow glow--models" />

      <div className="models__stage">
        <Mega text={model.title} className="models__title" data-parallax />
        <DragZone className="models__drag" />
        <div className="models__foot ui">
          <ul className="models__stats">
            <li>
              <span>Power</span>
              <strong>{model.power}</strong>
            </li>
            <li>
              <span>Acceleration 0–100 km/h</span>
              <strong>{model.accel}</strong>
            </li>
            <li>
              <span>Top speed</span>
              <strong>{model.top}</strong>
            </li>
          </ul>
          <Gallery model={model} />
        </div>
      </div>

      <aside className="config ui">
        <header className="config__head">
          <h2>Configurator</h2>
          <i />
        </header>

        <div className="config__grid">
          <ul className="config__models" aria-label="Model">
            {MODELS.map((m) => (
              <li key={m.id}>
                <button
                  className={`car-card ${m.id === model.id ? 'is-active' : ''}`}
                  onClick={() => onModel(m)}
                  aria-pressed={m.id === model.id}
                >
                  {m.photos?.[0] ? (
                    <img src={m.photos[0].src} alt="" loading="lazy" />
                  ) : (
                    <Silhouette color={m.color} />
                  )}
                  <span>{m.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="config__opts">
            <Group title="Body color" hint={bodyName} open>
              <div className="swatches">
                {BODY_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`swatch ${c.hex === body ? 'is-active' : ''}`}
                    style={{ '--c': c.hex }}
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => onBody(c.hex)}
                  />
                ))}
                <label className="swatch swatch--add" title="Custom colour">
                  <input type="color" value={body} onChange={(e) => onBody(e.target.value)} aria-label="Custom colour" />
                  <span>+</span>
                </label>
              </div>
            </Group>

            <Group title="Wheels" hint={rims.name} open>
              <div className="rims">
                {RIM_FINISHES.map((r) => (
                  <button
                    key={r.name}
                    className={`rim ${r.name === rims.name ? 'is-active' : ''}`}
                    title={r.name}
                    aria-label={r.name}
                    onClick={() => onRims(r)}
                  >
                    <Rim color={r.hex} />
                  </button>
                ))}
              </div>
            </Group>

            <Group title="Brake calipers" hint={caliperName}>
              <div className="swatches">
                {CALIPER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    className={`swatch ${c.hex === calipers ? 'is-active' : ''}`}
                    style={{ '--c': c.hex }}
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => onCalipers(c.hex)}
                  />
                ))}
              </div>
            </Group>

            <Group title="Summary">
              <dl className="summary">
                <dt>Model</dt>
                <dd>{model.name}</dd>
                <dt>Paint</dt>
                <dd>{bodyName}</dd>
                <dt>Wheels</dt>
                <dd>{rims.name}</dd>
                <dt>Calipers</dt>
                <dd>{caliperName}</dd>
              </dl>
              <a className="pill pill--solid" href="#contact">
                Request an offer
              </a>
            </Group>
          </div>
        </div>
      </aside>
    </section>
  )
}

function Group({ title, hint, open, children }) {
  return (
    <details className="group" open={open}>
      <summary>
        <span>{title}</span>
        {hint && <em>{hint}</em>}
        <svg viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </summary>
      <div className="group__body">{children}</div>
    </details>
  )
}

function Rim({ color }) {
  const spokes = Array.from({ length: 10 }, (_, i) => i * 36)
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#0d0d0e" />
      <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="5" />
      {spokes.map((a) => (
        <path key={a} d="M50 50 L46 13 L54 13 Z" fill={color} transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="9" fill={color} />
      <circle cx="50" cy="50" r="3.5" fill="#0d0d0e" />
    </svg>
  )
}

// Fallback thumbnail when a model has no image
function Silhouette({ color }) {
  return (
    <svg viewBox="0 0 160 60" aria-hidden="true" className="silhouette">
      <path
        d="M8 42c0-6 4-9 12-10l22-3c10-8 22-14 40-14 16 0 26 4 38 12l20 3c8 1 12 5 12 10v4H8z"
        fill={color}
      />
      <path d="M50 28c8-6 18-9 32-9 10 0 18 2 26 8z" fill="#0d0d0e" opacity=".75" />
      <circle cx="38" cy="46" r="9" fill="#111" stroke="#555" strokeWidth="2" />
      <circle cx="124" cy="46" r="9" fill="#111" stroke="#555" strokeWidth="2" />
    </svg>
  )
}
