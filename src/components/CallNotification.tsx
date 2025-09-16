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
      <Card className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-4">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarFallback className="text-lg">
              {incomingCall.caller_name?.charAt(0) || incomingCall.caller_email?.charAt(0) || 'D'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl">Incoming Video Call</CardTitle>
          <p className="text-muted-foreground">
            {incomingCall.caller_name || incomingCall.caller_email}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="destructive"
              onClick={handleDeclineCall}
              className="flex-1 h-14"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              Decline
            </Button>
            <Button
              size="lg"
              onClick={handleAcceptCall}
              className="flex-1 h-14 bg-green-600 hover:bg-green-700"
            >
              <Video className="w-5 h-5 mr-2" />
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallNotification;