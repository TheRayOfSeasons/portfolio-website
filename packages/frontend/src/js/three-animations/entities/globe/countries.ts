import type { Pin } from './types';

export const countries: Pin[] = [
  {
    id: 'us',
    name: 'Chicago, USA',
    movementOffset: 2.2, // in ms
    coordinates: {
      lat: 41.8781,
      lng: -87.6298,
    },
  },
  {
    id: 'ca-usa',
    name: 'California, USA',
    movementOffset: 2.5, // in ms
    coordinates: {
      lat: 36.7783,
      lng: -119.4179,
    },
  },
  {
    id: 'uk',
    name: 'London, UK',
    movementOffset: 0.5, // in ms
    coordinates: {
      lat: 51.5072,
      lng: -0.1276,
    },
  },
  {
    id: 'jer-uk',
    name: 'Jersey, UK',
    movementOffset: 0.35, // in ms
    coordinates: {
      lat: 49.2138,
      lng: -2.1358,
    },
  },
  {
    id: 'au',
    name: 'Australia',
    movementOffset: 1, // in ms
    coordinates: {
      lat: -25.2744,
      lng: 133.7751,
    },
  },
  {
    id: 'uae',
    name: 'UAE',
    movementOffset: 1.5, // in ms
    coordinates: {
      lat: 23.4241,
      lng: 53.8478,
    },
  },
  {
    id: 'sg',
    name: 'Singapore',
    movementOffset: 2, // in ms
    coordinates: {
      lat: 1.3521,
      lng: 103.8198,
    },
  },
  {
    id: 'ph',
    name: 'Philippines',
    movementOffset: 0, // in ms
    coordinates: {
      lat: 14,
      lng: 121,
    },
  },
];
