import { Mega } from './Mega'
import { DragZone } from './DragZone'

const STATS = [
  ['478 kW', 'Power'],
  ['2.7 sec', 'Acceleration 0–100 km/h'],
  ['330 km/h', 'Top speed'],
]

export function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="glow glow--hero" />
      <Mega as="h1" text="PORSCHE" className="hero__title" />
      <DragZone className="hero__drag" />

      <div className="hero__bottom ui">
        <ul className="stats">
          {STATS.map(([v, l]) => (
            <li key={l} className="stat">
              <strong>{v}</strong>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <div className="pills">
          <a className="pill" href="#spin">Technical specs</a>
          <a className="pill" href="#models">Configurator</a>
          <a className="pill" href="#finale">Cars in stock</a>
        </div>
      </div>

      <div className="scroll-hint ui" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
