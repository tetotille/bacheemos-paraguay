<script lang="ts">
  import { MapLibre, Marker } from 'svelte-maplibre';
  import 'maplibre-gl/dist/maplibre-gl.css';

  import IconArrowBack from '~icons/material-symbols/arrow-back';
  import IconNavigation from '~icons/material-symbols/navigation-outline';
  import IconNearMe from '~icons/material-symbols/near-me-outline';
  import IconConstruction from '~icons/material-symbols/construction';
  import IconMinorCrash from '~icons/material-symbols/minor-crash';
  import IconStraighten from '~icons/material-symbols/straighten';
  import IconViewInAr from '~icons/material-symbols/view-in-ar';
  import IconCropFree from '~icons/material-symbols/crop-free';
  import IconVerticalAlignBottom from '~icons/material-symbols/vertical-align-bottom';
  import IconVerified from '~icons/material-symbols/verified';
  import IconCheckCircle from '~icons/material-symbols/check-circle-outline';
  import IconFileDownload from '~icons/material-symbols/download';

  import { PUBLIC_MAP_STYLE_URL } from '#lib/env';
  import { SEVERIDAD_LABELS, ESTADO_LABELS, PATOLOGIA_LABELS, getPrescripcionMezcla } from '#lib/domain/labels';
  import { googleMapsUrl, wazeUrl, exportToGeoJSON } from '#lib/domain/geo';
  import { formatFechaCompleta, formatNumero } from '#lib/domain/format';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let bache = $derived(data.bache);
  let sev = $derived(bache.severidad || 'media');
  let pat = $derived(bache.patologia || 'bache_profundo');
  let est = $derived(bache.estado || 'reportado');

  let mostrarOverlay = $state(true);

  const pasosFlujo = [
    { key: 'reportado', label: 'Reportado por Sensor Móvil', desc: 'Captura telemática con georreferenciación' },
    { key: 'validado_ia', label: 'Validación de IA Completada', desc: 'Falso positivo descartado. Confianza >90%' },
    { key: 'asignado', label: 'Asignado a Cuadrilla Técnica', desc: 'Prescripción de mezcla programada en orden' },
    { key: 'en_reparacion', label: 'En Ejecución de Obra', desc: 'Fresado, imprimación y colocación de HMA' },
    { key: 'reparado', label: 'Bacheo Verificado y Resuelto', desc: 'Carpeta rehabilitada según norma MOPC' }
  ];

  let pasoActual = $derived(ESTADO_LABELS[est]?.step || 1);

  function exportarFichaGeoJSON() {
    const geo = exportToGeoJSON([bache]);
    const blob = new Blob([geo], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha-${bache.codigo || bache.id}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="expediente-page">
  <!-- Cabecera de Navegación -->
  <div class="expediente-topbar">
    <div class="is-flex is-align-items-center gap-3">
      <a href="/galeria" class="button is-small is-light">
        <IconArrowBack class="mr-1" />
        <span>Volver a Galería</span>
      </a>
      <div>
        <h1 class="headline-serif is-size-4 mb-0">
          Expediente: {bache.codigo || 'BCH-2026-0981'}
        </h1>
        <span class="has-text-grey is-size-7">
          {bache.direccion || 'Ubicación Vial'} • Registrado el {formatFechaCompleta(bache.fecha_reporte)}
        </span>
      </div>
    </div>

    <div class="is-flex is-align-items-center gap-2">
      <span class="badge-sev {SEVERIDAD_LABELS[sev].class}">
        {SEVERIDAD_LABELS[sev].label}
      </span>
      <span class="tag {ESTADO_LABELS[est].class} is-rounded has-text-weight-bold">
        {ESTADO_LABELS[est].label}
      </span>
    </div>
  </div>

  <!-- Contenido en dos columnas estilo Sahara -->
  <div class="columns is-variable is-4 mt-2">
    <!-- Columna Izquierda: Imagen Fotogramétrica, Mini Mapa y Deep Links -->
    <div class="column is-7">
      <!-- Tarjeta Fotográfica con Toggle IA -->
      <div class="card-sahara p-0 overflow-hidden mb-4">
        <div class="image-viewer-header">
          <span class="has-text-weight-semibold is-size-7">Captura Fotogramétrica de Campo</span>
          <div class="is-flex is-align-items-center gap-2">
            {#if bache.confianza_ia_pct}
              <span class="ia-pill">
                <IconVerified class="mr-1" />
                {bache.confianza_ia_pct}% Confianza IA
              </span>
            {/if}
            <button
              class="button is-small {mostrarOverlay ? 'is-sahara-primary' : 'is-light'}"
              onclick={() => (mostrarOverlay = !mostrarOverlay)}
            >
              Overlay IA
            </button>
          </div>
        </div>

        <div class="image-canvas-container">
          <img
            src={bache.foto_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80'}
            alt="Evidencia fotográfica"
            class="evidence-image"
          />
          {#if mostrarOverlay}
            <div class="ai-bounding-overlay">
              <span class="ai-box-label">
                {PATOLOGIA_LABELS[pat]?.label} • {bache.confianza_ia_pct}%
              </span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Mini Mapa y Geoposicionamiento RTK -->
      <div class="card-sahara">
        <div class="is-flex is-justify-content-between is-align-items-center mb-3">
          <div>
            <h3 class="headline-serif is-size-5 mb-0">Geoposicionamiento RTK</h3>
            <span class="has-text-grey is-size-7">
              Lat: {bache.latitud.toFixed(6)} • Lng: {bache.longitud.toFixed(6)}
            </span>
          </div>
          <span class="tag is-success is-light is-rounded has-text-weight-bold">GPS ±0.3m</span>
        </div>

        <div class="mini-map-box">
          <MapLibre
            style={PUBLIC_MAP_STYLE_URL}
            class="mini-map-instance"
            center={[bache.longitud, bache.latitud]}
            zoom={15}
            interactive={false}
          >
            <Marker lngLat={[bache.longitud, bache.latitud]} />
          </MapLibre>
        </div>

        <!-- Enlaces a Navegadores Viales -->
        <div class="is-flex gap-2 mt-3 is-flex-wrap-wrap">
          <a
            href={googleMapsUrl(bache.latitud, bache.longitud)}
            target="_blank"
            rel="noopener noreferrer"
            class="button is-small is-sahara-outlined is-flex-grow-1"
          >
            <IconNavigation class="mr-1" />
            <span>Google Maps</span>
          </a>

          <a
            href={wazeUrl(bache.latitud, bache.longitud)}
            target="_blank"
            rel="noopener noreferrer"
            class="button is-small is-sahara-outlined is-flex-grow-1"
          >
            <IconNearMe class="mr-1" />
            <span>Waze</span>
          </a>

          <button class="button is-small is-light" onclick={exportarFichaGeoJSON}>
            <IconFileDownload class="mr-1" />
            <span>GeoJSON</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Columna Derecha: Métricas Físicas, Prescripción y Timeline -->
    <div class="column is-5">
      <!-- Tarjeta de Cálculo de Volumen & Material -->
      <div class="card-sahara mb-4">
        <div class="is-flex is-justify-content-between is-align-items-center mb-3">
          <h3 class="headline-serif is-size-5 mb-0">Cálculo de Volumen & Material</h3>
          <span class="tag is-danger is-light has-text-weight-bold">ALTO IMPACTO</span>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="m-icon-wrapper">
              <IconVerticalAlignBottom />
            </div>
            <div class="m-content">
              <span class="m-title">Profundidad</span>
              <span class="m-number">{bache.profundidad_cm || 0} <small>cm máx</small></span>
            </div>
          </div>

          <div class="metric-card">
            <div class="m-icon-wrapper">
              <IconCropFree />
            </div>
            <div class="m-content">
              <span class="m-title">Área Dañada</span>
              <span class="m-number">{bache.area_m2 || 0} <small>m²</small></span>
            </div>
          </div>

          <div class="metric-card">
            <div class="m-icon-wrapper">
              <IconViewInAr />
            </div>
            <div class="m-content">
              <span class="m-title">Volumen Relleno</span>
              <span class="m-number">{bache.volumen_m3 || 0} <small>m³</small></span>
              <span class="m-sub">~{bache.asfalto_requerido_kg || 0} kg mezcla</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="m-icon-wrapper">
              <IconMinorCrash />
            </div>
            <div class="m-content">
              <span class="m-title">Severidad Vial</span>
              <span class="m-number">{SEVERIDAD_LABELS[sev].score} <small>/ 10</small></span>
              <span class="m-sub">Riesgo rotura eje</span>
            </div>
          </div>
        </div>

        <!-- Prescripción Técnica Recomendada -->
        <div class="prescription-box mt-4">
          <div class="is-flex is-align-items-center gap-2 mb-1 has-text-weight-bold is-size-7 has-text-primary">
            <IconConstruction />
            <span>Prescripción de Mezcla Recomendada:</span>
          </div>
          <p class="is-size-7 has-text-grey-dark">
            {getPrescripcionMezcla(bache.patologia, bache.severidad)}
          </p>
        </div>
      </div>

      <!-- Progreso del Expediente (Timeline de 5 fases) -->
      <div class="card-sahara">
        <div class="is-flex is-justify-content-between is-align-items-center mb-3">
          <h3 class="headline-serif is-size-5 mb-0">Progreso del Expediente</h3>
          <span class="tag is-sahara-primary is-light has-text-weight-bold">
            Fase {pasoActual} de 5
          </span>
        </div>

        <div class="timeline-stepper">
          {#each pasosFlujo as paso, index}
            {@const num = index + 1}
            {@const isDone = num < pasoActual}
            {@const isCurrent = num === pasoActual}

            <div class="timeline-step" class:is-done={isDone} class:is-current={isCurrent}>
              <div class="step-indicator">
                {#if isDone}
                  <IconCheckCircle class="step-check" />
                {:else}
                  <span class="step-num">{num}</span>
                {/if}
              </div>
              <div class="step-content">
                <span class="step-title">{paso.label}</span>
                <span class="step-desc">{paso.desc}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .expediente-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .expediente-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--sahara-outline-variant);
  }

  .image-viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--sahara-surface-low);
    border-bottom: 1px solid var(--sahara-outline-variant);
  }

  .ia-pill {
    background: var(--sahara-primary-light);
    color: var(--sahara-primary);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
  }

  .image-canvas-container {
    position: relative;
    width: 100%;
    height: 380px;
    background-color: var(--sahara-surface-container);
  }

  .evidence-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ai-bounding-overlay {
    position: absolute;
    top: 25%;
    left: 20%;
    width: 55%;
    height: 50%;
    border: 2px dashed var(--sahara-primary);
    background: rgba(194, 101, 42, 0.15);
    border-radius: 8px;
    pointer-events: none;
  }

  .ai-box-label {
    position: absolute;
    top: -24px;
    left: 0;
    background: var(--sahara-primary);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .mini-map-box {
    width: 100%;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--sahara-outline-variant);
  }

  :global(.mini-map-instance) {
    width: 100%;
    height: 100%;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .metric-card {
    background: var(--sahara-surface-low);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .m-icon-wrapper {
    width: 36px;
    height: 36px;
    background: var(--sahara-surface-container);
    color: var(--sahara-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .m-content {
    display: flex;
    flex-direction: column;
  }

  .m-title {
    font-size: 0.65rem;
    color: var(--sahara-text-muted);
    text-transform: uppercase;
    font-weight: 600;
  }

  .m-number {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--sahara-text);
    line-height: 1.2;

    small {
      font-size: 0.7rem;
      font-weight: normal;
      color: var(--sahara-text-muted);
    }
  }

  .m-sub {
    font-size: 0.65rem;
    color: var(--sahara-primary);
    font-weight: 600;
  }

  .prescription-box {
    background: var(--sahara-surface-low);
    border-left: 3px solid var(--sahara-primary);
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
  }

  .mini-map-box {
    width: 100%;
    height: 200px;
    border-radius: var(--sahara-radius);
    overflow: hidden;
    position: relative;
    border: 1px solid var(--sahara-outline-variant);
  }

  :global(.mini-map-instance) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* Timeline */
  .timeline-stepper {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    position: relative;
    padding-left: 0.5rem;

    &::before {
      content: '';
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 17px;
      width: 2px;
      background: var(--sahara-outline-variant);
    }
  }

  .timeline-step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    position: relative;
    z-index: 1;

    &.is-done {
      .step-indicator {
        background: #2e7d32;
        color: #ffffff;
        border-color: #2e7d32;
      }
      .step-title {
        color: var(--sahara-text);
        font-weight: 600;
      }
    }

    &.is-current {
      .step-indicator {
        background: var(--sahara-primary);
        color: #ffffff;
        border-color: var(--sahara-primary);
        box-shadow: 0 0 0 4px var(--sahara-primary-light);
      }
      .step-title {
        color: var(--sahara-primary);
        font-weight: 700;
      }
    }
  }

  .step-indicator {
    width: 26px;
    height: 26px;
    border-radius: 9999px;
    background: var(--sahara-surface-lowest);
    border: 2px solid var(--sahara-outline);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sahara-text-muted);
    flex-shrink: 0;
  }

  :global(.step-check) {
    font-size: 0.9rem;
  }

  .step-content {
    display: flex;
    flex-direction: column;
  }

  .step-title {
    font-size: 0.85rem;
    color: var(--sahara-text-muted);
    line-height: 1.2;
  }

  .step-desc {
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
  }
</style>
