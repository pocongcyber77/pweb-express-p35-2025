import { Request, Response } from 'express';
import { ordersService } from '../services/transactions.service';
import { createOrderSchema, paginationSchema } from '../utils/validators';

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
      if (error.message === 'User not found') {
        return res.status(404).json({
          error: 'User not found',
        });
      }
      if (error.message === 'One or more books not found') {
        return res.status(404).json({
          error: 'One or more books not found',
        });
      }
      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          error: error.message,
        });
      }
      throw error;
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
    } catch (error) {
      throw error;
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
      if (error.message === 'Order not found') {
        return res.status(404).json({
          error: 'Order not found',
        });
      }
      throw error;
    }
  },

  async getStatistics(req: Request, res: Response) {
    try {
      const statistics = await ordersService.getStatistics();
      
      res.json({
        message: 'Order statistics retrieved successfully',
        data: statistics,
      });
    } catch (error) {
      throw error;
    }
  },
};
