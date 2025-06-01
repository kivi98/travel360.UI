import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Layout Components
import { AppLayout } from './AppLayout';
import { AuthLayout } from './AuthLayout';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { FlightSearchPage } from '@/pages/FlightSearchPage';
import { BookingPage } from '@/pages/BookingPage';
import { MyBookingsPage } from '@/pages/MyBookingsPage';
import { BookingDetailsPage } from '@/pages/BookingDetailsPage';

// Admin/Operator Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { FlightManagementPage } from '@/pages/FlightManagementPage';
import { BookingManagementPage } from '@/pages/BookingManagementPage';
import { UserManagementPage } from '@/pages/admin/user-management';
import { ReportsPage } from '@/pages/ReportsPage';
import { AirportManagementPage } from '@/pages/AirportManagementPage';
import { AirplaneManagementPage } from '@/pages/admin/airplain-management/AirplaneManagementPage.tsx';

// Utility Components
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  fallback = <Navigate to="/login" replace /> 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute fallback={<Navigate to="/search" replace />}>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Flight Search - Available to all users */}
        <Route
          path="/search"
          element={
            <AppLayout>
              <FlightSearchPage />
            </AppLayout>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/book/:flightId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BookingPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyBookingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BookingDetailsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Operator and Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/flights"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <FlightManagementPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/bookings"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <BookingManagementPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/airports"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <AirportManagementPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/airplanes"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <AirplaneManagementPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={[UserRole.OPERATOR, UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <ReportsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/manage/users"
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMINISTRATOR]}>
              <AppLayout>
                <UserManagementPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route
          path="/unauthorized"
          element={
            <AppLayout>
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-destructive mb-4">Unauthorized</h1>
                  <p className="text-muted-foreground">You don't have permission to access this page.</p>
                </div>
              </div>
            </AppLayout>
          }
        />
        <Route
          path="/404"
          element={
            <AppLayout>
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                  <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                </div>
              </div>
            </AppLayout>
          }
        />

        {/* Catch all - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}; 