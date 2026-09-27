import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getAvailableRooms
} from '../services/room.service';

const router = express.Router();

// Create room schema
const createRoomSchema = z.object({
  body: z.object({
    hotelId: z.string().uuid(),
    roomNumber: z.string().min(1),
    type: z.enum(['SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE']),
    price: z.number().positive(),
    capacity: z.number().int().min(1),
    description: z.string().optional(),
    amenities: z.array(z.string()).optional()
  })
});

// Update room schema
const updateRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1).optional(),
    type: z.enum(['SINGLE', 'DOUBLE', 'SUITE', 'FAMILY', 'DELUXE']).optional(),
    price: z.number().positive().optional(),
    capacity: z.number().int().min(1).optional(),
    description: z.string().optional(),
    isAvailable: z.boolean().optional()
  })
});

// Get all rooms for a hotel
router.get('/hotel/:hotelId', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await getAllRooms(req.params.hotelId, page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Get room by ID
router.get('/:id', async (req, res, next) => {
  try {
    const room = await getRoomById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'Room not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: room
    });
  } catch (error: any) {
    next(error);
  }
});

// Get available rooms for a hotel
router.get('/hotel/:hotelId/available', async (req, res, next) => {
  try {
    const checkInDate = new Date(req.query.checkInDate as string);
    const checkOutDate = new Date(req.query.checkOutDate as string);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
      });
    }
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const rooms = await getAvailableRooms(req.params.hotelId, checkInDate, checkOutDate);
    res.status(200).json({
      status: 'success',
      data: rooms
    });
  } catch (error: any) {
    next(error);
  }
});

// Create room (HOTEL_ADMIN or PLATFORM_ADMIN only)
router.post('/', authenticate, authorize([UserRole.HOTEL_ADMIN, UserRole.PLATFORM_ADMIN]),
  validateRequest(createRoomSchema),
  async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const room = await createRoom(req.body, req.user.userId);
      res.status(201).json({
        status: 'success',
        data: room
      });
    } catch (error: any) {
      next(error);
    }
  }
);

// Update room
router.patch('/:id', authenticate, validateRequest(updateRoomSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const room = await updateRoom(req.params.id, req.body, req.user.userId);
    
    if (!room) {
      return res.status(404).json({
        status: 'fail',
        message: 'Room not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: room
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete room
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await deleteRoom(req.params.id, req.user.userId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
