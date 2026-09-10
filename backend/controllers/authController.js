import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });

    const user = User.getByEmail(email);
    if (!user || !user.active)
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const ok = await User.verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
};

export const getProfile = async (req, res) => {
  const user = User.getById(req.user.userId);
  if (!user) return res.status(404).json({ success: false, message: 'No encontrado' });
  res.json({ success: true, data: user });
};

export const verifyToken = async (req, res) => {
  const user = User.getById(req.user.userId);
  if (!user || !user.active) return res.status(403).json({ success: false, message: 'Inactivo' });
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
};

export default { login, getProfile, verifyToken };
