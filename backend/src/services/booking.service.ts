import prisma from '../utils/prisma';
import { BookingStatus } from '@prisma/client';

export interface CreateBookingInput {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  paymentStatus?: string;
  specialRequests?: string;
}

export const createBooking = async (input: CreateBookingInput, customerId: string) => {
  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
    include: { hotel: true }
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (!room.isAvailable) {
    throw new Error('Room is not available');
  }

  // Check for conflicting bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId: input.roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        {
          checkInDate: { lte: input.checkOutDate },
          checkOutDate: { gte: input.checkInDate }
        }
      ]
    }
  });

  if (conflictingBooking) {
    throw new Error('Room is already booked for the selected dates');
  }

  // Calculate total price
  const nights = Math.ceil(
    (input.checkOutDate.getTime() - input.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = room.price * nights * (input.adults + input.children * 0.5);

  const booking = await prisma.booking.create({
    data: {
      roomId: input.roomId,
      hotelId: room.hotelId,
      customerId,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      adults: input.adults,
      children: input.children,
      totalPrice,
      specialRequests: input.specialRequests,
      status: BookingStatus.PENDING
    },
    include: {
      room: {
        include: {
          hotel: true,
          amenities: true
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  // Update room availability
  await prisma.room.update({
    where: { id: input.roomId },
    data: { isAvailable: false }
  });

  return booking;
};

export const getAllBookings = async (userId: string, role: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  let whereClause = {};

  if (role === 'HOTEL_ADMIN') {
    // Get hotels managed by this admin
    const hotels = await prisma.hotel.findMany({
      where: { adminId: userId },
      select: { id: true }
    });
    const hotelIds = hotels.map(h => h.id);
    whereClause = { hotelId: { in: hotelIds } };
  } else if (role === 'STAFF') {
    whereClause = { staffId: userId };
  } else if (role === 'CUSTOMER') {
    whereClause = { customerId: userId };
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        room: {
          include: {
            hotel: {
              select: {
                name: true,
                city: true
              }
            }
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        staff: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        payments: true
      },
      orderBy: { checkInDate: 'desc' }
    }),
    prisma.booking.count({ where: whereClause })
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getBookingById = async (id: string, userId: string, role: string) => {
  let whereClause = { id };

  if (role === 'HOTEL_ADMIN') {
    const hotels = await prisma.hotel.findMany({
      where: { adminId: userId },
      select: { id: true }
    });
    const hotelIds = hotels.map(h => h.id);
    whereClause = { ...whereClause, hotelId: { in: hotelIds } };
  } else if (role === 'STAFF') {
    whereClause = { ...whereClause, staffId: userId };
  } else if (role === 'CUSTOMER') {
    whereClause = { ...whereClause, customerId: userId };
  }

  return await prisma.booking.findUnique({
    where: whereClause,
    include: {
      room: {
        include: {
          hotel: true,
          amenities: true
        }
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      staff: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      payments: true,
      reviews: true
    }
  });
};

export const updateBooking = async (id: string, input: UpdateBookingInput, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: true, hotel: true }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check permissions
  if (role === 'CUSTOMER' && booking.customerId !== userId) {
    throw new Error('Unauthorized to update this booking');
  }

  if (role === 'HOTEL_ADMIN' && booking.hotel.adminId !== userId) {
    throw new Error('Unauthorized to update this booking');
  }

  if (role === 'STAFF' && booking.staffId !== userId) {
    throw new Error('Unauthorized to update this booking');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: input,
    include: {
      room: {
        include: {
          hotel: true,
          amenities: true
        }
      },
      customer: {
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  // If booking is cancelled or checked out, make room available
  if ([BookingStatus.CANCELLED, BookingStatus.CHECKED_OUT, BookingStatus.REFUNDED].includes(input.status as BookingStatus)) {
    await prisma.room.update({
      where: { id: booking.roomId },
      data: { isAvailable: true }
    });
  }

  return updatedBooking;
};

export const deleteBooking = async (id: string, userId: string, role: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: true, hotel: true }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Check permissions
  if (role === 'CUSTOMER' && booking.customerId !== userId) {
    throw new Error('Unauthorized to delete this booking');
  }

  if (role === 'HOTEL_ADMIN' && booking.hotel.adminId !== userId) {
    throw new Error('Unauthorized to delete this booking');
  }

  if (role === 'STAFF' && booking.staffId !== userId) {
    throw new Error('Unauthorized to delete this booking');
  }

  // Make room available
  await prisma.room.update({
    where: { id: booking.roomId },
    data: { isAvailable: true }
  });

  return await prisma.booking.delete({
    where: { id }
  });
};
