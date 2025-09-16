import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, Phone, Calendar, MessageSquare, Users, FileText, Video, Shield, CheckCircle, Search, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CallNotification from '@/components/CallNotification';
import VideoCall from '@/components/VideoCall';

const Doctors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [callInitiated, setCallInitiated] = useState(false);
  const [currentCall, setCurrentCall] = useState<{ roomId: string; doctorName: string } | null>(null);
  const [inVideoCall, setInVideoCall] = useState(false);

  const doctors = [
    {
      id: 'hardcoded-doctor',
      name: 'Dr. Bineet Kumar',
      email: 'bineetgdsc@gmail.com',
      specialty: 'General Physician',
      rating: 4.9,
      reviewCount: 324,
      experience: '15+ years',
      availability: 'Available Now',
      location: 'MD, AIIMS Delhi',
      image: '/placeholder.svg',
      fee: 120,
      responseTime: '< 1 hour',
      languages: ['English', 'Hindi'],
      patientsCount: 2500,
      isOnline: true,
      isVerified: true
    },
  ];

  const specialties = [
    'All Specialties',
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Orthopedist',
    'Neurologist',
    'Psychiatrist'
  ];

  const handleVideoCall = async (doctor: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a video call",
        variant: "destructive",
      });
      return;
    }

    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create call record in database
      const { error: callError } = await (supabase as any)
        .from('video_calls')
        .insert({
          caller_id: user.id,
          receiver_id: doctor.id || 'doctor-placeholder-id',
          caller_email: user.email,
          receiver_email: doctor.email,
          caller_name: user.email?.split('@')[0] || 'User',
          receiver_name: doctor.name,
          room_id: roomId,
          status: 'ringing'
        });

      if (callError) {
        console.error('Error creating call:', callError);
        toast({
          title: "Error",
          description: "Failed to initiate call",
          variant: "destructive",
        });
        return;
      }

      // Show call initiated message
      setCallInitiated(true);
      setCurrentCall({ roomId, doctorName: doctor.name });
      
      toast({
        title: "Video call initiated",
        description: `Calling ${doctor.name}... They will receive a notification to join.`,
        duration: 5000,
      });

      // Auto-enter the call room after 2 seconds
      setTimeout(() => {
        setInVideoCall(true);
      }, 2000);

    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Error",
        description: "Failed to initiate video call",
        variant: "destructive",
      });
    }
  };

  const handleJoinCall = (roomId: string) => {
    setCurrentCall({ roomId, doctorName: 'Dr. Bineet Kumar' });
    setInVideoCall(true);
  };

  const handleLeaveCall = () => {
    setInVideoCall(false);
    setCurrentCall(null);
    setCallInitiated(false);
  };

  if (inVideoCall && currentCall) {
    return <VideoCall roomID={currentCall.roomId} onLeaveCall={handleLeaveCall} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Doctors</h1>
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
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {doctor.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">{doctor.name}</h3>
                    {doctor.isVerified && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">Verified</span>
                      </div>
                    )}
                    {doctor.isOnline && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{doctor.location}</p>
                  <p className="text-muted-foreground mb-4">{doctor.experience}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{doctor.patientsCount.toLocaleString()}+</div>
                      <div className="text-xs text-muted-foreground">Patients Treated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">${doctor.fee}</div>
                      <div className="text-xs text-muted-foreground">Consultation Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{doctor.responseTime}</div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Languages: </span>
                    {doctor.languages.map((lang: string, index: number) => (
                      <span key={lang} className="text-sm mr-3 last:mr-0">
                        {lang}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <span className="text-muted-foreground">Next Available: </span>
                      <span className="text-green-600 font-medium">{doctor.availability}</span>
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleVideoCall(doctor)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
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
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Second Opinion</h3>
            <p className="text-muted-foreground mb-4">Get a second medical opinion from specialists</p>
            <Button variant="outline">Get Opinion</Button>
          </Card>
        </div>
      </div>

      <CallNotification onJoinCall={handleJoinCall} />
    </div>
  );
};

export default Doctors;