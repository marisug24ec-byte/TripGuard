import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Layers, 
  LayoutDashboard, 
  Activity, 
  RefreshCw, 
  Wallet, 
  Cpu, 
  Settings, 
  ShieldAlert, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { activeTrip, activeReplanningSession, disruptions } = useTrip();
  const { isDemoMode } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Compass },
    { to: '/plan', label: 'Plan a Trip', icon: Sparkles, highlight: true },
    { to: '/trips', label: 'My Trips', icon: Layers },
    { to: '/dashboard', label: 'Trip Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: Activity },
    { 
      to: '/replanning', 
      label: 'AI Replanning', 
      icon: RefreshCw, 
      badge: activeReplanningSession ? 'PROPOSED' : disruptions.length > 0 ? `${disruptions.length} ALERTS` : undefined,
      badgeColor: activeReplanningSession ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
    },
    { to: '/budget', label: 'Budget Tracker', icon: Wallet },
    { to: '/agents', label: 'Agent Activity', icon: Cpu },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-950 border-r border-slate-800/80 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <NavLink to="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-navy-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">TripGuard</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-500/20 text-teal-400 border border-teal-500/40">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Your Journey. Our Intelligence.</p>
          </div>
        </NavLink>

        {/* Demo Mode or Live Supabase Status */}
        <div className="mt-3.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="font-semibold text-slate-300">
              {isDemoMode ? 'DEMO MODE' : 'SUPABASE CONNECTED'}
            </span>
          </div>
          {isDemoMode && (
            <span className="text-[10px] text-amber-400/90 font-medium">Sample Data</span>
          )}
        </div>
      </div>

      {/* Active Trip Context Widget */}
      <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-gradient-to-br from-navy-900 to-navy-850 border border-teal-500/20">
        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
          Active Trip Context
        </span>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <span className="text-xs font-bold text-white block truncate">{activeTrip.destination}</span>
            <span className="text-[10px] text-slate-400 block">{activeTrip.departure_date} to {activeTrip.return_date}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-teal-500 text-white'}`}>
                {item.badge}
              </span>
            )}
            {item.highlight && !item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                NEW
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>v2.4 Multi-Agent</span>
        </div>
        <span className="text-slate-400">Gemini 1.5</span>
      </div>
    </aside>
  );
};
