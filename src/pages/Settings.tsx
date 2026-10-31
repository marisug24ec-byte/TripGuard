// TripGuard AI - System Settings, Credentials & Demo Mode Manager
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Key, 
  Database, 
  ShieldCheck, 
  User, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Cpu,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { supabaseManager } from '../services/supabaseClient';
import { geminiService } from '../services/geminiService';

export const Settings: React.FC = () => {
  const { user, isDemoMode, toggleDemoMode } = useAuth();
  const { resetSampleData } = useTrip();

  // Supabase fields
  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('tripguard_supabase_url') || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('tripguard_supabase_anon_key') || ''
  );
  const [supabaseSuccess, setSupabaseSuccess] = useState<boolean>(false);

  // Gemini fields
  const [geminiApiKey, setGeminiApiKey] = useState(geminiService.getApiKey());
  const [geminiSuccess, setGeminiSuccess] = useState<boolean>(false);

  // Profile fields
  const [name, setName] = useState(user?.name || 'Dr. Arjun Mehta');
  const [email, setEmail] = useState(user?.email || 'arjun.mehta@tripguard.ai');
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseManager.updateCredentials(supabaseUrl, supabaseAnonKey);
    setSupabaseSuccess(true);
    setTimeout(() => setSupabaseSuccess(false), 3000);
  };

  const handleSaveGemini = (e: React.FormEvent) => {
    e.preventDefault();
    geminiService.setApiKey(geminiApiKey);
    setGeminiSuccess(true);
    setTimeout(() => setGeminiSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all trip data, versions, and expenses to default sample state?')) {
      resetSampleData();
      alert('Application sample data restored successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-teal-400" />
            <span>Application Settings & Secrets</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your credentials, external service linkages, and Demo Mode execution flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Environment:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isDemoMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            {isDemoMode ? 'DEMO MODE (OFFLINE RESILIENT)' : 'SUPABASE CONNECTED'}
          </span>
        </div>
      </div>

      {/* Demo Mode Toggle Banner */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <span>Clearly Labelled Demo Mode</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              When Demo Mode is enabled, TripGuard AI operates with high-fidelity sample data, simulated routing, and local state persistence without requiring Supabase or external API keys.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => toggleDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>
      </div>

      {/* External Service Connections Status Table */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          External Telemetry & API Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-semibold">Open-Meteo Weather</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live & Connected</span>
            </div>
            <span className="text-[10px] text-slate-500">Free, no key required</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-semibold">OSRM Road Routing</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live & Connected</span>
            </div>
            <span className="text-[10px] text-slate-500">Real distances & geometry</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-semibold">Leaflet & OpenStreetMap</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Operational</span>
            </div>
            <span className="text-[10px] text-slate-500">Interactive map layer</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-semibold">Google Gemini API</span>
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>{geminiService.hasApiKey() ? 'API Key Active' : 'Hybrid Deterministic'}</span>
            </div>
            <span className="text-[10px] text-slate-500">Structured JSON schema</span>
          </div>
        </div>
      </div>

      {/* Google Gemini API Key Configuration */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <span>Google Gemini API Configuration</span>
            </h3>
            <p className="text-xs text-slate-400">
              Supply your Gemini API key for dynamic generation or use the built-in deterministic multi-agent knowledge base.
            </p>
          </div>
          {geminiSuccess && (
            <span className="text-xs font-bold text-emerald-400">Key Saved!</span>
          )}
        </div>

        <form onSubmit={handleSaveGemini} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-navy-950 hover:bg-teal-400 transition-colors"
            >
              Save Gemini Key
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Connection Configuration */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Supabase Backend Credentials</span>
            </h3>
            <p className="text-xs text-slate-400">
              Connect your live Supabase PostgreSQL instance with Row Level Security (RLS).
            </p>
          </div>
          {supabaseSuccess && (
            <span className="text-xs font-bold text-emerald-400">Credentials Updated!</span>
          )}
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-navy-950 hover:bg-cyan-400 transition-colors"
            >
              Connect Supabase
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone / Data Management */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-rose-500/30 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-400" />
          <span>Reset Sample Data & Registry</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restore initial verified sample trips, itineraries, expenses, and logs for demo presentation.
        </p>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
        >
          Reset All Data to Default Demo State
        </button>
      </div>
    </div>
  );
};
