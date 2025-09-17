import { User, Settings, LogOut, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      console.log('🚪 Attempting to sign out...');
      
      // Add loading state to prevent multiple clicks
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        
        // Handle specific error types
        if (error.message.includes('network') || error.message.includes('fetch')) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Please check your internet connection and try again.",
          });
        } else if (error.message.includes('session')) {
          toast({
            variant: "destructive", 
            title: "Session Error",
            description: "Your session has expired. Refreshing the page...",
          });
          // Force refresh to clear any corrupted state
          setTimeout(() => window.location.reload(), 2000);
        } else {
          toast({
            variant: "destructive",
            title: "Sign out failed",
            description: error.message || "An unexpected error occurred",
          });
        }
        
        // If sign out fails, try to clear local storage as fallback
        console.log('🧹 Clearing local storage as fallback...');
        localStorage.removeItem('supabase.auth.token');
        localStorage.clear();
        
        // Force navigation to home and refresh
        navigate('/');
        window.location.reload();
        
      } else {
        console.log('✅ Sign out successful');
        toast({
          title: "Signed out",
          description: "You've been signed out successfully.",
        });
        navigate('/');
      }
    } catch (unexpectedError) {
      console.error('💥 Unexpected sign out error:', unexpectedError);
      
      // Force sign out by clearing everything
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed out",
        description: "Session cleared successfully.",
      });
      
      navigate('/');
      window.location.reload();
    }
  };

  if (!user) return null;

  const initials = user.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Heart className="mr-2 h-4 w-4" />
          <span>Medical Records</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>My Bookings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;