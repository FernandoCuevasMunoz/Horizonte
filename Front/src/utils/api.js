const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function getToken() {
  return sessionStorage.getItem('admin_token');
}

export function setToken(t) {
  if (t) sessionStorage.setItem('admin_token', t);
  else sessionStorage.removeItem('admin_token');
}

export function isAuthenticated() {
  return !!getToken();
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) { setToken(null); }
    throw data;
  }
  return data;
}

export const api = {
  login: (password) => request('POST', '/admin/login', { password }),
  forgotPassword: () => request('POST', '/admin/forgot-password'),
  resetPassword: (code, newPassword) => request('POST', '/admin/reset-password', { code, newPassword }),
  verify: () => request('GET', '/admin/verify'),
  getProperties: () => request('GET', '/properties'),
  getFeatured: () => request('GET', '/properties/featured'),
  getProperty: (id) => request('GET', '/properties/' + id),
  getPropertyByCode: (code) => request('GET', '/properties/by-code/' + code),
  createProperty: (p) => request('POST', '/admin/properties', p),
  updateProperty: (id, p) => request('PUT', '/admin/properties/' + id, p),
  deleteProperty: (id) => request('DELETE', '/admin/properties/' + id),
  getMessages: () => request('GET', '/admin/messages'),
  contact: (data) => request('POST', '/contact', data),
};
