import React, { useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDirections } from '@/hooks/useDirections';

interface PharmacyDetailsProps {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distance?: number;
    phone?: string;
    website?: string;
    opening_hours?: string;
    rating?: number;
    reviews?: number;
  };
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  onClose: () => void;
}

export const PharmacyDetails: React.FC<PharmacyDetailsProps> = ({
  pharmacy,
  userLocation,
  onClose,
}) => {
  const { route, isLoading, error, getDirections, openInMaps } = useDirections();

  // Get directions when component mounts
  useEffect(() => {
    if (userLocation && pharmacy) {
      getDirections(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.latitude,
        pharmacy.longitude
      );
    }
  }, [userLocation, pharmacy, getDirections]);

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const formatDuration = (durationSeconds: number): string => {
    const minutes = Math.round(durationSeconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatOpeningHours = (hours?: string): string => {
    if (!hours) return 'Hours not available';
    
    // Common opening hours formats from OpenStreetMap
    if (hours.includes('Mo-Su')) {
      return hours.replace('Mo-Su', 'Monday-Sunday');
    }
    if (hours.includes('24/7')) {
      return '24/7 - Always Open';
    }
    return hours;
  };

  const handleGetDirections = () => {
    openInMaps(
      pharmacy.latitude,
      pharmacy.longitude,
      pharmacy.name,
      userLocation?.latitude,
      userLocation?.longitude
    );
  };

  const handleCall = () => {
    if (pharmacy.phone) {
      window.location.href = `tel:${pharmacy.phone}`;
    }
  };

  const handleWebsite = () => {
    if (pharmacy.website) {
      window.open(pharmacy.website, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pharmacy Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{pharmacy.name}</h2>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{pharmacy.address}</span>
            </div>
            {pharmacy.distance && (
              <Badge variant="secondary" className="w-fit">
                {formatDistance(pharmacy.distance)} away
              </Badge>
            )}
          </div>
          
          {pharmacy.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{pharmacy.rating.toFixed(1)}</span>
              {pharmacy.reviews && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({pharmacy.reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Route Information */}
        {isLoading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Getting directions...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {route && !isLoading && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-primary" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {(route.distance / 1000).toFixed(1)}km
                  </div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {formatDuration(route.duration)}
                  </div>
                  <div className="text-xs text-muted-foreground">Est. Time</div>
                </div>
              </div>
              
              {error && (
                <div className="text-xs text-amber-600 mb-3 p-2 bg-amber-50 rounded">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pharmacy.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{pharmacy.phone}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCall}>
                Call
              </Button>
            </div>
          )}

          {pharmacy.opening_hours && (
            <div className="flex items-start">
              <Clock className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">Opening Hours</div>
                <div className="text-sm text-muted-foreground">
                  {formatOpeningHours(pharmacy.opening_hours)}
                </div>
              </div>
            </div>
          )}

          {pharmacy.website && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Website</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleWebsite}>
                Visit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGetDirections}
          disabled={!pharmacy}
        >
          <Navigation className="mr-2 h-5 w-5" />
          Open in Maps
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {pharmacy.phone && (
            <Button variant="outline" onClick={handleCall}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};