// @ts-ignore
import Stats from 'stats-js';
import { Clock, PerspectiveCamera, WebGLRenderer, WebGLRendererParameters } from 'three';
import { observer } from '../commons/observer';
// eslint-disable-next-line no-unused-vars
import { InteractiveScene } from './core/scene-management';

// Set to true to see FPS tracker
const DEBUG = false;

/**
 * Sets up an instance of Stats.
 */
const setupStats = (): Stats => {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
};

interface ActiveRenderObject {
  name: string
  activeRender: ActiveRender
}

/**
 * Meant for iterators
 */
const activeRenders: ActiveRenderObject[] = [];

/**
 * Meant for getting specific renders
 */
const keyedActiveRenders: {[key: string]: ActiveRender} = {};

// Handle responsiveness for renders
window.addEventListener('resize', (event) => {
  for (const { activeRender } of activeRenders) {
    activeRender.resize(event);
  }
});

observer.subscribe((entry) => {
  const name = entry.target.getAttribute('data-name');
  if (!name) {
    return;
  }
  /**
   * @type {ActiveRender}
   */
  const activeRender = keyedActiveRenders[name];
  const ratio = entry.intersectionRatio;
  if (ratio > 0) {
    activeRender.onViewEnter();
  } else {
    activeRender.onViewLeave();
  }
});

const clock = new Clock();

/**
 * Initializes and handles the frame by frame animation of
 * all Three scenes managed by this custom framework.
 */
const handleAnimation = () => {
  let stats: Stats;
  if (DEBUG) {
    stats = setupStats();
  }
  const animate = (time: number) => {
    if (DEBUG) {
      stats.begin();
    }
    for (const { activeRender } of activeRenders) {
      if (activeRender.useClock) {
        activeRender.render(clock.getElapsedTime());
      } else {
        activeRender.render(time);
      }
    }
    // We prefer this over renderer.setAnimationLoop
    // since we're using multiple scenes. This way,
    // we can reuse the same render loop for all.
    window.requestAnimationFrame(animate);
    if (DEBUG) {
      stats.end();
    }
  };
  window.requestAnimationFrame(animate);
};
handleAnimation();

type SceneClass = { new(canvas: HTMLCanvasElement, renderer: WebGLRenderer): InteractiveScene };

interface ActiveRenderConstructorArgs {
  name: string
  canvas?: HTMLCanvasElement;
  sceneClass: SceneClass;
  options?: WebGLRendererParameters
  /**
   * Stops frame by frame update calls if the canvas is not visible.
   */
  disableWhenNotVisible?: boolean
  /**
   * Set to false if you intend to render via an EffectComposer
   */
  useDefaultRendering?: boolean
  /**
   * Set to false to disable responsiveness
   */
  responsive?: boolean
  /**
   * Set to true to use Clock instead of the built in time.
   */
  useClock?: boolean
  /**
   * The element observed by the IntersectionObserver to optimize render cycles.
   * Defaults as the same canvas received.
   */
  observerElement?: HTMLElement | null
}

/** Class containing the configurations of one render. */
class ActiveRender {
  canvas: HTMLCanvasElement;
  useClock: boolean;
  disableWhenNotVisible: boolean;
  useDefaultRendering: boolean;
  sceneClass: SceneClass;
  responsive: boolean;
  renderer: WebGLRenderer;
  scene: InteractiveScene;
  isRunning: boolean;

  /**
   * @param {ActiveRenderArgs} args
   */
  constructor({
    name,
    canvas,
    sceneClass,
    options,
    disableWhenNotVisible = true,
    useDefaultRendering = true,
    responsive = true,
    useClock = false,
    observerElement = null,
  }: ActiveRenderConstructorArgs) {
    if (!canvas) {
      throw new Error(`Canvas not found for animation: ${name}`);
    }
    if (typeof (options) === 'object') {
      if (options.canvas) {
        // eslint-disable-next-line no-param-reassign
        canvas = options.canvas as HTMLCanvasElement;
      }
    }
    this.canvas = canvas;
    this.useClock = useClock;
    this.disableWhenNotVisible = disableWhenNotVisible;
    this.useDefaultRendering = useDefaultRendering;
    this.sceneClass = sceneClass;
    this.responsive = responsive;
    this.renderer = new WebGLRenderer(options || {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      canvas,
    });
    this.renderer.setSize(
      canvas?.parentElement?.clientWidth || 0,
      canvas?.parentElement?.clientHeight || 0,
    );
    const SceneClass = sceneClass;

    this.scene = new SceneClass(canvas, this.renderer);
    this.scene.awake();
    this.scene.start();

    this.isRunning = false;

    if (disableWhenNotVisible) {
      const element = observerElement || canvas;
      element.setAttribute('data-name', name);
      observer.observe(element);
    }
  }

  onViewEnter() {
    this.isRunning = true;
    this.scene.onViewEnter();
  }

  onViewLeave() {
    this.isRunning = false;
    this.scene.onViewLeave();
  }

  render(time: number) {
    if (!this.scene) {
      return;
    }
    if (!this.scene.currentCamera) {
      return;
    }
    if (!this.isRunning && this.disableWhenNotVisible) {
      return;
    }
    this.scene.update(time);
    if (this.useDefaultRendering) {
      this.renderer.render(this.scene.scene as any, this.scene.currentCamera);
    }
    this.scene.lateUpdate(time);
    this.scene.onAfterRender();
  }

  resize(event: UIEvent) {
    if (this.responsive) {
      const camera = this.scene?.currentCamera as PerspectiveCamera;
      const canvas = this.renderer.domElement;
      if (!camera) {
        return;
      }
      if (!canvas) {
        return;
      }
      this.scene.resize(event);
      camera.aspect = (canvas?.parentElement?.clientWidth || 0) / (canvas?.parentElement?.clientHeight || 0);
      camera.updateProjectionMatrix();
      this.renderer.setSize(
        canvas.parentElement?.clientWidth || 0,
        canvas.parentElement?.clientHeight || 0,
      );
    }
  }
}

export const ThreeAnimations = {
  /**
   * Initializes an InteractiveScene.
   * NOTE: Canvas size is dependent on the parent's size.
   */
  init: (args: ActiveRenderConstructorArgs) => {
    if (!args.canvas) {
      if (!args.options) {
        return;
      }
      if (!args?.options?.canvas) {
        return;
      }
    }
    const { name } = args;
    const activeRender = new ActiveRender(args);
    activeRenders.push({
      name,
      activeRender,
    });
    keyedActiveRenders[name] = activeRender;
  },
};
