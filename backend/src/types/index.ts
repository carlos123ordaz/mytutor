import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Tell Passport's type augmentation to use our user shape
declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      role: UserRole;
      email: string;
      name: string;
      isActive: boolean;
    }
  }
}

export type UserRole = 'student' | 'teacher' | 'admin';

export type ReservationStatus =
  | 'pending_payment_upload'
  | 'pending_review'
  | 'confirmed'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type ExceptionType = 'blocked' | 'extra_available';

export type CourseRequestStatus = 'pending' | 'approved' | 'rejected';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';

export type NotificationType =
  | 'reservation_created'
  | 'reservation_confirmed'
  | 'reservation_rejected'
  | 'meet_link_added'
  | 'session_completed'
  | 'review_received'
  | 'course_request_approved'
  | 'course_request_rejected';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: UserRole;
    email: string;
    name: string;
    isActive: boolean;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  teacherProfile?: {
    bio?: string;
    headline?: string;
    hourlyRate?: number;
    currency: string;
    courses: Types.ObjectId[];
    languages: string[];
    timezone: string;
    totalReviews: number;
    averageRating: number;
    isProfileComplete: boolean;
    isApprovedByAdmin: boolean;
    videoUrl?: string;
  };
  studentProfile?: {
    bio?: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
