import { Router } from 'express';
import { genreController } from '../controllers/genre.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All genre routes require authentication
router.use(authenticateToken);

// Genre CRUD operations
router.post('/', genreController.create);
router.get('/', genreController.findAll);
router.get('/:genre_id', genreController.findById);
router.patch('/:genre_id', genreController.update);
router.delete('/:genre_id', genreController.delete);

export default router;
