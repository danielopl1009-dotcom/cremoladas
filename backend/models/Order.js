import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Order {
  // ── Crear ──────────────────────────────────────────────────────────────────
  static async create(orderData, userId) {
    const orderUuid = orderData.uuid || uuidv4();

    // Chequear duplicado
    const dup = await query('SELECT id FROM orders WHERE uuid=$1', [orderUuid]);
    if (dup.length > 0) { const e = new Error('DUPLICATE_ORDER'); e.code = 'DUPLICATE_ORDER'; throw e; }

    // Número de pedido
    const getNext = await query('SELECT current_value + 1 as next_val FROM order_number_seq');
    const nextVal = getNext[0] ? getNext[0].next_val : 1;
    await query('UPDATE order_number_seq SET current_value = $1', [nextVal]);
    const orderNumber = String(nextVal).padStart(3, '0');

    const orderResult = await query(
      `INSERT INTO orders (order_number,uuid,status,location_type,location_details,observations,total,created_by)
       VALUES ($1,$2,'pendiente',$3,$4,$5,$6,$7) RETURNING *`,
      [orderNumber, orderUuid, orderData.locationType,
       JSON.stringify(orderData.locationDetails), orderData.observations || null,
       orderData.total, userId]
    );
    const order = orderResult[0];

    for (const item of orderData.items) {
      await query(
        `INSERT INTO order_items (order_id,product_id,product_name,size,flavors,quantity,unit_price,subtotal)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [order.id, item.productId, item.productName, item.size,
         JSON.stringify(item.flavors || []),
         item.quantity, item.unitPrice, item.subtotal]
      );
    }

    await query(`INSERT INTO order_status_history (order_id,status,changed_by) VALUES ($1,'pendiente',$2)`,
      [order.id, userId]);

    return order;
  }

  // ── Obtener por ID ─────────────────────────────────────────────────────────
  static async getById(id) {
    const orderResult = await query(
      `SELECT o.*,u1.name AS jalador_name,u2.name AS updated_by_name,u3.name AS prepared_by_name,u4.name AS delivered_by_name
       FROM orders o
       LEFT JOIN users u1 ON o.created_by=u1.id LEFT JOIN users u2 ON o.updated_by=u2.id
       LEFT JOIN users u3 ON o.prepared_by=u3.id LEFT JOIN users u4 ON o.delivered_by=u4.id
       WHERE o.id=$1`, [id]
    );
    if (!orderResult.length) return null;
    const order = orderResult[0];
    order.items = await query('SELECT * FROM order_items WHERE order_id=$1', [id]);
    order.history = await query(
      `SELECT h.*,u.name AS changed_by_name FROM order_status_history h
       LEFT JOIN users u ON h.changed_by=u.id WHERE h.order_id=$1 ORDER BY h.changed_at ASC`, [id]
    );
    return order;
  }

  // ── Listar ─────────────────────────────────────────────────────────────────
  static async getAll(filters = {}) {
    let sql = `SELECT o.*,u.name AS jalador_name FROM orders o LEFT JOIN users u ON o.created_by=u.id WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND o.status=$${paramCount++}`;
      params.push(filters.status);
    }
    if (filters.jaladorId) {
      sql += ` AND o.created_by=$${paramCount++}`;
      params.push(filters.jaladorId);
    }
    if (filters.startDate) {
      sql += ` AND o.created_at>=$${paramCount++}`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ` AND o.created_at<=$${paramCount++}`;
      params.push(filters.endDate);
    }
    if (filters.search) {
      sql += ` AND (o.order_number LIKE $${paramCount++} OR o.location_details LIKE $${paramCount++})`;
      params.push('%' + filters.search + '%', '%' + filters.search + '%');
    }
    
    sql += ` ORDER BY o.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(filters.limit || 50, filters.offset || 0);

    const orders = await query(sql, params);
    for (const o of orders) {
      o.items = await query('SELECT * FROM order_items WHERE order_id=$1', [o.id]);
    }
    const totalResult = await query('SELECT COUNT(*) AS total FROM orders');
    return { orders, total: parseInt(totalResult[0].total) };
  }

  // ── Actualizar estado ──────────────────────────────────────────────────────
  static async updateStatus(orderId, status, userId, notes = null) {
    const sets = [`status=$1`, `updated_by=$2`];
    const params = [status, userId];
    let paramCount = 3;

    if (status === 'preparando') { 
      sets.push(`prepared_by=$${paramCount++}`, `prepared_at=NOW()`); 
      params.push(userId);
    } else if (status === 'listo') { 
      sets.push(`ready_at=NOW()`); 
    } else if (status === 'entregado') { 
      sets.push(`delivered_by=$${paramCount++}`, `delivered_at=NOW()`); 
      params.push(userId);
    } else if (status === 'cancelado') { 
      sets.push(`cancelled_at=NOW()`); 
    }

    params.push(orderId);
    await query(`UPDATE orders SET ${sets.join(',')} WHERE id=$${paramCount++}`, params);
    await query(`INSERT INTO order_status_history (order_id,status,changed_by,notes) VALUES ($${paramCount - 3},$1,$2,$3)`,
      [orderId, status, userId, notes]);
    const result = await query('SELECT * FROM orders WHERE id=$1', [orderId]);
    return result[0];
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  static async getDailyStats(date = new Date()) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0)).toISOString();
    const end   = new Date(d.setHours(23, 59, 59, 999)).toISOString();
    const result = await query(
      `SELECT 
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status='pendiente' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status='preparando' THEN 1 ELSE 0 END) AS preparing_orders,
        SUM(CASE WHEN status='listo' THEN 1 ELSE 0 END) AS ready_orders,
        SUM(CASE WHEN status='entregado' THEN 1 ELSE 0 END) AS delivered_orders,
        SUM(CASE WHEN status='cancelado' THEN 1 ELSE 0 END) AS cancelled_orders,
        COALESCE(SUM(CASE WHEN status='entregado' THEN total ELSE 0 END),0) AS total_sales,
        SUM(CASE WHEN location_type='vehiculo' THEN 1 ELSE 0 END) AS vehiculo_orders,
        SUM(CASE WHEN location_type='frente_local' THEN 1 ELSE 0 END) AS frente_local_orders,
        SUM(CASE WHEN location_type='restaurante' THEN 1 ELSE 0 END) AS restaurante_orders,
        SUM(CASE WHEN location_type='botica' THEN 1 ELSE 0 END) AS botica_orders,
        SUM(CASE WHEN location_type='otro' THEN 1 ELSE 0 END) AS otro_orders
       FROM orders WHERE created_at BETWEEN $1 AND $2`, [start, end]
    );
    return result[0];
  }

  static async getTopProducts(limit = 10) {
    const result = await query(
      `SELECT oi.product_name, SUM(oi.quantity) AS total_quantity,
        COUNT(DISTINCT o.id) AS order_count, SUM(oi.subtotal) AS total_sales
       FROM order_items oi JOIN orders o ON oi.order_id=o.id
       WHERE o.status='entregado'
       GROUP BY oi.product_name ORDER BY total_quantity DESC LIMIT $1`, [limit]
    );
    return result;
  }

  static async getJaladorPerformance() {
    const result = await query(
      `SELECT u.id, u.name,
        COUNT(o.id) AS total_orders,
        SUM(CASE WHEN o.status='entregado' THEN 1 ELSE 0 END) AS delivered_orders,
        COALESCE(SUM(CASE WHEN o.status='entregado' THEN o.total ELSE 0 END),0) AS total_sales
       FROM users u LEFT JOIN orders o ON u.id=o.created_by
       WHERE u.role='jalador' AND u.active=1
       GROUP BY u.id,u.name ORDER BY total_sales DESC`
    );
    return result;
  }
}

export default Order;
