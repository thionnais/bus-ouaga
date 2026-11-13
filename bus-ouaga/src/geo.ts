// ===== 1. IMPORTS =====
import type { Stop } from "./types";

// ===== 2. DISTANCE ENTRE DEUX POINTS GPS, EN MÈTRES (formule de Haversine) =====
// La Terre est ronde : on ne peut pas faire une simple soustraction de coordonnées.
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // rayon de la Terre en mètres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

// ===== 3. LES ARRÊTS LES PLUS PROCHES D'UNE POSITION =====
export interface NearbyStop {
  stop: Stop & { lat: number; lng: number };
  distance: number; // en mètres
}

export function findNearestStops(
  lat: number,
  lng: number,
  stops: Stop[],
  count = 3,
): NearbyStop[] {
  return stops
    .filter(
      (s): s is Stop & { lat: number; lng: number } =>
        s.lat !== undefined && s.lng !== undefined,
    )
    .map((stop) => ({
      stop,
      distance: distanceMeters(lat, lng, stop.lat, stop.lng),
    }))
    .sort((a, b) => a.distance - b.distance) // du plus proche au plus loin
    .slice(0, count);
}
// ===== 4. AFFICHER UNE DISTANCE LISIBLE =====
// 56 -> "56 m"    1052 -> "1,1 km"
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}