import {
  Camera,
  LoadingManager,
  Group,
  Scene,
  Object3DEventMap,
  WebGLRenderer,
} from 'three';

export interface IBehaviour {
  /** Called whenever the behaviour becomes active */
  awake?(): void;

  /** Called at the beginning of a scene to setup the behaviour. */
  start?(): void;

  /**
   * Called before each frame renders.
   * @param time - A reference to the time since the scene was first rendered.
   */
  update?(time: number): void;

  /**
   * Called after each frame renders.
   * @param time - A reference to the time since the scene was first rendered.
   */
  lateUpdate?(time: number): void;

  /**
   * Called whenever the viewport is resized
   * @param event
   */
  resize?(event: UIEvent): void;

  /**
   * Called whenver the canvas enters the viewport
   */
  onViewEnter?(): void;

  /**
   * Called whenver the canvas leaves the viewport
   */
  onViewLeave?(): void;

  /** Whatever this returns will be added to the scene. */
  exportAsEntity?(): any;

  /**
   * Whatever this returns will be added to the scene as a group.
   * NOTE: Currently, this is only used for the Entity as a
   * collector of all Monobehaviours under it. Don't use this in
   * any other way unless the abstraction is revised.
   */
  exportObjectGroup?(): Group<Object3DEventMap>;
}

export interface IMonoBehaviourConstructor {
  new({
    parentBehaviour,
    scene,
  }: {
    parentBehaviour: IEntity
    scene: IInteractiveScene
  }): IMonoBehaviour
};

export interface IMonoBehaviour extends IBehaviour {
  /**
   * Returns a reference to the instance of a sibling component or monobehaviour.
   * @param type - The key to the component.
   */
  getComponent?(type: string): IMonoBehaviour;
}

export type IEntityConstructor = {
  new ({
    scene,
  }: {
    scene: IInteractiveScene
  }): IEntity
}

export interface IEntity extends IBehaviour {
  /**
   * Used for referencing Monobehaviour instances from other Monobehaviours.
   */
  components: {[key: string]: IMonoBehaviour};

  /**
   * Used for iterating lifecycle Id events for performance.
   */
  arrayedComponents: IMonoBehaviour[];

  group: Group;
}

export interface IInteractiveScene extends IBehaviour {
  canvas?: HTMLCanvasElement;
  renderer?: WebGLRenderer;
  scene?: Scene;
  currentCamera?: Camera;
  loadingManager: LoadingManager;

  /**
   * Used for referencing Entity instances from outside.
   */
  instances: {[key: string]: IEntity};

  /**
   * Used for iterating lifecycle Id events for performance.
   */
  arrayedInstances: IEntity[];

  cameras: {[key: string]: Camera};

  /**
   * A virtual method for further modifying the scene after the constructor runs.
   */
  modifyScene?(scene: Scene): void;

  /**
   * Runs after all Entities awake.
   * Can be utilized for setting up postprocessing.
   */
  onSceneAwake?(): void

  /**
   * Runs after all Entities start.
   */
  onSceneStart?(): void

  /**
   * Runs before the frame renders all Entities.
   */
  onBeforeFrameRender?(): void

  /**
   * Runs after the frame renders all Entities.
   */
  onAfterRender?(): void

  /**
   * A virtual method for adding custom render cycles.
   * Can be utilized for rendering through EffectComposers.
   * NOTE: To use EffectComposers, useDefaultRendering must
   * be set to false when initialzing. See `init` in render-manager.
   */
  onRender?(): void

  /**
   * A virtual method for adding resize events
   * on the scene level.
   */
  onResize?(event: UIEvent): void

  /**
   * Adapts the aspect ratio of the current camera to fit the canvas.
   * This only works for cameras that is or extends PerspectiveCamera.
   */
  adaptPerspectiveCamera(): void;

  /**
   * Changes the current camera.
   * @param cameraKey - The key of the camera in the `cameras` field.
   */
  setCurrentCamera(cameraKey: string): void;
}
