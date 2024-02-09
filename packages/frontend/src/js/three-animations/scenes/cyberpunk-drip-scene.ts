import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { CyberpunkDrip } from '../entities/cyberpunk-drip';

export class CyberpunkDripScene extends InteractiveScene {
  entities = {
    CyberpunkDrip
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    this.cameras.Main.position.z = 2;
  }
}
