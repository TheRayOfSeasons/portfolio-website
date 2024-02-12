import * as THREE from 'three';

export type Coordinates = {
  lat: number
  lng: number
}

export type Pin = {
  /**
   * - A unique identifier for the pin.
   * - Currently used for referencing interactive navigations from the UI.
   */
  id: string
  /**
   * A display name for the pin.
   */
  name: string
  /**
   * The offset of the arc's movement towards this pin/country in ms.
   */
  movementOffset: number
  /**
   * Real world coordinates of the pin.
   */
  coordinates: Coordinates
}

export type Arc = {
  arc: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap> | null
  circle: THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial, THREE.Object3DEventMap>
}
