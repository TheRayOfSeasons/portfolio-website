import { BubbleScene } from './three-animations/scenes/bubble-scene';
import { ThreeAnimations } from './three-animations/render-manager';


class ElementActivator {
  element: Element;
  flag = 'active';

  constructor(element: Element) {
    this.element = element;
  }

  setActive(toggle: boolean) {
    if (toggle) {
      this.element.classList.add(this.flag);
    } else {
      this.element.classList.remove(this.flag);
    }
  }
}

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

for (const animate of animations) {
  animate();
}
