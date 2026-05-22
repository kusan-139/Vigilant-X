import useStore from '../../store';
import { shelterAPI } from '../../services/api';
import { Shield, Users, Phone, MapPin, CheckCircle, AlertCircle, X, Search, ChevronLeft, ChevronRight, FileText, Heart, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const FACILITY_ICONS = { medical: '🏥', food: '🍽️', water: '💧', power: '⚡' };
const FACILITY_COLORS = { medical: 'var(--red)', food: 'var(--green)', water: 'var(--steel)', power: 'var(--amber)' };

function OccupancyGauge({ current, capacity }) {
  const pct = Math.round((current / capacity) * 100);
  const color = pct >= 95 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'var(--green)';
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold font-mono" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

function ShelterCard({ shelter, onSelect, onCheckIn }) {
  const pct = Math.round((shelter.current_occupancy / shelter.capacity) * 100);
  const available = shelter.capacity - shelter.current_occupancy;
  const color = pct >= 95 ? 'var(--red)' : pct >= 75 ? 'var(--amber)' : 'var(--green)';
  const statusLabel = pct >= 95 ? 'AT CAPACITY' : pct >= 75 ? 'CROWDED' : 'AVAILABLE';

  return (
    <div onClick={() => onSelect(shelter)} className="gov-card p-5 cursor-pointer hover:shadow-md transition-shadow">
      {/* Status bar top */}
      <div className="h-0.5 rounded-full -mx-5 -mt-5 mb-4" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-start gap-4">
        <OccupancyGauge current={shelter.current_occupancy} capacity={shelter.capacity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-navy text-sm leading-snug">{shelter.name}</h3>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded tracking-widest flex-shrink-0"
              style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{shelter.address}</span>
          </div>
          <div className="flex items-center gap-3 mb-3 text-[11px]">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="font-bold" style={{ color }}>{shelter.current_occupancy.toLocaleString()}</span>
              <span className="text-slate-500">/ {shelter.capacity.toLocaleString()}</span>
            </div>
            <span className="font-bold text-green-600">
              {available > 0 ? `${available.toLocaleString()} beds free` : 'No capacity'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {shelter.facilities.map((f) => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-50 border border-slate-200 text-slate-600">
                {FACILITY_ICONS[f]} {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100">
        <a href={`tel:${shelter.contact}`}
          className="flex items-center gap-1.5 text-[11px] font-bold text-steel hover:text-navy transition-colors"
          onClick={(e) => e.stopPropagation()}>
          <Phone className="w-3 h-3" />{shelter.contact}
        </a>
        {available > 0 ? (
          <button
            className="btn-gov-primary py-1.5 px-3 text-[11px]"
            onClick={(e) => { e.stopPropagation(); onCheckIn(shelter); }}>
            <CheckCircle className="w-3.5 h-3.5" /> Check In
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
            <AlertCircle className="w-3.5 h-3.5" /> At Capacity
          </span>
        )}
      </div>
    </div>
  );
}

export default function ShelterList() {
  const { shelters, updateShelterOccupancy } = useStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  // Check-in form state
  const [checkinTarget, setCheckinTarget] = useState(null);
  const [checkinForm, setCheckinForm] = useState({ name: '', condition: '', location: '' });
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(null);

  const itemsPerPage = 12;

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, searchQuery]);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkinTarget) return;

    if (!checkinForm.name.trim() || !checkinForm.condition.trim() || !checkinForm.location.trim()) {
      setToast({
        message: 'Please complete all required fields.',
        type: 'error'
      });
      return;
    }

    setLoadingCheckin(true);
    try {
      const response = await shelterAPI.checkin(checkinTarget.id, checkinForm);
      if (response.data && response.data.success) {
        const updatedShelter = response.data.shelter;
        updateShelterOccupancy(checkinTarget.id, updatedShelter.current_occupancy);

        // Update selected shelter if detail modal is open
        if (selected && selected.id === checkinTarget.id) {
          setSelected(prev => ({
            ...prev,
            current_occupancy: updatedShelter.current_occupancy
          }));
        }

        // Show Confirmation screen
        setShowConfirmation({
          shelterName: checkinTarget.name,
          userName: checkinForm.name,
          condition: checkinForm.condition,
          locationInside: checkinForm.location,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: response.data.checkin?.id || `ci-${Math.random().toString(36).substr(2, 6)}`
        });

        setCheckinTarget(null);
        setCheckinForm({ name: '', condition: '', location: '' });
      } else {
        setToast({
          message: response.data.message || 'Check-in failed.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setToast({
        message: err.response?.data?.detail || 'Failed to submit check-in to Supabase.',
        type: 'error'
      });
    } finally {
      setLoadingCheckin(false);
    }
  };

  const filtered = shelters.filter((s) => {
    // 1. Tab filters
    if (filter === 'available' && s.current_occupancy / s.capacity >= 0.95) return false;
    if (filter === 'medical' && !s.facilities.includes('medical')) return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = s.name?.toLowerCase().includes(q);
      const addressMatch = s.address?.toLowerCase().includes(q);
      return nameMatch || addressMatch;
    }

    return true;
  });

  const totalCapacity  = shelters.reduce((a, s) => a + s.capacity, 0);
  const totalOccupancy = shelters.reduce((a, s) => a + s.current_occupancy, 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white animate-fade-in"
          style={{
            borderColor: toast.type === 'success' ? 'var(--green)' : 'var(--red)',
            boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
          }}>
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: toast.type === 'success' ? 'var(--green)' : 'var(--red)' }} />
          <span className="text-xs font-bold text-navy">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-navy ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'TOTAL FACILITIES',   value: shelters.length,                        color: 'var(--steel)' },
          { label: 'CIVILIANS SHELTERED',value: totalOccupancy.toLocaleString(),        color: 'var(--green)' },
          { label: 'BEDS AVAILABLE',     value: (totalCapacity - totalOccupancy).toLocaleString(), color: 'var(--amber)' },
        ].map((s) => (
          <div key={s.label} className="gov-card p-4 text-center">
            <div className="text-3xl font-bold font-display mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search shelters by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-steel bg-white text-navy font-semibold shadow-sm placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-navy"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all',       label: 'All Facilities' },
            { key: 'available', label: 'Available' },
            { key: 'medical',   label: 'Medical Support' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all ${
                filter === f.key
                  ? 'bg-steel text-white border border-steel shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginated.map((shelter) => (
            <ShelterCard key={shelter.id} shelter={shelter} onSelect={setSelected} onCheckIn={setCheckinTarget} />
          ))}
        </div>
      ) : (
        <div className="gov-card p-10 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-3 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">No matching shelters found</h3>
          <p className="text-[11px] text-slate-400 max-w-[250px] mt-1.5">
            Try adjusting your search terms or filters to find available civil shelter facilities.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-[11px] text-slate-500 font-medium">
            Showing <span className="font-bold text-navy">{((page - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold text-navy">{Math.min(page * itemsPerPage, filtered.length)}</span> of{' '}
            <span className="font-bold text-navy">{filtered.length}</span> shelters
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum = idx + 1;
              if (page > 3 && totalPages > 5) {
                if (page + 2 > totalPages) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    page === pageNum
                      ? 'bg-steel text-white shadow-sm border border-steel'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="gov-card p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display font-bold text-navy text-lg">{selected.name}</h2>
                <p className="text-sm mt-0.5 text-slate-500">{selected.address}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <OccupancyGauge current={selected.current_occupancy} capacity={selected.capacity} />
              <div>
                <div className="text-3xl font-bold text-navy font-display">{selected.current_occupancy.toLocaleString()}</div>
                <div className="text-xs text-slate-500">of {selected.capacity.toLocaleString()} capacity</div>
                <div className="text-sm font-bold mt-1 text-green-600">
                  {(selected.capacity - selected.current_occupancy).toLocaleString()} beds available
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
              {selected.facilities.map((f) => (
                <span key={f} className="badge badge-moderate bg-slate-100 text-slate-600 border border-slate-200">{FACILITY_ICONS[f]} {f}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <a href={`tel:${selected.contact}`} className="btn-gov-ghost flex-1 justify-center py-2 text-xs">
                <Phone className="w-4 h-4" /> Contact
              </a>
              {selected.capacity - selected.current_occupancy > 0 ? (
                <button
                  onClick={() => setCheckinTarget(selected)}
                  className="btn-gov-primary flex-1 justify-center py-2 text-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Check In
                </button>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg py-2">
                  <AlertCircle className="w-4 h-4" /> At Capacity
                </span>
              )}
              <button onClick={() => setSelected(null)} className="btn-gov-ghost px-4 py-2 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Popup Modal */}
      {checkinTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="gov-card p-6 max-w-md w-full shadow-2xl bg-white border border-slate-200/80 animate-fade-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-bold text-steel tracking-wider uppercase">VIGILANT-X SECURE REGISTRATION</span>
                <h2 className="font-display font-bold text-navy text-base mt-0.5">Emergency Registry for {checkinTarget.name}</h2>
              </div>
              <button onClick={() => setCheckinTarget(null)} className="p-1 rounded text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={checkinForm.name}
                    onChange={(e) => setCheckinForm({ ...checkinForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-steel bg-white text-navy font-semibold animate-transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Current Condition / Situation *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Heart className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pregnant flooding area, trapped in landslides"
                    value={checkinForm.condition}
                    onChange={(e) => setCheckinForm({ ...checkinForm, condition: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-steel bg-white text-navy font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Trapped Area / Disaster Location *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Village Sector 3 near the river bridge, coordinates area"
                    value={checkinForm.location}
                    onChange={(e) => setCheckinForm({ ...checkinForm, location: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-steel bg-white text-navy font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCheckinTarget(null)} className="btn-gov-ghost flex-1 py-2 justify-center text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loadingCheckin} className="btn-gov-primary flex-1 py-2 justify-center text-xs">
                  {loadingCheckin ? 'Submitting Registration...' : 'Register details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Window Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="gov-card p-6 max-w-md w-full shadow-2xl bg-white border border-slate-200/80 text-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <span className="text-[9px] font-bold tracking-widest text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded uppercase">
              Registration Successful
            </span>
            <h2 className="font-display font-bold text-navy text-lg mt-2.5">Information Logged</h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[280px] mx-auto">
              Your details have been successfully broadcasted and logged securely inside the Supabase network registry.
            </p>

            <div className="my-5 p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Reference ID:</span>
                <span className="font-mono font-bold text-navy">{showConfirmation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Reporting Shelter:</span>
                <span className="font-bold text-navy max-w-[200px] truncate text-right">{showConfirmation.shelterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Full Name:</span>
                <span className="font-bold text-navy">{showConfirmation.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Condition / Situation:</span>
                <span className="font-bold text-green-600 max-w-[200px] truncate text-right">{showConfirmation.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Trapped / Disaster Location:</span>
                <span className="font-bold text-navy max-w-[200px] truncate text-right">{showConfirmation.locationInside}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-[10px]">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</span>
                <span className="font-semibold text-slate-500">{showConfirmation.timestamp}</span>
              </div>
            </div>

            <button onClick={() => setShowConfirmation(null)} className="btn-gov-primary w-full py-2.5 justify-center font-bold">
              Done & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
