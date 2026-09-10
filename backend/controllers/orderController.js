import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { emitNewOrder, emitOrderStatusUpdate } from '../config/socket.js';

export const createOrder = async (req, res) => {
  try {
    const { locationType, locationDetails, items, observations, total, uuid } = req.body;

    let calculatedTotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.getById(item.productId);
      if (!product) return res.status(400).json({ success: false, message: `Producto ${item.productId} no encontrado` });
      if (!product.active) return res.status(400).json({ success: false, message: `${product.name} no disponible` });

      const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
      if (!sizes[item.size]) return res.status(400).json({ success: false, message: `Tamaño ${item.size} no disponible` });

      const unitPrice = sizes[item.size];
      const subtotal  = unitPrice * item.quantity;
      calculatedTotal += subtotal;
      enrichedItems.push({
        productId:   product.id,
        productName: `${product.name} — ${item.size}`,
        size:        item.size,
        flavors:     item.flavors || [],
        quantity:    item.quantity,
        unitPrice,
        subtotal,
      });
    }

    if (Math.abs(calculatedTotal - total) > 0.05)
      return res.status(400).json({ success: false, message: 'Total no coincide' });

    const order = await Order.create(
      { locationType, locationDetails, items: enrichedItems, observations, total: calculatedTotal, uuid },
      req.user.userId
    );

    const fullOrder = await Order.getById(order.id);
    emitNewOrder(fullOrder);
    res.status(201).json({ success: true, data: fullOrder });
  } catch (err) {
    if (err.code === 'DUPLICATE_ORDER')
      return res.status(409).json({ success: false, message: 'Pedido ya sincronizado' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear pedido' });
  }
};

export const getOrders = async (req, res) => {
  const result = await Order.getAll({
    status:    req.query.status,
    jaladorId: req.user.role === 'jalador' ? req.user.userId : req.query.jaladorId,
    search:    req.query.search,
    startDate: req.query.startDate,
    endDate:   req.query.endDate,
    limit:     parseInt(req.query.limit)  || 50,
    offset:    parseInt(req.query.offset) || 0,
  });
  res.json({ success: true, data: result.orders, pagination: { total: result.total } });
};

export const getOrderById = async (req, res) => {
  const order = await Order.getById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'No encontrado' });
  if (req.user.role === 'jalador' && order.created_by !== req.user.userId)
    return res.status(403).json({ success: false, message: 'Sin permiso' });
  res.json({ success: true, data: order });
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.getById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'No encontrado' });

    const valid = { pendiente:['preparando','cancelado'], preparando:['listo','cancelado'], listo:['entregado','cancelado'], entregado:[], cancelado:[] };
    if (!valid[order.status].includes(status))
      return res.status(400).json({ success: false, message: `No se puede pasar de ${order.status} a ${status}` });

    await Order.updateStatus(req.params.id, status, req.user.userId, notes);
    const updated = await Order.getById(req.params.id);
    emitOrderStatusUpdate(updated);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar' });
  }
};

export const getDailyStats       = async (req, res) => res.json({ success: true, data: await Order.getDailyStats(req.query.date ? new Date(req.query.date) : new Date()) });
export const getTopProducts       = async (req, res) => res.json({ success: true, data: await Order.getTopProducts(parseInt(req.query.limit) || 10) });
export const getJaladorPerformance = async (req, res) => res.json({ success: true, data: await Order.getJaladorPerformance() });

export default { createOrder, getOrders, getOrderById, updateOrderStatus, getDailyStats, getTopProducts, getJaladorPerformance };
