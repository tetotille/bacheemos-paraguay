import { apiGet } from '#lib/api/client';
import type {
  EstadisticasRedVial,
  TopCorredorCritico,
  EstadisticaPatologia,
  ModeloIA
} from '#lib/domain/types';

const fallbackKpis: EstadisticasRedVial = {
  baches_activos: 0,
  baches_resueltos: 0,
  asfalto_caliente_pendiente_kg: 0,
  tiempo_promedio_reparacion_dias: 3.5,
  criticos_activos: 0,
  altos_activos: 0
};

/**
 * Obtiene los indicadores clave de rendimiento (KPIs) de la red vial metropolitana.
 */
export async function getKpis(): Promise<EstadisticasRedVial> {
  try {
    const data = await apiGet<EstadisticasRedVial>('/stats/kpis');
    return data || fallbackKpis;
  } catch (error) {
    console.error('Error fetching KPIs viales:', error);
    return fallbackKpis;
  }
}

/**
 * Obtiene el ranking de corredores con mayor concentración de criticidad vial.
 */
export async function getTopCorredores(): Promise<TopCorredorCritico[]> {
  try {
    const data = await apiGet<TopCorredorCritico[] | { corredores?: TopCorredorCritico[]; items?: TopCorredorCritico[] }>(
      '/stats/corredores'
    );
    if (Array.isArray(data)) {
      return data;
    }
    return data?.corredores || data?.items || [];
  } catch (error) {
    console.error('Error fetching top corredores:', error);
    return [];
  }
}

/**
 * Obtiene la distribución porcentual y cuantitativa por tipología de patología vial.
 */
export async function getPatologiasStats(): Promise<EstadisticaPatologia[]> {
  try {
    const data = await apiGet<
      EstadisticaPatologia[] | { patologias?: EstadisticaPatologia[]; items?: EstadisticaPatologia[] }
    >('/stats/patologias');

    if (Array.isArray(data)) {
      return data;
    }
    return data?.patologias || data?.items || [];
  } catch (error) {
    console.error('Error fetching estadísticas de patologías:', error);
    return [];
  }
}

/**
 * Obtiene las métricas y metadatos del modelo de visión artificial actualmente desplegado.
 */
export async function getModeloActivo(): Promise<ModeloIA | null> {
  try {
    const data = await apiGet<ModeloIA>('/stats/modelo-activo');
    return data || null;
  } catch (error) {
    console.error('Error fetching modelo activo:', error);
    return null;
  }
}
