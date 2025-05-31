import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { FlightSearchResult, SeatClass } from '@/types';
import { SeatClass as SeatClassEnum } from '@/types';
import { DollarSign, Clock, Plane, ArrowUpDown, RotateCcw } from 'lucide-react';

interface FlightFiltersProps {
  filters: {
    maxPrice: number;
    seatClass: SeatClass | undefined;
    departureTimeRange: { start: string; end: string };
    airlines: string[];
    maxStops: number;
    sortBy: 'price' | 'duration' | 'departure';
  };
  onFiltersChange: (filters: FlightFiltersProps['filters']) => void;
  searchResults: FlightSearchResult | null;
}

export const FlightFilters: React.FC<FlightFiltersProps> = ({
  filters,
  onFiltersChange,
  searchResults
}) => {
  const updateFilter = (key: keyof FlightFiltersProps['filters'], value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      maxPrice: 0,
      seatClass: undefined,
      departureTimeRange: { start: '', end: '' },
      airlines: [],
      maxStops: 2,
      sortBy: 'price'
    });
  };

  // Get price range from search results
  const getPriceRange = () => {
    if (!searchResults) return { min: 0, max: 5000 };
    
    const allPrices: number[] = [];
    
    // Add direct flight prices
    searchResults.directFlights.forEach(flight => {
      allPrices.push(flight.economyClassPrice);
      allPrices.push(flight.businessClassPrice);
      allPrices.push(flight.firstClassPrice);
    });
    
    // Add transit flight prices
    searchResults.transitFlights.forEach(option => {
      allPrices.push(option.totalPrice);
    });
    
    if (allPrices.length === 0) return { min: 0, max: 5000 };
    
    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  };

  // Get unique airlines from search results
  const getAvailableAirlines = () => {
    if (!searchResults) return [];
    
    const airlines = new Set<string>();
    
    searchResults.directFlights.forEach(flight => {
      // Assuming airline info is in airplane model or we can extract from flight number
      const airline = flight.flightNumber.substring(0, 2); // First 2 chars usually airline code
      airlines.add(airline);
    });
    
    searchResults.transitFlights.forEach(option => {
      option.flights.forEach(flight => {
        const airline = flight.flightNumber.substring(0, 2);
        airlines.add(airline);
      });
    });
    
    return Array.from(airlines);
  };

  const priceRange = getPriceRange();
  const availableAirlines = getAvailableAirlines();
  const hasActiveFilters = filters.maxPrice > 0 || 
                          filters.seatClass || 
                          filters.departureTimeRange.start || 
                          filters.departureTimeRange.end ||
                          filters.airlines.length > 0 ||
                          filters.maxStops < 2;

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <ArrowUpDown className="h-4 w-4" />
          Sort by
        </Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value: 'price' | 'duration' | 'departure') => 
            updateFilter('sortBy', value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price (Low to High)</SelectItem>
            <SelectItem value="duration">Duration (Shortest)</SelectItem>
            <SelectItem value="departure">Departure Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="h-4 w-4" />
          Maximum Price
        </Label>
        <div className="space-y-2">
          <Input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={50}
            value={filters.maxPrice || priceRange.max}
            onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${priceRange.min.toLocaleString()}</span>
            <span>${(filters.maxPrice || priceRange.max).toLocaleString()}</span>
            <span>${priceRange.max.toLocaleString()}</span>
          </div>
          {filters.maxPrice > 0 && (
            <Badge variant="secondary" className="text-xs">
              Up to ${filters.maxPrice.toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Seat Class Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Plane className="h-4 w-4" />
          Seat Class
        </Label>
        <div className="flex gap-2">
          <Select
            value={filters.seatClass || ""}
            onValueChange={(value) => 
              updateFilter('seatClass', value || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SeatClassEnum.ECONOMY}>Economy</SelectItem>
              <SelectItem value={SeatClassEnum.BUSINESS}>Business</SelectItem>
              <SelectItem value={SeatClassEnum.FIRST}>First Class</SelectItem>
            </SelectContent>
          </Select>
          {filters.seatClass && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('seatClass', undefined)}
              className="px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Departure Time Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4" />
          Departure Time
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="time"
              value={filters.departureTimeRange.start}
              onChange={(e) => 
                updateFilter('departureTimeRange', {
                  ...filters.departureTimeRange,
                  start: e.target.value
                })
              }
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="time"
              value={filters.departureTimeRange.end}
              onChange={(e) => 
                updateFilter('departureTimeRange', {
                  ...filters.departureTimeRange,
                  end: e.target.value
                })
              }
            />
          </div>
        </div>
        {(filters.departureTimeRange.start || filters.departureTimeRange.end) && (
          <Badge variant="secondary" className="text-xs">
            {filters.departureTimeRange.start || '00:00'} - {filters.departureTimeRange.end || '23:59'}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Airlines Filter */}
      {availableAirlines.length > 0 && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Airlines</Label>
            <div className="space-y-2">
              {availableAirlines.map((airline) => (
                <div key={airline} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`airline-${airline}`}
                    checked={filters.airlines.includes(airline)}
                    onChange={(e) => {
                      const newAirlines = e.target.checked
                        ? [...filters.airlines, airline]
                        : filters.airlines.filter(a => a !== airline);
                      updateFilter('airlines', newAirlines);
                    }}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <Label 
                    htmlFor={`airline-${airline}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {airline}
                  </Label>
                </div>
              ))}
            </div>
            {filters.airlines.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.airlines.map((airline) => (
                  <Badge key={airline} variant="secondary" className="text-xs">
                    {airline}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Stops Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Maximum Stops</Label>
        <Select
          value={filters.maxStops.toString()}
          onValueChange={(value) => updateFilter('maxStops', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Direct flights only</SelectItem>
            <SelectItem value="1">Up to 1 stop</SelectItem>
            <SelectItem value="2">Up to 2 stops</SelectItem>
            <SelectItem value="3">Up to 3 stops</SelectItem>
          </SelectContent>
        </Select>
        {filters.maxStops < 2 && (
          <Badge variant="secondary" className="text-xs">
            {filters.maxStops === 0 ? 'Direct only' : `Max ${filters.maxStops} stop${filters.maxStops > 1 ? 's' : ''}`}
          </Badge>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Filters</Label>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => {
              updateFilter('sortBy', 'price');
              updateFilter('seatClass', SeatClassEnum.ECONOMY);
            }}
          >
            Cheapest Economy
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => {
              updateFilter('sortBy', 'duration');
              updateFilter('maxStops', 0);
            }}
          >
            Fastest Direct
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => {
              updateFilter('seatClass', SeatClassEnum.BUSINESS);
              updateFilter('sortBy', 'departure');
            }}
          >
            Business Class
          </Button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {filters.maxPrice > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Max ${filters.maxPrice.toLocaleString()}
                </Badge>
              )}
              {filters.seatClass && (
                <Badge variant="secondary" className="text-xs">
                  {filters.seatClass}
                </Badge>
              )}
              {filters.departureTimeRange.start && (
                <Badge variant="secondary" className="text-xs">
                  After {filters.departureTimeRange.start}
                </Badge>
              )}
              {filters.departureTimeRange.end && (
                <Badge variant="secondary" className="text-xs">
                  Before {filters.departureTimeRange.end}
                </Badge>
              )}
              {filters.maxStops < 2 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.maxStops === 0 ? 'Direct' : `≤${filters.maxStops} stops`}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 