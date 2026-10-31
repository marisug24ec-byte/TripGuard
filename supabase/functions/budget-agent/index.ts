// Supabase Edge Function: budget-agent (Deterministic Financial Logic)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { activities, accommodationDaily, numDays, travellers, transportBase, maxBudget } = await req.json();

    let activitiesCost = 0;
    (activities || []).forEach((act: any) => {
      activitiesCost += (Number(act.estimatedExpense) || 0) * (travellers || 1);
    });

    const nights = Math.max(1, (numDays || 1) - 1);
    const accommodationCost = (accommodationDaily || 2500) * nights;
    const foodCost = 750 * (travellers || 1) * (numDays || 1);
    const transportCost = (transportBase || 1500) * (travellers || 1);
    const miscCost = Math.round((activitiesCost + accommodationCost + foodCost + transportCost) * 0.05);

    const totalCost = activitiesCost + accommodationCost + foodCost + transportCost + miscCost;
    const remainingBudget = (maxBudget || 50000) - totalCost;
    const isWithinBudget = totalCost <= (maxBudget || 50000);

    return new Response(
      JSON.stringify({
        agent: 'Budget Agent',
        isWithinBudget,
        totalCost,
        remainingBudget,
        breakdown: {
          transport: transportCost,
          accommodation: accommodationCost,
          food: foodCost,
          activities: activitiesCost,
          miscellaneous: miscCost,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
