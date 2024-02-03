import * as THREE from 'three';
import { MonoBehaviour, SceneObject } from '../core/components';

class CanvasBehaviour extends MonoBehaviour {
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D | null;

  updateCanvasSize() {
    if (!this.canvas) {
      return;
    }
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }
}

class TextureRenderer extends CanvasBehaviour {
  elementId = 'hero-text';
  redraw = true;
  fontSizes = {
    xl: {
      name: '64pt',
      title: '32pt',
    },
    md: {
      name: '48pt',
      title: '24pt',
    },
    sm: {
      name: '32pt',
      title: '16pt',
    },
  }

  awake() {
    this.canvas = document.getElementById(this.elementId) as HTMLCanvasElement;
    this.updateCanvasSize();
    this.context = this.canvas.getContext('2d');
    this.adaptCoordinates();
  }

  start() {
    if (!this.context) {
      return;
    }
    this.context.beginPath();
    this.draw();
  }

  clear() {
    if (!this.canvas) {
      return;
    }
    if (!this.context) {
      return;
    }
    this.context.clearRect(
      0,
      -this.canvas.height * 2,
      this.canvas.width,
      this.canvas.height * 4,
    );
  }

  adaptCoordinates() {
    if (!this.canvas) {
      return;
    }
    this.context?.translate(this.canvas.width / 2, this.canvas.height - (this.canvas.height / 8));
  }

  getFontSize() {
    const width = window.innerWidth;
    if (width >= 1024) {
      return this.fontSizes.xl;
    }
    if (width >= 768) {
      return this.fontSizes.md;
    }
    return this.fontSizes.sm;
  }

  draw() {
    this.clear();
    if (!this.context) {
      return;
    }
    if (!this.canvas) {
      return;
    }
    const { name, title } = this.getFontSize();
    (() => {
      this.context.fillStyle = '#ffb800';
      this.context.font = `600 ${name} Julius Sans One`;
      const text = 'Ray Sison';
      const width = this.context.measureText(text).width;
      this.context.fillText(text, -(width / 2), 0, width);
    })();
    (() => {
      this.context.fillStyle = 'white';
      this.context.font = `300 ${title} Archivo Narrow`;
      const text = 'SOFTWARE ENGINEER';
      const width = this.context.measureText(text).width;
      this.context.fillText(text, -(width / 2), 64, width);
    })();
  }

  update() {
    this.draw();
  }
  resize() {
    this.updateCanvasSize();
    this.adaptCoordinates();
    this.draw();
  }
}

class MeshRenderer extends MonoBehaviour {
  texture?: THREE.CanvasTexture;
  mesh?: THREE.Mesh;
  source?: HTMLCanvasElement;
  material?: THREE.ShaderMaterial;
  textureIsActive = false;

  createMaterial() {
    if (!this.source) {
      throw new Error('Source is undefined');
    }
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uDetail: { value: 1, },
        uFlare: { value: 1, },
        uTime: { value: 0, },
        uTimeScale: { value: 0.005 },
        uStarMinSize: { value: 0.1, },
        uStarMaxSize: { value: 0.5, },
        uRayMinSize: { value: 500, },
        uRayMaxSize: { value: 550, },
        uZoom: { value: 40, },
        uColorA: { value: new THREE.Color('#0acdef') },
        uTexture: { value: this.texture },
        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            this.source?.parentElement?.clientHeight,
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
        #define PI 3.1415

        uniform float uDetail;
        uniform float uFlare;
        uniform float uStarMinSize;
        uniform float uStarMaxSize;
        uniform float uRayMinSize;
        uniform float uRayMaxSize;
        uniform float uTime;
        uniform float uTimeScale;
        uniform float uZoom;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec3 uColorA;

        varying vec2 vUv;

        mat2 rotate(float angle)
        {
          float s = sin(angle);
          float c = cos(angle);
          return mat2(c, -s, s, c);
        }

        float hash21(vec2 p)
        {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        vec4 star(vec2 uv, float flare, float noise)
        {
          vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
          float scaledTime = uTime * uTimeScale * noise;

          // circle
          float diameter = length(uv);
          float size = mix(uStarMinSize, uStarMaxSize, sin(scaledTime) + 1.0);
          float circle = size / diameter;
          color += circle;

          // rays
          float twinklingRate = sin(uTime * 0.00015) + 1.0;
          float raySize = mix(uRayMinSize, uRayMaxSize, twinklingRate);

          // ray 1
          float rays = max(0.0, 1.0 - abs(uv.x * uv.y * raySize));
          color += rays * flare;

          // ray 2
          vec2 rotatedUv = uv * rotate(PI / 4.0);
          rays = max(0.0, 1.0 - abs(rotatedUv.x * rotatedUv.y * raySize));
          color += rays * flare;

          color *= smoothstep(1.0, 0.2, diameter);
          return color;
        }

        vec4 pattern()
        {
          vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.yy) / uResolution.yy;
          uv *= uZoom;
          vec2 grid = fract(uv) - 0.5;
          vec2 id = floor(uv);

          vec4 color = vec4(0.0);
          float gridDetail = uDetail * 9.0;
          // add contribution of colors from neigboring grids
          for (float y = -uDetail; y <= uDetail; y++)
          {
            for (float x = -uDetail; x <= uDetail; x++)
            {
              vec2 offset = vec2(x, y);
              float noise = hash21(id + offset); // random between 0 and 1
              vec2 starPosition = vec2(noise, fract(noise * 34.0)) - 0.5;
              vec4 star = star(grid - offset - starPosition, uFlare, fract(noise * 175.29)) / gridDetail;
              float size = fract(noise * 345.32);
              color += star * size;
            }
          }

          vec4 transparency = vec4(0.0);
          vec2 gradientUv = gl_FragCoord.xy / uResolution;
          return mix(transparency, color, gradientUv.y - 0.05);
        }

        void main()
        {
          vec2 uv = gl_FragCoord.xy / uResolution;
          vec4 color = texture2D(uTexture, uv);

          gl_FragColor = length(color.rgb) <= 0.0 ? pattern() : color;
        }
      `,
      blending: THREE.AdditiveBlending,
    });
    return material;
  }

  start() {
    this.source = this.getComponent<TextureRenderer>('TextureRenderer').canvas;
    if (!this.source) {
      return;
    }
    this.texture = new THREE.CanvasTexture(this.source);
    const geometry = new THREE.PlaneGeometry(
      1000,
      1000,
    );
    this.material = this.createMaterial();
    if (this.source?.style) {
      this.source.style.opacity = '0';
    }
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  update(time: number) {
    if (this.textureIsActive) {
      if (this.texture?.needsUpdate) {
        this.texture.needsUpdate = true;
      }
    }
    if (this.material?.uniforms) {
      this.material.uniforms.uTime.value = time;
    }
  }

  resize() {
    this.textureIsActive = false;
    this.texture?.dispose();
    this.material?.dispose();

    if (!this.source) {
      return;
    }
    if (!this.mesh) {
      return;
    }
    const texture = new THREE.CanvasTexture(this.source);
    this.texture = texture;
    const material = this.createMaterial();
    this.mesh.material = material;
    this.mesh.material.needsUpdate = true;

    this.textureIsActive = true;
  }

  exportAsSceneObject(): any {
    return this.mesh;
  }
}

export class HeroTextProjector extends SceneObject {
  monobehaviours = {
    MeshRenderer,
    TextureRenderer,
  };
}
