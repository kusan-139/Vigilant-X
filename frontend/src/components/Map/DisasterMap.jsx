import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import useStore from '../../store';
import { useTranslation } from 'react-i18next';
import GeolocationControl from './GeolocationControl';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Disaster type config
const DISASTER_CONFIG = {
  flood:      { color: '#1D4E89', emoji: '🌊', label: 'Flood' },
  wildfire:   { color: '#D62828', emoji: '🔥', label: 'Wildfire' },
  earthquake: { color: '#F4A261', emoji: '🔴', label: 'Earthquake' },
  storm:      { color: '#7b3aed', emoji: '🌀', label: 'Cyclone/Storm' },
  landslide:  { color: '#92400e', emoji: '⛰️', label: 'Landslide' },
};

const SEVERITY_OPACITY = { critical: 0.9, high: 0.75, moderate: 0.55, low: 0.35 };
const SEVERITY_WEIGHT  = { critical: 3,   high: 2.5,  moderate: 2,    low: 1.5 };

// OpenWeatherMap API Key (From environment variables)
const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY || 'YOUR_OWM_API_KEY';

// Real weather monitoring stations across all major cities of India (Satellite-reporting grid)
const MAJOR_CITIES = [
  // North
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { name: 'Leh', lat: 34.1526, lng: 77.5770 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  // West
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  // Central
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
  // East
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  // Northeast
  { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { name: 'Shillong', lat: 25.5788, lng: 91.8831 },
  { name: 'Agartala', lat: 23.8315, lng: 91.2868 },
  { name: 'Imphal', lat: 24.8170, lng: 93.9368 },
  { name: 'Gangtok', lat: 27.3314, lng: 88.6138 },
  // South
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
  // Islands
  { name: 'Port Blair', lat: 11.6234, lng: 92.7265 }
];

function getWindDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const val = Math.floor((deg / 22.5) + 0.5);
  return directions[val % 16];
}

const windIcon = (dir, speed, cloudCover) => {
  const isCloudy = cloudCover >= 30;
  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;">
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="transform: rotate(${dir}deg); transition: transform 0.8s ease-in-out; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5" style="width: 22px; height: 22px; filter: drop-shadow(0 0 3px rgba(2, 132, 199, 0.4));">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19,12 12,5 5,12" />
            </svg>
          </div>
          ${isCloudy ? `
            <div title="Cloudy area (${cloudCover}%)" style="position: absolute; top: -6px; right: -8px; background: rgba(241, 245, 249, 0.9); border: 1px solid #cbd5e1; border-radius: 4px; padding: 1.5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;">
                <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.79 0-1.6.17-2.3.5A7 7 0 1 0 3 13.5A3.5 3.5 0 0 0 6.5 17" />
              </svg>
            </div>
          ` : ''}
        </div>
        <span style="font-size: 7.5px; font-weight: 800; color: #0369a1; background: rgba(255,255,255,0.9); padding: 0.5px 3px; border-radius: 3px; border: 1px solid #bae6fd; margin-top: 1px; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          ${Math.round(speed)} km/h
        </span>
      </div>
    `,
    className: 'custom-weather-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const tempIcon = (temp, cloudCover) => {
  let color = '#10b981';
  let isHot = false;
  if (temp >= 40) { color = '#dc2626'; isHot = true; }
  else if (temp >= 35) { color = '#ea580c'; }
  else if (temp >= 30) { color = '#eab308'; }

  const isCloudy = cloudCover >= 30;

  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;">
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <!-- Pulsing heat warning background glow -->
          ${isHot ? `
            <div class="radar-pulse" style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.35; z-index: 1;"></div>
          ` : ''}
          
          <!-- Solid core temperature circle -->
          <div style="width: 26px; height: 26px; border-radius: 50%; background: ${color}; color: white; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.15); z-index: 10; opacity: 1;">
            ${Math.round(temp)}°
          </div>
          
          <!-- Cloud overlay indicator -->
          ${isCloudy ? `
            <div title="Cloudy area (${cloudCover}%)" style="position: absolute; top: -6px; right: -8px; background: rgba(241, 245, 249, 0.95); border: 1px solid #cbd5e1; border-radius: 4px; padding: 1.5px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1); z-index: 20;">
              <svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 10px; height: 10px;">
                <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.79 0-1.6.17-2.3.5A7 7 0 1 0 3 13.5A3.5 3.5 0 0 0 6.5 17" />
              </svg>
            </div>
          ` : ''}
        </div>
      </div>
    `,
    className: 'custom-weather-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const rainIcon = (precip) => L.divIcon({
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Inter', sans-serif;">
      <div style="background: #1e3a8a; color: white; border-radius: 4px; padding: 1.5px 3.5px; border: 1px solid #3b82f6; display: flex; align-items: center; gap: 1px; font-size: 7.5px; font-weight: 800; box-shadow: 0 1.5px 3px rgba(0,0,0,0.15);">
        <svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="width: 9px; height: 9px; margin-right: 1px;">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
          <path d="M16 14v6" />
          <path d="M8 14v6" />
          <path d="M12 16v4" />
        </svg>
        ${precip.toFixed(1)} mm
      </div>
    </div>
  `,
  className: 'custom-weather-icon',
  iconSize: [40, 20],
  iconAnchor: [20, 10]
});


// Shelter color by occupancy
function shelterColor(shelter) {
  const pct = shelter.current_occupancy / shelter.capacity;
  if (pct >= 0.95) return '#D62828';
  if (pct >= 0.75) return '#F4A261';
  return '#2A9D8F';
}

// Heatmap: concentric fading circles per disaster zone
function HeatmapRings({ disaster }) {
  const cfg = DISASTER_CONFIG[disaster.type] || DISASTER_CONFIG.flood;
  const baseRadius = Math.max(12, (disaster.radius_km || 15) / 3);
  const rings = [
    { r: baseRadius * 2.8, opacity: 0.04 },
    { r: baseRadius * 2.0, opacity: 0.08 },
    { r: baseRadius * 1.3, opacity: 0.14 },
    { r: baseRadius * 0.7, opacity: 0.22 },
  ];
  return (
    <>
      {rings.map((ring, i) => (
        <CircleMarker
          key={i}
          center={[disaster.lat, disaster.lng]}
          radius={ring.r}
          color={cfg.color}
          fillColor={cfg.color}
          fillOpacity={ring.opacity}
          weight={0}
          interactive={false}
        />
      ))}
    </>
  );
}

// Evacuation route example (demo polyline)
const EVAC_ROUTES = [
  { from: [26.2006, 92.9376], to: [26.1445, 91.7362], color: '#2A9D8F', label: 'Assam → Guwahati Relief Camp' },
  { from: [30.3165, 78.0322], to: [30.3752, 78.0322], color: '#2A9D8F', label: 'Uttarakhand Fire Zone → Dehradun' },
  { from: [19.8135, 85.8312], to: [20.2961, 85.8245], color: '#F4A261', label: 'Coastal → Bhubaneswar Shelter' },
];

// Live Weather Panel overlay for Windy view mode
function MapViewControl({ selectedCityOnPanel }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCityOnPanel) {
      map.setView([selectedCityOnPanel.lat, selectedCityOnPanel.lng], 7, { animate: true });
    }
  }, [selectedCityOnPanel, map]);
  return null;
}

// Live Weather Panel overlay for Windy view mode
function LiveWeatherPanel({ weatherData, layers, lastSyncTime = new Date(), onCityClick }) {
  const [search, setSearch] = useState('');
  const filtered = weatherData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="absolute top-[115px] left-3 z-[1000] w-76 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl flex flex-col max-h-[360px] overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold tracking-wider text-navy uppercase">Live Station Readings</span>
        </div>
        <span className="text-[8px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
          Sync: {(lastSyncTime || new Date()).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex-shrink-0">
        <input
          type="text"
          placeholder="Filter city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-100">
        {filtered.map((city) => (
          <div
            key={city.name}
            onClick={() => onCityClick(city)}
            className="px-3.5 py-2.5 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs cursor-pointer group"
            title="Click to locate on map"
          >
            <span className="font-semibold text-navy pr-2 group-hover:text-sky-600 transition-colors">{city.name}</span>
            <div className="flex items-center gap-3 text-[9px] font-mono flex-shrink-0">
              {/* Temp */}
              <span className={`px-1.5 py-0.5 rounded transition-all ${layers.temperature ? 'bg-red-50 text-red-600 font-bold border border-red-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                🌡️ {city.temp.toFixed(1)}°C
              </span>
              {/* Wind */}
              <span className={`px-1.5 py-0.5 rounded transition-all ${layers.wind ? 'bg-sky-50 text-sky-600 font-bold border border-sky-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                💨 {city.windSpeed.toFixed(1)}k
              </span>
              {/* Rain */}
              <span className={`px-1.5 py-0.5 rounded transition-all ${layers.precipitation ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                🌧️ {city.precip.toFixed(1)}m
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">No cities found</div>
        )}
      </div>
    </div>
  );
}

function MapClickListener({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function DisasterMap({ fullscreen = false }) {
  const { disasters, shelters, layers, mapCenter, mapZoom, setSelectedDisaster, userLocation, userRoute, nearestShelter, mapViewMode, setMapViewMode } = useStore();
  const { t } = useTranslation();

  const [weatherData, setWeatherData] = useState([]);
  const [clickedLocationWeather, setClickedLocationWeather] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [selectedCityOnPanel, setSelectedCityOnPanel] = useState(null);

  const handleMapClick = (latlng) => {
    const { lat, lng } = latlng;
    setClickedLocationWeather({ lat, lng, loading: true });

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current) {
          setClickedLocationWeather({
            lat,
            lng,
            loading: false,
            temp: data.current.temperature_2m,
            precip: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
            windDir: data.current.wind_direction_10m,
            cloudCover: data.current.cloud_cover,
            time: data.current.time,
            syncTime: new Date()
          });
        } else {
          setClickedLocationWeather(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching click weather:', err);
        setClickedLocationWeather(null);
      });
  };

  const getWindyOverlay = () => {
    if (layers.precipitation) return 'radar';
    if (layers.temperature) return 'temp';
    if (layers.satellite) return 'clouds';
    return 'wind';
  };

  const windyUrl = `https://windy.com/embed2.html?lat=20.5937&lon=78.9629&zoom=5&level=surface&overlay=${getWindyOverlay()}&menu=&message=true&marker=true&forecast=12&calendar=now&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  // Fetch real-time weather from Open-Meteo for all major Indian cities with auto-refresh every 30 seconds
  useEffect(() => {
    const fetchWeather = () => {
      const lats = MAJOR_CITIES.map(s => s.lat).join(',');
      const lngs = MAJOR_CITIES.map(s => s.lng).join(',');
      
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,cloud_cover`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const formatted = data.map((item, idx) => ({
              ...MAJOR_CITIES[idx],
              temp: item.current.temperature_2m,
              precip: item.current.precipitation,
              windSpeed: item.current.wind_speed_10m,
              windDir: item.current.wind_direction_10m,
              cloudCover: item.current.cloud_cover,
              time: item.current.time
            }));
            setWeatherData(formatted);
            setLastSyncTime(new Date());
          }
        })
        .catch((err) => console.error('Error fetching Open-Meteo live weather:', err));
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30000); // 30 seconds auto-refresh
    return () => clearInterval(interval);
  }, []);

  const isWeatherLayerActive = layers.precipitation || layers.wind || layers.temperature;
  const showWindy = mapViewMode === 'windy';

  return (
    <div className={`relative w-full rounded-lg overflow-hidden ${fullscreen ? 'h-full' : 'h-[500px]'}`}
      style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}>

      {/* Map View Mode Selector (2D GIS vs 3D Windy Flow) */}
      <div className="absolute top-3 right-3 z-[1000] flex bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg p-0.5 shadow-md">
        <button
          onClick={() => setMapViewMode('standard')}
          className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md transition-all flex items-center gap-1 ${
            mapViewMode === 'standard'
              ? 'bg-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          🗺️ Standard GIS
        </button>
        <button
          onClick={() => setMapViewMode('windy')}
          className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md transition-all flex items-center gap-1 ${
            mapViewMode === 'windy'
              ? 'bg-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-slate-50'
          }`}
        >
          🌀 Animated 3D Flow
        </button>
      </div>

      {/* Map Layer Badges */}
      <div className={`absolute top-3 z-[500] flex flex-col gap-1.5 ${showWindy ? 'left-3' : 'left-[55px]'}`}>
        <div className="badge-info text-[10px] bg-white border border-slate-200 text-slate-600 shadow-sm">
          {showWindy ? 'Windy.com Radar' : 'OpenStreetMap'}
        </div>
        <div className="badge-critical text-[10px] shadow-sm">🔴 LIVE</div>
      </div>

      {showWindy ? (
        <iframe
          src={windyUrl}
          style={{ width: '100%', height: fullscreen ? '100%' : '500px', border: 'none' }}
          title="Windy Weather Flow"
          allowFullScreen
        />
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: fullscreen ? '100%' : '500px' }}
          zoomControl={true}
          attributionControl={true}
        >
        {/* Base Tiles (Light) or Satellite */}
        {layers.satellite ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={19}
          />
        )}
        <MapViewControl selectedCityOnPanel={selectedCityOnPanel} />
        <MapClickListener onClick={handleMapClick} />

        {selectedCityOnPanel && (
          <Popup
            position={[selectedCityOnPanel.lat, selectedCityOnPanel.lng]}
            onClose={() => setSelectedCityOnPanel(null)}
          >
            <div className="font-sans text-xs w-[180px]">
              <div className="font-bold text-sky-700 border-b border-slate-100 pb-1 mb-1">
                🛰️ {selectedCityOnPanel.name.toUpperCase()} FEED
              </div>
              <div className="text-[10px] text-slate-600 space-y-1">
                <div>Air Temperature: <b>{selectedCityOnPanel.temp}°C</b></div>
                <div>Precipitation: <b>{selectedCityOnPanel.precip} mm</b></div>
                <div>Wind Speed: <b>{selectedCityOnPanel.windSpeed} km/h</b></div>
                <div>Wind Direction: <b>{selectedCityOnPanel.windDir}° ({getWindDirection(selectedCityOnPanel.windDir)})</b></div>
                <div>Cloud Cover: <b>{selectedCityOnPanel.cloudCover}%</b></div>
                <div className="text-[8px] text-slate-400 mt-1 border-t border-slate-100 pt-1 flex flex-col gap-0.5">
                  <div>Observed: <b>{new Date(selectedCityOnPanel.time + 'Z').toLocaleTimeString()} (Station)</b></div>
                  <div>Last Synced: <b className="text-emerald-600">{lastSyncTime.toLocaleTimeString()} (Live)</b></div>
                </div>
              </div>
            </div>
          </Popup>
        )}

        {clickedLocationWeather && (
          <>
            <CircleMarker
              center={[clickedLocationWeather.lat, clickedLocationWeather.lng]}
              radius={6}
              color="#0f172a"
              fillColor="#ffffff"
              fillOpacity={1}
              weight={2}
            />
            <Popup
              position={[clickedLocationWeather.lat, clickedLocationWeather.lng]}
              onClose={() => setClickedLocationWeather(null)}
            >
              <div className="font-sans text-xs w-[180px]">
                <div className="font-bold text-navy border-b border-slate-100 pb-1 mb-1">
                  📍 LIVE WEATHER FEED
                </div>
                {clickedLocationWeather.loading ? (
                  <div className="text-slate-500 py-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-navy animate-ping"></span>
                    Fetching satellite readings...
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-600 space-y-1">
                    <div>Location: <b>{clickedLocationWeather.lat.toFixed(4)}, {clickedLocationWeather.lng.toFixed(4)}</b></div>
                    <div>Air Temperature: <b>{clickedLocationWeather.temp}°C</b></div>
                    <div>Precipitation: <b>{clickedLocationWeather.precip} mm</b></div>
                    <div>Wind Speed: <b>{clickedLocationWeather.windSpeed} km/h</b></div>
                    <div>Wind Direction: <b>{clickedLocationWeather.windDir}° ({getWindDirection(clickedLocationWeather.windDir)})</b></div>
                    <div>Cloud Cover: <b>{clickedLocationWeather.cloudCover}%</b></div>
                    <div className="text-[8px] text-slate-400 mt-1 border-t border-slate-100 pt-1 flex flex-col gap-0.5">
                      <div>Observed: <b>{new Date(clickedLocationWeather.time + 'Z').toLocaleTimeString()} (Station)</b></div>
                      <div>Last Synced: <b className="text-emerald-600">{clickedLocationWeather.syncTime ? clickedLocationWeather.syncTime.toLocaleTimeString() : new Date().toLocaleTimeString()} (Live)</b></div>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </>
        )}
        {/* Real-time Precipitation Markers */}
        {layers.precipitation && weatherData.map((station) => {
          const precipValue = station.precip || 0;
          return (
            <Marker
              key={`rain-${station.name}`}
              position={[station.lat, station.lng]}
              icon={rainIcon(precipValue)}
            >
              <Popup>
                <div className="font-sans text-xs">
                  <div className="font-bold text-navy">🛰️ SATELLITE LIVE RAIN RADAR</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Location: <b>{station.name}</b><br />
                    Precipitation: <b>{precipValue.toFixed(1)} mm</b><br />
                    Cloud Coverage: <b>{station.cloudCover}%</b><br />
                    Status: <b>Live Satellite Observation</b><br />
                    Last Observed: <b>{new Date(station.time + 'Z').toLocaleTimeString()} (Station)</b><br />
                    Last Synced: <b className="text-emerald-600">{lastSyncTime.toLocaleTimeString()} (Live Sync)</b>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Real-time Wind Station Markers */}
        {layers.wind && weatherData.map((station) => (
          <Marker
            key={`wind-${station.name}`}
            position={[station.lat, station.lng]}
            icon={windIcon(station.windDir, station.windSpeed, station.cloudCover)}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <div className="font-bold text-sky-700">💨 SATELLITE WIND DIRECTION FEED</div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      Location: <b>{station.name}</b><br />
                      Wind Speed: <b>{station.windSpeed} km/h</b><br />
                      Direction: <b>{station.windDir}° ({getWindDirection(station.windDir)})</b><br />
                      Cloud Cover: <b>{station.cloudCover}% ({station.cloudCover >= 30 ? 'Cloudy Wind' : 'Clear Sky Wind'})</b><br />
                      Last Observed: <b>{new Date(station.time + 'Z').toLocaleTimeString()} (Station)</b><br />
                      Last Synced: <b className="text-emerald-600">{lastSyncTime.toLocaleTimeString()} (Live Sync)</b>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

        {/* Real-time Temperature Pins */}
        {layers.temperature && weatherData.map((station) => (
          <Marker
            key={`temp-${station.name}`}
            position={[station.lat, station.lng]}
            icon={tempIcon(station.temp, station.cloudCover)}
          >
            <Popup>
              <div className="font-sans text-xs">
                <div className="font-bold text-navy">🌡️ SATELLITE SURFACE TEMPERATURE</div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Location: <b>{station.name}</b><br />
                  Live Satellite Air Temp: <b>{station.temp}°C</b><br />
                  Cloud Cover: <b>{station.cloudCover}% ({station.cloudCover >= 30 ? 'Cloudy Sky' : 'Clear Sky'})</b><br />
                  Last Observed: <b>{new Date(station.time + 'Z').toLocaleTimeString()} (Station)</b><br />
                  Last Synced: <b className="text-emerald-600">{lastSyncTime.toLocaleTimeString()} (Live Sync)</b>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Custom Controls */}
        <GeolocationControl />

        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            color="#ffffff"
            fillColor="#3b82f6"
            fillOpacity={1}
            weight={3}
            className="animate-pulse"
          >
            <Popup>
              <div className="text-xs font-bold text-navy">📍 Your Current Location</div>
              {nearestShelter && (
                <div className="text-[10px] text-slate-600 mt-1">
                  Nearest Safe Shelter: <b>{nearestShelter.name}</b> ({nearestShelter.distance} km)
                </div>
              )}
            </Popup>
          </CircleMarker>
        )}

        {/* Dynamic Evacuation Route */}
        {userRoute && (
          <Polyline
            positions={userRoute}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 8"
          >
            <Popup>
              <div className="text-xs font-bold text-navy">🚗 Escape Route to Nearest Shelter</div>
            </Popup>
          </Polyline>
        )}

        {/* Heatmap Layer — concentric rings per disaster */}
        {layers.heatmap && disasters.filter((d) => d.status === 'active').map((d) => (
          <HeatmapRings key={`heat-${d.id}`} disaster={d} />
        ))}

        {/* Disaster Markers */}
        {layers.disasters && disasters.filter((d) => d.status === 'active').map((disaster) => {
          const cfg = DISASTER_CONFIG[disaster.type] || DISASTER_CONFIG.flood;
          const opacity = SEVERITY_OPACITY[disaster.severity] || 0.6;
          const weight = SEVERITY_WEIGHT[disaster.severity] || 2;

          return (
            <CircleMarker
              key={disaster.id}
              center={[disaster.lat, disaster.lng]}
              radius={disaster.radius_km ? Math.max(10, disaster.radius_km / 3) : 14}
              color={cfg.color}
              fillColor={cfg.color}
              fillOpacity={0.25}
              weight={weight}
              opacity={opacity}
              eventHandlers={{ click: () => setSelectedDisaster(disaster) }}
            >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{cfg.emoji}</span>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0B1F3A' }}>
                        {t(`disasters.${disaster.type}_title`, { defaultValue: disaster.title })}
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                        background: disaster.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                        color: disaster.severity === 'critical' ? '#dc2626' : '#d97706',
                        border: `1px solid ${disaster.severity === 'critical' ? '#fca5a5' : '#fcd34d'}`,
                      }}>{t(`enums.severity.${disaster.severity}`, { defaultValue: disaster.severity }).toUpperCase()}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', lineHeight: '1.5' }}>
                    {t(`disasters.${disaster.type}_desc`, { defaultValue: disaster.description })}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      Affected: <span style={{ color: '#0B1F3A', fontWeight: 'bold' }}>{disaster.affected?.toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      Source: <span style={{ color: '#1D4E89', fontWeight: 'bold', textTransform: 'uppercase' }}>{disaster.source}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Shelter Markers */}
        {layers.shelters && shelters.map((shelter) => (
          <CircleMarker
            key={shelter.id}
            center={[shelter.lat, shelter.lng]}
            radius={8}
            color={shelterColor(shelter)}
            fillColor={shelterColor(shelter)}
            fillOpacity={0.8}
            weight={2}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', minWidth: '200px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0B1F3A', marginBottom: '6px' }}>
                  🏠 {t(`shelters.${shelter.id}`, { defaultValue: shelter.name })}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>{shelter.address}</div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Occupancy</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: shelterColor(shelter) }}>
                      {shelter.current_occupancy}/{shelter.capacity}
                    </span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(shelter.current_occupancy / shelter.capacity) * 100}%`,
                      height: '100%', borderRadius: '4px',
                      background: shelterColor(shelter),
                      transition: 'width 0.5s',
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#475569' }}>
                  Facilities: {shelter.facilities.join(', ')}
                </div>
                <div style={{ fontSize: '10px', color: '#1D4E89', fontWeight: 'bold', marginTop: '4px' }}>{shelter.contact}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Evacuation Routes (Static Examples) */}
        {layers.evacuation && EVAC_ROUTES.map((route, i) => (
          <Polyline
            key={i}
            positions={[route.from, route.to]}
            color={route.color}
            weight={3}
            opacity={0.8}
            dashArray="8, 4"
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#0B1F3A' }}>
                🚗 <strong>Evacuation Route</strong><br />
                {route.label}
              </div>
            </Popup>
          </Polyline>
        ))}
        </MapContainer>
      )}

      {(showWindy || isWeatherLayerActive) && (
        <LiveWeatherPanel
          weatherData={weatherData}
          layers={layers}
          lastSyncTime={lastSyncTime}
          onCityClick={setSelectedCityOnPanel}
        />
      )}
    </div>
  );
}
