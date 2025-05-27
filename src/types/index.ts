// User Management Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  OPERATOR = 'OPERATOR',
  ADMINISTRATOR = 'ADMINISTRATOR'
}

// Airport Types
export interface Airport {
  id: string;
  code: string; // IATA code (e.g., 'JFK', 'LAX')
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

// Airplane Types
export interface Airplane {
  id: string;
  model: string;
  capacity: AirplaneCapacity;
  registration: string;
  firstClassSeats: number;
  businessClassSeats: number;
  economyClassSeats: number;
  totalSeats: number;
  isActive: boolean;
}

export enum AirplaneCapacity {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

// Flight Types
export interface Flight {
  id: string;
  flightNumber: string;
  airplane: Airplane;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  firstClassPrice: number;
  businessClassPrice: number;
  economyClassPrice: number;
  availableFirstClassSeats: number;
  availableBusinessClassSeats: number;
  availableEconomyClassSeats: number;
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  IN_FLIGHT = 'IN_FLIGHT',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED'
}

export enum SeatClass {
  FIRST = 'FIRST',
  BUSINESS = 'BUSINESS',
  ECONOMY = 'ECONOMY'
}

// Booking Types
export interface Booking {
  id: string;
  bookingReference: string;
  customer: User;
  flight: Flight;
  seatClass: SeatClass;
  seatNumber: string;
  price: number;
  bookingDate: string;
  status: BookingStatus;
  createdBy: User; // Could be customer, operator, or admin
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// Search and Filter Types
export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  seatClass?: SeatClass;
  passengers?: number;
  includeTransit?: boolean;
}

export interface FlightSearchResult {
  directFlights: Flight[];
  transitFlights: TransitFlightOption[];
}

export interface TransitFlightOption {
  id: string;
  totalDuration: number;
  totalPrice: number;
  flights: Flight[];
  transitAirports: Airport[];
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Report Types
export interface PassengerManifest {
  flight: Flight;
  passengers: BookingWithPassenger[];
  generatedAt: string;
}

export interface BookingWithPassenger extends Booking {
  passengerName: string;
  passengerEmail: string;
}

export interface AirportFlightReport {
  airport: Airport;
  date: string;
  arrivingFlights: Flight[];
  departingFlights: Flight[];
  generatedAt: string;
}

// Form Types
export interface CreateUserForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  // role: UserRole;
}

export interface CreateFlightForm {
  flightNumber: string;
  airplaneId: string;
  originId: string;
  destinationId: string;
  departureTime: string;
  arrivalTime: string;
  firstClassPrice: number;
  businessClassPrice: number;
  economyClassPrice: number;
}

export interface CreateBookingForm {
  customerId: string;
  flightId: string;
  seatClass: SeatClass;
  seatNumber?: string;
}

// Navigation Types
export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
} 