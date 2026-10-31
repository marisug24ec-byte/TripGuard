import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  MapPin, 
  Calendar, 
  Users, 
  Zap, 
  RefreshCw, 
  UserCircle 
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSimulator }) => {
  const { activeTrip, checkMonitoringUpdates, isReplanning } = useTrip();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuickCheckUpdates = async () => {
    await checkMonitoringUpdates();
    navigate('/monitoring');
  };

  return (
    <header className="h-16 bg-navy-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-navy-900 text-slate-300 hover:text-white border border-slate-800"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Destination Info */}
        <div className="hidden sm:flex items-center gap-3 bg-navy-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>{activeTrip.origin}</span>
            <span className="text-slate-500">→</span>
            <span className="text-white font-bold">{activeTrip.destination}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeTrip.departure_date}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeTrip.travellers} traveler{activeTrip.travellers > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* What-If Disruption Simulator Button */}
        <button
          onClick={onOpenSimulator}
          disabled={isReplanning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-navy-950" />
          <span className="hidden md:inline">SIMULATE A DISRUPTION</span>
          <span className="md:hidden">Simulate</span>
        </button>

        {/* Check for Updates */}
        <button
          onClick={handleQuickCheckUpdates}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-navy-900 text-slate-200 hover:text-white border border-slate-700/60 hover:border-teal-500/40 transition-colors"
          title="Query Open-Meteo & verified feeds for disruptions"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Check Updates</span>
        </button>

        {/* User Pill */}
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-white block leading-tight">{user?.name || 'Traveler'}</span>
            <span className="text-[10px] text-slate-400 block leading-none">{user?.email || 'Logged in'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
