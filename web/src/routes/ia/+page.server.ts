import type { PageServerLoad } from './$types';
import { getModeloActivo } from '#lib/queries/stats';
import type { ModeloIA } from '#lib/domain/types';

const fallbackModelo: ModeloIA = {
  id: 'yolo-v24',
  nombre_version: 'v2.4 YOLOv11-GeoRoad PY',
  activo: true,
  metricas: {
    map50: 94.2,
    map50_prev: 92.4,
    mae_profundidad_cm: 0.4,
    tolerancia_cm: 0.8,
    falsos_positivos_pct: 2.1,
    confianza_media_pct: 91.8,
    confianza_sigma: 0.042,
    latencia_ms: 38,
    fps: 26.3,
    loss: 0.018,
    n_validaciones: 8420,
    matriz_confusion: {
      clases: ['Bache Profundo', 'Fisura Long.', 'Piel Cocodrilo', 'Desprendimiento'],
      valores: [
        [96.8, 1.2, 1.6, 0.4],
        [0.8, 93.4, 4.8, 1.0],
        [1.4, 3.9, 92.6, 2.1],
        [0.5, 2.1, 3.2, 94.2]
      ]
    },
    auc: 0.961,
    umbral_optimo: 0.85,
    precision_semanal: [
      { semana: 'S-03', valor: 90.4 },
      { semana: 'S-04', valor: 91.1 },
      { semana: 'S-05', valor: 91.8 },
      { semana: 'S-06', valor: 92.9 },
      { semana: 'S-07', valor: 93.5 },
      { semana: 'S-08', valor: 94.2 }
    ]
  }
};

export const load: PageServerLoad = async () => {
  const modelo = (await getModeloActivo()) || fallbackModelo;
  return {
    modelo
  };
};
