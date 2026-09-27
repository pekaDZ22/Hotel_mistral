import prisma from '../utils/prisma';
import { UserRole } from '@prisma/client';

export interface CreateHotelInput {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  amenities?: string[];
}

export interface UpdateHotelInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const createHotel = async (input: CreateHotelInput, adminId: string) => {
  // Verify admin is PLATFORM_ADMIN or HOTEL_ADMIN
  const admin = await prisma.user.findUnique({
    where: { id: adminId }
  });

  if (!admin || ![UserRole.PLATFORM_ADMIN, UserRole.HOTEL_ADMIN].includes(admin.role)) {
    throw new Error('Unauthorized to create hotels');
  }

  const hotel = await prisma.hotel.create({
    data: {
      ...input,
      adminId
    },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  // Add amenities if provided
  if (input.amenities && input.amenities.length > 0) {
    await prisma.hotelAmenity.createMany({
      data: input.amenities.map(name => ({
        name,
        hotelId: hotel.id
      }))
    });
  }

  return hotel;
};

export const getAllHotels = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      skip,
      take: limit,
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        amenities: true,
        _count: {
          select: {
            rooms: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.hotel.count()
  ]);

  return {
    hotels,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getHotelById = async (id: string) => {
  return await prisma.hotel.findUnique({
    where: { id },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      rooms: {
        include: {
          amenities: true,
          bookings: {
            where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } }
          }
        }
      },
      amenities: true,
      reviews: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
};

export const updateHotel = async (id: string, input: UpdateHotelInput, userId: string) => {
  // Check if user is admin of this hotel or PLATFORM_ADMIN
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { admin: true }
  });

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  if (hotel.adminId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== UserRole.PLATFORM_ADMIN) {
      throw new Error('Unauthorized to update this hotel');
    }
  }

  return await prisma.hotel.update({
    where: { id },
    data: input,
    include: {
      amenities: true,
      admin: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });
};

export const deleteHotel = async (id: string, userId: string) => {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: { admin: true }
  });

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  if (hotel.adminId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== UserRole.PLATFORM_ADMIN) {
      throw new Error('Unauthorized to delete this hotel');
    }
  }

  return await prisma.hotel.delete({
    where: { id }
  });
};
