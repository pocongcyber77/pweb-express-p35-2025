import { Request, Response } from 'express';
import { genreService } from '../services/genre.service';
import { createGenreSchema, updateGenreSchema, paginationSchema } from '../utils/validators';

// Helper function to handle common service errors
function handleServiceError(res: Response, error: any): Response {
    const message = error.message;

    // Error: Not Found (e.g., ID tidak ditemukan)
    if (message.includes('not found') || message.includes('ID is invalid')) {
        return res.status(404).json({ error: message });
    }
    
    // Error: Bad Request (e.g., data input salah, duplikat nama, atau tidak bisa dihapus karena relasi)
    if (message.includes('already exists') || message.includes('Cannot delete') || message.includes('required') || message.includes('cannot be empty')) {
        return res.status(400).json({ error: message });
    }

    // Default: Internal Server Error (jika error tidak dikenali)
    console.error('Unhandled Controller Error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
}

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
      // Menangkap error validasi Zod atau service
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
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
      return handleServiceError(res, error);
    }
  },
};
