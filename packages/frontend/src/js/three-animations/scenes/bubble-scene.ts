import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { Bubble } from '../scene-objects/bubble';

export class BubbleScene extends InteractiveScene {
  sceneObjects = {
    Bubble,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    this.cameras.Main.position.z = 20;
  }
}
