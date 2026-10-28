import { useEffect, useRef } from 'react'
import { MODELS } from '../config'

const HASH = '#disclaimer'
const REPO_ISSUES = 'https://github.com/Or1van/Porshe-website/issues'

// Opens whenever the URL hash is #disclaimer (nav, footer, or a shared link).
export function Disclaimer() {
  const dialog = useRef()

  useEffect(() => {
    const sync = () => {
      if (window.location.hash !== HASH || dialog.current.open) return
      dialog.current.showModal()
      // start on the text, not on the first link, so no focus ring flashes on open
      dialog.current.querySelector('.legal__body').focus()
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const onClose = () => {
    if (window.location.hash === HASH) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  const photos = MODELS.flatMap((m) => m.photos ?? [])

  return (
    <dialog
      ref={dialog}
      className="legal"
      aria-labelledby="legal-title"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <div className="legal__body" tabIndex={-1}>
        <h2 id="legal-title">Disclaimer</h2>
        <p className="legal__lead">
          This is a non-commercial, educational project, made to practise front-end development and
          real-time 3D on the web. It is not a real dealership and nothing on it is for sale.
        </p>

        <h3>No affiliation with Porsche</h3>
        <p>
          This site is not affiliated with, endorsed by or connected to Dr. Ing. h.c. F. Porsche AG.
          “Porsche”, “911”, “GT3 RS”, “Carrera”, “Turbo S” and related names belong to their owners and
          are used only to describe the cars shown.
        </p>

        <h3>Materials from the internet</h3>
        <p>
          The 3D model, photos and fonts were found online and are used under their free licences. I do
          not claim ownership of any of them — all rights stay with their authors:
        </p>
        <ul>
          <li>
            3D model: “(FREE) Porsche 911 Carrera 4S” by{' '}
            <a href="https://sketchfab.com/karolmiklas" target="_blank" rel="noreferrer">Karol Miklas</a>,{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
          </li>
          {photos.map((p) => (
            <li key={p.src}>
              Photo:{' '}
              <a href={p.href} target="_blank" rel="noreferrer">{p.alt}</a> by {p.author}, {p.license}
            </li>
          ))}
          <li>Fonts: Anton and Jost, SIL Open Font License, via Google Fonts</li>
        </ul>

        <h3>Content</h3>
        <p>
          Specifications are approximate and for illustration only. Buttons such as “Book a test drive”
          or “Request an offer” do not send any data, and the contact details are placeholders.
        </p>

        <h3>Removal requests</h3>
        <p>
          If you own any of the materials used here and would like them credited differently or
          removed, please{' '}
          <a href={REPO_ISSUES} target="_blank" rel="noreferrer">open an issue on GitHub</a> and it will be
          taken care of promptly.
        </p>
      </div>

      <button className="legal__close" onClick={() => dialog.current.close()} aria-label="Close disclaimer">
        ×
      </button>
    </dialog>
  )
}
