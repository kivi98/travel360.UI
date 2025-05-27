import { apiService } from './api';
import type {
  Flight,
  FlightSearchCriteria,
  FlightSearchResult,
  CreateFlightForm,
  Airport,
  Airplane,
  ApiResponse,
  PaginatedResponse,
  AirportFlightReport,
} from '@/types';

class FlightService {
  // Flight Search
  async searchFlights(criteria: FlightSearchCriteria): Promise<ApiResponse<FlightSearchResult>> {
    return apiService.post<FlightSearchResult>('/flights/search', criteria);
  }

  async getDirectFlights(
    origin: string,
    destination: string,
    departureDate: string
  ): Promise<ApiResponse<Flight[]>> {
    return apiService.get<Flight[]>('/flights/direct', {
      origin,
      destination,
      departureDate,
    });
  }

  async getTransitFlights(
    origin: string,
    destination: string,
    departureDate: string
  ): Promise<ApiResponse<FlightSearchResult>> {
    return apiService.get<FlightSearchResult>('/flights/transit', {
      origin,
      destination,
      departureDate,
    });
  }

  // Flight Management
  async getAllFlights(params?: {
    page?: number;
    limit?: number;
    origin?: string;
    destination?: string;
    date?: string;
    status?: string;
  }): Promise<PaginatedResponse<Flight>> {
    return apiService.getPaginated<Flight>('/flights', params);
  }

  async getFlightById(id: string): Promise<ApiResponse<Flight>> {
    return apiService.get<Flight>(`/flights/${id}`);
  }

  async createFlight(flightData: CreateFlightForm): Promise<ApiResponse<Flight>> {
    return apiService.post<Flight>('/flights', flightData);
  }

  async updateFlight(id: string, flightData: Partial<CreateFlightForm>): Promise<ApiResponse<Flight>> {
    return apiService.put<Flight>(`/flights/${id}`, flightData);
  }

  async deleteFlight(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/flights/${id}`);
  }

  async updateFlightStatus(id: string, status: string): Promise<ApiResponse<Flight>> {
    return apiService.patch<Flight>(`/flights/${id}/status`, { status });
  }

  // Flight Availability
  async checkSeatAvailability(
    flightId: string,
    seatClass: string
  ): Promise<ApiResponse<{ available: number; total: number }>> {
    return apiService.get<{ available: number; total: number }>(
      `/flights/${flightId}/availability/${seatClass}`
    );
  }

  async getAvailableSeats(
    flightId: string,
    seatClass: string
  ): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/flights/${flightId}/seats/${seatClass}`);
  }

  // Airport Management
  async getAllAirports(): Promise<ApiResponse<Airport[]>> {
    return apiService.get<Airport[]>('/airports');
  }

  async getAirportById(id: string): Promise<ApiResponse<Airport>> {
    return apiService.get<Airport>(`/airports/${id}`);
  }

  async createAirport(airportData: Omit<Airport, 'id'>): Promise<ApiResponse<Airport>> {
    return apiService.post<Airport>('/airports', airportData);
  }

  async updateAirport(id: string, airportData: Partial<Airport>): Promise<ApiResponse<Airport>> {
    return apiService.put<Airport>(`/airports/${id}`, airportData);
  }

  async deleteAirport(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/airports/${id}`);
  }

  // Airplane Management
  async getAllAirplanes(): Promise<ApiResponse<Airplane[]>> {
    return apiService.get<Airplane[]>('/airplanes');
  }

  async getAirplaneById(id: string): Promise<ApiResponse<Airplane>> {
    return apiService.get<Airplane>(`/airplanes/${id}`);
  }

  async createAirplane(airplaneData: Omit<Airplane, 'id'>): Promise<ApiResponse<Airplane>> {
    return apiService.post<Airplane>('/airplanes', airplaneData);
  }

  async updateAirplane(id: string, airplaneData: Partial<Airplane>): Promise<ApiResponse<Airplane>> {
    return apiService.put<Airplane>(`/airplanes/${id}`, airplaneData);
  }

  async deleteAirplane(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/airplanes/${id}`);
  }

  async getAvailableAirplanes(departureTime: string, arrivalTime: string): Promise<ApiResponse<Airplane[]>> {
    return apiService.get<Airplane[]>('/airplanes/available', {
      departureTime,
      arrivalTime,
    });
  }

  // Reports
  async getAirportFlightReport(
    airportId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<AirportFlightReport>> {
    return apiService.get<AirportFlightReport>(`/reports/airport/${airportId}/flights`, {
      startDate,
      endDate,
    });
  }

  async getFlightStatistics(period?: string): Promise<ApiResponse<any>> {
    return apiService.get<any>('/reports/flight-statistics', { period });
  }

  // Utility methods
  async getPopularRoutes(): Promise<ApiResponse<Array<{ origin: Airport; destination: Airport; count: number }>>> {
    return apiService.get<Array<{ origin: Airport; destination: Airport; count: number }>>('/flights/popular-routes');
  }

  async getFlightsByAirplane(airplaneId: string): Promise<ApiResponse<Flight[]>> {
    return apiService.get<Flight[]>(`/flights/airplane/${airplaneId}`);
  }

  async validateFlightSchedule(flightData: CreateFlightForm): Promise<ApiResponse<{ valid: boolean; conflicts?: string[] }>> {
    return apiService.post<{ valid: boolean; conflicts?: string[] }>('/flights/validate-schedule', flightData);
  }
}

export const flightService = new FlightService(); 