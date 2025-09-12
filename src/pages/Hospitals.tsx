import { useState } from 'react';
import { Search, Filter, MapPin, Star, Bed, Clock, Phone, Calendar } from 'lucide-react';
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

const Hospitals = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const hospitals = [
    {
      id: 1,
      name: 'Metropolitan Medical Center',
      type: 'General Hospital',
      rating: 4.8,
      reviews: 1234,
      address: '123 Health Street, Downtown',
      distance: '2.3 miles',
      availableBeds: 45,
      totalBeds: 200,
      emergencyWait: '15 mins',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop',
      phone: '+1 (555) 123-4567',
      insurance: ['Blue Cross', 'Aetna', 'Medicare']
    },
    {
      id: 2,
      name: 'St. Mary\'s Healthcare',
      type: 'Specialty Hospital',
      rating: 4.9,
      reviews: 892,
      address: '456 Wellness Ave, Midtown',
      distance: '1.8 miles',
      availableBeds: 12,
      totalBeds: 150,
      emergencyWait: '8 mins',
      specialties: ['Pediatrics', 'Maternity', 'Surgery', 'ICU'],
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
      phone: '+1 (555) 234-5678',
      insurance: ['Cigna', 'UnitedHealth', 'Medicare']
    },
    {
      id: 3,
      name: 'Regional Trauma Center',
      type: 'Trauma Center',
      rating: 4.7,
      reviews: 567,
      address: '789 Emergency Blvd, North Side',
      distance: '4.1 miles',
      availableBeds: 23,
      totalBeds: 180,
      emergencyWait: '5 mins',
      specialties: ['Trauma', 'Emergency', 'Critical Care', 'Surgery'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      phone: '+1 (555) 345-6789',
      insurance: ['All Major Insurance', 'Emergency Coverage']
    }
  ];

  const specialties = [
    'All Specialties', 'Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 
    'Emergency', 'Surgery', 'Maternity', 'ICU', 'Trauma'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Booking</h1>
          <p className="text-muted-foreground">Find and book beds at top hospitals in your area</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals, specialties, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Hospital Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General Hospital</SelectItem>
                <SelectItem value="specialty">Specialty Hospital</SelectItem>
                <SelectItem value="trauma">Trauma Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="availability">Most Available</SelectItem>
                <SelectItem value="wait-time">Shortest Wait</SelectItem>
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
                <h3 className="font-semibold text-destructive">Medical Emergency?</h3>
                <p className="text-sm text-muted-foreground">Call 911 immediately or visit the nearest emergency room</p>
              </div>
            </div>
            <Button variant="destructive">
              Emergency Call
            </Button>
          </div>
        </div>

        {/* Hospital Cards */}
        <div className="space-y-6">
          {hospitals.map((hospital) => (
            <Card key={hospital.id} className="overflow-hidden hover:shadow-hover transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Image */}
                <div className="lg:col-span-4">
                  <div className="h-64 lg:h-full bg-gradient-card overflow-hidden">
                    <img 
                      src={hospital.image} 
                      alt={hospital.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
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
                        <span className="font-medium mr-2">{hospital.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({hospital.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{hospital.address} • {hospital.distance}</span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.specialties.slice(0, 4).map((specialty, index) => (
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
                    </div>

                    {/* Quick Stats */}
                    <div className="flex lg:flex-col gap-4 lg:gap-2 lg:text-right">
                      <div className="text-center lg:text-right">
                        <div className="text-2xl font-bold text-success">{hospital.availableBeds}</div>
                        <div className="text-xs text-muted-foreground">Beds Available</div>
                        <div className="text-xs text-muted-foreground">of {hospital.totalBeds} total</div>
                      </div>
                      
                      <div className="text-center lg:text-right">
                        <div className="text-lg font-semibold text-primary">{hospital.emergencyWait}</div>
                        <div className="text-xs text-muted-foreground">Avg. Wait Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-1">Accepted Insurance:</div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.insurance.map((ins, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ins}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1">
                      <Bed className="mr-2 h-4 w-4" />
                      Book Bed
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Visit
                    </Button>
                    <Button variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
            <p className="text-muted-foreground mb-4">View and manage your hospital reservations</p>
            <Button variant="outline">View Bookings</Button>
          </Card>

          <Card className="text-center p-6">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Emergency Rooms</h3>
            <p className="text-muted-foreground mb-4">Find nearest emergency rooms with live wait times</p>
            <Button variant="outline">Find ER</Button>
          </Card>

          <Card className="text-center p-6">
            <Bed className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibly mb-2">Bed Alerts</h3>
            <p className="text-muted-foreground mb-4">Get notified when beds become available</p>
            <Button variant="outline">Set Alert</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;