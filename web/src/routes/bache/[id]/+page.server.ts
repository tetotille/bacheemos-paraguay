import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBacheById, getHistorialBache, getComentariosBache } from '#lib/queries/baches';
import type { Bache } from '#lib/domain/types';

// Mock representativo para demostración si el id no existe en base de datos
const mockBache: Bache = {
  id: 'bch-demo',
  codigo: 'BCH-2026-0981',
  latitud: -25.2895,
  longitud: -57.6012,
  direccion: 'Av. Mariscal López #1420 esq. San Martín',
  profundidad_cm: 11.4,
  area_m2: 0.85,
  volumen_m3: 0.097,
  asfalto_requerido_kg: 232,
  estado: 'asignado',
  severidad: 'critica',
  patologia: 'bache_profundo',
  diagnostico_ia: 'Bache profundo con fractura perimetral en piel de cocodrilo severa. Alto impacto para tren delantero.',
  confianza_ia_pct: 98.4,
  sensor_movil: 'Móvil Patrol-04 (LiDAR v2)',
  foto_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
  fecha_reporte: new Date(Date.now() - 1000 * 60 * 45).toISOString()
};

export const load: PageServerLoad = async ({ params }) => {
  const bache = (await getBacheById(params.id)) || { ...mockBache, id: params.id };
  const historial = await getHistorialBache(params.id);
  const comentarios = await getComentariosBache(params.id);

  return {
    bache,
    historial,
    comentarios
  };
};
