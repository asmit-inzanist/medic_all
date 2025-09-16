import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

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
      
      // Ensure Zego SDK is loaded (via CDN)
      if (!window.ZegoUIKitPrebuilt) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/ZegoUIKitPrebuilt.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Zego SDK'));
          document.head.appendChild(s);
        });
      }

      const ZegoUIKitPrebuilt = window.ZegoUIKitPrebuilt;

      // Generate Kit Token
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
          mode: ZegoUIKitPrebuilt.VideoConference,
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