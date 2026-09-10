import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import useOfflineStore from '../stores/offlineStore.js';

/**
 * Hook que sincroniza pedidos guardados offline
 * cuando se restaura la conexión a Internet.
 * Utiliza un sistema idempotente via UUID para evitar duplicados.
 */
export const useOfflineSync = () => {
  const { isOnline, pendingOrders, markOrderSynced, incrementSyncAttempts } = useOfflineStore();
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);

  const syncPendingOrders = useCallback(async () => {
    if (syncingRef.current) return;
    const pending = pendingOrders.filter((o) => !o.syncing);
    if (pending.length === 0) return;

    syncingRef.current = true;
    let synced = 0;

    for (const order of pending) {
      try {
        await api.post('/orders', {
          uuid: order.uuid,
          locationType: order.locationType,
          locationDetails: order.locationDetails,
          items: order.items,
          observations: order.observations,
          total: order.total,
        });
        markOrderSynced(order.uuid);
        synced++;
      } catch (err) {
        if (err.response?.status === 409) {
          // Ya existe en servidor — eliminar de la cola
          markOrderSynced(order.uuid);
          synced++;
        } else {
          incrementSyncAttempts(order.uuid);
          console.warn(`Error sincronizando pedido ${order.uuid}:`, err.message);
        }
      }
    }

    syncingRef.current = false;

    if (synced > 0) {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`✓ ${synced} pedido${synced > 1 ? 's' : ''} sincronizado${synced > 1 ? 's' : ''}`);
    }
  }, [pendingOrders, markOrderSynced, incrementSyncAttempts, queryClient]);

  // Sincronizar al recuperar conexión
  useEffect(() => {
    if (isOnline && pendingOrders.length > 0) {
      // Esperar un momento para que la conexión se estabilice
      const timer = setTimeout(syncPendingOrders, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingOrders.length, syncPendingOrders]);

  return { hasPending: pendingOrders.length > 0, pendingCount: pendingOrders.length };
};

export default useOfflineSync;
