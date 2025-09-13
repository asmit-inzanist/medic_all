import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Edit, 
  Save, 
  Calendar, 
  Heart, 
  FileText, 
  Users, 
  Settings, 
  Shield,
  Bell,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [editHealth, setEditHealth] = useState(false);
  const [editHistory, setEditHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleHealthEdit = () => setEditHealth(true);
  const handleHealthSave = async () => {
    await saveProfile();
    setEditHealth(false);
  };
  const handleHistoryEdit = () => setEditHistory(true);
  const handleHistorySave = async () => {
    await saveProfile();
    setEditHistory(false);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Initialize profile data from localStorage or empty
  const [profileData, setProfileData] = useState(() => {
    const savedProfile = localStorage.getItem('profileData');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      height: '',
      weight: '',
      emergencyContact: '',
      allergies: '',
      medications: '',
      conditions: '',
      insurance: ''
    };
  });

  // Load profile from Supabase
  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        const formattedData = {
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          bloodType: data.blood_type || '',
          height: data.height || '',
          weight: data.weight || '',
          emergencyContact: data.emergency_contact || '',
          allergies: data.allergies?.join(', ') || '',
          medications: data.current_medications?.join(', ') || '',
          conditions: data.medical_conditions?.join(', ') || '',
          insurance: data.insurance_info || ''
        };
        setProfileData(formattedData);
        localStorage.setItem('profileData', JSON.stringify(formattedData));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save profile to Supabase
  const saveProfile = async () => {
    if (!user) return;

    try {
      const [firstName, ...lastNameParts] = profileData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const profilePayload = {
        user_id: user.id,
        first_name: firstName || null,
        last_name: lastName || null,
        email: profileData.email || null,
        phone: profileData.phone || null,
        date_of_birth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        blood_type: profileData.bloodType || null,
        height: profileData.height || null,
        weight: profileData.weight || null,
        emergency_contact: profileData.emergencyContact || null,
        allergies: profileData.allergies ? profileData.allergies.split(',').map(s => s.trim()) : null,
        current_medications: profileData.medications ? profileData.medications.split(',').map(s => s.trim()) : null,
        medical_conditions: profileData.conditions ? profileData.conditions.split(',').map(s => s.trim()) : null,
        insurance_info: profileData.insurance || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profilePayload);

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile');
        return;
      }

      toast.success('Profile saved successfully');
      localStorage.setItem('profileData', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  // Check if profile is incomplete on component mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      const isIncomplete = Object.values(profileData).every(value => value === '');
      setShowOnboarding(isIncomplete);
    }
  }, [profileData, loading]);

  // Check if all fields are blank (first time user)
  const isProfileIncomplete = Object.values(profileData).some((v) => v === '');

  // Show onboarding only if profile is incomplete and user hasn't skipped
  const shouldShowOnboarding = showOnboarding && isProfileIncomplete;

  const handleOnboardingChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    await saveProfile();
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };
  // ...existing code...
  // Onboarding modal
  if (shouldShowOnboarding) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl" onSubmit={handleOnboardingSubmit}>
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input name="name" placeholder="Full Name" value={profileData.name} onChange={handleOnboardingChange} />
            <Input name="email" placeholder="Email" value={profileData.email} onChange={handleOnboardingChange} />
            <Input name="phone" placeholder="Phone" value={profileData.phone} onChange={handleOnboardingChange} />
            <Input name="dateOfBirth" placeholder="Date of Birth" value={profileData.dateOfBirth} onChange={handleOnboardingChange} />
            <Input name="gender" placeholder="Gender" value={profileData.gender} onChange={handleOnboardingChange} />
            <Input name="bloodType" placeholder="Blood Type" value={profileData.bloodType} onChange={handleOnboardingChange} />
            <Input name="height" placeholder="Height" value={profileData.height} onChange={handleOnboardingChange} />
            <Input name="weight" placeholder="Weight" value={profileData.weight} onChange={handleOnboardingChange} />
            <Input name="emergencyContact" placeholder="Emergency Contact" value={profileData.emergencyContact} onChange={handleOnboardingChange} />
            <Input name="allergies" placeholder="Allergies" value={profileData.allergies} onChange={handleOnboardingChange} />
            <Input name="medications" placeholder="Current Medications" value={profileData.medications} onChange={handleOnboardingChange} />
            <Input name="conditions" placeholder="Medical Conditions" value={profileData.conditions} onChange={handleOnboardingChange} />
            <Input name="insurance" placeholder="Insurance Information" value={profileData.insurance} onChange={handleOnboardingChange} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleOnboardingSkip}>Skip</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    );
  }

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      description: 'Video consultation with Dr. Sarah Wilson',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'prescription',
      description: 'Prescription filled - Lisinopril 10mg',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: 3,
      type: 'booking',
      description: 'Hospital bed reserved at Metropolitan Medical',
      date: '2024-01-08',
      status: 'upcoming'
    },
    {
      id: 4,
      type: 'ai_chat',
      description: 'AI Health Assistant consultation',
      date: '2024-01-05',
      status: 'completed'
    }
  ];

  const familyMembers = [
    {
      id: 1,
      name: 'Jane Doe',
      relationship: 'Spouse',
      age: 28,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c28ca656?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Emma Doe',
      relationship: 'Daughter',
      age: 8,
      avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground">Manage your health profile and medical information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('common.save')}
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('common.edit')}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mb-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Photo
                  </Button>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('profile.name')}</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dob">{t('profile.dateOfBirth')}</Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{profileData.gender}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="medical" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Medical Information Tab */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="mr-2 h-5 w-5" />
                      Health Information
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editHealth ? (
                        <>
                          <div>
                            <Label>Blood Type</Label>
                            <Input name="bloodType" value={profileData.bloodType} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Height</Label>
                            <Input name="height" value={profileData.height} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Weight</Label>
                            <Input name="weight" value={profileData.weight} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Emergency Contact</Label>
                            <Input name="emergencyContact" value={profileData.emergencyContact} onChange={handleOnboardingChange} />
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHealthSave}>Save</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>Blood Type</Label>
                            <p className="text-sm text-muted-foreground">{profileData.bloodType}</p>
                          </div>
                          <div>
                            <Label>Height</Label>
                            <p className="text-sm text-muted-foreground">{profileData.height}</p>
                          </div>
                          <div>
                            <Label>Weight</Label>
                            <p className="text-sm text-muted-foreground">{profileData.weight}</p>
                          </div>
                          <div>
                            <Label>Emergency Contact</Label>
                            <p className="text-sm text-muted-foreground">{profileData.emergencyContact}</p>
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHealthEdit}>Edit</Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      {editHistory ? (
                        <>
                          <div>
                            <Label>Allergies</Label>
                            <Input name="allergies" value={profileData.allergies} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Current Medications</Label>
                            <Input name="medications" value={profileData.medications} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Medical Conditions</Label>
                            <Input name="conditions" value={profileData.conditions} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>Insurance Information</Label>
                            <Input name="insurance" value={profileData.insurance} onChange={handleOnboardingChange} />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHistorySave}>Save</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>Allergies</Label>
                            <p className="text-sm text-muted-foreground">{profileData.allergies}</p>
                          </div>
                          <div>
                            <Label>Current Medications</Label>
                            <p className="text-sm text-muted-foreground">{profileData.medications}</p>
                          </div>
                          <div>
                            <Label>Medical Conditions</Label>
                            <p className="text-sm text-muted-foreground">{profileData.conditions}</p>
                          </div>
                          <div>
                            <Label>Insurance Information</Label>
                            <p className="text-sm text-muted-foreground">{profileData.insurance}</p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHistoryEdit}>Edit</Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export Medical Records
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={activity.status === 'completed' ? 'success' : 'secondary'}>
                            {activity.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Family Tab */}
              <TabsContent value="family" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Family Members
                      </CardTitle>
                      <Button size="sm">Add Member</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.relationship}</p>
                            <p className="text-sm text-muted-foreground">Age: {member.age}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates about appointments and health tips</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Privacy Settings</p>
                        <p className="text-sm text-muted-foreground">Manage who can see your health information</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-destructive">
                      <Shield className="mr-2 h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-muted-foreground">Download a copy of your health data</p>
                      </div>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;