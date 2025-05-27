import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Navigate } from 'react-router-dom';
import { SideNavigationPanel } from '@/components/admin/SideNaigationPanel';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check if user has admin/operator access
  if (!isAuthenticated || !user || ![UserRole.ADMINISTRATOR, UserRole.OPERATOR].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <SideNavigationPanel 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileSidebar} />
          <div className="relative w-64 bg-background">
            <SideNavigationPanel 
              isCollapsed={false}
              onToggleCollapse={toggleMobileSidebar}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>

            {/* Breadcrumb or Page Title can go here */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Admin Panel</span>
            </div>
          </div>

          {/* Right side - can add notifications, user menu, etc. */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Welcome, {user.firstName} {user.lastName}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}; 