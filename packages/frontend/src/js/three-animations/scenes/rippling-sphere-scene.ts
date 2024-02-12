import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { CameraPanner } from '../entities/camera-panner';
import { RipplingSphere } from '../entities/rippling-sphere/rippling-sphere';
import { RipplingSphereLights } from '../entities/rippling-sphere/rippling-sphere-lights';

export class RipplingSphereScene extends InteractiveScene {
  entities = {
    CameraPanner,
    RipplingSphere,
    RipplingSphereLights,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  recalculateCameraDistance(): void {
    if (!this.canvas) {
      return;
    }
    if(this.canvas.clientWidth <= 767) {
      this.cameras.Main.position.z = 24;
    }
    else {
      this.cameras.Main.position.z = 18;
    }
  }

  modifyScene(): void {
    this.renderer?.setClearColor(0xe7e7e7, 1.0);
  }

  onSceneAwake(): void {
    this.recalculateCameraDistance();
  }

  onResize(): void {
    this.recalculateCameraDistance();
  }
}
