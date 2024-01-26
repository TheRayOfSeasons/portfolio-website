// import { OrbitControls } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MonoBehaviour, SceneObject } from '../core/components';

class Manager extends MonoBehaviour {
  controls?: OrbitControls;

  start() {
    if (!this.scene.currentCamera) {
      return;
    }
    this.controls = new OrbitControls(this.scene.currentCamera, this.scene.canvas);
  }

  update() {
    if (!this.controls) {
      return;
    }
    this.controls.update();
  }
}

export class GlobeOrbit extends SceneObject {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    Manager,
  }
}
