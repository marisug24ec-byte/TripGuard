// TripGuard AI - Visual Multi-Agent Activity & Observability Console
import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Database,
  CloudSun,
  Car,
  IndianRupee,
  RefreshCw,
  Compass
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { AgentLog, AgentName, AgentStatus } from '../types';
import { AgentStatusBadge } from '../components/common/Badges';

interface AgentCardConfig {
  name: AgentName;
  role: string;
  icon: React.ElementType;
  color: string;
}

export const AgentActivity: React.FC = () => {
  const { activeTrip, agentLogs, isGeneratingTrip, isReplanning } = useTrip();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const agents: AgentCardConfig[] = [
    { name: 'Supervisor Agent', role: 'Central Swarm Orchestrator & Task Decomposition', icon: Cpu, color: 'text-teal-400' },
    { name: 'Travel Planning Agent', role: 'Day-by-Day Personalized Scheduling & Geo-Anchoring', icon: Compass, color: 'text-cyan-400' },
    { name: 'Weather Agent', role: 'Open-Meteo Telemetry & Outdoor Safety Assessment', icon: CloudSun, color: 'text-blue-400' },
    { name: 'Transport Agent', role: 'OSRM Route Geometry & Transit Durations', icon: Car, color: 'text-amber-400' },
    { name: 'Budget Agent', role: 'Deterministic Arithmetic Audit & Category Allocation', icon: IndianRupee, color: 'text-emerald-400' },
    { name: 'Disruption Detection Agent', role: 'Disruption Isolation & Impact Pinpointing', icon: AlertTriangle, color: 'text-rose-400' },
    { name: 'Autonomous Replanning Agent', role: 'Intelligent Partial Substitution & Explanations', icon: RefreshCw, color: 'text-teal-300' },
    { name: 'Validation Engine', role: '10-Point Backend Integrity & Constraint Verification', icon: ShieldCheck, color: 'text-emerald-300' },
  ];

  // Helper to find latest status of each agent
  const getLatestAgentStatus = (name: AgentName): { status: AgentStatus; latestTask: string; time?: string } => {
    if (isGeneratingTrip && name === 'Supervisor Agent') {
      return { status: 'Running', latestTask: 'Orchestrating trip creation pipeline...' };
    }
    if (isReplanning && (name === 'Autonomous Replanning Agent' || name === 'Supervisor Agent')) {
      return { status: 'Running', latestTask: 'Analyzing disruption & computing partial substitutions...' };
    }

    const found = agentLogs.find((l) => l.agent_name === name);
    if (found) {
      return {
        status: found.status,
        latestTask: found.task,
        time: new Date(found.created_at).toLocaleTimeString(),
      };
    }

    return {
      status: 'Idle',
      latestTask: 'Awaiting pipeline dispatch',
    };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-teal-400" />
            <span>AI Agent Activity & Observability</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time execution trace of the Supervisor and 6 specialized subagents. Transparent task dispatch and results.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-navy-900 border border-slate-800 text-xs text-slate-300 font-semibold self-start sm:self-auto flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Audit Trail Persisted ({agentLogs.length} Events)</span>
        </div>
      </div>

      {/* Live Workflow Pipeline Flowchart */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Orchestration Pipeline Workflow
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            'User Request',
            'Supervisor Agent',
            'Specialized Agents',
            'Disruption Detection',
            'Autonomous Replanning',
            'Budget Calculation',
            'Validation Engine',
            'Final Validated Result',
          ].map((node, i, arr) => (
            <React.Fragment key={node}>
              <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-slate-800 text-slate-300 font-semibold shadow-sm">
                {node}
              </div>
              {i < arr.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 8 Agent Status Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <span>Specialized Agent Swarm Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const current = getLatestAgentStatus(agent.name);
            const Icon = agent.icon;

            return (
              <div
                key={agent.name}
                className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800">
                      <Icon className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    <AgentStatusBadge status={current.status} />
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {agent.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {agent.role}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">
                    Latest Task
                  </span>
                  <p className="text-slate-300 line-clamp-2 text-[11px] leading-relaxed">
                    {current.latestTask}
                  </p>
                  {current.time && (
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      {current.time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Audit Log Table with JSON Payload Inspector */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Verifiable Execution Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any log entry to inspect structured agent payload and validation results.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Trip: {activeTrip.destination}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {agentLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="py-3.5 space-y-2">
                <div 
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group hover:bg-navy-800/30 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-500 group-hover:text-slate-300">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{log.agent_name}</span>
                        <AgentStatusBadge status={log.status} />
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{log.task}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono shrink-0 pl-7 sm:pl-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>

                {/* Expandable JSON Payload */}
                {isExpanded && log.result && (
                  <div className="pl-9 pr-2 py-2">
                    <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] font-mono text-teal-300 overflow-x-auto max-h-60">
                      <pre>{JSON.stringify(log.result, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
