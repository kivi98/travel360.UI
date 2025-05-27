import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Menu,
  X,
  Plane,
  Search,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  User,
  MapPin,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: 'Search Flights',
    href: '/search',
    icon: Search,
    roles: [UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMINISTRATOR],
  },
  {
    title: 'My Bookings',
    href: '/my-bookings',
    icon: Calendar,
    roles: [UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: [UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Manage Flights',
    href: '/manage/flights',
    icon: Plane,
    roles: [UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Manage Bookings',
    href: '/manage/bookings',
    icon: Calendar,
    roles: [UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Manage Airports',
    href: '/manage/airports',
    icon: MapPin,
    roles: [UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Manage Users',
    href: '/manage/users',
    icon: Users,
    roles: [UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    roles: [UserRole.OPERATOR, UserRole.ADMINISTRATOR],
    requireAuth: true,
  },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const filteredNavigation = navigationItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (user) {
      return item.roles.includes(user.role);
    }
    return !item.requireAuth;
  });

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    if (!user) return 'G';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-none flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Travel360</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 py-3 text-sm font-medium transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-5 w-5 text-primary" />
                <span className="font-bold">Travel360</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for airline ticket booking worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Flight Search</li>
                <li>Ticket Booking</li>
                <li>Travel Management</li>
                <li>Customer Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: support@travel360.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>24/7 Customer Support</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Travel360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 