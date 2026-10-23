import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Doctor } from '@/types/doctor';

interface DoctorsState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

export const useDoctors = () => {
  const [state, setState] = useState<DoctorsState>({
    doctors: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('🔍 Starting to fetch doctors...');
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('name', { ascending: true });

        console.log('📊 Supabase response:', { data, error });

        if (error) {
          console.error('❌ Error fetching doctors:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        console.log('✅ Successfully fetched doctors:', data?.length || 0, 'doctors');
        setState({
          doctors: data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('💥 Unexpected error fetching doctors:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'An unexpected error occurred',
        }));
      }
    };

    fetchDoctors();
  }, []);

  return state;
};