import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { GLOBE_PARAMETERS } from '../configs';
import { arcPatternShaper } from '../utils';
import { Precalculator } from './precalculator';

/**
 * Monobehaviour for initializing the material for the globe's dots.
 */
export class DotsMaterialRenderer extends MonoBehaviour {
  material?: THREE.ShaderMaterial;

  awake(): void {
    const textureLoader = new THREE.TextureLoader(this.scene.loadingManager);
    const alphaTexture = textureLoader.load(GLOBE_PARAMETERS.alphaTexture);
    const colorTexture = textureLoader.load(GLOBE_PARAMETERS.colorTexture);
    const dotTexture = textureLoader.load(GLOBE_PARAMETERS.dotTexture);

    /**
     * @type {Precalculator}
     */
    const precalculator = this.getComponent<Precalculator>('Precalculator');
    const { countryTargetPositions, originVector, movementOffsets } = precalculator;

    this.material = new THREE.ShaderMaterial({
      vertexColors: true,
      defines: {
        countryTargetPositionsLength: countryTargetPositions.length,
      },
      uniforms: {
        uAlphaMap: {
          value: alphaTexture,
        },
        uColorMap: {
          value: colorTexture,
        },
        uArcSpeed: {
          value: GLOBE_PARAMETERS.arcs.animation.speed,
        },
        uArcFrequency: {
          value: GLOBE_PARAMETERS.arcs.animation.frequency,
        },
        uOriginVector: {
          value: originVector,
        },
        uCountryTargetPositions: {
          value: countryTargetPositions,
        },
        uCountryMovementOffsets: {
          value: movementOffsets,
        },
        uTime: {
          value: 0.0,
        },
        uMinColor: {
          value: new THREE.Color(GLOBE_PARAMETERS.twinkleColor1),
        },
        uMaxColor: {
          value: new THREE.Color(GLOBE_PARAMETERS.twinkleColor2),
        },
        uCountryColor: {
          value: new THREE.Color(GLOBE_PARAMETERS.countryColor),
        },
        uCountryMinColor: {
          value: new THREE.Color(GLOBE_PARAMETERS.minCountryColor),
        },
        uLightColor: {
          value: new THREE.Color(GLOBE_PARAMETERS.arcImpactColor),
        },
        shift: {
          value: 0,
        },
        uShape: {
          value: dotTexture,
        },
        uSize: {
          value: 0.1,
        },
        uContinentBrightness: {
          value: 4.0,
        },
        uScale: {
          value: (this.scene?.canvas?.height || 0) / 4,
        },
      },
      vertexShader: `
        attribute float lightFactor;
        attribute float vertexID;

        uniform float uScale;
        uniform float uSize;
        uniform float uCountryMovementOffsets[countryTargetPositionsLength];
        uniform vec3 uOriginVector;
        uniform vec3 uCountryTargetPositions[countryTargetPositionsLength];

        varying vec2 vUv;
        varying vec3 vColor;
        varying vec3 vTarget;
        varying vec4 vModelPosition;
        varying float vDistanceFromImpact;
        varying float vDistanceFromOrigin;
        varying float vVertexID;
        varying float vLightFactor;
        varying float vOffsetTime;

        void main() {

          vUv = uv;
          vColor = color;
          vModelPosition = modelMatrix * vec4(position, 1.0);
          vVertexID = float(vertexID);
          vLightFactor = lightFactor;

          // get nearest country with a client
          vec3 target;
          float previousDistance = 100.0; // NOTE: This is arbitrary.
          float offsetTime;
          for (int i = 0; i < countryTargetPositionsLength; i++) {
            vec3 countryPosition = uCountryTargetPositions[i];
            float distance = distance(position, countryPosition);
            if (distance < previousDistance) {
              previousDistance = distance;
              target = countryPosition;
              offsetTime = uCountryMovementOffsets[i];
            }
          }
          vTarget = target;
          vDistanceFromImpact = previousDistance;
          vDistanceFromOrigin = distance(uOriginVector, target);
          vOffsetTime = offsetTime;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (uScale / length(mvPosition.xyz)) * (0.3 + sin(uv.y * 3.1415926) * 0.6);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uAlphaMap;
        uniform sampler2D uColorMap;
        uniform float shift;
        uniform float uTime;
        uniform float uContinentBrightness;
        uniform float uArcFrequency;
        uniform float uArcSpeed;
        uniform sampler2D uShape;
        uniform vec3 uMinColor;
        uniform vec3 uMaxColor;
        uniform vec3 uCountryColor;
        uniform vec3 uCountryMinColor;
        uniform vec3 uLightColor;

        varying vec2 vUv;
        varying vec3 vColor;
        varying vec3 vTarget;
        varying vec4 vModelPosition;
        varying float vDistanceFromImpact;
        varying float vDistanceFromOrigin;
        varying float vVertexID;
        varying float vLightFactor;
        varying float vOffsetTime;

        ${arcPatternShaper}

        float getImpactValue() {
          float offsetTime = uTime + vOffsetTime;
          return shape(vDistanceFromOrigin, uArcFrequency, offsetTime, uArcSpeed);
        }

        float getImpactDistanceTValue() {
          float inverse = 1.0 / vDistanceFromImpact;
          return clamp(inverse, 0.0, 1.0);
        }

        void main() {
          vec2 uv = vUv;
          uv.x += shift;
          vec4 v = texture2D(uAlphaMap, uv);
          vec4 c = texture2D(uColorMap, uv);

          // carve out continents based on alpha map
          if (length(v.rgb) > 1.0) discard;

          // this is responsible for the uneven pattern
          if (vVertexID == 0.0) discard;

          float mixStrength = clamp(abs(1.15 * sin(uTime * vLightFactor)), 0.1, 0.9);

          vec3 highlightColor;
          if (length(c.rgb) > 1.0)
          {
            highlightColor = uCountryColor;
          }
          else
          {
            highlightColor = mix(uMinColor, uMaxColor, mixStrength);
          }
          gl_FragColor = vec4(highlightColor, 1.0);
          vec4 shapeData = texture2D(uShape, gl_PointCoord);
          if (shapeData.a < 0.0625) discard;
          gl_FragColor = gl_FragColor * uContinentBrightness * shapeData.a;

          float impactValue = getImpactValue();
          vec4 impactColor = mix(gl_FragColor, vec4(uLightColor, 1.0), impactValue);
          vec4 impactInfluenceColor = mix(gl_FragColor, impactColor, getImpactDistanceTValue());
          gl_FragColor = impactInfluenceColor;
        }
      `,
      transparent: false,
      alphaTest: 1,
    });
  }

  update(time: number): void {
    if (!this.material) {
      return;
    }
    this.material.uniforms.uTime.value = time;
  }

  resize(): void {
    if (!this.material) {
      return;
    }
    this.material.uniforms.uScale.value = (this.scene?.canvas?.height || 0) / 4;
  }
}
