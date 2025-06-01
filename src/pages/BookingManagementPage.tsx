import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { flightService } from '@/services/flightService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreateBookingDialog } from '@/components/bookings/CreateBookingDialog';
import type { 
  Booking, 
  BookingStatus, 
  Flight, 
  SeatClass,
  PaginatedResponse
} from '@/types';
import { BookingStatus as BookingStatusEnum, UserRole, SeatClass as SeatClassEnum } from '@/types';
import { 
  Ticket, 
  Plus,
  Search, 
  Filter,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  Mail
} from 'lucide-react';

export const BookingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const pageSize = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flightFilter, setFlightFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });
  const [seatClassFilter, setSeatClassFilter] = useState<string>('all');

  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCreateBookingDialogOpen, setIsCreateBookingDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadBookings();
    if (user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) {
      loadFlights();
    }
  }, [currentPage, user]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, flightFilter, dateRangeFilter, seatClassFilter]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response: PaginatedResponse<Booking>;
      
      if (user?.role === UserRole.CUSTOMER) {
        // Customers can only see their own bookings
        response = await bookingService.getMyBookings({
          page: currentPage,
          limit: pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
      } else {
        // Operators and Admins can see all bookings
        response = await bookingService.getAllBookings({
          page: currentPage,
          limit: pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          startDate: dateRangeFilter.start || undefined,
          endDate: dateRangeFilter.end || undefined
        });
      }
      
      if (response.success) {
        setBookings(response.data || []);
        setTotalPages(response.pagination?.page ? Math.ceil(response.pagination.total / response.pagination.size) : 1);
        setTotalBookings(response.pagination?.total || 0);
      } else {
        setError('Failed to load bookings');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFlights = async () => {
    try {
      const response = await flightService.getAllFlights();
      if (response.success) {
        setFlights(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load flights:', error);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter as BookingStatus);
    }

    // Flight filter
    if (flightFilter !== 'all') {
      filtered = filtered.filter(booking => booking.flight.id === flightFilter);
    }

    // Seat class filter
    if (seatClassFilter !== 'all') {
      filtered = filtered.filter(booking => booking.seatClass === seatClassFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await bookingService.cancelBooking(selectedBooking.id, cancelReason);
      if (response.success) {
        await loadBookings();
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

  const handleConfirmBooking = async (booking: Booking) => {
    try {
      const response = await bookingService.confirmBooking(booking.id);
      if (response.success) {
        await loadBookings();
      } else {
        setError(response.message || 'Failed to confirm booking');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to confirm booking');
    }
  };

  const handleSendReminder = async (booking: Booking) => {
    try {
      const response = await bookingService.sendReminderEmail(booking.id);
      if (response.success) {
        // Show success message
      } else {
        setError(response.message || 'Failed to send reminder');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send reminder');
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

  const getTotalRevenue = () => {
    return filteredBookings.reduce((sum, booking) => 
      booking.status === BookingStatusEnum.CONFIRMED || booking.status === BookingStatusEnum.COMPLETED 
        ? sum + booking.price 
        : sum, 0
    );
  };

  const getBookingStats = () => {
    const confirmed = filteredBookings.filter(b => b.status === BookingStatusEnum.CONFIRMED).length;
    const cancelled = filteredBookings.filter(b => b.status === BookingStatusEnum.CANCELLED).length;
    const completed = filteredBookings.filter(b => b.status === BookingStatusEnum.COMPLETED).length;
    
    return { confirmed, cancelled, completed };
  };

  const stats = getBookingStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {user?.role === UserRole.CUSTOMER ? 'My Bookings' : 'Booking Management'}
              </h1>
              <p className="text-muted-foreground">
                {user?.role === UserRole.CUSTOMER 
                  ? 'View and manage your flight bookings'
                  : 'Manage all customer bookings and reservations'
                }
              </p>
            </div>
          </div>
          
          {(user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsCreateBookingDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Booking
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Ticket className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{filteredBookings.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(getTotalRevenue())}</p>
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

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={BookingStatusEnum.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={BookingStatusEnum.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={BookingStatusEnum.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Seat Class</Label>
              <Select value={seatClassFilter} onValueChange={setSeatClassFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value={SeatClassEnum.ECONOMY}>Economy</SelectItem>
                  <SelectItem value={SeatClassEnum.BUSINESS}>Business</SelectItem>
                  <SelectItem value={SeatClassEnum.FIRST}>First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) && (
              <div>
                <Label className="mb-2">Flight</Label>
                <Select value={flightFilter} onValueChange={setFlightFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flights</SelectItem>
                    {flights.map((flight) => (
                      <SelectItem key={flight.id} value={flight.id}>
                        {flight.flightNumber} - {flight.origin.code} → {flight.destination.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === UserRole.CUSTOMER ? 'Your Bookings' : 'All Bookings'}
          </CardTitle>
          <CardDescription>
            {filteredBookings.length} of {totalBookings} bookings shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-muted-foreground">Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">
                {bookings.length === 0 ? 'No bookings have been made yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  {(user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) && (
                    <TableHead>Customer</TableHead>
                  )}
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{booking.bookingReference}</Badge>
                    </TableCell>
                    {(user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) && (
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {booking.customer.firstName} {booking.customer.lastName}
                          </div>
                          <div className="text-muted-foreground">{booking.customer.email}</div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{booking.flight.flightNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {booking.flight.origin.code} → {booking.flight.destination.code}
                        </div>
                        <div className="text-muted-foreground">
                          {booking.flight.origin.city} → {booking.flight.destination.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(booking.flight.departureTime).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(booking.flight.departureTime).toLocaleTimeString()} - {new Date(booking.flight.arrivalTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{booking.seatNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      {getSeatClassBadge(booking.seatClass)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(booking.price)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {(user?.role === UserRole.OPERATOR || user?.role === UserRole.ADMINISTRATOR) && booking.status === BookingStatusEnum.CONFIRMED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(booking)}
                            title="Send reminder email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {booking.status === BookingStatusEnum.CONFIRMED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCancelDialog(booking)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
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
                    <CardTitle className="text-lg">Passenger Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}</div>
                    <div><strong>Email:</strong> {selectedBooking.customer.email}</div>
                    <div><strong>Phone:</strong> {selectedBooking.customer.phoneNumber || 'Not provided'}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flight Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Flight Number:</strong> {selectedBooking.flight.flightNumber}</div>
                  <div><strong>Route:</strong> {selectedBooking.flight.origin.name} ({selectedBooking.flight.origin.code}) → {selectedBooking.flight.destination.name} ({selectedBooking.flight.destination.code})</div>
                  <div><strong>Departure:</strong> {new Date(selectedBooking.flight.departureTime).toLocaleString()}</div>
                  <div><strong>Arrival:</strong> {new Date(selectedBooking.flight.arrivalTime).toLocaleString()}</div>
                  <div><strong>Seat:</strong> {selectedBooking.seatNumber} ({getSeatClassBadge(selectedBooking.seatClass)})</div>
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
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm"><strong>Reference:</strong> {selectedBooking.bookingReference}</p>
                <p className="text-sm"><strong>Flight:</strong> {selectedBooking.flight.flightNumber}</p>
                <p className="text-sm"><strong>Passenger:</strong> {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}</p>
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

      {/* Create Booking Dialog */}
      <CreateBookingDialog
        isOpen={isCreateBookingDialogOpen}
        onClose={() => setIsCreateBookingDialogOpen(false)}
        onBookingCreated={loadBookings}
      />
    </div>
  );
};
