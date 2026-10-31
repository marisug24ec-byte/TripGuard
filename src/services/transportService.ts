// TripGuard AI - OSRM Routing and Transport Intelligence Service

export interface RouteCalculationResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng]
  source: 'osrm' | 'haversine_road_model';
  transportMode: 'car' | 'bus' | 'train' | 'flight' | 'walking';
  estimatedCostINR: number;
  isAlternativeRoute?: boolean;
}

export const transportService = {
  /**
   * Calculate real route distance, duration and geometry using OSRM
   */
  async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    preferredMode: string = 'Car'
  ): Promise<RouteCalculationResult> {
    try {
      // OSRM expects {longitude},{latitude}
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
          const durationMinutes = Math.round(route.duration / 60);
          
          // GeoJSON gives coordinates as [lng, lat], convert to Leaflet [lat, lng]
          const coordinates: [number, number][] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );

          const estimatedCostINR = this.estimateCostByDistance(distanceKm, preferredMode);

          return {
            distanceKm,
            durationMinutes,
            coordinates,
            source: 'osrm',
            transportMode: this.normalizeMode(preferredMode),
            estimatedCostINR,
          };
        }
      }
    } catch (err) {
      console.warn('[TransportService] OSRM public API unreachable or timed out; falling back to road-tortuosity model:', err);
    }

    // Fallback: Great circle distance + Indian road tortuosity factor (1.28x)
    return this.calculateHaversineRoadEstimate(originLat, originLng, destLat, destLng, preferredMode);
  },

  /**
   * Haversine distance with road curvature factor and realistic transport speed
   */
  calculateHaversineRoadEstimate(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    preferredMode: string
  ): RouteCalculationResult {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    
    // Tortuosity factor for road routes
    const roadKm = Math.round(straightKm * 1.28 * 10) / 10;

    let speedKmh = 50;
    if (preferredMode.toLowerCase().includes('flight')) speedKmh = 550;
    else if (preferredMode.toLowerCase().includes('train')) speedKmh = 65;
    else if (preferredMode.toLowerCase().includes('bus')) speedKmh = 42;
    else speedKmh = 55;

    const durationMinutes = Math.round((roadKm / speedKmh) * 60) + 15; // +15m buffer
    const estimatedCostINR = this.estimateCostByDistance(roadKm, preferredMode);

    // Provide simplified direct line path
    const coordinates: [number, number][] = [
      [lat1, lon1],
      [(lat1 + lat2) / 2, (lon1 + lon2) / 2],
      [lat2, lon2],
    ];

    return {
      distanceKm: Math.max(roadKm, 1),
      durationMinutes: Math.max(durationMinutes, 10),
      coordinates,
      source: 'haversine_road_model',
      transportMode: this.normalizeMode(preferredMode),
      estimatedCostINR,
    };
  },

  /**
   * Deterministic transport cost estimation in INR
   */
  estimateCostByDistance(distanceKm: number, mode: string): number {
    const lower = mode.toLowerCase();
    if (lower.includes('flight')) {
      return Math.round(3500 + distanceKm * 4.5);
    }
    if (lower.includes('train')) {
      return Math.round(300 + distanceKm * 1.6);
    }
    if (lower.includes('bus')) {
      return Math.round(150 + distanceKm * 1.8);
    }
    // Car / Taxi / Cab
    return Math.round(200 + distanceKm * 14.0);
  },

  normalizeMode(mode: string): 'car' | 'bus' | 'train' | 'flight' | 'walking' {
    const lower = mode.toLowerCase();
    if (lower.includes('flight')) return 'flight';
    if (lower.includes('train')) return 'train';
    if (lower.includes('bus')) return 'bus';
    if (lower.includes('walk')) return 'walking';
    return 'car';
  }
};
