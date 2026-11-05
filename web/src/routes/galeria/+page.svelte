<script lang="ts">
  import { onMount } from 'svelte';
  import IconSearch from '~icons/material-symbols/search';
  import IconFileDownload from '~icons/material-symbols/download';
  import IconAddPhoto from '~icons/material-symbols/add-photo-alternate-outline';
  import IconGridView from '~icons/material-symbols/grid-view-outline';
  import IconViewAgenda from '~icons/material-symbols/view-agenda-outline';
  import IconSchedule from '~icons/material-symbols/schedule';
  import IconVerified from '~icons/material-symbols/verified';
  import IconArrowForward from '~icons/material-symbols/arrow-forward';
  import IconMoreVert from '~icons/material-symbols/more-vert';
  import IconMap from '~icons/material-symbols/map-outline';

  import { SEVERIDAD_LABELS, ESTADO_LABELS } from '#lib/domain/labels';
  import { exportToGeoJSON } from '#lib/domain/geo';
  import { formatFechaRelativa } from '#lib/domain/format';
  import { getBaches } from '#lib/queries/baches';
  import type { Bache, EstadoBache, SeveridadVial } from '#lib/domain/types';

  let baches = $state<Bache[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);

  // Filtros
  let tabActiva = $state<'todos' | 'criticos' | 'pendientes' | 'reparacion' | 'resueltos'>('todos');
  let orden = $state<'reciente' | 'severidad' | 'confianza_desc' | 'confianza_asc'>('reciente');
  let busqueda = $state('');
  let vistaModo = $state<'grid' | 'lista'>('grid');

  // Datos mock de fallback con fotos de pavimentos
  const fallbackBaches: Bache[] = [
    {
      id: 'mock-1',
      codigo: 'BCH-2026-0981',
      latitud: -25.2895,
      longitud: -57.6012,
      direccion: 'Av. Mariscal López #1420',
      profundidad_cm: 11.4,
      area_m2: 0.85,
      volumen_m3: 0.097,
      asfalto_requerido_kg: 232,
      estado: 'reportado',
      severidad: 'critica',
      patologia: 'bache_profundo',
      diagnostico_ia: 'Profundidad estimada: 11.4 cm con degradación perimetral por fractura en piel de cocodrilo severa.',
      confianza_ia_pct: 98.4,
      sensor_movil: 'Móvil Patrol-04 (LiDAR v2)',
      foto_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
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
      diagnostico_ia: 'Desprendimiento superficial de árido grueso con expansión de 68 cm. Riesgo para motocicletas.',
      confianza_ia_pct: 94.8,
      sensor_movil: 'Ing. M. Delgado (Peritaje)',
      foto_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
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
      diagnostico_ia: 'Fisuramiento longitudinal inicial sin desprendimiento masivo de base. Requiere sellado.',
      confianza_ia_pct: 91.2,
      sensor_movil: 'Cámara Municipal #12 (Stream)',
      foto_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
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
      diagnostico_ia: 'Reparación de microcarpeta completada con sellado perimetral.',
      confianza_ia_pct: 88.5,
      sensor_movil: 'Patrulla Nocturna MOPC',
      foto_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&auto=format&fit=crop&q=80',
      fecha_reporte: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];

  async function cargarGaleria() {
    loading = true;
    try {
      let estadoFiltro: EstadoBache | 'todos' = 'todos';
      let sevFiltro: SeveridadVial | 'todas' = 'todas';

      if (tabActiva === 'criticos') sevFiltro = 'critica';
      if (tabActiva === 'pendientes') estadoFiltro = 'reportado';
      if (tabActiva === 'reparacion') estadoFiltro = 'en_reparacion';
      if (tabActiva === 'resueltos') estadoFiltro = 'reparado';

      const { baches: data, total } = await getBaches({
        estado: estadoFiltro,
        severidad: sevFiltro,
        orden,
        busqueda
      });

      if (data && data.length > 0) {
        baches = data;
        totalCount = total;
      } else {
        baches = fallbackBaches.filter((b) => {
          if (tabActiva === 'criticos' && b.severidad !== 'critica') return false;
          if (tabActiva === 'pendientes' && b.estado !== 'reportado') return false;
          if (tabActiva === 'reparacion' && b.estado !== 'asignado' && b.estado !== 'en_reparacion') return false;
          if (tabActiva === 'resueltos' && b.estado !== 'reparado') return false;
          if (busqueda && !b.direccion?.toLowerCase().includes(busqueda.toLowerCase())) return false;
          return true;
        });
        totalCount = baches.length;
      }
    } catch (e) {
      console.error(e);
      baches = fallbackBaches;
      totalCount = fallbackBaches.length;
    } finally {
      loading = false;
    }
  }

  function descargarGeoJSON() {
    const jsonStr = exportToGeoJSON(baches);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baches-paraguay-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onMount(() => {
    cargarGaleria();
  });
</script>

<div class="galeria-page">
  <!-- Cabecera editorial Sahara -->
  <div class="galeria-header">
    <div class="header-texts">
      <nav class="breadcrumb is-small mb-1" aria-label="breadcrumbs">
        <ul>
          <li><span class="has-text-grey">Catálogo Registral de Incidencias</span></li>
          <li class="is-active"><a href="#lote" aria-current="page">Lote Activo #2026-Q1</a></li>
        </ul>
      </nav>
      <h1 class="headline-serif is-size-3">Galería Visual de Baches & Afectaciones</h1>
      <p class="has-text-grey is-size-7 mt-1">
        Inventario fotogramétrico de anomalías en carpeta asfáltica capturado mediante sensores telemáticos y patrullaje con telemetría LiDAR acoplada.
      </p>
    </div>

    <!-- Botones de Acción -->
    <div class="header-actions">
      <button class="button is-small is-sahara-outlined" onclick={descargarGeoJSON}>
        <IconFileDownload class="mr-1" />
        <span>Exportar GeoJSON</span>
      </button>

      <a href="/reportar" class="button is-small is-sahara-primary">
        <IconAddPhoto class="mr-1" />
        <span>Ingreso de Registro</span>
      </a>
    </div>
  </div>

  <!-- Barra de Filtros, Búsqueda y Pestañas -->
  <div class="filters-card">
    <div class="is-flex is-justify-content-between is-align-items-center is-flex-wrap-wrap gap-3">
      <!-- Pestañas de estado -->
      <div class="tabs is-toggle is-small mb-0">
        <ul>
          <li class:is-active={tabActiva === 'todos'}>
            <button class="tab-btn" onclick={() => { tabActiva = 'todos'; cargarGaleria(); }}>
              <span>Todos</span>
            </button>
          </li>
          <li class:is-active={tabActiva === 'criticos'}>
            <button class="tab-btn" onclick={() => { tabActiva = 'criticos'; cargarGaleria(); }}>
              <span>Críticos</span>
            </button>
          </li>
          <li class:is-active={tabActiva === 'pendientes'}>
            <button class="tab-btn" onclick={() => { tabActiva = 'pendientes'; cargarGaleria(); }}>
              <span>Pendientes</span>
            </button>
          </li>
          <li class:is-active={tabActiva === 'reparacion'}>
            <button class="tab-btn" onclick={() => { tabActiva = 'reparacion'; cargarGaleria(); }}>
              <span>En Reparación</span>
            </button>
          </li>
          <li class:is-active={tabActiva === 'resueltos'}>
            <button class="tab-btn" onclick={() => { tabActiva = 'resueltos'; cargarGaleria(); }}>
              <span>Resueltos</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Buscador y controles -->
      <div class="is-flex is-align-items-center gap-2">
        <div class="control has-icons-left">
          <input
            class="input is-small is-rounded"
            type="text"
            placeholder="Buscar por avenida o código..."
            bind:value={busqueda}
            oninput={cargarGaleria}
          />
          <span class="icon is-small is-left">
            <IconSearch />
          </span>
        </div>

        <div class="select is-small">
          <select bind:value={orden} onchange={cargarGaleria}>
            <option value="reciente">Más recientes primero</option>
            <option value="severidad">Mayor severidad primero</option>
            <option value="confianza_desc">Mayor confianza IA</option>
            <option value="confianza_asc">Menor confianza IA</option>
          </select>
        </div>

        <!-- Toggle vista Grid / Lista -->
        <div class="buttons has-addons are-small mb-0">
          <button
            class="button {vistaModo === 'grid' ? 'is-sahara-primary' : 'is-light'}"
            onclick={() => (vistaModo = 'grid')}
            aria-label="Vista cuadrícula"
          >
            <IconGridView />
          </button>
          <button
            class="button {vistaModo === 'lista' ? 'is-sahara-primary' : 'is-light'}"
            onclick={() => (vistaModo = 'lista')}
            aria-label="Vista lista"
          >
            <IconViewAgenda />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Grilla de Cards de Baches -->
  {#if loading}
    <div class="has-text-centered py-6">
      <span class="loader is-loading is-size-2"></span>
      <p class="has-text-grey is-size-7 mt-2">Cargando catálogo registral...</p>
    </div>
  {:else if baches.length === 0}
    <div class="card-sahara has-text-centered py-6">
      <h3 class="headline-serif is-size-4">No se encontraron baches</h3>
      <p class="has-text-grey is-size-7 mt-1">Prueba ajustando los filtros de búsqueda o severidad.</p>
    </div>
  {:else}
    <div class={vistaModo === 'grid' ? 'baches-grid' : 'baches-list'}>
      {#each baches as bache (bache.id)}
        {@const sev = bache.severidad || 'media'}
        {@const est = bache.estado || 'reportado'}
        {@const estInfo = ESTADO_LABELS[est]}

        <div class="bache-card">
          <!-- Imagen del Bache -->
          <div class="bache-image-wrapper">
            <img
              src={bache.foto_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
              alt={bache.codigo || 'Registro de bache'}
              class="bache-img"
              loading="lazy"
            />
            <div class="image-overlay-badges">
              <span class="badge-sev {SEVERIDAD_LABELS[sev].class}">
                {SEVERIDAD_LABELS[sev].label}
              </span>
              {#if bache.confianza_ia_pct}
                <span class="ia-overlay-pill">
                  <IconVerified class="mr-1" />
                  {bache.confianza_ia_pct}% IA
                </span>
              {/if}
            </div>
          </div>

          <!-- Contenido de la Ficha -->
          <div class="bache-card-body">
            <div class="is-flex is-justify-content-between is-align-items-center mb-1">
              <span class="bache-code">{bache.codigo || 'BCH-PENDIENTE'}</span>
              <span class="is-size-7 has-text-grey is-flex is-align-items-center">
                <IconSchedule class="mr-1" />
                {formatFechaRelativa(bache.fecha_reporte)}
              </span>
            </div>

            <div class="bache-address">{bache.direccion || 'Ubicación Georreferenciada'}</div>
            <p class="bache-diag">{bache.diagnostico_ia || 'Diagnóstico preliminar pendiente de validación técnica.'}</p>

            <!-- Barra de Progreso de Atención -->
            <div class="progress-box">
              <div class="is-flex is-justify-content-between is-size-7 mb-1">
                <span class="has-text-grey">{estInfo.label}</span>
                <span class="has-text-weight-bold has-text-primary">{estInfo.pct}%</span>
              </div>
              <progress class="progress is-primary is-small" value={estInfo.pct} max="100"></progress>
            </div>

            <!-- Footer con Sensor y Enlace a Ficha -->
            <div class="bache-card-footer">
              <span class="sensor-badge">{bache.sensor_movil || 'Sensor Telemático'}</span>
              <a href="/bache/{bache.id}" class="card-link-btn">
                <span>Ficha Técnica</span>
                <IconArrowForward class="ml-1" />
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .galeria-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .galeria-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .filters-card {
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: var(--sahara-radius);
    padding: 0.85rem 1.25rem;
    box-shadow: var(--sahara-shadow-soft);
  }

  .tab-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.35rem 0.75rem;
  }

  .baches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .baches-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .bache-card {
    background: var(--sahara-surface-lowest);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: var(--sahara-radius);
    overflow: hidden;
    box-shadow: var(--sahara-shadow-soft);
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: var(--sahara-shadow-card);
      transform: translateY(-2px);
    }
  }

  .bache-image-wrapper {
    position: relative;
    width: 100%;
    height: 190px;
    background-color: var(--sahara-surface-container);
    overflow: hidden;
  }

  .bache-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.96) contrast(1.05);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }

  .image-overlay-badges {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ia-overlay-pill {
    background: rgba(250, 245, 238, 0.92);
    backdrop-filter: blur(8px);
    color: var(--sahara-primary);
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid rgba(194, 101, 42, 0.2);
    display: flex;
    align-items: center;
  }

  .bache-card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .bache-code {
    font-family: monospace;
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--sahara-text);
  }

  .bache-address {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--sahara-text);
    margin: 0.2rem 0;
  }

  .bache-diag {
    font-size: 0.8rem;
    color: var(--sahara-text-muted);
    line-height: 1.4;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .progress-box {
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid var(--sahara-outline-variant);
  }

  .bache-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
  }

  .sensor-badge {
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
    font-family: monospace;
    background: var(--sahara-surface-container);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .card-link-btn {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--sahara-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
