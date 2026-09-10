import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { initSocket } from '../lib/socket.js';
import useAuthStore from '../stores/authStore.js';
import useUIStore from '../stores/uiStore.js';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const addNotification = useUIStore((s) => s.addNotification);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    socketRef.current = initSocket(token);
    const socket = socketRef.current;

    // Nuevo pedido
    const handleNewOrder = (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      const locationLabel = order.locationType === 'vehiculo'
        ? order.locationDetails?.placa || 'Vehículo'
        : order.locationType;

      toast(`Nuevo pedido #${order.orderNumber} — ${locationLabel}`, {
        duration: 5000,
        position: 'top-right',
        style: { background: '#fff', color: '#111', fontWeight: '600', fontSize: '13px', maxWidth: '340px', borderRadius: '12px' },
      });

      addNotification({
        type: 'new_order',
        title: `Nuevo pedido #${order.orderNumber}`,
        message: `${order.items?.length ?? 0} productos`,
        orderId: order.id,
      });

      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    };

    // Estado actualizado
    const handleStatusUpdate = (update) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', String(update.id)] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

    // Stats
    const handleStatsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

    // Pago confirmado — todos ven el badge actualizado en tiempo real
    const handlePaymentConfirmed = (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment', String(data.orderId)] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    };

    socket.on('new_order',           handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);
    socket.on('stats_update',         handleStatsUpdate);
    socket.on('payment_confirmed',    handlePaymentConfirmed);

    return () => {
      socket.off('new_order',           handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
      socket.off('stats_update',         handleStatsUpdate);
      socket.off('payment_confirmed',    handlePaymentConfirmed);
    };
  }, [isAuthenticated, token, queryClient, addNotification]);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit };
};

export default useSocket;
