import { Entity } from '../../core/components';
import { MeshRenderer } from './components/mesh-renderer';
import { MouseMovementRippleSource } from './components/mouse-movement-ripple-source';
import { RippleMaterialRenderer } from './components/ripple-material-renderer';
import { RippleTimeline } from './components/ripple-timeline';

export class RipplingSphere extends Entity {
  monobehaviours = {
    MeshRenderer,
    MouseMovementRippleSource,
    RippleMaterialRenderer,
    RippleTimeline,
  };
}
