// TripGuard AI - Deterministic Budget Agent
import { Activity, CostBreakdown, ItineraryData, TravelPreferences } from '../../types';

export interface BudgetAnalysis {
  isWithinBudget: boolean;
  totalCost: number;
  budgetLimit: number;
  remainingBudget: number;
  breakdown: CostBreakdown;
  percentageUsed: number;
  expensiveActivities: { activityId: string; name: string; cost: number; sharePercent: number }[];
  recommendation?: string;
}

export const budgetAgent = {
  /**
   * Deterministic financial calculation of all itinerary costs
   * Never relies exclusively on LLM for arithmetic.
   */
  calculateItineraryBudget(
    days: { activities: Activity[] }[],
    accommodationDailyRate: number,
    numDays: number,
    numTravellers: number,
    transportBaseCost: number,
    maxBudgetINR: number
  ): BudgetAnalysis {
    let activitiesCost = 0;
    const activitiesWithCost: { activityId: string; name: string; cost: number; sharePercent: number }[] = [];

    // Sum all activity costs
    for (const day of days) {
      for (const act of day.activities) {
        const itemCost = Math.max(0, act.estimatedExpense || 0) * numTravellers;
        activitiesCost += itemCost;
        if (itemCost > 0) {
          activitiesWithCost.push({
            activityId: act.id,
            name: act.name,
            cost: itemCost,
            sharePercent: 0,
          });
        }
      }
    }

    // Deterministic accommodation total
    const nights = Math.max(1, numDays - 1);
    const accommodationCost = accommodationDailyRate * nights;

    // Deterministic food allowance (e.g. 700 INR per person per day standard)
    const foodCost = 750 * numTravellers * numDays;

    // Transport cost
    const transportCost = transportBaseCost * numTravellers;

    // Miscellaneous buffer (5% of total or 500 per person)
    const subtotal = activitiesCost + accommodationCost + foodCost + transportCost;
    const miscellaneousCost = Math.round(subtotal * 0.05);

    const totalCost = activitiesCost + accommodationCost + foodCost + transportCost + miscellaneousCost;
    const remainingBudget = maxBudgetINR - totalCost;
    const isWithinBudget = totalCost <= maxBudgetINR;
    const percentageUsed = maxBudgetINR > 0 ? Math.round((totalCost / maxBudgetINR) * 100) : 100;

    // Compute share percentages for activities
    for (const item of activitiesWithCost) {
      item.sharePercent = totalCost > 0 ? Math.round((item.cost / totalCost) * 100) : 0;
    }
    // Sort highest first
    activitiesWithCost.sort((a, b) => b.cost - a.cost);

    let recommendation: string | undefined;
    if (!isWithinBudget) {
      const overBy = totalCost - maxBudgetINR;
      recommendation = `Total estimated cost of ₹${totalCost.toLocaleString('en-IN')} exceeds your budget of ₹${maxBudgetINR.toLocaleString('en-IN')} by ₹${overBy.toLocaleString('en-IN')}. Consider replacing top expenses like "${activitiesWithCost[0]?.name || 'premium activity'}" with affordable cultural alternatives.`;
    }

    return {
      isWithinBudget,
      totalCost,
      budgetLimit: maxBudgetINR,
      remainingBudget,
      breakdown: {
        transport: transportCost,
        accommodation: accommodationCost,
        food: foodCost,
        activities: activitiesCost,
        miscellaneous: miscellaneousCost,
      },
      percentageUsed,
      expensiveActivities: activitiesWithCost.slice(0, 3),
      recommendation,
    };
  },

  /**
   * Recalculate budget when an activity is modified or replaced
   */
  recalculateAfterChange(
    itineraryData: ItineraryData,
    maxBudgetINR: number,
    numTravellers: number
  ): BudgetAnalysis {
    const numDays = itineraryData.days.length;
    const accommodationDaily = itineraryData.accommodationSuggestion?.pricePerNight || 2500;
    const transportBase = (itineraryData.costBreakdown?.transport || 3000) / Math.max(1, numTravellers);

    return this.calculateItineraryBudget(
      itineraryData.days,
      accommodationDaily,
      numDays,
      numTravellers,
      transportBase,
      maxBudgetINR
    );
  }
};
