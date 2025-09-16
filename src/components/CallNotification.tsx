import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CallData {
  id: string;
  caller_id: string;
  caller_email: string;
  caller_name: string;
  room_id: string;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  created_at: string;
}

interface CallNotificationProps {
  onJoinCall?: (roomId: string) => void;
}

const CallNotification: React.FC<CallNotificationProps> = ({ onJoinCall }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up call notifications for user:', user.email);

    // Listen for incoming calls
    const channel = supabase
      .channel('call-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Incoming call notification:', payload);
          const callData = payload.new as CallData;
          
          if (callData.status === 'ringing') {
            setIncomingCall(callData);
            
            // Play notification sound (optional)
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound'));
            
            toast({
              title: "Incoming Video Call",
              description: `${callData.caller_name || callData.caller_email} is calling you`,
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    // Also listen for call status updates
    const statusChannel = supabase
      .channel('call-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_calls'
        },
        (payload) => {
          console.log('Call status update:', payload);
          const updatedCall = payload.new as CallData;
          
          if (updatedCall.status === 'ended' || updatedCall.status === 'declined') {
            setIncomingCall(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusChannel);
    };
  }, [user, toast]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Update call status to accepted
      const { error } = await (supabase as any)
        .from('video_calls')
        .update({ status: 'accepted' })
        .eq('id', incomingCall.id);

      if (error) throw error;

      console.log('Call accepted, joining room:', incomingCall.room_id);
      
      // Join the call
      onJoinCall?.(incomingCall.room_id);
      setIncomingCall(null);
      
      toast({
        title: "Call Accepted",
        description: "Joining video call...",
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive",
      });
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      // Update call status to declined
      const { error } = await (supabase as any)
        .from('video_calls')
        .update({ status: 'declined' })
        .eq('id', incomingCall.id);

      if (error) throw error;

      setIncomingCall(null);
      
      toast({
        title: "Call Declined",
        description: "Call was declined",
      });
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm mx-auto animate-in fade-in zoom-in duration-300 bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-1">Incoming Call</h3>
            <p className="text-sm text-muted-foreground mb-1">Video consultation</p>
            
            <div className="mb-6">
              <p className="font-semibold text-lg">{incomingCall.caller_name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{incomingCall.caller_email}</p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={handleAcceptCall}
                className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleDeclineCall}
                className="border-red-200 text-red-600 hover:bg-red-50 px-6 rounded-lg"
              >
                <span className="mr-2">✕</span>
                Decline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallNotification;