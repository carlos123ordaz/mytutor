import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Course, CourseRequest, PaginatedResponse } from '../types';

// Courses
export function useCourses(search?: string) {
  return useQuery<Course[]>({
    queryKey: ['courses', search],
    queryFn: async () => {
      const res = await api.get('/courses', {
        params: { search, includeInactive: true },
      });
      return res.data.data;
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      category?: string;
      level: string;
      tags?: string[];
    }) => api.post('/courses', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        name: string;
        description: string;
        category: string;
        level: string;
        isActive: boolean;
        tags: string[];
      }>;
    }) => api.patch(`/courses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

// Course Requests
export function useCourseRequests(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<PaginatedResponse<CourseRequest>>({
    queryKey: ['course-requests', params],
    queryFn: async () => {
      const res = await api.get('/course-requests', { params });
      return res.data;
    },
  });
}

export function useApproveCourseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      api.patch(`/course-requests/${id}/approve`, { adminNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

export function useRejectCourseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) =>
      api.patch(`/course-requests/${id}/reject`, { adminNote }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}
