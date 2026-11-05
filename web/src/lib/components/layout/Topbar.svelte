<script lang="ts">
  import IconLocationCity from '~icons/material-symbols/location-city';
  import IconNotifications from '~icons/material-symbols/notifications-outline';
  import IconPerson from '~icons/material-symbols/person-outline';
  import IconLogin from '~icons/material-symbols/login';
  import type { Perfil } from '#lib/domain/types';

  interface Props {
    perfil?: Perfil | null;
  }

  let { perfil = null }: Props = $props();

  let selectedDistrito = $state('Gran Asunción - Todos los Distritos');

  const distritos = [
    'Gran Asunción - Todos los Distritos',
    'Asunción (Capital)',
    'San Lorenzo',
    'Luque',
    'Lambaré',
    'Fernando de la Mora',
    'Mariano Roque Alonso',
    'Ñemby',
    'Capiatá',
    'Villa Elisa'
  ];
</script>

<header class="topbar-header">
  <div class="topbar-left">
    <!-- Selector territorial localizado para Paraguay -->
    <div class="territory-selector-wrapper">
      <IconLocationCity class="territory-icon" />
      <select bind:value={selectedDistrito} class="territory-select">
        {#each distritos as dist}
          <option value={dist}>{dist}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="topbar-right">
    <!-- Notificaciones -->
    <button type="button" aria-label="Notificaciones" class="topbar-icon-btn">
      <IconNotifications class="topbar-icon" />
      <span class="notification-indicator"></span>
    </button>

    <div class="topbar-divider"></div>

    <!-- Perfil / Acceso Técnico -->
    {#if perfil}
      <a href="/admin" class="user-profile-badge">
        <div class="user-meta">
          <span class="user-name">{perfil.nombre || 'Inspector Técnico'}</span>
          <span class="user-role">{perfil.rol.toUpperCase()}</span>
        </div>
        <div class="user-avatar">
          <IconPerson class="avatar-icon" />
        </div>
      </a>
    {:else}
      <a href="/login" class="login-link-btn">
        <IconLogin class="login-icon" />
        <span>Acceso Técnico</span>
      </a>
    {/if}
  </div>
</header>

<style lang="scss">
  .topbar-header {
    position: fixed;
    top: 0;
    left: 260px;
    right: 0;
    height: 64px;
    background-color: rgba(250, 245, 238, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--sahara-outline-variant);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    z-index: 40;
    box-shadow: 0 1px 8px rgba(58, 48, 42, 0.04);
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .territory-selector-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.territory-icon) {
    position: absolute;
    left: 0.75rem;
    font-size: 1.1rem;
    color: var(--sahara-text-muted);
    pointer-events: none;
  }

  .territory-select {
    padding: 0.4rem 2rem 0.4rem 2.25rem;
    background-color: var(--sahara-surface-container);
    border: 1px solid var(--sahara-outline-variant);
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sahara-text);
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s ease;

    &:focus {
      border-color: var(--sahara-primary);
    }
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .topbar-icon-btn {
    position: relative;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--sahara-text-muted);
    padding: 0.4rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;

    &:hover {
      background-color: var(--sahara-surface-high);
      color: var(--sahara-text);
    }
  }

  :global(.topbar-icon) {
    font-size: 1.25rem;
  }

  .notification-indicator {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    background-color: var(--sahara-primary);
    border-radius: 9999px;
  }

  .topbar-divider {
    width: 1px;
    height: 20px;
    background-color: var(--sahara-outline-variant);
  }

  .user-profile-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    color: inherit;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--sahara-surface-high);
    }
  }

  .user-meta {
    display: flex;
    flex-direction: column;
    text-align: right;
  }

  .user-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--sahara-text);
    line-height: 1.2;
  }

  .user-role {
    font-size: 0.65rem;
    color: var(--sahara-primary);
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    background-color: var(--sahara-surface-container);
    border: 1px solid var(--sahara-outline-variant);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.avatar-icon) {
    font-size: 1.15rem;
    color: var(--sahara-text-muted);
  }

  .login-link-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    border-radius: 8px;
    background-color: transparent;
    border: 1px solid var(--sahara-outline-variant);
    color: var(--sahara-primary);
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.15s ease;

    &:hover {
      background-color: var(--sahara-primary-light);
      border-color: var(--sahara-primary);
    }
  }

  :global(.login-icon) {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .topbar-header {
      left: 0;
      padding: 0 1rem;
    }
  }
</style>
