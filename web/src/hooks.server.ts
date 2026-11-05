import type { Handle } from '@sveltejs/kit/hooks';
import { apiGet } from '#lib/api/client';
import type { Perfil, RolUsuario } from '#lib/domain/types';
import type { User } from './app.d.ts';

interface AuthMeResponse {
  user?: User;
  perfil?: Perfil;
  id?: string;
  email?: string;
  nombre?: string;
  rol?: string;
  [key: string]: unknown;
}

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('bacheemos_token') || null;
  event.locals.token = token;
  event.locals.user = null;
  event.locals.perfil = null;

  if (token) {
    try {
      const data = await apiGet<AuthMeResponse>('/auth/me', {
        token,
        fetch: event.fetch
      });

      if (data) {
        const userObj: User = data.user || {
          id: (data.id as string) || '',
          email: data.email as string | undefined,
          nombre: data.nombre as string | undefined,
          rol: data.rol as string | undefined
        };

        const perfilObj: Perfil = data.perfil || {
          id: userObj.id,
          nombre: (userObj.nombre || data.nombre || 'Inspector Técnico') as string,
          rol: ((userObj.rol || data.rol || 'inspector') as RolUsuario)
        };

        event.locals.user = userObj;
        event.locals.perfil = perfilObj;
      }
    } catch (err) {
      console.warn('Sesión técnica no válida o expirada en FastAPI:', err);
      event.cookies.delete('bacheemos_token', { path: '/' });
      event.locals.token = null;
    }
  }

  return resolve(event);
};
