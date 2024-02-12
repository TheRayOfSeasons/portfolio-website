import * as THREE from 'three';
import type { Arc } from '../types';
import { geoInterpolate } from 'd3-geo';
import { countries } from '../countries';
import { MonoBehaviour } from '../../../core/components';
import { arcPatternShaper, placeObjectOnPlanet, translateCoordinatesToVector } from '../utils';
import { GLOBE_PARAMETERS } from '../configs';
import { GlobeLayer } from './globe-layer';
import { Precalculator } from './precalculator';

/**
 * Monobehaviour in charge of managing the animated arcs.
 */
export class ArcsLayer extends MonoBehaviour {
  arcs: Arc[] = [];
  arcMaterials: THREE.ShaderMaterial[] = [];
  circleMaterials: THREE.ShaderMaterial[] = [];

  createCircleLanding(
    lat: number,
    lng: number,
    uniforms: {[key: string]: THREE.IUniform<any>}
  ): THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap> {
    const circle = new THREE.CircleGeometry(0.1, 8);
    const circleMaterial = new THREE.ShaderMaterial({
      defines: {
        nonOriginMovementOffsetsLength: uniforms.uNonOriginMovementOffsets.value.length,
      },
      uniforms,
      vertexShader: `
        uniform vec3 uOriginVector;
        uniform vec3 uTargetVector;

        varying float vDistance;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistance = distance(uOriginVector, uTargetVector);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform bool uIsOrigin;
        uniform float uFrequency;
        uniform float uSpeed;
        uniform float uTime;
        uniform float uOffsetTime;
        uniform float uNonOriginMovementOffsets[nonOriginMovementOffsetsLength];
        uniform vec3 uColorMin;
        uniform vec3 uColorMax;

        varying float vDistance;

        ${arcPatternShaper}

        float calculateWave() {
          float shapeValue;
          float offsetTime = uTime + uOffsetTime;
          shapeValue = shape(vDistance, uFrequency, offsetTime, uSpeed);
          if (!uIsOrigin) {
            float offsetTime = uTime + uOffsetTime;
            shapeValue = shape(vDistance, uFrequency, offsetTime, uSpeed);
          }
          else {
            float tValue = 0.0;
            for (int i = 0; i < nonOriginMovementOffsetsLength; i++) {
              float offsetTime = uTime + uNonOriginMovementOffsets[i];
              float t = shape(vDistance, uFrequency, offsetTime, uSpeed);
              tValue = t > tValue ? t : tValue;
            }
            shapeValue = tValue;
          }
          return shapeValue;
        }

        void main() {
          float shapeValue = calculateWave();
          vec3 lightColor = mix(uColorMin, uColorMax, shapeValue);
          vec4 color = mix(vec4(uColorMin, 0.0), vec4(lightColor, 1.0), shapeValue);
          gl_FragColor = color;
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.circleMaterials.push(circleMaterial);
    const circleMesh = new THREE.Mesh(circle, circleMaterial);
    placeObjectOnPlanet(
      circleMesh,
      lat,
      lng,
      GLOBE_PARAMETERS.radius,
    );
    circleMesh.lookAt(new THREE.Vector3(0, 0, 0));
    return circleMesh;
  }

  createArcMaterial(uniforms: {[key: string]: THREE.IUniform<any>}): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform vec3 uOriginVector;
        uniform vec3 uTargetVector;

        varying float vDistanceFromOrigin;
        varying float vDistanceFromTarget;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDistanceFromOrigin = distance(position, uOriginVector);
          vDistanceFromTarget = distance(position, uTargetVector);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uFrequency;
        uniform float uSpeed;
        uniform float uTime;
        uniform float uOffsetTime;
        uniform vec3 uColorMin;
        uniform vec3 uColorMax;

        varying float vDistanceFromOrigin;
        varying float vDistanceFromTarget;

        ${arcPatternShaper}

        void main() {
          float offsetTime = uTime + uOffsetTime;
          float shapeValue = shape(vDistanceFromOrigin, uFrequency, offsetTime, uSpeed);
          vec3 lightColor = mix(uColorMin, uColorMax, shapeValue);
          vec4 color = mix(vec4(0.0, 0.0, 0.0, 0.0), vec4(lightColor, 1.0), shapeValue);
          gl_FragColor = color;
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });
    this.arcMaterials.push(material);
    return material;
  }

  start(): void {
    const { subGroup } = this.getComponent<GlobeLayer>('GlobeLayer');
    const precalculator = this.getComponent<Precalculator>('Precalculator');
    const { origin, originVector, nonOriginMovementOffsets } = precalculator;

    for (const country of countries) {
      const isOrigin = country.id === GLOBE_PARAMETERS.arcs.origin;
      const targetVector = translateCoordinatesToVector(
        country.coordinates.lat,
        country.coordinates.lng,
        GLOBE_PARAMETERS.radius,
      );

      const arcUniforms = {
        uIsOrigin: { value: isOrigin },
        uSpeed: { value: GLOBE_PARAMETERS.arcs.animation.speed },
        uOffsetTime: { value: country.movementOffset },
        uNonOriginMovementOffsets: { value: nonOriginMovementOffsets },
        uTime: { value: 0 },
        uFrequency: { value: GLOBE_PARAMETERS.arcs.animation.frequency },
        uColorMin: { value: new THREE.Color(GLOBE_PARAMETERS.arcTailColor) },
        uColorMax: { value: new THREE.Color(GLOBE_PARAMETERS.arcHeadColor) },
        uOriginVector: { value: originVector },
        uTargetVector: { value: targetVector },
      };
      const circleMesh = this.createCircleLanding(
        country.coordinates.lat,
        country.coordinates.lng,
        arcUniforms,
      );
      subGroup.add(circleMesh);

      // no redundant arc from origin to itself
      if (isOrigin) {
        this.arcs.push({
          arc: null,
          circle: circleMesh,
        });
        continue;
      }

      const d3Interpolate = geoInterpolate(
        [origin.coordinates.lng, origin.coordinates.lat],
        [country.coordinates.lng, country.coordinates.lat],
      );
      const controlVector1 = d3Interpolate(0.25);
      const controlVector2 = d3Interpolate(0.75);

      const arcHeight = originVector.distanceTo(targetVector) * 0.5 + GLOBE_PARAMETERS.radius;
      const adaptedControlVector1 = translateCoordinatesToVector(
        controlVector1[1],
        controlVector1[0],
        arcHeight,
      );
      const adaptedControlVector2 = translateCoordinatesToVector(
        controlVector2[1],
        controlVector2[0],
        arcHeight,
      );
      const curve = new THREE.CubicBezierCurve3(
        originVector,
        adaptedControlVector1,
        adaptedControlVector2,
        targetVector,
      );
      const arcMaterial = this.createArcMaterial(arcUniforms);
      const arcGeometry = new THREE.TubeGeometry(curve, 44, 0.0125, 8);
      const arcMesh = new THREE.Mesh(arcGeometry, arcMaterial);
      subGroup.add(arcMesh);

      this.arcs.push({
        arc: arcMesh,
        circle: circleMesh,
      });
    }
  }

  update(time: number): void {
    for (const { arc, circle } of this.arcs) {
      if (arc) {
        arc.material.uniforms.uTime.value = time;
      }
      if (circle) {
        circle.material.uniforms.uTime.value = time;
      }
    }
  }
}
