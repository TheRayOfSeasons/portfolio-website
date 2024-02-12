import * as THREE from 'three';

/**
 * Position an object on a planet.
 * @param {THREE.Object3D} object - the object to place
 * @param {number} lat - latitude of the location
 * @param {number} lon - longitude of the location
 * @param {number} radius - radius of the planet
 */
export function placeObjectOnPlanet(object: THREE.Object3D, lat: number, lon: number, radius: number) {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  object.position.set(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius,
  );
  object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
}

/**
 * Translates a geometry's local position over a sphere.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} lat - latitude of the location
 * @param {number} lon - longitude of the location
 * @param {number} radius - radius of the planet
 */
export function placeGeometryOnPlanet(geometry: THREE.BufferGeometry, lat: number, lon: number, radius: number) {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);

  const refObject = new THREE.Object3D();
  refObject.position.set(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius,
  );
  refObject.lookAt(new THREE.Vector3());
  const childRefObject = new THREE.Object3D();
  refObject.add(childRefObject);
  childRefObject.position.set(4, 0, 0);
  const worldPosition = new THREE.Vector3();
  childRefObject.getWorldPosition(worldPosition);

  geometry.lookAt(worldPosition);
  geometry.translate(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius,
  );
}

/**
 * Converts latitude and longitude values to 3D Cartesian coordinates.
 * @param {number} lat
 * @param {number} lon
 * @param {number} radius
 * @returns {THREE.Vector3}
 */
export function translateCoordinatesToVector(lat: number, lon: number, radius: number): THREE.Vector3 {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  return new THREE.Vector3(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius,
  );
}

// An arbitrary GLSL wave formula used to facilitate
// the color animation of the globe's arcs.
export const arcPatternShaper = `
float shape(float tValue, float frequency, float time, float speed) {
  float ref = ((tValue * frequency) - (time * speed));
  float value =  max(0.0, (((sin(ref) * sign(cos(ref)) * 0.5) + 0.5)));
  return value;
}`;
