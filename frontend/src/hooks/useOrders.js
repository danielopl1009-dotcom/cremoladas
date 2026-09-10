import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';

// Obtener pedidos
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.jaladorId) params.append('jaladorId', filters.jaladorId);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      const { data } = await api.get(`/orders?${params.toString()}`);
      return data.data;
    },
    staleTime: 30 * 1000, // 30 segundos — se actualiza por socket
  });
};

// Obtener pedido individual
export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', String(id)],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Crear pedido
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await api.post('/orders', orderData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error al crear el pedido';
      toast.error(msg);
    },
  });
};

// Actualizar estado
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      const { data } = await api.patch(`/orders/${id}/status`, { status, notes });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', String(variables.id)] });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Error al actualizar el estado';
      toast.error(msg);
    },
  });
};

// Estadísticas del día
export const useDailyStats = (date) => {
  return useQuery({
    queryKey: ['stats', 'daily', date],
    queryFn: async () => {
      const params = date ? `?date=${date}` : '';
      const { data } = await api.get(`/orders/stats/daily${params}`);
      return data.data;
    },
    staleTime: 60 * 1000, // 1 minuto
  });
};

// Productos más vendidos
export const useTopProducts = (limit = 10) => {
  return useQuery({
    queryKey: ['stats', 'top-products', limit],
    queryFn: async () => {
      const { data } = await api.get(`/orders/stats/top-products?limit=${limit}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Rendimiento de jaladores
export const useJaladorPerformance = () => {
  return useQuery({
    queryKey: ['stats', 'jalador-performance'],
    queryFn: async () => {
      const { data } = await api.get('/orders/stats/jalador-performance');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
