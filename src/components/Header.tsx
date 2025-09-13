import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Bell, MapPin, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from './UserDropdown';
import LanguageSelector from './LanguageSelector';
import useLocation from '@/hooks/useLocation';
import { toast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    location, 
    isLoading, 
    error, 
    getCurrentLocation 
  } = useLocation();

  // Load saved location from localStorage on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        // Location is already loaded from localStorage in the hook
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
  }, []);

  const handleGetCurrentLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: t('location.locationUpdated'),
        description: t('location.locationDetected'),
      });
    } catch (error) {
      let errorMessage = t('location.unknownError');
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('location.permissionDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('location.positionUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('location.timeout');
            break;
        }
      }
      
      toast({
        title: t('location.locationError'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">{t('common.brand')}</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('navigation.home')}
            </Link>
            <Link to="/doctors" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('navigation.doctors')}
            </Link>
            <Link to="/hospitals" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('navigation.hospitals')}
            </Link>
            <Link to="/medicine" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('navigation.medicine')}
            </Link>
            <Link to="/ai-assistant" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('navigation.aiAssistant')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Location Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-3 text-gray-600 hover:text-gray-900">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="max-w-[120px] truncate">
                  {isLoading ? t('common.loading') : (location?.city || 'Select Location')}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleGetCurrentLocation} disabled={isLoading}>
                <MapPin className="mr-2 h-4 w-4" />
                {t('location.useCurrentLocation')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Emergency Button */}
          <Button 
            variant="destructive" 
            size="sm"
            className="hidden sm:flex"
            onClick={() => {
              // TODO: Add emergency functionality
              toast({
                title: t('common.emergency'),
                description: "Emergency services would be contacted",
              });
            }}
          >
            {t('common.emergency')}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          {user ? (
            <UserDropdown />
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('common.signIn')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;