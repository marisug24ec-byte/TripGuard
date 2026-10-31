// TripGuard AI - Persistent Storage & State Service (Supabase + Resilient Local Demo Storage)
import { 
  Trip, 
  Itinerary, 
  ItineraryData, 
  Expense, 
  Disruption, 
  AgentLog, 
  ReplanningSession, 
  MonitoringLog, 
  UserProfile 
} from '../types';
import { supabaseManager } from './supabaseClient';

const STORAGE_KEYS = {
  CURRENT_USER: 'tripguard_user',
  TRIPS: 'tripguard_trips',
  ACTIVE_TRIP_ID: 'tripguard_active_trip_id',
  ITINERARIES: 'tripguard_itineraries',
  EXPENSES: 'tripguard_expenses',
  DISRUPTIONS: 'tripguard_disruptions',
  AGENT_LOGS: 'tripguard_agent_logs',
  REPLANNING_SESSIONS: 'tripguard_replanning_sessions',
  MONITORING_LOGS: 'tripguard_monitoring_logs',
  DEMO_MODE: 'tripguard_demo_mode',
};

export const storageService = {
  isDemoMode(): boolean {
    const override = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    if (override !== null) return override === 'true';
    return !supabaseManager.isConnected();
  },

  setDemoMode(enabled: boolean) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(enabled));
  },

  getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const defaultUser: UserProfile = {
      id: 'demo-user-001',
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@tripguard.ai',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // ==========================================
  // TRIPS
  // ==========================================
  getTrips(): Trip[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
    if (raw) {
      try {
        const trips = JSON.parse(raw);
        if (Array.isArray(trips) && trips.length > 0) return trips;
      } catch (e) {}
    }
    // Seed initial trip directly without recursion
    const initialTrip = this.getSampleTrip();
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify([initialTrip]));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, initialTrip.id);
    return [initialTrip];
  },

  getActiveTrip(): Trip {
    const trips = this.getTrips();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID);
    const found = trips.find(t => t.id === activeId);
    if (found) return found;
    if (trips.length > 0) {
      this.setActiveTripId(trips[0].id);
      return trips[0];
    }
    const sample = this.getSampleTrip();
    this.saveTrip(sample);
    return sample;
  },

  setActiveTripId(tripId: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, tripId);
  },

  saveTrip(trip: Trip) {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
    let trips: Trip[] = [];
    if (raw) {
      try { trips = JSON.parse(raw); } catch (e) {}
    }
    if (!Array.isArray(trips)) trips = [];
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) {
      trips[idx] = { ...trip, updated_at: new Date().toISOString() };
    } else {
      trips.unshift(trip);
    }
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    this.setActiveTripId(trip.id);
  },

  deleteTrip(tripId: string) {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIPS);
    let trips: Trip[] = [];
    if (raw) {
      try { trips = JSON.parse(raw); } catch (e) {}
    }
    trips = trips.filter(t => t.id !== tripId);
    if (trips.length === 0) {
      const sample = this.getSampleTrip();
      trips = [sample];
    }
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    this.setActiveTripId(trips[0].id);
  },

  // ==========================================
  // ITINERARIES (Versioned)
  // ==========================================
  getItineraries(tripId: string): Itinerary[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ITINERARIES}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      } catch (e) {}
    }
    // Seed sample itinerary directly without recursion
    if (tripId === 'trip_jaipur_sample') {
      const sampleItin = this.getSampleItinerary(tripId);
      localStorage.setItem(`${STORAGE_KEYS.ITINERARIES}_${tripId}`, JSON.stringify([sampleItin]));
      return [sampleItin];
    }
    return [];
  },

  getLatestItinerary(tripId: string): Itinerary | null {
    const list = this.getItineraries(tripId);
    if (list.length === 0) return null;
    return list.sort((a, b) => b.version - a.version)[0];
  },

  saveItinerary(itinerary: Itinerary) {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ITINERARIES}_${itinerary.trip_id}`);
    let list: Itinerary[] = [];
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) {}
    }
    if (!Array.isArray(list)) list = [];
    const existingIdx = list.findIndex(i => i.id === itinerary.id);
    if (existingIdx >= 0) {
      list[existingIdx] = itinerary;
    } else {
      list.push(itinerary);
    }
    localStorage.setItem(`${STORAGE_KEYS.ITINERARIES}_${itinerary.trip_id}`, JSON.stringify(list));
  },

  createNextItineraryVersion(
    tripId: string, 
    itineraryData: ItineraryData,
    validationStatus: 'valid' | 'pending' | 'invalid' = 'valid'
  ): Itinerary {
    const currentList = this.getItineraries(tripId);
    const currentMaxVersion = currentList.reduce((max, item) => Math.max(max, item.version), 0);
    const newVersion = currentMaxVersion + 1;

    const newItinerary: Itinerary = {
      id: `itin_${tripId}_v${newVersion}_${Date.now()}`,
      trip_id: tripId,
      version: newVersion,
      itinerary_data: itineraryData,
      total_estimated_cost: itineraryData.totalEstimatedCost,
      validation_status: validationStatus,
      created_at: new Date().toISOString(),
    };

    this.saveItinerary(newItinerary);
    return newItinerary;
  },

  // ==========================================
  // EXPENSES
  // ==========================================
  getExpenses(tripId: string): Expense[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.EXPENSES}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      } catch (e) {}
    }
    if (tripId === 'trip_jaipur_sample') {
      const sampleExpenses = this.getSampleExpenses(tripId);
      localStorage.setItem(`${STORAGE_KEYS.EXPENSES}_${tripId}`, JSON.stringify(sampleExpenses));
      return sampleExpenses;
    }
    return [];
  },

  saveExpenses(tripId: string, expenses: Expense[]) {
    localStorage.setItem(`${STORAGE_KEYS.EXPENSES}_${tripId}`, JSON.stringify(expenses));
  },

  addExpense(expense: Expense) {
    const expenses = this.getExpenses(expense.trip_id);
    expenses.unshift(expense);
    this.saveExpenses(expense.trip_id, expenses);
  },

  updateExpense(expense: Expense) {
    const expenses = this.getExpenses(expense.trip_id);
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      expenses[idx] = { ...expense, updated_at: new Date().toISOString() };
      this.saveExpenses(expense.trip_id, expenses);
    }
  },

  deleteExpense(tripId: string, expenseId: string) {
    const expenses = this.getExpenses(tripId).filter(e => e.id !== expenseId);
    this.saveExpenses(tripId, expenses);
  },

  // ==========================================
  // DISRUPTIONS
  // ==========================================
  getDisruptions(tripId: string): Disruption[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DISRUPTIONS}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      } catch (e) {}
    }
    return [];
  },

  addDisruption(disruption: Disruption) {
    const list = this.getDisruptions(disruption.trip_id);
    list.unshift(disruption);
    localStorage.setItem(`${STORAGE_KEYS.DISRUPTIONS}_${disruption.trip_id}`, JSON.stringify(list));
  },

  // ==========================================
  // AGENT LOGS
  // ==========================================
  getAgentLogs(tripId: string): AgentLog[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.AGENT_LOGS}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      } catch (e) {}
    }
    if (tripId === 'trip_jaipur_sample') {
      const sampleLogs = this.getSampleAgentLogs(tripId);
      localStorage.setItem(`${STORAGE_KEYS.AGENT_LOGS}_${tripId}`, JSON.stringify(sampleLogs));
      return sampleLogs;
    }
    return [];
  },

  saveAgentLogs(tripId: string, logs: AgentLog[]) {
    localStorage.setItem(`${STORAGE_KEYS.AGENT_LOGS}_${tripId}`, JSON.stringify(logs));
  },

  addAgentLog(log: AgentLog) {
    const logs = this.getAgentLogs(log.trip_id);
    logs.unshift(log);
    this.saveAgentLogs(log.trip_id, logs);
  },

  // ==========================================
  // REPLANNING SESSIONS
  // ==========================================
  getReplanningSessions(tripId: string): ReplanningSession[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.REPLANNING_SESSIONS}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      } catch (e) {}
    }
    return [];
  },

  saveReplanningSession(session: ReplanningSession) {
    const list = this.getReplanningSessions(session.trip_id);
    const idx = list.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      list[idx] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem(`${STORAGE_KEYS.REPLANNING_SESSIONS}_${session.trip_id}`, JSON.stringify(list));
  },

  // ==========================================
  // MONITORING LOGS
  // ==========================================
  getMonitoringLogs(tripId: string): MonitoringLog[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.MONITORING_LOGS}_${tripId}`);
    if (raw) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      } catch (e) {}
    }
    const initialLogs: MonitoringLog[] = [
      {
        id: 'mon_1',
        trip_id: tripId,
        monitoring_type: 'weather',
        source: 'Open-Meteo High-Resolution Numerical Model',
        status: 'healthy',
        result: { summary: 'Clear conditions, 0.0mm precipitation expected' },
        checked_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: 'mon_2',
        trip_id: tripId,
        monitoring_type: 'transport',
        source: 'OSRM Route Advisory',
        status: 'healthy',
        result: { summary: 'Expressways operating at regular flow' },
        checked_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      }
    ];
    localStorage.setItem(`${STORAGE_KEYS.MONITORING_LOGS}_${tripId}`, JSON.stringify(initialLogs));
    return initialLogs;
  },

  addMonitoringLog(log: MonitoringLog) {
    const logs = this.getMonitoringLogs(log.trip_id);
    logs.unshift(log);
    localStorage.setItem(`${STORAGE_KEYS.MONITORING_LOGS}_${log.trip_id}`, JSON.stringify(logs));
  },

  // ==========================================
  // RESET ALL DATA
  // ==========================================
  resetToSampleData() {
    Object.values(STORAGE_KEYS).forEach(k => {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tripguard_')) {
          localStorage.removeItem(key);
        }
      }
    });
    // Re-seed
    const sample = this.getSampleTrip();
    this.saveTrip(sample);
  },

  // ==========================================
  // SAMPLE SEED DATA
  // ==========================================
  getSampleTrip(): Trip {
    return {
      id: 'trip_jaipur_sample',
      user_id: 'demo-user-001',
      origin: 'New Delhi',
      destination: 'Jaipur',
      departure_date: '2026-11-15',
      return_date: '2026-11-18',
      travellers: 2,
      budget: 45000,
      preferences: {
        transport: 'Car',
        accommodation: 'Standard',
        interests: ['Historical Places', 'Sightseeing', 'Food', 'Shopping'],
        food: 'Vegetarian',
        pace: 'Moderate',
        familyFriendly: true,
        avoidLongJourneys: false,
        accessibility: false,
        preferredTimings: 'Morning starts at 09:30 AM',
        specialInstructions: 'Focus on authentic Rajasthani architecture and photography vistas.',
      },
      status: 'planned',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  getSampleItinerary(tripId: string): Itinerary {
    const data: ItineraryData = {
      tripSummary: 'Curated 4-Day Cultural & Royal Heritage Itinerary in Jaipur for 2 travelers. Highlights include Amer Fort, City Palace, astronomical observatories, and vibrant craft bazaars.',
      days: [
        {
          dayNumber: 1,
          date: '2026-11-15',
          theme: 'Arrival & Majestic Fortresses of the Aravallis',
          activities: [
            {
              id: 'act_d1_1',
              dayNumber: 1,
              date: '2026-11-15',
              name: 'Amer Fort & Sheesh Mahal Palace Tour',
              description: 'Iconic 16th-century hilltop fortress featuring mirror-work palaces, ornate courtyards, and panoramic ramparts.',
              startTime: '09:30',
              endTime: '12:30',
              location: {
                name: 'Amer Fort',
                address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
                lat: 26.9855,
                lng: 75.8513,
                verified: true,
              },
              estimatedDurationMin: 180,
              estimatedExpense: 500,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'Private cab from hotel',
              confidenceLevel: 0.98,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d1_2',
              dayNumber: 1,
              date: '2026-11-15',
              name: 'Anokhi Museum of Hand Printing',
              description: 'Exquisite indoor heritage haveli dedicated to ancient woodblock carving and natural fabric dyeing techniques.',
              startTime: '13:30',
              endTime: '15:15',
              location: {
                name: 'Anokhi Haveli Museum',
                address: 'Near Kheri Gate, Amer, Jaipur 302028',
                lat: 26.9880,
                lng: 75.8540,
                verified: true,
              },
              estimatedDurationMin: 105,
              estimatedExpense: 200,
              indoorOutdoor: 'indoor',
              transportRequirement: 'Short walk from fort exit',
              confidenceLevel: 0.96,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d1_3',
              dayNumber: 1,
              date: '2026-11-15',
              name: 'Jal Mahal Water Palace Promenade',
              description: 'Photogenic evening stroll along the Man Sagar lake promenade watching reflections of the floating palace at golden hour.',
              startTime: '16:30',
              endTime: '18:15',
              location: {
                name: 'Jal Mahal Promenade',
                address: 'Amer Road, Jaipur, Rajasthan 302002',
                lat: 26.9534,
                lng: 75.8462,
                verified: true,
              },
              estimatedDurationMin: 105,
              estimatedExpense: 100,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'En route cab return',
              confidenceLevel: 0.95,
              dataSource: 'OpenStreetMap verified',
              state: 'preserved',
            }
          ]
        },
        {
          dayNumber: 2,
          date: '2026-11-16',
          theme: 'Walled Pink City & Astronomical Marvels',
          activities: [
            {
              id: 'act_d2_1',
              dayNumber: 2,
              date: '2026-11-16',
              name: 'City Palace Royal Residence & Armoury',
              description: 'Lavish royal palace museum housing ceremonial costumes, hand-forged weaponry, and the world-renowned Peacock Courtyard.',
              startTime: '09:30',
              endTime: '12:00',
              location: {
                name: 'The City Palace',
                address: 'Gangori Bazaar, J.D.A. Market, Pink City, Jaipur 302002',
                lat: 26.9258,
                lng: 75.8236,
                verified: true,
              },
              estimatedDurationMin: 150,
              estimatedExpense: 700,
              indoorOutdoor: 'indoor',
              transportRequirement: 'City cab / auto-rickshaw',
              confidenceLevel: 0.99,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d2_2',
              dayNumber: 2,
              date: '2026-11-16',
              name: 'Jantar Mantar UNESCO Astronomical Observatory',
              description: 'World-famous open-air collection of nineteen monumental astronomical stone instruments including the massive Samrat Yantra sundial.',
              startTime: '12:30',
              endTime: '14:30',
              location: {
                name: 'Jantar Mantar',
                address: 'Adjacent to City Palace, Jaipur 302002',
                lat: 26.9248,
                lng: 75.8246,
                verified: true,
              },
              estimatedDurationMin: 120,
              estimatedExpense: 200,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'Walking distance (2 mins)',
              confidenceLevel: 0.97,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d2_3',
              dayNumber: 2,
              date: '2026-11-16',
              name: 'Hawa Mahal & Johari Bazaar Walk',
              description: 'Observe the 953 honeycombed jharokha lattice windows of the Palace of Winds followed by artisan textile and gemstone shopping.',
              startTime: '15:30',
              endTime: '18:00',
              location: {
                name: 'Hawa Mahal',
                address: 'Badi Choupad, J.D.A. Market, Pink City, Jaipur 302002',
                lat: 26.9239,
                lng: 75.8267,
                verified: true,
              },
              estimatedDurationMin: 150,
              estimatedExpense: 300,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'Pedestrian precinct walk',
              confidenceLevel: 0.98,
              dataSource: 'OpenStreetMap verified',
              state: 'preserved',
            }
          ]
        },
        {
          dayNumber: 3,
          date: '2026-11-17',
          theme: 'Art History & Sunset Over the Ridge',
          activities: [
            {
              id: 'act_d3_1',
              dayNumber: 3,
              date: '2026-11-17',
              name: 'Albert Hall State Central Museum',
              description: 'Indo-Saracenic architectural masterpiece showcasing miniature paintings, Persian carpets, ivory carvings, and Egyptian relics.',
              startTime: '10:00',
              endTime: '12:30',
              location: {
                name: 'Albert Hall Museum',
                address: 'Ram Niwas Garden, Kailash Puri, Adarsh Nagar, Jaipur 302004',
                lat: 26.9116,
                lng: 75.8195,
                verified: true,
              },
              estimatedDurationMin: 150,
              estimatedExpense: 300,
              indoorOutdoor: 'indoor',
              transportRequirement: 'City taxi',
              confidenceLevel: 0.98,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d3_2',
              dayNumber: 3,
              date: '2026-11-17',
              name: 'Nahargarh Fort Ridge Vista & Padao Sunset',
              description: 'Perched on the edge of the Aravalli hills, offering scenic sunset perspectives over the entire Pink City.',
              startTime: '15:30',
              endTime: '18:30',
              location: {
                name: 'Nahargarh Fort',
                address: 'Krishna Nagar, Brahampuri, Jaipur 302002',
                lat: 26.9372,
                lng: 75.8155,
                verified: true,
              },
              estimatedDurationMin: 180,
              estimatedExpense: 400,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'Winding hill climb cab',
              confidenceLevel: 0.96,
              dataSource: 'OpenStreetMap verified',
              state: 'preserved',
            }
          ]
        },
        {
          dayNumber: 4,
          date: '2026-11-18',
          theme: 'Sacred Temples & Departure Farewells',
          activities: [
            {
              id: 'act_d4_1',
              dayNumber: 4,
              date: '2026-11-18',
              name: 'Galta Ji Temple (The Sun & Valley Temple)',
              description: 'Historic Hindu pilgrimage complex set into a mountain pass with seven natural sacred water springs (kunds).',
              startTime: '09:30',
              endTime: '12:00',
              location: {
                name: 'Galta Ji Complex',
                address: 'Galva Ashram, Jaipur, Rajasthan 302031',
                lat: 26.9161,
                lng: 75.8576,
                verified: true,
              },
              estimatedDurationMin: 150,
              estimatedExpense: 200,
              indoorOutdoor: 'outdoor',
              transportRequirement: 'Return cab',
              confidenceLevel: 0.94,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            },
            {
              id: 'act_d4_2',
              dayNumber: 4,
              date: '2026-11-18',
              name: 'Bapu Bazaar Handicrafts & Sweets Tasting',
              description: 'Farewell stroll through pink terracotta arcades purchasing camel leather juttis, tie-dye dupattas, and ghewar sweets.',
              startTime: '13:00',
              endTime: '15:00',
              location: {
                name: 'Bapu Bazaar',
                address: 'Bapu Bazaar, Pink City, Jaipur 302003',
                lat: 26.9189,
                lng: 75.8230,
                verified: true,
              },
              estimatedDurationMin: 120,
              estimatedExpense: 300,
              indoorOutdoor: 'indoor',
              transportRequirement: 'Walk to express cab pickup',
              confidenceLevel: 0.96,
              dataSource: 'TripGuard Verified Directory',
              state: 'preserved',
            }
          ]
        }
      ],
      accommodationSuggestion: {
        name: 'Shahpura Haveli & Heritage Suites',
        type: 'Standard Boutique Heritage',
        pricePerNight: 3200,
        estimatedTotal: 9600,
        location: 'Civil Lines, Jaipur (Central, secure & peaceful)',
      },
      recommendedTransport: 'Private AC Sedan with certified chauffeur for Delhi-Jaipur highway & city circulations',
      totalEstimatedCost: 28400,
      remainingBudget: 16600,
      costBreakdown: {
        transport: 7200,
        accommodation: 9600,
        food: 6000,
        activities: 4200,
        miscellaneous: 1400,
      },
      generatedAt: new Date().toISOString(),
    };

    return {
      id: `itin_${tripId}_v1`,
      trip_id: tripId,
      version: 1,
      itinerary_data: data,
      total_estimated_cost: 28400,
      validation_status: 'valid',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    };
  },

  getSampleExpenses(tripId: string): Expense[] {
    return [
      {
        id: 'exp_1',
        trip_id: tripId,
        category: 'accommodation',
        description: 'Advance deposit for Shahpura Haveli Suites (3 nights)',
        amount: 9600,
        expense_date: '2026-11-14',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'exp_2',
        trip_id: tripId,
        category: 'transport',
        description: 'Chauffeur AC Sedan Booking Delhi to Jaipur Round-trip',
        amount: 7200,
        expense_date: '2026-11-14',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'exp_3',
        trip_id: tripId,
        category: 'activities',
        description: 'Amer Fort Composite entry ticket (2 adults)',
        amount: 1000,
        expense_date: '2026-11-15',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'exp_4',
        trip_id: tripId,
        category: 'food',
        description: 'Traditional Thali lunch at 1135 AD Amer',
        amount: 1850,
        expense_date: '2026-11-15',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
  },

  getSampleAgentLogs(tripId: string): AgentLog[] {
    return [
      {
        id: 'log_init_1',
        trip_id: tripId,
        agent_name: 'Supervisor Agent',
        task: 'Received trip request for Jaipur (4 days, 2 travellers, budget ₹45,000)',
        status: 'Completed',
        result: { status: 'Workflow orchestrated' },
        created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      },
      {
        id: 'log_init_2',
        trip_id: tripId,
        agent_name: 'Weather Agent',
        task: 'Retrieved Open-Meteo forecast: Mild sunny conditions (Max 28°C / Min 15°C, 0mm rain)',
        status: 'Completed',
        result: { rainMm: 0, isOutdoorSafe: true },
        created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
      {
        id: 'log_init_3',
        trip_id: tripId,
        agent_name: 'Transport Agent',
        task: 'Calculated Delhi-Jaipur NH48 driving route via OSRM: 268 km, ~4.5 hrs',
        status: 'Completed',
        result: { distanceKm: 268, durationMinutes: 270, source: 'OSRM' },
        created_at: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
      },
      {
        id: 'log_init_4',
        trip_id: tripId,
        agent_name: 'Travel Planning Agent',
        task: 'Generated 4-day structured itinerary with 11 curated activities & geo-anchors',
        status: 'Completed',
        result: { daysCount: 4, activitiesCount: 11 },
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        id: 'log_init_5',
        trip_id: tripId,
        agent_name: 'Budget Agent',
        task: 'Deterministic audit: Total estimated ₹28,400 of ₹45,000 budget (63.1% utilized)',
        status: 'Completed',
        result: { isWithinBudget: true, remaining: 16600 },
        created_at: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
      },
      {
        id: 'log_init_6',
        trip_id: tripId,
        agent_name: 'Validation Engine',
        task: 'Verified 10 domain criteria: 0 errors, 1 warning (minor evening traffic buffer)',
        status: 'Completed',
        result: { isValid: true },
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ];
  }
};
