import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { BookingStatus } from '@prisma/client';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from '../services/booking.service';

const router = express.Router();

// Create booking schema
const createBookingSchema = z.object({
  body: z.object({
    roomId: z.string().uuid(),
    checkInDate: z.string().transform(str => new Date(str)),
    checkOutDate: z.string().transform(str => new Date(str)),
    adults: z.number().int().min(1),
    children: z.number().int().min(0).default(0),
    specialRequests: z.string().optional()
  })
});

// Update booking schema
const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED', 
      'CHECKED_IN',
      'CHECKED_OUT',
      'CANCELLED',
      'REFUNDED'
    ]).optional(),
    paymentStatus: z.string().optional(),
    specialRequests: z.string().optional()
  })
});

// Get all bookings for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await getAllBookings(req.user.userId, req.user.role, page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const booking = await getBookingById(req.params.id, req.user.userId, req.user.role);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found or not authorized to access'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Create booking (CUSTOMER only)
router.post('/', authenticate, validateRequest(createBookingSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Only customers can create bookings
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only customers can create bookings'
      });
    }
    
    const booking = await createBooking(req.body, req.user.userId);
    res.status(201).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Update booking
router.patch('/:id', authenticate, validateRequest(updateBookingSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const booking = await updateBooking(req.params.id, req.body, req.user.userId, req.user.role);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found or not authorized to update'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete booking
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await deleteBooking(req.params.id, req.user.userId, req.user.role);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    next(error);
  }
});

// Confirm booking (for staff or hotel admin)
router.patch('/:id/confirm', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Only staff or hotel admin can confirm bookings
    if (!['STAFF', 'HOTEL_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized to confirm bookings'
      });
    }
    
    const booking = await updateBooking(
      req.params.id,
      { status: BookingStatus.CONFIRMED, staffId: req.user.userId },
      req.user.userId,
      req.user.role
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Check in booking
router.patch('/:id/checkin', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!['STAFF', 'HOTEL_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized to check in bookings'
      });
    }
    
    const booking = await updateBooking(
      req.params.id,
      { status: BookingStatus.CHECKED_IN },
      req.user.userId,
      req.user.role
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Check out booking
router.patch('/:id/checkout', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!['STAFF', 'HOTEL_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized to check out bookings'
      });
    }
    
    const booking = await updateBooking(
      req.params.id,
      { status: BookingStatus.CHECKED_OUT },
      req.user.userId,
      req.user.role
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const booking = await updateBooking(
      req.params.id,
      { status: BookingStatus.CANCELLED },
      req.user.userId,
      req.user.role
    );
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found or not authorized to cancel'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
