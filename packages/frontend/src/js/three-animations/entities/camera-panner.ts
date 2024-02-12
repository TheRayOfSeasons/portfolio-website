import * as THREE from 'three';
import { Entity, MonoBehaviour } from '../core/components';

class Component extends MonoBehaviour {
  mousePosition: THREE.Vector2;
  raycaster: THREE.Raycaster;
  raycastPlane: THREE.Plane;
  intersectPoint: THREE.Vector3;
  originalPosition: THREE.Vector3;
  easingPosition: THREE.Object3D;
  parameters = {
    panLimit: 1.0,
    easing: 0.01,
  };

  constructor(args: any) {
    super(args);
    this.mousePosition = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.raycastPlane = new THREE.Plane(new THREE.Vector3(0, 1, 1.5), 0);
    this.intersectPoint = new THREE.Vector3();
    this.originalPosition = new THREE.Vector3();
    this.easingPosition = new THREE.Object3D();
  }

  start(): void {
    window.addEventListener('mousemove', (event) => {
      if (!this.scene.currentCamera) {
        return;
      }
      this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mousePosition, this.scene.currentCamera);
    });
    if (!this.scene.currentCamera) {
      return;
    }
    this.originalPosition = this.scene.currentCamera.position.clone();
  }

  update(): void {
    if (!this.scene.currentCamera) {
      return;
    }
    this.raycaster.ray.intersectPlane(this.raycastPlane, this.intersectPoint);
    const newPosition = new THREE.Vector3(
      THREE.MathUtils.clamp(this.intersectPoint.x, -this.parameters.panLimit, this.parameters.panLimit),
      THREE.MathUtils.clamp(this.intersectPoint.y, -this.parameters.panLimit, this.parameters.panLimit),
      this.intersectPoint.z
    );
    this.easingPosition.position.lerp(newPosition, this.parameters.easing);
    this.scene.currentCamera.position.x = this.easingPosition.position.x;
    this.scene.currentCamera.position.y = this.easingPosition.position.y;
  }
}

export class CameraPanner extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    Component,
  };
}
