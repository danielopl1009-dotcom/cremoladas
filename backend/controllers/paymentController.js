import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import { emitOrderStatusUpdate } from '../config/socket.js';
import Order from '../models/Order.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Confirmar pago ─────────────────────────────────────────────────────────
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, notes } = req.body;

    // Validar método
    const VALID = ['efectivo', 'yape', 'plin', 'tarjeta'];
    if (!method || !VALID.includes(method)) {
      return res.status(400).json({ success: false, message: 'Método de pago inválido' });
    }

    // Si es Yape debe adjuntar foto
    if (method === 'yape' && !req.file) {
      return res.status(400).json({ success: false, message: 'Debes adjuntar la foto del Yape' });
    }

    // Verificar que el pedido existe
    const order = await Order.getById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    // Verificar que no esté ya pagado
    const existing = await query('SELECT id FROM payments WHERE order_id = $1', [orderId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Este pedido ya fue pagado' });
    }

    // URL de la foto si se subió
    const yapePhotoUrl = req.file
      ? `/uploads/yape/${req.file.filename}`
      : null;

    // Registrar el pago
    const result = await query(
      `INSERT INTO payments (order_id, method, amount, confirmed_by, yape_photo_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [orderId, method, order.total, req.user.userId, yapePhotoUrl, notes || null]
    );

    const payment = result[0];

    // Emitir evento en tiempo real para que todos vean el cambio
    const io = (await import('../config/socket.js')).getIO();
    io.emit('payment_confirmed', {
      orderId: parseInt(orderId),
      orderNumber: order.order_number,
      method,
      paidBy: req.user.name,
      paidAt: payment.confirmed_at,
    });

    res.status(201).json({
      success: true,
      message: 'Pago confirmado correctamente',
      data: payment,
    });
  } catch (err) {
    console.error('Error confirmando pago:', err);
    res.status(500).json({ success: false, message: 'Error al confirmar pago' });
  }
};

// ── Obtener pago de un pedido ──────────────────────────────────────────────
export const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await query(
      `SELECT p.*, u.name AS confirmed_by_name
       FROM payments p
       LEFT JOIN users u ON p.confirmed_by = u.id
       WHERE p.order_id = $1`,
      [orderId]
    );
    res.json({ success: true, data: result[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener pago' });
  }
};

// ── Obtener todos los pagos del día (para caja/admin) ─────────────────────
export const getDailyPayments = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const start = `${date} 00:00:00`;
    const end   = `${date} 23:59:59`;

    const result = await query(
      `SELECT p.*, o.order_number, o.total, o.location_type, o.location_details,
              u.name AS confirmed_by_name
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       LEFT JOIN users u ON p.confirmed_by = u.id
       WHERE p.confirmed_at BETWEEN $1 AND $2
       ORDER BY p.confirmed_at DESC`,
      [start, end]
    );

    const totals = await query(
      `SELECT method, COUNT(*) AS count, SUM(amount) AS total
       FROM payments
       WHERE confirmed_at BETWEEN $1 AND $2
       GROUP BY method`,
      [start, end]
    );

    res.json({
      success: true,
      data: result,
      totals: totals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener pagos' });
  }
};

export default { confirmPayment, getPaymentByOrder, getDailyPayments };
