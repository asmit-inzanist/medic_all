import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FamilyMember, CreateFamilyMemberData, UpdateFamilyMemberData } from '@/types/familyMember';
import { toast } from 'sonner';

export const useFamilyMembers = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch family members
  const fetchFamilyMembers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching family members:', error);
        setError(error.message);
        return;
      }

      setFamilyMembers(data || []);
    } catch (err) {
      console.error('Error in fetchFamilyMembers:', err);
      setError('Failed to fetch family members');
    } finally {
      setLoading(false);
    }
  };

  // Create new family member
  const createFamilyMember = async (memberData: CreateFamilyMemberData): Promise<FamilyMember | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([
          {
            user_id: user.id,
            ...memberData
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating family member:', error);
        toast.error('Failed to add family member');
        return null;
      }

      toast.success('Family member added successfully');
      setFamilyMembers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error in createFamilyMember:', err);
      toast.error('Failed to add family member');
      return null;
    }
  };

  // Update family member
  const updateFamilyMember = async (memberData: UpdateFamilyMemberData): Promise<FamilyMember | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      const { id, ...updateData } = memberData;
      
      const { data, error } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating family member:', error);
        toast.error('Failed to update family member');
        return null;
      }

      toast.success('Family member updated successfully');
      setFamilyMembers(prev => 
        prev.map(member => member.id === id ? data : member)
      );
      return data;
    } catch (err) {
      console.error('Error in updateFamilyMember:', err);
      toast.error('Failed to update family member');
      return null;
    }
  };

  // Delete family member
  const deleteFamilyMember = async (memberId: string): Promise<boolean> => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting family member:', error);
        toast.error('Failed to delete family member');
        return false;
      }

      toast.success('Family member deleted successfully');
      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
      return true;
    } catch (err) {
      console.error('Error in deleteFamilyMember:', err);
      toast.error('Failed to delete family member');
      return false;
    }
  };

  // Upload document for family member
  const uploadDocument = async (memberId: string, file: File): Promise<string | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('family-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Failed to upload document');
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('family-documents')
        .getPublicUrl(fileName);

      // Update family member with new document
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) {
        toast.error('Family member not found');
        return null;
      }

      const newDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        uploaded_at: new Date().toISOString()
      };

      const updatedDocuments = [...(member.documents || []), newDocument];

      await updateFamilyMember({
        id: memberId,
        documents: updatedDocuments
      });

      return publicUrl;
    } catch (err) {
      console.error('Error in uploadDocument:', err);
      toast.error('Failed to upload document');
      return null;
    }
  };

  // Initialize
  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  return {
    familyMembers,
    loading,
    error,
    fetchFamilyMembers,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    uploadDocument
  };
};