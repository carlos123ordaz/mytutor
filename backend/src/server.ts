import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import passport from './config/passport';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

import { authRouter } from './routes/auth.routes';
import { teacherRouter } from './routes/teacher.routes';
import { courseRouter } from './routes/course.routes';
import { courseRequestRouter } from './routes/courseRequest.routes';
import { availabilityRouter } from './routes/availability.routes';
import { reservationRouter } from './routes/reservation.routes';
import { uploadRouter } from './routes/upload.routes';
import { reviewRouter } from './routes/review.routes';
import { notificationRouter } from './routes/notification.routes';
import { adminRouter } from './routes/admin.routes';

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// CORS
app.use(cors({
  origin: [env.frontendWebUrl, env.frontendAdminUrl],
  credentials: true,
}));

// Body parsers
app.use(cookieParser());
app.use(express.json());

// Passport (no sessions — JWT only)
app.use(passport.initialize());

// Rate limiting on /api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 10000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/courses', courseRouter);
app.use('/api/course-requests', courseRequestRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);

// 404 & error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start
async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port} [${env.nodeEnv}]`);
  });
}

bootstrap();

export default app;
