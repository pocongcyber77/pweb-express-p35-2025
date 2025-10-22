import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      
      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          error: 'User with this email already exists',
        });
      }
      throw error;
    }
  },

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      
      res.json({
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          error: 'Invalid email or password',
        });
      }
      throw error;
    }
  },

  async getProfile(req: any, res: Response) {
    try {
      const user = await authService.getProfile(req.user.id);
      
      res.json({
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      throw error;
    }
  },
};
