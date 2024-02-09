import { ThreeAnimations } from './three-animations/render-manager';
import { CyberpunkDripScene } from './three-animations/scenes/cyberpunk-drip-scene';

document.addEventListener('DOMContentLoaded', () => {
  const headerName = document.querySelector('.header-name');
  const headerTitle = document.querySelector('.header-title');
  headerName?.classList.add('active');
  setTimeout(() => {
    headerTitle?.classList.add('active');
  }, 600);
  const rotatingGradientBackgrounds = document.querySelectorAll('.rotating-gradient-background');

  const update = (time: number) => {
    for (const background of [...rotatingGradientBackgrounds]) {
      const gradient = `
        linear-gradient(
          ${(time * 0.1) + 45}deg,
          #007AFF 0%,
          #02D7F2 50%,
          #007AFF 100%
        )
      `;
      (background as HTMLElement).style.background = gradient;
    }
    window.requestAnimationFrame(update);
  }

  update(0);
  window.requestAnimationFrame(update);

  const canvas: HTMLCanvasElement = document.getElementById('cyberpunk-drip') as HTMLCanvasElement;
  if (canvas) {
    ThreeAnimations.init({
      canvas,
      name: 'cyberpunk-drip',
      sceneClass: CyberpunkDripScene,
    });
  }
});
