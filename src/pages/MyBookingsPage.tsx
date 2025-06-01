import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { 
  Booking, 
  BookingStatus, 
  SeatClass,
  PaginatedResponse
} from '@/types';
import { BookingStatus as BookingStatusEnum, SeatClass as SeatClassEnum } from '@/types';
import { 
  Ticket, 
  Search, 
  Filter,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Plane,
  XCircle,
  CheckCircle,
  Download,
  Mail,
  ArrowRight,
  Users,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [seatClassFilter, setSeatClassFilter] = useState<string>('all');

  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadMyBookings();
  }, []);

  useEffect(() => {
    organizeBookings();
  }, [allBookings]);

  const loadMyBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bookingService.getMyBookings();
      if (response.success) {
        setAllBookings(response.data || []);
      } else {
        setError('Failed to load your bookings');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const organizeBookings = () => {
    const now = new Date();
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    allBookings.forEach(booking => {
      const flightDate = new Date(booking.flight.departureTime);
      if (flightDate > now && booking.status === BookingStatusEnum.CONFIRMED) {
        upcoming.push(booking);
      } else {
        past.push(booking);
      }
    });

    // Sort upcoming by departure date (earliest first)
    upcoming.sort((a, b) => new Date(a.flight.departureTime).getTime() - new Date(b.flight.departureTime).getTime());
    
    // Sort past by departure date (most recent first)
    past.sort((a, b) => new Date(b.flight.departureTime).getTime() - new Date(a.flight.departureTime).getTime());

    setUpcomingBookings(upcoming);
    setPastBookings(past);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await bookingService.cancelBooking(selectedBooking.id, cancelReason);
      if (response.success) {
        await loadMyBookings();
        setIsCancelDialogOpen(false);
        setSelectedBooking(null);
        setCancelReason('');
      } else {
        setError(response.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to cancel booking');
    }
  };

  const openDetailsDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      [BookingStatusEnum.CONFIRMED]: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      [BookingStatusEnum.CANCELLED]: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      [BookingStatusEnum.COMPLETED]: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-blue-600' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getSeatClassBadge = (seatClass: SeatClass) => {
    const classConfig = {
      [SeatClassEnum.ECONOMY]: { variant: 'outline' as const, color: 'text-blue-600' },
      [SeatClassEnum.BUSINESS]: { variant: 'secondary' as const, color: 'text-purple-600' },
      [SeatClassEnum.FIRST]: { variant: 'default' as const, color: 'text-yellow-600' }
    };

    const config = classConfig[seatClass];

    return (
      <Badge variant={config.variant} className={config.color}>
        {seatClass}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getFlightDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr.getTime() - dep.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTimeUntilFlight = (departureTime: string) => {
    const now = new Date();
    const flight = new Date(departureTime);
    const diff = flight.getTime() - now.getTime();
    
    if (diff < 0) return 'Departed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Departing soon';
  };

  const filterBookings = (bookings: Booking[]) => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.origin.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.destination.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.destination.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Seat class filter
    if (seatClassFilter !== 'all') {
      filtered = filtered.filter(booking => booking.seatClass === seatClassFilter);
    }

    return filtered;
  };

  const getBookingStats = () => {
    const totalBookings = allBookings.length;
    const upcomingCount = upcomingBookings.length;
    const totalSpent = allBookings
      .filter(b => b.status === BookingStatusEnum.CONFIRMED || b.status === BookingStatusEnum.COMPLETED)
      .reduce((sum, booking) => sum + booking.price, 0);
    const cancelledCount = allBookings.filter(b => b.status === BookingStatusEnum.CANCELLED).length;
    
    return { totalBookings, upcomingCount, totalSpent, cancelledCount };
  };

  const stats = getBookingStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">Manage your flight reservations and travel history</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Welcome back, {user.firstName}</Badge>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Ticket className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Trips</p>
              <p className="text-2xl font-bold">{stats.upcomingCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CreditCard className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelledCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-muted-foreground">Loading your bookings...</span>
          </CardContent>
        </Card>
      )}

      {/* Bookings Tabs */}
      {!isLoading && (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming
                <Badge variant="secondary">{upcomingBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History
                <Badge variant="secondary">{pastBookings.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={BookingStatusEnum.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={BookingStatusEnum.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={BookingStatusEnum.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="upcoming">
            {filterBookings(upcomingBookings).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming trips</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any confirmed upcoming flights.
                  </p>
                  <Button>Book a Flight</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filterBookings(upcomingBookings).map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-sm">
                            {booking.bookingReference}
                          </Badge>
                          {getStatusBadge(booking.status)}
                          <div className="text-sm text-green-600 font-medium">
                            {getTimeUntilFlight(booking.flight.departureTime)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(booking)}
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          {booking.status === BookingStatusEnum.CONFIRMED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openCancelDialog(booking)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Flight Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{booking.flight.origin.code}</p>
                              <p className="text-sm text-muted-foreground">{booking.flight.origin.city}</p>
                              <p className="text-sm font-medium">
                                {new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center">
                              <div className="text-center">
                                <Plane className="h-5 w-5 mx-auto mb-1 text-primary" />
                                <p className="text-xs text-muted-foreground">
                                  {getFlightDuration(booking.flight.departureTime, booking.flight.arrivalTime)}
                                </p>
                                <p className="text-xs font-medium">{booking.flight.flightNumber}</p>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-2xl font-bold">{booking.flight.destination.code}</p>
                              <p className="text-sm text-muted-foreground">{booking.flight.destination.city}</p>
                              <p className="text-sm font-medium">
                                {new Date(booking.flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.flight.departureTime).toLocaleDateString(undefined, { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div>
                          <h4 className="font-medium mb-2">Booking Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Seat:</span>
                              <Badge variant="secondary">{booking.seatNumber}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Class:</span>
                              {getSeatClassBadge(booking.seatClass)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-medium">{formatPrice(booking.price)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          <h4 className="font-medium mb-2">Quick Actions</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Download Ticket
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <Mail className="h-4 w-4 mr-2" />
                              Email Confirmation
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {filterBookings(pastBookings).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No travel history</h3>
                  <p className="text-muted-foreground text-center">
                    Your completed and past flights will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterBookings(pastBookings).map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{booking.bookingReference}</Badge>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(booking)}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Flight</h4>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">{booking.flight.flightNumber}</p>
                            <p className="text-muted-foreground">
                              {booking.flight.origin.code} → {booking.flight.destination.code}
                            </p>
                            <p className="text-muted-foreground">
                              {new Date(booking.flight.departureTime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Details</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex gap-2">
                              <span>Seat:</span>
                              <Badge variant="secondary" className="text-xs">{booking.seatNumber}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <span>Class:</span>
                              {getSeatClassBadge(booking.seatClass)}
                            </div>
                            <p>Price: {formatPrice(booking.price)}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your flight booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Reference:</strong> {selectedBooking.bookingReference}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</div>
                    <div><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</div>
                    <div><strong>Price:</strong> {formatPrice(selectedBooking.price)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seat Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Seat Number:</strong> {selectedBooking.seatNumber}</div>
                    <div><strong>Class:</strong> {getSeatClassBadge(selectedBooking.seatClass)}</div>
                    <div><strong>Aircraft:</strong> {selectedBooking.flight.airplane.model}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flight Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div><strong>Flight Number:</strong> {selectedBooking.flight.flightNumber}</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Departure</p>
                      <p>{selectedBooking.flight.origin.name} ({selectedBooking.flight.origin.code})</p>
                      <p className="text-sm text-muted-foreground">{selectedBooking.flight.origin.city}, {selectedBooking.flight.origin.country}</p>
                      <p className="font-medium mt-1">{new Date(selectedBooking.flight.departureTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Arrival</p>
                      <p>{selectedBooking.flight.destination.name} ({selectedBooking.flight.destination.code})</p>
                      <p className="text-sm text-muted-foreground">{selectedBooking.flight.destination.city}, {selectedBooking.flight.destination.country}</p>
                      <p className="font-medium mt-1">{new Date(selectedBooking.flight.arrivalTime).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <strong>Duration:</strong> {getFlightDuration(selectedBooking.flight.departureTime, selectedBooking.flight.arrivalTime)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cancellation policies may apply. You may be eligible for a refund depending on how far in advance you cancel.
                </AlertDescription>
              </Alert>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm"><strong>Reference:</strong> {selectedBooking.bookingReference}</p>
                <p className="text-sm"><strong>Flight:</strong> {selectedBooking.flight.flightNumber}</p>
                <p className="text-sm"><strong>Route:</strong> {selectedBooking.flight.origin.code} → {selectedBooking.flight.destination.code}</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(selectedBooking.flight.departureTime).toLocaleDateString()}</p>
                <p className="text-sm"><strong>Price:</strong> {formatPrice(selectedBooking.price)}</p>
              </div>
              
              <div>
                <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
                <Input
                  id="cancelReason"
                  placeholder="Enter cancellation reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
