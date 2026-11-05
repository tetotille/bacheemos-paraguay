import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildApiUrl,
  getStoredToken,
  setStoredToken,
  apiGet,
  apiPost,
  apiUpload,
  ApiError
} from './client';
import { PUBLIC_API_URL } from '#lib/env';

describe('FastAPI Client Helper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildApiUrl', () => {
    it('construye URLs canónicas hacia PUBLIC_API_URL', () => {
      const url = buildApiUrl('/baches');
      expect(url).toBe(`${PUBLIC_API_URL.replace(/\/+$/, '')}/baches`);
    });

    it('agrega query params y descarta nulos o vacíos', () => {
      const url = buildApiUrl('baches', {
        estado: 'reportado',
        severidad: 'critica',
        min_confianza: 90,
        omitido: undefined,
        nulo: null,
        vacio: ''
      });

      const parsed = new URL(url);
      expect(parsed.pathname).toBe('/api/v1/baches');
      expect(parsed.searchParams.get('estado')).toBe('reportado');
      expect(parsed.searchParams.get('severidad')).toBe('critica');
      expect(parsed.searchParams.get('min_confianza')).toBe('90');
      expect(parsed.searchParams.has('omitido')).toBe(false);
      expect(parsed.searchParams.has('nulo')).toBe(false);
      expect(parsed.searchParams.has('vacio')).toBe(false);
    });
  });

  describe('Gestión de Tokens (setStoredToken & getStoredToken)', () => {
    it('retorna null en entorno servidor (sin window)', () => {
      expect(getStoredToken()).toBeNull();
    });

    it('almacena y remueve token en localStorage de forma segura en navegador', () => {
      const store: Record<string, string> = {};
      const fakeLocalStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        }
      };

      (globalThis as any).window = globalThis;
      (globalThis as any).localStorage = fakeLocalStorage;
      (globalThis as any).document = { cookie: '' };

      try {
        setStoredToken('test-jwt-token-123');
        expect(getStoredToken()).toBe('test-jwt-token-123');

        setStoredToken(null);
        expect(getStoredToken()).toBeNull();
      } finally {
        delete (globalThis as any).window;
        delete (globalThis as any).localStorage;
        delete (globalThis as any).document;
      }
    });
  });

  describe('Llamadas HTTP con apiGet / apiPost / apiUpload', () => {
    it('apiGet envía método GET y parsea respuesta JSON', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' })
      });

      const res = await apiGet<{ status: string }>('/health', { fetch: mockFetch as any });
      expect(res).toEqual({ status: 'ok' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('apiGet inyecta Authorization Bearer si se provee token', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'usr-1' })
      });

      await apiGet('/auth/me', {
        token: 'token-abc',
        fetch: mockFetch as any
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );
      const calledHeaders: Headers = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.get('Authorization')).toBe('Bearer token-abc');
    });

    it('apiPost envía JSON y Content-Type application/json', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: 'bch-123' })
      });

      const body = { latitud: -25.28, longitud: -57.60, direccion: 'Av. España' };
      const res = await apiPost<{ id: string }>('/baches', body, { fetch: mockFetch as any });

      expect(res).toEqual({ id: 'bch-123' });
      const calledHeaders: Headers = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.get('Content-Type')).toBe('application/json');
      expect(mockFetch.mock.calls[0][1].body).toBe(JSON.stringify(body));
    });

    it('apiUpload envía FormData sin forzar Content-Type', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ foto_url: 'https://cdn.bacheemos.gov.py/foto.jpg' })
      });

      const formData = new FormData();
      formData.append('file', new Blob(['fake image']), 'foto.jpg');

      const res = await apiUpload<{ foto_url: string }>('/baches/upload', formData, {
        fetch: mockFetch as any
      });

      expect(res.foto_url).toBe('https://cdn.bacheemos.gov.py/foto.jpg');
      const calledHeaders: Headers = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders.has('Content-Type')).toBe(false);
    });

    it('lanza ApiError con status y detalle cuando la respuesta es errónea', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ detail: 'Credenciales inválidas' })
      });

      await expect(
        apiGet('/auth/me', { token: 'invalido', fetch: mockFetch as any })
      ).rejects.toThrow(ApiError);

      try {
        await apiGet('/auth/me', { token: 'invalido', fetch: mockFetch as any });
      } catch (e) {
        const err = e as ApiError;
        expect(err.status).toBe(401);
        expect(err.message).toBe('Credenciales inválidas');
      }
    });
  });
});
