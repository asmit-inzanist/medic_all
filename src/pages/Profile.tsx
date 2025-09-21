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
  Upload,
  Folder,
  UserPlus,
  Trash2,
  Phone,
  Mail
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
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MedicalDocumentsManager from '@/components/MedicalDocumentsManager';
import { AddFamilyMemberDialog } from '@/components/AddFamilyMemberDialog';
import { EditFamilyMemberDialog } from '@/components/EditFamilyMemberDialog';
import { CreateFamilyMemberData, FamilyMember, UpdateFamilyMemberData } from '@/types/familyMember';
import { exportMedicalRecords } from '@/lib/medicalRecordsExporter';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { familyMembers, loading: familyLoading, createFamilyMember, updateFamilyMember, deleteFamilyMember } = useFamilyMembers();
  const [editHealth, setEditHealth] = useState(false);
  const [editHistory, setEditHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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

  // Handle adding new family member
  const handleAddFamilyMember = async (memberData: CreateFamilyMemberData) => {
    await createFamilyMember(memberData);
  };

  // Handle editing family member
  const handleEditFamilyMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowEditMemberDialog(true);
  };

  // Handle updating family member
  const handleUpdateFamilyMember = async (memberData: UpdateFamilyMemberData) => {
    await updateFamilyMember(memberData);
  };

  // Handle deleting family member
  const handleDeleteFamilyMember = async (memberId: string) => {
    if (confirm('Are you sure you want to delete this family member?')) {
      await deleteFamilyMember(memberId);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  const handleExportMedicalRecords = async () => {
    try {
      toast.success('Generating your medical records export...');
      
      // Create user profile object from current data
      const userProfile = {
        id: user?.id || '',
        email: user?.email || '',
        full_name: profileData.name,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: '', // Add if you have address field
        emergency_contact_name: profileData.emergencyContact,
        emergency_contact_phone: '' // Add if you have emergency phone field
      };

      await exportMedicalRecords(userProfile, familyMembers, []);
      toast.success('Medical records exported successfully!');
    } catch (error) {
      console.error('Error exporting medical records:', error);
      toast.error('Failed to export medical records. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('profile.profileInformation')}</CardTitle>
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
                  <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mb-4">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('profile.changePhoto')}
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
                  <Label htmlFor="gender">{t('profile.gender')}</Label>
                  {isEditing ? (
                    <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t('profile.male')}</SelectItem>
                        <SelectItem value="Female">{t('profile.female')}</SelectItem>
                        <SelectItem value="Other">{t('profile.other')}</SelectItem>
                        <SelectItem value="Prefer not to say">{t('profile.preferNotToSay')}</SelectItem>
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
                    {t('profile.saveChanges')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="medical" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="medical">{t('profile.tabs.medical')}</TabsTrigger>
                <TabsTrigger value="documents">{t('profile.tabs.documents')}</TabsTrigger>
                <TabsTrigger value="activity">{t('profile.tabs.activity')}</TabsTrigger>
                <TabsTrigger value="family">{t('profile.tabs.family')}</TabsTrigger>
                <TabsTrigger value="settings">{t('profile.tabs.settings')}</TabsTrigger>
              </TabsList>

              {/* Medical Information Tab */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="mr-2 h-5 w-5" />
                      {t('profile.healthInfo')}
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editHealth ? (
                        <>
                          <div>
                            <Label>{t('profile.bloodType')}</Label>
                            <Input name="bloodType" value={profileData.bloodType} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.height')}</Label>
                            <Input name="height" value={profileData.height} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.weight')}</Label>
                            <Input name="weight" value={profileData.weight} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.emergencyContact')}</Label>
                            <Input name="emergencyContact" value={profileData.emergencyContact} onChange={handleOnboardingChange} />
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHealthSave}>{t('common.save')}</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>{t('profile.bloodType')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.bloodType}</p>
                          </div>
                          <div>
                            <Label>{t('profile.height')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.height}</p>
                          </div>
                          <div>
                            <Label>{t('profile.weight')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.weight}</p>
                          </div>
                          <div>
                            <Label>{t('profile.emergencyContact')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.emergencyContact}</p>
                          </div>
                          <div className="col-span-2 flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHealthEdit}>{t('common.edit')}</Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      {t('profile.medicalHistory')}
                    </CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      {editHistory ? (
                        <>
                          <div>
                            <Label>{t('profile.allergies')}</Label>
                            <Input name="allergies" value={profileData.allergies} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.medications')}</Label>
                            <Input name="medications" value={profileData.medications} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.conditions')}</Label>
                            <Input name="conditions" value={profileData.conditions} onChange={handleOnboardingChange} />
                          </div>
                          <div>
                            <Label>{t('profile.insuranceInfo')}</Label>
                            <Input name="insurance" value={profileData.insurance} onChange={handleOnboardingChange} />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHistorySave}>{t('common.save')}</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label>{t('profile.allergies')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.allergies}</p>
                          </div>
                          <div>
                            <Label>{t('profile.medications')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.medications}</p>
                          </div>
                          <div>
                            <Label>{t('profile.conditions')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.conditions}</p>
                          </div>
                          <div>
                            <Label>{t('profile.insuranceInfo')}</Label>
                            <p className="text-sm text-muted-foreground">{profileData.insurance}</p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={handleHistoryEdit}>{t('common.edit')}</Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleExportMedicalRecords}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('profile.exportMedicalRecords')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Folder className="mr-2 h-4 w-4" />
                    {t('profile.viewDocuments')}
                  </Button>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <MedicalDocumentsManager />
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      {t('profile.recentActivity')}
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
                        {t('profile.familyMembers')}
                      </CardTitle>
                      <Button 
                        size="sm" 
                        onClick={() => setShowAddMemberDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        {t('profile.addMember')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {familyLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading family members...</p>
                      </div>
                    ) : familyMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-muted-foreground mb-4">{t('profile.noFamilyMembers')}</p>
                        <Button onClick={() => setShowAddMemberDialog(true)} className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          {t('profile.addFirstFamilyMember')}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {familyMembers.map((member) => (
                          <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-blue-100 text-blue-600">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-medium text-lg">{member.name}</h4>
                                  <p className="text-sm text-muted-foreground">{member.relationship}</p>
                                  <p className="text-sm text-muted-foreground">Age: {member.age}</p>
                                  
                                  {/* Additional info */}
                                  <div className="flex items-center gap-4 mt-2">
                                    {member.phone && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span>{member.phone}</span>
                                      </div>
                                    )}
                                    {member.email && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span>{member.email}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Health info badges */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {member.blood_type && (
                                      <Badge variant="outline" className="text-xs">
                                        {member.blood_type}
                                      </Badge>
                                    )}
                                    {member.allergies && member.allergies.length > 0 && (
                                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                        {member.allergies.length} Allergies
                                      </Badge>
                                    )}
                                    {member.current_medications && member.current_medications.length > 0 && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                                        {member.current_medications.length} Medications
                                      </Badge>
                                    )}
                                    {member.documents && member.documents.length > 0 && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                        <FileText className="h-3 w-3 mr-1" />
                                        {member.documents.length} Documents
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditFamilyMember(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteFamilyMember(member.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      {t('profile.accountSettings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.emailNotifications')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile.emailNotificationsDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm">{t('profile.configure')}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.privacySettings')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile.privacySettingsDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm">{t('profile.manage')}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.twoFactorAuth')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile.twoFactorAuthDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm">{t('profile.enable')}</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-destructive">
                      <Shield className="mr-2 h-5 w-5" />
                      {t('profile.dangerZone')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('profile.exportData')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile.exportDataDesc')}</p>
                      </div>
                      <Button variant="outline" size="sm">{t('profile.export')}</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-destructive">{t('profile.deleteAccount')}</p>
                        <p className="text-sm text-muted-foreground">{t('profile.deleteAccountDesc')}</p>
                      </div>
                      <Button variant="destructive" size="sm">{t('common.delete')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add Family Member Dialog */}
        <AddFamilyMemberDialog
          open={showAddMemberDialog}
          onOpenChange={setShowAddMemberDialog}
          onAddMember={handleAddFamilyMember}
        />

        {/* Edit Family Member Dialog */}
        <EditFamilyMemberDialog
          open={showEditMemberDialog}
          onOpenChange={setShowEditMemberDialog}
          onUpdateMember={handleUpdateFamilyMember}
          member={selectedMember}
        />
      </div>
    </div>
  );
};

export default Profile;