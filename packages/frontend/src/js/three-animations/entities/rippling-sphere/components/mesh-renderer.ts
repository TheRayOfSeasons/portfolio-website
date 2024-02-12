import * as THREE from 'three';
import { isMobile } from '../../../../commons/utils';
import { MonoBehaviour } from '../../../core/components';
import { RIPPLE_CONFIG } from '../configs';
import { RippleMaterialRenderer } from './ripple-material-renderer';

export class MeshRenderer extends MonoBehaviour {
  geometry: THREE.SphereGeometry;
  group: THREE.Group;
  worldPosition: THREE.Vector3;

  constructor(args: any) {
    super(args);
    const segments = isMobile() ? 256 : 768;
    this.worldPosition = new THREE.Vector3();
    this.geometry = new THREE.SphereGeometry(
      RIPPLE_CONFIG.radius,
      segments,
      segments,
      0,
      Math.PI, // Half PHI length so there would be no normals behind. In reality, this is just a half sphere.
      0,
      Math.PI
    );
    this.group = new THREE.Group();
  }

  start(): void {
    const { material } = this.getComponent<RippleMaterialRenderer>('RippleMaterialRenderer');
    const mesh = new THREE.Mesh(this.geometry, material);
    this.group.add(mesh);
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.group;
  }
}
