import { useProgress } from '@react-three/drei'

export function Loader({ done }) {
  const { progress } = useProgress()
  const pct = done ? 100 : Math.round(progress)
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="logo">PORSCHE</span>
      <div className="loader__bar">
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <span className="loader__pct">{String(pct).padStart(3, '0')}</span>
    </div>
  )
}
