import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { UserRole } from '@prisma/client';

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const updateUser = async (id: string, input: UpdateUserInput, currentUserId: string, currentUserRole: UserRole) => {
  // Check permissions
  if (id !== currentUserId && currentUserRole !== UserRole.PLATFORM_ADMIN) {
    throw new Error('Unauthorized to update this user');
  }

  const data: any = { ...input };

  // Hash password if provided
  if (input.password) {
    data.password = await hashPassword(input.password);
    delete data.password;
  }

  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });
};

export const deleteUser = async (id: string, currentUserId: string, currentUserRole: UserRole) => {
  // Check permissions
  if (id !== currentUserId && currentUserRole !== UserRole.PLATFORM_ADMIN) {
    throw new Error('Unauthorized to delete this user');
  }

  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true
    }
  });
};

export const getStaffByHotel = async (hotelId: string) => {
  return await prisma.user.findMany({
    where: {
      role: UserRole.STAFF,
      staffBookings: { some: { hotelId } }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true
    }
  });
};

export const assignStaffToHotel = async (staffId: string, hotelId: string, adminId: string) => {
  // Verify admin is HOTEL_ADMIN or PLATFORM_ADMIN
  const admin = await prisma.user.findUnique({
    where: { id: adminId }
  });

  if (!admin || ![UserRole.PLATFORM_ADMIN, UserRole.HOTEL_ADMIN].includes(admin.role)) {
    throw new Error('Unauthorized');
  }

  // Verify hotel belongs to admin
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId }
  });

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  if (hotel.adminId !== adminId && admin.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error('Unauthorized to assign staff to this hotel');
  }

  // Update staff's bookings to include this hotel
  // This is a simplified approach - in a real system, you'd have a many-to-many relationship
  return await prisma.user.update({
    where: { id: staffId },
    data: { role: UserRole.STAFF },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true
    }
  });
};
