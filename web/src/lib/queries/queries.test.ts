import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiClient from '#lib/api/client';
import {
  getBaches,
  getBacheById,
  getHistorialBache,
  getComentariosBache,
  uploadFotoBache,
  crearReporteBache
} from './baches';
import {
  getKpis,
  getTopCorredores,
  getPatologiasStats,
  getModeloActivo
} from './stats';
import type { Bache } from '#lib/domain/types';

describe('Queries de Baches (FastAPI)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getBaches retorna lista y total ante respuesta exitosa', async () => {
    const mockBache: Bache = {
      id: 'bch-1',
      latitud: -25.28,
      longitud: -57.60,
      direccion: 'Av. Mariscal López',
      profundidad_cm: 10,
      area_m2: 0.5,
      estado: 'reportado',
      severidad: 'critica',
      patologia: 'bache_profundo',
      fecha_reporte: new Date().toISOString()
    };

    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      baches: [mockBache],
      total: 1
    });

    const res = await getBaches({ estado: 'reportado', severidad: 'critica' });
    expect(res.baches).toHaveLength(1);
    expect(res.total).toBe(1);
    expect(res.baches[0].id).toBe('bch-1');
  });

  it('getBaches maneja respuestas que devuelven array directamente', async () => {
    const mockBache: Bache = {
      id: 'bch-2',
      latitud: -25.29,
      longitud: -57.61,
      direccion: 'Av. Eusebio Ayala',
      profundidad_cm: 6,
      area_m2: 0.3,
      estado: 'asignado',
      severidad: 'alta',
      patologia: 'desgaste_superficial',
      fecha_reporte: new Date().toISOString()
    };

    vi.spyOn(apiClient, 'apiGet').mockResolvedValue([mockBache]);

    const res = await getBaches();
    expect(res.baches).toHaveLength(1);
    expect(res.total).toBe(1);
  });

  it('getBaches captura errores de red y retorna { baches: [], total: 0 }', async () => {
    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('Backend offline'));

    const res = await getBaches();
    expect(res.baches).toEqual([]);
    expect(res.total).toBe(0);
  });

  it('getBacheById retorna bache o null en caso de fallo', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      id: 'bch-99',
      codigo: 'BCH-2026-0099'
    });

    const bache = await getBacheById('BCH-2026-0099');
    expect(bache?.id).toBe('bch-99');

    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('404 Not Found'));
    const fallo = await getBacheById('invalido');
    expect(fallo).toBeNull();
  });

  it('getHistorialBache y getComentariosBache retornan array o vacio', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue([{ id: 'h-1', estado_nuevo: 'reparado' }]);
    const hist = await getHistorialBache('bch-1');
    expect(hist).toHaveLength(1);

    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('Error'));
    const comentarios = await getComentariosBache('bch-1');
    expect(comentarios).toEqual([]);
  });

  it('uploadFotoBache envía archivo y retorna URL o null', async () => {
    vi.spyOn(apiClient, 'apiUpload').mockResolvedValue({
      foto_url: 'https://images.bacheemos.py/bache.jpg'
    });

    const file = new File(['dummy content'], 'foto.jpg', { type: 'image/jpeg' });
    const url = await uploadFotoBache(file);
    expect(url).toBe('https://images.bacheemos.py/bache.jpg');

    vi.spyOn(apiClient, 'apiUpload').mockRejectedValue(new Error('Upload failed'));
    const fallido = await uploadFotoBache(file);
    expect(fallido).toBeNull();
  });

  it('crearReporteBache crea el bache o retorna null en caso de error', async () => {
    vi.spyOn(apiClient, 'apiPost').mockResolvedValue({
      id: 'bch-nuevo',
      codigo: 'BCH-2026-9999',
      latitud: -25.28,
      longitud: -57.60
    });

    const res = await crearReporteBache({
      codigo: 'BCH-2026-9999',
      latitud: -25.28,
      longitud: -57.60
    });
    expect(res?.codigo).toBe('BCH-2026-9999');

    vi.spyOn(apiClient, 'apiPost').mockRejectedValue(new Error('Error red'));
    const resFallido = await crearReporteBache({ latitud: 0, longitud: 0 });
    expect(resFallido).toBeNull();
  });
});

describe('Queries de Estadísticas (FastAPI)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getKpis retorna datos o fallback ante error', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      baches_activos: 42,
      baches_resueltos: 15,
      asfalto_caliente_pendiente_kg: 5000,
      tiempo_promedio_reparacion_dias: 2.1,
      criticos_activos: 8,
      altos_activos: 12
    });

    const kpis = await getKpis();
    expect(kpis.baches_activos).toBe(42);

    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('Error'));
    const fallback = await getKpis();
    expect(fallback.baches_activos).toBe(0);
    expect(fallback.tiempo_promedio_reparacion_dias).toBe(3.5);
  });

  it('getTopCorredores y getPatologiasStats retornan listas o vacio', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue([{ corredor_id: 'c-1', nombre: 'Av. Mcal López' }]);
    const corredores = await getTopCorredores();
    expect(corredores).toHaveLength(1);

    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('Fallo'));
    const patologias = await getPatologiasStats();
    expect(patologias).toEqual([]);
  });

  it('getModeloActivo retorna el modelo o null', async () => {
    vi.spyOn(apiClient, 'apiGet').mockResolvedValue({
      id: 'yolo-v24',
      nombre_version: 'v2.4 YOLOv11-GeoRoad PY',
      activo: true
    });

    const modelo = await getModeloActivo();
    expect(modelo?.nombre_version).toBe('v2.4 YOLOv11-GeoRoad PY');

    vi.spyOn(apiClient, 'apiGet').mockRejectedValue(new Error('Fallo'));
    const modeloFallido = await getModeloActivo();
    expect(modeloFallido).toBeNull();
  });
});
