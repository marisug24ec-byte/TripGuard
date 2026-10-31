// TripGuard AI - Disruption Detection Agent (Agent 5)
import { 
  Trip, 
  ItineraryData, 
  Disruption, 
  DisruptionSeverity, 
  DisruptionType, 
  DayWeatherSummary 
} from '../../types';

export const disruptionAgent = {
  /**
   * Evaluates active itinerary against real weather, transport conditions, or explicit simulation triggers
   */
  detectDisruptions(
    trip: Trip,
    itineraryData: ItineraryData,
    weatherMap?: { [date: string]: DayWeatherSummary }
  ): Disruption[] {
    const disruptions: Disruption[] = [];

    // 1. Weather Disruption Detection (via Open-Meteo data)
    if (weatherMap) {
      for (const day of itineraryData.days) {
        const forecast = weatherMap[day.date];
        if (forecast && !forecast.isOutdoorSafe) {
          const outdoorActivities = day.activities.filter(
            a => a.indoorOutdoor === 'outdoor' && a.state !== 'removed'
          );

          if (outdoorActivities.length > 0) {
            const affectedIds = outdoorActivities.map(a => a.id);
            const severity: DisruptionSeverity = forecast.rainMm > 35 ? 'High' : 'Medium';

            disruptions.push({
              id: `disr_rain_${day.dayNumber}_${Date.now()}`,
              trip_id: trip.id,
              disruption_type: 'weather',
              severity,
              description: `Severe precipitation alert on Day ${day.dayNumber} (${day.date}): Expected ${forecast.rainMm}mm rainfall (${forecast.precipitationProbability}% chance). Outdoor activities compromised: ${outdoorActivities.map(a => a.name).join(', ')}.`,
              affected_activity: outdoorActivities[0].name,
              affected_activity_ids: affectedIds,
              source: 'Open-Meteo Global Forecasting Model',
              is_simulated: false,
              detected_at: new Date().toISOString(),
              recommended_actions: [
                'Pivot affected outdoor sessions to indoor cultural galleries or museums',
                'Adjust schedule around dry weather intervals',
                'Verify sheltered ground transport',
              ],
            });
          }
        }
      }
    }

    // 2. Budget Disruption Check
    if (itineraryData.totalEstimatedCost > trip.budget) {
      const overBy = itineraryData.totalEstimatedCost - trip.budget;
      disruptions.push({
        id: `disr_budget_${Date.now()}`,
        trip_id: trip.id,
        disruption_type: 'budget',
        severity: overBy > trip.budget * 0.2 ? 'High' : 'Medium',
        description: `Itinerary cost of ₹${itineraryData.totalEstimatedCost.toLocaleString('en-IN')} exceeds authorized trip budget of ₹${trip.budget.toLocaleString('en-IN')} by ₹${overBy.toLocaleString('en-IN')}.`,
        source: 'TripGuard Deterministic Budget Auditor',
        is_simulated: false,
        detected_at: new Date().toISOString(),
        recommended_actions: [
          'Replace premium activities with zero-cost or subsidized cultural attractions',
          'Optimize accommodation tier or dining packages',
        ],
      });
    }

    return disruptions;
  },

  /**
   * Generates a verified simulated disruption for the What-If Simulator
   */
  createSimulatedDisruption(
    tripId: string,
    type: DisruptionType,
    severity: DisruptionSeverity,
    description: string,
    affectedActivityId: string,
    affectedActivityName: string,
    recommendedActions: string[]
  ): Disruption {
    return {
      id: `sim_disr_${Date.now()}`,
      trip_id: tripId,
      disruption_type: type,
      severity,
      description: `[SIMULATED SCENARIO] ${description}`,
      affected_activity: affectedActivityName,
      affected_activity_ids: [affectedActivityId],
      source: 'TripGuard What-If Simulation Engine',
      is_simulated: true,
      detected_at: new Date().toISOString(),
      recommended_actions: recommendedActions,
    };
  }
};
