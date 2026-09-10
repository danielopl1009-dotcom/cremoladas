import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.activeOnly) params.append('activeOnly', 'true');
      const { data } = await api.get(`/users?${params.toString()}`);
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post('/users', userData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario creado correctamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...userData }) => {
      const { data } = await api.put(`/users/${id}`, userData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    },
  });
};

export const useToggleUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }) => {
      const endpoint = active ? `/users/${id}/activate` : `/users/${id}`;
      const method = active ? 'patch' : 'delete';
      const { data } = await api[method](endpoint);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    },
  });
};
