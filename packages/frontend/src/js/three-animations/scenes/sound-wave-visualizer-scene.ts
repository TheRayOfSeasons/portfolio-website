import { PerspectiveCamera } from 'three';
import { listener } from '../entities/sound-wave-visualizer/components/listener';
import { InteractiveScene } from '../core/scene-management';
import { SoundWaveVisualizer } from '../entities/sound-wave-visualizer/sound-wave-visualizer';
import { GlobeOrbit } from '../entities/globe-orbit';

export class SoundWaveVisualizerScene extends InteractiveScene {
  entities = {
    SoundWaveVisualizer,
    GlobeOrbit,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    if (!this.scene) {
      throw new Error('Failed to initialize Scene.');
    }
    this.cameras.Main.position.set(
      2.3079039992366446,
      3.4263308268277446,
      2.816706622180851
    );
    this.cameras.Main.add(listener);
    this.scene.add(this.cameras.Main);
  }
}
