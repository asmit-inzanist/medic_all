import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Edit, Heart, FileIcon } from 'lucide-react';
import { FamilyMember, UpdateFamilyMemberData } from '@/types/familyMember';
import { toast } from 'sonner';

interface EditFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateMember: (memberData: UpdateFamilyMemberData) => Promise<void>;
  member: FamilyMember | null;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file?: File;
  url?: string;
  preview?: string;
}

export const EditFamilyMemberDialog = ({ open, onOpenChange, onUpdateMember, member }: EditFamilyMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  // Form data state
  const [formData, setFormData] = useState<UpdateFamilyMemberData>({
    id: '',
    name: '',
    age: 0,
    relationship: '',
    gender: '',
    blood_type: '',
    height: '',
    weight: '',
    phone: '',
    email: '',
    date_of_birth: '',
    emergency_contact: '',
    allergies: [],
    current_medications: [],
    medical_conditions: [],
    insurance_info: '',
    documents: []
  });

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        name: member.name,
        age: member.age,
        relationship: member.relationship,
        gender: member.gender || '',
        blood_type: member.blood_type || '',
        height: member.height || '',
        weight: member.weight || '',
        phone: member.phone || '',
        email: member.email || '',
        date_of_birth: member.date_of_birth || '',
        emergency_contact: member.emergency_contact || '',
        allergies: member.allergies || [],
        current_medications: member.current_medications || [],
        medical_conditions: member.medical_conditions || [],
        insurance_info: member.insurance_info || '',
        documents: member.documents || []
      });

      // Initialize uploaded files from existing documents
      if (member.documents) {
        const existingFiles: UploadedFile[] = member.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          url: doc.url
        }));
        setUploadedFiles(existingFiles);
      }
    }
  }, [member]);

  // Reset form when dialog closes
  const resetForm = () => {
    setUploadedFiles([]);
    setActiveTab('basic');
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateFamilyMemberData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes (allergies, medications, conditions)
  const handleArrayFieldChange = (field: 'allergies' | 'current_medications' | 'medical_conditions', value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(field, arrayValue);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported. Please upload PDF, images, or text files.`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setUploadedFiles(prev => [...prev, newFile]);
    });

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Remove uploaded file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.age || formData.age <= 0) {
      toast.error('Valid age is required');
      return false;
    }
    if (!formData.relationship?.trim()) {
      toast.error('Relationship is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert uploaded files to document attachments
      const documents = uploadedFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url || '', // Existing files will have URL, new files will be empty
        uploaded_at: file.url ? member?.documents?.find(d => d.id === file.id)?.uploaded_at || new Date().toISOString() : new Date().toISOString()
      }));

      const memberData = {
        ...formData,
        documents
      };

      await onUpdateMember(memberData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating family member:', error);
      toast.error('Failed to update family member');
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = [
    'Spouse',
    'Child',
    'Parent',
    'Sibling',
    'Grandparent',
    'Grandchild',
    'Other'
  ];

  const genderOptions = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say'
  ];

  const bloodTypeOptions = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edit Family Member
          </DialogTitle>
          <DialogDescription>
            Update {member.name}'s information. Name, age, and relationship are required.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="health">Health Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Basic Details Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    placeholder="Enter age"
                    min="0"
                    max="150"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Info Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypeOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="e.g., 5'6&quot; or 170cm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 70kg or 154lbs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance Information</Label>
                  <Input
                    id="insurance"
                    value={formData.insurance_info}
                    onChange={(e) => handleInputChange('insurance_info', e.target.value)}
                    placeholder="Insurance provider and policy number"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies?.join(', ') || ''}
                    onChange={(e) => handleArrayFieldChange('allergies', e.target.value)}
                    placeholder="Separate multiple allergies with commas"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    value={formData.current_medications?.join(', ') || ''}
                    onChange={(e) => handleArrayFieldChange('current_medications', e.target.value)}
                    placeholder="Separate multiple medications with commas"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    value={formData.medical_conditions?.join(', ') || ''}
                    onChange={(e) => handleArrayFieldChange('medical_conditions', e.target.value)}
                    placeholder="Separate multiple conditions with commas"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Medical Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload prescriptions, lab reports, or other medical documents
                      </span>
                      <input
                        id="document-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                      <Button type="button" variant="outline" className="mt-2">
                        Choose Files
                      </Button>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, Images, or Text files up to 10MB each
                  </p>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Documents ({uploadedFiles.length})</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {file.type.startsWith('image/') ? (
                              file.preview || file.url ? (
                                <img 
                                  src={file.preview || file.url} 
                                  alt={file.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <FileIcon className="w-12 h-12 text-gray-400" />
                              )
                            ) : (
                              <FileIcon className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <p className="text-sm text-gray-500">
            * Required fields
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Member'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};