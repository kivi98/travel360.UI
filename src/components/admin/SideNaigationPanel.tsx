import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Icons
import {
  LayoutDashboard,
  Plane,
  Calendar,
  Users,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  User,
  CreditCard,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Building,
  Globe,
  Ticket,
  TrendingUp,
  UserCheck,
  Database,
} from 'lucide-react';

interface SideNavigationPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationItem[];
  roles: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
  },
  {
    title: 'Flight Management',
    href: '/manage/flights',
    icon: Plane,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
    children: [
      {
        title: 'All Flights',
        href: '/manage/flights',
        icon: Plane,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Add Flight',
        href: '/manage/flights/add',
        icon: Plane,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Flight Schedules',
        href: '/manage/flights/schedules',
        icon: Calendar,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
    ],
  },
  {
    title: 'Booking Management',
    href: '/manage/bookings',
    icon: Ticket,
    badge: 'New',
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
    children: [
      {
        title: 'All Bookings',
        href: '/manage/bookings',
        icon: Ticket,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Pending Bookings',
        href: '/manage/bookings/pending',
        icon: Calendar,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Cancelled Bookings',
        href: '/manage/bookings/cancelled',
        icon: Calendar,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
    ],
  },
  {
    title: 'User Management',
    href: '/manage/users',
    icon: Users,
    roles: [UserRole.ADMINISTRATOR],
    children: [
      {
        title: 'All Users',
        href: '/manage/users',
        icon: Users,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Customers',
        href: '/manage/users/customers',
        icon: User,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Operators',
        href: '/manage/users/operators',
        icon: UserCheck,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Administrators',
        href: '/manage/users/admins',
        icon: Shield,
        roles: [UserRole.ADMINISTRATOR],
      },
    ],
  },
  {
    title: 'Airport Management',
    href: '/manage/airports',
    icon: MapPin,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
    children: [
      {
        title: 'All Airports',
        href: '/manage/airports',
        icon: MapPin,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Add Airport',
        href: '/manage/airports/add',
        icon: Building,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Airport Routes',
        href: '/manage/airports/routes',
        icon: Globe,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
    ],
  },
  {
    title: 'Airplane Management',
    href: '/manage/airplanes',
    icon: Plane,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
    children: [
      {
        title: 'All Airplanes',
        href: '/manage/airplanes',
        icon: Plane,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Add Airplane',
        href: '/manage/airplanes/add',
        icon: Plane,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Maintenance',
        href: '/manage/airplanes/maintenance',
        icon: Settings,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
    ],
  },
  {
    title: 'Analytics & Reports',
    href: '/reports',
    icon: BarChart3,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
    children: [
      {
        title: 'Sales Reports',
        href: '/reports/sales',
        icon: TrendingUp,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'Flight Analytics',
        href: '/reports/flights',
        icon: BarChart3,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
      {
        title: 'User Analytics',
        href: '/reports/users',
        icon: Users,
        roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
      },
    ],
  },
  {
    title: 'Financial Management',
    href: '/finance',
    icon: CreditCard,
    roles: [UserRole.ADMINISTRATOR],
    children: [
      {
        title: 'Transactions',
        href: '/finance/transactions',
        icon: CreditCard,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Revenue Reports',
        href: '/finance/revenue',
        icon: TrendingUp,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Payment Methods',
        href: '/finance/payments',
        icon: CreditCard,
        roles: [UserRole.ADMINISTRATOR],
      },
    ],
  },
  {
    title: 'System Management',
    href: '/system',
    icon: Database,
    roles: [UserRole.ADMINISTRATOR],
    children: [
      {
        title: 'System Settings',
        href: '/system/settings',
        icon: Settings,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Notifications',
        href: '/system/notifications',
        icon: Bell,
        roles: [UserRole.ADMINISTRATOR],
      },
      {
        title: 'Audit Logs',
        href: '/system/logs',
        icon: FileText,
        roles: [UserRole.ADMINISTRATOR],
      },
    ],
  },
];

const bottomNavigationItems: NavigationItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
  },
  {
    title: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    roles: [UserRole.ADMINISTRATOR, UserRole.OPERATOR],
  },
];

export const SideNavigationPanel: React.FC<SideNavigationPanelProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredNavigation = navigationItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const filteredBottomNavigation = bottomNavigationItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isItemActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isParentActive = (item: NavigationItem) => {
    if (isItemActive(item.href)) return true;
    return item.children?.some(child => isItemActive(child.href)) || false;
  };

  const getUserInitials = () => {
    if (!user) return 'A';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username[0].toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const isActive = isParentActive(item);
    const Icon = item.icon;

    if (hasChildren && !isChild) {
      return (
        <div key={item.href} className="space-y-1">
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-10",
              isCollapsed ? "px-2" : "px-3",
              isActive && "bg-secondary text-secondary-foreground"
            )}
            onClick={() => toggleExpanded(item.href)}
          >
            <Icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2" />
                )}
              </>
            )}
          </Button>
          {isExpanded && !isCollapsed && (
            <div className="space-y-1 ml-4">
              {item.children?.map(child => renderNavigationItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    const content = (
      <Button
        variant={isItemActive(item.href) ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-10",
          isCollapsed ? "px-2" : "px-3",
          isChild && !isCollapsed && "ml-2",
          isItemActive(item.href) && "bg-secondary text-secondary-foreground"
        )}
        asChild
      >
        <Link to={item.href}>
          <Icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </Button>
    );

    return <div key={item.href}>{content}</div>;
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center p-4 border-b",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
        )}
        {isCollapsed && <Plane className="h-6 w-6 text-primary" />}
      </div>

      {/* User Info */}
      <div className={cn(
        "p-4 border-b",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center",
          isCollapsed ? "flex-col space-y-2" : "space-x-3"
        )}>
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {filteredNavigation.map(item => renderNavigationItem(item))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t">
        <nav className="space-y-1">
          {filteredBottomNavigation.map(item => renderNavigationItem(item))}
          <div className="my-2 border-t border-border"></div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50",
              isCollapsed ? "px-2" : "px-3"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </nav>
      </div>
    </div>
  );
};
