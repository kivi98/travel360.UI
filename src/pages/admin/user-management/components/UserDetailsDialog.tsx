import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { User, Mail, Phone, Calendar, Shield, UserCheck, UserX } from 'lucide-react';
import type { User as UserType } from '@/types';

interface UserDetailsDialogProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'destructive';
      case 'OPERATOR':
        return 'default';
      case 'CUSTOMER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (isActive?: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  const getUserInitials = (user: UserType) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {user.role}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(user.isActive)}>
                      {user.isActive ? (
                        <>
                          <UserCheck className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <p className="mt-1 font-mono text-sm">{user.id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </label>
                  <p className="mt-1">
                    {user.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created Date
                  </label>
                  <p className="mt-1">{formatDate(user.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="mt-1">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Role
                  </label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Permissions
                  </label>
                  <div className="mt-2 space-y-1">
                    {user.role === 'ADMINISTRATOR' && (
                      <ul className="text-sm space-y-1">
                        <li>• Full system access</li>
                        <li>• User management</li>
                        <li>• Flight and booking management</li>
                        <li>• Reports and analytics</li>
                        <li>• System configuration</li>
                      </ul>
                    )}
                    {user.role === 'OPERATOR' && (
                      <ul className="text-sm space-y-1">
                        <li>• Flight management</li>
                        <li>• Booking management</li>
                        <li>• Customer support</li>
                        <li>• Basic reports</li>
                      </ul>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <ul className="text-sm space-y-1">
                        <li>• Search and book flights</li>
                        <li>• Manage personal bookings</li>
                        <li>• View booking history</li>
                        <li>• Update profile information</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 