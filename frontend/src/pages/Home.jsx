import { useNavigate } from 'react-router-dom';
import { Zap, Map, Shield, AlertTriangle, Activity, ArrowRight, Lock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative z-10 bg-grid-pattern bg-gov-gray">
      {/* Classification banner */}
      <div className="mb-8 px-5 py-2 rounded font-mono text-[11px] font-bold tracking-[0.2em] bg-red-50 text-red-700 border border-red-200">
        🔒 RESTRICTED — FOR AUTHORIZED EMERGENCY PERSONNEL ONLY
      </div>

      {/* Logo */}
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm border border-slate-200">
        <Zap className="w-10 h-10 text-steel" style={{ color: 'var(--steel)' }} />
      </div>

      <div className="text-[11px] font-bold tracking-[0.3em] mb-3 text-steel" style={{ color: 'var(--steel)' }}>
        NATIONAL EMERGENCY OPERATIONS CENTER
      </div>
      <h1 className="font-display font-bold text-6xl text-navy mb-2 tracking-widest" style={{ color: 'var(--navy)' }}>VIGILANT-X</h1>
      <p className="text-sm font-semibold tracking-[0.15em] mb-2 text-steel" style={{ color: 'var(--steel)' }}>
        AI DISASTER MANAGEMENT SYSTEM · VERSION 2.0
      </p>
      <p className="max-w-md mb-10 text-sm leading-relaxed text-slate-600">
        Real-time disaster monitoring, predictive analytics, intelligent shelter allocation, and emergency response coordination for national-level crisis management.
      </p>

      <button onClick={() => navigate('/dashboard')}
        className="btn-gov-primary text-base px-10 py-3.5 mb-3 font-bold tracking-widest">
        ENTER OPERATIONS CENTER <ArrowRight className="w-5 h-5" />
      </button>
      <p className="text-[10px] font-mono text-slate-500">
        Authenticated session required for full access
      </p>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-2xl w-full">
        {[
          { icon: Map,           label: 'LIVE MAP',      sub: 'Real-time incidents',   color: 'var(--steel)' },
          { icon: Shield,        label: 'SHELTERS',      sub: 'AI allocation',         color: 'var(--green)' },
          { icon: AlertTriangle, label: 'EMERGENCY',     sub: 'NLP triage system',     color: 'var(--red)' },
          { icon: Activity,      label: 'PREDICTIONS',   sub: 'ML forecasting',        color: 'var(--amber)' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="gov-card p-4 text-center cursor-pointer gov-card-hover"
            onClick={() => navigate(label === 'LIVE MAP' ? '/map' : label === 'SHELTERS' ? '/shelters' : label === 'EMERGENCY' ? '/emergency' : '/predictions')}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
              style={{ background: `rgba(29,78,137,0.05)`, border: `1px solid rgba(29,78,137,0.15)` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-xs font-bold tracking-widest text-navy mb-0.5">{label}</div>
            <div className="text-[11px] text-slate-500">{sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-[10px] font-mono text-slate-400">
        VIGILANT-X · BUILT FOR INDIA NATIONAL DISASTER RESPONSE FRAMEWORK · © 2026
      </div>
    </div>
  );
}
