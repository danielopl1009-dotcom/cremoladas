import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useOfflineStore = create(
  persist(
    (set, get) => ({
      // Cola de pedidos pendientes de sincronización
      pendingOrders: [],
      
      // Estado de conexión
      isOnline: navigator.onLine,

      // Agregar pedido a la cola offline
      addPendingOrder: (orderData) => {
        const uuid = uuidv4();
        const pendingOrder = {
          uuid,
          ...orderData,
          createdAt: new Date().toISOString(),
          synced: false,
          syncAttempts: 0
        };

        set((state) => ({
          pendingOrders: [...state.pendingOrders, pendingOrder]
        }));

        return uuid;
      },

      // Marcar pedido como sincronizado
      markOrderSynced: (uuid) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.filter(order => order.uuid !== uuid)
        }));
      },

      // Incrementar intentos de sincronización
      incrementSyncAttempts: (uuid) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.map(order =>
            order.uuid === uuid
              ? { ...order, syncAttempts: order.syncAttempts + 1 }
              : order
          )
        }));
      },

      // Obtener pedidos pendientes
      getPendingOrders: () => {
        return get().pendingOrders;
      },

      // Actualizar estado de conexión
      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      // Limpiar pedidos con muchos intentos fallidos
      clearFailedOrders: () => {
        set((state) => ({
          pendingOrders: state.pendingOrders.filter(order => order.syncAttempts < 5)
        }));
      }
    }),
    {
      name: 'offline-storage',
      partialize: (state) => ({
        pendingOrders: state.pendingOrders
      })
    }
  )
);

// Detectar cambios en el estado de conexión
window.addEventListener('online', () => {
  useOfflineStore.getState().setOnlineStatus(true);
  console.log('✓ Conexión restaurada');
});

window.addEventListener('offline', () => {
  useOfflineStore.getState().setOnlineStatus(false);
  console.log('✗ Sin conexión');
});

export default useOfflineStore;
