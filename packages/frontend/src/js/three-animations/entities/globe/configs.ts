export const GLOBE_PARAMETERS = {
  debug: false,
  cameraDistance: 18,
  pauseThreshold: 1300,
  settings: {
    enableCountryNames: false,
    enableBackdropGlow: true,
    enableCountryPanningInteractions: false,
    enableArcLayer: true,
  },
  radius: 8,
  alphaTexture: '/assets/globe/earth-spec.jpeg',
  colorTexture: '/assets/globe/earth-spec-color-map.png',
  dotTexture: '/assets/globe/circle.png',
  cameraPanOffset: 5,
  continentSphereMultiplier: 500,
  waterSphereSegmentMutliplier: 32,
  waterSphereScale: 0.995,
  globeTiltOffset: {
    x: 0.0,
    y: 0.0,
  },
  rotationSpeed: 0.5,
  panningAcceleration: 0.05,
  glow: {
    texture: '/assets/globe/glow.png',
    scale: 38,
    position: {
      x: 5,
      y: -2,
      z: -10,
    },
  },
  arcs: {
    origin: 'ph', // must match an id from countries.ts
    animation: {
      speed: 1,
      frequency: 0.1,
    },
  },
  seaColor: '#09091d',
  seaOpacity: 0.4,
  twinkleColor1: '#284364',
  twinkleColor2: '#2c0ea8',
  countryColor: '#9c68c9',
  minCountryColor: '#5ebef1',
  arcImpactColor: '#00ff00',
  arcHeadColor: '#1bee9a',
  arcTailColor: '#0e0ea8',
  ambientGlowColor: '#43147a',
  enableAmbientGlow: true,
};