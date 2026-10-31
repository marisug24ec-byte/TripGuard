// TripGuard AI - Live Monitoring Module
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  CloudRain, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sun,
  Wind,
  Droplets,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { weatherService } from '../services/weatherService';
import { DayWeatherSummary } from '../types';
import { SeverityBadge } from '../components/common/Badges';

export const LiveMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const { activeTrip, activeItinerary, disruptions, monitoringLogs, checkMonitoringUpdates } = useTrip();

  const [forecastMap, setForecastMap] = useState<{ [date: string]: DayWeatherSummary }>({});
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(true);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadLiveWeather();
  }, [activeTrip]);

  const loadLiveWeather = async () => {
    setIsLoadingForecast(true);
    try {
      const geo = await weatherService.geocode(activeTrip.destination);
      if (geo) {
        const forecast = await weatherService.fetchForecast(
          geo.latitude,
          geo.longitude,
          activeTrip.departure_date,
          activeTrip.return_date
        );
        setForecastMap(forecast);
      } else {
        const baseline = weatherService.getSeasonalBaseline(activeTrip.departure_date, activeTrip.return_date);
        setForecastMap(baseline);
      }
    } catch (err) {
      console.warn('Could not load live weather:', err);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleManualCheck = async () => {
    setIsCheckingUpdates(true);
    setUpdateFeedback(null);
    try {
      const result = await checkMonitoringUpdates();
      await loadLiveWeather();
      setUpdateFeedback(result.message);
    } catch (err: any) {
      setUpdateFeedback('Failed to fetch telemetry updates. Please check network.');
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const latestLog = monitoringLogs[0];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-teal-400" />
            <span>Live Journey Monitoring</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry from Open-Meteo and OSRM routing models. Autonomous alert detection.
          </p>
        </div>

        <button
          onClick={handleManualCheck}
          disabled={isCheckingUpdates}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-navy-950 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
          <span>{isCheckingUpdates ? 'Syncing Feeds...' : 'Check for Updates'}</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {updateFeedback && (
        <div className="p-4 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* Monitoring Status & Scheduler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Latest Successful Sync
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-lg font-bold text-white">
            {latestLog ? new Date(latestLog.checked_at).toLocaleTimeString() : 'Just now'}
          </div>
          <p className="text-xs text-slate-400">
            Source: {latestLog?.source || 'Open-Meteo High-Resolution Model'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Monitoring Scheduler
          </span>
          <div className="text-lg font-bold text-teal-300">
            Active Periodic Polling
          </div>
          <p className="text-xs text-slate-400">
            Supabase Cron / Background telemetry sync every 60 mins.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Disruption Alerts
          </span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>{disruptions.length} Detected</span>
            {disruptions.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {disruptions.length === 0 ? 'All corridors operating within normal parameters.' : 'Autonomous replanning suggested.'}
          </p>
        </div>
      </div>

      {/* Disruption Alert Panel (if disruptions detected) */}
      {disruptions.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-rose-950/40 border border-rose-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Active Disruption Notifications</h3>
            </div>
            <button
              onClick={() => navigate('/replanning')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-navy-950 hover:bg-amber-400 transition-colors"
            >
              <span>Launch Autonomous Replanning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {disruptions.map((disr) => (
              <div key={disr.id} className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={disr.severity} />
                    {disr.is_simulated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        SIMULATED SCENARIO
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Detected at {new Date(disr.detected_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">{disr.description}</p>
                </div>

                <div className="text-xs text-slate-400 shrink-0">
                  Source: <strong className="text-slate-300">{disr.source}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Weather Forecast Table (Open-Meteo) */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              <span>Destination Weather Forecast: {activeTrip.destination}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Numerical model forecast via Open-Meteo API. Automated outdoor activity risk scoring.
            </p>
          </div>
        </div>

        {isLoadingForecast ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-400" />
            <span>Retrieving live Open-Meteo forecast...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Condition</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Temp (Max / Min)</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Rain Volume</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Precip Probability</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Outdoor Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.values(forecastMap).map((day) => (
                  <tr key={day.date} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      {day.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                      {day.weatherCondition}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {day.temperatureMax}°C / {day.temperatureMin}°C
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {day.rainMm > 0 ? `${day.rainMm} mm` : '0 mm'}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {day.precipitationProbability}%
                    </td>
                    <td className="py-3.5 px-4">
                      {day.isOutdoorSafe ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Safe for Outdoor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Heavy Rain Alert
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Telemetry Logs */}
      <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-400" />
          <span>Monitoring Event Log</span>
        </h3>

        <div className="space-y-2.5">
          {monitoringLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span className="font-bold text-slate-200 uppercase">{log.monitoring_type}</span>
                <span className="text-slate-400">{log.result?.statusSummary || log.result?.summary || 'Telemetry check completed.'}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {new Date(log.checked_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
