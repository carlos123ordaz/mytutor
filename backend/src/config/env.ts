import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mytutor',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  gcsBucketName: process.env.GCS_BUCKET_NAME || '',
  gcsProjectId: process.env.GCS_PROJECT_ID || '',
  gcsCredentials: process.env.GCS_CREDENTIALS || '',
  frontendWebUrl: process.env.FRONTEND_WEB_URL || 'http://localhost:3000',
  frontendAdminUrl: process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
};
