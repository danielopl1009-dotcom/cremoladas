import express from 'express';
import { login, getProfile, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);
router.get('/verify', authenticateToken, verifyToken);

export default router;
