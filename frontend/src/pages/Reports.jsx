import useStore from '../store';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';

export default function Reports() {
  const { disasters } = useStore();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? disasters : disasters.filter((d) => d.type === filter);

  const TYPE_FILTERS = ['all', 'flood', 'wildfire', 'earthquake', 'storm', 'landslide'];

  return (
    <div className="p-5 space-y-5 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1 h-6 rounded-full bg-steel" style={{ background: 'var(--steel)' }} />
            <h1 className="font-display font-bold text-2xl text-navy tracking-wide">INCIDENT REPORTS</h1>
          </div>
          <p className="text-[11px] tracking-wider font-mono ml-3.5 text-slate-500">
            LIVE AND HISTORICAL DISASTER RECORDS · ALL VERIFIED SOURCES
          </p>
        </div>
        <button className="btn-gov-ghost text-[11px] tracking-widest">
          <Download className="w-3.5 h-3.5" /> EXPORT CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all ${
              filter === f 
                ? 'bg-steel text-white border border-steel' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}>
            {f === 'all' ? 'ALL TYPES' : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                {['Incident ID', 'Type', 'Title', 'Severity', 'Affected', 'Status', 'Source', 'Reported At'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const sc = { critical: 'var(--red)', high: 'var(--amber)', moderate: 'var(--steel)', low: 'var(--green)' };
                const stc = { active: 'var(--red)', contained: 'var(--amber)', resolved: 'var(--green)' };
                const emoji = { flood: '🌊', wildfire: '🔥', earthquake: '◉', storm: '⚡', landslide: '⛰️' }[d.type] || '▲';
                return (
                  <tr key={d.id}>
                    <td className="font-mono text-[10px] text-slate-500">{d.id.toUpperCase()}</td>
                    <td className="text-[12px] capitalize text-slate-600">
                      {emoji} {d.type}
                    </td>
                    <td>
                      <div className="text-[12px] font-semibold text-navy max-w-[180px] truncate">{d.title}</div>
                    </td>
                    <td>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded tracking-widest capitalize"
                        style={{ background: `${sc[d.severity]}18`, color: sc[d.severity], border: `1px solid ${sc[d.severity]}28` }}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="text-[12px] text-slate-600">{d.affected?.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: stc[d.status] || '#6b85a0' }} />
                        <span className="text-[11px] font-semibold capitalize" style={{ color: stc[d.status] || '#6b85a0' }}>
                          {d.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {d.source}
                      </span>
                    </td>
                    <td className="text-[11px] font-mono text-slate-500">
                      {new Date(d.reported_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-200 bg-slate-50">
          <span className="text-[10px] font-mono text-slate-500">
            SHOWING {filtered.length} OF {disasters.length} RECORDS
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            LAST UPDATED: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
          </span>
        </div>
      </div>
    </div>
  );
}
