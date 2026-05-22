import { NavLink } from 'react-router-dom';
import useStore from '../../store';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Map, AlertTriangle, Shield, Activity,
  FileText, Globe, ChevronLeft, ChevronRight,
  Wifi, WifiOff, Bell, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, key: 'dashboard', badge: null },
  { path: '/map',       icon: Map,             key: 'map',       badge: 'LIVE' },
  { path: '/emergency', icon: AlertTriangle,   key: 'emergency', badge: null },
  { path: '/shelters',  icon: Shield,          key: 'shelters',  badge: null },
  { path: '/predictions',icon: Activity,       key: 'predictions',badge: 'AI' },
  { path: '/reports',   icon: FileText,        key: 'reports',   badge: null },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, isConnected, alerts, disasters, language, setLanguage } = useStore();
  const { t, i18n } = useTranslation();

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const activeCount   = disasters.filter((d) => d.status === 'active').length;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <aside
      className={`fixed left-0 z-40 flex flex-col transition-all duration-250 ${sidebarOpen ? 'w-64' : 'w-16'}`}
      style={{
        top: '24px',
        bottom: 0,
        background: 'var(--navy)',
        borderRight: '1px solid var(--border-light)',
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
      }}
    >
      {/* ── Logo Block ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700 bg-navy-900">
        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-slate-200">
          <Zap className="w-5 h-5 text-steel" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-white tracking-wide leading-none text-base">VIGILANT-X</div>
            <div className="text-[9px] font-semibold tracking-[0.18em] mt-0.5 text-slate-400">
              EMERGENCY OPERATIONS
            </div>
          </div>
        )}
      </div>

      {/* ── System Status ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="mx-3 mt-4 px-3 py-2.5 rounded bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2">
            {isConnected
              ? <Wifi className="w-3.5 h-3.5 text-teal-400" />
              : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
            <span className={`text-[10px] font-bold tracking-widest ${isConnected ? 'text-teal-400' : 'text-red-400'}`}>
              {isConnected ? t('status.online') : t('status.offline')}
            </span>
            <span className="status-dot active ml-auto" />
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>{activeCount} {t('status.activeIncidents')}</span>
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <Bell className="w-2.5 h-2.5" /> {criticalCount} {t('status.critical')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────── */}
      <div className="px-1.5 mt-2 mb-1">
        {sidebarOpen && (
          <div className="px-3 pt-3 pb-1">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-500">
              {t('nav.navigation')}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ path, icon: Icon, key, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-0' : ''}`
            }
            title={!sidebarOpen ? t(`nav.${key}`) : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="flex-1 text-[13px]">{t(`nav.${key}`)}</span>
                {badge && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest ${
                      badge === 'LIVE' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Language Selector ───────────────────────────────── */}
      {sidebarOpen && (
        <div className="px-3 pb-3 border-t border-slate-700 pt-3 mt-auto">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400">
              {t('status.language')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['en', 'hi', 'bn', 'te'].map((lang) => (
              <button key={lang} onClick={() => handleLanguageChange(lang)}
                className={`text-[10px] font-bold py-1 rounded transition-all ${
                  language === lang
                    ? 'bg-steel text-white border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent'
                } border`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Collapse Toggle ─────────────────────────────────── */}
      <button onClick={toggleSidebar}
        className="flex items-center justify-center py-3 transition-colors border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  );
}
