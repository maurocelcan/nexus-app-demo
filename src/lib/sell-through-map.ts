import type { SellThroughPdv } from "@/data/mock-sell-through";

export type GeoPoint = { lat: number; lng: number };
export type GeoBounds = { north: number; south: number; east: number; west: number };

export const SELL_THROUGH_MAP_BOUNDS: GeoBounds = {
  north: -34.55,
  south: -34.65,
  east: -58.35,
  west: -58.45,
};

export function sellThroughPdvToGeo(pdv: Pick<SellThroughPdv, "x" | "y" | "lat" | "lng">): GeoPoint {
  if (pdv.lat !== undefined && pdv.lng !== undefined) return { lat: pdv.lat, lng: pdv.lng };
  const lat = SELL_THROUGH_MAP_BOUNDS.north - (pdv.y / 100) * (SELL_THROUGH_MAP_BOUNDS.north - SELL_THROUGH_MAP_BOUNDS.south);
  const lng = SELL_THROUGH_MAP_BOUNDS.west + (pdv.x / 100) * (SELL_THROUGH_MAP_BOUNDS.east - SELL_THROUGH_MAP_BOUNDS.west);
  return { lat, lng };
}

export function geoBoundsContainsPoint(bounds: GeoBounds, point: GeoPoint): boolean {
  return point.lat <= bounds.north && point.lat >= bounds.south && point.lng >= bounds.west && point.lng <= bounds.east;
}
