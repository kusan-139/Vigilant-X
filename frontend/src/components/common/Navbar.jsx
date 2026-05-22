import { Bell, RefreshCw, Clock, Radio, ShieldAlert } from 'lucide-react';
import useStore from '../../store';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { alerts, disasters } = useStore();
  const [time, setTime] = useState(new Date());
  const [showAlerts, setShowAlerts] = useState(false);
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const severityStyle = {
    critical: { bg: 'var(--red-light)', border: 'var(--border-dark)', badge: 'badge-critical' },
    high:     { bg: 'var(--amber-light)', border: 'var(--border-dark)', badge: 'badge-high' },
    moderate: { bg: '#eff6ff', border: 'var(--border-dark)', badge: 'badge-moderate' },
    low:      { bg: 'var(--green-light)', border: 'var(--border-dark)', badge: 'badge-low' },
  };

  return (
    <header
      className="fixed right-0 z-30 flex items-center h-[56px] px-5 gap-4"
      style={{
        top: '24px',
        left: 'var(--sidebar-left, 256px)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        transition: 'left 0.25s ease',
      }}
    >
      {/* ── System ID ─── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <ShieldAlert className="w-4 h-4 text-steel" style={{ color: 'var(--steel)' }} />
        <div>
          <div className="text-[10px] font-bold tracking-[0.15em] text-navy leading-none">NATIONAL EMERGENCY OPS</div>
          <div className="text-[9px] tracking-wider text-muted">VIGILANT-X v2.0 · RESTRICTED</div>
        </div>
      </div>

      <div className="w-px h-8 mx-1 bg-gray-200" />

      {/* ── Incident Ticker ─── */}
      <div className="flex-1 overflow-hidden hidden md:flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded flex-shrink-0 bg-red-50 border border-red-200">
          <Radio className="w-3 h-3 animate-pulse text-red-600" />
          <span className="text-[10px] font-bold tracking-widest text-red-700">
            {disasters.filter((d) => d.status === 'active').length} INCIDENTS
          </span>
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...disasters, ...disasters].filter((d) => d.status === 'active').map((d, i) => {
              const emoji = { flood: '🌊', wildfire: '🔥', earthquake: '◉', storm: '⚡', landslide: '⛰️' }[d.type] || '▲';
              return (
                <span key={`${d.id}-${i}`} className="text-[11px] text-slate-600">
                  <span className="mr-1">{emoji}</span>
                  <span className="font-semibold text-navy">{d.title}</span>
                  <span className="mx-2 text-slate-300">|</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Clock ─── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <div className="text-right">
          <div className="font-mono text-xs font-bold text-navy tracking-wider">{timeStr}</div>
          <div className="text-[9px] tracking-wide text-slate-500 hidden sm:block">{dateStr}</div>
        </div>
      </div>

      <div className="w-px h-8 mx-1 bg-gray-200" />

      {/* ── Alerts Bell ─── */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setShowAlerts(!showAlerts)}
          className="relative p-2 rounded transition-colors hover:bg-gray-100"
          style={{ background: showAlerts ? '#f1f5f9' : 'transparent' }}
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {criticalAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white bg-red-600 shadow-sm">
              {criticalAlerts.length}
            </span>
          )}
        </button>

        {showAlerts && (
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-lg overflow-hidden bg-white shadow-xl border border-gray-200">
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-gray-200">
              <span className="text-xs font-bold text-navy tracking-wide">ACTIVE ALERTS</span>
              <span className="badge-critical text-[9px] tracking-widest">{alerts.length} ALERTS</span>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {alerts.map((alert) => {
                const s = severityStyle[alert.severity] || severityStyle.moderate;
                return (
                  <div key={alert.id} className="px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-slate-50">
                    <div className="flex items-start gap-2.5">
                      <span className={`${s.badge} mt-0.5 flex-shrink-0 text-[9px] tracking-widest`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-navy leading-snug">{alert.title}</p>
                        <p className="text-[10px] mt-0.5 text-slate-500">
                          {new Date(alert.issued_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Status Pill ─── */}
      <div className="px-3 py-1.5 rounded flex-shrink-0 bg-teal-50 border border-teal-200">
        <div className="flex items-center gap-1.5">
          <span className="status-dot active" style={{ width: '6px', height: '6px' }} />
          <span className="text-[10px] font-bold tracking-widest text-teal-700">OPERATIONAL</span>
        </div>
      </div>
    </header>
  );
}
