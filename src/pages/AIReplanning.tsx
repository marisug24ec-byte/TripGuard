// TripGuard AI - Autonomous Partial Replanning Engine (Core Feature)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  IndianRupee, 
  Layers, 
  Check, 
  X, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { ActivityStateBadge, SeverityBadge } from '../components/common/Badges';
import { DisruptionSimulatorModal } from '../components/simulator/DisruptionSimulatorModal';

export const AIReplanning: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeTrip, 
    activeItinerary, 
    itineraryVersions, 
    activeReplanningSession, 
    approveReplanning, 
    rejectReplanning,
    disruptions 
  } = useTrip();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  const handleApprove = async () => {
    setIsProcessingApproval(true);
    try {
      await approveReplanning();
      navigate('/dashboard');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleReject = () => {
    rejectReplanning();
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <RefreshCw className="w-7 h-7 text-teal-400" />
            <span>Autonomous AI Replanning Engine</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Intelligent partial itinerary adaptation: preserves unaffected activities, modifies only disrupted segments, and validates revised versions.
          </p>
        </div>

        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto shadow-lg shadow-amber-500/20"
        >
          <Zap className="w-4 h-4 fill-navy-950" />
          <span>Simulate a Disruption</span>
        </button>
      </div>

      {/* PENDING REPLANNING SESSION (PROPOSED REVISION) */}
      {activeReplanningSession ? (
        <div className="space-y-6">
          {/* Top Proposed Revision Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-amber-950/30 to-navy-900 border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Proposed Revision v{(activeItinerary?.version || 1) + 1}
                    </h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-navy-950">
                      AWAITING AUTHORIZATION
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeReplanningSession.outcome || 'Autonomous Replanning Agent isolated affected slots and preserved unaffected plans.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-navy-800 text-rose-300 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Revision</span>
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessingApproval}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-navy-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isProcessingApproval ? 'Publishing vNext...' : 'Approve & Publish Version'}</span>
                </button>
              </div>
            </div>

            {/* Financial & Schedule Impact Summary */}
            {activeReplanningSession.proposedItineraryData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Original Cost (v{activeItinerary?.version})</span>
                  <span className="text-base font-bold text-slate-200">
                    ₹{activeItinerary?.total_estimated_cost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Revised Cost (Proposed)</span>
                  <span className="text-base font-bold text-emerald-400">
                    ₹{activeReplanningSession.proposedItineraryData.totalEstimatedCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Remaining Budget</span>
                  <span className="text-base font-bold text-teal-300">
                    ₹{activeReplanningSession.proposedItineraryData.remainingBudget.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Side-by-Side or Detailed Diff Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Itinerary Modification Analysis ({activeReplanningSession.changes.length} Segments Modified)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Unaffected items automatically retained in active schedule
              </span>
            </div>

            <div className="space-y-4">
              {activeReplanningSession.changes.map((diff, index) => (
                <div 
                  key={index}
                  className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-400">Item #{index + 1}</span>
                      <ActivityStateBadge state={diff.changeType} />
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-slate-400">
                        Variance:{' '}
                        <span className={`font-bold ${diff.costDifference > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {diff.costDifference > 0 ? `+₹${diff.costDifference}` : `₹${diff.costDifference}`}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        Schedule:{' '}
                        <span className="font-semibold text-slate-200">{diff.scheduleImpact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side: Original vs Replacement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Activity */}
                    <div className="p-4 rounded-xl bg-navy-950/60 border border-slate-800/80 space-y-2 opacity-80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Original Activity (Disrupted)
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {diff.originalActivity?.name || 'Previous Scheduled Event'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {diff.originalActivity?.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                        <span>{diff.originalActivity?.startTime} – {diff.originalActivity?.endTime}</span>
                        <span>₹{diff.originalActivity?.estimatedExpense}</span>
                      </div>
                    </div>

                    {/* Replacement Activity */}
                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/40 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                          Autonomous Replacement
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                          {diff.replacementActivity?.indoorOutdoor.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {diff.replacementActivity?.name}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {diff.replacementActivity?.description}
                      </p>
                      <div className="flex items-center justify-between pt-2 text-xs text-slate-300">
                        <span>{diff.replacementActivity?.startTime} – {diff.replacementActivity?.endTime}</span>
                        <span className="font-bold text-emerald-400">₹{diff.replacementActivity?.estimatedExpense}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason for modification */}
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200">Autonomous Reasoning: </span>
                      <span className="text-slate-400">{diff.reasonForModification}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Engine 10-Check Audit Box */}
          {activeReplanningSession.validation_result && (
            <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Validation Engine Integrity Audit (10 Rules Verified)</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  PASSED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(activeReplanningSession.validation_result.checksPassed).map(([key, passed]) => (
                  <div key={key} className="p-3 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    {passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NO PENDING REPLANNING SESSION */
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">All Itinerary Corridors Nominal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active itinerary <strong className="text-teal-300">v{activeItinerary?.version || 1}</strong> is currently valid with zero unresolved disruptions. You can test the replanning workflow anytime using the What-If Simulator.
              </p>
            </div>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-navy-950" />
              <span>Launch What-If Disruption Simulator</span>
            </button>
          </div>

          {/* Quick Launch Cards for 4 Simulator Scenarios */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Interactive Test Scenarios</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Heavy Rainfall',
                  desc: 'Simulate 45mm cloudburst; pivots outdoor treks to covered museums.',
                  action: () => setIsSimulatorOpen(true),
                },
                {
                  title: 'Transit Disruption',
                  desc: 'Simulate highway closure or bus cancellation; recalculates via OSRM.',
                  action: () => setIsSimulatorOpen(true),
                },
                {
                  title: 'Budget Reduction',
                  desc: 'Simulate budget cut; swaps premium activities for free heritage walks.',
                  action: () => setIsSimulatorOpen(true),
                },
                {
                  title: 'Attraction Closure',
                  desc: 'Simulate landmark closure; selects nearest cultural counterpart.',
                  action: () => setIsSimulatorOpen(true),
                },
              ].map((sc, i) => (
                <div
                  key={i}
                  onClick={sc.action}
                  className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all shadow-md group"
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                    {sc.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {sc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Version Archive */}
          <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <span>Historical Itinerary Versions ({itineraryVersions.length} Archived)</span>
              </h3>
              <span className="text-xs text-slate-400">Immutability Guaranteed</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {itineraryVersions.map((itin) => (
                <div key={itin.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md font-black bg-navy-950 text-teal-300 border border-slate-800">
                      v{itin.version}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {itin.itinerary_data.days.length} Days • ₹{itin.total_estimated_cost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-500 hidden sm:inline">
                      Generated at {new Date(itin.created_at).toLocaleString()}
                    </span>
                  </div>

                  <span className="text-emerald-400 font-semibold">
                    {itin.version === activeItinerary?.version ? 'ACTIVE IN PRODUCTION' : 'ARCHIVED VERSION'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      <DisruptionSimulatorModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
      />
    </div>
  );
};
