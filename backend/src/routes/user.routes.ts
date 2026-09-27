import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import prisma from '../utils/prisma';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStaffByHotel,
  assignStaffToHotel
} from '../services/user.service';

const router = express.Router();

// Update user schema
const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    isActive: z.boolean().optional()
  })
});

// Get all users (PLATFORM_ADMIN only)
router.get('/', authenticate, authorize([UserRole.PLATFORM_ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await getAllUsers(page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Get current user's staff by hotel (HOTEL_ADMIN only)
router.get('/staff/hotel/:hotelId', authenticate, authorize([UserRole.HOTEL_ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify hotel belongs to admin
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.hotelId }
    });
    
    if (!hotel || hotel.adminId !== req.user.userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized to access staff for this hotel'
      });
    }
    
    const staff = await getStaffByHotel(req.params.hotelId);
    res.status(200).json({
      status: 'success',
      data: staff
    });
  } catch (error: any) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Users can only get their own info unless they're PLATFORM_ADMIN
    if (req.params.id !== req.user.userId && req.user.role !== UserRole.PLATFORM_ADMIN) {
      return res.status(403).json({
        status: 'fail',
        message: 'Unauthorized to access this user'
      });
    }
    
    const user = await getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    next(error);
  }
});

// Update user
router.patch('/:id', authenticate, validateRequest(updateUserSchema), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await updateUser(req.params.id, req.body, req.user.userId, req.user.role);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete user
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    await deleteUser(req.params.id, req.user.userId, req.user.role);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error: any) {
    next(error);
  }
});

// Assign staff to hotel (HOTEL_ADMIN or PLATFORM_ADMIN only)
router.post('/:staffId/assign-hotel/:hotelId', authenticate, authorize([UserRole.HOTEL_ADMIN, UserRole.PLATFORM_ADMIN]), async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await assignStaffToHotel(req.params.staffId, req.params.hotelId, req.user.userId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
