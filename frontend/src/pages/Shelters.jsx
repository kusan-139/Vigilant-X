import ShelterList from '../components/Shelter/ShelterList';
import { Shield } from 'lucide-react';

export default function Shelters() {
  return (
    <div className="p-5 space-y-5 relative z-10">
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-1 h-6 rounded-full bg-green-600" />
          <h1 className="font-display font-bold text-2xl text-navy tracking-wide">SHELTER NETWORK</h1>
        </div>
        <p className="text-[11px] tracking-wider font-mono ml-3.5 text-slate-500">
          REAL-TIME CAPACITY · AI ALLOCATION · AUTONOMOUS ROUTING · CIVILIAN INTAKE MANAGEMENT
        </p>
      </div>
      <ShelterList />
    </div>
  );
}
