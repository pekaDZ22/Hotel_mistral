import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { UserRole } from '@/types';

// Layouts
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Platform Admin Pages
import { PlatformAdminDashboard } from '@/pages/platform-admin/Dashboard';
import { PlatformAdminHotels } from '@/pages/platform-admin/Hotels';
import { PlatformAdminUsers } from '@/pages/platform-admin/Users';

// Hotel Admin Pages
import { HotelAdminDashboard } from '@/pages/hotel-admin/Dashboard';
import { HotelAdminRooms } from '@/pages/hotel-admin/Rooms';
import { HotelAdminBookings } from '@/pages/hotel-admin/Bookings';
import { HotelAdminStaff } from '@/pages/hotel-admin/Staff';

// Staff Pages
import { StaffDashboard } from '@/pages/staff/Dashboard';
import { StaffBookings } from '@/pages/staff/Bookings';

// Customer Pages
import { CustomerDashboard } from '@/pages/customer/Dashboard';
import { CustomerBookings } from '@/pages/customer/Bookings';
import { BrowseHotels } from '@/pages/customer/BrowseHotels';
import { HotelDetail } from '@/pages/customer/HotelDetail';

// Common Pages
import { HomePage } from '@/pages/customer/HomePage';
import { NotFoundPage } from '@/pages/customer/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/" element={<DashboardLayout role="CUSTOMER" />}>
          <Route index element={<HomePage />} />
          <Route path="hotels" element={<BrowseHotels />} />
          <Route path="hotels/:id" element={<HotelDetail />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.STAFF]} />}>
          <Route path="/staff" element={<DashboardLayout role="STAFF" />}>
            <Route index element={<StaffDashboard />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="bookings" element={<StaffBookings />} />
          </Route>
        </Route>

        {/* Hotel Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.HOTEL_ADMIN]} />}>
          <Route path="/hotel-admin" element={<DashboardLayout role="HOTEL_ADMIN" />}>
            <Route index element={<HotelAdminDashboard />} />
            <Route path="dashboard" element={<HotelAdminDashboard />} />
            <Route path="rooms" element={<HotelAdminRooms />} />
            <Route path="bookings" element={<HotelAdminBookings />} />
            <Route path="staff" element={<HotelAdminStaff />} />
          </Route>
        </Route>

        {/* Platform Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[UserRole.PLATFORM_ADMIN]} />}>
          <Route path="/platform-admin" element={<DashboardLayout role="PLATFORM_ADMIN" />}>
            <Route index element={<PlatformAdminDashboard />} />
            <Route path="dashboard" element={<PlatformAdminDashboard />} />
            <Route path="hotels" element={<PlatformAdminHotels />} />
            <Route path="users" element={<PlatformAdminUsers />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
