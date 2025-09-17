import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthRecovery: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showRecovery, setShowRecovery] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Check for auth errors
    const checkAuthHealth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error && (
          error.message.includes('invalid') || 
          error.message.includes('malformed') ||
          error.message.includes('failed')
        )) {
          console.log('🚨 Auth session corrupted, showing recovery UI');
          setShowRecovery(true);
        }
      } catch (error) {
        console.error('Auth health check failed:', error);
        setShowRecovery(true);
      }
    };

    if (!loading && !user) {
      setTimeout(checkAuthHealth, 1000);
    }
  }, [user, loading]);

  const handleRecoverSession = async () => {
    setIsRecovering(true);
    
    try {
      console.log('🔧 Attempting session recovery...');
      
      // Clear potentially corrupted data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-ggwouvpwnwhdcsjyaiaw-auth-token');
      sessionStorage.clear();
      
      // Try to refresh the session
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.log('🧹 Session refresh failed, clearing all auth data');
        await supabase.auth.signOut();
      }
      
      toast({
        title: "Session Recovery",
        description: "Authentication session has been reset. Please sign in again.",
      });
      
      // Refresh the page to reset the app state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Session recovery failed:', error);
      
      toast({
        variant: "destructive",
        title: "Recovery Failed",
        description: "Please refresh the page manually.",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const handleForceRefresh = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!showRecovery) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle>Authentication Session Issue</CardTitle>
          <CardDescription>
            Your authentication session has encountered an issue. 
            This can happen due to network problems or expired tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRecoverSession}
            disabled={isRecovering}
            className="w-full"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Recovering Session...
              </>
            ) : (
              'Recover Session'
            )}
          </Button>
          
          <Button 
            onClick={handleForceRefresh}
            variant="outline"
            className="w-full"
          >
            Force Refresh Page
          </Button>
          
          <div className="text-sm text-gray-600 text-center">
            <p>Or try these manual steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open Developer Tools (F12)</li>
              <li>Go to Application → Storage</li>
              <li>Clear Local Storage & Session Storage</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRecovery;