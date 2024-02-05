import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { Bubble } from '../entities/bubble';
import { HeroTextProjector } from '../entities/hero-text-projector';

export class BubbleScene extends InteractiveScene {
  entities = {
    Bubble,
    HeroTextProjector,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  onSceneAwake(): void {
    this.cameras.Main.position.z = 20;
    this.instances.HeroTextProjector.group.position.set(0, 0, -8);
  }
}
