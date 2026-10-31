// TripGuard AI - Interactive Leaflet & OpenStreetMap Component
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Activity } from '../../types';

interface LeafletMapProps {
  activities: Activity[];
  selectedActivityId?: string;
  onSelectActivity?: (activityId: string) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  activities,
  selectedActivityId,
  onSelectActivity,
  className = 'h-96 w-full rounded-xl',
  center,
  zoom = 12,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter valid coordinates
    const validActivities = activities.filter(
      (a) => a.location?.lat !== null && a.location?.lng !== null
    );

    const initialLat = center ? center[0] : (validActivities[0]?.location?.lat || 26.9124);
    const initialLng = center ? center[1] : (validActivities[0]?.location?.lng || 75.7873);

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom,
        zoomControl: true,
      });

      // Professional dark/navy OpenStreetMap tiles via CartoDB Dark Matter or Stadia / standard OSM with tile styling
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    // Render Markers
    validActivities.forEach((act, index) => {
      const lat = act.location.lat!;
      const lng = act.location.lng!;
      latLngs.push([lat, lng]);

      const isSelected = act.id === selectedActivityId;
      const isModified = act.state === 'modified';
      const isOutdoor = act.indoorOutdoor === 'outdoor';

      const markerColor = isModified 
        ? '#f59e0b' 
        : isSelected 
        ? '#06b6d4' 
        : isOutdoor 
        ? '#14b8a6' 
        : '#3b82f6';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: ${markerColor};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase;">Step ${index + 1} • ${act.startTime}</span>
            <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 9999px;">${act.indoorOutdoor}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${act.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569; line-height: 1.3;">${act.location.name}</p>
          <div style="font-size: 11px; font-weight: 600; color: #166534;">Est. ₹${act.estimatedExpense.toLocaleString('en-IN')}</div>
          ${act.state === 'modified' ? '<div style="margin-top: 4px; font-size: 10px; color: #d97706; font-weight: 600;">⚡ Autonomous Revision</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectActivity) onSelectActivity(act.id);
      });

      if (markersLayerRef.current) {
        markersLayerRef.current.addLayer(marker);
      }
    });

    // Draw route line between sequential activities
    if (latLngs.length > 1) {
      routeLayerRef.current = L.polyline(latLngs, {
        color: '#06b6d4',
        weight: 3.5,
        opacity: 0.75,
        dashArray: '6, 8',
      }).addTo(map);
    }

    // Fit Bounds
    if (latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), {
        padding: [45, 45],
        maxZoom: 14,
      });
    }

    // Invalidate size on container layout changes
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [activities, selectedActivityId, center, zoom]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden border border-slate-700/60 rounded-xl shadow-xl bg-navy-900">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute top-3 right-3 z-[1000] bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-teal-500/30 text-xs font-medium text-slate-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
        <span>OpenStreetMap • Leaflet Interactive Engine</span>
      </div>
    </div>
  );
};
