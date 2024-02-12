import { ThreeAnimations } from "./three-animations/render-manager";
import { RipplingSphereScene } from "./three-animations/scenes/rippling-sphere-scene";

ThreeAnimations.init({
  name: 'ripple',
  sceneClass: RipplingSphereScene,
  canvas: document.getElementById('ripple') as HTMLCanvasElement,
  useClock: true,
});
