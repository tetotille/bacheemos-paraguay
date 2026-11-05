// Centro por defecto: Asunción, Paraguay
export const ASUNCION_CENTER = {
  lat: -25.2867,
  lng: -57.6359,
  zoom: 13
};

// Límites para navegación en Gran Asunción / Paraguay
export const PARAGUAY_BOUNDS: [[number, number], [number, number]] = [
  [-62.64, -27.60], // Suroeste
  [-54.25, -19.29]  // Noreste
];

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function wazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

export function exportToGeoJSON(baches: Array<{
  id: string;
  codigo?: string | null;
  latitud: number;
  longitud: number;
  direccion?: string | null;
  severidad?: string | null;
  estado?: string | null;
  profundidad_cm?: number | null;
  area_m2?: number | null;
}>): string {
  const featureCollection = {
    type: 'FeatureCollection',
    features: baches.map((b) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [b.longitud, b.latitud]
      },
      properties: {
        id: b.id,
        codigo: b.codigo,
        direccion: b.direccion,
        severidad: b.severidad,
        estado: b.estado,
        profundidad_cm: b.profundidad_cm,
        area_m2: b.area_m2
      }
    }))
  };

  return JSON.stringify(featureCollection, null, 2);
}
