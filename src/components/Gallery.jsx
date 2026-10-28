import { useEffect, useRef, useState } from 'react'

// Photos of the selected model; a click opens them full size with the photographer's credit.
export function Gallery({ model }) {
  const dialog = useRef()
  const [index, setIndex] = useState(0)
  const photos = model.photos ?? []

  useEffect(() => setIndex(0), [model.id])

  if (!photos.length) return null
  const photo = photos[index] ?? photos[0]

  const open = (i) => {
    setIndex(i)
    dialog.current?.showModal()
  }
  const step = (dir) => setIndex((i) => (i + dir + photos.length) % photos.length)

  return (
    <>
      {/* key restarts the fade when the model changes */}
      <ul className="gallery" key={model.id} aria-label={`${model.name} photos`}>
        {photos.map((p, i) => (
          <li key={p.src}>
            <button className="gallery__thumb" onClick={() => open(i)} aria-label={`Open photo: ${p.alt}`}>
              <img src={p.src} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label={`${model.name} photos`}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        <figure>
          <img src={photo.src} alt={photo.alt} />
          <figcaption>
            <span>{model.name}</span>
            <span>
              Photo:{' '}
              <a href={photo.href} target="_blank" rel="noreferrer">
                {photo.author}
              </a>
              , {photo.license}
            </span>
          </figcaption>
        </figure>
        {photos.length > 1 && (
          <div className="lightbox__nav">
            <button onClick={() => step(-1)} aria-label="Previous photo">‹</button>
            <span>
              {index + 1} / {photos.length}
            </span>
            <button onClick={() => step(1)} aria-label="Next photo">›</button>
          </div>
        )}
        <button className="lightbox__close" onClick={() => dialog.current.close()} aria-label="Close photos">
          ×
        </button>
      </dialog>
    </>
  )
}
