import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import CallNotification from "./components/CallNotification";
import VideoCall from "./components/VideoCall";
import AuthRecovery from "./components/AuthRecovery";
import Home from "./pages/Home";
import Medicine from "./pages/Medicine";
import Hospitals from "./pages/Hospitals";
import Doctors from "./pages/Doctors";
import AIAssistant from "./pages/AIAssistant";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const [inVideoCall, setInVideoCall] = useState(false);
  const [currentCall, setCurrentCall] = useState<{roomId: string, doctorName: string} | null>(null);

  const handleJoinCall = (roomId: string) => {
    console.log('🎬 Joining video call with room ID:', roomId);
    
    // Set the call state to show the video call interface
    setCurrentCall({ roomId, doctorName: 'Video Consultation' });
    setInVideoCall(true);
  };

  const handleLeaveCall = () => {
    console.log('🚪 Leaving video call');
    setInVideoCall(false);
    setCurrentCall(null);
  };

  // If user is in a video call, show the video call interface
  if (inVideoCall && currentCall) {
    return (
      <div className="min-h-screen bg-background">
        <VideoCall roomID={currentCall.roomId} onLeaveCall={handleLeaveCall} />
        {user && <CallNotification onJoinCall={handleJoinCall} isInCall={true} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/medicine" 
          element={
            <ProtectedRoute serviceName="Medicine Marketplace">
              <Medicine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hospitals" 
          element={
            <ProtectedRoute serviceName="Hospital Booking">
              <Hospitals />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <ProtectedRoute serviceName="Doctor Consultation">
              <Doctors />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-assistant" 
          element={
            <ProtectedRoute serviceName="AI Health Assistant">
              <AIAssistant />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute serviceName="Profile">
              <Profile />
            </ProtectedRoute>
          } 
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global CallNotification - active for all authenticated users */}
      {user && <CallNotification onJoinCall={handleJoinCall} isInCall={false} />}
      
      {/* Auth Recovery for session issues */}
      <AuthRecovery />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
