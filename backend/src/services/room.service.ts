import prisma from '../utils/prisma';
import { RoomType } from '@prisma/client';

export interface CreateRoomInput {
  hotelId: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  capacity: number;
  description?: string;
  amenities?: string[];
}

export interface UpdateRoomInput {
  roomNumber?: string;
  type?: RoomType;
  price?: number;
  capacity?: number;
  description?: string;
  isAvailable?: boolean;
}

export const createRoom = async (input: CreateRoomInput, userId: string) => {
  // Verify user is admin of this hotel
  const hotel = await prisma.hotel.findUnique({
    where: { id: input.hotelId }
  });

  if (!hotel) {
    throw new Error('Hotel not found');
  }

  if (hotel.adminId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'PLATFORM_ADMIN') {
      throw new Error('Unauthorized to create rooms for this hotel');
    }
  }

  // Check if room number already exists in this hotel
  const existingRoom = await prisma.room.findFirst({
    where: {
      hotelId: input.hotelId,
      roomNumber: input.roomNumber
    }
  });

  if (existingRoom) {
    throw new Error('Room number already exists in this hotel');
  }

  const room = await prisma.room.create({
    data: {
      hotelId: input.hotelId,
      roomNumber: input.roomNumber,
      type: input.type,
      price: input.price,
      capacity: input.capacity,
      description: input.description
    },
    include: {
      hotel: {
        select: {
          name: true
        }
      }
    }
  });

  // Add amenities if provided
  if (input.amenities && input.amenities.length > 0) {
    await prisma.roomAmenity.createMany({
      data: input.amenities.map(name => ({
        name,
        roomId: room.id
      }))
    });
  }

  return room;
};

export const getAllRooms = async (hotelId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where: { hotelId },
      skip,
      take: limit,
      include: {
        amenities: true,
        hotel: {
          select: {
            name: true
          }
        },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
          select: {
            id: true,
            checkInDate: true,
            checkOutDate: true,
            status: true
          }
        }
      },
      orderBy: { roomNumber: 'asc' }
    }),
    prisma.room.count({ where: { hotelId } })
  ]);

  return {
    rooms,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getRoomById = async (id: string) => {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      hotel: true,
      amenities: true,
      bookings: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { checkInDate: 'desc' }
      }
    }
  });
};

export const updateRoom = async (id: string, input: UpdateRoomInput, userId: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { hotel: true }
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.hotel.adminId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'PLATFORM_ADMIN') {
      throw new Error('Unauthorized to update this room');
    }
  }

  return await prisma.room.update({
    where: { id },
    data: input,
    include: {
      hotel: {
        select: {
          name: true
        }
      },
      amenities: true
    }
  });
};

export const deleteRoom = async (id: string, userId: string) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { hotel: true }
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.hotel.adminId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'PLATFORM_ADMIN') {
      throw new Error('Unauthorized to delete this room');
    }
  }

  return await prisma.room.delete({
    where: { id }
  });
};

export const getAvailableRooms = async (hotelId: string, checkInDate: Date, checkOutDate: Date) => {
  // Find rooms that don't have conflicting bookings
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      room: { hotelId },
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        {
          checkInDate: { lte: checkOutDate },
          checkOutDate: { gte: checkInDate }
        }
      ]
    },
    select: { roomId: true }
  });

  const conflictingRoomIds = conflictingBookings.map(b => b.roomId);

  return await prisma.room.findMany({
    where: {
      hotelId,
      id: { notIn: conflictingRoomIds },
      isAvailable: true
    },
    include: {
      amenities: true,
      hotel: {
        select: {
          name: true
        }
      }
    }
  });
};
