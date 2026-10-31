// TripGuard AI - What-If Disruption Simulator Modal
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CloudRain, 
  Bus, 
  DollarSign, 
  Building2, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

interface DisruptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisruptionSimulatorModal: React.FC<DisruptionSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { activeTrip, activeItinerary, simulateDisruption, isReplanning } = useTrip();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'rain' | 'transport' | 'budget' | 'closure'>('rain');

  // Scenario 1: Rain fields
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedOutdoorActivityId, setSelectedOutdoorActivityId] = useState<string>('');
  const [rainAmountMm, setRainAmountMm] = useState<number>(45);

  // Scenario 2: Transport fields
  const [transportDisruptionType, setTransportDisruptionType] = useState<string>('Express Highway Corridor Closed');

  // Scenario 3: Budget fields
  const [reducedBudgetINR, setReducedBudgetINR] = useState<number>(
    Math.round((activeTrip?.budget || 45000) * 0.75)
  );

  // Scenario 4: Closure fields
  const [selectedClosureActivityId, setSelectedClosureActivityId] = useState<string>('');

  if (!isOpen) return null;

  const currentDay = activeItinerary?.itinerary_data.days.find(d => d.dayNumber === selectedDayNumber);
  const outdoorActivities = currentDay?.activities.filter(a => a.indoorOutdoor === 'outdoor') || [];
  const allActivities = activeItinerary?.itinerary_data.days.flatMap(d => d.activities) || [];

  const handleExecuteSimulation = async () => {
    try {
      if (activeTab === 'rain') {
        const targetAct = outdoorActivities.find(a => a.id === selectedOutdoorActivityId) || outdoorActivities[0];
        await simulateDisruption('rain', {
          dayNumber: selectedDayNumber,
          activityId: targetAct?.id,
          activityName: targetAct?.name,
          details: `Monsoon storm simulated with ${rainAmountMm}mm rainfall and 95% precipitation certainty.`,
        });
      } else if (activeTab === 'transport') {
        await simulateDisruption('transport', {
          activityId: allActivities[0]?.id,
          activityName: `${activeTrip.origin} to ${activeTrip.destination} Highway Transit`,
          details: `${transportDisruptionType} — requires route bypass and transit re-scheduling.`,
        });
      } else if (activeTab === 'budget') {
        await simulateDisruption('budget', {
          reducedBudget: Number(reducedBudgetINR),
          details: `Traveler reduced maximum budget from ₹${activeTrip.budget.toLocaleString('en-IN')} to ₹${Number(reducedBudgetINR).toLocaleString('en-IN')}.`,
        });
      } else {
        const targetAct = allActivities.find(a => a.id === selectedClosureActivityId) || allActivities[0];
        await simulateDisruption('closure', {
          activityId: targetAct?.id,
          activityName: targetAct?.name,
          details: `Attraction unexpectedly closed for emergency conservation & protocol inspection.`,
        });
      }

      onClose();
      navigate('/replanning');
    } catch (err) {
      console.error('Simulation execution failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-navy-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">SIMULATE A DISRUPTION</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  WHAT-IF ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute actual backend multi-agent replanning & validation across 4 disruption scenarios.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-navy-950/40 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('rain')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rain'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
            }`}
          >
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span>Heavy Rain</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'transport'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
            }`}
          >
            <Bus className="w-4 h-4 text-amber-400" />
            <span>Transport</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'budget'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Budget Cut</span>
          </button>

          <button
            onClick={() => setActiveTab('closure')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'closure'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-rose-400" />
            <span>Venue Closure</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              <span className="font-bold">Autonomous partial replanning guaranteed:</span> Unaffected activities remain preserved in their original time slots. Only disrupted activities are substituted, budget is deterministically recalculated, and 10 validation rules run before revision is proposed.
            </p>
          </div>

          {/* Scenario 1: Rainfall */}
          {activeTab === 'rain' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Select Travel Day
                  </label>
                  <select
                    value={selectedDayNumber}
                    onChange={(e) => {
                      setSelectedDayNumber(Number(e.target.value));
                      setSelectedOutdoorActivityId('');
                    }}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    {activeItinerary?.itinerary_data.days.map((d) => (
                      <option key={d.dayNumber} value={d.dayNumber}>
                        Day {d.dayNumber} ({d.date}) — {d.theme}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                    Simulated Rainfall Level
                  </label>
                  <select
                    value={rainAmountMm}
                    onChange={(e) => setRainAmountMm(Number(e.target.value))}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value={25}>Moderate Downpour (25mm)</option>
                    <option value={45}>Severe Heavy Rainfall (45mm)</option>
                    <option value={80}>Torrential Monsoon Cloudburst (80mm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Target Outdoor Activity to Disrupt
                </label>
                {outdoorActivities.length > 0 ? (
                  <select
                    value={selectedOutdoorActivityId}
                    onChange={(e) => setSelectedOutdoorActivityId(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                  >
                    {outdoorActivities.map((act) => (
                      <option key={act.id} value={act.id}>
                        {act.startTime} - {act.name} (Outdoor)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-navy-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No outdoor activities on this day. The Replanning Agent will evaluate scheduled outdoor events on subsequent days.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scenario 2: Transport */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Transit Disruption Scenario
                </label>
                <select
                  value={transportDisruptionType}
                  onChange={(e) => setTransportDisruptionType(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Express Highway Corridor Closed">NH Highway Section Closed for Emergency Repair</option>
                  <option value="Scheduled Express Train Cancelled">Express Rail Connection Cancelled (Engine Fault)</option>
                  <option value="Intercity Bus Service Suspended">Intercity Luxury Bus Suspended (Roadworks)</option>
                </select>
              </div>
              <p className="text-xs text-slate-400">
                Transport Agent will evaluate alternative detour routes via OSRM, recalculate transit duration, and shift downstream activity start times without cancelling destination visits.
              </p>
            </div>
          )}

          {/* Scenario 3: Budget */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Reduce Maximum Authorized Budget (INR)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={reducedBudgetINR}
                      onChange={(e) => setReducedBudgetINR(Number(e.target.value))}
                      className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    Current: ₹{activeTrip.budget.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Budget Agent audits individual expense items, flags expensive ticketed activities, and swaps them for free heritage walking trails and scenic public viewpoints.
              </p>
            </div>
          )}

          {/* Scenario 4: Closure */}
          {activeTab === 'closure' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Select Attraction to Close
                </label>
                <select
                  value={selectedClosureActivityId}
                  onChange={(e) => setSelectedClosureActivityId(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
                >
                  {allActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      Day {act.dayNumber}: {act.name} ({act.location.name})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400">
                Replanning Agent searches nearby verified cultural venues matching traveler interest profile within a 2km radius to avoid schedule disruptions.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-navy-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Labeled as SIMULATED in activity logs</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteSimulation}
              disabled={isReplanning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isReplanning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Agents Replanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Simulated Replanning</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
