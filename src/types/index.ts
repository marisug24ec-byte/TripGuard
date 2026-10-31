// TripGuard AI - Core Domain Types & Interfaces

export type TransportType = 'Bus' | 'Train' | 'Car' | 'Flight' | 'Flexible';
export type AccommodationType = 'Budget' | 'Standard' | 'Premium';
export type TravelInterest = 
  | 'Nature' 
  | 'Adventure' 
  | 'Historical Places' 
  | 'Sightseeing' 
  | 'Shopping' 
  | 'Food' 
  | 'Relaxation';
export type FoodPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Any';
export type TravelPace = 'Relaxed' | 'Moderate' | 'Packed';

export interface TravelPreferences {
  transport: TransportType;
  accommodation: AccommodationType;
  interests: TravelInterest[];
  food: FoodPreference;
  pace: TravelPace;
  familyFriendly: boolean;
  avoidLongJourneys: boolean;
  accessibility: boolean;
  preferredTimings?: string;
  specialInstructions?: string;
}

export type TripStatus = 'planned' | 'in_progress' | 'disrupted' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travellers: number;
  budget: number; // in INR
  preferences: TravelPreferences;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export type ActivityState = 'preserved' | 'modified' | 'removed' | 'added';

export interface ActivityLocation {
  name: string;
  address?: string;
  lat: number | null;
  lng: number | null;
  verified: boolean;
}

export interface Activity {
  id: string;
  dayNumber: number;
  date: string;
  name: string;
  description: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:30"
  location: ActivityLocation;
  estimatedDurationMin: number;
  estimatedExpense: number; // in INR
  indoorOutdoor: 'indoor' | 'outdoor';
  transportRequirement?: string;
  confidenceLevel: number; // 0.0 to 1.0
  dataSource: string;
  uncertaintyInfo?: string;
  state?: ActivityState;
}

export interface DayWeatherSummary {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  rainMm: number;
  weatherCode: number;
  weatherCondition: string;
  isOutdoorSafe: boolean;
  riskSummary?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  activities: Activity[];
  weatherForecast?: DayWeatherSummary;
}

export interface CostBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface AccommodationSuggestion {
  name: string;
  type: string;
  pricePerNight: number;
  estimatedTotal: number;
  location: string;
}

export interface ItineraryData {
  tripSummary: string;
  days: DayPlan[];
  accommodationSuggestion: AccommodationSuggestion;
  recommendedTransport: string;
  totalEstimatedCost: number;
  remainingBudget: number;
  costBreakdown: CostBreakdown;
  generatedAt: string;
}

export interface Itinerary {
  id: string;
  trip_id: string;
  version: number;
  itinerary_data: ItineraryData;
  total_estimated_cost: number;
  validation_status: 'valid' | 'pending' | 'invalid';
  created_at: string;
}

export type DisruptionType = 'weather' | 'transport' | 'closure' | 'budget' | 'other';
export type DisruptionSeverity = 'Low' | 'Medium' | 'High';

export interface Disruption {
  id: string;
  trip_id: string;
  disruption_type: DisruptionType;
  severity: DisruptionSeverity;
  description: string;
  affected_activity?: string;
  affected_activity_ids?: string[];
  source: string;
  is_simulated: boolean;
  detected_at: string;
  recommended_actions?: string[];
}

export interface ReplanningDiffItem {
  originalActivityId: string;
  revisedActivityId?: string;
  changeType: ActivityState;
  originalActivity?: Activity;
  replacementActivity?: Activity;
  reasonForModification: string;
  costDifference: number; // positive = increase, negative = decrease
  scheduleImpact: string;
}

export type ReplanningStatus = 'analyzing' | 'replanning' | 'validated' | 'approved' | 'rejected';

export interface ReplanningSession {
  id: string;
  trip_id: string;
  original_itinerary_id: string;
  proposed_itinerary_id?: string;
  trigger_disruption_id?: string;
  status: ReplanningStatus;
  changes: ReplanningDiffItem[];
  proposedItineraryData?: ItineraryData;
  validation_result?: ValidationResult;
  outcome?: string;
  created_at: string;
  completed_at?: string;
}

export type ExpenseCategory = 'transport' | 'accommodation' | 'food' | 'activities' | 'miscellaneous';

export interface Expense {
  id: string;
  trip_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export type AgentName = 
  | 'Supervisor Agent'
  | 'Travel Planning Agent'
  | 'Weather Agent'
  | 'Transport Agent'
  | 'Budget Agent'
  | 'Disruption Detection Agent'
  | 'Autonomous Replanning Agent'
  | 'Validation Engine';

export type AgentStatus = 'Idle' | 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface AgentLog {
  id: string;
  trip_id: string;
  agent_name: AgentName;
  task: string;
  status: AgentStatus;
  result?: any;
  created_at: string;
}

export type MonitoringType = 'weather' | 'transport' | 'closure' | 'system';
export type MonitoringStatus = 'healthy' | 'warning' | 'alert' | 'error';

export interface MonitoringLog {
  id: string;
  trip_id: string;
  monitoring_type: MonitoringType;
  source: string;
  status: MonitoringStatus;
  result?: any;
  error_message?: string;
  checked_at: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checksPassed: {
    budgetCompliant: boolean;
    datesWithinRange: boolean;
    noTimingOverlaps: boolean;
    plausibleTravelDurations: boolean;
    weatherAppropriate: boolean;
    preferencesRespected: boolean;
    constraintsRespected: boolean;
    requiredFieldsPresent: boolean;
    uncertaintyIdentified: boolean;
    unaffectedPreserved: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}
