import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Genre validators
export const createGenreSchema = z.object({
  name: z.string().min(1, 'Genre name is required'),
  description: z.string().optional(),
});

export const updateGenreSchema = z.object({
  name: z.string().min(1, 'Genre name is required').optional(),
  description: z.string().optional(),
});

// Book validators
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  writer: z.string().min(1, 'Writer is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  publication_year: z.number().int().positive('Publication year must be positive'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  genre_id: z.string().min(1, 'Genre ID is required'),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  writer: z.string().min(1, 'Writer is required').optional(),
  publisher: z.string().min(1, 'Publisher is required').optional(),
  publication_year: z.number().int().positive('Publication year must be positive').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative').optional(),
  genre_id: z.string().min(1, 'Genre ID is required').optional(),
});

// Transaction validators
export const createOrderSchema = z.object({
  items: z.array(z.object({
    book_id: z.string().min(1, 'Book ID is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'At least one item is required'),
});

// Query validators
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
});

export const bookQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
  search: z.string().optional(),
  genre_id: z.string().optional(),
});
