import { Request, Response } from 'express';
import { genreService } from '../services/genre.service';
import { createGenreSchema, updateGenreSchema, paginationSchema } from '../utils/validators';

export const genreController = {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createGenreSchema.parse(req.body);
      const genre = await genreService.create(validatedData);
      
      res.status(201).json({
        message: 'Genre created successfully',
        data: genre,
      });
    } catch (error: any) {
      if (error.message === 'Genre with this name already exists') {
        return res.status(400).json({
          error: 'Genre with this name already exists',
        });
      }
      throw error;
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const { page, limit } = paginationSchema.parse(req.query);
      const result = await genreService.findAll(page, limit);
      
      res.json({
        message: 'Genres retrieved successfully',
        data: result.genres,
        pagination: result.pagination,
      });
    } catch (error) {
      throw error;
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const { genre_id } = req.params;
      const genre = await genreService.findById(genre_id);
      
      res.json({
        message: 'Genre retrieved successfully',
        data: genre,
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
      const { genre_id } = req.params;
      const validatedData = updateGenreSchema.parse(req.body);
      const genre = await genreService.update(genre_id, validatedData);
      
      res.json({
        message: 'Genre updated successfully',
        data: genre,
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

  async delete(req: Request, res: Response) {
    try {
      const { genre_id } = req.params;
      const result = await genreService.delete(genre_id);
      
      res.json({
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === 'Genre not found') {
        return res.status(404).json({
          error: 'Genre not found',
        });
      }
      if (error.message === 'Cannot delete genre with existing books') {
        return res.status(400).json({
          error: 'Cannot delete genre with existing books',
        });
      }
      throw error;
    }
  },
};
