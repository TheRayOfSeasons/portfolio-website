import GSAP from 'gsap';
import * as THREE from 'three';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MonoBehaviour, SceneObject } from '../core/components';
import { ShaderUtils } from '../core/utils';

class MeshRenderer extends MonoBehaviour {
  shader?: THREE.WebGLProgramParametersWithUniforms;
  group?: THREE.Group;

  parameters = {
    timeout: 100,
    fadeDuration: 2,
    speed: {
      min: 0.8,
      max: 2.0,
      current: 0.8,
    },
    timeScale: 0.00035,
  };

  start() {
    const { isWebGL2 } = this?.scene?.renderer?.capabilities as THREE.WebGLCapabilities;
    const commonMaterialOptions = {
      color: '#ffffff',
      thickness: 0.001,
      roughness: 0.007,
    };
    // Transmission is not supported in WebGL 1, so we compensate with plain opacity.
    // NOTE: Transmission is responsible for the refraction.
    const materialOptions = isWebGL2
      ? { transmission: 0.9, ...commonMaterialOptions }
      : { transparent: true, opacity: 0.05, ...commonMaterialOptions };
    const material = new THREE.MeshPhysicalMaterial(materialOptions);
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uFrequency = { value: 2.4 };
      shader.uniforms.uAmplitude = { value: 0.5 };
      shader.uniforms.uDensity = { value: this.parameters.speed.min };
      shader.uniforms.uStrength = { value: 1.8 };
      shader.uniforms.uDeepPurple = { value: 1 };
      shader.uniforms.uOpacity = { value: 0.1 };
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uFresnelIntensity = { value: 2 };
      shader.uniforms.uCentralBrightness = { value: 0.075 };
      shader.uniforms.uDepthColor = { value: new THREE.Color('#0458FF') };
      shader.uniforms.uSurfaceColor = { value: new THREE.Color('#F20089') };
      shader.vertexShader = shader.vertexShader.replace('}', `
        float distortion = (pnoise(normal * uDensity + uTime, vec3(10.)) * uStrength);
        vec3 pos = position + (normal * distortion);
        float angle = sin((uv.y * uFrequency) + uTime) * uAmplitude;

        vPositionW = vec3(vec4(position, 1.0) * modelMatrix);
        vNormalW = normalize(vec3(vec4(normal, 0.0) * modelMatrix));
        vUv = uv;
        vDistortion = distortion;
        vElevation = distance(position, pos);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
      }`);
      shader.vertexShader = shader.vertexShader.replace('void main() {', `
        uniform float uFrequency;
        uniform float uAmplitude;
        uniform float uDensity;
        uniform float uStrength;
        uniform float uTime;

        varying float vDistortion;
        varying float vElevation;
        varying vec2 vUv;
        varying vec3 vPositionW;
        varying vec3 vNormalW;

        ${ShaderUtils.pnoise()}

        void main() {
      `);
      shader.fragmentShader = shader.fragmentShader.replace('}', `
        float distort = vDistortion * 3.;

        vec3 brightness = vec3(.1, .1, .9);
        vec3 contrast = vec3(.3, .3, .3);
        vec3 oscilation = vec3(.5, .5, .9);
        vec3 phase = vec3(.9, .1, .8);

        vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);

        float fresnelValue = fresnel();

        vec3 finalColor = mix(uDepthColor, uSurfaceColor, vDistortion);
        float opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
        vec4 compiledColor = vec4(finalColor, opacity);
        compiledColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));

        float multiplier = vElevation * uCentralBrightness;
        gl_FragColor += vec4(compiledColor.r * multiplier, compiledColor.g * multiplier, compiledColor.b * multiplier, 0.0);

        float t = (compiledColor.r + compiledColor.g + compiledColor.b) / 3.0;
        finalColor = mix(uDepthColor, uSurfaceColor, vDistortion);
        finalColor *= fresnelValue;
        opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
        compiledColor = vec4(finalColor, opacity);
        compiledColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));

        gl_FragColor += mix(gl_FragColor, compiledColor, t);
      }`);
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
        uniform float uOpacity;
        uniform float uDeepPurple;
        uniform float uFresnelIntensity;
        uniform float uCentralBrightness;
        uniform sampler2D uEnvMap;
        uniform vec3 uDepthColor;
        uniform vec3 uSurfaceColor;

        varying float vDistortion;
        varying float vElevation;
        varying vec2 vUv;

        varying vec3 vPositionW;
        varying vec3 vNormalW;

        vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
          return a + b * cos(6.28318 * (c * t + d));
        }

        // The fresnel effect here is primarily used to color the outer rims of the bubble.
        float fresnel() {
          vec3 viewDirectionW = normalize(cameraPosition - vPositionW) * 1.0;
          float fresnelTerm = dot(viewDirectionW, vNormalW) * uFresnelIntensity;
          fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
          return fresnelTerm;
        }

        void main() {
      `);
      this.shader = shader;
    };

    this.group = new THREE.Group();

    const loader = new GLTFLoader();

    // The bubble is not really a sphere. It's rather similar to an M&M.
    // Such a custom geometry is needed to reduce the distortion done
    // by the refraction.
    loader.load('/assets/hero/flat-bubble.glb', (object: any) => {
      object.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = material;
          if (this.group) {
            this.group.add(child);
          }
        }
      });
    });

    let timer: NodeJS.Timeout;
    window.addEventListener('mousemove', () => {
      if (timer) {
        clearTimeout(timer);
      }
      GSAP.to(this.parameters.speed, { current: this.parameters.speed.max, duration: 2 });
      timer = setTimeout(() => {
        GSAP.to(this.parameters.speed, { current: this.parameters.speed.min, duration: 2 });
      }, 100);
    });
  }

  update(time: number) {
    if (!this.group?.visible) { return; }
    if (this.shader) {
      this.shader.uniforms.uTime.value = time * this.parameters.timeScale;
      this.shader.uniforms.uDensity.value = this.parameters.speed.current;
    }
  }

  onViewEnter() {
    if (this.group) {
      this.group.visible = true;
    }
  }

  onViewLeave() {
    if (this.group) {
      this.group.visible = false;
    }
  }

  exportAsSceneObject(): any {
    return this.group;
  }
}

export class Bubble extends SceneObject {
  monobehaviours = {
    MeshRenderer,
  };
}
