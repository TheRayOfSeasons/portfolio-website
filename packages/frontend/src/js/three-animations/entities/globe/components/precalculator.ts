import * as THREE from 'three';
import { MonoBehaviour } from '../../../core/components';
import { Pin } from '../types';
import { translateCoordinatesToVector } from '../utils';
import { GLOBE_PARAMETERS } from '../configs';
import { countries } from '../countries';

/**
 * Monobehaviour for running all precalculated values for the globe.
 */
export class Precalculator extends MonoBehaviour {
  origin: Pin;
  originVector: THREE.Vector3;
  countryTargetPositions: THREE.Vector3[];
  movementOffsets: number[]
  nonOriginMovementOffsets: number[]

  constructor(args: any) {
    super(args);
    this.origin = countries.find(({ id }) => id === GLOBE_PARAMETERS.arcs.origin) || {
      id: 'none',
      name: 'none',
      movementOffset: 0,
      coordinates: {
        lat: 0,
        lng: 0,
      },
    };
    if (this.origin.id === 'none') {
      console.error(
        `Origin with ID "${GLOBE_PARAMETERS.arcs.origin}" not found among countries config of globe.`,
      );
    }
    this.originVector = translateCoordinatesToVector(
      this.origin.coordinates.lat,
      this.origin.coordinates.lng,
      GLOBE_PARAMETERS.radius,
    );

    this.countryTargetPositions = countries
      .filter(({ id }) => id !== GLOBE_PARAMETERS.arcs.origin)
      .map(({ coordinates }) => translateCoordinatesToVector(
        coordinates.lat,
        coordinates.lng,
        GLOBE_PARAMETERS.radius,
      ));

    this.movementOffsets = countries
      .filter(({ id }) => id !== GLOBE_PARAMETERS.arcs.origin)
      .map(({ movementOffset }) => movementOffset);
    this.nonOriginMovementOffsets = countries
      .filter(({ id }) => id !== GLOBE_PARAMETERS.arcs.origin)
      .map(({ movementOffset }) => movementOffset);
  }
}
