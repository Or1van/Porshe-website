# Porsche 911 — Concept Showroom

A dark, pink-accented concept website for the Porsche 911 family, built around a real-time 3D car.
The car drives in on load, turns 360° as you scroll, can be spun by hand, and is repainted live by the configurator.

![Hero](docs/screenshots/hero.jpg)

> Educational, non-commercial project. Not affiliated with, endorsed by or connected to Porsche AG.
> All third-party materials belong to their authors — see the in-site **Disclaimer** (`/#disclaimer`) and [Credits](#credits-and-licences).

## Features

- **Scroll-driven 3D car** — the car moves between camera poses as you scroll, with a pinned section where it makes a full 360° turn while feature captions change.
- **Drag to rotate** — spin the car with the mouse, a finger or the ← → keys on the hero and in the configurator. It keeps some inertia after release and resets when you scroll on.
- **Live configurator** — body paint (presets plus any custom colour), wheel finish and brake caliper colour, with smooth colour transitions on the 3D model.
- **Three models** — 911 GT3 RS, 911 GTS and 911 Turbo S, each with its own title, specs and photos. Each model can also load its own 3D file (see [Per-model 3D files](#per-model-3d-files)).
- **Photo viewer** — two photos per model with full-screen viewing, keyboard navigation and photographer credits.
- **Intro sequence** — loader, rising headline letters and a drive-in with rolling wheels.
- **Responsive** — separate camera poses for mobile, a burger menu and touch-friendly controls.
- **Accessible** — visible keyboard focus, keyboard-operable rotation and photo viewer, and `prefers-reduced-motion` support (no intro or parallax).

## Screenshots

| 360° section | Configurator |
| --- | --- |
| ![360° section](docs/screenshots/spin-360.jpg) | ![Configurator](docs/screenshots/configurator.jpg) |
| **Turbo S with gold wheels and yellow calipers** | **Photo viewer** |
| ![Turbo S configuration](docs/screenshots/configurator-turbo-s.jpg) | ![Photo viewer](docs/screenshots/photo-viewer.jpg) |
| **Finale** | **Mobile** |
| ![Finale](docs/screenshots/finale.jpg) | <img src="docs/screenshots/mobile-hero.jpg" width="48%" alt="Mobile hero"> <img src="docs/screenshots/mobile-configurator.jpg" width="48%" alt="Mobile configurator"> |

## Tech stack

| Area | Library |
| --- | --- |
| UI | [React 19](https://react.dev) + [Vite 7](https://vite.dev) |
| 3D | [three.js](https://threejs.org), [React Three Fiber](https://r3f.docs.pmnd.rs), [drei](https://drei.docs.pmnd.rs) |
| Animation | [GSAP](https://gsap.com) + ScrollTrigger, `@gsap/react` |
| Assets | glTF/GLB with Draco geometry and WebP textures, compressed with [gltf-transform](https://gltf-transform.dev) |

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # dev server on http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Project structure

```
public/
  draco/              Draco decoder (served locally, no CDN needed)
  images/             model photos (Wikimedia Commons)
  models/             3D models + licence file
src/
  config.js           models, colours, wheel finishes, camera poses, 3D part matchers
  rig.js              scroll progress → car pose, drag state
  App.jsx             state, ScrollTrigger stages, pinned 360° timeline, intro
  styles.css          all styles (design tokens at the top)
  components/
    Scene.jsx         fixed full-screen canvas, lights, studio environment
    Car.jsx           model loading, normalisation, wheel pivots, live recolouring
    DragZone.jsx      pointer / keyboard rotation with inertia
    Hero.jsx          first screen
    Spin.jsx          pinned 360° section
    Models.jsx        model stage + configurator
    Gallery.jsx       model photos + full-screen viewer
    Finale.jsx        closing section, services, footer, credits
    Nav.jsx, Loader.jsx, Mega.jsx
```

## How it works

**Layering.** The page is stacked as glow backgrounds → giant headlines → one fixed WebGL canvas → UI. The car
sits *in front of* the huge type and *behind* buttons and panels, as in the original mockup. The canvas ignores
pointer events; dedicated transparent `DragZone` layers capture drags.

**Scroll choreography.** Instead of several tweens fighting over the same object, each scroll stage only records
its progress (0–1):

| Stage | Trigger | Effect |
| --- | --- | --- |
| `p[0]` | `#spin` enters | hero pose → side view |
| `p[1]` | `#spin` pinned (220% of viewport) | full 360° turn, captions, degree meter |
| `p[2]` | `#models` enters | car moves beside the configurator |
| `p[3]` | `#finale` enters | front three-quarter view under "PORSCHE 911" |
| `p[4]` | `#services` enters | car scrolls away with the page |

Every frame `currentPose()` in `src/rig.js` turns those values into a target pose and `Car.jsx` damps towards it,
so motion stays smooth and React never re-renders on scroll.

**Model normalisation.** Any GLB is centred, placed on the ground, scaled to a fixed length and turned so its
length runs along the z-axis. Wheel nodes are re-pivoted on their own bounding-box centre so they roll in place.

**Performance.** Draco + WebP assets (21 MB → 1.5 MB), transmission disabled on glass, single-pass transparent
materials, shaders compiled with `compileAsync` before the intro, no allocations in the frame loop and a capped
pixel ratio. Measured: 46 draw calls and about 348k triangles per frame, steady at 60 fps on a desktop GPU.

## Customisation

All content lives in [`src/config.js`](src/config.js).

- **Colours:** `BODY_COLORS`, `RIM_FINISHES` (colour, metalness, roughness) and `CALIPER_COLORS`.
- **Models:** `MODELS` — name, headline, specs, default paint, 3D file and photos.
- **Camera poses:** `POSES.desktop` / `POSES.mobile` — `x` (fraction of half the viewport width), `y`, `rotY`, `rotX`, `scale` per section.
- **Design tokens:** CSS custom properties at the top of [`src/styles.css`](src/styles.css).

### Per-model 3D files

Each entry in `MODELS` points to its own file (`/models/gt3rs.glb`, `/models/gts.glb`, `/models/turbos.glb`).
On load the app sends a HEAD request for each one; any file that is missing falls back to the shared Carrera 4S model.

To add a model:

1. Put the `.glb` in `public/models/` under the expected name.
2. Compress it, keeping mesh names intact so the configurator can find parts:
   ```bash
   npx @gltf-transform/cli optimize source.glb public/models/gt3rs.glb \
     --compress draco --texture-compress webp --texture-size 1024 \
     --simplify-error 0.0001 --simplify-ratio 0.5 \
     --join false --flatten false --instance false --palette false
   ```
3. Check the part names (for example at [gltf.report](https://gltf.report)) and set the model's `match` rules in
   `config.js`: `body`, `rims`, `calipers`, `glass` and `wheels`. Each rule is a regex on the mesh or material name.
   GLTFLoader strips dots, so `Cylinder.000` becomes `Cylinder000`.
4. Set `rotationY` to `0` or `Math.PI` so the nose faces the camera.

## Credits and licences

Third-party assets keep their own licences. Their credits are shown on the site and must stay when you reuse them.

**3D model** — "(FREE) Porsche 911 Carrera 4S" by [Karol Miklas](https://sketchfab.com/karolmiklas),
[source](https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf),
licensed under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/). Compressed for the web; see
[`public/models/LICENSE-porsche-911.txt`](public/models/LICENSE-porsche-911.txt).

**Photos** — Wikimedia Commons, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/):

| File | Author |
| --- | --- |
| [Porsche 992 GT3 RS DSC 9055](https://commons.wikimedia.org/wiki/File:Porsche_992_GT3_RS_DSC_9055.jpg) | Alexander Migl |
| [Porsche 911 GT3 RS (2022) 1X7A7164](https://commons.wikimedia.org/wiki/File:Porsche_911_GT3_RS_(2022)_1X7A7164.jpg) | Alexander-93 |
| [Porsche 911 (992) Carrera GTS](https://commons.wikimedia.org/wiki/File:Porsche_911_(992)_Carrera_GTS.jpg) | MrWalkr |
| [Porsche 992 Carrera 4 GTS 1X7A7209](https://commons.wikimedia.org/wiki/File:Porsche_992_Carrera_4_GTS_1X7A7209.jpg) | Alexander-93 |
| [Porsche 992 Turbo S 1X7A6046 (cropped)](https://commons.wikimedia.org/wiki/File:Porsche_992_Turbo_S_1X7A6046_(cropped).jpg) | Alexander Migl |
| [Porsche 992 Turbo S 1X7A0411](https://commons.wikimedia.org/wiki/File:Porsche_992_Turbo_S_1X7A0411.jpg) | Alexander Migl |

**Fonts** — [Anton](https://fonts.google.com/specimen/Anton) and [Jost](https://fonts.google.com/specimen/Jost) (SIL Open Font License), via Google Fonts.

"Porsche", "911" and related names are trademarks of Dr. Ing. h.c. F. Porsche AG. They are used here only to
describe the cars shown.
