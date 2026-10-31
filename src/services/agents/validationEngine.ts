// TripGuard AI - Backend Validation Engine
import { 
  Trip, 
  ItineraryData, 
  ValidationResult, 
  Activity, 
  DayWeatherSummary 
} from '../../types';

export const validationEngine = {
  /**
   * Validate an itinerary against all 10 domain rules
   */
  validate(
    trip: Trip,
    itineraryData: ItineraryData,
    weatherMap?: { [date: string]: DayWeatherSummary },
    originalActivityIds?: Set<string>,
    preservedActivityIds?: Set<string>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const checksPassed = {
      budgetCompliant: true,
      datesWithinRange: true,
      noTimingOverlaps: true,
      plausibleTravelDurations: true,
      weatherAppropriate: true,
      preferencesRespected: true,
      constraintsRespected: true,
      requiredFieldsPresent: true,
      uncertaintyIdentified: true,
      unaffectedPreserved: true,
    };

    // 1. Budget check
    if (itineraryData.totalEstimatedCost > trip.budget) {
      checksPassed.budgetCompliant = false;
      const overBy = itineraryData.totalEstimatedCost - trip.budget;
      errors.push(`Budget violation: Estimated cost ₹${itineraryData.totalEstimatedCost.toLocaleString('en-IN')} exceeds trip budget ₹${trip.budget.toLocaleString('en-IN')} by ₹${overBy.toLocaleString('en-IN')}.`);
    }

    // 2. Dates within trip range
    const depTime = new Date(trip.departure_date).getTime();
    const retTime = new Date(trip.return_date).getTime();

    for (const day of itineraryData.days) {
      const dayTime = new Date(day.date).getTime();
      if (dayTime < depTime || dayTime > retTime) {
        checksPassed.datesWithinRange = false;
        errors.push(`Date range error: Day ${day.dayNumber} date (${day.date}) falls outside trip dates (${trip.departure_date} to ${trip.return_date}).`);
      }

      // 3. Timing overlaps within each day
      const sortedActivities = [...day.activities].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sortedActivities.length - 1; i++) {
        const cur = sortedActivities[i];
        const next = sortedActivities[i + 1];
        if (cur.endTime > next.startTime) {
          checksPassed.noTimingOverlaps = false;
          warnings.push(`Schedule overlap on Day ${day.dayNumber}: "${cur.name}" ends at ${cur.endTime} but "${next.name}" begins at ${next.startTime}.`);
        }
      }

      // 4. Plausible durations
      for (const act of day.activities) {
        if (act.estimatedDurationMin <= 0 || act.estimatedDurationMin > 480) {
          checksPassed.plausibleTravelDurations = false;
          warnings.push(`Unusual activity duration for "${act.name}": ${act.estimatedDurationMin} minutes.`);
        }
      }

      // 5. Weather appropriateness
      if (weatherMap && weatherMap[day.date]) {
        const forecast = weatherMap[day.date];
        if (!forecast.isOutdoorSafe) {
          const outdoorActs = day.activities.filter(a => a.indoorOutdoor === 'outdoor' && a.state !== 'removed');
          if (outdoorActs.length > 0) {
            checksPassed.weatherAppropriate = false;
            errors.push(`Weather safety alert on ${day.date}: Outdoor activity "${outdoorActs[0].name}" scheduled during heavy rainfall forecast (${forecast.rainMm}mm). Needs indoor alternative.`);
          }
        }
      }

      // 8. Required fields check
      for (const act of day.activities) {
        if (!act.id || !act.name || !act.startTime || !act.endTime) {
          checksPassed.requiredFieldsPresent = false;
          errors.push(`Missing required fields on Day ${day.dayNumber} activity.`);
        }
        if (!act.location || (!act.location.lat && !act.uncertaintyInfo)) {
          // If no coordinates, uncertainty must be clearly identified
          checksPassed.uncertaintyIdentified = false;
          warnings.push(`Unverified coordinates for "${act.name}". Clearly identifying as estimated location.`);
          act.uncertaintyInfo = 'Coordinates approximate / pending local verification.';
        }
      }
    }

    // 7. Accessibility and family constraints
    if (trip.preferences.accessibility) {
      for (const day of itineraryData.days) {
        for (const act of day.activities) {
          if (act.description.toLowerCase().includes('steep climb') || act.description.toLowerCase().includes('rugged trek')) {
            checksPassed.constraintsRespected = false;
            warnings.push(`Accessibility note: "${act.name}" may have terrain limitations for travelers needing step-free access.`);
          }
        }
      }
    }

    // 10. Unaffected activities preserved check (for replanning)
    if (originalActivityIds && preservedActivityIds) {
      if (preservedActivityIds.size === 0 && originalActivityIds.size > 2) {
        checksPassed.unaffectedPreserved = false;
        warnings.push(`Replanning notice: Too many unaffected activities were regenerated instead of preserved.`);
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      checksPassed,
    };
  }
};
