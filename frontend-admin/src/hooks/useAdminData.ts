import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { AdminStats, User, TeacherProfile, Reservation, Review, PaginatedResponse } from '../types';

// Stats
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
    refetchInterval: 60000,
  });
}

// Users
export function useUsers(params: {
  role?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const res = await api.get('/admin/users', { params });
      return res.data;
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}/toggle-active`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Teachers
export function useTeachers(params: {
  isApproved?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedResponse<TeacherProfile>>({
    queryKey: ['admin-teachers', params],
    queryFn: async () => {
      const res = await api.get('/admin/teachers', { params });
      return res.data;
    },
  });
}

export function useToggleTeacherApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      api.patch(`/admin/teachers/${id}/toggle-approval`, { isApproved }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-teachers'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Reservations
export function useReservations(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedResponse<Reservation>>({
    queryKey: ['admin-reservations', params],
    queryFn: async () => {
      const res = await api.get('/admin/reservations', { params });
      return res.data;
    },
  });
}

// Reviews
export function useReviews(params: { page?: number; limit?: number }) {
  return useQuery<PaginatedResponse<Review>>({
    queryKey: ['admin-reviews', params],
    queryFn: async () => {
      const res = await api.get('/admin/reviews', { params });
      return res.data;
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
}

export function useToggleReviewPublic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/toggle-public`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
}
