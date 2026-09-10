import express from 'express';
import {
  createProduct, getProducts, getFlavors,
  getProductById, updateProduct, deleteProduct, activateProduct
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateCreateProduct } from '../middleware/validation.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/',            getProducts);
router.get('/flavors',     getFlavors);
router.get('/:id',         getProductById);
router.post('/',           authorizeRoles('administrador'), validateCreateProduct, createProduct);
router.put('/:id',         authorizeRoles('administrador'), updateProduct);
router.delete('/:id',      authorizeRoles('administrador'), deleteProduct);
router.patch('/:id/activate', authorizeRoles('administrador'), activateProduct);

export default router;
