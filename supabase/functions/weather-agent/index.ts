// Supabase Edge Function: weather-agent
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { destination, latitude, longitude, departure_date, return_date } = await req.json();

    let lat = latitude;
    let lon = longitude;

    if (!lat || !lon) {
      // Geocode via Open-Meteo
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination || 'Jaipur')}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        }
      }
    }

    lat = lat || 26.9124;
    lon = lon || 75.7873;

    // Fetch daily forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=16`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    return new Response(
      JSON.stringify({
        agent: 'Weather Agent',
        coordinates: { latitude: lat, longitude: lon },
        daily: forecastData.daily || null,
        timestamp: new Date().toISOString(),
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
