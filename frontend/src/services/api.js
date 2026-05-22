// Vigilant-X API client
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vx_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Disaster API ──────────────────────────────────────────────
export const disasterAPI = {
  getAll: () => api.get('/api/disasters'),
  getById: (id) => api.get(`/api/disasters/${id}`),
  create: (data) => api.post('/api/disasters', data),
  update: (id, data) => api.put(`/api/disasters/${id}`, data),
};

// ── Shelter API ───────────────────────────────────────────────
export const shelterAPI = {
  getAll: () => api.get('/api/shelters'),
  getById: (id) => api.get(`/api/shelters/${id}`),
  checkin: (id, data) => api.post(`/api/shelters/${id}/checkin`, data),
  checkout: (id) => api.post(`/api/shelters/${id}/checkout`),
  getRecommended: (lat, lng) =>
    api.get(`/api/shelters/recommend?lat=${lat}&lng=${lng}`),
};

// ── Alert API ─────────────────────────────────────────────────
export const alertAPI = {
  getAll: () => api.get('/api/alerts'),
  create: (data) => api.post('/api/alerts', data),
  dismiss: (id) => api.delete(`/api/alerts/${id}`),
};

// ── Emergency NLP API ─────────────────────────────────────────
export const emergencyAPI = {
  analyze: (message, lat, lng, lang = 'en') =>
    api.post('/api/emergency/analyze', { message, lat, lng, language: lang }),
};

// ── Prediction API ────────────────────────────────────────────
export const predictionAPI = {
  getFlood: (region) => api.get(`/api/predictions/flood?region=${region}`),
  getWildfire: (region) => api.get(`/api/predictions/wildfire?region=${region}`),
  getRiskZones: () => api.get('/api/predictions/risk-zones'),
};

// ── Rescue API ────────────────────────────────────────────────
export const rescueAPI = {
  submit: (data) => api.post('/api/rescue/request', data),
  getQueue: () => api.get('/api/rescue/queue'),
  updateStatus: (id, status) => api.patch(`/api/rescue/${id}`, { status }),
};

// ── Routing API ───────────────────────────────────────────────
export const routingAPI = {
  getEvacuationRoute: (fromLat, fromLng, toLat, toLng) =>
    api.get(`/api/routing/evacuate?from_lat=${fromLat}&from_lng=${fromLng}&to_lat=${toLat}&to_lng=${toLng}`),
};

// ── External Data (mock fetch wrappers) ──────────────────────
export const externalAPI = {
  getNASAFIRMS: () => api.get('/api/external/firms'),
  getUSGSEarthquakes: () => api.get('/api/external/usgs'),
  getWeather: (lat, lng) => api.get(`/api/external/weather?lat=${lat}&lng=${lng}`),
};

export default api;
