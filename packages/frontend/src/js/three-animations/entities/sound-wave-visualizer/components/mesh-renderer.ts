import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { frequencySubject, invertWaves } from '../store/subjects';

export class MeshRenderer extends MonoBehaviour {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  speed = 0.5;

  constructor(args: any) {
    super(args);
    const geometry = this.createGeometry();
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  createGeometry() {
    const geometry = new THREE.PlaneGeometry(5, 5, 128, 128);
    geometry.rotateX(Math.PI * 0.5);
    return geometry;
  }

  createMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uFrequency: { value: [] },
        uMaxElevation: { value: 1 },
        uColorA: { value: new THREE.Color('#1AF5F5') },
        uColorB: { value: new THREE.Color('#7F2A91') },
        uInverted: { value: false, }
      },
      vertexShader: `
        uniform float[256] uFrequency;
        uniform float uMaxElevation;

        varying float vElevation;

        void main() {
          vec4 currentPosition = vec4(position, 1.0);
          float dist = abs(distance(vec2(0.5, 0.5), uv));
          float normalizedDistance = dist / 0.5;
          int index = int(64.0 * normalizedDistance);
          float frequency = uFrequency[index];
          float t = frequency / 255.0;
          float elevation = smoothstep(0.0, uMaxElevation, t);
          currentPosition.y += elevation;

          gl_Position = projectionMatrix * viewMatrix * modelMatrix * currentPosition;

          vElevation = elevation;
        }
      `,
      fragmentShader: `
        uniform bool uInverted;
        uniform vec3 uColorA;
        uniform vec3 uColorB;

        varying float vElevation;

        void main() {
          vec3 c1 = uInverted ? uColorA : uColorB;
          vec3 c2 = uInverted ? uColorB : uColorA;
          vec3 color = mix(c1, c2, vElevation);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
    return material;
  }

  start() {
    frequencySubject.subscribe({
      next: ({ frequency }) => {
        this.material.uniforms.uFrequency.value = frequency;
        this.material.needsUpdate = true;
      },
    });
    invertWaves.subscribe({
      next: (invert) => {
        this.material.uniforms.uInverted.value = invert;
        this.material.needsUpdate = true;
      },
    });
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.mesh;
  }
}