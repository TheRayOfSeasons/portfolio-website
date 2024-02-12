import * as THREE from 'three';
import { MonoBehaviour, Entity } from '../../core/components';

class Lights extends MonoBehaviour {
  group: THREE.Group;
  parameters = {
    color: '#78c9f4',
    intensity: 1,
  };

  constructor(args: any) {
    super(args);
    this.group = new THREE.Group();
  }

  start(): void {
    const light1 = new THREE.SpotLight(this.parameters.color);
    light1.position.set(10, 3, 14);
    light1.angle = 1;
    light1.target.position.set(0, 0, 0);
    this.group.add(light1);

    const light2 = new THREE.PointLight(this.parameters.color, this.parameters.intensity);
    light2.position.set(9, 3, 2);
    this.group.add(light2);
  }

  update(): void {
    if (!this.scene.currentCamera) {
      return;
    }
    this.group.lookAt(this.scene.currentCamera.position);
  }

  exportAsEntity(): THREE.Group<THREE.Object3DEventMap> {
    return this.group;
  }
}

export class GlobeLights extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    Lights,
  };
}
