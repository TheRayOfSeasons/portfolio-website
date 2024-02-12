import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { RIPPLE_CONFIG } from '../configs';
import { fractals } from '../utils';
import { MouseMovementRippleSource } from './mouse-movement-ripple-source';

export class RippleMaterialRenderer extends MonoBehaviour {
  material: THREE.MeshStandardMaterial;
  mouseMovementRippleSource?: MouseMovementRippleSource;

  constructor(args: any) {
    super(args);
    this.material = new THREE.MeshStandardMaterial({ color: '#A9A9A9' });
  }

  awake(): void {
    const { isWebGL2 } = this?.scene?.renderer?.capabilities as THREE.WebGLCapabilities;
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uEnableInteraction = { value: RIPPLE_CONFIG.initiallyEnableInteraction };
      shader.uniforms.uInteractionRadius = { value: 6.0 };
      shader.uniforms.uMaxElevation = { value: 0.65 };
      shader.uniforms.uMidRadius = { value: RIPPLE_CONFIG.radius };
      shader.uniforms.uSmoothing = { value: 0.66 };
      shader.uniforms.uSpeed = { value: 0.05 };
      shader.uniforms.uTime = { value: 0.0 };
      shader.uniforms.uUvZoom = { value: 8.7 };
      shader.uniforms.uIntersectPoint = { value: new THREE.Vector3() };
      shader.uniforms.uWaveControlVectorA = { value: new THREE.Vector3() };
      shader.uniforms.uWaveControlVectorB = { value: new THREE.Vector3() };
      shader.uniforms.uSurfaceColor = { value: new THREE.Color('#c1c1c1') };
      shader.uniforms.uDepthColor = { value: new THREE.Color('#b2b2b2') };
      shader.vertexShader = `
        const float RADIANS_TO_DEGREES = 57.29577951308232;
        const float PI = 3.141592653589793;

        uniform bool uEnableInteraction;
        uniform float uInteractionRadius;
        uniform float uMaxElevation;
        uniform float uMidRadius;
        uniform float uSmoothing;
        uniform float uSpeed;
        uniform float uTime;
        uniform float uUvZoom;
        uniform vec3 uIntersectPoint;
        uniform vec3 uWaveControlVectorA;
        uniform vec3 uWaveControlVectorB;

        varying float vPattern;

        struct Spherical
        {
          float radius;
          float phi;
          float theta;
        };

        Spherical cartesianToSpherical(vec3 cartesianCoords)
        {
          float x = cartesianCoords.x;
          float y = cartesianCoords.y;
          float z = cartesianCoords.z;
          float radius = sqrt(x * x + y * y + z * z);
          float phi = atan(sqrt(x * x + y * y), z);
          float theta = atan(y, x);
          return Spherical(radius, phi, theta);
        }

        vec3 sphericalToCartesian(Spherical spherical)
        {
          float radius = spherical.radius;
          float phi = spherical.phi;
          float theta = spherical.theta;
          float x = radius * sin(phi) * cos(theta);
          float y = radius * sin(phi) * sin(theta);
          float z = radius * cos(phi);
          return vec3(x, y, z);
        }

        bool isInBetween(float value, float min, float max)
        {
          return value >= min && value <= max;
        }

        bool isPassedByFromRightToLeft(float value, float min, float max)
        {
          return value >= min && value >= max;
        }

        ${fractals(isWebGL2 ? 2 : 1)}

        float noise(vec2 uv)
        {
          return fractal_noise(vec3(uv, uTime * uSpeed), ripple);
        }

        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * balance - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        float getFractalPattern(vec2 uv)
        {
          vec3 pattern = hsv2rgb(vec3(noise(uv)*10., 1., 1.));
          float steppedPattern = sin(pattern.x) + sin(pattern.y) + cos(pattern.z);
          steppedPattern = smoothstep(0.0, 3.2, steppedPattern);
          return steppedPattern;
        }

        ${shader.vertexShader.replace('}', `
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);

          float pattern = getFractalPattern(uv * uUvZoom) * uMaxElevation;

          ${RIPPLE_CONFIG.allowControlPoints ?
            `
              bool inBetween = isInBetween(modelPosition.x, uWaveControlVectorA.x, uWaveControlVectorB.x);
              if(inBetween)
              {
                float normalizedPattern = pattern / uMaxElevation;
                vPattern = normalizedPattern;
              }
              else
              {
                float factor = 0.0;
                if(modelPosition.x <= uWaveControlVectorA.x && modelPosition.x <= uWaveControlVectorB.x)
                {
                  float distanceA = abs(uWaveControlVectorA.x - modelPosition.x);
                  float span = abs(uWaveControlVectorA.x - -uMidRadius);
                  factor = distanceA / span;
                }
                else if(modelPosition.x >= uWaveControlVectorB.x && modelPosition.x >= uWaveControlVectorA.x)
                {
                  float distanceB = abs(uWaveControlVectorB.x - modelPosition.x);
                  float span = abs(uWaveControlVectorB.x - uMidRadius);
                  factor = distanceB / span;
                }

                factor = smoothstep(0.0, uSmoothing, factor);

                // if near mouse intersect point
                bool isPassed = isPassedByFromRightToLeft(modelPosition.x, uWaveControlVectorA.x, uWaveControlVectorB.x);
                if(uEnableInteraction && isPassed)
                {
                  float chordLength = abs(distance(modelPosition.xyz, uIntersectPoint));
                  float interactiveElevation = 1.0 - (chordLength / uInteractionRadius);
                  interactiveElevation = smoothstep(uSmoothing, 0.0, interactiveElevation);

                  factor = factor > interactiveElevation ? interactiveElevation : factor;
                }

                pattern = pattern - (pattern * factor);
                float normalizedPattern = pattern / uMaxElevation;
                vPattern = normalizedPattern;
              }
            `
            :
            `
              float normalizedPattern = pattern / uMaxElevation;
              vPattern = normalizedPattern;
            `
          }

          Spherical spherical = cartesianToSpherical(modelPosition.xyz);
          spherical.radius += pattern;
          vec3 updatedPosition = sphericalToCartesian(spherical);

          modelPosition.x = updatedPosition.x;
          modelPosition.y = updatedPosition.y;
          modelPosition.z = updatedPosition.z;

          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;
        }`)}
      `;
      shader.fragmentShader = `
        uniform vec3 uSurfaceColor;
        uniform vec3 uDepthColor;

        varying float vPattern;

        ${shader.fragmentShader.replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `
            vec3 color = mix(uDepthColor, uSurfaceColor, vPattern);
            vec4 diffuseColor = vec4(color, opacity);
          `
        )}
      `;
      this.material.userData.shader = shader;
    }
  }

  start() {
    this.mouseMovementRippleSource = this.getComponent<MouseMovementRippleSource>('MouseMovementRippleSource');
  }

  update(time: number): void {
    if (!this.material.userData.shader) {
      return;
    }
    this.material.userData.shader.uniforms.uTime.value = time;
    this.material.userData.shader.uniforms.uWaveControlVectorA.value = RIPPLE_CONFIG.controlPoint1;
    this.material.userData.shader.uniforms.uWaveControlVectorB.value = RIPPLE_CONFIG.controlPoint2;
    if (!this.mouseMovementRippleSource) {
      return;
    }
    const { easingPosition } = this.mouseMovementRippleSource;
    this.material.userData.shader.uniforms.uIntersectPoint.value = easingPosition.position;
  }
}
