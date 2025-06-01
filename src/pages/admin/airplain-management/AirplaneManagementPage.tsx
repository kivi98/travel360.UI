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
import type { Airplane, Flight } from '@/types';
import { AirplaneCapacity } from '@/types';
import { 
  Plane, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Activity
} from 'lucide-react';

const airplaneSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  registrationNumber: z.string().min(1, 'Registration is required'),
  size: z.nativeEnum(AirplaneCapacity),
  firstClassCapacity: z.number().min(0, 'Must be 0 or greater'),
  businessClassCapacity: z.number().min(0, 'Must be 0 or greater'),
  economyClassCapacity: z.number().min(1, 'Must have at least 1 economy seat'),
  active: z.boolean()
});

type AirplaneFormData = z.infer<typeof airplaneSchema>;

export const AirplaneManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [airplanes, setAirplanes] = useState<Airplane[]>([]);
  const [filteredAirplanes, setFilteredAirplanes] = useState<Airplane[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [capacityFilter, setCapacityFilter] = useState<AirplaneCapacity | 'all'>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedAirplane, setSelectedAirplane] = useState<Airplane | null>(null);
  const [airplaneFlights, setAirplaneFlights] = useState<Flight[]>([]);

  const form = useForm<AirplaneFormData>({
    resolver: zodResolver(airplaneSchema),
    defaultValues: {
      model: '',
      registrationNumber: '',
      size: AirplaneCapacity.MEDIUM,
      firstClassCapacity: 0,
      businessClassCapacity: 0,
      economyClassCapacity: 180,
      active: true
    }
  });

  useEffect(() => {
    loadAirplanes();
  }, []);

  useEffect(() => {
    filterAirplanes();
  }, [airplanes, searchTerm, statusFilter, capacityFilter]);

  const loadAirplanes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await flightService.getAllAirplanes();
      if (response.success) {
        setAirplanes(response.data || []);
      } else {
        setError(response.message || 'Failed to load airplanes');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load airplanes');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAirplanes = () => {
    let filtered = [...airplanes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(airplane =>
        airplane.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airplane.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(airplane =>
        statusFilter === 'active' ? airplane.active : !airplane.active
      );
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(airplane => airplane.size === capacityFilter);
    }

    setFilteredAirplanes(filtered);
  };

  const handleAdd = async (data: AirplaneFormData) => {
    try {
      const totalCapacity = data.firstClassCapacity + data.businessClassCapacity + data.economyClassCapacity;
      const airplaneData = {
        ...data,
        totalCapacity,
      };

      const response = await flightService.createAirplane(airplaneData);
      if (response.success) {
        await loadAirplanes();
        setIsAddDialogOpen(false);
        form.reset();
      } else {
        setError(response.message || 'Failed to create airplane');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create airplane');
    }
  };

  const handleEdit = async (data: AirplaneFormData) => {
    if (!selectedAirplane) return;

    try {
      const totalCapacity = data.firstClassCapacity + data.businessClassCapacity + data.economyClassCapacity;
      const airplaneData = {
        ...data,
        totalCapacity,
      };

      const response = await flightService.updateAirplane(selectedAirplane.id, airplaneData);
      if (response.success) {
        await loadAirplanes();
        setIsEditDialogOpen(false);
        setSelectedAirplane(null);
        form.reset();
      } else {
        setError(response.message || 'Failed to update airplane');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update airplane');
    }
  };

  const handleDelete = async () => {
    if (!selectedAirplane) return;

    try {
      const response = await flightService.deleteAirplane(selectedAirplane.id);
      if (response.success) {
        await loadAirplanes();
        setIsDeleteDialogOpen(false);
        setSelectedAirplane(null);
      } else {
        setError(response.message || 'Failed to delete airplane');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete airplane');
    }
  };

  const openEditDialog = (airplane: Airplane) => {
    setSelectedAirplane(airplane);
    form.reset({
      model: airplane.model,
      registrationNumber: airplane.registrationNumber,
      size: airplane.size,
      firstClassCapacity: airplane.firstClassCapacity,
      businessClassCapacity: airplane.businessClassCapacity,
      economyClassCapacity: airplane.economyClassCapacity,
      active: airplane.active
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (airplane: Airplane) => {
    setSelectedAirplane(airplane);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsDialog = async (airplane: Airplane) => {
    setSelectedAirplane(airplane);
    setIsDetailsDialogOpen(true);
    
    // Load flights for this airplane
    try {
      const response = await flightService.getFlightsByAirplane(airplane.id);
      if (response.success) {
        setAirplaneFlights(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load airplane flights:', error);
    }
  };

  const getCapacityBadgeVariant = (capacity: AirplaneCapacity) => {
    switch (capacity) {
      case AirplaneCapacity.SMALL: return 'secondary';
      case AirplaneCapacity.MEDIUM: return 'default';
      case AirplaneCapacity.LARGE: return 'destructive';
      default: return 'outline';
    }
  };

  const getTotalActiveAirplanes = () => airplanes.filter(a => a.active).length;
  const getTotalInactiveAirplanes = () => airplanes.filter(a => !a.active).length;
  const getTotalSeats = () => airplanes.reduce((sum, a) => sum + a.totalCapacity, 0);

  // Airplane presets for common aircraft models
  const airplanePresets = [
    {
      model: 'Boeing 737-800',
      size: AirplaneCapacity.MEDIUM,
      firstClassCapacity: 8,
      businessClassCapacity: 20,
      economyClassCapacity: 150,
      registrationNumber: ''
    },
    {
      model: 'Airbus A320',
      size: AirplaneCapacity.MEDIUM,
      firstClassCapacity: 12,
      businessClassCapacity: 24,
      economyClassCapacity: 144,
      registrationNumber: ''
    },
    {
      model: 'Boeing 777-300ER',
      size: AirplaneCapacity.LARGE,
      firstClassCapacity: 14,
      businessClassCapacity: 64,
      economyClassCapacity: 280,
      registrationNumber: ''
    },
    {
      model: 'Embraer E190',
      size: AirplaneCapacity.SMALL,
      firstClassCapacity: 0,
      businessClassCapacity: 12,
      economyClassCapacity: 86,
      registrationNumber: ''
    }
  ];

  const handlePresetSelect = (preset: typeof airplanePresets[0]) => {
    form.reset({
      model: preset.model,
      registrationNumber: preset.registrationNumber,
      size: preset.size,
      firstClassCapacity: preset.firstClassCapacity,
      businessClassCapacity: preset.businessClassCapacity,
      economyClassCapacity: preset.economyClassCapacity,
      active: true
    });
  };

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
              <h1 className="text-3xl font-bold text-foreground">Airplane Management</h1>
              <p className="text-muted-foreground">Manage aircraft fleet and configurations</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Airplane
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Airplane</DialogTitle>
                <DialogDescription>
                  Add a new aircraft to your fleet with seating configuration
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
                  {/* Aircraft Presets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {airplanePresets.map((preset) => (
                        <Button
                          key={preset.model}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-left justify-start text-xs"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          <div>
                            <div className="font-medium">{preset.model}</div>
                            <div className="text-muted-foreground">
                              {preset.firstClassCapacity + preset.businessClassCapacity + preset.economyClassCapacity} seats
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aircraft Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Boeing 737-800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="registrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., N12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aircraft Capacity</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={AirplaneCapacity.SMALL}>Small (50-100 seats)</SelectItem>
                              <SelectItem value={AirplaneCapacity.MEDIUM}>Medium (100-300 seats)</SelectItem>
                              <SelectItem value={AirplaneCapacity.LARGE}>Large (300+ seats)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="firstClassCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Class Seats</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="businessClassCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Class Seats</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="economyClassCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Economy Class Seats</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel>Active (available for scheduling)</FormLabel>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Airplane</Button>
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
            <Plane className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Aircraft</p>
              <p className="text-2xl font-bold">{airplanes.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{getTotalActiveAirplanes()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">{getTotalInactiveAirplanes()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Settings className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Seats</p>
              <p className="text-2xl font-bold">{getTotalSeats().toLocaleString()}</p>
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
              <Label htmlFor="search" className='mb-2'>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by model or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className='mb-2'>Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className='mb-2'>Capacity</Label>
              <Select value={capacityFilter} onValueChange={(value: any) => setCapacityFilter(value)}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacities</SelectItem>
                  <SelectItem value={AirplaneCapacity.SMALL}>Small</SelectItem>
                  <SelectItem value={AirplaneCapacity.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={AirplaneCapacity.LARGE}>Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Airplanes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Aircraft Fleet</CardTitle>
          <CardDescription>
            {filteredAirplanes.length} of {airplanes.length} aircraft shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-muted-foreground">Loading aircraft...</span>
            </div>
          ) : filteredAirplanes.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No aircraft found</h3>
              <p className="text-muted-foreground">
                {airplanes.length === 0 ? 'Add your first aircraft to get started.' : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Seating</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAirplanes.map((airplane) => (
                  <TableRow key={airplane.id}>
                    <TableCell className="font-medium">{airplane.model}</TableCell>
                    <TableCell>{airplane.registrationNumber}</TableCell>
                    <TableCell>
                      <Badge variant={getCapacityBadgeVariant(airplane.size)}>
                        {airplane.size}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>F: {airplane.firstClassCapacity}</div>
                        <div>B: {airplane.businessClassCapacity}</div>
                        <div>E: {airplane.economyClassCapacity}</div>
                      </div>
                    </TableCell>
                    <TableCell>{airplane.totalCapacity}</TableCell>
                    <TableCell>
                      <Badge variant={airplane.active ? 'default' : 'secondary'}>
                        {airplane.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(airplane)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(airplane)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(airplane)}
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
            <DialogTitle>Edit Airplane</DialogTitle>
            <DialogDescription>
              Update aircraft details and seating configuration
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aircraft Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Boeing 737-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., N12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aircraft Capacity</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={AirplaneCapacity.SMALL}>Small (50-100 seats)</SelectItem>
                          <SelectItem value={AirplaneCapacity.MEDIUM}>Medium (100-300 seats)</SelectItem>
                          <SelectItem value={AirplaneCapacity.LARGE}>Large (300+ seats)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="firstClassCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Class Seats</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessClassCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Class Seats</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="economyClassCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Economy Class Seats</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel>Active (available for scheduling)</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Airplane</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Airplane</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this airplane? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAirplane && (
            <div className="py-4">
              <p className="text-sm"><strong>Model:</strong> {selectedAirplane.model}</p>
              <p className="text-sm"><strong>Registration:</strong> {selectedAirplane.registrationNumber}</p>
              <p className="text-sm"><strong>Total Seats:</strong> {selectedAirplane.totalCapacity}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Airplane
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Airplane Details</DialogTitle>
            <DialogDescription>
              Detailed information and flight assignments
            </DialogDescription>
          </DialogHeader>
          
          {selectedAirplane && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Aircraft Details</TabsTrigger>
                <TabsTrigger value="flights">Flight Assignments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Aircraft Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Model:</strong> {selectedAirplane.model}</div>
                      <div><strong>Registration:</strong> {selectedAirplane.registrationNumber}</div>
                      <div><strong>Capacity:</strong> {selectedAirplane.size}</div>
                      <div>
                        <strong>Status:</strong> 
                        <Badge 
                          variant={selectedAirplane.active ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {selectedAirplane.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seating Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>First Class:</strong> {selectedAirplane.firstClassCapacity} seats</div>
                      <div><strong>Business Class:</strong> {selectedAirplane.businessClassCapacity} seats</div>
                      <div><strong>Economy Class:</strong> {selectedAirplane.economyClassCapacity} seats</div>
                      <div className="pt-2 border-t"><strong>Total Seats:</strong> {selectedAirplane.totalCapacity}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="flights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Flight Assignments</CardTitle>
                    <CardDescription>
                      Flights currently assigned to this aircraft
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {airplaneFlights.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No flights currently assigned to this aircraft</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Flight Number</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Departure</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {airplaneFlights.map((flight) => (
                            <TableRow key={flight.id}>
                              <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                              <TableCell>{flight.originAirport.code} → {flight.destinationAirport.code}</TableCell>
                              <TableCell>
                                {new Date(flight.departureTime).toLocaleDateString()}{' '}
                                {new Date(flight.departureTime).toLocaleTimeString()}
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
