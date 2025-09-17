import React, { useRef, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

interface VideoCallProps {
  roomID: string;
  isDoctor?: boolean;
  onLeaveCall?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomID, isDoctor = false, onLeaveCall }) => {
  const { user } = useAuth();
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
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomID, user, onLeaveCall]);

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
    <div className="w-full h-screen bg-background">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ height: '100vh' }}
      />
    </div>
  );
};

export default VideoCall;