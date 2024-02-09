import { ThreeAnimations } from './three-animations/render-manager';
import { CyberpunkDripScene } from './three-animations/scenes/cyberpunk-drip-scene';

document.addEventListener('DOMContentLoaded', () => {
  const headerName = document.querySelector('.header-name');
  const headerTitle = document.querySelector('.header-title');
  const banner = document.querySelector('.banner');
  const heroPicture = document.querySelector('.hero-picture');
  const heroMenu = document.querySelector('.hero-menu');
  headerName?.classList.add('active');
  setTimeout(() => {
    banner?.classList.add('active');
  }, 300);
  setTimeout(() => {
    headerTitle?.classList.add('active');
    heroPicture?.classList.add('active');
  }, 600);
  setTimeout(() => {
    heroMenu?.classList.add('active');
  }, 900);
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
