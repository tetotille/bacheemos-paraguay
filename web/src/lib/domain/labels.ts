import type { EstadoBache, SeveridadVial, PatologiaAsfaltica, ImpactoTrafico } from './types';

export const ESTADO_LABELS: Record<EstadoBache, { label: string; class: string; step: number; pct: number }> = {
  reportado: { label: 'Reportado', class: 'is-light', step: 1, pct: 15 },
  validado_ia: { label: 'Validado por IA', class: 'is-info is-light', step: 2, pct: 35 },
  asignado: { label: 'Asignado a Cuadrilla', class: 'is-warning is-light', step: 3, pct: 55 },
  en_reparacion: { label: 'En Reparación', class: 'is-link is-light', step: 4, pct: 75 },
  reparado: { label: 'Reparado', class: 'is-success is-light', step: 5, pct: 100 },
  falso_positivo: { label: 'Descartado', class: 'is-danger is-light', step: 0, pct: 0 }
};

export const SEVERIDAD_LABELS: Record<SeveridadVial, { label: string; class: string; color: string; score: number }> = {
  critica: { label: 'Crítico', class: 'is-critica', color: '#8c3c3c', score: 9.5 },
  alta: { label: 'Alto', class: 'is-alta', color: '#c2652a', score: 7.5 },
  media: { label: 'Moderado', class: 'is-media', color: '#e08850', score: 5.0 },
  baja: { label: 'Leve', class: 'is-baja', color: '#9a9088', score: 2.5 }
};

export const PATOLOGIA_LABELS: Record<PatologiaAsfaltica, { label: string; desc: string }> = {
  piel_de_cocodrilo: {
    label: 'Piel de Cocodrilo',
    desc: 'Fatiga estructural en malla interconectada por sobrecarga reiterada'
  },
  bache_profundo: {
    label: 'Bache Profundo',
    desc: 'Desprendimiento total de carpeta con afectación de sub-base granular'
  },
  desgaste_superficial: {
    label: 'Desgaste Superficial',
    desc: 'Pérdida de ligante asfáltico y desprendimiento superficial de árido'
  },
  fisura_longitudinal: {
    label: 'Fisura Longitudinal',
    desc: 'Fisuramiento paralelo al eje vial por fatiga térmica o junta constructiva'
  },
  hundimiento: {
    label: 'Hundimiento Subsuelo',
    desc: 'Deformación plástica descendente por pérdida de capacidad portante'
  }
};

export const IMPACTO_TRAFICO_LABELS: Record<ImpactoTrafico, { label: string; class: string }> = {
  bajo: { label: 'Tráfico Local Bajo', class: 'is-light' },
  moderado: { label: 'Flujo Intermedio', class: 'is-info is-light' },
  alto: { label: 'Alto Tráfico / Colectivos', class: 'is-warning is-light' },
  critico: { label: 'Eje Crítico Carga Pesada', class: 'is-danger is-light' }
};

export function getPrescripcionMezcla(patologia: PatologiaAsfaltica | null, severidad: SeveridadVial | null): string {
  if (severidad === 'critica' || patologia === 'bache_profundo') {
    return 'Concreto asfáltico en caliente (HMA) Tipo CA-2 con ligante modificado SBS + emulsión de imprimación catiónica rápida.';
  }
  if (patologia === 'piel_de_cocodrilo') {
    return 'Fresado superficial en frío (4 cm) + riego de liga superestable + mezcla asfáltica densa de reposición.';
  }
  if (patologia === 'fisura_longitudinal') {
    return 'Limpieza con aire comprimido caliente + sellador elastomérico polimerizado de alta elongación.';
  }
  if (patologia === 'hundimiento') {
    return 'Excavación perimetral, recompactación de sub-base granular CBR > 80% y carpeta asfáltica en dos capas compactadas.';
  }
  return 'Mezcla asfáltica en frío para bacheo reactivo de emergencia + sellado perimetral asfáltico.';
}
