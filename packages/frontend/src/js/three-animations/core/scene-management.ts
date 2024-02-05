/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import {
  Camera, LoadingManager, PerspectiveCamera, Scene, WebGLRenderer,
} from 'three';
import { IInteractiveScene, IEntity } from './types';
import { Entity } from './components';

/** A class that sets up a scene. */
export class InteractiveScene implements IInteractiveScene {
  canvas?: HTMLCanvasElement;
  renderer?: WebGLRenderer;
  scene?: Scene;
  currentCamera?: Camera;
  loadingManager: LoadingManager;

  entities: {[key: string]: typeof Entity} = {};

  /**
   * Used for referencing Entity instances from outside.
   */
  instances: {[key: string]: IEntity} = {};

  /**
   * Used for iterating lifecycle based events for performance.
   */
  arrayedInstances: IEntity[] = [];

  cameras: {[key: string]: Camera} = {};

  /**
   * The name of the first camera.
   */
  defaultCamera = 'Main';

  constructor(canvas: HTMLCanvasElement, renderer: WebGLRenderer, loadingManager: LoadingManager) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.scene = new Scene();
    this.loadingManager = loadingManager;
    this.modifyScene(this.scene);
  }

  /**
   * A virtual method for further modifying the scene after the constructor runs.
   */
  modifyScene(scene: Scene) {}

  /**
   * Runs after all Entities awake.
   * Can be utilized for setting up postprocessing.
   */
  onSceneAwake() {}

  /**
   * Runs after all Entities start.
   */
  onSceneStart() {}

  /**
   * Runs before the frame renders all Entities.
   */
  onBeforeFrameRender() {}

  /**
   * Runs after the frame renders all Entities.
   */
  onAfterRender() {}

  /**
   * A virtual method for adding custom render cycles.
   * Can be utilized for rendering through EffectComposers.
   * NOTE: To use EffectComposers, useDefaultRendering must
   * be set to false when initialzing. See `init` in render-manager.
   */
  onRender() {}

  /**
   * A virtual method for adding resize events
   * on the scene level.
   */
  onResize(event: UIEvent) {}

  /**
   * Adapts the aspect ratio of the current camera to fit the canvas.
   * This only works for cameras that is or extends PerspectiveCamera.
   */
  adaptPerspectiveCamera() {
    if (!this.currentCamera) {
      return;
    }
    if (!this.canvas?.parentElement) {
      return;
    }
    (this.currentCamera as PerspectiveCamera).aspect = (
      this.canvas.parentElement.clientWidth
      / this.canvas.parentElement.clientHeight
    );
    (this.currentCamera as PerspectiveCamera).updateProjectionMatrix();
  }

  /**
   * Changes the current camera.
   * @param {string} cameraKey - The key of the camera in the `cameras` field.
   */
  setCurrentCamera(cameraKey: string) {
    this.currentCamera = this.cameras[cameraKey];
    if (this.currentCamera instanceof PerspectiveCamera) {
      this.adaptPerspectiveCamera();
    }
  }

  awake() {
    this.setCurrentCamera(this.defaultCamera);
    for (const [key, Entity] of Object.entries(this.entities)) {
      const instance = new Entity({ scene: this });
      this.instances[key] = instance;
      this.arrayedInstances.push(instance);
      if (instance?.awake) {
        instance.awake();
      }
    }
    this.onSceneAwake();
  }

  start() {
    if (!this.scene) {
      return;
    }
    for (const instance of this.arrayedInstances) {
      if (instance.start) {
        instance.start();
      }
      if (!instance?.exportObjectGroup) {
        return;
      }
      const group = instance.exportObjectGroup();
      this.scene.add(group);
    }
    this.onSceneStart();
  }

  update(time: number) {
    this.onBeforeFrameRender();
    for (const instance of this.arrayedInstances) {
      // Force async on the Entity level to allow concurrency
      (async () => {
        if (instance?.update) {
          instance.update(time);
        }
      })();
    }
    this.onRender();
  }

  lateUpdate(time: number) {
    for (const instance of this.arrayedInstances) {
      // Force async on the Entity level to allow concurrency
      (async () => {
        if (instance.lateUpdate) {
          instance.lateUpdate(time);
        }
      })();
    }
  }

  onViewEnter() {
    for (const instance of this.arrayedInstances) {
      if (instance.onViewEnter) {
        instance.onViewEnter();
      }
    }
  }

  onViewLeave() {
    for (const instance of this.arrayedInstances) {
      if (instance.onViewLeave) {
        instance.onViewLeave();
      }
    }
  }

  resize(event: UIEvent) {
    this.onResize(event);
    for (const instance of this.arrayedInstances) {
      // Force async on the Entity level to allow concurrency
      (async () => {
        if (instance.resize) {
          instance.resize(event);
        }
      })();
    }
  }
}
