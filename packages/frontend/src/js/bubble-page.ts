import { BubbleScene } from './three-animations/scenes/bubble-scene';
import { ThreeAnimations } from './three-animations/render-manager';
import { ElementActivator } from './commons/element-activator';
import { loadFonts } from './fonts';

ThreeAnimations.onLoad(() => {
  setTimeout(() => {
    const curtains = document.querySelectorAll('.curtain');
    for (const curtain of curtains) {
      const activator = new ElementActivator(curtain);
      activator.setActive(true);
    }
  }, 500);
});

const animations = [
  async () => ThreeAnimations.init({
    name: 'hero',
    canvas: document.getElementById('hero') as HTMLCanvasElement,
    sceneClass: BubbleScene,
  }),
];

loadFonts({
  active: () => {
    for (const animate of animations) {
      animate();
    }
  }
});
