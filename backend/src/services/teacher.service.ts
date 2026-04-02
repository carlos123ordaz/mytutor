import { User } from '../models/User';
import { Review } from '../models/Review';
import type { PaginatedResult } from '../types';

export interface TeacherFilters {
  courseId?: string;
  minRating?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getActiveTeachers(filters: TeacherFilters): Promise<PaginatedResult<unknown>> {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {
    role: 'teacher',
    isActive: true,
    'teacherProfile.isApprovedByAdmin': true,
    'teacherProfile.isProfileComplete': true,
  };

  if (filters.courseId) {
    query['teacherProfile.courses'] = filters.courseId;
  }

  if (filters.minRating) {
    query['teacherProfile.averageRating'] = { $gte: filters.minRating };
  }

  if (filters.maxPrice) {
    query['teacherProfile.hourlyRate'] = {
      ...(query['teacherProfile.hourlyRate'] as object || {}),
      $lte: filters.maxPrice,
    };
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { 'teacherProfile.headline': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email avatarUrl teacherProfile')
      .populate('teacherProfile.courses', 'name category')
      .sort({ 'teacherProfile.averageRating': -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  // Flatten teacherProfile into the top-level so the frontend TeacherCard
  // can access headline, bio, hourlyRate, courses, etc. directly.
  // Must use toObject() — spreading a Mongoose subdocument doesn't enumerate fields.
  const data = users.map((u) => {
    const { teacherProfile, ...rest } = u.toObject();
    return { ...rest, ...(teacherProfile ?? {}) };
  });

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function registerAsTeacher(
  userId: string,
  data: {
    headline: string;
    bio: string;
    hourlyRate: number;
    currency: string;
    timezone: string;
    languages: string[];
    courses: string[];
    videoUrl?: string;
  }
) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.role === 'teacher') throw new Error('User is already a teacher');

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        role: 'teacher',
        teacherProfile: {
          headline: data.headline,
          bio: data.bio,
          hourlyRate: data.hourlyRate,
          currency: data.currency,
          timezone: data.timezone,
          languages: data.languages,
          courses: data.courses,
          videoUrl: data.videoUrl || undefined,
          isApprovedByAdmin: false,
          isProfileComplete: true,
          averageRating: 0,
          totalReviews: 0,
        },
      },
    },
    { new: true }
  ).populate('teacherProfile.courses', 'name category');

  if (!updated) throw new Error('Failed to register as teacher');
  return updated;
}

export async function getTeacherOwnProfile(teacherId: string) {
  return User.findOne({ _id: teacherId, role: 'teacher' })
    .select('name email avatarUrl teacherProfile createdAt')
    .populate('teacherProfile.courses', 'name category');
}

export async function getTeacherPublicProfile(teacherId: string) {
  const teacher = await User.findOne({
    _id: teacherId,
    role: 'teacher',
    isActive: true,
  })
    .select('name email avatarUrl teacherProfile createdAt')
    .populate('teacherProfile.courses', 'name category level');

  if (!teacher) return null;

  const p = teacher.teacherProfile;

  return {
    _id: teacher._id,
    userId: teacher._id,
    name: teacher.name,
    email: teacher.email,
    avatarUrl: teacher.avatarUrl,
    bio: p?.bio,
    headline: p?.headline,
    hourlyRate: p?.hourlyRate,
    currency: p?.currency,
    languages: p?.languages ?? [],
    timezone: p?.timezone,
    videoUrl: p?.videoUrl,
    averageRating: p?.averageRating,
    totalReviews: p?.totalReviews,
    courses: p?.courses ?? [],
    createdAt: teacher.createdAt,
  };
}

export async function updateTeacherProfile(
  teacherId: string,
  data: {
    bio?: string;
    headline?: string;
    hourlyRate?: number;
    currency?: string;
    languages?: string[];
    timezone?: string;
    videoUrl?: string;
    courses?: string[];
  }
) {
  const updateData: Record<string, unknown> = {};

  if (data.bio !== undefined) updateData['teacherProfile.bio'] = data.bio;
  if (data.headline !== undefined) updateData['teacherProfile.headline'] = data.headline;
  if (data.hourlyRate !== undefined) updateData['teacherProfile.hourlyRate'] = data.hourlyRate;
  if (data.currency !== undefined) updateData['teacherProfile.currency'] = data.currency;
  if (data.languages !== undefined) updateData['teacherProfile.languages'] = data.languages;
  if (data.timezone !== undefined) updateData['teacherProfile.timezone'] = data.timezone;
  if (data.videoUrl !== undefined) updateData['teacherProfile.videoUrl'] = data.videoUrl;
  if (data.courses !== undefined) updateData['teacherProfile.courses'] = data.courses;

  const teacher = await User.findByIdAndUpdate(
    teacherId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('teacherProfile.courses', 'name category');

  if (!teacher) throw new Error('Teacher not found');

  // Check if profile is complete
  const profile = teacher.teacherProfile;
  if (profile) {
    const isComplete = Boolean(
      profile.bio && profile.headline && (profile.hourlyRate ?? 0) > 0 && profile.courses.length > 0
    );
    if (isComplete !== profile.isProfileComplete) {
      await User.findByIdAndUpdate(teacherId, {
        'teacherProfile.isProfileComplete': isComplete,
      });
      teacher.teacherProfile!.isProfileComplete = isComplete;
    }
  }

  return teacher;
}

export async function recalculateTeacherRating(teacherId: string) {
  const stats = await Review.aggregate([
    { $match: { teacher: teacherId, isPublic: true } },
    {
      $group: {
        _id: '$teacher',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(teacherId, {
      'teacherProfile.averageRating': Math.round(stats[0].averageRating * 10) / 10,
      'teacherProfile.totalReviews': stats[0].totalReviews,
    });
  } else {
    await User.findByIdAndUpdate(teacherId, {
      'teacherProfile.averageRating': 0,
      'teacherProfile.totalReviews': 0,
    });
  }
}
