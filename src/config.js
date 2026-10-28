// ---------------------------------------------------------------------------
// 3D model
// Drop your own .glb into public/models/ and point `url` at it.
// The matchers decide which parts the configurator can repaint.
// ---------------------------------------------------------------------------
// "(FREE) Porsche 911 Carrera 4S" by Karol Miklas, CC-BY-SA-4.0
// https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
// Compressed with gltf-transform (draco + webp). GLTFLoader strips dots from names: Cylinder.000 → Cylinder000
export const MODEL = {
  url: '/models/porsche-911.glb',
  draco: '/draco/',
  // rotation that makes the car's nose face the camera at rotY = 0
  rotationY: 0,
  // the model is rescaled so its longest side equals this (world units)
  length: 4.6,
  // flip to -1 if the wheels roll backwards
  wheelDirection: 1,
  match: {
    body: { material: /^paint$/i },
    rims: { mesh: /^Cylinder\.?\d+_0$/i },
    calipers: { mesh: /^Cylinder\.?\d+_3$/i },
    glass: { material: /^window$/i },
    // nodes that roll when the page scrolls; pivots are re-centred on each node's bounds
    wheels: { mesh: /^Cylinder\.?\d+$/i },
  },
}

// ---------------------------------------------------------------------------
// Configurator options
// ---------------------------------------------------------------------------
export const BODY_COLORS = [
  { name: 'Frozen Berry', hex: '#e9a8c6' },
  { name: 'Ruby Star', hex: '#b4507f' },
  { name: 'Gentian Blue', hex: '#223a6e' },
  { name: 'Carrara White', hex: '#f1efef' },
  { name: 'Jet Black', hex: '#18181a' },
  { name: 'Rose Quartz', hex: '#d8a19c' },
]

export const RIM_FINISHES = [
  { name: 'Satin Graphite', hex: '#2b2b2f', metalness: 0.9, roughness: 0.45 },
  { name: 'Brilliant Silver', hex: '#c9ccd2', metalness: 1, roughness: 0.25 },
  { name: 'Aurum Gold', hex: '#b8904a', metalness: 1, roughness: 0.3 },
  { name: 'Gloss Black', hex: '#0c0c0d', metalness: 0.8, roughness: 0.15 },
]

export const CALIPER_COLORS = [
  { name: 'Guards Red', hex: '#c4161c' },
  { name: 'Racing Yellow', hex: '#f0c419' },
  { name: 'Gloss Black', hex: '#141414' },
  { name: 'Pink Accent', hex: '#e48ac0' },
]

// Guess for models whose part names haven't been checked yet — tune per model in `MODELS[].model.match`
const GENERIC_MATCH = {
  body: { material: /paint|body|carpaint|exterior/i },
  rims: { material: /rim|alloy/i },
  calipers: { material: /caliper/i },
  glass: { material: /window|glass/i },
  wheels: { mesh: /^wheel[_.]?(fl|fr|rl|rr|front|rear)/i },
}

// Each model can have its own .glb. Until the file exists in public/models/,
// the shared Carrera 4S above stands in (App checks with a HEAD request).
// Photos: Wikimedia Commons, CC BY-SA 4.0 — the credit is shown with each photo.
const commons = (file, author) => ({
  author,
  license: 'CC BY-SA 4.0',
  href: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`,
})

export const MODELS = [
  {
    id: 'gt3rs',
    name: 'Porsche 911 GT3 RS',
    title: 'MODEL RS',
    power: '386 kW',
    accel: '3.2 sec',
    top: '296 km/h',
    color: '#e9a8c6',
    model: { url: '/models/gt3rs.glb', rotationY: 0, match: GENERIC_MATCH },
    photos: [
      { src: '/images/gt3rs-1.jpg', alt: 'Yellow 911 GT3 RS from the front', ...commons('Porsche 992 GT3 RS DSC 9055.jpg', 'Alexander Migl') },
      { src: '/images/gt3rs-2.jpg', alt: 'Grey 911 GT3 RS from the rear, showing the swan-neck wing', ...commons('Porsche 911 GT3 RS (2022) 1X7A7164.jpg', 'Alexander-93') },
    ],
  },
  {
    id: 'gts',
    name: 'Porsche 911 GTS',
    title: 'MODEL GTS',
    power: '357 kW',
    accel: '3.0 sec',
    top: '312 km/h',
    color: '#f1efef',
    model: { url: '/models/gts.glb', rotationY: 0, match: GENERIC_MATCH },
    photos: [
      { src: '/images/gts-1.jpg', alt: 'White 911 Carrera GTS from the front', ...commons('Porsche 911 (992) Carrera GTS.jpg', 'MrWalkr') },
      { src: '/images/gts-2.jpg', alt: 'Red 911 Carrera 4 GTS from the rear', ...commons('Porsche 992 Carrera 4 GTS 1X7A7209.jpg', 'Alexander-93') },
    ],
  },
  {
    id: 'turbos',
    name: 'Porsche 911 Turbo S',
    title: 'TURBO S',
    power: '478 kW',
    accel: '2.7 sec',
    top: '330 km/h',
    color: '#223a6e',
    model: { url: '/models/turbos.glb', rotationY: 0, match: GENERIC_MATCH },
    photos: [
      { src: '/images/turbos-1.jpg', alt: 'Grey 911 Turbo S with gold wheels', ...commons('Porsche 992 Turbo S 1X7A6046 (cropped).jpg', 'Alexander Migl') },
      { src: '/images/turbos-2.jpg', alt: 'White 911 Turbo S from the front', ...commons('Porsche 992 Turbo S 1X7A0411.jpg', 'Alexander Migl') },
    ],
  },
]

// ---------------------------------------------------------------------------
// Car poses per section (scroll animates between them)
// x: fraction of half the viewport width, y: world units,
// rotY: radians (0 = nose to camera), scale: multiplier
// ---------------------------------------------------------------------------
export const POSES = {
  desktop: {
    hero: { x: 0, y: -0.55, rotY: -0.75, rotX: 0.06, scale: 1 },
    spin: { x: 0, y: -0.45, rotY: -Math.PI / 2, rotX: 0.04, scale: 1.05 },
    models: { x: -0.42, y: -0.55, rotY: -2.35, rotX: 0.08, scale: 0.8 },
    finale: { x: 0, y: -0.85, rotY: -0.35, rotX: 0.05, scale: 1.12 },
  },
  mobile: {
    hero: { x: 0, y: 0.05, rotY: -0.75, rotX: 0.1, scale: 1.45 },
    spin: { x: 0, y: -0.05, rotY: -Math.PI / 2, rotX: 0.08, scale: 1.45 },
    models: { x: 0, y: 0.3, rotY: -2.35, rotX: 0.12, scale: 1.35 },
    finale: { x: 0, y: 0.3, rotY: -0.35, rotX: 0.08, scale: 1.4 },
  },
}
