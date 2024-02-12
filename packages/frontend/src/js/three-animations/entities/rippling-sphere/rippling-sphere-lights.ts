import * as THREE from 'three';
import { Entity, MonoBehaviour } from '../../core/components';

class Lights extends MonoBehaviour {
  group: THREE.Group;

  constructor(args: any) {
    super(args);
    this.group = new THREE.Group();
  }

  start(): void {
    const hemiLight = new THREE.HemisphereLight('#FFFFFF', '#FFFFFF');
    hemiLight.position.set(0, 200, 0);
    hemiLight.intensity = 0.7;
    this.group.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#EDEDED');
    dirLight.position.set(100, 0, 260);
    dirLight.intensity = 0.7;
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 180;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -120;
    dirLight.shadow.camera.right = 120;
    this.group.add(dirLight);
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.group;
  }
}

export class RipplingSphereLights extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    Lights,
  };
}
