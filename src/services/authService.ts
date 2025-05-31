import { apiService } from './api';
import type { User, LoginCredentials, CreateUserForm, ApiResponse } from '@/types';

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  success: boolean;
  message: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);
      console.log("response", response);
      
      if (response.success && response.data) {
        // Store auth data
        apiService.setAuthToken(response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      apiService.removeAuthToken();
    }
  }

  async register(userData: CreateUserForm): Promise<ApiResponse<User>> {
    return apiService.post<User>('/auth/register', userData);
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return apiService.post<LoginResponse>('/auth/refresh');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/auth/reset-password', { token, newPassword });
  }

  // Get stored user data from localStorage
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return null;
      
      const parsedUser = JSON.parse(userData);
      
      // Validate that the parsed data has the required User fields
      if (parsedUser && typeof parsedUser === 'object' && 
          parsedUser.id && parsedUser.username && parsedUser.email) {
        return parsedUser;
      }
      
      console.warn('Invalid user data found in localStorage, clearing...');
      localStorage.removeItem('user_data');
      return null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user_data'); // Clear corrupted data
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = apiService.getAuthToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(requiredRole: string): boolean {
    const user = this.getStoredUser();
    return user?.role === requiredRole;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authService = new AuthService(); 