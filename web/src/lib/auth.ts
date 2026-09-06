// Custom Auth Service (Replaces Supabase Auth)
// Communicates with our Go backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const auth = {
  getToken: () => localStorage.getItem('nawasena_token'),
  setToken: (token: string) => localStorage.setItem('nawasena_token', token),
  clearToken: () => localStorage.removeItem('nawasena_token'),
  
  isAuthenticated: () => !!localStorage.getItem('nawasena_token'),

  // Fetch with auto-injected Auth header
  fetchAuth: async (endpoint: string, options: RequestInit = {}) => {
    const token = auth.getToken();
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Default to JSON
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      auth.clearToken();
      window.location.href = '/login';
      throw new Error("Sesi berakhir, silakan login kembali.");
    }

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || data || "Request failed");
    }

    return data;
  }
};
