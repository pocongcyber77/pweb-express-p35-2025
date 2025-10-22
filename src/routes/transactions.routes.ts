import { Router } from 'express';
import { ordersController } from '../controllers/transactions.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// Order operations
router.post('/', ordersController.create);
router.get('/', ordersController.findAll);
router.get('/statistics', ordersController.getStatistics);
router.get('/:order_id', ordersController.findById);

export default router;
