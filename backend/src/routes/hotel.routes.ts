import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} from '../services/hotel.service';

const router = express.Router();

// Create hotel schema
const createHotelSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    amenities: z.array(z.string()).optional()
  })
});

// Update hotel schema
const updateHotelSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional()
  })
});

// Get all hotels
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await getAllHotels(page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Get hotel by ID
router.get('/:id', async (req, res, next) => {
  try {
    const hotel = await getHotelById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hotel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: hotel
    });
  } catch (error: any) {
    next(error);
  }
});

// Create hotel (HOTEL_ADMIN or PLATFORM_ADMIN only)
router.post('/', authenticate, authorize([UserRole.HOTEL_ADMIN, UserRole.PLATFORM_ADMIN]),
  validateRequest(createHotelSchema),
  async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const hotel = await createHotel(req.body, req.user.userId);
      res.status(201).json({
        status: 'success',
        data: hotel
      });
    } catch (error: any) {
      next(error);
    }
  }
);

// Update hotel
router.patch('/:id', authenticate, validateRequest(updateHotelSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hotel = await updateHotel(req.params.id, req.body, req.user.userId);
    
    if (!hotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hotel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: hotel
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete hotel
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await deleteHotel(req.params.id, req.user.userId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
