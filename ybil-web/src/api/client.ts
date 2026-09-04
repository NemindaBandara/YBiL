const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && !endpoint.includes('/api/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performRefreshToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
        return apiClient<T>(endpoint, options);
      }
    } else {
      return new Promise<T>((resolve) => {
        refreshSubscribers.push(() => {
          resolve(apiClient<T>(endpoint, options));
        });
      });
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      status: response.status,
      message: response.statusText || 'Request failed',
    }));
    throw errorBody;
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

async function performRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}