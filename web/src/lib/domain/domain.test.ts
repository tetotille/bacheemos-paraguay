import { describe, it, expect } from 'vitest';
import {
  calcularVolumenM3,
  calcularAsfaltoKg,
  formatGs,
  formatNumero
} from './format';
import {
  ESTADO_LABELS,
  SEVERIDAD_LABELS,
  PATOLOGIA_LABELS,
  getPrescripcionMezcla
} from './labels';
import { exportToGeoJSON, googleMapsUrl, wazeUrl } from './geo';

describe('Cálculos Físicos y Métricas Viales', () => {
  it('calcula volumen m³ con fórmula del diseño (0.74m² * 8.5cm = 0.063m³)', () => {
    const areaM2 = 0.74;
    const profundidadCm = 8.5;
    const volumen = calcularVolumenM3(areaM2, profundidadCm);
    expect(volumen).toBe(0.063);
  });

  it('calcula masa de mezcla asfáltica a densidad 2400 kg/m³ (~151 kg)', () => {
    const volumenM3 = 0.063;
    const asfaltoKg = calcularAsfaltoKg(volumenM3, 2400);
    expect(asfaltoKg).toBe(151);
  });

  it('formatea montos en Guaraníes (PYG / Gs.)', () => {
    const presupuesto = 8500000000;
    const formateado = formatGs(presupuesto);
    expect(formateado).toContain('Gs.');
    expect(formateado).toMatch(/8\.500\.000\.000|8,500,000,000/);
  });
});

describe('Reglas de Prescripción Técnica Vial', () => {
  it('prescribe Concreto en Caliente CA-2 SBS para baches críticos o profundos', () => {
    const prescripcion = getPrescripcionMezcla('bache_profundo', 'critica');
    expect(prescripcion).toContain('Concreto asfáltico en caliente (HMA)');
    expect(prescripcion).toContain('SBS');
  });

  it('prescribe fresado y reposición para piel de cocodrilo', () => {
    const prescripcion = getPrescripcionMezcla('piel_de_cocodrilo', 'media');
    expect(prescripcion).toContain('Fresado superficial en frío');
  });

  it('prescribe sellado elastomérico para fisura longitudinal', () => {
    const prescripcion = getPrescripcionMezcla('fisura_longitudinal', 'baja');
    expect(prescripcion).toContain('sellador elastomérico');
  });

  it('prescribe excavación y sub-base para hundimientos', () => {
    const prescripcion = getPrescripcionMezcla('hundimiento', 'alta');
    expect(prescripcion).toContain('sub-base granular CBR > 80%');
  });
});

describe('Mapeo de Estados y Severidades', () => {
  it('mapea falso_positivo al label Descartado', () => {
    expect(ESTADO_LABELS.falso_positivo.label).toBe('Descartado');
  });

  it('mapea severidad critica al color warm dusty rose', () => {
    expect(SEVERIDAD_LABELS.critica.color).toBe('#8c3c3c');
    expect(SEVERIDAD_LABELS.critica.score).toBe(9.5);
  });
});

describe('Exportación Geoespacial', () => {
  it('genera GeoJSON válido con coordenadas de Paraguay', () => {
    const mockBaches = [
      {
        id: 'test-1',
        codigo: 'BCH-2026-0001',
        latitud: -25.2895,
        longitud: -57.6012,
        direccion: 'Av. Mariscal López',
        severidad: 'critica',
        estado: 'reportado',
        profundidad_cm: 10,
        area_m2: 0.5
      }
    ];

    const geojsonStr = exportToGeoJSON(mockBaches);
    const parsed = JSON.parse(geojsonStr);

    expect(parsed.type).toBe('FeatureCollection');
    expect(parsed.features).toHaveLength(1);
    expect(parsed.features[0].geometry.type).toBe('Point');
    expect(parsed.features[0].geometry.coordinates).toEqual([-57.6012, -25.2895]);
    expect(parsed.features[0].properties.codigo).toBe('BCH-2026-0001');
  });

  it('genera enlaces directos a Google Maps y Waze', () => {
    const gmaps = googleMapsUrl(-25.2895, -57.6012);
    expect(gmaps).toContain('https://www.google.com/maps/search/?api=1&query=-25.2895,-57.6012');

    const waze = wazeUrl(-25.2895, -57.6012);
    expect(waze).toContain('https://waze.com/ul?ll=-25.2895,-57.6012&navigate=yes');
  });
});
