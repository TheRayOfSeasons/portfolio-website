import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { MeshRenderer } from './mesh-renderer';
import { MouseMovementRippleSource } from './mouse-movement-ripple-source';
import { RippleMaterialRenderer } from './ripple-material-renderer';
import { RIPPLE_CONFIG } from '../configs';

/**
 * A timeline for the rippling sphere animation.
 */
export class RippleTimeline extends MonoBehaviour {
  meshRenderer?: MeshRenderer;
  mouseMovementRippleSource?: MouseMovementRippleSource;
  rippleMaterialRenderer?: RippleMaterialRenderer;

  targetLerp: THREE.Vector3;
  moveControlPoint1: boolean;
  controlPoint1Target: THREE.Vector3;
  moveControlPoint2: boolean;
  controlPoint2Target: THREE.Vector3;

  constructor(args: any) {
    super(args);
    this.targetLerp = new THREE.Vector3(-2.18, -0.39, 4.69);

    this.moveControlPoint1 = true;
    this.controlPoint1Target = new THREE.Vector3(-64, 0, 0);

    this.moveControlPoint2 = false;
    this.controlPoint2Target = new THREE.Vector3(-64, 0, 0);
  }

  start() {
    const meshRenderer = this.getComponent<MeshRenderer>('MeshRenderer');
    this.meshRenderer = meshRenderer;
    const mouseMovementRippleSource = this.getComponent<MouseMovementRippleSource>('MouseMovementRippleSource');
    this.mouseMovementRippleSource = mouseMovementRippleSource;
    const rippleMaterialRenderer = this.getComponent<RippleMaterialRenderer>('RippleMaterialRenderer');
    this.rippleMaterialRenderer = rippleMaterialRenderer;
    this.meshRenderer.group.position.x = -2.18;
    this.meshRenderer.group.position.y = -0.39;
    this.meshRenderer.group.position.z = 15.75;
    this.mouseMovementRippleSource.raycastPlane.normal.set(0.2, 0, 1);
    this.mouseMovementRippleSource.raycastPlane.constant = -10;

    setTimeout(() => {
      this.moveControlPoint2 = true;
    }, 500);

    setTimeout(() => {
      rippleMaterialRenderer.material.userData.shader.uniforms.uEnableInteraction.value = true;
    }, 1875);

    setTimeout(() => {
      mouseMovementRippleSource.forceInitializeIntersectPoint();
    }, 1675);
  }

  update(): void {
    if (!this.meshRenderer) {
      return;
    }

    this.meshRenderer.group.position.lerp(this.targetLerp, 0.05);

    if (this.moveControlPoint1) {
      const distance = RIPPLE_CONFIG.controlPoint1.distanceTo(this.controlPoint1Target);
      RIPPLE_CONFIG.controlPoint1.lerp(
        this.controlPoint1Target,
        Math.atan2(0.85, distance)
      );
      if(distance < 0.2) {
        this.moveControlPoint1 = false;
      }
    }

    if (this.moveControlPoint2) {
      const distance = RIPPLE_CONFIG.controlPoint2.distanceTo(this.controlPoint2Target);
      RIPPLE_CONFIG.controlPoint2.lerp(
        this.controlPoint2Target,
        Math.atan2(0.75, distance)
      );

      if(distance < 0.2) {
        this.moveControlPoint2 = false;
      }
    }
  }
}
