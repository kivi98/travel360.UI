import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Flight, FlightSearchCriteria, TransitFlightOption, SeatClass } from '@/types';
import { SeatClass as SeatClassEnum, FlightStatus } from '@/types';
import { 
  Plane, 
  MapPin, 
  Wifi,
  Coffee,
  Utensils
} from 'lucide-react';

interface FlightSearchResultsProps {
  flights?: Flight[];
  transitFlights?: TransitFlightOption[];
  searchCriteria: FlightSearchCriteria;
  type: 'direct' | 'transit';
  isLoading?: boolean;
}

export const FlightSearchResults: React.FC<FlightSearchResultsProps> = ({
  flights = [],
  transitFlights = [],
  searchCriteria,
  type,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatDuration = (departureTime: string, arrivalTime: string) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getPrice = (flight: Flight, seatClass?: SeatClass) => {
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

  const getAvailableSeats = (flight: Flight, seatClass?: SeatClass) => {
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

  const getStatusColor = (status: FlightStatus) => {
    switch (status) {
      case FlightStatus.SCHEDULED:
        return 'bg-green-100 text-green-800';
      case FlightStatus.BOARDING:
        return 'bg-blue-100 text-blue-800';
      case FlightStatus.DEPARTED:
        return 'bg-purple-100 text-purple-800';
      case FlightStatus.DELAYED:
        return 'bg-yellow-100 text-yellow-800';
      case FlightStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookFlight = (flightId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${flightId}`, {
      state: { searchCriteria }
    });
  };

  const renderDirectFlightCard = (flight: Flight) => {
    const price = getPrice(flight, searchCriteria.seatClass);
    const availableSeats = getAvailableSeats(flight, searchCriteria.seatClass);
    const duration = formatDuration(flight.departureTime, flight.arrivalTime);
    const isAvailable = availableSeats >= (searchCriteria.passengers || 1);

    return (
      <Card key={flight.id} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Flight Info */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{flight.flightNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {flight.airplane.model} • {flight.airplane.registration}
                  </p>
                </div>
                <Badge className={getStatusColor(flight.status)}>
                  {flight.status}
                </Badge>
              </div>

              {/* Route */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatTime(flight.departureTime)}</p>
                  <p className="text-sm text-muted-foreground">{flight.origin.code}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(flight.departureTime)}</p>
                </div>
                
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-px bg-border flex-1"></div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{duration}</p>
                    <p className="text-xs text-muted-foreground">Direct</p>
                  </div>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</p>
                  <p className="text-sm text-muted-foreground">{flight.destination.code}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(flight.arrivalTime)}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  WiFi
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Coffee className="h-3 w-3 mr-1" />
                  Meals
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Utensils className="h-3 w-3 mr-1" />
                  Snacks
                </Badge>
              </div>
            </div>

            {/* Pricing & Booking */}
            <div className="lg:col-span-4">
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-3xl font-bold text-primary">
                    ${price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per person • {searchCriteria.seatClass || 'Economy'}
                  </p>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">
                    {availableSeats} seats available
                  </p>
                  {!isAvailable && (
                    <p className="text-sm text-red-600">
                      Not enough seats for {searchCriteria.passengers || 1} passengers
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleBookFlight(flight.id)}
                  disabled={!isAvailable || flight.status === FlightStatus.CANCELLED}
                  className="w-full"
                  size="lg"
                >
                  {!user ? 'Login to Book' : 'Select Flight'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTransitFlightCard = (option: TransitFlightOption) => {
    const totalDuration = Math.floor(option.totalDuration / (1000 * 60));
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const stops = option.flights.length - 1;

    return (
      <Card key={option.id} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Flight Info */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {option.flights.map(f => f.flightNumber).join(' → ')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stops} stop{stops > 1 ? 's' : ''} • {hours}h {minutes}m total
                  </p>
                </div>
              </div>

              {/* Route with stops */}
              <div className="space-y-3">
                {option.flights.map((flight, index) => (
                  <div key={flight.id} className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-semibold">{formatTime(flight.departureTime)}</p>
                      <p className="text-sm text-muted-foreground">{flight.origin.code}</p>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-px bg-border flex-1"></div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{flight.flightNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(flight.departureTime, flight.arrivalTime)}
                        </p>
                      </div>
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                    
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-semibold">{formatTime(flight.arrivalTime)}</p>
                      <p className="text-sm text-muted-foreground">{flight.destination.code}</p>
                    </div>

                    {index < option.flights.length - 1 && (
                      <div className="text-xs text-muted-foreground ml-4">
                        Layover in {flight.destination.city}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Transit Info */}
            <div className="lg:col-span-2">
              <div className="space-y-2">
                {option.transitAirports.map((airport) => (
                  <Badge key={airport.id} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {airport.code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pricing & Booking */}
            <div className="lg:col-span-3">
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-3xl font-bold text-primary">
                    ${option.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    per person • {searchCriteria.seatClass || 'Economy'}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    // For transit flights, we might need special handling
                    // For now, redirect to the first flight
                    handleBookFlight(option.flights[0].id);
                  }}
                  className="w-full"
                  size="lg"
                >
                  {!user ? 'Login to Book' : 'Select Flights'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-muted-foreground">Loading flights...</span>
      </div>
    );
  }

  const resultsToShow = type === 'direct' ? flights : transitFlights;

  if (resultsToShow.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plane className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No {type === 'direct' ? 'direct' : 'connecting'} flights found
          </h3>
          <p className="text-muted-foreground text-center">
            {type === 'direct' 
              ? 'Try searching for connecting flights or different dates.'
              : 'Try adjusting your search criteria or check direct flights.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {type === 'direct' 
        ? flights.map(renderDirectFlightCard)
        : transitFlights.map(renderTransitFlightCard)
      }
    </div>
  );
}; 