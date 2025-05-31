import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { flightService } from '@/services/flightService';
import { bookingService } from '@/services/bookingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Flight, FlightSearchCriteria, SeatClass } from '@/types';
import { SeatClass as SeatClassEnum } from '@/types';
import { 
  Plane, 
  CreditCard,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

export const BookingPage: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeatClass, setSelectedSeatClass] = useState<SeatClass>(SeatClassEnum.ECONOMY);

  // Get search criteria from navigation state
  const searchCriteria = location.state?.searchCriteria as FlightSearchCriteria | undefined;

  useEffect(() => {
    if (flightId) {
      loadFlightDetails();
    }
  }, [flightId]);

  const loadFlightDetails = async () => {
    if (!flightId) return;

    try {
      setIsLoading(true);
      const response = await flightService.getFlightById(flightId);
      if (response.success) {
        setFlight(response.data);
        // Set initial seat class from search criteria
        if (searchCriteria?.seatClass) {
          setSelectedSeatClass(searchCriteria.seatClass);
        }
      } else {
        setError(response.message || 'Failed to load flight details');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while loading flight details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = async () => {
    if (!flight || !user) return;

    try {
      setIsBooking(true);
      setError(null);

      const bookingData = {
        customerId: user.id.toString(),
        flightId: flight.id,
        seatClass: selectedSeatClass
      };

      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        // Redirect to booking confirmation or my bookings
        navigate('/my-bookings', {
          state: { 
            message: 'Flight booked successfully!',
            bookingId: response.data.id 
          }
        });
      } else {
        setError(response.message || 'Failed to book flight');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while booking the flight');
    } finally {
      setIsBooking(false);
    }
  };

  const getPrice = (seatClass: SeatClass) => {
    if (!flight) return 0;
    switch (seatClass) {
      case SeatClassEnum.FIRST:
        return flight.firstClassPrice;
      case SeatClassEnum.BUSINESS:
        return flight.businessClassPrice;
      case SeatClassEnum.ECONOMY:
      default:
        return flight.economyClassPrice;
    }
  };

  const getAvailableSeats = (seatClass: SeatClass) => {
    if (!flight) return 0;
    switch (seatClass) {
      case SeatClassEnum.FIRST:
        return flight.availableFirstClassSeats;
      case SeatClassEnum.BUSINESS:
        return flight.availableBusinessClassSeats;
      case SeatClassEnum.ECONOMY:
      default:
        return flight.availableEconomyClassSeats;
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (departureTime: string, arrivalTime: string) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-muted-foreground">Loading flight details...</span>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Flight not found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The flight you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/search')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passengers = searchCriteria?.passengers || 1;
  const totalPrice = getPrice(selectedSeatClass) * passengers;
  const availableSeats = getAvailableSeats(selectedSeatClass);
  const isAvailable = availableSeats >= passengers;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book Your Flight</h1>
            <p className="text-muted-foreground">Complete your booking for {flight.flightNumber}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Flight Number and Aircraft */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{flight.flightNumber}</h3>
                    <p className="text-muted-foreground">
                      {flight.airplane.model} • {flight.airplane.registration}
                    </p>
                  </div>
                  <Badge variant="outline">{flight.status}</Badge>
                </div>

                {/* Route */}
                <div className="flex items-center gap-4 py-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(flight.departureTime)}</p>
                    <p className="text-lg font-semibold">{flight.origin.code}</p>
                    <p className="text-sm text-muted-foreground">{flight.origin.name}</p>
                    <p className="text-sm text-muted-foreground">{flight.origin.city}</p>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-px bg-border flex-1"></div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {formatDuration(flight.departureTime, flight.arrivalTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">Direct</p>
                    </div>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</p>
                    <p className="text-lg font-semibold">{flight.destination.code}</p>
                    <p className="text-sm text-muted-foreground">{flight.destination.name}</p>
                    <p className="text-sm text-muted-foreground">{flight.destination.city}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="text-center py-2 bg-muted rounded-lg">
                  <p className="font-medium">{formatDate(flight.departureTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Class Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Seat Class</CardTitle>
              <CardDescription>
                Choose your preferred seat class for {passengers} passenger{passengers > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[SeatClassEnum.ECONOMY, SeatClassEnum.BUSINESS, SeatClassEnum.FIRST].map((seatClass) => {
                  const price = getPrice(seatClass);
                  const available = getAvailableSeats(seatClass);
                  const isClassAvailable = available >= passengers;

                  return (
                    <div
                      key={seatClass}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSeatClass === seatClass
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      } ${!isClassAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => isClassAvailable && setSelectedSeatClass(seatClass)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold capitalize">{seatClass.toLowerCase()}</h4>
                          <p className="text-sm text-muted-foreground">
                            {available} seats available
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">per person</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Passenger Info */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">{passengers}</span>
              </div>

              {/* Seat Class */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium capitalize">{selectedSeatClass.toLowerCase()}</span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {passengers} × ${getPrice(selectedSeatClass).toLocaleString()}
                  </span>
                  <span className="font-medium">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Availability Warning */}
              {!isAvailable && (
                <Alert>
                  <AlertDescription>
                    Not enough seats available in {selectedSeatClass.toLowerCase()} class for {passengers} passengers.
                  </AlertDescription>
                </Alert>
              )}

              {/* Book Button */}
              <Button
                onClick={handleBookFlight}
                disabled={!isAvailable || isBooking}
                className="w-full"
                size="lg"
              >
                {isBooking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Book Flight
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By booking, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
