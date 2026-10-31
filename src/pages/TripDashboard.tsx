// TripGuard AI - Trip Dashboard & Visual Itinerary Timeline
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Compass, 
  Hotel, 
  Car, 
  ShieldCheck, 
  Zap, 
  CloudSun, 
  Layers, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { LeafletMap } from '../components/map/LeafletMap';
import { StatCard } from '../components/common/StatCard';
import { ActivityStateBadge, StatusBadge } from '../components/common/Badges';

export const TripDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeTrip, activeItinerary, itineraryVersions, disruptions } = useTrip();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);

  if (!activeItinerary) {
    return (
      <div className="p-12 text-center rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h3 className="text-xl font-bold text-white">No Itinerary Found</h3>
        <p className="text-sm text-slate-400">Generate an itinerary for {activeTrip.destination} to begin.</p>
        <button
          onClick={() => navigate('/plan')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-navy-950"
        >
          Plan Itinerary
        </button>
      </div>
    );
  }

  const { itinerary_data, version } = activeItinerary;
  const currentDay = itinerary_data.days.find((d) => d.dayNumber === selectedDayNumber) || itinerary_data.days[0];
  const allActivitiesCurrentDay = currentDay?.activities || [];

  return (
    <div className="space-y-8">
      {/* Top Banner / Trip Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-teal-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              {activeTrip.origin} → {activeTrip.destination}
            </span>
            <span className="text-slate-600">•</span>
            <StatusBadge status={activeTrip.status} />
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-800 text-teal-300 border border-teal-500/30">
              Itinerary Version v{version}
            </span>
            {itineraryVersions.length > 1 && (
              <span className="text-xs text-slate-400">
                ({itineraryVersions.length} versions archived)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeTrip.destination} Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {itinerary_data.tripSummary}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/monitoring')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-navy-800 text-slate-200 border border-slate-700 hover:border-teal-500/50 transition-colors"
          >
            <CloudSun className="w-4 h-4 text-cyan-400" />
            <span>Weather & Monitoring</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Estimated Cost"
          value={`₹${itinerary_data.totalEstimatedCost.toLocaleString('en-IN')}`}
          subtitle={`Limit: ₹${activeTrip.budget.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="teal"
          badge={`${Math.round((itinerary_data.totalEstimatedCost / activeTrip.budget) * 100)}% Used`}
        />
        <StatCard
          title="Remaining Budget"
          value={`₹${itinerary_data.remainingBudget.toLocaleString('en-IN')}`}
          subtitle="Buffer allocation available"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Trip Duration"
          value={`${itinerary_data.days.length} Days`}
          subtitle={`${activeTrip.departure_date} to ${activeTrip.return_date}`}
          icon={Calendar}
          color="cyan"
        />
        <StatCard
          title="Planned Activities"
          value={itinerary_data.days.reduce((acc, d) => acc + d.activities.length, 0)}
          subtitle={`${activeTrip.preferences.pace} Pace • ${activeTrip.travellers} Traveler(s)`}
          icon={Compass}
          color="blue"
        />
      </div>

      {/* Main Itinerary & Interactive Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Day Navigation & Visual Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {itinerary_data.days.map((day) => {
              const isSelected = day.dayNumber === selectedDayNumber;
              return (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setSelectedDayNumber(day.dayNumber);
                    setSelectedActivityId(undefined);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/60 shadow-md'
                      : 'bg-navy-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  Day {day.dayNumber}
                  <span className="block text-[10px] font-normal opacity-80">{day.date}</span>
                </button>
              );
            })}
          </div>

          {/* Current Day Header */}
          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                Day {currentDay.dayNumber} Theme
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{currentDay.theme}</h3>
            </div>
            {currentDay.weatherForecast && (
              <div className="text-right text-xs">
                <span className="font-semibold text-slate-200 block">
                  {currentDay.weatherForecast.weatherCondition}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {currentDay.weatherForecast.temperatureMax}°C / {currentDay.weatherForecast.temperatureMin}°C
                </span>
              </div>
            )}
          </div>

          {/* Timeline Activity List */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800 before:z-0">
            {allActivitiesCurrentDay.map((act, index) => {
              const isSelected = act.id === selectedActivityId;
              const isModified = act.state === 'modified';

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`relative z-10 pl-12 cursor-pointer transition-all ${
                    isSelected ? 'scale-[1.01]' : ''
                  }`}
                >
                  {/* Step Circle Pin */}
                  <div
                    className={`absolute left-2.5 top-5 w-6 h-6 -translate-x-1/2 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      isModified
                        ? 'bg-amber-500 border-amber-300 text-black'
                        : isSelected
                        ? 'bg-cyan-500 border-cyan-300 text-white'
                        : 'bg-navy-900 border-teal-500/60 text-teal-300'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Card Content */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-navy-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10'
                        : isModified
                        ? 'bg-navy-900/90 border-amber-500/50 shadow-lg'
                        : 'bg-navy-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-navy-950 text-cyan-300 border border-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {act.startTime} – {act.endTime}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {act.estimatedDurationMin} mins
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          act.indoorOutdoor === 'outdoor'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        }`}>
                          {act.indoorOutdoor.toUpperCase()}
                        </span>
                      </div>

                      <ActivityStateBadge state={act.state} />
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight mb-1">
                      {act.name}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {act.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="truncate max-w-xs">{act.location.name}</span>
                        {act.uncertaintyInfo && (
                          <span className="text-[10px] text-amber-400/90 font-medium ml-1">
                            ({act.uncertaintyInfo})
                          </span>
                        )}
                      </div>

                      <div className="text-emerald-400 font-bold">
                        ₹{act.estimatedExpense.toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-500 font-normal ml-1">per person</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Map & Logistics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Leaflet Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Day {currentDay.dayNumber} Geographic Routing</span>
              </h3>
              <span className="text-[10px] text-slate-400">Leaflet & OpenStreetMap</span>
            </div>

            <LeafletMap
              activities={allActivitiesCurrentDay}
              selectedActivityId={selectedActivityId}
              onSelectActivity={(id) => setSelectedActivityId(id)}
              className="h-[380px] w-full"
            />
          </div>

          {/* Logistics & Accommodation Summary */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Hotel className="w-4 h-4 text-cyan-400" />
              <span>Recommended Accommodation</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-white">
                  {itinerary_data.accommodationSuggestion.name}
                </h5>
                <span className="text-xs font-bold text-emerald-400">
                  ₹{itinerary_data.accommodationSuggestion.pricePerNight.toLocaleString('en-IN')}/night
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {itinerary_data.accommodationSuggestion.location} • {itinerary_data.accommodationSuggestion.type}
              </p>
            </div>

            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pt-2">
              <Car className="w-4 h-4 text-teal-400" />
              <span>Transit Recommendation</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-300">
              {itinerary_data.recommendedTransport}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
