// API client for Firestore-backed product endpoints
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function http(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...(options.headers || {}) };
  if (!headers.Authorization) {
    const token = localStorage.getItem('sfm_user_id_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}
export const apiFs = {
  list: () => http('/api/fs/products'),
  create: ({ fields, image, idToken }) => http('/api/fs/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ ...fields, image_secure_url: image.secure_url, image_public_id: image.public_id })
  }),
  delete: ({ id, idToken }) => http(`/api/fs/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  }),
  deleteAll: ({ idToken }) => http('/api/fs/products', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  }),
};
export default apiFs;