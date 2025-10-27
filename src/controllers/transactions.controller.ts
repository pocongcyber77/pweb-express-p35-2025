import { Request, Response } from 'express';
import { ordersService } from '../services/transactions.service';
import { createOrderSchema, paginationSchema } from '../utils/validators';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// Helper function to handle common service errors
function handleServiceError(res: Response, error: any): Response {
    const message = error.message;

    if (error instanceof ZodError) {
        // Zod validation failed. Return a detailed 400 Bad Request.
        const issues = error.errors.map(err => {
            // Mengambil path (field) yang error dan pesan errornya
            const path = err.path.join('.');
            return `${path}: ${err.message}`;
        }).join('; ');

        return res.status(400).json({ 
            error: 'Validation failed', 
            details: issues 
        });
    }
    
    // Error: Not Found (e.g., User/Book/Order ID tidak ditemukan/invalid)
    if (message.includes('not found') || message.includes('ID is invalid')) {
        return res.status(404).json({ error: message });
    }
    
    // Error: Bad Request (e.g., Stok tidak cukup, quantity invalid, order kosong)
    if (message.includes('Insufficient stock') || message.includes('must be a positive integer') || message.includes('must contain at least one item')) {
        return res.status(400).json({ error: message });
    }

    // Default: Internal Server Error (jika error tidak dikenali)
    console.error('Unhandled Controller Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
}

export const ordersController = {
  async create(req: any, res: Response) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const order = await ordersService.create({
        user_id: req.user.id,
        items: validatedData.items,
      });
      
      res.status(201).json({
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await ordersService.findAll(page, limit);
      
      res.json({
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const { order_id } = req.params;
      const order = await ordersService.findById(order_id);
      
      res.json({
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async getStatistics(req: Request, res: Response) {
    try {
      const statistics = await ordersService.getStatistics();
      
      res.json({
        message: 'Order statistics retrieved successfully',
        data: statistics,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },
};
