import EmergencyBot from '../components/Emergency/EmergencyBot';
import { useState } from 'react';
import useStore from '../store';
import { ShieldAlert, Send, Users, Phone } from 'lucide-react';

function RescueForm() {
  const { addRescueRequest } = useStore();
  const [form, setForm] = useState({ name: '', contact: '', situation: '', emergency_type: 'rescue', age_group: 'adult' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addRescueRequest({
      id: `r${Date.now()}`, ...form,
      lat: 20.5937 + (Math.random() - 0.5) * 5,
      lng: 78.9629 + (Math.random() - 0.5) * 5,
      priority_score: form.age_group === 'elderly' || form.age_group === 'child' ? 90 : 75,
      status: 'pending', submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-teal-50 border border-teal-200">
        <ShieldAlert className="w-8 h-8 text-teal-600" />
      </div>
      <h3 className="font-display font-bold text-navy text-lg tracking-wide mb-2">REQUEST REGISTERED</h3>
      <p className="text-sm mb-1 text-slate-600">Your request has been logged and AI-prioritized.</p>
      <p className="text-[11px] font-mono mb-4 text-slate-500">Incident ID: RQ-{Date.now().toString().slice(-6)}</p>
      <p className="text-sm font-bold text-teal-700">ETA: 45–90 min · Keep phone available</p>
      <div className="flex gap-3 mt-6">
        <a href="tel:112" className="btn-gov-danger">🚨 Call 112</a>
        <a href="tel:1078" className="btn-gov-primary">📞 NDRF 1078</a>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block text-slate-500">Full Name *</label>
          <input className="input-field" placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block text-slate-500">Contact Number *</label>
          <input className="input-field" placeholder="+91 XXXXX XXXXX" type="tel" value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block text-slate-500">Incident Type</label>
          <select className="input-field" value={form.emergency_type}
            onChange={(e) => setForm({ ...form, emergency_type: e.target.value })}>
            <option value="rescue">Rescue Required</option>
            <option value="medical">Medical Emergency</option>
            <option value="fire">Fire Incident</option>
            <option value="flood">Flood Danger</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block text-slate-500">Age Group</label>
          <select className="input-field" value={form.age_group}
            onChange={(e) => setForm({ ...form, age_group: e.target.value })}>
            <option value="adult">Adult (18–60)</option>
            <option value="child">Child (under 18)</option>
            <option value="elderly">Elderly (60+)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase mb-1.5 block text-slate-500">Situation Description *</label>
        <textarea className="input-field resize-none h-28"
          placeholder="Describe your emergency situation, current location, and number of people involved..."
          value={form.situation} onChange={(e) => setForm({ ...form, situation: e.target.value })} required />
      </div>
      <button type="submit" className="btn-gov-danger w-full justify-center py-3 text-sm font-bold tracking-wide">
        <Send className="w-4 h-4" /> SUBMIT EMERGENCY RESCUE REQUEST
      </button>
      <p className="text-center text-[10px] font-mono text-slate-500">
        Request will be AI-prioritized and assigned to nearest response team
      </p>
    </form>
  );
}

export default function Emergency() {
  const [activeTab, setActiveTab] = useState('bot');
  return (
    <div className="p-5 space-y-4 relative z-10">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-1 h-6 rounded-full bg-red-600" />
          <h1 className="font-display font-bold text-2xl text-navy tracking-wide">EMERGENCY RESPONSE</h1>
        </div>
        <p className="text-[11px] tracking-wider font-mono ml-3.5 text-slate-500">
          AI TRIAGE · NLP ANALYSIS · RESCUE COORDINATION · REAL-TIME DISPATCH
        </p>
      </div>

      {/* Critical Hotline Banner */}
      <div className="p-4 rounded-xl flex items-center gap-4 flex-wrap bg-red-50 border border-red-200">
        <div className="w-1 h-10 rounded-full flex-shrink-0 bg-red-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800 tracking-wide">LIFE-THREATENING EMERGENCY?</p>
          <p className="text-[11px] mt-0.5 text-red-600">
            Do not wait — call emergency services immediately. AI is a supplementary tool only.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { num: '112', label: 'EMERGENCY' },
            { num: '108', label: 'AMBULANCE' },
            { num: '101', label: 'FIRE' },
            { num: '1078', label: 'NDRF' },
          ].map((n) => (
            <a key={n.num} href={`tel:${n.num}`}
              className="flex flex-col items-center px-4 py-2 rounded-lg text-center transition-all bg-white border border-red-200 hover:bg-red-50">
              <span className="text-base font-bold text-red-700 font-mono">{n.num}</span>
              <span className="text-[9px] font-bold tracking-widest text-red-500">{n.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {[
          { key: 'bot',  label: 'AI EMERGENCY BOT' },
          { key: 'form', label: 'SUBMIT RESCUE REQUEST' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded text-[11px] font-bold tracking-widest transition-all ${
              activeTab === tab.key 
                ? 'bg-steel text-white border border-steel' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="gov-card">
        {activeTab === 'bot' ? <EmergencyBot /> : (
          <div className="p-6">
            <h2 className="font-display font-bold text-navy mb-1 tracking-wide">RESCUE REQUEST FORM</h2>
            <p className="text-[11px] mb-5 font-mono text-slate-500">
              AI will assign priority score based on severity, demographics, and location
            </p>
            <RescueForm />
          </div>
        )}
      </div>
    </div>
  );
}
