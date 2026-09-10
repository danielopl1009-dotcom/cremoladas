import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

// Configuración optimizada de Socket.io para bajo consumo de datos
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    // Optimización para conexiones móviles
    pingInterval: parseInt(process.env.SOCKET_HEARTBEAT_INTERVAL) || 30000, // 30s
    pingTimeout: parseInt(process.env.SOCKET_HEARTBEAT_TIMEOUT) || 60000, // 60s
    transports: ['websocket', 'polling'], // WebSocket primero, polling como fallback
    perMessageDeflate: {
      threshold: 1024, // Comprimir mensajes > 1KB
    },
    httpCompression: {
      threshold: 1024,
    },
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.userName = decoded.name;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✓ Usuario conectado: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

    // Unir a rooms según el rol
    socket.join(socket.userRole.toLowerCase());
    socket.join(`user_${socket.userId}`);

    // Enviar estado de conexión
    socket.emit('connection_status', {
      status: 'connected',
      timestamp: new Date().toISOString(),
    });

    // Manejar desconexión
    socket.on('disconnect', (reason) => {
      console.log(`✗ Usuario desconectado: ${socket.userName} - Razón: ${reason}`);
    });

    // Manejar errores
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Heartbeat personalizado (opcional, para detectar conexiones lentas)
    socket.on('client_ping', () => {
      socket.emit('server_pong', { timestamp: Date.now() });
    });
  });

  console.log('✓ Socket.io inicializado');
  return io;
};

// Función para obtener la instancia de io
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no está inicializado');
  }
  return io;
};

// Funciones auxiliares para emitir eventos específicos

// Emitir nuevo pedido a servidores y administradores
export const emitNewOrder = (order) => {
  if (!io) return;
  
  // Solo enviar datos esenciales para minimizar payload
  const lightOrder = {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    locationType: order.location_type,
    locationDetails: order.location_details,
    items: order.items,
    total: order.total,
    jaladorId: order.created_by,
    jaladorName: order.jalador_name,
    createdAt: order.created_at,
  };

  io.to('servidor').emit('new_order', lightOrder);
  io.to('administrador').emit('new_order', lightOrder);
  io.to(`user_${order.created_by}`).emit('order_created', lightOrder);
};

// Emitir actualización de estado de pedido
export const emitOrderStatusUpdate = (order) => {
  if (!io) return;

  const update = {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    updatedAt: order.updated_at,
    updatedBy: order.updated_by_name,
  };

  // Emitir a todos los roles relevantes
  io.to('jalador').emit('order_status_updated', update);
  io.to('servidor').emit('order_status_updated', update);
  io.to('entregador').emit('order_status_updated', update);
  io.to('administrador').emit('order_status_updated', update);
};

// Emitir notificación a usuarios específicos
export const emitNotification = (userId, notification) => {
  if (!io) return;
  
  io.to(`user_${userId}`).emit('notification', {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    timestamp: new Date().toISOString(),
  });
};

// Emitir actualización de estadísticas (solo delta)
export const emitStatsUpdate = (stats) => {
  if (!io) return;
  
  io.to('administrador').emit('stats_update', stats);
};

export default { initializeSocket, getIO };
