import { ThreeAnimations } from './three-animations/render-manager';
import { GlobeScene } from './three-animations/scenes/globe-scene';

ThreeAnimations.onLoad(() => {
  console.log('Globe Loaded');
});

ThreeAnimations.init({
  name: 'globe',
  sceneClass: GlobeScene,
  canvas: document.getElementById('globe-view') as HTMLCanvasElement,
  useClock: true,
});
