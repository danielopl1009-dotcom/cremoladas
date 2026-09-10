import { io } from 'socket.io-client';

// En producción: misma URL del sitio. En desarrollo: localhost:3000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 10,
    timeout: 10000,
  });

  socket.on('connect',       () => console.log('Socket conectado'));
  socket.on('disconnect',    (r) => console.log('Socket desconectado:', r));
  socket.on('connect_error', (e) => console.warn('Socket error:', e.message));

  return socket;
};

export const getSocket       = () => socket;
export const disconnectSocket = () => { if (socket?.connected) { socket.disconnect(); socket = null; } };
export const emitEvent       = (e, d) => socket?.connected && socket.emit(e, d);

export default { initSocket, getSocket, disconnectSocket, emitEvent };
