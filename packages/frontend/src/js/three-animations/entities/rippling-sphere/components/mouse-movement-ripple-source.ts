import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { RIPPLE_CONFIG } from '../configs';

export class MouseMovementRippleSource extends MonoBehaviour {
  mousePosition: THREE.Vector2;
  intersectPoint: THREE.Vector3;
  easingPosition: THREE.Object3D;
  raycaster: THREE.Raycaster;
  raycastPlane: THREE.Plane;
  raycastSphere: THREE.Sphere;
  mouseMoveInitiated: boolean;

  constructor(args: any) {
    super(args);
    this.mousePosition = new THREE.Vector2();
    this.intersectPoint = new THREE.Vector3();
    this.easingPosition = new THREE.Object3D();
    this.raycaster = new THREE.Raycaster();
    this.raycastPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -4);
    this.raycastSphere = new THREE.Sphere(new THREE.Vector3(), RIPPLE_CONFIG.radius);
    this.mouseMoveInitiated = false;
  }

  castIntersectPoint(): void {
    const intersectsSphere = this.raycaster.ray.intersectSphere(this.raycastSphere, this.intersectPoint);
    if (!intersectsSphere) {
      this.raycaster.ray.intersectPlane(this.raycastPlane, this.intersectPoint);
    }
  }

  start(): void {
    window.addEventListener('mousemove', event => {
      if (!this.scene.currentCamera) {
        return;
      }
      this.mouseMoveInitiated = true;
      this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mousePosition, this.scene.currentCamera);
    });
    this.castIntersectPoint();
  }

  update(): void {
    this.castIntersectPoint();
    this.easingPosition.position.lerp(this.intersectPoint, RIPPLE_CONFIG.interactionEasing);
  }

  forceInitializeIntersectPoint(): void {
    if(this.mouseMoveInitiated)
      return;
    this.manualCastIntersectPoint();
    this.easingPosition.position.copy(this.intersectPoint);
  }

  manualCastIntersectPoint(): void {
    if (!this.scene.currentCamera) {
      return;
    }
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.scene.currentCamera);
    this.castIntersectPoint();
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.easingPosition;
  }
}
