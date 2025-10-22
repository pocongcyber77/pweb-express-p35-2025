import { prisma } from '../prisma/client';
import { getPagination, getSkip, PaginationResult } from '../utils/pagination';

export interface CreateBookData {
  title: string;
  writer: string;
  publisher: string;
  publication_year: number;
  description?: string;
  price: number;
  stock_quantity: number;
  genre_id: string;
}

export interface UpdateBookData {
  title?: string;
  writer?: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  price?: number;
  stock_quantity?: number;
  genre_id?: string;
}

export interface BookFilters {
  search?: string;
  genre_id?: string;
}

export interface BookListResult {
  books: any[];
  pagination: PaginationResult;
}

export const booksService = {
  async create(data: CreateBookData) {
    // Check if genre exists
    const genre = await prisma.genre.findUnique({
      where: { id: data.genre_id },
    });

    if (!genre) {
      throw new Error('Genre not found');
    }

    const book = await prisma.book.create({
      data: {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        genre: true,
      },
    });

    return book;
  },

  async findAll(page: number, limit: number, filters: BookFilters = {}): Promise<BookListResult> {
    const { search, genre_id } = filters;
    const skip = getSkip(page, limit);

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { writer: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (genre_id) {
      where.genre_id = genre_id;
    }

    // Get books with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          genre: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    const pagination = getPagination(page, limit, total);

    return { books, pagination };
  },

  async findById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
      },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  },

  async findByGenre(genre_id: string, page: number, limit: number): Promise<BookListResult> {
    const skip = getSkip(page, limit);

    // Check if genre exists
    const genre = await prisma.genre.findUnique({
      where: { id: genre_id },
    });

    if (!genre) {
      throw new Error('Genre not found');
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { genre_id },
        include: {
          genre: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.book.count({ where: { genre_id } }),
    ]);

    const pagination = getPagination(page, limit, total);

    return { books, pagination };
  },

  async update(id: string, data: UpdateBookData) {
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new Error('Book not found');
    }

    // If genre_id is being updated, check if new genre exists
    if (data.genre_id && data.genre_id !== existingBook.genre_id) {
      const genre = await prisma.genre.findUnique({
        where: { id: data.genre_id },
      });

      if (!genre) {
        throw new Error('Genre not found');
      }
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        genre: true,
      },
    });

    return book;
  },

  async delete(id: string) {
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    // Check if book has any order items
    const orderItems = await prisma.orderItem.findFirst({
      where: { book_id: id },
    });

    if (orderItems) {
      throw new Error('Cannot delete book with existing orders');
    }

    await prisma.book.delete({
      where: { id },
    });

    return { message: 'Book deleted successfully' };
  },
};
