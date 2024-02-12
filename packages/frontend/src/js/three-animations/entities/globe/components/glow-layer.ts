import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { GLOBE_PARAMETERS } from '../configs';

export class GlowLayer extends MonoBehaviour {
  group: THREE.Group;

  constructor(args: any) {
    super(args);
    this.group = new THREE.Group();
  }

  start(): void {
    const textureLoader = new THREE.TextureLoader(this.scene.loadingManager);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: textureLoader.load(GLOBE_PARAMETERS.glow.texture),
      color: GLOBE_PARAMETERS.ambientGlowColor,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(
      GLOBE_PARAMETERS.glow.scale,
      GLOBE_PARAMETERS.glow.scale,
      1.0,
    );
    this.group.add(sprite);
    sprite.position.set(
      GLOBE_PARAMETERS.glow.position.x,
      GLOBE_PARAMETERS.glow.position.y,
      GLOBE_PARAMETERS.glow.position.z,
    );
  }

  update(): void {
    if (!this.scene.currentCamera) {
      return;
    }
    this.group.lookAt(this.scene.currentCamera.position);
  }

  exportAsEntity(): THREE.Group<THREE.Object3DEventMap> {
    return this.group;
  }
}
