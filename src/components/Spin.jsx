const FEATURES = [
  ['01', 'Rear-mounted flat-six', 'The boxer engine sits behind the rear axle — the layout that has defined the 911 since 1963.'],
  ['02', 'Porsche Traction Management', 'Carrera 4S all-wheel drive sends torque forward the moment the rear starts to slip.'],
  ['03', 'Adaptive rear spoiler', 'Extends automatically with speed for downforce, then tucks away into the engine lid.'],
  ['04', 'The silhouette', 'One continuous roofline falling to the tail. Recognisable from any angle, in any colour.'],
]

export function Spin() {
  return (
    <section id="spin" className="spin">
      <div className="glow glow--spin" />
      <div className="spin__mega" aria-hidden="true">
        360°
      </div>

      <div className="spin__head ui">
        <h2 className="h2">Every angle engineered</h2>
      </div>

      <div className="spin__features ui">
        {FEATURES.map(([n, t, d]) => (
          <article key={n} className="spin__feature">
            <span className="spin__num">{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </article>
        ))}
      </div>

      <div className="spin__meter ui">
        <span data-deg>000°</span>
        <div className="spin__bar">
          <i />
        </div>
        <span>360°</span>
      </div>
    </section>
  )
}
