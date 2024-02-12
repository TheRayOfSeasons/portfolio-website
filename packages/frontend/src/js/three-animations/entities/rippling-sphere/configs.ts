import * as THREE from 'three';

export const RIPPLE_CONFIG = {
  useTimeline: false,
  debug: false,
  showControlPoints: false,
  radius: 8,
  controlPoint1: new THREE.Vector3(48, 0, 0),
  controlPoint2: new THREE.Vector3(64, 0, 0),
  initiallyEnableInteraction: false,
  interactionEasing: 0.1,
  allowControlPoints: true
};
