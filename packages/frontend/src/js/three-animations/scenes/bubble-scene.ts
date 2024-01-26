import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { Bubble } from '../scene-objects/bubble';
import { HeroTextProjector } from '../scene-objects/hero-text-projector';
import { GlobeOrbit } from '../scene-objects/globe-orbit';

export class BubbleScene extends InteractiveScene {
  sceneObjects = {
    Bubble,
    HeroTextProjector,
    GlobeOrbit,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    this.cameras.Main.position.z = 20;
    this.instances.HeroTextProjector.group.position.set(0, 0, -8);
  }
}
