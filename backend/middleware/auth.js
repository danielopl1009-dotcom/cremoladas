import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'No autenticado' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Sin permisos para esta acción' });
  next();
};

export const checkUserActive = async (req, res, next) => {
  try {
    const result = await query('SELECT active FROM users WHERE id=$1', [req.user.userId]);
    if (!result.rows.length || !result.rows[0].active)
      return res.status(403).json({ success: false, message: 'Usuario inactivo' });
    next();
  } catch {
    res.status(500).json({ success: false, message: 'Error de autenticación' });
  }
};

export default { authenticateToken, authorizeRoles, checkUserActive };
