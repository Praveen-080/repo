// Simple API client for the new backend
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function http(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      // Allow caller to supply headers; only set JSON content-type when body is plain object
      headers: (() => {
        const base = options.headers || {};
        // If caller passed a FormData, don't set Content-Type (browser will add boundary)
        if (options.body instanceof FormData) return base;
        return { 'Content-Type': 'application/json', ...base };
      })(),
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    // Network or CORS error: surface a clearer message
    if (err?.name === 'TypeError') {
      throw new Error(`Cannot reach API at ${url}. Make sure the backend is running and CORS/port is correct.`);
    }
    throw err;
  }
}
export const api = {
  adminLogin: ({ phone, phn_number, password, name, email }) => http('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ phone, phn_number, password, name, email })
  }),
  adminMe: (idToken) => http('/api/admin/me', { headers: { Authorization: `Bearer ${idToken}` } }),
};
export default api;
