import * as THREE from 'three';
import { MonoBehaviour, Entity } from '../core/components';

class MeshRenderer extends MonoBehaviour {
  mesh?: THREE.Mesh;

  start() {
    const geometry = new THREE.PlaneGeometry(10, 10);
    const { material } = this.getComponent<TextureRenderer>('TextureRenderer');
    this.mesh = new THREE.Mesh(geometry, material);
  }

  exportAsEntity(): THREE.Object3D<THREE.Object3DEventMap> {
    if (!this.mesh) {
      throw new Error('Failed to initialize Mesh of CyberpunkDrip');
    }
    return this.mesh;
  }
}

class TextureRenderer extends MonoBehaviour {
  material: THREE.ShaderMaterial;

  constructor(args: any) {
    super(args);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uDetail: { value: 2, },
        uTime: { value: 0, },
        uZoom: { value: 10, },
        uHighColor: { value: new THREE.Color('#02D7F2'), },
        uLowColor: { value: new THREE.Color('#007AFF'), },
        uBackgroundLowColor: { value: new THREE.Color('#000000'), },
        uBackgroundHighColor: { value: new THREE.Color('#001F3F'), },
        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight,
          ),
        },
      },
      vertexShader: `
        varying vec2 vUv;

        void main()
        {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uDetail;
        uniform float uTime;
        uniform float uZoom;
        uniform vec2 uResolution;
        uniform vec3 uBackgroundLowColor;
        uniform vec3 uBackgroundHighColor;
        uniform vec3 uHighColor;
        uniform vec3 uLowColor;

        varying vec2 vUv;

        float noise(vec2 p)
        {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        vec4 createDrip(vec2 uv)
        {
          float drip = max(0.0, 1.0 - abs(uv.x * 500.0));
          vec4 transparency = vec4(0.0);
          vec4 color = mix(vec4(uHighColor, 1.0), vec4(uLowColor, 0.5), uv.y);
          color = mix(transparency, color, drip);
          return color;
        }

        vec4 background(vec2 uv)
        {
          vec4 color = mix(vec4(uBackgroundHighColor, 1.0), vec4(uBackgroundLowColor, 1.0), 1.0 - fract(uv.y + 0.5));
          return color;
        }

        float fade(vec2 uv)
        {
          return 1.0 - uv.y;
        }

        void main()
        {
          vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.yy) / uResolution.yy;
          vec2 originalUv = uv;
          uv *= uZoom;
          uv.y += uTime;
          vec2 id = floor(uv);
          vec2 gridUv = fract(uv) - 0.5;
          vec4 color = vec4(0.0);
          float gridDetail = uDetail * 9.0;
          for (float y = -uDetail; y <= uDetail; y++)
          {
            for (float x = -uDetail; x <= uDetail; x++)
            {
              vec2 offset = vec2(x, y);
              float n = noise(id + offset);
              vec2 position = vec2(n, fract(n * 0.34)) - 0.5;
              vec4 drip = createDrip(gridUv - offset - position);
              color += drip;
            }
          }

          color += background(originalUv);
          float alpha = fade(vUv);
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `,
    });
  }

  resize(): void {
    this.material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    );
    this.material.needsUpdate = true;
  }

  update(time: number): void {
    this.material.uniforms.uTime.value = time * 0.001;
  }
}

export class CyberpunkDrip extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    MeshRenderer,
    TextureRenderer,
  };
}
