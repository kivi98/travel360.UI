# Travel360 - Airline Ticket Booking System

A comprehensive airline ticket booking and management system built with React, TypeScript, and modern web technologies.

## 🚀 Features

### User Management
- **Three User Roles**: Customer, Operator, Administrator
- **Role-based Access Control**: Different permissions for each user type
- **Authentication**: Secure login/logout with JWT tokens

### Flight Management
- **Flight Scheduling**: Create and manage flight schedules
- **Conflict Prevention**: Automatic validation to prevent scheduling conflicts
- **Airport & Airplane Management**: Comprehensive management of airports and aircraft
- **Real-time Status Updates**: Track flight status changes

### Booking System
- **Flight Search**: Search for direct and transit flights
- **Seat Selection**: Choose from First Class, Business Class, and Economy
- **Booking Management**: Create, view, and cancel bookings
- **Passenger Manifests**: Generate detailed passenger lists

### Reporting & Analytics
- **Passenger Manifests**: Detailed flight passenger reports
- **Airport Reports**: Arriving and departing flights by airport
- **Revenue Analytics**: Booking statistics and revenue reports
- **Popular Routes**: Track most popular flight destinations

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   ├── auth/           # Authentication components
│   ├── flights/        # Flight-related components
│   ├── bookings/       # Booking-related components
│   ├── admin/          # Admin/operator components
│   └── common/         # Common utility components
├── pages/              # Page components
├── contexts/           # React contexts
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── lib/                # Library configurations
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Java backend server (separate repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Travel360.UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_APP_NAME=Travel360
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 👥 User Roles & Permissions

### Customer
- Search and view flights
- Create bookings
- View personal bookings
- Cancel own bookings

### Operator
- All customer permissions
- Create bookings for customers
- Manage flight schedules
- Generate operational reports
- View all bookings

### Administrator
- All operator permissions
- User management (create, update, deactivate users)
- System configuration
- Advanced reporting and analytics

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control. Demo credentials:

- **Admin**: `admin` / `admin123`
- **Operator**: `operator` / `operator123`
- **Customer**: `customer` / `customer123`

## 📊 API Integration

The frontend communicates with a Java Spring Boot backend through RESTful APIs. Key endpoints include:

- `/auth/*` - Authentication endpoints
- `/flights/*` - Flight management
- `/bookings/*` - Booking operations
- `/airports/*` - Airport management
- `/airplanes/*` - Aircraft management
- `/reports/*` - Reporting endpoints

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Modern UI**: Clean, professional interface using shadcn/ui
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🧪 Development

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Component Architecture**: Modular, reusable components

### Best Practices
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Error Boundaries**: Graceful error handling
- **Performance**: Optimized rendering and lazy loading
- **Security**: XSS protection, secure authentication

## 📈 Future Enhancements

- **Real-time Updates**: WebSocket integration for live flight updates
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: More detailed reporting and insights
- **Payment Integration**: Online payment processing
- **Multi-language Support**: Internationalization
- **Offline Support**: Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a university assignment for CSC 506 Computer Programming Laboratory.

## 📞 Support

For support and questions:
- Email: support@travel360.com
- Phone: +1 (555) 123-4567
- 24/7 Customer Support

---

**Travel360** - Your trusted partner for airline ticket booking worldwide.
