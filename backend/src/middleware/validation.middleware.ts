import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      return res.status(400).json({
        status: 'fail',
        errors: error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
    }
  };
};
