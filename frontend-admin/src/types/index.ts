export interface User {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  _id: string;
  userId: User;
  bio?: string;
  specialties?: string[];
  rating?: number;
  reviewCount?: number;
  isApproved: boolean;
  totalCourses?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  tags?: string[];
  isActive: boolean;
  teacherId?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRequest {
  _id: string;
  teacherId: User | string;
  courseName: string;
  description?: string;
  category?: string;
  level?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  _id: string;
  studentId: User | string;
  teacherId: User | string;
  courseId: Course | string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'pending_payment_upload' | 'pending_review' | 'confirmed' | 'completed' | 'rejected' | 'cancelled' | 'no_show';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  studentId: User | string;
  teacherId: User | string;
  reservationId?: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  pendingTeacherApprovals: number;
  totalCourses: number;
  totalReservations: number;
  pendingCourseRequests: number;
  pendingReservations: number;
  completedReservations: number;
  reservationsLast7Days: Array<{ date: string; count: number }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
