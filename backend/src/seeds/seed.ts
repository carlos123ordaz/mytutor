import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { WeeklyAvailability } from '../models/WeeklyAvailability';
import { AvailabilityException } from '../models/AvailabilityException';
import { Reservation } from '../models/Reservation';
import { Review } from '../models/Review';
import { CourseRequest } from '../models/CourseRequest';
import { Notification } from '../models/Notification';
import { Upload } from '../models/Upload';
import { addDays, format, parseISO } from 'date-fns';

async function clearCollections() {
  console.log('🗑️  Clearing all collections...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    WeeklyAvailability.deleteMany({}),
    AvailabilityException.deleteMany({}),
    Reservation.deleteMany({}),
    Review.deleteMany({}),
    CourseRequest.deleteMany({}),
    Notification.deleteMany({}),
    Upload.deleteMany({}),
  ]);
  console.log('✅ Collections cleared');
}

async function seed() {
  await connectDatabase();
  await clearCollections();

  // ─── 1. Admin user ────────────────────────────────────────────────────────
  console.log('👤 Creating admin...');
  const admin = await User.create({
    email: 'admin@mytutor.com',
    name: 'Admin MyTutor',
    role: 'admin',
    isActive: true,
  });

  // ─── 2. Courses ───────────────────────────────────────────────────────────
  console.log('📚 Creating courses...');
  const courseDefs = [
    { name: 'Mathematics',     category: 'Science',     level: 'all_levels', tags: ['algebra', 'calculus', 'geometry'] },
    { name: 'Physics',         category: 'Science',     level: 'all_levels', tags: ['mechanics', 'thermodynamics', 'optics'] },
    { name: 'Chemistry',       category: 'Science',     level: 'all_levels', tags: ['organic', 'inorganic', 'reactions'] },
    { name: 'English',         category: 'Languages',   level: 'all_levels', tags: ['grammar', 'writing', 'conversation'] },
    { name: 'Spanish',         category: 'Languages',   level: 'all_levels', tags: ['grammar', 'vocabulary', 'conversation'] },
    { name: 'Programming (Python)', category: 'Technology', level: 'beginner', tags: ['python', 'coding', 'algorithms'] },
    { name: 'Data Science',    category: 'Technology', level: 'intermediate', tags: ['pandas', 'machine learning', 'statistics'] },
    { name: 'History',         category: 'Humanities',  level: 'all_levels', tags: ['world history', 'ancient', 'modern'] },
  ];

  const courses = await Course.insertMany(
    courseDefs.map((c) => ({ ...c, isActive: true, createdBy: admin._id }))
  );

  const [cMath, cPhysics, , cEnglish, cSpanish, cPython, cDataScience, cHistory] = courses;

  // ─── 3. Teacher users ─────────────────────────────────────────────────────
  console.log('🧑‍🏫 Creating teachers...');
  const teacher1 = await User.create({
    email: 'carlos.mendez@example.com',
    name: 'Carlos Méndez',
    role: 'teacher',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    teacherProfile: {
      bio: 'Experienced mathematics and physics teacher with 10+ years in secondary and university education. Passionate about making complex concepts accessible.',
      headline: 'Math & Physics Expert | 10+ Years Teaching',
      hourlyRate: 25,
      currency: 'USD',
      courses: [cMath._id, cPhysics._id],
      languages: ['Spanish', 'English'],
      timezone: 'UTC',
      totalReviews: 0,
      averageRating: 0,
      isProfileComplete: true,
      isApprovedByAdmin: true,
    },
  });

  const teacher2 = await User.create({
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    role: 'teacher',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=25',
    teacherProfile: {
      bio: 'Native English speaker and certified language teacher. I help students achieve fluency through conversation and structured lessons.',
      headline: 'Language Tutor | English, Spanish & History',
      hourlyRate: 20,
      currency: 'USD',
      courses: [cEnglish._id, cSpanish._id, cHistory._id],
      languages: ['English', 'Spanish'],
      timezone: 'UTC',
      totalReviews: 0,
      averageRating: 0,
      isProfileComplete: true,
      isApprovedByAdmin: true,
    },
  });

  const teacher3 = await User.create({
    email: 'alex.rivera@example.com',
    name: 'Alex Rivera',
    role: 'teacher',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    teacherProfile: {
      bio: 'Software engineer turned educator. I specialise in Python, data science, and machine learning for beginners and intermediate learners.',
      headline: 'Python & Data Science Instructor | Industry Pro',
      hourlyRate: 35,
      currency: 'USD',
      courses: [cPython._id, cDataScience._id],
      languages: ['English', 'Spanish'],
      timezone: 'UTC',
      totalReviews: 0,
      averageRating: 0,
      isProfileComplete: true,
      isApprovedByAdmin: true,
    },
  });

  // ─── 4. Student users ─────────────────────────────────────────────────────
  console.log('🎓 Creating students...');
  const student1 = await User.create({
    email: 'maria.garcia@example.com',
    name: 'María García',
    role: 'student',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    studentProfile: { bio: 'High school student preparing for university entrance exams.', timezone: 'UTC' },
  });

  const student2 = await User.create({
    email: 'james.wilson@example.com',
    name: 'James Wilson',
    role: 'student',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    studentProfile: { bio: 'Professional looking to transition into data science.', timezone: 'UTC' },
  });

  const student3 = await User.create({
    email: 'lucia.fernandez@example.com',
    name: 'Lucía Fernández',
    role: 'student',
    isActive: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
    studentProfile: { bio: 'Learning English to advance my career.', timezone: 'UTC' },
  });

  // ─── 5. Weekly Availability ───────────────────────────────────────────────
  console.log('📅 Creating weekly availability...');

  // Teacher 1: Mon(1), Wed(3), Fri(5) 09:00–13:00
  await WeeklyAvailability.insertMany([1, 3, 5].map((day) => ({
    teacher: teacher1._id,
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '13:00',
    slotDurationMinutes: 60,
    isActive: true,
  })));

  // Teacher 2: Tue(2), Thu(4) 10:00–16:00
  await WeeklyAvailability.insertMany([2, 4].map((day) => ({
    teacher: teacher2._id,
    dayOfWeek: day,
    startTime: '10:00',
    endTime: '16:00',
    slotDurationMinutes: 60,
    isActive: true,
  })));

  // Teacher 3: Mon–Fri (1–5) 14:00–18:00
  await WeeklyAvailability.insertMany([1, 2, 3, 4, 5].map((day) => ({
    teacher: teacher3._id,
    dayOfWeek: day,
    startTime: '14:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    isActive: true,
  })));

  // ─── 6. Availability Exceptions ───────────────────────────────────────────
  console.log('🚫 Creating availability exceptions...');

  const today = new Date();

  // Teacher 1: 1 blocked day, 1 extra available
  await AvailabilityException.create({
    teacher: teacher1._id,
    date: addDays(today, 7),
    type: 'blocked',
    reason: 'Personal appointment',
  });
  await AvailabilityException.create({
    teacher: teacher1._id,
    date: addDays(today, 14),
    type: 'extra_available',
    startTime: '15:00',
    endTime: '18:00',
    reason: 'Extra availability',
  });

  // Teacher 2: 1 blocked, 1 extra available
  await AvailabilityException.create({
    teacher: teacher2._id,
    date: addDays(today, 5),
    type: 'blocked',
    reason: 'Holiday',
  });
  await AvailabilityException.create({
    teacher: teacher2._id,
    date: addDays(today, 10),
    type: 'extra_available',
    startTime: '08:00',
    endTime: '10:00',
    reason: 'Morning extra hours',
  });

  // Teacher 3: 1 blocked, 1 extra available
  await AvailabilityException.create({
    teacher: teacher3._id,
    date: addDays(today, 3),
    type: 'blocked',
    reason: 'Conference',
  });
  await AvailabilityException.create({
    teacher: teacher3._id,
    date: addDays(today, 20),
    type: 'extra_available',
    startTime: '09:00',
    endTime: '13:00',
    reason: 'Weekend extra session',
  });

  // ─── 7. Reservations ──────────────────────────────────────────────────────
  console.log('📋 Creating reservations...');

  // Past dates for completed/reviewed reservations
  const past14 = addDays(today, -14);
  const past7 = addDays(today, -7);
  const past3 = addDays(today, -3);
  const future5 = addDays(today, 5);
  const future10 = addDays(today, 10);

  // Reservation 1: completed (student1 + teacher1, Math)
  const res1 = await Reservation.create({
    student: student1._id,
    teacher: teacher1._id,
    course: cMath._id,
    date: past14,
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    status: 'completed',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Need help with quadratic equations',
    teacherNotes: 'Good progress on algebra basics',
    confirmedAt: addDays(past14, -1),
    completedAt: past14,
  });

  // Reservation 2: completed (student2 + teacher3, Python)
  const res2 = await Reservation.create({
    student: student2._id,
    teacher: teacher3._id,
    course: cPython._id,
    date: past7,
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    status: 'completed',
    meetLink: 'https://meet.google.com/klm-nopq-rst',
    notes: 'Intro to Python lists and dictionaries',
    confirmedAt: addDays(past7, -1),
    completedAt: past7,
  });

  // Reservation 3: completed (student3 + teacher2, English)
  const res3 = await Reservation.create({
    student: student3._id,
    teacher: teacher2._id,
    course: cEnglish._id,
    date: past3,
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    status: 'completed',
    meetLink: 'https://meet.google.com/uvw-xyza-bcd',
    notes: 'Business English conversation practice',
    confirmedAt: addDays(past3, -1),
    completedAt: past3,
  });

  // Reservation 4: confirmed (upcoming - student1 + teacher3, Data Science)
  await Reservation.create({
    student: student1._id,
    teacher: teacher3._id,
    course: cDataScience._id,
    date: future5,
    startTime: '15:00',
    endTime: '16:00',
    durationMinutes: 60,
    status: 'confirmed',
    meetLink: 'https://meet.google.com/efg-hijk-lmn',
    notes: 'Introduction to pandas dataframes',
    confirmedAt: addDays(today, -1),
  });

  // Reservation 5: pending_payment_upload (student2 + teacher1, Physics)
  await Reservation.create({
    student: student2._id,
    teacher: teacher1._id,
    course: cPhysics._id,
    date: future10,
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    status: 'pending_payment_upload',
    notes: 'Newton laws and kinematics',
  });

  // ─── 8. Reviews ───────────────────────────────────────────────────────────
  console.log('⭐ Creating reviews...');

  await Review.create({
    student: student1._id,
    teacher: teacher1._id,
    reservation: res1._id,
    rating: 9,
    comment: 'Carlos explained quadratic equations really clearly. Very patient and knowledgeable.',
    isPublic: true,
  });

  await Review.create({
    student: student2._id,
    teacher: teacher3._id,
    reservation: res2._id,
    rating: 10,
    comment: 'Alex is an amazing teacher! The Python session was super practical and engaging.',
    isPublic: true,
  });

  await Review.create({
    student: student3._id,
    teacher: teacher2._id,
    reservation: res3._id,
    rating: 8,
    comment: 'Sarah is very encouraging. My English conversation skills have improved a lot.',
    isPublic: true,
  });

  // Update teacher average ratings
  await User.findByIdAndUpdate(teacher1._id, {
    'teacherProfile.totalReviews': 1,
    'teacherProfile.averageRating': 9,
  });
  await User.findByIdAndUpdate(teacher2._id, {
    'teacherProfile.totalReviews': 1,
    'teacherProfile.averageRating': 8,
  });
  await User.findByIdAndUpdate(teacher3._id, {
    'teacherProfile.totalReviews': 1,
    'teacherProfile.averageRating': 10,
  });

  // ─── 9. Course Requests ───────────────────────────────────────────────────
  console.log('📝 Creating course requests...');

  await CourseRequest.create({
    teacher: teacher1._id,
    courseName: 'Statistics',
    description: 'Descriptive and inferential statistics for students and professionals.',
    category: 'Science',
    status: 'pending',
  });

  await CourseRequest.create({
    teacher: teacher2._id,
    courseName: 'French',
    description: 'French for beginners and intermediate learners.',
    category: 'Languages',
    status: 'pending',
  });

  await CourseRequest.create({
    teacher: teacher3._id,
    courseName: 'Machine Learning',
    description: 'Practical machine learning with scikit-learn and TensorFlow.',
    category: 'Technology',
    status: 'pending',
  });

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log(`👤 Admin:     admin@mytutor.com`);
  console.log(`🧑‍🏫 Teachers:  carlos.mendez@example.com | sarah.johnson@example.com | alex.rivera@example.com`);
  console.log(`🎓 Students:  maria.garcia@example.com | james.wilson@example.com | lucia.fernandez@example.com`);
  console.log(`📚 Courses:   ${courses.map((c) => c.name).join(', ')}`);
  console.log('─────────────────────────────────');
}

seed()
  .then(() => mongoose.disconnect())
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
  });
