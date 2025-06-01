import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { 
  Flight, 
  FlightStatus, 
  Airport, 
  Airplane,
  CreateFlightForm,
  PaginatedResponse
} from '@/types';
import { FlightStatus as FlightStatusEnum, UserRole } from '@/types';
import { 
  Plane, 
  Plus,
  Edit,
  Trash2,
  Search, 
  Filter,
  Eye,
  Activity,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const flightSchema = z.object({
  flightNumber: z.string().min(2, 'Flight number must be at least 2 characters'),
  airplaneId: z.string().min(1, 'Please select an airplane'),
  originId: z.string().min(1, 'Please select origin airport'),
  destinationId: z.string().min(1, 'Please select destination airport'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  firstClassPrice: z.number().min(0, 'Price must be positive'),
  businessClassPrice: z.number().min(0, 'Price must be positive'),
  economyClassPrice: z.number().min(0, 'Price must be positive')
});

type FlightFormData = z.infer<typeof flightSchema>;

export const FlightManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);
  const [availableAirplanes, setAvailableAirplanes] = useState<Airplane[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlights, setTotalFlights] = useState(0);
  const pageSize = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const form = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flightNumber: '',
      airplaneId: '',
      originId: '',
      destinationId: '',
      departureTime: '',
      arrivalTime: '',
      firstClassPrice: 0,
      businessClassPrice: 0,
      economyClassPrice: 0
    }
  });

  useEffect(() => {
    loadFlights();
    loadAirports();
    loadAirplanes();
  }, [currentPage]);

  useEffect(() => {
    filterFlights();
  }, [flights, searchTerm, statusFilter, originFilter, destinationFilter, dateFilter]);

  const loadFlights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await flightService.getAllFlights({
        page: currentPage,
        limit: pageSize
      });
      if (response.success) {
        setFlights(response.data || []);
        setTotalPages(response.pagination?.page ? Math.ceil(response.pagination.total / response.pagination.size) : 1);
        setTotalFlights(response.pagination?.total || 0);
      } else {
        setError('Failed to load flights');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load flights');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAirports = async () => {
    try {
      const response = await flightService.getAllAirports();
      if (response.success) {
        setAirports(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    }
  };

  const loadAirplanes = async () => {
    try {
      const response = await flightService.getAllAirplanes();
      if (response.success) {
        setAirplanes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load airplanes:', error);
    }
  };

  const loadAvailableAirplanes = async (departureTime: string, arrivalTime: string) => {
    try {
      const response = await flightService.getAvailableAirplanes(departureTime, arrivalTime);
      if (response.success) {
        setAvailableAirplanes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load available airplanes:', error);
    }
  };

  const filterFlights = () => {
    let filtered = [...flights];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(flight =>
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.origin.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.destination.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.destination.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.airplane.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(flight => flight.status === statusFilter);
    }

    // Origin filter
    if (originFilter !== 'all') {
      filtered = filtered.filter(flight => flight.origin.id === originFilter);
    }

    // Destination filter
    if (destinationFilter !== 'all') {
      filtered = filtered.filter(flight => flight.destination.id === destinationFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(flight => {
        const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
        return flightDate === dateFilter;
      });
    }

    setFilteredFlights(filtered);
  };

  const handleAdd = async (data: FlightFormData) => {
    try {
      const response = await flightService.createFlight(data);
      if (response.success) {
        await loadFlights();
        setIsAddDialogOpen(false);
        form.reset();
      } else {
        setError(response.message || 'Failed to create flight');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create flight');
    }
  };

  const handleEdit = async (data: FlightFormData) => {
    if (!selectedFlight) return;

    try {
      const response = await flightService.updateFlight(selectedFlight.id, data);
      if (response.success) {
        await loadFlights();
        setIsEditDialogOpen(false);
        setSelectedFlight(null);
        form.reset();
      } else {
        setError(response.message || 'Failed to update flight');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update flight');
    }
  };

  const handleDelete = async () => {
    if (!selectedFlight) return;

    try {
      const response = await flightService.deleteFlight(selectedFlight.id);
      if (response.success) {
        await loadFlights();
        setIsDeleteDialogOpen(false);
        setSelectedFlight(null);
      } else {
        setError(response.message || 'Failed to delete flight');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete flight');
    }
  };

  const handleStatusUpdate = async (flight: Flight, newStatus: FlightStatus) => {
    try {
      const response = await flightService.updateFlightStatus(flight.id, newStatus);
      if (response.success) {
        await loadFlights();
      } else {
        setError(response.message || 'Failed to update flight status');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update flight status');
    }
  };

  const openEditDialog = (flight: Flight) => {
    setSelectedFlight(flight);
    form.reset({
      flightNumber: flight.flightNumber,
      airplaneId: flight.airplane.id,
      originId: flight.origin.id,
      destinationId: flight.destination.id,
      departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
      firstClassPrice: flight.firstClassPrice,
      businessClassPrice: flight.businessClassPrice,
      economyClassPrice: flight.economyClassPrice
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: FlightStatus) => {
    const statusConfig = {
      [FlightStatusEnum.SCHEDULED]: { variant: 'outline' as const, color: 'text-blue-600' },
      [FlightStatusEnum.BOARDING]: { variant: 'default' as const, color: 'text-yellow-600' },
      [FlightStatusEnum.DEPARTED]: { variant: 'secondary' as const, color: 'text-green-600' },
      [FlightStatusEnum.IN_FLIGHT]: { variant: 'default' as const, color: 'text-blue-600' },
      [FlightStatusEnum.ARRIVED]: { variant: 'secondary' as const, color: 'text-green-600' },
      [FlightStatusEnum.CANCELLED]: { variant: 'destructive' as const, color: 'text-red-600' },
      [FlightStatusEnum.DELAYED]: { variant: 'destructive' as const, color: 'text-orange-600' }
    };

    const config = statusConfig[status];

    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
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

  const getFlightStats = () => {
    const scheduled = filteredFlights.filter(f => f.status === FlightStatusEnum.SCHEDULED).length;
    const inProgress = filteredFlights.filter(f => 
      f.status === FlightStatusEnum.BOARDING || 
      f.status === FlightStatusEnum.DEPARTED || 
      f.status === FlightStatusEnum.IN_FLIGHT
    ).length;
    const completed = filteredFlights.filter(f => f.status === FlightStatusEnum.ARRIVED).length;
    const issues = filteredFlights.filter(f => 
      f.status === FlightStatusEnum.CANCELLED || 
      f.status === FlightStatusEnum.DELAYED
    ).length;
    
    return { scheduled, inProgress, completed, issues };
  };

  const stats = getFlightStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Flight Management</h1>
              <p className="text-muted-foreground">Manage flight schedules, routes, and operations</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Flight
            </Button>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Plane className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issues</p>
              <p className="text-2xl font-bold">{stats.issues}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search flights..."
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
                  <SelectItem value={FlightStatusEnum.SCHEDULED}>Scheduled</SelectItem>
                  <SelectItem value={FlightStatusEnum.BOARDING}>Boarding</SelectItem>
                  <SelectItem value={FlightStatusEnum.DEPARTED}>Departed</SelectItem>
                  <SelectItem value={FlightStatusEnum.IN_FLIGHT}>In Flight</SelectItem>
                  <SelectItem value={FlightStatusEnum.ARRIVED}>Arrived</SelectItem>
                  <SelectItem value={FlightStatusEnum.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={FlightStatusEnum.DELAYED}>Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Origin</Label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Origins</SelectItem>
                  {airports.map((airport) => (
                    <SelectItem key={airport.id} value={airport.id}>
                      {airport.code} - {airport.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Destination</Label>
              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {airports.map((airport) => (
                    <SelectItem key={airport.id} value={airport.id}>
                      {airport.code} - {airport.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2">Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Operations</CardTitle>
          <CardDescription>
            {filteredFlights.length} of {totalFlights} flights shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-muted-foreground">Loading flights...</span>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground">
                {flights.length === 0 ? 'No flights have been scheduled yet.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Aircraft</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{flight.flightNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {flight.origin.code} → {flight.destination.code}
                        </div>
                        <div className="text-muted-foreground">
                          {flight.origin.city} → {flight.destination.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{flight.airplane.model}</div>
                        <div className="text-muted-foreground">{flight.airplane.registrationNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(flight.departureTime).toLocaleTimeString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(flight.departureTime).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFlightDuration(flight.departureTime, flight.arrivalTime)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(flight.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>F: {formatPrice(flight.firstClassPrice)}</div>
                        <div>B: {formatPrice(flight.businessClassPrice)}</div>
                        <div>E: {formatPrice(flight.economyClassPrice)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(flight)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(flight)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(flight)}
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

      {/* Add Flight Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Flight</DialogTitle>
            <DialogDescription>
              Create a new flight schedule with route, aircraft, and pricing information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flightNumber">Flight Number</Label>
                <Input
                  id="flightNumber"
                  placeholder="e.g., AA123"
                  {...form.register('flightNumber')}
                />
                {form.formState.errors.flightNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.flightNumber.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="airplane">Aircraft</Label>
                <Select 
                  value={form.watch('airplaneId')} 
                  onValueChange={(value) => form.setValue('airplaneId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    {airplanes.map((airplane) => (
                      <SelectItem key={airplane.id} value={airplane.id}>
                        {airplane.model} ({airplane.registrationNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.airplaneId && (
                  <p className="text-sm text-red-600">{form.formState.errors.airplaneId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Origin Airport</Label>
                <Select 
                  value={form.watch('originId')} 
                  onValueChange={(value) => form.setValue('originId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.id} value={airport.id}>
                        {airport.code} - {airport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.originId && (
                  <p className="text-sm text-red-600">{form.formState.errors.originId.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="destination">Destination Airport</Label>
                <Select 
                  value={form.watch('destinationId')} 
                  onValueChange={(value) => form.setValue('destinationId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.id} value={airport.id}>
                        {airport.code} - {airport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.destinationId && (
                  <p className="text-sm text-red-600">{form.formState.errors.destinationId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  {...form.register('departureTime')}
                />
                {form.formState.errors.departureTime && (
                  <p className="text-sm text-red-600">{form.formState.errors.departureTime.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="datetime-local"
                  {...form.register('arrivalTime')}
                />
                {form.formState.errors.arrivalTime && (
                  <p className="text-sm text-red-600">{form.formState.errors.arrivalTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="economyPrice">Economy Price</Label>
                <Input
                  id="economyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('economyClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.economyClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.economyClassPrice.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="businessPrice">Business Price</Label>
                <Input
                  id="businessPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('businessClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.businessClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessClassPrice.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="firstPrice">First Class Price</Label>
                <Input
                  id="firstPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('firstClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.firstClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstClassPrice.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Flight</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Update flight schedule and information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFlightNumber">Flight Number</Label>
                <Input
                  id="editFlightNumber"
                  placeholder="e.g., AA123"
                  {...form.register('flightNumber')}
                />
                {form.formState.errors.flightNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.flightNumber.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="editAirplane">Aircraft</Label>
                <Select 
                  value={form.watch('airplaneId')} 
                  onValueChange={(value) => form.setValue('airplaneId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aircraft" />
                  </SelectTrigger>
                  <SelectContent>
                    {airplanes.map((airplane) => (
                      <SelectItem key={airplane.id} value={airplane.id}>
                        {airplane.model} ({airplane.registrationNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.airplaneId && (
                  <p className="text-sm text-red-600">{form.formState.errors.airplaneId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editOrigin">Origin Airport</Label>
                <Select 
                  value={form.watch('originId')} 
                  onValueChange={(value) => form.setValue('originId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.id} value={airport.id}>
                        {airport.code} - {airport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.originId && (
                  <p className="text-sm text-red-600">{form.formState.errors.originId.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="editDestination">Destination Airport</Label>
                <Select 
                  value={form.watch('destinationId')} 
                  onValueChange={(value) => form.setValue('destinationId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports.map((airport) => (
                      <SelectItem key={airport.id} value={airport.id}>
                        {airport.code} - {airport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.destinationId && (
                  <p className="text-sm text-red-600">{form.formState.errors.destinationId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editDepartureTime">Departure Time</Label>
                <Input
                  id="editDepartureTime"
                  type="datetime-local"
                  {...form.register('departureTime')}
                />
                {form.formState.errors.departureTime && (
                  <p className="text-sm text-red-600">{form.formState.errors.departureTime.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="editArrivalTime">Arrival Time</Label>
                <Input
                  id="editArrivalTime"
                  type="datetime-local"
                  {...form.register('arrivalTime')}
                />
                {form.formState.errors.arrivalTime && (
                  <p className="text-sm text-red-600">{form.formState.errors.arrivalTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editEconomyPrice">Economy Price</Label>
                <Input
                  id="editEconomyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('economyClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.economyClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.economyClassPrice.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="editBusinessPrice">Business Price</Label>
                <Input
                  id="editBusinessPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('businessClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.businessClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessClassPrice.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="editFirstPrice">First Class Price</Label>
                <Input
                  id="editFirstPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register('firstClassPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.firstClassPrice && (
                  <p className="text-sm text-red-600">{form.formState.errors.firstClassPrice.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Flight</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Flight Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flight? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlight && (
            <div className="py-4">
              <p className="text-sm"><strong>Flight:</strong> {selectedFlight.flightNumber}</p>
              <p className="text-sm"><strong>Route:</strong> {selectedFlight.origin.code} → {selectedFlight.destination.code}</p>
              <p className="text-sm"><strong>Departure:</strong> {new Date(selectedFlight.departureTime).toLocaleString()}</p>
              <p className="text-sm"><strong>Aircraft:</strong> {selectedFlight.airplane.model}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Flight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flight Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Flight Details</DialogTitle>
            <DialogDescription>
              Complete flight information and operational details
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlight && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Flight Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Flight Number:</strong> {selectedFlight.flightNumber}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedFlight.status)}</div>
                    <div><strong>Duration:</strong> {getFlightDuration(selectedFlight.departureTime, selectedFlight.arrivalTime)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aircraft Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Model:</strong> {selectedFlight.airplane.model}</div>
                    <div><strong>Registration:</strong> {selectedFlight.airplane.registrationNumber}</div>
                    <div><strong>Capacity:</strong> {selectedFlight.airplane.totalCapacity} seats</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Route & Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Origin</p>
                      <p>{selectedFlight.origin.name} ({selectedFlight.origin.code})</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.origin.city}, {selectedFlight.origin.country}</p>
                      <p className="text-sm font-medium mt-2">Departure: {new Date(selectedFlight.departureTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Destination</p>
                      <p>{selectedFlight.destination.name} ({selectedFlight.destination.code})</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.destination.city}, {selectedFlight.destination.country}</p>
                      <p className="text-sm font-medium mt-2">Arrival: {new Date(selectedFlight.arrivalTime).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing & Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="font-medium">Economy</p>
                      <p className="text-2xl font-bold">{formatPrice(selectedFlight.economyClassPrice)}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.availableEconomyClassSeats} available</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Business</p>
                      <p className="text-2xl font-bold">{formatPrice(selectedFlight.businessClassPrice)}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.availableBusinessClassSeats} available</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">First Class</p>
                      <p className="text-2xl font-bold">{formatPrice(selectedFlight.firstClassPrice)}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.availableFirstClassSeats} available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedFlight.status === FlightStatusEnum.SCHEDULED && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(selectedFlight, FlightStatusEnum.BOARDING)}
                      >
                        Start Boarding
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedFlight, FlightStatusEnum.DELAYED)}
                      >
                        Mark Delayed
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusUpdate(selectedFlight, FlightStatusEnum.CANCELLED)}
                      >
                        Cancel Flight
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
