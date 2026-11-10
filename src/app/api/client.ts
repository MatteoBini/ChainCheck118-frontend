import { readStored, writeStored } from '@/lib';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Mock solo per auth, recenti e centrale: la checklist usa sempre il backend. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const TOKEN_KEY = 'cc118.token';

export function getToken(): string | null {
  return readStored(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  writeStored(TOKEN_KEY, token);
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

type JsonBody = Record<string, unknown> | readonly unknown[];

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: JsonBody;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const token = getToken();
  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body) init.body = JSON.stringify(body);
  if (signal) init.signal = signal;

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    // Un 401 senza token (es. login errato) non è una sessione scaduta.
    if (response.status === 401 && token) {
      setToken(null);
      onUnauthorized?.();
    }
    const payload = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'HTTP_ERROR',
      payload?.error?.message ?? `Richiesta ${method} ${path} non riuscita (${response.status})`,
      payload?.error?.details,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
