import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import type { IUser } from '../types';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export async function findOrCreateUser(googleInfo: GoogleUserInfo): Promise<IUser> {
  let user = await User.findOne({ googleId: googleInfo.googleId });

  if (!user) {
    user = await User.findOne({ email: googleInfo.email });
    if (user) {
      user.googleId = googleInfo.googleId;
      if (googleInfo.avatarUrl) user.avatarUrl = googleInfo.avatarUrl;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      googleId: googleInfo.googleId,
      email: googleInfo.email,
      name: googleInfo.name,
      avatarUrl: googleInfo.avatarUrl,
      role: 'student',
      studentProfile: { timezone: 'UTC' },
    });
  }

  return user;
}

export function generateAuthToken(user: IUser): string {
  return signToken({
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  });
}
