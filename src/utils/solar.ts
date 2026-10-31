import { DayNightCyclePhase, UserGPSLocation } from '../types/system';

/**
 * Solar & Celestial Physics Engine
 * Computes real-time solar elevation, azimuth, and day/night cycle
 * from the user's geographic coordinates and local device time.
 */

export interface SolarTelemetry {
  elevationDeg: number; // -90 (nadir) to +90 (zenith)
  azimuthDeg: number;   // 0 (North) to 360
  phase: DayNightCyclePhase;
  phaseLabel: string;
  isSunVisible: boolean;
  sunVector: [number, number, number]; // Normalized 3D vector for Three.js lights
  ambientColor: string;
  skyGradient: string;
  spaceGlowColor: string;
}

/**
 * Approximate solar position calculation (SPA algorithm reduction)
 */
export function calculateSolarTelemetry(
  lat: number = 25.7904, // Default: Los Mochis, Sinaloa, Mexico (or user GPS)
  lon: number = -108.9959,
  date: Date = new Date()
): SolarTelemetry {
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination (approx)
  const declination = 23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);
  
  // Local solar time adjustment from longitude
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const solarTime = hours + (4 * lon - 60 * timezoneOffsetHours) / 60;

  // Hour angle
  const hourAngle = (solarTime - 12) * 15;

  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const haRad = (hourAngle * Math.PI) / 180;

  // Solar elevation
  const sinElevation =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
  const elevationDeg = (elevationRad * 180) / Math.PI;

  // Solar azimuth
  const cosAzimuth =
    (Math.sin(decRad) - Math.sin(latRad) * sinElevation) /
    (Math.cos(latRad) * Math.cos(elevationRad));
  let azimuthDeg = (Math.acos(Math.max(-1, Math.min(1, cosAzimuth))) * 180) / Math.PI;
  if (hourAngle > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  // 3D Sun direction vector for space scene lighting
  const sx = Math.cos(elevationRad) * Math.sin((azimuthDeg * Math.PI) / 180);
  const sy = Math.sin(elevationRad);
  const sz = Math.cos(elevationRad) * Math.cos((azimuthDeg * Math.PI) / 180);

  // Determine atmospheric phase
  let phase: DayNightCyclePhase = 'day';
  let phaseLabel = 'Día Solar Pleno';
  let ambientColor = '#8ddcd1';
  let spaceGlowColor = '#153b48';
  let skyGradient = 'radial-gradient(ellipse at 50% 50%, #153b48 0%, #071923 45%, #030a10 85%)';

  if (elevationDeg > 18) {
    phase = 'day';
    phaseLabel = 'Día Solar Cenital';
    ambientColor = '#ffffff';
    spaceGlowColor = '#1a5068';
    skyGradient = 'radial-gradient(ellipse at 50% 40%, #1b4b68 0%, #0c2738 45%, #04121a 90%)';
  } else if (elevationDeg > 4) {
    phase = 'afternoon';
    phaseLabel = 'Tarde Luminosa';
    ambientColor = '#fef08a';
    spaceGlowColor = '#2d3748';
    skyGradient = 'radial-gradient(ellipse at 50% 45%, #2a3d54 0%, #142232 50%, #050e17 90%)';
  } else if (elevationDeg > -5) {
    phase = 'sunset';
    phaseLabel = 'Atardecer Dorado & Crepúsculo';
    ambientColor = '#f59e0b';
    spaceGlowColor = '#7c2d12';
    skyGradient = 'radial-gradient(ellipse at 50% 60%, #4a1d24 0%, #221528 45%, #070a16 90%)';
  } else if (elevationDeg > -12) {
    phase = 'dawn';
    phaseLabel = 'Amanecer & Luz Crepuscular';
    ambientColor = '#38bdf8';
    spaceGlowColor = '#1e1b4b';
    skyGradient = 'radial-gradient(ellipse at 50% 55%, #1d3354 0%, #111e33 50%, #030811 90%)';
  } else {
    phase = 'night';
    phaseLabel = 'Noche Estelar Cósmica';
    ambientColor = '#38bdf8';
    spaceGlowColor = '#0f172a';
    skyGradient = 'radial-gradient(ellipse at 50% 50%, #0e1e2d 0%, #07111b 50%, #02060b 95%)';
  }

  return {
    elevationDeg: Math.round(elevationDeg * 10) / 10,
    azimuthDeg: Math.round(azimuthDeg * 10) / 10,
    phase,
    phaseLabel,
    isSunVisible: elevationDeg > -2,
    sunVector: [sx, sy, sz],
    ambientColor,
    skyGradient,
    spaceGlowColor
  };
}

/**
 * Converts GPS Coordinates (latitude, longitude) to 3D Cartesian coordinates
 * on a sphere of radius R (used for Earth globe location pins)
 */
export function gpsToCartesian(lat: number, lon: number, radius: number): [number, number, number] {
  // Convert latitude and longitude to radians
  // Three.js convention: Y is up, Z is toward camera
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}
