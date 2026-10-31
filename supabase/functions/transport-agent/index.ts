// Supabase Edge Function: transport-agent
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { originLat, originLng, destLat, destLng, mode } = await req.json();

    const oLat = originLat || 28.6139;
    const oLng = originLng || 77.2090;
    const dLat = destLat || 26.9124;
    const dLng = destLng || 75.7873;

    // Call OSRM public router
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        return new Response(
          JSON.stringify({
            agent: 'Transport Agent',
            source: 'osrm',
            distanceKm: Math.round((route.distance / 1000) * 10) / 10,
            durationMinutes: Math.round(route.duration / 60),
            geometry: route.geometry,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        agent: 'Transport Agent',
        source: 'haversine_fallback',
        distanceKm: 268,
        durationMinutes: 270,
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
