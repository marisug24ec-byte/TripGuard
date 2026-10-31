import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  MapPin, 
  CloudRain, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Wallet
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { activeTrip, activeItinerary, itineraryVersions, disruptions } = useTrip();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 lg:p-12 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-950 border border-teal-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Autonomous Multi-Agent Travel Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            TripGuard AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400">
              "Your Journey. Our Intelligence."
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            An intelligent multi-agent platform that generates personalized travel itineraries and <strong className="text-teal-300">autonomously adapts them</strong> when unexpected disruptions strike—heavy rainfall, transit delays, venue closures, or budget reductions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/plan')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 shadow-xl shadow-teal-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-navy-950" />
              <span>Plan a New Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-navy-800/80 hover:bg-navy-700/80 text-white border border-slate-700/80 transition-all"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>View Active Trip ({activeTrip.destination})</span>
            </button>
          </div>
        </div>

        {/* Live Status Pill at bottom right */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">Supervisor + 6 Agents Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300 font-medium">Open-Meteo & OSRM Linked</span>
            </div>
          </div>
          <div className="text-slate-400">
            Itinerary Version: <strong className="text-teal-300">v{activeItinerary?.version || 1}</strong> ({itineraryVersions.length} versions archived)
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-teal-500/40 transition-colors shadow-lg">
          <div className="p-3 w-fit rounded-xl bg-teal-500/10 text-teal-400 mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Autonomous Partial Replanning</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The core engine isolates disrupted segments without regenerating your whole trip. Preserves unaffected activities, inserts vetted alternatives, and recalculates deterministic budgets.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors shadow-lg">
          <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">6 Specialized AI Agents</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Supervisor coordinates Travel Planner, Weather (Open-Meteo), Transport (OSRM), Budget, Disruption Detection, and Replanning agents with full auditability.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-lg">
          <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">What-If Disruption Simulator</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Interactively test the agent swarm against heavy rainfall, transport cancellations, budget reductions, or landmark closures with one-click verification.
          </p>
        </div>
      </div>

      {/* Multi-Agent Architecture Blueprint */}
      <div className="p-6 lg:p-8 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Multi-Agent Architecture</h2>
            <p className="text-xs text-slate-400">Supervisor-driven pipeline with deterministic arithmetic and strict backend validation.</p>
          </div>
          <button 
            onClick={() => navigate('/agents')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Inspect Live Agents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Workflow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { step: '1', title: 'User Request', desc: 'Travel constraints & dates', color: 'border-slate-700 bg-slate-900' },
            { step: '2', title: 'Supervisor', desc: 'Task decomposition', color: 'border-teal-500/50 bg-teal-950/40' },
            { step: '3', title: 'Planner & Weather', desc: 'Open-Meteo & OSRM', color: 'border-cyan-500/50 bg-cyan-950/40' },
            { step: '4', title: 'Budget Agent', desc: 'Deterministic math', color: 'border-emerald-500/50 bg-emerald-950/40' },
            { step: '5', title: 'Disruption Check', desc: 'Identify affected IDs', color: 'border-amber-500/50 bg-amber-950/40' },
            { step: '6', title: 'Replanning', desc: 'Preserve & modify', color: 'border-orange-500/50 bg-orange-950/40' },
            { step: '7', title: 'Validation Engine', desc: '10-rule verification', color: 'border-teal-400 bg-teal-950/60' },
          ].map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${item.color} relative text-center`}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Step {item.step}
              </span>
              <h4 className="text-xs font-bold text-white leading-tight mb-1">{item.title}</h4>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
