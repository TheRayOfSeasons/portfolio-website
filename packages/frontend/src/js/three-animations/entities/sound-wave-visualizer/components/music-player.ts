import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import {
  frequencySubject,
  musicIsLoading,
  musicIsPlaying,
  musicUpload,
  playToggle
} from '../store/subjects';
import { listener } from './listener';

export class MusicPlayer extends MonoBehaviour {
  analyser: THREE.AudioAnalyser;
  musicPlayer: THREE.Audio;
  loader: THREE.AudioLoader;

  music = '';
  volume = 0.5;

  constructor(args: any) {
    super(args);
    const fftSize = 512;
    this.musicPlayer = new THREE.Audio(listener);
    this.analyser = new THREE.AudioAnalyser(this.musicPlayer, fftSize);
    this.loader = new THREE.AudioLoader(this.scene.loadingManager);
  }

  play() {
    musicIsLoading.next(true);
    if (this.musicPlayer.source) {
      this.musicPlayer.stop();
    }
    this.loader.load(this.music, (buffer: AudioBuffer) => {
      this.musicPlayer.setBuffer(buffer);
      this.musicPlayer.setLoop(true);
      this.musicPlayer.play();
      this.musicPlayer.setVolume(this.volume);
      musicIsPlaying.next(true);
      musicIsLoading.next(false);
    });
    playToggle.subscribe({
      next: (play) => {
        if (play) {
          this.musicPlayer.play();
          musicIsPlaying.next(true);
        }
        else {
          this.musicPlayer.pause();
          musicIsPlaying.next(false);
        }
      },
    })
  }

  start() {
    musicUpload.subscribe({
      next: ({ sound }) => {
        if (sound === this.music) {
          return;
        }
        this.music = sound;
        if (this.music) {
          this.play();
        }
      }
    });
  }

  update(): void {
    frequencySubject.next({
      average: this.analyser.getAverageFrequency(),
      frequency: this.analyser.getFrequencyData(),
    })
  }
}