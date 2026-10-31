import React from 'react';
import { ActivityState, AgentStatus, DisruptionSeverity, TripStatus } from '../../types';
import { ShieldCheck, AlertTriangle, AlertCircle, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export const StatusBadge: React.FC<{ status: TripStatus | 'valid' | 'invalid' | 'pending' }> = ({ status }) => {
  switch (status) {
    case 'planned':
    case 'valid':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status === 'valid' ? 'Validated' : 'Planned'}
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          Active Journey
        </span>
      );
    case 'disrupted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          Disruption Alert
        </span>
      );
    case 'invalid':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Validation Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
          {status}
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: DisruptionSeverity }> = ({ severity }) => {
  if (severity === 'High') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
        <AlertCircle className="w-3.5 h-3.5" />
        High Severity
      </span>
    );
  }
  if (severity === 'Medium') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <AlertTriangle className="w-3.5 h-3.5" />
        Medium Severity
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
      <Clock className="w-3.5 h-3.5" />
      Low Severity
    </span>
  );
};

export const ActivityStateBadge: React.FC<{ state?: ActivityState }> = ({ state }) => {
  if (state === 'modified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm">
        <RotateCcw className="w-3 h-3" />
        MODIFIED
      </span>
    );
  }
  if (state === 'added') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/50">
        + ADDED
      </span>
    );
  }
  if (state === 'removed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 line-through">
        REMOVED
      </span>
    );
  }
  // preserved or undefined
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <ShieldCheck className="w-3 h-3" />
      PRESERVED
    </span>
  );
};

export const AgentStatusBadge: React.FC<{ status: AgentStatus }> = ({ status }) => {
  switch (status) {
    case 'Running':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          Running
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Completed
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          Idle
        </span>
      );
  }
};
