// User types
export type UserRole = 'CUSTOMER' | 'STAFF' | 'HOTEL_ADMIN' | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Hotel types
export interface Hotel {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amenities?: HotelAmenity[];
  rooms?: Room[];
  _count?: {
    rooms: number;
    reviews: number;
  };
}

export interface HotelAmenity {
  id: string;
  name: string;
  icon?: string;
}

// Room types
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'FAMILY' | 'DELUXE';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  hotel?: {
    name: string;
  };
  amenities?: RoomAmenity[];
  bookings?: Booking[];
}

export interface RoomAmenity {
  id: string;
  name: string;
  icon?: string;
}

// Booking types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
  id: string;
  hotelId: string;
  roomId: string;
  customerId: string;
  staffId?: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  hotel?: Hotel;
  customer?: User;
  staff?: {
    firstName: string;
    lastName: string;
  };
  payments?: Payment[];
  reviews?: Review[];
}

// Payment types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  transactionId?: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

// Review types
export interface Review {
  id: string;
  bookingId?: string;
  hotelId?: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

export interface CreateHotelFormData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  amenities?: string[];
}

export interface CreateRoomFormData {
  hotelId: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  capacity: number;
  description?: string;
  amenities?: string[];
}

export interface CreateBookingFormData {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
}
