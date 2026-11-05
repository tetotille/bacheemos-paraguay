<script lang="ts">
  import '@fontsource-variable/manrope';
  import '@fontsource/eb-garamond';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import favicon from '#lib/assets/favicon.svg';
  import type { LayoutProps } from './$types';
  import '../app.scss';
  import Sidebar from '#lib/components/layout/Sidebar.svelte';
  import Topbar from '#lib/components/layout/Topbar.svelte';
  import { initMapLibreWorker } from '#lib/maplibre';

  initMapLibreWorker();

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <title>Bacheemos Paraguay — Plataforma de Gestión e Infraestructura Vial</title>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-layout">
  <Sidebar />
  <Topbar perfil={data.perfil} />

  <main class="main-content">
    {@render children()}
  </main>
</div>

<style lang="scss">
  .app-layout {
    display: flex;
    min-height: 100vh;
    background-color: var(--sahara-bg);
  }

  .main-content {
    flex: 1;
    margin-left: 260px;
    margin-top: 64px;
    padding: 2rem;
    min-height: calc(100vh - 64px);
    background-color: var(--sahara-bg);
  }

  @media (max-width: 768px) {
    .main-content {
      margin-left: 0;
      padding: 1rem;
    }
  }
</style>
