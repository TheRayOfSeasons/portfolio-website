import GSAP, { Sine } from 'gsap';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MonoBehaviour } from '../../../core/components';
import { GLOBE_PARAMETERS } from '../configs';
import { countries } from '../countries';
import { translateCoordinatesToVector } from '../utils';
import { Precalculator } from './precalculator';

export class GlobeNavigator extends MonoBehaviour {
  navMap: Record<string, THREE.Spherical> = {};
  tween: gsap.core.Tween | null = null;
  duration = 2;
  center = new THREE.Vector3(0, 0, 0);
  currentTarget = 'default';
  autoRotate = true;
  spherical = new THREE.Spherical();
  phiOffset = 0.1;
  overlay: HTMLElement;
  controls?: OrbitControls;

  constructor(args: any) {
    super(args);
    const overlay = document.getElementById('globe-overlay');
    if (overlay) {
      this.overlay = overlay;
    } else {
      throw new Error('Failed to initialize GlobeNavigator: Element with ID "globe-overlay" not found.');
    }
  }

  get isDefault(): boolean {
    return this.currentTarget === 'default';
  }

  setupCameraPosition(): void {
    if (!this.scene.currentCamera) {
      throw new Error('Failed to initialize GlobeNavigator: Scene doesn\'t have a "currentCamera".')
    }
    const precalculator = this.getComponent<Precalculator>('Precalculator');
    const { origin } = precalculator;
    const position = translateCoordinatesToVector(
      origin.coordinates.lat,
      origin.coordinates.lng,
      GLOBE_PARAMETERS.cameraDistance,
    );
    this.spherical.setFromVector3(position);
    this.spherical.phi += Math.PI * this.phiOffset;
    this.scene.currentCamera.position.setFromSpherical(this.spherical);
  }

  setupControls() {
    this.controls = new OrbitControls(this.scene.currentCamera, this.overlay);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = GLOBE_PARAMETERS.rotationSpeed;
  }

  setupNavMap(): void {
    for (const country of countries) {
      const vector = translateCoordinatesToVector(
        country.coordinates.lat,
        country.coordinates.lng,
        GLOBE_PARAMETERS.cameraDistance,
      );
      const spherical = new THREE.Spherical().setFromVector3(vector);
      spherical.phi += Math.PI * this.phiOffset;
      this.navMap[country.id] = spherical;
    }
    this.navMap.default = this.spherical.clone();
  }

  awake(): void {
    this.setupCameraPosition();
    this.setupControls();
    this.setupNavMap();
  }

  clean(): void {
    if (this.tween) {
      this.tween.kill();
    }
  }

  /**
   * Navigates the orbiting camera to look at a specific coordinate from a countryId.
   */
  navigate(countryId: string) {
    this.clean();
    const target = this.navMap[countryId];
    this.currentTarget = countryId;
    if (this.isDefault) {
      this.controls.autoRotate = true;
    } else {
      if (!this.scene.currentCamera) {
        throw new Error('Failed to navigate GlobeNavigator: Scene doesn\'t have a "currentCamera".')
      }
      this.spherical.setFromVector3(this.scene.currentCamera.position);
      this.controls.autoRotate = false;
      this.tween = GSAP.to(this.spherical, {
        radius: target.radius,
        phi: target.phi,
        theta: target.theta,
        duration: this.duration,
        ease: Sine.easeInOut,
      });
    }
  }

  update(): void {
    if (!this.controls.autoRotate) {
      if (!this.scene.currentCamera) {
        return;
      }
      this.scene.currentCamera.position.setFromSpherical(this.spherical);
    }
    this.controls.update();
  }
}
