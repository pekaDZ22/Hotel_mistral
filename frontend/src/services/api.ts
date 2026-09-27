import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: any) => api.post<ApiResponse<any>>('/auth/register', data),
  login: (data: any) => api.post<ApiResponse<any>>('/auth/login', data),
  getMe: () => api.get<ApiResponse<any>>('/auth/me'),
};

// Hotel API
export const hotelApi = {
  getAll: (params?: { page?: number; limit?: number }) => 
    api.get<ApiResponse<any>>('/hotels', { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/hotels/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/hotels', data),
  update: (id: string, data: any) => api.patch<ApiResponse<any>>(`/hotels/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/hotels/${id}`),
};

// Room API
export const roomApi = {
  getByHotel: (hotelId: string, params?: { page?: number; limit?: number }) => 
    api.get<ApiResponse<any>>(`/rooms/hotel/${hotelId}`, { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/rooms/${id}`),
  getAvailable: (hotelId: string, checkInDate: string, checkOutDate: string) => 
    api.get<ApiResponse<any>>(`/rooms/hotel/${hotelId}/available`, { 
      params: { checkInDate, checkOutDate } 
    }),
  create: (data: any) => api.post<ApiResponse<any>>('/rooms', data),
  update: (id: string, data: any) => api.patch<ApiResponse<any>>(`/rooms/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/rooms/${id}`),
};

// Booking API
export const bookingApi = {
  getAll: (params?: { page?: number; limit?: number }) => 
    api.get<ApiResponse<any>>('/bookings', { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/bookings/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/bookings', data),
  update: (id: string, data: any) => api.patch<ApiResponse<any>>(`/bookings/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/bookings/${id}`),
  confirm: (id: string) => api.patch<ApiResponse<any>>(`/bookings/${id}/confirm`),
  checkIn: (id: string) => api.patch<ApiResponse<any>>(`/bookings/${id}/checkin`),
  checkOut: (id: string) => api.patch<ApiResponse<any>>(`/bookings/${id}/checkout`),
  cancel: (id: string) => api.patch<ApiResponse<any>>(`/bookings/${id}/cancel`),
};

// User API
export const userApi = {
  getAll: (params?: { page?: number; limit?: number }) => 
    api.get<ApiResponse<any>>('/users', { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/users/${id}`),
  update: (id: string, data: any) => api.patch<ApiResponse<any>>(`/users/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/users/${id}`),
  getStaffByHotel: (hotelId: string) => api.get<ApiResponse<any>>(`/users/staff/hotel/${hotelId}`),
};

export default api;
