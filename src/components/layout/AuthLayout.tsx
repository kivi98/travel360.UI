import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left Panel - Hero/Branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Plane className="mr-2 h-6 w-6" />
            Travel360
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Travel360 has revolutionized how we manage airline bookings. 
                The comprehensive system handles everything from flight searches 
                to passenger manifests with incredible efficiency."
              </p>
              <footer className="text-sm">Sofia Rodriguez, Travel Manager</footer>
            </blockquote>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="p-4 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {/* Mobile Logo */}
            <div className="flex flex-col space-y-2 text-center lg:hidden">
              <Link to="/" className="flex items-center justify-center space-x-2">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Travel360</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Your comprehensive airline booking system
              </p>
            </div>

            {/* Auth Form Content */}
            {children}

            {/* Footer */}
            <p className="px-8 text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link
                to="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 