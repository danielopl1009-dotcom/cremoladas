import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';

// Productos (Vaso, Taper, Litro)
export const useProducts = (activeOnly = true) => {
  return useQuery({
    queryKey: ['products', activeOnly],
    queryFn: async () => {
      const { data } = await api.get(`/products?activeOnly=${activeOnly}`);
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Sabores disponibles
export const useFlavors = () => {
  return useQuery({
    queryKey: ['flavors'],
    queryFn: async () => {
      const { data } = await api.get('/products/flavors');
      return data.data;
    },
    staleTime: 15 * 60 * 1000, // los sabores cambian poco
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d) => { const { data } = await api.post('/products', d); return data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Producto creado'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }) => { const { data } = await api.put(`/products/${id}`, d); return data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Producto actualizado'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};

export const useToggleProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }) => {
      const { data } = await api[active ? 'patch' : 'delete'](`/products/${id}${active ? '/activate' : ''}`);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });
};
