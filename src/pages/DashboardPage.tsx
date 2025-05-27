import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Plane, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Ticket,
  BarChart3
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  // Mock data - in a real app, this would come from an API
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      description: 'Active users this month'
    },
    {
      title: 'Total Flights',
      value: '1,234',
      change: '+8%',
      icon: Plane,
      description: 'Scheduled flights'
    },
    {
      title: 'Bookings Today',
      value: '156',
      change: '+23%',
      icon: Ticket,
      description: 'New bookings today'
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+15%',
      icon: DollarSign,
      description: 'Total revenue this month'
    },
    {
      title: 'Airports',
      value: '89',
      change: '+2%',
      icon: MapPin,
      description: 'Active airports'
    },
    {
      title: 'Occupancy Rate',
      value: '78%',
      change: '+5%',
      icon: BarChart3,
      description: 'Average flight occupancy'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here's an overview of your travel management system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">{stat.change}</span> from last month
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Plane className="mr-2 h-4 w-4" />
                Add Flight
              </CardTitle>
              <CardDescription>
                Schedule a new flight
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Add Airport
              </CardTitle>
              <CardDescription>
                Register a new airport
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </CardTitle>
              <CardDescription>
                View and edit user accounts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </CardTitle>
              <CardDescription>
                Analyze system performance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>
                Latest booking activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'BK001', route: 'NYC → LAX', passenger: 'John Doe', time: '2 hours ago' },
                  { id: 'BK002', route: 'LAX → CHI', passenger: 'Jane Smith', time: '4 hours ago' },
                  { id: 'BK003', route: 'CHI → MIA', passenger: 'Bob Johnson', time: '6 hours ago' },
                ].map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{booking.id}</p>
                      <p className="text-xs text-muted-foreground">{booking.route}</p>
                      <p className="text-xs text-muted-foreground">{booking.passenger}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { service: 'Booking System', status: 'Online', color: 'text-green-600' },
                  { service: 'Payment Gateway', status: 'Online', color: 'text-green-600' },
                  { service: 'Flight Data API', status: 'Online', color: 'text-green-600' },
                  { service: 'Email Service', status: 'Maintenance', color: 'text-yellow-600' },
                ].map((service) => (
                  <div key={service.service} className="flex items-center justify-between">
                    <span className="text-sm">{service.service}</span>
                    <span className={`text-xs font-medium ${service.color}`}>
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
    </AdminLayout>
  );
};
