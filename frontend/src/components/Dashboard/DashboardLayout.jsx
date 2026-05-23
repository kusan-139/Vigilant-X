import useStore from '../../store';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Flame, Activity, Wind, Users, Shield,
  Clock, ChevronRight, TrendingUp, TrendingDown, MapPin, BarChart2, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
/* ── KPI Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color, trend, trendLabel }) {
  const isUp = trend > 0;
  return (
    <div className="gov-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${isUp ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold font-display text-navy leading-none">{value}</div>
        <div className="text-xs font-semibold mt-1 uppercase tracking-wider text-slate-500">{label}</div>
        {sub && <div className="text-[11px] mt-1 text-slate-400">{sub}</div>}
      </div>
      {/* Bottom accent bar */}
      <div className="h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
    </div>
  );
}

/* ── Alert Item ─────────────────────────────────────────────── */
function AlertItem({ alert }) {
  const { t } = useTranslation();
  const severityStyle = {
    critical: { left: 'var(--red)', bg: 'bg-red-50', badge: 'badge-critical' },
    high:     { left: 'var(--amber)', bg: 'bg-orange-50', badge: 'badge-high' },
    moderate: { left: 'var(--steel)', bg: 'bg-blue-50', badge: 'badge-moderate' },
    low:      { left: 'var(--green)', bg: 'bg-teal-50', badge: 'badge-low' },
  };
  const s = severityStyle[alert.severity?.toLowerCase()] || severityStyle.moderate;
  return (
    <div className={`flex items-start gap-0 rounded-lg overflow-hidden transition-colors cursor-pointer border border-gray-100 mb-1.5 hover:shadow-sm ${s.bg}`}>
      <div className="w-1 self-stretch flex-shrink-0 rounded-l-lg" style={{ background: s.left }} />
      <div className="flex-1 px-3 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <span className={`${s.badge} text-[9px] tracking-widest`}>
            {t(`enums.severity.${alert.severity}`, { defaultValue: alert.severity }).toUpperCase()}
          </span>
        </div>
        <p className="text-[12px] font-bold text-navy leading-snug">
          {t(`alerts.${alert.id}_title`, { defaultValue: alert.title })}
        </p>
        <p className="text-[11px] mt-1 line-clamp-2 text-slate-600">
          {t(`alerts.${alert.id}_msg`, { defaultValue: alert.message })}
        </p>
        <div className="flex items-center gap-1 mt-1.5 text-slate-400">
          <Clock className="w-2.5 h-2.5" />
          <span className="text-[10px]">
            {new Date(alert.issued_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Shelter Occupancy Row ──────────────────────────────────── */
function ShelterRow({ shelter }) {
  const { t } = useTranslation();
  const pct = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
  const color = pct >= 95 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'var(--green)';
  const label = pct >= 95 ? 'FULL' : pct >= 75 ? 'CROWDED' : 'OPEN';
  const tName = t(`shelters.${shelter.id}`, { defaultValue: shelter.name });
  const displayParts = tName.split(' ');
  const tLabel = t(`enums.shelter.${label.toLowerCase()}`, { defaultValue: label }).toUpperCase();

  return (
    <div className="py-2.5 border-b border-gray-100">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-bold text-navy truncate max-w-[140px]" title={tName}>
          {displayParts.length > 3 ? displayParts.slice(0, 3).join(' ') + '...' : tName}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {tLabel}
          </span>
          <span className="text-[11px] font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Rescue Queue Item ──────────────────────────────────────── */
function RescueItem({ req, rank }) {
  const { t } = useTranslation();
  const deleteRescueRequest = useStore((s) => s.deleteRescueRequest);
  
  const typeStyle = {
    medical: { color: 'var(--red)', icon: '🚑', label: 'MEDICAL' },
    fire:    { color: 'var(--amber)', icon: '🔥', label: 'FIRE' },
    rescue:  { color: 'var(--steel)', icon: '🆘', label: 'RESCUE' },
    flood:   { color: 'var(--steel)', icon: '🌊', label: 'FLOOD' },
  };
  const typeCfg = typeStyle[req.emergency_type] || typeStyle.rescue;

  return (
    <div className="flex items-center gap-3 py-2.5 transition-colors rounded px-2 -mx-2 border-b border-gray-100 hover:bg-slate-50">
      {/* Rank */}
      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${rank <= 2 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-steel'}`}>
        {rank}
      </div>
      <div className="text-base flex-shrink-0">{typeCfg.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-navy">{req.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${typeCfg.color}18`, color: typeCfg.color, border: `1px solid ${typeCfg.color}28` }}>
              P-{Math.round(req.priority_score)}
            </span>
          </div>
        </div>
        <p className="text-[11px] truncate mt-0.5 text-slate-500">
          {t(`rescues.${req.id}`, { defaultValue: req.situation })}
        </p>
      </div>
      
      {/* Action: Delete request */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Are you sure you want to delete ${req.name}'s rescue request?`)) {
            deleteRescueRequest(req.id);
          }
        }}
        title="Delete Rescue Request"
        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Main Dashboard Layout ──────────────────────────────────── */
export default function DashboardLayout() {
  const navigate = useNavigate();
  const { disasters, shelters, alerts, rescueRequests, deleteAllRescueRequests } = useStore();
  const { t } = useTranslation();
  const activeDisasters = disasters.filter((d) => d.status === 'active');
  const totalAffected   = activeDisasters.reduce((a, d) => a + (d.affected || 0), 0);
  const openShelters    = shelters.filter((s) => s.status === 'open');
  const pendingRescues  = rescueRequests.filter((r) => r.status === 'pending');
  const totalCap        = shelters.reduce((a, s) => a + s.capacity, 0);
  const totalOcc        = shelters.reduce((a, s) => a + s.current_occupancy, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* ── KPI Cards ─── */}
      <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={AlertTriangle} label={t('dashboard.activeDisasters')}   value={activeDisasters.length}
          color="var(--red)" sub={t('dashboard.nationwide')} trend={0} />
        <StatCard icon={Users}         label={t('dashboard.civiliansAffected')}  value={totalAffected.toLocaleString()}
          color="var(--amber)" sub={t('dashboard.needsAssistance')} trend={8} />
        <StatCard icon={Shield}        label={t('dashboard.sheltersActive')}     value={openShelters.length}
          color="var(--green)" sub={`${totalOcc.toLocaleString()} ${t('dashboard.sheltered')}`} />
        <StatCard icon={Activity}      label={t('dashboard.rescuePending')}      value={pendingRescues.length}
          color="var(--steel)" sub={t('dashboard.aiQueue')} trend={-5} />
        <StatCard icon={Wind}          label={t('dashboard.criticalAlerts')}     value={alerts.filter((a) => a.severity.toLowerCase() === 'critical').length}
          color="var(--red)" sub={t('dashboard.broadcasting')} />
      </div>

      {/* ── Active Alerts ─── */}
      <div className="gov-card p-5">
        <div className="section-header">
          <div className="w-1 h-4 rounded-full bg-red-600" />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">{t('dashboard.activeAlerts')}</h2>
          <span className="badge-critical ml-auto text-[9px] tracking-widest">{alerts.length} {t('dashboard.total')}</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin mt-2">
          {alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
        </div>
      </div>

      {/* ── Shelter Capacity ─── */}
      <div className="gov-card p-5">
        <div className="section-header">
          <div className="w-1 h-4 rounded-full bg-green-600" />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">{t('dashboard.shelterStatus')}</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-bold text-green-700">
              {Math.round((totalOcc / totalCap) * 100)}% {t('dashboard.capacity')}
            </span>
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin mt-2">
          {shelters.map((s) => <ShelterRow key={s.id} shelter={s} />)}
        </div>
        <div className="mt-3 pt-3 flex items-center justify-between text-[11px] border-t border-gray-100">
          <span className="text-slate-500">{totalOcc.toLocaleString()} / {totalCap.toLocaleString()} {t('dashboard.totalSheltered')}</span>
          <button 
            onClick={() => navigate('/shelters')} 
            className="flex items-center gap-1 font-semibold text-steel hover:text-navy cursor-pointer"
          >
            {t('dashboard.allShelters')} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Rescue Queue ─── */}
      <div className="gov-card p-5">
        <div className="section-header">
          <div className="w-1 h-4 rounded-full bg-orange-500" />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">{t('dashboard.rescueQueue')}</h2>
          {rescueRequests.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete ALL rescue requests in the queue? This cannot be undone.")) {
                  deleteAllRescueRequests();
                }
              }}
              className="text-[10px] font-bold text-red-600 hover:text-white border border-red-200 hover:border-red-600 hover:bg-red-600 px-2 py-0.5 rounded transition-all duration-200 ml-3"
            >
              Clear All
            </button>
          )}
          <span className="badge-high ml-auto text-[9px] tracking-widest">{pendingRescues.length} {t('dashboard.pending')}</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin mt-2">
          {rescueRequests
            .sort((a, b) => b.priority_score - a.priority_score)
            .map((r, i) => <RescueItem key={r.id} req={r} rank={i + 1} />)}
        </div>
      </div>

      {/* ── Incident Table ─── */}
      <div className="gov-card xl:col-span-3 overflow-hidden">
        <div className="section-header px-5 pt-5 mb-0 pb-4">
          <div className="w-1 h-4 rounded-full bg-steel" />
          <h2 className="font-display font-bold text-navy tracking-wide text-sm">{t('dashboard.incidentRegister')}</h2>
          <span className="text-[11px] ml-auto text-slate-500">
            {activeDisasters.length} {t('dashboard.incidentsRecorded')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                {[
                  t('dashboard.headers.incident'),
                  t('dashboard.headers.type'),
                  t('dashboard.headers.severity'),
                  t('dashboard.headers.affected'),
                  t('dashboard.headers.coordinates'),
                  t('dashboard.headers.source'),
                  t('dashboard.headers.reported')
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeDisasters.map((d) => {
                const sc = { critical: 'var(--red)', high: 'var(--amber)', moderate: 'var(--steel)', low: 'var(--green)' };
                const stc = { active: 'var(--red)', contained: 'var(--amber)', resolved: 'var(--green)' };
                const emoji = { flood: '🌊', wildfire: '🔥', earthquake: '◉', storm: '⚡', landslide: '⛰️' }[d.type] || '▲';
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="text-[12px] font-bold text-navy max-w-[200px] truncate">
                        {t(`disasters.${d.type}_title`, { defaultValue: d.title })}
                      </div>
                      <div className="text-[10px] mt-0.5 truncate max-w-[200px] text-slate-500">
                        {t(`disasters.${d.type}_desc`, { defaultValue: d.description })}
                      </div>
                    </td>
                    <td>
                      <span className="text-[12px] text-slate-600">
                        {emoji} <span className="capitalize">{t(`enums.type.${d.type}`, { defaultValue: d.type })}</span>
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider capitalize"
                        style={{ background: `${sc[d.severity]}18`, color: sc[d.severity], border: `1px solid ${sc[d.severity]}30` }}>
                        {t(`enums.severity.${d.severity}`, { defaultValue: d.severity })}
                      </span>
                    </td>
                    <td className="text-[12px] text-slate-600">{d.affected?.toLocaleString()}</td>
                    <td>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <MapPin className="w-3 h-3" />{d.lat.toFixed(2)}°N {d.lng.toFixed(2)}°E
                      </span>
                    </td>
                    <td className="text-[10px] font-bold uppercase tracking-widest text-steel">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {d.source}
                      </span>
                    </td>
                    <td className="text-[11px] font-mono text-slate-500">
                      {new Date(d.reported_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
