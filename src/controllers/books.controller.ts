import { Request, Response } from 'express';
import { booksService } from '../services/books.service';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../utils/validators';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { prisma } from '../prisma/client';

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

    // Error: Not Found (e.g., ID tidak ditemukan)
    if (message.includes('not found') || message.includes('ID is invalid')) {
        return res.status(404).json({ error: message });
    }
    
    // Error: Bad Request (e.g., duplikat title, price/stock quantity invalid, tidak bisa dihapus karena relasi)
    if (message.includes('already exists') || message.includes('Cannot delete') || message.includes('non-negative') || message.includes('integer') || message.includes('is required')) {
        return res.status(400).json({ error: message });
    }

    // Default: Internal Server Error (jika error tidak dikenali)
    console.error('Unhandled Controller Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
}

export const booksController = {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createBookSchema.parse(req.body);
      const book = await booksService.create(validatedData);
      
      res.status(201).json({
        message: 'Book created successfully',
        data: book,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const { page, limit, search, genre_id } = bookQuerySchema.parse(req.query);
      const result = await booksService.findAll(page, limit, { search, genre_id });
      
      res.json({
        message: 'Books retrieved successfully',
        data: result.books,
        pagination: result.pagination,
      });
    } catch (error) {
      return handleServiceError(res, error);
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const { book_id } = req.params;
      const book = await booksService.findById(book_id);
      
      res.json({
        message: 'Book retrieved successfully',
        data: book,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async findByGenre(req: Request, res: Response) {
    try {
      const { genre_id } = req.params;
      const { page, limit } = bookQuerySchema.parse(req.query);
      const result = await booksService.findByGenre(genre_id, page, limit);
      
      res.json({
        message: 'Books by genre retrieved successfully',
        data: result.books,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { book_id } = req.params;
      const validatedData = updateBookSchema.parse(req.body);
      const book = await booksService.update(book_id, validatedData);
      
      res.json({
        message: 'Book updated successfully',
        data: book,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { book_id } = req.params;
      const result = await booksService.delete(book_id);
      
      res.json({
        message: result.message,
      });
    } catch (error: any) {
      return handleServiceError(res, error);
    }
  },
};
