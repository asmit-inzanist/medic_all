import { useState } from 'react';
import { Search, Filter, Video, Calendar, Star, MapPin, Clock, Award, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 324,
      experience: '15+ years',
      education: 'MD, Johns Hopkins',
      nextAvailable: 'Today 2:00 PM',
      consultationFee: 120,
      languages: ['English', 'Spanish'],
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      verified: true,
      totalPatients: '2,500+',
      responseTime: '< 1 hour'
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      rating: 4.8,
      reviews: 289,
      experience: '12+ years',
      education: 'MD, Harvard Medical',
      nextAvailable: 'Tomorrow 10:30 AM',
      consultationFee: 150,
      languages: ['English', 'Mandarin'],
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      verified: true,
      totalPatients: '1,800+',
      responseTime: '< 2 hours'
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      rating: 4.9,
      reviews: 456,
      experience: '10+ years',
      education: 'MD, Stanford University',
      nextAvailable: 'Today 4:15 PM',
      consultationFee: 100,
      languages: ['English', 'Spanish', 'Portuguese'],
      avatar: 'https://images.unsplash.com/photo-1594824694996-5b9e217a8657?w=150&h=150&fit=crop&crop=face',
      verified: true,
      totalPatients: '3,200+',
      responseTime: '< 30 mins'
    },
    {
      id: 4,
      name: 'Dr. James Thompson',
      specialty: 'Orthopedic Surgeon',
      rating: 4.7,
      reviews: 203,
      experience: '20+ years',
      education: 'MD, Mayo Clinic',
      nextAvailable: 'Next Week',
      consultationFee: 200,
      languages: ['English'],
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      verified: true,
      totalPatients: '1,500+',
      responseTime: '< 4 hours'
    }
  ];

  const specialties = [
    'All Specialties', 'Cardiologist', 'Neurologist', 'Pediatrician', 
    'Orthopedic Surgeon', 'Dermatologist', 'Psychiatrist', 'Gynecologist'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Doctor Consultation</h1>
          <p className="text-muted-foreground">Connect with certified healthcare professionals for online consultations</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors, specialties, or conditions..."
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
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="any">Any Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price-low">Lowest Fee</SelectItem>
                <SelectItem value="availability">Earliest Available</SelectItem>
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

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-lg font-semibold truncate mr-2">{doctor.name}</h3>
                      {doctor.verified && (
                        <Badge variant="success" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-primary font-medium mb-2">{doctor.specialty}</p>
                    
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium mr-2">{doctor.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({doctor.reviews} reviews)
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{doctor.education}</div>
                      <div>{doctor.experience} experience</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{doctor.totalPatients}</div>
                    <div className="text-xs text-muted-foreground">Patients Treated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">${doctor.consultationFee}</div>
                    <div className="text-xs text-muted-foreground">Consultation Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{doctor.responseTime}</div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">Languages:</div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Available:</span>
                    <span className="ml-1 font-medium text-success">{doctor.nextAvailable}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button className="w-full">
                    <Video className="mr-2 h-4 w-4" />
                    Video Call
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat with Doctor</h3>
            <p className="text-muted-foreground mb-4">Start a text-based consultation for quick medical advice</p>
            <Button variant="outline">Start Chat</Button>
          </Card>

          <Card className="text-center p-6">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">My Appointments</h3>
            <p className="text-muted-foreground mb-4">View and manage your scheduled consultations</p>
            <Button variant="outline">View Schedule</Button>
          </Card>

          <Card className="text-center p-6">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Second Opinion</h3>
            <p className="text-muted-foreground mb-4">Get a second medical opinion from specialists</p>
            <Button variant="outline">Get Opinion</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Doctors;