import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { flightService } from '@/services/flightService';
import { FlightSearchForm } from '@/components/flights/FlightSearchForm';
import { FlightSearchResults } from '@/components/flights/FlightSearchResults';
import { FlightFilters } from '@/components/flights/FlightFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { 
  FlightSearchCriteria, 
  FlightSearchResult, 
  Flight, 
  Airport,
  SeatClass
} from '@/types';
import { SeatClass as SeatClassEnum } from '@/types';
import { Plane, Search, Filter, MapPin } from 'lucide-react';

export const FlightSearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchCriteria, setSearchCriteria] = useState<FlightSearchCriteria>({
    origin: '',
    destination: '',
    departureDate: '',
    seatClass: undefined,
    passengers: 1,
    includeTransit: false
  });
  
  const [searchResults, setSearchResults] = useState<FlightSearchResult | null>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAirports, setIsLoadingAirports] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    maxPrice: 0,
    seatClass: undefined as SeatClass | undefined,
    departureTimeRange: { start: '', end: '' },
    airlines: [] as string[],
    maxStops: 2,
    sortBy: 'price' as 'price' | 'duration' | 'departure'
  });

  // Load airports on component mount
  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      setIsLoadingAirports(true);
      const response = await flightService.getAllAirports();
      if (response.success) {
        setAirports(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    } finally {
      setIsLoadingAirports(false);
    }
  };

  const handleSearch = async (criteria: FlightSearchCriteria) => {
    try {
      setIsLoading(true);
      setError(null);
      setSearchCriteria(criteria);

      const response = await flightService.searchFlights(criteria);
      if (response.success) {
        setSearchResults(response.data || null);
        setHasSearched(true);
      } else {
        setError(response.message || 'Failed to search flights');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while searching flights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const getFilteredResults = () => {
    if (!searchResults) return null;

    let directFlights = [...searchResults.directFlights];
    let transitFlights = [...searchResults.transitFlights];

    // Apply price filter
    if (filters.maxPrice > 0) {
      directFlights = directFlights.filter(flight => {
        const price = filters.seatClass === SeatClassEnum.FIRST ? flight.firstClassPrice :
                     filters.seatClass === SeatClassEnum.BUSINESS ? flight.businessClassPrice :
                     flight.economyClassPrice;
        return price <= filters.maxPrice;
      });

      transitFlights = transitFlights.filter(option => option.totalPrice <= filters.maxPrice);
    }

    // Apply seat class filter
    if (filters.seatClass) {
      directFlights = directFlights.filter(flight => {
        const availableSeats = filters.seatClass === SeatClassEnum.FIRST ? flight.availableFirstClassSeats :
                              filters.seatClass === SeatClassEnum.BUSINESS ? flight.availableBusinessClassSeats :
                              flight.availableEconomyClassSeats;
        return availableSeats > 0;
      });
    }

    // Apply departure time filter
    if (filters.departureTimeRange.start && filters.departureTimeRange.end) {
      const startTime = new Date(`2000-01-01T${filters.departureTimeRange.start}`).getTime();
      const endTime = new Date(`2000-01-01T${filters.departureTimeRange.end}`).getTime();

      directFlights = directFlights.filter(flight => {
        const flightTime = new Date(`2000-01-01T${new Date(flight.departureTime).toTimeString().slice(0, 5)}`).getTime();
        return flightTime >= startTime && flightTime <= endTime;
      });
    }

    // Sort results
    const sortFunctions = {
      price: (a: Flight, b: Flight) => {
        const priceA = filters.seatClass === SeatClassEnum.FIRST ? a.firstClassPrice :
                      filters.seatClass === SeatClassEnum.BUSINESS ? a.businessClassPrice :
                      a.economyClassPrice;
        const priceB = filters.seatClass === SeatClassEnum.FIRST ? b.firstClassPrice :
                      filters.seatClass === SeatClassEnum.BUSINESS ? b.businessClassPrice :
                      b.economyClassPrice;
        return priceA - priceB;
      },
      departure: (a: Flight, b: Flight) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
      duration: (a: Flight, b: Flight) => {
        const durationA = new Date(a.arrivalTime).getTime() - new Date(a.departureTime).getTime();
        const durationB = new Date(b.arrivalTime).getTime() - new Date(b.departureTime).getTime();
        return durationA - durationB;
      }
    };

    directFlights.sort(sortFunctions[filters.sortBy]);

    return {
      directFlights,
      transitFlights: transitFlights.filter(option => option.flights.length - 1 <= filters.maxStops)
    };
  };

  const filteredResults = getFilteredResults();
  const totalResults = filteredResults ? 
    filteredResults.directFlights.length + filteredResults.transitFlights.length : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plane className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flight Search</h1>
            <p className="text-muted-foreground">Find and book your perfect flight</p>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Welcome back, {user.firstName}</Badge>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        )}
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Flights
          </CardTitle>
          <CardDescription>
            Enter your travel details to find available flights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlightSearchForm
            onSearch={handleSearch}
            airports={airports || []}
            isLoadingAirports={isLoadingAirports || false}
            initialCriteria={searchCriteria || {
              origin: '',
              destination: '',
              departureDate: '',
              seatClass: undefined,
              passengers: 1,
              includeTransit: false
            }}
            isLoading={isLoading || false}
          />
        </CardContent>
      </Card>

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
            <span className="ml-3 text-muted-foreground">Searching for flights...</span>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FlightFilters
                  filters={filters}
                  onFiltersChange={handleFilterChange}
                  searchResults={searchResults}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {searchResults && (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {searchCriteria.origin} → {searchCriteria.destination}
                      </h2>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {new Date(searchCriteria.departureDate).toLocaleDateString()} • {totalResults} flights found
                      </p>
                    </div>
                    <Badge variant="outline">
                      {searchCriteria.passengers || 1} passenger{(searchCriteria.passengers || 1) > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                {/* Flight Results Tabs */}
                <Tabs defaultValue="direct" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="direct" className="flex items-center gap-2">
                      Direct Flights
                      <Badge variant="secondary">{filteredResults?.directFlights.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="transit" className="flex items-center gap-2">
                      With Connections
                      <Badge variant="secondary">{filteredResults?.transitFlights.length || 0}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="direct">
                    <FlightSearchResults
                      flights={filteredResults?.directFlights || []}
                      searchCriteria={searchCriteria}
                      type="direct"
                      isLoading={isLoading}
                    />
                  </TabsContent>

                  <TabsContent value="transit">
                    <FlightSearchResults
                      transitFlights={filteredResults?.transitFlights || []}
                      searchCriteria={searchCriteria}
                      type="transit"
                      isLoading={isLoading}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}

            {/* No Results */}
            {hasSearched && !isLoading && totalResults === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No flights found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Try adjusting your search criteria or filters to find more options.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>• Try different dates</p>
                    <p>• Check nearby airports</p>
                    <p>• Consider connecting flights</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Welcome Message for New Users */}
      {!hasSearched && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plane className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to take off?</h3>
            <p className="text-muted-foreground text-center">
              Search for flights using the form above to get started with your travel plans.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 