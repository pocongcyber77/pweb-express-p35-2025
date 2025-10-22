import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists',
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Record not found',
          message: 'The requested record was not found',
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Foreign key constraint',
          message: 'Invalid reference to related record',
        });
      default:
        return res.status(400).json({
          error: 'Database error',
          message: 'An error occurred while processing your request',
        });
    }
  }

  // Custom application errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};
