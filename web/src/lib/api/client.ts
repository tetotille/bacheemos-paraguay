import { PUBLIC_API_URL } from '#lib/env';

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | null | undefined>;
  token?: string | null;
  fetch?: typeof fetch;
  body?: BodyInit | null;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Normaliza y construye la URL absoluta hacia la API FastAPI con query params opcionales.
 */
export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const baseUrl = PUBLIC_API_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Obtiene el token de autenticación guardado en el navegador (cookie o localStorage).
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem('bacheemos_token');
    if (local) return local;

    const cookieMatch = document.cookie.match(/(?:^|;\s*)bacheemos_token=([^;]+)/);
    if (cookieMatch) {
      return decodeURIComponent(cookieMatch[1]);
    }
  } catch {
    // Acceso restringido o SSR
  }
  return null;
}

/**
 * Almacena o remueve el token de sesión en localStorage y en cookie para persistencia.
 */
export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('bacheemos_token', token);
      document.cookie = `bacheemos_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      localStorage.removeItem('bacheemos_token');
      document.cookie = `bacheemos_token=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    // Acceso restringido
  }
}

/**
 * Realiza una petición genérica HTTP a la API REST de FastAPI.
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { params, token, fetch: customFetch, headers: customHeaders, ...rest } = options;
  const url = buildApiUrl(path, params);

  const fetchFn = customFetch || (typeof window !== 'undefined' ? window.fetch.bind(window) : fetch);
  const headers = new Headers(customHeaders || {});

  const authToken = token !== undefined ? token : getStoredToken();
  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetchFn(url, {
    ...rest,
    headers
  });

  if (!response.ok) {
    let errorData: unknown = null;
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        const errorRecord = errorData as Record<string, unknown>;
        if (typeof errorRecord.detail === 'string') {
          errorMessage = errorRecord.detail;
        } else if (typeof errorRecord.message === 'string') {
          errorMessage = errorRecord.message;
        }
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Fallback al statusText
      }
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

/**
 * Petición GET tipada con soporte para query params y token opcional.
 */
export async function apiGet<T>(
  path: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'GET'
  });
}

/**
 * Petición POST tipada para JSON o bodies serializables.
 */
export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  const headers = new Headers(options?.headers || {});
  let payload: BodyInit | undefined;

  if (body !== undefined) {
    if (
      typeof body === 'string' ||
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    ) {
      payload = body;
    } else {
      payload = JSON.stringify(body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: payload,
    headers
  });
}

/**
 * Petición POST para subir archivos multipart/form-data.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  // Las cabeceras no deben forzar Content-Type para permitir boundary automático
  return apiFetch<T>(path, {
    ...options,
    method: 'POST',
    body: formData
  });
}

/**
 * Petición PUT tipada.
 */
export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  const headers = new Headers(options?.headers || {});
  let payload: BodyInit | undefined;

  if (body !== undefined) {
    if (
      typeof body === 'string' ||
      body instanceof Blob ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    ) {
      payload = body;
    } else {
      payload = JSON.stringify(body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  return apiFetch<T>(path, {
    ...options,
    method: 'PUT',
    body: payload,
    headers
  });
}

/**
 * Petición DELETE tipada.
 */
export async function apiDelete<T>(
  path: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    method: 'DELETE'
  });
}
