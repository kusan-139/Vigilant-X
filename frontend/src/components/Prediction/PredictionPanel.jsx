import { useState } from 'react';
import { mockPredictions } from '../../services/mockData';
import { Activity, AlertTriangle, Target, Brain, Clock, Server, Flame } from 'lucide-react';
import useStore from '../../store';

function ProgressRing({ value, max = 100, color, size = 80, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold font-mono text-sm" style={{ color }}>{pct}%</span>
        {label && <span className="text-[9px] text-center leading-tight mt-0.5 text-slate-500" style={{ maxWidth: '40px' }}>{label}</span>}
      </div>
    </div>
  );
}

function ModelStatusBadge({ status }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`status-dot ${status === 'Running' ? 'active' : 'offline'}`} style={{ width: '6px', height: '6px' }} />
      <span className="text-[10px] font-bold tracking-widest text-slate-500">
        {status.toUpperCase()}
      </span>
    </div>
  );
}

export default function PredictionPanel() {
  const { disasters } = useStore();
  const activeDisasters = disasters.filter(d => d.status === 'active');

  const activeFlood = activeDisasters.find(d => d.type === 'flood');
  const activeWildfire = activeDisasters.find(d => d.type === 'wildfire');

  const hasActiveFlood = !!activeFlood;
  const hasActiveWildfire = !!activeWildfire;
  const hasAnyActive = activeDisasters.length > 0;

  // Dynamically calculate model stats based on active disasters
  const models = [
    {
      model: 'Flood Expansion Model',
      accuracy: hasActiveFlood ? '87' : '--',
      algo: 'Gradient Boosting v2',
      status: hasActiveFlood ? 'Running' : 'Standby',
      color: hasActiveFlood ? 'var(--steel)' : '#94a3b8'
    },
    {
      model: 'Wildfire Spread Predictor',
      accuracy: hasActiveWildfire ? '79' : '--',
      algo: 'Cellular Automata ML',
      status: hasActiveWildfire ? 'Running' : 'Standby',
      color: hasActiveWildfire ? 'var(--red)' : '#94a3b8'
    },
    {
      model: 'Risk Zone Classifier',
      accuracy: hasAnyActive ? '92' : '--',
      algo: 'Random Forest v3',
      status: hasAnyActive ? 'Running' : 'Standby',
      color: hasAnyActive ? 'var(--green)' : '#94a3b8'
    },
    {
      model: 'Crowd Movement Analysis',
      accuracy: hasAnyActive ? '74' : '--',
      algo: 'LSTM Neural Net',
      status: hasAnyActive ? 'Running' : 'Standby',
      color: hasAnyActive ? 'var(--amber)' : '#94a3b8'
    }
  ];

  // Dynamically calculate risk zones from active disasters in the store, falling back to mock data if empty
  const zones = activeDisasters.length > 0
    ? activeDisasters.map(d => {
        let radius = 10000;
        if (d.severity === 'critical') radius = 20000;
        else if (d.severity === 'high') radius = 15000;
        else if (d.severity === 'moderate') radius = 10000;
        else radius = 5000;

        if (d.type === 'storm') radius *= 2;
        if (d.radius_km) radius = d.radius_km * 1000;

        return {
          lat: d.lat,
          lng: d.lng,
          risk: d.severity,
          radius: radius,
          type: d.type,
          title: d.title
        };
      })
    : mockPredictions.risk_zones;

  const [updateTime] = useState(() => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  });

  // Get regions dynamically for active predictions or fallbacks
  const floodRegion = activeFlood
    ? (activeFlood.title.includes('—') ? activeFlood.title.split('—')[1].trim() : activeFlood.title)
    : mockPredictions.flood.region;

  const fireRegion = activeWildfire
    ? (activeWildfire.title.includes('—') ? activeWildfire.title.split('—')[1].trim() : activeWildfire.title)
    : mockPredictions.wildfire.region;

  const flood = mockPredictions.flood;
  const fire  = mockPredictions.wildfire;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* ── AI Engine Status ── */}
      <div className="gov-card p-5 xl:col-span-3">
        <div className="section-header">
          <Server className="w-4 h-4 text-steel" style={{ color: 'var(--steel)' }} />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">AI PREDICTION ENGINE — MODEL STATUS</h2>
          <span className="badge-low ml-auto text-[9px] tracking-widest">ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {models.map((m) => (
            <div key={m.model} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300"
              style={{ borderTop: `3px solid ${m.color}`, opacity: m.status === 'Standby' ? 0.75 : 1 }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-bold text-navy leading-snug">{m.model}</span>
              </div>
              <div className="text-3xl font-bold font-display mb-0.5" style={{ color: m.status === 'Standby' ? '#94a3b8' : m.color }}>
                {m.accuracy}{m.accuracy !== '--' ? '%' : ''}
              </div>
              <div className="text-[10px] mb-2 text-slate-500">Confidence Score</div>
              <div className="text-[9px] mb-3 font-mono text-slate-400">{m.algo}</div>
              <ModelStatusBadge status={m.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Flood Forecast ── */}
      {hasActiveFlood ? (
        <div className="gov-card p-5">
          <div className="section-header">
            <div className="w-1 h-4 rounded-full bg-steel" style={{ background: 'var(--steel)' }} />
            <h2 className="font-display font-bold text-navy tracking-wide text-sm">FLOOD EXPANSION FORECAST</h2>
            <span className="badge-low ml-auto text-[9px] tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">RUNNING</span>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <ProgressRing value={flood.confidence} color="var(--steel)" label="Conf." />
            <div>
              <div className="text-sm font-bold text-steel" style={{ color: 'var(--steel)' }}>{floodRegion}</div>
              <div className="text-[10px] mt-1 uppercase tracking-widest text-slate-500">Risk Level</div>
              <span className="badge-critical mt-1 text-[9px] tracking-widest">{activeFlood.severity.toUpperCase()}</span>
              <div className="text-[11px] mt-2 text-slate-600">
                Rate: <span className="font-bold text-navy">{flood.expansion_rate}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {[
              { label: '+6 Hours',  value: flood.predicted_extent_6h,  max: 120, color: 'var(--steel)' },
              { label: '+12 Hours', value: flood.predicted_extent_12h, max: 120, color: 'var(--amber)' },
              { label: '+24 Hours', value: flood.predicted_extent_24h, max: 120, color: 'var(--red)' },
            ].map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-mono text-slate-500">{p.label}</span>
                  <span className="font-bold" style={{ color: p.color }}>{p.value} km²</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${(p.value / p.max) * 100}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span className="text-[11px] font-bold text-red-700">24-HR PROJECTION</span>
            </div>
            <p className="text-[11px] text-slate-600">
              {flood.affected_population_24h.toLocaleString()} civilians at risk of displacement
            </p>
          </div>
        </div>
      ) : (
        <div className="gov-card p-5 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="section-header">
              <div className="w-1 h-4 rounded-full bg-slate-300" />
              <h2 className="font-display font-bold text-slate-400 tracking-wide text-sm">FLOOD EXPANSION FORECAST</h2>
              <span className="badge-low ml-auto text-[9px] tracking-widest bg-slate-100 text-slate-500 border border-slate-200">STANDBY</span>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mb-4">
                <Activity className="w-6 h-6 text-slate-300 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">No Active Flood Detected</h3>
              <p className="text-[11px] text-slate-400 max-w-[200px] mt-1.5 leading-relaxed">
                The neural expansion engine is monitoring satellite radar feeds. No active flooding events requiring projection.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM SECURE</span>
          </div>
        </div>
      )}

      {/* ── Wildfire Spread ── */}
      {hasActiveWildfire ? (
        <div className="gov-card p-5">
          <div className="section-header">
            <div className="w-1 h-4 rounded-full bg-red-600" />
            <h2 className="font-display font-bold text-navy tracking-wide text-sm">WILDFIRE SPREAD MODEL</h2>
            <span className="badge-low ml-auto text-[9px] tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">RUNNING</span>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <ProgressRing value={fire.confidence} color="var(--red)" label="Conf." />
            <div>
              <div className="text-sm font-bold text-red-600">{fireRegion}</div>
              <div className="text-[11px] mt-2 text-slate-600">
                Direction: <span className="font-bold text-navy">{fire.spread_direction}</span>
              </div>
              <div className="text-[11px] mt-1 text-slate-600">
                Speed: <span className="font-bold text-navy">{fire.spread_speed}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">CONTAINMENT PROBABILITY</span>
              <span className="font-bold" style={{ color: fire.containment_probability < 50 ? 'var(--red)' : 'var(--green)' }}>
                {fire.containment_probability}%
              </span>
            </div>
            <div className="progress-bar-track h-2">
              <div className="progress-bar-fill h-2"
                style={{
                  width: `${fire.containment_probability}%`,
                  background: fire.containment_probability < 50 ? 'var(--red)' : 'var(--green)',
                }} />
            </div>
          </div>

          <div className="p-3 rounded-lg mb-3 bg-orange-50 border border-orange-200">
            <div className="text-[10px] font-bold mb-2 tracking-widest text-amber-600">
              ⚠ THREATENED AREAS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fire.threat_villages.map((v) => (
                <span key={v} className="badge-high text-[10px] tracking-wider">{v}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="gov-card p-5 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="section-header">
              <div className="w-1 h-4 rounded-full bg-slate-300" />
              <h2 className="font-display font-bold text-slate-400 tracking-wide text-sm">WILDFIRE SPREAD MODEL</h2>
              <span className="badge-low ml-auto text-[9px] tracking-widest bg-slate-100 text-slate-500 border border-slate-200">STANDBY</span>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 mb-4">
                <Flame className="w-6 h-6 text-slate-300 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">No Active Wildfire Detected</h3>
              <p className="text-[11px] text-slate-400 max-w-[200px] mt-1.5 leading-relaxed">
                Thermal anomaly sensor feeds show normal levels. The cellular wildfire model is in passive scan mode.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM SECURE</span>
          </div>
        </div>
      )}

      {/* ── Risk Zone Map ── */}
      <div className="gov-card p-5">
        <div className="section-header">
          <div className="w-1 h-4 rounded-full bg-amber-500" />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">RISK ZONE CLASSIFICATION</h2>
        </div>

        {/* Zone summary */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { level: 'CRITICAL', color: 'var(--red)', count: zones.filter(z => z.risk === 'critical').length },
            { level: 'HIGH',     color: 'var(--amber)', count: zones.filter(z => z.risk === 'high').length },
            { level: 'MODERATE', color: 'var(--steel)', count: zones.filter(z => z.risk === 'moderate').length },
            { level: 'LOW',      color: 'var(--green)', count: zones.filter(z => z.risk === 'low').length },
          ].map((s) => (
            <div key={s.level} className="text-center p-2 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[9px] font-bold tracking-widest mt-0.5 text-slate-500">{s.level}</div>
            </div>
          ))}
        </div>

        {/* Zone list */}
        <div className="space-y-0">
          {zones.map((zone, i) => {
            const colors = { critical: 'var(--red)', high: 'var(--amber)', moderate: 'var(--steel)', low: 'var(--green)' };
            const c = colors[zone.risk] || 'var(--steel)';
            return (
              <div key={i} className={`flex items-center gap-3 py-2.5 ${i < zones.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ background: c, boxShadow: `0 0 4px ${c}` }} />
                <div className="flex-1 text-[11px] font-sans font-medium text-slate-500">
                  {zone.lat.toFixed(2)}°N, {zone.lng.toFixed(2)}°E
                  <span className="ml-1.5 font-normal text-slate-400">— r: {(zone.radius/1000).toFixed(0)} km</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
                  style={{ background: `${c}18`, color: c, border: `1px solid ${c}28` }}>
                  {zone.risk.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 text-center text-[10px] font-mono border-t border-gray-100 text-slate-400">
          <Clock className="w-3 h-3 inline mr-1" />
          UPDATED {updateTime} IST
        </div>
      </div>
    </div>
  );
}
