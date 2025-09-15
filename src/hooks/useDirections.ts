import { useState, useCallback } from 'react';

interface DirectionStep {
  instruction: string;
  distance: number;
  duration: number;
  geometry: number[][];
}

interface Route {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: number[][]; // [lng, lat] coordinates
  steps: DirectionStep[];
}

interface UseDirectionsReturn {
  route: Route | null;
  isLoading: boolean;
  error: string | null;
  getDirections: (fromLat: number, fromLng: number, toLat: number, toLng: number) => Promise<void>;
  openInMaps: (toLat: number, toLng: number, label?: string, fromLat?: number, fromLng?: number) => void;
}

export const useDirections = (): UseDirectionsReturn => {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDirections = useCallback(async (
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Using OpenRouteService API (free with registration, but we'll use their demo endpoint)
      // For production, you'd need to register at https://openrouteservice.org/
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248d5f7d168b72340efa2f7ec2b6e23e39b&start=${fromLng},${fromLat}&end=${toLng},${toLat}`,
        {
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          }
        }
      );

      if (!response.ok) {
        // Fallback to basic route calculation
        throw new Error('Routing service unavailable');
      }

      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const feature = data.features[0];
        const properties = feature.properties;
        
        // Extract route information
        const routeData: Route = {
          distance: properties.segments[0].distance,
          duration: properties.segments[0].duration,
          geometry: feature.geometry.coordinates,
          steps: properties.segments[0].steps.map((step: any) => ({
            instruction: step.instruction,
            distance: step.distance,
            duration: step.duration,
            geometry: step.geometry || []
          }))
        };

        setRoute(routeData);
      } else {
        throw new Error('No route found');
      }
    } catch (err) {
      console.error('Directions error:', err);
      
      // Fallback: Create a simple straight-line route
      const distance = calculateStraightLineDistance(fromLat, fromLng, toLat, toLng);
      const estimatedDuration = (distance / 50) * 3600; // Assume 50 km/h average speed
      
      const fallbackRoute: Route = {
        distance: distance * 1000, // Convert to meters
        duration: estimatedDuration,
        geometry: [[fromLng, fromLat], [toLng, toLat]],
        steps: [
          {
            instruction: `Head to destination (${distance.toFixed(1)}km)`,
            distance: distance * 1000,
            duration: estimatedDuration,
            geometry: [[fromLng, fromLat], [toLng, toLat]]
          }
        ]
      };
      
      setRoute(fallbackRoute);
      setError('Using estimated route. For detailed directions, the route will open in your maps app.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate straight-line distance
  const calculateStraightLineDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInMaps = useCallback((toLat: number, toLng: number, label?: string, fromLat?: number, fromLng?: number) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    const appleUrl = `https://maps.apple.com/?daddr=${toLat},${toLng}${label ? `&q=${encodeURIComponent(label)}` : ''}`;
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${toLat},${toLng}` +
      (label ? `&query=${encodeURIComponent(label)}` : '') +
      (fromLat !== undefined && fromLng !== undefined ? `&origin=${fromLat},${fromLng}` : '');
    const androidGeo = `geo:${toLat},${toLng}?q=${encodeURIComponent(label ?? `${toLat},${toLng}`)}&z=16`;
    const androidIntent = `google.navigation:q=${toLat},${toLng}`;
    const osmUrl = (fromLat !== undefined && fromLng !== undefined)
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(`${fromLat},${fromLng};${toLat},${toLng}`)}`
      : `https://www.openstreetmap.org/?mlat=${toLat}&mlon=${toLng}#map=16/${toLat}/${toLng}`;

    const openNew = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

    if (isIOS) {
      // Prefer Apple Maps on iOS; also provide Google as secondary fallback
      openNew(appleUrl);
      setTimeout(() => openNew(googleUrl), 800);
      return;
    }

    if (isAndroid) {
      // Try generic geo: scheme (opens default maps), then Google navigation, then OSM web
      try {
        window.location.href = androidGeo;
      } catch (_) {}
      setTimeout(() => {
        try { window.location.href = androidIntent; } catch (_) {}
      }, 400);
      setTimeout(() => openNew(osmUrl), 800);
      return;
    }

    // Desktop and others: use OpenStreetMap first to avoid Google being blocked in some environments
    openNew(osmUrl);
    // Optional secondary tab with Google Maps for users who prefer it
    setTimeout(() => openNew(googleUrl), 500);
  }, []);

  return {
    route,
    isLoading,
    error,
    getDirections,
    openInMaps,
  };
};