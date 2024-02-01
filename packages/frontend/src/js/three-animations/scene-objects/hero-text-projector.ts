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
    this.context?.translate(this.canvas.width / 2, this.canvas.height / 2);
  }

  draw() {
    this.clear();
    if (!this.context) {
      return;
    }
    if (!this.canvas) {
      return;
    }
    (() => {
      this.context.fillStyle = '#ffb800';
      this.context.font = `600 64pt Arial`;
      const text = 'Ray Lawrence Henri Sison';
      const width = this.context.measureText(text).width;
      this.context.fillText(text, -(width / 2), 0, width);
    })();
    (() => {
      this.context.fillStyle = 'white';
      this.context.font = `300 24pt Arial`;
      const text = 'SOFTWARE ENGINEER';
      const width = this.context.measureText(text).width;
      this.context.fillText(text, -(width / 2), 64, width);
    })();
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
        uniform sampler2D uTexture;
        uniform vec2 uResolution;

        varying vec2 vUv;

        void main()
        {
          vec2 uv = gl_FragCoord.xy / uResolution;
          vec4 color = texture2D(uTexture, uv);
          if (length(color.rgb) <= 0.0) discard;
          gl_FragColor = color;
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

  update() {
    if (this.textureIsActive) {
      if (this.texture?.needsUpdate) {
        this.texture.needsUpdate = true;
      }
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
