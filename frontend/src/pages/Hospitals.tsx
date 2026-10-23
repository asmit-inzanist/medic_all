import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, Star, Navigation, Clock, Phone, Calendar, Loader2, MapPinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import useLocation from '@/hooks/useLocation';
import { useRealHospitals } from '@/hooks/useRealHospitals';

const Hospitals = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showRealHospitals, setShowRealHospitals] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Location hook
  const { location, isLoading: locationLoading, error: locationError, getCurrentLocation, hasPermission } = useLocation();
  
  // Real hospitals hook
  const { 
    hospitals: realHospitals, 
    isLoading: realHospitalsLoading, 
    error: realHospitalsError, 
    searchNearbyHospitals 
  } = useRealHospitals();

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Get location on component mount
  useEffect(() => {
    if (!hasPermission && showRealHospitals) {
      setShowLocationPrompt(true);
    } else if (hasPermission && showRealHospitals) {
      setShowLocationPrompt(false);
      getCurrentLocation();
    }
  }, [hasPermission, showRealHospitals, getCurrentLocation]);

  // Search for real hospitals when location is available
  useEffect(() => {
    if (location.coords && showRealHospitals) {
      searchNearbyHospitals(location.coords.latitude, location.coords.longitude, 10);
    }
  }, [location.coords, showRealHospitals, searchNearbyHospitals]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setHospitals(data || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals. Please try again.');
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
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

  const toggleHospitalView = () => {
    setShowRealHospitals(!showRealHospitals);
    if (!showRealHospitals && !hasPermission) {
      setShowLocationPrompt(true);
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Filter hospitals based on search term, specialty, and type
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hospital.specialties && hospital.specialties.some((spec: string) => 
                           spec.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesSpecialty = !specialty || specialty === 'all' || 
                            (hospital.specialties && hospital.specialties.includes(specialty));
    
    const matchesType = !hospitalType || hospitalType === 'all' || 
                       hospital.type.toLowerCase() === hospitalType.toLowerCase();

    return matchesSearch && matchesSpecialty && matchesType;
  });

  // Sort hospitals
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'availability':
        return (b.available_beds || 0) - (a.available_beds || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const specialties = [
    'All Specialties', 'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 
    'Emergency', 'Surgery', 'Maternity', 'ICU', 'Trauma'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('hospitals.title')}</h1>
              <p className="text-muted-foreground">{t('hospitals.subtitle')}</p>
            </div>
            <Button 
              variant={showRealHospitals ? "default" : "outline"} 
              onClick={toggleHospitalView}
              className="flex items-center"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {showRealHospitals ? t('hospitals.showHospitalList') : t('hospitals.findNearbyHospitals')}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('hospitals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.slice(1).map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={hospitalType} onValueChange={setHospitalType}>
              <SelectTrigger>
                <SelectValue placeholder="Hospital Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general hospital">General Hospital</SelectItem>
                <SelectItem value="specialty hospital">Specialty Hospital</SelectItem>
                <SelectItem value="trauma center">Trauma Center</SelectItem>
                <SelectItem value="medical center">Medical Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="availability">Most Available</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Button className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              More
            </Button>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-destructive/20 p-2 rounded-lg mr-4">
                <Phone className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive">{t('hospitals.medicalEmergency')}</h3>
                <p className="text-sm text-muted-foreground">{t('hospitals.emergencyDesc')}</p>
              </div>
            </div>
            <Button variant="destructive">
              {t('hospitals.emergencyCall')}
            </Button>
          </div>
        </div>

        {/* Hospital Cards */}
        {showRealHospitals ? (
          // Real Hospitals Section
          <>
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

            {locationLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t('medicine.findingLocation')}</span>
              </div>
            ) : realHospitalsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">{t('medicine.findingHospitals')}</span>
              </div>
            ) : realHospitalsError ? (
              <div className="text-center py-12">
                <p className="text-destructive">{realHospitalsError}</p>
                <Button onClick={() => searchNearbyHospitals(location.coords!.latitude, location.coords!.longitude)} className="mt-4">
                  {t('medicine.tryAgain')}
                </Button>
              </div>
            ) : realHospitals.length === 0 ? (
              <div className="text-center py-12">
                <MapPinOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('medicine.noHospitalsFound')}</p>
                <Button onClick={() => searchNearbyHospitals(location.coords!.latitude, location.coords!.longitude)}>
                  {t('medicine.searchAgain')}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {realHospitals.map((hospital, index) => (
                  <Card key={`${hospital.name}-${index}`} className="overflow-hidden hover:shadow-hover transition-all duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      {/* Image placeholder */}
                      <div className="lg:col-span-4">
                        <div className="h-64 lg:h-full bg-gradient-primary overflow-hidden">
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                              <p className="text-primary font-medium">{hospital.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="lg:col-span-8 p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                          <div className="mb-4 lg:mb-0">
                            <div className="flex items-center mb-2">
                              <h3 className="text-xl font-semibold mr-3">{hospital.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {formatDistance(hospital.distance)}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{hospital.address}</span>
                            </div>

                            {hospital.phone && (
                              <div className="flex items-center text-muted-foreground mb-3">
                                <Phone className="h-4 w-4 mr-1" />
                                <span className="text-sm">{hospital.phone}</span>
                              </div>
                            )}

                            {hospital.website && (
                              <div className="flex items-center text-muted-foreground mb-3">
                                <span className="text-sm">🌐 {hospital.website}</span>
                              </div>
                            )}

                            {hospital.emergency && (
                              <Badge variant="destructive" className="text-xs">
                                {t('medicine.emergency')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            className="flex-1"
                            onClick={() => openGoogleMaps(hospital.address, hospital.name)}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            {t('hospitals.getDirections')}
                          </Button>
                          {hospital.phone && (
                            <Button 
                              variant="outline"
                              onClick={() => makePhoneCall(hospital.phone)}
                            >
                              <Phone className="mr-2 h-4 w-4" />
                              {t('hospitals.call')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          // Original Hospital Booking System
          loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading hospitals...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchHospitals} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : sortedHospitals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hospitals found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedHospitals.map((hospital) => (
              <Card key={hospital.id} className="overflow-hidden hover:shadow-hover transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  {/* Image */}
                  <div className="lg:col-span-4">
                    <div className="h-64 lg:h-full bg-gradient-primary overflow-hidden">
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                          <p className="text-primary font-medium">{hospital.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-8 p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center mb-2">
                          <CardTitle className="text-xl mr-3">{hospital.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {hospital.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium mr-2">{hospital.rating || 'N/A'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({hospital.review_count || 0} reviews)
                          </span>
                        </div>

                        <div className="flex items-center text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{hospital.address}</span>
                        </div>

                        {/* Phone */}
                        {hospital.phone && (
                          <div className="flex items-center text-muted-foreground mb-3">
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="text-sm">{hospital.phone}</span>
                          </div>
                        )}

                        {/* Operating Hours */}
                        {hospital.operating_hours && (
                          <div className="flex items-center text-muted-foreground mb-3">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {hospital.is_24_hours ? '24/7 Open' : hospital.operating_hours}
                            </span>
                          </div>
                        )}

                        {/* Specialties */}
                        {hospital.specialties && hospital.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hospital.specialties.slice(0, 4).map((specialty: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {hospital.specialties.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{hospital.specialties.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="flex lg:flex-col gap-4 lg:gap-2 lg:text-right">
                        {hospital.available_beds !== null && hospital.total_beds !== null && (
                          <div className="text-center lg:text-right">
                            <div className="text-2xl font-bold text-success">{hospital.available_beds}</div>
                            <div className="text-xs text-muted-foreground">Beds Available</div>
                            <div className="text-xs text-muted-foreground">of {hospital.total_beds} total</div>
                          </div>
                        )}
                        
                        {hospital.emergency_beds !== null && (
                          <div className="text-center lg:text-right">
                            <div className="text-lg font-semibold text-primary">{hospital.emergency_beds}</div>
                            <div className="text-xs text-muted-foreground">Emergency Beds</div>
                          </div>
                        )}

                        {hospital.accepts_emergency && (
                          <div className="text-center lg:text-right">
                            <Badge variant="success" className="text-xs">
                              Emergency Care
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Insurance */}
                    {hospital.insurance_accepted && hospital.insurance_accepted.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-1">Accepted Insurance:</div>
                        <div className="flex flex-wrap gap-1">
                          {hospital.insurance_accepted.map((ins: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ins}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => openGoogleMaps(hospital.address, hospital.name)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        {t('hospitals.getDirections')}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t('hospitals.scheduleVisit')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => makePhoneCall(hospital.phone)}
                        disabled={!hospital.phone}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {t('hospitals.call')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          )
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('hospitals.myBookings')}</h3>
            <p className="text-muted-foreground mb-4">{t('hospitals.viewBookingsDesc')}</p>
            <Button variant="outline">{t('hospitals.viewBookings')}</Button>
          </Card>

          <Card className="text-center p-6">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('hospitals.emergencyRooms')}</h3>
            <p className="text-muted-foreground mb-4">{t('hospitals.emergencyRoomsDesc')}</p>
            <Button variant="outline">{t('hospitals.findER')}</Button>
          </Card>

          <Card className="text-center p-6">
            <Navigation className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('hospitals.navigation')}</h3>
            <p className="text-muted-foreground mb-4">{t('hospitals.navigationDesc')}</p>
            <Button variant="outline">{t('hospitals.findRoutes')}</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;