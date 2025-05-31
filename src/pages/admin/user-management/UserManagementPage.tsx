import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Key } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { toast } from 'sonner';
import { userService, type UserListParams } from '@/services/userService.ts';
import type { User, UserRole } from '@/types';
import { UserForm } from './components/UserForm.tsx';
import { UserDetailsDialog } from './components/UserDetailsDialog.tsx';
import { DeleteUserDialog } from './components/DeleteUserDialog.tsx';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: UserListParams = {
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        active: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await userService.getAllUsers(params);
      
      if (response.success) {
        setUsers(response.data ?? []);
        setTotalPages(response.pagination?.page ?? 1);
        setTotalUsers(response.pagination?.total ?? 1);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await userService.createUser(userData);
      if (response.success) {
        toast.success('User created successfully');
        setIsCreateDialogOpen(false);
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      const response = await userService.updateUser(selectedUser.id, userData);
      if (response.success) {
        toast.success('User updated successfully');
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await userService.deleteUser(selectedUser.id);
      if (response.success) {
        toast.success('User deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const response = await userService.toggleUserStatus(user.id);
      if (response.success) {
        toast.success(`User ${user.active ? 'deactivated' : 'activated'} successfully`);
        loadUsers();
      } else {
        toast.error(response.message || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const response = await userService.resetUserPassword(user.id);
      if (response.success) {
        toast.success(`Password reset for ${user.username}. Temporary password: ${response.data.temporaryPassword}`);
      } else {
        toast.error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
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

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate role and permissions.
              </DialogDescription>
            </DialogHeader>
            <UserForm onSubmit={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({totalUsers})</CardTitle>
          <CardDescription>
            A list of all users in the system with their roles and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | 'ALL')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                <SelectItem value="OPERATOR">Operator</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.active)}>
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              {user.active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user)}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
        />
      )}

      {/* Delete User Dialog */}
      {selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
};

export default UserManagementPage; 