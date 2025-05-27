# Admin User Management

This directory contains the user management functionality for administrators in the Travel360 application.

## Structure

```
admin/
├── UserManagementPage.tsx     # Main user management page
├── components/                # Reusable components
│   ├── UserForm.tsx          # Form for creating/editing users
│   ├── UserDetailsDialog.tsx # Modal for viewing user details
│   ├── DeleteUserDialog.tsx  # Confirmation dialog for user deletion
│   └── index.ts             # Component exports
├── index.ts                  # Page exports
└── README.md                # This file
```

## Features

### User Management Page (`UserManagementPage.tsx`)
- **User Listing**: Paginated table view of all users
- **Search & Filter**: Search by name/username/email, filter by role and status
- **User Actions**: Create, edit, view details, activate/deactivate, reset password, delete
- **Role-based Display**: Different badge colors for different user roles
- **Responsive Design**: Works on desktop and mobile devices

### User Form (`UserForm.tsx`)
- **Create Mode**: Full form with all required fields including password
- **Edit Mode**: Pre-populated form with optional password change
- **Validation**: Client-side validation for all fields
- **Role Selection**: Dropdown for selecting user roles
- **Password Visibility**: Toggle for password fields
- **Error Handling**: Field-level error display

### User Details Dialog (`UserDetailsDialog.tsx`)
- **Profile Information**: User avatar, name, username, role, status
- **Contact Information**: Email and phone number
- **Account Information**: User ID, creation date, last updated
- **Role Permissions**: List of permissions based on user role
- **Formatted Display**: Clean, organized layout with icons

### Delete User Dialog (`DeleteUserDialog.tsx`)
- **Confirmation Dialog**: Prevents accidental deletions
- **User Preview**: Shows user information being deleted
- **Warning Messages**: Role-specific warnings about data impact
- **Destructive Action**: Clear visual indication of permanent action

## User Roles

### Administrator
- Full system access
- User management
- Flight and booking management
- Reports and analytics
- System configuration

### Operator
- Flight management
- Booking management
- Customer support
- Basic reports

### Customer
- Search and book flights
- Manage personal bookings
- View booking history
- Update profile information

## API Integration

The user management uses the `userService` which provides:
- `getAllUsers()` - Paginated user listing with filters
- `getUserById()` - Get specific user details
- `createUser()` - Create new user account
- `updateUser()` - Update existing user
- `deleteUser()` - Delete user account
- `toggleUserStatus()` - Activate/deactivate user
- `resetUserPassword()` - Generate temporary password
- `getUsersByRole()` - Get users by specific role
- `searchUsers()` - Search users by query

## Backend Model Mapping

The frontend User interface maps to the backend User entity:

```java
@Entity
@Table(name = "users")
public class User extends BaseEntity {
    private Long id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String phoneNumber;
}
```

## Usage

### Import the page:
```typescript
import { UserManagementPage } from '@/pages/admin';
```

### Import individual components:
```typescript
import { UserForm, UserDetailsDialog, DeleteUserDialog } from '@/pages/admin/components';
```

### Route configuration:
```typescript
{
  path: '/admin/users',
  element: <UserManagementPage />,
  // Ensure only administrators can access
}
```

## Security Considerations

- Only administrators should have access to user management
- Password reset generates temporary passwords that should be changed
- User deletion is permanent and affects related data
- Role changes should be logged for audit purposes
- Sensitive operations should require additional confirmation

## Future Enhancements

- Bulk user operations (import/export)
- Advanced filtering and sorting options
- User activity logs and audit trail
- Email notifications for account changes
- Two-factor authentication management
- User profile picture upload
- Advanced permission management 