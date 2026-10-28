import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Car } from './Car'

// Fixed, full-screen canvas that sits between the giant titles and the UI layer.
export function Scene({ spec, body, rims, calipers, onReady }) {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 1.25, 8.4], fov: 32 }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0.1, 0)
          // dev-only handle for reading gl.info from the console / tests
          if (import.meta.env.DEV) window.__gl = gl
        }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 3]} intensity={1.6} />
        <spotLight position={[-6, 4, -4]} intensity={60} angle={0.5} penumbra={1} color="#ff5fae" />

        <Suspense fallback={null}>
          <Car spec={spec} body={body} rims={rims} calipers={calipers} />
          <Ready onReady={onReady} />
        </Suspense>

        {/* Studio reflections made from light panels — no HDR download needed */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} position={[0, 5, -1]} scale={[10, 1.4, 1]} rotation-x={Math.PI / 2} />
          <Lightformer intensity={1.4} position={[-6, 1.5, 0]} scale={[8, 2, 1]} rotation-y={Math.PI / 2} />
          <Lightformer intensity={1.4} position={[6, 1.5, 0]} scale={[8, 2, 1]} rotation-y={-Math.PI / 2} />
          <Lightformer intensity={3} color="#ff6fb5" position={[0, 1, -8]} scale={[14, 3, 1]} />
          <Lightformer intensity={0.8} color="#ffd1e6" position={[0, 2, 8]} scale={[12, 3, 1]} rotation-y={Math.PI} />
        </Environment>
      </Canvas>
    </div>
  )
}

// Mounts only after the model's Suspense resolves.
// Shaders are compiled up front so the intro drive-in doesn't stutter on first draw.
function Ready({ onReady }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let live = true
    gl.compileAsync(scene, camera)
      .catch(() => {})
      .then(() => live && onReady?.())
    return () => {
      live = false
    }
  }, [gl, scene, camera, onReady])
  return null
}
