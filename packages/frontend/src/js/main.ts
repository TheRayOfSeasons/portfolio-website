import { BubbleScene } from './three-animations/scenes/bubble-scene';
import { ThreeAnimations } from './three-animations/render-manager';

const animations = [
  async () => ThreeAnimations.init({
    name: 'hero',
    canvas: document.getElementById('hero') as HTMLCanvasElement,
    sceneClass: BubbleScene,
  }),
];

for (const animate of animations) {
  animate();
}
