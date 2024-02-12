import { PerspectiveCamera } from 'three';
import { InteractiveScene } from '../core/scene-management';
import { GlobeNavigator } from '../entities/globe/components/globe-navigator';
import { GlobeLights } from '../entities/globe/globe-lights';
import { Globe } from '../entities/globe/globe';

export class GlobeScene extends InteractiveScene {
  entities = {
    Globe,
    GlobeLights,
  };

  cameras = {
    Main: new PerspectiveCamera(75),
  };

  adaptPerspectiveCamera() {
    if (!this.currentCamera) {
      return;
    }
    (this.currentCamera as PerspectiveCamera).near = 1;
    (this.currentCamera as PerspectiveCamera).far = 5000;
    super.adaptPerspectiveCamera();
  }

  onSceneStart() {
    const globeItems = document.querySelectorAll('.globe__item');

    if (globeItems.length === 0) {
      return;
    }

    const globeNavigator: GlobeNavigator = this.instances.Globe.components.GlobeNavigator as GlobeNavigator;

    for (const globeItem of globeItems) {
      globeItem.addEventListener('mouseover', () => {
        const target = globeItem.getAttribute('data-globe-target');
        if (target) {
          globeNavigator.navigate(target);
        }
      });
      globeItem.addEventListener('mouseleave', () => {
        globeNavigator.navigate('default');
      });
    }
  }
}
