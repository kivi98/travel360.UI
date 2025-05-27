import { apiService } from './api';
import type { User, UserRole, ApiResponse, PaginatedResponse } from '@/types';

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phoneNumber?: string;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface UserListParams extends UserFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class UserService {
  private readonly baseUrl = '/users';

  async getAllUsers(params: UserListParams = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = queryParams.toString() ? `${this.baseUrl}?${queryParams}` : this.baseUrl;
    return apiService.get<PaginatedResponse<User>>(url);
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return apiService.get<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiService.post<User>(this.baseUrl, userData);
  }

  async updateUser(id: number, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiService.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  async toggleUserStatus(id: number): Promise<ApiResponse<User>> {
    return apiService.patch<User>(`${this.baseUrl}/${id}/toggle-status`);
  }

  async resetUserPassword(id: number): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return apiService.post<{ temporaryPassword: string }>(`${this.baseUrl}/${id}/reset-password`);
  }

  async getUsersByRole(role: UserRole): Promise<ApiResponse<User[]>> {
    return apiService.get<User[]>(`${this.baseUrl}/by-role/${role}`);
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return apiService.get<User[]>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
  }
}

export const userService = new UserService(); 