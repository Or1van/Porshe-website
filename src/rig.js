import { POSES } from './config'

// Scroll progress (0..1) of each stage, written by ScrollTrigger and read every frame by the car.
// Poses are derived from these values, so no two tweens ever fight over the same property.
//   p[0] hero → spin   p[1] 360° turn   p[2] spin → models   p[3] models → finale   p[4] leave with page
export const track = { poses: POSES.desktop, p: [0, 0, 0, 0, 0] }

// Separate channel for the intro "drive-in".
export const intro = { x: -9, wheel: 0 }

// Yaw added by the visitor dragging the car (radians), with release inertia.
// Only applies while the car rests in the hero or the configurator; reset elsewhere.
export const drag = { yaw: 0, vel: 0, active: false }

export const dragAllowed = () => {
  const p = track.p
  return (p[0] === 0 && p[1] === 0) || (p[2] >= 1 && p[3] === 0)
}

const KEYS = ['x', 'y', 'rotY', 'rotX', 'scale']
const smooth = (t) => t * t * (3 - 2 * t)

function mix(out, a, b, t) {
  for (const k of KEYS) out[k] = a[k] + (b[k] - a[k]) * t
}

// spin pose after the full turn, cached per pose set so the frame loop allocates nothing
const turnedCache = new WeakMap()

export function currentPose(out) {
  const { poses: P, p } = track
  let turned = turnedCache.get(P)
  if (!turned) turnedCache.set(P, (turned = { ...P.spin, rotY: P.spin.rotY + Math.PI * 2 }))

  if (p[3] > 0) mix(out, P.models, P.finale, smooth(p[3]))
  else if (p[2] > 0) mix(out, turned, P.models, smooth(p[2]))
  else if (p[1] > 0) mix(out, P.spin, turned, p[1])
  else mix(out, P.hero, P.spin, smooth(p[0]))

  out.lift = p[4]
  return out
}
