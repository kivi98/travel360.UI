import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { flightService } from '@/services/flightService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Flight, SeatClass, CreateBookingForm } from '@/types';
import { SeatClass as SeatClassEnum, UserRole } from '@/types';
import { Plane, User, CreditCard, MapPin } from 'lucide-react';

const createBookingSchema = z.object({
  flightId: z.string().min(1, 'Please select a flight'),
  seatClass: z.enum([SeatClassEnum.ECONOMY, SeatClassEnum.BUSINESS, SeatClassEnum.FIRST]),
  customerId: z.string().optional(),
  seatNumber: z.string().optional()
});

type CreateBookingFormData = z.infer<typeof createBookingSchema>;

interface CreateBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
  preSelectedFlightId?: string;
}

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
  preSelectedFlightId
}) => {
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingPreview, setBookingPreview] = useState<{
    price: number;
    warnings?: string[];
  } | null>(null);

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      flightId: preSelectedFlightId || '',
      seatClass: SeatClassEnum.ECONOMY,
      customerId: user?.role === UserRole.CUSTOMER ? user.id.toString() : '',
      seatNumber: ''
    }
  });

  const watchedFlightId = form.watch('flightId');
  const watchedSeatClass = form.watch('seatClass');

  useEffect(() => {
    if (isOpen) {
      loadFlights();
      if (preSelectedFlightId) {
        form.setValue('flightId', preSelectedFlightId);
      }
    }
  }, [isOpen, preSelectedFlightId]);

  useEffect(() => {
    if (watchedFlightId) {
      const flight = flights.find(f => f.id === watchedFlightId);
      setSelectedFlight(flight || null);
      loadAvailableSeats(watchedFlightId, watchedSeatClass);
    }
  }, [watchedFlightId, watchedSeatClass, flights]);

  const loadFlights = async () => {
    try {
      setIsLoadingFlights(true);
      const response = await flightService.getAllFlights();
      if (response.success) {
        // Only show future flights that are scheduled
        const futureFlights = (response.data || []).filter(flight => {
          const departureTime = new Date(flight.departureTime);
          const now = new Date();
          return departureTime > now && flight.status === 'SCHEDULED';
        });
        setFlights(futureFlights);
      }
    } catch (error) {
      console.error('Failed to load flights:', error);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const loadAvailableSeats = async (flightId: string, seatClass: SeatClass) => {
    try {
      const response = await bookingService.getBookedSeats(flightId, seatClass);
      if (response.success) {
        setBookedSeats(response.data || []);
        // Generate available seats based on flight capacity
        const flight = flights.find(f => f.id === flightId);
        if (flight) {
          const capacity = seatClass === SeatClassEnum.FIRST ? flight.airplane.firstClassCapacity :
                          seatClass === SeatClassEnum.BUSINESS ? flight.airplane.businessClassCapacity :
                          flight.airplane.economyClassCapacity;
          
          const seatPrefix = seatClass === SeatClassEnum.FIRST ? 'F' :
                            seatClass === SeatClassEnum.BUSINESS ? 'B' : 'E';
          
          const allSeats = Array.from({ length: capacity }, (_, i) => `${seatPrefix}${i + 1}`);
          const available = allSeats.filter(seat => !(response.data || []).includes(seat));
          setAvailableSeats(available);
        }
      }
    } catch (error) {
      console.error('Failed to load available seats:', error);
    }
  };

  const handleSubmit = async (data: CreateBookingFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const bookingData: CreateBookingForm = {
        customerId: user?.role === UserRole.CUSTOMER ? user.id.toString() : data.customerId || '',
        flightId: data.flightId,
        seatClass: data.seatClass,
        seatNumber: data.seatNumber
      };

      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        onBookingCreated();
        onClose();
        form.reset();
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const validateBooking = async () => {
    const data = form.getValues();
    if (!data.flightId || !data.seatClass) return;

    try {
      const bookingData: CreateBookingForm = {
        customerId: user?.role === UserRole.CUSTOMER ? user.id.toString() : data.customerId || '',
        flightId: data.flightId,
        seatClass: data.seatClass,
        seatNumber: data.seatNumber
      };

      const response = await bookingService.validateBooking(bookingData);
      if (response.success) {
        setBookingPreview(response.data || null);
      }
    } catch (error) {
      console.error('Failed to validate booking:', error);
    }
  };

  useEffect(() => {
    if (watchedFlightId && watchedSeatClass) {
      validateBooking();
    }
  }, [watchedFlightId, watchedSeatClass]);

  const getPrice = () => {
    if (!selectedFlight || !watchedSeatClass) return 0;
    
    switch (watchedSeatClass) {
      case SeatClassEnum.FIRST:
        return selectedFlight.firstClassPrice;
      case SeatClassEnum.BUSINESS:
        return selectedFlight.businessClassPrice;
      default:
        return selectedFlight.economyClassPrice;
    }
  };

  const getAvailableSeatsCount = () => {
    if (!selectedFlight || !watchedSeatClass) return 0;
    
    switch (watchedSeatClass) {
      case SeatClassEnum.FIRST:
        return selectedFlight.availableFirstClassSeats;
      case SeatClassEnum.BUSINESS:
        return selectedFlight.availableBusinessClassSeats;
      default:
        return selectedFlight.availableEconomyClassSeats;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Create New Booking
          </DialogTitle>
          <DialogDescription>
            Book a flight for {user?.role === UserRole.CUSTOMER ? 'yourself' : 'a customer'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Flight Selection */}
          <div className="space-y-2">
            <Label htmlFor="flight">Select Flight</Label>
            {isLoadingFlights ? (
              <div className="flex items-center justify-center py-4">
                <LoadingSpinner />
                <span className="ml-2 text-sm text-muted-foreground">Loading flights...</span>
              </div>
            ) : (
              <Select 
                value={form.watch('flightId')} 
                onValueChange={(value) => form.setValue('flightId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a flight" />
                </SelectTrigger>
                <SelectContent>
                  {flights.map((flight) => (
                    <SelectItem key={flight.id} value={flight.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{flight.flightNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {flight.origin.code} → {flight.destination.code} • {new Date(flight.departureTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.flightId && (
              <p className="text-sm text-red-600">{form.formState.errors.flightId.message}</p>
            )}
          </div>

          {/* Flight Details Card */}
          {selectedFlight && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Flight Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Flight Number</p>
                    <p className="text-sm text-muted-foreground">{selectedFlight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aircraft</p>
                    <p className="text-sm text-muted-foreground">{selectedFlight.airplane.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Route</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedFlight.origin.city} ({selectedFlight.origin.code}) → {selectedFlight.destination.city} ({selectedFlight.destination.code})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Departure</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedFlight.departureTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seat Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="seatClass">Seat Class</Label>
            <Select 
              value={form.watch('seatClass')} 
              onValueChange={(value) => form.setValue('seatClass', value as SeatClass)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose seat class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SeatClassEnum.ECONOMY}>
                  <div className="flex items-center justify-between w-full">
                    <span>Economy</span>
                    {selectedFlight && (
                      <Badge variant="outline" className="ml-2">
                        {formatPrice(selectedFlight.economyClassPrice)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value={SeatClassEnum.BUSINESS}>
                  <div className="flex items-center justify-between w-full">
                    <span>Business</span>
                    {selectedFlight && (
                      <Badge variant="outline" className="ml-2">
                        {formatPrice(selectedFlight.businessClassPrice)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value={SeatClassEnum.FIRST}>
                  <div className="flex items-center justify-between w-full">
                    <span>First Class</span>
                    {selectedFlight && (
                      <Badge variant="outline" className="ml-2">
                        {formatPrice(selectedFlight.firstClassPrice)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.seatClass && (
              <p className="text-sm text-red-600">{form.formState.errors.seatClass.message}</p>
            )}
          </div>

          {/* Seat Selection */}
          {availableSeats.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="seatNumber">Seat Number (Optional)</Label>
              <Select 
                value={form.watch('seatNumber')} 
                onValueChange={(value) => form.setValue('seatNumber', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign seat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-assign seat</SelectItem>
                  {availableSeats.map((seat) => (
                    <SelectItem key={seat} value={seat}>
                      {seat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getAvailableSeatsCount()} seats available in {watchedSeatClass?.toLowerCase()} class
              </p>
            </div>
          )}

          {/* Price Summary */}
          {selectedFlight && watchedSeatClass && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Price:</span>
                  <Badge variant="default" className="text-lg">
                    {formatPrice(getPrice())}
                  </Badge>
                </div>
                {bookingPreview?.warnings && bookingPreview.warnings.length > 0 && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {bookingPreview.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedFlight || getAvailableSeatsCount() === 0}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Creating Booking...
                </>
              ) : (
                'Create Booking'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 