import * as THREE from 'three';
import { MonoBehaviour, Entity } from "../core/components";

class MeshRenderer extends MonoBehaviour {
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;

  constructor(args: any) {
    super(args);
    const geometry = new THREE.PlaneGeometry(40, 40, 128, 128);
    geometry.rotateX(Math.PI * 0.5);
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  createMaterial(): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0, },
        uTimeScale: { value: 0.001, },
        uColor: { value: new THREE.Color('#FFD700'), },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uTimeScale;

        void main()
        {
          float wave = sin(position.z) * sin(uTime * uTimeScale);
          vec3 pos = vec3(position.x, wave, position.z);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;

        void main()
        {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      wireframe: true,
    });
    return material;
  }

  update(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.mesh;
  }
}

export class Waves extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    MeshRenderer,
  };
}
