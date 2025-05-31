import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Only redirect to login if we're not in the auth initialization phase
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            // Token expired or unauthorized
            this.removeAuthToken();
            
            // Add a small delay to allow any ongoing auth initialization to complete
            setTimeout(() => {
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }, 100);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response: AxiosResponse<PaginatedResponse<T>> = await this.api.get(url, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.patch(url, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      return {
        code: `HTTP_${status}`,
        message: data.message || data.error || 'An error occurred',
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        details: error.request,
      };
    } else {
      // Something else happened
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error,
      };
    }
  }

  // Set authentication token
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  removeAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService(); 