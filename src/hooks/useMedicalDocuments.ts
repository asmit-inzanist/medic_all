import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MedicalDocument {
  id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_url?: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  description?: string;
  is_active: boolean;
}

export const useMedicalDocuments = () => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch user's medical documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('is_active', true)
        .order('upload_date', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Upload a new document
  const uploadDocument = async (
    file: File,
    documentType: string,
    description?: string
  ): Promise<boolean> => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload documents');
        return false;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${documentType}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload file');
        return false;
      }

      // Get public URL if needed (for images)
      let publicUrl = null;
      if (file.type.startsWith('image/')) {
        const { data: urlData } = supabase.storage
          .from('medical-documents')
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('medical_documents')
        .insert({
          user_id: user.id,
          document_name: file.name,
          document_type: documentType,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          description: description
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage
          .from('medical-documents')
          .remove([filePath]);
        toast.error('Failed to save document metadata');
        return false;
      }

      toast.success('Document uploaded successfully');
      await fetchDocuments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        toast.error('Document not found');
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medical-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Soft delete from database
      const { error: dbError } = await supabase
        .from('medical_documents')
        .update({ is_active: false })
        .eq('id', documentId);

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Failed to delete document');
        return false;
      }

      toast.success('Document deleted successfully');
      await fetchDocuments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
      return false;
    }
  };

  // Download a document
  const downloadDocument = async (document: MedicalDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('medical-documents')
        .download(document.file_path);

      if (error) {
        console.error('Download error:', error);
        toast.error('Failed to download document');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.document_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument
  };
};