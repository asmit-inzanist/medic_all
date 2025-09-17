import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import CallNotification from "./components/CallNotification";
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

  const handleJoinCall = (roomId: string) => {
    // Navigate to video call - we could add a dedicated video call page later
    // For now, this will be handled by the Doctors page
    window.location.href = '/doctors';
  };

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
