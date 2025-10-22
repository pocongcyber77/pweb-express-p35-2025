import { Request, Response } from 'express';
import { booksService } from '../services/books.service';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../utils/validators';

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
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          error: 'Genre not found',
        });
      }
      throw error;
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
      throw error;
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
      if (error.message === 'Book not found') {
        return res.status(404).json({
          error: 'Book not found',
        });
      }
      throw error;
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
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          error: 'Genre not found',
        });
      }
      throw error;
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
      if (error.message === 'Book not found') {
        return res.status(404).json({
          error: 'Book not found',
        });
      }
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          error: 'Genre not found',
        });
      }
      throw error;
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
      if (error.message === 'Book not found') {
        return res.status(404).json({
          error: 'Book not found',
        });
      }
      if (error.message === 'Cannot delete book with existing transactions') {
        return res.status(400).json({
          error: 'Cannot delete book with existing transactions',
        });
      }
      throw error;
    }
  },
};
