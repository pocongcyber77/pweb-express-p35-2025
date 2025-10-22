import { prisma } from '../prisma/client';
import { getPagination, getSkip, PaginationResult } from '../utils/pagination';

export interface CreateGenreData {
  name: string;
  description?: string;
}

export interface UpdateGenreData {
  name?: string;
  description?: string;
}

export interface GenreListResult {
  genres: any[];
  pagination: PaginationResult;
}

export const genreService = {
  async create(data: CreateGenreData) {
    const genre = await prisma.genre.create({
      data: {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return genre;
  },

  async findAll(page: number, limit: number): Promise<GenreListResult> {
    const skip = getSkip(page, limit);

    const [genres, total] = await Promise.all([
      prisma.genre.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.genre.count(),
    ]);

    const pagination = getPagination(page, limit, total);

    return { genres, pagination };
  },

  async findById(id: string) {
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            writer: true,
            price: true,
            stock_quantity: true,
          },
        },
      },
    });

    if (!genre) {
      throw new Error('Genre not found');
    }

    return genre;
  },

  async update(id: string, data: UpdateGenreData) {
    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      throw new Error('Genre not found');
    }

    const genre = await prisma.genre.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });

    return genre;
  },

  async delete(id: string) {
    // Check if genre exists
    const genre = await prisma.genre.findUnique({
      where: { id },
    });

    if (!genre) {
      throw new Error('Genre not found');
    }

    // Check if genre has any books
    const books = await prisma.book.findFirst({
      where: { genre_id: id },
    });

    if (books) {
      throw new Error('Cannot delete genre with existing books');
    }

    await prisma.genre.delete({
      where: { id },
    });

    return { message: 'Genre deleted successfully' };
  },
};
