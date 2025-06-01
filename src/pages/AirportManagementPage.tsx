import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { flightService } from '@/services/flightService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Airport, Flight } from '@/types';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  Globe,
  Clock,
  Activity,
  Building
} from 'lucide-react';

const airportSchema = z.object({
  code: z.string().min(3, 'Airport code must be at least 3 characters').max(4, 'Airport code must be at most 4 characters'),
  name: z.string().min(1, 'Airport name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  timeZone: z.string().min(1, 'Timezone is required'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude').optional(),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude').optional()
});

type AirportFormData = z.infer<typeof airportSchema>;

export const AirportManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [continentFilter, setContinentFilter] = useState<string>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [airportFlights, setAirportFlights] = useState<Flight[]>([]);

  const form = useForm<AirportFormData>({
    resolver: zodResolver(airportSchema),
    defaultValues: {
      code: '',
      name: '',
      city: '',
      country: '',
      timeZone: 'UTC',
      latitude: undefined,
      longitude: undefined
    }
  });

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    filterAirports();
  }, [airports, searchTerm, countryFilter, continentFilter]);

  const loadAirports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await flightService.getAllAirports();
      if (response.success) {
        setAirports(response.data || []);
      } else {
        setError(response.message || 'Failed to load airports');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load airports');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAirports = () => {
    let filtered = [...airports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(airport =>
        airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(airport => airport.country === countryFilter);
    }

    // Continent filter (simplified mapping)
    if (continentFilter !== 'all') {
      const continentCountries = getContinentCountries(continentFilter);
      filtered = filtered.filter(airport => continentCountries.includes(airport.country));
    }

    setFilteredAirports(filtered);
  };

  const getContinentCountries = (continent: string): string[] => {
    const continents: Record<string, string[]> = {
      'north-america': ['United States', 'Canada', 'Mexico'],
      'europe': ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Switzerland'],
      'asia': ['Japan', 'China', 'Singapore', 'Thailand', 'India', 'South Korea'],
      'oceania': ['Australia', 'New Zealand'],
      'africa': ['South Africa', 'Egypt', 'Kenya', 'Morocco'],
      'south-america': ['Brazil', 'Argentina', 'Chile', 'Colombia']
    };
    return continents[continent] || [];
  };

  const getUniqueCountries = () => {
    return [...new Set(airports.map(airport => airport.country))].sort();
  };

  const getUniqueTimezones = () => {
    return [...new Set(airports.map(airport => airport.timeZone))].sort();
  };

  const handleAdd = async (data: AirportFormData) => {
    try {
      const response = await flightService.createAirport(data);
      if (response.success) {
        await loadAirports();
        setIsAddDialogOpen(false);
        form.reset();
      } else {
        setError(response.message || 'Failed to create airport');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create airport');
    }
  };

  const handleEdit = async (data: AirportFormData) => {
    if (!selectedAirport) return;

    try {
      const response = await flightService.updateAirport(selectedAirport.id, data);
      if (response.success) {
        await loadAirports();
        setIsEditDialogOpen(false);
        setSelectedAirport(null);
        form.reset();
      } else {
        setError(response.message || 'Failed to update airport');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update airport');
    }
  };

  const handleDelete = async () => {
    if (!selectedAirport) return;

    try {
      const response = await flightService.deleteAirport(selectedAirport.id);
      if (response.success) {
        await loadAirports();
        setIsDeleteDialogOpen(false);
        setSelectedAirport(null);
      } else {
        setError(response.message || 'Failed to delete airport');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete airport');
    }
  };

  const openEditDialog = (airport: Airport) => {
    setSelectedAirport(airport);
    form.reset({
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      timeZone: airport.timeZone,
      latitude: airport.latitude,
      longitude: airport.longitude
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (airport: Airport) => {
    setSelectedAirport(airport);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = async (airport: Airport) => {
    setSelectedAirport(airport);
    setIsDetailsDialogOpen(true);
    
    // Load flights for this airport
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await flightService.getAirportFlightReport(airport.id, today, endDate);
      if (response.success) {
        const report = response.data;
        if (report) {
          setAirportFlights([...report.arrivingFlights, ...report.departingFlights]);
        }
      }
    } catch (error) {
      console.error('Failed to load airport flights:', error);
    }
  };

  // Airport presets for common airports
  const airportPresets = [
    {
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'United States',
      timeZone: 'America/New_York',
      latitude: 40.6413,
      longitude: -73.7781
    },
    {
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'United States',
      timeZone: 'America/Los_Angeles',
      latitude: 33.9425,
      longitude: -118.4081
    },
    {
      code: 'LHR',
      name: 'London Heathrow Airport',
      city: 'London',
      country: 'United Kingdom',
      timeZone: 'Europe/London',
      latitude: 51.4700,
      longitude: -0.4543
    },
    {
      code: 'NRT',
      name: 'Tokyo Narita International Airport',
      city: 'Tokyo',
      country: 'Japan',
      timeZone: 'Asia/Tokyo',
      latitude: 35.7720,
      longitude: 140.3928
    }
  ];

  const handlePresetSelect = (preset: typeof airportPresets[0]) => {
    form.reset(preset);
  };

  const getTotalAirports = () => airports.length;
  const getTotalCountries = () => new Set(airports.map(a => a.country)).size;
  const getAirportsWithCoordinates = () => airports.filter(a => a.latitude && a.longitude).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Airport Management</h1>
              <p className="text-muted-foreground">Manage global airport network and destinations</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Airport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Airport</DialogTitle>
                <DialogDescription>
                  Add a new airport to your network with location and timezone information
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                  {/* Airport Presets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {airportPresets.map((preset) => (
                        <Button
                          key={preset.code}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-left justify-start text-xs"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          <div>
                            <div className="font-medium">{preset.code} - {preset.city}</div>
                            <div className="text-muted-foreground">{preset.country}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airport Code (IATA)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., JFK" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Airport Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., John F. Kennedy International Airport" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                              <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</SelectItem>
                              <SelectItem value="America/Chicago">America/Chicago (CST/CDT)</SelectItem>
                              <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                              <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                              <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                              <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="e.g., 40.6413"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="e.g., -73.7781"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Airport</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <MapPin className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Airports</p>
              <p className="text-2xl font-bold">{getTotalAirports()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Globe className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Countries</p>
              <p className="text-2xl font-bold">{getTotalCountries()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">With Coordinates</p>
              <p className="text-2xl font-bold">{getAirportsWithCoordinates()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timezones</p>
              <p className="text-2xl font-bold">{getUniqueTimezones().length}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by code, name, city, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2">Country</Label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {getUniqueCountries().map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2">Continent</Label>
              <Select value={continentFilter} onValueChange={setContinentFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="oceania">Oceania</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="south-america">South America</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Airports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Airport Network</CardTitle>
          <CardDescription>
            {filteredAirports.length} of {airports.length} airports shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-muted-foreground">Loading airports...</span>
            </div>
          ) : filteredAirports.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No airports found</h3>
              <p className="text-muted-foreground">
                {airports.length === 0 ? 'Add your first airport to get started.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAirports.map((airport) => (
                  <TableRow key={airport.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{airport.code}</Badge>
                    </TableCell>
                    <TableCell>{airport.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{airport.city}</div>
                        <div className="text-muted-foreground">{airport.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {airport.timeZone}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {airport.latitude && airport.longitude ? (
                        <div className="text-xs">
                          <div>Lat: {airport.latitude.toFixed(4)}</div>
                          <div>Lng: {airport.longitude.toFixed(4)}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(airport)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(airport)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(airport)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Airport</DialogTitle>
            <DialogDescription>
              Update airport information and location details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Airport Code (IATA)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., JFK" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Airport Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John F. Kennedy International Airport" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</SelectItem>
                          <SelectItem value="America/Chicago">America/Chicago (CST/CDT)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                          <SelectItem value="Europe/Paris">Europe/Paris (CET/CEST)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                          <SelectItem value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 40.6413"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., -73.7781"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Airport</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Airport</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this airport? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAirport && (
            <div className="py-4">
              <p className="text-sm"><strong>Code:</strong> {selectedAirport.code}</p>
              <p className="text-sm"><strong>Name:</strong> {selectedAirport.name}</p>
              <p className="text-sm"><strong>Location:</strong> {selectedAirport.city}, {selectedAirport.country}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Airport
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Airport Details</DialogTitle>
            <DialogDescription>
              Detailed information and flight activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedAirport && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Airport Details</TabsTrigger>
                <TabsTrigger value="flights">Flight Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Airport Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Code:</strong> {selectedAirport.code}</div>
                      <div><strong>Name:</strong> {selectedAirport.name}</div>
                      <div><strong>City:</strong> {selectedAirport.city}</div>
                      <div><strong>Country:</strong> {selectedAirport.country}</div>
                      <div><strong>Timezone:</strong> {selectedAirport.timeZone}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Location Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedAirport.latitude && selectedAirport.longitude ? (
                        <>
                          <div><strong>Latitude:</strong> {selectedAirport.latitude.toFixed(6)}</div>
                          <div><strong>Longitude:</strong> {selectedAirport.longitude.toFixed(6)}</div>
                          <div className="pt-2">
                            <Badge variant="default">Coordinates Available</Badge>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          <p>Geographic coordinates not set</p>
                          <Badge variant="secondary">No Coordinates</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="flights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Flight Activity</CardTitle>
                    <CardDescription>
                      Flights arriving and departing from this airport (next 7 days)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {airportFlights.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No flights scheduled for this airport</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Flight Number</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Departure</TableHead>
                            <TableHead>Arrival</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {airportFlights.map((flight) => (
                            <TableRow key={flight.id}>
                              <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                              <TableCell>{flight.origin.code} → {flight.destination.code}</TableCell>
                              <TableCell>
                                {new Date(flight.departureTime).toLocaleDateString()}{' '}
                                {new Date(flight.departureTime).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                {new Date(flight.arrivalTime).toLocaleDateString()}{' '}
                                {new Date(flight.arrivalTime).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{flight.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
