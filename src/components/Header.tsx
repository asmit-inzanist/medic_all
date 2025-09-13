import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, MapPin, Menu, X, Phone } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from './UserDropdown';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useState('New York, NY');
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                M
              </div>
              <span className="text-xl font-bold text-foreground">Medic-AL</span>
            </Link>
          </div>


          {/* Location and Actions */}
          <div className="flex items-center space-x-3">
            {/* Location Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{location}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLocation('New York, NY')}>
                  New York, NY
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('Los Angeles, CA')}>
                  Los Angeles, CA
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('Chicago, IL')}>
                  Chicago, IL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('Houston, TX')}>
                  Houston, TX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Emergency Button */}
            <Button variant="destructive" size="sm" className="hidden sm:flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Emergency</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Auth Actions */}
            {loading ? (
              <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <UserDropdown />
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-2 pb-4">
              <div className="border-t pt-2 mt-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  {location}
                </Button>
                <Button variant="destructive" size="sm" className="w-full justify-start mt-2">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;