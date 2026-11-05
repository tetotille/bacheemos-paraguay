export type EstadoBache =
  | 'reportado'
  | 'validado_ia'
  | 'asignado'
  | 'en_reparacion'
  | 'reparado'
  | 'falso_positivo';

export type SeveridadVial = 'baja' | 'media' | 'alta' | 'critica';

export type PatologiaAsfaltica =
  | 'piel_de_cocodrilo'
  | 'bache_profundo'
  | 'desgaste_superficial'
  | 'fisura_longitudinal'
  | 'hundimiento';

export type ImpactoTrafico = 'bajo' | 'moderado' | 'alto' | 'critico';

export type RolUsuario = 'ciudadano' | 'inspector' | 'cuadrilla' | 'admin';

export interface Perfil {
  id: string;
  nombre: string;
  rol: RolUsuario;
}

export interface MetricasIA {
  map50?: number;
  map50_prev?: number;
  mae_profundidad_cm?: number;
  tolerancia_cm?: number;
  falsos_positivos_pct?: number;
  confianza_media_pct?: number;
  confianza_sigma?: number;
  latencia_ms?: number;
  fps?: number;
  loss?: number;
  n_validaciones?: number;
  matriz_confusion?: {
    clases: string[];
    valores: number[][];
  };
  curva_pr?: Array<{ recall: number; precision: number }>;
  auc?: number;
  umbral_optimo?: number;
  precision_semanal?: Array<{ semana: string; valor: number }>;
}

export interface ModeloIA {
  id: string;
  nombre_version: string;
  metricas: MetricasIA;
  activo: boolean;
  created_at?: string;
}

export interface Corredor {
  id: string;
  nombre: string;
  impacto_trafico: ImpactoTrafico;
  presupuesto_asignado: number;
  presupuesto_ejecutado: number;
}

export interface Cuadrilla {
  id: string;
  nombre: string;
  estado: string;
  corredor_actual_id?: string | null;
}

export interface Bache {
  id: string;
  codigo?: string | null;
  reportado_por?: string | null;
  corredor_id?: string | null;
  cuadrilla_id?: string | null;
  modelo_ia_id?: string | null;

  latitud: number;
  longitud: number;
  direccion: string | null;

  foto_url?: string | null;
  overlay_ia_url?: string | null;

  profundidad_cm: number | null;
  area_m2: number | null;
  volumen_m3?: number | null;
  asfalto_requerido_kg?: number | null;

  estado: EstadoBache;
  severidad: SeveridadVial | null;
  patologia: PatologiaAsfaltica | null;
  diagnostico_ia?: string | null;
  confianza_ia_pct?: number | null;

  sensor_movil?: string | null;
  iluminacion_ambiental?: string | null;
  telemetria_captura?: Record<string, unknown> | null;

  fecha_reporte: string;
  fecha_reparacion?: string | null;

  // Relaciones pobladas
  corredor?: Corredor | null;
  cuadrilla?: Cuadrilla | null;
  modelo_ia?: ModeloIA | null;
}

export interface EstadisticasRedVial {
  baches_activos: number;
  baches_resueltos: number;
  asfalto_caliente_pendiente_kg: number | null;
  tiempo_promedio_reparacion_dias: number | null;
  criticos_activos: number;
  altos_activos: number;
}

export interface TopCorredorCritico {
  corredor_id: string;
  nombre: string;
  impacto_trafico: ImpactoTrafico;
  total_baches_activos: number;
  severidad_acumulada: number;
  asfalto_necesario_kg: number;
  presupuesto_asignado: number;
  presupuesto_ejecutado: number;
}

export interface EstadisticaPatologia {
  patologia: PatologiaAsfaltica;
  cantidad: number;
  area_total_m2: number;
}
