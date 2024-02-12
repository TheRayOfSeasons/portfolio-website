import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { GLOBE_PARAMETERS } from '../configs';
import { DotsMaterialRenderer } from './dots-material-renderer';

/**
 * Monobehaviour in charge of rendering the globe's mesh.
 */
export class GlobeLayer extends MonoBehaviour {
  group: THREE.Group;
  subGroup: THREE.Group;

  constructor(args: any) {
    super(args);
    this.group = new THREE.Group();
    this.subGroup = new THREE.Group();
    this.group.add(this.subGroup);
    this.group.rotation.x = Math.PI * GLOBE_PARAMETERS.globeTiltOffset.x;
    this.group.rotation.z = -Math.PI * GLOBE_PARAMETERS.globeTiltOffset.y;
  }

  getDotsGeometry(): THREE.BufferGeometry<THREE.NormalBufferAttributes> {
    const sphereReferenceGeometry = new THREE.SphereGeometry(
      GLOBE_PARAMETERS.radius,
      500,
      500,
    );
    const geometry = new THREE.BufferGeometry();
    const positions = [...sphereReferenceGeometry.attributes.position.array];
    const normals = [...sphereReferenceGeometry.attributes.normal.array];
    const uvs = [...sphereReferenceGeometry.attributes.uv.array];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return geometry;
  }

  generateLand(): void {
    const geometry = this.getDotsGeometry();
    const vertexCount = geometry.attributes.position.array.length;
    const lightFactor = new Float32Array(vertexCount);
    const vertexIDs = new Float32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) {
      lightFactor[i] = Math.random();
      vertexIDs[i] = i % 2 === 0 ? 0 : 1;
    }
    geometry.setAttribute('lightFactor', new THREE.BufferAttribute(lightFactor, 1));
    geometry.setAttribute('vertexID', new THREE.BufferAttribute(vertexIDs, 1));

    const { material } = this.getComponent<DotsMaterialRenderer>('DotsMaterialRenderer');
    const points = new THREE.Points(geometry, material);
    this.subGroup.add(points);
  }

  generateSea(): void {
    const geometry = new THREE.SphereGeometry(GLOBE_PARAMETERS.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: GLOBE_PARAMETERS.seaColor,
      transparent: true,
      opacity: GLOBE_PARAMETERS.seaOpacity,
      emissive: '#020207',
      shininess: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(
      GLOBE_PARAMETERS.waterSphereScale,
      GLOBE_PARAMETERS.waterSphereScale,
      GLOBE_PARAMETERS.waterSphereScale,
    );
    this.subGroup.add(mesh);
  }

  start(): void {
    this.generateLand();
    this.generateSea();
  }

  exportAsEntity(): THREE.Group<THREE.Object3DEventMap> {
    return this.group;
  }
}
