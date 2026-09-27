import express from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.middleware';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Register schema
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'STAFF', 'HOTEL_ADMIN', 'PLATFORM_ADMIN']).optional()
  })
});

// Login schema
const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

// Register
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await getCurrentUser(req.user.userId);
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
