import express from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser
} from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateRegisterUser } from '../middleware/validation.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authenticateToken);
router.use(authorizeRoles('administrador'));

// CRUD de usuarios
router.post('/', validateRegisterUser, createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deactivateUser);
router.patch('/:id/activate', activateUser);

export default router;
