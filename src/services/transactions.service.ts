import { prisma } from '../prisma/client';
import { getPagination, getSkip, PaginationResult } from '../utils/pagination';

export interface CreateOrderData {
  user_id: string;
  items: Array<{
    book_id: string;
    quantity: number;
  }>;
}

export interface OrderListResult {
  orders: any[];
  pagination: PaginationResult;
}

export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  mostPopularGenre: {
    genre_id: string;
    genreName: string;
    orderCount: number;
  } | null;
  leastPopularGenre: {
    genre_id: string;
    genreName: string;
    orderCount: number;
  } | null;
}

export const ordersService = {
  async create(data: CreateOrderData) {
    const { user_id, items } = data;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Validate all books exist and have sufficient stock
      const bookIds = items.map(item => item.book_id);
      const books = await tx.book.findMany({
        where: { id: { in: bookIds } },
      });

      if (books.length !== bookIds.length) {
        throw new Error('One or more books not found');
      }

      // Check stock availability
      for (const item of items) {
        const book = books.find((b: any) => b.id === item.book_id);
        if (!book) {
          throw new Error(`Book with ID ${item.book_id} not found`);
        }
        if (book.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for book: ${book.title}`);
        }
      }

      // Calculate total
      let total = 0;
      const transactionItems = [];

      for (const item of items) {
        const book = books.find((b: any) => b.id === item.book_id)!;
        const itemTotal = book.price.mul(item.quantity);
        total += itemTotal.toNumber();

        transactionItems.push({
          book_id: item.book_id,
          quantity: item.quantity,
        });
      }

      // Create order
      const order = await tx.order.create({
        data: {
          user_id,
          created_at: new Date(),
          updated_at: new Date(),
          items: {
            create: transactionItems.map(item => ({
              ...item,
              created_at: new Date(),
              updated_at: new Date(),
            })),
          },
        },
        include: {
          items: {
            include: {
              book: {
                include: {
                  genre: true,
                },
              },
            },
          },
        },
      });

      // Update stock for all books
      for (const item of items) {
        await tx.book.update({
          where: { id: item.book_id },
          data: {
            stock_quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return result;
  },

  async findAll(page: number, limit: number): Promise<OrderListResult> {
    const skip = getSkip(page, limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          items: {
            include: {
              book: {
                include: {
                  genre: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    const pagination = getPagination(page, limit, total);

    return { orders, pagination };
  },

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        items: {
          include: {
            book: {
              include: {
                genre: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  },

  async getStatistics(): Promise<OrderStatistics> {
    const [
      totalOrders,
      totalRevenue,
      genreStats,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.orderItem.groupBy({
        by: ['book_id'],
        _count: { book_id: true },
      }),
    ]);

    const revenue = totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0;
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

    // Group by genre
    const genreCounts = new Map<string, { name: string; count: number }>();
    
    // Get book-genre relationships for statistics
    const bookGenreMap = new Map();
    const books = await prisma.book.findMany({
      select: {
        id: true,
        genre: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    books.forEach(book => {
      bookGenreMap.set(book.id, book.genre);
    });
    
    for (const stat of genreStats) {
      const bookGenre = bookGenreMap.get(stat.book_id);
      if (bookGenre) {
        const genre_id = bookGenre.id;
        const genreName = bookGenre.name;
        const currentCount = genreCounts.get(genre_id)?.count || 0;
        genreCounts.set(genre_id, {
          name: genreName,
          count: currentCount + stat._count.book_id,
        });
      }
    }

    const genreArray = Array.from(genreCounts.entries()).map(([genre_id, data]) => ({
      genre_id,
      genreName: data.name,
      orderCount: data.count,
    }));

    const sortedGenres = genreArray.sort((a, b) => a.orderCount - b.orderCount);

    return {
      totalOrders,
      totalRevenue: Number(revenue),
      averageOrderValue: Number(averageOrderValue),
      mostPopularGenre: sortedGenres.length > 0 ? sortedGenres[sortedGenres.length - 1] : null,
      leastPopularGenre: sortedGenres.length > 0 ? sortedGenres[0] : null,
    };
  },
};
