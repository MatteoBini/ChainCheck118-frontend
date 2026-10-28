import { readStored, writeStored } from '@/lib';

/** Il backend è raggiunto sempre tramite proxy (Vite in sviluppo, nginx in produzione) che rimuove /api. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Se true gli endpoint rispondono con i dati di src/app/api/mock. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const TOKEN_KEY = 'cc118.token';

/** JWT restituito da POST /auth/login, inviato come Bearer a ogni richiesta. */
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
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Formato degli errori del backend: { error: { code, message, details? } }. */
interface ErrorBody {
  error?: { code?: string; message?: string };
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
    const payload = (await response.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'HTTP_ERROR',
      payload?.error?.message ?? `Richiesta ${method} ${path} non riuscita (${response.status})`,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
