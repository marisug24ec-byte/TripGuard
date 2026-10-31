// TripGuard AI - Comprehensive Trip Input Module
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Car, 
  Hotel, 
  Heart, 
  Utensils, 
  Gauge, 
  Accessibility, 
  Clock, 
  AlertCircle,
  Cpu,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { 
  TransportType, 
  AccommodationType, 
  TravelInterest, 
  FoodPreference, 
  TravelPace 
} from '../types';

export const PlanTrip: React.FC = () => {
  const navigate = useNavigate();
  const { createTrip, isGeneratingTrip, activeGenerationLog } = useTrip();

  // Part A: Basic Info
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('Jaipur');
  const [departureDate, setDepartureDate] = useState('2026-11-20');
  const [returnDate, setReturnDate] = useState('2026-11-23');
  const [travellers, setTravellers] = useState<number>(2);
  const [budget, setBudget] = useState<number>(45000);

  // Part B: Travel Preferences
  const [transport, setTransport] = useState<TransportType>('Car');
  const [accommodation, setAccommodation] = useState<AccommodationType>('Standard');
  const [interests, setInterests] = useState<TravelInterest[]>([
    'Historical Places',
    'Sightseeing',
    'Food',
  ]);
  const [food, setFood] = useState<FoodPreference>('Vegetarian');
  const [pace, setPace] = useState<TravelPace>('Moderate');

  // Part C: Constraints
  const [familyFriendly, setFamilyFriendly] = useState<boolean>(true);
  const [avoidLongJourneys, setAvoidLongJourneys] = useState<boolean>(false);
  const [accessibility, setAccessibility] = useState<boolean>(false);
  const [preferredTimings, setPreferredTimings] = useState<string>('Morning starts 09:30 AM');
  const [specialInstructions, setSpecialInstructions] = useState<string>('Focus on historical architecture, local handicrafts, and authentic dining.');

  // Form Validation Errors
  const [errors, setErrors] = useState<string[]>([]);

  const allInterests: TravelInterest[] = [
    'Nature',
    'Adventure',
    'Historical Places',
    'Sightseeing',
    'Shopping',
    'Food',
    'Relaxation',
  ];

  const toggleInterest = (interest: TravelInterest) => {
    if (interests.includes(interest)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== interest));
      }
    } else {
      setInterests([...interests, interest]);
    }
  };

  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (!origin.trim()) errs.push('Starting location is required.');
    if (!destination.trim()) errs.push('Destination is required.');
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      errs.push('Origin and destination cannot be identical.');
    }
    if (!departureDate) errs.push('Departure date is required.');
    if (!returnDate) errs.push('Return date is required.');

    if (departureDate && returnDate) {
      const dep = new Date(departureDate);
      const ret = new Date(returnDate);
      if (ret < dep) {
        errs.push('Return date must not precede departure date.');
      }
    }

    if (travellers < 1) errs.push('Number of travellers must be at least 1.');
    if (budget < 1000) errs.push('Total budget must be at least ₹1,000 INR.');
    if (interests.length === 0) errs.push('Please select at least one travel interest.');

    setErrors(errs);
    return errs.length === 0;
  };

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createTrip({
        origin: origin.trim(),
        destination: destination.trim(),
        departure_date: departureDate,
        return_date: returnDate,
        travellers: Number(travellers),
        budget: Number(budget),
        preferences: {
          transport,
          accommodation,
          interests,
          food,
          pace,
          familyFriendly,
          avoidLongJourneys,
          accessibility,
          preferredTimings,
          specialInstructions,
        },
      });

      navigate('/dashboard');
    } catch (err: any) {
      setErrors([err.message || 'Trip generation failed. Please try again.']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-teal-400" />
            <span>Plan an Intelligent Trip</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Specify your route, budget, and travel preferences. Our multi-agent swarm orchestrates the itinerary.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-navy-900 border border-teal-500/30 text-xs text-teal-300 font-semibold self-start sm:self-auto flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Deterministic Budget & Open-Meteo Linked</span>
        </div>
      </div>

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Please correct the following errors:</span>
          </div>
          <ul className="list-disc list-inside pl-2 space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Creation Form */}
      <form onSubmit={handleGenerateTrip} className="space-y-8">
        {/* SECTION A: Basic Information */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>A. Core Journey Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Starting Location (Origin) *
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Destination *
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Jaipur, Goa, Munnar, Manali"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Departure Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Return Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Travellers *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={travellers}
                  onChange={(e) => setTravellers(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Max Budget (INR ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  step="500"
                  min="1000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: Travel Preferences */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white uppercase tracking-wider">
            <Heart className="w-4 h-4 text-cyan-400" />
            <span>B. Travel Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Primary Transport Mode
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as TransportType)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Car">Car / Taxi</option>
                <option value="Train">Train (Express / Sleeper)</option>
                <option value="Bus">Bus (AC Volvo)</option>
                <option value="Flight">Flight</option>
                <option value="Flexible">Flexible (AI Optimization)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Accommodation Tier
              </label>
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value as AccommodationType)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Budget">Budget (~₹1,200/night)</option>
                <option value="Standard">Standard (~₹2,500/night)</option>
                <option value="Premium">Premium Heritage (~₹5,500/night)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Travel Pace
              </label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value as TravelPace)}
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              >
                <option value="Relaxed">Relaxed (2 major activities/day)</option>
                <option value="Moderate">Moderate (3 balanced activities/day)</option>
                <option value="Packed">Packed (4 full-schedule activities/day)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Food Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Any'] as FoodPreference[]).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFood(f)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    food === f
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                      : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Interests (Select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {allInterests.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION C: Additional Constraints */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white uppercase tracking-wider">
            <Accessibility className="w-4 h-4 text-amber-400" />
            <span>C. Constraints & Special Instructions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={familyFriendly}
                onChange={(e) => setFamilyFriendly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-navy-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Family-Friendly</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={avoidLongJourneys}
                onChange={(e) => setAvoidLongJourneys(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-navy-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Avoid Long Continuous Rides</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-navy-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={accessibility}
                onChange={(e) => setAccessibility(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-0 bg-navy-900 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300">Accessibility (Step-Free)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Preferred Activity Timings
              </label>
              <input
                type="text"
                value={preferredTimings}
                onChange={(e) => setPreferredTimings(e.target.value)}
                placeholder="e.g. Morning 09:30 AM starts; no late night activities"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Special Instructions
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Photography vistas, local handicraft shopping"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Multi-Agent Progress Notification during Generation */}
        {isGeneratingTrip && (
          <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-teal-300 space-y-3 animate-pulse shadow-xl">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-teal-400 animate-spin" />
              <span className="font-bold text-sm">Supervisor Agent Orchestrating Swarm...</span>
            </div>
            <p className="text-xs text-slate-300 font-mono pl-8">
              {activeGenerationLog || 'Coordinating Travel Planner, Weather (Open-Meteo), Transport (OSRM), and Budget Agents...'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGeneratingTrip}
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-navy-950 shadow-xl shadow-teal-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGeneratingTrip ? (
              <>
                <Cpu className="w-5 h-5 animate-spin" />
                <span>Orchestrating AI Swarm...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-navy-950" />
                <span>Generate My Trip</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
