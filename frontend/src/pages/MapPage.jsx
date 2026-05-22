import DisasterMap from '../components/Map/DisasterMap';
import useStore from '../store';
import { useTranslation } from 'react-i18next';
import { Map, Eye, EyeOff, Layers } from 'lucide-react';

const LAYER_CONFIG = [
  { key: 'disasters',     color: '#D62828' },
  { key: 'heatmap',       color: '#F4A261' },
  { key: 'shelters',      color: '#2A9D8F' },
  { key: 'satellite',     color: '#10b981' },
  { key: 'wind',          color: '#3b82f6' },
  { key: 'precipitation', color: '#6366f1' },
  { key: 'temperature',   color: '#ef4444' },
];

// Helper to map layer config keys to i18n translation keys
const getLayerTranslationKey = (key) => {
  const map = {
    disasters: 'incidents',
    evacuation: 'evac',
    precipitation: 'rain',
    temperature: 'temp'
  };
  return map[key] || key;
};

export default function MapPage() {
  const { layers, toggleLayer, mapViewMode } = useStore();
  const { t } = useTranslation();

  return (
    <div style={{ height: 'calc(100vh - 74px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 flex-shrink-0 bg-white border-b border-gray-200">
        <Map className="w-4 h-4 text-steel" style={{ color: 'var(--steel)' }} />
        <h1 className="font-display font-bold text-sm text-navy tracking-widest hidden sm:block">{t('map.title')}</h1>
        <span className="badge-critical text-[9px] tracking-widest">🔴 {t('map.realtime')}</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Layers className="w-3.5 h-3.5 flex-shrink-0 text-slate-500 hidden md:block" />
          <span className="text-[10px] font-bold tracking-widest mr-1 text-slate-500 hidden md:block">{t('map.layers')}</span>
          {LAYER_CONFIG.map((l) => (
            <button key={l.key} onClick={() => toggleLayer(l.key)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold tracking-widest transition-all ${
                layers[l.key] ? '' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              style={layers[l.key] ? {
                background: `${l.color}18`,
                border: `1px solid ${l.color}35`,
                color: l.color,
              } : {}}>
              {layers[l.key] ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
              {t(`map.${getLayerTranslationKey(l.key)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Map (fills remaining height) */}
      <div className="flex-1 relative">
        <DisasterMap fullscreen={true} />

        {/* Legend */}
        {mapViewMode === 'standard' && (
          <div className="absolute bottom-5 right-5 z-[500] rounded-lg overflow-hidden bg-white border border-gray-200 shadow-lg">
            <div className="px-4 py-2.5 text-[9px] font-bold tracking-[0.2em] uppercase bg-slate-50 border-b border-gray-200 text-slate-500">
              {t('map.legend')}
            </div>
            <div className="px-4 py-3 space-y-2 max-h-[150px] overflow-y-auto scrollbar-thin">
              {[
                { color: 'var(--steel)', label: 'Flood Zone' },
                { color: 'var(--red)', label: 'Wildfire' },
                { color: 'var(--amber)', label: 'Earthquake' },
                { color: '#7b3aed', label: 'Storm / Cyclone' },
                { color: '#92400e', label: 'Landslide' },
                { color: 'var(--green)', label: 'Shelter — Available' },
                { color: 'var(--amber)', label: 'Shelter — Crowded' },
                { color: 'var(--red)', label: 'Shelter — Full' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-[11px] text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coordinates display */}
        {mapViewMode === 'standard' && (
          <div className="absolute bottom-5 left-16 z-[500] px-3 py-2 rounded-lg font-mono text-[10px] bg-white border border-gray-200 text-slate-500 shadow-sm hidden md:block">
            INDIA SUBCONTINENT · 20.59°N 78.96°E · ZOOM 5
          </div>
        )}
      </div>
    </div>
  );
}
