export type MapPlaceCategory = "business" | "transit" | "government" | "medical" | "worship" | "school";

export type MapPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: MapPlaceCategory;
};

export const MAP_PLACE_CATEGORY_LABELS: Record<MapPlaceCategory, string> = {
  business: "Negocio",
  transit: "Transito",
  government: "Gobierno",
  medical: "Salud",
  worship: "Culto",
  school: "Escuela",
};

export const MOCK_MAP_PLACES: MapPlace[] = [
  {
    id: "map-place-business-001",
    name: "Alto Palermo",
    address: "Av. Santa Fe 3253, Palermo",
    lat: -34.5883,
    lng: -58.4107,
    category: "business",
  },
  {
    id: "map-place-business-002",
    name: "Distrito Arcos",
    address: "Paraguay 4979, Palermo",
    lat: -34.5786,
    lng: -58.4333,
    category: "business",
  },
  {
    id: "map-place-business-003",
    name: "La Cabrera",
    address: "Jose A. Cabrera 5099, Palermo",
    lat: -34.5896,
    lng: -58.4308,
    category: "business",
  },
  {
    id: "map-place-business-004",
    name: "Mercado de Caballito",
    address: "Rojas 18, Caballito",
    lat: -34.6187,
    lng: -58.4415,
    category: "business",
  },
  {
    id: "map-place-transit-001",
    name: "Estacion Palermo",
    address: "Av. Santa Fe y Juan B. Justo",
    lat: -34.5787,
    lng: -58.4264,
    category: "transit",
  },
  {
    id: "map-place-transit-002",
    name: "Subte Scalabrini Ortiz",
    address: "Av. Santa Fe 3400, Palermo",
    lat: -34.5852,
    lng: -58.4105,
    category: "transit",
  },
  {
    id: "map-place-transit-003",
    name: "Subte Pueyrredon",
    address: "Av. Santa Fe y Pueyrredon",
    lat: -34.5942,
    lng: -58.4021,
    category: "transit",
  },
  {
    id: "map-place-transit-004",
    name: "Subte Primera Junta",
    address: "Av. Rivadavia y Rojas",
    lat: -34.6203,
    lng: -58.4418,
    category: "transit",
  },
  {
    id: "map-place-government-001",
    name: "Comuna 14",
    address: "Beruti 3325, Palermo",
    lat: -34.5888,
    lng: -58.4126,
    category: "government",
  },
  {
    id: "map-place-government-002",
    name: "Comuna 2",
    address: "J. E. Uriburu 1022, Recoleta",
    lat: -34.5968,
    lng: -58.3991,
    category: "government",
  },
  {
    id: "map-place-government-003",
    name: "Comuna 6",
    address: "Av. Patricias Argentinas 277, Caballito",
    lat: -34.6093,
    lng: -58.4341,
    category: "government",
  },
  {
    id: "map-place-medical-001",
    name: "Hospital Fernandez",
    address: "Av. Cervino 3356, Palermo",
    lat: -34.5819,
    lng: -58.4076,
    category: "medical",
  },
  {
    id: "map-place-medical-002",
    name: "Hospital Aleman",
    address: "Av. Pueyrredon 1640, Recoleta",
    lat: -34.5925,
    lng: -58.4005,
    category: "medical",
  },
  {
    id: "map-place-medical-003",
    name: "Sanatorio Guemes",
    address: "Francisco Acuna de Figueroa 1240, Palermo",
    lat: -34.5973,
    lng: -58.4206,
    category: "medical",
  },
  {
    id: "map-place-worship-001",
    name: "Parroquia Guadalupe",
    address: "Mansilla 3865, Palermo",
    lat: -34.5925,
    lng: -58.4182,
    category: "worship",
  },
  {
    id: "map-place-worship-002",
    name: "Basilica Nuestra Senora del Pilar",
    address: "Junin 1898, Recoleta",
    lat: -34.5883,
    lng: -58.3923,
    category: "worship",
  },
  {
    id: "map-place-worship-003",
    name: "Parroquia Santa Julia",
    address: "Av. Juan B. Alberdi 1195, Caballito",
    lat: -34.6252,
    lng: -58.4411,
    category: "worship",
  },
  {
    id: "map-place-school-001",
    name: "Universidad de Palermo",
    address: "Mario Bravo 1050, Palermo",
    lat: -34.5944,
    lng: -58.4215,
    category: "school",
  },
  {
    id: "map-place-school-002",
    name: "Facultad de Medicina UBA",
    address: "Paraguay 2155, Recoleta",
    lat: -34.5997,
    lng: -58.3974,
    category: "school",
  },
  {
    id: "map-place-school-003",
    name: "Colegio Marianista",
    address: "Yerbal 1650, Caballito",
    lat: -34.6226,
    lng: -58.4414,
    category: "school",
  },
];
