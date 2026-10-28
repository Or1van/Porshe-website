import { useRef, useState } from 'react'
import { drag } from '../rig'

const SPEED = 0.008 // radians per pixel
const KEY_STEP = 0.35

// Transparent layer over the car: horizontal drag spins it, vertical swipes still scroll the page.
export function DragZone({ className = '' }) {
  const last = useRef(null)
  const [used, setUsed] = useState(false)

  const down = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = { x: e.clientX, t: performance.now() }
    drag.active = true
    drag.vel = 0
    setUsed(true)
  }

  const move = (e) => {
    if (!last.current) return
    const now = performance.now()
    const dx = e.clientX - last.current.x
    const dt = Math.max(8, now - last.current.t) / 1000
    last.current = { x: e.clientX, t: now }
    drag.yaw += dx * SPEED
    drag.vel = Math.max(-12, Math.min(12, (dx * SPEED) / dt))
  }

  const up = () => {
    last.current = null
    drag.active = false
  }

  const key = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    drag.yaw += e.key === 'ArrowLeft' ? -KEY_STEP : KEY_STEP
    setUsed(true)
  }

  return (
    <div
      className={`drag-zone ui ${className}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      tabIndex={0}
      role="group"
      aria-label="Rotate the car: drag sideways or use the left and right arrow keys"
    >
      <span className={`drag-hint ${used ? 'is-hidden' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        Drag to rotate
      </span>
    </div>
  )
}
