import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, MapPin, Truck, Clock, MapPinOff, Loader2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMedicineSearch } from '@/hooks/useMedicineSearch';
import useLocation from '@/hooks/useLocation';

const Medicine = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating' | 'delivery' | 'distance'>('distance');
  const [cartItems, setCartItems] = useState(0);

  // Location hook
  const { location, isLoading: locationLoading, error: locationError, getCurrentLocation, hasPermission } = useLocation();
  
  // Medicine search hook
  const { 
    medicines, 
    isLoading: medicinesLoading, 
    error: medicinesError, 
    categories 
  } = useMedicineSearch({
    searchTerm,
    category: selectedCategory,
    sortBy,
    userLocation: location.coords,
    maxDistance: 10 // 10km radius
  });

  // Get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const addToCart = (medicineId: string) => {
    setCartItems(cartItems + 1);
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const showLocationPrompt = !location.coords && !locationLoading;
  const showNoResults = !medicinesLoading && medicines.length === 0 && location.coords;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Medicine Marketplace</h1>
          <p className="text-muted-foreground">Find and order medications from verified pharmacies near you</p>
        </div>

        {/* Location Status */}
        {showLocationPrompt && (
          <Alert className="mb-6">
            <MapPinOff className="h-4 w-4" />
            <AlertDescription>
              Enable location access to find nearby pharmacies with better prices and faster delivery.
              <Button 
                variant="link" 
                className="p-0 ml-2 h-auto"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  'Enable Location'
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
              Showing results near: <strong>{location.formattedAddress}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines, brands, or conditions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
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
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="delivery">Fastest Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {medicinesLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Finding medicines near you...</span>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="text-center py-12">
            <MapPinOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medicines found nearby</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `No results for "${searchTerm}" in your area. Try a different search term.`
                : 'No pharmacies found within 10km of your location.'
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Error State */}
        {medicinesError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {medicinesError} Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Medicine Grid */}
        {!medicinesLoading && !showNoResults && medicines.length > 0 && (
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
                      Delivery in {medicine.pharmacy_delivery_time}
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
                      {medicine.is_available ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>

                  <Button 
                    className="w-full" 
                    disabled={!medicine.is_available}
                    onClick={() => addToCart(medicine.id)}
                  >
                    {medicine.is_available ? 'Add to Cart' : 'Notify When Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Shopping Cart Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full shadow-lg relative">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart
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
            <h3 className="text-lg font-semibold mb-2">Quick Refill</h3>
            <p className="text-muted-foreground mb-4">Reorder your previous prescriptions with one click</p>
            <Button variant="outline">View History</Button>
          </Card>

          <Card className="text-center p-6">
            <Search className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Prescription</h3>
            <p className="text-muted-foreground mb-4">Upload your prescription and we'll find the medicines</p>
            <Button variant="outline">Upload Now</Button>
          </Card>

          <Card className="text-center p-6">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Orders</h3>
            <p className="text-muted-foreground mb-4">Track your medicine deliveries in real-time</p>
            <Button variant="outline">Track Order</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Medicine;