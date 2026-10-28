import { Mega } from './Mega'

const SERVICES = [
  ['Test drive', 'Book an hour behind the wheel at our track partner or on public roads.'],
  ['Porsche Service', 'Factory-trained technicians, genuine parts and a loan car while you wait.'],
  ['Financing', 'Leasing and credit plans tailored to the way you drive and own.'],
]

export function Finale() {
  return (
    <section id="finale" className="finale">
      <div className="glow glow--finale" />
      <div className="finale__hero">
        <Mega text="PORSCHE 911" className="finale__title" data-parallax />
        <div className="finale__cta ui">
          <a className="pill pill--solid" href="#contact">Book a test drive</a>
          <a className="pill" href="#models">Build yours</a>
        </div>
      </div>

      <div id="services" className="services ui">
        {SERVICES.map(([t, d]) => (
          <article key={t} className="service">
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>

      <footer className="footer ui">
        <div id="about" className="footer__col">
          <span className="logo">PORSCHE</span>
          <p>
            A concept showroom for the 911 family — built for enthusiasts who care about every
            millimetre of the line.
          </p>
        </div>
        <div id="contact" className="footer__col">
          <h4>Contact</h4>
          <a href="tel:+380000000000">+380 00 000 00 00</a>
          <a href="mailto:hello@example.com">hello@example.com</a>
        </div>
        <div className="footer__col">
          <h4>Showroom</h4>
          <p>Monday to Saturday, 09:00–20:00</p>
        </div>
        <p className="footer__note">
          Concept site, not affiliated with Porsche AG. 3D model based on{' '}
          <a href="https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf" target="_blank" rel="noreferrer">
            “(FREE) Porsche 911 Carrera 4S”
          </a>{' '}
          by{' '}
          <a href="https://sketchfab.com/karolmiklas" target="_blank" rel="noreferrer">
            Karol Miklas
          </a>
          , licensed under{' '}
          <a href="http://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
            CC BY-SA 4.0
          </a>
          ; compressed for the web. Model photos from Wikimedia Commons, CC BY-SA 4.0 — each photographer is credited
          in the photo viewer. Educational project —{' '}
          <a href="#disclaimer">read the disclaimer</a>.
        </p>
      </footer>
    </section>
  )
}
