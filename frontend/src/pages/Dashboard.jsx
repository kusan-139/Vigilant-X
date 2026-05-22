import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DisasterMap from '../components/Map/DisasterMap';
import { LayoutDashboard, Calendar } from 'lucide-react';

export default function Dashboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="p-5 space-y-5 relative z-10">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1 h-6 rounded-full bg-steel" style={{ background: 'var(--steel)' }} />
            <h1 className="font-display font-bold text-2xl text-navy tracking-wide">COMMAND DASHBOARD</h1>
          </div>
          <div className="flex items-center gap-3 ml-3.5">
            <p className="text-[11px] tracking-wider font-mono text-slate-500">
              NATIONAL EMERGENCY OPERATIONS CENTER · VIGILANT-X v2.0
            </p>
            <span className="text-[10px] font-mono text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
              <Calendar className="w-3 h-3" />
              {dateStr}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
            <div className="flex items-center gap-2">
              <span className="status-dot active" style={{ width: '6px', height: '6px' }} />
              <span className="text-[10px] font-bold tracking-[0.18em] text-teal-700">
                LIVE DATA FEED
              </span>
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <span className="text-[10px] font-bold tracking-[0.15em] text-red-700">
              CLASSIFICATION: RESTRICTED
            </span>
          </div>
        </div>
      </div>

      {/* KPI + Panels */}
      <DashboardLayout />

      {/* Live Map Section */}
      <div>
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-gray-200">
          <div className="w-1 h-4 rounded-full bg-steel" style={{ background: 'var(--steel)' }} />
          <h2 className="font-display font-bold text-navy text-sm tracking-wide">LIVE THREAT MAP</h2>
          <span className="badge-critical ml-1 text-[9px] tracking-widest">🔴 REAL-TIME</span>
          <span className="text-[11px] ml-auto font-mono text-slate-500">
            India Subcontinent · OpenStreetMap / CARTO
          </span>
        </div>
        <DisasterMap />
      </div>
    </div>
  );
}
