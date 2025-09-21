import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, ShoppingCart, Star, MapPin, Truck, Clock, MapPinOff, Loader2, Navigation } from 'lucide-react';
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
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import useLocation from '@/hooks/useLocation';
import { useRealPharmacies } from '@/hooks/useRealPharmacies';
import { PharmacyDetails } from '@/components/PharmacyDetails';

const Medicine = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating' | 'delivery' | 'distance'>('distance');
  const [cartItems, setCartItems] = useState(0);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [showRealPharmacies, setShowRealPharmacies] = useState(false);

  // Location hook
  const { location, isLoading: locationLoading, error: locationError, getCurrentLocation, hasPermission } = useLocation();
  
  // Medicine search hook (for sample data)
  const { 
    medicines, 
    isLoading: medicinesLoading, 
    error: medicinesError, 
    categories 
  } = useMedicineSearch({
    searchTerm: showRealPharmacies ? '' : searchTerm, // Don't search medicines when showing real pharmacies
    category: selectedCategory,
    sortBy,
    userLocation: location.coords,
    maxDistance: 10 // 10km radius
  });

  // Real pharmacies hook
  const { 
    pharmacies: realPharmacies, 
    isLoading: realPharmaciesLoading, 
    error: realPharmaciesError, 
    searchNearbyPharmacies 
  } = useRealPharmacies();

  // Get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Search for real pharmacies when location is available
  useEffect(() => {
    if (location.coords && showRealPharmacies) {
      searchNearbyPharmacies(location.coords.latitude, location.coords.longitude, 5);
    }
  }, [location.coords, showRealPharmacies, searchNearbyPharmacies]);

  const addToCart = (medicineId: string) => {
    setCartItems(cartItems + 1);
  };

  const handlePharmacyClick = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
  };

  const togglePharmacyView = () => {
    setShowRealPharmacies(!showRealPharmacies);
    setSelectedPharmacy(null);
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const showLocationPrompt = !location.coords && !locationLoading;
  const showNoResults = showRealPharmacies 
    ? (!realPharmaciesLoading && realPharmacies.length === 0 && location.coords)
    : (!medicinesLoading && medicines.length === 0 && location.coords);

  const isLoading = showRealPharmacies ? realPharmaciesLoading : medicinesLoading;
  const currentError = showRealPharmacies ? realPharmaciesError : medicinesError;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('medicine.title')}</h1>
              <p className="text-muted-foreground">{t('medicine.subtitle')}</p>
            </div>
            <Button 
              variant={showRealPharmacies ? "default" : "outline"} 
              onClick={togglePharmacyView}
              className="flex items-center"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {showRealPharmacies ? t('medicine.showMedicines') : t('medicine.findRealPharmacies')}
            </Button>
          </div>
        </div>

        {/* Location Status */}
        {showLocationPrompt && (
          <Alert className="mb-6">
            <MapPinOff className="h-4 w-4" />
            <AlertDescription>
              {t('medicine.enableLocationDesc')}
              <Button 
                variant="link" 
                className="p-0 ml-2 h-auto"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {t('medicine.gettingLocation')}
                  </>
                ) : (
                  t('medicine.enableLocation')
                )}
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

        {/* Search and Filters */}
        {!showRealPharmacies && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('medicine.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('medicine.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('medicine.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">{t('medicine.nearestFirst')}</SelectItem>
                <SelectItem value="price-low">{t('medicine.priceLowHigh')}</SelectItem>
                <SelectItem value="price-high">{t('medicine.priceHighLow')}</SelectItem>
                <SelectItem value="rating">{t('medicine.highestRated')}</SelectItem>
                <SelectItem value="delivery">{t('medicine.fastestDelivery')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              {t('medicine.filters')}
            </Button>
          </div>
        </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>{showRealPharmacies ? t('medicine.gettingLocation') : t('common.loading')}</span>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="text-center py-12">
            <MapPinOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {showRealPharmacies ? t('medicine.noPharmaciesFound') : t('medicine.noMedicinesFound')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {showRealPharmacies 
                ? t('medicine.noPharmaciesDesc')
                : searchTerm 
                  ? t('medicine.noMedicinesDesc')
                  : t('medicine.noPharmaciesDesc')
              }
            </p>
            <Button variant="outline" onClick={() => {
              if (showRealPharmacies) {
                if (location.coords) {
                  searchNearbyPharmacies(location.coords.latitude, location.coords.longitude, 10); // Try wider radius
                }
              } else {
                setSearchTerm('');
                setSelectedCategory('all');
              }
            }}>
              {showRealPharmacies ? t('medicine.searchWiderArea') : t('medicine.clearFilters')}
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
        {showRealPharmacies && !isLoading && !showNoResults && realPharmacies.length > 0 && (
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

                  <Button className="w-full">
                    <Navigation className="mr-2 h-4 w-4" />
                    {t('medicine.getDirections')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Medicine Grid */}
        {!showRealPharmacies && !isLoading && !showNoResults && medicines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="group hover:shadow-hover transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gradient-card rounded-lg mb-3 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-1">{medicine.brand || medicine.name}</div>
                        <div className="text-sm text-muted-foreground">{medicine.strength}</div>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {medicine.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {medicine.name} {medicine.strength}
                  </CardTitle>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-3">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{medicine.pharmacy_rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({medicine.pharmacy_reviews})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {medicine.pharmacy_name} {medicine.distance && `• ${formatDistance(medicine.distance)}`}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 mr-1" />
                      {t('medicine.deliveryIn')} {medicine.pharmacy_delivery_time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        ₹{medicine.price.toFixed(2)}
                      </span>
                      {medicine.original_price && medicine.original_price > medicine.price && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ₹{medicine.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <Badge 
                      variant={medicine.is_available ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {medicine.is_available ? t('medicine.inStock') : t('medicine.outOfStock')}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={!medicine.is_available}
                    onClick={() => addToCart(medicine.id)}
                  >
                    {medicine.is_available ? t('medicine.addToCart') : t('medicine.notifyWhenAvailable')}
                  </Button>
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

        {/* Shopping Cart Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full shadow-lg relative">
            <ShoppingCart className="mr-2 h-5 w-5" />
            {t('medicine.cart')}
            {cartItems > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0">
                {cartItems}
              </Badge>
            )}
          </Button>
        </div>

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