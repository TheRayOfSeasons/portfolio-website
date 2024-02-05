import { setMusic } from './three-animations/entities/sound-wave-visualizer/store/actions';
import {
  invertWaves,
  musicIsLoading,
  musicIsPlaying,
  playToggle
} from './three-animations/entities/sound-wave-visualizer/store/subjects';
import { ThreeAnimations } from './three-animations/render-manager';
import { SoundWaveVisualizerScene } from './three-animations/scenes/sound-wave-visualizer-scene';

let play = false;

export const setupMusicForm = () => {
  const button: HTMLButtonElement = document.getElementById('play') as HTMLButtonElement;
  const select: HTMLSelectElement = document.getElementById('music-selector') as HTMLSelectElement;
  if (!button) {
    throw new Error('<button> element with ID "play" not found');
  }
  if (!select) {
    throw new Error('<select> element with ID "music-selector" not found');
  }

  const playIcon: HTMLElement = button.querySelector('.play-icon') as HTMLElement;
  const pauseIcon: HTMLElement = button.querySelector('.pause-icon') as HTMLElement;
  const spinnerIcon: HTMLElement = document.getElementById('spinner-icon') as HTMLElement;

  if (!playIcon) {
    throw new Error('Element inside the play button with id "play-icon" not found.');
  }
  if (!pauseIcon) {
    throw new Error('Element inside the play button with id "pause-icon" not found.');
  }
  if (!spinnerIcon) {
    throw new Error('Element inside the play button with id "spinner-icon" not found.');
  }

  const invert: HTMLInputElement = document.getElementById('invert') as HTMLInputElement;
  if (!invert) {
    throw new Error('Checkbox element with id "invert" not found.');
  }

  const changeMusic = () => {
    const sound = select.value;
    setMusic(sound);
  };
  select.addEventListener('change', () => {
    changeMusic();
    select.blur();
  });
  button.addEventListener('click', () => {
    play = !play;
    playToggle.next(play);
    changeMusic();
  });
  document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
      play = !play;
      playToggle.next(play);
      changeMusic();
    }
  });

  musicIsPlaying.subscribe({
    next: (isPlaying) => {
      if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'unset';
      }
      else {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'unset';
      }
    }
  });
  musicIsLoading.subscribe({
    next: (isLoading) => {
      button.disabled = isLoading;
      if (!spinnerIcon) {
        return;
      }
      if (isLoading) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'none';
        spinnerIcon.style.display = 'unset';
      } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'unset';
        spinnerIcon.style.display = 'none';
      }
    },
  });

  invert.addEventListener('click', () => {
    if (invert.checked) {
      invertWaves.next(true);
    }
    else {
      invertWaves.next(false);
    }
  });
}

const animate = () => ThreeAnimations.init({
  name: 'music-mesh',
  canvas: document.getElementById('music-mesh') as HTMLCanvasElement,
  sceneClass: SoundWaveVisualizerScene,
});

document.addEventListener('DOMContentLoaded', () => {
  setupMusicForm();
  animate();
});
