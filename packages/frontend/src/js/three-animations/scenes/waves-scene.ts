import { PerspectiveCamera } from 'three';
import { InteractiveScene } from "../core/scene-management";
import { Waves } from '../scene-objects/waves';

export class WavesScene extends InteractiveScene {
  sceneObjects = {
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
