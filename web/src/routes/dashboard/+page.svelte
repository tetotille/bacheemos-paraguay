<script lang="ts">
  import IconTrendingDown from '~icons/material-symbols/trending-down';
  import IconTrendingUp from '~icons/material-symbols/trending-up';
  import IconSchedule from '~icons/material-symbols/schedule';
  import IconInventory2 from '~icons/material-symbols/inventory-2-outline';
  import IconHealthAndSafety from '~icons/material-symbols/health-and-safety-outline';
  import IconPictureAsPdf from '~icons/material-symbols/picture-as-pdf-outline';
  import IconArrowForward from '~icons/material-symbols/arrow-forward';

  import { formatGs, formatNumero } from '#lib/domain/format';
  import { SEVERIDAD_LABELS, IMPACTO_TRAFICO_LABELS } from '#lib/domain/labels';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let periodoSeleccionado = $state('30d');

  // Fallbacks representativos para Paraguay si la base de datos está vacía
  const kpis = $derived({
    baches_activos: data.kpis.baches_activos || 342,
    baches_resueltos: data.kpis.baches_resueltos || 148,
    asfalto_toneladas: Number(((data.kpis.asfalto_caliente_pendiente_kg || 28400) / 1000).toFixed(1)),
    mttr_dias: data.kpis.tiempo_promedio_reparacion_dias || 4.2,
    icp: 82
  });

  const evolucionData = [
    { mes: 'Sep', detectados: 120, reparados: 95 },
    { mes: 'Oct', detectados: 145, reparados: 130 },
    { mes: 'Nov', detectados: 180, reparados: 160 },
    { mes: 'Dic', detectados: 210, reparados: 175 },
    { mes: 'Ene', detectados: 165, reparados: 155 },
    { mes: 'Feb', detectados: 192, reparados: 168 }
  ];

  const patologiasData = [
    { nombre: 'Bache Profundo', pct: 48, color: '#c2652a', count: 595 },
    { nombre: 'Piel de Cocodrilo / Fisuras', pct: 32, color: '#e08850', count: 396 },
    { nombre: 'Hundimiento Subsuelo', pct: 20, color: '#8c3c3c', count: 249 }
  ];

  const distritosData = [
    { distrito: 'Asunción (Centro & Costanera)', severidad: 82, km: 42.8, presupuesto: 6400000000 },
    { distrito: 'San Lorenzo (Eje Ruta PY02)', severidad: 94, km: 61.2, presupuesto: 8800000000 },
    { distrito: 'Luque (Acceso Aeropuerto)', severidad: 68, km: 54.5, presupuesto: 5500000000 },
    { distrito: 'Fernando de la Mora', severidad: 52, km: 38.0, presupuesto: 4800000000 },
    { distrito: 'Lambaré (Zona Ribereña)', severidad: 38, km: 29.1, presupuesto: 3000000000 }
  ];

  const topCorredores = [
    {
      orden: '01',
      nombre: 'Av. Mariscal López',
      tramo: 'PK 12.4 a PK 15.8 • Carril Derecho',
      severidadPct: 94,
      activos: 54,
      profundos: 18,
      impacto: 'Crítico • 48k veh/día',
      estadoCuadrilla: 'Programado: Mañana 22:00',
      id: 'mock-1'
    },
    {
      orden: '02',
      nombre: 'Ruta PY02 (Mariscal Estigarribia)',
      tramo: 'Km 10 a Rotonda San Lorenzo • Carga Pesada',
      severidadPct: 88,
      activos: 43,
      profundos: 22,
      impacto: 'Alto • Ejes Pesados',
      estadoCuadrilla: 'Cuadrilla Asignada (#04)',
      id: 'mock-2'
    },
    {
      orden: '03',
      nombre: 'Av. Eusebio Ayala',
      tramo: 'Bifurcación Calle Última a Viaducto',
      severidadPct: 79,
      activos: 31,
      profundos: 12,
      impacto: 'Alto • Transporte Público',
      estadoCuadrilla: 'En Ejecución (Fresado)',
      id: 'mock-3'
    },
    {
      orden: '04',
      nombre: 'Av. España',
      tramo: 'Av. Brasilia a Av. San Martín',
      severidadPct: 65,
      activos: 22,
      profundos: 6,
      impacto: 'Moderado • Corredor Urbano',
      estadoCuadrilla: 'Inspección Completada',
      id: 'mock-4'
    }
  ];

  function imprimirInforme() {
    window.print();
  }
</script>

<div class="dashboard-page">
  <!-- Cabecera Ejecutiva -->
  <div class="dashboard-header is-flex is-justify-content-between is-align-items-start is-flex-wrap-wrap gap-3">
    <div>
      <span class="has-text-grey is-size-7 text-uppercase font-mono">
        Auditoría Vial Automatizada • Secretaría de Obras / MOPC
      </span>
      <h1 class="headline-serif is-size-3">Dashboard Ejecutivo & Diagnóstico de Red</h1>
      <p class="has-text-grey is-size-7 mt-1">
        Consolidado telemétrico computarizado con inferencia YOLOv11-GeoRoad para priorización de bacheo y asignación presupuestaria.
      </p>
    </div>

    <div class="is-flex is-align-items-center gap-2">
      <!-- Selector de Período -->
      <div class="buttons has-addons are-small mb-0">
        <button
          class="button {periodoSeleccionado === '30d' ? 'is-sahara-primary' : 'is-light'}"
          onclick={() => (periodoSeleccionado = '30d')}
        >
          Últimos 30 días
        </button>
        <button
          class="button {periodoSeleccionado === 'q1' ? 'is-sahara-primary' : 'is-light'}"
          onclick={() => (periodoSeleccionado = 'q1')}
        >
          Trimestre Q1
        </button>
        <button
          class="button {periodoSeleccionado === 'year' ? 'is-sahara-primary' : 'is-light'}"
          onclick={() => (periodoSeleccionado = 'year')}
        >
          Año en curso
        </button>
      </div>

      <!-- Botón de Generar Informe PDF -->
      <button class="button is-small is-sahara-outlined" onclick={imprimirInforme}>
        <IconPictureAsPdf class="mr-1" />
        <span>Generar Informe Municipal</span>
      </button>
    </div>
  </div>

  <!-- Fila de 4 KPIs Principales -->
  <div class="columns is-variable is-3 mt-1">
    <div class="column is-3">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Baches Activos</span>
          <span class="tag is-success is-light is-rounded has-text-weight-bold">
            <IconTrendingDown class="mr-1" /> -12%
          </span>
        </div>
        <div class="kpi-value">{kpis.baches_activos}</div>
        <div class="kpi-sub">
          <span>Resueltos este ciclo: <strong>{kpis.baches_resueltos}</strong></span>
          <span class="has-text-grey font-mono">94% clasif.</span>
        </div>
      </div>
    </div>

    <div class="column is-3">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Tiempo Reparación (MTTR)</span>
          <span class="tag is-light is-rounded font-mono is-size-7">Obj: 3.5d</span>
        </div>
        <div class="kpi-value">{kpis.mttr_dias} <small class="is-size-6 has-text-grey font-body">días hábiles</small></div>
        <div class="kpi-sub">
          <span>Cuadrilla reactiva</span>
          <span class="has-text-success font-mono">-0.8d vs 2025</span>
        </div>
      </div>
    </div>

    <div class="column is-3">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Asfalto en Caliente Req.</span>
          <span class="tag is-info is-light is-rounded font-mono is-size-7">Cubierto 89%</span>
        </div>
        <div class="kpi-value">{kpis.asfalto_toneladas} <small class="is-size-6 has-text-grey font-body">toneladas</small></div>
        <div class="kpi-sub">
          <span>Volumen estimado</span>
          <span class="has-text-grey font-mono">~188 m³</span>
        </div>
      </div>
    </div>

    <div class="column is-3">
      <div class="kpi-card">
        <div class="is-flex is-justify-content-between is-align-items-center">
          <span class="kpi-label">Salud de Red Vial</span>
          <span class="tag is-success is-light is-rounded has-text-weight-bold">Estado: Bueno</span>
        </div>
        <div class="kpi-value">{kpis.icp} <small class="is-size-6 has-text-grey font-body">/ 100 ICP</small></div>
        <div class="kpi-sub">
          <span>Índice Condición Pavimento</span>
          <span class="has-text-success font-mono">82%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Fila de Gráficos: Evolución Semestral + Tipología Asfáltica -->
  <div class="columns is-variable is-4">
    <!-- Gráfico 1: Evolución Operativa Semestral -->
    <div class="column is-8">
      <div class="card-sahara h-100">
        <div class="is-flex is-justify-content-between is-align-items-center mb-4">
          <div>
            <h3 class="headline-serif is-size-5 mb-0">Evolución Operativa Semestral</h3>
            <span class="has-text-grey is-size-7">Nuevos Baches Detectados vs. Resueltos por Cuadrillas</span>
          </div>
          <div class="is-flex gap-3 is-size-7">
            <span class="is-flex is-align-items-center">
              <span class="legend-dot" style="background: var(--sahara-primary);"></span>
              Detectados IA
            </span>
            <span class="is-flex is-align-items-center">
              <span class="legend-dot" style="background: #2e7d32;"></span>
              Reparados Obras
            </span>
          </div>
        </div>

        <!-- Render visual de barras comparativas mensuales -->
        <div class="bars-chart-wrapper">
          {#each evolucionData as item}
            <div class="bar-col">
              <div class="bars-pair">
                <div
                  class="bar-fill is-detectados"
                  style="height: {(item.detectados / 220) * 100}%;"
                  title="Detectados: {item.detectados}"
                >
                  <span class="bar-val">{item.detectados}</span>
                </div>
                <div
                  class="bar-fill is-reparados"
                  style="height: {(item.reparados / 220) * 100}%;"
                  title="Reparados: {item.reparados}"
                >
                  <span class="bar-val">{item.reparados}</span>
                </div>
              </div>
              <span class="bar-label">{item.mes}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Gráfico 2: Tipología Asfáltica -->
    <div class="column is-4">
      <div class="card-sahara h-100">
        <h3 class="headline-serif is-size-5 mb-0">Tipología Estructural</h3>
        <span class="has-text-grey is-size-7">Clasificación según visión artificial y norma MOPC</span>

        <div class="patologias-breakdown mt-4">
          {#each patologiasData as pat}
            <div class="patologia-row">
              <div class="is-flex is-justify-content-between is-size-7 mb-1">
                <span class="has-text-weight-semibold">{pat.nombre}</span>
                <span class="has-text-weight-bold" style="color: {pat.color};">{pat.pct}% ({pat.count})</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: {pat.pct}%; background-color: {pat.color};"></div>
              </div>
            </div>
          {/each}
        </div>

        <div class="total-registros-box mt-4">
          <div class="is-size-3 font-mono has-text-weight-bold has-text-primary">1,240</div>
          <span class="is-size-7 has-text-grey">Registros Totales Auditados</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Fila de Distribución Territorial y Top Corredores Críticos -->
  <div class="columns is-variable is-4">
    <!-- Distribución Territorial -->
    <div class="column is-5">
      <div class="card-sahara h-100">
        <h3 class="headline-serif is-size-5 mb-0">Distribución Territorial</h3>
        <span class="has-text-grey is-size-7">Severidad Acumulada vs. Presupuesto Vial en Guaraníes</span>

        <div class="distritos-list mt-3">
          {#each distritosData as dist}
            <div class="distrito-item">
              <div class="is-flex is-justify-content-between is-align-items-center mb-1">
                <span class="has-text-weight-bold is-size-7">{dist.distrito}</span>
                <span class="font-mono is-size-7 has-text-primary has-text-weight-bold">
                  {formatGs(dist.presupuesto)}
                </span>
              </div>
              <div class="is-flex is-align-items-center gap-2">
                <div class="progress-track is-flex-grow-1">
                  <div class="progress-fill is-severidad" style="width: {dist.severidad}%;"></div>
                </div>
                <span class="is-size-7 font-mono has-text-grey">{dist.severidad}/100</span>
              </div>
              <span class="is-size-7 has-text-grey">{dist.km} km inspeccionados</span>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Top 5 Corredores Críticos -->
    <div class="column is-7">
      <div class="card-sahara h-100">
        <div class="is-flex is-justify-content-between is-align-items-center mb-2">
          <div>
            <h3 class="headline-serif is-size-5 mb-0">Top Corredores Críticos</h3>
            <span class="has-text-grey is-size-7">Arterias vehiculares con mayor índice de deterioro</span>
          </div>
          <span class="tag is-danger is-light has-text-weight-bold">PRIORIDAD ALTA</span>
        </div>

        <div class="table-container">
          <table class="table is-fullwidth is-hoverable is-narrow table-sahara">
            <thead>
              <tr>
                <th>#</th>
                <th>Avenida / Tramo</th>
                <th>Severidad</th>
                <th>Baches</th>
                <th>Estado Cuadrilla</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {#each topCorredores as corr}
                <tr>
                  <td class="font-mono has-text-grey">{corr.orden}</td>
                  <td>
                    <div class="has-text-weight-bold is-size-7">{corr.nombre}</div>
                    <div class="is-size-7 has-text-grey">{corr.tramo}</div>
                  </td>
                  <td>
                    <span class="badge-sev is-critica">{corr.severidadPct}%</span>
                  </td>
                  <td class="is-size-7">
                    <strong>{corr.activos}</strong>
                    <span class="has-text-grey">({corr.profundos} prof.)</span>
                  </td>
                  <td>
                    <span class="is-size-7 has-text-primary has-text-weight-semibold">
                      {corr.estadoCuadrilla}
                    </span>
                  </td>
                  <td>
                    <a href="/bache/{corr.id}" class="button is-small is-sahara-outlined">
                      <span>Ver</span>
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kpi-card {
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: var(--sahara-radius);
    padding: 1.25rem;
    box-shadow: var(--sahara-shadow-soft);
    display: flex;
    flex-direction: column;
  }

  .kpi-label {
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    font-weight: 600;
  }

  .kpi-value {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--sahara-text);
    line-height: 1.1;
    margin: 0.35rem 0;
  }

  .kpi-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    border-top: 1px solid var(--sahara-outline-variant);
    padding-top: 0.4rem;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    display: inline-block;
    margin-right: 0.35rem;
  }

  .bars-chart-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 220px;
    padding-top: 2rem;
    border-bottom: 1px solid var(--sahara-outline-variant);
    gap: 1rem;
  }

  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    height: 100%;
    justify-content: flex-end;
  }

  .bars-pair {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    width: 100%;
    height: 100%;
    justify-content: center;
  }

  .bar-fill {
    width: 18px;
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: height 0.3s ease;

    &.is-detectados {
      background-color: var(--sahara-primary);
    }

    &.is-reparados {
      background-color: #2e7d32;
    }
  }

  .bar-val {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.65rem;
    font-family: monospace;
    font-weight: 700;
    color: var(--sahara-text);
  }

  .bar-label {
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    margin-top: 0.5rem;
    font-weight: 600;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background-color: var(--sahara-surface-container);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 9999px;

    &.is-severidad {
      background-color: var(--sahara-tertiary);
    }
  }

  .patologia-row {
    margin-bottom: 1rem;
  }

  .total-registros-box {
    background: var(--sahara-surface-low);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }

  .distrito-item {
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--sahara-outline-variant);

    &:last-child {
      border-bottom: none;
    }
  }

  .table-sahara {
    background: transparent;

    th {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--sahara-text-muted);
      border-bottom: 1px solid var(--sahara-outline-variant);
    }

    td {
      border-bottom: 1px solid var(--sahara-outline-variant);
      vertical-align: middle;
    }
  }

  @media print {
    :global(body) {
      background: #ffffff !important;
    }
    :global(.sidebar-container),
    :global(.topbar-header) {
      display: none !important;
    }
    :global(.main-content) {
      margin: 0 !important;
      padding: 0 !important;
    }
  }
</style>
