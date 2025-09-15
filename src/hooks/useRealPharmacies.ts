import { useState, useCallback } from 'react';

interface RealPharmacy {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  phone?: string;
  website?: string;
  opening_hours?: string;
}

interface UseRealPharmaciesReturn {
  pharmacies: RealPharmacy[];
  isLoading: boolean;
  error: string | null;
  searchNearbyPharmacies: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
}

export const useRealPharmacies = (): UseRealPharmaciesReturn => {
  const [pharmacies, setPharmacies] = useState<RealPharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
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

  const searchNearbyPharmacies = useCallback(async (
    lat: number, 
    lng: number, 
    radiusKm: number = 5
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Overpass API to find real pharmacies
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:${radiusKm * 1000},${lat},${lng});
          way["amenity"="pharmacy"](around:${radiusKm * 1000},${lat},${lng});
          relation["amenity"="pharmacy"](around:${radiusKm * 1000},${lat},${lng});
        );
        out center meta;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pharmacy data');
      }

      const data = await response.json();
      
      const realPharmacies: RealPharmacy[] = data.elements
        .map((element: any) => {
          // Get coordinates - different for nodes vs ways/relations
          let elementLat, elementLng;
          if (element.type === 'node') {
            elementLat = element.lat;
            elementLng = element.lon;
          } else if (element.center) {
            elementLat = element.center.lat;
            elementLng = element.center.lon;
          } else {
            return null; // Skip if no coordinates
          }

          const tags = element.tags || {};
          const name = tags.name || tags.brand || 'Unknown Pharmacy';
          
          // Build address from available tags
          let address = '';
          if (tags['addr:street']) {
            address = tags['addr:street'];
            if (tags['addr:housenumber']) {
              address = `${tags['addr:housenumber']} ${address}`;
            }
            if (tags['addr:city']) {
              address += `, ${tags['addr:city']}`;
            }
          } else {
            // Fallback to available address components
            const addressParts = [
              tags['addr:housenumber'],
              tags['addr:street'],
              tags['addr:suburb'],
              tags['addr:city']
            ].filter(Boolean);
            address = addressParts.join(', ') || 'Address not available';
          }

          return {
            id: `${element.type}_${element.id}`,
            name,
            address,
            latitude: elementLat,
            longitude: elementLng,
            distance: calculateDistance(lat, lng, elementLat, elementLng),
            phone: tags.phone,
            website: tags.website,
            opening_hours: tags.opening_hours,
          };
        })
        .filter(Boolean) // Remove null entries
        .sort((a, b) => (a.distance || 0) - (b.distance || 0)) // Sort by distance
        .slice(0, 20); // Limit to 20 results

      setPharmacies(realPharmacies);
    } catch (err) {
      console.error('Error fetching real pharmacy data:', err);
      setError('Failed to find nearby pharmacies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    pharmacies,
    isLoading,
    error,
    searchNearbyPharmacies,
  };
};