import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Función para obtener la IP real del cliente
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.socket.remoteAddress ||
         req.connection.remoteAddress ||
         'Unknown';
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Falta usuario o contraseña' });

    const user = await User.getByUsername(username);
    if (!user || !user.active)
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });

    const ok = await User.verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });

    // Capturar y guardar IP
    const ip = getClientIP(req);
    await User.updateLoginInfo(user.id, ip);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ 
      success: true, 
      data: { 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          username: user.username, 
          role: user.role,
          last_ip: ip
        } 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.getById(req.user.userId);
  if (!user) return res.status(404).json({ success: false, message: 'No encontrado' });
  res.json({ success: true, data: user });
};

export const verifyToken = async (req, res) => {
  const user = await User.getById(req.user.userId);
  if (!user || !user.active) return res.status(403).json({ success: false, message: 'Inactivo' });
  res.json({ success: true, data: { user: { id: user.id, name: user.name, username: user.username, role: user.role } } });
};

export default { login, getProfile, verifyToken };
