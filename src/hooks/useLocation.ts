import { useState, useCallback } from 'react';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coords: LocationCoords | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  formattedAddress: string | null;
}

interface UseLocationReturn {
  location: LocationData;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  hasPermission: boolean | null;
}

const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData>({
    coords: null,
    address: null,
    city: null,
    state: null,
    country: null,
    formattedAddress: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Reverse geocoding function using a free API
  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Extract location components
      const address = data.address || {};
      const city = address.city || address.town || address.village || address.hamlet || '';
      const state = address.state || address.region || '';
      const country = address.country || '';
      
      // Create formatted address
      let formattedAddress = '';
      if (city && state) {
        formattedAddress = `${city}, ${state}`;
      } else if (city) {
        formattedAddress = city;
      } else if (data.display_name) {
        // Fallback to display name parts
        const parts = data.display_name.split(',');
        formattedAddress = parts.slice(0, 2).join(',').trim();
      }
      
      return {
        coords: { latitude: lat, longitude: lng },
        address: data.display_name || null,
        city,
        state,
        country,
        formattedAddress,
      };
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Return basic location data without address info
      return {
        coords: { latitude: lat, longitude: lng },
        address: null,
        city: null,
        state: null,
        country: null,
        formattedAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    }
  };

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if permission is already granted
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setHasPermission(permission.state === 'granted');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get address information
      const locationData = await reverseGeocode(latitude, longitude);
      
      setLocation(locationData);
      setHasPermission(true);
      setError(null);
      
    } catch (err: any) {
      console.error('Location error:', err);
      
      let errorMessage = 'Unable to get your location';
      
      if (err.code) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            setHasPermission(false);
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    hasPermission,
  };
};

export default useLocation;
