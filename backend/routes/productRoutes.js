import express from 'express';
import {
  createProduct, getProducts, getFlavors,
  getProductById, updateProduct, deleteProduct, activateProduct
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateCreateProduct } from '../middleware/validation.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación) - jaladores necesitan ver productos
router.get('/',        getProducts);
router.get('/flavors', getFlavors);
router.get('/:id',     getProductById);

// Rutas protegidas (solo administrador)
router.post('/',              authenticateToken, authorizeRoles('administrador'), validateCreateProduct, createProduct);
router.put('/:id',            authenticateToken, authorizeRoles('administrador'), updateProduct);
router.delete('/:id',         authenticateToken, authorizeRoles('administrador'), deleteProduct);
router.patch('/:id/activate', authenticateToken, authorizeRoles('administrador'), activateProduct);

export default router;
