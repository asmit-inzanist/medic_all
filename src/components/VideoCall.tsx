import React, { useRef, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VideoCallProps {
  roomID: string;
  isDoctor?: boolean;
  onLeaveCall?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomID, isDoctor = false, onLeaveCall }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const zpRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeCall = async () => {
      if (!user || !containerRef.current) return;

      const appID = 235526139;
      const serverSecret = "fe2323eaf8771467e39ed8c14fb3e692";
      
      // Generate Kit Token using the imported package
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        user.id,
        user.email || 'User'
      );

      // Create instance object from Kit Token
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      // Start the call
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Copy link',
            url: `${window.location.origin}/video-call/${roomID}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // Changed to 1-on-1 call for doctor consultation
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: "Grid",
        showLayoutButton: false,
        onLeaveRoom: () => {
          console.log('User left the room');
          onLeaveCall?.();
        },
      });
    };

    initializeCall();

    return () => {
      console.log('🧹 Cleaning up VideoCall component');
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
          zpRef.current = null;
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
      
      // Clear container content
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [roomID, user, onLeaveCall]);

  const handleDisconnect = () => {
    console.log('🔌 Disconnecting from video call');
    
    // Clean up Zego instance first
    if (zpRef.current) {
      try {
        zpRef.current.destroy();
        zpRef.current = null;
      } catch (error) {
        console.error('Error destroying Zego instance:', error);
      }
    }
    
    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Call the parent's leave handler
    onLeaveCall?.();
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to join the video call</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-screen bg-background relative">
      {/* Custom Disconnect Button Overlay */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={handleDisconnect}
          variant="destructive"
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <PhoneOff className="mr-2 h-5 w-5" />
          {t('videoCall.leaveCall')}
        </Button>
      </div>
      
      {/* Video Call Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ height: '100vh' }}
      />
    </div>
  );
};

export default VideoCall;