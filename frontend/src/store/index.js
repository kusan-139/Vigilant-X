// Vigilant-X — Zustand global state store
import { create } from 'zustand';
import { cacheSheltersOffline } from '../services/indexedDBService';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api`;

const useStore = create((set, get) => ({
  // ── Initial Data Fetch ─────────────────────────────────────
  fetchInitialData: async () => {
    try {
      const [disastersRes, sheltersRes, alertsRes, rescueRes] = await Promise.all([
        fetch(`${API_BASE}/disasters`),
        fetch(`${API_BASE}/shelters`),
        fetch(`${API_BASE}/alerts`),
        fetch(`${API_BASE}/rescue/queue`)
      ]);
      
      const disastersData = await disastersRes.json();
      const sheltersData = await sheltersRes.json();
      const alertsData = await alertsRes.json();
      const rescueData = await rescueRes.json();
      
      // BACKGROUND SYNC: Store shelters in IndexedDB for scalable offline search
      if (sheltersData && sheltersData.shelters) {
        cacheSheltersOffline(sheltersData.shelters);
      }
      
      set({
        disasters: disastersData.disasters || [],
        shelters: sheltersData.shelters || [],
        alerts: alertsData.alerts || [],
        rescueRequests: rescueData.queue || []
      });
    } catch (err) {
      console.error('Failed to fetch initial data from backend:', err);
    }
  },

  // ── Disasters ──────────────────────────────────────────────
  disasters: [],
  setDisasters: (disasters) => set({ disasters }),
  addDisaster: (d) => set((s) => ({ disasters: [d, ...s.disasters] })),

  // ── Shelters ───────────────────────────────────────────────
  shelters: [],
  setShelters: (shelters) => set({ shelters }),
  updateShelterOccupancy: (id, occupancy) =>
    set((s) => ({
      shelters: s.shelters.map((sh) => (sh.id === id ? { ...sh, current_occupancy: occupancy } : sh)),
    })),

  // ── Alerts ─────────────────────────────────────────────────
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts] })),
  dismissAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

  // ── Rescue Requests ────────────────────────────────────────
  rescueRequests: [],
  setRescueRequests: (r) => set({ rescueRequests: r }),
  addRescueRequest: async (r) => {
    try {
      const res = await fetch(`${API_BASE}/rescue/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => {
          if (s.rescueRequests.some((x) => x.id === data.request.id)) return s;
          return { rescueRequests: [data.request, ...s.rescueRequests] };
        });
      }
    } catch (err) {
      console.error('API Error submitting rescue request:', err);
      set((s) => {
        const id = r.id || `r_local_${Date.now()}`;
        const newReq = { ...r, id };
        if (s.rescueRequests.some((x) => x.id === id)) return s;
        return { rescueRequests: [newReq, ...s.rescueRequests] };
      });
    }
  },
  receiveRescueRequest: (r) => {
    set((s) => {
      if (s.rescueRequests.some((x) => x.id === r.id)) return s;
      return { rescueRequests: [r, ...s.rescueRequests] };
    });
  },
  deleteRescueRequest: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/rescue/request/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ rescueRequests: s.rescueRequests.filter((r) => r.id !== id) }));
      }
    } catch (err) {
      console.error('API Error deleting rescue request:', err);
      set((s) => ({ rescueRequests: s.rescueRequests.filter((r) => r.id !== id) }));
    }
  },
  receiveDeletedRescueRequest: (id) => {
    set((s) => ({ rescueRequests: s.rescueRequests.filter((r) => r.id !== id) }));
  },
  deleteAllRescueRequests: async () => {
    try {
      const res = await fetch(`${API_BASE}/rescue/queue`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        set({ rescueRequests: [] });
      }
    } catch (err) {
      console.error('API Error deleting all rescue requests:', err);
      set({ rescueRequests: [] });
    }
  },
  receiveAllDeletedRescueRequests: () => {
    set({ rescueRequests: [] });
  },

  // ── UI State ───────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),
  mapCenter: [20.5937, 78.9629], // India center
  mapZoom: 5,
  setMapView: (center, zoom) => set({ mapCenter: center, mapZoom: zoom }),
  mapViewMode: 'standard', // 'standard' or 'windy'
  setMapViewMode: (mode) => set({ mapViewMode: mode }),

  // ── Layer Visibility ───────────────────────────────────────
  layers: {
    disasters: true,
    heatmap: true,
    shelters: true,
    evacuation: false,
    riskZones: false,
    weather: false,
    wind: false,
    temperature: false,
    precipitation: false,
    satellite: false,
  },
  toggleLayer: (layer) =>
    set((s) => {
      const nextVal = !s.layers[layer];
      const updated = { ...s.layers, [layer]: nextVal };
      // If turning on a weather layer, automatically turn off the other weather layers
      if (nextVal && ['wind', 'precipitation', 'temperature'].includes(layer)) {
        if (layer !== 'wind') updated.wind = false;
        if (layer !== 'precipitation') updated.precipitation = false;
        if (layer !== 'temperature') updated.temperature = false;
      }
      return { layers: updated };
    }),

  // ── Geolocation & Routing ──────────────────────────────────
  userLocation: null,
  setUserLocation: (loc) => set({ userLocation: loc }),
  nearestShelter: null,
  setNearestShelter: (s) => set({ nearestShelter: s }),
  userRoute: null,
  setUserRoute: (route) => set({ userRoute: route }),

  // ── Language ───────────────────────────────────────────────
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  // ── Live Connection & Offline ──────────────────────────────
  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),
  isOffline: false,
  setOffline: (v) => set({ isOffline: v }),

  // ── Selected Disaster ──────────────────────────────────────
  selectedDisaster: null,
  setSelectedDisaster: (d) => set({ selectedDisaster: d }),

  // ── Stats ──────────────────────────────────────────────────
  get stats() {
    const s = get();
    return {
      activeDisasters: s.disasters.filter((d) => d.status === 'active').length,
      totalAffected: s.disasters.reduce((a, d) => a + (d.affected || 0), 0),
      sheltersOpen: s.shelters.filter((sh) => sh.status === 'open').length,
      pendingRescues: s.rescueRequests.filter((r) => r.status === 'pending').length,
      criticalAlerts: s.alerts.filter((a) => a.severity === 'critical').length,
    };
  },
}));

export default useStore;
