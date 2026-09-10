import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getDailyStats,
  getTopProducts,
  getJaladorPerformance
} from '../controllers/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateCreateOrder, validateUpdateOrderStatus } from '../middleware/validation.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear pedido - Solo jaladores
router.post(
  '/',
  authorizeRoles('jalador'),
  validateCreateOrder,
  createOrder
);

// Obtener pedidos - Todos los roles
router.get('/', getOrders);

// Obtener pedido por ID - Todos los roles
router.get('/:id', getOrderById);

// Actualizar estado — servidores, caja y administradores
router.patch(
  '/:id/status',
  authorizeRoles('servidor', 'caja', 'administrador'),
  validateUpdateOrderStatus,
  updateOrderStatus
);

// Estadísticas del día - Administradores y caja
router.get('/stats/daily', authorizeRoles('administrador', 'caja', 'servidor'), getDailyStats);
// Productos más vendidos
router.get('/stats/top-products', authorizeRoles('administrador', 'caja'), getTopProducts);
// Rendimiento de jaladores
router.get('/stats/jalador-performance', authorizeRoles('administrador', 'caja'), getJaladorPerformance);

export default router;
