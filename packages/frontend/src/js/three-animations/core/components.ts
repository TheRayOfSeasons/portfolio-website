/* eslint-disable no-unused-vars */
import { Group, Object3D, Object3DEventMap } from 'three';
import { IMonoBehaviour, IEntity as IEntity, IBehaviour } from './types';
import { InteractiveScene } from './scene-management';

export class Behaviour implements IBehaviour {
  awake?(): void;
  start?(): void;
  update?(time: number): void;
  lateUpdate?(time: number): void;
  resize?(event: UIEvent): void;
  onViewEnter?(): void;
  onViewLeave?(): void;
  exportAsEntity?(): Object3D;
  exportObjectGroup?(): Group<Object3DEventMap>;
}

/**
 * A collection of MonoBehaviours interacting with each other
 * to build up one full behaviour. A loose counterpart of
 * GameObject from Unity Engine.
 */
export class Entity implements IEntity {
  scene?: InteractiveScene;
  monobehaviours: Record<string, typeof MonoBehaviour> = {};
  components: Record<string, MonoBehaviour> = {};
  arrayedComponents: Array<MonoBehaviour> = [];
  group: Group<Object3DEventMap>;

  constructor({ scene }: { scene: InteractiveScene }) {
    this.scene = scene;
    this.group = new Group();
  }
  
  /**
   * Add a MonoBehaviour into the object, which in turn is reflected into the scene.
   * @param args
   * @param args.key - The key to be used when the instance is passed as a component.
   * @param args.Monobehaviour
   *  - A class that extends MonoBehaviour containing the logic.
   */
  addComponent({
    key,
    Monobehaviour,
  }: {
    key: string
    Monobehaviour: typeof MonoBehaviour
  }) {
    if (!this.scene) {
      throw new Error('Cannot add component when scene is not defined!');
    }
    const component = new Monobehaviour({ parentBehaviour: this, scene: this.scene }) as MonoBehaviour;
    this.components[key] = component;
    this.arrayedComponents.push(component);
  }

  awake() {
    for (const [key, Monobehaviour] of Object.entries(this.monobehaviours)) {
      this.addComponent({ key, Monobehaviour });
    }
    for (const component of this.arrayedComponents) {
      if (component && component.awake) {
        component.awake();
      }
    }
  }

  start() {
    if (!this.group) {
      return;
    }
    for (const component of this.arrayedComponents) {
      if (component?.start) {
        component.start();
      }
      if (!component?.exportAsEntity) {
        return;
      }
      const exportedEntity = component.exportAsEntity();
      if (exportedEntity) {
        this.group.add(exportedEntity);
      }
    }
  }

  update(time: number) {
    for (const component of this.arrayedComponents) {
      if (component?.update) {
        component.update(time);
      }
    }
  }

  lateUpdate(time: number) {
    for (const component of this.arrayedComponents) {
      if (component?.lateUpdate) {
        component.lateUpdate(time);
      }
    }
  }

  onViewEnter() {
    for (const component of this.arrayedComponents) {
      if (component?.onViewEnter) {
        component.onViewEnter();
      }
    }
  }

  onViewLeave() {
    for (const component of this.arrayedComponents) {
      if (component?.onViewLeave) {
        component.onViewLeave();
      }
    }
  }

  resize(event: UIEvent) {
    for (const component of this.arrayedComponents) {
      if (component?.resize) {
        component.resize(event);
      }
    }
  }

  exportObjectGroup() {
    return this.group;
  }
}

/** A singular piece of a behaviour. */
export class MonoBehaviour extends Behaviour implements IMonoBehaviour {
  parentBehaviour: Entity;
  scene: InteractiveScene;

  constructor({
    parentBehaviour,
    scene,
  }: {
    parentBehaviour: Entity,
    scene: InteractiveScene,
  }) {
    super();
    this.parentBehaviour = parentBehaviour;
    this.scene = scene;
  }

  getComponent<T = MonoBehaviour>(type: string): T {
    const result = this.parentBehaviour.components[type] as T;
    return result;
  }
}
