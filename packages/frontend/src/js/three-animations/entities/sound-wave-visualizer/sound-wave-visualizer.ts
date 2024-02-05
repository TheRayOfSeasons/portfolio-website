import { Entity, MonoBehaviour } from '../../core/components';
import { MeshRenderer } from './components/mesh-renderer';
import { MusicPlayer } from './components/music-player';

export class SoundWaveVisualizer extends Entity {
  monobehaviours: Record<string, typeof MonoBehaviour> = {
    MeshRenderer,
    MusicPlayer,
  };
}
