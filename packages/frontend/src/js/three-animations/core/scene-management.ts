/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import {
  Camera, LoadingManager, PerspectiveCamera, Scene, WebGLRenderer,
} from 'three';
import { IInteractiveScene, ISceneObject } from './types';
import { SceneObject } from './components';

/** A class that sets up a scene. */
export class InteractiveScene implements IInteractiveScene {
  canvas?: HTMLCanvasElement;
  renderer?: WebGLRenderer;
  scene?: Scene;
  currentCamera?: Camera;
  loadingManager: LoadingManager;

  sceneObjects: {[key: string]: typeof SceneObject} = {};

  /**
   * Used for referencing SceneObject instances from outside.
   */
  instances: {[key: string]: ISceneObject} = {};

  /**
   * Used for iterating lifecycle based events for performance.
   */
  arrayedInstances: ISceneObject[] = [];

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
   * Runs after all SceneObjects awake.
   * Can be utilized for setting up postprocessing.
   */
  onSceneAwake() {}

  /**
   * Runs after all SceneObjects start.
   */
  onSceneStart() {}

  /**
   * Runs before the frame renders all SceneObjects.
   */
  onBeforeFrameRender() {}

  /**
   * Runs after the frame renders all SceneObjects.
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
    for (const [key, SceneObject] of Object.entries(this.sceneObjects)) {
      const instance = new SceneObject({ scene: this });
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
      // Force async on the SceneObject level to allow concurrency
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
      // Force async on the SceneObject level to allow concurrency
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
      // Force async on the SceneObject level to allow concurrency
      (async () => {
        if (instance.resize) {
          instance.resize(event);
        }
      })();
    }
  }
}
