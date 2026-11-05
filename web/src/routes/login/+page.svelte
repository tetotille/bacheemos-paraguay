<script lang="ts">
  import { goto } from '$app/navigation';
  import IconLock from '~icons/material-symbols/lock-outline';
  import IconEmail from '~icons/material-symbols/mail-outline';
  import IconLogin from '~icons/material-symbols/login';
  import { apiPost, setStoredToken } from '#lib/api/client';

  let email = $state('');
  let password = $state('');
  let cargando = $state(false);
  let errorMsg = $state('');

  interface LoginResponse {
    access_token?: string;
    token?: string;
    token_type?: string;
    user?: unknown;
    [key: string]: unknown;
  }

  async function handleLogin(e: Event) {
    e.preventDefault();
    cargando = true;
    errorMsg = '';

    try {
      const data = await apiPost<LoginResponse>('/auth/login', {
        email: email.trim(),
        password
      });

      const token = data?.access_token || data?.token;
      if (token) {
        setStoredToken(token);
        await goto('/dashboard');
      } else {
        throw new Error('Respuesta de autenticación sin token válido.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar credenciales técnicas.';
      errorMsg = msg;
    } finally {
      cargando = false;
    }
  }
</script>

<div class="login-page">
  <div class="login-container">
    <div class="card-sahara">
      <div class="has-text-centered mb-5">
        <div class="login-brand-badge mb-2">PY</div>
        <h1 class="headline-serif is-size-3 mb-1">Acceso Técnico & Auditoría</h1>
        <p class="has-text-grey is-size-7">
          Portal reservado para inspectores de campo, ingenieros de peritaje y jefes de cuadrilla de obras viales.
        </p>
      </div>

      {#if errorMsg}
        <div class="notification is-danger is-light is-size-7 py-2 px-3 mb-4">
          {errorMsg}
        </div>
      {/if}

      <form onsubmit={handleLogin}>
        <div class="field mb-3">
          <label class="label is-size-7 has-text-grey" for="email-input">Correo Electrónico Institucional</label>
          <div class="control has-icons-left">
            <input
              id="email-input"
              class="input is-small"
              type="email"
              placeholder="ingeniero@mopc.gov.py"
              bind:value={email}
              required
            />
            <span class="icon is-small is-left">
              <IconEmail />
            </span>
          </div>
        </div>

        <div class="field mb-4">
          <label class="label is-size-7 has-text-grey" for="password-input">Contraseña de Acceso</label>
          <div class="control has-icons-left">
            <input
              id="password-input"
              class="input is-small"
              type="password"
              placeholder="••••••••••••"
              bind:value={password}
              required
            />
            <span class="icon is-small is-left">
              <IconLock />
            </span>
          </div>
        </div>

        <div class="mb-4">
          <button
            type="submit"
            class="button is-sahara-primary is-fullwidth"
            class:is-loading={cargando}
            disabled={cargando}
          >
            <IconLogin class="mr-1" />
            <span>Iniciar Sesión Técnica</span>
          </button>
        </div>

        <div class="has-text-centered is-size-7 has-text-grey">
          <span>¿No posees credenciales de inspector?</span><br />
          <span class="is-size-7 has-text-grey-dark">Solicita tu alta al Administrador de Infraestructura de tu Municipio.</span>
        </div>
      </form>
    </div>
  </div>
</div>

<style lang="scss">
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 160px);
  }

  .login-container {
    width: 100%;
    max-width: 440px;
  }

  .login-brand-badge {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--sahara-primary);
    color: #ffffff;
    font-weight: 800;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(194, 101, 42, 0.3);
  }
</style>
