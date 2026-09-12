import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';

// Ver pago de un pedido específico
export const usePayment = (orderId) => {
  return useQuery({
    queryKey: ['payment', String(orderId)],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}/payment`);
      return data.data; // null si no está pagado
    },
    enabled: !!orderId,
    staleTime: 30 * 1000,
  });
};

// Confirmar pago (soporta foto para Yape)
export const useConfirmPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, method, notes, yapePhoto }) => {
      const formData = new FormData();
      formData.append('method', method);
      if (notes) formData.append('notes', notes);
      if (yapePhoto) formData.append('yapePhoto', yapePhoto);

      const { data } = await api.post(`/orders/${orderId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['payment', String(vars.orderId)] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['payments', 'daily'] });
      toast.success('Pago confirmado');
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || 'No se pudo confirmar el pago');
    },
  });
};

// Subir comprobante de pago (desde "Mis pedidos")
export const useUploadPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, method, notes, yapePhoto }) => {
      const formData = new FormData();
      formData.append('method', method);
      if (notes) formData.append('notes', notes);
      if (yapePhoto) formData.append('yapePhoto', yapePhoto);

      const { data } = await api.post(`/orders/${orderId}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['payment', String(vars.orderId)] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['payments', 'daily'] });
      toast.success('Comprobante subido');
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || 'No se pudo subir el comprobante');
    },
  });
};

// Pagos del día (para caja y admin)
export const useDailyPayments = (date) => {
  return useQuery({
    queryKey: ['payments', 'daily', date],
    queryFn: async () => {
      const params = date ? `?date=${date}` : '';
      const { data } = await api.get(`/payments/daily${params}`);
      return data;
    },
    staleTime: 30 * 1000,
  });
};
