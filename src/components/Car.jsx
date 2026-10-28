import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { MODEL } from '../config'
import { currentPose, drag, dragAllowed, intro } from '../rig'

const test = (rule, mesh) =>
  rule &&
  ((rule.mesh && rule.mesh.test(mesh.name)) ||
    (rule.material && mesh.material && rule.material.test(mesh.material.name)))

const PAINTABLE = ['body', 'rims', 'calipers', 'glass']

const TAU = Math.PI * 2

// `spec` is MODEL merged with a model's own file settings (url, rotationY, match…)
export function Car({ spec = MODEL, body, rims, calipers }) {
  const { scene } = useGLTF(spec.url, MODEL.draco)
  const group = useRef()
  const viewport = useThree((s) => s.viewport)

  // Shared materials the configurator drives
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({
        // satin pastel paint, like the mockup
        color: body,
        metalness: 0.12,
        roughness: 0.42,
        clearcoat: 0.7,
        clearcoatRoughness: 0.22,
      }),
      rims: new THREE.MeshStandardMaterial({ color: rims.hex, metalness: rims.metalness, roughness: rims.roughness }),
      calipers: new THREE.MeshStandardMaterial({ color: calipers, metalness: 0.3, roughness: 0.35 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#0b0b0d',
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.78,
      }),
    }),
    // created once; colours are lerped in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const { model, wheels, axle } = useMemo(() => {
    const model = scene.clone(true)
    const wheelNodes = []
    model.traverse((o) => {
      if (test(spec.match.wheels, o)) wheelNodes.push(o)
      if (!o.isMesh) return
      // transmission glass from the source file costs an extra render pass,
      // and transparent double-sided materials draw every mesh twice
      if (o.material?.transmission) o.material.transmission = 0
      if (o.material?.transparent && o.material.side === THREE.DoubleSide) o.material.forceSinglePass = true
      for (const key of PAINTABLE) {
        if (test(spec.match[key], o)) {
          o.material = mats[key]
          break
        }
      }
    })

    model.updateMatrixWorld(true)
    const raw = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3())
    // the axle runs across the car: the shorter horizontal side
    const axle = raw.x < raw.z ? 'x' : 'z'

    // Re-pivot each wheel node on its own centre so it can roll in place
    const wheels = wheelNodes.map((node) => {
      const pivot = new THREE.Group()
      new THREE.Box3().setFromObject(node).getCenter(pivot.position)
      model.add(pivot)
      pivot.updateMatrixWorld(true)
      pivot.attach(node)
      return pivot
    })

    // normalise: length along z, nose to camera, centred, sitting on y = 0
    model.rotation.y = spec.rotationY + (axle === 'z' ? Math.PI / 2 : 0)
    model.scale.setScalar(spec.length / Math.max(raw.x, raw.z))
    model.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(model)
    const c = box.getCenter(new THREE.Vector3())
    model.position.set(-c.x, -box.min.y, -c.z)
    return { model, wheels, axle }
  }, [scene, mats, spec])

  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,0,0,0.9)')
    g.addColorStop(0.55, 'rgba(0,0,0,0.55)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const target = useMemo(
    () => ({ body: new THREE.Color(), rims: new THREE.Color(), calipers: new THREE.Color() }),
    []
  )
  useLayoutEffect(() => {
    target.body.set(body)
    target.rims.set(rims.hex)
    target.calipers.set(calipers)
    mats.rims.metalness = rims.metalness
    mats.rims.roughness = rims.roughness
  }, [body, rims, calipers, target, mats])

  const lastScroll = useRef(typeof window !== 'undefined' ? window.scrollY : 0)
  const spin = useRef(0)
  const rig = useMemo(() => ({}), [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const fit = Math.min(1, viewport.width / 7.2)
    currentPose(rig)

    // visitor drag: inertia after release, dropped (minus whole turns) once the car moves on
    if (dragAllowed()) {
      if (!drag.active) {
        drag.yaw += drag.vel * d
        drag.vel *= Math.exp(-3.5 * d)
      }
    } else if (drag.yaw !== 0) {
      g.rotation.y -= Math.round(drag.yaw / TAU) * TAU
      drag.yaw = 0
      drag.vel = 0
    }
    rig.rotY += drag.yaw

    g.position.x = THREE.MathUtils.damp(g.position.x, rig.x * viewport.width * 0.5 + intro.x, 5, d)
    g.position.y = THREE.MathUtils.damp(g.position.y, rig.y + rig.lift * viewport.height, 5, d)
    // follow a finger tightly, scroll-driven turns more lazily
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, rig.rotY, drag.active ? 14 : 4, d)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rig.rotX, 4, d)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, rig.scale * fit, 5, d))

    // wheels roll with scroll distance and with the intro drive-in
    const sy = window.scrollY
    spin.current += (sy - lastScroll.current) * 0.006
    lastScroll.current = sy
    for (const w of wheels) w.rotation[axle] = (spin.current + intro.wheel) * spec.wheelDirection

    const k = 1 - Math.exp(-6 * d)
    mats.body.color.lerp(target.body, k)
    mats.rims.color.lerp(target.rims, k)
    mats.calipers.color.lerp(target.calipers, k)
  })

  return (
    <group ref={group}>
      <primitive object={model} />
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} renderOrder={-1}>
        {/* car length runs along z, so the plane's height is the long side */}
        <planeGeometry args={[MODEL.length * 0.62, MODEL.length * 1.25]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

useGLTF.preload(MODEL.url, MODEL.draco)
