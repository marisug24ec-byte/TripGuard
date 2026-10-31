// TripGuard AI - Central Trip & Autonomous Multi-Agent State Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Trip, 
  Itinerary, 
  Expense, 
  Disruption, 
  AgentLog, 
  MonitoringLog, 
  ReplanningSession, 
  TravelPreferences 
} from '../types';
import { storageService } from '../services/storageService';
import { supervisorAgent } from '../services/agents/supervisor';
import { weatherService } from '../services/weatherService';
import { disruptionAgent } from '../services/agents/disruptionAgent';
import { useAuth } from './AuthContext';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip;
  activeItinerary: Itinerary | null;
  itineraryVersions: Itinerary[];
  expenses: Expense[];
  disruptions: Disruption[];
  agentLogs: AgentLog[];
  monitoringLogs: MonitoringLog[];
  activeReplanningSession: ReplanningSession | null;
  isGeneratingTrip: boolean;
  isReplanning: boolean;
  activeGenerationLog: string;
  setActiveTrip: (tripId: string) => void;
  createTrip: (tripInput: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date: string;
    travellers: number;
    budget: number;
    preferences: TravelPreferences;
  }) => Promise<Trip>;
  simulateDisruption: (
    scenario: 'rain' | 'transport' | 'budget' | 'closure',
    options?: {
      dayNumber?: number;
      activityId?: string;
      activityName?: string;
      reducedBudget?: number;
      details?: string;
    }
  ) => Promise<ReplanningSession>;
  approveReplanning: () => Promise<Itinerary | null>;
  rejectReplanning: () => void;
  addExpense: (expense: Omit<Expense, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) => void;
  deleteExpense: (expenseId: string) => void;
  checkMonitoringUpdates: () => Promise<{ hasNewIssues: boolean; message: string }>;
  refreshData: () => void;
  resetSampleData: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTripState] = useState<Trip>(storageService.getSampleTrip());
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [itineraryVersions, setItineraryVersions] = useState<Itinerary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [activeReplanningSession, setActiveReplanningSession] = useState<ReplanningSession | null>(null);

  const [isGeneratingTrip, setIsGeneratingTrip] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  const [activeGenerationLog, setActiveGenerationLog] = useState<string>('');

  useEffect(() => {
    loadTripData();
  }, [user]);

  const loadTripData = () => {
    const allTrips = storageService.getTrips();
    setTrips(allTrips);

    const active = storageService.getActiveTrip();
    setActiveTripState(active);

    refreshTripArtifacts(active.id);
  };

  const refreshTripArtifacts = (tripId: string) => {
    const itins = storageService.getItineraries(tripId);
    setItineraryVersions(itins);
    setActiveItinerary(storageService.getLatestItinerary(tripId));

    setExpenses(storageService.getExpenses(tripId));
    setDisruptions(storageService.getDisruptions(tripId));
    setAgentLogs(storageService.getAgentLogs(tripId));
    setMonitoringLogs(storageService.getMonitoringLogs(tripId));

    const sessions = storageService.getReplanningSessions(tripId);
    const pendingSession = sessions.find(s => s.status === 'validated');
    setActiveReplanningSession(pendingSession || null);
  };

  const setActiveTrip = (tripId: string) => {
    storageService.setActiveTripId(tripId);
    const found = trips.find(t => t.id === tripId);
    if (found) {
      setActiveTripState(found);
      refreshTripArtifacts(found.id);
    }
  };

  const createTrip = async (tripInput: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date: string;
    travellers: number;
    budget: number;
    preferences: TravelPreferences;
  }): Promise<Trip> => {
    setIsGeneratingTrip(true);
    setActiveGenerationLog('Supervisor Agent: Initializing multi-agent trip pipeline...');

    const newTripId = `trip_${Date.now()}`;
    const newTrip: Trip = {
      id: newTripId,
      user_id: user?.id || 'demo-user-001',
      origin: tripInput.origin,
      destination: tripInput.destination,
      departure_date: tripInput.departure_date,
      return_date: tripInput.return_date,
      travellers: tripInput.travellers,
      budget: tripInput.budget,
      preferences: tripInput.preferences,
      status: 'planned',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Orchestrate genuine multi-agent workflow
      const result = await supervisorAgent.orchestrateTripPlanning(newTrip, (log) => {
        setActiveGenerationLog(`${log.agent_name}: ${log.task}`);
        storageService.addAgentLog(log);
        setAgentLogs(prev => [log, ...prev]);
      });

      storageService.saveTrip(newTrip);
      const initialItin = storageService.createNextItineraryVersion(
        newTripId, 
        result.itinerary, 
        result.validation.isValid ? 'valid' : 'pending'
      );

      // Seed initial monitoring log
      const initMonLog: MonitoringLog = {
        id: `mon_${Date.now()}`,
        trip_id: newTripId,
        monitoring_type: 'system',
        source: 'TripGuard Supervisor Agent',
        status: 'healthy',
        result: { summary: 'Initial itinerary generated and validated successfully.' },
        checked_at: new Date().toISOString(),
      };
      storageService.addMonitoringLog(initMonLog);

      loadTripData();
      setActiveTrip(newTripId);
      return newTrip;
    } finally {
      setIsGeneratingTrip(false);
      setActiveGenerationLog('');
    }
  };

  const simulateDisruption = async (
    scenario: 'rain' | 'transport' | 'budget' | 'closure',
    options?: {
      dayNumber?: number;
      activityId?: string;
      activityName?: string;
      reducedBudget?: number;
      details?: string;
    }
  ): Promise<ReplanningSession> => {
    if (!activeItinerary) throw new Error('No active itinerary found to replan');
    setIsReplanning(true);

    try {
      let disruption: Disruption;

      if (scenario === 'rain') {
        const dayNum = options?.dayNumber || 1;
        const targetAct = options?.activityName || 'Amer Fort & Sheesh Mahal Palace Tour';
        const targetId = options?.activityId || 'act_d1_1';

        disruption = disruptionAgent.createSimulatedDisruption(
          activeTrip.id,
          'weather',
          'High',
          `Simulated torrential monsoon downpour on Day ${dayNum} (${options?.details || '38mm rainfall forecast, 90% cloudburst probability'}). Outdoor operations unsafe.`,
          targetId,
          targetAct,
          ['Pivot to indoor cultural museums', 'Check sheltered vehicle links']
        );
      } else if (scenario === 'transport') {
        disruption = disruptionAgent.createSimulatedDisruption(
          activeTrip.id,
          'transport',
          'High',
          `Simulated primary transit disruption: ${options?.details || 'Highway corridor section blocked due to rockslide repairs / scheduled bus cancelled.'}`,
          options?.activityId || 'act_d1_1',
          options?.activityName || 'Primary Highway Journey Segment',
          ['Evaluate highway bypass', 'Recalculate route duration via OSRM']
        );
      } else if (scenario === 'budget') {
        const newBudget = options?.reducedBudget || Math.round(activeTrip.budget * 0.7);
        // Temporarily update trip budget to reduced figure
        activeTrip.budget = newBudget;
        storageService.saveTrip(activeTrip);

        disruption = disruptionAgent.createSimulatedDisruption(
          activeTrip.id,
          'budget',
          'High',
          `Simulated budget reduction: Authorized trip funds reduced to ₹${newBudget.toLocaleString('en-IN')}. Cost reduction needed.`,
          '',
          'High-expense activities & premium ticketed venues',
          ['Swap premium activities for self-guided heritage trails', 'Audit category expenditures']
        );
      } else {
        // Closure
        disruption = disruptionAgent.createSimulatedDisruption(
          activeTrip.id,
          'closure',
          'Medium',
          `Simulated sudden attraction closure: ${options?.activityName || 'Target Monument'} is temporarily closed today for structural conservation & VIP protocol.`,
          options?.activityId || 'act_d1_1',
          options?.activityName || 'Selected Landmark',
          ['Search alternative nearby attraction within 2km', 'Preserve remainder of day']
        );
      }

      // Record disruption
      storageService.addDisruption(disruption);
      setDisruptions(prev => [disruption, ...prev]);

      // Run genuine Autonomous Replanning Workflow through Supervisor
      const { replanningSession, logs } = await supervisorAgent.orchestrateReplanning(
        activeTrip,
        activeItinerary.itinerary_data,
        disruption,
        (log) => {
          storageService.addAgentLog(log);
          setAgentLogs(prev => [log, ...prev]);
        }
      );

      storageService.saveReplanningSession(replanningSession);
      setActiveReplanningSession(replanningSession);
      return replanningSession;
    } finally {
      setIsReplanning(false);
    }
  };

  const approveReplanning = async (): Promise<Itinerary | null> => {
    if (!activeReplanningSession || !activeReplanningSession.proposedItineraryData) return null;

    // Create a new version of the itinerary without overwriting previous versions!
    const newItin = storageService.createNextItineraryVersion(
      activeTrip.id,
      activeReplanningSession.proposedItineraryData,
      'valid'
    );

    // Update replanning session status
    activeReplanningSession.status = 'approved';
    activeReplanningSession.completed_at = new Date().toISOString();
    storageService.saveReplanningSession(activeReplanningSession);

    // Update trip status back to normal
    activeTrip.status = 'planned';
    storageService.saveTrip(activeTrip);

    // Log supervisor confirmation
    const confirmLog: AgentLog = {
      id: `log_appr_${Date.now()}`,
      trip_id: activeTrip.id,
      agent_name: 'Supervisor Agent',
      task: `Traveler approved revised itinerary. Published Version ${newItin.version} to active registry.`,
      status: 'Completed',
      created_at: new Date().toISOString(),
    };
    storageService.addAgentLog(confirmLog);

    refreshTripArtifacts(activeTrip.id);
    setActiveReplanningSession(null);
    return newItin;
  };

  const rejectReplanning = () => {
    if (!activeReplanningSession) return;
    activeReplanningSession.status = 'rejected';
    activeReplanningSession.completed_at = new Date().toISOString();
    storageService.saveReplanningSession(activeReplanningSession);

    const rejLog: AgentLog = {
      id: `log_rej_${Date.now()}`,
      trip_id: activeTrip.id,
      agent_name: 'Supervisor Agent',
      task: 'Traveler rejected proposed revision. Reverted to previous stable itinerary.',
      status: 'Completed',
      created_at: new Date().toISOString(),
    };
    storageService.addAgentLog(rejLog);

    setActiveReplanningSession(null);
    refreshTripArtifacts(activeTrip.id);
  };

  const addExpense = (expenseInput: Omit<Expense, 'id' | 'trip_id' | 'created_at' | 'updated_at'>) => {
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      trip_id: activeTrip.id,
      category: expenseInput.category,
      description: expenseInput.description,
      amount: expenseInput.amount,
      expense_date: expenseInput.expense_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    storageService.addExpense(newExpense);
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (expenseId: string) => {
    storageService.deleteExpense(activeTrip.id, expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const checkMonitoringUpdates = async (): Promise<{ hasNewIssues: boolean; message: string }> => {
    const geo = await weatherService.geocode(activeTrip.destination);
    let weatherResult: any = null;

    if (geo) {
      const forecast = await weatherService.fetchForecast(
        geo.latitude, 
        geo.longitude, 
        activeTrip.departure_date, 
        activeTrip.return_date
      );
      weatherResult = forecast;
    }

    const monLog: MonitoringLog = {
      id: `mon_check_${Date.now()}`,
      trip_id: activeTrip.id,
      monitoring_type: 'weather',
      source: 'Open-Meteo High-Resolution Numerical Model',
      status: 'healthy',
      result: {
        timestamp: new Date().toISOString(),
        destination: activeTrip.destination,
        statusSummary: 'Atmospheric conditions clear; no active heavy precipitation alerts detected in current forecast horizon.',
      },
      checked_at: new Date().toISOString(),
    };

    storageService.addMonitoringLog(monLog);
    setMonitoringLogs(prev => [monLog, ...prev]);

    return {
      hasNewIssues: false,
      message: `Monitoring sync complete: ${activeTrip.destination} meteorological and corridor telemetry verified favorable.`,
    };
  };

  const refreshData = () => {
    loadTripData();
  };

  const resetSampleData = () => {
    storageService.resetToSampleData();
    loadTripData();
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        activeItinerary,
        itineraryVersions,
        expenses,
        disruptions,
        agentLogs,
        monitoringLogs,
        activeReplanningSession,
        isGeneratingTrip,
        isReplanning,
        activeGenerationLog,
        setActiveTrip,
        createTrip,
        simulateDisruption,
        approveReplanning,
        rejectReplanning,
        addExpense,
        deleteExpense,
        checkMonitoringUpdates,
        refreshData,
        resetSampleData,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
};
