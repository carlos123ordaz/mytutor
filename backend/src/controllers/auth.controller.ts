import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/response';
import { findOrCreateUser, generateAuthToken } from '../services/auth.service';
import { getCookieOptions } from '../utils/jwt';
import type { AuthRequest, IUser } from '../types';
import { User } from '../models/User';
import { env } from '../config/env';

const googleClient = new OAuth2Client(env.googleClientId);

// Called by admin frontend: POST /api/auth/google with { idToken }
export const googleIdTokenLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) return sendError(res, 'idToken is required', 400);

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientId });
  } catch {
    return sendError(res, 'Invalid Google token', 401);
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) return sendError(res, 'Invalid token payload', 401);

  const user = await findOrCreateUser({
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    avatarUrl: payload.picture,
  });

  if (!user.isActive) return sendError(res, 'Account deactivated', 403);

  const token = generateAuthToken(user);
  res.cookie('token', token, getCookieOptions());

  return sendSuccess(res, user);
});

// Called by passport after successful OAuth2 callback (web frontend)
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  if (!user) return sendError(res, 'Authentication failed', 401);

  if (!user.isActive) {
    return res.redirect(`${env.frontendWebUrl}/login?error=account_deactivated`);
  }

  const token = generateAuthToken(user);
  res.cookie('token', token, getCookieOptions());

  return res.redirect(`${env.frontendWebUrl}/auth/callback`);
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token', { path: '/' });
  return sendSuccess(res, null, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) return sendError(res, 'Not authenticated', 401);

  const user = await User.findById(req.user._id)
    .select('-__v')
    .populate('teacherProfile.courses', 'name category level');

  if (!user) return sendError(res, 'User not found', 404);

  return sendSuccess(res, user);
});
