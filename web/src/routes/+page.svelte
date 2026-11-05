<script lang="ts">
  import { onMount } from 'svelte';
  import { MapLibre, Marker, Popup, NavigationControl, GeolocateControl } from 'svelte-maplibre';
  import 'maplibre-gl/dist/maplibre-gl.css';

  import IconSearch from '~icons/material-symbols/search';
  import IconLayers from '~icons/material-symbols/layers-outline';
  import IconChevronRight from '~icons/material-symbols/chevron-right';
  import IconSchedule from '~icons/material-symbols/schedule';
  import IconVerified from '~icons/material-symbols/verified';
  import IconClose from '~icons/material-symbols/close';
  import IconFilterList from '~icons/material-symbols/filter-list';
  import IconArrowForward from '~icons/material-symbols/arrow-forward';

  import { PUBLIC_MAP_STYLE_URL } from '#lib/env';
  import { ASUNCION_CENTER } from '#lib/domain/geo';
  import { SEVERIDAD_LABELS, ESTADO_LABELS } from '#lib/domain/labels';
  import { formatFechaRelativa, formatNumero } from '#lib/domain/format';
  import { getBaches } from '#lib/queries/baches';
  import type { Bache, SeveridadVial, EstadoBache } from '#lib/domain/types';

  // Estados reactivos (Svelte 5 runes)
  let baches = $state<Bache[]>([]);
  let loading = $state(true);
  let selectedBache = $state<Bache | null>(null);
  let sidebarOpen = $state(true);
  let radioKm = $state(2.5);

  // Filtros
  let filtroSeveridad = $state<SeveridadVial | 'todas'>('todas');
  let filtroEstado = $state<EstadoBache | 'todos'>('todos');
  let filtroMinConfianza = $state<number>(0);
  let busquedaTexto = $state('');

  // Centro del mapa
  let mapCenter = $state<[number, number]>([ASUNCION_CENTER.lng, ASUNCION_CENTER.lat]);
  let mapZoom = $state<number>(ASUNCION_CENTER.zoom);

  // Datos mock de fallback para Paraguay si la base de datos está vacía inicialmente
  const fallbackBaches: Bache[] = [
    {
      id: 'mock-1',
      codigo: 'BCH-2026-0981',
      latitud: -25.2895,
      longitud: -57.6012,
      direccion: 'Av. Mariscal López esq. San Martín',
      profundidad_cm: 11.4,
      area_m2: 0.85,
      volumen_m3: 0.097,
      asfalto_requerido_kg: 232,
      estado: 'reportado',
      severidad: 'critica',
      patologia: 'bache_profundo',
      diagnostico_ia: 'Bache profundo con fractura perimetral en piel de cocodrilo severa. Alto impacto.',
      confianza_ia_pct: 98.4,
      sensor_movil: 'Móvil Patrol-04 (LiDAR v2)',
      fecha_reporte: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: 'mock-2',
      codigo: 'BCH-2026-0978',
      latitud: -25.2831,
      longitud: -57.5925,
      direccion: 'Av. España c/ Dr. Bestard',
      profundidad_cm: 6.8,
      area_m2: 0.68,
      volumen_m3: 0.046,
      asfalto_requerido_kg: 110,
      estado: 'asignado',
      severidad: 'alta',
      patologia: 'desgaste_superficial',
      diagnostico_ia: 'Desprendimiento superficial de árido grueso con expansión de 68 cm.',
      confianza_ia_pct: 94.8,
      sensor_movil: 'Inspección Municipal #02',
      fecha_reporte: new Date(Date.now() - 1000 * 60 * 75).toISOString()
    },
    {
      id: 'mock-3',
      codigo: 'BCH-2026-0965',
      latitud: -25.3022,
      longitud: -57.5843,
      direccion: 'Av. Eusebio Ayala c/ Boggiani',
      profundidad_cm: 4.2,
      area_m2: 0.42,
      volumen_m3: 0.018,
      asfalto_requerido_kg: 43,
      estado: 'validado_ia',
      severidad: 'media',
      patologia: 'fisura_longitudinal',
      diagnostico_ia: 'Fisuramiento longitudinal inicial sin desprendimiento masivo de base.',
      confianza_ia_pct: 91.2,
      sensor_movil: 'Cámara Telemática PY-08',
      fecha_reporte: new Date(Date.now() - 1000 * 60 * 210).toISOString()
    },
    {
      id: 'mock-4',
      codigo: 'BCH-2026-0952',
      latitud: -25.2755,
      longitud: -57.5768,
      direccion: 'Av. Aviadores del Chaco c/ San Roque',
      profundidad_cm: 2.5,
      area_m2: 0.30,
      volumen_m3: 0.008,
      asfalto_requerido_kg: 19,
      estado: 'reparado',
      severidad: 'baja',
      patologia: 'desgaste_superficial',
      diagnostico_ia: 'Desgaste incipiente por abrasión de neumáticos.',
      confianza_ia_pct: 88.5,
      sensor_movil: 'Patrulla Nocturna MOPC',
      fecha_reporte: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];

  async function cargarBaches() {
    loading = true;
    try {
      const { baches: data } = await getBaches({
        severidad: filtroSeveridad,
        estado: filtroEstado,
        minConfianza: filtroMinConfianza > 0 ? filtroMinConfianza : undefined,
        busqueda: busquedaTexto
      });

      if (data && data.length > 0) {
        baches = data;
      } else {
        // Usar fallbacks representativos si aún no hay registros cargados
        baches = fallbackBaches.filter((b) => {
          if (filtroSeveridad !== 'todas' && b.severidad !== filtroSeveridad) return false;
          if (filtroEstado !== 'todos' && b.estado !== filtroEstado) return false;
          if (filtroMinConfianza > 0 && (b.confianza_ia_pct || 0) < filtroMinConfianza) return false;
          if (busquedaTexto && !b.direccion?.toLowerCase().includes(busquedaTexto.toLowerCase())) return false;
          return true;
        });
      }
    } catch (e) {
      console.error(e);
      baches = fallbackBaches;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    cargarBaches();
  });

  // Estadísticas del viewport
  let criticosEnVista = $derived(baches.filter((b) => b.severidad === 'critica').length);
</script>

<div class="map-page-container">
  <!-- Barra superior de control y filtros flotantes -->
  <div class="map-controls-bar">
    <div class="search-input-wrapper">
      <IconSearch class="search-icon" />
      <input
        type="text"
        placeholder="Buscar avenida o intersección..."
        bind:value={busquedaTexto}
        oninput={cargarBaches}
        class="search-input"
      />
    </div>

    <!-- Filtro de Severidad -->
    <div class="filter-group">
      <span class="filter-label">Severidad:</span>
      <div class="buttons has-addons are-small mb-0">
        <button
          class="button {filtroSeveridad === 'todas' ? 'is-sahara-primary' : 'is-light'}"
          onclick={() => { filtroSeveridad = 'todas'; cargarBaches(); }}>
          Todas
        </button>
        <button
          class="button {filtroSeveridad === 'critica' ? 'is-danger' : 'is-light'}"
          onclick={() => { filtroSeveridad = 'critica'; cargarBaches(); }}>
          Crítico
        </button>
        <button
          class="button {filtroSeveridad === 'alta' ? 'is-sahara-primary' : 'is-light'}"
          onclick={() => { filtroSeveridad = 'alta'; cargarBaches(); }}>
          Alto
        </button>
        <button
          class="button {filtroSeveridad === 'media' ? 'is-warning' : 'is-light'}"
          onclick={() => { filtroSeveridad = 'media'; cargarBaches(); }}>
          Mod
        </button>
      </div>
    </div>

    <!-- Filtro de Confianza IA -->
    <div class="select is-small">
      <select bind:value={filtroMinConfianza} onchange={cargarBaches}>
        <option value={0}>Toda Confianza IA</option>
        <option value={90}>IA &gt; 90% Óptima</option>
        <option value={75}>IA &gt; 75% Calificada</option>
      </select>
    </div>

    <!-- Alternar panel lateral -->
    <button
      class="button is-small is-sahara-outlined"
      onclick={() => (sidebarOpen = !sidebarOpen)}
    >
      <IconFilterList class="mr-1" />
      <span>{sidebarOpen ? 'Ocultar Panel' : 'Ver Incidentes'} ({baches.length})</span>
    </button>
  </div>

  <!-- Contenedor del Mapa MapLibre -->
  <div class="map-viewport">
    <MapLibre
      style={PUBLIC_MAP_STYLE_URL}
      class="map-instance"
      center={mapCenter}
      zoom={mapZoom}
      maxBounds={[[-62.64, -27.60], [-54.25, -19.29]]}
    >
      <NavigationControl position="bottom-left" />
      <GeolocateControl position="bottom-left" />

      <!-- Marcadores de Baches -->
      {#each baches as bache (bache.id)}
        {@const sev = bache.severidad || 'media'}
        {@const color = SEVERIDAD_LABELS[sev].color}

        <Marker
          lngLat={[bache.longitud, bache.latitud]}
          onclick={() => (selectedBache = bache)}
        >
          <div
            class="custom-pin"
            style="--pin-color: {color};"
            class:is-selected={selectedBache?.id === bache.id}
          >
            <span class="pin-dot"></span>
            <span class="pin-label">{bache.codigo || 'BCH'}</span>
          </div>

          {#if selectedBache?.id === bache.id}
            <Popup offset={[0, -20]} closeButton={true} onclose={() => (selectedBache = null)}>
              <div class="bache-popup-card">
                <div class="popup-header">
                  <span class="badge-sev {SEVERIDAD_LABELS[sev].class}">
                    {SEVERIDAD_LABELS[sev].label}
                  </span>
                  {#if bache.confianza_ia_pct}
                    <span class="ia-badge">
                      <IconVerified class="ia-icon" />
                      {bache.confianza_ia_pct}% IA
                    </span>
                  {/if}
                </div>

                <div class="popup-code">{bache.codigo || 'BCH-PENDIENTE'}</div>
                <div class="popup-address">{bache.direccion || 'Ubicación registrada'}</div>

                <div class="popup-metrics">
                  <div class="metric-item">
                    <span class="m-label">Profundidad</span>
                    <span class="m-val">{bache.profundidad_cm || 0} cm</span>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Área</span>
                    <span class="m-val">{bache.area_m2 || 0} m²</span>
                  </div>
                  <div class="metric-item">
                    <span class="m-label">Mezcla Est.</span>
                    <span class="m-val">~{bache.asfalto_requerido_kg || 0} kg</span>
                  </div>
                </div>

                <a href="/bache/{bache.id}" class="button is-small is-sahara-primary is-fullwidth mt-2">
                  <span>Ver Ficha Completa</span>
                  <IconArrowForward class="ml-1" />
                </a>
              </div>
            </Popup>
          {/if}
        </Marker>
      {/each}
    </MapLibre>

    <!-- Panel lateral "Incidentes en Vista" -->
    {#if sidebarOpen}
      <aside class="incidents-sidebar">
        <div class="sidebar-header">
          <div>
            <h3 class="sidebar-title">Incidentes en Vista</h3>
            <span class="sidebar-subtitle">
              {baches.length} baches • {criticosEnVista} Críticos
            </span>
          </div>
          <button
            class="delete is-medium"
            aria-label="Cerrar panel"
            onclick={() => (sidebarOpen = false)}
          ></button>
        </div>

        <!-- Slider de Radio -->
        <div class="radio-slider-box">
          <div class="is-flex is-justify-content-between is-size-7 mb-1">
            <span class="has-text-grey">Radio de exploración</span>
            <span class="has-text-weight-bold has-text-primary">{radioKm} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            bind:value={radioKm}
            class="slider is-fullwidth is-small"
          />
        </div>

        <!-- Lista scrolleable de incidentes -->
        <div class="incident-cards-scroll">
          {#each baches as bache (bache.id)}
            {@const sev = bache.severidad || 'media'}
            <div
              class="incident-item-card"
              class:is-active={selectedBache?.id === bache.id}
              role="button"
              tabindex="0"
              onclick={() => {
                selectedBache = bache;
                mapCenter = [bache.longitud, bache.latitud];
                mapZoom = 15;
              }}
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  selectedBache = bache;
                  mapCenter = [bache.longitud, bache.latitud];
                }
              }}
            >
              <div class="is-flex is-justify-content-between is-align-items-center mb-1">
                <span class="incident-code">{bache.codigo || 'BCH-PENDIENTE'}</span>
                <span class="badge-sev {SEVERIDAD_LABELS[sev].class}">
                  {SEVERIDAD_LABELS[sev].label}
                </span>
              </div>

              <div class="incident-address">{bache.direccion || 'Sin dirección registrada'}</div>

              <div class="incident-specs">
                <span>Prof: <strong>{bache.profundidad_cm || 0} cm</strong></span>
                <span>Área: <strong>{bache.area_m2 || 0} m²</strong></span>
                {#if bache.confianza_ia_pct}
                  <span class="has-text-primary font-mono">{bache.confianza_ia_pct}% IA</span>
                {/if}
              </div>

              <div class="is-flex is-justify-content-between is-align-items-center mt-2 is-size-7 has-text-grey">
                <span class="is-flex is-align-items-center">
                  <IconSchedule class="mr-1" />
                  {formatFechaRelativa(bache.fecha_reporte)}
                </span>
                <a href="/bache/{bache.id}" class="has-text-primary has-text-weight-semibold is-flex is-align-items-center">
                  Ficha <IconChevronRight />
                </a>
              </div>
            </div>
          {/each}
        </div>
      </aside>
    {/if}
  </div>
</div>

<style lang="scss">
  .map-page-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    position: relative;
  }

  .map-controls-bar {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    z-index: 20;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    background: rgba(250, 245, 238, 0.94);
    backdrop-filter: blur(10px);
    padding: 0.65rem 1rem;
    border-radius: var(--sahara-radius);
    border: 1px solid var(--sahara-outline-variant);
    box-shadow: var(--sahara-shadow-soft);
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 260px;
    flex: 1;
  }

  :global(.search-icon) {
    position: absolute;
    left: 0.65rem;
    color: var(--sahara-text-muted);
    font-size: 1.1rem;
  }

  .search-input {
    width: 100%;
    padding: 0.35rem 0.65rem 0.35rem 2.2rem;
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: var(--sahara-radius);
    font-size: 0.85rem;
    color: var(--sahara-text);
    outline: none;

    &:focus {
      border-color: var(--sahara-primary);
    }
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .filter-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--sahara-text-muted);
  }

  .map-viewport {
    flex: 1;
    position: relative;
    border-radius: var(--sahara-radius);
    overflow: hidden;
    border: 1px solid var(--sahara-outline-variant);
    box-shadow: var(--sahara-shadow-soft);
  }

  :global(.map-instance) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .custom-pin {
    background-color: var(--pin-color);
    color: #ffffff;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    border: 2px solid #ffffff;
    transition: transform 0.15s ease;

    &:hover,
    &.is-selected {
      transform: scale(1.15);
      z-index: 10;
    }
  }

  .pin-dot {
    width: 6px;
    height: 6px;
    background: #ffffff;
    border-radius: 9999px;
  }

  .bache-popup-card {
    padding: 0.5rem 0.25rem;
    min-width: 220px;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.35rem;
  }

  .ia-badge {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.7rem;
    color: var(--sahara-primary);
    font-weight: 600;
  }

  :global(.ia-icon) {
    font-size: 0.85rem;
  }

  .popup-code {
    font-family: monospace;
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--sahara-text);
  }

  .popup-address {
    font-size: 0.8rem;
    color: var(--sahara-text-muted);
    margin-bottom: 0.5rem;
  }

  .popup-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
    background: var(--sahara-surface-container);
    padding: 0.4rem;
    border-radius: 6px;
    text-align: center;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
  }

  .m-label {
    font-size: 0.6rem;
    color: var(--sahara-text-muted);
  }

  .m-val {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--sahara-text);
  }

  /* Barra lateral de incidentes */
  .incidents-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 340px;
    background: rgba(250, 245, 238, 0.95);
    backdrop-filter: blur(12px);
    border-left: 1px solid var(--sahara-outline-variant);
    box-shadow: -4px 0 16px rgba(58, 48, 42, 0.05);
    z-index: 25;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--sahara-outline-variant);
  }

  .sidebar-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .sidebar-subtitle {
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
  }

  .radio-slider-box {
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--sahara-outline-variant);
    background: var(--sahara-surface-low);
  }

  .incident-cards-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .incident-item-card {
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover,
    &.is-active {
      border-color: var(--sahara-primary);
      box-shadow: 0 2px 10px rgba(194, 101, 42, 0.12);
      transform: translateY(-1px);
    }
  }

  .incident-code {
    font-size: 0.75rem;
    font-family: monospace;
    font-weight: 700;
    color: var(--sahara-text);
  }

  .incident-address {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sahara-text);
    margin-bottom: 0.35rem;
    line-height: 1.2;
  }

  .incident-specs {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
  }
</style>
