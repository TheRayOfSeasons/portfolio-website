import { MonoBehaviour, Entity } from '../../core/components';
import { ArcsLayer } from './components/arc-layer';
import { DotsMaterialRenderer } from './components/dots-material-renderer';
import { GlobeLayer } from './components/globe-layer';
import { GlobeNavigator } from './components/globe-navigator';
import { GlowLayer } from './components/glow-layer';
import { Precalculator } from './components/precalculator';

export class Globe extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    Precalculator,
    DotsMaterialRenderer,
    GlobeLayer,
    GlowLayer,
    ArcsLayer,
    GlobeNavigator,
  };
}
