/**
 * Base HTTP & WebSocket API Client
 * Configurable via NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL.
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
export const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000').replace(/\/$/, '');
export const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE || 'auto'; // 'auto' | 'real' | 'demo'

export interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Robust fetch wrapper with automatic timeout and error normalization
 */
export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 4000, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

let lastHealthCheck: { isHealthy: boolean; timestamp: number } | null = null;
const HEALTH_CACHE_TTL_MS = 3000;

/**
 * Checks if the backend server at localhost:8000 is reachable.
 * Caches result for 3 seconds to avoid spamming requests.
 */
export async function checkBackendHealth(): Promise<boolean> {
  if (DATA_MODE === 'demo') return false;

  const now = Date.now();
  if (lastHealthCheck && now - lastHealthCheck.timestamp < HEALTH_CACHE_TTL_MS) {
    return lastHealthCheck.isHealthy;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    // Try checking /api/v1/simulator/layout or baseline /api/network
    const res = await fetch(`${API_BASE_URL}/api/v1/simulator/layout`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(async () => {
      return fetch(`${API_BASE_URL}/api/network`, {
        method: 'GET',
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);
    const isHealthy = res.ok;
    lastHealthCheck = { isHealthy, timestamp: now };
    return isHealthy;
  } catch {
    lastHealthCheck = { isHealthy: false, timestamp: now };
    return false;
  }
}
