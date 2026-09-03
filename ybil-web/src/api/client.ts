const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/api/auth/')) {
    // Attempt token refresh if an authenticated call fails
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiClient<T>(endpoint, options);
    }
  }

  if (!response.ok) {
    const errorBody: ApiErrorResponse = await response.json().catch(() => ({
      status: response.status,
      error: 'Network Error',
      message: response.statusText || 'An error occurred during network request',
    }));
    throw errorBody;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    localStorage.removeItem('access_token');
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error('Token refresh failed');

    const data = await res.json();
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return true;
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  }
}