import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import type { AuthRequest, UserRole } from '../types';
import { sendError } from '../utils/response';

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    // Check httpOnly cookie first, then Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('-__v');

    if (!user || !user.isActive) {
      sendError(res, 'User not found or inactive', 401);
      return;
    }

    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
    };

    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireTeacher = requireRole('teacher');
export const requireStudent = requireRole('student');
export const requireTeacherOrAdmin = requireRole('teacher', 'admin');
export const requireAuth = authenticate;
