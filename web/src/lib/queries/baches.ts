import { apiGet, apiPost, apiUpload } from '#lib/api/client';
import type { Bache, EstadoBache, SeveridadVial, PatologiaAsfaltica } from '#lib/domain/types';

export interface FiltrosBaches {
  estado?: EstadoBache | 'todos';
  severidad?: SeveridadVial | 'todas';
  patologia?: PatologiaAsfaltica | 'todas';
  corredor_id?: string;
  distrito?: string;
  min_confianza?: number;
  minConfianza?: number;
  orden?: 'reciente' | 'severidad' | 'confianza_desc' | 'confianza_asc';
  busqueda?: string;
  limit?: number;
  offset?: number;
}

export interface HistorialEstadoBache {
  id: string;
  bache_id: string;
  estado_anterior?: string | null;
  estado_nuevo: string;
  nota?: string | null;
  created_at: string;
  perfil?: {
    id: string;
    nombre: string;
    rol: string;
  } | null;
  [key: string]: unknown;
}

export interface ComentarioBache {
  id: string;
  bache_id: string;
  comentario: string;
  created_at: string;
  perfil?: {
    id: string;
    nombre: string;
    rol: string;
  } | null;
  [key: string]: unknown;
}

/**
 * Consulta la lista paginada y filtrada de baches a través de la API REST de FastAPI.
 */
export async function getBaches(
  filtros: FiltrosBaches = {}
): Promise<{ baches: Bache[]; total: number }> {
  try {
    const params: Record<string, string | number | undefined> = {};

    if (filtros.estado && filtros.estado !== 'todos') {
      params.estado = filtros.estado;
    }

    if (filtros.severidad && filtros.severidad !== 'todas') {
      params.severidad = filtros.severidad;
    }

    if (filtros.patologia && filtros.patologia !== 'todas') {
      params.patologia = filtros.patologia;
    }

    if (filtros.corredor_id) {
      params.corredor_id = filtros.corredor_id;
    }

    const minConfianza = filtros.min_confianza ?? filtros.minConfianza;
    if (minConfianza !== undefined && minConfianza > 0) {
      params.min_confianza = minConfianza;
    }

    if (filtros.orden) {
      params.orden = filtros.orden;
    }

    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      params.busqueda = filtros.busqueda.trim();
    }

    if (filtros.limit !== undefined) {
      params.limit = filtros.limit;
    }

    if (filtros.offset !== undefined) {
      params.offset = filtros.offset;
    }

    const response = await apiGet<{ baches?: Bache[]; items?: Bache[]; total?: number } | Bache[]>(
      '/baches',
      { params }
    );

    if (Array.isArray(response)) {
      return {
        baches: response,
        total: response.length
      };
    }

    const bachesList = response?.baches || response?.items || [];
    const totalCount = response?.total ?? bachesList.length;

    return {
      baches: bachesList,
      total: totalCount
    };
  } catch (error) {
    console.error('Error fetching baches:', error);
    return { baches: [], total: 0 };
  }
}

/**
 * Obtiene el expediente de un bache por su UUID o código alfanumérico.
 */
export async function getBacheById(identifier: string): Promise<Bache | null> {
  if (!identifier) return null;

  try {
    const data = await apiGet<Bache>(`/baches/${encodeURIComponent(identifier)}`);
    return data || null;
  } catch (error) {
    console.error('Error fetching bache by id/codigo:', error);
    return null;
  }
}

/**
 * Obtiene la traza histórica de estados técnicos y peritajes de un bache.
 */
export async function getHistorialBache(bacheId: string): Promise<HistorialEstadoBache[]> {
  if (!bacheId) return [];

  try {
    const data = await apiGet<
      HistorialEstadoBache[] | { historial?: HistorialEstadoBache[]; items?: HistorialEstadoBache[] }
    >(`/baches/${encodeURIComponent(bacheId)}/historial`);

    if (Array.isArray(data)) {
      return data;
    }
    return data?.historial || data?.items || [];
  } catch (error) {
    console.error('Error fetching historial:', error);
    return [];
  }
}

/**
 * Obtiene las notas de campo y comentarios asociados a un bache.
 */
export async function getComentariosBache(bacheId: string): Promise<ComentarioBache[]> {
  if (!bacheId) return [];

  try {
    const data = await apiGet<
      ComentarioBache[] | { comentarios?: ComentarioBache[]; items?: ComentarioBache[] }
    >(`/baches/${encodeURIComponent(bacheId)}/comentarios`);

    if (Array.isArray(data)) {
      return data;
    }
    return data?.comentarios || data?.items || [];
  } catch (error) {
    console.error('Error fetching comentarios:', error);
    return [];
  }
}

/**
 * Sube una fotografía de evidencia vial al servidor FastAPI y retorna su URL pública accesible.
 */
export async function uploadFotoBache(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const data = await apiUpload<{ foto_url?: string; url?: string }>('/baches/upload', formData);
    return data?.foto_url || data?.url || null;
  } catch (error) {
    console.error('Error subiendo foto de bache:', error);
    return null;
  }
}

/**
 * Registra un nuevo reporte vial (ciudadano o peritaje) a través de FastAPI.
 */
export async function crearReporteBache(
  payload: Partial<Bache> & { latitud: number; longitud: number }
): Promise<Bache | null> {
  try {
    const bache = await apiPost<Bache>('/baches', payload);
    return bache || null;
  } catch (error) {
    console.error('Error registrando reporte de bache:', error);
    return null;
  }
}
