"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SELL_THROUGH_DISTRIBUTORS,
  type SellThroughPdv,
  type SellThroughPdvStatus,
} from "@/data/mock-sell-through";
import {
  geoBoundsContainsPoint,
  SELL_THROUGH_MAP_BOUNDS,
  type GeoBounds,
} from "@/lib/sell-through-map";

type SelectionBounds = { left: number; top: number; width: number; height: number };
type ScriptState = "loading" | "ready" | "error" | "missing-key";

interface GeoLocation extends MapPlace {
  bounds?: GeoBounds;
}

const GEOCODER_SUPPORTED_CATEGORIES = ["business", "transit", "government", "medical", "worship", "school"] as const;
type MapLayerKey = "business" | "transit" | "government" | "medical" | "worship" | "school" | "water" | "road";
type MapStyleRule = {
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string | boolean>>;
};

export type MapPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type LatLngLiteral = { lat: number; lng: number };
type GIcon = {
  path: unknown;
  scale: number;
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
};

interface GMap {
  fitBounds(bounds: GLatLngBounds): void;
  getBounds(): GLatLngBounds | null;
  panTo(position: LatLngLiteral): void;
  setZoom(zoom: number): void;
  setOptions(options: Record<string, unknown>): void;
}

interface GMarker {
  setMap(map: GMap | null): void;
  setAnimation(animation: unknown | null): void;
  setIcon(icon: GIcon): void;
}

interface GInfoWindow {
  open(options: { anchor: GMarker; map: GMap }): void;
  close(): void;
}

interface GLatLng {
  lat(): number;
  lng(): number;
}

type GMapClickEvent = {
  placeId?: string;
  latLng?: GLatLng;
  stop?: () => void;
};

interface GLatLngBounds {
  extend(position: LatLngLiteral): void;
  getNorthEast(): GLatLng;
  getSouthWest(): GLatLng;
}

interface GRectangle {
  setMap(map: GMap | null): void;
  setBounds(bounds: { north: number; south: number; east: number; west: number }): void;
}

interface GeocoderInterface {
  geocode(options: { address?: string; location?: LatLngLiteral }): Promise<{ results?: Array<Record<string, unknown>> | null }>;
}

type GMapsListener = { remove: () => void };

interface GMapsApi {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => GMap;
  Marker: new (options: Record<string, unknown>) => GMarker;
  InfoWindow: new (options: Record<string, unknown>) => GInfoWindow;
  Rectangle: new (options: Record<string, unknown>) => GRectangle;
  LatLngBounds: new (bounds?: { north: number; south: number; east: number; west: number }) => GLatLngBounds;
  SymbolPath: { CIRCLE: unknown };
  Animation: { BOUNCE: unknown };
  event: {
    addListener(target: object, eventName: string, handler: (event: GMapClickEvent) => void): GMapsListener;
    clearInstanceListeners(target: object): void;
  };
  Geocoder?: new () => GeocoderInterface;
}

function getMapsApi(): GMapsApi | null {
  const mapsApi = (window as unknown as { google?: { maps?: GMapsApi } }).google?.maps;
  return mapsApi ?? null;
}

const SCRIPT_ID = "google-maps-script";

const MAP_BOUNDS = {
  north: -34.55,
  south: -34.65,
  east: -58.35,
  west: -58.45,
};

// Obtenemos el Geocoder del objeto maps API de Google
function getGeocoder(mapsApiInstance?: GMapsApi): GeocoderInterface | null {
  const mapsApi = mapsApiInstance ?? getMapsApi();
  if (!mapsApi?.Geocoder) return null;
  return new mapsApi.Geocoder();
}

const STATUS_LABELS: Record<SellThroughPdvStatus, string> = {
  buyer: "Comprador",
  "non-buyer": "No comprador",
  potential: "Potencial",
};

const STATUS_BADGE: Record<SellThroughPdvStatus, "success" | "danger" | "warning"> = {
  buyer: "success",
  "non-buyer": "danger",
  potential: "warning",
};

const STATUS_DOT: Record<SellThroughPdvStatus, string> = {
  buyer: "bg-success border-success/50",
  "non-buyer": "bg-danger border-danger/50",
  potential: "bg-warning border-warning/50",
};

const MAP_LAYER_OPTIONS: Array<{ key: MapLayerKey; label: string }> = [
  { key: "business", label: "Negocios" },
  { key: "transit", label: "Tránsito" },
  { key: "government", label: "Gobierno" },
  { key: "medical", label: "Salud" },
  { key: "worship", label: "Culto" },
  { key: "school", label: "Escuelas" },
  { key: "water", label: "Agua" },
  { key: "road", label: "Calles" },
];

const DEFAULT_VISIBLE_LAYERS: Record<MapLayerKey, boolean> = {
  business: false,
  transit: false,
  government: false,
  medical: false,
  worship: false,
  school: false,
  water: true,
  road: true,
};

type PlaceCategory = typeof GEOCODER_SUPPORTED_CATEGORIES[number];

const PLACES_TYPE_BY_CATEGORY: Record<PlaceCategory, string> = {
  business: "establishment",
  transit: "transit_station",
  government: "local_government_office",
  medical: "hospital",
  worship: "place_of_worship",
  school: "school",
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function getDistributorName(id: string): string {
  if (id === "real-pdv-file") return "Archivo PDV";
  return SELL_THROUGH_DISTRIBUTORS.find((distributor) => distributor.id === id)?.name ?? "Sin distribuidor";
}

function toLatLng(pdv: Pick<SellThroughPdv, "x" | "y" | "lat" | "lng">): LatLngLiteral {
  if (pdv.lat !== undefined && pdv.lng !== undefined) return { lat: pdv.lat, lng: pdv.lng };
  const lat = SELL_THROUGH_MAP_BOUNDS.north - (pdv.y / 100) * (SELL_THROUGH_MAP_BOUNDS.north - SELL_THROUGH_MAP_BOUNDS.south);
  const lng = SELL_THROUGH_MAP_BOUNDS.west + (pdv.x / 100) * (SELL_THROUGH_MAP_BOUNDS.east - SELL_THROUGH_MAP_BOUNDS.west);
  return { lat, lng };
}

function toBounds(selection: GeoBounds) {
  return {
    north: selection.north,
    south: selection.south,
    east: selection.east,
    west: selection.west,
  };
}

function buildMapStyles(visibleLayers: Record<MapLayerKey, boolean>): MapStyleRule[] {
  const transitStyles: MapStyleRule[] = visibleLayers.transit
    ? [
        { featureType: "transit", stylers: [{ visibility: "on" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
      ]
    : [
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ];

  return [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "on" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "poi.business", stylers: [{ visibility: visibleLayers.business ? "on" : "off" }] },
    { featureType: "poi.government", stylers: [{ visibility: visibleLayers.government ? "on" : "off" }] },
    { featureType: "poi.medical", stylers: [{ visibility: visibleLayers.medical ? "on" : "off" }] },
    { featureType: "poi.place_of_worship", stylers: [{ visibility: visibleLayers.worship ? "on" : "off" }] },
    { featureType: "poi.school", stylers: [{ visibility: visibleLayers.school ? "on" : "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }, { visibility: visibleLayers.road ? "on" : "off" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f172a" }, { visibility: visibleLayers.road ? "on" : "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a2640" }, { visibility: visibleLayers.water ? "on" : "off" }] },
    ...transitStyles,
  ];
}

function markerIcon(mapsApi: GMapsApi, status: SellThroughPdvStatus, selected = false): GIcon {
  const colorByStatus: Record<SellThroughPdvStatus, string> = {
    buyer: "#10B981",
    "non-buyer": "#FB7185",
    potential: "#FACC15",
  };

  return {
    path: mapsApi.SymbolPath.CIRCLE,
    scale: selected ? 10 : 7,
    fillColor: colorByStatus[status],
    fillOpacity: selected ? 1 : 0.92,
    strokeColor: selected ? "#F8FAFC" : "#FFFFFF",
    strokeWeight: selected ? 2 : 1.5,
  };
}

export function GoogleMapsPDVMap({
  pdvs,
  selectedPdv,
  selectionBounds,
  traceMode,
  onSelectPdv,
  onSelectionComplete,
  onMapPlaceSelect,
}: {
  pdvs: SellThroughPdv[];
  selectedPdv: string | null;
  selectionBounds: GeoBounds | null;
  traceMode: boolean;
  onSelectPdv: (id: string | null) => void;
  onSelectionComplete: (bounds: GeoBounds) => void;
  onMapPlaceSelect: (place: MapPlace) => void;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GMap | null>(null);
  const markersRef = useRef(new Map<string, GMarker>());
  const infoWindowsRef = useRef(new Map<string, GInfoWindow>());
  const selectionRectRef = useRef<GRectangle | null>(null);
  const placeListenerRef = useRef<{ remove: () => void } | null>(null);
  const placeReadTimeoutRef = useRef<number | null>(null);
  const pendingPlaceRef = useRef<{ id: string; lat: number; lng: number } | null>(null);
  const lastPlaceSnapshotRef = useRef<string | null>(null);
  const geocoderRef = useRef<GeocoderInterface | null>(null);

  const [scriptState, setScriptState] = useState<ScriptState>(() => {
    if (!apiKey) return "missing-key";
    if (typeof window !== "undefined" && getMapsApi()) return "ready";
    return "loading";
  });
  const [visibleLayers, setVisibleLayers] = useState<Record<MapLayerKey, boolean>>(DEFAULT_VISIBLE_LAYERS);
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<SelectionBounds | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const selected = useMemo(() => pdvs.find((pdv) => pdv.id === selectedPdv) ?? null, [pdvs, selectedPdv]);
  const mapStyles = useMemo(() => buildMapStyles(visibleLayers), [visibleLayers]);

  function clearPlaceReadTimeout() {
    if (placeReadTimeoutRef.current !== null) {
      window.clearTimeout(placeReadTimeoutRef.current);
      placeReadTimeoutRef.current = null;
    }
  }

  function findVisibleInfoWindow(): HTMLElement | null {
    if (!mapContainerRef.current) return null;
    const nodes = Array.from(
      mapContainerRef.current.querySelectorAll<HTMLElement>(".gm-style-iw-d, .gm-style-iw")
    );
    const visible = nodes.find((node) => node.offsetParent !== null && node.getClientRects().length > 0);
    return visible ?? nodes[nodes.length - 1] ?? null;
  }

  function extractPlaceFromInfoWindow(): { name: string; address: string; snapshot: string } | null {
    const container = findVisibleInfoWindow();
    if (!container) return null;
    const rawText = container.innerText?.trim();
    if (!rawText) return null;
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/ver en google maps|view on google maps/i.test(line));
    if (lines.length === 0) return null;
    const snapshot = lines.join(" | ");
    const name = lines[0];
    const address = lines.slice(1).length > 0 ? lines.slice(1).join(", ") : "Sin dirección";
    return { name, address, snapshot };
  }

  function schedulePlaceRead(attemptsLeft = 6) {
    if (!pendingPlaceRef.current) return;
    const details = extractPlaceFromInfoWindow();
    if (details) {
      if (details.snapshot === lastPlaceSnapshotRef.current && attemptsLeft > 0) {
        clearPlaceReadTimeout();
        placeReadTimeoutRef.current = window.setTimeout(() => schedulePlaceRead(attemptsLeft - 1), 140);
        return;
      }
      const { id, lat, lng } = pendingPlaceRef.current;
      pendingPlaceRef.current = null;
      lastPlaceSnapshotRef.current = details.snapshot;
      onMapPlaceSelect({ id, lat, lng, name: details.name, address: details.address });
      return;
    }
    if (attemptsLeft <= 0) return;
    clearPlaceReadTimeout();
    placeReadTimeoutRef.current = window.setTimeout(() => schedulePlaceRead(attemptsLeft - 1), 140);
  }

  useEffect(() => {
    if (!apiKey) return;

    if (getMapsApi()) {
      const readyTimer = window.setTimeout(() => {
        setScriptState("ready");
        const mapsInstance = getMapsApi();
        if (mapsInstance?.Geocoder) {
          try {
            geocoderRef.current = new mapsInstance.Geocoder();
          } catch {}
        }
      }, 0);
      return () => window.clearTimeout(readyTimer);
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const handleReady = () => {
      if (getMapsApi()) {
        setScriptState("ready");
        const mapsInstance = getMapsApi();
        if (mapsInstance?.Geocoder) {
          try {
            geocoderRef.current = new mapsInstance.Geocoder();
          } catch {}
        }
      } else {
        setScriptState("error");
      }
    };

    const handleError = () => {
      setScriptState("error");
    };

    if (existing) {
      existing.addEventListener("load", handleReady);
      existing.addEventListener("error", handleError);
      return () => {
        existing.removeEventListener("load", handleReady);
        existing.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleReady);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleReady);
      script.removeEventListener("error", handleError);
    };
  }, [apiKey]);

  useEffect(() => {
    const mapsApi = getMapsApi();
    if (scriptState !== "ready" || !mapContainerRef.current || mapRef.current || !mapsApi) {
      return;
    }

    mapRef.current = new mapsApi.Map(mapContainerRef.current, {
      center: {
        lat: (MAP_BOUNDS.north + MAP_BOUNDS.south) / 2,
        lng: (MAP_BOUNDS.east + MAP_BOUNDS.west) / 2,
      },
      zoom: 12,
      clickableIcons: true,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: mapStyles,
    });

    return () => {
      const mapsApiForCleanup = getMapsApi();
      if (mapRef.current && mapsApiForCleanup) {
        markersRef.current.forEach((marker) => {
          mapsApiForCleanup.event.clearInstanceListeners(marker);
          marker.setMap(null);
        });
        infoWindowsRef.current.forEach((windowInstance) => windowInstance.close());
        selectionRectRef.current?.setMap(null);
      }
      markersRef.current.clear();
      infoWindowsRef.current.clear();
      selectionRectRef.current = null;
      mapRef.current = null;
    };
  }, [scriptState]);

  useEffect(() => {
    if (scriptState !== "ready" || !mapRef.current) return;
    mapRef.current.setOptions({ styles: mapStyles });
  }, [scriptState, mapStyles]);

  useEffect(() => {
    const mapsApi = getMapsApi();
    if (scriptState !== "ready" || !mapRef.current || !mapsApi) return;

    placeListenerRef.current?.remove();
    placeListenerRef.current = null;
    clearPlaceReadTimeout();
    pendingPlaceRef.current = null;

    if (!selectionBounds) return;

    placeListenerRef.current = mapsApi.event.addListener(mapRef.current as object, "click", (event: GMapClickEvent) => {
      if (!event.placeId || !event.latLng) return;
      pendingPlaceRef.current = {
        id: event.placeId,
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      schedulePlaceRead();
    });
    return () => {
      placeListenerRef.current?.remove();
      placeListenerRef.current = null;
      clearPlaceReadTimeout();
      pendingPlaceRef.current = null;
    };
  }, [scriptState, selectionBounds, onMapPlaceSelect]);

  useEffect(() => {
    const mapsApi = getMapsApi();
    if (scriptState !== "ready" || !mapRef.current || !mapsApi) return;

    markersRef.current.forEach((marker) => {
      mapsApi.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    infoWindowsRef.current.forEach((windowInstance) => windowInstance.close());
    markersRef.current.clear();
    infoWindowsRef.current.clear();

    const mapBounds = new mapsApi.LatLngBounds();

    pdvs.forEach((pdv) => {
      const marker = new mapsApi.Marker({
        map: mapRef.current,
        position: toLatLng(pdv),
        title: pdv.name,
        icon: markerIcon(mapsApi, pdv.status, pdv.id === selectedPdv),
      });

      const infoWindow = new mapsApi.InfoWindow({
        content: `<div style="font-family: ui-sans-serif, system-ui; color: #0f172a; font-size: 12px; line-height: 1.4; min-width: 200px;"><strong>${pdv.name}</strong><br/>${pdv.channel} · ${pdv.zoneId}<br/>${pdv.address ? `<span>${pdv.address}</span><br/>` : ""}<span style="color:#334155">Estado: ${STATUS_LABELS[pdv.status]}<br/>Facturación: ${formatCurrency(pdv.revenue)}<br/>Volumen: ${formatNumber(pdv.volume)} unidades<br/>Ticket: ${pdv.averageTicket !== undefined ? formatCurrency(pdv.averageTicket) : "N/A"}</span></div>`,
        maxWidth: 260,
      });

      mapsApi.event.addListener(marker, "click", () => {
        infoWindowsRef.current.forEach((openWindow) => openWindow.close());
        infoWindow.open({ anchor: marker, map: mapRef.current as GMap });
        onSelectPdv(pdv.id);
      });

      markersRef.current.set(pdv.id, marker);
      infoWindowsRef.current.set(pdv.id, infoWindow);
      mapBounds.extend(toLatLng(pdv));
    });

    if (pdvs.length > 0) {
      mapRef.current.fitBounds(mapBounds);
    }
  }, [scriptState, pdvs, onSelectPdv, selectedPdv]);

  useEffect(() => {
    const mapsApi = getMapsApi();
    if (scriptState !== "ready" || !mapsApi) return;

    markersRef.current.forEach((marker, pdvId) => {
      const pdv = pdvs.find((item) => item.id === pdvId);
      if (!pdv) return;
      marker.setAnimation(pdvId === selectedPdv ? mapsApi.Animation.BOUNCE : null);
      marker.setIcon(markerIcon(mapsApi, pdv.status, pdvId === selectedPdv));
    });

    if (selectedPdv) {
      const selectedPoint = pdvs.find((pdv) => pdv.id === selectedPdv);
      if (selectedPoint && mapRef.current) {
        mapRef.current.panTo(toLatLng(selectedPoint));
        mapRef.current.setZoom(14);
      }
    }
  }, [scriptState, pdvs, selectedPdv]);

  useEffect(() => {
    const mapsApi = getMapsApi();
    if (scriptState !== "ready" || !mapRef.current || !mapsApi) return;
    if (!selectionBounds) {
      selectionRectRef.current?.setMap(null);
      selectionRectRef.current = null;
      return;
    }

    const bounds = toBounds(selectionBounds);

    if (!selectionRectRef.current) {
      selectionRectRef.current = new mapsApi.Rectangle({
        map: mapRef.current,
        strokeColor: "#8B5CF6",
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: "#8B5CF6",
        fillOpacity: 0.12,
        clickable: false,
        bounds,
      });
      return;
    }

    selectionRectRef.current.setBounds(bounds);
  }, [scriptState, selectionBounds]);

  function relativePointFromEvent(event: React.PointerEvent<HTMLDivElement>): { x: number; y: number } {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function buildSelection(a: { x: number; y: number }, b: { x: number; y: number }): SelectionBounds {
    return {
      left: Math.min(a.x, b.x),
      top: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x),
      height: Math.abs(a.y - b.y),
    };
  }

  function screenPointToGeo(point: { x: number; y: number }): LatLngLiteral | null {
    if (!mapRef.current || !mapContainerRef.current) return null;
    const mapBounds = mapRef.current.getBounds();
    if (!mapBounds) return null;
    const ne = mapBounds.getNorthEast();
    const sw = mapBounds.getSouthWest();
    const xRatio = point.x / 100;
    const yRatio = point.y / 100;
    return {
      lat: ne.lat() - yRatio * (ne.lat() - sw.lat()),
      lng: sw.lng() + xRatio * (ne.lng() - sw.lng()),
    };
  }

  function geoBoundsFromSelection(a: { x: number; y: number }, b: { x: number; y: number }): GeoBounds | null {
    const geoA = screenPointToGeo(a);
    const geoB = screenPointToGeo(b);
    if (!geoA || !geoB) return null;

    return {
      north: Math.max(geoA.lat, geoB.lat),
      south: Math.min(geoA.lat, geoB.lat),
      east: Math.max(geoA.lng, geoB.lng),
      west: Math.min(geoA.lng, geoB.lng),
    };
  }

  function onOverlayPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!traceMode) return;
    const point = relativePointFromEvent(event);
    setDragStart(point);
    setDraftSelection({ left: point.x, top: point.y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onOverlayPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!traceMode || !dragStart) return;
    setDraftSelection(buildSelection(dragStart, relativePointFromEvent(event)));
  }

  function onOverlayPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!traceMode || !dragStart) return;
    const next = geoBoundsFromSelection(dragStart, relativePointFromEvent(event));
    setDragStart(null);
    setDraftSelection(null);
    if (next) {
      onSelectionComplete(next);
    }
  }

  function toggleLayer(layer: MapLayerKey) {
    setVisibleLayers((current) => ({
      ...current,
      [layer]: !current[layer],
    }));
  }

  if (scriptState === "missing-key") {
    return (
      <div className="rounded-lg border border-warning/35 bg-warning/10 p-4 text-sm text-warning">
        Falta la variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para renderizar el mapa.
      </div>
    );
  }

  if (scriptState === "error") {
    return (
      <div className="rounded-lg border border-danger/35 bg-danger/10 p-4 text-sm text-danger">
        No se pudo cargar Google Maps. Revisá la API key, el dominio habilitado y la facturación del proyecto.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface-elevated">
      <div className="relative min-h-[640px]">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {scriptState !== "ready" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-elevated/85">
            <p className="text-sm text-text-muted">Cargando Google Maps...</p>
          </div>
        )}

        <div
          className={cn("absolute inset-0 z-20", traceMode ? "cursor-crosshair" : "pointer-events-none")}
          onPointerDown={onOverlayPointerDown}
          onPointerMove={onOverlayPointerMove}
          onPointerUp={onOverlayPointerUp}
        >
          {draftSelection && (
            <div
              className="absolute rounded-lg border-2 border-dashed border-primary bg-primary/15"
              style={{
                left: `${draftSelection.left}%`,
                top: `${draftSelection.top}%`,
                width: `${draftSelection.width}%`,
                height: `${draftSelection.height}%`,
              }}
            >
              <div className="absolute -top-7 left-0 rounded-md border border-primary/25 bg-surface px-2 py-1 text-[10px] font-medium text-primary-soft">
                Trazando zona
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute left-4 top-4 z-30"
          onMouseEnter={() => setLayerMenuOpen(true)}
          onMouseLeave={() => setLayerMenuOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLayerMenuOpen((current) => !current)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs font-medium text-text-primary shadow-elevated backdrop-blur-sm"
            aria-expanded={layerMenuOpen}
            aria-label="Abrir capas del mapa"
          >
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            Capas del mapa
          </button>

          {layerMenuOpen && (
            <div className="mt-2 w-56 rounded-lg border border-border bg-surface/95 p-3 shadow-elevated backdrop-blur-sm">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                Marcá lo que querés ver
              </div>
              <div className="space-y-2">
                {MAP_LAYER_OPTIONS.map((option) => (
                  <label key={option.key} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 text-xs text-text-secondary hover:text-text-primary">
                    <input
                      type="checkbox"
                      checked={visibleLayers[option.key]}
                      onChange={() => toggleLayer(option.key)}
                      className="h-3.5 w-3.5 rounded border-border bg-surface text-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="absolute bottom-4 right-4 z-30 w-[min(380px,calc(100%-32px))] rounded-lg border border-border bg-surface/95 p-4 shadow-elevated">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
                <p className="text-xs text-text-muted">{selected.channel} · {getDistributorName(selected.distributorId)}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPdv(null)}
                className="text-text-muted hover:text-text-primary"
                aria-label="Cerrar ficha de PDV"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Estado</p>
                <Badge variant={STATUS_BADGE[selected.status]} className="mt-1">{STATUS_LABELS[selected.status]}</Badge>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Facturación</p>
                <p className="mt-1 font-semibold text-text-primary">{formatCurrency(selected.revenue)}</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Volumen</p>
                <p className="mt-1 font-semibold text-text-primary">{formatNumber(selected.volume)} cajas</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Oportunidad</p>
                <p className="mt-1 font-semibold text-accent">{formatCurrency(selected.opportunity)}</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Ticket promedio</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.averageTicket !== undefined ? formatCurrency(selected.averageTicket) : "N/A"}</p>
              </div>
              <div className="rounded-md bg-surface-soft p-2">
                <p className="text-text-muted">Frecuencia</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.visitFrequency ?? "N/A"}</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border border-border p-2">
                <p className="text-text-muted">Mix actual / objetivo</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.mixReal}% / {selected.mixTarget}%</p>
              </div>
              <div className="rounded-md border border-border p-2">
                <p className="text-text-muted">Última compra</p>
                <p className="mt-1 font-semibold text-text-primary">{selected.lastPurchase}</p>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-border p-2 text-xs text-text-secondary">
              SKUs comprados: {selected.skusBought.length > 0 ? selected.skusBought.join(", ") : "sin compra registrada"}
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-30 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface/95 p-2">
          {(["buyer", "potential", "non-buyer"] as SellThroughPdvStatus[]).map((status) => (
            <div key={status} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
              <span className={cn("h-2.5 w-2.5 rounded-full border", STATUS_DOT[status])} />
              {STATUS_LABELS[status]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
