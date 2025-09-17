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
  isInCall?: boolean;
}

const CallNotification: React.FC<CallNotificationProps> = ({ onJoinCall, isInCall = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);

  // Critical: Check if component is even mounting
  console.log('🚀 CallNotification component mounting/rendering');
  console.log('🚀 Current user:', user?.email);
  console.log('🚀 IsInCall prop:', isInCall);

  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, component will not set up notifications');
      return;
    }

    console.log('🔔 Setting up call notifications for user:', user.email);
    console.log('🔔 User ID for filtering:', user.id);
    console.log('🔔 Is this Bineet?', user.email === 'bineetgdsc@gmail.com');
    console.log('🔔 Expected Bineet ID:', 'a10571ca-baca-41c9-aa08-e955342ae915');

    // Check if we're actually the Bineet user
    if (user.email === 'bineetgdsc@gmail.com') {
      console.log('🎯 THIS IS BINEET! Setting up notifications...');
    } else {
      console.log('👤 This is not Bineet, this is:', user.email);
    }

    // Test Supabase connection
    console.log('🔧 Testing Supabase connection...');
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase auth error:', error);
      } else {
        console.log('✅ Supabase session valid:', !!data.session);
      }
    });

    // Test database access
    supabase
      .from('video_calls')
      .select('count', { count: 'exact' })
      .then(({ count, error }) => {
        if (error) {
          console.error('❌ Database access error:', error);
        } else {
          console.log('✅ Database accessible, video_calls count:', count);
        }
      });

    // Create a unique channel name to avoid conflicts
    const channelName = `video_calls_${user.id}_${Date.now()}`;
    console.log('📡 Creating channel:', channelName);

    let isSubscribed = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const createSubscription = () => {
      console.log('🔄 Creating new subscription...');
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'video_calls',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📞 New call received:', payload.new);
            console.log('📞 Current user ID:', user.id);
            console.log('📞 Call receiver ID:', payload.new?.receiver_id);
            console.log('📞 IDs match?', user.id === payload.new?.receiver_id);
            
            const call = payload.new as CallData;
            
            if (call.status === 'ringing') {
              console.log('📞 Showing call popup for:', call.caller_email);
              
              // Don't show popup if already in a call
              if (!isInCall) {
                setIncomingCall(call);
                
                toast({
                  title: "Incoming Video Call",
                  description: `${call.caller_name || call.caller_email} is calling`,
                  duration: 8000,
                });
              } else {
                console.log('📞 User already in call, not showing popup');
              }
            }
          }
        )
        .subscribe((status, err) => {
          console.log('🔗 Main subscription status:', status);
          
          if (err) {
            console.error('❌ Subscription error:', err);
            
            // Try to reconnect on error
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
              setTimeout(() => {
                channel.unsubscribe();
                createSubscription();
              }, 2000 * reconnectAttempts);
            }
          }
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to video calls');
            isSubscribed = true;
            reconnectAttempts = 0;
          } else if (status === 'CLOSED') {
            console.log('❌ Subscription closed');
            isSubscribed = false;
            
            // Auto-reconnect if not intentionally closed
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              console.log(`🔄 Auto-reconnecting... attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
              setTimeout(() => {
                createSubscription();
              }, 1000 * reconnectAttempts);
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel error - recreating subscription');
            if (reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              setTimeout(() => {
                channel.unsubscribe();
                createSubscription();
              }, 3000);
            }
          }
        });

      return channel;
    };

    // Create initial subscription
    const subscription = createSubscription();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up call notifications');
      if (subscription) {
        subscription.unsubscribe();
      }
      isSubscribed = false;
    };
  }, [user, isInCall]); // Added isInCall to dependencies

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

  if (!incomingCall || isInCall) return null;

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