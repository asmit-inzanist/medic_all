import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ShoppingCart, Star, MapPin, Truck, Clock, MapPinOff, Loader2, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useLocation from '@/hooks/useLocation';
import { useRealPharmacies } from '@/hooks/useRealPharmacies';
import { PharmacyDetails } from '@/components/PharmacyDetails';

const Medicine = () => {
  const { t } = useTranslation();
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Location hook
  const { location, isLoading: locationLoading, error: locationError, getCurrentLocation, hasPermission } = useLocation();
  
  // Real pharmacies hook
  const { 
    pharmacies: realPharmacies, 
    isLoading: realPharmaciesLoading, 
    error: realPharmaciesError, 
    searchNearbyPharmacies 
  } = useRealPharmacies();

  // Get location on component mount
  useEffect(() => {
    if (!hasPermission) {
      setShowLocationPrompt(true);
    } else {
      setShowLocationPrompt(false);
      getCurrentLocation();
    }
  }, [hasPermission, getCurrentLocation]);

  // Search for real pharmacies when location is available
  useEffect(() => {
    if (location.coords) {
      searchNearbyPharmacies(location.coords.latitude, location.coords.longitude, 5);
    }
  }, [location.coords, searchNearbyPharmacies]);

  const handlePharmacyClick = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
  };

  const openGoogleMaps = (address: string, name: string) => {
    const encodedAddress = encodeURIComponent(`${name}, ${address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const makePhoneCall = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const showNoResults = !realPharmaciesLoading && realPharmacies.length === 0 && location.coords;

  const isLoading = realPharmaciesLoading;
  const currentError = realPharmaciesError;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('medicine.title')}</h1>
          <p className="text-muted-foreground">{t('medicine.subtitle')}</p>
        </div>

        {/* Location Status */}
        {showLocationPrompt && (
          <Alert className="mb-6">
            <MapPinOff className="h-4 w-4" />
            <AlertDescription>
              {t('medicine.locationRequired')}
              <Button 
                onClick={() => {
                  getCurrentLocation();
                  setShowLocationPrompt(false);
                }}
                variant="link" 
                className="ml-2 p-0 h-auto"
              >
                {t('medicine.enableLocation')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {locationError && (
          <Alert variant="destructive" className="mb-6">
            <MapPinOff className="h-4 w-4" />
            <AlertDescription>
              {locationError} You can still browse all available medicines.
            </AlertDescription>
          </Alert>
        )}

        {location.formattedAddress && (
          <Alert className="mb-6">
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              {t('medicine.showingResultsNear')} <strong>{location.formattedAddress}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>{t('medicine.gettingLocation')}</span>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="text-center py-12">
            <MapPinOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('medicine.noPharmaciesFound')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('medicine.noPharmaciesDesc')}
            </p>
            <Button variant="outline" onClick={() => {
              if (location.coords) {
                searchNearbyPharmacies(location.coords.latitude, location.coords.longitude, 10); // Try wider radius
              }
            }}>
              {t('medicine.searchWiderArea')}
            </Button>
          </div>
        )}

        {/* Error State */}
        {currentError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {currentError} Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Real Pharmacies Grid */}
        {!isLoading && !showNoResults && realPharmacies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {realPharmacies.map((pharmacy) => (
              <Card 
                key={pharmacy.id} 
                className="group hover:shadow-hover transition-all duration-300 cursor-pointer"
                onClick={() => handlePharmacyClick(pharmacy)}
              >
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gradient-card rounded-lg mb-3 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                        <div className="text-lg font-bold text-primary">{pharmacy.name}</div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {t('medicine.realPharmacy')}
                  </Badge>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {pharmacy.name}
                  </CardTitle>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{pharmacy.address}</span>
                    </div>
                    
                    {pharmacy.distance && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Navigation className="h-4 w-4 mr-1" />
                        {formatDistance(pharmacy.distance)} {t('medicine.away')}
                      </div>
                    )}

                    {pharmacy.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="truncate">{pharmacy.phone}</span>
                      </div>
                    )}

                    {pharmacy.opening_hours && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="truncate">{pharmacy.opening_hours}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(pharmacy.address, pharmacy.name);
                      }}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      {t('medicine.getDirections')}
                    </Button>
                    {pharmacy.phone && (
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          makePhoneCall(pharmacy.phone);
                        }}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {t('medicine.callPharmacy')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pharmacy Details Dialog */}
        <Dialog open={!!selectedPharmacy} onOpenChange={(open) => !open && setSelectedPharmacy(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Pharmacy Details</DialogTitle>
            </DialogHeader>
            {selectedPharmacy && (
              <PharmacyDetails 
                pharmacy={selectedPharmacy}
                userLocation={location.coords}
                onClose={() => setSelectedPharmacy(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('medicine.quickRefill')}</h3>
            <p className="text-muted-foreground mb-4">{t('medicine.quickRefillDesc')}</p>
            <Button variant="outline">{t('medicine.viewHistory')}</Button>
          </Card>

          <Card className="text-center p-6">
            <Search className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('medicine.uploadPrescription')}</h3>
            <p className="text-muted-foreground mb-4">{t('medicine.uploadPrescriptionDesc')}</p>
            <Button variant="outline">{t('medicine.uploadNow')}</Button>
          </Card>

          <Card className="text-center p-6">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('medicine.trackOrders')}</h3>
            <p className="text-muted-foreground mb-4">{t('medicine.trackOrdersDesc')}</p>
            <Button variant="outline">{t('medicine.trackOrder')}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Medicine;