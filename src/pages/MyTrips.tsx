// TripGuard AI - My Trips Registry
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  ArrowRight, 
  Trash2, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { StatusBadge } from '../components/common/Badges';

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const { trips, activeTrip, setActiveTrip, itineraryVersions } = useTrip();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-teal-400" />
            <span>My Trips Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your planned journeys, switch active trip context, and view historical itinerary versions.
          </p>
        </div>

        <button
          onClick={() => navigate('/plan')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-navy-950 hover:bg-teal-400 shadow-lg shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => {
          const isActive = trip.id === activeTrip.id;

          return (
            <div
              key={trip.id}
              className={`p-6 rounded-2xl bg-navy-900/90 border transition-all duration-200 flex flex-col justify-between shadow-xl ${
                isActive
                  ? 'border-teal-500/60 ring-2 ring-teal-500/20 bg-gradient-to-br from-navy-900 to-navy-850'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top Status Row */}
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={trip.status} />
                  {isActive && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      ACTIVE CONTEXT
                    </span>
                  )}
                </div>

                {/* Destination */}
                <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                  {trip.destination}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Departing from {trip.origin}</span>
                </div>

                {/* Details Pill grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-navy-950/80 border border-slate-800/80 text-xs mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Dates</span>
                    <div className="text-slate-300 font-medium truncate">
                      {trip.departure_date}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Party</span>
                    <div className="text-slate-300 font-medium">
                      {trip.travellers} traveler{trip.travellers > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Budget Limit</span>
                    <div className="text-emerald-400 font-bold">
                      ₹{trip.budget.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Preferences</span>
                    <div className="text-slate-300 font-medium truncate">
                      {trip.preferences.pace} • {trip.preferences.transport}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                {isActive ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 transition-colors"
                  >
                    <span>View Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTrip(trip.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition-colors"
                  >
                    <span>Set Active</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
