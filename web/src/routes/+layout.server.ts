import type { LayoutServerLoad } from './$types';
import { apiGet } from '#lib/api/client';
import type { Perfil, RolUsuario } from '#lib/domain/types';
import type { User } from '../app.d.ts';

interface AuthMeResponse {
  user?: User;
  perfil?: Perfil;
  id?: string;
  email?: string;
  nombre?: string;
  rol?: string;
  [key: string]: unknown;
}

export const load: LayoutServerLoad = async ({ locals, cookies, fetch }) => {
  let user = locals.user;
  let perfil = locals.perfil;
  const token = locals.token ?? (cookies.get('bacheemos_token') || null);

  // Fallback si locals no fue poblado en hooks
  if (token && (!user || !perfil)) {
    try {
      const data = await apiGet<AuthMeResponse>('/auth/me', {
        token,
        fetch
      });

      if (data) {
        user = data.user || {
          id: (data.id as string) || '',
          email: data.email as string | undefined,
          nombre: data.nombre as string | undefined,
          rol: data.rol as string | undefined
        };

        perfil = data.perfil || {
          id: user.id || (data.id as string) || '',
          nombre: (user.nombre || data.nombre || 'Inspector Técnico') as string,
          rol: ((user.rol || data.rol || 'inspector') as RolUsuario)
        };
      }
    } catch {
      // Ignorar error si no está autenticado o el backend está indisponible
    }
  }

  return {
    token,
    user,
    perfil
  };
};
