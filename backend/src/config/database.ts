import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri, { maxPoolSize: 10 });
    console.log('✅ MongoDB connected:', env.mongoUri);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

mongoose.connection.removeAllListeners('disconnected');
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});
