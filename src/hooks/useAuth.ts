import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const setupAuth = async () => {
      try {
        console.log('🔐 Setting up authentication...');
        
        // Get initial session with retry logic
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          
          // If session is corrupted, clear it and retry
          if (error.message.includes('invalid') || error.message.includes('malformed')) {
            console.log('🧹 Clearing corrupted session...');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('sb-ggwouvpwnwhdcsjyaiaw-auth-token');
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 Retrying session setup (${retryCount}/${maxRetries})...`);
              setTimeout(setupAuth, 1000);
              return;
            }
          }
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });

        console.log('✅ Authentication setup complete:', !!session);
      } catch (error) {
        console.error('💥 Auth setup error:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      }
    };

    // Set up auth state listener with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          // Clear any lingering storage
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-ggwouvpwnwhdcsjyaiaw-auth-token');
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
        }
        
        if (event === 'SIGNED_IN') {
          console.log('👋 User signed in');
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    );

    // Initialize auth
    setupAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('🔐 Signing out from Supabase...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        
        // Even if Supabase signOut fails, clear local state
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      return { error };
    } catch (unexpectedError) {
      console.error('💥 Unexpected error during signOut:', unexpectedError);
      
      // Clear local state even on unexpected errors
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      
      return { error: unexpectedError as Error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};