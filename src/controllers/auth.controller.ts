import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';

// Helper function to handle common service errors
function handleServiceError(res: Response, error: any): Response {
    const message = error.message;

    // Error: Not Found (e.g., User ID tidak ditemukan)
    if (message.includes('not found')) {
        return res.status(404).json({ error: message });
    }
    
    // Error: Conflict (e.g., email sudah ada saat register)
    if (message.includes('already exists')) {
        return res.status(409).json({ error: message });
    }

    // Error: Unauthorized (e.g., login gagal)
    if (message.includes('Invalid email or password')) {
        return res.status(401).json({ error: message });
    }
    
    // Default: Internal Server Error (jika error tidak dikenali)
    console.error('Unhandled Controller Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
}

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
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
    }
  },
};
