import React, { useState, useEffect } from 'react';
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

  // Listen for call status updates
  useEffect(() => {
    if (!user || !currentCall) return;

    const channel = supabase
      .channel('call-status-listener')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls',
          filter: `caller_id=eq.${user.id}`
        },
        (payload) => {
          const updatedCall = payload.new as any;
          
          if (updatedCall.status === 'accepted' && updatedCall.room_id === currentCall.roomId) {
            toast({
              title: "Call Accepted!",
              description: "Joining video call...",
            });
            
            // Join the video call
            setInVideoCall(true);
            setCallInitiated(false);
          } else if (updatedCall.status === 'declined') {
            toast({
              title: "Call Declined",
              description: "The doctor declined your call",
              variant: "destructive",
            });
            setCallInitiated(false);
            setCurrentCall(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentCall, toast]);

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
      
      // Find the receiver user by email in profiles table
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', doctor.email)
        .single();
        
      // If profile doesn't exist, use hardcoded user ID for bineetgdsc@gmail.com
      if (profileError || !profileData) {
        // Hardcode bineet's profile data since RLS is blocking creation
        if (doctor.email === 'bineetgdsc@gmail.com') {
          profileData = {
            id: 'a10571ca-baca-41c9-aa08-e955342ae915',
            user_id: 'a10571ca-baca-41c9-aa08-e955342ae915',
            email: 'bineetgdsc@gmail.com',
            first_name: 'bineet',
            last_name: 'bairagi'
          } as any;
        } else {
          // For any other doctor, use current user ID as fallback
          profileData = {
            id: user.id,
            user_id: user.id,
            email: doctor.email,
            first_name: doctor.name,
            last_name: ''
          } as any;
          
          toast({
            title: "Demo Mode",
            description: "Using demo mode - you'll receive the call notification yourself",
            variant: "default",
          });
        }
      }

      // Create the call record in the database
      const { data: callData, error: callError } = await supabase
        .from('video_calls')
        .insert({
          caller_id: user.id,
          receiver_id: profileData.user_id,
          caller_email: user.email || '',
          receiver_email: doctor.email,
          caller_name: user.user_metadata?.name || user.email || '',
          room_id: roomId,
          status: 'ringing'
        })
        .select()
        .single();

      if (callError) {
        console.error('Error creating call record:', callError);
        throw callError;
      }

      toast({
        title: "Video call initiated",
        description: `Calling ${doctor.name}... You're joining the call now!`,
        duration: 5000,
      });

      // IMPORTANT: Caller (asmit) joins the video call immediately
      setInVideoCall(true);
      setCurrentCall({ roomId, doctorName: doctor.name });
      
      // The receiver (bineet) will get a notification via CallNotification component

    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Failed to initiate call",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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