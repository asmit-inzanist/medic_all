import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember as FamilyMemberType } from '@/types/familyMember';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface MedicalDocument {
  id: string;
  document_name: string;
  document_type: string;
  upload_date: string;
  file_size: number;
  description?: string;
}

export class MedicalRecordsExporter {
  private pdf: jsPDF;
  private yPosition: number = 20;
  private pageHeight: number = 280;
  private lineHeight: number = 6;

  constructor() {
    this.pdf = new jsPDF();
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    if (this.yPosition > this.pageHeight) {
      this.pdf.addPage();
      this.yPosition = 20;
    }
    
    this.pdf.text(text, 20, this.yPosition);
    this.yPosition += this.lineHeight;
  }

  private addSection(title: string): void {
    this.yPosition += 5;
    this.addText(title, 14, true);
    this.yPosition += 3;
  }

  private addMultilineText(text: string, maxWidth: number = 170): void {
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      this.addText(line);
    }
  }

  private async getUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      ...profile
    };
  }

  private async getFamilyMembers(): Promise<FamilyMemberType[]> {
    // This method is kept for fallback, but we'll primarily use passed data
    return [];
  }

  private async getMedicalDocuments(): Promise<MedicalDocument[]> {
    // This method is kept for fallback, but we'll primarily use passed data
    return [];
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateHeader(): void {
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Medical Records Export', 20, this.yPosition);
    this.yPosition += 10;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, this.yPosition);
    this.yPosition += 10;

    // Add a line separator
    this.pdf.setLineWidth(0.5);
    this.pdf.line(20, this.yPosition, 190, this.yPosition);
    this.yPosition += 10;
  }

  private generateUserProfile(profile: UserProfile): void {
    this.addSection('Personal Information');
    
    if (profile.full_name) this.addText(`Name: ${profile.full_name}`);
    this.addText(`Email: ${profile.email}`);
    if (profile.phone) this.addText(`Phone: ${profile.phone}`);
    if (profile.date_of_birth) this.addText(`Date of Birth: ${new Date(profile.date_of_birth).toLocaleDateString()}`);
    if (profile.gender) this.addText(`Gender: ${profile.gender}`);
    if (profile.address) {
      this.addText('Address:');
      this.addMultilineText(profile.address);
    }
    if (profile.emergency_contact_name) this.addText(`Emergency Contact: ${profile.emergency_contact_name}`);
    if (profile.emergency_contact_phone) this.addText(`Emergency Phone: ${profile.emergency_contact_phone}`);
  }

  private generateFamilyMembers(familyMembers: FamilyMemberType[]): void {
    if (familyMembers.length === 0) return;

    this.addSection('Family Members');

    familyMembers.forEach((member, index) => {
      this.yPosition += 3;
      this.addText(`${index + 1}. ${member.name} (${member.relationship}, Age: ${member.age})`, 12, true);
      
      if (member.gender) this.addText(`   Gender: ${member.gender}`);
      if (member.blood_type) this.addText(`   Blood Type: ${member.blood_type}`);
      if (member.height) this.addText(`   Height: ${member.height}`);
      if (member.weight) this.addText(`   Weight: ${member.weight}`);
      if (member.emergency_contact) this.addText(`   Emergency Contact: ${member.emergency_contact}`);
      
      if (member.allergies && member.allergies.length > 0) {
        this.addText(`   Allergies:`);
        this.addMultilineText(`   ${member.allergies.join(', ')}`);
      }
      
      if (member.current_medications && member.current_medications.length > 0) {
        this.addText(`   Current Medications:`);
        this.addMultilineText(`   ${member.current_medications.join(', ')}`);
      }
      
      if (member.medical_conditions && member.medical_conditions.length > 0) {
        this.addText(`   Medical Conditions:`);
        this.addMultilineText(`   ${member.medical_conditions.join(', ')}`);
      }
      
      this.yPosition += 3;
    });
  }

  private generateMedicalDocuments(documents: MedicalDocument[]): void {
    if (documents.length === 0) return;

    this.addSection('Medical Documents');
    
    this.addText('The following documents are stored in your medical records:');
    this.yPosition += 3;

    documents.forEach((doc, index) => {
      this.addText(`${index + 1}. ${doc.document_name}`, 11, true);
      this.addText(`   Type: ${doc.document_type}`);
      this.addText(`   Upload Date: ${new Date(doc.upload_date).toLocaleDateString()}`);
      this.addText(`   File Size: ${this.formatFileSize(doc.file_size)}`);
      if (doc.description) {
        this.addText(`   Description:`);
        this.addMultilineText(`   ${doc.description}`);
      }
      this.yPosition += 2;
    });

    this.yPosition += 3;
    this.addText('Note: Document files are not included in this export for security reasons.', 9);
    this.addText('Please access your account directly to download specific documents.', 9);
  }

  private generateFooter(): void {
    this.yPosition += 10;
    this.addText('--- End of Medical Records Export ---', 10, true);
    this.yPosition += 5;
    this.addText('This document contains confidential medical information.', 9);
    this.addText('Please handle with appropriate care and security measures.', 9);
  }

  public async exportMedicalRecords(
    profile?: UserProfile | null,
    familyMembers?: FamilyMemberType[],
    documents?: MedicalDocument[]
  ): Promise<void> {
    try {
      // If no data provided, fetch it
      if (!profile || !familyMembers || !documents) {
        const [fetchedProfile, fetchedFamilyMembers, fetchedDocuments] = await Promise.all([
          this.getUserProfile(),
          this.getFamilyMembers(),
          this.getMedicalDocuments()
        ]);
        
        profile = profile || fetchedProfile;
        familyMembers = familyMembers || fetchedFamilyMembers;
        documents = documents || fetchedDocuments;
      }

      if (!profile) {
        throw new Error('Unable to fetch user profile');
      }

      // Generate PDF content
      this.generateHeader();
      this.generateUserProfile(profile);
      this.generateFamilyMembers(familyMembers);
      this.generateMedicalDocuments(documents);
      this.generateFooter();

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Medical_Records_${profile.full_name || 'User'}_${timestamp}.pdf`;

      // Save the PDF
      this.pdf.save(filename);

    } catch (error) {
      console.error('Error exporting medical records:', error);
      throw error;
    }
  }
}

// Export function for easy use
export const exportMedicalRecords = async (
  profile?: UserProfile | null,
  familyMembers?: FamilyMemberType[],
  documents?: MedicalDocument[]
): Promise<void> => {
  const exporter = new MedicalRecordsExporter();
  await exporter.exportMedicalRecords(profile, familyMembers, documents);
};