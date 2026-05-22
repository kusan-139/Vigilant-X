import Sidebar from './Sidebar';
import Navbar from './Navbar';
import useStore from '../../store';

export default function Layout({ children }) {
  const { sidebarOpen } = useStore();
  const sidebarWidth = sidebarOpen ? 256 : 64;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">

      {/* ── Classification Banner ──────────────────────────── */}
      <div className="gov-classification-bar">
        <span>🔒</span>
        VIGILANT-X  ·  RESTRICTED — AUTHORIZED PERSONNEL ONLY  ·  EMERGENCY OPERATIONS
        <span>🔒</span>
      </div>

      <Sidebar />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          transition: 'margin-left 0.25s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '24px', /* classification bar */
        }}
      >
        <Navbar />
        <main className="flex-1" style={{ paddingTop: '56px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
