import { apiService } from './api';
import type {
  Booking,
  CreateBookingForm,
  PassengerManifest,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

class BookingService {
  // Booking Management
  async createBooking(bookingData: CreateBookingForm): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>('/bookings', bookingData);
  }

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    return apiService.get<Booking>(`/bookings/${id}`);
  }

  async getBookingByReference(reference: string): Promise<ApiResponse<Booking>> {
    return apiService.get<Booking>(`/bookings/reference/${reference}`);
  }

  async getAllBookings(params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    flightId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Booking>> {
    return apiService.getPaginated<Booking>('/bookings', params);
  }

  async getUserBookings(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<PaginatedResponse<Booking>> {
    return apiService.getPaginated<Booking>(`/bookings/user/${userId}`, params);
  }

  async getMyBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> {
    return apiService.getPaginated<Booking>('/bookings/me', params);
  }

  async updateBooking(id: string, bookingData: Partial<CreateBookingForm>): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`/bookings/${id}`, bookingData);
  }

  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    return apiService.patch<Booking>(`/bookings/${id}/cancel`, { reason });
  }

  async confirmBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiService.patch<Booking>(`/bookings/${id}/confirm`);
  }

  // Seat Selection
  async selectSeat(bookingId: string, seatNumber: string): Promise<ApiResponse<Booking>> {
    return apiService.patch<Booking>(`/bookings/${bookingId}/seat`, { seatNumber });
  }

  async getBookedSeats(flightId: string, seatClass: string): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/bookings/flight/${flightId}/booked-seats/${seatClass}`);
  }

  // Passenger Manifest
  async getPassengerManifest(flightId: string): Promise<ApiResponse<PassengerManifest>> {
    return apiService.get<PassengerManifest>(`/bookings/flight/${flightId}/manifest`);
  }

  async downloadPassengerManifest(flightId: string): Promise<Blob> {
    // This would return a PDF blob
    const response = await fetch(`${apiService['api'].defaults.baseURL}/bookings/flight/${flightId}/manifest/pdf`, {
      headers: {
        'Authorization': `Bearer ${apiService.getAuthToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download passenger manifest');
    }
    
    return response.blob();
  }

  // Booking Reports
  async getBookingStatistics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    return apiService.get<any>('/bookings/statistics', params);
  }

  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    airlineId?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.get<any>('/bookings/revenue', params);
  }

  async getPopularDestinations(params?: {
    limit?: number;
    period?: string;
  }): Promise<ApiResponse<Array<{ destination: string; count: number; revenue: number }>>> {
    return apiService.get<Array<{ destination: string; count: number; revenue: number }>>(
      '/bookings/popular-destinations',
      params
    );
  }

  // Booking Search and Filters
  async searchBookings(criteria: {
    customerName?: string;
    customerEmail?: string;
    flightNumber?: string;
    bookingReference?: string;
    origin?: string;
    destination?: string;
    travelDate?: string;
  }): Promise<ApiResponse<Booking[]>> {
    return apiService.post<Booking[]>('/bookings/search', criteria);
  }

  // Bulk Operations (for operators/admins)
  async bulkCancelBookings(bookingIds: string[], reason: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/bookings/bulk-cancel', { bookingIds, reason });
  }

  async bulkConfirmBookings(bookingIds: string[]): Promise<ApiResponse<void>> {
    return apiService.post<void>('/bookings/bulk-confirm', { bookingIds });
  }

  // Validation
  async validateBooking(bookingData: CreateBookingForm): Promise<ApiResponse<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    pricing?: {
      basePrice: number;
      taxes: number;
      totalPrice: number;
    };
  }>> {
    return apiService.post('/bookings/validate', bookingData);
  }

  // Check-in functionality
  async checkIn(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.patch<Booking>(`/bookings/${bookingId}/check-in`);
  }

  async getCheckedInPassengers(flightId: string): Promise<ApiResponse<Booking[]>> {
    return apiService.get<Booking[]>(`/bookings/flight/${flightId}/checked-in`);
  }

  // Notifications
  async sendBookingConfirmation(bookingId: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/bookings/${bookingId}/send-confirmation`);
  }

  async sendReminderEmail(bookingId: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`/bookings/${bookingId}/send-reminder`);
  }
}

export const bookingService = new BookingService(); 