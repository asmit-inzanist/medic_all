import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star, MapPin, Clock, Phone, Calendar, MessageSquare, Users, FileText, Video, Shield, CheckCircle, Search, Filter, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDoctors } from '@/hooks/useDoctors';
import { Doctor } from '@/types/doctor';
import VideoCall from '@/components/VideoCall';

const Doctors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { doctors, loading, error } = useDoctors();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('any');
  const [sortBy, setSortBy] = useState('name');
  const [inVideoCall, setInVideoCall] = useState(false);
  const [currentCall, setCurrentCall] = useState<{roomId: string, doctorName: string} | null>(null);
  const [callInitiated, setCallInitiated] = useState(false);
  const [contactPopup, setContactPopup] = useState<{show: boolean, doctorId: string, phone: string | null, name: string}>({
    show: false,
    doctorId: '',
    phone: null,
    name: ''
  });

  // Debug logging
  useEffect(() => {
    console.log('🏥 Doctors component state:', { 
      doctorsCount: doctors.length, 
      loading, 
      error,
      user: user?.email || 'Not logged in'
    });
  }, [doctors, loading, error, user]);

  // Listen for call status updates
  useEffect(() => {
    if (!user || !currentCall) return;

    console.log('Setting up call status listener for user:', user.email);

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
          console.log('Call status update received:', payload);
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

  // Define Dr. Bineet Kumar (for testing) - always shows first
  const drBineet = {
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
    isVerified: true,
    phone: '+91-98765-43210' // Demo phone number
  };

  // Filter real doctors from Supabase
  const filteredDoctors = doctors.filter((doctor: Doctor) => {
    const matchesSearch = searchTerm === '' || 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || selectedSpecialty === '' || 
      doctor.department?.toLowerCase() === selectedSpecialty.toLowerCase();
    
    return matchesSearch && matchesSpecialty;
  });

  // Sort doctors based on selected criteria
  const sortedDoctors = [...filteredDoctors].sort((a: Doctor, b: Doctor) => {
    switch (sortBy) {
      case 'experience':
        return (b.experience || 0) - (a.experience || 0);
      case 'price-low':
        return (a.fees || 0) - (b.fees || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return (a.name || '').localeCompare(b.name || '');
    }
  });

  // Get unique specialties for filter dropdown
  const specialties = [
    'All Specialties',
    ...Array.from(new Set(doctors.map(d => d.department).filter(Boolean))).sort()
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

      // ALWAYS use hardcoded bineet user ID when calling bineetgdsc@gmail.com
      const receiverId = doctor.email === 'bineetgdsc@gmail.com' 
        ? 'a10571ca-baca-41c9-aa08-e955342ae915'  // Bineet's hardcoded user ID
        : profileData.user_id;
      
      console.log('Creating call record for:', doctor.email);
      console.log('📞 Caller ID:', user.id, '📞 Receiver ID:', receiverId);

      // Create the call record in the database
      const { data: callData, error: callError } = await supabase
        .from('video_calls')
        .insert({
          caller_id: user.id,
          receiver_id: receiverId,  // Use hardcoded bineet ID for bineetgdsc@gmail.com
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

      console.log('Call record created successfully');

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

  const handleContactDoctor = (doctor: any) => {
    setContactPopup({
      show: true,
      doctorId: doctor.id,
      phone: doctor.phone || null,
      name: doctor.name
    });
  };

  const closeContactPopup = () => {
    setContactPopup({
      show: false,
      doctorId: '',
      phone: null,
      name: ''
    });
  };

  if (inVideoCall && currentCall) {
    return (
      <>
        <VideoCall roomID={currentCall.roomId} onLeaveCall={handleLeaveCall} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('doctors.title')}</h1>
          <p className="text-muted-foreground">{t('doctors.subtitle')}</p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('doctors.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="price-low">Lowest Fee</SelectItem>
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

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading doctors: {error}</p>
          </div>
        )}

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Dr. Bineet Kumar - Always first (for testing) */}
          <Card key={drBineet.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={drBineet.image} alt={drBineet.name} />
                  <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                    {drBineet.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {drBineet.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-foreground">{drBineet.name}</h3>
                  {drBineet.isVerified && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">{t('doctors.verified')}</span>
                    </div>
                  )}
                  {drBineet.isOnline && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      {t('doctors.online')}
                    </Badge>
                  )}
                </div>
                
                <p className="text-blue-600 font-medium mb-2">{drBineet.specialty}</p>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{drBineet.rating}</span>
                  <span className="text-muted-foreground">({drBineet.reviewCount} reviews)</span>
                </div>
                
                <p className="text-muted-foreground mb-2">{drBineet.location}</p>
                <p className="text-muted-foreground mb-4">{drBineet.experience}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">${drBineet.fee}</div>
                    <div className="text-xs text-muted-foreground">{t('doctors.consultationFee')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{drBineet.responseTime}</div>
                    <div className="text-xs text-muted-foreground">{t('doctors.responseTime')}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">{t('doctors.languages')}: </span>
                  <span className="text-sm">{drBineet.languages.join(', ')}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{t('doctors.nextAvailable')}: {drBineet.availability}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => handleVideoCall(drBineet)} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={callInitiated}
                  >
                    <Video className="mr-1 h-4 w-4" />
                    {callInitiated ? 'Calling...' : t('doctors.call')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleContactDoctor(drBineet)}
                  >
                    <Phone className="mr-1 h-4 w-4" />
                    {t('doctors.contact')}
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-1 h-4 w-4" />
                    {t('doctors.schedule')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Real Doctors from Supabase */}
          {sortedDoctors.map((doctor: Doctor) => (
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={doctor.image_url || undefined} alt={doctor.name} />
                    <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-foreground">{doctor.name}</h3>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Verified</span>
                    </div>
                  </div>
                  
                  <p className="text-blue-600 font-medium mb-2">{doctor.department}</p>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.5</span>
                    <span className="text-muted-foreground">(50+ reviews)</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">{doctor.area}</p>
                  <p className="text-muted-foreground mb-2">{doctor.clinic_name}</p>
                  <p className="text-muted-foreground mb-4">{doctor.experience}+ years experience</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">
                        {doctor.fees === 0 ? 'Free' : `₹${doctor.fees}`}
                      </div>
                      <div className="text-xs text-muted-foreground">Consultation Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">1 hour</div>
                      <div className="text-xs text-muted-foreground">Response Time</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground">Languages: </span>
                    <span className="text-sm">English, Hindi</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Available Today</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleContactDoctor(doctor)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {doctor.contact_type || 'Contact'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
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

      {/* Contact Popup Dialog */}
      <Dialog open={contactPopup.show} onOpenChange={closeContactPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact {contactPopup.name}
            </DialogTitle>
            <DialogDescription>
              Doctor's contact information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {contactPopup.phone || 'No info available'}
                  </p>
                </div>
              </div>
              {contactPopup.phone && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.open(`tel:${contactPopup.phone}`, '_self');
                  }}
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={closeContactPopup}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Doctors;