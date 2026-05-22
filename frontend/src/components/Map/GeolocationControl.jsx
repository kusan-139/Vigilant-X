import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import useStore from '../../store';
import { Crosshair, Navigation, AlertTriangle, Loader2 } from 'lucide-react';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function GeolocationControl() {
  const map = useMap();
  const { shelters, setUserLocation, setNearestShelter, setUserRoute, addRescueRequest } = useStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const findNearestShelterAndRoute = async (userLat, userLng) => {
    // 1. Find nearest available shelter
    let nearest = null;
    let minDistance = Infinity;

    shelters.forEach(shelter => {
      // Filter out full shelters
      if (shelter.current_occupancy >= shelter.capacity) return;

      const dist = getDistance(userLat, userLng, shelter.lat, shelter.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = shelter;
      }
    });

    if (!nearest) {
      setError('No available shelters found nearby.');
      setLoading(false);
      return;
    }

    setNearestShelter({ ...nearest, distance: minDistance.toFixed(1) });

    // 2. Get Route from OSRM Public API
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${nearest.lng},${nearest.lat}?overview=full&geometries=geojson`);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // Leaflet uses [lat, lng]
        setUserRoute(coordinates);
      }
    } catch (err) {
      console.error('Routing error:', err);
      // Fallback to straight line if OSRM fails (offline/rate limited)
      setUserRoute([[userLat, userLng], [nearest.lat, nearest.lng]]);
    }

    setLoading(false);
  };

  const handleLocate = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        map.setView([latitude, longitude], 12, { animate: true });
        
        findNearestShelterAndRoute(latitude, longitude);
      },
      (err) => {
        setError('Failed to get location. Please enable GPS.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSOS = () => {
    const loc = useStore.getState().userLocation;
    if (!loc) {
      alert('Please locate yourself first before sending SOS.');
      return;
    }
    
    addRescueRequest({
      id: `sos-${Date.now()}`,
      name: 'User SOS (Map)',
      contact: 'Pending',
      lat: loc[0],
      lng: loc[1],
      situation: 'Automated SOS from Map Geolocation',
      emergency_type: 'General Emergency',
      priority_score: 99,
      status: 'pending',
      age_group: 'unknown',
      submitted_at: new Date().toISOString(),
    });
    
    alert('SOS Signal Sent! Rescue teams have your live coordinates.');
  };

  return (
    <div className="leaflet-bottom leaflet-left" style={{ paddingBottom: '30px', paddingLeft: '10px' }}>
      <div className="leaflet-control flex flex-col gap-2">
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded shadow-md text-xs flex items-center gap-2 max-w-[200px]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleLocate}
          disabled={loading}
          className="bg-white border border-slate-200 text-navy p-2.5 rounded-full shadow-md hover:bg-slate-50 transition-colors flex items-center justify-center"
          title="Locate Me & Find Shelter"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-steel" /> : <Crosshair className="w-5 h-5 text-steel" />}
        </button>

        {useStore.getState().userLocation && (
          <button 
            onClick={handleSOS}
            className="bg-red-600 border border-red-700 text-white p-2.5 rounded-full shadow-md hover:bg-red-700 transition-colors flex items-center justify-center animate-pulse"
            title="SEND SOS"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
