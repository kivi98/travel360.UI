import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { User } from '@/types';

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onConfirm,
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

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <Avatar>
              <AvatarFallback className="bg-red-100 text-red-700">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-red-900 dark:text-red-100">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                @{user.username} • {user.email}
              </div>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Warning:</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li>• User account will be permanently deleted</li>
                  <li>• All user data will be removed from the system</li>
                  {user.role === 'CUSTOMER' && (
                    <li>• Associated booking history will be affected</li>
                  )}
                  {user.role === 'OPERATOR' && (
                    <li>• Flight management records will be affected</li>
                  )}
                  {user.role === 'ADMINISTRATOR' && (
                    <li>• System administration records will be affected</li>
                  )}
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 