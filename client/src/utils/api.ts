const BASE_URL = '/api';

async function fetchWrapper<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => fetchWrapper<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => fetchWrapper<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => fetchWrapper<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => fetchWrapper(url, { method: 'DELETE' }),
};
