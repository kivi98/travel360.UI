import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { FlightSearchCriteria, Airport } from '@/types';
import { SeatClass as SeatClassEnum } from '@/types';
import { Search, MapPin, Calendar, Users, Plane, ArrowLeftRight } from 'lucide-react';

const searchSchema = z.object({
  originAirportId: z.number().min(1, 'Origin airport is required'),
  destinationAirportId: z.number().min(1, 'Destination airport is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  seatClass: z.nativeEnum(SeatClassEnum).optional(),
  passengers: z.number().min(1, 'At least 1 passenger required').max(9, 'Maximum 9 passengers'),
  includeTransit: z.boolean()
});

type SearchFormData = z.infer<typeof searchSchema>;

interface FlightSearchFormProps {
  onSearch: (criteria: FlightSearchCriteria) => void;
  airports: Airport[];
  isLoadingAirports: boolean;
  initialCriteria?: Partial<FlightSearchCriteria>;
  isLoading?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  airports,
  isLoadingAirports,
  initialCriteria,
  isLoading = false
}) => {
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [swapAnimation, setSwapAnimation] = useState(false);

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      originAirportId: initialCriteria?.originAirportId || 0,
      destinationAirportId: initialCriteria?.destinationAirportId || 0,
      departureDate: initialCriteria?.departureDate || '',
      seatClass: initialCriteria?.seatClass,
      passengers: initialCriteria?.passengers || 1,
      includeTransit: initialCriteria?.includeTransit || false
    }
  });

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  // Create combobox options for airports
  const airportOptions: ComboboxOption[] = useMemo(() => {
    return airports.map(airport => ({
      value: parseInt(airport.id),
      label: `${airport.code} - ${airport.name}`,
      searchTerms: [airport.code, airport.name, airport.city, airport.country]
    }));
  }, [airports]);

  // Filter options to prevent selecting same airport for origin and destination
  const originOptions = useMemo(() => {
    const destinationId = form.watch('destinationAirportId');
    return airportOptions.filter(option => option.value !== destinationId);
  }, [airportOptions, form.watch('destinationAirportId')]);

  const destinationOptions = useMemo(() => {
    const originId = form.watch('originAirportId');
    return airportOptions.filter(option => option.value !== originId);
  }, [airportOptions, form.watch('originAirportId')]);

  const handleSwapLocations = () => {
    const originId = form.getValues('originAirportId');
    const destinationId = form.getValues('destinationAirportId');
    
    setSwapAnimation(true);
    setTimeout(() => setSwapAnimation(false), 300);
    
    form.setValue('originAirportId', destinationId);
    form.setValue('destinationAirportId', originId);
  };

  const onSubmit = (data: SearchFormData) => {
    onSearch({
      ...data,
      seatClass: data.seatClass || undefined
    });
  };

  const handleClear = () => {
    form.reset({
      originAirportId: 0,
      destinationAirportId: 0,
      departureDate: '',
      seatClass: undefined,
      passengers: 1,
      includeTransit: false
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Trip Type Toggle */}
        <div className="flex items-center gap-4 mb-6">
          <Label className="text-sm font-medium">Trip Type:</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={!isRoundTrip ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRoundTrip(false)}
              className="px-4"
            >
              One Way
            </Button>
            <Button
              type="button"
              variant={isRoundTrip ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRoundTrip(true)}
              className="px-4"
              disabled
            >
              Round Trip
              <Badge variant="secondary" className="ml-2 text-xs">Coming Soon</Badge>
            </Button>
          </div>
        </div>

        {/* Main Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Origin */}
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="originAirportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    From
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={originOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select origin airport"
                      searchPlaceholder="Search airports..."
                      emptyMessage="No airports found"
                      disabled={isLoadingAirports}
                      loading={isLoadingAirports}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center align-middle">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapLocations}
              className={`h-8 w-8 mt-6.5 transition-transform duration-300 ${swapAnimation ? 'rotate-180' : ''}`}
              disabled={isLoadingAirports}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Destination */}
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name="destinationAirportId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    To
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={destinationOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select destination airport"
                      searchPlaceholder="Search airports..."
                      emptyMessage="No airports found"
                      disabled={isLoadingAirports}
                      loading={isLoadingAirports}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Departure Date */}
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Departure
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={today}
                      className="h-9 w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Passengers */}
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Passengers
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger className="h-12 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} passenger{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seat Class */}
          <FormField
            control={form.control}
            name="seatClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Class
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2 w-full">
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => field.onChange(value || undefined)}
                    >
                      <SelectTrigger className="h-12 w-full">
                        <SelectValue placeholder="Any class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SeatClassEnum.ECONOMY}>
                          <div className="flex flex-row gap-1">
                            <span>Economy</span>
                            <span>-</span>
                            <span className="text-xs text-muted-foreground mt-0.5">Best value</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={SeatClassEnum.BUSINESS}>
                          <div className="flex flex-row gap-1">
                            <span>Business</span>
                            <span>-</span>
                            <span className="text-xs text-muted-foreground mt-0.5">Extra comfort</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={SeatClassEnum.FIRST}>
                          <div className="flex flex-row gap-1">
                            <span>First Class</span>
                            <span>-</span>
                            <span className="text-xs text-muted-foreground">Premium experience</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Include Transit */}
          <FormField
            control={form.control}
            name="includeTransit"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel className="text-sm font-medium mb-2">Options</FormLabel>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTransit"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <Label 
                    htmlFor="includeTransit" 
                    className="text-sm font-normal cursor-pointer"
                  >
                    Include connecting flights
                  </Label>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-center pt-4 gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-8 h-12 cursor-pointer"
            disabled={isLoading || isLoadingAirports}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="submit"
            size="lg"
            className="px-8 h-12 cursor-pointer"
            disabled={isLoading || isLoadingAirports}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search Flights
              </>
            )}
          </Button>
        </div>

        {/* Popular Routes */}
        <div className="mt-6 pt-6 border-t">
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            Popular Routes
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              { fromCode: 'JFK', toCode: 'LAX', route: 'New York → Los Angeles' },
              { fromCode: 'LHR', toCode: 'CDG', route: 'London → Paris' },
              { fromCode: 'DXB', toCode: 'LHR', route: 'Dubai → London' },
              { fromCode: 'SIN', toCode: 'NRT', route: 'Singapore → Tokyo' }
            ].map((route) => {
              const fromAirport = airports.find(a => a.code === route.fromCode);
              const toAirport = airports.find(a => a.code === route.toCode);
              
              return (
                <Button
                  key={`${route.fromCode}-${route.toCode}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (fromAirport && toAirport) {
                      form.setValue('originAirportId', parseInt(fromAirport.id));
                      form.setValue('destinationAirportId', parseInt(toAirport.id));
                    }
                  }}
                  disabled={!fromAirport || !toAirport}
                >
                  {route.route}
                </Button>
              );
            })}
          </div>
        </div>
      </form>
    </Form>
  );
};