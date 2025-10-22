import { Router } from 'express';
import { booksController } from '../controllers/books.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All book routes require authentication
router.use(authenticateToken);

// Book CRUD operations
router.post('/', booksController.create);
router.get('/', booksController.findAll);
router.get('/:book_id', booksController.findById);
router.get('/genre/:genre_id', booksController.findByGenre);
router.patch('/:book_id', booksController.update);
router.delete('/:book_id', booksController.delete);

export default router;
