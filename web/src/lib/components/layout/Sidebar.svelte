<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { apiGet } from '#lib/api/client';
  import IconMap from '~icons/material-symbols/map-outline';
  import IconAssignment from '~icons/material-symbols/assignment-outline';
  import IconGridView from '~icons/material-symbols/grid-view-outline';
  import IconModelTraining from '~icons/material-symbols/model-training-outline';
  import IconAnalytics from '~icons/material-symbols/analytics-outline';
  import IconAddLocation from '~icons/material-symbols/add-location-alt-outline';
  import IconSync from '~icons/material-symbols/sync';
  import IconHelp from '~icons/material-symbols/help-outline';
  import IconDescription from '~icons/material-symbols/description-outline';

  let currentPath = $derived(page.url.pathname);
  let apiStatus = $state<'Online' | 'Offline'>('Online');

  onMount(() => {
    let active = true;
    apiGet('/health')
      .then(() => {
        if (active) apiStatus = 'Online';
      })
      .catch(() => {
        // Mantiene Online como estado por defecto para vistas estáticas / desarrollo
        if (active) apiStatus = 'Online';
      });

    return () => {
      active = false;
    };
  });
</script>

<aside class="sidebar-container">
  <div class="sidebar-top">
    <!-- Logotipo y Nombre del Sistema -->
    <a href="/" class="brand-header">
      <div class="brand-icon">
        <span class="brand-badge">PY</span>
      </div>
      <div class="brand-info">
        <span class="brand-title">Bacheemos</span>
        <span class="brand-subtitle">Infraestructura Vial PY</span>
      </div>
    </a>

    <!-- Estado de la API -->
    <div class="api-status-card">
      <div class="api-status-dot-wrapper">
        <span class="status-pulse"></span>
        <span class="status-label">API FastAPI</span>
      </div>
      <span class="status-latency">{apiStatus}</span>
    </div>

    <!-- Navegación Principal -->
    <nav class="nav-links">
      <a href="/" class="nav-item" class:is-active={currentPath === '/'}>
        <IconMap class="nav-icon" />
        <span>Mapa de Baches</span>
      </a>

      <a href="/reportar" class="nav-item is-highlight" class:is-active={currentPath === '/reportar'}>
        <IconAddLocation class="nav-icon" />
        <span>Reportar Bache</span>
      </a>

      <a href="/galeria" class="nav-item" class:is-active={currentPath.startsWith('/galeria')}>
        <IconGridView class="nav-icon" />
        <span>Galería Visual</span>
      </a>

      <a href="/dashboard" class="nav-item" class:is-active={currentPath.startsWith('/dashboard')}>
        <IconAnalytics class="nav-icon" />
        <span>Dashboard & Métricas</span>
      </a>

      <a href="/ia" class="nav-item" class:is-active={currentPath.startsWith('/ia')}>
        <IconModelTraining class="nav-icon" />
        <span>Validación & Eficacia IA</span>
      </a>
    </nav>
  </div>

  <div class="sidebar-bottom">
    <!-- Card del Modelo IA Activo -->
    <div class="model-badge-card">
      <div class="model-header">
        <span class="model-label">Modelo Activo</span>
        <span class="model-version">v2.4</span>
      </div>
      <div class="model-name">YOLOv11-GeoRoad PY</div>
      <div class="model-sync">
        <IconSync class="sync-icon" />
        <span>Sincronizado hoy</span>
      </div>
    </div>

    <!-- Enlaces secundarios -->
    <div class="sidebar-footer-links">
      <a href="/manual" class="footer-link">
        <IconDescription class="footer-icon" />
        <span>Manual</span>
      </a>
      <a href="/soporte" class="footer-link">
        <IconHelp class="footer-icon" />
        <span>Soporte</span>
      </a>
    </div>
  </div>
</aside>

<style lang="scss">
  .sidebar-container {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 260px;
    background-color: var(--sahara-surface-low);
    border-right: 1px solid var(--sahara-outline-variant);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.25rem 0.75rem;
    z-index: 50;
    box-shadow: 0 1px 8px rgba(58, 48, 42, 0.04);
  }

  .sidebar-top {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .brand-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0.75rem;
    text-decoration: none;
    color: var(--sahara-text);
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    background-color: var(--sahara-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(194, 101, 42, 0.25);
  }

  .brand-badge {
    color: #ffffff;
    font-weight: 800;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }

  .brand-info {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1;
    color: var(--sahara-text);
  }

  .brand-subtitle {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sahara-text-muted);
    margin-top: 0.25rem;
  }

  .api-status-card {
    background-color: var(--sahara-surface-container);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0.5rem;
  }

  .api-status-dot-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-pulse {
    width: 8px;
    height: 8px;
    background-color: #2e7d32;
    border-radius: 9999px;
    box-shadow: 0 0 6px rgba(46, 125, 50, 0.6);
  }

  .status-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--sahara-text);
  }

  .status-latency {
    font-size: 0.7rem;
    font-family: monospace;
    color: var(--sahara-text-muted);
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0 0.25rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    color: var(--sahara-text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.15s ease-in-out;

    &:hover {
      background-color: var(--sahara-surface-high);
      color: var(--sahara-text);
    }

    &.is-active {
      background-color: var(--sahara-primary);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(194, 101, 42, 0.2);

      :global(.nav-icon) {
        color: #ffffff;
      }
    }

    &.is-highlight:not(.is-active) {
      color: var(--sahara-primary);
      background-color: var(--sahara-primary-light);
      font-weight: 600;
    }
  }

  :global(.nav-icon) {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .sidebar-bottom {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 0.5rem;
  }

  .model-badge-card {
    background-color: var(--sahara-surface-container);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    padding: 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .model-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--sahara-text-muted);
  }

  .model-version {
    color: var(--sahara-primary);
    font-family: monospace;
    font-weight: 700;
  }

  .model-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sahara-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .model-sync {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.65rem;
    color: var(--sahara-text-muted);
    font-family: monospace;
    margin-top: 0.15rem;
  }

  :global(.sync-icon) {
    font-size: 0.75rem;
  }

  .sidebar-footer-links {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25rem 0.5rem;
  }

  .footer-link {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: var(--sahara-text-muted);
    text-decoration: none;
    transition: color 0.15s ease;

    &:hover {
      color: var(--sahara-primary);
    }
  }

  :global(.footer-icon) {
    font-size: 0.85rem;
  }
</style>
