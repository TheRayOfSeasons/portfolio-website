import { PerspectiveCamera } from 'three';
import { InteractiveScene } from "../core/scene-management";
import { Waves } from '../entities/waves';

export class WavesScene extends InteractiveScene {
  entities = {
    Waves,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    this.cameras.Main.position.z = 20;
    this.instances.Waves.group.position.set(0, -7, 0);
  }
}
